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
let subabaCadastrosAtual = 'mei'; // 'mei', 'empresa' ou 'equipe'
let filtroStatusCadastrosAtual = 'todos';
let adminIdGlobal = null;
let tipoUsuarioGlobal = '';

async function carregarAdmin() {
    try {
        const rawUser = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');
        const user = rawUser ? JSON.parse(rawUser) : null;
        adminIdGlobal = user ? (user.id || user.usuario_id) : null;
        tipoUsuarioGlobal = user && user.tipo ? user.tipo.toString().toLowerCase() : '';

        // Colaborador usa o painel, mas nao gera convites
        const abaConvites = document.getElementById('aba-btn-convites');
        if (abaConvites && tipoUsuarioGlobal === 'admin') {
            abaConvites.style.display = 'inline-block';
            carregarConvites();
        }

        // 1. Carregar Usuários
        const resUsers = await fetch('http://localhost:3000/admin/dados');
        const dadosUsers = await resUsers.json();
        cacheUsuarios = dadosUsers.usuarios || [];
        aplicarFiltrosCadastros();

        // 2. Carregar Reuniões e Contratos
        const resReunioes = await fetch('http://localhost:3000/admin/reunioes');
        cacheContratos = await resReunioes.json();
        aplicarFiltroSolicitacoes('todas');
        renderizarContratos(cacheContratos);

        // 3. Carregar Notificações do Banco
        carregarNotificacoesAdmin();

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        mostrarAviso('Erro de conexão ao carregar os dados do servidor!', true);
    }
}

async function carregarNotificacoesAdmin() {
    if (!adminIdGlobal) return;
    try {
        const resNotifs = await fetch(`http://localhost:3000/notificacoes?usuario_id=${adminIdGlobal}`);
        const notificacoes = await resNotifs.json();
        renderizarNotificacoes(notificacoes);
    } catch (err) {
        console.error('Erro ao carregar notificações', err);
    }
}

// --- AÇÃO DE MARCAR TODAS COMO LIDAS ---
async function marcarTodasComoLidas() {
    if (!adminIdGlobal) return;
    try {
        const res = await fetch('http://localhost:3000/admin/marcar-notificacoes-lidas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: adminIdGlobal })
        });
        if (res.ok) {
            mostrarAviso('Todas as notificações foram marcadas como lidas!');
            carregarNotificacoesAdmin();
        }
    } catch (err) {
        mostrarAviso('Erro ao atualizar notificações.', true);
    }
}

// Vincula o botão de marcar como lidas no HTML dinamicamente
document.addEventListener('DOMContentLoaded', () => {
    const btnMarcarLidas = document.querySelector('.btn-marcar-lidas');
    if (btnMarcarLidas) {
        btnMarcarLidas.addEventListener('click', marcarTodasComoLidas);
    }
});

// --- FILTRAR E RENDERIZAR SOLICITAÇÕES ---
function aplicarFiltroSolicitacoes(statusFiltro) {
    const filtro = statusFiltro.toLowerCase().trim();
    let listaFiltrada = cacheContratos;

    if (filtro !== 'todas') {
        listaFiltrada = cacheContratos.filter(c => {
            const st = (c.status || 'pendente').toLowerCase();
            if (filtro === 'em aberto') return st.includes('pendente') || st.includes('aberto') || st.includes('em andamento');
            if (filtro.includes('pendente')) return st.includes('pendente');
            if (filtro.includes('reunião') || filtro.includes('reuniao')) { 
                return st.includes('reuniao') || st.includes('reunião') || st.includes('agendado') || (c.link_reuniao && c.link_reuniao.trim() !== ''); 
            }
            if (filtro.includes('firmado') || filtro.includes('concluído') || filtro.includes('concluido')) return st.includes('concluido') || st.includes('firmado');
            if (filtro.includes('recusada') || filtro.includes('recusado')) return st.includes('recusado');
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

    // BLINDA CONTRA DUPLICAÇÃO: Garante IDs de contrato únicos
    const listaUnica = Array.from(new Map(lista.map(item => [item.contrato_id, item])).values());

    if (contador) contador.innerText = `${listaUnica.length} ${listaUnica.length === 1 ? 'solicitação' : 'solicitações'}`;

    container.innerHTML = listaUnica.map(c => {
        const extra = extrairDadosDescricao(c.descricao);
        const linkMeet = normalizarUrl(c.link_reuniao || extra.link);
        const rawData = c.data_reuniao || extra.data;
        const dataFormatada = rawData ? new Date(rawData).toLocaleString('pt-BR') : 'Sem data definida';
        
        const statusLower = (c.status || 'pendente').toLowerCase();
        let badgeClass = 'badge-pendente';
        let badgeTexto = '• Pendente';
        
        if (statusLower.includes('reuniao') || statusLower.includes('reunião') || statusLower.includes('agendado')) {
            badgeClass = 'badge-reuniao';
            badgeTexto = '• Reunião agendada';
        } else if (statusLower.includes('concluido') || statusLower.includes('concluído') || statusLower.includes('firmado')) {
            badgeClass = 'badge-ativo';
            badgeTexto = '• Firmado';
        } else if (statusLower.includes('recusado')) {
            badgeClass = 'badge-pendente';
            badgeTexto = '• Recusada';
        }

        let botoesAcaoHtml = `
            <button onclick="abrirModalMeet(${c.contrato_id})" class="btn-acao-preto">Agendar / Reagendar reunião</button>
        `;

        if (statusLower.includes('pendente') || statusLower.includes('agendado') || statusLower.includes('reuniao') || statusLower.includes('reunião')) {
            botoesAcaoHtml += `
                <button onclick="confirmarContrato(${c.contrato_id})" class="btn-acao-sucesso">Firmar contrato</button>
                <button onclick="atualizarStatusContrato(${c.contrato_id}, 'recusado')" class="btn-acao-recusar">Recusar</button>
            `;
        } else if (statusLower.includes('concluido') || statusLower.includes('concluído') || statusLower.includes('firmado')) {
            botoesAcaoHtml += `
                <span style="font-size: 13px; color: #38a169; font-weight: 600; margin-left: 5px;">Contrato Firmado com Sucesso</span>
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
                        Reunião: <strong>${dataFormatada}</strong> <a href="${linkMeet}" target="_blank" class="link-meet">acessar link</a>
                    </div>
                ` : ''}
                <div class="card-item-acoes">
                    ${botoesAcaoHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderizarContratos(lista) {
    const container = document.getElementById('listaContratosCards');
    if (!container) return;

    const contratosAtivos = lista.filter(c => !((c.status || '').toLowerCase()).includes('recusado'));

    if (!Array.isArray(contratosAtivos) || contratosAtivos.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhum contrato ativo ou em andamento no momento.</div>';
        return;
    }

    container.innerHTML = contratosAtivos.map(c => {
        const linkPdf = normalizarUrl(c.contrato_digitalizado_url);
        const statusBruto = (c.status || 'Em andamento').toLowerCase();
        const statusFormatado = '• ' + statusBruto.charAt(0).toUpperCase() + statusBruto.slice(1);

        return `
            <div class="card-painel-item">
                <div class="card-item-header">
                    <span class="card-item-meta">Contrato #${c.contrato_id}</span>
                    <span class="badge-status badge-pendente">${statusFormatado}</span>
                </div>
                <h3 class="card-item-titulo">Contrato de ${c.titulo_servico || 'Serviço'}</h3>
                <div class="card-item-valores">
                    <span>Valor: <strong>R$ ${c.valor || 'A combinar'}</strong></span>
                </div>
                <div class="card-item-acoes" style="margin-top: 15px;">
                    ${linkPdf ? `<a href="${linkPdf}" target="_blank" class="btn-acao-secundario" style="text-decoration:none; display:inline-block;">Baixar versão PDF</a>` : '<em style="font-size:13px; color:#888;">PDF não anexado</em>'}
                    <button onclick="abrirModalPdf(${c.contrato_id})" class="btn-acao-preto">Anexar / Substituir PDF</button>
                </div>
            </div>
        `;
    }).join('');
}


// --- CONTROLE DAS SUBABAS E FILTROS DE CADASTROS ---
function alternarSubabaCadastros(tipo) {
    subabaCadastrosAtual = tipo; // 'mei', 'empresa' ou 'equipe'

    const btnMei = document.getElementById('btnSubMei');
    const btnEmpresa = document.getElementById('btnSubEmpresa');
    const btnEquipe = document.getElementById('btnSubEquipe');

    if (btnMei && btnEmpresa) {
        btnMei.classList.toggle('ativa', tipo === 'mei');
        btnEmpresa.classList.toggle('ativa', tipo === 'empresa');
        if (btnEquipe) btnEquipe.classList.toggle('ativa', tipo === 'equipe');
    }
    aplicarFiltrosCadastros();
}

function aplicarFiltrosCadastros() {
    let lista = cacheUsuarios.filter(u => {
        const tipoUser = (u.tipo || '').toLowerCase();
        if (subabaCadastrosAtual === 'mei') return tipoUser === 'mei';
        if (subabaCadastrosAtual === 'empresa') return tipoUser === 'empresa' || tipoUser === 'empresa_grande';
        if (subabaCadastrosAtual === 'equipe') return tipoUser === 'admin' || tipoUser === 'colaborador';
        return false;
    });

    if (filtroStatusCadastrosAtual !== 'todos') {
        lista = lista.filter(u => {
            const st = (u.status || 'pendente').toLowerCase();
            const filtroAtual = filtroStatusCadastrosAtual.toLowerCase();

            // 'st' já vem em minúsculas, então a comparação também precisa estar
            if (filtroAtual === 'pendentes' || filtroAtual === 'pendente') return st === 'pendente';
            if (filtroAtual === 'ativos' || filtroAtual === 'aprovado') return st === 'aprovado' || st === 'ativo';
            if (filtroAtual === 'recusados' || filtroAtual === 'recusado') return st === 'recusado';
            if (filtroAtual === 'suspensos' || filtroAtual === 'suspenso') return st === 'suspenso';

            return st.includes(filtroAtual);
        });
    }

    renderizarCadastros(lista);
}

function renderizarCadastros(lista) {
    const container = document.getElementById('listaCadastrosCards');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = `<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhum registo encontrado para esta categoria.</div>`;
        return;
    }

    container.innerHTML = lista.map(u => {
        const st = (u.status || 'pendente').toLowerCase();
        let badgeClass = 'badge-pendente';
        let badgeTexto = '• Pendente';
        if (st === 'aprovado' || st === 'ativo') { badgeClass = 'badge-ativo'; badgeTexto = '• Ativo'; }
        if (st === 'recusado') { badgeClass = 'badge-pendente'; badgeTexto = '• Recusado'; }

        return `
            <div class="card-painel-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h3 class="card-item-titulo" style="margin-bottom: 4px;">ID #${u.id} - ${u.email}</h3>
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

document.addEventListener('click', (e) => {
    if (e.target.id === 'btnSubMei') {
        alternarSubabaCadastros('mei');
    } else if (e.target.id === 'btnSubEmpresa') {
        alternarSubabaCadastros('empresa');
    } else if (e.target.id === 'btnSubEquipe') {
        alternarSubabaCadastros('equipe');
    }

    if (e.target.classList.contains('pill-filtro')) {
        const grupo = e.target.closest('.linha-filtros-pills');
        if (grupo) {
            grupo.querySelectorAll('.pill-filtro').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            
            const textoFiltro = e.target.innerText.toLowerCase();
            const secaoCadastrosAtiva = document.getElementById('secao-cadastros').style.display !== 'none';

            if (secaoCadastrosAtiva) {
                filtroStatusCadastrosAtual = textoFiltro;
                if (filtroStatusCadastrosAtual === 'ativos') filtroStatusCadastrosAtual = 'aprovado';
                aplicarFiltrosCadastros();
            } else {
                aplicarFiltroSolicitacoes(e.target.innerText);
            }
        }
    }
});

function renderizarNotificacoes(lista) {
    const container = document.getElementById('listaNotificacoesCards');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhuma notificação encontrada no momento.</div>';
        return;
    }

    const listaUnica = Array.from(new Map(lista.map(item => [item.id, item])).values());

    container.innerHTML = listaUnica.map(n => `
        <div class="card-notificacao">
            <div class="notif-conteudo" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 style="margin: 0;">Notificação #${n.id}</h4>
                    <span class="badge-status badge-nova">• ${n.lida ? 'lida' : 'nova'}</span>
                </div>
                <p>${n.mensagem}</p>
                <span class="notif-data">Sistema PJ Helper</span>
            </div>
        </div>
    `).join('');
}

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

// =========================================================
// CONVITES DE ACESSO DA EQUIPE (somente administrador)
// =========================================================

async function carregarConvites() {
    if (!adminIdGlobal) return;
    try {
        const res = await fetch(`http://localhost:3000/admin/convites?usuario_id=${adminIdGlobal}`);
        const lista = await res.json();
        if (!res.ok) throw new Error(lista.erro || 'Erro ao carregar convites.');
        renderizarConvites(lista);
    } catch (err) {
        console.error('Erro ao carregar convites:', err);
        mostrarAviso('Nao foi possivel carregar os convites.', true);
    }
}

async function gerarConvite() {
    if (!adminIdGlobal) return;
    const tipo = document.getElementById('tipoConvite').value;

    try {
        const res = await fetch('http://localhost:3000/admin/gerar-convite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: adminIdGlobal, tipo })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro ao gerar convite.');

        mostrarAviso(`Codigo ${data.convite.codigo} gerado para ${tipo}.`);
        carregarConvites();
    } catch (err) {
        mostrarAviso(err.message, true);
    }
}

async function revogarConvite(conviteId) {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;

    try {
        const res = await fetch('http://localhost:3000/admin/revogar-convite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: adminIdGlobal, convite_id: conviteId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro ao cancelar convite.');

        mostrarAviso('Convite cancelado.');
        carregarConvites();
    } catch (err) {
        mostrarAviso(err.message, true);
    }
}

function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo)
        .then(() => mostrarAviso(`Codigo ${codigo} copiado!`))
        .catch(() => mostrarAviso('Nao foi possivel copiar o codigo.', true));
}

function formatarDataConvite(valor) {
    if (!valor) return '-';
    const d = new Date(valor.replace(' ', 'T') + 'Z');
    return isNaN(d) ? valor : d.toLocaleString('pt-BR');
}

function renderizarConvites(lista) {
    const container = document.getElementById('listaConvitesCards');
    const contador = document.getElementById('contadorConvites');
    if (!container) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; text-align:center; color:#666;">Nenhum convite gerado ate o momento.</div>';
        if (contador) contador.innerText = '';
        return;
    }

    const ativos = lista.filter(c => c.situacao === 'ativo').length;
    if (contador) contador.innerText = `${lista.length} convite(s) - ${ativos} ativo(s)`;

    container.innerHTML = lista.map(c => {
        const cores = {
            ativo: '#3faf6e',
            usado: '#777777',
            expirado: '#d9534f',
            revogado: '#d9534f'
        };

        const detalhe = c.situacao === 'usado'
            ? `Usado por ${c.usado_por_email || 'usuario removido'} em ${formatarDataConvite(c.usado_em)}`
            : `Valido ate ${formatarDataConvite(c.expira_em)}`;

        const acoes = c.situacao === 'ativo'
            ? `<button class="shiny-cta1 btn-convite" onclick="copiarCodigo('${c.codigo}')">Copiar código</button>
               <button class="shiny-cta1 btn-convite" onclick="revogarConvite(${c.id})">Cancelar</button>`
            : '';

        return `
        <div class="card-notificacao">
            <div class="notif-conteudo" style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h4 class="card-convite-codigo">${c.codigo}</h4>
                    <span class="badge-status" style="color: ${cores[c.situacao]};">&bull; ${c.situacao}</span>
                </div>
                <p>Convite para <strong>${c.tipo}</strong> - criado por ${c.criado_por_email || '-'}</p>
                <span class="notif-data">${detalhe}</span>
                <div class="acoes-convite">${acoes}</div>
            </div>
        </div>`;
    }).join('');
}


// =========================================================
// MENU DE PERFIL DO HEADER
// =========================================================

function preencherMenuPerfil() {
    const rawUser = localStorage.getItem('usuarioLogado') || localStorage.getItem('usuario');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (!user) return;

    const email = document.getElementById('perfilEmail');
    const tipo = document.getElementById('perfilTipo');
    const titulo = document.getElementById('tituloUsuario');

    if (email) email.innerText = user.email || 'Sem e-mail';
    if (tipo) tipo.innerText = (user.tipo || '').toUpperCase();

    // o titulo da saudacao era fixo em "Colaborador"
    if (titulo) {
        titulo.innerText = (user.tipo || '').toLowerCase() === 'admin' ? 'Administrador' : 'Colaborador';
    }
}

function alternarMenuPerfil() {
    const menu = document.getElementById('menuPerfil');
    const botao = document.getElementById('linkLoginPainel');
    if (!menu || !botao) return;

    const abrindo = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abrindo);
    botao.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
}

function fecharMenuPerfil() {
    const menu = document.getElementById('menuPerfil');
    const botao = document.getElementById('linkLoginPainel');
    if (!menu) return;
    menu.classList.remove('aberto');
    if (botao) botao.setAttribute('aria-expanded', 'false');
}

document.addEventListener('DOMContentLoaded', () => {
    preencherMenuPerfil();

    const botao = document.getElementById('linkLoginPainel');
    if (botao) {
        botao.addEventListener('click', (e) => {
            e.stopPropagation();
            alternarMenuPerfil();
        });
    }
});

// fecha ao clicar fora ou apertar Esc
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.perfil-wrapper');
    if (wrapper && !wrapper.contains(e.target)) fecharMenuPerfil();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharMenuPerfil();
});
