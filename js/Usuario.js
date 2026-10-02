const mysql = require('mysql')
const bcrypt = require('bcrypt')

// POOL DE CONEXÕES: Garante que o servidor continue rodando sem derrubar a aplicação
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pj_helper'
})

class PjHelperBD {

    // CADASTRO
    static async addUsuario(usuario, callback) {
        var { email, senha, tipo, chaveAdmin } = usuario

        if (!email || !senha || !tipo) {
            return callback({ error: 'Insira os dados corretamente' }, null)
        }

        // Validação de Segurança para Administrador
        if (tipo === 'admin') {
            const CHAVE_MESTRA = 'PJHELPER_ADM_2026'
            if (chaveAdmin !== CHAVE_MESTRA) {
                return callback({ error: 'Chave Mestra de Administrador incorreta!' }, null)
            }
        }

        try {
            // Evita criptografar duas vezes caso o server.js já tenha criptografado
            let senhaFinal = senha
            if (!senha.startsWith('$2b$') && !senha.startsWith('$2a$')) {
                senhaFinal = await bcrypt.hash(senha, 10)
            }

            const dadosUsuario = {
                email: email,
                senha: senhaFinal,
                tipo: tipo
            }

            const sql = 'INSERT INTO usuarios SET ?'
            pool.query(sql, dadosUsuario, (err, res) => {
                if (err) {
                    console.error('Erro no Cadastro MySQL:', err.message)
                    return callback({ error: 'Erro ao cadastrar ou e-mail já existe' }, null)
                }

                const novoId = res.insertId
                dadosUsuario.id = novoId
                delete dadosUsuario.senha

                // Cria a estrutura inicial para não sumir do catálogo
                if (tipo === 'mei') {
                    const sqlMei = 'INSERT INTO perfis_mei (usuario_id, nome_fantasia) VALUES (?, ?) ON DUPLICATE KEY UPDATE usuario_id = usuario_id'
                    pool.query(sqlMei, [novoId, 'Perfil em Preenchimento'], (errMei) => {
                        if (errMei) console.error('Aviso ao criar perfil MEI:', errMei.message)
                        return callback(null, dadosUsuario)
                    })
                } else if (tipo === 'empresa_grande') {
                    const sqlEmp = 'INSERT INTO perfis_empresa (usuario_id, razao_social) VALUES (?, ?) ON DUPLICATE KEY UPDATE usuario_id = usuario_id'
                    pool.query(sqlEmp, [novoId, 'Nova Empresa'], (errEmp) => {
                        if (errEmp) console.error('Aviso ao criar perfil Empresa:', errEmp.message)
                        return callback(null, dadosUsuario)
                    })
                } else {
                    return callback(null, dadosUsuario)
                }
            })
        } catch (err) {
            console.error('Erro interno no cadastro:', err)
            return callback({ error: 'Erro ao processar a senha' }, null)
        }
    }

    // LOGIN
    static async login(email, senha, callback) {
        if (!email || !senha) {
            return callback({ error: 'Insira os dados corretamente' }, null)
        }

        const sql = 'SELECT id, email, senha, tipo FROM usuarios WHERE email = ?'
        pool.query(sql, [email], async (err, res) => {
            if (err) {
                console.error('Erro no Login MySQL:', err.message)
                return callback(err, null)
            }

            if (res.length === 0) {
                return callback(null, null)
            }

            var usuario = res[0]
            try {
                const senhaValida = await bcrypt.compare(senha, usuario.senha)
                if (senhaValida) {
                    delete usuario.senha
                    return callback(null, usuario)
                } else {
                    return callback(null, null)
                }
            } catch (e) {
                return callback(null, null)
            }
        })
    }

    // CATÁLOGO COMPLETO (Ordena por ID para não dar erro se faltar coluna no MySQL)
    static getCatalogoCompleto(callback) {
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
        `
        pool.query(sql, (err, res) => {
            if (err) {
                console.error('Erro na Busca do Catálogo:', err.message)
                return callback(err, null)
            }
            callback(null, res)
        })
    }

    static getPerfisMei(callback) {
        return PjHelperBD.getCatalogoCompleto(callback)
    }

    // PERFIL MEI COMPLETO
    static savePerfilMeiCompleto(perfil, callback) {
        const sql = `
            INSERT INTO perfis_mei (usuario_id, razao_social, nome_fantasia, categoria, resumo_servico, apresentacao, anos_experiencia, cidade, site, instagram, cnpj, telefone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            razao_social = VALUES(razao_social),
            nome_fantasia = VALUES(nome_fantasia),
            categoria = VALUES(categoria),
            resumo_servico = VALUES(resumo_servico),
            apresentacao = VALUES(apresentacao),
            anos_experiencia = VALUES(anos_experiencia),
            cidade = VALUES(cidade),
            site = VALUES(site),
            instagram = VALUES(instagram),
            cnpj = VALUES(cnpj),
            telefone = VALUES(telefone)
        `
        const params = [
            perfil.usuario_id,
            perfil.razao_social || null,
            perfil.nome_fantasia || null,
            perfil.categoria || null,
            perfil.resumo_servico || null,
            perfil.apresentacao || null,
            perfil.anos_experiencia || 0,
            perfil.cidade || null,
            perfil.site || null,
            perfil.instagram || null,
            perfil.cnpj || null,
            perfil.telefone || null
        ]
        pool.query(sql, params, (err, res) => {
            if (err) return callback(err, null)
            callback(null, perfil)
        })
    }

    static savePerfilMei(perfil, callback) {
        return PjHelperBD.savePerfilMeiCompleto(perfil, callback)
    }

    static getPerfilMeiPorUsuario(usuario_id, callback) {
        const sql = 'SELECT * FROM perfis_mei WHERE usuario_id = ?'
        pool.query(sql, [usuario_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, res[0] || null)
        })
    }

    // ITENS DO CATÁLOGO / SERVIÇOS
    static addServicoCatalogo(item, callback) {
        const sql = 'INSERT INTO catalogo_itens SET ?'
        pool.query(sql, item, (err, res) => {
            if (err) return callback(err, null)
            item.id = res.insertId
            callback(null, item)
        })
    }

    static getItensCatalogoByMei(mei_id, callback) {
        const sql = 'SELECT * FROM catalogo_itens WHERE mei_id = ?'
        pool.query(sql, [mei_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, res)
        })
    }

    // PORTFÓLIO
    static addPortfolio(item, callback) {
        const sql = 'INSERT INTO portfolio SET ?'
        pool.query(sql, item, (err, res) => {
            if (err) return callback(err, null)
            item.id = res.insertId
            callback(null, item)
        })
    }

    static getPortfolioByMei(mei_id, callback) {
        const sql = 'SELECT * FROM portfolio WHERE mei_id = ?'
        pool.query(sql, [mei_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, res)
        })
    }

    // EMPRESA
    static savePerfilEmpresa(perfil, callback) {
        const sql = `
            INSERT INTO perfis_empresa (usuario_id, razao_social, cnpj, telefone)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            razao_social = VALUES(razao_social),
            cnpj = VALUES(cnpj),
            telefone = VALUES(telefone)
        `
        pool.query(sql, [
            perfil.usuario_id, 
            perfil.razao_social || null, 
            perfil.cnpj || null, 
            perfil.telefone || null
        ], (err, res) => {
            if (err) return callback(err, null)
            callback(null, perfil)
        })
    }

    // CONTRATOS & NOTIFICAÇÕES
    static criarPropostaContrato(contrato, callback) {
        const sql = 'INSERT INTO contratos SET ?'
        pool.query(sql, contrato, (err, res) => {
            if (err) return callback(err, null)
            contrato.id = res.insertId
            callback(null, contrato)
        })
    }

    static getContratosPorUsuario(usuario_id, tipo, callback) {
        const col = tipo === 'mei' ? 'mei_usuario_id' : 'empresa_usuario_id'
        const sql = `SELECT * FROM contratos WHERE ${col} = ? ORDER BY id DESC`
        pool.query(sql, [usuario_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, res)
        })
    }

    static atualizarStatusContrato(contrato_id, status, callback) {
        const sql = 'UPDATE contratos SET status = ? WHERE id = ?'
        pool.query(sql, [status, contrato_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, true)
        })
    }

    static criarNotificacao(notif, callback) {
        const sql = 'INSERT INTO notificacoes SET ?'
        pool.query(sql, notif, (err, res) => {
            if (err) return callback(err, null)
            callback(null, true)
        })
    }

    static getNotificacoesPorUsuario(usuario_id, callback) {
        const sql = 'SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY id DESC'
        pool.query(sql, [usuario_id], (err, res) => {
            if (err) return callback(err, null)
            callback(null, res)
        })
    }

    static getDadosAdmin(callback) {
        const sqlUsers = 'SELECT id, email, tipo FROM usuarios'
        const sqlContratos = 'SELECT * FROM contratos ORDER BY id DESC'

        pool.query(sqlUsers, (err1, usuarios) => {
            if (err1) return callback(err1, null)
            pool.query(sqlContratos, (err2, contratos) => {
                if (err2) return callback(err2, null)
                callback(null, { usuarios, contratos })
            })
        })
    }
}

module.exports = PjHelperBD