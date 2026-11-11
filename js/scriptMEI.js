document.body.style.display = 'block';

const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

let __todasNotificacoesMei = [];
let __notificacoesExpandidasMei = false;
const __LIMITE_NOTIFS_MEI = 6;

function mudarAba(nomeAba) {
    document.querySelectorAll('.secao-aba').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.btn-aba-nav').forEach(b => b.classList.remove('ativa'));
    
    const abaAlvo = document.getElementById('secao-' + nomeAba);
    const btnAlvo = document.getElementById('aba-btn-' + nomeAba);
    
    if (abaAlvo) abaAlvo.style.display = 'block';
    if (btnAlvo) btnAlvo.classList.add('ativa');
}

function logout() { localStorage.clear(); window.location.replace('login.html'); }

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

async function carregarTudo() {
    try {
        // Perfil MEI
        const resP = await fetch(`http://localhost:3000/perfil-mei?usuario_id=${user.id}`);
        const perfil = await resP.json();
        if (perfil && perfil.id) {
            document.getElementById('razao_social').value = perfil.razao_social || '';
            document.getElementById('nome_fantasia').value = perfil.nome_fantasia || '';
            document.getElementById('cnpj').value = perfil.cnpj || '';
            document.getElementById('telefone').value = perfil.telefone || '';
            document.getElementById('categoria').value = perfil.categoria || '';
            document.getElementById('anos_experiencia').value = perfil.anos_experiencia || 0;
            document.getElementById('modalidade_padrao').value = perfil.modalidade_padrao || 'ambos';
            if (window.PJSelect) PJSelect.sincronizar(document.getElementById('modalidade_padrao'));
            // os selects de estado/cidade sao preenchidos pelo modulo de localizacao
            if (window.PJLocal) {
                PJLocal.preencherEndereco(
                    { cep: 'cep', uf: 'uf', cidade: 'cidade', bairro: 'bairro' },
                    { cep: perfil.cep, uf: perfil.uf, cidade: perfil.cidade, bairro: perfil.bairro }
                );
            }
            document.getElementById('site').value = perfil.site || '';
            document.getElementById('instagram').value = perfil.instagram || '';
            document.getElementById('resumo_servico').value = perfil.resumo_servico || '';
            document.getElementById('apresentacao').value = perfil.apresentacao || '';

            const tituloTopo = document.getElementById('nomeMeiTopo');
            if (tituloTopo) {
                const nomeExibicao = perfil.nome_fantasia || perfil.razao_social;
                if (nomeExibicao && nomeExibicao.trim() !== '' && nomeExibicao !== 'Perfil em Preenchimento') {
                    tituloTopo.innerText = nomeExibicao;
                }
            }

            carregarServicos(perfil.id);
        }

        await carregarNotificacoesDinamicasMei();
        await carregarContratos();
    } catch (err) {
        console.error(err);
        mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);
    }
}

// NOTIFICAÇÕES DINÂMICAS DO MEI (PUXANDO OS DADOS DA EMPRESA)
async function carregarNotificacoesDinamicasMei() {
    try {
        const resContratos = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=mei`);
        let contratosMei = resContratos.ok ? await resContratos.json() : [];
        let notifsDinamicas = [];

        let mapaEmpresas = {};
        try {
            let resEmp = await fetch('http://localhost:3000/perfis-empresa');
            if (resEmp.ok) {
                const listaEmp = await resEmp.json();
                if (Array.isArray(listaEmp)) {
                    listaEmp.forEach(e => {
                        const idChave = e.usuario_id || e.id;
                        if (idChave) mapaEmpresas[idChave] = e;
                    });
                }
            }
        } catch (eEmp) {
            console.warn('Não foi possível carregar o mapa geral de empresas:', eEmp);
        }

        if (Array.isArray(contratosMei)) {
            for (let c of contratosMei) {
                const status = (c.status || '').trim().toLowerCase();
                const tituloServico = c.titulo_servico || 'Serviço Proposto';
                const valorServico = c.valor ? `R$ ${parseFloat(c.valor).toFixed(2)}` : 'A combinar';
                const temMeet = c.link_reuniao && c.link_reuniao.trim() !== '';
                const dataReuniao = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : '';

                let empresaId = c.empresa_usuario_id || c.usuario_id_empresa || c.empresa_id;

                let razaoEmpresa = c.razao_social_empresa || c.razao_social || c.nome_empresa || '';
                let cnpjEmpresa = c.cnpj_empresa || c.cnpj || '';
                let telefoneEmpresa = c.telefone_empresa || c.telefone || '';
                let emailEmpresa = c.email_empresa || c.email || '';

                if (empresaId && mapaEmpresas[empresaId]) {
                    const dadosMapa = mapaEmpresas[empresaId];
                    razaoEmpresa = razaoEmpresa || dadosMapa.razao_social || 'Empresa Contratante';
                    cnpjEmpresa = cnpjEmpresa || dadosMapa.cnpj || 'Não informado';
                    telefoneEmpresa = telefoneEmpresa || dadosMapa.telefone || 'Não informado';
                    emailEmpresa = emailEmpresa || dadosMapa.email || 'Não informado';
                }

                razaoEmpresa = razaoEmpresa || 'Empresa Contratante';
                telefoneEmpresa = telefoneEmpresa || 'Não informado';
                emailEmpresa = emailEmpresa || 'Não informado';

                let dadosEmpresaObj = {
                    razao_social_empresa: razaoEmpresa,
                    telefone_empresa: telefoneEmpresa,
                    email_empresa: emailEmpresa
                };

                if (status.includes('pendente') || status.includes('aberto')) {
                    notifsDinamicas.push({
                        ...dadosEmpresaObj,
                        mensagem: `Nova proposta recebida da empresa para "${tituloServico}" (${valorServico}).`,
                        tipo: 'pendente'
                    });
                } else if (status.includes('recusado') || status.includes('negado')) {
                    notifsDinamicas.push({
                        ...dadosEmpresaObj,
                        mensagem: `A proposta para o serviço "${tituloServico}" foi recusada.`,
                        tipo: 'recusado'
                    });
                } else if (status.includes('concluido') || status.includes('concluído') || status.includes('firmado') || status.includes('aceit')) {
                    notifsDinamicas.push({
                        ...dadosEmpresaObj,
                        mensagem: `O contrato para o serviço "${tituloServico}" foi aceito/firmado com sucesso!`,
                        tipo: 'firmado'
                    });
                }

                if (temMeet) {
                    notifsDinamicas.push({
                        ...dadosEmpresaObj,
                        mensagem: `Reunião agendada no Google Meet para "${tituloServico}"${dataReuniao ? ` em ${dataReuniao}` : ''}.`,
                        tipo: 'reuniao'
                    });
                }
            }
        }

        __todasNotificacoesMei = notifsDinamicas;
        renderizarNotificacoesTelaMei();
    } catch (err) {
        console.error('Erro ao carregar notificações do MEI:', err);
    }
}

function renderizarNotificacoesTelaMei() {
    const container = document.getElementById('listaNotificacoesContainer');
    if (!container) return;

    if (!Array.isArray(__todasNotificacoesMei) || __todasNotificacoesMei.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma notificação encontrada.</div>';
        return;
    }

    const listaExibida = __notificacoesExpandidasMei ? __todasNotificacoesMei : __todasNotificacoesMei.slice(0, __LIMITE_NOTIFS_MEI);

    container.innerHTML = listaExibida.map(n => {
        let badgeClass = 'badge-pendente-adm';
        let badgeTexto = 'Nova • Pendente';

        if (n.tipo === 'recusado') {
            badgeClass = 'badge-recusado-adm';
            badgeTexto = 'Nova • Recusado';
        } else if (n.tipo === 'reuniao') {
            badgeClass = 'badge-reuniao-adm';
            badgeTexto = 'Nova • Reunião Agendada';
        } else if (n.tipo === 'firmado' || n.tipo === 'aceito') {
            badgeClass = 'badge-ativo-adm';
            badgeTexto = 'Nova • Aceito';
        }

        const nomeEmp = n.razao_social_empresa || 'Empresa Contratante';
        const telEmp = n.telefone_empresa || 'Não informado';
        const emailEmp = n.email_empresa || 'Não informado';

        return `
        <div class="card-notificacao-custom">
            <div class="card-notificacao-topo">
                <strong>Atualização de Proposta</strong>
                <span class="badge-status-adm ${badgeClass}" style="font-size: 11px; font-weight: 700;">${badgeTexto}</span>
            </div>
            <p class="card-notificacao-msg">${n.mensagem}</p>
            <div class="card-notificacao-rodape">
                Empresa: <strong class="texto-verde-empresa">${nomeEmp}</strong> | Contato: <strong class="texto-verde-empresa">${telEmp}</strong> | E-mail: <strong class="texto-verde-empresa">${emailEmp}</strong>
            </div>
        </div>
        `;
    }).join('');
}

function marcarTodasComoLidasMei() {
    __todasNotificacoesMei = [];
    renderizarNotificacoesTelaMei();
    mostrarAviso('Todas as notificações foram marcadas como lidas.');
}

function toggleNotificacoes() {
    __notificacoesExpandidasMei = !__notificacoesExpandidasMei;
    const txt = document.getElementById('txtToggleNotifs');
    const seta = document.getElementById('setaNotifs');
    if (txt) txt.innerText = __notificacoesExpandidasMei ? 'Mostrar menos notificações' : 'Mostrar mais notificações';
    if (seta) seta.classList.toggle('rotacionada', __notificacoesExpandidasMei);
    renderizarNotificacoesTelaMei();
}

// CARREGAR SERVIÇOS
// texto curto da modalidade, usado na lista de servicos
function rotuloModalidade(valor) {
    if (valor === 'presencial') return 'Presencial';
    if (valor === 'remoto') return 'Remoto';
    return 'Presencial ou remoto';
}

async function carregarServicos(meiId) {
    try {
        const resS = await fetch(`http://localhost:3000/servicos?mei_id=${meiId}`);
        const servs = await resS.json();
        const lista = document.getElementById('listaServicos');
        
        if (Array.isArray(servs) && servs.length > 0) {
            lista.innerHTML = servs.map(s => `
                <li style="margin-bottom:12px; padding:15px; border:1px solid #edf2f7; border-radius:12px; display:flex; justify-content:space-between; align-items:center; background:#fff;">
                    <div>
                        <strong style="color:#2d3748;">${s.titulo}</strong> - <span style="color:#3faf6e; font-weight:bold;">R$ ${s.preco}</span>
                        <span class="etiqueta-modalidade etiqueta-${s.modalidade || 'ambos'}">${rotuloModalidade(s.modalidade)}</span>
                        ${s.descricao ? `<br><small style="color:#718096;">${s.descricao}</small>` : ''}
                    </div>
                    <button onclick="deletarServico(${s.id}, ${meiId})" class="btn-acao-recusar">Apagar</button>
                </li>
            `).join('');
        } else {
            lista.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhum serviço cadastrado.</div>';
        }
    } catch (err) {
        mostrarAviso('Erro ao carregar lista de serviços.', true);
    }
}

async function deletarServico(id, meiId) {
    if (!confirm('Tem certeza que deseja apagar este serviço?')) return;
    try {
        const res = await fetch(`http://localhost:3000/servicos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            mostrarAviso('Serviço apago com sucesso!');
            carregarServicos(meiId);
        } else {
            mostrarAviso('Erro ao apagar serviço.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao apagar serviço!', true);
    }
}

// CARREGAR CONTRATOS DO MEI EXIBINDO OS DADOS DA EMPRESA LOGO ABAIXO
async function carregarContratos() {
    const container = document.getElementById('listaContratos');
    if (!container) return;

    try {
        const resC = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=mei`);
        if (!resC.ok) throw new Error();
        const contratos = await resC.json();

        if (!Array.isArray(contratos) || contratos.length === 0) {
            container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma proposta ou contrato registrado.</div>';
            return;
        }

        container.innerHTML = contratos.map(c => {
            const linkMeet = normalizarUrl(c.link_reuniao);
            const linkPdf = normalizarUrl(c.contrato_digitalizado_url);
            const dataFormatada = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : 'Aguardando agendamento';
            
            const statusBruto = (c.status || 'pendente').trim().toLowerCase();
            let badgeClass = 'badge-pendente-adm';
            let badgeTexto = '• Pendente';

            if (statusBruto.includes('reuniao') || statusBruto.includes('reunião') || statusBruto.includes('agendado')) {
                badgeClass = 'badge-reuniao-adm';
                badgeTexto = '• Reunião Agendada';
            } else if (statusBruto.includes('concluido') || statusBruto.includes('concluído') || statusBruto.includes('firmado') || statusBruto.includes('aceit')) {
                badgeClass = 'badge-ativo-adm';
                badgeTexto = '• Firmado / Aceito';
            } else if (statusBruto.includes('recusado') || statusBruto.includes('negado')) {
                badgeClass = 'badge-recusado-adm';
                badgeTexto = '• Recusado';
            }

            const nomeEmpresa = c.razao_social_empresa || c.razao_social || c.nome_empresa || 'Empresa Contratante';
            const cnpjEmpresa = c.cnpj_empresa || c.cnpj || 'Não informado';
            const telefoneEmpresa = c.telefone_empresa || c.telefone || 'Não informado';
            const emailEmpresa = c.email_empresa || c.email || 'Não informado';

            return `
            <div class="card-painel-item" style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 22px 25px; margin-bottom: 18px; box-shadow: 0px 4px 10px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 12px; color: #a0aec0;">Proposta #${c.contrato_id || 'N/A'}</span>
                    <span class="badge-status-adm ${badgeClass}">${badgeTexto}</span>
                </div>
                <h3 style="font-size: 16px; color: #2d3748; margin-bottom: 8px; font-weight: 600;">
                    ${c.titulo_servico || 'Proposta de Serviço'}
                </h3>
                <p style="font-size: 14px; color: #4a5568; margin-bottom: 12px; line-height: 1.5;">
                    <strong>Descrição:</strong> ${c.descricao || 'Sem detalhes informados.'}
                </p>
                <div class="card-item-valores-adm" style="display: flex; gap: 20px; font-size: 13px; color: #718096; margin: 12px 0;">
                    <span>Orçamento: <strong style="color: #3faf6e;">R$ ${c.valor || '0,00'}</strong></span>
                    <span>Data da Conversa/Reunião: <strong>${dataFormatada}</strong></span>
                </div>

                ${linkMeet ? `
                <div class="box-meet-agendado-adm" style="background: #f7fafc; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #4a5568; margin-top: 12px; border-left: 4px solid #3faf6e;">
                    <strong style="color: #2d3748; display: block; margin-bottom: 4px;">Reunião Virtual (Google Meet):</strong>
                    <a href="${linkMeet}" target="_blank" class="card-link-verde-adm" style="color: #3faf6e; font-weight: 600; text-decoration: underline;">Acessar sala da reunião</a>
                    <small style="color: #718096; margin-left: 8px;">(${dataFormatada})</small>
                </div>
                ` : ''}

                <!-- BLOCO COM OS DADOS DA EMPRESA CONTRATANTE LOGO ABAIXO -->
                <div style="border-top: 1px solid #edf2f7; padding-top: 12px; margin-top: 12px; font-size: 13px; color: #4a5568; background: #f7fafc; padding: 12px; border-radius: 8px;">
                    <div style="font-weight: 700; color: #2d3748; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Dados da Empresa Contratante</div>
                    <div><strong>Razão Social:</strong> <span class="texto-verde-empresa">${nomeEmpresa}</span></div>
                    <div><strong>CNPJ:</strong> ${cnpjEmpresa}</div>
                    <div><strong>Contato / WhatsApp:</strong> ${telefoneEmpresa}</div>
                    <div><strong>E-mail:</strong> ${emailEmpresa}</div>
                </div>

                ${statusBruto.includes('pendente') ? `
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="responderContrato(${c.contrato_id || c.id}, 'aceito', ${c.empresa_usuario_id || c.usuario_id_empresa})" class="shiny-cta1" style="width: auto; height: 36px; padding: 0 18px;">
                        <span class="shiny-cta-content1" style="font-size: 13px;">Aceitar Proposta</span>
                    </button>
                    <button onclick="responderContrato(${c.contrato_id || c.id}, 'recusado', ${c.empresa_usuario_id || c.usuario_id_empresa})" class="btn-acao-recusar">
                        Recusar Proposta
                    </button>
                </div>
                ` : ''}
            </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma proposta ou contrato encontrado.</div>';
    }
}

async function responderContrato(id, status, empresaId) {
    try {
        const res = await fetch('http://localhost:3000/atualizar-contrato', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contrato_id: id, status, notificar_usuario_id: empresaId })
        });
        if (res.ok) {
            mostrarAviso(`Proposta ${status === 'aceito' ? 'ACEITA' : 'RECUSADA'} com sucesso!`);
            carregarContratos();
            carregarNotificacoesDinamicasMei();
        } else {
            mostrarAviso('Erro ao atualizar status do contrato.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao responder contrato!', true);
    }
}

// SALVAR PERFIL MEI
document.getElementById('formPerfilMei').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
        usuario_id: user.id,
        razao_social: document.getElementById('razao_social').value,
        nome_fantasia: document.getElementById('nome_fantasia').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value,
        categoria: document.getElementById('categoria').value,
        anos_experiencia: document.getElementById('anos_experiencia').value,
        cidade: document.getElementById('cidade').value,
        cep: document.getElementById('cep').value,
        uf: document.getElementById('uf').value,
        bairro: document.getElementById('bairro').value,
        modalidade_padrao: document.getElementById('modalidade_padrao').value,
        site: document.getElementById('site').value,
        instagram: document.getElementById('instagram').value,
        resumo_servico: document.getElementById('resumo_servico').value,
        apresentacao: document.getElementById('apresentacao').value
    };

    try {
        const res = await fetch('http://localhost:3000/perfil-mei', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (res.ok) {
            mostrarAviso('Perfil atualizado com sucesso!');
            const nomeExibicao = dados.nome_fantasia || dados.razao_social;
            if (nomeExibicao) document.getElementById('nomeMeiTopo').innerText = nomeExibicao;
        } else {
            mostrarAviso('Erro ao salvar perfil.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao salvar perfil!', true);
    }
});

// CADASTRAR NOVO SERVIÇO
document.getElementById('formServico').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resP = await fetch(`http://localhost:3000/perfil-mei?usuario_id=${user.id}`);
    const perfil = await resP.json();

    if (!perfil || !perfil.id) {
        mostrarAviso('Salve seu Perfil MEI primeiro antes de cadastrar serviços!', true);
        return;
    }

    const dados = {
        mei_id: perfil.id,
        titulo: document.getElementById('servico_titulo').value,
        preco: document.getElementById('servico_preco').value,
        descricao: document.getElementById('servico_desc').value,
        modalidade: document.getElementById('servico_modalidade').value
    };

    const res = await fetch('http://localhost:3000/servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (res.ok) {
        mostrarAviso('Serviço cadastrado com sucesso!');
        document.getElementById('formServico').reset();
        if (window.PJSelect) PJSelect.sincronizar(document.getElementById('servico_modalidade'));
        carregarServicos(perfil.id);
    } else {
        mostrarAviso('Erro ao cadastrar serviço.', true);
    }
});

// FUNÇÕES DO MODAL DE EXCLUSÃO
function abrirModalExclusao() {
    const modal = document.getElementById('modalExcluirConta');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('ativo'), 10);
    }
}

function fecharModalExclusao() {
    const modal = document.getElementById('modalExcluirConta');
    if (modal) {
        modal.classList.remove('ativo');
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('inputSenhaExclusao').value = '';
        }, 300);
    }
}

function validarSenhaExclusao() {
    const inputSenha = document.getElementById('inputSenhaExclusao');
    const btnExcluir = document.getElementById('btnConfirmarExclusaoFinal');
    if (!inputSenha || !btnExcluir) return;

    if (inputSenha.value.trim().length > 0) {
        btnExcluir.removeAttribute('disabled');
        btnExcluir.style.opacity = '1';
    } else {
        btnExcluir.setAttribute('disabled', 'true');
        btnExcluir.style.opacity = '0.6';
    }
}

async function executarExclusaoConta() {
    const inputSenha = document.getElementById('inputSenhaExclusao');
    const senha = inputSenha ? inputSenha.value : '';
    if (!senha) {
        mostrarAviso('Digite sua senha para confirmar.', true);
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/deletar-conta', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, senha: senha })
        });

        if (res.ok) {
            localStorage.clear();
            mostrarAviso('Conta excluída com sucesso.');
            setTimeout(() => window.location.replace('login.html'), 1500);
        } else {
            const erro = await res.json().catch(() => ({}));
            mostrarAviso(erro.mensagem || 'Erro ao excluir conta. Verifique sua senha.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao excluir conta.', true);
    }
}

carregarTudo();

// CEP preenche estado/cidade/bairro sozinho (ViaCEP + IBGE)
document.addEventListener('DOMContentLoaded', () => {
    if (window.PJLocal) {
        PJLocal.ligarCampos({ cep: 'cep', uf: 'uf', cidade: 'cidade', bairro: 'bairro' });
    }
});
