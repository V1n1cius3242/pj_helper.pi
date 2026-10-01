
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

        function extrairDadosDescricao(descricaoTexto) {
            let link = null, data = null, detalhes = descricaoTexto || '';
            if (descricaoTexto && typeof descricaoTexto === 'string') {
                const lm = descricaoTexto.match(/Link:\s*(https?:\/\/[^\s|]+)/i);
                if (lm) link = lm[1];
                const dm = descricaoTexto.match(/Data:\s*([^\s|]+)/i);
                if (dm) data = dm[1];
                const detM = descricaoTexto.match(/Detalhes:\s*(.+)$/i);
                if (detM) detalhes = detM[1];
            }
            return { link, data, detalhes };
        }

        async function carregarTudo() {
            try {
                // Perfil
                const resP = await fetch(`http://localhost:3000/perfil-mei?usuario_id=${user.id}`);
                const perfil = await resP.json();
                if (perfil && perfil.id) {
                    document.getElementById('razao_social').value = perfil.razao_social || '';
                    document.getElementById('nome_fantasia').value = perfil.nome_fantasia || '';
                    document.getElementById('cnpj').value = perfil.cnpj || '';
                    document.getElementById('telefone').value = perfil.telefone || '';
                    document.getElementById('categoria').value = perfil.categoria || '';
                    document.getElementById('anos_experiencia').value = perfil.anos_experiencia || 0;
                    document.getElementById('cidade').value = perfil.cidade || '';
                    document.getElementById('site').value = perfil.site || '';
                    document.getElementById('instagram').value = perfil.instagram || '';
                    document.getElementById('resumo_servico').value = perfil.resumo_servico || '';
                    document.getElementById('apresentacao').value = perfil.apresentacao || '';

                    carregarServicosEPortfolio(perfil.id);
                }

                // Notificações
                const resN = await fetch(`http://localhost:3000/notificacoes?usuario_id=${user.id}`);
                const notifs = await resN.json();
                document.getElementById('listaNotifs').innerHTML = (Array.isArray(notifs) && notifs.length > 0)
                    ? notifs.map(n => `<li>${n.mensagem} <small style="color:#888;">(${new Date(n.criado_em).toLocaleDateString()})</small></li>`).join('')
                    : '<li>Nenhuma notificação por enquanto.</li>';

                carregarContratos();
            } catch (err) {
                mostrarAviso('Erro de conexão ao carregar dados do servidor!', true);
            }
        }

        async function carregarServicosEPortfolio(meiId) {
            const resS = await fetch(`http://localhost:3000/servicos?mei_id=${meiId}`);
            const servs = await resS.json();
            document.getElementById('listaServicos').innerHTML = (Array.isArray(servs) && servs.length > 0)
                ? servs.map(s => `<li><strong>${s.titulo}</strong> - R$ ${s.preco} <small>(${s.descricao || ''})</small></li>`).join('')
                : '<li>Nenhum serviço cadastrado.</li>';

            const resPort = await fetch(`http://localhost:3000/portfolio?mei_id=${meiId}`);
            const ports = await resPort.json();
            document.getElementById('galeriaPort').innerHTML = (Array.isArray(ports) && ports.length > 0)
                ? ports.map(p => `
                    <div class="card-port">
                        <img src="${normalizarUrl(p.imagem_url)}" onerror="this.src='https://via.placeholder.com/140x90?text=Sem+Imagem'">
                        <br><small><strong>${p.titulo}</strong></small>
                    </div>
                `).join('')
                : '<p style="color:#888;">Nenhuma foto no portfólio.</p>';
        }

        async function carregarContratos() {
            const resC = await fetch(`http://localhost:3000/contratos?usuario_id=${user.id}&tipo=mei`);
            const contratos = await resC.json();

            document.getElementById('listaContratos').innerHTML = (Array.isArray(contratos) && contratos.length > 0)
                ? contratos.map(c => {
                    const extra = extrairDadosDescricao(c.descricao);
                    const linkMeet = normalizarUrl(c.link_reuniao || extra.link);
                    const rawData = c.data_reuniao || extra.data;
                    const dataFormatada = rawData ? new Date(rawData).toLocaleString('pt-BR') : 'Aguardando agendamento do ADM';
                    const linkPdf = normalizarUrl(c.contrato_digitalizado_url);

                    return `
                        <div style="border:1px solid #ccc; padding:15px; margin-bottom:12px; border-radius:6px; background:#fafafa;">
                            <h4 style="margin-top:0; color:#007bff;">${c.titulo_servico || 'Interesse de Serviço'} - <span style="color:#28a745;">R$ ${c.valor || 'A combinar'}</span></h4>
                            <p style="margin:5px 0;"><strong>Detalhes da Empresa:</strong> ${extra.detalhes}</p>
                            
                            <div style="margin:10px 0; padding:10px; background:#eef7ff; border-radius:5px; border-left:4px solid #007bff;">
                                <strong>📹 Reunião do Google Meet (Definida pelo ADM):</strong><br>
                                ${linkMeet ? `
                                    <a href="${linkMeet}" target="_blank" class="btn-meet" style="margin-top:5px;">🎥 Entrar no Google Meet</a><br>
                                    <small style="color:#333; font-weight:bold;">📅 Data/Hora: ${dataFormatada}</small>
                                ` : '<em style="color:#666; font-size:0.9em;">O ADM ainda não disponibilizou o link do Meet.</em>'}
                            </div>

                            ${linkPdf ? `
                                <p style="margin:8px 0;">
                                    <a href="${linkPdf}" target="_blank" style="color:#007bff; font-weight:bold;">📄 Ver Contrato PDF</a>
                                </p>
                            ` : ''}

                            <p style="margin:5px 0;">Status: <strong style="text-transform:uppercase;">${c.status}</strong></p>
                            
                            ${c.status === 'pendente' ? `
                                <div style="margin-top:10px;">
                                    <button onclick="responderContrato(${c.id}, 'aceito',${c.empresa_usuario_id})" class="btn-acao btn-aceitar">✅ Aceitar Proposta</button>
                                    <button onclick="responderContrato(${c.id}, 'recusado',${c.empresa_usuario_id})" class="btn-acao btn-recusar">❌ Recusar Proposta</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')
                : '<p style="color:#888;">Nenhuma proposta ou contrato registrado.</p>';
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
                } else {
                    mostrarAviso('Erro ao atualizar status do contrato.', true);
                }
            } catch (err) {
                mostrarAviso('Erro de conexão ao responder contrato!', true);
            }
        }

        // SALVAR PERFIL
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
                    carregarTudo();
                } else {
                    mostrarAviso('Erro ao salvar perfil.', true);
                }
            } catch (err) {
                mostrarAviso('Erro de conexão ao salvar perfil!', true);
            }
        });

        // SALVAR SERVIÇO
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
                descricao: document.getElementById('servico_desc').value
            };

            const res = await fetch('http://localhost:3000/servicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (res.ok) {
                mostrarAviso('Serviço cadastrado com sucesso!');
                document.getElementById('formServico').reset();
                carregarServicosEPortfolio(perfil.id);
            } else {
                mostrarAviso('Erro ao cadastrar serviço.', true);
            }
        });

        // SALVAR PORTFÓLIO
        document.getElementById('formPort').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resP = await fetch(`http://localhost:3000/perfil-mei?usuario_id=${user.id}`);
            const perfil = await resP.json();

            if (!perfil || !perfil.id) {
                mostrarAviso('Salve seu Perfil MEI primeiro antes de adicionar fotos ao portfólio!', true);
                return;
            }

            const dados = {
                mei_id: perfil.id,
                titulo: document.getElementById('port_titulo').value,
                imagem_url: normalizarUrl(document.getElementById('port_url').value)
            };

            const res = await fetch('http://localhost:3000/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (res.ok) {
                mostrarAviso('Foto adicionada ao portfólio!');
                document.getElementById('formPort').reset();
                carregarServicosEPortfolio(perfil.id);
            } else {
                mostrarAviso('Erro ao adicionar foto ao portfólio.', true);
            }
        });

        carregarTudo();