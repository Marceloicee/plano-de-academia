# Meu Treino Semanal
 
Aplicação web para montar e manter uma rotina fixa de treino, organizada por dia da semana. Para cada dia (Segunda-feira a Domingo), o usuário define quantos exercícios vai fazer e escreve o nome de cada um; o resultado fica salvo em um card visível na tela inicial.
 
## Objetivo
 
Servir como uma "ficha de treino" digital simples: em vez de anotar no papel ou tentar lembrar o que fazer em cada dia, a pessoa monta um plano por dia da semana (ex: "Segunda-feira: Supino reto, Agachamento, Rosca direta...") e consulta isso sempre que precisar, direto no navegador.
 
Importante: o plano é por **dia da semana**, não por uma semana específica do calendário. Ou seja, existe um único treino de "Segunda-feira", um único de "Terça-feira", e assim por diante — é uma rotina que se repete toda semana, não um histórico com datas.
 
## O que o site oferece
 
- **Um treino fixo por dia da semana** — cada um dos 7 dias tem no máximo um plano salvo por vez.
- **Quantidade de exercícios definida pelo usuário** — ao escolher o dia, o usuário informa quantos exercícios quer (de 1 a 30) e o formulário gera automaticamente um campo de texto para cada um.
- **Nome do exercício livre** — não existe lista fixa nem grupo muscular pré-definido; o usuário escreve o exercício como quiser (até 150 caracteres cada).
- **Substituição ao salvar de novo** — se o usuário montar outro treino para um dia que já tinha plano salvo, o conteúdo antigo daquele dia é apagado e substituído pelo novo.
- **Painel com os treinos salvos** — a tela inicial lista um card por dia da semana que já tem treino, em ordem de Segunda a Domingo, cada um com a lista de exercícios.
- **Exclusão de um dia** — cada card tem um botão "Excluir" (com confirmação) que remove o treino daquele dia inteiro.
- **Validações no servidor** — o backend rejeita dia da semana inválido, lista de exercícios vazia, mais de 30 exercícios ou nomes muito longos, mesmo que alguém tente burlar o formulário.
## Como funciona (fluxo de uso)
 
1. Clique em **"+ Montar treino"**.
2. Escolha o **dia da semana**.
3. Informe **quantos exercícios** você quer registrar nesse dia.
4. Preencha o **nome de cada exercício** nos campos que aparecem.
5. Clique em **"OK — Salvar treino"**.
6. O card daquele dia aparece (ou é atualizado, se já existia) na tela inicial.
## Tecnologias
 
- **Frontend:** HTML, CSS e JavaScript puro (sem frameworks), servidos como arquivos estáticos pelo próprio Express.
- **Backend:** Node.js com Express, expondo uma API REST em `/api`.
- **Banco de dados:** MySQL, com criação automática do banco e das tabelas na primeira execução (via `mysql2`).
## Estrutura do projeto
 
```
├── database/
│   └── schema.sql        # Script SQL de referência das tabelas
├── public/
│   ├── index.html         # Estrutura da página e do formulário
│   ├── app.js              # Lógica do frontend (chamadas à API, geração dos campos, cards)
│   └── style.css           # Estilos visuais
├── server.js               # Servidor Express + API + conexão com o MySQL
├── package.json
└── .env.example             # Modelo de variáveis de ambiente
```
