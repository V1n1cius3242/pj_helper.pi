// Libera visualização do body após validação no head
document.body.style.display = 'block';

function logout() {
    localStorage.clear();
    window.location.replace('login.html');
}

function mostrarAviso(mensagem, ehErro = false) {
    const banner = document.getElementById('bannerAviso');
    if (!banner) return;
    banner.innerText = mensagem;
    banner.className = ehErro ? 'aviso-erro' : 'aviso-sucesso';
    banner.style.display = 'block';

    setTimeout(() => {
        banner.style.display = 'none';
    }, 5000);
}

function fecharModais() {
    document.getElementById('modalMeet').style.display = 'none';
    document.getElementById('modalPdf').style.display = 'none';
}

function extrairDadosDescricao(descricaoTexto) {
    let link = null;
    let data = null;
    let detalhes = descricaoTexto || '';

    if (descricaoTexto && typeof descricaoTexto === 'string') {
        const linkMatch = descricaoTexto.match(/Link:\s*(https?:\/\/[^\s|]+)/i);
        if (linkMatch) link = linkMatch[1];

        const dataMatch = descricaoTexto.match(/Data:\s*([^\s|]+)/i);
        if (dataMatch) data = dataMatch[1];

        const detalhesMatch = descricaoTexto.match(/Detalhes:\s*(.+)$/i);
        if (detalhesMatch) detalhes = detalhesMatch[1];
    }

    return { link, data, detalhes };
}

function normalizarUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

let cacheContratos = [];
let cacheUsuarios = [];

async function carregarAdmin() {
    try {
        const rawUser = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const adminId = user ? (user.id || user.usuario_id) : null;

        // 1. Carregar Usuários
        const resUsers = await fetch('http://localhost:3000/admin/dados');
        const dadosUsers = await resUsers.json();
        cacheUsuarios = dadosUsers.usuarios || [];
        renderizarCadastros(cacheUsuarios);

        // 2. Carregar Reuniões e Contratos
        const resReunioes = await fetch('http://localhost:3000/admin/reunioes');
        cacheContratos = await resReunioes.json();
        aplicarFiltroSolicitacoes('todas');
        renderizarContratos(cacheContratos);

        // 3. Carregar Notificações do Banco
        if (adminId) {
            const resNotifs = await fetch(`http://localhost:3000/notificacoes?usuario_id=${adminId}`);
            const notificacoes = await resNotifs.json();
            renderizarNotificacoes(notificacoes);
        }

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        mostrarAviso('Erro de conexão ao carregar os dados do servidor!', true);
    }
}

// --- FILTRAR E RENDERIZAR SOLICITAÇÕES CORRETAMENTE POR CADA TAG ---
function aplicarFiltroSolicitacoes(statusFiltro) {
    const filtro = statusFiltro.toLowerCase().trim();
    let listaFiltrada = cacheContratos;

    if (filtro !== 'todas') {
        listaFiltrada = cacheContratos.filter(c => {
            const st = (c.status || 'pendente').toLowerCase();

            if (filtro === 'em aberto') {
                // Mostra contratos que ainda estão abertos/pendentes/em andamento
                return st.includes('pendente') || st.includes('aberto') || st.includes('em andamento');
            }
            if (filtro.includes('pendente')) {
                return st.includes('pendente');
            }
            if (filtro.includes('reunião') || filtro.includes('reuniao')) {
                return st.includes('reuniao') || st.includes('agendado');
            }
            if (filtro.includes('firmado') || filtro.includes('concluído') || filtro.includes('concluido')) {
                return st.includes('concluido') || st.includes('firmado');
            }
            if (filtro.includes('recusada') || filtro.includes('recusado')) {
                return st.includes('recusado');
            }
            return true;
        });
    }

    renderizarSolicitacoes(listaFiltrada);
}

function renderizarSolicitacoes(lista) {
    const container = document.getElementById('listaSolicitacoesCards');
    const contador = document.getElementById('contadorSolicitacoes');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhuma solicitação encontrada para este filtro.</div>';
        if (contador) contador.innerText = '0 solicitações';
        return;
    }

    if (contador) contador.innerText = `${lista.length} ${lista.length === 1 ? 'solicitação' : 'solicitações'}`;

    container.innerHTML = lista.map(c => {
        const extra = extrairDadosDescricao(c.descricao);
        const linkMeet = normalizarUrl(c.link_reuniao || extra.link);
        const rawData = c.data_reuniao || extra.data;
        const dataFormatada = rawData ? new Date(rawData).toLocaleString('pt-BR') : 'Sem data definida';
        
        const statusLower = (c.status || 'pendente').toLowerCase();
        let badgeClass = 'badge-pendente';
        let badgeTexto = '• Pendente';
        
        if (statusLower.includes('reuniao') || statusLower.includes('agendado')) {
            badgeClass = 'badge-reuniao';
            badgeTexto = '• Reunião agendada';
        } else if (statusLower.includes('concluido') || statusLower.includes('firmado')) {
            badgeClass = 'badge-ativo';
            badgeTexto = '• Firmado';
        } else if (statusLower.includes('recusado')) {
            badgeClass = 'badge-pendente';
            badgeTexto = '• Recusada';
        }

        // Lógica inteligente para os botões de ação baseada no status atual
        let botoesAcaoHtml = `
            <button onclick="abrirModalMeet(${c.contrato_id})" class="btn-acao-preto">📅 Agendar / Reagendar reunião</button>
        `;

        if (statusLower.includes('pendente') || statusLower.includes('agendado') || statusLower.includes('reuniao')) {
            botoesAcaoHtml += `
                <button onclick="confirmarContrato(${c.contrato_id})" class="btn-acao-sucesso">📑 Firmar contrato</button>
                <button onclick="atualizarStatusContrato(${c.contrato_id}, 'recusado')" class="btn-acao-recusar">✕ Recusar</button>
            `;
        } else if (statusLower.includes('concluido') || statusLower.includes('firmado')) {
            botoesAcaoHtml += `
                <span style="font-size: 13px; color: #38a169; font-weight: 600; margin-left: 5px;">✔ Contrato Firmado com Sucesso</span>
            `;
        }

        return `
            <div class="card-painel-item">
                <div class="card-item-header">
                    <span class="card-item-meta">#${c.contrato_id}</span>
                    <span class="badge-status ${badgeClass}">${badgeTexto}</span>
                </div>
                <h3 class="card-item-titulo">Serviço solicitado: <strong>${c.titulo_servico || 'Proposta'}</strong></h3>
                <p class="card-item-desc">${extra.detalhes || c.descricao || 'Sem descrição informada.'}</p>
                <div class="card-item-valores">
                    <span>Orçamento: <strong>R$ ${c.valor || 'A combinar'}</strong></span>
                    <span>Empresa ID: <strong>${c.empresa_usuario_id || 'N/I'}</strong> | MEI ID: <strong>${c.mei_usuario_id || 'N/I'}</strong></span>
                </div>
                ${linkMeet ? `
                    <div class="box-meet-agendado">
                        📹 Reunião: <strong>${dataFormatada}</strong> <a href="${linkMeet}" target="_blank" class="link-meet">acessar link ↗</a>
                    </div>
                ` : ''}
                <div class="card-item-acoes">
                    ${botoesAcaoHtml}
                </div>
            </div>
        `;
    }).join('');
}

// --- RENDERIZAR CONTRATOS (OCULTANDO OS RECUSADOS) ---
function renderizarContratos(lista) {
    const container = document.getElementById('listaContratosCards');
    if (!container) return;

    // Filtra para remover contratos que tenham status 'recusado'
    const contratosAtivos = lista.filter(c => {
        const statusContrato = (c.status || '').toLowerCase();
        return !statusContrato.includes('recusado');
    });

    if (!Array.isArray(contratosAtivos) || contratosAtivos.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhum contrato ativo ou em andamento no momento.</div>';
        return;
    }

    container.innerHTML = contratosAtivos.map(c => {
        const linkPdf = normalizarUrl(c.contrato_digitalizado_url);

        return `
            <div class="card-painel-item">
                <div class="card-item-header">
                    <span class="card-item-meta">Contrato #${c.contrato_id}</span>
                    <span class="badge-status badge-pendente">• ${(c.status || 'Em andamento').toUpperCase()}</span>
                </div>
                <h3 class="card-item-titulo">Contrato de ${c.titulo_servico || 'Serviço'}</h3>
                <div class="card-item-valores">
                    <span>Valor: <strong>R$ ${c.valor || 'A combinar'}</strong></span>
                </div>
                <div class="card-item-acoes" style="margin-top: 15px;">
                    ${linkPdf ? `<a href="${linkPdf}" target="_blank" class="btn-acao-secundario" style="text-decoration:none; display:inline-block;">📥 Baixar versão PDF</a>` : '<em style="font-size:13px; color:#888;">PDF não anexado</em>'}
                    <button onclick="abrirModalPdf(${c.contrato_id})" class="btn-acao-preto">📤 Anexar / Substituir PDF</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarCadastros(lista) {
    const container = document.getElementById('listaCadastrosCards');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhum usuário cadastrado.</div>';
        return;
    }

    container.innerHTML = lista.map(u => {
        const st = (u.status || 'pendente').toLowerCase();
        let badgeClass = 'badge-pendente';
        let badgeTexto = '• pendente';
        if (st === 'aprovado' || st === 'ativo') { badgeClass = 'badge-ativo'; badgeTexto = '• ativo'; }
        if (st === 'recusado') { badgeClass = 'badge-pendente'; badgeTexto = '• recusado'; }

        return `
            <div class="card-painel-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 class="card-item-titulo" style="margin-bottom: 4px;">ID #${u.id} - <strong>${u.email}</strong></h3>
                    <p style="font-size: 13px; color: #666;">Tipo: <strong>${(u.tipo || 'N/A').toUpperCase()}</strong></p>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="badge-status ${badgeClass}">${badgeTexto}</span>
                    ${st === 'pendente' ? `
                        <button onclick="alterarStatusUsuario(${u.id}, 'aprovado')" class="btn-acao-sucesso">Aprovar</button>
                        <button onclick="alterarStatusUsuario(${u.id}, 'recusado')" class="btn-acao-recusar">Recusar</button>
                    ` : '<em style="font-size:12px; color:#888;">Processado</em>'}
                </div>
            </div>
        `;
    }).join('');
}

// --- RENDERIZAR NOTIFICAÇÕES DO BANCO (SEM O SINO) ---
function renderizarNotificacoes(lista) {
    const container = document.getElementById('listaNotificacoesCards');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhuma notificação encontrada no momento.</div>';
        return;
    }

    container.innerHTML = lista.map(n => `
        <div class="card-notificacao">
            <div class="notif-conteudo" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 style="margin: 0;">Notificação #${n.id}</h4>
                    <span class="badge-status badge-nova">• nova</span>
                </div>
                <p>${n.mensagem}</p>
                <span class="notif-data">Sistema PJ Helper</span>
            </div>
        </div>
    `).join('');
}

// --- CLIQUE NAS PÍLULAS DE FILTRO ---
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-filtro')) {
        const grupo = e.target.closest('.linha-filtros-pills');
        if (grupo) {
            grupo.querySelectorAll('.pill-filtro').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            
            const textoFiltro = e.target.innerText;
            aplicarFiltroSolicitacoes(textoFiltro);
        }
    }
});

// AÇÃO DE APROVAR / RECUSAR USUÁRIO
async function alterarStatusUsuario(usuarioId, novoStatus) {
    if (!confirm(`Tem certeza que deseja marcar este usuário como ${novoStatus.toUpperCase()}?`)) return;

    try {
        const res = await fetch('http://localhost:3000/admin/aprovar-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioId, status: novoStatus })
        });

        const dados = await res.json();
        if (res.ok) {
            mostrarAviso(`Usuário ${novoStatus.toUpperCase()} com sucesso! E-mail enviado.`);
            carregarAdmin();
        } else {
            mostrarAviso('Erro: ' + (dados.erro || 'Erro no servidor'), true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão com o servidor!', true);
    }
}

// CONTROLE DOS MODAIS
function abrirModalMeet(contratoId) {
    document.getElementById('meetContratoId').value = contratoId;
    document.getElementById('inputMeetLink').value = '';
    document.getElementById('inputMeetData').value = '';
    document.getElementById('modalMeet').style.display = 'flex';
}

function abrirModalPdf(contratoId) {
    document.getElementById('pdfContratoId').value = contratoId;
    document.getElementById('inputPdfUrl').value = '';
    document.getElementById('modalPdf').style.display = 'flex';
}

// SALVAR REUNIÃO
async function salvarMeet() {
    const contratoId = document.getElementById('meetContratoId').value;
    const link = document.getElementById('inputMeetLink').value;
    const data = document.getElementById('inputMeetData').value;

    if (!link) {
        mostrarAviso('Insira o link da reunião antes de salvar!', true);
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/admin/agendar-reuniao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contrato_id: contratoId,
                link_reuniao: normalizarUrl(link),
                data_reuniao: data || null
            })
        });

        const dados = await res.json();
        fecharModais();

        if (res.ok) {
            mostrarAviso('Reunião agendada com sucesso!');
            carregarAdmin();
        } else {
            mostrarAviso('Erro ao salvar reunião: ' + (dados.erro || 'Erro no servidor'), true);
        }
    } catch (err) {
        fecharModais();
        mostrarAviso('Erro de conexão com o servidor!', true);
    }
}

// SALVAR PDF
async function salvarPdf() {
    const contratoId = document.getElementById('pdfContratoId').value;
    const url = document.getElementById('inputPdfUrl').value;

    if (!url) {
        mostrarAviso('Insira o link do arquivo PDF antes de salvar!', true);
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/admin/anexar-contrato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contrato_id: contratoId,
                contrato_digitalizado_url: normalizarUrl(url)
            })
        });

        const dados = await res.json();
        fecharModais();

        if (res.ok) {
            mostrarAviso('Contrato PDF anexado com sucesso!');
            carregarAdmin();
        } else {
            mostrarAviso('Erro ao anexar contrato: ' + (dados.erro || 'Erro no servidor'), true);
        }
    } catch (err) {
        fecharModais();
        mostrarAviso('Erro de conexão com o servidor!', true);
    }
}

// CONFIRMAR / ATUALIZAR CONTRATO
async function confirmarContrato(contratoId) {
    try {
        const res = await fetch('http://localhost:3000/admin/confirmar-contrato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contrato_id: contratoId, status: 'concluido' })
        });

        const dados = await res.json();
        if (res.ok) {
            mostrarAviso('Contrato marcado como concluído!');
            carregarAdmin();
        } else {
            mostrarAviso('Erro ao confirmar contrato: ' + (dados.erro || 'Erro no servidor'), true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão com o servidor!', true);
    }
}

async function atualizarStatusContrato(contratoId, novoStatus) {
    try {
        const res = await fetch('http://localhost:3000/admin/confirmar-contrato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contrato_id: contratoId, status: novoStatus })
        });

        if (res.ok) {
            mostrarAviso(`Solicitação atualizada para ${novoStatus}!`);
            carregarAdmin();
        } else {
            mostrarAviso('Erro ao atualizar solicitação.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão com o servidor!', true);
    }
}

carregarAdmin();