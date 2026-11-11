-- =========================================================
-- PJ Helper - Localizacao dos perfis e modalidade de servico
-- Rode este script no phpMyAdmin, no banco `pj_helper`.
-- =========================================================
-- A cidade passa a ser preenchida por CEP (ViaCEP) ou pelos
-- selects do IBGE, para ficar normalizada e permitir o filtro
-- do catalogo.

ALTER TABLE `perfis_mei`
  ADD COLUMN `cep` varchar(9) DEFAULT NULL,
  ADD COLUMN `uf` varchar(2) DEFAULT NULL,
  ADD COLUMN `bairro` varchar(100) DEFAULT NULL,
  ADD COLUMN `modalidade_padrao` enum('presencial','remoto','ambos') DEFAULT 'ambos';

ALTER TABLE `perfis_empresa`
  ADD COLUMN `cep` varchar(9) DEFAULT NULL,
  ADD COLUMN `cidade` varchar(100) DEFAULT NULL,
  ADD COLUMN `uf` varchar(2) DEFAULT NULL,
  ADD COLUMN `bairro` varchar(100) DEFAULT NULL;

ALTER TABLE `catalogo_itens`
  ADD COLUMN `modalidade` enum('presencial','remoto','ambos') DEFAULT 'ambos';

ALTER TABLE `perfis_mei` ADD KEY `idx_mei_cidade` (`cidade`, `uf`);
