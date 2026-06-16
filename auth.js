const SUPABASE_URL = "https://vavtzjyvvlrawmrxynyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_X9hkxSJb2UxZMegAihw17w_V5NqXDnb";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

window.supabaseClient = supabaseClient;

let authMode = "login";
const AUTH_USUARIO_PENDIENTE_PREFIX = "muyAlimentado:usuarioPendiente";

function setAuthMessage(message, type) {
  const messageElement = document.getElementById("auth-message");
  if (!messageElement) return;

  messageElement.textContent = message || "";
  messageElement.className = `auth-message ${type || ""}`.trim();
}

function setAuthLoading(isLoading) {
  const submitButton = document.getElementById("auth-submit");
  if (!submitButton) return;

  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading
    ? "Procesando..."
    : authMode === "login"
      ? "Entrar"
      : "Crear cuenta";
}

function obtenerUsuarioAuth() {
  const input = document.getElementById("auth-usuario");
  return input ? input.value.trim() : "";
}

function obtenerClaveUsuarioPendiente(email) {
  return `${AUTH_USUARIO_PENDIENTE_PREFIX}:${String(email || "").trim().toLowerCase()}`;
}

function guardarUsuarioPendiente(email, usuario) {
  if (!email || !usuario) return;

  try {
    window.localStorage.setItem(obtenerClaveUsuarioPendiente(email), usuario);
  } catch (_error) {
    // El registro no debe fallar si el navegador bloquea localStorage.
  }
}

function leerUsuarioPendiente(email) {
  if (!email) return "";

  try {
    return window.localStorage.getItem(obtenerClaveUsuarioPendiente(email)) || "";
  } catch (_error) {
    return "";
  }
}

function limpiarUsuarioPendiente(email) {
  if (!email) return;

  try {
    window.localStorage.removeItem(obtenerClaveUsuarioPendiente(email));
  } catch (_error) {
    // Sin accion necesaria.
  }
}

async function guardarUsuarioPerfilAuth(session, usuario) {
  if (!session || !session.user || !usuario) return true;

  const { error } = await supabaseClient
    .from("profiles")
    .upsert({
      user_id: session.user.id,
      usuario
    }, { onConflict: "user_id" });

  if (error) {
    console.warn("No se pudo guardar el usuario en el perfil.", error.message);
    return false;
  }

  return true;
}

async function sincronizarUsuarioPendiente(session) {
  if (!session || !session.user || !session.user.email) return;

  const usuario = leerUsuarioPendiente(session.user.email);
  if (!usuario) return;

  const guardado = await guardarUsuarioPerfilAuth(session, usuario);
  if (guardado) limpiarUsuarioPendiente(session.user.email);
}

function setAuthMode(nextMode) {
  authMode = nextMode;

  const loginTab = document.getElementById("auth-login-tab");
  const registerTab = document.getElementById("auth-register-tab");
  const submitButton = document.getElementById("auth-submit");
  const passwordInput = document.getElementById("auth-password");
  const usuarioInput = document.getElementById("auth-usuario");

  if (loginTab) loginTab.classList.toggle("active", authMode === "login");
  if (registerTab) registerTab.classList.toggle("active", authMode === "register");
  if (submitButton) submitButton.textContent = authMode === "login" ? "Entrar" : "Crear cuenta";
  if (passwordInput) {
    passwordInput.autocomplete = authMode === "login" ? "current-password" : "new-password";
  }
  if (usuarioInput) {
    usuarioInput.required = authMode === "register";
    usuarioInput.disabled = authMode !== "register";
  }
  document.querySelectorAll(".auth-register-only").forEach((elemento) => {
    elemento.classList.toggle("auth-hidden", authMode !== "register");
  });

  setAuthMessage("");
}

function setSessionUI(session) {
  const authScreen = document.getElementById("auth-screen");
  const appShell = document.getElementById("app-shell");
  const userEmail = document.getElementById("auth-user-email");
  const userName = document.getElementById("auth-user-name");
  const userAvatar = document.getElementById("auth-user-avatar");
  const isLoggedIn = Boolean(session && session.user);

  if (authScreen) authScreen.classList.toggle("auth-hidden", isLoggedIn);
  if (appShell) appShell.classList.toggle("auth-hidden", !isLoggedIn);
  if (userEmail) userEmail.textContent = isLoggedIn ? session.user.email : "";
  if (userName) userName.textContent = isLoggedIn ? "Perfil" : "";
  if (userAvatar) {
    const email = isLoggedIn ? session.user.email || "U" : "U";
    const inicial = email.trim().charAt(0).toUpperCase() || "U";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#e8f4ea"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#2f7d42">${inicial}</text></svg>`;
    userAvatar.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  window.dispatchEvent(new CustomEvent("auth:session-changed", {
    detail: { session }
  }));
}

function getAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const usuario = obtenerUsuarioAuth();

  if (!email || !password) {
    setAuthMessage("Escribe tu correo y contrasena.", "error");
    return;
  }

  if (authMode === "register" && !usuario) {
    setAuthMessage("Escribe tu usuario.", "error");
    return;
  }

  setAuthLoading(true);
  setAuthMessage("");

  const result = authMode === "login"
    ? await supabaseClient.auth.signInWithPassword({ email, password })
    : await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { usuario },
          emailRedirectTo: getAuthRedirectUrl()
        }
      });

  setAuthLoading(false);

  if (result.error) {
    setAuthMessage(result.error.message, "error");
    return;
  }

  if (authMode === "register" && usuario) {
    guardarUsuarioPendiente(email, usuario);

    if (result.data.session) {
      const guardado = await guardarUsuarioPerfilAuth(result.data.session, usuario);
      if (guardado) limpiarUsuarioPendiente(email);
    }
  }

  if (authMode === "register" && !result.data.session) {
    setAuthMode("login");
    setAuthMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.", "success");
    return;
  }

  setAuthMessage("");
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    setAuthMessage(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const authForm = document.getElementById("auth-form");
  const loginTab = document.getElementById("auth-login-tab");
  const registerTab = document.getElementById("auth-register-tab");
  const signOutButton = document.getElementById("auth-signout");

  if (authForm) authForm.addEventListener("submit", handleAuthSubmit);
  if (loginTab) loginTab.addEventListener("click", () => setAuthMode("login"));
  if (registerTab) registerTab.addEventListener("click", () => setAuthMode("register"));
  if (signOutButton) signOutButton.addEventListener("click", signOut);

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setSessionUI(session);
    sincronizarUsuarioPendiente(session);
  });

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    setAuthMessage(error.message, "error");
    return;
  }

  setSessionUI(data.session);
  await sincronizarUsuarioPendiente(data.session);
});
