
        let listaMeisGeral = [];
        const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

        // Ajusta o botão de voltar dependendo do perfil de quem tá logado
        if (user) {
            const btnVoltar = document.getElementById('btnVoltarPainel');
            if (user.tipo === 'empresa') {
                btnVoltar.href = 'painel_empresa.html';
            } else if (user.tipo === 'mei') {
                btnVoltar.href = 'painel_mei.html';
            } else if (user.tipo === 'admin') {
                btnVoltar.href = 'admin.html';
            }
        }

        function mostrarAviso(msg, ehErro = false) {
            const b = document.getElementById('bannerAviso');
            b.innerText = msg;
            b.className = ehErro ? 'aviso-erro' : 'aviso-sucesso';
            b.style.display = 'block';
            setTimeout(() => b.style.display = 'none', 5000);
        }

        async function carregarCatalogo() {
            const container = document.getElementById('gridCatalogo');
            try {
                // Tenta carregar as rotas configuradas no seu backend Node
                let res = await fetch('http://localhost:3000/perfis-mei');
                
                if (!res.ok) {
                    res = await fetch('http://localhost:3000/catalogo-completo');
                }

                if (!res.ok) {
                    throw new Error("Erro na rota do catálogo");
                }

                listaMeisGeral = await res.json();
                exibirCatalogo(listaMeisGeral);

            } catch (err) {
                container.innerHTML = '<p style="color:#dc3545; grid-column: 1 / -1;">Erro ao carregar o catálogo de prestadores. Verifique se o servidor backend tá rodando na porta 3000.</p>';
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

        // Monta a lista de serviços cadastrados pelo MEI
        const servicosHTML = (m.servicos && m.servicos.length > 0) 
            ? `
                <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
                    <strong>🛠️ Serviços e Tabela de Preços:</strong>
                    <ul style="padding-left: 18px; margin: 6px 0 0 0; font-size: 0.85em; color: #333;">
                        ${m.servicos.map(s => `
                            <li style="margin-bottom: 4px;">
                                <strong>${s.titulo}</strong>: 
                                <span style="color:#28a745; font-weight:bold;">
                                    ${s.preco ? `R$ ${parseFloat(s.preco).toFixed(2)}` : 'A combinar'}
                                </span>
                                ${s.descricao ? `<br><small style="color:#666;">${s.descricao}</small>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` 
            : '<p style="font-size:0.8em; color:#888; margin-top:8px;"><em>Nenhum serviço individual tabela cadastrado.</em></p>';

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
                        <p><strong>📱 Telefone:</strong> ${m.telefone || 'Não informado'}</p>
                        <p><strong>✉️ E-mail:</strong> ${m.email || 'Não informado'}</p>
                    </div>

                    ${linkSite ? `<p style="font-size:0.85em; margin-top:4px;"><strong>🌐 Site:</strong> <a href="${linkSite}" target="_blank" style="color:#3faf6e; text-decoration:underline;">${m.site}</a></p>` : ''}
                    ${userInsta ? `<p style="font-size:0.85em; margin-top:4px;"><strong>📸 Instagram:</strong> <a href="https://instagram.com/${userInsta}" target="_blank" style="color:#3faf6e; text-decoration:underline;">@${userInsta}</a></p>` : ''}

                    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #ddd;">
                        <p style="font-size:0.85em; color:#333; line-height:1.4;">
                            <strong>Resumo:</strong> ${m.resumo_servico || 'Sem resumo cadastrado.'}
                        </p>
                        ${m.apresentacao ? `<p style="font-size:0.8em; color:#666; margin-top:6px; line-height:1.3;"><strong>Sobre:</strong> ${m.apresentacao}</p>` : ''}
                    </div>

                    ${servicosHTML}
                </div>
                <button onclick="abrirModal(${idMei}, '${nomeExibicao}')" class="btn-acao" style="margin-top:15px;">🤝 Solicitar / Propor Serviço</button>
            </div>
        `;
    }).join('');
}
        // Variável pra guardar a categoria atualmente selecionada
let categoriaSelecionada = '';

// Função chamada ao clicar em qualquer pill de categoria
function selecionarCategoria(botaoClicado, categoria) {
    // Remove a classe 'active' de todos os botões
    const botoes = document.querySelectorAll('.pill-btn');
    botoes.forEach(btn => btn.classList.remove('active'));

    // Adiciona a classe 'active' só no botão que o usuário clicou
    botaoClicado.classList.add('active');

    // Atualiza a categoria global e roda o filtro de novo
    categoriaSelecionada = categoria;
    filtrarCatalogo();
}

function filtrarCatalogo() {
    const termo = document.getElementById('inputBusca').value.toLowerCase().trim();
    const cat = categoriaSelecionada.toLowerCase();
    
    // Remove caracteres especiais caso pesquise por CNPJ ou Telefone só com números
    const termoApenasNumeros = termo.replace(/\D/g, '');

    const filtrados = listaMeisGeral.filter(m => {
        const nomeFantasia = (m.nome_fantasia || '').toLowerCase();
        const razaoSocial = (m.razao_social || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        const cnpj = (m.cnpj || '').toLowerCase();
        const cnpjNumeros = (m.cnpj || '').replace(/\D/g, '');
        const cidade = (m.cidade || '').toLowerCase();
        const telefone = (m.telefone || '').toLowerCase();
        const telefoneNumeros = (m.telefone || '').replace(/\D/g, '');
        const instagram = (m.instagram || '').toLowerCase();
        const resumo = (m.resumo_servico || '').toLowerCase();
        const apresentacao = (m.apresentacao || '').toLowerCase();
        const categoria = (m.categoria || '').toLowerCase();
        const site = (m.site || '').toLowerCase();

        // Pesquisa nos serviços da tabela do MEI
        const bateuServico = Array.isArray(m.servicos) && m.servicos.some(s => {
            const tituloServico = (s.titulo || '').toLowerCase();
            const descServico = (s.descricao || '').toLowerCase();
            return tituloServico.includes(termo) || descServico.includes(termo);
        });

        const bateTexto = termo === '' || 
            nomeFantasia.includes(termo) ||
            razaoSocial.includes(termo) ||
            email.includes(termo) ||
            cnpj.includes(termo) ||
            (termoApenasNumeros !== '' && cnpjNumeros.includes(termoApenasNumeros)) ||
            cidade.includes(termo) ||
            telefone.includes(termo) ||
            (termoApenasNumeros !== '' && telefoneNumeros.includes(termoApenasNumeros)) ||
            instagram.includes(termo) ||
            resumo.includes(termo) ||
            apresentacao.includes(termo) ||
            site.includes(termo) ||
            bateuServico;

        // Normaliza para ignorar acentos na comparação da categoria
        const categoriaNormalizada = categoria.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catNormalizada = cat.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const bateCategoria = cat === '' || categoriaNormalizada.includes(catNormalizada);

        return bateTexto && bateCategoria;
    });

    exibirCatalogo(filtrados);
}
        // MODAL PROPOSTA
        function abrirModal(meiUsuarioId, nomeMei) {
            if (!user) {
                alert('Você precisa estar logado como Empresa para enviar uma proposta!');
                window.location.href = 'login.html';
                return;
            }

            if (user.tipo !== 'empresa') {
                alert('Apenas contas do tipo Empresa podem enviar propostas para os MEIs!');
                return;
            }

            document.getElementById('modal_mei_usuario_id').value = meiUsuarioId;
            document.getElementById('modalNomeMei').innerText = 'Para: ' + nomeMei;
            document.getElementById('modalProposta').style.display = 'flex';
        }

        function fecharModal() {
            document.getElementById('modalProposta').style.display = 'none';
            document.getElementById('formModalProposta').reset();
        }

        document.getElementById('formModalProposta').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const dados = {
                empresa_usuario_id: user.id,
                mei_usuario_id: document.getElementById('modal_mei_usuario_id').value,
                titulo_servico: document.getElementById('modal_titulo_servico').value,
                valor: document.getElementById('modal_valor').value,
                descricao: document.getElementById('modal_descricao').value
            };

            try {
                // Envia para a rota de proposta do servidor
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