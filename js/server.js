const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão à base de dados MySQL (XAMPP)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pj_helper'
});

// 1. REGISTRO DE USUÁRIO
app.post(['/cadastro', '/usuarios'], async (req, res) => {
    let { email, senha, tipo, chaveAdmin, razao_social, cnpj, nome_responsavel, categoria, descricao_servico } = req.body;
    
    if (!email || !senha || !tipo) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // VALIDAÇÃO DA CHAVE SECRETA DE ADM
    if (tipo === 'admin') {
        const CHAVE_MESTRE_ADM = 'SUA_CHAVE_SECRETA_AQUI'; // Defina sua chave secreta aqui
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
            const sqlInsert = 'INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)';
            
            db.query(sqlInsert, [email, senhaHash, tipo], (err2, resInsert) => {
                if (err2) return res.status(500).json({ error: 'Erro ao criar usuário.' });
                
                const novoId = resInsert.insertId;

                // Insere os dados detalhados do cadastro de acordo com o tipo
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

                res.json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!', id: novoId });
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro no processamento da senha.' });
        }
    });
});

// 2. LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT id, email, senha, tipo FROM usuarios WHERE email = ?';
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro interno na base de dados.' });
        if (results.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }
        
        res.json({ usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo } });
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

// NOVO: ROTA PARA DELETAR SERVIÇO
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
        WHERE u.tipo = 'mei'
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
    const sqlUsers = 'SELECT id, email, tipo FROM usuarios';
    const sqlContratos = 'SELECT * FROM contratos ORDER BY id DESC';
    
    db.query(sqlUsers, (err, usuarios) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar utilizadores.' });
        db.query(sqlContratos, (err2, contratos) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao procurar contratos.' });
            res.json({ usuarios, contratos });
        });
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

app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000!');
});