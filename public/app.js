const API_URL = "/api";
const lista = document.getElementById("lista");
const form = document.getElementById("form");
const modal = document.getElementById("modal");
const diaSemana = document.getElementById("diaSemana");
const selecao = document.getElementById("selecao");
const quantidade = document.getElementById("quantidade");
const camposExercicios = document.getElementById("camposExercicios");

let valoresExercicios = [];

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>'\"]/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[caractere]);
}

async function respostaJson(resposta) {
    const conteudo = await resposta.text();
    let dados;
    try { dados = conteudo ? JSON.parse(conteudo) : {}; }
    catch { throw new Error("A API não respondeu corretamente. Abra o projeto em http://localhost:3000 usando npm start."); }
    if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
    return dados;
}

async function iniciar() {
    try {
        const dados = await respostaJson(await fetch(`${API_URL}/catalogo`));
        dados.diasSemana.forEach(dia => diaSemana.insertAdjacentHTML("beforeend", `<option value="${escaparHtml(dia)}">${escaparHtml(dia)}</option>`));
        carregarPlanos();
    } catch (erro) {
        lista.innerHTML = `<p class="mensagem-erro">${escaparHtml(erro.message)}</p>`;
    }
}

async function carregarPlanos() {
    try { renderizarPlanos(await respostaJson(await fetch(`${API_URL}/planos`))); }
    catch (erro) { lista.innerHTML = `<p class="mensagem-erro">${escaparHtml(erro.message)}</p>`; }
}

function renderizarPlanos(planos) {
    if (!planos.length) {
        lista.innerHTML = "<p class=\"vazio\">Ainda não há treinos salvos. Clique em “Montar treino” para começar.</p>";
        return;
    }
    lista.innerHTML = planos.map(plano => `
        <article class="card">
            <div class="card-cabecalho"><h3>${escaparHtml(plano.dia_semana)}</h3><button class="btn-excluir" type="button" onclick="excluirPlano(${plano.id})">Excluir</button></div>
            <ul>${plano.exercicios.map(item => `<li>${escaparHtml(item.exercicio)}</li>`).join("")}</ul>
        </article>
    `).join("");
}

function gerarCampos() {
    const total = Math.max(0, Math.min(30, Number(quantidade.value) || 0));
    const anteriores = valoresExercicios;
    valoresExercicios = Array.from({ length: total }, (_, indice) => anteriores[indice] || "");

    camposExercicios.innerHTML = Array.from({ length: total }, (_, indice) => `
        <div class="campo-exercicio">
            <label for="exercicio${indice}">Exercício ${indice + 1}</label>
            <input type="text" id="exercicio${indice}" data-indice="${indice}" maxlength="150" value="${escaparHtml(valoresExercicios[indice])}" placeholder="Ex: Supino reto">
        </div>
    `).join("");

    camposExercicios.querySelectorAll("input").forEach(campo => campo.addEventListener("input", () => {
        valoresExercicios[Number(campo.dataset.indice)] = campo.value;
    }));
}

function abrirModal() {
    form.reset();
    valoresExercicios = [];
    camposExercicios.innerHTML = "";
    selecao.classList.add("oculto");
    modal.classList.remove("oculto");
    diaSemana.focus();
}
function fecharModal() { modal.classList.add("oculto"); }

async function excluirPlano(id) {
    if (!confirm("Deseja excluir este treino?") || !id) return;
    try { await respostaJson(await fetch(`${API_URL}/planos/${id}`, { method: "DELETE" })); carregarPlanos(); }
    catch (erro) { alert(erro.message); }
}

document.getElementById("btnNovo").addEventListener("click", abrirModal);
document.getElementById("btnCancelar").addEventListener("click", fecharModal);
document.getElementById("btnFechar").addEventListener("click", fecharModal);
diaSemana.addEventListener("change", () => selecao.classList.toggle("oculto", !diaSemana.value));
quantidade.addEventListener("input", gerarCampos);
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
        const exercicios = valoresExercicios.map(valor => valor.trim()).filter(Boolean);
        await respostaJson(await fetch(`${API_URL}/planos`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dia_semana: diaSemana.value, exercicios })
        }));
        fecharModal(); carregarPlanos();
    } catch (erro) { alert(erro.message); }
});
modal.addEventListener("click", evento => { if (evento.target === modal) fecharModal(); });
iniciar();
