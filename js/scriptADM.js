
        // Libera visualização do body após validação no head
        document.body.style.display = 'block';

        function logout() {
            localStorage.clear();
            window.location.replace('login.html');
        }

        // Função para exibir avisos bonitões na tela sem usar alert()
        function mostrarAviso(mensagem, ehErro = false) {
            const banner = document.getElementById('bannerAviso');
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

        // PARSER INTELIGENTE: Pega o texto da 'descricao' enviado pelo backend e extrai Link e Data
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

        // Garantir que URLs tenham o https:// na frente
        function normalizarUrl(url) {
            if (!url) return '';
            url = url.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return 'https://' + url;
            }
            return url;
        }

        async function carregarAdmin() {
            try {
                // 1. Carregar Usuários
                const resUsers = await fetch('http://localhost:3000/admin/dados');
                const dadosUsers = await resUsers.json();

                const tbodyUsers = document.getElementById('tabelaUsers');
                if (dadosUsers.usuarios && dadosUsers.usuarios.length > 0) {
                    tbodyUsers.innerHTML = dadosUsers.usuarios.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.email}</td>
                            <td><strong>${u.tipo ? u.tipo.toUpperCase() : 'N/A'}</strong></td>
                        </tr>
                    `).join('');
                } else {
                    tbodyUsers.innerHTML = '<tr><td colspan="3">Nenhum usuário cadastrado.</td></tr>';
                }

                // 2. Carregar Reuniões e Contratos
                const resReunioes = await fetch('http://localhost:3000/admin/reunioes');
                const contratos = await resReunioes.json();

                const tbodyContratos = document.getElementById('tabelaContratos');
                if (Array.isArray(contratos) && contratos.length > 0) {
                    tbodyContratos.innerHTML = contratos.map(c => {
                        // Faz a busca inteligente caso o backend junte tudo em 'descricao'
                        const extra = extrairDadosDescricao(c.descricao);
                        
                        const linkMeet = normalizarUrl(c.link_reuniao || extra.link);
                        const rawData = c.data_reuniao || extra.data;
                        const dataFormatada = rawData ? new Date(rawData).toLocaleString('pt-BR') : 'Sem data definida';
                        const linkPdf = normalizarUrl(c.contrato_digitalizado_url);

                        return `
                            <tr>
                                <td>#${c.contrato_id}</td>
                                <td>
                                    <strong>${c.titulo_servico || 'Proposta / Serviço'}</strong><br>
                                    <small style="color:#28a745; font-weight:bold;">R$ ${c.valor || 'A combinar'}</small><br>
                                    <small style="color:#666;">${extra.detalhes}</small>
                                </td>
                                <td>
                                    <small><strong>Empresa ID:</strong> ${c.empresa_usuario_id || c.empresa_email || 'N/I'}</small><br>
                                    <small><strong>MEI ID:</strong> ${c.mei_usuario_id || c.mei_email || 'N/I'}</small>
                                </td>
                                <td>
                                    ${linkMeet ? `
                                        <a href="${linkMeet}" target="_blank" class="btn-meet">🎥 Entrar no Meet</a><br>
                                        <small style="font-size:0.8em; color:#333;">📅 ${dataFormatada}</small>
                                    ` : '<em style="color:#888;">Sem reunião agendada</em>'}
                                </td>
                                <td><strong>${(c.status || 'PENDENTE').toUpperCase()}</strong></td>
                                <td>
                                    ${linkPdf ? `
                                        <a href="${linkPdf}" target="_blank" style="color:#007bff; font-weight:bold;">📄 Ver PDF</a>
                                    ` : '<em style="color:#888;">Pendente</em>'}
                                </td>
                                <td>
                                    <button onclick="abrirModalMeet(${c.contrato_id})" class="btn-acao btn-add-meet">📅 Agendar Meet</button>
                                    <button onclick="confirmarContrato(${c.contrato_id})" class="btn-acao btn-confirmar">✅ Confirmar</button>
                                    <button onclick="abrirModalPdf(${c.contrato_id})" class="btn-acao btn-anexo">📎 Anexar PDF</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                } else {
                    tbodyContratos.innerHTML = '<tr><td colspan="7">Nenhum contrato encontrado.</td></tr>';
                }

            } catch (err) {
                console.error('Erro ao carregar dados:', err);
                mostrarAviso('Erro de conexão ao carregar os dados do servidor!', true);
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

        // CONFIRMAR CONTRATO
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

        carregarAdmin();
