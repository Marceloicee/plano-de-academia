# Academia

Aplicação para montar uma rotina semanal de treinos, com frontend estático e API Node.js/Express.

## Como executar

1. Tenha o MySQL em execução.
2. Copie `.env.example` para `.env` e preencha as credenciais, se necessário.
3. Execute `npm start`.
4. Abra `http://localhost:3000`.

O `server.js` cria o banco e as tabelas automaticamente quando o usuário do MySQL tiver permissão para isso. Para cada dia da semana, escolha quantos exercícios quer no treino, digite o nome de cada um nos campos gerados e clique em salvar; o card do dia aparece na tela.
