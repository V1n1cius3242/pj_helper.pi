CREATE TABLE `catalogo_itens` (
  `id` int(11) NOT NULL,
  `mei_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `modalidade` enum('presencial','remoto','ambos') DEFAULT 'ambos'
) 
-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

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
) 

-- --------------------------------------------------------

--
-- Estrutura para tabela `convites`
--

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
) 

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) 

-- --------------------------------------------------------

--
-- Estrutura para tabela `perfis_empresa`
--

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
) 

-- --------------------------------------------------------

--
-- Estrutura para tabela `perfis_mei`
--

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
) 

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pendente','aprovado','recusado') DEFAULT 'pendente',
  `token_recuperacao` varchar(255) DEFAULT NULL
)
--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `tipo`, `criado_em`, `status`, `token_recuperacao`) VALUES
(11, 'admin@pjhelper.com', '$2b$10$srvEM1CeoXGC7MkNhhgxbeENN5fcFMKnDwmaDekXRrdtb9Ra4/M4i', 'admin', '2026-09-24 16:55:49', 'aprovado', NULL),
(22, 'admin2@pjhelper.com', '$2b$10$.4gbQcxw8slRCmSgVSlKDOCcHGTXbpKPtKFok1xrU3nTeClpktU76', 'admin', '2026-10-05 12:05:38', 'aprovado', NULL),
(34, 'gabrielwbd03@gmail.com', '$2b$10$L0OPNZPryUnGMr2o.mKxDeMkuNJZvahhYd8RjF.nebpb4ur3KKfuq', 'admin', '2026-11-11 00:04:39', 'aprovado', '888571');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `catalogo_itens`
--
ALTER TABLE `catalogo_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mei_id` (`mei_id`);

--
-- Índices de tabela `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `empresa_usuario_id` (`empresa_usuario_id`),
  ADD KEY `mei_usuario_id` (`mei_usuario_id`);

--
-- Índices de tabela `convites`
--
ALTER TABLE `convites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `usado_por` (`usado_por`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `perfis_empresa`
--
ALTER TABLE `perfis_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`);

--
-- Índices de tabela `perfis_mei`
--
ALTER TABLE `perfis_mei`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_mei_cidade` (`cidade`,`uf`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `catalogo_itens`
--
ALTER TABLE `catalogo_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `convites`
--
ALTER TABLE `convites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `perfis_empresa`
--
ALTER TABLE `perfis_empresa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `perfis_mei`
--
ALTER TABLE `perfis_mei`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `catalogo_itens`
--
ALTER TABLE `catalogo_itens`
  ADD CONSTRAINT `catalogo_itens_ibfk_1` FOREIGN KEY (`mei_id`) REFERENCES `perfis_mei` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`empresa_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`mei_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `convites`
--
ALTER TABLE `convites`
  ADD CONSTRAINT `convites_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `convites_ibfk_2` FOREIGN KEY (`usado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `perfis_empresa`
--
ALTER TABLE `perfis_empresa`
  ADD CONSTRAINT `perfis_empresa_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `perfis_mei`
--
ALTER TABLE `perfis_mei`
  ADD CONSTRAINT `perfis_mei_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
