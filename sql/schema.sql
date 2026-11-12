DROP TABLE IF EXISTS `notificacoes`;
DROP TABLE IF EXISTS `convites`;
DROP TABLE IF EXISTS `contratos`;
DROP TABLE IF EXISTS `catalogo_itens`;
DROP TABLE IF EXISTS `perfis_empresa`;
DROP TABLE IF EXISTS `perfis_mei`;
DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` TEXT NOT NULL UNIQUE,
  `senha` TEXT NOT NULL,
  `tipo` TEXT NOT NULL,
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` TEXT DEFAULT 'pendente',
  `token_recuperacao` TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `perfis_mei` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL UNIQUE,
  `razao_social` TEXT DEFAULT NULL,
  `nome_fantasia` TEXT DEFAULT NULL,
  `categoria` TEXT DEFAULT NULL,
  `resumo_servico` TEXT DEFAULT NULL,
  `apresentacao` TEXT DEFAULT NULL,
  `anos_experiencia` INTEGER DEFAULT 0,
  `cidade` TEXT DEFAULT NULL,
  `site` TEXT DEFAULT NULL,
  `instagram` TEXT DEFAULT NULL,
  `cnpj` TEXT UNIQUE DEFAULT NULL,
  `telefone` TEXT DEFAULT NULL,
  `cep` TEXT DEFAULT NULL,
  `uf` TEXT DEFAULT NULL,
  `bairro` TEXT DEFAULT NULL,
  `modalidade_padrao` TEXT DEFAULT 'ambos',
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `perfis_empresa` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL UNIQUE,
  `razao_social` TEXT NOT NULL,
  `cnpj` TEXT NOT NULL UNIQUE,
  `telefone` TEXT DEFAULT NULL,
  `cep` TEXT DEFAULT NULL,
  `cidade` TEXT DEFAULT NULL,
  `uf` TEXT DEFAULT NULL,
  `bairro` TEXT DEFAULT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `catalogo_itens` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `mei_id` INTEGER NOT NULL,
  `titulo` TEXT NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `preco` REAL DEFAULT NULL,
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modalidade` TEXT DEFAULT 'ambos',
  FOREIGN KEY (`mei_id`) REFERENCES `perfis_mei` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `contratos` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `empresa_usuario_id` INTEGER NOT NULL,
  `mei_usuario_id` INTEGER NOT NULL,
  `titulo_servico` TEXT NOT NULL,
  `descricao` TEXT DEFAULT NULL,
  `valor` REAL NOT NULL,
  `status` TEXT DEFAULT 'pendente',
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `link_reuniao` TEXT DEFAULT NULL,
  `data_reuniao` DATETIME DEFAULT NULL,
  `contrato_digitalizado_url` TEXT DEFAULT NULL,
  FOREIGN KEY (`empresa_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mei_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `convites` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `codigo` TEXT NOT NULL UNIQUE,
  `tipo` TEXT NOT NULL DEFAULT 'colaborador',
  `criado_por` INTEGER NOT NULL,
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_em` DATETIME NOT NULL,
  `usado_por` INTEGER DEFAULT NULL,
  `usado_em` DATETIME DEFAULT NULL,
  `revogado_em` DATETIME DEFAULT NULL,
  FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `mensagem` TEXT NOT NULL,
  `lida` INTEGER DEFAULT 0,
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS `idx_catalogo_mei_id` ON `catalogo_itens` (`mei_id`);
CREATE INDEX IF NOT EXISTS `idx_contratos_empresa` ON `contratos` (`empresa_usuario_id`);
CREATE INDEX IF NOT EXISTS `idx_contratos_mei` ON `contratos` (`mei_usuario_id`);
CREATE INDEX IF NOT EXISTS `idx_notificacoes_usuario` ON `notificacoes` (`usuario_id`);
CREATE INDEX IF NOT EXISTS `idx_mei_cidade` ON `perfis_mei` (`cidade`, `uf`);

-- Dados iniciais dos administradores
INSERT OR IGNORE INTO `usuarios` (`id`, `email`, `senha`, `tipo`, `criado_em`, `status`, `token_recuperacao`) VALUES
(11, 'admin@pjhelper.com', '$2b$10$srvEM1CeoXGC7MkNhhgxbeENN5fcFMKnDwmaDekXRrdtb9Ra4/M4i', 'admin', '2026-09-24 16:55:49', 'aprovado', NULL),
(22, 'admin2@pjhelper.com', '$2b$10$.4gbQcxw8slRCmSgVSlKDOCcHGTXbpKPtKFok1xrU3nTeClpktU76', 'admin', '2026-10-05 12:05:38', 'aprovado', NULL),
(34, 'gabrielwbd03@gmail.com', '$2b$10$L0OPNZPryUnGMr2o.mKxDeMkuNJZvahhYd8RjF.nebpb4ur3KKfuq', 'admin', '2026-11-11 00:04:39', 'aprovado', '888571');