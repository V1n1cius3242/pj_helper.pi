document.body.style.display = 'block';

const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

let __todasNotificacoesEmp = [];
let __notificacoesExpandidasEmp = false;
const __LIMITE_NOTIFS_EMP = 6;
let razaoSocialEmpresaAtual = '';
let telefoneEmpresaAtual = '';

// 1. NAVEGAÇÃO ENTRE ABAS DA PÁGINA
function mudarAba(nomeAba) {
    const secoes = document.querySelectorAll('.secao-aba');
    secoes.forEach(s => {
        s.style.display = 'none';
    });
    
    const botoes = document.querySelectorAll('.btn-aba-nav');
    botoes.forEach(b => {
        b.classList.remove('ativa');
    });

    const abaAlvo = document.getElementById('secao-' + nomeAba);
    const btnAlvo = document.getElementById('aba-btn-' + nomeAba);
    
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }
    if (btnAlvo) {
        btnAlvo.classList.add('ativa');
    }
}

// 2. FUNÇÕES DE SUPORTE
function logout() { 
    localStorage.clear(); 
    window.location.replace('login.html'); 
}

function mostrarAviso(msg, ehErro = false) {
    const b = document.getElementById('bannerAviso');
    if (!b) return;
    b.innerText = msg;
    b.className = ehErro ? 'aviso-erro' : 'aviso-sucesso';
    b.style.display = 'block';
    setTimeout(() => b.style.display = 'none', 5000);
}

function normalizarUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url;
    return url;
}

// 3. CARREGAMENTO PRINCIPAL DOS DADOS
async function carregarTudo() {
    if (!user) return;
    try {
        // 3.1. Carrega Perfil da Empresa
        const resPerfil = await fetch(`http://localhost:3000/perfil-empresa?usuario_id=${user.id}`);
        if (resPerfil.ok) {
            const perfil = await resPerfil.json();
            if (perfil) {
                razaoSocialEmpresaAtual = perfil.razao_social || '';
                telefoneEmpresaAtual = perfil.telefone || '';

                if (document.getElementById('razao_social')) document.getElementById('razao_social').value = perfil.razao_social || '';
                if (document.getElementById('cnpj')) document.getElementById('cnpj').value = perfil.cnpj || '';
                if (document.getElementById('telefone')) document.getElementById('telefone').value = perfil.telefone || '';
                
                const tituloTopo = document.getElementById('nomeEmpresaTopo');
                if (tituloTopo && perfil.razao_social) {
                    tituloTopo.innerText = perfil.razao_social;
                }
            }
        }

        // 3.2. Carrega Notificações Dinâmicas (MEI / ADM / Sistema)
        await carregarNotificacoesDinamicas();

        // 3.3. Carrega Contratos e Solicitações no Padrão ADM
        await carregarContratos();

    } catch (err) {
        console.error(err);
        mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);
    }
}

// 4. NOTIFICAÇÕES DINÂMICAS E LIMITADOR (6 ITENS)
async function carregarNotificacoesDinamicas() {
    try {
        const resNotifs = await fetch(`http://localhost:3000/notificacoes?usuario_id=${user.id}`);
        const resContratos = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=empresa`);
        
        let notifsServidor = resNotifs.ok ? await resNotifs.json() : [];
        let contratosEmpresa = resContratos.ok ? await resContratos.json() : [];

        let notifsDinamicas = [];

        if (Array.isArray(contratosEmpresa)) {
            contratosEmpresa.forEach(c => {
                const status = (c.status || '').trim().toLowerCase();
                const tituloServico = c.titulo_servico || 'Serviço Proposto';
                const valorServico = c.valor ? `R$ ${c.valor}` : 'A combinar';
                const temMeet = c.link_reuniao && c.link_reuniao.trim() !== '';
                const dataReuniao = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : '';

                if (status.includes('pendente') || status.includes('aberto')) {
                    notifsDinamicas.push({
                        id: 'p-' + c.contrato_id,
                        mensagem: `Proposta enviada para o MEI referente a "${tituloServico}" (${valorServico}). Aguardando resposta do prestador.`,
                        tipo: 'pendente'
                    });
                } else if (status.includes('recusado') || status.includes('negado')) {
                    notifsDinamicas.push({
                        id: 'r-' + c.contrato_id,
                        mensagem: `A proposta para o serviço "${tituloServico}" foi recusada pelo MEI.`,
                        tipo: 'recusado'
                    });
                } else if (status.includes('concluido') || status.includes('concluído') || status.includes('firmado') || status.includes('aceit')) {
                    notifsDinamicas.push({
                        id: 'f-' + c.contrato_id,
                        mensagem: `A proposta para o serviço "${tituloServico}" foi aceita pelo MEI!`,
                        tipo: 'firmado'
                    });
                }

                if (temMeet) {
                    notifsDinamicas.push({
                        id: 'm-' + c.contrato_id,
                        mensagem: `O administrador agendou/reagendou a reunião no Google Meet para "${tituloServico}"${dataReuniao ? ` em ${dataReuniao}` : ''}.`,
                        tipo: 'reuniao'
                    });
                }
            });
        }

        if (Array.isArray(notifsServidor)) {
            notifsServidor.forEach(ns => {
                if (!notifsDinamicas.some(nd => nd.mensagem === ns.mensagem)) {
                    notifsDinamicas.push({
                        id: ns.id || Math.random(),
                        mensagem: ns.mensagem,
                        tipo: 'sistema'
                    });
                }
            });
        }

        __todasNotificacoesEmp = notifsDinamicas;
        renderizarNotificacoesTela();

    } catch (err) {
        console.error('Erro ao processar notificações dinâmicas:', err);
    }
}

function renderizarNotificacoesTela() {
    const container = document.getElementById('listaNotifs') || document.getElementById('listaNotificacoesContainer');
    if (!container) return;

    if (!Array.isArray(__todasNotificacoesEmp) || __todasNotificacoesEmp.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma notificação encontrada no momento.</div>';
        return;
    }

    const listaExibida = __notificacoesExpandidasEmp 
        ? __todasNotificacoesEmp 
        : __todasNotificacoesEmp.slice(0, __LIMITE_NOTIFS_EMP);

    const razaoSocial = razaoSocialEmpresaAtual || (user ? user.email : 'Empresa');
    const telefoneContato = telefoneEmpresaAtual || 'Não informado';

    container.innerHTML = listaExibida.map(n => {
        let badgeClass = 'badge-pendente';
        let badgeTexto = '• Proposta Enviada';

        if (n.tipo === 'recusado') {
            badgeClass = 'badge-recusar';
            badgeTexto = '• Recusado pelo MEI';
        } else if (n.tipo === 'reuniao') {
            badgeClass = 'badge-reuniao';
            badgeTexto = '• Reunião Agendada (ADM)';
        } else if (n.tipo === 'firmado') {
            badgeClass = 'badge-ativo';
            badgeTexto = '• Aceito pelo MEI';
        }

        return `
            <div class="card-painel-item" style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 18px 22px; margin-bottom: 14px; box-shadow: 0px 4px 10px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <strong style="color: #2d3748; font-size: 0.95rem;">Atualização de Serviço</strong>
                    <span class="badge-status ${badgeClass}" style="font-size: 11px;">${badgeTexto}</span>
                </div>
                <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 0.9rem; line-height: 1.5;">${n.mensagem}</p>
                <div style="font-size: 0.82rem; color: #718096; background: #f7fafc; padding: 6px 10px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">
                    Empresa: <strong>${razaoSocial}</strong> | Contato: <strong>${telefoneContato}</strong>
                </div>
                <div style="font-size: 0.75rem; color: #a0aec0; margin-top: 4px;">Sistema PJ Helper</div>
            </div>
        `;
    }).join('');

    let wrapperBotao = document.getElementById('btnToggleNotifsDinamico');
    if (__todasNotificacoesEmp.length > __LIMITE_NOTIFS_EMP) {
        if (!wrapperBotao) {
            wrapperBotao = document.createElement('div');
            wrapperBotao.id = 'btnToggleNotifsDinamico';
            wrapperBotao.style.textAlign = 'center';
            wrapperBotao.style.marginTop = '15px';
            wrapperBotao.innerHTML = `
                <button onclick="toggleNotificacoesDinamicas()" style="background: none; border: none; color: #3faf6e; font-weight: 600; font-size: 13px; cursor: pointer; font-family: 'Montserrat', sans-serif;">
                    <span id="txtToggleTextoDinamico">${__notificacoesExpandidasEmp ? 'Mostrar menos ▲' : `Mostrar todas (${__todasNotificacoesEmp.length}) ▼`}</span>
                </button>
            `;
            container.parentNode.appendChild(wrapperBotao);
        } else {
            document.getElementById('txtToggleTextoDinamico').innerText = __notificacoesExpandidasEmp ? 'Mostrar menos ▲' : `Mostrar todas (${__todasNotificacoesEmp.length}) ▼`;
            wrapperBotao.style.display = 'block';
        }
    } else if (wrapperBotao) {
        wrapperBotao.style.display = 'none';
    }
}

function toggleNotificacoesDinamicas() {
    __notificacoesExpandidasEmp = !__notificacoesExpandidasEmp;
    renderizarNotificacoesTela();
}

// 5. CARREGAMENTO DE SOLICITAÇÕES COM ESTÉTICA DO ADM
async function carregarContratos() {
    const container = document.getElementById('listaContratos');
    if (!container) return;

    try {
        const resC = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=empresa`);
        if (!resC.ok) throw new Error();
        const contratos = await resC.json();

        if (!Array.isArray(contratos) || contratos.length === 0) {
            container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma solicitação realizada ainda.</div>';
            return;
        }

        container.innerHTML = contratos.map(c => {
            const linkMeet = normalizarUrl(c.link_reuniao);
            const linkPdf = normalizarUrl(c.contrato_digitalizado_url);
            const dataFormatada = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : 'Aguardando agendamento';

            const statusBruto = (c.status || 'pendente').trim().toLowerCase();
            let badgeClass = 'badge-pendente';
            let badgeTexto = '• Pendente';

            if (statusBruto.includes('reuniao') || statusBruto.includes('reunião') || statusBruto.includes('agendado')) {
                badgeClass = 'badge-reuniao';
                badgeTexto = '• Reunião Agendada';
            } else if (statusBruto.includes('concluido') || statusBruto.includes('concluído') || statusBruto.includes('firmado')) {
                badgeClass = 'badge-ativo';
                badgeTexto = '• Firmado';
            } else if (statusBruto.includes('recusado') || statusBruto.includes('negado')) {
                badgeClass = 'badge-recusar';
                badgeTexto = '• Recusado';
            }

            return `
                <div class="card-painel-item" style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 22px 25px; margin-bottom: 18px; box-shadow: 0px 4px 10px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 12px; color: #a0aec0;">Solicitação #${c.contrato_id || 'N/A'}</span>
                        <span class="badge-status ${badgeClass}">${badgeTexto}</span>
                    </div>
                    
                    <h3 style="font-size: 16px; color: #2d3748; margin-bottom: 8px; font-weight: 600;">
                        ${c.titulo_servico || 'Proposta de Serviço'}
                    </h3>

                    <p style="font-size: 14px; color: #4a5568; margin-bottom: 12px; line-height: 1.5;">
                        <strong>Descrição:</strong> ${c.descricao || 'Sem detalhes informados.'}
                    </p>

                    <div style="display: flex; gap: 20px; font-size: 13px; color: #718096; margin: 12px 0;">
                        <span>Orçamento: <strong style="color: #3faf6e;">R$ ${c.valor || '0,00'}</strong></span>
                        ${c.data_reuniao ? `<span>Data Prevista: <strong>${dataFormatada}</strong></span>` : ''}
                    </div>

                    ${linkMeet ? `
                        <div style="background: #f7fafc; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #4a5568; margin-top: 12px; border-left: 4px solid #3faf6e;">
                            <strong style="color: #2d3748; display: block; margin-bottom: 4px;">Reunião Virtual (Google Meet):</strong>
                            <a href="${linkMeet}" target="_blank" style="color: #3faf6e; font-weight: 600; text-decoration: underline;">Acessar sala da reunião</a>
                            <small style="color: #718096; margin-left: 8px;">(${dataFormatada})</small>
                        </div>
                    ` : `
                        <div style="background: #f7fafc; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #718096; margin-top: 12px; border-left: 4px solid #cbd5e0;">
                            <em>Reunião ainda não agendada pela equipe.</em>
                        </div>
                    `}

                    ${linkPdf ? `
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #edf2f7;">
                            <a href="${linkPdf}" target="_blank" style="color: #3faf6e; font-weight: 600; text-decoration: underline; font-size: 13px;">
                                Visualizar Contrato Digitalizado (PDF)
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma solicitação ou reunião encontrada.</div>';
    }
}

// 6. FORMULÁRIO DO PERFIL DA EMPRESA
document.getElementById('formPerfilEmpresa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
        usuario_id: user.id,
        razao_social: document.getElementById('razao_social').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value
    };

    try {
        const res = await fetch('http://localhost:3000/perfil-empresa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (res.ok) {
            mostrarAviso('Perfil da empresa atualizado com sucesso!');
            razaoSocialEmpresaAtual = dados.razao_social;
            telefoneEmpresaAtual = dados.telefone;
            const tituloTopo = document.getElementById('nomeEmpresaTopo');
            if (tituloTopo && dados.razao_social) {
                tituloTopo.innerText = dados.razao_social;
            }
            carregarNotificacoesDinamicas();
        } else {
            mostrarAviso('Erro ao salvar perfil da empresa.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao salvar perfil!', true);
    }
});

// INITIALIZAR CARREGAMENTO
carregarTudo();