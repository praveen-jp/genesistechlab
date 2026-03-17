// =============================================
// Genesis Tech Lab — Profile & Account Module
// =============================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  updateProfile, updateEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
  sendPasswordResetEmail, verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Avatar color palette
const AVATAR_COLORS = [
  "#5B7FFF","#7c5cfc","#22c55e","#f59e0b",
  "#ef4444","#06b6d4","#ec4899","#8b5cf6",
  "#14b8a6","#f97316"
];

let currentAvatarColor = localStorage.getItem("gtl_avatar_color") || AVATAR_COLORS[0];

// =============================================
// INJECT MODAL HTML INTO PAGE
// =============================================
function injectAccountModal() {
  const html = `
  <div class="account-modal-overlay" id="account-modal-overlay">
    <div class="account-modal">
      <div class="account-modal-header">
        <h3>Account Settings</h3>
        <button class="modal-close-btn" id="close-account-modal">✕</button>
      </div>

      <div class="account-tabs">
        <button class="account-tab active" data-tab="profile">Profile</button>
        <button class="account-tab" data-tab="security">Security</button>
        <button class="account-tab" data-tab="account">Account</button>
      </div>

      <!-- PROFILE TAB -->
      <div class="account-tab-panel active" id="tab-profile">
        <div id="profile-alert" class="modal-alert"></div>

        <div class="avatar-preview-wrap">
          <div class="avatar-preview-large" id="avatar-preview-large">U</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:#fff" id="preview-name">Member</div>
            <div style="font-size:12px;color:var(--text-muted)" id="preview-email">—</div>
            <div class="color-swatches" id="color-swatches"></div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input type="text" id="profile-name-input" class="form-input" placeholder="Your full name" />
        </div>

        <div class="form-group">
          <label class="form-label">Profile Photo URL <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
          <input type="url" id="profile-photo-input" class="form-input" placeholder="https://example.com/photo.jpg" />
          <div style="font-size:11px;color:var(--text-muted);margin-top:5px">Paste a direct image URL, or leave blank to use your initials avatar.</div>
        </div>

        <button class="btn btn-primary" id="save-profile-btn" style="width:100%;justify-content:center">
          Save Profile
        </button>
      </div>

      <!-- SECURITY TAB -->
      <div class="account-tab-panel" id="tab-security">
        <div id="security-alert" class="modal-alert"></div>

        <!-- Change Password -->
        <div class="security-item">
          <div class="security-item-header">
            <div class="security-item-icon">🔑</div>
            <div>
              <div class="security-item-title">Change Password</div>
              <div class="security-item-desc">Requires your current password</div>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label" style="font-size:12px">Current Password</label>
            <input type="password" id="current-pw" class="form-input" style="padding:10px 14px" placeholder="Enter current password" />
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label" style="font-size:12px">New Password</label>
            <input type="password" id="new-pw" class="form-input" style="padding:10px 14px" placeholder="Min. 8 characters" />
          </div>
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" style="font-size:12px">Confirm New Password</label>
            <input type="password" id="confirm-pw" class="form-input" style="padding:10px 14px" placeholder="Repeat new password" />
          </div>
          <div id="pw-strength-bar" style="height:4px;border-radius:2px;background:rgba(255,255,255,0.08);margin-bottom:12px;overflow:hidden">
            <div id="pw-strength-fill" style="height:100%;width:0;border-radius:2px;transition:all 0.3s"></div>
          </div>
          <div id="pw-strength-label" style="font-size:11px;color:var(--text-muted);margin-bottom:12px"></div>
          <button class="btn btn-primary btn-sm" id="change-pw-btn" style="width:100%;justify-content:center">Update Password</button>
        </div>

        <!-- Reset Password Email -->
        <div class="security-item">
          <div class="security-item-header">
            <div class="security-item-icon">📧</div>
            <div>
              <div class="security-item-title">Forgot / Reset Password</div>
              <div class="security-item-desc">Send a reset link to your email</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" id="send-reset-btn" style="width:100%;justify-content:center">Send Reset Email</button>
        </div>
      </div>

      <!-- ACCOUNT TAB -->
      <div class="account-tab-panel" id="tab-account">
        <div id="account-alert" class="modal-alert"></div>

        <!-- Change Email -->
        <div class="security-item">
          <div class="security-item-header">
            <div class="security-item-icon">✉️</div>
            <div>
              <div class="security-item-title">Change Email Address</div>
              <div class="security-item-desc">A verification link will be sent to the new email</div>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label" style="font-size:12px">New Email Address</label>
            <input type="email" id="new-email-input" class="form-input" style="padding:10px 14px" placeholder="new@example.com" />
          </div>
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" style="font-size:12px">Current Password (required)</label>
            <input type="password" id="email-change-pw" class="form-input" style="padding:10px 14px" placeholder="Confirm your password" />
          </div>
          <button class="btn btn-primary btn-sm" id="change-email-btn" style="width:100%;justify-content:center">Update Email</button>
        </div>

        <!-- Account Info -->
        <div class="security-item" style="margin-top:0">
          <div class="security-item-header" style="margin-bottom:8px">
            <div class="security-item-icon">ℹ️</div>
            <div>
              <div class="security-item-title">Account Info</div>
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-muted);line-height:1.8">
            <div>Member ID: <span id="info-uid" style="color:var(--text-main);font-family:monospace;font-size:11px"></span></div>
            <div>Joined: <span id="info-joined" style="color:var(--text-main)"></span></div>
            <div>Last Sign-In: <span id="info-last-login" style="color:var(--text-main)"></span></div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div style="margin-top:12px;padding:16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:12px">
          <div style="font-size:12px;font-weight:700;color:#f87171;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Danger Zone</div>
          <button class="btn btn-sm" id="sign-out-from-modal"
            style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);width:100%;justify-content:center">
            🚪 Sign Out of This Device
          </button>
        </div>
      </div>

    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", html);
}

// =============================================
// BUILD DROPDOWN HTML
// =============================================
function buildDropdown(user) {
  const name = user.displayName || user.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();
  const photoURL = user.photoURL;

  const avatarHtml = photoURL
    ? `<img src="${photoURL}" class="dropdown-avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="dropdown-avatar-initials" style="background:${currentAvatarColor};display:none">${initial}</div>`
    : `<div class="dropdown-avatar-initials" style="background:${currentAvatarColor}">${initial}</div>`;

  return `
    <div class="dropdown-header">
      ${avatarHtml}
      <div style="overflow:hidden">
        <div class="dropdown-user-name">${name}</div>
        <div class="dropdown-user-email">${user.email}</div>
      </div>
    </div>
    <div class="dropdown-section">
      <button class="dropdown-item" id="dd-edit-profile">
        <span class="dropdown-item-icon">✏️</span> Edit Profile
      </button>
      <button class="dropdown-item" id="dd-security">
        <span class="dropdown-item-icon">🔒</span> Account Security
      </button>
      <button class="dropdown-item" id="dd-account">
        <span class="dropdown-item-icon">⚙️</span> Account Settings
      </button>
    </div>
    <div class="dropdown-section">
      <a href="sessions.html" class="dropdown-item">
        <span class="dropdown-item-icon">🎬</span> My Sessions
      </a>
      <a href="resources.html" class="dropdown-item">
        <span class="dropdown-item-icon">📚</span> Resources
      </a>
    </div>
    <div class="dropdown-section">
      <button class="dropdown-item danger" id="dd-signout">
        <span class="dropdown-item-icon" style="background:rgba(239,68,68,0.1)">🚪</span> Sign Out
      </button>
    </div>`;
}

// =============================================
// UPDATE NAVBAR AVATAR
// =============================================
function updateNavbarAvatar(user) {
  const chip = document.getElementById("nav-user-chip");
  const avatar = document.getElementById("nav-user-avatar");
  const uname = document.getElementById("nav-user-name");
  const loginBtn = document.getElementById("nav-login-btn");

  if (!user) {
    if (chip) chip.style.display = "none";
    if (loginBtn) loginBtn.style.display = "";
    return;
  }

  const name = user.displayName || user.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();

  if (loginBtn) loginBtn.style.display = "none";
  if (chip) chip.style.display = "flex";
  if (uname) uname.textContent = name;

  if (avatar) {
    if (user.photoURL) {
      avatar.innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.parentElement.textContent='${initial}'" />`;
    } else {
      avatar.style.background = currentAvatarColor;
      avatar.textContent = initial;
    }
  }
}

// =============================================
// POPULATE MODAL WITH USER DATA
// =============================================
function populateModal(user) {
  const name = user.displayName || user.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();

  // Profile tab
  const input = document.getElementById("profile-name-input");
  if (input) input.value = user.displayName || "";

  const photoInput = document.getElementById("profile-photo-input");
  if (photoInput) photoInput.value = user.photoURL || "";

  const previewName = document.getElementById("preview-name");
  if (previewName) previewName.textContent = name;

  const previewEmail = document.getElementById("preview-email");
  if (previewEmail) previewEmail.textContent = user.email;

  // Avatar preview
  updateAvatarPreview(user);

  // Build color swatches
  const swatchWrap = document.getElementById("color-swatches");
  if (swatchWrap) {
    swatchWrap.innerHTML = "";
    AVATAR_COLORS.forEach(color => {
      const sw = document.createElement("div");
      sw.className = "color-swatch" + (color === currentAvatarColor ? " selected" : "");
      sw.style.background = color;
      sw.title = color;
      sw.addEventListener("click", () => {
        currentAvatarColor = color;
        localStorage.setItem("gtl_avatar_color", color);
        swatchWrap.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
        sw.classList.add("selected");
        updateAvatarPreview(user);
        updateNavbarAvatar(auth.currentUser);
      });
      swatchWrap.appendChild(sw);
    });
  }

  // Account info tab
  const uidEl = document.getElementById("info-uid");
  if (uidEl) uidEl.textContent = user.uid.slice(0, 16) + "...";

  const joinedEl = document.getElementById("info-joined");
  if (joinedEl && user.metadata?.creationTime) {
    joinedEl.textContent = new Date(user.metadata.creationTime).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  }

  const lastLoginEl = document.getElementById("info-last-login");
  if (lastLoginEl && user.metadata?.lastSignInTime) {
    lastLoginEl.textContent = new Date(user.metadata.lastSignInTime).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  }
}

function updateAvatarPreview(user) {
  const preview = document.getElementById("avatar-preview-large");
  if (!preview) return;
  const name = user.displayName || user.email.split("@")[0];
  const photoURL = document.getElementById("profile-photo-input")?.value.trim() || user.photoURL;
  if (photoURL) {
    preview.innerHTML = `<img src="${photoURL}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.background='${currentAvatarColor}';this.parentElement.textContent='${name.charAt(0).toUpperCase()}'" />`;
  } else {
    preview.style.background = currentAvatarColor;
    preview.textContent = name.charAt(0).toUpperCase();
  }
}

// =============================================
// OPEN MODAL TO SPECIFIC TAB
// =============================================
function openAccountModal(tab = "profile") {
  const overlay = document.getElementById("account-modal-overlay");
  if (!overlay) return;
  overlay.classList.add("open");
  document.querySelectorAll(".account-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  document.querySelectorAll(".account-tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${tab}`));
  clearAlerts();
}

function closeAccountModal() {
  document.getElementById("account-modal-overlay")?.classList.remove("open");
}

function clearAlerts() {
  ["profile-alert","security-alert","account-alert"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = "modal-alert"; el.textContent = ""; }
  });
}

function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `modal-alert ${type}`;
  el.textContent = (type === "success" ? "✓ " : "⚠ ") + msg;
}

// =============================================
// PASSWORD STRENGTH
// =============================================
function checkStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { color: "#ef4444", label: "Very Weak", pct: "20%" },
    { color: "#f97316", label: "Weak", pct: "40%" },
    { color: "#f59e0b", label: "Fair", pct: "60%" },
    { color: "#22c55e", label: "Strong", pct: "80%" },
    { color: "#16a34a", label: "Very Strong", pct: "100%" },
  ];
  return map[Math.min(score, 4)];
}

// =============================================
// BIND ALL MODAL EVENTS
// =============================================
function bindEvents() {
  // Close modal
  document.getElementById("close-account-modal")?.addEventListener("click", closeAccountModal);
  document.getElementById("account-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "account-modal-overlay") closeAccountModal();
  });

  // Tabs
  document.querySelectorAll(".account-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".account-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".account-tab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add("active");
      clearAlerts();
    });
  });

  // Photo URL preview
  document.getElementById("profile-photo-input")?.addEventListener("input", () => {
    updateAvatarPreview(auth.currentUser);
  });

  // Name preview live
  document.getElementById("profile-name-input")?.addEventListener("input", (e) => {
    const n = e.target.value || auth.currentUser?.email?.split("@")[0] || "U";
    const prev = document.getElementById("preview-name");
    if (prev) prev.textContent = n;
    const preview = document.getElementById("avatar-preview-large");
    if (preview && !auth.currentUser?.photoURL && !document.getElementById("profile-photo-input")?.value) {
      preview.textContent = n.charAt(0).toUpperCase();
    }
  });

  // Password strength indicator
  document.getElementById("new-pw")?.addEventListener("input", (e) => {
    const val = e.target.value;
    const fill = document.getElementById("pw-strength-fill");
    const label = document.getElementById("pw-strength-label");
    if (!val) { fill.style.width = "0"; label.textContent = ""; return; }
    const s = checkStrength(val);
    fill.style.width = s.pct;
    fill.style.background = s.color;
    label.textContent = `Password strength: ${s.label}`;
    label.style.color = s.color;
  });

  // Save profile
  document.getElementById("save-profile-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("save-profile-btn");
    const newName = document.getElementById("profile-name-input").value.trim();
    const newPhoto = document.getElementById("profile-photo-input").value.trim();
    if (!newName) { showAlert("profile-alert", "error", "Display name cannot be empty."); return; }
    btn.disabled = true; btn.textContent = "Saving...";
    try {
      await updateProfile(auth.currentUser, { displayName: newName, photoURL: newPhoto || null });
      updateNavbarAvatar(auth.currentUser);
      populateModal(auth.currentUser);
      showAlert("profile-alert", "success", "Profile updated successfully!");
    } catch (e) {
      showAlert("profile-alert", "error", e.message);
    }
    btn.disabled = false; btn.textContent = "Save Profile";
  });

  // Change password
  document.getElementById("change-pw-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("change-pw-btn");
    const curPw = document.getElementById("current-pw").value;
    const newPw = document.getElementById("new-pw").value;
    const confirmPw = document.getElementById("confirm-pw").value;
    if (!curPw || !newPw || !confirmPw) { showAlert("security-alert", "error", "Please fill in all fields."); return; }
    if (newPw.length < 8) { showAlert("security-alert", "error", "New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { showAlert("security-alert", "error", "New passwords do not match."); return; }
    btn.disabled = true; btn.textContent = "Updating...";
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, curPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      document.getElementById("current-pw").value = "";
      document.getElementById("new-pw").value = "";
      document.getElementById("confirm-pw").value = "";
      document.getElementById("pw-strength-fill").style.width = "0";
      document.getElementById("pw-strength-label").textContent = "";
      showAlert("security-alert", "success", "Password updated successfully!");
    } catch (e) {
      const msg = e.code === "auth/wrong-password" ? "Current password is incorrect." : e.message;
      showAlert("security-alert", "error", msg);
    }
    btn.disabled = false; btn.textContent = "Update Password";
  });

  // Send reset email
  document.getElementById("send-reset-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("send-reset-btn");
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      showAlert("security-alert", "success", `Reset email sent to ${auth.currentUser.email}`);
    } catch (e) {
      showAlert("security-alert", "error", e.message);
    }
    btn.disabled = false; btn.textContent = "Send Reset Email";
  });

  // Change email
  document.getElementById("change-email-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("change-email-btn");
    const newEmail = document.getElementById("new-email-input").value.trim();
    const pw = document.getElementById("email-change-pw").value;
    if (!newEmail || !pw) { showAlert("account-alert", "error", "Please fill in both fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { showAlert("account-alert", "error", "Please enter a valid email address."); return; }
    btn.disabled = true; btn.textContent = "Updating...";
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, pw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      document.getElementById("new-email-input").value = "";
      document.getElementById("email-change-pw").value = "";
      showAlert("account-alert", "success", `Verification link sent to ${newEmail}. Email updates after verification.`);
    } catch (e) {
      const msg = e.code === "auth/wrong-password" ? "Password is incorrect." :
                  e.code === "auth/email-already-in-use" ? "This email is already in use." : e.message;
      showAlert("account-alert", "error", msg);
    }
    btn.disabled = false; btn.textContent = "Update Email";
  });

  // Sign out from modal
  document.getElementById("sign-out-from-modal")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
}

// =============================================
// MAIN INIT
// =============================================
export function initProfile() {
  injectAccountModal();

  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    currentAvatarColor = localStorage.getItem("gtl_avatar_color") || AVATAR_COLORS[0];
    updateNavbarAvatar(user);
    populateModal(user);
    bindEvents();

    // Build dropdown content
    const chip = document.getElementById("nav-user-chip");
    const dropdown = document.getElementById("profile-dropdown");
    if (dropdown) dropdown.innerHTML = buildDropdown(user);

    // Three-dots toggle
    document.getElementById("nav-menu-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown?.classList.toggle("open");
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!chip?.contains(e.target)) dropdown?.classList.remove("open");
    });

    // Dropdown action buttons
    document.getElementById("dd-edit-profile")?.addEventListener("click", () => { dropdown.classList.remove("open"); openAccountModal("profile"); });
    document.getElementById("dd-security")?.addEventListener("click", () => { dropdown.classList.remove("open"); openAccountModal("security"); });
    document.getElementById("dd-account")?.addEventListener("click", () => { dropdown.classList.remove("open"); openAccountModal("account"); });
    document.getElementById("dd-signout")?.addEventListener("click", async () => { await signOut(auth); window.location.href = "/login.html"; });
  });
}
