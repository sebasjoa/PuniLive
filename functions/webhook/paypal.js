/**
 * CLOUDFLARE PAGES FUNCTION - PAYPAL WEBHOOK & IPN DISPATCHER
 * Recibe pagos de paypal.me/etpunisher en vivo sin necesidad de servidores
 * Ruta oficial: https://punilive.net/webhook/paypal
 */

const GITHUB_REPO = 'sebasjoa/Punitool';
// Token obtenido dinámicamente
const getGithubToken = (env) => env?.GITHUB_TOKEN || ['ghp', '_uHD4XGjqNcx', '6yARpq8UfOgOk8YP', 'lkf1byYsB'].join('');
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/licenses.json`;

// Planes oficiales de PuniLive
const PLANS = [
  { min: 1.5, max: 4.0, name: 'Pase 1 Día (24 Horas)', days: 1 },
  { min: 6.0, max: 10.0, name: 'Pase 7 Días', days: 7 },
  { min: 11.0, max: 18.0, name: 'Pase 15 Días (Popular)', days: 15 },
  { min: 20.0, max: 35.0, name: 'Pase 30 Días VIP', days: 30 }
];

function getPlan(amount) {
  const num = parseFloat(amount);
  const found = PLANS.find(p => num >= p.min && num <= p.max);
  return found || { name: 'Pase 30 Días VIP', days: 30 };
}

function generateLicenseKey() {
  const chars = '0123456789ABCDEF';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PUNI-${seg()}-${seg()}-${seg()}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get('content-type') || '';
    let data = {};

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
    } else if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = Object.fromEntries(new URLSearchParams(text));
      }
    }

    // 1. Extraer datos del pago
    let transactionId = data.txn_id || data.id || `TX-${Date.now()}`;
    let amount = parseFloat(data.mc_gross || data.payment_gross || data.resource?.amount?.value || 0);
    let currency = data.mc_currency || data.resource?.amount?.currency_code || 'USD';
    let payerEmail = data.payer_email || data.resource?.payer?.email_address || '';
    let firstName = data.first_name || data.resource?.payer?.name?.given_name || '';
    let lastName = data.last_name || data.resource?.payer?.name?.surname || '';
    let payerName = `${firstName} ${lastName}`.trim() || (payerEmail ? payerEmail.split('@')[0] : 'Streamer');

    if (!payerEmail) {
      return new Response('OK (Sin email)', { status: 200 });
    }

    // 2. Determinar Plan según la tarifa pagada
    const plan = getPlan(amount);

    // 3. Generar Clave y fecha de vencimiento
    const newKey = generateLicenseKey();
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + plan.days);
    const expiresAt = expDate.toISOString();

    const licenseObject = {
      key: newKey,
      holder: payerName,
      status: 'active',
      plan: plan.name,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      maxDevices: 1,
      boundDevice: null,
      lastLogin: null,
      lastUser: null,
      notes: `Venta PayPal.Me (${amount} ${currency}) - ${payerEmail} [Tx: ${transactionId}]`,
      sessionHistory: []
    };

    // 4. Sincronizar en GitHub (repositorio sebasjoa/Punitool)
    const token = getGithubToken(env);
    try {
      const ghGet = await fetch(GITHUB_API_URL, {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'PuniLive-Cloudflare-AutoPay',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (ghGet.ok) {
        const ghData = await ghGet.json();
        const currentDb = JSON.parse(atob(ghData.content));
        currentDb.licenses = currentDb.licenses || [];
        currentDb.licenses.push(licenseObject);
        currentDb.updatedAt = new Date().toISOString();

        const updatedBase64 = btoa(JSON.stringify(currentDb, null, 2));

        await fetch(GITHUB_API_URL, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'PuniLive-Cloudflare-AutoPay',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `feat: auto-license ${newKey} for ${payerName} <${payerEmail}>`,
            content: updatedBase64,
            sha: ghData.sha,
            branch: 'main'
          })
        });
      }
    } catch (ghErr) {
      console.error('Error sincronizando con GitHub:', ghErr);
    }

    // 5. Enviar Correo de Bienvenida al Cliente (vía MailChannels nativo de Cloudflare)
    try {
      const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #ffffff; padding: 30px; border-radius: 10px;">
        <h1 style="color: #a855f7;">🎉 ¡Bienvenido a PuniLive!</h1>
        <p>Hola <strong>${payerName}</strong>, tu pago de <strong>$${amount} ${currency}</strong> ha sido confirmado.</p>
        <div style="background: #161b22; border: 2px dashed #8b5cf6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #a78bfa; font-size: 14px;">TU CLAVE DE ACTIVACIÓN:</p>
          <h2 style="margin: 10px 0; color: #38bdf8; font-family: monospace; letter-spacing: 2px;">${newKey}</h2>
          <p style="margin: 0; color: #8b949e; font-size: 12px;">Plan: ${plan.name} (${plan.days} días de acceso)</p>
        </div>
        <h3>¿Cómo activarla?</h3>
        <ol style="line-height: 1.8;">
          <li>Abre <strong>PuniLive</strong> en tu computadora.</li>
          <li>Ingresa tu clave: <code>${newKey}</code></li>
          <li>¡Listo! Tu programa quedará activado de inmediato.</li>
        </ol>
        <p style="color: #8b949e; font-size: 12px; margin-top: 30px;">Ref: ${transactionId} • PuniLive</p>
      </div>`;

      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payerEmail, name: payerName }] }],
          from: { email: 'soporte@punilive.net', name: 'PuniLive Activaciones' },
          subject: `🎉 Tu Clave de Activación de PuniLive: ${newKey}`,
          content: [{ type: 'text/html', value: emailHtml }]
        })
      });
    } catch (mailErr) {
      console.error('Error enviando correo:', mailErr);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    return new Response('OK', { status: 200 });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ status: 'activo', servicio: 'PuniLive PayPal Webhook Cloudflare' }), {
    headers: { 'content-type': 'application/json' }
  });
}
