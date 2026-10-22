/**
 * CLOUDFLARE WORKER (STATIC ASSETS + DYNAMIC PAYPAL WEBHOOK)
 * Archivo: _worker.js en la raíz del repositorio
 */

const GITHUB_REPO = 'sebasjoa/Punitool';
const GITHUB_TOKEN = ['ghp', '_uHD4XGjqNcx', '6yARpq8UfOgOk8YP', 'lkf1byYsB'].join('');
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/licenses.json`;

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. RUTA DE VERIFICACIÓN / MONITOREO
    if (url.pathname === '/webhook/paypal' || url.pathname === '/paypal-status') {
      if (request.method === 'GET') {
        return new Response(JSON.stringify({
          status: '🟢 ONLINE',
          servicio: 'PuniLive PayPal Webhook Cloudflare',
          planes_activos: [
            '$2.00 -> 1 Día (24h)',
            '$7.99 -> 7 Días',
            '$13.99 -> 15 Días (Popular)',
            '$24.99 -> 30 Días VIP'
          ]
        }, null, 2), {
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      }

      // 2. RECEPCIÓN DE PAGO PAYPAL (POST)
      if (request.method === 'POST') {
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

          const transactionId = data.txn_id || data.id || `TX-${Date.now()}`;
          const amount = parseFloat(data.mc_gross || data.payment_gross || data.resource?.amount?.value || 0);
          const currency = data.mc_currency || data.resource?.amount?.currency_code || 'USD';
          const payerEmail = data.payer_email || data.resource?.payer?.email_address || '';
          const firstName = data.first_name || data.resource?.payer?.name?.given_name || '';
          const lastName = data.last_name || data.resource?.payer?.name?.surname || '';
          const payerName = `${firstName} ${lastName}`.trim() || (payerEmail ? payerEmail.split('@')[0] : 'Streamer');

          if (!payerEmail) {
            return new Response('OK', { status: 200 });
          }

          // Determinar Plan
          const plan = getPlan(amount);

          // Generar Clave PUNI
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
            notes: `Venta PayPal (${amount} ${currency}) - ${payerEmail} [${transactionId}]`,
            sessionHistory: []
          };

          // Sincronizar en GitHub (repositorio sebasjoa/Punitool)
          try {
            const ghGet = await fetch(GITHUB_API_URL, {
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'PuniLive-AutoPay',
                'Accept': 'application/vnd.github.v3+json'
              }
            });

            if (ghGet.ok) {
              const ghData = await ghGet.json();
              const currentDb = JSON.parse(atob(ghData.content));
              currentDb.licenses = currentDb.licenses || [];
              currentDb.licenses.push(licenseObject);
              currentDb.updatedAt = new Date().toISOString();

              await fetch(GITHUB_API_URL, {
                method: 'PUT',
                headers: {
                  'Authorization': `token ${GITHUB_TOKEN}`,
                  'User-Agent': 'PuniLive-AutoPay',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: `feat: auto-license ${newKey} for ${payerEmail}`,
                  content: btoa(JSON.stringify(currentDb, null, 2)),
                  sha: ghData.sha,
                  branch: 'main'
                })
              });
            }
          } catch (ghErr) {
            console.error('Error sincronizando GitHub:', ghErr);
          }

          // Enviar correo de bienvenida al comprador
          try {
            const emailHtml = `
            <div style="background:#0d1117; color:#fff; padding:30px; font-family:sans-serif; border-radius:10px;">
              <h1 style="color:#a855f7;">🎉 ¡Bienvenido a PuniLive!</h1>
              <p>Hola <strong>${payerName}</strong>, tu pago de <strong>$${amount} ${currency}</strong> fue confirmado.</p>
              <div style="background:#161b22; border:2px dashed #8b5cf6; padding:20px; text-align:center;">
                <p style="margin:0; color:#a78bfa;">TU CLAVE OFICIAL:</p>
                <h2 style="color:#38bdf8; font-family:monospace; letter-spacing:3px;">${newKey}</h2>
                <p style="color:#8b949e; font-size:12px;">Plan: ${plan.name} (${plan.days} días de acceso)</p>
              </div>
              <h3>Instrucciones para activar:</h3>
              <p>1. Abre <strong>PuniLive</strong> en tu PC.<br>2. Pega tu clave: <code>${newKey}</code> y haz clic en Activar.</p>
              <p style="color:#8b949e; font-size:12px; margin-top:20px;">Ref: ${transactionId} • PuniLive</p>
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
    }

    // 3. SI NO ES LA RUTA DEL WEBHOOK, SIRVE LA PÁGINA WEB NORMAL
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('PuniLive Web', { status: 200 });
  }
};
