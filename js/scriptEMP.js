document.body.style.display = 'block';

const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

let __todasNotificacoesEmp = [];

let __notificacoesExpandidasEmp = false;

const __LIMITE_NOTIFS_EMP = 6;

let razaoSocialEmpresaAtual = '';

let telefoneEmpresaAtual = '';

function mudarAba(nomeAba) {

    document.querySelectorAll('.secao-aba').forEach(s => s.style.display = 'none');

    document.querySelectorAll('.btn-aba-nav').forEach(b => b.classList.remove('ativa'));

    const abaAlvo = document.getElementById('secao-' + nomeAba);

    const btnAlvo = document.getElementById('aba-btn-' + nomeAba);

    if (abaAlvo) abaAlvo.style.display = 'block';

    if (btnAlvo) btnAlvo.classList.add('ativa');

}

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

async function carregarTudo() {

    if (!user) return;

    try {

        const resPerfil = await fetch(`http://localhost:3000/perfil-empresa?usuario_id=${user.id}`);

        if (resPerfil.ok) {

            const perfil = await resPerfil.json();

            if (perfil) {

                razaoSocialEmpresaAtual = perfil.razao_social || '';

                telefoneEmpresaAtual = perfil.telefone || '';

                if (document.getElementById('razao_social')) document.getElementById('razao_social').value = perfil.razao_social || '';

                if (document.getElementById('cnpj')) document.getElementById('cnpj').value = perfil.cnpj || '';

                if (document.getElementById('telefone')) document.getElementById('telefone').value = perfil.telefone || '';
                /*adicionado por sofia ---- EMAIL NO PERFIL DE EMPRESA*/
                emailEmpresaAtual = perfil.email || user.email || '';
                if (document.getElementById('emailEmpresa')) {
                    document.getElementById('emailEmpresa').value = perfil.email || user.email || '';
                    document.getElementById('emailEmpresa').setAttribute('maxlength', '300'); // Limitador de 300 caracteres
                }

                const tituloTopo = document.getElementById('nomeEmpresaTopo');

                if (tituloTopo && perfil.razao_social) tituloTopo.innerText = perfil.razao_social;

            }

        }

        await carregarNotificacoesDinamicas();

        await carregarContratos();

    } catch (err) {

        console.error(err);

        mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);

    }

}

/*------------------------------------------*/
/*ALTERAÇÃO DAS NOTIFICAÇÕES POR SOFIA*/
/*------------------------------------------*/
async function carregarNotificacoesDinamicas() {
    try {
        const resNotifs = await fetch(`http://localhost:3000/notificacoes?usuario_id=${user.id}`);
        const resContratos = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=empresa`);

        let contratosEmpresa = resContratos.ok ? await resContratos.json() : [];
        let notifsDinamicas = [];

        if (Array.isArray(contratosEmpresa)) {
            for (let c of contratosEmpresa) {
                const status = (c.status || '').trim().toLowerCase();
                const tituloServico = c.titulo_servico || 'Serviço Proposto';
                const valorServico = c.valor ? `R$ ${c.valor}` : 'A combinar';
                const temMeet = c.link_reuniao && c.link_reuniao.trim() !== '';
                const dataReuniao = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : '';

                // CORREÇÃO: Captura o ID do MEI testando todas as variações possíveis vindas do banco/backend
                let meiId = c.mei_usuario_id || c.prestador_usuario_id || c.prestador_id || c.mei_id || c.id_prestador || c.id_mei;

                let nomeMei = c.nome_mei || c.mei_nome || c.nome_prestador || c.prestador_nome || '';
                let telefoneMei = c.telefone_mei || c.mei_telefone || c.telefone_prestador || c.prestador_telefone || '';
                let emailMei = c.email_mei || c.mei_email || c.email_prestador || c.prestador_email || '';

                // Se faltar os dados mas tivermos o ID, busca diretamente na API de perfil do usuário
                if ((!nomeMei || nomeMei === 'Prestador MEI' || nomeMei === '') && meiId) {
                    try {
                        const resUser = await fetch(`http://localhost:3000/perfil-usuario?usuario_id=${meiId}`);
                        if (resUser.ok) {
                            const dadosUser = await resUser.json();
                            nomeMei = dadosUser.nome_fantasia || dadosUser.razao_social || dadosUser.nome || dadosUser.nome_completo || '';
                            telefoneMei = dadosUser.telefone || dadosUser.whatsapp || '';
                            emailMei = dadosUser.email || '';
                        }
                    } catch (errUser) {
                        console.error('Erro ao buscar perfil do MEI:', errUser);
                    }
                }

                // Fallbacks finais caso continue vazio
                nomeMei = nomeMei || (meiId ? `Prestador (ID: ${meiId})` : 'Prestador MEI');
                telefoneMei = telefoneMei || 'Não informado';
                emailMei = emailMei || 'Não informado';

                let dadosMeiObj = {
                    nome_mei: nomeMei,
                    telefone_mei: telefoneMei,
                    email_mei: emailMei
                };

                if (status.includes('pendente') || status.includes('aberto')) {
                    notifsDinamicas.push({
                        ...dadosMeiObj,
                        mensagem: `Proposta enviada para o MEI referente a "${tituloServico}" (${valorServico}). Aguardando resposta.`,
                        tipo: 'pendente'
                    });
                } else if (status.includes('recusado') || status.includes('negado')) {
                    notifsDinamicas.push({
                        ...dadosMeiObj,
                        mensagem: `A proposta para o serviço "${tituloServico}" foi recusada pelo MEI.`,
                        tipo: 'recusado'
                    });
                } else if (status.includes('concluido') || status.includes('concluído') || status.includes('firmado') || status.includes('aceit')) {
                    notifsDinamicas.push({
                        ...dadosMeiObj,
                        mensagem: `A proposta para o serviço "${tituloServico}" foi aceita pelo MEI!`,
                        tipo: 'firmado'
                    });
                }

                if (temMeet) {
                    notifsDinamicas.push({
                        ...dadosMeiObj,
                        mensagem: `Reunião agendada no Google Meet para "${tituloServico}"${dataReuniao ? ` em ${dataReuniao}` : ''}.`,
                        tipo: 'reuniao'
                    });
                }
            }
        }

        __todasNotificacoesEmp = notifsDinamicas;
        renderizarNotificacoesTela();
    } catch (err) {
        console.error('Erro ao carregar notificações:', err);
    }
}
function renderizarNotificacoesTela() {
    const container = document.getElementById('listaNotificacoesContainer');
    if (!container) return;

    if (!Array.isArray(__todasNotificacoesEmp) || __todasNotificacoesEmp.length === 0) {
        container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma notificação encontrada.</div>';
        return;
    }

    const listaExibida = __notificacoesExpandidasEmp ? __todasNotificacoesEmp : __todasNotificacoesEmp.slice(0, __LIMITE_NOTIFS_EMP);

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

        const nomeMei = n.nome_mei || 'Prestador MEI';
        const telefoneMei = n.telefone_mei || 'Não informado';
        const emailMei = n.email_mei || 'Não informado';

        return `
        <div class="card-notificacao-custom">
            <div class="card-notificacao-topo">
                <strong>Atualização de Serviço</strong>
                <span class="badge-status-adm ${badgeClass}" style="font-size: 11px; font-weight: 700;">${badgeTexto}</span>
            </div>
            <p class="card-notificacao-msg">${n.mensagem}</p>
            <div class="card-notificacao-rodape">
                MEI: <strong class="texto-verde-empresa">${nomeMei}</strong> | Contato: <strong class="texto-verde-empresa">${telefoneMei}</strong> | E-mail: <strong class="texto-verde-empresa">${emailMei}</strong>
            </div>
        </div>
        `;
    }).join('');
}
/*------------------------------------------*/
/*ALTERAÇÃO DAS NOTIFICAÇÕES POR SOFIA*/
/*------------------------------------------*/

async function carregarContratos() {

    const container = document.getElementById('listaContratos');

    if (!container) return;

    try {

        const resC = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=empresa`);

        if (!resC.ok) throw new Error();

        const contratos = await resC.json();

        if (!Array.isArray(contratos) || contratos.length === 0) {

            container.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; border:1px solid #edf2f7; text-align:center; color:#666;">Nenhuma solicitação encontrada.</div>';

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

            return `
<div class="card-painel-item" style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 16px; padding: 22px 25px; margin-bottom: 18px; box-shadow: 0px 4px 10px rgba(0,0,0,0.02);">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<span style="font-size: 12px; color: #a0aec0;">Solicitação #${c.contrato_id || 'N/A'}</span>
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

                    ` : `
<div style="background: #f7fafc; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #718096; margin-top: 12px; border-left: 4px solid #cbd5e0;">
<em>Reunião ainda não agendada pelo administrador.</em>
</div>

                    `}

                    ${linkPdf ? `
<div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #edf2f7;">
<a href="${linkPdf}" target="_blank" class="card-link-verde-adm" style="color: #3faf6e; font-weight: 600; text-decoration: underline; font-size: 13px;">

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
/*ADICIONADO POR SOFIA */
document.getElementById('formPerfilEmpresa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
        usuario_id: user.id,
        razao_social: document.getElementById('razao_social').value,
        cnpj: document.getElementById('cnpj').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('emailEmpresa').value // E-mail editável
    };

    try {
        const res = await fetch('http://localhost:3000/perfil-empresa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            mostrarAviso('Perfil atualizado com sucesso!');
            razaoSocialEmpresaAtual = dados.razao_social;
            telefoneEmpresaAtual = dados.telefone;
            emailEmpresaAtual = dados.email;
            document.getElementById('nomeEmpresaTopo').innerText = dados.razao_social;
        } else {
            mostrarAviso('Erro ao salvar perfil.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão!', true);
    }
});
/*ADICIONADO POR SOFIA */

// FUNÇÕES DO MODAL DE EXCLUSÃO (CORRIGIDAS)

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
// Função para aplicar máscara automática no Telefone/WhatsApp (suporta 8 ou 9 dígitos)
function aplicarMascaraTelefone(e) {
    let valor = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (valor.length > 11) valor = valor.slice(0, 11); // Limita a 11 dígitos (DDD + 9)

    if (valor.length > 10) {
        // Celular com 9º dígito: (00) 00000-0000
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (valor.length > 5) {
        // Telefone fixo ou em digitação: (00) 0000-0000
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (valor.length > 0) {
        valor = valor.replace(/^(\d*)/, '($1');
    }
    
    e.target.value = valor;
}

// Vincula o evento no input de telefone assim que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const inputTelefone = document.getElementById('telefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', aplicarMascaraTelefone);
    }
});

carregarTudo();
