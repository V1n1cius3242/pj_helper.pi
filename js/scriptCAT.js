
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
                
                return `
                    <div class="card-mei">
                        <div>
                            <span class="badge-cat">${m.categoria || 'Geral'}</span>
                            <h4>${nomeExibicao}</h4>
                            <p><strong>Cidade:</strong> ${m.cidade || 'Não informada'}</p>
                            <p><strong>Experiência:</strong> ${m.anos_experiencia || 0} ano(s)</p>
                            <p style="font-size:0.85em; color:#666; margin-top:8px; line-height:1.4;">
                                ${m.resumo_servico || m.apresentacao || 'Sem descrição cadastrada.'}
                            </p>
                        </div>
                        <button onclick="abrirModal(${idMei}, '${nomeExibicao}')" class="btn-acao">🤝 Solicitar / Propor Serviço</button>
                    </div>
                `;
            }).join('');
        }

        function filtrarCatalogo() {
            const termo = document.getElementById('inputBusca').value.toLowerCase();
            const cat = document.getElementById('selectCategoria').value.toLowerCase();

            const filtrados = listaMeisGeral.filter(m => {
                const nome = (m.nome_fantasia || m.razao_social || '').toLowerCase();
                const resumo = (m.resumo_servico || m.apresentacao || '').toLowerCase();
                const categoria = (m.categoria || '').toLowerCase();

                const bateTexto = nome.includes(termo) || resumo.includes(termo);
                const bateCategoria = cat === '' || categoria.includes(cat);

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