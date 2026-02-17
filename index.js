let $visor = document.querySelector("#visor");
function escrever(e) {
  $visor.value += e;
}

function limpar() {
  $visor.value = "";
  document.getElementById("resultado-tabela").innerHTML = "";
}

function apagar() {
  $visor.value = $visor.value.slice(0, -1);
}

function escrever_verdade() {
  $visor.value += "V";
}

function escrever_falso() {
  $visor.value += "F";
}

function processarLogica(trecho) {
  const ordemOps = ["~", "∧", "∨", "→", "↔", "⊻"];

  for (let opAtual of ordemOps) {
    let i = 0;
    while (i < trecho.length) {
      if (trecho[i] === opAtual) {
        if (opAtual == "~") {
          //negação
          let res = trecho[i + 1] == "V" ? "F" : "V";
          trecho.splice(i, 2, res);
          i = -1;
        } else {
          let esq = trecho[i - 1];
          let dir = trecho[i + 1];
          let res;

          if (opAtual == "∧") res = esq == "V" && dir == "V" ? "V" : "F";
          else if (opAtual == "∨") res = esq == "V" || dir == "V" ? "V" : "F";
          else if (opAtual == "→") res = esq == "V" && dir == "F" ? "F" : "V";
          else if (opAtual == "↔") res = esq == dir ? "V" : "F";
          else if (opAtual == "⊻") res = esq !== dir ? "V" : "F";

          trecho.splice(i - 1, 3, res);
          i = -1;
        }
      }
      i++;
    }
  }
  return trecho[0];
}

document.getElementById("botao-igual").addEventListener("click", () => {
  const expressao = $visor.value.replace(/\s/g, "");
  const variaveis = [...new Set(expressao.match(/[A-Z]/g))]
    .filter((v) => v !== "V" && v !== "F")
    .sort();
  const numLinhas = Math.pow(2, variaveis.length);

  let resultadosTabela = [];

  for (let i = 0; i < numLinhas; i++) {
    let combinacao = {};
    variaveis.forEach((v, index) => {
      let valor = i & (1 << (variaveis.length - 1 - index)) ? "V" : "F";
      combinacao[v] = valor;
    });

    let lista = expressao.split("").map((char) => combinacao[char] || char);

    let temParenteses = true;
    while (temParenteses) {
      let abre = lista.lastIndexOf("(");
      if (abre !== -1) {
        let fecha = lista.indexOf(")", abre);
        let subLista = lista.slice(abre + 1, fecha);
        let resSub = processarLogica(subLista);
        lista.splice(abre, fecha - abre + 1, resSub);
      } else {
        temParenteses = false;
      }
    }

    let resultadoLinha = processarLogica([...lista]);
    resultadosTabela.push({ ...combinacao, resultado: resultadoLinha });
  }

  desenharTabela(variaveis, resultadosTabela, expressao);
});

function desenharTabela(colunas, dados, expressaoOriginal) {
  // Análise do tipo de fórmula
  let todosV = dados.every(r => r.resultado === 'V');
  let todosF = dados.every(r => r.resultado === 'F');
  let tipoFormula = todosV ? "TAUTOLOGIA" : (todosF ? "CONTRADIÇÃO" : "CONTINGÊNCIA");
  let corTipo = todosV ? '#4CAF50' : (todosF ? '#F44336' : '#FFC107');
  
  let html = `<h2 style="color: white;">Fórmula: ${expressaoOriginal}</h2>`;
  html += `<h3 style="color: ${corTipo}; font-size: 1.5rem; font-weight: bold;">Tipo: ${tipoFormula}</h3>`;
  html += '<table border="1" style="color: white; text-align: center;"><tr>';

  colunas.forEach((c) => (html += `<th style="padding: 10px; background-color: #444;">${c}</th>`));
  html += '<th style="padding: 10px; background-color: #444;">Resultado</th></tr>';

  dados.forEach((linha) => {
    html += "<tr>";
    colunas.forEach((c) => (html += `<td style="padding: 8px; background-color: #555;">${linha[c]}</td>`));
    let corResultado = linha.resultado === 'V' ? '#4CAF50' : '#F44336';
    html += `<td style="padding: 8px; background-color: ${corResultado}; font-weight: bold;">${linha.resultado}</td></tr>`;
  });

  html += "</table>";
  document.getElementById("resultado-tabela").innerHTML = html;
}
