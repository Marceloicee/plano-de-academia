CREATE DATABASE IF NOT EXISTS treinos_academia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE treinos_academia;

CREATE TABLE IF NOT EXISTS planos_treino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercicios_plano (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plano_id INT NOT NULL,
    exercicio VARCHAR(150) NOT NULL,
    CONSTRAINT fk_exercicios_plano FOREIGN KEY (plano_id)
        REFERENCES planos_treino(id) ON DELETE CASCADE
);
