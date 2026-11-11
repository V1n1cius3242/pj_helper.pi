-- phpMyAdmin SQL Dump (formato compativel)
-- Banco de dados: `pj_helper` - estado atual, exportado do Cloudflare D1
--
-- O QUE MUDOU EM RELACAO AO DUMP ORIGINAL (pj_helper (9).sql):
--   * tabela nova  `convites` (codigos de acesso da equipe: 6 digitos, 7 dias, uso unico)
--   * `usuarios.tipo` passa a aceitar 'colaborador'
--   * `perfis_mei`      + cep, uf, bairro, modalidade_padrao   (+ indice cidade/uf)
--   * `perfis_empresa`  + cep, cidade, uf, bairro
--   * `catalogo_itens`  + modalidade (presencial | remoto | ambos)
--   * `contratos.status` aceita 'reuniao agendada' (ja usado pela rota de agendar reuniao)
--
-- Como importar: phpMyAdmin > criar/selecionar o banco `pj_helper` > Importar > este arquivo.
-- ATENCAO: os DROP TABLE abaixo apagam as tabelas antigas antes de recriar.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Estrutura para tabela `catalogo_itens`
--

DROP TABLE IF EXISTS `catalogo_itens`;
CREATE TABLE `catalogo_itens` (
  `id` int(11) NOT NULL,
  `mei_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `modalidade` enum('presencial','remoto','ambos') DEFAULT 'ambos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `catalogo_itens`
--

INSERT INTO `catalogo_itens` (`id`, `mei_id`, `titulo`, `descricao`, `preco`, `criado_em`, `modalidade`) VALUES
(2, 5, 'Instalação elétrica residencial', 'Troca de fiação, tomadas e disjuntores', 350, '2026-11-11 01:35:05', 'presencial'),
(3, 5, 'Manutenção de rede', 'Cabeamento e configuração de roteador', 180, '2026-11-11 01:35:05', 'presencial'),
(4, 8, 'Reforma de fachada', 'Pintura e reboco externo', 1200, '2026-11-11 01:35:05', 'presencial'),
(5, 8, 'Orçamento de obra online', 'Levantamento por fotos e planta', 90, '2026-11-11 01:35:05', 'remoto'),
(6, 10, 'Identidade visual completa', 'Logo, paleta e manual de marca', 1500, '2026-11-11 01:35:05', 'remoto'),
(7, 16, 'Design de cardápio', 'Arte digital pronta para impressão', 250, '2026-11-11 01:35:05', 'remoto'),
(8, 16, 'Fotografia de produto', 'Sessão no local com fundo infinito', 400, '2026-11-11 01:35:05', 'presencial');

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

DROP TABLE IF EXISTS `contratos`;
CREATE TABLE `contratos` (
  `id` int(11) NOT NULL,
  `empresa_usuario_id` int(11) NOT NULL,
  `mei_usuario_id` int(11) NOT NULL,
  `titulo_servico` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('pendente','aceito','recusado','concluido','reuniao agendada') DEFAULT 'pendente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `link_reuniao` varchar(255) DEFAULT NULL,
  `data_reuniao` datetime DEFAULT NULL,
  `contrato_digitalizado_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `contratos`
--

INSERT INTO `contratos` (`id`, `empresa_usuario_id`, `mei_usuario_id`, `titulo_servico`, `descricao`, `valor`, `status`, `criado_em`, `link_reuniao`, `data_reuniao`, `contrato_digitalizado_url`) VALUES
(1, 10, 9, 'qwertyui', 'asdasfasdfgasfg', 12345, 'concluido', '2026-09-24 16:57:29', NULL, NULL, NULL),
(4, 10, 9, 'Solicitação de Reunião / Proposta', 'Data: 2026-09-30T08:50 | Link: https://meet.google.com/dmo-zjmr-puw | Detalhes: contrato com o mei', 0, 'concluido', '2026-09-28 11:50:47', NULL, NULL, NULL),
(6, 30, 29, 'pppp', 'asdfghj7yrjgjfdycdjkfsdjfhsadgfkasdgfasdfadf', 400, 'recusado', '2026-10-30 14:38:42', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `convites`
--

DROP TABLE IF EXISTS `convites`;
CREATE TABLE `convites` (
  `id` int(11) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `tipo` enum('admin','colaborador') NOT NULL DEFAULT 'colaborador',
  `criado_por` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `expira_em` datetime NOT NULL,
  `usado_por` int(11) DEFAULT NULL,
  `usado_em` datetime DEFAULT NULL,
  `revogado_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `convites`
--

INSERT INTO `convites` (`id`, `codigo`, `tipo`, `criado_por`, `criado_em`, `expira_em`, `usado_por`, `usado_em`, `revogado_em`) VALUES
(6, '506611', 'colaborador', 34, '2026-11-11 00:59:50', '2026-11-18 00:59:50', 36, '2026-11-11 01:00:52', NULL),
(7, '534925', 'colaborador', 34, '2026-11-11 01:02:33', '2026-11-18 01:02:33', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

DROP TABLE IF EXISTS `notificacoes`;
CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `usuario_id`, `mensagem`, `lida`, `criado_em`) VALUES
(1, 9, 'Você recebeu uma nova proposta de serviço: qwertyui (R$ 12345)', 0, '2026-09-24 16:57:29'),
(2, 10, 'O contrato #1 teve seu status alterado para: ACEITO', 0, '2026-09-24 16:58:11'),
(3, 9, 'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)', 0, '2026-09-25 14:24:55'),
(4, 9, 'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)', 0, '2026-09-25 14:50:49'),
(5, 10, 'O contrato #3 teve o seu estado alterado para: ACEITO', 0, '2026-09-28 11:49:20'),
(6, 10, 'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-09-28 11:49:39'),
(7, 9, 'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-09-28 11:49:39'),
(8, 9, 'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)', 0, '2026-09-28 11:50:47'),
(9, 10, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:21:40'),
(10, 9, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:21:40'),
(11, 10, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:21:45'),
(12, 9, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:21:45'),
(13, 10, 'O contrato #1 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:26:31'),
(14, 9, 'O contrato #1 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-02 14:26:31'),
(15, 11, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 1, '2026-10-14 17:33:56'),
(16, 22, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 0, '2026-10-14 17:33:56'),
(18, 11, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 1, '2026-10-14 18:23:55'),
(19, 22, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 0, '2026-10-14 18:23:55'),
(21, 11, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 1, '2026-10-14 18:31:54'),
(22, 22, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 0, '2026-10-14 18:31:54'),
(24, 11, 'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)', 1, '2026-10-14 18:36:00'),
(25, 22, 'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)', 0, '2026-10-14 18:36:00'),
(27, 11, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 1, '2026-10-14 18:44:18'),
(28, 22, 'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)', 0, '2026-10-14 18:44:18'),
(30, 11, 'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)', 1, '2026-10-14 18:47:38'),
(31, 22, 'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)', 0, '2026-10-14 18:47:38'),
(33, 11, 'Novo cadastro pendente de aprovação: emmpresa@teste.com (EMPRESA)', 1, '2026-10-28 19:18:05'),
(34, 22, 'Novo cadastro pendente de aprovação: emmpresa@teste.com (EMPRESA)', 0, '2026-10-28 19:18:05'),
(35, 10, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:51'),
(36, 9, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:51'),
(37, 10, 'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:54'),
(38, 9, 'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:54'),
(39, 10, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:56'),
(40, 9, 'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:45:56'),
(41, 10, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:49:02'),
(42, 9, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-29 17:49:02'),
(43, 10, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-29 17:49:03'),
(44, 9, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-29 17:49:03'),
(45, 10, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:45'),
(46, 9, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:45'),
(47, 10, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:46'),
(48, 9, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:46'),
(49, 10, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:52'),
(50, 9, 'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 13:34:52'),
(51, 10, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-30 13:34:57'),
(52, 9, 'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-30 13:34:57'),
(53, 29, 'Você recebeu uma nova proposta de serviço: pppp (R$ 400)', 0, '2026-10-30 14:38:42'),
(54, 29, 'Você recebeu uma nova proposta de serviço: pppp (R$ 400)', 0, '2026-10-30 14:38:42'),
(55, 30, 'O contrato #6 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 14:39:18'),
(56, 29, 'O contrato #6 foi oficialmente alterado para RECUSADO pelo Administrador!', 0, '2026-10-30 14:39:18'),
(57, 30, 'O contrato #5 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-30 14:39:22'),
(58, 29, 'O contrato #5 foi oficialmente alterado para CONCLUIDO pelo Administrador!', 0, '2026-10-30 14:39:22'),
(59, 11, 'Novo cadastro pendente de aprovação: aurapromacs@email.com (MEI)', 1, '2026-11-03 18:23:17'),
(60, 22, 'Novo cadastro pendente de aprovação: aurapromacs@email.com (MEI)', 0, '2026-11-03 18:23:17'),
(62, 30, 'Reunião agendada para o contrato #5. Link: https://meet.google.com/jzy-kdpt-boh', 0, '2026-11-03 18:42:04'),
(63, 29, 'Reunião agendada para o contrato #5. Link: https://meet.google.com/jzy-kdpt-boh', 0, '2026-11-03 18:42:04'),
(64, 11, 'Novo cadastro pendente de aprovação: mei.cf@pjhelper.com (MEI)', 0, '2026-11-11 00:01:20'),
(65, 22, 'Novo cadastro pendente de aprovação: mei.cf@pjhelper.com (MEI)', 0, '2026-11-11 00:01:20'),
(68, 30, 'O contrato #7 teve o seu estado alterado para: ACEITO', 0, '2026-11-11 00:01:40'),
(69, 30, 'Reunião agendada para o contrato #7. Link: https://meet.google.com/teste', 0, '2026-11-11 00:01:41'),
(72, 34, 'O convite 506611 foi utilizado por teste@gw.com (COLABORADOR).', 0, '2026-11-11 01:00:52'),
(73, 11, 'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)', 0, '2026-11-11 01:36:48'),
(74, 22, 'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)', 0, '2026-11-11 01:36:48'),
(75, 34, 'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)', 0, '2026-11-11 01:36:48');

-- --------------------------------------------------------

--
-- Estrutura para tabela `perfis_empresa`
--

DROP TABLE IF EXISTS `perfis_empresa`;
CREATE TABLE `perfis_empresa` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `razao_social` varchar(150) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `perfis_empresa`
--

INSERT INTO `perfis_empresa` (`id`, `usuario_id`, `razao_social`, `cnpj`, `telefone`, `cep`, `cidade`, `uf`, `bairro`) VALUES
(1, 10, 'asdasd', '11.111.111/1111-16', '48999999999', NULL, NULL, NULL, NULL),
(2, 21, 'Nova Empresa', '', NULL, NULL, NULL, NULL, NULL),
(3, 30, 'jhgfd', '11.111.111/1111-18', NULL, '88820-007', 'Içara', 'SC', 'Centro'),
(5, 38, 'Empresa Teste Ltda', '12.345.678/0001-90', '48999990000', '88010-000', 'Florianópolis', 'SC', 'Centro');

-- --------------------------------------------------------

--
-- Estrutura para tabela `perfis_mei`
--

DROP TABLE IF EXISTS `perfis_mei`;
CREATE TABLE `perfis_mei` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `razao_social` varchar(150) DEFAULT NULL,
  `nome_fantasia` varchar(150) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `resumo_servico` varchar(255) DEFAULT NULL,
  `apresentacao` text DEFAULT NULL,
  `anos_experiencia` int(11) DEFAULT 0,
  `cidade` varchar(100) DEFAULT NULL,
  `site` varchar(255) DEFAULT NULL,
  `instagram` varchar(150) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `modalidade_padrao` enum('presencial','remoto','ambos') DEFAULT 'ambos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `perfis_mei`
--

INSERT INTO `perfis_mei` (`id`, `usuario_id`, `razao_social`, `nome_fantasia`, `categoria`, `resumo_servico`, `apresentacao`, `anos_experiencia`, `cidade`, `site`, `instagram`, `cnpj`, `telefone`, `cep`, `uf`, `bairro`, `modalidade_padrao`) VALUES
(5, 9, 'sla', 'asdasd', 'asdasd', 'asdasd', 'asdasdasdasd', 33, 'Criciúma', '', 'asdasd', '11.111.111/1111-11', 'asdasd', '88801-010', 'SC', 'Centro', 'presencial'),
(8, 13, 'asdasfd', 'sadasdf', 'Manutenção', 'asdasfasf', 'asujklç', 3, 'Içara', '', '@cricius_cm', '11.111.111/1111-13', '48999999998', '88820-007', 'SC', 'Centro', 'ambos'),
(10, 23, 'kjh', 'jorel', 'Design', '', NULL, 0, 'Florianópolis', NULL, NULL, '11.111.111/1111-34', NULL, '88010-000', 'SC', 'Centro', 'remoto'),
(16, 29, 'a', 'sodia', 'Design', 'a', NULL, 0, 'Criciúma', NULL, NULL, '22.222.222/2222-22', NULL, '88802-000', 'SC', 'Próspera', 'ambos'),
(17, 31, 'fds', 'hgfs', 'Logística', 'aaaaaaasdfadf', NULL, 0, NULL, NULL, NULL, '12.312.123/1231-21', NULL, NULL, NULL, NULL, 'ambos'),
(22, 39, 'MEI Teste ME', 'Studio Teste', 'Design', 'Identidade visual, UI e materiais gráficos para pequenas empresas.', 'Profissional de teste criado para validar o fluxo da plataforma.', 5, 'Florianópolis', NULL, NULL, '98.765.432/0001-10', '48999991111', '88010-000', 'SC', 'Centro', 'ambos');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pendente','aprovado','recusado') DEFAULT 'pendente',
  `token_recuperacao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `tipo`, `criado_em`, `status`, `token_recuperacao`) VALUES
(9, 'dev@teste.com', '$2b$10$Z0qiQ54Wf0V1w.7HPragFOeWwmFnmSyFVkAg2aqndo5nX4lJCj0Um', 'mei', '2026-09-23 19:43:58', 'aprovado', NULL),
(10, 'empresa@teste.com', '$2b$10$.eDiA0jR9I4xbDPt45Cxd.hJnbyuF0g.USxJ.eKof.VUE9ChzwcAK', 'empresa_grande', '2026-09-23 19:44:25', 'aprovado', NULL),
(11, 'admin@pjhelper.com', '$2b$10$srvEM1CeoXGC7MkNhhgxbeENN5fcFMKnDwmaDekXRrdtb9Ra4/M4i', 'admin', '2026-09-24 16:55:49', 'aprovado', NULL),
(13, 'mendoncadocantos@gmail.com', '$2b$10$XCdv386bcAy4/Cdo9xc2u.9dd.KZxxILC7wiss04o6mO5vztSXJBO', 'mei', '2026-10-02 13:37:37', 'aprovado', NULL),
(14, 'aurapromas@email.com', '$2b$10$kFRgEBSaFeYJTbJy0vGINeHz4CkgKVUAa8.gF4FqDiZRsHo4w6Y/6', 'empresa', '2026-10-02 13:56:51', 'aprovado', NULL),
(15, 'mendoncadocantoss@gmail.com', '$2b$10$9juDdaDcuF4UtGOgizSAz.ZUZZkxdNJ5FxXY/rhx0Oo9shp11NqEe', 'mei', '2026-10-02 14:14:58', 'aprovado', NULL),
(16, 'mendoncadocantos3@gmail.com', '$2b$10$8vn/52YxcYyGJJFXRKR1GuCBFq64WelfQTY6uqj8FjMLu0l3caY2u', 'mei', '2026-10-02 14:15:47', 'aprovado', NULL),
(17, 'adas@pjhelper.com', '$2b$10$OcOqAsNUmyBjGi6ET2IDY.QSCLz7VljvMviKNWiPouPSoAofM3sXK', 'mei', '2026-10-02 14:34:38', 'aprovado', NULL),
(18, 'ADASD@pjhelper.com', '$2b$10$MwS05GbLmQaWOvyP.tTebudDPp6s/ezeDKpd5HBWeFILrvYdCn0MK', 'empresa', '2026-10-02 14:37:05', 'aprovado', NULL),
(19, 'adt@pjhelper.com', '$2b$10$zkyR//Sx.JH.WU9tSKNsSOKyrgLzbcCJVM8Gnp4kcOgFLREokrhDq', 'empresa', '2026-10-02 14:41:32', 'aprovado', NULL),
(20, 'jamaica@email', '$2b$10$iVTj9XQc6.vGIDNhzav78uF7KRq4/zgoERWdoUrFZI53.pWBikWjm', 'empresa', '2026-10-02 14:50:54', 'aprovado', NULL),
(21, 'eu@email', '$2b$10$F49K3qFADptN9xmohmZgLewypLw7E8iYXWqbmYwkvgZYBfzleK/.W', 'empresa', '2026-10-05 12:02:11', 'aprovado', NULL),
(22, 'admin2@pjhelper.com', '$2b$10$.4gbQcxw8slRCmSgVSlKDOCcHGTXbpKPtKFok1xrU3nTeClpktU76', 'admin', '2026-10-05 12:05:38', 'aprovado', NULL),
(23, 'mendoncadokanto@gmail.com', '$2b$10$RbZXuQ04pGvb3gIfmBgmcOZStaynoZZ8KFZ9Q22A.H5v3E2Wzb2bi', 'mei', '2026-10-07 18:36:52', 'aprovado', NULL),
(29, 'sofiademeloduarte22@gmail.com', '$2b$10$9sYwYzTEWMTNxXxPMVOw0.SBsRbyNVz2DXYSTI6HgGv7dq2rONJKG', 'mei', '2026-10-14 18:47:38', 'aprovado', NULL),
(30, 'emmpresa@teste.com', '$2b$10$zF851iwSiNfVWNTfIlmHUuq9TF24.FxLKOM21UhxKZelnlLIXvz9e', 'empresa', '2026-10-28 19:18:05', 'aprovado', NULL),
(31, 'aurapromacs@email.com', '$2b$10$P8zhEi8LDmNFpeEVDD204eZJWmk2HLTXVrZFGrZq764lLiy8iHNQu', 'mei', '2026-11-03 18:23:17', 'recusado', NULL),
(34, 'gabrielwbd03@gmail.com', '$2b$10$L0OPNZPryUnGMr2o.mKxDeMkuNJZvahhYd8RjF.nebpb4ur3KKfuq', 'admin', '2026-11-11 00:04:39', 'aprovado', '888571'),
(36, 'teste@gw.com', '$2b$10$fKfZRfe71d6t6soy7eHQq.MpIPEj3H83u.Hx9nE7hvwjxuN.gBihm', 'colaborador', '2026-11-11 01:00:52', 'aprovado', NULL),
(38, 'empresario@teste.com', '$2b$10$OZeWi9hmci4RjRE2aJw5QumwI25yXJQQKJ3cJ48QtDVyGgX8cq74K', 'empresa', '2026-11-11 02:05:29', 'aprovado', NULL),
(39, 'mei@teste.com', '$2b$10$/7wqucqSOCqLc2aF4MljWOECW.w6qhDYsNN2zw6Y9Ldd3FeFgYdma', 'mei', '2026-11-11 02:06:29', 'aprovado', NULL);

--
-- Indices para tabelas despejadas
--

ALTER TABLE `catalogo_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mei_id` (`mei_id`);

ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_usuario_id` (`empresa_usuario_id`),
  ADD KEY `mei_usuario_id` (`mei_usuario_id`);

ALTER TABLE `convites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `usado_por` (`usado_por`);

ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

ALTER TABLE `perfis_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

ALTER TABLE `perfis_mei`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_mei_cidade` (`cidade`,`uf`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT: continua a numeracao de onde o D1 parou
--

ALTER TABLE `catalogo_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `convites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

ALTER TABLE `perfis_empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `perfis_mei`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Restricoes para tabelas despejadas
--

ALTER TABLE `catalogo_itens`
  ADD CONSTRAINT `catalogo_itens_ibfk_1` FOREIGN KEY (`mei_id`) REFERENCES `perfis_mei` (`id`) ON DELETE CASCADE;

ALTER TABLE `contratos`
  ADD CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`empresa_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`mei_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `convites`
  ADD CONSTRAINT `convites_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `convites_ibfk_2` FOREIGN KEY (`usado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

ALTER TABLE `notificacoes`
  ADD CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `perfis_empresa`
  ADD CONSTRAINT `perfis_empresa_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `perfis_mei`
  ADD CONSTRAINT `perfis_mei_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
