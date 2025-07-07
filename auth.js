import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Force logout flag on every page load
if (localStorage.getItem('forceLogout') === 'true') {
  localStorage.removeItem('forceLogout');
  signOut(auth).then(() => {
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
  });
}

// LOGIN
if (window.location.pathname.includes("login.html")) {
  const loginForm = document.getElementById('aesthetic-auth-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('aesthetic-auth-email').value;
    const password = document.getElementById('aesthetic-auth-password').value;
    const role = document.getElementById('role-select').value;
    const errorDisplay = document.getElementById('aesthetic-auth-error');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });

      if (role === 'Admin') {
        window.location.href = 'admin.html';
      } else if (role === 'Service Provider') {
        if (email === "ahinsahnana7@gmail.com") {
          window.location.href = 'service-provider.html';
        } else {
          alert("Access denied: Only specific service providers are allowed.");
          return;
        }
      } else {
        window.location.href = 'index.html';
      }
    } catch (error) {
      errorDisplay.style.display = 'block';
      errorDisplay.textContent = error.message;
    }
  });
}

// SIGNUP
if (window.location.pathname.includes("signup.html")) {
  const signupForm = document.getElementById('aesthetic-auth-form');
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('aesthetic-auth-username').value;
    const email = document.getElementById('aesthetic-auth-email').value;
    const password = document.getElementById('aesthetic-auth-password').value;
    const role = document.getElementById('role-select').value;
    const errorDisplay = document.getElementById('aesthetic-auth-error');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        role,
        createdAt: new Date()
      });

      window.location.href = 'login.html';
    } catch (error) {
      errorDisplay.style.display = 'block';
      errorDisplay.textContent = error.message;
    }
  });
}

// RESET PASSWORD
if (window.location.pathname.includes("reset-password.html")) {
  const resetForm = document.getElementById('reset-password-form');
  resetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    const messageDisplay = document.getElementById('reset-message');
    const errorDisplay = document.getElementById('reset-error');

    try {
      await sendPasswordResetEmail(auth, email);
      messageDisplay.textContent = "Reset link sent! Check your email.";
      errorDisplay.textContent = "";
    } catch (error) {
      errorDisplay.textContent = error.message;
      messageDisplay.textContent = "";
    }
  });
}

// LOGOUT
window.logout = async function () {
  try {
    localStorage.setItem('forceLogout', 'true');
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    alert('Logout error: ' + error.message);
  }
};

// AUTH STATE MONITOR
onAuthStateChanged(auth, async (user) => {
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  const dashboardBtn = document.getElementById('dashboard-btn');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      const role = data?.role || 'User';

      if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';
      if (userInfo) userInfo.textContent = `Welcome, ${data?.username || user.email}`;

      document.querySelectorAll('.role-only').forEach(el => {
        const allowedRole = el.getAttribute('data-role');
        el.style.display = allowedRole === role ? 'block' : 'none';
      });

      const path = window.location.pathname;
      if (path.includes('login.html') || path.includes('signup.html')) {
        if (role === 'Admin') {
          window.location.href = 'admin.html';
        } else if (role === 'Service Provider' && user.email === "ahinsahnana7@gmail.com") {
          window.location.href = 'service-provider.html';
        } else {
          window.location.href = 'index.html';
        }
      }

    } catch (error) {
      console.error('Error getting user role:', error.message);
    }

  } else {
    if (dashboardBtn) dashboardBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (userInfo) userInfo.textContent = '';

    const restrictedPages = ['dashboard.html', 'admin.html', 'service-provider.html'];
    const currentPath = window.location.pathname;

    if (restrictedPages.some(page => currentPath.includes(page))) {
      window.location.href = 'login.html';
    }
  }
});
