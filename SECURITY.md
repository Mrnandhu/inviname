# Inviname Arts – security checklist

The code changes are already in this update. These steps are settings only you can change in the consoles.
Do them in order. Steps 1, 3 and 4 are the most important.

## 1. Publish the new database rules (required, 2 min)

1. Open `firestore.rules` in VS Code → Ctrl+A → Ctrl+C.
2. Firebase Console → Firestore → **Rules** → select all, delete, paste → **Publish**.
3. Test straight away: place one order with a test account, enter a 12-digit UTR, and check it in Admin → Orders.

What changed: every field customers can write is now checked (size, type, phone and pincode format),
carts and orders have size limits, and payment screenshots must be Cloudinary images.

## 2. App Check – only your website can use your database (recommended)

1. Firebase Console → **App Check** → **Apps** → your web app → **Register** → **reCAPTCHA v3**.
2. Follow its link to create reCAPTCHA v3 keys. Add these domains:
   `inviname.in`, `www.inviname.in`, `inviname.pages.dev`, `localhost`.
3. Paste the **secret key** into Firebase (App Check register box). Never put the secret in the code.
4. Paste the **site key** into `src/firebase/security.js` → `export const appCheckSiteKey = 'YOUR_SITE_KEY'`.
5. Commit, push, wait for Cloudflare to deploy.
6. For local testing: run `npm run dev`, open the browser console, copy the **App Check debug token**
   and add it in Firebase → App Check → Apps → ⋮ → **Manage debug tokens**.
7. Wait 2–3 days. In App Check → **APIs** → Cloud Firestore, check that almost all requests are "Verified".
   Then click **Enforce**. (Enforce too early and real customers get blocked.)

## 3. Lock your Firebase key to your website (recommended, 5 min)

1. console.cloud.google.com → project **inviname-b7b7d** → APIs & Services → **Credentials**.
2. Open **Browser key (auto created by Firebase)**.
3. Application restrictions → **Websites** → add:
   - `https://inviname.in/*`
   - `https://www.inviname.in/*`
   - `https://inviname.pages.dev/*`
   - `https://*.inviname.pages.dev/*`
   - `https://inviname-b7b7d.firebaseapp.com/*`
   - `http://localhost:5173/*`
4. Save, wait 5 minutes, then test login (Google and email) on the live site. If login fails, remove the
   restriction and tell me.

## 4. Protect logins

- Firebase Console → Authentication → **Settings** → **User actions** → turn ON **Email enumeration protection**.
- Authentication → Settings → **Authorized domains**: keep only `localhost`, `inviname-b7b7d.firebaseapp.com`,
  `inviname.in`, `www.inviname.in`, `inviname.pages.dev`.
- Your admin Gmail: turn on **2-Step Verification** (myaccount.google.com → Security). Use a long password.
- Keep only your own user ID in the `admins` collection.
- The admin panel now logs out by itself after 30 minutes without activity.
- New accounts need a password of 8+ characters with a letter and a number.

## 5. Cloudinary upload limits

Cloudinary → Settings → Upload → **inviname_unsigned** → edit:
- **Allowed formats:** `jpg, jpeg, png, webp`
- **Max file size:** 10 MB (10000000 bytes)
- **Max image width/height:** 4000
- Save.

## 6. Security headers (automatic on Cloudflare)

`public/_headers` now adds HTTPS-only, anti-clickjacking and other browser protections.
The Content Security Policy starts in **report-only** mode so it can't break anything:
1. After deploying, open the live site → press F12 → **Console**. Log in with Google, add to cart,
   place an order, upload a photo, open the admin panel.
2. If you see **no** messages starting with "Content-Security-Policy", open `public/_headers` and change
   `Content-Security-Policy-Report-Only:` to `Content-Security-Policy:` → commit and push.
3. If you do see such messages, send me a screenshot first.

## 7. Good habits

- Never put secrets in the code or GitHub: Cloudinary API secret, reCAPTCHA secret, passwords, Gmail app passwords.
  (The Firebase web config and reCAPTCHA **site** key are public and safe.)
- Only mark payments verified after you see the money in your bank or UPI app.
- Run `npm audit` now and then. Never run `npm audit fix --force`.
