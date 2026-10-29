const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão ao MySQL (XAMPP)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pj_helper'
});

// CONFIGURAÇÃO DO TRANSPORTE DE E-MAIL (Nodemailer)
// Substitua pelas credenciais reais de e-mail (ex: Gmail SMTP / App Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pjhelperofc@gmail.com',
        pass: 'ruiw phlm eqgb wmfc'
    }
});


async function enviarEmail(para, assunto, texto) {
    try {
        // Cria um assunto único com a hora atual para o Gmail não bloquear/agrupar
        const assuntoDinamico = `${assunto} (${new Date().toLocaleTimeString('pt-BR')})`;

        await transporter.sendMail({
            from: '"PJ Helper" <pjhelperofc@gmail.com>',
            to: para,
            subject: assuntoDinamico,
            text: texto
        });
        console.log(`📧 E-mail enviado para: ${para}`);
    } catch (err) {
        console.error(`❌ Erro ao enviar e-mail para ${para}:`, err.message);
    }
}

// 1. REGISTRO DE USUÁRIO
app.post(['/cadastro', '/usuarios'], async (req, res) => {
    let { email, senha, tipo, chaveAdmin, razao_social, cnpj, nome_responsavel, categoria, descricao_servico } = req.body;
    
    if (!email || !senha || !tipo) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (tipo === 'admin') {
        const CHAVE_MESTRE_ADM = 'admin123';
        if (chaveAdmin !== CHAVE_MESTRE_ADM) {
            return res.status(403).json({ error: 'Chave de acesso ADM inválida!' });
        }
    }

    const sqlCheck = 'SELECT id FROM usuarios WHERE email = ?';
    db.query(sqlCheck, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro no banco de dados.' });
        if (result.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado.' });

        try {
            const senhaHash = await bcrypt.hash(senha, 10);
            // Administradores já entram APROVADOS; MEI e Empresa entram PENDENTES
            const statusInicial = (tipo === 'admin') ? 'aprovado' : 'pendente';

            const sqlInsert = 'INSERT INTO usuarios (email, senha, tipo, status) VALUES (?, ?, ?, ?)';
            
            db.query(sqlInsert, [email, senhaHash, tipo, statusInicial], (err2, resInsert) => {
                if (err2) return res.status(500).json({ error: 'Erro ao criar usuário.' });
                
                const novoId = resInsert.insertId;

                if (tipo === 'mei') {
                    const sqlMei = `
                        INSERT INTO perfis_mei (usuario_id, nome_fantasia, razao_social, cnpj, categoria, resumo_servico) 
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            nome_fantasia = VALUES(nome_fantasia),
                            razao_social = VALUES(razao_social),
                            cnpj = VALUES(cnpj),
                            categoria = VALUES(categoria),
                            resumo_servico = VALUES(resumo_servico)
                    `;
                    db.query(sqlMei, [novoId, nome_responsavel, razao_social, cnpj, categoria, descricao_servico]);
                } else if (tipo === 'empresa') {
                    const sqlEmpresa = `
                        INSERT INTO perfis_empresa (usuario_id, razao_social, cnpj) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            razao_social = VALUES(razao_social),
                            cnpj = VALUES(cnpj)
                    `;
                    db.query(sqlEmpresa, [novoId, razao_social, cnpj]);
                }

                // E-mail de Boas-vindas para o usuário cadastrado
                if (tipo !== 'admin') {
                    enviarEmail(
                        email,
                        'Cadastro em Análise - PJ Helper',
                        'Obrigado por se cadastrar! Seu perfil passará por uma avaliação de um dos nossos funcionários e em breve você receberá a confirmação de sua conta.'
                    );

                    // Notifica os ADMs no banco de dados
                    db.query(
                        'INSERT INTO notificacoes (usuario_id, mensagem) SELECT id, ? FROM usuarios WHERE tipo = "admin"',
                        [`Novo cadastro pendente de aprovação: ${email} (${tipo.toUpperCase()})`]
                    );
                }

                res.json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!', id: novoId, status: statusInicial });
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro no processamento da senha.' });
        }
    });
});

// 2. LOGIN (com trava de status pendente/recusado)
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT id, email, senha, tipo, status FROM usuarios WHERE email = ?';
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro interno na base de dados.' });
        if (results.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        // TRAVA DE SEGURANÇA POR STATUS
        if (usuario.status === 'pendente') {
            return res.status(403).json({ erro: 'Sua conta ainda está em análise pela nossa equipe. Aguarde a aprovação!' });
        }
        if (usuario.status === 'recusado') {
            return res.status(403).json({ erro: 'Sua solicitação de cadastro não foi aprovada.' });
        }
        
        res.json({ usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo, status: usuario.status } });
    });
});

// 3. CATÁLOGO DE ITENS / SERVIÇOS DO MEI
app.get(['/catalogo-itens', '/servicos'], (req, res) => {
    const { mei_id } = req.query;
    const sql = mei_id ? 'SELECT * FROM catalogo_itens WHERE mei_id = ?' : 'SELECT * FROM catalogo_itens';
    
    db.query(sql, [mei_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar catálogo.' });
        res.json(results);
    });
});

app.post(['/catalogo-itens', '/servicos'], (req, res) => {
    const { mei_id, titulo, descricao, preco } = req.body;
    
    if (!mei_id || !titulo) {
        return res.status(400).json({ erro: 'ID do MEI e Título são obrigatórios.' });
    }

    const sql = 'INSERT INTO catalogo_itens (mei_id, titulo, descricao, preco) VALUES (?, ?, ?, ?)';
    db.query(sql, [mei_id, titulo, descricao, preco], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao registar item no catálogo.' });
        res.json({ sucesso: true });
    });
});

app.delete(['/catalogo-itens/:id', '/servicos/:id'], (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM catalogo_itens WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao apagar serviço do catálogo.' });
        res.json({ sucesso: true, mensagem: 'Serviço removido com sucesso!' });
    });
});

// 4. PERFIL MEI
app.get('/perfil-mei', (req, res) => {
    const { usuario_id } = req.query;
    const sql = 'SELECT * FROM perfis_mei WHERE usuario_id = ?';
    db.query(sql, [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar perfil.' });
        res.json(results[0] || null);
    });
});

app.post('/perfil-mei', (req, res) => {
    const dados = req.body;
    const sql = `
        INSERT INTO perfis_mei SET ? 
        ON DUPLICATE KEY UPDATE ?
    `;

    db.query(sql, [dados, dados], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro ao salvar perfil no banco.' });
        }
        res.json({ sucesso: true, mensagem: 'Perfil salvo com sucesso!' });
    });
});

app.get(['/perfis-mei', '/catalogo-completo', '/meis'], (req, res) => {
    const sqlMeis = `
        SELECT 
            u.id AS usuario_id, 
            u.email, 
            pm.id AS mei_id, 
            COALESCE(NULLIF(pm.nome_fantasia, ''), 'Perfil em Preenchimento') AS nome_fantasia,
            COALESCE(NULLIF(pm.razao_social, ''), 'Não informada') AS razao_social,
            COALESCE(NULLIF(pm.categoria, ''), 'Geral') AS categoria,
            COALESCE(NULLIF(pm.resumo_servico, ''), 'Sem resumo no momento') AS resumo_servico,
            COALESCE(NULLIF(pm.apresentacao, ''), 'Sem apresentação') AS apresentacao,
            COALESCE(NULLIF(pm.cidade, ''), 'Não informada') AS cidade,
            COALESCE(NULLIF(pm.telefone, ''), 'Sem telefone') AS telefone,
            COALESCE(NULLIF(pm.cnpj, ''), 'Sem CNPJ') AS cnpj,
            COALESCE(pm.anos_experiencia, 0) AS anos_experiencia,
            pm.site, 
            pm.instagram
        FROM usuarios u
        LEFT JOIN perfis_mei pm ON u.id = pm.usuario_id
        WHERE u.tipo = 'mei' AND u.status = 'aprovado'
        ORDER BY u.id DESC
    `;

    db.query(sqlMeis, (err, meis) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar catálogo de prestadores.' });

        const sqlServicos = 'SELECT * FROM catalogo_itens';
        db.query(sqlServicos, (err2, servicos) => {
            if (err2) {
                return res.json(meis.map(m => ({ ...m, servicos: [] })));
            }

            const resultadoFinal = meis.map(m => {
                m.servicos = servicos.filter(s => s.mei_id === m.mei_id);
                return m;
            });

            res.json(resultadoFinal);
        });
    });
});

// 5. PERFIL EMPRESA
app.get('/perfil-empresa', (req, res) => {
    const { usuario_id } = req.query;
    db.query('SELECT * FROM perfis_empresa WHERE usuario_id = ?', [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar perfil da empresa.' });
        res.json(results[0] || null);
    });
});

app.post('/perfil-empresa', (req, res) => {
    const { usuario_id, razao_social, cnpj, telefone } = req.body;

    if (!usuario_id || !razao_social || !cnpj) {
        return res.status(400).json({ erro: 'Razão Social e CNPJ são obrigatórios.' });
    }

    const sqlCheck = 'SELECT id FROM perfis_empresa WHERE usuario_id = ?';
    db.query(sqlCheck, [usuario_id], (err, results) => {
        if (results && results.length > 0) {
            db.query('UPDATE perfis_empresa SET razao_social=?, cnpj=?, telefone=? WHERE usuario_id=?', [razao_social, cnpj, telefone, usuario_id], (err2) => {
                if (err2) return res.status(500).json({ erro: 'Erro ao atualizar dados da empresa.' });
                res.json({ sucesso: true });
            });
        } else {
            db.query('INSERT INTO perfis_empresa (usuario_id, razao_social, cnpj, telefone) VALUES (?, ?, ?, ?)', [usuario_id, razao_social, cnpj, telefone], (err2) => {
                if (err2) return res.status(500).json({ erro: 'Erro ao guardar dados da empresa.' });
                res.json({ sucesso: true });
            });
        }
    });
});

// 6. CONTRATOS E REUNIÕES
app.post('/proposta', (req, res) => {
    const { empresa_usuario_id, mei_usuario_id, titulo_servico, descricao, valor, link_reuniao, data_reuniao } = req.body;

    const sql = `
        INSERT INTO contratos (empresa_usuario_id, mei_usuario_id, titulo_servico, descricao, valor, status, link_reuniao, data_reuniao)
        VALUES (?, ?, ?, ?, ?, 'pendente', ?, ?)
    `;
    
    db.query(sql, [empresa_usuario_id, mei_usuario_id, titulo_servico, descricao, valor, link_reuniao || null, data_reuniao || null], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao registar proposta.' });
        }

        const msgNotif = `Você recebeu uma nova proposta de serviço: ${titulo_servico} (R$ ${valor})`;
        db.query('INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?)', [mei_usuario_id, msgNotif]);

        // Dispara e-mail de aviso de nova proposta para o MEI
        db.query('SELECT email FROM usuarios WHERE id = ?', [mei_usuario_id], (err2, resMei) => {
            if (!err2 && resMei.length > 0) {
                enviarEmail(
                    resMei[0].email,
                    'Nova Proposta Recebida - PJ Helper',
                    `Você recebeu uma nova proposta de serviço no PJ Helper!\n\nServiço: ${titulo_servico}\nValor: R$ ${valor}\n\nAcesse seu painel para responder.`
                );
            }
        });

        res.json({ sucesso: true, contrato_id: result.insertId });
    });
});

app.get('/contratos', (req, res) => {
    const { usuario_id, tipo } = req.query;
    const campo = tipo === 'mei' ? 'mei_usuario_id' : 'empresa_usuario_id';
    
    db.query(`SELECT * FROM contratos WHERE ${campo} = ? ORDER BY id DESC`, [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar contratos.' });
        res.json(results);
    });
});

app.post('/atualizar-contrato', (req, res) => {
    const { contrato_id, status, notificar_usuario_id } = req.body;
    
    db.query('UPDATE contratos SET status = ? WHERE id = ?', [status, contrato_id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar contrato.' });

        if (notificar_usuario_id) {
            const msg = `O contrato #${contrato_id} teve o seu estado alterado para: ${status.toUpperCase()}`;
            db.query('INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?)', [notificar_usuario_id, msg]);
        }

        res.json({ sucesso: true });
    });
});

// 7. NOTIFICAÇÕES
app.get('/notificacoes', (req, res) => {
    const { usuario_id } = req.query;
    db.query('SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY id DESC', [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar notificações.' });
        res.json(results);
    });
});

// 8. PAINEL ADMIN
app.get('/admin/dados', (req, res) => {
    const sqlUsers = 'SELECT id, email, tipo, status FROM usuarios ORDER BY id DESC';
    const sqlContratos = 'SELECT * FROM contratos ORDER BY id DESC';
    
    db.query(sqlUsers, (err, usuarios) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar utilizadores.' });
        db.query(sqlContratos, (err2, contratos) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao procurar contratos.' });
            res.json({ usuarios, contratos });
        });
    });
});

app.post('/esqueci-senha', (req, res) => {
    const { email } = req.body;

    db.query('SELECT id FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ erro: 'E-mail não encontrado na plataforma.' });
        }

        // Gera um código simples de 6 dígitos
        const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();

        // Opcional: Salvar o codigoRecuperacao na tabela de usuários para validar depois
        db.query('UPDATE usuarios SET token_recuperacao = ? WHERE email = ?', [codigoRecuperacao, email], (err2) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao gerar token.' });

            // Dispara o e-mail usando nossa função
            enviarEmail(
                email,
                'Recuperação de Senha - PJ Helper',
                `Você solicitou a recuperação de senha no PJ Helper.\n\nSeu código de verificação é: ${codigoRecuperacao}\n\nSe você não solicitou, ignore este e-mail.`
            );

            res.json({ sucesso: true, mensagem: 'E-mail de recuperação enviado com sucesso!' });
        });
    });
});

app.post('/redefinir-senha', async (req, res) => {
    const { email, codigo, novaSenha } = req.body;

    db.query('SELECT id FROM usuarios WHERE email = ? AND token_recuperacao = ?', [email, codigo], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ erro: 'Código de verificação inválido ou expirado.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha e limpa o token usado
        db.query('UPDATE usuarios SET senha = ?, token_recuperacao = NULL WHERE email = ?', [novaSenhaHash, email], (err2) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao atualizar a senha.' });
            res.json({ sucesso: true, mensagem: 'Senha redefinida com sucesso! Faça login novamente.' });
        });
    });
});

// PAINEL ADM: Aprovar ou Recusar Conta de Usuário
app.post('/admin/aprovar-usuario', (req, res) => {
    const { usuario_id, status } = req.body; // status: 'aprovado' ou 'recusado'

    if (!usuario_id || !['aprovado', 'recusado'].includes(status)) {
        return res.status(400).json({ erro: 'Parâmetros inválidos.' });
    }

    const sql = 'UPDATE usuarios SET status = ? WHERE id = ?';
    db.query(sql, [status, usuario_id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao atualizar status do usuário.' });

        // Notifica por e-mail
        db.query('SELECT email FROM usuarios WHERE id = ?', [usuario_id], (err2, result) => {
            if (!err2 && result.length > 0) {
                const userEmail = result[0].email;
                if (status === 'aprovado') {
                    enviarEmail(
                        userEmail,
                        'Conta Aprovada! - PJ Helper',
                        'Sua conta no PJ Helper foi avaliada e APROVADA com sucesso! Você já pode realizar login e utilizar a plataforma.'
                    );
                } else {
                    enviarEmail(
                        userEmail,
                        'Status do Cadastro - PJ Helper',
                        'Infelizmente seu cadastro no PJ Helper foi recusado após análise.'
                    );
                }
            }
        });

        res.json({ sucesso: true, mensagem: `Usuário alterado para ${status}.` });
    });
});

app.get('/admin/reunioes', (req, res) => {
    const sql = `
        SELECT 
            c.id AS contrato_id, 
            c.titulo_servico, 
            c.descricao,
            c.valor,
            c.link_reuniao, 
            c.data_reuniao, 
            c.status,
            c.contrato_digitalizado_url,
            c.empresa_usuario_id,
            c.mei_usuario_id,
            COALESCE(u_emp.email, 'Empresa não encontrada') AS empresa_email, 
            COALESCE(u_mei.email, 'MEI não encontrado') AS mei_email
        FROM contratos c
        LEFT JOIN usuarios u_emp ON c.empresa_usuario_id = u_emp.id
        LEFT JOIN usuarios u_mei ON c.mei_usuario_id = u_mei.id
        ORDER BY c.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar reuniões para o Admin.' });
        res.json(results);
    });
});

app.post('/admin/confirmar-contrato', (req, res) => {
    const { contrato_id, status } = req.body;
    const novoStatus = status || 'concluido';

    const sql = 'UPDATE contratos SET status = ? WHERE id = ?';
    db.query(sql, [novoStatus, contrato_id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao confirmar contrato.' });

        db.query('SELECT empresa_usuario_id, mei_usuario_id FROM contratos WHERE id = ?', [contrato_id], (err2, result) => {
            if (!err2 && result.length > 0) {
                const { empresa_usuario_id, mei_usuario_id } = result[0];
                const msg = `O contrato #${contrato_id} foi oficialmente alterado para ${novoStatus.toUpperCase()} pelo Administrador!`;
                db.query('INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?), (?, ?)', 
                    [empresa_usuario_id, msg, mei_usuario_id, msg]);
            }
        });

        res.json({ sucesso: true, mensagem: `Contrato marcado como ${novoStatus} pelo Administrador.` });
    });
});

app.post('/admin/anexar-contrato', (req, res) => {
    const { contrato_id, contrato_digitalizado_url } = req.body;

    if (!contrato_id || !contrato_digitalizado_url) {
        return res.status(400).json({ erro: 'ID do contrato e URL são obrigatórios.' });
    }

    const sql = 'UPDATE contratos SET contrato_digitalizado_url = ? WHERE id = ?';
    db.query(sql, [contrato_digitalizado_url, contrato_id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao anexar contrato digitalizado.' });

        db.query('SELECT empresa_usuario_id, mei_usuario_id FROM contratos WHERE id = ?', [contrato_id], (err2, result) => {
            if (!err2 && result.length > 0) {
                const { empresa_usuario_id, mei_usuario_id } = result[0];
                const msg = `O Administrador disponibilizou a versão digitalizada do contrato #${contrato_id}.`;
                db.query('INSERT INTO notificacoes (usuario_id, mensagem) VALUES (?, ?), (?, ?)', 
                    [empresa_usuario_id, msg, mei_usuario_id, msg]);
            }
        });

        res.json({ sucesso: true, mensagem: 'Versão digitalizada enviada!' });
    });
});

// 9. ROTA DE EXCLUSÃO DE CONTA COM VALIDAÇÃO DE SENHA
app.delete('/excluir-conta/:id', async (req, res) => {
    const userId = req.params.id;
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).json({ erro: 'A senha é obrigatória para excluir a conta.' });
    }

    // 1. Busca o utilizador na base de dados para verificar a senha
    const queryBusca = 'SELECT * FROM usuarios WHERE id = ?';
    db.query(queryBusca, [userId], async (err, resultados) => {
        if (err || resultados.length === 0) {
            return res.status(404).json({ erro: 'Utilizador não encontrado.' });
        }

        const usuario = resultados[0];

        try {
            // 2. Compara a senha digitada com o hash guardado no MySQL
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Senha incorreta!' });
            }

            // 3. Se a senha estiver correta, apaga o utilizador da base de dados
            const queryDelete = 'DELETE FROM usuarios WHERE id = ?';
            db.query(queryDelete, [userId], (errDelete) => {
                if (errDelete) {
                    console.error(errDelete);
                    return res.status(500).json({ erro: 'Erro ao excluir conta na base de dados.' });
                }

                return res.status(200).json({ sucesso: true, mensagem: 'Conta excluída com sucesso!' });
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: 'Erro interno ao validar a senha.' });
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000!');
});