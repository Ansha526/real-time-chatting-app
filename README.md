# Circle Chat — MongoDB + Vercel

A full-stack small-group chat starter with a browser frontend, Node.js Vercel backend and MongoDB Atlas database. This version replaces the earlier Supabase version. Do NOT use the earlier SQL file or Supabase variables.

## Included

Create group, invite-only join, group list, persistent messages, leave/rejoin, copy invite, responsive mobile layout, 3-second refresh, browser membership, rate limits and retry deduplication. Latest 100 messages are displayed; older messages remain in MongoDB. Frontend is HTML/CSS/vanilla JavaScript (not React). Backend is a native Node.js Vercel Function (not Express). If your teacher ALSO requires React or Express, those requirements need a separate conversion; MongoDB is included here.

## Step 1: MongoDB Atlas

1. Open https://cloud.mongodb.com and create/sign into your account.
2. Create a project, then create a database cluster. Select the Free tier if available; avoid selecting a paid tier unless intended. Pick an available region near your Vercel region.
3. In **Database Access**, create a DATABASE USER (separate from your Atlas login). Give it `readWrite` access to database `circle_chat`. Save its username and password privately.
4. In **Network Access**, allow the network that will connect. For local use add your current IP. For Vercel use an Atlas-supported access setup: if your deployment has fixed outbound IPs, allow those. A small student demo with dynamic Vercel outbound IPs may need the Atlas **Allow Access from Anywhere** entry `0.0.0.0/0`; this opens the network boundary, so retain a strong database password and least-privilege database user. Remove that entry after the demo when no longer needed. Do not enter your computer IP alone and expect Vercel to connect from it.
5. Open your cluster **Connect → Drivers → Node.js**.
6. Copy the `mongodb+srv://...` connection string. Replace the `<db_password>` placeholder with YOUR database user's password, and username if it is also a placeholder. URL-encode special characters in username/password; Atlas-generated alphanumeric passwords avoid this issue.
7. This entire private connection string is `MONGODB_URI`. Never upload it to GitHub or share a screenshot containing it.

Collections and indexes are created by the application on first connection. No SQL or manual collection creation is needed. Database user must be able to create the collections/indexes in `circle_chat`.

## Step 2: Local run

Install Node.js 20+ (22/24 recommended). Extract ZIP and open project folder.

```bash
npm install
```

Copy `.env.example` to `.env`, fill in:

```env
MONGODB_URI=YOUR_ACTUAL_MONGODB_ATLAS_CONNECTION_STRING
MONGODB_DB=circle_chat
RATE_LIMIT_SALT=YOUR_RANDOM_PRIVATE_TEXT
```

Use the salt you already generated, or generate one:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then:

```bash
npm run dev
```

Open http://localhost:3000. Keep the terminal running. Restart `npm run dev` after changing `.env`.

## Step 3: GitHub

1. Create a GitHub repository.
2. Upload the CONTENTS of `circle-chat-mongodb`, not the ZIP itself.
3. Root must contain `package.json`, `package-lock.json`, `vercel.json`, `api`, `lib`, `public` and `README.md`.
4. Never upload `.env`, credentials, `.vercel`, `dist` or `node_modules`. `.env.example` is safe because it contains placeholders only.
5. Commit changes. GitHub web upload can omit dotfiles; create `.gitignore` manually if needed.

## Step 4: Vercel

Import the GitHub repository in Vercel **Add New → Project**.

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Root Directory | ./ |
| Install Command | npm ci (or leave automatic) |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js | 20 or later (22/24 recommended) |

If the outer folder was uploaded, Root Directory must be `circle-chat-mongodb`.

Add server Environment Variables:

| Name | Where value comes from |
| --- | --- |
| MONGODB_URI | Atlas → cluster Connect → Drivers → Node.js; replace password placeholder |
| MONGODB_DB | Type circle_chat |
| RATE_LIMIT_SALT | Random text generated in your terminal |

No frontend API URL variable is needed: frontend calls `/api/chat` on the same Vercel domain. Never prefix credentials with `VITE_` or `NEXT_PUBLIC_`.

Click Deploy. After variable edits redeploy. Vercel hosts frontend AND backend. MongoDB Atlas hosts the database. No Railway or Supabase required. Share the Vercel website link, not the database URI.

## Live verification

1. Open the Vercel website normally, enter name and create a group.
2. Copy Invite link.
3. Open invite in incognito or another device, enter second name and join.
4. Send messages both ways; expect roughly 3-second updates.
5. Refresh/reopen group to verify persistence.
6. Leave and rejoin with invite.
7. Optional: open `/api/chat?action=health` on the same site; successful result is `{"ok":true,"database":"MongoDB"}`.

## Troubleshooting

- Setup needed: add MONGODB_URI and RATE_LIMIT_SALT and redeploy/restart.
- Database unavailable: check Atlas database user's credentials, network allowlist, cluster availability and correct URI. Do not use Atlas account password instead of database user password. Ensure URI starts with mongodb+srv:// or mongodb://.
- dist missing: confirm this project's root; it does not use Vite or client/dist.
- API 404: upload `api/chat.js` AND `lib/database.js` at repository root, not just public files.
- Invite invalid: use full invite link or code, not group name.
- Join first: this browser lacks membership; use invite again.
- Too many requests: wait for the window to expire. Create limit is 5/hour per IP; join 20/min per IP; send 30/min per session; shared networks share IP limits.
- Deployment protection: review Vercel's access settings for the environment if other people need to open it.

## Architecture / files

- public/: frontend HTML/CSS/JS
- api/chat.js: Node API, validation, private group authorization
- lib/database.js: official MongoDB driver, cached connection pool and index setup
- build.mjs: copies frontend into dist
- dev.mjs: local server running the same backend
- vercel.json: deployment and security headers
- tests/: 9 API tests with a mocked database

## Scope and limits

No email/password authentication, account recovery, attachments, calls, typing indicators, message editing/deletion, admin moderation or invite rotation. Names are unverified. Sessions and invite links are opaque random values; hashes are stored in MongoDB. Invite holders can join and see the latest messages, so share privately. Membership cookie lasts up to 30 days; another device/cleared cookies requires invite rejoin. Invite codes are also saved in your browser for sharing.

Messages are NOT end-to-end encrypted and can be read by the database administrator. Latest 100 are displayed; all remain stored until admin deletion. Deleted membership does not delete past messages. Rate-limit entries have a MongoDB TTL index; expired entries are removed asynchronously. Groups/messages have no auto-delete policy. Add retention/moderation before wider use.

Polling uses Vercel requests and MongoDB reads; check your plan usage before scaling. Cached connection pool has max 5 connections per warm function instance, but multiple instances can still create multiple pools. Configure regional placement/access to match your Atlas cluster. Keep database keys private and only use the local dev server for development.

## Validation performed

Frontend build, JavaScript syntax and 9 backend tests passed. Tests cover input validation, missing setup, origin checks, membership protection, hidden session hashes, hashed invites, retry deduplication and rate limits. Tests use mocked MongoDB, not a live Atlas database. A live database/deployment integration and browser visual review remain to be done after user configuration.
