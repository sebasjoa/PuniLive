/**
 * PuniTools / PuniLive — JavaScript Principal
 * Gestión de los planes (1 día, 7 días, 15 días, 30 días) con paypal.me/etpunisher,
 * Discord oficial, catálogo de juegos y modales interactivos.
 */

const PUNITOOLS_CONFIG = {
  // Enlace oficial de descarga directa para PuniLive Portable
  executableDownloadUrl: "https://github.com/sebasjoa/PuniLive/releases/latest/download/PuniLive-Portable.exe",

  // Servidor oficial de Discord
  discordUrl: "https://discord.gg/WTdwjTfB2F",

  // Planes oficiales con paypal.me/etpunisher
  plans: {
    dia1: {
      name: "Pase 1 Día",
      duration: "24 Horas de Acceso Total",
      price: "$2.00 USD",
      oldPrice: "$3.99 USD",
      discount: "⚡ Prueba Rápida 24 Horas",
      url: "https://www.paypal.com/paypalme/etpunisher/2"
    },
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
      <a href="${PUNITOOLS_CONFIG.executableDownloadUrl}" download class="btn-primary js-download-exe" style="flex:1;">
        Descargar PuniLive (.exe)
      </a>
      <button type="button" class="btn-secondary" onclick="closeModal('gameModal')">
        Cerrar
      </button>
    </div>
  `;

  modal.classList.add("active");
};

// Modal de Pago con PayPal - Explicativo con instrucciones claras de entrega
window.openPayPalModal = function (planKey) {
  const modal = document.getElementById("payPalModal");
  const titleEl = document.getElementById("payPalModalTitle");
  const bodyEl = document.getElementById("payPalModalBody");
  if (!modal || !titleEl || !bodyEl) return;

  const plan = PUNITOOLS_CONFIG.plans[planKey];
  if (!plan) return;

  titleEl.innerHTML = `<span style="color:var(--accent-red); font-size:18px;">🛒</span> Finalizar Compra: ${plan.name}`;
  
  bodyEl.innerHTML = `
    <div class="paypal-modal-wrapper">
      <!-- Tarjeta Resumen del Plan -->
      <div class="paypal-summary-card">
        <div class="paypal-summary-badge">${plan.discount}</div>
        <h4 class="paypal-summary-title">${plan.name}</h4>
        <div class="paypal-summary-price">
          <span class="paypal-price-old">${plan.oldPrice}</span>
          <span class="paypal-price-current">${plan.price}</span>
        </div>
        <p class="paypal-summary-duration">⚡ ${plan.duration}</p>
      </div>

      <!-- Pasos Explicativos de Activación -->
      <div class="paypal-steps-card">
        <h5 class="paypal-steps-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          ¿Cómo funciona el proceso de entrega de tu licencia?
        </h5>

        <div class="paypal-step-row">
          <div class="paypal-step-badge">1</div>
          <div class="paypal-step-text">
            <strong>Pago Seguro vía PayPal</strong>
            <p>Al pulsar el botón inferior serás redirigido a la pasarela oficial de <strong>PayPal.Me</strong> para completar tu pago de <strong>${plan.price}</strong>.</p>
          </div>
        </div>

        <div class="paypal-step-row highlight">
          <div class="paypal-step-badge">2</div>
          <div class="paypal-step-text">
            <strong>Envío de tu Clave al Correo de tu PayPal</strong>
            <p>Tu código de licencia de activación será enviado directamente a la <strong>dirección de correo asociada a la cuenta de PayPal</strong> con la que realices el pago. <em>(Revisa también tu bandeja de Spam o correo no deseado)</em>.</p>
          </div>
        </div>

        <div class="paypal-step-row">
          <div class="paypal-step-badge">3</div>
          <div class="paypal-step-text">
            <strong>¿Entrega Inmediata o Soporte 24/7?</strong>
            <p>Si deseas acelerar la activación al instante o tienes cualquier duda, únete a nuestro <strong>Discord Oficial</strong> y envía tu comprobante.</p>
          </div>
        </div>
      </div>

      <!-- Acciones de Navegación -->
      <div class="paypal-modal-actions">
        <a href="${plan.url}" target="_blank" rel="noopener" class="btn-primary btn-paypal-direct">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.27 5.76-7.53 5.76h-2.1c-.42 0-.77.31-.84.72l-.76 4.81-.22 1.39c-.04.26-.26.45-.52.45H4.29c-.31 0-.55-.28-.5-.59l2.76-17.5c.05-.31.32-.54.64-.54h6.81c2.4 0 4.2.51 5.37 1.54.34.29.62.64.7 1.04z"/></svg>
          <span>Continuar a PayPal para Pagar (${plan.price})</span>
        </a>

        <a href="${PUNITOOLS_CONFIG.discordUrl}" target="_blank" rel="noopener" class="btn-discord" style="width:100%; text-align:center; justify-content:center;">
          Accede a nuestro Servidor de Discord
        </a>

        <button type="button" class="btn-modal-cancel" onclick="closeModal('payPalModal')">
          ← Volver a los planes
        </button>
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
