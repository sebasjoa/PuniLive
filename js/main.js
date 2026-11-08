/**
 * PuniTools / PuniLive — JavaScript Principal
 * Gestión de los 3 planes con paypal.me/etpunisher, Discord oficial,
 * catálogo de juegos y modales interactivos.
 */

const PUNITOOLS_CONFIG = {
  // Enlace oficial de descarga directa para PuniLive Portable
  executableDownloadUrl: "https://github.com/sebasjoa/PuniLive/releases/latest/download/PuniLive-Portable.exe",

  // Servidor oficial de Discord
  discordUrl: "https://discord.gg/kgaBXDJ9uu",

  // 3 Planes oficiales con paypal.me/etpunisher
  plans: {
    dias7: {
      name: "Pase 7 Días",
      duration: "7 Días de Acceso Total",
      price: "$7.99 USD",
      oldPrice: "$12.99 USD",
      discount: "🔥 Ahorra 38% en tu Lanzamiento",
      url: "https://www.paypal.com/paypalme/etpunisher/7.99"
    },
    dias15: {
      name: "Pase 15 Días",
      duration: "15 Días de Acceso Total",
      price: "$13.99 USD",
      oldPrice: "$22.99 USD",
      discount: "⭐ Más Popular · Solo $0.93 / día",
      url: "https://www.paypal.com/paypalme/etpunisher/13.99"
    },
    dias30: {
      name: "Pase 30 Días VIP",
      duration: "30 Días de Acceso Total",
      price: "$24.99 USD",
      oldPrice: "$39.99 USD",
      discount: "💎 Mejor Valor · Menos de $0.83 / día",
      url: "https://www.paypal.com/paypalme/etpunisher/24.99"
    }
  }
};

// Base de datos de juegos oficiales
const GAMES_DATABASE = {
  demolicion: {
    name: "Demolición vs Construcción 3D",
    version: "v1.5.3",
    category: "3D · Físicas · Guerra de Bandos",
    summary: "Meta inicial de 500 pisos (ajustable de 100 a 1000). Tu transmisión se divide en dos bandos en tiempo real: los constructores levantan la torre y los demoledores lanzan ataques.",
    powers: [
      { title: "Construir +1 a +1000 Pisos", trigger: "Likes y Regalos pequeños" },
      { title: "Héroe Constructor con Jetpack", trigger: "Gorra / Regalo TikTok" },
      { title: "Escudo Protector de Pisos", trigger: "Dona / Regalo TikTok" },
      { title: "Bola Demoledora y Bombas TNT", trigger: "Rosa / Regalo TikTok" },
      { title: "Taladro Perforador Gigante", trigger: "Pesas / Regalo TikTok" },
      { title: "Lluvia de Meteoritos y Agujero Negro", trigger: "León / Galaxia" }
    ]
  },
  puniride: {
    name: "PuniRide",
    version: "v1.0.0",
    category: "2D Racing · Física de Saltos · Nitro",
    summary: "Motocross 2D con cuatro biomas diferentes, física de saltos en rampas, nitro explosivo, cohete acumulativo, ave fénix y más de 10 acciones asignables.",
    powers: [
      { title: "Nitro Impulso y Saltos Extremos", trigger: "Rosa o Ráfaga de Likes" },
      { title: "Cohete Acumulativo de Velocidad", trigger: "Dona / Regalo TikTok" },
      { title: "Despertar del Ave Fénix Radiante", trigger: "Regalo Especial" },
      { title: "Cambio de Bioma en Vivo", trigger: "Comentario o Reto" },
      { title: "Super Salto en Rampa Gigante", trigger: "Gorra / Regalo TikTok" },
      { title: "Modo Fuego Imparable", trigger: "Galaxia / León" }
    ]
  },
  defensa2d: {
    name: "PunitoolsLive Defensa 2D",
    version: "v1.0.0",
    category: "Arcade · Tower Defense · Estrategia",
    summary: "Adaptación arcade de defensa de base. Tu audiencia defiende o asedia la fortaleza invocando guerreros, magos, arqueros y agujeros negros con sus regalos.",
    powers: [
      { title: "Invocar Arquero o Guerrero", trigger: "Likes o Comentarios" },
      { title: "Mago de Fuego y Rayos", trigger: "Rosa / Regalo TikTok" },
      { title: "Reparar la Muralla Principal", trigger: "Ráfaga de Likes" },
      { title: "Tormenta Defensiva Mágica", trigger: "Dona / Regalo TikTok" },
      { title: "Invocar Agujero Negro", trigger: "Regalo Especial" },
      { title: "Dragón Colosal en Pantalla", trigger: "León / Regalo VIP" }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Enlazar botones de descarga al ejecutable
  document.querySelectorAll(".js-download-exe").forEach((link) => {
    link.setAttribute("href", PUNITOOLS_CONFIG.executableDownloadUrl);
  });

  // Enlazar botones de Discord
  document.querySelectorAll(".js-discord-link").forEach((link) => {
    link.setAttribute("href", PUNITOOLS_CONFIG.discordUrl);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener");
  });

  // Menú móvil
  const mobileToggle = document.getElementById("mobileToggle");
  const mainNav = document.getElementById("mainNav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });

    // Cerrar menú al hacer clic en enlaces en móvil
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
      });
    });
  }

  // Acordeón de FAQ
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".faq-item");
      if (!parent) return;
      const isOpen = parent.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("open"));
      if (!isOpen) {
        parent.classList.add("open");
      }
    });
  });
});

// Modal de Poderes de Juego
window.openGameModal = function (gameKey) {
  const modal = document.getElementById("gameModal");
  const titleEl = document.getElementById("gameModalTitle");
  const bodyEl = document.getElementById("gameModalBody");
  if (!modal || !titleEl || !bodyEl) return;

  const g = GAMES_DATABASE[gameKey];
  if (!g) return;

  titleEl.textContent = `${g.name} (${g.version})`;
  bodyEl.innerHTML = `
    <div style="display:inline-block; background:rgba(255,87,34,0.12); color:#ff5722; font-size:11px; font-weight:700; padding:3px 10px; border-radius:4px; margin-bottom:12px;">
      ${g.category}
    </div>
    <p style="color:#9da4b8; font-size:13.5px; line-height:1.6; margin-bottom:18px;">${g.summary}</p>
    <h4 style="font-family:var(--font-title); font-size:14px; color:#ffffff; margin-bottom:8px;">
      Acciones y Poderes que Activa tu Audiencia:
    </h4>
    <div class="powers-list">
      ${g.powers
        .map(
          (p) => `
        <div class="power-box">
          <strong>${p.title}</strong>
          <span>Activa con: ${p.trigger}</span>
        </div>
      `
        )
        .join("")}
    </div>
    <p style="font-size:12px; color:#a1a8c0; margin-top:14px;">
      🚀 <em>Tu suscripción incluye automáticamente acceso a este y a todos los nuevos juegos que estamos desarrollando continuamente.</em>
    </p>
    <div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">
      <a href="${PUNITOOLS_CONFIG.executableDownloadUrl}" class="btn-primary js-download-exe" style="flex:1;">
        Descargar PuniLive (.exe)
      </a>
      <button type="button" class="btn-secondary" onclick="closeModal('gameModal')">
        Cerrar
      </button>
    </div>
  `;

  modal.classList.add("active");
};

// Modal de Pago con PayPal
window.openPayPalModal = function (planKey) {
  const modal = document.getElementById("payPalModal");
  const titleEl = document.getElementById("payPalModalTitle");
  const bodyEl = document.getElementById("payPalModalBody");
  if (!modal || !titleEl || !bodyEl) return;

  const plan = PUNITOOLS_CONFIG.plans[planKey];
  if (!plan) return;

  titleEl.textContent = `Activar ${plan.name} — ${plan.price}`;
  bodyEl.innerHTML = `
    <div style="text-align:center; padding:10px 0;">
      <span class="offer-pill">${plan.discount}</span>
      <div style="font-size:14px; color:#9da4b8; margin-bottom:4px;">${plan.duration}</div>
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:14px;">
        <span style="color:#6c738a; text-decoration:line-through; font-size:17px;">${plan.oldPrice}</span>
        <strong style="font-family:var(--font-title); font-size:36px; color:#ffffff;">${plan.price}</strong>
      </div>
      <p style="color:#9da4b8; font-size:13px; line-height:1.6; max-width:440px; margin:0 auto 20px;">
        Pago seguro y directo a través de <strong>PayPal.Me</strong>. Al completar el pago, únete a nuestro servidor de Discord o contáctanos para enviarte tu clave de activación inmediata.
      </p>
      <div style="display:flex; flex-direction:column; gap:10px; max-width:320px; margin:0 auto;">
        <a href="${plan.url}" target="_blank" rel="noopener" class="btn-primary" style="width:100%;">
          Ir a Pagar ${plan.price} con PayPal.Me
        </a>
        <a href="${PUNITOOLS_CONFIG.discordUrl}" target="_blank" rel="noopener" class="btn-discord" style="width:100%;">
          Accede a nuestro Servidor de Discord
        </a>
      </div>
    </div>
  `;

  modal.classList.add("active");
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
};

window.addEventListener("click", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("active");
  }
});
