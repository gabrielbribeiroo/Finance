// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");

// Limpa os inputs e a área de resultados
function limparCampos() {
    inputContainer.innerHTML = "";
    resultadoDiv.innerHTML = "";
}

// Cria dinamicamente campos de entrada de acordo com a opção escolhida
function criarCamposParaOpcao(opcao) {
    limparCampos();

    switch (opcao) {
        case "1":
            inputContainer.innerHTML = `
                <label>Digite o valor total da compra (R$): <input type="number" id="valorTotal" step="0.01" required></label>
                <label>Digite o número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Digite a taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label>Digite a porcentagem de desconto à vista (se houver): <input type="number" id="descontoVista" step="0.01"></label>
                <label>Deseja considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "2":
            inputContainer.innerHTML = `
                <label>Digite o valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label>Digite o número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Digite o valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Digite a taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label>Deseja considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "3":
            inputContainer.innerHTML = `
                <label>Valor da entrada (R$): <input type="number" id="entrada" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
            `;
            break;
        case "4":
            inputContainer.innerHTML = `
                <label>Primeira opção - Número de parcelas: <input type="number" id="parcelas1" min="1" required></label>
                <label>Primeira opção - Valor de cada parcela (R$): <input type="number" id="valorParcela1" step="0.01" required></label>
                <label>Segunda opção - Número de parcelas: <input type="number" id="parcelas2" min="1" required></label>
                <label>Segunda opção - Valor de cada parcela (R$): <input type="number" id="valorParcela2" step="0.01" required></label>
            `;
            break;
        case "5":
            inputContainer.innerHTML = `
                <label>Valor da parcela original (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Dias de atraso: <input type="number" id="diasAtraso" required></label>
                <label>Multa por atraso (%): <input type="number" id="multa" step="0.01" required></label>
                <label>Juros diários por atraso (%): <input type="number" id="jurosDiarios" step="0.01" required></label>
            `;
            break;
        case "6":
            inputContainer.innerHTML = `
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Inflação mensal estimada (%): <input type="number" id="inflacao" step="0.01" required></label>
            `;
            break;
        case "7":
            inputContainer.innerHTML = `
                <label>Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Taxa de rendimento mensal do investimento alternativo (%): <input type="number" id="taxaInvestimento" step="0.01" required></label>
            `;
            break;
    }
}

selectOpcao.addEventListener("change", () => {
    const opcao = selectOpcao.value;
    criarCamposParaOpcao(opcao);
});

calcularBtn.addEventListener("click", () => {
    const opcao = selectOpcao.value;
    resultadoDiv.innerHTML = "";

    try {
        switch (opcao) {
            case "3":
                const entrada = parseFloat(document.getElementById("entrada").value);
                const parcelas3 = parseInt(document.getElementById("parcelas").value);
                const valorParcela3 = parseFloat(document.getElementById("valorParcela").value);
                const valorVista3 = parseFloat(document.getElementById("valorVista").value);
                const totalParcelado = entrada + parcelas3 * valorParcela3;

                resultadoDiv.innerHTML = `
                    <p>Total parcelado: R$ ${totalParcelado.toFixed(2)}</p>
                    <p>Valor à vista: R$ ${valorVista3.toFixed(2)}</p>
                    <strong>${totalParcelado > valorVista3 ? "Vale mais a pena pagar à vista." : "Vale mais a pena parcelar com entrada."}</strong>
                `;
                break;

            case "4":
                const parcelas1 = parseInt(document.getElementById("parcelas1").value);
                const valorParcela1 = parseFloat(document.getElementById("valorParcela1").value);
                const parcelas2 = parseInt(document.getElementById("parcelas2").value);
                const valorParcela2 = parseFloat(document.getElementById("valorParcela2").value);
                const total1 = parcelas1 * valorParcela1;
                const total2 = parcelas2 * valorParcela2;

                resultadoDiv.innerHTML = `
                    <p>Total da primeira opção: R$ ${total1.toFixed(2)}</p>
                    <p>Total da segunda opção: R$ ${total2.toFixed(2)}</p>
                    <strong>${total1 < total2 ? "A primeira opção é melhor." : "A segunda opção é melhor."}</strong>
                `;
                break;

            case "5":
                const valorParcela5 = parseFloat(document.getElementById("valorParcela").value);
                const diasAtraso = parseInt(document.getElementById("diasAtraso").value);
                const multa = parseFloat(document.getElementById("multa").value) / 100;
                const jurosDiarios = parseFloat(document.getElementById("jurosDiarios").value) / 100;
                const valorCorrigido = valorParcela5 * (1 + multa + jurosDiarios * diasAtraso);

                resultadoDiv.innerHTML = `
                    <p>Valor com atraso: R$ ${valorCorrigido.toFixed(2)}</p>
                `;
                break;

            case "6":
                const parcelas6 = parseInt(document.getElementById("parcelas").value);
                const valorParcela6 = parseFloat(document.getElementById("valorParcela").value);
                const inflacao = parseFloat(document.getElementById("inflacao").value) / 100;

                let valorTotalInflacao = 0;
                for (let i = 1; i <= parcelas6; i++) {
                    valorTotalInflacao += valorParcela6 / Math.pow(1 + inflacao, i);
                }

                resultadoDiv.innerHTML = `
                    <p>Valor total considerando a inflação: R$ ${valorTotalInflacao.toFixed(2)}</p>
                `;
                break;

            case "7":
                const valorVista7 = parseFloat(document.getElementById("valorVista").value);
                const parcelas7 = parseInt(document.getElementById("parcelas").value);
                const valorParcela7 = parseFloat(document.getElementById("valorParcela").value);
                const taxaInvestimento = parseFloat(document.getElementById("taxaInvestimento").value) / 100;

                let saldo = valorVista7;
                for (let i = 0; i < parcelas7; i++) {
                    saldo = saldo * (1 + taxaInvestimento) - valorParcela7;
                }

                resultadoDiv.innerHTML = `
                    <p>Valor final ao investir e parcelar: R$ ${saldo.toFixed(2)}</p>
                    <strong>${saldo > 0 ? "Investir e parcelar é vantajoso." : "Melhor pagar à vista."}</strong>
                `;
                break;

            default:
                resultadoDiv.innerHTML = "<p>Opção ainda não implementada nesta interface.</p>";
        }
    } catch (erro) {
        resultadoDiv.innerHTML = `<p style="color: red;">Erro nos dados inseridos. Verifique os campos e tente novamente.</p>`;
    }
});