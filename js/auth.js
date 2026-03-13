// =============================================
// Genesis Tech Lab - Authentication Module
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =============================================
// ADMIN EMAILS - configure your admin accounts
// =============================================
const ADMIN_EMAILS = [
  "admin@genesistechlab.com"
  // Add more admin emails here
];

// =============================================
// AUTH STATE HELPER
// =============================================
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function isAdminUser(email) {
  return ADMIN_EMAILS.includes(email);
}

// =============================================
// PROTECT MEMBER PAGES
// Redirect to login if not authenticated
// =============================================
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    showAuthGate();
    return null;
  }
  return user;
}

// =============================================
// PROTECT ADMIN PAGES
// =============================================
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "/admin/admin-login.html";
    return null;
  }
  if (!isAdminUser(user.email)) {
    window.location.href = "/index.html";
    return null;
  }
  return user;
}

// =============================================
// SHOW AUTH GATE (for protected pages)
// =============================================
function showAuthGate() {
  const main = document.getElementById("page-content");
  if (main) {
    main.innerHTML = `
      <div class="auth-gate">
        <div class="auth-gate-card">
          <div class="auth-gate-icon">🔒</div>
          <h2 class="auth-gate-title">Members Only</h2>
          <p class="auth-gate-text">
            This platform is only accessible for Genesis Tech Lab members.
            Please login to continue.
          </p>
          <a href="/login.html" class="btn btn-primary" style="width:100%;justify-content:center;">
            Login to Continue
          </a>
          <p style="margin-top:16px;font-size:12px;color:var(--text-muted);">
            Not a member? <a href="https://wa.me/your-whatsapp-number" style="color:var(--accent);">Join our WhatsApp community</a>
          </p>
        </div>
      </div>`;
    // Hide loader
    const loader = document.getElementById("page-loader");
    if (loader) loader.classList.add("hidden");
  } else {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
}

// =============================================
// LOGIN FUNCTION
// =============================================
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let message = "Invalid email or password.";
    switch (error.code) {
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/user-not-found":
        message = "No account found with this email address.";
        break;
      case "auth/wrong-password":
        message = "Invalid email or password.";
        break;
      case "auth/too-many-requests":
        message = "Too many failed attempts. Please try again later.";
        break;
      case "auth/user-disabled":
        message = "This account has been disabled. Please contact admin.";
        break;
    }
    return { success: false, message };
  }
}

// =============================================
// LOGOUT FUNCTION
// =============================================
async function logoutUser() {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// =============================================
// UPDATE NAVBAR BASED ON AUTH STATE
// =============================================
function updateNavAuth(user) {
  const loginBtn = document.getElementById("nav-login-btn");
  const userChip = document.getElementById("nav-user-chip");
  const userNameEl = document.getElementById("nav-user-name");
  const userAvatarEl = document.getElementById("nav-user-avatar");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userChip) {
      userChip.style.display = "flex";
      const name = user.displayName || user.email.split("@")[0];
      if (userNameEl) userNameEl.textContent = name;
      if (userAvatarEl) userAvatarEl.textContent = name.charAt(0).toUpperCase();
    }
  } else {
    if (loginBtn) loginBtn.style.display = "";
    if (userChip) userChip.style.display = "none";
  }
}

// =============================================
// EXPORTS
// =============================================
export {
  auth, db,
  getCurrentUser, isAdminUser,
  requireAuth, requireAdmin,
  loginUser, logoutUser,
  updateNavAuth, onAuthStateChanged
};
