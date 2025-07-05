// auth.js
import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

      // Store or update the role
      await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });

      // Redirect based on role
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

// LOGOUT
window.logout = async function () {
  try {
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

  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.data();
    const role = data?.role || 'student';

    if (userInfo) {
      userInfo.textContent = `Welcome, ${data?.username || user.email}`;
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    // Redirect if already logged in and visiting login/signup
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
      if (role === 'Admin') {
        window.location.href = 'admin.html';
      } else if (role === 'Service Provider' && user.email === "ahinsahnana7@gmail.com") {
        window.location.href = 'service-provider.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  } else {
    if (userInfo) userInfo.textContent = '';
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Protect private pages
    const path = window.location.pathname;
    const restrictedPages = ['index.html', 'admin.html', 'dashboard.html', 'service-provider.html'];
    if (restrictedPages.some(p => path.includes(p))) {
      window.location.href = 'login.html';
    }
  }
});
