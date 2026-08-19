module.exports = async function handler(req, res) {
  const origin = 'https://nanak-dental-clinic-45iqgi8tn-degita-marketing.vercel.app';
  const target = origin + (req.url || '/');
  const HERO = 'https://images.pexels.com/photos/3881145/pexels-photo-3881145.jpeg?auto=compress&cs=tinysrgb&w=1800';

  const upstream = await fetch(target, {
    headers: {
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'accept': req.headers['accept'] || '*/*',
      'cache-control': 'no-cache'
    },
    redirect: 'follow',
    cache: 'no-store'
  });

  const contentType = upstream.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    const body = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    if (contentType) res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store, max-age=0');
    return res.send(body);
  }

  let html = await upstream.text();

  // Replace the old low-resolution hero asset at the HTML layer so every browser gets the new image.
  html = html.replace(
    /https:\/\/oupovxujjshindzgflgz\.supabase\.co\/functions\/v1\/nanak-assets-v2\?img=hero/gi,
    HERO
  );

  // Make appointment CTAs non-navigating in the HTML itself, before JavaScript runs.
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!/(request|book).*appointment/i.test(text)) return full;
    let next = attrs;
    if (/\shref=(['"])[^'"]*\1/i.test(next)) {
      next = next.replace(/\shref=(['"])[^'"]*\1/i, ' href="#appointment"');
    } else {
      next += ' href="#appointment"';
    }
    if (!/data-appointment-modal/i.test(next)) next += ' data-appointment-modal="1"';
    return `<a${next}>${inner}</a>`;
  });

  const modal = `
<style id="appointment-modal-style">
.apt-modal-backdrop{position:fixed;inset:0;z-index:2147483647;background:rgba(5,22,51,.68);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:18px}.apt-modal-backdrop.open{display:flex!important}.apt-modal{width:min(620px,100%);max-height:88dvh;overflow:auto;-webkit-overflow-scrolling:touch;background:#fff;border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,.3);position:relative}.apt-modal-head{padding:26px 28px 18px;background:linear-gradient(135deg,#0755c9,#083d93);color:#fff;border-radius:24px 24px 0 0}.apt-modal-head h2{margin:0;color:#fff;font:800 30px/1.1 "Segoe UI",Arial,sans-serif}.apt-modal-head p{margin:8px 42px 0 0;color:#dce9ff;font:14px/1.5 "Segoe UI",Arial,sans-serif}.apt-close{position:absolute;right:14px;top:14px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:grid;place-items:center}.apt-form{padding:24px 28px 28px;display:grid;grid-template-columns:1fr 1fr;gap:15px}.apt-field{display:flex;flex-direction:column;gap:7px}.apt-full{grid-column:1/-1}.apt-field label{font:800 13px/1.3 "Segoe UI",Arial,sans-serif;color:#17305f}.apt-field input,.apt-field select,.apt-field textarea{box-sizing:border-box;width:100%;min-height:46px;border:1px solid #d6e0ee;border-radius:12px;padding:12px 13px;background:#fbfdff;color:#102246;font:16px "Segoe UI",Arial,sans-serif;outline:none}.apt-field textarea{min-height:86px;resize:vertical}.apt-submit{grid-column:1/-1;border:0;border-radius:12px;padding:14px 18px;background:#18a864;color:#fff;font:800 15px "Segoe UI",Arial,sans-serif;cursor:pointer;min-height:50px}.apt-note{grid-column:1/-1;font:12px/1.5 "Segoe UI",Arial,sans-serif;color:#6b7890}.apt-lock{overflow:hidden!important;touch-action:none}@media(max-width:640px){.apt-modal-backdrop{padding:0;align-items:flex-end}.apt-modal{width:100%;max-height:92dvh;border-radius:24px 24px 0 0}.apt-modal-head{border-radius:24px 24px 0 0;padding:22px 20px 16px}.apt-modal-head h2{font-size:25px}.apt-form{grid-template-columns:1fr;padding:18px 20px 24px;gap:12px}.apt-full,.apt-submit,.apt-note{grid-column:auto}}
</style>
<div class="apt-modal-backdrop" id="appointmentModal" aria-hidden="true"><div class="apt-modal" role="dialog" aria-modal="true" aria-labelledby="appointmentModalTitle"><div class="apt-modal-head"><button class="apt-close" type="button" aria-label="Close appointment form">×</button><h2 id="appointmentModalTitle">Request an Appointment</h2><p>Choose your preferred details and continue the request on WhatsApp.</p></div><form class="apt-form" id="appointmentPopupForm"><div class="apt-field"><label for="aptName">Name *</label><input id="aptName" name="name" autocomplete="name" required></div><div class="apt-field"><label for="aptPhone">Phone *</label><input id="aptPhone" name="phone" inputmode="tel" autocomplete="tel" required></div><div class="apt-field"><label for="aptService">Treatment / Reason</label><select id="aptService" name="service"><option>General consultation</option><option>Dental Implants</option><option>Root Canal</option><option>Orthodontics</option><option>Cosmetic Dentistry</option><option>Crowns / Veneers</option><option>Emergency Dental Care</option><option>Other</option></select></div><div class="apt-field"><label for="aptDate">Preferred Date</label><input id="aptDate" name="date" type="date"></div><div class="apt-field"><label for="aptTime">Preferred Time</label><select id="aptTime" name="time"><option>Flexible</option><option>10 AM – 1 PM</option><option>1 PM – 5 PM</option><option>5 PM – 9 PM</option></select></div><div class="apt-field apt-full"><label for="aptNote">Note</label><textarea id="aptNote" name="message" placeholder="Briefly tell the clinic what you need help with (optional)"></textarea></div><button class="apt-submit" type="submit">Continue on WhatsApp</button><div class="apt-note">This website does not store the information entered here. WhatsApp opens with a pre-filled appointment request.</div></form></div></div>
<script id="appointment-modal-script">(()=>{const modal=document.getElementById('appointmentModal');if(!modal)return;const form=document.getElementById('appointmentPopupForm');const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';document.body.classList.add('apt-lock');setTimeout(()=>document.getElementById('aptName')?.focus(),50)};const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';document.body.classList.remove('apt-lock')};document.addEventListener('click',e=>{const el=e.target&&e.target.closest?e.target.closest('[data-appointment-modal="1"]'):null;if(el){e.preventDefault();e.stopPropagation();open()}},true);modal.querySelector('.apt-close')?.addEventListener('click',e=>{e.preventDefault();close()});modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});form?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form),name=String(d.get('name')||'').trim(),phone=String(d.get('phone')||'').trim();if(!name||!phone){alert('Please enter your name and phone number.');return}const lines=['Hello Nanak Dental Clinic, I would like to request an appointment.','Name: '+name,'Phone: '+phone,'Treatment / Reason: '+String(d.get('service')||'General consultation'),'Preferred date: '+String(d.get('date')||'Flexible'),'Preferred time: '+String(d.get('time')||'Flexible'),'Note: '+String(d.get('message')||'No additional note')];location.href='https://wa.me/919999608619?text='+encodeURIComponent(lines.join('\\n'))})})();</script>
<!-- nanak-v3-fresh-mobile -->`;

  if (!html.includes('nanak-v3-fresh-mobile')) html = html.replace(/<\/body>/i, modal + '</body>');

  res.status(upstream.status);
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('cdn-cache-control', 'no-store');
  res.setHeader('vercel-cdn-cache-control', 'no-store');
  res.setHeader('pragma', 'no-cache');
  res.setHeader('expires', '0');
  res.setHeader('x-nanak-version', 'v3-fresh-mobile');
  return res.send(html);
};
