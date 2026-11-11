PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pendente',
  token_recuperacao TEXT DEFAULT NULL
);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(9,'dev@teste.com','$2b$10$Z0qiQ54Wf0V1w.7HPragFOeWwmFnmSyFVkAg2aqndo5nX4lJCj0Um','mei','2026-09-23 19:43:58','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(10,'empresa@teste.com','$2b$10$.eDiA0jR9I4xbDPt45Cxd.hJnbyuF0g.USxJ.eKof.VUE9ChzwcAK','empresa_grande','2026-09-23 19:44:25','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(11,'admin@pjhelper.com','$2b$10$srvEM1CeoXGC7MkNhhgxbeENN5fcFMKnDwmaDekXRrdtb9Ra4/M4i','admin','2026-09-24 16:55:49','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(13,'mendoncadocantos@gmail.com','$2b$10$XCdv386bcAy4/Cdo9xc2u.9dd.KZxxILC7wiss04o6mO5vztSXJBO','mei','2026-10-02 13:37:37','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(14,'aurapromas@email.com','$2b$10$kFRgEBSaFeYJTbJy0vGINeHz4CkgKVUAa8.gF4FqDiZRsHo4w6Y/6','empresa','2026-10-02 13:56:51','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(15,'mendoncadocantoss@gmail.com','$2b$10$9juDdaDcuF4UtGOgizSAz.ZUZZkxdNJ5FxXY/rhx0Oo9shp11NqEe','mei','2026-10-02 14:14:58','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(16,'mendoncadocantos3@gmail.com','$2b$10$8vn/52YxcYyGJJFXRKR1GuCBFq64WelfQTY6uqj8FjMLu0l3caY2u','mei','2026-10-02 14:15:47','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(17,'adas@pjhelper.com','$2b$10$OcOqAsNUmyBjGi6ET2IDY.QSCLz7VljvMviKNWiPouPSoAofM3sXK','mei','2026-10-02 14:34:38','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(18,'ADASD@pjhelper.com','$2b$10$MwS05GbLmQaWOvyP.tTebudDPp6s/ezeDKpd5HBWeFILrvYdCn0MK','empresa','2026-10-02 14:37:05','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(19,'adt@pjhelper.com','$2b$10$zkyR//Sx.JH.WU9tSKNsSOKyrgLzbcCJVM8Gnp4kcOgFLREokrhDq','empresa','2026-10-02 14:41:32','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(20,'jamaica@email','$2b$10$iVTj9XQc6.vGIDNhzav78uF7KRq4/zgoERWdoUrFZI53.pWBikWjm','empresa','2026-10-02 14:50:54','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(21,'eu@email','$2b$10$F49K3qFADptN9xmohmZgLewypLw7E8iYXWqbmYwkvgZYBfzleK/.W','empresa','2026-10-05 12:02:11','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(22,'admin2@pjhelper.com','$2b$10$.4gbQcxw8slRCmSgVSlKDOCcHGTXbpKPtKFok1xrU3nTeClpktU76','admin','2026-10-05 12:05:38','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(23,'mendoncadokanto@gmail.com','$2b$10$RbZXuQ04pGvb3gIfmBgmcOZStaynoZZ8KFZ9Q22A.H5v3E2Wzb2bi','mei','2026-10-07 18:36:52','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(29,'sofiademeloduarte22@gmail.com','$2b$10$9sYwYzTEWMTNxXxPMVOw0.SBsRbyNVz2DXYSTI6HgGv7dq2rONJKG','mei','2026-10-14 18:47:38','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(30,'emmpresa@teste.com','$2b$10$zF851iwSiNfVWNTfIlmHUuq9TF24.FxLKOM21UhxKZelnlLIXvz9e','empresa','2026-10-28 19:18:05','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(31,'aurapromacs@email.com','$2b$10$P8zhEi8LDmNFpeEVDD204eZJWmk2HLTXVrZFGrZq764lLiy8iHNQu','mei','2026-11-03 18:23:17','recusado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(34,'gabrielwbd03@gmail.com','$2b$10$L0OPNZPryUnGMr2o.mKxDeMkuNJZvahhYd8RjF.nebpb4ur3KKfuq','admin','2026-11-11 00:04:39','aprovado','888571');
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(36,'teste@gw.com','$2b$10$fKfZRfe71d6t6soy7eHQq.MpIPEj3H83u.Hx9nE7hvwjxuN.gBihm','colaborador','2026-11-11 01:00:52','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(38,'empresario@teste.com','$2b$10$OZeWi9hmci4RjRE2aJw5QumwI25yXJQQKJ3cJ48QtDVyGgX8cq74K','empresa','2026-11-11 02:05:29','aprovado',NULL);
INSERT INTO "usuarios" ("id","email","senha","tipo","criado_em","status","token_recuperacao") VALUES(39,'mei@teste.com','$2b$10$/7wqucqSOCqLc2aF4MljWOECW.w6qhDYsNN2zw6Y9Ldd3FeFgYdma','mei','2026-11-11 02:06:29','aprovado',NULL);
CREATE TABLE perfis_mei (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  razao_social TEXT,
  nome_fantasia TEXT,
  categoria TEXT,
  resumo_servico TEXT,
  apresentacao TEXT,
  anos_experiencia INTEGER DEFAULT 0,
  cidade TEXT,
  site TEXT,
  instagram TEXT,
  cnpj TEXT UNIQUE,
  telefone TEXT
, cep TEXT, uf TEXT, bairro TEXT, modalidade_padrao TEXT DEFAULT 'ambos');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(5,9,'sla','asdasd','asdasd','asdasd','asdasdasdasd',33,'Criciúma','','asdasd','11.111.111/1111-11','asdasd','88801-010','SC','Centro','presencial');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(8,13,'asdasfd','sadasdf','Manutenção','asdasfasf','asujklç',3,'Içara','','@cricius_cm','11.111.111/1111-13','48999999998','88820-007','SC','Centro','ambos');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(10,23,'kjh','jorel','Design','',NULL,0,'Florianópolis',NULL,NULL,'11.111.111/1111-34',NULL,'88010-000','SC','Centro','remoto');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(16,29,'a','sodia','Design','a',NULL,0,'Criciúma',NULL,NULL,'22.222.222/2222-22',NULL,'88802-000','SC','Próspera','ambos');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(17,31,'fds','hgfs','Logística','aaaaaaasdfadf',NULL,0,NULL,NULL,NULL,'12.312.123/1231-21',NULL,NULL,NULL,NULL,'ambos');
INSERT INTO "perfis_mei" ("id","usuario_id","razao_social","nome_fantasia","categoria","resumo_servico","apresentacao","anos_experiencia","cidade","site","instagram","cnpj","telefone","cep","uf","bairro","modalidade_padrao") VALUES(22,39,'MEI Teste ME','Studio Teste','Design','Identidade visual, UI e materiais gráficos para pequenas empresas.','Profissional de teste criado para validar o fluxo da plataforma.',5,'Florianópolis',NULL,NULL,'98.765.432/0001-10','48999991111','88010-000','SC','Centro','ambos');
CREATE TABLE perfis_empresa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  telefone TEXT
, cep TEXT, cidade TEXT, uf TEXT, bairro TEXT);
INSERT INTO "perfis_empresa" ("id","usuario_id","razao_social","cnpj","telefone","cep","cidade","uf","bairro") VALUES(1,10,'asdasd','11.111.111/1111-16','48999999999',NULL,NULL,NULL,NULL);
INSERT INTO "perfis_empresa" ("id","usuario_id","razao_social","cnpj","telefone","cep","cidade","uf","bairro") VALUES(2,21,'Nova Empresa','',NULL,NULL,NULL,NULL,NULL);
INSERT INTO "perfis_empresa" ("id","usuario_id","razao_social","cnpj","telefone","cep","cidade","uf","bairro") VALUES(3,30,'jhgfd','11.111.111/1111-18',NULL,'88820-007','Içara','SC','Centro');
INSERT INTO "perfis_empresa" ("id","usuario_id","razao_social","cnpj","telefone","cep","cidade","uf","bairro") VALUES(5,38,'Empresa Teste Ltda','12.345.678/0001-90','48999990000','88010-000','Florianópolis','SC','Centro');
CREATE TABLE contratos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mei_usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo_servico TEXT NOT NULL,
  descricao TEXT,
  valor REAL NOT NULL,
  status TEXT DEFAULT 'pendente',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  link_reuniao TEXT,
  data_reuniao TEXT,
  contrato_digitalizado_url TEXT
);
INSERT INTO "contratos" ("id","empresa_usuario_id","mei_usuario_id","titulo_servico","descricao","valor","status","criado_em","link_reuniao","data_reuniao","contrato_digitalizado_url") VALUES(1,10,9,'qwertyui','asdasfasdfgasfg',12345,'concluido','2026-09-24 16:57:29',NULL,NULL,NULL);
INSERT INTO "contratos" ("id","empresa_usuario_id","mei_usuario_id","titulo_servico","descricao","valor","status","criado_em","link_reuniao","data_reuniao","contrato_digitalizado_url") VALUES(4,10,9,'Solicitação de Reunião / Proposta','Data: 2026-09-30T08:50 | Link: https://meet.google.com/dmo-zjmr-puw | Detalhes: contrato com o mei',0,'concluido','2026-09-28 11:50:47',NULL,NULL,NULL);
INSERT INTO "contratos" ("id","empresa_usuario_id","mei_usuario_id","titulo_servico","descricao","valor","status","criado_em","link_reuniao","data_reuniao","contrato_digitalizado_url") VALUES(6,30,29,'pppp','asdfghj7yrjgjfdycdjkfsdjfhsadgfkasdgfasdfadf',400,'recusado','2026-10-30 14:38:42',NULL,NULL,NULL);
CREATE TABLE notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  lida INTEGER DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(1,9,'Você recebeu uma nova proposta de serviço: qwertyui (R$ 12345)',0,'2026-09-24 16:57:29');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(2,10,'O contrato #1 teve seu status alterado para: ACEITO',0,'2026-09-24 16:58:11');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(3,9,'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)',0,'2026-09-25 14:24:55');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(4,9,'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)',0,'2026-09-25 14:50:49');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(5,10,'O contrato #3 teve o seu estado alterado para: ACEITO',0,'2026-09-28 11:49:20');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(6,10,'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-09-28 11:49:39');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(7,9,'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-09-28 11:49:39');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(8,9,'Você recebeu uma nova proposta de serviço: Solicitação de Reunião / Proposta (R$ A combinar)',0,'2026-09-28 11:50:47');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(9,10,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:21:40');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(10,9,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:21:40');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(11,10,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:21:45');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(12,9,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:21:45');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(13,10,'O contrato #1 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:26:31');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(14,9,'O contrato #1 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-02 14:26:31');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(15,11,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',1,'2026-10-14 17:33:56');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(16,22,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',0,'2026-10-14 17:33:56');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(18,11,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',1,'2026-10-14 18:23:55');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(19,22,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',0,'2026-10-14 18:23:55');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(21,11,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',1,'2026-10-14 18:31:54');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(22,22,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',0,'2026-10-14 18:31:54');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(24,11,'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)',1,'2026-10-14 18:36:00');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(25,22,'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)',0,'2026-10-14 18:36:00');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(27,11,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',1,'2026-10-14 18:44:18');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(28,22,'Novo cadastro pendente de aprovação: mendoncadocanto@gmail.com (MEI)',0,'2026-10-14 18:44:18');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(30,11,'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)',1,'2026-10-14 18:47:38');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(31,22,'Novo cadastro pendente de aprovação: sofiademeloduarte22@gmail.com (MEI)',0,'2026-10-14 18:47:38');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(33,11,'Novo cadastro pendente de aprovação: emmpresa@teste.com (EMPRESA)',1,'2026-10-28 19:18:05');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(34,22,'Novo cadastro pendente de aprovação: emmpresa@teste.com (EMPRESA)',0,'2026-10-28 19:18:05');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(35,10,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:51');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(36,9,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:51');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(37,10,'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:54');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(38,9,'O contrato #3 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:54');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(39,10,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:56');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(40,9,'O contrato #2 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:45:56');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(41,10,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:49:02');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(42,9,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-29 17:49:02');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(43,10,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-29 17:49:03');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(44,9,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-29 17:49:03');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(45,10,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:45');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(46,9,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:45');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(47,10,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:46');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(48,9,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:46');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(49,10,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:52');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(50,9,'O contrato #4 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 13:34:52');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(51,10,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-30 13:34:57');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(52,9,'O contrato #4 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-30 13:34:57');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(53,29,'Você recebeu uma nova proposta de serviço: pppp (R$ 400)',0,'2026-10-30 14:38:42');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(54,29,'Você recebeu uma nova proposta de serviço: pppp (R$ 400)',0,'2026-10-30 14:38:42');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(55,30,'O contrato #6 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 14:39:18');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(56,29,'O contrato #6 foi oficialmente alterado para RECUSADO pelo Administrador!',0,'2026-10-30 14:39:18');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(57,30,'O contrato #5 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-30 14:39:22');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(58,29,'O contrato #5 foi oficialmente alterado para CONCLUIDO pelo Administrador!',0,'2026-10-30 14:39:22');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(59,11,'Novo cadastro pendente de aprovação: aurapromacs@email.com (MEI)',1,'2026-11-03 18:23:17');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(60,22,'Novo cadastro pendente de aprovação: aurapromacs@email.com (MEI)',0,'2026-11-03 18:23:17');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(62,30,'Reunião agendada para o contrato #5. Link: https://meet.google.com/jzy-kdpt-boh',0,'2026-11-03 18:42:04');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(63,29,'Reunião agendada para o contrato #5. Link: https://meet.google.com/jzy-kdpt-boh',0,'2026-11-03 18:42:04');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(64,11,'Novo cadastro pendente de aprovação: mei.cf@pjhelper.com (MEI)',0,'2026-11-11 00:01:20');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(65,22,'Novo cadastro pendente de aprovação: mei.cf@pjhelper.com (MEI)',0,'2026-11-11 00:01:20');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(68,30,'O contrato #7 teve o seu estado alterado para: ACEITO',0,'2026-11-11 00:01:40');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(69,30,'Reunião agendada para o contrato #7. Link: https://meet.google.com/teste',0,'2026-11-11 00:01:41');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(72,34,'O convite 506611 foi utilizado por teste@gw.com (COLABORADOR).',0,'2026-11-11 01:00:52');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(73,11,'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)',0,'2026-11-11 01:36:48');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(74,22,'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)',0,'2026-11-11 01:36:48');
INSERT INTO "notificacoes" ("id","usuario_id","mensagem","lida","criado_em") VALUES(75,34,'Novo cadastro pendente de aprovação: mei.loc@teste.com (MEI)',0,'2026-11-11 01:36:48');
CREATE TABLE catalogo_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mei_id INTEGER NOT NULL REFERENCES perfis_mei(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco REAL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
, modalidade TEXT DEFAULT 'ambos');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(2,5,'Instalação elétrica residencial','Troca de fiação, tomadas e disjuntores',350,'2026-11-11 01:35:05','presencial');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(3,5,'Manutenção de rede','Cabeamento e configuração de roteador',180,'2026-11-11 01:35:05','presencial');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(4,8,'Reforma de fachada','Pintura e reboco externo',1200,'2026-11-11 01:35:05','presencial');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(5,8,'Orçamento de obra online','Levantamento por fotos e planta',90,'2026-11-11 01:35:05','remoto');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(6,10,'Identidade visual completa','Logo, paleta e manual de marca',1500,'2026-11-11 01:35:05','remoto');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(7,16,'Design de cardápio','Arte digital pronta para impressão',250,'2026-11-11 01:35:05','remoto');
INSERT INTO "catalogo_itens" ("id","mei_id","titulo","descricao","preco","criado_em","modalidade") VALUES(8,16,'Fotografia de produto','Sessão no local com fundo infinito',400,'2026-11-11 01:35:05','presencial');
CREATE TABLE convites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'colaborador',
  criado_por INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em TEXT NOT NULL,
  usado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  usado_em TEXT,
  revogado_em TEXT
);
INSERT INTO "convites" ("id","codigo","tipo","criado_por","criado_em","expira_em","usado_por","usado_em","revogado_em") VALUES(6,'506611','colaborador',34,'2026-11-11 00:59:50','2026-11-18 00:59:50',36,'2026-11-11 01:00:52',NULL);
INSERT INTO "convites" ("id","codigo","tipo","criado_por","criado_em","expira_em","usado_por","usado_em","revogado_em") VALUES(7,'534925','colaborador',34,'2026-11-11 01:02:33','2026-11-18 01:02:33',NULL,NULL,NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('usuarios',39);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('perfis_mei',22);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('perfis_empresa',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('contratos',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('notificacoes',76);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('catalogo_itens',10);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('convites',7);
CREATE INDEX idx_contratos_emp ON contratos(empresa_usuario_id);
CREATE INDEX idx_contratos_mei ON contratos(mei_usuario_id);
CREATE INDEX idx_notif_user ON notificacoes(usuario_id);
CREATE INDEX idx_catalogo_mei ON catalogo_itens(mei_id);
CREATE INDEX idx_convites_codigo ON convites(codigo);
CREATE INDEX idx_mei_cidade ON perfis_mei(cidade, uf);
