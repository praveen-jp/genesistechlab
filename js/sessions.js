// =============================================
// Genesis Tech Lab - Sessions Module
// =============================================

import { db } from "./auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const SESSIONS_COLLECTION = "sessions";

// =============================================
// FETCH ALL SESSIONS (ordered by session number)
// =============================================
async function fetchSessions() {
  try {
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      orderBy("sessionNumber", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

// =============================================
// ADD A NEW SESSION (admin only)
// =============================================
async function addSession(sessionData) {
  try {
    const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding session:", error);
    return { success: false, message: error.message };
  }
}

// =============================================
// UPDATE A SESSION (admin only)
// =============================================
async function updateSession(sessionId, sessionData) {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      ...sessionData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating session:", error);
    return { success: false, message: error.message };
  }
}

// =============================================
// DELETE A SESSION (admin only)
// =============================================
async function deleteSession(sessionId) {
  try {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { success: false, message: error.message };
  }
}

// =============================================
// RENDER SESSION CARDS (for members page)
// =============================================
function renderSessionCards(sessions, container) {
  if (!container) return;
  container.innerHTML = "";

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="sessions-empty" style="grid-column:1/-1">
        <div class="sessions-empty-icon">📚</div>
        <p style="font-size:16px;font-weight:600;color:#fff;margin-bottom:8px;">No sessions yet</p>
        <p style="font-size:14px;">Sessions will appear here once they are published.</p>
      </div>`;
    return;
  }

  sessions.forEach((session, i) => {
    const card = document.createElement("div");
    card.className = "session-card fade-up";
    card.style.transitionDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="session-num">Session ${session.sessionNumber || (i + 1)}</div>
      <h3 class="session-title">${escapeHtml(session.title || "Untitled Session")}</h3>
      <p class="session-desc">${escapeHtml(session.description || "")}</p>
      <div class="session-actions">
        ${session.videoLink ? `
          <a href="${escapeHtml(session.videoLink)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
            ▶ Watch Recording
          </a>` : ""}
        ${session.notesLink ? `
          <a href="${escapeHtml(session.notesLink)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            📄 Read Notes
          </a>` : ""}
        ${session.resourcesLink ? `
          <a href="${escapeHtml(session.resourcesLink)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            🔗 Resources
          </a>` : ""}
      </div>`;
    container.appendChild(card);

    // Trigger animation
    setTimeout(() => {
      card.classList.add("visible");
    }, 100 + i * 60);
  });
}

// =============================================
// RENDER SESSION TABLE (for admin)
// =============================================
function renderSessionsTable(sessions, tbody, onEdit, onDelete) {
  if (!tbody) return;
  tbody.innerHTML = "";

  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No sessions yet. Add your first session above.</td></tr>`;
    return;
  }

  sessions.forEach(session => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge badge-blue">#${session.sessionNumber || "?"}</span></td>
      <td style="font-weight:500">${escapeHtml(session.title || "Untitled")}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(session.description || "")}</td>
      <td>${session.videoLink ? `<a href="${escapeHtml(session.videoLink)}" target="_blank" style="color:var(--accent);font-size:12px">Link ↗</a>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>${session.notesLink ? `<a href="${escapeHtml(session.notesLink)}" target="_blank" style="color:var(--accent);font-size:12px">Link ↗</a>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm edit-btn" data-id="${session.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${session.id}">Delete</button>
        </div>
      </td>`;

    tr.querySelector(".edit-btn").addEventListener("click", () => onEdit(session));
    tr.querySelector(".delete-btn").addEventListener("click", () => onDelete(session.id, session.title));
    tbody.appendChild(tr);
  });
}

// Helper
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

export { fetchSessions, addSession, updateSession, deleteSession, renderSessionCards, renderSessionsTable };
