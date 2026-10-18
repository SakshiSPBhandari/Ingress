# Deployment

| Part | Where | Cost |
|---|---|---|
| Web app (static files) | Firebase Hosting, project `research-map-511920` | Free (Spark plan, no billing) |
| Backend + AI service (one Docker container) | Render, free web service, Singapore | Free |
| Database | Neon PostgreSQL, Singapore | Free |

The web app calls the backend directly at its Render address with a Bearer session token, so it works in every browser, including Safari and Incognito.

## 1. Backend on Render (first)

1. Push the code to GitHub (the 3-idiots repository).
2. Render: **New > Blueprint**, choose the repository. Render reads `render.yaml`.
3. Fill in the secrets Render asks for:
   - `DATABASE_URL`: the Neon connection string (same as `backend/.env`)
   - `GEMINI_API_KEY_1` to `_4`: from `agent/.env`
   - `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`: from `backend/.env`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: from `backend/.env`
   - `PUBLIC_API_URL`: leave as `https://research-map-api.onrender.com` (the service address shown by Render; fix it after the first deploy if different)
4. Deploy, then open `https://<service>.onrender.com/api/v1/readyz`. It must show `"ok":true`.
5. Keep it awake (Render's free plan sleeps after 15 minutes): on https://cron-job.org create a free job that opens `https://<service>.onrender.com/api/v1/healthz` every 10 minutes.

## 2. Web app on Firebase Hosting

Run in the `frontend` folder:

```bash
npm install -g firebase-tools
firebase login
copy .env.firebase.example .env.firebase
```

Edit `.env.firebase`: set `NEXT_PUBLIC_API_BASE_URL=https://<service>.onrender.com/api/v1`. Then:

```bash
npm run build:firebase
firebase deploy --only hosting
```

The site is at `https://research-map-511920.web.app`.

To test the same build on this computer first: `npm run serve:static` and open http://127.0.0.1:5050 (add `http://127.0.0.1:5050` to `WEB_ORIGINS` of a local backend).

## 3. Google sign-in

Google Cloud console, project `research-map` > Google Auth Platform > Clients > your client:

- Authorised JavaScript origins: `https://research-map-511920.web.app`
- Authorised redirect URIs: `https://<service>.onrender.com/api/v1/auth/google/callback`
- Audience: **Publish app** (only name and email are requested, so no review is needed).

## 4. Chrome extension

`extension/manifest.json` already allows `research-map-511920.web.app` and `.firebaseapp.com`. The ZIP offered on the install page is rebuilt from the `extension` folder by every web app build. Users install it from the web app's Extension page.

## 5. Check after deploying

Sign up (email code arrives), sign in with Google, install the extension, create a workspace with a goal, Start Tracking, open a few pages, check the clusters and the goal panel, stop and read the report, share a link and open it in Incognito, and connect Gemini CLI with the command from Settings.
