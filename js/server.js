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

// 1. REGISTO DE UTILIZADOR (Aceita tanto /cadastro quanto /usuarios)
app.post(['/cadastro', '/usuarios'], async (req, res) => {
    let { email, senha, tipo, chaveAdmin } = req.body;
    
    if (!email || !senha || !tipo) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.', erro: 'Preencha todos os campos obrigatórios.' });
    }

    // Normaliza tipo de empresa grande para 'empresa' (padrão das consultas do banco)
    if (tipo === 'empresa_grande') tipo = 'empresa';

    // Validação da Chave ADM
    if (tipo === 'admin') {
        const CHAVE_MESTRE_ADM = 'admin123'; // Altere a chave secreta de ADM se desejar
        if (chaveAdmin !== CHAVE_MESTRE_ADM) {
            return res.status(401).json({ error: 'Chave de Acesso ADM incorreta!', erro: 'Chave de Acesso ADM incorreta!' });
        }
    }

    const sqlCheck = 'SELECT id FROM usuarios WHERE email = ?';
    db.query(sqlCheck, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro de ligação à base de dados.', erro: 'Erro de ligação à base de dados.' });
        if (result.length > 0) return res.status(400).json({ error: 'E-mail já registado.', erro: 'E-mail já registado.' });

        try {
            const senhaHash = await bcrypt.hash(senha, 10);
            const sqlInsert = 'INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)';
            
            db.query(sqlInsert, [email, senhaHash, tipo], (err2, resInsert) => {
                if (err2) return res.status(500).json({ error: 'Erro ao criar conta.', erro: 'Erro ao criar conta.' });
                res.json({ sucesso: true, message: 'Usuário cadastrado com sucesso!', mensagem: 'Usuário cadastrado com sucesso!', id: resInsert.insertId });
            });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao processar encriptação da password.', erro: 'Erro ao processar encriptação da password.' });
        }
    });
});

// 2. LOGIN (Validação com bcrypt)
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT id, email, senha, tipo FROM usuarios WHERE email = ?';
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro interno na base de dados.' });
        if (results.length === 0) return res.status(401).json({ erro: 'E-mail ou password incorretos.' });

        const usuario = results[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'E-mail ou password incorretos.' });
        }
        
        res.json({ usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo } });
    });
});

// 3. CATÁLOGO DE ITENS DO MEI
app.get('/catalogo-itens', (req, res) => {
    const { mei_id } = req.query;
    const sql = mei_id ? 'SELECT * FROM catalogo_itens WHERE mei_id = ?' : 'SELECT * FROM catalogo_itens';
    
    db.query(sql, [mei_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar catálogo.' });
        res.json(results);
    });
});

app.post('/catalogo-itens', (req, res) => {
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

// 4. PERFIL MEI
app.get('/perfil-mei', (req, res) => {
    const { usuario_id } = req.query;
    const sql = 'SELECT * FROM perfis_mei WHERE usuario_id = ?';
    db.query(sql, [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar perfil.' });
        res.json(results[0] || null);
    });
});

// ACEITA QUALQUER UMA DESSAS ROTAS: /perfis-mei, /catalogo-completo ou /meis
app.get(['/perfis-mei', '/catalogo-completo', '/meis'], (req, res) => {
    const sql = `
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
            pm.site, 
            pm.instagram
        FROM usuarios u
        LEFT JOIN perfis_mei pm ON u.id = pm.usuario_id
        WHERE u.tipo = 'mei'
        ORDER BY u.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao carregar catálogo de prestadores.' });
        res.json(results);
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

    console.log('📌 Nova proposta recebida:', req.body);

    const sql = `
        INSERT INTO contratos (empresa_usuario_id, mei_usuario_id, titulo_servico, descricao, valor, status, link_reuniao, data_reuniao)
        VALUES (?, ?, ?, ?, ?, 'pendente', ?, ?)
    `;
    
    db.query(sql, [empresa_usuario_id, mei_usuario_id, titulo_servico, descricao, valor, link_reuniao || null, data_reuniao || null], (err, result) => {
        if (err) {
            console.error('❌ Erro no SQL da proposta:', err);
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

// 7. PORTFÓLIO DO MEI
app.get('/portfolio', (req, res) => {
    const { mei_id } = req.query;
    db.query('SELECT * FROM portfolio WHERE mei_id = ? ORDER BY id DESC', [mei_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar portfólio.' });
        res.json(results);
    });
});

app.post('/portfolio', (req, res) => {
    const { mei_id, titulo, imagem_url, descricao } = req.body;
    db.query('INSERT INTO portfolio (mei_id, titulo, imagem_url, descricao) VALUES (?, ?, ?, ?)', [mei_id, titulo, imagem_url, descricao], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao adicionar item ao portfólio.' });
        res.json({ sucesso: true });
    });
});

// 8. NOTIFICAÇÕES
app.get('/notificacoes', (req, res) => {
    const { usuario_id } = req.query;
    db.query('SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY id DESC', [usuario_id], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao procurar notificações.' });
        res.json(results);
    });
});

// 9. PAINEL ADMIN - DADOS E FUNÇÕES EXCLUSIVAS
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

// [EXCLUSIVO ADM] 9.1. Listar todas as reuniões e propostas
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
        if (err) {
            console.error('❌ Erro na busca de reuniões do Admin:', err);
            return res.status(500).json({ erro: 'Erro ao carregar reuniões para o Admin.' });
        }
        res.json(results);
    });
});

// [EXCLUSIVO ADM] 9.2. Confirmar se o contrato foi firmado
app.post('/admin/confirmar-contrato', (req, res) => {
    const { contrato_id, status } = req.body;
    const novoStatus = status || 'concluido';

    const sql = 'UPDATE contratos SET status = ? WHERE id = ?';
    db.query(sql, [novoStatus, contrato_id], (err) => {
        if (err) {
            console.error('❌ Erro ao confirmar contrato:', err);
            return res.status(500).json({ erro: 'Erro ao confirmar contrato. Verifique o status enviado.' });
        }

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

// [EXCLUSIVO ADM] 9.3. Enviar/Anexar versão digitalizada do contrato
app.post('/admin/anexar-contrato', (req, res) => {
    const { contrato_id, contrato_digitalizado_url } = req.body;

    if (!contrato_id || !contrato_digitalizado_url) {
        return res.status(400).json({ erro: 'ID do contrato e URL do documento digitalizado são obrigatórios.' });
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

        res.json({ sucesso: true, mensagem: 'Versão digitalizada enviada e partes notificadas!' });
    });
});

app.listen(3000, () => {
    console.log('🚀 Servidor a rodar na porta 3000!');
});