# Infrastructure Transfer Plan

## Overview

Transfer Next.js + Supabase app from work accounts to client's accounts.

| Service | Current | Target |
|---------|---------|--------|
| GitHub | Work account (you're a collaborator) | Your personal account (via transfer) |
| Vercel | Work account (free) | Client's account (Pro) |
| Supabase | Your account (Pro) | Client's account (Pro) |
| Domain | N/A | Client's Namecheap account |

---

## Pre-Transfer Checklist

Before starting, gather this information from your current setup:

### Environment Variables (from current Vercel)

Go to Vercel → Project → Settings → Environment Variables and copy all values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# List any other env vars your app uses:
# NEXT_PUBLIC_SITE_URL=
# STRIPE_SECRET_KEY=
# etc.
```

### Supabase Configuration (from current project)

Check and document what you have configured:

- [ ] **Auth Providers**: Authentication → Providers (Google, GitHub, email/password, etc.)
- [ ] **Auth Settings**: Authentication → URL Configuration (Site URL, Redirect URLs)
- [ ] **Storage Buckets**: Storage → List all buckets and their public/private settings
- [ ] **Storage Policies**: Storage → Each bucket → Policies
- [ ] **Edge Functions**: If any deployed
- [ ] **Database Webhooks**: Database → Webhooks
- [ ] **Cron Jobs**: If any configured
- [ ] **Secrets**: Project Settings → Secrets

### Third-Party Services

List any external services your app uses that may need API keys updated:

- [ ] Stripe (payment)
- [ ] SendGrid / Resend / Postmark (email)
- [ ] Cloudinary / Uploadthing (file uploads)
- [ ] Analytics (Vercel Analytics, PostHog, etc.)
- [ ] Other: _______________

---

## Step 1: Transfer Repository to Personal GitHub

**Time: ~5 minutes**

Since you're already a collaborator on the work repo, you can transfer ownership directly.

### 1.1 Request Transfer (Work Account Owner Does This)

The owner of the work GitHub account needs to:

1. Go to the repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Danger Zone**
4. Click **"Transfer ownership"**
5. Enter your **personal GitHub username**
6. Type the repo name to confirm
7. Click **"I understand, transfer this repository"**

### 1.2 Accept Transfer (You Do This)

1. Check your personal email for the transfer invitation
2. Click the link to accept
3. Repository is now under your personal account

### 1.3 Update Local Git Remote

```bash
# In your local project folder
cd your-project

# Update the remote URL to your personal account
git remote set-url origin https://github.com/PERSONAL_ACCOUNT/REPO_NAME.git

# Verify it's correct
git remote -v
```

### 1.4 Verify

- [ ] Repo appears in your personal GitHub account
- [ ] All branches are present
- [ ] All commit history is intact
- [ ] You can push changes

---

## Step 2: Set Up Client's Supabase

**Time: ~30 minutes**

### 2.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with **client's email address**
4. Verify email
5. Create organization (use client's company name)

### 2.2 Create New Project

1. Click "New Project"
2. Enter project name
3. Generate and **save** the database password
4. Select region (choose closest to your users)
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

### 2.3 Save Credentials

Copy and save these values (you'll need them for Vercel):

| Credential | Location |
|------------|----------|
| Project URL | Settings → API → Project URL |
| Anon Key | Settings → API → anon public |
| Service Role Key | Settings → API → service_role (keep secret!) |

### 2.4 Add Yourself as Team Member

1. Click organization name (top left)
2. Go to "Team" or "Members"
3. Click "Invite"
4. Enter **your personal email**
5. Select role: **Owner** or **Administrator**
6. Accept invitation from your email

### 2.5 Push Database Schema

```bash
# In your project folder
cd your-project

# Login to Supabase CLI (if not already)
supabase login

# Link to client's new project
supabase link --project-ref NEW_PROJECT_REF

# Push all migrations (creates fresh schema, no data)
supabase db push
```

### 2.6 Verify Database

1. Go to Supabase Dashboard → Table Editor
2. Confirm all tables were created
3. Check that columns and types are correct

### 2.7 Configure Authentication

Go to Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-app.vercel.app` (update after Vercel setup) |
| Redirect URLs | Add: `https://your-app.vercel.app/**` |

Go to Authentication → Providers and enable the same providers you had before:

- [ ] Email (enable/configure as needed)
- [ ] Google (add Client ID and Secret)
- [ ] GitHub (add Client ID and Secret)
- [ ] Other providers as needed

### 2.8 Configure Storage (If Used)

For each storage bucket you need:

1. Go to Storage → "New bucket"
2. Enter bucket name (must match your code)
3. Set public/private as needed
4. Create bucket
5. Add policies: Select bucket → Policies → Add policy

### 2.9 Deploy Edge Functions (If Used)

```bash
# If you have edge functions
supabase functions deploy function-name
```

---

## Step 3: Set Up Client's Vercel

**Time: ~20 minutes**

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose **"Continue with Email"** (not GitHub)
4. Enter **client's email address**
5. Verify email
6. Complete account setup

### 3.2 Upgrade to Pro

1. Go to Settings → Billing
2. Upgrade to Pro plan
3. Add client's payment method

### 3.3 Add Yourself as Team Member

1. Go to Settings → Members
2. Click "Invite Member"
3. Enter **your personal email**
4. Select role: **Owner** or **Developer**
5. Accept invitation from your email

### 3.4 Connect Your Personal GitHub

1. From client's Vercel dashboard, click "Add New Project"
2. Click "Import Git Repository"
3. Click "Connect GitHub"
4. **Log in with YOUR personal GitHub account** when prompted
5. Authorize Vercel to access your repositories
6. Select the repository you created in Step 1

### 3.5 Configure Project Settings

Before deploying, configure:

**Framework Preset:** Next.js (should auto-detect)

**Environment Variables:** Add all variables:

```
NEXT_PUBLIC_SUPABASE_URL = [from Step 2.3]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [from Step 2.3]
SUPABASE_SERVICE_ROLE_KEY = [from Step 2.3]
[Add any other env vars your app needs]
```

### 3.6 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note the deployment URL (e.g., `your-app.vercel.app`)

### 3.7 Update Supabase Auth URLs

Now that you have the Vercel URL, go back to Supabase:

1. Authentication → URL Configuration
2. Update Site URL: `https://your-app.vercel.app`
3. Update Redirect URLs: `https://your-app.vercel.app/**`

---

## Step 4: Purchase Domain & Configure Namecheap

**Time: ~20 minutes**

### 4.1 Create Namecheap Account for Client

1. Go to [namecheap.com](https://www.namecheap.com)
2. Click "Sign Up"
3. Enter **client's email address**
4. Complete account setup
5. Add client's payment method

### 4.2 Purchase Domain

1. Search for desired domain
2. Add to cart
3. Complete purchase
4. Enable **WhoisGuard** (free privacy protection)
5. Enable **Auto-Renew** to prevent accidental expiration

### 4.3 Add Yourself as Collaborator (Share Access)

Namecheap allows sharing domain management access with other users.

**Client (account owner) does this:**

1. Log into Namecheap
2. Go to **Dashboard** → **Domain List**
3. Click on the domain name
4. Go to **Sharing & Transfer** tab
5. Click **"Share Access"**
6. Enter **your Namecheap username** (you need a Namecheap account)
7. Select permissions:
   - ✅ **DNS Management** (required)
   - ✅ **Domain Settings** (recommended)
   - ✅ **Renewal Management** (recommended)
8. Click **"Share"**

**You do this:**

1. Log into your Namecheap account
2. Go to **Dashboard** → **Shared Access**
3. Accept the sharing invitation
4. Domain now appears in your "Shared with me" list

### 4.4 Configure DNS for Vercel

**In Namecheap:**

1. Go to **Domain List** → Click domain → **Advanced DNS**
2. Delete any existing A or CNAME records for @ and www
3. Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Automatic |
| CNAME | www | cname.vercel-dns.com | Automatic |

**In Vercel:**

1. Go to Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter domain: `yourdomain.com`
4. Click **"Add"**
5. Add www subdomain: `www.yourdomain.com`
6. Wait for DNS verification (can take up to 48 hours, usually ~10 minutes)

### 4.5 Configure SSL

Vercel automatically provisions SSL certificates. Just verify:

1. In Vercel → Domains, both domains should show ✅
2. Visit `https://yourdomain.com` - should load with valid SSL

### 4.6 Update Supabase Auth URLs

Now update Supabase to use the production domain:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL**: `https://yourdomain.com`
3. Update **Redirect URLs**:
   - Add: `https://yourdomain.com/**`
   - Add: `https://www.yourdomain.com/**`
   - Keep Vercel URL as fallback: `https://your-app.vercel.app/**`

### 4.7 Update Environment Variables (If Needed)

If your app uses a `NEXT_PUBLIC_SITE_URL` or similar:

1. Vercel → Project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`
3. Redeploy for changes to take effect

### 4.8 Verify Domain Setup

- [ ] `https://yourdomain.com` loads correctly
- [ ] `https://www.yourdomain.com` redirects to main domain (or vice versa)
- [ ] SSL certificate is valid (padlock icon in browser)
- [ ] Auth flows work with new domain

---

## Step 5: Verification Checklist

Test everything works:

### App Loads
- [ ] Homepage loads without errors
- [ ] No console errors in browser dev tools
- [ ] All pages/routes work

### Authentication
- [ ] Sign up with new account works
- [ ] Sign in works
- [ ] Sign out works
- [ ] OAuth providers work (Google, etc.)
- [ ] Password reset works (if applicable)

### Database
- [ ] Data can be read from database
- [ ] Data can be written to database
- [ ] RLS policies are working (test with different user roles)

### Storage (If Used)
- [ ] File uploads work
- [ ] Files can be retrieved/displayed
- [ ] Access policies are correct

### Other Features
- [ ] Email sending works (if applicable)
- [ ] Payments work (if applicable)
- [ ] All API routes function correctly

---

## Step 6: Cleanup

After verifying everything works (wait 1-2 weeks):

### Old Supabase Project
- [ ] Export any data you want to keep
- [ ] Delete project or downgrade plan

### Old Vercel Project
- [ ] Delete project from work Vercel

### Old GitHub Repo
- [ ] Already transferred - nothing to do here

---

## Credentials Document for Client

Create this document and share securely with client:

```
===========================================
APPLICATION ACCESS CREDENTIALS
===========================================

NAMECHEAP (Domain)
------------------
URL: https://namecheap.com
Email: [client's email]
Password: [client sets this]
Domain: [yourdomain.com]
Renewal: Auto-renew enabled

VERCEL (Hosting)
-----------------
URL: https://vercel.com
Email: [client's email]
Password: [client sets this]

SUPABASE (Database)
-------------------
URL: https://supabase.com
Email: [client's email]
Password: [client sets this]
Project URL: https://xxxxx.supabase.co

APPLICATION
-----------
Live URL: https://[yourdomain.com]
Vercel URL: https://[app-name].vercel.app (backup)
Admin URL: [if applicable]

NOTES
-----
- Code repository is on [your name]'s GitHub account
- Domain management shared with [your name]'s Namecheap account
- [Your name] has developer access to make updates
- For any issues, contact: [your email]

===========================================
```

---

## Future Development Workflow

When you need to make changes:

```bash
# Normal git workflow
git add .
git commit -m "Description of changes"
git push origin main

# Vercel automatically deploys
```

For database changes:

```bash
# Create new migration
supabase migration new migration_name

# Edit the migration file in supabase/migrations/

# Push to client's Supabase
supabase db push
```

---

## Troubleshooting

### Build fails on Vercel
- Check environment variables are all set
- Check build logs for specific errors
- Verify Node.js version matches your local

### Auth not working
- Verify Site URL in Supabase matches your domain exactly
- Check Redirect URLs include the correct domain
- Verify API keys are correct in Vercel env vars

### Database connection fails
- Verify SUPABASE_URL and keys are correct
- Check if RLS policies are blocking access
- Verify the database schema was pushed correctly

### Storage not working
- Verify bucket names match your code
- Check storage policies are configured
- Verify bucket is public/private as expected

### Domain not working
- DNS propagation can take up to 48 hours (usually 10-30 minutes)
- Use [dnschecker.org](https://dnschecker.org) to verify DNS records
- Verify A record points to `76.76.21.21`
- Verify CNAME for www points to `cname.vercel-dns.com`
- In Vercel, check domain status shows ✅ not ⚠️

### SSL certificate issues
- Vercel auto-provisions SSL, wait a few minutes after DNS propagates
- If stuck, try removing and re-adding the domain in Vercel
- Ensure no conflicting CAA records in DNS
