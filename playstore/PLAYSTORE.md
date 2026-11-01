# Inviname Arts – Play Store app (customer app)

The app is your live website inside an Android app (a "Trusted Web Activity"). It opens full screen with
no browser bar, always shows the latest products and prices, and needs no update when you change the shop.
UPI payments work the same way: the "Pay with UPI app" button opens PhonePe / Google Pay / Paytm.

Package name (app ID, can never change later): **in.inviname.app**

Files in this folder:
- `app-icon-512.png` – store icon (512×512)
- `feature-graphic.png` – store banner (1024×500)
- `listing.md` – app name, descriptions, category, data safety and content rating answers
- `assetlinks.template.json` – the file that removes the browser bar (filled in at step 3)

---

## Step 0 – before you start
- The website must be **live at https://inviname.in** (Cloudflare Pages + domain).
- Replace sample products and photos with your real ones (Google reviews the app with what's on the site).
- In Admin → Settings, add your **email** (Google requires a contact email, and it shows on the delete-account page).
- Check these pages open: https://inviname.in/privacy-policy and https://inviname.in/delete-account

## Step 1 – make the Android file (PWABuilder, free, 10 min)
1. Open **pwabuilder.com** → type `https://inviname.in` → **Start**.
2. It checks the site (manifest, icons, offline helper are already set up). Click **Package for stores** → **Android** → **Generate package**.
3. In **Options**, set:
   - Package ID: `in.inviname.app`
   - App name: `Inviname Arts` · Launcher name: `Inviname`
   - App version: `1.0.0` · Version code: `1`
   - Host: `inviname.in` · Start URL: `/`
   - Theme / background colour: `#1E1219` · Navigation bar colour: `#1E1219`
   - Display mode: Standalone · Notifications: off
   - **Signing key: "Create new"** – fill in your name, "Inviname Arts", city, state, IN.
4. **Download**. You get a zip with: `.aab` (upload to Play), `.apk` (to test on your phone), `signing.keystore`,
   `signing-key-info.txt` and `assetlinks.json`.

⚠️ **Back up `signing.keystore` and `signing-key-info.txt`** (Google Drive + a pen drive). Without them you can
never update the app. Never put them on GitHub.

## Step 2 – test on your phone
Copy the `.apk` to your phone and install it ("allow from this source"). It works, but shows a small browser bar
at the top until step 3 is done. Check: home, shop, login with Google, cart, checkout, "Pay with UPI app".

## Step 3 – remove the browser bar (link the app to your website)
1. Put PWABuilder's `assetlinks.json` in your project:
   ```bash
   cd ~/vrlss/inviname
   mkdir -p public/.well-known
   cp ~/Downloads/<pwabuilder-folder>/assetlinks.json public/.well-known/assetlinks.json
   git add . && git commit -m "Android app link" && git push
   ```
2. After Cloudflare deploys, check https://inviname.in/.well-known/assetlinks.json opens and shows `in.inviname.app`.
3. **After uploading to Play (step 5)**: Play Console → your app → **Test and release → App integrity → App signing**.
   Copy the **SHA-256 certificate fingerprint** of the *App signing key*. Add it as a second fingerprint in
   `public/.well-known/assetlinks.json` (see `assetlinks.template.json` for the shape) and push again.
   Google re-signs your app, so without this second fingerprint the browser bar comes back in the Play version.

## Step 4 – create the app in Play Console
Play Console → **Create app**:
- App name: `Inviname Arts` · Default language: English (India) – en-IN
- App or game: **App** · Free or paid: **Free**
- Tick the declarations → Create.

Then **Dashboard → Set up your app**, using `listing.md` for every answer:
privacy policy, app access, ads, content rating, target audience, data safety, government app (No),
financial features (None), health (No), store listing (texts + icon + feature graphic + screenshots).

Screenshots: take 4–6 on your phone **in the installed app** after real products are added
(Home, Shop, a product, Cart, Order with UPI payment). Portrait, at least 1080 px tall.

## Step 5 – closed test (required for new personal developer accounts)
1. **Test and release → Testing → Closed testing → Create track** → upload the `.aab`.
2. Add **at least 12 testers** (their Gmail addresses – family, friends, your sister).
3. Each tester must accept the invite link and **install and open the app**, and keep it for **14 days**.
4. After 14 days: **Dashboard → Apply for production** and answer Google's questions about the test.

## Step 6 – production
After Google approves: **Production → Create release** → add the same `.aab` (or a new version) → roll out.
Review usually takes a few days.

## Later updates
Shop changes (products, prices, photos, texts) appear in the app instantly – no new version needed.
Only make a new `.aab` (with the **same** signing key and a higher version code) if you change the app name,
icon or colours.
