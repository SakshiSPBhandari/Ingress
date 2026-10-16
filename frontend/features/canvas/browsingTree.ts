/**
 * Canvas layout: the path you took through the web.
 * A page hangs under the page it was opened from (the extension records this, nothing is guessed).
 * A page you reached on your own (typed address, new tab) starts a new tree. Trees sit side by side, oldest first.
 * Positions are computed here every time, so the canvas is always tidy and nothing needs saving.
 */
import dagre from "@dagrejs/dagre";
import { sizeOf } from "@/lib/graph/layout";
import type { NodeType } from "@/types/api";
import type { RFEdge, RFNode } from "@/stores/graph";

const GAP_X = 40; // between pages on the same level
const GAP_Y = 80; // between a page and the pages opened from it
const TREE_GAP = 72; // between two trees
const MAX_ROW_WIDTH = 2600;

interface Tree {
  root: RFNode;
  ids: string[]; // the root and every page below it
  width: number;
  height: number;
  place: Map<string, { x: number; y: number }>; // top-left of each page, relative to the tree
}

function pageSize(n: RFNode) {
  const d = n.data.node;
  const base = sizeOf(d.type as NodeType);
  return { w: d.width ?? base.w, h: d.height ?? base.h };
}

/** The page this one was opened from, if it is on the canvas and was opened earlier (so there are never loops). */
function openerOf(n: RFNode, byId: Map<string, RFNode>): RFNode | undefined {
  const opener = byId.get(n.data.node.why_opened?.opener_node_id ?? "");
  return opener && opener.id !== n.id && opener.data.node.created_at <= n.data.node.created_at ? opener : undefined;
}

/** Lays out one tree top-down. */
function layoutTree(root: RFNode, children: Map<string, RFNode[]>): Tree {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: GAP_X, ranksep: GAP_Y });
  g.setDefaultEdgeLabel(() => ({}));
  const ids: string[] = [];
  const visit = (n: RFNode) => {
    ids.push(n.id);
    g.setNode(n.id, { width: pageSize(n).w, height: pageSize(n).h });
    for (const child of children.get(n.id) ?? []) {
      visit(child);
      g.setEdge(n.id, child.id);
    }
  };
  visit(root);
  dagre.layout(g);
  const place = new Map(ids.map((id) => [id, { x: g.node(id).x - g.node(id).width / 2, y: g.node(id).y - g.node(id).height / 2 }]));
  return { root, ids, width: g.graph().width ?? 0, height: g.graph().height ?? 0, place };
}

export function buildBrowsingTree(allNodes: RFNode[], noteFor: (n: RFNode) => string | undefined): { nodes: RFNode[]; edges: RFEdge[] } {
  const pages = allNodes.filter((n) => n.type !== "topic").sort((a, b) => a.data.node.created_at.localeCompare(b.data.node.created_at));
  const byId = new Map(pages.map((p) => [p.id, p]));

  const children = new Map<string, RFNode[]>();
  const roots: RFNode[] = [];
  const edges: RFEdge[] = [];
  for (const page of pages) {
    const opener = openerOf(page, byId);
    if (!opener) {
      roots.push(page);
      continue;
    }
    children.set(opener.id, [...(children.get(opener.id) ?? []), page]);
    edges.push({
      id: `path-${opener.id}-${page.id}`,
      source: opener.id,
      target: page.id,
      type: "smoothstep",
      selectable: false,
      style: { stroke: "var(--color-faint)", strokeWidth: 1.6 },
    });
  }

  const nodes: RFNode[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const tree of roots.map((r) => layoutTree(r, children))) {
    if (x > 0 && x + tree.width > MAX_ROW_WIDTH) {
      x = 0;
      y += rowHeight + TREE_GAP;
      rowHeight = 0;
    }
    for (const id of tree.ids) {
      const page = byId.get(id)!;
      const at = tree.place.get(id)!;
      nodes.push({
        ...page,
        data: { ...page.data, note: noteFor(page) },
        parentId: undefined,
        extent: undefined,
        hidden: false,
        draggable: false,
        position: { x: x + at.x, y: y + at.y },
      });
    }
    x += tree.width + TREE_GAP;
    rowHeight = Math.max(rowHeight, tree.height);
  }
  return { nodes, edges };
}
