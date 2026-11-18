/* BANCO DE CRUZADINHAS (Cruzadinha → Palavras)
   ---------------------------------------------------------
   Cada palavra do tabuleiro é um objeto com:
       palavra: a resposta (pode ter acento/minúscula, o jogo normaliza)
       pista:   o texto que aparece na lista de pistas
       linha:   linha da PRIMEIRA letra (começa em 0)
       coluna:  coluna da PRIMEIRA letra (começa em 0)
       direcao: "H" (horizontal, vai para a direita)
                "V" (vertical, vai para baixo) */

   /* COMO EDITAR:
   - Mudar o texto da pista: edite o campo "pista".
   - Mudar a resposta: edite "palavra". Se a nova palavra tiver o mesmo
     tamanho e as mesmas letras nos pontos de cruzamento, tudo continua
     encaixando. Se não encaixar, o console do navegador (F12) avisa.
   - Os NÚMEROS das pistas são calculados sozinhos pela posição.
   - Para desenhar outro tabuleiro, planeje em papel/planilha e
     ajuste linha, coluna e direcao de cada palavra.
   - O tabuleiro abaixo tem 9 linhas x 17 colunas; as 12 palavras só se encostam nos cruzamentos.
   ========================================================= */
const quizzes = {
    1: [
        { palavra: "ULA", pista: "Parte da CPU que faz as contas e as operações lógicas.", linha: 4, coluna: 8, direcao: "V" },
        { palavra: "UC", pista: "Parte do processador que decodifica instruções e coordena o trabalho dos outros blocos.", linha: 5, coluna: 13, direcao: "H" },
        { palavra: "REGISTRADORES", pista: "Pequenos espaços dentro do processador, os mais rápidos, que guardam operandos temporariamente.", linha: 6, coluna: 1, direcao: "H" },
        { palavra: "RAM", pista: "Área principal do computador onde ficam os programas em uso; perde tudo sem energia.", linha: 6, coluna: 1, direcao: "V" },
        { palavra: "ROM", pista: "Chip com instruções gravadas na fábrica, inalteráveis pelo usuário e mantidas sem energia.", linha: 0, coluna: 5, direcao: "V" },
        { palavra: "EEPROM", pista: "Chip não volátil regravável um byte por vez, sem precisar ser removido da placa.", linha: 3, coluna: 16, direcao: "V" },
        { palavra: "CACHE", pista: "Pequena memória veloz entre processador e memória principal que guarda cópias dos itens mais usados.", linha: 3, coluna: 12, direcao: "H" },
        { palavra: "MEMORIADEMASSA", pista: "Guarda programas e arquivos de forma permanente, com grande capacidade, como HD e SSD.", linha: 8, coluna: 1, direcao: "H" },
        { palavra: "DMA", pista: "Recurso que move blocos entre periféricos e a RAM sem ocupar o processador.", linha: 0, coluna: 1, direcao: "V" },
        { palavra: "ADDRESSBUS", pista: "Via de sentido único pela qual o processador indica a posição que quer acessar.", linha: 4, coluna: 0, direcao: "H" },
        { palavra: "DATABUS", pista: "Via de dois sentidos que transporta o conteúdo lido e gravado entre os componentes.", linha: 0, coluna: 13, direcao: "V" },
        { palavra: "MICROCONTROLADOR", pista: "Chip único com processador, memória e portas de entrada e saída, usado em sistemas embarcados.", linha: 1, coluna: 1, direcao: "H" }
    ]
};

/* =========================================================
   VARIÁVEIS GLOBAIS
   ========================================================= */
let quizAtual = 1;
let listaDeQuestoes = quizzes[1];
let pontuacaoFinal = 0;
let certas = 0;
let erradas = 0;
let quantidadeDeQuestoes = listaDeQuestoes.length;

// Casas do tabuleiro: { "linha,coluna": { linha, coluna, letra, palavras: [índices], numero, casa, input } }
let celulas = {};
// Palavras já preparadas para o jogo (com número, casas ocupadas, etc.)
let palavrasMontadas = [];
// Direção em que o cursor avança ao digitar ("H" ou "V")
let direcaoAtiva = "H";
// Última casa clicada (clicar de novo numa casa de cruzamento troca a direção)
let ultimaChaveClicada = "";

/* =========================================================
   ELEMENTOS DO DOM (pega uma vez só)
   ========================================================= */
function getBotoes() {
    return {
        btnConferir: document.getElementById("btnConferir"),
        btnReiniciar: document.getElementById("btnReiniciar")
    };
}

/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

// Busca a lista de palavras de uma cruzadinha.
function obterListaDeQuestoes(quiz) {
    return quizzes[quiz];
}

// Tira acentos, deixa MAIÚSCULO e mantém só letras de A a Z.
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z]/g, "");
}

// Mostra os contadores de Acertos/Erros/Aproveitamento.
function atualizarPainelDePontuacao() {
    document.getElementById("pontuacao").style.display = "flex";
}

// Tira as cores verde/vermelho do tabuleiro e das pistas.
function limparMarcacoes() {
    document.querySelectorAll(".casa, #pistas li").forEach(elemento => {
        elemento.classList.remove("text-success-with-bg");
        elemento.classList.remove("text-danger-with-bg");
    });
}

/* =========================================================
   FUNÇÕES
   ========================================================= */

function onloadEsconder() {
    document.getElementById("pontuacao").style.display = "none";
    document.getElementById("jogo").style.display = "none";
}

function iniciarQuiz() {
    // Garante que está usando a cruzadinha selecionada
    listaDeQuestoes = obterListaDeQuestoes(quizAtual);
    quantidadeDeQuestoes = listaDeQuestoes ? listaDeQuestoes.length : 0;

    console.log("Cruzadinha atual:", quizAtual);
    console.log("Quantidade de palavras:", quantidadeDeQuestoes);
    console.log("Lista:", listaDeQuestoes);

    if (!listaDeQuestoes || quantidadeDeQuestoes === 0) {
        alert("Esta cruzadinha ainda não tem palavras!");
        return;
    }

    atualizarPainelDePontuacao();
    document.getElementById("jogo").style.display = "flex";
    document.getElementById("btnIniciarQuiz").style.display = "none";

    document.getElementById("qtdQuestoes").innerHTML = quantidadeDeQuestoes;

    montarTabuleiro();
    reiniciarEstado();
}

function selecionarQuiz(numero) {
    if (!obterListaDeQuestoes(numero)) {
        alert("Cruzadinha não encontrada!");
        return;
    }

    quizAtual = numero;
    listaDeQuestoes = obterListaDeQuestoes(numero);
    quantidadeDeQuestoes = listaDeQuestoes.length;

    atualizarJogoAposTrocaDeConfiguracao();
}

// Depois de trocar a cruzadinha, ajusta a tela conforme o estado atual.
function atualizarJogoAposTrocaDeConfiguracao() {
    // Se o jogo estava aberto, monta o novo tabuleiro do zero
    if (document.getElementById("jogo").style.display === "flex") {
        atualizarPainelDePontuacao();
        document.getElementById("qtdQuestoes").innerHTML = quantidadeDeQuestoes;
        montarTabuleiro();
        reiniciarEstado();
    }
}

function reiniciarEstado() {
    pontuacaoFinal = 0;
    certas = 0;
    erradas = 0;

    document.getElementById("spanCertas").innerHTML = 0;
    document.getElementById("spanErradas").innerHTML = 0;
    document.getElementById("spanPercentual").innerHTML = "0%";
    document.getElementById("spanNumeroDaQuestaoAtual").innerHTML = 0;
    document.getElementById("spanPontuacaoFinal").innerHTML = "***";
    document.getElementById("msgFinal").innerHTML = "***";
    document.getElementById("msgFinal").className = "";

    // Limpa as letras digitadas e as cores
    for (const chave in celulas) {
        celulas[chave].input.value = "";
    }
    limparMarcacoes();

    const { btnConferir, btnReiniciar } = getBotoes();
    if (btnConferir) btnConferir.disabled = false;
    if (btnReiniciar) btnReiniciar.disabled = false;
}

/* ---------------------------------------------------------
   MONTAGEM DO TABULEIRO
   Passo a passo:
   1) lê cada palavra e registra as casas que ela ocupa
   2) numera as palavras pela ordem de leitura (linha a linha)
   3) desenha as casas (digitáveis) e os espaços vazios
   4) escreve as pistas em Horizontais e Verticais
   --------------------------------------------------------- */
function montarTabuleiro() {
    const tabuleiro = document.getElementById("tabuleiro");
    tabuleiro.innerHTML = "";
    celulas = {};
    ultimaChaveClicada = "";

    let totalLinhas = 0;
    let totalColunas = 0;

    // 1) Registra as casas de cada palavra
    palavrasMontadas = listaDeQuestoes.map((questao, indice) => {
        return {
            indice: indice,
            resposta: normalizarTexto(questao.palavra),
            pista: questao.pista,
            linha: questao.linha,
            coluna: questao.coluna,
            direcao: questao.direcao,
            numero: 0,
            casas: []
        };
    });

    palavrasMontadas.forEach(palavra => {
        for (let i = 0; i < palavra.resposta.length; i++) {
            const l = palavra.linha + (palavra.direcao === "V" ? i : 0);
            const c = palavra.coluna + (palavra.direcao === "H" ? i : 0);
            const chave = l + "," + c;

            if (!celulas[chave]) {
                celulas[chave] = { linha: l, coluna: c, letra: palavra.resposta[i], palavras: [], numero: 0, casa: null, input: null };
            } else if (celulas[chave].letra !== palavra.resposta[i]) {
                console.warn("Conflito na linha " + l + ", coluna " + c + ": a palavra " + palavra.resposta +
                    " não encaixa com as palavras que já passam por ali.");
            }

            celulas[chave].palavras.push(palavra.indice);
            palavra.casas.push(chave);

            totalLinhas = Math.max(totalLinhas, l + 1);
            totalColunas = Math.max(totalColunas, c + 1);
        }
    });

    // Aviso útil: toda palavra precisa cruzar com pelo menos outra
    palavrasMontadas.forEach(palavra => {
        const cruza = palavra.casas.some(chave => celulas[chave].palavras.length > 1);
        if (!cruza) console.warn("A palavra " + palavra.resposta + " não cruza com nenhuma outra.");
    });

    // 2) Numeração (ordem de leitura: linha por linha, coluna por coluna)
    let numero = 0;
    for (let l = 0; l < totalLinhas; l++) {
        for (let c = 0; c < totalColunas; c++) {
            const iniciando = palavrasMontadas.filter(p => p.linha === l && p.coluna === c);
            if (iniciando.length > 0) {
                numero++;
                iniciando.forEach(p => p.numero = numero);
                celulas[l + "," + c].numero = numero;
            }
        }
    }

    // 3) Desenha o tabuleiro
    tabuleiro.style.gridTemplateColumns = "repeat(" + totalColunas + ", var(--tamanhoCasa))";

    for (let l = 0; l < totalLinhas; l++) {
        for (let c = 0; c < totalColunas; c++) {
            const chave = l + "," + c;
            const celula = celulas[chave];

            if (!celula) {
                const vazia = document.createElement("div");
                vazia.className = "casaVazia";
                tabuleiro.appendChild(vazia);
                continue;
            }

            const casa = document.createElement("div");
            casa.className = "casa";

            if (celula.numero > 0) {
                const spanNumero = document.createElement("span");
                spanNumero.className = "numeroCasa";
                spanNumero.textContent = celula.numero;
                casa.appendChild(spanNumero);
            }

            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.className = "celula";
            input.autocomplete = "off";
            input.dataset.chave = chave;
            input.setAttribute("aria-label", "Linha " + (l + 1) + ", coluna " + (c + 1));
            input.addEventListener("input", aoDigitar);
            input.addEventListener("keydown", aoPressionarTecla);
            input.addEventListener("click", aoClicarNaCasa);

            casa.appendChild(input);
            tabuleiro.appendChild(casa);

            celula.casa = casa;
            celula.input = input;
        }
    }

    // 4) Pistas (ordenadas pelo número)
    const listaH = document.getElementById("listaHorizontais");
    const listaV = document.getElementById("listaVerticais");
    listaH.innerHTML = "";
    listaV.innerHTML = "";

    palavrasMontadas
        .slice()
        .sort((a, b) => a.numero - b.numero)
        .forEach(palavra => {
            const item = document.createElement("li");
            item.id = "pista" + palavra.indice;

            const rotulo = document.createElement("span");
            rotulo.className = "text-bold";
            rotulo.textContent = palavra.numero + ". ";

            item.appendChild(rotulo);
            item.appendChild(document.createTextNode(palavra.pista));

            (palavra.direcao === "H" ? listaH : listaV).appendChild(item);
        });
}

/* ---------------------------------------------------------
   DIGITAÇÃO NAS CASAS
   --------------------------------------------------------- */

// Move o foco para a casa vizinha (dl = linhas, dc = colunas), se existir.
function moverFoco(chave, dl, dc) {
    const celula = celulas[chave];
    const proxima = celulas[(celula.linha + dl) + "," + (celula.coluna + dc)];
    if (proxima) {
        proxima.input.focus();
        proxima.input.select();
    }
}

function aoDigitar(evento) {
    const input = evento.target;
    // Mantém só a última letra digitada, sem acento, em maiúsculo
    input.value = normalizarTexto(input.value).slice(-1);

    // Se mexeu no tabuleiro, as cores da última conferência saem
    limparMarcacoes();

    if (input.value !== "") {
        const dl = direcaoAtiva === "V" ? 1 : 0;
        const dc = direcaoAtiva === "H" ? 1 : 0;
        moverFoco(input.dataset.chave, dl, dc);
    }
}

function aoPressionarTecla(evento) {
    const chave = evento.target.dataset.chave;

    if (evento.key === "Backspace" && evento.target.value === "") {
        evento.preventDefault();
        moverFoco(chave, direcaoAtiva === "V" ? -1 : 0, direcaoAtiva === "H" ? -1 : 0);
    } else if (evento.key === "ArrowRight") {
        evento.preventDefault();
        direcaoAtiva = "H";
        moverFoco(chave, 0, 1);
    } else if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        direcaoAtiva = "H";
        moverFoco(chave, 0, -1);
    } else if (evento.key === "ArrowDown") {
        evento.preventDefault();
        direcaoAtiva = "V";
        moverFoco(chave, 1, 0);
    } else if (evento.key === "ArrowUp") {
        evento.preventDefault();
        direcaoAtiva = "V";
        moverFoco(chave, -1, 0);
    }
}

// Ao clicar, define para onde o cursor vai avançar.
// Em casa de cruzamento, clicar de novo na mesma casa troca H <-> V.
function aoClicarNaCasa(evento) {
    const chave = evento.target.dataset.chave;
    const direcoes = celulas[chave].palavras.map(i => palavrasMontadas[i].direcao);

    if (direcoes.length === 1) {
        direcaoAtiva = direcoes[0];
    } else if (chave === ultimaChaveClicada) {
        direcaoAtiva = (direcaoAtiva === "H") ? "V" : "H";
    } else if (!direcoes.includes(direcaoAtiva)) {
        direcaoAtiva = direcoes[0];
    }

    ultimaChaveClicada = chave;
}

/* ---------------------------------------------------------
   CONFERIR
   Uma palavra só está certa se TODAS as letras dela estiverem certas.
   - Palavra certa  -> casas e pista em verde
   - Palavra errada -> casas e pista em vermelho
   - Casa de cruzamento fica verde se ao menos uma das palavras está certa
   --------------------------------------------------------- */
function conferir() {
    limparMarcacoes();
    certas = 0;
    erradas = 0;

    const casasCertas = new Set();
    const casasErradas = new Set();

    palavrasMontadas.forEach(palavra => {
        const digitado = palavra.casas.map(chave => celulas[chave].input.value).join("");
        const item = document.getElementById("pista" + palavra.indice);

        if (digitado === palavra.resposta) {
            certas++;
            palavra.casas.forEach(chave => casasCertas.add(chave));
            item.classList.add("text-success-with-bg");
        } else {
            erradas++;
            palavra.casas.forEach(chave => casasErradas.add(chave));
            item.classList.add("text-danger-with-bg");
        }
    });

    casasErradas.forEach(chave => {
        if (!casasCertas.has(chave)) celulas[chave].casa.classList.add("text-danger-with-bg");
    });
    casasCertas.forEach(chave => celulas[chave].casa.classList.add("text-success-with-bg"));

    pontuacaoFinal = certas;

    document.getElementById("spanCertas").innerHTML = certas;
    document.getElementById("spanErradas").innerHTML = erradas;
    document.getElementById("spanNumeroDaQuestaoAtual").innerHTML = certas;

    // Atualiza percentual
    const total = certas + erradas;
    const percentual = total > 0 ? Math.round((certas / total) * 100) : 0;
    document.getElementById("spanPercentual").innerHTML = percentual + "%";

    finalizarJogo();
}

// Mostra a pontuação ("8 de 12 palavras") e a mensagem final.
function finalizarJogo() {
    const porcentagem = pontuacaoFinal / quantidadeDeQuestoes;
    let texto = "";
    let classe = "";

    if (porcentagem <= 0.3) {
        texto = "Parece que você não estudou...";
        classe = "text-danger-with-bg";
    } else if (porcentagem < 0.9) {
        texto = "Pode melhorar na próxima, hein!";
        classe = "text-warning-with-bg";
    } else {
        texto = "Uau, parabéns!";
        classe = "text-success-with-bg";
    }

    texto += "<br> Você acertou " + Math.round(porcentagem * 100) + "% das palavras.";

    document.getElementById("msgFinal").innerHTML = texto;
    document.getElementById("msgFinal").className = classe;
    document.getElementById("spanPontuacaoFinal").innerHTML = pontuacaoFinal + " de " + quantidadeDeQuestoes + " palavras";
}

// Botão "Reiniciar": limpa o tabuleiro e zera os contadores.
function reiniciar() {
    reiniciarEstado();

    const primeira = Object.keys(celulas)[0];
    if (primeira) celulas[primeira].input.focus();
}