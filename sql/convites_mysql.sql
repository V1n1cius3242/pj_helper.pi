-- =========================================================
-- PJ Helper - Tabela de convites de acesso da equipe
-- Rode este script no phpMyAdmin, no banco `pj_helper`.
-- =========================================================
-- O codigo segue o mesmo padrao do token de recuperacao de
-- senha: 6 digitos gerados pelo servidor. Validade de 7 dias
-- e uso unico.

CREATE TABLE IF NOT EXISTS `convites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) NOT NULL,
  `tipo` enum('admin','colaborador') NOT NULL DEFAULT 'colaborador',
  `criado_por` int(11) NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `expira_em` datetime NOT NULL,
  `usado_por` int(11) DEFAULT NULL,
  `usado_em` datetime DEFAULT NULL,
  `revogado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `criado_por` (`criado_por`),
  KEY `usado_por` (`usado_por`),
  CONSTRAINT `convites_ibfk_1` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `convites_ibfk_2` FOREIGN KEY (`usado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
