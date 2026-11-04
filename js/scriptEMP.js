document.body.style.display = 'block';

const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

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
        // 1. Carregar Perfil da Empresa para preencher os inputs e o topo
        const resPerfil = await fetch(`http://localhost:3000/perfil-empresa?usuario_id=${user.id}`);
        if (resPerfil.ok) {
            const perfil = await resPerfil.json();
            if (perfil) {
                if (document.getElementById('razao_social')) document.getElementById('razao_social').value = perfil.razao_social || '';
                if (document.getElementById('cnpj')) document.getElementById('cnpj').value = perfil.cnpj || '';
                if (document.getElementById('telefone')) document.getElementById('telefone').value = perfil.telefone || '';
                
                // ATUALIZA O NOME DA EMPRESA NO TOPO DINAMICAMENTE
                const tituloTopo = document.getElementById('nomeEmpresaTopo');
                if (tituloTopo && perfil.razao_social) {
                    tituloTopo.innerText = perfil.razao_social;
                }
            }
        }

        // 2. Carregar Notificações da Empresa
        const resNotifs = await fetch(`http://localhost:3000/notificacoes?usuario_id=${user.id}`);
        if (resNotifs.ok) {
            const notifs = await resNotifs.json();
            const containerNotifs = document.getElementById('listaNotifs');
            if (containerNotifs) {
                if (Array.isArray(notifs) && notifs.length > 0) {
                    containerNotifs.innerHTML = notifs.map(n => `
                        <li style="background: #fff; padding: 12px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #e2e8f0; list-style: none;">
                            <p style="margin: 0; color: #333;">${n.mensagem}</p>
                            <small style="color: #666; font-size: 0.8em;">Sistema PJ Helper</small>
                        </li>
                    `).join('');
                } else {
                    containerNotifs.innerHTML = '<li style="list-style: none; color: #666; background: #fff; padding: 15px; border-radius: 8px; text-align: center;">Nenhuma notificação encontrada.</li>';
                }
            }
        }

        // 3. Carregar Contratos e Solicitações
        carregarContratos();

    } catch (err) {
        console.error(err);
        mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);
    }
}

async function carregarContratos() {
    const container = document.getElementById('listaContratos');
    if (!container) return;

    try {
        const resC = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=empresa`);
        if (!resC.ok) throw new Error();
        const contratos = await resC.json();

        container.innerHTML = (Array.isArray(contratos) && contratos.length > 0)
            ? contratos.map(c => {
                const linkMeet = normalizarUrl(c.link_reuniao);
                const linkPdf = normalizarUrl(c.contrato_digitalizado_url);
                const dataFormatada = c.data_reuniao ? new Date(c.data_reuniao).toLocaleString('pt-BR') : 'Aguardando agendamento';

                return `
                    <div style="border:1px solid #e2e8f0; padding:20px; margin-bottom:15px; border-radius:12px; background:#ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin:0; color:#111; font-size: 1.1rem;">${c.titulo_servico || 'Proposta de Serviço'}</h4>
                            <span style="font-weight: 600; color:#3faf6e;">R$ ${c.valor || '0,00'}</span>
                        </div>
                        <p style="margin:8px 0; color: #555; font-size: 0.95rem;"><strong>Descrição:</strong> ${c.descricao || 'Sem detalhes'}</p>
                        <p style="margin:8px 0; color: #555; font-size: 0.95rem;"><strong>Status:</strong> <strong style="text-transform:uppercase; color: #2d3748;">${c.status}</strong></p>

                        <div style="margin:12px 0; padding:12px; background:#f8fafc; border-radius:8px; border-left:4px solid #3faf6e;">
                            <strong>Reunião Virtual (Google Meet):</strong><br>
                            ${linkMeet ? `
                                <a href="${linkMeet}" target="_blank" style="display: inline-block; margin-top: 6px; color: #3faf6e; font-weight: 600; text-decoration: underline;">Acessar link da reunião</a><br>
                                <small style="color:#555; font-weight:600; display: block; margin-top: 4px;">Data/Hora: ${dataFormatada}</small>
                            ` : '<em style="color:#666; font-size:0.9em;">Reunião ainda não agendada pela equipe.</em>'}
                        </div>

                        ${linkPdf ? `<p style="margin:10px 0 0 0;"><a href="${linkPdf}" target="_blank" style="color:#3faf6e; font-weight:600; text-decoration:underline;">Visualizar Contrato Assinado (PDF)</a></p>` : ''}
                    </div>
                `;
            }).join('')
            : '<p style="color:#666; background: #fff; padding: 20px; border-radius: 8px; text-align: center;">Nenhuma solicitação realizada ainda.</p>';
    } catch (err) {
        container.innerHTML = '<p style="color:#666; background: #fff; padding: 20px; border-radius: 8px; text-align: center;">Nenhuma solicitação ou reunião encontrada.</p>';
    }
}

// SALVAR PERFIL DA EMPRESA
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
        } else {
            mostrarAviso('Erro ao salvar perfil da empresa.', true);
        }
    } catch (err) {
        mostrarAviso('Erro de conexão ao salvar perfil!', true);
    }
});

carregarTudo();