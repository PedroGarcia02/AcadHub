DROP DATABASE IF EXISTS acadhub;

CREATE DATABASE acadhub
  CHARACTER SET utf8
  COLLATE utf8_unicode_ci;

USE acadhub;

CREATE TABLE instituicoes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    foto VARCHAR(255),
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(255) NOT NULL
);

INSERT INTO instituicoes (id, nome, estado, cidade)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Instituicao Padrao do Sistema',
    'NA',
    'Desconhecida'
);

CREATE TABLE cursos (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    semestres INTEGER NOT NULL,
    instituicao_id CHAR (36) NOT NULL,
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

CREATE TABLE disciplinas (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    semestre INTEGER NOT NULL,
    curso_id CHAR(36) NOT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE materia (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    disciplina_id CHAR(36) NOT NULL,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
);

CREATE TABLE conteudo (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo ENUM('pdf', 'zip', 'link') NOT NULL,
    arquivo VARCHAR(255),
    materia_id CHAR(36) NOT NULL,
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

CREATE TABLE usuarios (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha CHAR(60) NOT NULL,
    foto VARCHAR(255),
    tipo ENUM('aluno', 'professor', 'diretor', 'admin') NOT NULL,
    instituicao_id CHAR(36) NOT NULL,
    curso_id CHAR(36),
    area VARCHAR(255),
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id)
);

CREATE TABLE medalhas (
    id CHAR(36) NOT NULL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    imagem VARCHAR(255) NOT NULL,
    pontos INTEGER NOT NULL,
    tipo ENUM('forum', 'conteudo', 'tarefa') NOT NULL
);

INSERT INTO medalhas (id, nome, imagem, pontos, tipo) VALUES
(UUID(), 'Bronze Forum', 'bronze_forum.png', 50, 'forum'),
(UUID(), 'Prata Forum', 'prata_forum.png', 100, 'forum'),
(UUID(), 'Ouro Forum', 'ouro_forum.png', 200, 'forum'),

(UUID(), 'Bronze Conteudo', 'bronze_conteudo.png', 4, 'conteudo'),
(UUID(), 'Prata Conteudo', 'prata_conteudo.png', 100, 'conteudo'),
(UUID(), 'Ouro Conteudo', 'ouro_conteudo.png', 200, 'conteudo'),

(UUID(), 'Bronze Tarefa', 'bronze_tarefa.png', 50, 'tarefa'),
(UUID(), 'Prata Tarefa', 'prata_tarefa.png', 100, 'tarefa'),
(UUID(), 'Ouro Tarefa', 'ouro_tarefa.png', 200, 'tarefa');

CREATE TABLE usuario_pontos (
    id CHAR(36) NOT NULL PRIMARY KEY,
    pontos INTEGER NOT NULL,
    tipo ENUM('forum', 'conteudo', 'tarefa') NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE usuario_medalha (
    usuario_id CHAR(36) NOT NULL,
    medalha_id CHAR(36) NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, medalha_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (medalha_id) REFERENCES medalhas(id)
);

CREATE TABLE conteudo_visualizado (
    id CHAR(36) NOT NULL PRIMARY KEY,
    usuario_id CHAR(36) NOT NULL,
    conteudo_id CHAR(36) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (conteudo_id) REFERENCES conteudo(id)
);

CREATE TABLE tarefa (
    id CHAR(36) NOT NULL PRIMARY KEY,
    materia_id CHAR(36) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    arquivo VARCHAR(255),
    data_entrega TIMESTAMP,
    valor DECIMAL(5,2),
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

CREATE TABLE tarefa_envio (
    id CHAR(36) NOT NULL PRIMARY KEY,
    tarefa_id CHAR(36) NOT NULL,
    aluno_id CHAR(36) NOT NULL,
    nome_original VARCHAR(255),
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arquivo VARCHAR(255),
    nota DECIMAL(5,2),
    feedback VARCHAR(255),
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id),
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
);

CREATE TABLE topicos (
    id CHAR(36) NOT NULL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    pinned BOOLEAN DEFAULT 0,
    instituicao_id CHAR(36) NOT NULL,
    curso_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE discussao (
    id CHAR(36) NOT NULL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto VARCHAR(255) NOT NULL,
    imagem VARCHAR(255),
    texto_IA VARCHAR(500),
    pinned BOOLEAN DEFAULT 0,
    fechado BOOLEAN DEFAULT 0,
    usuario_id CHAR(36) NOT NULL,
    topico_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (topico_id) REFERENCES topicos(id)
);

CREATE TABLE mensagem (
    id CHAR(36) NOT NULL PRIMARY KEY,
    conteudo VARCHAR(750) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    discussao_id CHAR(36) NOT NULL,
    conteudo_id CHAR(36),
    editada BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conteudo_id) REFERENCES conteudo(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (discussao_id) REFERENCES discussao(id)
);

DELIMITER $$

CREATE TRIGGER trg_check_medalha
AFTER INSERT ON usuario_pontos
FOR EACH ROW
BEGIN
    DECLARE total_pontos INT DEFAULT 0;

    SELECT SUM(pontos)
    INTO total_pontos
    FROM usuario_pontos
    WHERE usuario_id = NEW.usuario_id
      AND tipo = NEW.tipo;

    INSERT INTO usuario_medalha (usuario_id, medalha_id)
    SELECT NEW.usuario_id, m.id
    FROM medalhas m
    WHERE m.tipo = NEW.tipo
      AND total_pontos >= m.pontos
      AND NOT EXISTS (
          SELECT 1 FROM usuario_medalha um
          WHERE um.usuario_id = NEW.usuario_id
            AND um.medalha_id = m.id
      );
END$$

DELIMITER ;