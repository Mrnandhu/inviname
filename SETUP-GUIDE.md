# Inviname Arts — setup & launch guide

Everything is free (Firebase Spark plan + Cloudinary free plan). Do the steps in order.

## 1. Put the new files in your project

```bash
cd ~/vrlss/inviname
npm install qrcode
unzip -o ~/Downloads/inviname-complete.zip -d .
npm run dev -- --host
```

`src/firebase/config.js` is NOT in the zip, so your Firebase settings stay as they are.

## 2. Publish the new security rules (important — orders won't work without this)

1. Open `firestore.rules` in VS Code, select all (Ctrl+A), copy (Ctrl+C).
2. Firebase Console → Firestore → **Rules** tab → select all, delete, paste → **Publish**.

## 3. Start order numbers

Open `http://localhost:5173/admin/setup` → click **Start order numbers at INV-1001**.

## 4. Your shop settings

`/admin/settings`:
- **UPI ID** (e.g. `yourname@okaxis`) and the name shown in UPI apps — customers pay to this. Double-check it.
- **Blood-sample mailing address** (only shown to customers after a blood-art order).
- Email, Instagram link (optional).

Click **Save settings**.

## 5. Photo uploads (Cloudinary, free) — for product photos and customers' custom-order photos

1. Sign up at **cloudinary.com** (free plan).
2. On the Dashboard, copy your **Cloud name**.
3. **Settings (gear) → Upload → Upload presets → Add upload preset**:
   - Signing mode: **Unsigned**
   - Folder: `inviname`
   - (Recommended) Allowed formats: `jpg, png, webp` · Max file size: 15 MB
   - Save, then copy the **preset name**.
4. `/admin/settings` → **Photos**: paste the cloud name and preset name → **Save settings**.

Until this is done, customers are asked to send their photo on WhatsApp, and in the admin you can paste photo links.

## 6. Test everything once

1. Log out, create a test customer account, place an order and type any 12 digits in the UTR box (no real payment needed for the test).
2. Log in as admin → **Dashboard** shows “Payments to check” → **Orders** → open it → check the amount box says “Amounts check ✓” → **Money received – mark verified** (only after you see the money in your bank app in real life!).
3. When done, delete the test orders in Firebase Console → Firestore → `orders`, and set `counters → orders → next` back to `1001` so real orders start at INV-1001.

## 7. Before launch

- **Admin → Products**: replace the sample products and photos with your real ones (or edit them).
- **Admin → Website → Policies**: read and adjust the draft policies.
- **Admin → Website**: check all texts.

## 8. Put the site online (Firebase Hosting, free)

```bash
cd ~/vrlss/inviname
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting,firestore:rules
```

The site is then live at `https://inviname-b7b7d.web.app`.

## 9. Connect inviname.in

1. Firebase Console → **Hosting** → **Add custom domain** → `inviname.in` → follow the steps. It shows DNS records (a **TXT** record to prove ownership, then **A** records).
2. Add those records at the company where you bought the domain (DNS settings). It can take a few hours.
3. Add `www.inviname.in` too and choose “Redirect to inviname.in”.
4. Firebase Console → **Authentication → Settings → Authorized domains** → add `inviname.in` and `www.inviname.in` (otherwise Google login won't work there).

## Every time you change the code later

```bash
npm run build
npx firebase-tools deploy --only hosting
```

Changes made in the **admin panel** (products, prices, photos, texts, settings) are live immediately — no deploy needed.
