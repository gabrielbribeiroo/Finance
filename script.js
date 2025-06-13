// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");
const selicRateSpan = document.getElementById("selic-rate");
const ipcaRateSpan = document.getElementById("ipca-rate"); // Novo span para o IPCA

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
    const value = parseFloat(element.value.replace(',', '.'));
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
    return taxa;
}

// Função para calcular o valor total parcelado com juros (similar ao .ipynb)
function calcularValorParceladoComJuros(valorInicial, qntParcelas, jurosMensais = 0, tipoJuros = 'composto') {
    if (tipoJuros === 'simples') {
        return valorInicial * (1 + jurosMensais * qntParcelas);
    } else {
        return valorInicial * Math.pow((1 + jurosMensais), qntParcelas);
    }
}

// Simula os rendimentos acumulados (similar ao .ipynb)
function simularRendimento(qnt_parcelas, valor_parcela, taxa_mensal) {
    let ganho = 0;
    let divida = valor_parcela * qnt_parcelas;
    let simulacaoDetalhada = '<p>Detalhes do Rendimento:</p><table><thead><tr><th>Parcela</th><th>Dívida (R$)</th><th>Rendimento (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= qnt_parcelas; i++) {
        let rendimento = divida * taxa_mensal;
        ganho += rendimento;
        divida -= valor_parcela;
        simulacaoDetalhada += `<tr><td>${i}</td><td>${divida.toFixed(2)}</td><td>${rendimento.toFixed(2)}</td></tr>`;
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}

// Função para buscar e exibir a taxa SELIC
async function fetchSelicRate() {
    const selicAnualApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";
    try {
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
    } catch (error) {
        console.error("Erro ao carregar a taxa SELIC:", error);
        selicRateSpan.textContent = "Erro ao carregar";
    }
}

// Função para buscar e exibir o IPCA anual (acumulado em 12 meses)
async function fetchIpcaAnnualRate() {
    // Código da série IPCA mensal no BCB é 433
    // Para o acumulado em 12 meses, precisamos dos últimos 12 valores mensais
    const ipcaMensalApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json";

    try {
        const response = await fetch(ipcaMensalApiUrl);
        if (!response.ok) {
            throw new Error(`Erro ao buscar IPCA mensal: ${response.statusText}`);
        }
        const data = await response.json();

        if (data && data.length === 12) {
            // Calcular o IPCA acumulado em 12 meses
            let ipcaAcumulado = 1;
            data.forEach(item => {
                const valorMensal = parseFloat(item.valor) / 100; // Converte para decimal
                ipcaAcumulado *= (1 + valorMensal);
            });
            // Converte de volta para porcentagem e formata
            ipcaAcumulado = (ipcaAcumulado - 1) * 100;
            ipcaRateSpan.textContent = `${ipcaAcumulado.toFixed(2)}%`;
        } else {
            ipcaRateSpan.textContent = "N/A (dados incompletos)";
        }
    } catch (error) {
        console.error("Erro ao carregar o IPCA:", error);
        ipcaRateSpan.textContent = "Erro ao carregar";
    }
}


// --- Criação Dinâmica dos Campos de Entrada ---

// A função 'criarCamposParaOpcao' permanece a mesma, pois os inputs são para as simulações, não para as taxas exibidas.

// ... (Resto da função criarCamposParaOpcao e todas as funções calcularOpcao1 a calcularOpcao7) ...
// (Mantenha o código das funções calcularOpcao1 a calcularOpcao7 como no último exemplo fornecido)

// --- Funções de Cálculo por Opção ---

function calcularOpcao1() {
    const valorTotal = getNumericInputValue("valorTotal");
    const parcelas = getIntInputValue("parcelas");
    let taxaRendimento = getNumericInputValue("taxaRendimento") / 100;
    const descontoVista = getNumericInputValue("descontoVista") / 100;
    const considerarIR = getYesNoValue("considerarIR");
    const temJurosParcelado = getYesNoValue("temJurosParcelado");

    let valorVista = valorTotal * (1 - descontoVista);
    let valorParceladoComJuros = valorTotal; 

    if (temJurosParcelado === 'S') {
        const tipoJurosParcelado = getYesNoValue("tipoJurosParcelado"); 
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

    let saldoInvestimento = valorVista;

    let tabelaDetalhada = '<p>Detalhes do Investimento:</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= parcelas; i++) {
        const rendimento = saldoInvestimento * taxaInvestimento;
        const saldoInicialMes = saldoInvestimento;
        
        saldoInvestimento += rendimento;
        saldoInvestimento -= valorParcela;

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
    resultadoDiv.innerHTML = "";

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
        resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (erro) {
        resultadoDiv.innerHTML = `<p style="color: red;">Erro: ${erro.message}</p><p style="color: red;">Verifique se todos os campos obrigatórios foram preenchidos corretamente e se os valores são válidos.</p>`;
    }
});

// Inicializa os campos ao carregar a página e carrega as taxas
document.addEventListener("DOMContentLoaded", () => {
    criarCamposParaOpcao(selectOpcao.value);
    fetchSelicRate();
    fetchIpcaAnnualRate(); // Chama a nova função para carregar o IPCA
});