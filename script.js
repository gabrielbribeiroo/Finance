// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");
const selicRateSpan = document.getElementById("selic-rate");
const ipcaRateSpan = document.getElementById("ipca-rate");

// --- Funções de Ajuda e Validação de Entrada ---

/**
 * Limpa os campos de entrada dinâmicos e a área de resultados.
 */
function limparCampos() {
    inputContainer.innerHTML = "";
    resultadoDiv.innerHTML = "";
}

/**
 * Obtém o valor numérico de um input HTML, validando-o.
 * @param {string} id - O ID do elemento input.
 * @returns {number} O valor numérico do input.
 * @throws {Error} Se o campo estiver vazio ou o valor for inválido.
 */
function getNumericInputValue(id) {
    const element = document.getElementById(id);
    if (!element || element.value === "") {
        throw new Error(`O campo "${element ? element.labels[0].textContent.replace(':', '').trim() : id}" é obrigatório.`);
    }
    const value = parseFloat(element.value.replace(',', '.'));
    if (isNaN(value)) {
        throw new Error(`Valor inválido para o campo "${element.labels[0].textContent.replace(':', '').trim()}".`);
    }
    return value;
}

/**
 * Obtém o valor inteiro de um input HTML, validando-o.
 * @param {string} id - O ID do elemento input.
 * @returns {number} O valor inteiro do input.
 * @throws {Error} Se o campo estiver vazio ou o valor for inválido.
 */
function getIntInputValue(id) {
    const element = document.getElementById(id);
    if (!element || element.value === "") {
        throw new Error(`O campo "${element ? element.labels[0].textContent.replace(':', '').trim() : id}" é obrigatório.`);
    }
    const value = parseInt(element.value);
    if (isNaN(value)) {
        throw new Error(`Valor inválido para o campo "${element.labels[0].textContent.replace(':', '').trim()}".`);
    }
    return value;
}

/**
 * Obtém o valor de um select (geralmente 'S' ou 'N').
 * @param {string} id - O ID do elemento select.
 * @returns {string} O valor selecionado.
 * @throws {Error} Se o elemento não for encontrado.
 */
function getYesNoValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`O campo de seleção "${id}" não foi encontrado.`);
    }
    return element.value;
}

// --- Funções de Cálculo Financeiro ---

/**
 * Ajusta a taxa de rendimento mensal com base nas alíquotas de Imposto de Renda.
 * @param {number} taxa - Taxa de rendimento mensal original (decimal).
 * @param {number} qnt_parcelas - Quantidade de parcelas (para determinar a alíquota de IR).
 * @param {string} considerarIR - 'S' para considerar IR, 'N' caso contrário.
 * @returns {number} A taxa ajustada.
 */
function ajustarTaxaParaIR(taxa, qnt_parcelas, considerarIR) {
    if (considerarIR === 'S') {
        // As alíquotas de IR para investimentos de renda fixa (tabela regressiva)
        // são baseadas no tempo de aplicação. Aqui, estamos usando as parcelas
        // como proxy para o tempo, o que é uma simplificação.
        if (qnt_parcelas <= 6) { // Até 180 dias
            return taxa * 0.775; // 22.5% de IR
        } else if (qnt_parcelas <= 12) { // De 181 a 360 dias
            return taxa * 0.80; // 20% de IR
        } else if (qnt_parcelas <= 24) { // De 361 a 720 dias
            return taxa * 0.825; // 17.5% de IR
        } else { // Acima de 720 dias
            return taxa * 0.85; // 15% de IR
        }
    }
    return taxa;
}

/**
 * Calcula o valor total de uma dívida com juros (simples ou compostos).
 * @param {number} valorInicial - Valor principal da dívida.
 * @param {number} qntParcelas - Número de períodos de juros.
 * @param {number} jurosMensais - Taxa de juros por período (decimal).
 * @param {string} tipoJuros - 'simples' ou 'composto'.
 * @returns {number} O valor total da dívida após os juros.
 */
function calcularValorParceladoComJuros(valorInicial, qntParcelas, jurosMensais = 0, tipoJuros = 'composto') {
    if (tipoJuros === 'simples') {
        return valorInicial * (1 + jurosMensais * qntParcelas);
    } else { // Padrão para composto
        return valorInicial * Math.pow((1 + jurosMensais), qntParcelas);
    }
}

/**
 * Simula os rendimentos acumulados de um valor ao longo das parcelas.
 * A lógica é que o dinheiro que *não* foi pago à vista (ou seja, o valor das parcelas)
 * poderia estar rendendo em um investimento.
 * @param {number} qnt_parcelas - Quantidade total de parcelas.
 * @param {number} valor_parcela - Valor de cada parcela.
 * @param {number} taxa_mensal - Taxa de rendimento mensal (decimal).
 * @returns {{ganho: number, simulacaoDetalhada: string}} Objeto com o ganho total e a tabela HTML da simulação.
 */
function simularRendimento(qnt_parcelas, valor_parcela, taxa_mensal) {
    let ganho = 0;
    // O capital inicial para rendimento é o valor total nominal das parcelas.
    let capitalInvestidoInicial = valor_parcela * qnt_parcelas;
    let simulacaoDetalhada = '<p>Detalhes do Rendimento:</p><table><thead><tr><th>Parcela</th><th>Capital p/ Rendimento (R$)</th><th>Rendimento (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= qnt_parcelas; i++) {
        let rendimentoMensal = capitalInvestidoInicial * taxa_mensal;
        ganho += rendimentoMensal;
        simulacaoDetalhada += `<tr><td>${i}</td><td>${capitalInvestidoInicial.toFixed(2)}</td><td>${rendimentoMensal.toFixed(2)}</td></tr>`;
        capitalInvestidoInicial -= valor_parcela; // A base para o rendimento decresce a cada parcela paga
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}


// --- Funções de Busca de Taxas Externas ---

/**
 * Busca e exibe a taxa SELIC meta anual do Banco Central do Brasil.
 */
async function fetchSelicRate() {
    // Série 432: Taxa de juros - Selic (anual)
    const selicAnualApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";
    try {
        const responseAnual = await fetch(selicAnualApiUrl);
        if (!responseAnual.ok) {
            throw new Error(`HTTP error! status: ${responseAnual.status}`);
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

/**
 * Busca os valores mensais do IPCA e calcula o acumulado em 12 meses.
 */
async function fetchIpcaAnnualRate() {
    // Série 433: IPCA - Índice Nacional de Preços ao Consumidor Amplo (Mensal)
    const ipcaMensalApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json";

    try {
        const response = await fetch(ipcaMensalApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.length === 12) {
            let ipcaAcumulado = 1;
            data.forEach(item => {
                const valorMensal = parseFloat(item.valor) / 100; // Converte para decimal
                ipcaAcumulado *= (1 + valorMensal);
            });
            ipcaAcumulado = (ipcaAcumulado - 1) * 100; // Converte de volta para porcentagem
            ipcaRateSpan.textContent = `${ipcaAcumulado.toFixed(2)}%`;
        } else {
            ipcaRateSpan.textContent = "N/A (dados incompletos)";
        }
    } catch (error) {
        console.error("Erro ao carregar o IPCA:", error);
        ipcaRateSpan.textContent = "Erro ao carregar";
    }
}


// --- Criação Dinâmica dos Campos de Entrada do Formulário ---

/**
 * Cria dinamicamente os campos de entrada no formulário de acordo com a opção selecionada.
 * @param {string} opcao - O valor da opção selecionada (1 a 7).
 */
function criarCamposParaOpcao(opcao) {
    limparCampos();

    let htmlContent = '';
    switch (opcao) {
        case "1": // Rendimento vs Parcelas
            htmlContent = `
                <label for="valorTotal">Valor total da compra (R$): <input type="number" id="valorTotal" step="0.01" required></label>
                <label for="parcelas">Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label for="taxaRendimento">Taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label for="descontoVista">Porcentagem de desconto à vista (se houver): <input type="number" id="descontoVista" step="0.01" value="0"></label>
                <label for="temJurosParcelado">Há juros em pagar parcelado? 
                    <select id="temJurosParcelado">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
                <div id="jurosParceladoFields" style="display:none;">
                    <label for="tipoJurosParcelado">Tipo de juros:
                        <select id="tipoJurosParcelado">
                            <option value="simples">Simples</option>
                            <option value="composto">Compostos</option>
                        </select>
                    </label>
                    <label for="taxaJurosParcelado">Taxa de juros mensal (%): <input type="number" id="taxaJurosParcelado" step="0.01"></label>
                </div>
                <label for="considerarIR">Considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "2": // À vista vs Parcelas
            htmlContent = `
                <label for="valorVista">Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label for="parcelas">Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label for="valorParcela">Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label for="taxaRendimento">Taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label for="considerarIR">Considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "3": // Parcelamento com entrada (AGORA COM CAMPOS DE INVESTIMENTO)
            htmlContent = `
                <label for="entrada">Valor da entrada (R$): <input type="number" id="entrada" step="0.01" required></label>
                <label for="parcelas">Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label for="valorParcela">Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label for="valorVista">Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label for="taxaRendimento">Taxa de rendimento mensal (%): <input type="number" id="taxaRendimento" step="0.01" required></label>
                <label for="considerarIR">Considerar imposto de renda sobre os rendimentos? 
                    <select id="considerarIR">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </label>
            `;
            break;
        case "4": // Comparar duas opções de parcelamento
            htmlContent = `
                <h3>Primeira opção:</h3>
                <label for="parcelas1">Número de parcelas: <input type="number" id="parcelas1" min="1" required></label>
                <label for="valorParcela1">Valor de cada parcela (R$): <input type="number" id="valorParcela1" step="0.01" required></label>
                <h3>Segunda opção:</h3>
                <label for="parcelas2">Número de parcelas: <input type="number" id="parcelas2" min="1" required></label>
                <label for="valorParcela2">Valor de cada parcela (R$): <input type="number" id="valorParcela2" step="0.01" required></label>
            `;
            break;
        case "5": // Impacto de atrasos em parcelas
            htmlContent = `
                <label for="valorParcelaOriginal">Valor da parcela original (R$): <input type="number" id="valorParcelaOriginal" step="0.01" required></label>
                <label for="diasAtraso">Dias de atraso: <input type="number" id="diasAtraso" required></label>
                <label for="multa">Multa por atraso (%): <input type="number" id="multa" step="0.01" required></label>
                <label for="jurosDiarios">Juros diários por atraso (%): <input type="number" id="jurosDiarios" step="0.01" required></label>
            `;
            break;
        case "6": // Simulação com inflação
            htmlContent = `
                <label for="parcelas">Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label for="valorParcela">Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label for="inflacao">Inflação mensal estimada (%): <input type="number" id="inflacao" step="0.01" required></label>
            `;
            break;
        case "7": // Comparar com investimento alternativo
            htmlContent = `
                <label for="valorVista">Valor da compra à vista (R$): <input type="number" id="valorVista" step="0.01" required></label>
                <label for="parcelas">Número de parcelas: <input type="number" id="parcelas" min="1" required></label>
                <label for="valorParcela">Valor de cada parcela (R$): <input type="number" id="valorParcela" step="0.01" required></label>
                <label for="taxaInvestimento">Taxa de rendimento mensal do investimento alternativo (%): <input type="number" id="taxaInvestimento" step="0.01" required></label>
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
            // Aciona o evento de 'change' uma vez para garantir o estado inicial correto
            temJurosParceladoSelect.dispatchEvent(new Event('change'));
        }
    }
}

// --- Funções de Cálculo Específicas para Cada Opção ---

/**
 * Calcula e exibe a comparação de Rendimento vs. Parcelas. (Opção 1)
 */
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
        <h3>[1] Rendimento vs. Parcelas:</h3>
        <p>Valor total da compra: R$ ${valorTotal.toFixed(2)}</p>
        <p>Valor pagando à vista (com desconto): R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado (com juros, se houver): R$ ${valorParceladoComJuros.toFixed(2)}</p>
        <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
        <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
        ${simulacaoDetalhada}
        <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
    `;
}

/**
 * Calcula e exibe a comparação À Vista vs. Parcelas. (Opção 2)
 */
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
        <h3>[2] À Vista vs. Parcelas:</h3>
        <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado: R$ ${totalParcelado.toFixed(2)}</p>
        <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
        <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
        ${simulacaoDetalhada}
        <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
    `;
}

/**
 * Calcula e exibe a comparação de Parcelamento com Entrada vs. À Vista. (Opção 3)
 * Agora inclui simulação de investimento.
 */
function calcularOpcao3() {
    const entrada = getNumericInputValue("entrada");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const valorVista = getNumericInputValue("valorVista");
    let taxaRendimento = getNumericInputValue("taxaRendimento") / 100; // Nova entrada
    const considerarIR = getYesNoValue("considerarIR"); // Nova entrada

    const totalParcelado = entrada + parcelas * valorParcela;

    // Simulação de rendimento sobre o valor que seria pago à vista, mas que foi investido
    // A base para o rendimento é o valor total da compra à vista.
    taxaRendimento = ajustarTaxaParaIR(taxaRendimento, parcelas, considerarIR);
    
    // A lógica de simular rendimento aqui é um pouco diferente da Opção 2.
    // Na Opção 2, o valor "investido" é o que seria pago à vista.
    // Aqui, o valor "investido" é o valor à vista, e as parcelas são "pagas" desse investimento.
    let saldoInvestimento = valorVista;
    let rendimentoTotal = 0;
    let tabelaDetalhada = '<p>Detalhes do Investimento (se o valor à vista fosse investido):</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= parcelas; i++) {
        const rendimentoMes = saldoInvestimento * taxaRendimento;
        const saldoInicialMes = saldoInvestimento;
        
        saldoInvestimento += rendimentoMes;
        rendimentoTotal += rendimentoMes; // Acumula o rendimento total
        
        if (i === 1) { // A entrada é paga no mês 1
            saldoInvestimento -= entrada;
        }
        saldoInvestimento -= valorParcela; // Paga a parcela mensal

        tabelaDetalhada += `<tr>
            <td>${i}</td>
            <td>${saldoInicialMes.toFixed(2)}</td>
            <td>${rendimentoMes.toFixed(2)}</td>
            <td>${(i === 1 ? entrada : 0) + valorParcela.toFixed(2)}</td>
            <td>${saldoInvestimento.toFixed(2)}</td>
        </tr>`;
    }
    tabelaDetalhada += '</tbody></table>';

    // O custo efetivo do parcelamento com entrada, considerando os rendimentos que você *deixou de ganhar*
    // ou o benefício de ter o dinheiro rendendo.
    // Se o saldo final do investimento for positivo, significa que o parcelamento foi vantajoso.
    // Se for negativo, o custo efetivo foi maior do que o valor à vista.
    const valorEfetivoParceladoComEntrada = valorVista - saldoInvestimento;


    resultadoDiv.innerHTML = `
        <h3>[3] Parcelamento com Entrada vs. À Vista:</h3>
        <p>Valor da entrada: R$ ${entrada.toFixed(2)}</p>
        <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
        <p>Número de parcelas: ${parcelas}</p>
        <p>Total nominal parcelado (entrada + parcelas): R$ ${totalParcelado.toFixed(2)}</p>
        <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Rendimento total gerado pelo investimento do valor à vista: R$ ${rendimentoTotal.toFixed(2)}</p>
        <p>Saldo final do investimento (após pagar entrada e parcelas): R$ ${saldoInvestimento.toFixed(2)}</p>
        <p>Custo efetivo do parcelamento com entrada (considerando rendimentos): R$ ${valorEfetivoParceladoComEntrada.toFixed(2)}</p>
        ${tabelaDetalhada}
        <strong>${saldoInvestimento >= 0 ? "Compensa parcelar com entrada e investir o valor à vista." : "Compensa pagar à vista."}</strong>
    `;
}

/**
 * Calcula e exibe a comparação entre duas opções de parcelamento. (Opção 4)
 */
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

/**
 * Calcula e exibe o impacto de atrasos em parcelas. (Opção 5)
 */
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

/**
 * Calcula e exibe a simulação com inflação (Valor Presente Líquido). (Opção 6)
 */
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

/**
 * Calcula e exibe a comparação com um investimento alternativo. (Opção 7)
 */
function calcularOpcao7() {
    const valorVista = getNumericInputValue("valorVista");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const taxaInvestimento = getNumericInputValue("taxaInvestimento") / 100;

    let saldoInvestimento = valorVista; // O valor que seria pago à vista, agora investido

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


// --- Gerenciamento de Eventos ---

// Evento ao mudar a opção selecionada no dropdown
selectOpcao.addEventListener("change", () => {
    const opcao = selectOpcao.value;
    criarCamposParaOpcao(opcao);
});

// Evento ao clicar no botão "Calcular"
calcularBtn.addEventListener("click", () => {
    const opcao = selectOpcao.value;
    resultadoDiv.innerHTML = ""; // Limpa resultados anteriores

    if (opcao === "0") {
        resultadoDiv.innerHTML = "<p style='color: orange;'>Por favor, selecione uma opção de comparação antes de calcular.</p>";
        return;
    }

    try {
        // Usa um switch para chamar a função de cálculo correspondente à opção
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
        // Rola a página suavemente para a área de resultados
        resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (erro) {
        // Exibe mensagens de erro claras para o usuário
        resultadoDiv.innerHTML = `<p style="color: red;"><strong>Erro: ${erro.message}</strong></p><p style="color: red;">Verifique se todos os campos obrigatórios foram preenchidos corretamente e se os valores são válidos.</p>`;
    }
});

// Executa funções quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa os campos de entrada com base na opção padrão do select
    criarCamposParaOpcao(selectOpcao.value);
    // Carrega as taxas financeiras ao iniciar a página
    fetchSelicRate();
    fetchIpcaAnnualRate();
});