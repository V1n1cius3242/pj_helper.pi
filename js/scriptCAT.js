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

        montarFiltrosLocal();

        filtrarCatalogo();

    } catch (err) {

        container.innerHTML = '<p style="color:#dc3545; grid-column: 1 / -1;">Erro ao carregar o catálogo de prestadores. Verifique se o servidor backend está rodando.</p>';

    }

}

function rotuloAtendimento(valor) {
    if (valor === 'presencial') return 'Presencial';
    if (valor === 'remoto') return 'Remoto';
    return 'Presencial ou remoto';
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
<span class="etiqueta-modalidade etiqueta-${s.modalidade || 'ambos'}">${rotuloAtendimento(s.modalidade)}</span>

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
<p><strong>Cidade:</strong> ${m.cidade ? (m.cidade + (m.uf ? ' / ' + m.uf : '')) : 'Não informada'}</p>
<p><strong>Atendimento:</strong> <span class="etiqueta-modalidade etiqueta-${m.modalidade_padrao || 'ambos'}">${rotuloAtendimento(m.modalidade_padrao)}</span></p>
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

    document.querySelectorAll('#containerCategorias .pill-btn').forEach(btn => btn.classList.remove('active'));

    botaoClicado.classList.add('active');

    categoriaSelecionada = categoria;

    filtrarCatalogo();

}

// =========================================================
// FILTRO DE MODALIDADE E LOCALIZACAO
// =========================================================

let modalidadeSelecionada = '';

function selecionarModalidade(botaoClicado, modalidade) {
    document.querySelectorAll('#containerModalidade .pill-btn').forEach(btn => btn.classList.remove('active'));
    botaoClicado.classList.add('active');
    modalidadeSelecionada = modalidade;
    filtrarCatalogo();
}

// Um MEI atende "presencial" se o perfil dele aceita presencial
// OU se ele tem pelo menos um servico presencial cadastrado.
function atendeModalidade(m, modalidade) {
    if (!modalidade) return true;

    const padrao = m.modalidade_padrao || 'ambos';
    if (padrao === modalidade || padrao === 'ambos') return true;

    const servicos = Array.isArray(m.servicos) ? m.servicos : [];
    return servicos.some(s => s.modalidade === modalidade || s.modalidade === 'ambos');
}

// Os selects so oferecem estados e cidades onde existe prestador
function montarFiltrosLocal() {
    const selUF = document.getElementById('filtroUF');
    if (!selUF) return;

    const ufs = [...new Set(listaMeisGeral.map(m => m.uf).filter(Boolean))].sort();
    selUF.innerHTML = '<option value="">Estado</option>' +
        ufs.map(u => `<option value="${u}">${u}</option>`).join('');
    if (window.PJSelect) PJSelect.atualizar(selUF);

    montarCidades('');
    mostrarBotaoMinhaCidade();
}

function montarCidades(uf) {
    const selCidade = document.getElementById('filtroCidade');
    if (!selCidade) return;

    const cidades = [...new Set(
        listaMeisGeral
            .filter(m => !uf || m.uf === uf)
            .map(m => m.cidade)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    selCidade.innerHTML = '<option value="">Cidade</option>' +
        cidades.map(c => `<option value="${c}">${c}</option>`).join('');
    if (window.PJSelect) PJSelect.atualizar(selCidade);
}

function aoTrocarUF() {
    montarCidades(document.getElementById('filtroUF').value);
    filtrarCatalogo();
}

// Empresa logada com cidade cadastrada ganha o atalho
let cidadeEmpresaLogada = null;

async function mostrarBotaoMinhaCidade() {
    const btn = document.getElementById('btnMinhaCidade');
    if (!btn) return;

    const raw = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');
    const user = raw ? JSON.parse(raw) : null;
    if (!user || !['empresa', 'empresa_grande'].includes(user.tipo)) return;

    try {
        const res = await fetch(`http://localhost:3000/perfil-empresa?usuario_id=${user.id}`);
        const perfil = await res.json();
        if (perfil && perfil.cidade && perfil.uf) {
            cidadeEmpresaLogada = { cidade: perfil.cidade, uf: perfil.uf };
            btn.innerText = `Presencial em ${perfil.cidade}`;
            btn.style.display = 'inline-block';
        }
    } catch (err) {
        console.error('Erro ao buscar cidade da empresa:', err);
    }
}

function filtrarPelaMinhaCidade() {
    if (!cidadeEmpresaLogada) return;

    const selUF = document.getElementById('filtroUF');
    const selCidade = document.getElementById('filtroCidade');

    // garante que a opcao exista mesmo se ninguem atende la ainda
    if (![...selUF.options].some(o => o.value === cidadeEmpresaLogada.uf)) {
        selUF.insertAdjacentHTML('beforeend', `<option value="${cidadeEmpresaLogada.uf}">${cidadeEmpresaLogada.uf}</option>`);
    }
    selUF.value = cidadeEmpresaLogada.uf;
    montarCidades(cidadeEmpresaLogada.uf);

    if (![...selCidade.options].some(o => o.value === cidadeEmpresaLogada.cidade)) {
        selCidade.insertAdjacentHTML('beforeend', `<option value="${cidadeEmpresaLogada.cidade}">${cidadeEmpresaLogada.cidade}</option>`);
    }
    selCidade.value = cidadeEmpresaLogada.cidade;

    // as opcoes podem ter sido inseridas acima: refaz as listas do componente
    if (window.PJSelect) {
        PJSelect.atualizar(selUF);
        PJSelect.atualizar(selCidade);
    }

    const pillPresencial = [...document.querySelectorAll('#containerModalidade .pill-btn')]
        .find(b => b.innerText.trim() === 'Presencial');
    if (pillPresencial) selecionarModalidade(pillPresencial, 'presencial');
    else filtrarCatalogo();
}

// Mostra "3 de 7 prestadores" e o link de limpar so quando ha filtro
function atualizarResumo(qtd, termo, uf, cidade) {
    const contador = document.getElementById('contadorResultados');
    const limpar = document.getElementById('btnLimparFiltros');
    const total = listaMeisGeral.length;

    const temFiltro = Boolean(termo || categoriaSelecionada || modalidadeSelecionada || uf || cidade);
    const palavra = total === 1 ? 'prestador' : 'prestadores';

    if (contador) {
        contador.innerHTML = temFiltro
            ? `<strong>${qtd}</strong> de ${total} ${palavra}`
            : `<strong>${total}</strong> ${palavra}`;
    }
    if (limpar) limpar.style.display = temFiltro ? 'inline' : 'none';
}

function limparFiltros() {
    document.getElementById('inputBusca').value = '';

    const primeiraCategoria = document.querySelector('#containerCategorias .pill-btn');
    if (primeiraCategoria) selecionarCategoria(primeiraCategoria, '');

    const primeiraModalidade = document.querySelector('#containerModalidade .pill-btn');
    document.querySelectorAll('#containerModalidade .pill-btn').forEach(b => b.classList.remove('active'));
    if (primeiraModalidade) primeiraModalidade.classList.add('active');
    modalidadeSelecionada = '';

    const selUF = document.getElementById('filtroUF');
    selUF.value = '';
    if (window.PJSelect) PJSelect.sincronizar(selUF);
    montarCidades('');

    filtrarCatalogo();
}

function filtrarCatalogo() {

    const termo = document.getElementById('inputBusca').value.toLowerCase().trim();

    const cat = categoriaSelecionada.toLowerCase().trim();
    const uf = document.getElementById('filtroUF') ? document.getElementById('filtroUF').value : '';
    const cidade = document.getElementById('filtroCidade') ? document.getElementById('filtroCidade').value : '';

    const filtrados = listaMeisGeral.filter(m => {

        const nomeFantasia = (m.nome_fantasia || '').toLowerCase();

        const categoria = (m.categoria || '').toLowerCase();

        const bateTexto = termo === '' || nomeFantasia.includes(termo) || (m.cnpj || '').toLowerCase().includes(termo);

        const bateCategoria = cat === '' || categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const bateModalidade = atendeModalidade(m, modalidadeSelecionada);
        const bateUF = uf === '' || (m.uf || '') === uf;
        const bateCidade = cidade === '' || (m.cidade || '') === cidade;

        return bateTexto && bateCategoria && bateModalidade && bateUF && bateCidade;

    });

    exibirCatalogo(filtrados);

    atualizarResumo(filtrados.length, termo, uf, cidade);

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
 