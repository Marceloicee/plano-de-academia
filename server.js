require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const port = Number(process.env.PORT) || 3000;
const database = process.env.DB_NAME || "treinos_academia";
const diasSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const MAX_EXERCICIOS = 30;

if (!/^[A-Za-z0-9_]+$/.test(database)) {
  throw new Error("DB_NAME deve conter somente letras, números e underscore.");
}

const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database,
};

let pool;

async function iniciarBanco() {
  const conexaoServidor = await mysql.createConnection({
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
  });

  await conexaoServidor.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conexaoServidor.end();

  pool = mysql.createPool({ ...databaseConfig, waitForConnections: true, connectionLimit: 10 });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS planos_treino (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dia_semana VARCHAR(20) NOT NULL UNIQUE,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercicios_plano (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plano_id INT NOT NULL,
      exercicio VARCHAR(150) NOT NULL,
      CONSTRAINT fk_exercicios_plano FOREIGN KEY (plano_id)
        REFERENCES planos_treino(id) ON DELETE CASCADE
    )
  `);

  // Migração: bancos criados pela versão antiga tinham a coluna grupo_muscular.
  try {
    await pool.query("ALTER TABLE exercicios_plano DROP COLUMN grupo_muscular");
  } catch (erro) {
    // Coluna já não existe (banco novo) — segue normalmente.
  }
}

function planoValido(plano = {}) {
  if (!diasSemana.includes(plano.dia_semana)) return "Escolha um dia da semana válido.";
  if (!Array.isArray(plano.exercicios)) return "Escolha pelo menos um exercício.";

  const nomes = plano.exercicios.map((exercicio) => String(exercicio ?? "").trim()).filter(Boolean);
  if (nomes.length === 0) return "Escolha pelo menos um exercício.";
  if (nomes.length > MAX_EXERCICIOS) return `Escolha no máximo ${MAX_EXERCICIOS} exercícios.`;
  if (nomes.some((nome) => nome.length > 150)) return "O nome de um exercício é muito longo.";

  plano.exercicios = nomes;
  return null;
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/catalogo", (req, res) => res.json({ diasSemana }));

app.get("/api/planos", async (req, res, next) => {
  try {
    const [linhas] = await pool.query(`
      SELECT p.id, p.dia_semana, e.id AS exercicio_id, e.exercicio
      FROM planos_treino p
      LEFT JOIN exercicios_plano e ON e.plano_id = p.id
      ORDER BY FIELD(p.dia_semana, 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'), e.id
    `);

    const planos = linhas.reduce((resultado, linha) => {
      let plano = resultado.find((item) => item.id === linha.id);
      if (!plano) {
        plano = { id: linha.id, dia_semana: linha.dia_semana, exercicios: [] };
        resultado.push(plano);
      }
      if (linha.exercicio_id) {
        plano.exercicios.push({ exercicio: linha.exercicio });
      }
      return resultado;
    }, []);
    res.json(planos);
  } catch (erro) {
    next(erro);
  }
});

app.post("/api/planos", async (req, res, next) => {
  const erroValidacao = planoValido(req.body);
  if (erroValidacao) return res.status(400).json({ mensagem: erroValidacao });

  let conexao;
  try {
    conexao = await pool.getConnection();
    await conexao.beginTransaction();
    const [resultado] = await conexao.execute(
      "INSERT INTO planos_treino (dia_semana) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
      [req.body.dia_semana]
    );
    const planoId = resultado.insertId;
    await conexao.execute("DELETE FROM exercicios_plano WHERE plano_id = ?", [planoId]);
    await conexao.query(
      "INSERT INTO exercicios_plano (plano_id, exercicio) VALUES ?",
      [req.body.exercicios.map((exercicio) => [planoId, exercicio])]
    );
    await conexao.commit();
    res.status(201).json({ mensagem: "Treino salvo.", id: planoId });
  } catch (erro) {
    if (conexao) await conexao.rollback();
    next(erro);
  } finally {
    if (conexao) conexao.release();
  }
});

app.delete("/api/planos/:id", async (req, res, next) => {
  try {
    const [resultado] = await pool.execute("DELETE FROM planos_treino WHERE id = ?", [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Treino não encontrado." });
    res.json({ mensagem: "Treino removido." });
  } catch (erro) {
    next(erro);
  }
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ mensagem: "Não foi possível acessar o banco de dados." });
});

iniciarBanco()
  .then(() => app.listen(port, () => console.log(`Aplicação em http://localhost:${port}`)))
  .catch((erro) => {
    console.error(
      `Não foi possível iniciar o banco de dados em ${databaseConfig.host}:${databaseConfig.port}.`,
      erro.code || erro.message || "Verifique se o MySQL está em execução e as credenciais no arquivo .env."
    );
    process.exit(1);
  });
