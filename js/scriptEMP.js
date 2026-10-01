
        document.body.style.display = 'block';

        const user = JSON.parse(localStorage.getItem('usuarioLogado')) || JSON.parse(localStorage.getItem('usuario'));

        function logout() { localStorage.clear(); window.location.replace('login.html'); }

        function mostrarAviso(msg, ehErro = false) {
            const b = document.getElementById('bannerAviso');
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
        // 1. Perfil da Empresa
        // ... (mantém igual)

        // 2. Notificações
        // ... (mantém igual)

        // 3. Catálogo de MEIs -> PODE APAGAR ESSA LINHA:
        // carregarCatalogo(); 

        // 4. Contratos e Propostas enviadas
        carregarContratos();

    } catch (err) {
        mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);
    }
}

        async function carregarCatalogo() {
            const container = document.getElementById('gridCatalogo');
            try {
                let resCat = await fetch('http://localhost:3000/catalogo-completo');
                
                // Fallback se a rota /catalogo-completo der 404 no backend
                if (!resCat.ok) {
                    resCat = await fetch('http://localhost:3000/meis');
                }

                if (!resCat.ok) {
                    throw new Error("Rota de catálogo não encontrada no servidor");
                }

                const meis = await resCat.json();

                if (!Array.isArray(meis) || meis.length === 0) {
                    container.innerHTML = '<p style="color:#888; grid-column: span 3;">Nenhum prestador MEI cadastrado no momento.</p>';
                    return;
                }

                container.innerHTML = meis.map(m => `
                    <div class="card-mei">
                        <div>
                            <span class="badge-cat">${m.categoria || 'Geral'}</span>
                            <h4>${m.nome_fantasia || m.razao_social || 'Profissional MEI'}</h4>
                            <p><strong>Cidade:</strong> ${m.cidade || 'Não informada'}</p>
                            <p><strong>Experiência:</strong> ${m.anos_experiencia || 0} ano(s)</p>
                            <p style="font-size:0.85em; color:#666; margin-top:6px;">${m.resumo_servico || m.apresentacao || 'Sem descrição cadastrada.'}</p>
                        </div>
                        <button onclick="abrirModal(${m.usuario_id || m.id}, '${m.nome_fantasia || m.razao_social}')" class="btn-acao">🤝 Solicitar / Propor Serviço</button>
                    </div>
                `).join('');

            } catch (err) {
                container.innerHTML = '<p style="color:#dc3545; grid-column: span 3;">Não foi possível carregar o catálogo de prestadores. Verifique se o servidor backend possui a rota `/catalogo-completo` ou `/meis` ativada.</p>';
            }
        }

        async function carregarContratos() {
            const container = document.getElementById('listaContratos');
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
                            <div style="border:1px solid #ccc; padding:15px; margin-bottom:12px; border-radius:6px; background:#fafafa;">
                                <h4 style="margin-top:0; color:#007bff;">${c.titulo_servico || 'Proposta de Serviço'} - <span style="color:#28a745;">R$ ${c.valor || '0,00'}</span></h4>
                                <p style="margin:5px 0;"><strong>Descrição enviada:</strong> ${c.descricao || 'Sem detalhes'}</p>
                                <p style="margin:5px 0;"><strong>Status da Proposta:</strong> <strong style="text-transform:uppercase;">${c.status}</strong></p>

                                <div style="margin:10px 0; padding:10px; background:#eef7ff; border-radius:5px; border-left:4px solid #007bff;">
                                    <strong>🎥 Reunião Virtual (Google Meet):</strong><br>
                                    ${linkMeet ? `
                                        <a href="${linkMeet}" target="_blank" class="btn-meet">Entrar no Google Meet</a><br>
                                        <small style="color:#333; font-weight:bold;">📅 Data/Hora: ${dataFormatada}</small>
                                    ` : '<em style="color:#666; font-size:0.9em;">Reunião ainda não agendada pelo ADM.</em>'}
                                </div>

                                ${linkPdf ? `<p style="margin:5px 0;"><a href="${linkPdf}" target="_blank" style="color:#007bff; font-weight:bold;">📄 Visualizar Contrato Assinado (PDF)</a></p>` : ''}
                            </div>
                        `;
                    }).join('')
                    : '<p style="color:#888;">Nenhuma solicitação realizada ainda.</p>';
            } catch (err) {
                container.innerHTML = '<p style="color:#888;">Nenhuma solicitação ou reunião encontrada.</p>';
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

        // MODAL PROPOSTA
        function abrirModal(meiUsuarioId, nomeMei) {
            document.getElementById('modal_mei_usuario_id').value = meiUsuarioId;
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
                const res = await fetch('http://localhost:3000/contratos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (res.ok) {
                    mostrarAviso('Proposta enviada ao prestador MEI com sucesso!');
                    fecharModal();
                    carregarContratos();
                } else {
                    mostrarAviso('Erro ao enviar proposta.', true);
                }
            } catch (err) {
                mostrarAviso('Erro de conexão ao enviar proposta!', true);
            }
        });

        carregarTudo();
