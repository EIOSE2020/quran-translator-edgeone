// js/auth.js
// ============================================
// SYSTÈME D'AUTHENTIFICATION
// ============================================

const AUTH_KEY = 'quran_user';
const PREMIUM_KEY = 'isPremium';

// Utilisateurs simulés
const USERS = [
    { email: 'test@example.com', password: 'password123', name: 'Test User' },
    { email: 'admin@coran.com', password: 'admin123', name: 'Administrateur' }
];

function registerUser(email, password, name) {
    const existing = USERS.find(u => u.email === email);
    if (existing) return { success: false, message: 'Cet email est déjà utilisé.' };
    USERS.push({ email, password, name });
    return { success: true, message: 'Inscription réussie !' };
}

function loginUser(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Email ou mot de passe incorrect.' };
    const session = { email: user.email, name: user.name, isPremium: localStorage.getItem(PREMIUM_KEY) === 'true', loggedIn: true, timestamp: Date.now() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, message: 'Connexion réussie !', user: session };
}

function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    updateAuthUI();
    window.location.href = 'index.html';
}

function getCurrentUser() {
    try {
        const data = localStorage.getItem(AUTH_KEY);
        if (!data) return null;
        const session = JSON.parse(data);
        if (Date.now() - session.timestamp > 86400000) { localStorage.removeItem(AUTH_KEY); return null; }
        return session;
    } catch (e) { return null; }
}

function isLoggedIn() { return getCurrentUser() !== null; }
function isPremium() { return localStorage.getItem(PREMIUM_KEY) === 'true'; }
function setPremium(status) { localStorage.setItem(PREMIUM_KEY, status ? 'true' : 'false'); updateAuthUI(); }

function updateAuthUI() {
    const user = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    document.querySelectorAll('.auth-dynamic').forEach(el => el.remove());
    if (user) {
        const li = document.createElement('li');
        li.className = 'auth-dynamic';
        li.innerHTML = '<span class="nav-link" style="color:#2ecc71;"> ' + (user.name || user.email) + (user.isPremium ? ' ' : '') + '</span><a href="#" class="nav-link" onclick="logoutUser()" style="color:#e74c3c;"> Déconnexion</a>';
        navMenu.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.className = 'auth-dynamic';
        li.innerHTML = '<a href="login.html" class="nav-link"> Connexion</a><a href="register.html" class="nav-link btn-register"> Inscription</a>';
        navMenu.appendChild(li);
    }
}

function requireAuth() {
    if (!isLoggedIn()) { alert(' Veuillez vous connecter.'); window.location.href = 'login.html'; return false; }
    return true;
}

function requirePremium() {
    if (!requireAuth()) return false;
    if (!isPremium()) { alert(' Réservé aux membres Premium.'); window.location.href = 'premium.html'; return false; }
    return true;
}

document.addEventListener('DOMContentLoaded', updateAuthUI);

window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isPremium = isPremium;
window.setPremium = setPremium;
window.requireAuth = requireAuth;
window.requirePremium = requirePremium;
window.updateAuthUI = updateAuthUI;
