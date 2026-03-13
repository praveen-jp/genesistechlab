# Genesis Tech Lab — Setup Guide

## 🚀 Quick Start

### 1. Firebase Setup (Required)

This website uses Firebase for authentication and database. Follow these steps:

#### A. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Name it **"genesis-tech-lab"**
4. Follow the setup wizard

#### B. Enable Authentication
1. In Firebase Console → **Authentication** → **Get Started**
2. Enable **Email/Password** provider
3. Add your admin account: Authentication → Users → **Add User**
   - Email: `admin@genesistechlab.com`
   - Set a strong password

#### C. Create Firestore Database
1. Firebase Console → **Firestore Database** → **Create Database**
2. Choose **Production mode**
3. Select your region
4. Go to **Rules** tab and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions: readable by authenticated users, writable by admin only
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email in ['admin@genesistechlab.com'];
    }
  }
}
```

#### D. Get Your Firebase Config
1. Firebase Console → Project Settings (gear icon) → **Your Apps**
2. Click **"Web"** icon (`</>`)
3. Register app name as "genesis-tech-lab-web"
4. Copy the `firebaseConfig` object

#### E. Update the Config
Open `js/firebase-config.js` and replace with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

### 2. Update Admin Email

In these files, update the `ADMIN_EMAILS` array with your actual admin email:

- `admin/admin-login.html` → `const ADMIN_EMAILS = ["your-admin@email.com"]`
- `admin/dashboard.html` → `const ADMIN_EMAILS = ["your-admin@email.com"]`

---

### 3. Update Contact Links

Search for `your-whatsapp-number` throughout the HTML files and replace with your actual WhatsApp number:
- Format: `https://wa.me/1234567890` (include country code, no spaces or +)

Update social media links:
- YouTube: `https://youtube.com/@yourchannel`
- Instagram: `https://instagram.com/yourhandle`
- LinkedIn: `https://linkedin.com/company/yourcompany`

Update email: `hello@genesistechlab.com` → your actual email

---

### 4. Deploy the Website

#### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Option B: Vercel
1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Deploy in one click

#### Option C: Netlify
1. Drag and drop the `genesis-tech-lab` folder to [Netlify](https://netlify.com)

---

## 📂 File Structure

```
genesis-tech-lab/
├── index.html          ← Home page
├── about.html          ← About page
├── sessions.html       ← Sessions (protected)
├── resources.html      ← Resources
├── community.html      ← Community
├── contact.html        ← Contact
├── login.html          ← Member login
├── admin/
│   ├── admin-login.html  ← Admin login (/admin-login)
│   └── dashboard.html    ← Admin dashboard
├── css/
│   └── styles.css       ← All styles
└── js/
    ├── firebase-config.js  ← Firebase credentials
    ├── auth.js             ← Auth utilities
    ├── sessions.js         ← Sessions module
    └── main.js             ← Global utilities
```

---

## 🔐 Security Notes

- The admin login page is at `/admin/admin-login.html` — NOT linked from main nav
- Only emails in `ADMIN_EMAILS` array can access the dashboard
- Firestore security rules enforce server-side access control
- Members can only READ sessions — not edit, delete, or modify

## ➕ Adding Members

1. Go to Firebase Console → Authentication → Users → Add User
2. Enter member's email and a password
3. Share credentials with the member
4. They can log in at `/login.html`

## ➕ Adding Sessions (Admin)

1. Go to `/admin/admin-login.html`
2. Log in with admin credentials
3. Click **+ Add Session**
4. Fill in details and save
5. Session immediately appears on the Sessions page

---

## 🎨 Customization

- **Colors**: Edit CSS variables in `css/styles.css` under `:root`
- **Logo**: Replace the `GTL` text in nav-logo-mark with an actual `<img>` tag
- **Content**: Edit text directly in HTML files
- **Social Links**: Update `href` values throughout HTML files
