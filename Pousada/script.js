const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const grid = document.getElementById('gallery-grid');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCaption = document.getElementById('lightbox-caption');
const lbClose = document.querySelector('.lightbox-close');

async function loadGallery(){
  try{
    const res = await fetch('api/list.php', {cache:'no-store'});
    const data = await res.json();
    grid.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0){
      grid.innerHTML = '<p style="color:#6b7280">Aguarde, em breve novas fotos da pousada.</p>';
      return;
    }

    data.forEach(item => {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.title || 'Foto da pousada';
      img.loading = 'lazy';
      img.decoding = 'async';

      img.addEventListener('click', () => openLightbox(item));

      const cap = document.createElement('figcaption');
      cap.textContent = item.caption || '';

      fig.appendChild(img);
      if (item.caption) fig.appendChild(cap);
      grid.appendChild(fig);
    });
  }catch(e){
    console.error(e);
    grid.innerHTML = '<p style="color:#ef4444">Não foi possível carregar a galeria.</p>';
  }
}

function openLightbox(item){
  lbImg.src = item.url;
  lbImg.alt = item.title || 'Foto da pousada';
  lbCaption.textContent = item.caption || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

loadGallery();

(function(){
  const dlg = document.getElementById('img-dialog');
  const dlgImg = document.getElementById('img-dialog-src');
  const dlgCap = document.getElementById('img-dialog-cap');

  function openImg(el){
    const url = el.dataset.full || el.currentSrc || el.src;
    dlgImg.src = url;
    dlgImg.alt = el.alt || '';
    dlgCap.textContent = el.alt || '';
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      // Fallback simples
      dlg.setAttribute('open','');
    }
  }

  function bind(){
    document.querySelectorAll('.room-media img').forEach(img=>{
      img.setAttribute('tabindex','0');
      img.addEventListener('click', ()=>openImg(img));
      img.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImg(img); }
      });
    });

    // Fecha ao clicar no backdrop
    dlg.addEventListener('click', (e)=>{
      const rect = dlg.getBoundingClientRect();
      const clickedOutside = e.clientX < rect.left || e.clientX > rect.right ||
                             e.clientY < rect.top  || e.clientY > rect.bottom;
      if (clickedOutside) dlg.close();
    });

    // Esc fecha automaticamente em <dialog>, mas deixo como segurança:
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape' && dlg.open) dlg.close();
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', bind)
    : bind();
})();

// Tema claro/escuro (site público) //
(function(){
  const STORAGE_KEY = 'theme';               // 'light' | 'dark'
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');

  function currentTheme(){
    return root.classList.contains('dark') ? 'dark' : 'light';
  }

  function apply(theme){
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    root.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    // Acessibilidade/UX do botão
    if (btn){
      btn.setAttribute('aria-pressed', String(isDark));
      const iconEl = btn.querySelector('.theme-toggle__icon');
      if (iconEl) iconEl.textContent = isDark ? '☀️' : '🌙';
      btn.title = isDark ? 'Modo claro' : 'Modo escuro';
    }
  }

  // Estado inicial: respeita o salvo; senão, o aplicado pelo <head> ou o do sistema
  const saved = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }})();
  if (saved === 'light' || saved === 'dark') {
    apply(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(root.dataset.theme || (prefersDark ? 'dark' : 'light'));
  }

  // Clique no botão alterna o tema
  if (btn){
    btn.addEventListener('click', () => {
      apply(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // Se o usuário não fixou preferência, segue mudanças do sistema
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', e => {
    const userFixed = (() => { try { return !!localStorage.getItem(STORAGE_KEY); } catch { return true; }})();
    if (!userFixed) apply(e.matches ? 'dark' : 'light');
  });
})();
