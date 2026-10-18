"use client";
/** Sign-in and sign-up layout: the form, next to a panel in the landing page colours that shows what the app does. */
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Logo } from "@/components/shell/Logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-hero-glow lg:block">
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo href="/" />
          <h1 className="max-w-md text-balance font-display text-[2.4rem] font-black leading-[1.15] tracking-[-0.02em] text-ink">
            Research with many tabs open? Track them all on one <span className="rounded-2xl bg-brand-gradient px-2">canvas.</span>
          </h1>
          <div className="relative h-56">
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 20 }}
              className="absolute left-0 top-0 w-72 rounded-[24px] border border-line bg-white p-4 shadow-pop-lg"
            >
              <p className="text-xs font-semibold text-muted">Your goal</p>
              <p className="mt-1 text-sm font-semibold text-ink">Pick a CRM for our 20-person sales team</p>
              <p className="mt-3 text-xs text-muted">46 min on your goal · 4 min on other pages</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120, damping: 20 }}
              className="absolute left-32 top-28 w-60 rounded-[24px] border border-line bg-white p-4 shadow-pop-lg"
            >
              <p className="text-sm font-bold text-ink">This page is not part of your goal</p>
              <p className="mt-1 text-xs text-muted">Live cricket scores have nothing to do with choosing a CRM.</p>
            </motion.div>
          </div>
        </div>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-6 lg:pt-28">
        <div className="lg:hidden">
          <Logo href="/login" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto my-auto w-full max-w-md py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
