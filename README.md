# ezstemz-web

Marketing site + paywalled download portal for the [EZStemz](../ezstemz/README.md)
desktop app.

- **Framework**: Next.js 16 (App Router) on React 19
- **UI**: Chakra UI v3 + `next-themes`
- **Auth + DB**: Supabase (Postgres, `@supabase/ssr`)
- **Payments**: Stripe Checkout (one-time, $9.99 license)
- **Distribution**: short-lived signed redirects to the latest GitHub Release
  asset (`.dmg` on macOS, `.exe` installer on Windows)

```
ezstemz-web
├── src/
│   ├── app/                       Next.js routes
│   │   ├── page.tsx               Landing (hero, features, FAQ)
│   │   ├── pricing/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── account/               Protected: license status
│   │   ├── download/              Protected: per-platform download cards
│   │   ├── auth/confirm/route.ts  Verifies the Supabase email link
│   │   ├── logout/route.ts        POST → sign out + 303 home
│   │   └── api/
│   │       ├── checkout/route.ts          Creates a Stripe Checkout session
│   │       ├── stripe/webhook/route.ts    Persists paid purchases
│   │       └── download/route.ts          Gated 302 → signed asset URL
│   ├── components/
│   │   ├── ui/                    Chakra Provider + color-mode snippets
│   │   ├── site/                  Nav, footer, marketing shell, BuyButton
│   │   └── auth/                  AuthCard, LoginForm, SignupForm
│   ├── lib/
│   │   ├── env.ts                 Throwing env getters
│   │   ├── theme.ts               Chakra v3 system + brand tokens
│   │   ├── license.ts             "does this user own a license?"
│   │   ├── github.ts              Release lookup + signed-asset resolver
│   │   ├── stripe.ts              Stripe SDK singleton
│   │   └── supabase/              Browser, server, admin clients + proxy helper
│   └── proxy.ts                   Next.js 16 proxy: refreshes the Supabase session per request
└── supabase/
    ├── config.toml
    └── migrations/
        └── 20260523000001_init.sql   profiles + purchases + RLS
```

## 1. First-time install

```bash
cd /Users/adamgroves/projects/ezstemz-web
npm install
cp .env.local.example .env.local
```

Then fill in the env vars described below. The `dev` script uses webpack
(`next dev --webpack`) because Turbopack's Emotion handling causes
hydration warnings with Chakra UI — see the
[upstream note](https://chakra-ui.com/docs/get-started/frameworks/next-app#hydration-errors).

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run start        # serve the production build
```

## 2. Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; bypasses RLS)
3. Apply the schema:

   ```bash
   # Option A — Supabase CLI (recommended):
   supabase link --project-ref <your-ref>
   supabase db push

   # Option B — copy/paste supabase/migrations/20260523000001_init.sql into
   #            Project → SQL Editor → Run.
   ```

4. In **Authentication → URL Configuration** (one Supabase project serves both
   local dev and production):
   - **Site URL** → your **production** origin only (e.g.
     `https://ezstemz.com`). Do not set this to localhost — it is the fallback
     when no `emailRedirectTo` matches the allow-list.
   - **Redirect URLs** → add **both** environments:
     - `http://localhost:3000/**` (local dev)
     - `https://your-domain.com/**` (production)
   The app builds confirmation links from `NEXT_PUBLIC_SITE_URL`, so localhost
   signups get localhost links and production signups get production links, as
   long as both patterns are allow-listed.
5. In **Authentication → Providers → Email**, keep "Confirm email" on (the
   signup flow renders a "check your inbox" state when confirmation is required).
6. **Email delivery (required for real signups):** Supabase's built-in SMTP is
   demo-only. It **only sends to emails on your Supabase organization's team**
   and is rate-limited (~2/hour). Everyone else sees "Check your inbox" in the
   app but never receives mail — that is Supabase policy, not an app bug.
   **You must configure custom SMTP** before launch:
   - Dashboard → **Authentication → SMTP** → enable custom SMTP.
   - [Resend](https://resend.com) free tier works well: create API key, use host
     `smtp.resend.com`, port `465`, user `resend`, password = API key, from
     `onboarding@resend.dev` (or your verified domain).
   - After saving, sign up with a non-team email and check **Authentication →
     Logs** if delivery still fails.
   - Quick test-only workaround: add your personal email to the org **Team** tab
     (not suitable for production).

### RLS notes

The migration enables RLS on `profiles` and `purchases` with a
single SELECT policy each (owner can read). All writes happen through the
service-role client inside route handlers, so end users can't
forge a license row even if they bypass the API.

> Do not switch to letting the client write to `purchases` directly.
> Stripe → webhook → service-role insert is the only safe path.

## 3. Stripe setup

1. Create a Stripe account, switch to **Test mode** for dev.
2. **Products → + Add product**: e.g. _"EZStemz Desktop License"_, one-time
   price of $9.99 USD. Copy the **price ID** → `STRIPE_PRICE_ID`.
3. **Developers → API keys**:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional; not
     used in the current flow, but handy for Stripe.js later)
4. **Developers → Webhooks**:
   - **Local dev**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
     The CLI prints a `whsec_...` secret — paste into `STRIPE_WEBHOOK_SECRET`.
   - **Production**: register an endpoint at
     `https://your-domain.com/api/stripe/webhook` for the events:
     - `checkout.session.completed`
     - `charge.refunded`
     Copy the signing secret → `STRIPE_WEBHOOK_SECRET` (different value than the
     CLI emits).

Test purchase flow:

```bash
# in one terminal
stripe listen --forward-to localhost:3000/api/stripe/webhook
# in another
npm run dev
# then sign up at http://localhost:3000/signup,
# click "Buy EZStemz" on /pricing,
# use 4242 4242 4242 4242 / any future date / any CVC.
```

After "Pay" you'll land on `/account?purchased=1` with the badge flipped to
**Licensed** and a working **Download** button.

## 4. GitHub Releases setup

The download endpoint redirects users to the latest release asset on the
[`adamgroves/ezstemz`](../ezstemz) repo. Update `GITHUB_REPO` in `.env.local`
if the repo lives elsewhere.

- **Public releases** — leave `GITHUB_TOKEN` unset. Anyone could find the
  same files via the GitHub UI, so this is really only a "make it
  inconvenient" gate. Good enough for a hobby-tier launch.
- **Private releases (recommended)** — set `GITHUB_TOKEN` to a fine-grained
  PAT with `Contents: read` access to the ezstemz repo. The download API
  forwards your token to `GET /repos/.../releases/assets/{id}` with
  `Accept: application/octet-stream`, which returns a 302 to a signed S3
  URL that's valid for a few minutes. Users never see the token.

The asset name matchers in `src/lib/github.ts` look for `*.dmg` (macOS) and
`*setup*.exe` / `*installer*.exe` (Windows) — which lines up with the
artefacts produced by `ezstemz/.github/workflows/release.yml`.

## 5. Deploying to Render

This repo ships a `render.yaml` blueprint. The order matters because the
Stripe webhook signing secret and Supabase redirect URLs can't be filled in
until the service has a public URL.

### a. First deploy

1. Push this directory to a GitHub repo Render can see.
2. Render Dashboard → **Blueprints → New Blueprint Instance** → select the
   repo. Render reads `render.yaml`, provisions a Web Service, and pauses on
   the env-var screen because every value is marked `sync: false`.
3. Fill in everything you _already_ know:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`
   - `GITHUB_REPO` (already defaulted in the blueprint) and `GITHUB_TOKEN` if releases are private
4. Leave `NEXT_PUBLIC_SITE_URL` and `STRIPE_WEBHOOK_SECRET` blank for now —
   set them to literally any non-empty placeholder so the build can start
   (e.g. `https://ezstemz-web.onrender.com` and `whsec_placeholder`).
5. Click **Apply**. Render builds with `npm ci && npm run build` and starts
   with `npm start` on the Node 20 runtime.

### b. After the URL exists

Render assigns a URL like `https://ezstemz-web.onrender.com` (or your
custom domain once attached). Now finish the wiring:

1. **Update `NEXT_PUBLIC_SITE_URL`** in Render env to the exact origin (no
   trailing slash) and trigger a manual redeploy. This is what the Stripe
   `success_url` / `cancel_url` and the Supabase magic-link
   `emailRedirectTo` are built from at runtime.
2. **Supabase → Authentication → URL Configuration**:
   - Site URL → `https://<your-render-url>` (production only)
   - Redirect URLs → add `https://<your-render-url>/**` and keep
     `http://localhost:3000/**` if you develop against the same project
3. **Stripe → Developers → Webhooks → Add endpoint**:
   - Endpoint URL → `https://<your-render-url>/api/stripe/webhook`
   - Events → `checkout.session.completed`, `charge.refunded`
   - Copy the new signing secret → set as `STRIPE_WEBHOOK_SECRET` in Render
     env → redeploy.
4. **Stripe → Settings → Customer emails** (or your SMTP integration with
   Supabase): make sure confirmation + receipt emails actually send. Render
   doesn't proxy any mail.

### c. Smoke-testing on Render

Same flow as local development, just against the live URL:

```text
1. POST /signup with a real inbox you control → click the email link.
2. Visit /pricing → click Buy → use 4242 4242 4242 4242 in Stripe test mode.
3. Stripe redirects to /account?purchased=1; the badge says "Licensed".
4. /download shows the latest macOS + Windows release with a working link.
5. In Stripe Dashboard → Webhooks → your endpoint → check there's a 200 for
   the checkout.session.completed event. If it's red, the signing secret
   doesn't match — re-copy from Stripe → paste into Render → redeploy.
```

### d. Things to remember in production

- Switch Stripe to live mode and re-register the webhook (signing secret is
  per-endpoint AND per-mode). Update `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
  and `STRIPE_WEBHOOK_SECRET` together.
- Render's **Starter** plan sleeps after inactivity. The first request to a
  cold service can take 30–60s; the Stripe webhook will retry automatically
  but for snappier signups, upgrade to a paid tier that doesn't sleep.
- `NEXT_PUBLIC_*` vars are baked at build time, so changing
  `NEXT_PUBLIC_SITE_URL` requires a redeploy, not just a service restart.
- For a staging environment, duplicate the blueprint (or run a separate
  Render service) with Stripe **test** keys + a separate Supabase project.

## 6. Things deliberately out of scope (yet)

- OAuth providers (Google / GitHub login). Easy to add later by extending
  `LoginForm` with `supabase.auth.signInWithOAuth(...)` plus an
  `/auth/callback` route handler that exchanges the code.
- Subscription / team licenses. The schema would extend `purchases` with
  `plan` + `expires_at`; the `getLicenseStatus()` helper is the only place
  you'd need to teach about "active vs. expired".
- License-key-in-the-app verification. The desktop app currently doesn't
  phone home; if you want it to, this site is the natural backend.
- Customer portal (Stripe-hosted account / receipt download). Add
  `/api/portal` calling `stripe.billingPortal.sessions.create()` and link
  to it from `/account`.
