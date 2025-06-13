// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");
const selicRateSpan = document.getElementById("selic-rate"); // Novo span para a SELIC

// --- Funções de Ajuda e Cálculos ---

// Limpa os inputs e a área de resultados
function limparCampos() {
    inputContainer.innerHTML = "";
    resultadoDiv.innerHTML = "";
}

// Função auxiliar para obter valor numérico de um input
function getNumericInputValue(id) {
    const element = document.getElementById(id);
    if (!element || element.value === "") {
        throw new Error(`O campo '${id}' é obrigatório.`);
    }
    // Usa parseFloat para números decimais
    const value = parseFloat(element.value.replace(',', '.')); // Garante que vírgulas funcionem
    if (isNaN(value)) {
        throw new Error(`Valor inválido para o campo '${id}'.`);
    }
    return value;
}

// Função auxiliar para obter valor inteiro de um input
function getIntInputValue(id) {
    const element = document.getElementById(id);
    if (!element || element.value === "") {
        throw new Error(`O campo '${id}' é obrigatório.`);
    }
    const value = parseInt(element.value);
    if (isNaN(value)) {
        throw new Error(`Valor inválido para o campo '${id}'.`);
    }
    return value;
}

// Função auxiliar para obter resposta 'S' ou 'N'
function getYesNoValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`O campo de seleção '${id}' não foi encontrado.`);
    }
    return element.value;
}

// Função para ajustar a taxa de rendimento com base no IR
function ajustarTaxaParaIR(taxa, qnt_parcelas, considerarIR) {
    if (considerarIR === 'S') {
        if (qnt_parcelas <= 6) {
            return taxa * 0.775; // 22.5% de IR
        } else if (qnt_parcelas <= 12) {
            return taxa * 0.80; // 20% de IR
        } else if (qnt_parcelas <= 24) {
            return taxa * 0.825; // 17.5% de IR
        } else {
            return taxa * 0.85; // 15% de IR
        }
    }
    return taxa; // Retorna a taxa original se não considerar IR
}

// Função para calcular o valor total parcelado com juros (similar ao .ipynb)
function calcularValorParceladoComJuros(valorInicial, qntParcelas, jurosMensais = 0, tipoJuros = 'composto') {
    if (tipoJuros === 'simples') {
        return valorInicial * (1 + jurosMensais * qntParcelas); // Juros simples sobre o valor total inicial
    } else { // Padrão para composto
        return valorInicial * Math.pow((1 + jurosMensais), qntParcelas);
    }
}

// Simula os rendimentos acumulados (similar ao .ipynb)
function simularRendimento(qnt_parcelas, valor_parcela, taxa_mensal) {
    let ganho = 0;
    let divida = valor_parcela * qnt_parcelas; // Começa com o valor total da dívida
    let simulacaoDetalhada = '<p>Detalhes do Rendimento:</p><table><thead><tr><th>Parcela</th><th>Dívida (R$)</th><th>Rendimento (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= qnt_parcelas; i++) {
        let rendimento = divida * taxa_mensal;
        ganho += rendimento;
        divida -= valor_parcela; // A dívida diminui a cada parcela paga
        simulacaoDetalhada += `<tr><td>${i}</td><td>${divida.toFixed(2)}</td><td>${rendimento.toFixed(2)}</td></tr>`;
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}

// Função para buscar e exibir a taxa SELIC
async function fetchSelicRate() {
    const selicApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json";
    try {
        const response = await fetch(selicApiUrl);
        if (!response.ok) {
            throw new Error(`Erro ao buscar SELIC: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.length > 0 && data[0].valor) {
            // A série 11 retorna a taxa diária. Precisamos anualizá-la para um contexto mais comum.
            // Para simplificar, vou exibir o valor diário. Se for necessário anualizar, a lógica precisa ser mais precisa.
            // O valor do BCB é percentual diário para a série 11. O mais comum é ter a taxa ao ano.
            // No contexto brasileiro, Selic é sempre anualizada. A série 11 é diária.
            // Uma aproximação comum para converter diária para anual (útil para taxa SELIC meta) é:
            // (1 + taxa_diaria_decimal)^252 - 1 (dias úteis) ou (1 + taxa_diaria_decimal)^365 - 1 (dias corridos)
            // Para a taxa SELIC divulgada oficialmente, ela já é anual. A série 11 é a taxa diária efetiva.
            // Para mostrar a 'Selic atualizada' como uma taxa anual, podemos assumir que o 'valor' retornado
            // pela API para a série 11 é a taxa acumulada do dia, que ao longo do ano formaria a meta.
            // No entanto, para fins de exibir "a taxa SELIC atualizada", o mais correto é a taxa meta anual.
            // A API de séries temporais do BCB (SGS) série 432: "Taxa de juros - Selic" (anual)
            // https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json

            // Vamos usar a série 432 para taxa anual, que é mais comum para o usuário final.
            const selicAnualApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";
            const responseAnual = await fetch(selicAnualApiUrl);
            if (!responseAnual.ok) {
                throw new Error(`Erro ao buscar SELIC anual: ${responseAnual.statusText}`);
            }
            const dataAnual = await responseAnual.json();

            if (dataAnual && dataAnual.length > 0 && dataAnual[0].valor) {
                const selicRate = parseFloat(dataAnual[0].valor);
                selicRateSpan.textContent = `${selicRate.toFixed(2)}%`;
            } else {
                selicRateSpan.textContent = "N/A";
            }
        } else {
            selicRateSpan.textContent = "N/A";
        }
    } catch (error) {
        console.error("Erro ao carregar a taxa SELIC:", error);
        selicRateSpan.textContent = "Erro ao carregar";
    }
}


// --- Criação Dinâmica dos Campos de Entrada ---

// Cria dinamicamente campos de entrada de acordo com a opção escolhida
function criarCamposParaOpcao(opcao) {
    limparCampos();

    let htmlContent = '';
    switch (opcao) {
        case "1": // Rendimento vs Parcelas
            htmlContent = `
                <label>Valor total da compra (R$): <input type="number" id="valorTotal" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label>Porcentagem de desconto à vista (se houver): <input type="number" id="descontoVista" step="0.01" value="0"></label>
                <label>Há juros em pagar parcelado? 
                    <select id="temJurosParcelado">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
                <div id="jurosParceladoFields" style="display:none;">
                    <label>Tipo de juros:
                        <select id="tipoJurosParcelado">
                            <option value="simples">Simples</option>
                            <option value="composto">Compostos</option>
                        </select>
                    </label>
                    <label>Taxa de juros mensal (%): <input type="number" id="taxaJurosParcelado" step="0.01"></label>
                </div>
                <label>Considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "2": // À vista vs Parcelas
            htmlContent = `
                <label>Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label>Considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "3": // Parcelamento com entrada
            htmlContent = `
                <label>Valor da entrada (R$): <input type="number" id="entrada" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
            `;
            break;
        case "4": // Comparar duas opções de parcelamento
            htmlContent = `
                <h3>Primeira opção:</h3>
                <label>Número de parcelas: <input type="number" id="parcelas1" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela1" step="0.01" required></label>
                <h3>Segunda opção:</h3>
                <label>Número de parcelas: <input type="number" id="parcelas2" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela2" step="0.01" required></label>
            `;
            break;
        case "5": // Impacto de atrasos em parcelas
            htmlContent = `
                <label>Valor da parcela original (R$): <input type="number" id="valorParcelaOriginal" step="0.01" required></label>
                <label>Dias de atraso: <input type="number" id="diasAtraso" required></label>
                <label>Multa por atraso (%): <input type="number" id="multa" step="0.01" required></label>
                <label>Juros diários por atraso (%): <input type="number" id="jurosDiarios" step="0.01" required></label>
            `;
            break;
        case "6": // Simulação com inflação
            htmlContent = `
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Inflação mensal estimada (%): <input type="number" id="inflacao" step="0.01" required></label>
            `;
            break;
        case "7": // Comparar com investimento alternativo
            htmlContent = `
                <label>Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label>Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label>Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label>Taxa de rendimento mensal do investimento alternativo (%): <input type="number" id="taxaInvestimento" step="0.01" required></label>
            `;
            break;
    }
    inputContainer.innerHTML = htmlContent;

    // Adiciona listener para a seleção de juros parcelados na Opção 1
    if (opcao === "1") {
        const temJurosParceladoSelect = document.getElementById("temJurosParcelado");
        const jurosParceladoFieldsDiv = document.getElementById("jurosParceladoFields");

        if (temJurosParceladoSelect) {
            temJurosParceladoSelect.addEventListener('change', () => {
                if (temJurosParceladoSelect.value === 'S') {
                    jurosParceladoFieldsDiv.style.display = 'block';
                } else {
                    jurosParceladoFieldsDiv.style.display = 'none';
                }
            });
        }
    }
}

// --- Funções de Cálculo por Opção ---

function calcularOpcao1() {
    const valorTotal = getNumericInputValue("valorTotal");
    const parcelas = getIntInputValue("parcelas");
    let taxaRendimento = getNumericInputValue("taxaRendimento") / 100;
    const descontoVista = getNumericInputValue("descontoVista") / 100;
    const considerarIR = getYesNoValue("considerarIR");
    const temJurosParcelado = getYesNoValue("temJurosParcelado");

    let valorVista = valorTotal * (1 - descontoVista);
    let valorParceladoComJuros = valorTotal; // Inicializa com valorTotal

    if (temJurosParcelado === 'S') {
        const tipoJurosParcelado = getYesNoValue("tipoJurosParcelado"); // 'simples' ou 'composto'
        const taxaJurosParcelado = getNumericInputValue("taxaJurosParcelado") / 100;
        valorParceladoComJuros = calcularValorParceladoComJuros(valorTotal, parcelas, taxaJurosParcelado, tipoJurosParcelado);
    }

    const valorParcela = valorParceladoComJuros / parcelas;
    taxaRendimento = ajustarTaxaParaIR(taxaRendimento, parcelas, considerarIR);

    const { ganho: rendimentosAcumulados, simulacaoDetalhada } = simularRendimento(parcelas, valorParcela, taxaRendimento);
    const valorEfetivoParcelado = valorParceladoComJuros - rendimentosAcumulados;

    resultadoDiv.innerHTML = `
        <h3>[1] Rendimento vs Parcelas:</h3>
        <p>Valor total da compra: R$ ${valorTotal.toFixed(2)}</p>
        <p>Valor pagando à vista (com desconto): R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado (com juros, se houver): R$ ${valorParceladoComJuros.toFixed(2)}</p>
        <p>Rendimentos acumulados (se investir): R$ ${rendimentosAcumulados.toFixed(2)}</p>
        <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
        ${simulacaoDetalhada}
        <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
    `;
}

function calcularOpcao2() {
    const valorVista = getNumericInputValue("valorVista");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    let taxaRendimento = getNumericInputValue("taxaRendimento") / 100;
    const considerarIR = getYesNoValue("considerarIR");

    const totalParcelado = parcelas * valorParcela;
    taxaRendimento = ajustarTaxaParaIR(taxaRendimento, parcelas, considerarIR);

    const { ganho: rendimentosAcumulados, simulacaoDetalhada } = simularRendimento(parcelas, valorParcela, taxaRendimento);
    const valorEfetivoParcelado = totalParcelado - rendimentosAcumulados;

    resultadoDiv.innerHTML = `
        <h3>[2] À vista vs Parcelas:</h3>
        <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado: R$ ${totalParcelado.toFixed(2)}</p>
        <p>Rendimentos acumulados (se investir): R$ ${rendimentosAcumulados.toFixed(2)}</p>
        <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
        ${simulacaoDetalhada}
        <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
    `;
}

function calcularOpcao3() {
    const entrada = getNumericInputValue("entrada");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const valorVista = getNumericInputValue("valorVista");
    const totalParcelado = entrada + parcelas * valorParcela;

    resultadoDiv.innerHTML = `
        <h3>[3] Parcelamento com Entrada:</h3>
        <p>Total parcelado com entrada: R$ ${totalParcelado.toFixed(2)}</p>
        <p>Valor à vista: R$ ${valorVista.toFixed(2)}</p>
        <strong>${totalParcelado < valorVista ? "Compensa pagar com entrada e parcelas." : "Compensa pagar à vista."}</strong>
    `;
}

function calcularOpcao4() {
    const parcelas1 = getIntInputValue("parcelas1");
    const valorParcela1 = getNumericInputValue("valorParcela1");
    const parcelas2 = getIntInputValue("parcelas2");
    const valorParcela2 = getNumericInputValue("valorParcela2");

    const total1 = parcelas1 * valorParcela1;
    const total2 = parcelas2 * valorParcela2;

    resultadoDiv.innerHTML = `
        <h3>[4] Comparar Duas Opções de Parcelamento:</h3>
        <p>Total da primeira opção: R$ ${total1.toFixed(2)}</p>
        <p>Total da segunda opção: R$ ${total2.toFixed(2)}</p>
        <strong>${total1 < total2 ? "A primeira opção é melhor." : "A segunda opção é melhor."}</strong>
    `;
}

function calcularOpcao5() {
    const valorParcelaOriginal = getNumericInputValue("valorParcelaOriginal");
    const diasAtraso = getIntInputValue("diasAtraso");
    const multa = getNumericInputValue("multa") / 100;
    const jurosDiarios = getNumericInputValue("jurosDiarios") / 100;

    const valorCorrigido = valorParcelaOriginal * (1 + multa + jurosDiarios * diasAtraso);

    resultadoDiv.innerHTML = `
        <h3>[5] Impacto de Atrasos em Parcelas:</h3>
        <p>Valor com atraso: R$ ${valorCorrigido.toFixed(2)}</p>
    `;
}

function calcularOpcao6() {
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const inflacao = getNumericInputValue("inflacao") / 100;

    let valorTotalInflacao = 0;
    for (let i = 1; i <= parcelas; i++) {
        valorTotalInflacao += valorParcela / Math.pow(1 + inflacao, i);
    }

    resultadoDiv.innerHTML = `
        <h3>[6] Simulação com Inflação:</h3>
        <p>Valor total considerando a inflação (valor presente líquido): R$ ${valorTotalInflacao.toFixed(2)}</p>
    `;
}

function calcularOpcao7() {
    const valorVista = getNumericInputValue("valorVista");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const taxaInvestimento = getNumericInputValue("taxaInvestimento") / 100;

    let saldoInvestimento = valorVista; // O valor que seria pago à vista, agora investido

    let tabelaDetalhada = '<p>Detalhes do Investimento:</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= parcelas; i++) {
        const rendimento = saldoInvestimento * taxaInvestimento;
        const saldoInicialMes = saldoInvestimento; // Saldo no início do mês, antes do rendimento e pagamento
        
        saldoInvestimento += rendimento; // Aplica o rendimento
        saldoInvestimento -= valorParcela; // Subtrai a parcela paga

        tabelaDetalhada += `<tr>
            <td>${i}</td>
            <td>${saldoInicialMes.toFixed(2)}</td>
            <td>${rendimento.toFixed(2)}</td>
            <td>${valorParcela.toFixed(2)}</td>
            <td>${saldoInvestimento.toFixed(2)}</td>
        </tr>`;
    }
    tabelaDetalhada += '</tbody></table>';

    resultadoDiv.innerHTML = `
        <h3>[7] Comparar com Investimento Alternativo:</h3>
        <p>Saldo final se você investir o valor à vista e pagar em parcelas: R$ ${saldoInvestimento.toFixed(2)}</p>
        ${tabelaDetalhada}
        <strong>${saldoInvestimento > 0 ? "Investir e parcelar é vantajoso (você termina com dinheiro extra)." : "Pagar à vista é mais seguro (evita dívidas ou perdas)."}</strong>
    `;
}


// --- Event Listeners ---

selectOpcao.addEventListener("change", () => {
    const opcao = selectOpcao.value;
    criarCamposParaOpcao(opcao);
});

calcularBtn.addEventListener("click", () => {
    const opcao = selectOpcao.value;
    resultadoDiv.innerHTML = ""; // Limpa resultados anteriores

    if (opcao === "0") {
        resultadoDiv.innerHTML = "<p style='color: orange;'>Por favor, selecione uma opção de comparação antes de calcular.</p>";
        return;
    }

    try {
        switch (opcao) {
            case "1":
                calcularOpcao1();
                break;
            case "2":
                calcularOpcao2();
                break;
            case "3":
                calcularOpcao3();
                break;
            case "4":
                calcularOpcao4();
                break;
            case "5":
                calcularOpcao5();
                break;
            case "6":
                calcularOpcao6();
                break;
            case "7":
                calcularOpcao7();
                break;
            default:
                resultadoDiv.innerHTML = "<p>Opção ainda não implementada nesta interface.</p>";
        }
        // Rolagem suave para o resultado
        resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (erro) {
        resultadoDiv.innerHTML = `<p style="color: red;">Erro: ${erro.message}</p><p style="color: red;">Verifique se todos os campos obrigatórios foram preenchidos corretamente e se os valores são válidos.</p>`;
    }
});

// Inicializa os campos ao carregar a página com a opção padrão (opção 0 ou 1) e carrega a SELIC
document.addEventListener("DOMContentLoaded", () => {
    criarCamposParaOpcao(selectOpcao.value); // Carrega os campos para a opção inicialmente selecionada (Selecione uma opção...)
    fetchSelicRate(); // Carrega a taxa SELIC ao iniciar
});