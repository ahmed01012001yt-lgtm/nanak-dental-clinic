module.exports = async function handler(req, res) {
  const origin = 'https://nanak-dental-clinic-45iqgi8tn-degita-marketing.vercel.app';
  const target = origin + (req.url || '/');

  const upstream = await fetch(target, {
    headers: {
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'accept': req.headers['accept'] || '*/*'
    },
    redirect: 'follow'
  });

  const contentType = upstream.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    const body = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    if (contentType) res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'public, max-age=0, must-revalidate');
    return res.send(body);
  }

  let html = await upstream.text();

  const modal = `
<style id="appointment-modal-style">
  .apt-modal-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(5,22,51,.62);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:20px}
  .apt-modal-backdrop.open{display:flex}
  .apt-modal{width:min(620px,100%);max-height:min(86vh,760px);overflow:auto;background:#fff;border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,.28);position:relative}
  .apt-modal-head{padding:26px 28px 18px;background:linear-gradient(135deg,#0755c9,#083d93);color:#fff;border-radius:24px 24px 0 0}
  .apt-modal-head h2{margin:0;color:#fff;font:800 30px/1.1 \"Segoe UI\",Arial,sans-serif;letter-spacing:-.02em}
  .apt-modal-head p{margin:8px 36px 0 0;color:#dce9ff;font:14px/1.5 \"Segoe UI\",Arial,sans-serif}
  .apt-close{position:absolute;right:16px;top:16px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font-size:25px;cursor:pointer;display:grid;place-items:center}
  .apt-form{padding:24px 28px 28px;display:grid;grid-template-columns:1fr 1fr;gap:15px}
  .apt-field{display:flex;flex-direction:column;gap:7px}.apt-full{grid-column:1/-1}
  .apt-field label{font:800 13px/1.3 \"Segoe UI\",Arial,sans-serif;color:#17305f}
  .apt-field input,.apt-field select,.apt-field textarea{width:100%;border:1px solid #d6e0ee;border-radius:12px;padding:12px 13px;background:#fbfdff;color:#102246;font:14px \"Segoe UI\",Arial,sans-serif;outline:none}
  .apt-field input:focus,.apt-field select:focus,.apt-field textarea:focus{border-color:#0755c9;box-shadow:0 0 0 3px rgba(7,85,201,.1)}
  .apt-field textarea{min-height:92px;resize:vertical}
  .apt-submit{grid-column:1/-1;border:0;border-radius:12px;padding:14px 18px;background:#18a864;color:white;font:800 15px \"Segoe UI\",Arial,sans-serif;cursor:pointer;box-shadow:0 10px 24px rgba(24,168,100,.22)}
  .apt-note{grid-column:1/-1;font:12px/1.5 \"Segoe UI\",Arial,sans-serif;color:#6b7890;margin-top:-4px}
  body.apt-lock{overflow:hidden}
  @media(max-width:640px){.apt-modal-backdrop{padding:10px;align-items:flex-end}.apt-modal{border-radius:22px 22px 0 0;max-height:92vh}.apt-modal-head{border-radius:22px 22px 0 0;padding:22px 20px 16px}.apt-modal-head h2{font-size:25px}.apt-form{grid-template-columns:1fr;padding:20px}.apt-full,.apt-submit,.apt-note{grid-column:auto}}
</style>
<div class="apt-modal-backdrop" id="appointmentModal" aria-hidden="true">
  <div class="apt-modal" role="dialog" aria-modal="true" aria-labelledby="appointmentModalTitle">
    <div class="apt-modal-head">
      <button class="apt-close" type="button" aria-label="Close appointment form">×</button>
      <h2 id="appointmentModalTitle">Request an Appointment</h2>
      <p>Share your preferred date and time. Your request will continue on WhatsApp with Nanak Dental Clinic.</p>
    </div>
    <form class="apt-form" id="appointmentPopupForm">
      <div class="apt-field"><label for="aptName">Name *</label><input id="aptName" name="name" autocomplete="name" required></div>
      <div class="apt-field"><label for="aptPhone">Phone *</label><input id="aptPhone" name="phone" inputmode="tel" autocomplete="tel" required></div>
      <div class="apt-field"><label for="aptService">Treatment / Reason</label><select id="aptService" name="service"><option>General consultation</option><option>Dental Implants</option><option>Root Canal</option><option>Orthodontics</option><option>Cosmetic Dentistry</option><option>Crowns / Veneers</option><option>Emergency Dental Care</option><option>Other</option></select></div>
      <div class="apt-field"><label for="aptDate">Preferred Date</label><input id="aptDate" name="date" type="date"></div>
      <div class="apt-field"><label for="aptTime">Preferred Time</label><select id="aptTime" name="time"><option>Flexible</option><option>10 AM – 1 PM</option><option>1 PM – 5 PM</option><option>5 PM – 9 PM</option></select></div>
      <div class="apt-field apt-full"><label for="aptNote">Note</label><textarea id="aptNote" name="message" placeholder="Briefly tell the clinic what you need help with (optional)"></textarea></div>
      <button class="apt-submit" type="submit">Continue on WhatsApp</button>
      <div class="apt-note">This form does not store your information on this website. It opens WhatsApp with a pre-filled appointment request.</div>
    </form>
  </div>
</div>
<script id="appointment-modal-script">
(()=>{
  const modal=document.getElementById('appointmentModal');
  if(!modal) return;
  const form=document.getElementById('appointmentPopupForm');
  const closeBtn=modal.querySelector('.apt-close');
  let lastFocus=null;
  const open=()=>{lastFocus=document.activeElement;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('apt-lock');setTimeout(()=>document.getElementById('aptName')?.focus(),30)};
  const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('apt-lock');if(lastFocus&&lastFocus.focus)lastFocus.focus()};
  document.querySelectorAll('a,button').forEach(el=>{
    const text=(el.textContent||'').replace(/\\s+/g,' ').trim();
    if(/(request|book)\\s+(an\\s+)?appointment/i.test(text)){
      el.addEventListener('click',e=>{e.preventDefault();open()});
    }
  });
  closeBtn?.addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    const name=String(d.get('name')||'').trim();
    const phone=String(d.get('phone')||'').trim();
    if(!name||!phone) return;
    const lines=[
      'Hello Nanak Dental Clinic, I would like to request an appointment.',
      'Name: '+name,
      'Phone: '+phone,
      'Treatment / Reason: '+String(d.get('service')||'General consultation'),
      'Preferred date: '+String(d.get('date')||'Flexible'),
      'Preferred time: '+String(d.get('time')||'Flexible'),
      'Note: '+String(d.get('message')||'No additional note')
    ];
    window.open('https://wa.me/919999608619?text='+encodeURIComponent(lines.join('\\n')),'_blank','noopener');
  });
})();
</script>`;

  if (!html.includes('id="appointmentModal"')) {
    html = html.replace(/<\/body>/i, modal + '</body>');
  }

  res.status(upstream.status);
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'public, max-age=0, must-revalidate');
  return res.send(html);
};
