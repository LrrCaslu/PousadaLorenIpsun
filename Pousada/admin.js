const loginBox = document.getElementById('login-box');
const panel = document.getElementById('panel');
const loginForm = document.getElementById('login-form');
const loginMsg = document.getElementById('login-msg');
const btnLogout = document.getElementById('btn-logout');
const uploadForm = document.getElementById('upload-form');
const uploadMsg = document.getElementById('upload-msg');
const listEl = document.getElementById('list');

let csrfToken = null;

async function tryFetch(url, opts={}){
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: {'X-Requested-With':'fetch'},
    ...opts
  });
  if (res.headers.get('content-type')?.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data?.error || 'Erro'), {status: res.status, data});
    return data;
  } else {
    if (!res.ok) throw new Error('Erro de rede');
    return {};
  }
}

async function checkSession(){
  try{
    await loadList(); // se conseguir listar, está logado
    loginBox.hidden = true;
    panel.hidden = false;
    btnLogout.hidden = false;
  }catch(e){
    loginBox.hidden = false;
    panel.hidden = true;
    btnLogout.hidden = true;
  }
}

loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  loginMsg.textContent = 'Entrando...';
  const fd = new FormData(loginForm);
  try{
    const data = await tryFetch('api/login.php', {method:'POST', body:fd});
    csrfToken = data.csrf;
    loginMsg.textContent = '';
    await checkSession();
  }catch(err){
    loginMsg.textContent = 'Usuário ou senha inválidos.';
  }
});

btnLogout?.addEventListener('click', async ()=>{
  await tryFetch('api/logout.php', {method:'POST'});
  csrfToken = null;
  loginBox.hidden = false;
  panel.hidden = true;
  btnLogout.hidden = true;
});

uploadForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  uploadMsg.textContent = 'Enviando...';
  const fd = new FormData(uploadForm);
  if (csrfToken) fd.append('csrf', csrfToken);
  try{
    await tryFetch('api/upload.php', {method:'POST', body:fd});
    uploadMsg.textContent = 'Imagem enviada com sucesso!';
    uploadForm.reset();
    await loadList();
  }catch(err){
    uploadMsg.textContent = err?.data?.error || 'Falha ao enviar imagem.';
  }
});

async function loadList(){
  const data = await tryFetch('api/list.php');
  renderList(data);
  return data;
}

function renderList(items){
  listEl.innerHTML = '';
  if (!Array.isArray(items) || items.length === 0){
    listEl.innerHTML = '<p class="msg">Nenhuma foto cadastrada.</p>';
    return;
  }
  items.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'list-item';

    const thumb = document.createElement('img');
    thumb.src = item.url; thumb.alt = item.title || 'Foto';

    const meta = document.createElement('div');
    meta.className = 'item-meta';

    const tTitle = document.createElement('input');
    tTitle.value = item.title || '';
    tTitle.placeholder = 'Título';

    const tCaption = document.createElement('input');
    tCaption.value = item.caption || '';
    tCaption.placeholder = 'Legenda';

    const tOrder = document.createElement('input');
    tOrder.type = 'number';
    tOrder.value = item.order ?? 0;
    tOrder.title = 'Ordem';

    meta.appendChild(tTitle);
    meta.appendChild(tCaption);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const btnSave = document.createElement('button');
    btnSave.className = 'btn-primary';
    btnSave.textContent = 'Salvar';

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-danger';
    btnDelete.textContent = 'Excluir';

    const orderWrap = document.createElement('div');
    orderWrap.innerHTML = `<small class="muted">Ordem</small>`;
    orderWrap.appendChild(tOrder);

    actions.appendChild(orderWrap);
    actions.appendChild(btnSave);
    actions.appendChild(btnDelete);

    row.appendChild(thumb);
    const metaWrap = document.createElement('div');
    metaWrap.appendChild(meta);
    metaWrap.appendChild(document.createElement('div')).innerHTML = `<small class="muted">ID: ${item.id}</small>`;
    row.appendChild(metaWrap);
    row.appendChild(actions);

    btnSave.addEventListener('click', async ()=>{
      const payload = new FormData();
      payload.append('id', item.id);
      payload.append('title', tTitle.value);
      payload.append('caption', tCaption.value);
      payload.append('order', Number(tOrder.value) || 0);
      if (csrfToken) payload.append('csrf', csrfToken);
      btnSave.disabled = true; btnSave.textContent = 'Salvando...';
      try{
        await tryFetch('api/update.php', {method:'POST', body:payload});
        await loadList();
      }catch(e){ alert(e?.data?.error || 'Erro ao salvar'); }
      finally{ btnSave.disabled = false; btnSave.textContent = 'Salvar'; }
    });

    btnDelete.addEventListener('click', async ()=>{
      if (!confirm('Excluir esta foto?')) return;
      const payload = new FormData();
      payload.append('id', item.id);
      if (csrfToken) payload.append('csrf', csrfToken);
      btnDelete.disabled = true; btnDelete.textContent = 'Excluindo...';
      try{
        await tryFetch('api/delete.php', {method:'POST', body:payload});
        await loadList();
      }catch(e){ alert(e?.data?.error || 'Erro ao excluir'); }
      finally{ btnDelete.disabled = false; btnDelete.textContent = 'Excluir'; }
    });

    listEl.appendChild(row);
  });
}

checkSession();
