# Simple Chat App — MongoDB + Cloudinary (plain HTTP, no websocket)

Same look and behavior as the very first version (black theme, single room,
polling every 2s, sidebar files/gallery, username search-highlight). Storage
is now real: **MongoDB** for users/messages, **Cloudinary** for uploads.

---

## PART 1 — Get your MongoDB connection string

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Create a **free cluster** (M0 tier — no credit card needed).
3. Under **Database Access**, create a database user with a username +
   password (write it down).
4. Under **Network Access**, click **Add IP Address** → **Allow access
   from anywhere** (`0.0.0.0/0`) — simplest for getting started; you can
   tighten this later.
5. Go back to **Database → Connect → Drivers**, copy the connection
   string. It looks like:
   ```
   mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your real password, and add a database name
   right after `.net/`, e.g. `.net/chatapp?retryWrites=true...`

That full string is your `MONGODB_URI`.

## PART 2 — Get your Cloudinary details

1. Sign up free at https://cloudinary.com/console
2. The dashboard homepage shows three values immediately:
   **Cloud name**, **API Key**, **API Secret**.

## PART 3 — Where to paste them (local setup)

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_here
```

**You never edit `server.js` itself** — it reads everything from `.env`
via `process.env.X`.

Then run:

```bash
npm start
```

Console should print:
```
MongoDB connected
Seeded default users: admin, alice, bob, raj
Chat running on http://localhost:3000
```

Open `http://localhost:3000` and log in as `admin`.

To add/remove users now that it's MongoDB, either:
- use MongoDB Atlas's web UI (Collections → `users` → insert/delete documents), or
- ask me and I'll add a tiny admin endpoint/script for it.

---

## PART 4 — Deploy it (Render, free tier example)

1. Push this folder to a GitHub repo (make sure `.env` is **not** committed
   — `.gitignore` already excludes it).
2. Go to https://render.com → **New** → **Web Service** → connect your repo.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
4. Under **Environment**, add these variables (same values as your local
   `.env`, pasted into Render's UI instead of a file):
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your full Atlas connection string |
   | `CLOUDINARY_CLOUD_NAME` | your cloud name |
   | `CLOUDINARY_API_KEY` | your API key |
   | `CLOUDINARY_API_SECRET` | your API secret |
5. Click **Create Web Service**. Render builds and starts it; you'll get a
   public URL like `https://your-app.onrender.com`.

Works the same way on Railway, Fly.io, or a plain VPS — the only thing
that changes is *where* you paste the environment variables (each host has
its own "Environment Variables" panel instead of a `.env` file).

---

## Why this setup won't lose data

- Messages and users now live in MongoDB Atlas (cloud database), not a
  local JSON file — so redeploys/restarts never wipe your data.
- Uploaded files go straight to Cloudinary and get a permanent
  `https://res.cloudinary.com/...` URL — same reason.
- This means you can deploy to hosts with an ephemeral disk (like Render's
  free tier) with zero data-loss risk, unlike the local-disk version.

## Files

```
server.js          # Express + MongoDB (mongoose) + Cloudinary
public/index.html  # frontend — unchanged from the original version
.env.example        # copy to .env, fill in MongoDB + Cloudinary values
```
