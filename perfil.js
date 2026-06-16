let perfilAvatarFile = null;

function setPerfilMensaje(elementId, message, type) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  elemento.textContent = message || "";
  elemento.className = `profile-message ${type || ""}`.trim();
}

function setPerfilLoading(buttonId, isLoading, text) {
  const boton = document.getElementById(buttonId);
  if (!boton) return;

  boton.disabled = isLoading;
  boton.textContent = isLoading ? "Procesando..." : text;
}

function getPerfilAvatarDefault(email) {
  const inicial = (email || "U").trim().charAt(0).toUpperCase() || "U";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#e8f4ea"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="48" font-weight="700" fill="#2f7d42">${inicial}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function setPerfilAvatarPreview(src, email) {
  const avatar = document.getElementById("perfil_avatar_preview");
  if (!avatar) return;

  avatar.src = src || getPerfilAvatarDefault(email);
}

function setAuthUserSummary(profile, email) {
  const avatar = document.getElementById("auth-user-avatar");
  const name = document.getElementById("auth-user-name");
  const avatarUrl = profile && profile.avatar_url ? profile.avatar_url : "";
  const displayName = profile && (profile.usuario || profile.nombre_usuario || profile.nombre)
    ? profile.usuario || profile.nombre_usuario || profile.nombre
    : "Perfil";

  if (avatar) avatar.src = avatarUrl || getPerfilAvatarDefault(email);
  if (name) name.textContent = displayName;
}

async function obtenerSesionPerfil() {
  const client = window.supabaseClient;
  if (!client) return null;

  const { data, error } = await client.auth.getSession();
  if (error || !data.session) return null;

  return data.session;
}

async function cargarPerfil() {
  const client = window.supabaseClient;
  const session = await obtenerSesionPerfil();
  if (!client || !session) return;

  const user = session.user;
  const emailInput = document.getElementById("perfil_email");
  const nombreInput = document.getElementById("perfil_nombre");
  const usuarioInput = document.getElementById("perfil_nombre_usuario");
  const telefonoInput = document.getElementById("perfil_telefono");

  if (emailInput) emailInput.value = user.email || "";
  setPerfilAvatarPreview("", user.email);

  const { data, error } = await client
    .from("profiles")
    .select("nombre,usuario,telefono,avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    setAuthUserSummary(null, user.email);
    setPerfilMensaje("perfil_mensaje", "No se pudo cargar el perfil. Ejecuta supabase-perfil.sql en Supabase.", "error");
    return;
  }

  if (nombreInput) nombreInput.value = data ? data.nombre || "" : "";
  if (usuarioInput) usuarioInput.value = data ? data.usuario || "" : "";
  if (telefonoInput) telefonoInput.value = data ? data.telefono || "" : "";
  setPerfilAvatarPreview(data ? data.avatar_url : "", user.email);
  setAuthUserSummary(data, user.email);
  setPerfilMensaje("perfil_mensaje", "");
}

function obtenerExtensionAvatar(file) {
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return extension;

  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";

  return "jpg";
}

async function subirAvatarPerfil(userId) {
  const client = window.supabaseClient;
  if (!perfilAvatarFile || !client) return "";

  const extension = obtenerExtensionAvatar(perfilAvatarFile);
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const { error } = await client.storage
    .from("profile-avatars")
    .upload(path, perfilAvatarFile, {
      cacheControl: "3600",
      upsert: true
    });

  if (error) throw error;

  const { data } = client.storage
    .from("profile-avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}

async function guardarPerfil(event) {
  event.preventDefault();

  const client = window.supabaseClient;
  const session = await obtenerSesionPerfil();
  if (!client || !session) return;

  const user = session.user;
  const email = document.getElementById("perfil_email").value.trim();
  const nombre = document.getElementById("perfil_nombre").value.trim();
  const nombreUsuario = document.getElementById("perfil_nombre_usuario").value.trim();
  const telefono = document.getElementById("perfil_telefono").value.trim();

  setPerfilLoading("perfil_submit", true, "Guardar perfil");
  setPerfilMensaje("perfil_mensaje", "");

  try {
    let avatarUrl = "";

    if (perfilAvatarFile) {
      avatarUrl = await subirAvatarPerfil(user.id);
    }

    if (email && email !== user.email) {
      const { error: emailError } = await client.auth.updateUser({ email });
      if (emailError) throw emailError;
    }

    const payload = {
      user_id: user.id,
      nombre,
      usuario: nombreUsuario,
      telefono
    };

    if (avatarUrl) payload.avatar_url = avatarUrl;

    const { error } = await client
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) throw error;

    perfilAvatarFile = null;
    setPerfilAvatarPreview(avatarUrl || document.getElementById("perfil_avatar_preview").src, email || user.email);
    setAuthUserSummary({
      nombre,
      usuario: nombreUsuario,
      avatar_url: avatarUrl || document.getElementById("perfil_avatar_preview").src
    }, email || user.email);
    setPerfilMensaje("perfil_mensaje", "Perfil guardado correctamente.", "success");
  } catch (error) {
    setPerfilMensaje("perfil_mensaje", error.message, "error");
  } finally {
    setPerfilLoading("perfil_submit", false, "Guardar perfil");
  }
}

async function cambiarPasswordPerfil(event) {
  event.preventDefault();

  const client = window.supabaseClient;
  if (!client) return;

  const password = document.getElementById("perfil_password").value;
  const confirmacion = document.getElementById("perfil_password_confirm").value;

  if (!password || !confirmacion) {
    setPerfilMensaje("perfil_password_mensaje", "Completa ambos campos.", "error");
    return;
  }

  if (password.length < 8) {
    setPerfilMensaje("perfil_password_mensaje", "La contrase\u00f1a debe tener al menos 8 caracteres.", "error");
    return;
  }

  if (password !== confirmacion) {
    setPerfilMensaje("perfil_password_mensaje", "Las contrase\u00f1as no coinciden.", "error");
    return;
  }

  setPerfilLoading("perfil_password_submit", true, "Cambiar contrase\u00f1a");
  setPerfilMensaje("perfil_password_mensaje", "");

  const { error } = await client.auth.updateUser({ password });

  setPerfilLoading("perfil_password_submit", false, "Cambiar contrase\u00f1a");

  if (error) {
    setPerfilMensaje("perfil_password_mensaje", error.message, "error");
    return;
  }

  document.getElementById("perfil_password").value = "";
  document.getElementById("perfil_password_confirm").value = "";
  setPerfilMensaje("perfil_password_mensaje", "Contrase\u00f1a actualizada correctamente.", "success");
}

function configurarPerfil() {
  const form = document.getElementById("perfil-form");
  const passwordForm = document.getElementById("perfil-password-form");
  const avatarInput = document.getElementById("perfil_avatar");

  if (form) form.addEventListener("submit", guardarPerfil);
  if (passwordForm) passwordForm.addEventListener("submit", cambiarPasswordPerfil);
  if (avatarInput) {
    avatarInput.addEventListener("change", function () {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      perfilAvatarFile = file;
      setPerfilAvatarPreview(URL.createObjectURL(file), document.getElementById("perfil_email").value);
    });
  }

  window.addEventListener("auth:session-changed", cargarPerfil);
  cargarPerfil();
}

document.addEventListener("DOMContentLoaded", configurarPerfil);
