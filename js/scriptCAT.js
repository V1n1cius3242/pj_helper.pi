let listaMeisGeral = [];

const rawUserCatalogo = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');

const userCatalogo = rawUserCatalogo ? JSON.parse(rawUserCatalogo) : null;

document.addEventListener('DOMContentLoaded', () => {

    const btnVoltar = document.getElementById('btnVoltarPainel');

    if (userCatalogo && btnVoltar) {

        const tipo = (userCatalogo.tipo || '').toString().toLowerCase();

        if (tipo === 'empresa' || tipo === 'empresa_grande') {

            btnVoltar.href = 'painel_empresa.html';

        } else if (tipo === 'mei') {

            btnVoltar.href = 'painel_mei.html';

        } else if (tipo === 'admin') {

            btnVoltar.href = 'painel_admin.html';

        } else {

            btnVoltar.href = 'login.html';

        }

    }

});

function mostrarAviso(msg, ehErro = false) {

    const banner = document.getElementById('bannerAviso');

    if (!banner) return;

    banner.innerText = msg;

    banner.className = ehErro ? 'erro' : 'sucesso';

    banner.style.display = 'block';

    banner.style.opacity = '1';

    setTimeout(() => {

        banner.style.opacity = '0';

        setTimeout(() => { banner.style.display = 'none'; }, 300);

    }, 4000);

}

async function carregarCatalogo() {

    const container = document.getElementById('gridCatalogo');

    try {

        let res = await fetch('http://localhost:3000/perfis-mei');

        if (!res.ok) res = await fetch('http://localhost:3000/catalogo-completo');

        if (!res.ok) throw new Error("Erro na rota do catálogo");

        listaMeisGeral = await res.json();

        exibirCatalogo(listaMeisGeral);

    } catch (err) {

        container.innerHTML = '<p style="color:#dc3545; grid-column: 1 / -1;">Erro ao carregar o catálogo de prestadores. Verifique se o servidor backend está rodando.</p>';

    }

}

function exibirCatalogo(lista) {

    const container = document.getElementById('gridCatalogo');

    if (!Array.isArray(lista) || lista.length === 0) {

        container.innerHTML = '<p style="color:#888; grid-column: 1 / -1;">Nenhum prestador MEI encontrado.</p>';

        return;

    }

    container.innerHTML = lista.map(m => {

        const idMei = m.usuario_id || m.id;

        const nomeExibicao = m.nome_fantasia || m.razao_social || 'Profissional MEI';

        const linkSite = m.site ? (m.site.startsWith('http') ? m.site : `https://${m.site}`) : null;

        const userInsta = m.instagram ? m.instagram.replace('@', '').trim() : null;

        const servicosHTML = (m.servicos && m.servicos.length > 0) ? `
<div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
<strong>Serviços e Tabela de Preços:</strong>
<ul style="padding-left: 18px; margin: 6px 0 0 0; font-size: 0.85em; color: #333;">

                    ${m.servicos.map(s => `
<li style="margin-bottom: 4px;">
<strong>${s.titulo}</strong>: <span style="color:#28a745; font-weight:bold;">${s.preco ? `R$ ${parseFloat(s.preco).toFixed(2)}` : 'A combinar'}</span>

                            ${s.descricao ? `<br><small style="color:#666;">${s.descricao}</small>` : ''}
</li>

                    `).join('')}
</ul>
</div>

        ` : '<p style="font-size:0.8em; color:#888; margin-top:8px;"><em>Nenhum serviço cadastrado.</em></p>';

        return `
<div class="card-mei">
<div>
<span class="badge-cat">${m.categoria || 'Geral'}</span>
<h4 style="margin-bottom: 5px;">${nomeExibicao}</h4>

                    ${m.razao_social && m.razao_social !== nomeExibicao ? `<p style="font-size:0.85em; color:#666;"><strong>Razão Social:</strong> ${m.razao_social}</p>` : ''}
<p><strong>CNPJ:</strong> ${m.cnpj || 'Não informado'}</p>
<p><strong>Cidade:</strong> ${m.cidade || 'Não informada'}</p>
<p><strong>Experiência:</strong> ${m.anos_experiencia || 0} ano(s)</p>
<div style="margin-top: 8px; font-size:0.88em; color:#444;">
<p><strong>Telefone:</strong> ${m.telefone || 'Não informado'}</p>
<p><strong>E-mail:</strong> ${m.email || 'Não informado'}</p>
</div>

                    ${linkSite ? `<p style="font-size:0.85em; margin-top:4px;"><strong>Site:</strong> <a href="${linkSite}" target="_blank" style="color:#3faf6e; text-decoration:underline;">${m.site}</a></p>` : ''}

                    ${userInsta ? `<p style="font-size:0.85em; margin-top:4px;"><strong>Instagram:</strong> <a href="https://instagram.com/${userInsta}" target="_blank" style="color:#3faf6e; text-decoration:underline;">@${userInsta}</a></p>` : ''}
<div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #ddd;">
<div><strong style="display: block; margin-bottom: 4px; font-size: 0.88rem; color: #414141;">Resumo:</strong><div class="modal-descricao-bloco">${m.resumo_servico || 'Sem resumo.'}</div></div>

                        ${m.apresentacao ? `<div style="margin-top: 10px;"><strong style="display: block; margin-bottom: 4px; font-size: 0.88rem; color: #414141;">Sobre:</strong><div class="modal-descricao-bloco">${m.apresentacao}</div></div>` : ''}
</div>

                    ${servicosHTML}
</div>
<button onclick="abrirModal(${idMei}, '${nomeExibicao}')" class="btn-acao" style="margin-top:15px;">Solicitar / Propor Serviço</button>
</div>

        `;

    }).join('');

}

let categoriaSelecionada = '';

function selecionarCategoria(botaoClicado, categoria) {

    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));

    botaoClicado.classList.add('active');

    categoriaSelecionada = categoria;

    filtrarCatalogo();

}

function filtrarCatalogo() {

    const termo = document.getElementById('inputBusca').value.toLowerCase().trim();

    const cat = categoriaSelecionada.toLowerCase().trim();

    const filtrados = listaMeisGeral.filter(m => {

        const nomeFantasia = (m.nome_fantasia || '').toLowerCase();

        const categoria = (m.categoria || '').toLowerCase();

        const bateTexto = termo === '' || nomeFantasia.includes(termo) || (m.cnpj || '').toLowerCase().includes(termo);

        const bateCategoria = cat === '' || categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        return bateTexto && bateCategoria;

    });

    exibirCatalogo(filtrados);

}

function abrirModal(meiUsuarioId, nomeMei) {

    const atual = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');

    if (!atual) {

        mostrarAviso('Você precisa estar logado como Empresa para enviar uma proposta!', true);

        setTimeout(() => { window.location.href = 'login.html'; }, 1500);

        return;

    }

    const parsedUser = JSON.parse(atual);

    const tipo = (parsedUser.tipo || '').toString().toLowerCase();

    if (tipo !== 'empresa' && tipo !== 'empresa_grande') {

        mostrarAviso('Apenas contas do tipo Empresa podem enviar propostas para os MEIs!', true);

        return;

    }

    document.getElementById('modal_mei_usuario_id').value = meiUsuarioId;

    document.getElementById('modalNomeMei').innerText = 'Para: ' + nomeMei;

    const modal = document.getElementById('modalProposta');

    modal.style.display = 'flex';

    setTimeout(() => modal.classList.add('ativo'), 10);

}

function fecharModal() {

    const modal = document.getElementById('modalProposta');

    modal.classList.remove('ativo');

    setTimeout(() => {

        modal.style.display = 'none';

        document.getElementById('formModalProposta').reset();

    }, 300);

}

document.getElementById('formModalProposta').addEventListener('submit', async (e) => {

    e.preventDefault();

    const dados = {

        empresa_usuario_id: userCatalogo.id,

        mei_usuario_id: document.getElementById('modal_mei_usuario_id').value,

        titulo_servico: document.getElementById('modal_titulo_servico').value,

        valor: document.getElementById('modal_valor').value,

        descricao: document.getElementById('modal_descricao').value

    };

    try {

        let res = await fetch('http://localhost:3000/proposta', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(dados)

        });

        if (res.ok) {

            mostrarAviso('Proposta enviada ao prestador com sucesso!');

            fecharModal();

        } else {

            mostrarAviso('Erro ao enviar proposta ao servidor.', true);

        }

    } catch (err) {

        mostrarAviso('Erro de conexão ao enviar a proposta!', true);

    }

});

carregarCatalogo();
 