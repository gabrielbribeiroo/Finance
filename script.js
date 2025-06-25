// Referências aos elementos HTML
const selectOpcao = document.getElementById("opcao");
const calcularBtn = document.getElementById("calcular");
const resultadoDiv = document.getElementById("resultado");
const inputContainer = document.getElementById("input-container");
const selicRateSpan = document.getElementById("selic-rate");
const ipcaRateSpan = document.getElementById("ipca-rate");

// Variáveis globais para armazenar as taxas carregadas do BCB
let selicAtual = 0; // Armazenará o valor da SELIC anual
let ipcaAtual = 0; // Armazenará o valor do IPCA acumulado em 12 meses

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
        // Tenta encontrar o label associado para uma mensagem de erro mais amigável
        const label = document.querySelector(`label[for="${id}"]`) || element.closest('.form-group')?.querySelector('label');
        const fieldName = label ? label.textContent.replace(':', '').trim() : id;
        throw new Error(`O campo "${fieldName}" é obrigatório.`);
    }
    const value = parseFloat(element.value.replace(',', '.'));
    if (isNaN(value)) {
        const label = document.querySelector(`label[for="${id}"]`) || element.closest('.form-group')?.querySelector('label');
        const fieldName = label ? label.textContent.replace(':', '').trim() : id;
        throw new Error(`Valor inválido para o campo "${fieldName}".`);
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
        const label = document.querySelector(`label[for="${id}"]`) || element.closest('.form-group')?.querySelector('label');
        const fieldName = label ? label.textContent.replace(':', '').trim() : id;
        throw new Error(`O campo "${fieldName}" é obrigatório.`);
    }
    const value = parseInt(element.value);
    if (isNaN(value)) {
        const label = document.querySelector(`label[for="${id}"]`) || element.closest('.form-group')?.querySelector('label');
        const fieldName = label ? label.textContent.replace(':', '').trim() : id;
        throw new Error(`Valor inválido para o campo "${fieldName}".`);
    }
    return value;
}

/**
 * Obtém o valor de um select (geralmente uma string de tipo de taxa ou 'S'/'N').
 * @param {string} id - O ID do elemento select.
 * @returns {string} O valor selecionado.
 * @throws {Error} Se o elemento não for encontrado.
 */
function getStringSelectValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`O campo de seleção "${id}" não foi encontrado.`);
    }
    return element.value;
}

// --- Funções de Cálculo Financeiro ---

/**
 * Ajusta a taxa de rendimento (mensal) com base nas alíquotas de Imposto de Renda.
 * @param {number} taxaMensal - Taxa de rendimento mensal original (decimal).
 * @param {number} meses - Quantidade de meses de aplicação/parcelas (para determinar a alíquota de IR).
 * @param {string} considerarIR - 'S' para considerar IR, 'N' caso contrário.
 * @returns {number} A taxa ajustada.
 */
function ajustarTaxaParaIR(taxaMensal, meses, considerarIR) {
    if (considerarIR === 'S') {
        let aliquotaIR = 0;
        if (meses <= 6) { // Até 180 dias
            aliquotaIR = 0.225; // 22.5% de IR
        } else if (meses <= 12) { // De 181 a 360 dias
            aliquotaIR = 0.20; // 20% de IR
        } else if (meses <= 24) { // De 361 a 720 dias
            aliquotaIR = 0.175; // 17.5% de IR
        } else { // Acima de 720 dias
            aliquotaIR = 0.15; // 15% de IR
        }
        return taxaMensal * (1 - aliquotaIR);
    }
    return taxaMensal;
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
    let capitalInvestidoInicial = valor_parcela * qnt_parcelas;
    let simulacaoDetalhada = '<p>Detalhes do Rendimento:</p><table><thead><tr><th>Parcela</th><th>Capital p/ Rendimento (R$)</th><th>Rendimento (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= qnt_parcelas; i++) {
        let rendimentoMensal = capitalInvestidoInicial * taxa_mensal;
        ganho += rendimentoMensal;
        simulacaoDetalhada += `<tr><td>${i}</td><td>${capitalInvestidoInicial.toFixed(2)}</td><td>${rendimentoMensal.toFixed(2)}</td></tr>`;
        capitalInvestidoInicial -= valor_parcela;
    }
    simulacaoDetalhada += '</tbody></table>';
    return { ganho, simulacaoDetalhada };
}

/**
 * Converte a taxa informada pelo usuário (ou selecionada automaticamente) para uma taxa mensal decimal.
 * @param {string} tipoTaxa - Tipo da taxa ('custom-anual', 'custom-mensal', 'selic', 'ipca', 'cdi', 'indice-percentual').
 * @param {number} valorTaxaInput - O valor numérico da taxa (se personalizada ou percentual do índice).
 * @param {string} indiceBase - O índice base para 'indice-percentual' (SELIC, IPCA, CDI).
 * @returns {number} A taxa mensal decimal convertida.
 * @throws {Error} Se o tipo de taxa for desconhecido ou valores de SELIC/IPCA não estiverem carregados.
 */
function getConvertedMonthlyRate(tipoTaxa, valorTaxaInput, indiceBase = '') {
    let taxaAnualDecimal = 0;
    let taxaMensalDecimal = 0;

    switch (tipoTaxa) {
        case 'custom-anual':
            taxaAnualDecimal = valorTaxaInput / 100;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'custom-mensal':
            taxaMensalDecimal = valorTaxaInput / 100;
            break;
        case 'selic':
            if (selicAtual === 0) throw new Error("Taxa SELIC não carregada. Tente novamente.");
            taxaAnualDecimal = selicAtual / 100;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'ipca':
            if (ipcaAtual === 0) throw new Error("Taxa IPCA não carregada. Tente novamente.");
            taxaAnualDecimal = ipcaAtual / 100; // IPCA é acumulado em 12 meses, então já é uma taxa anualizada.
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'cdi':
            if (selicAtual === 0) throw new Error("Taxa SELIC (para CDI) não carregada. Tente novamente.");
            taxaAnualDecimal = (selicAtual - 0.1) / 100; // CDI geralmente 0.1% abaixo da SELIC meta anual.
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'indice-percentual':
            let taxaBaseAnual = 0;
            if (indiceBase === 'selic') {
                if (selicAtual === 0) throw new Error("Taxa SELIC (para % do índice) não carregada. Tente novamente.");
                taxaBaseAnual = selicAtual / 100;
            } else if (indiceBase === 'ipca') {
                if (ipcaAtual === 0) throw new Error("Taxa IPCA (para % do índice) não carregada. Tente novamente.");
                taxaBaseAnual = ipcaAtual / 100;
            } else if (indiceBase === 'cdi') {
                if (selicAtual === 0) throw new Error("Taxa SELIC (para CDI) não carregada. Tente novamente.");
                taxaBaseAnual = (selicAtual - 0.1) / 100;
            } else {
                throw new Error("Índice base para 'Índice + Percentual' não especificado ou inválido.");
            }
            // Calcula a taxa anual do investimento como (percentual_informado_pelo_usuario / 100) * taxa_base_anual
            taxaAnualDecimal = (valorTaxaInput / 100) * taxaBaseAnual;
            taxaMensalDecimal = Math.pow(1 + taxaAnualDecimal, 1/12) - 1;
            break;
        case 'inflacao': // Usado na Opção 6, é sempre uma taxa mensal customizada
            taxaMensalDecimal = valorTaxaInput / 100;
            break;
        default:
            throw new Error("Tipo de taxa de rendimento desconhecido.");
    }
    return taxaMensalDecimal;
}


// --- Funções de Busca de Taxas Externas ---

/**
 * Busca e exibe a taxa SELIC meta anual do Banco Central do Brasil.
 */
async function fetchSelicRate() {
    const selicAnualApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json";
    try {
        const responseAnual = await fetch(selicAnualApiUrl);
        if (!responseAnual.ok) {
            throw new Error(`HTTP error! status: ${responseAnual.status}`);
        }
        const dataAnual = await responseAnual.json();

        if (dataAnual && dataAnual.length > 0 && dataAnual[0].valor) {
            selicAtual = parseFloat(dataAnual[0].valor); // Armazena na variável global
            selicRateSpan.textContent = `${selicAtual.toFixed(2)}%`;
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
    const ipcaMensalApiUrl = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json";

    try {
        const response = await fetch(ipcaMensalApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.length === 12) {
            let ipcaAcumuladoCalc = 1;
            data.forEach(item => {
                const valorMensal = parseFloat(item.valor) / 100;
                ipcaAcumuladoCalc *= (1 + valorMensal);
            });
            ipcaAtual = (ipcaAcumuladoCalc - 1) * 100; // Armazena na variável global
            ipcaRateSpan.textContent = `${ipcaAtual.toFixed(2)}%`;
        } else {
            ipcaRateSpan.textContent = "N/A (dados incompletos)";
        }
    } catch (error) {
        console.error("Erro ao carregar o IPCA:", error);
        ipcaRateSpan.textContent = "Erro ao carregar";
    }
}


// --- Funções de Criação e Gerenciamento de Campos Dinâmicos ---

/**
 * Gera o HTML para o fieldset de configuração de taxa de rendimento/inflação.
 * @param {string} idPrefix - Prefixo para os IDs dos elementos (ex: 'rendimento' ou 'inflacao').
 * @param {string} titleContext - Texto adicional para o título da seção (ex: 'do Rendimento').
 * @param {boolean} showIRSelect - Se o select de IR deve ser mostrado.
 * @returns {string} O HTML gerado.
 */
function generateYieldRateHtml(idPrefix, titleContext, showIRSelect) {
    const defaultTaxaValue = (idPrefix === 'inflacao') ? '0.5' : ''; 
    const defaultTaxaPlaceholder = (idPrefix === 'inflacao') ? 'Ex: 0.5 (mensal)' : 'Ex: 10.5 (anual)';

    return `
        <fieldset class="form-section yield-rate-inputs">
            <legend class="section-title">Configuração da Taxa ${titleContext}</legend>
            <div class="form-group">
                <label for="${idPrefix}TipoTaxa">Tipo de Taxa:</label>
                <select id="${idPrefix}TipoTaxa" class="tipo-taxa-select">
                    <option value="custom-anual">Anual (Personalizada)</option>
                    <option value="custom-mensal">Mensal (Personalizada)</option>
                    ${idPrefix !== 'inflacao' ? `
                    <option value="selic">SELIC (Carregada Automaticamente)</option>
                    <option value="ipca">IPCA (Carregada Automaticamente)</option>
                    <option value="cdi">CDI (SELIC - 0.1%)</option>
                    <option value="indice-percentual">Índice + Percentual (%)</option>
                    ` : ''}
                </select>
            </div>
            <div class="form-group" id="${idPrefix}IndiceBaseGroup" style="display: none;">
                <label for="${idPrefix}IndiceBase">Índice Base:</label>
                <select id="${idPrefix}IndiceBase">
                    <option value="cdi">CDI</option>
                    <option value="selic">SELIC</option>
                    <option value="ipca">IPCA</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${idPrefix}ValorTaxa">Valor da Taxa (%):</label>
                <input type="number" id="${idPrefix}ValorTaxa" class="valor-taxa-input" step="0.01" min="0" placeholder="${defaultTaxaPlaceholder}" value="${defaultTaxaValue}">
                <small id="${idPrefix}TaxaInfoText" class="taxa-info-text"></small>
            </div>
            ${showIRSelect ? `
            <div class="form-group" id="${idPrefix}IrOptionGroup">
                <label for="${idPrefix}ConsiderarIR">Considerar Imposto de Renda (IR) sobre o rendimento?</label>
                <select id="${idPrefix}ConsiderarIR">
                    <option value="N">Não</option>
                    <option value="S">Sim</option>
                </select>
                <small>O IR é aplicado sobre o rendimento bruto, conforme tabela regressiva de renda fixa.</small>
            </div>
            ` : ''}
        </fieldset>
    `;
}

/**
 * Configura os listeners para os campos de seleção e valor de taxa dinâmica.
 * @param {string} idPrefix - Prefixo dos IDs dos elementos (ex: 'rendimento' ou 'inflacao').
 */
function setupYieldRateListeners(idPrefix) {
    const tipoTaxaSelect = document.getElementById(`${idPrefix}TipoTaxa`);
    const valorTaxaInput = document.getElementById(`${idPrefix}ValorTaxa`);
    const taxaInfoText = document.getElementById(`${idPrefix}TaxaInfoText`);
    const indiceBaseGroup = document.getElementById(`${idPrefix}IndiceBaseGroup`);
    const indiceBaseSelect = document.getElementById(`${idPrefix}IndiceBase`);

    if (!tipoTaxaSelect || !valorTaxaInput || !taxaInfoText) {
        return; // Campos não existem para esta opção, sai da função
    }

    const updateTaxaFields = () => {
        const selectedTaxaType = tipoTaxaSelect.value;
        valorTaxaInput.value = ''; // Limpa o valor para evitar confusão entre tipos
        taxaInfoText.textContent = ''; // Limpa a info
        valorTaxaInput.readOnly = false; // Padrão é editável
        indiceBaseGroup.style.display = 'none'; // Esconde o índice base por padrão

        // Define o valor e o estado de readOnly com base no tipo de taxa
        switch (selectedTaxaType) {
            case 'selic':
                if (selicAtual === 0) {
                    taxaInfoText.textContent = "SELIC não carregada. Tente novamente ou escolha personalizada.";
                    valorTaxaInput.readOnly = false;
                } else {
                    valorTaxaInput.value = selicAtual.toFixed(2);
                    valorTaxaInput.readOnly = true;
                    taxaInfoText.textContent = `SELIC atual: ${selicAtual.toFixed(2)}% ao ano.`;
                }
                break;
            case 'ipca':
                if (ipcaAtual === 0) {
                    taxaInfoText.textContent = "IPCA não carregado. Tente novamente ou escolha personalizada.";
                    valorTaxaInput.readOnly = false;
                } else {
                    valorTaxaInput.value = ipcaAtual.toFixed(2);
                    valorTaxaInput.readOnly = true;
                    taxaInfoText.textContent = `IPCA acumulado (12 meses): ${ipcaAtual.toFixed(2)}%.`;
                }
                break;
            case 'cdi':
                if (selicAtual === 0) {
                    taxaInfoText.textContent = "SELIC (para CDI) não carregada. Tente novamente ou escolha personalizada.";
                    valorTaxaInput.readOnly = false;
                } else {
                    const cdiRate = (selicAtual - 0.1);
                    valorTaxaInput.value = cdiRate.toFixed(2);
                    valorTaxaInput.readOnly = true;
                    taxaInfoText.textContent = `CDI estimado: ${cdiRate.toFixed(2)}% ao ano (SELIC - 0.1%).`;
                }
                break;
            case 'indice-percentual':
                indiceBaseGroup.style.display = 'block';
                valorTaxaInput.placeholder = "Ex: 100 (para 100% do índice)";
                taxaInfoText.textContent = "Informe a porcentagem do índice base.";
                // Adiciona um listener para atualizar a info quando o índice base mudar
                if (indiceBaseSelect) {
                    indiceBaseSelect.addEventListener('change', updateTaxaInfoForIndicePercentual);
                    // Dispara para inicializar o texto de info
                    updateTaxaInfoForIndicePercentual(); 
                }
                break;
            case 'custom-mensal':
                valorTaxaInput.placeholder = "Ex: 0.5 (mensal)";
                taxaInfoText.textContent = "Insira a taxa mensal em %.";
                break;
            case 'custom-anual':
            default: // Default para custom-anual
                valorTaxaInput.placeholder = "Ex: 10.5 (anual)";
                taxaInfoText.textContent = "Insira a taxa anual em %.";
                break;
        }
    };

    const updateTaxaInfoForIndicePercentual = () => {
        const selectedIndiceBase = indiceBaseSelect.value;
        let baseRate = 0;
        let baseName = '';
        if (selectedIndiceBase === 'selic') {
            baseRate = selicAtual;
            baseName = 'SELIC';
        } else if (selectedIndiceBase === 'ipca') {
            baseRate = ipcaAtual;
            baseName = 'IPCA';
        } else if (selectedIndiceBase === 'cdi') {
            baseRate = selicAtual > 0 ? (selicAtual - 0.1) : 0;
            baseName = 'CDI';
        }
        if (baseRate > 0) {
            taxaInfoText.textContent = `Índice ${baseName} atual: ${baseRate.toFixed(2)}%.`;
        } else {
            taxaInfoText.textContent = `Carregando índice ${baseName}...`;
        }
    };

    tipoTaxaSelect.addEventListener('change', updateTaxaFields);
    // Dispara o evento change uma vez para inicializar o estado correto
    tipoTaxaSelect.dispatchEvent(new Event('change'));
}


/**
 * Cria dinamicamente os campos de entrada no formulário de acordo com a opção selecionada.
 * @param {string} opcao - O valor da opção selecionada (1 a 7).
 */
function criarCamposParaOpcao(opcao) {
    limparCampos();

    // Adiciona o placeholder inicial (agora no JS)
    inputContainer.innerHTML = '<p class="placeholder-text">Selecione uma opção acima para ver os campos.</p>';

    let htmlContent = '';
    let needsYieldListeners = false; // Flag para saber se precisa configurar os listeners de rendimento
    let yieldPrefix = ''; // Para guardar o prefixo da taxa (rendimento, inflacao, investimento)

    switch (opcao) {
        case "1": // Rendimento vs Parcelas
            htmlContent = `
                <div class="form-group">
                    <label for="valorTotal">Valor total da compra (R$):</label>
                    <input type="number" id="valorTotal" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="parcelas">Número de parcelas:</label>
                    <input type="number" id="parcelas" min="1" required>
                </div>
                <div class="form-group">
                    <label for="descontoVista">Porcentagem de desconto à vista (se houver):</label>
                    <input type="number" id="descontoVista" step="0.01" value="0">
                </div>
                <div class="form-group">
                    <label for="temJurosParcelado">Há juros em pagar parcelado?</label>
                    <select id="temJurosParcelado">
                        <option value="N">Não</option>
                        <option value="S">Sim</option>
                    </select>
                </div>
                <div id="jurosParceladoFields" style="display:none;">
                    <div class="form-group">
                        <label for="tipoJurosParcelado">Tipo de juros:</label>
                        <select id="tipoJurosParcelado">
                            <option value="simples">Simples</option>
                            <option value="composto">Compostos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="taxaJurosParcelado">Taxa de juros mensal (%):</label>
                        <input type="number" id="taxaJurosParcelado" step="0.01">
                    </div>
                </div>
                ${generateYieldRateHtml('rendimento', 'do Rendimento', true)}
            `;
            needsYieldListeners = true;
            yieldPrefix = 'rendimento';
            break;
        case "2": // À vista vs Parcelas
            htmlContent = `
                <div class="form-group">
                    <label for="valorVista">Valor da compra à vista (R$):</label>
                    <input type="number" id="valorVista" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="parcelas">Número de parcelas:</label>
                    <input type="number" id="parcelas" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela" step="0.01" required>
                </div>
                ${generateYieldRateHtml('rendimento', 'do Rendimento', true)}
            `;
            needsYieldListeners = true;
            yieldPrefix = 'rendimento';
            break;
        case "3": // Parcelamento com entrada (AGORA COM CAMPOS DE INVESTIMENTO)
            htmlContent = `
                <div class="form-group">
                    <label for="entrada">Valor da entrada (R$):</label>
                    <input type="number" id="entrada" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="parcelas">Número de parcelas:</label>
                    <input type="number" id="parcelas" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="valorVista">Valor da compra à vista (R$):</label>
                    <input type="number" id="valorVista" step="0.01" required>
                </div>
                ${generateYieldRateHtml('rendimento', 'do Rendimento', true)}
            `;
            needsYieldListeners = true;
            yieldPrefix = 'rendimento';
            break;
        case "4": // Comparar duas opções de parcelamento
            htmlContent = `
                <h3>Primeira opção:</h3>
                <div class="form-group">
                    <label for="parcelas1">Número de parcelas:</label>
                    <input type="number" id="parcelas1" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela1">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela1" step="0.01" required>
                </div>
                <h3>Segunda opção:</h3>
                <div class="form-group">
                    <label for="parcelas2">Número de parcelas:</label>
                    <input type="number" id="parcelas2" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela2">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela2" step="0.01" required>
                </div>
            `;
            break;
        case "5": // Impacto de atrasos em parcelas
            htmlContent = `
                <div class="form-group">
                    <label for="valorParcelaOriginal">Valor da parcela original (R$):</label>
                    <input type="number" id="valorParcelaOriginal" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="diasAtraso">Dias de atraso:</label>
                    <input type="number" id="diasAtraso" required>
                </div>
                <div class="form-group">
                    <label for="multa">Multa por atraso (%):</label>
                    <input type="number" id="multa" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="jurosDiarios">Juros diários por atraso (%):</label>
                    <input type="number" id="jurosDiarios" step="0.01" required>
                </div>
            `;
            break;
        case "6": // Simulação com inflação
            htmlContent = `
                <div class="form-group">
                    <label for="parcelas">Número de parcelas:</label>
                    <input type="number" id="parcelas" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela" step="0.01" required>
                </div>
                ${generateYieldRateHtml('inflacao', 'da Inflação', false)}
            `;
            needsYieldListeners = true;
            yieldPrefix = 'inflacao';
            break;
        case "7": // Comparar com investimento alternativo
            htmlContent = `
                <div class="form-group">
                    <label for="valorVista">Valor da compra à vista (R$):</label>
                    <input type="number" id="valorVista" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="parcelas">Número de parcelas:</label>
                    <input type="number" id="parcelas" min="1" required>
                </div>
                <div class="form-group">
                    <label for="valorParcela">Valor de cada parcela (R$):</label>
                    <input type="number" id="valorParcela" step="0.01" required>
                </div>
                ${generateYieldRateHtml('investimento', 'do Investimento', true)}
            `;
            needsYieldListeners = true;
            yieldPrefix = 'investimento';
            break;
        default:
            htmlContent = '<p class="placeholder-text">Selecione uma opção acima para ver os campos.</p>';
            break;
    }
    inputContainer.innerHTML = htmlContent;

    // Configura listeners para campos específicos que sempre existirão se a opção for selecionada
    if (opcao === "1") {
        const temJurosParceladoSelect = document.getElementById("temJurosParcelado");
        const jurosParceladoFieldsDiv = document.getElementById("jurosParceladoFields");

        if (temJurosParceladoSelect && jurosParceladoFieldsDiv) {
            temJurosParceladoSelect.addEventListener('change', () => {
                if (temJurosParceladoSelect.value === 'S') {
                    jurosParceladoFieldsDiv.style.display = 'block';
                } else {
                    jurosParceladoFieldsDiv.style.display = 'none';
                }
            });
            temJurosParceladoSelect.dispatchEvent(new Event('change')); // Trigger initial state
        }
    }

    if (needsYieldListeners) {
        setupYieldRateListeners(yieldPrefix);
    }
}


// --- Funções de Cálculo Específicas para Cada Opção ---

/**
 * Funcao auxiliar para obter a taxa de rendimento convertida e ajustada para IR.
 * @param {string} prefix - O prefixo dos IDs dos campos de taxa ('rendimento', 'inflacao', 'investimento').
 * @param {number} numMeses - O número total de meses/parcelas.
 * @returns {{taxaMensal: number, considerarIR: string}} Objeto com a taxa mensal ajustada e se IR foi considerado ('S' ou 'N').
 */
function getAdjustedYieldRate(prefix, numMeses) {
    const tipoTaxa = getStringSelectValue(`${prefix}TipoTaxa`);
    const valorTaxa = getNumericInputValue(`${prefix}ValorTaxa`);
    const considerarIR = document.getElementById(`${prefix}ConsiderarIR`) ? getStringSelectValue(`${prefix}ConsiderarIR`) : 'N'; // Pega do select

    let indiceBase = '';
    if (tipoTaxa === 'indice-percentual') {
        indiceBase = getStringSelectValue(`${prefix}IndiceBase`);
    }

    let taxaMensalDecimal = getConvertedMonthlyRate(tipoTaxa, valorTaxa, indiceBase);
    taxaMensalDecimal = ajustarTaxaParaIR(taxaMensalDecimal, numMeses, considerarIR);

    return { taxaMensal: taxaMensalDecimal, considerarIR: considerarIR };
}


/**
 * Calcula e exibe a comparação de Rendimento vs. Parcelas. (Opção 1)
 */
function calcularOpcao1() {
    const valorTotal = getNumericInputValue("valorTotal");
    const parcelas = getIntInputValue("parcelas");
    const descontoVista = getNumericInputValue("descontoVista") / 100;
    const temJurosParcelado = getStringSelectValue("temJurosParcelado");

    let valorVista = valorTotal * (1 - descontoVista);
    let valorParceladoComJuros = valorTotal;

    if (temJurosParcelado === 'S') {
        const tipoJurosParcelado = getStringSelectValue("tipoJurosParcelado");
        const taxaJurosParcelado = getNumericInputValue("taxaJurosParcelado") / 100;
        valorParceladoComJuros = calcularValorParceladoComJuros(valorTotal, parcelas, taxaJurosParcelado, tipoJurosParcelado);
    }

    const valorParcela = valorParceladoComJuros / parcelas;
    const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRate('rendimento', parcelas);

    const { ganho: rendimentosAcumulados, simulacaoDetalhada } = simularRendimento(parcelas, valorParcela, taxaRendimentoAjustada);
    const valorEfetivoParcelado = valorParceladoComJuros - rendimentosAcumulados;

    resultadoDiv.innerHTML = `
        <h3>[1] Rendimento vs. Parcelas:</h3>
        <p>Valor total da compra: R$ ${valorTotal.toFixed(2)}</p>
        <p>Valor pagando à vista (com desconto): R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado (com juros, se houver): R$ ${valorParceladoComJuros.toFixed(2)}</p>
        <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
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
    const totalParcelado = parcelas * valorParcela;

    const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRate('rendimento', parcelas);

    const { ganho: rendimentosAcumulados, simulacaoDetalhada } = simularRendimento(parcelas, valorParcela, taxaRendimentoAjustada);
    const valorEfetivoParcelado = totalParcelado - rendimentosAcumulados;

    resultadoDiv.innerHTML = `
        <h3>[2] À Vista vs. Parcelas:</h3>
        <p>Valor pagando à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Valor pagando parcelado: R$ ${totalParcelado.toFixed(2)}</p>
        <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
        <p>Rendimentos acumulados (se investir o que não foi gasto à vista): R$ ${rendimentosAcumulados.toFixed(2)}</p>
        <p>Valor efetivo pago parcelando (descontando rendimentos): R$ ${valorEfetivoParcelado.toFixed(2)}</p>
        ${simulacaoDetalhada}
        <strong>${valorVista < valorEfetivoParcelado ? "Compensa pagar à vista." : "Compensa parcelar."}</strong>
    `;
}

/**
 * Calcula e exibe a comparação de Parcelamento com Entrada vs. À Vista. (Opção 3)
 */
function calcularOpcao3() {
    const entrada = getNumericInputValue("entrada");
    const parcelas = getIntInputValue("parcelas");
    const valorParcela = getNumericInputValue("valorParcela");
    const valorVista = getNumericInputValue("valorVista");
    const totalParcelado = entrada + parcelas * valorParcela;

    const { taxaMensal: taxaRendimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRate('rendimento', parcelas);
    
    let saldoInvestimento = valorVista;
    let rendimentoTotalAcumulado = 0;
    let tabelaDetalhada = '<p>Detalhes do Investimento (se o valor à vista fosse investido):</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento Mês (R$)</th><th>Valor Pago Mês (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= parcelas; i++) {
        const rendimentoMes = saldoInvestimento * taxaRendimentoAjustada;
        const saldoInicialMes = saldoInvestimento;
        
        saldoInvestimento += rendimentoMes;
        rendimentoTotalAcumulado += rendimentoMes;
        
        let valorPagoNoMes = valorParcela;
        if (i === 1) { // A entrada é paga no mês 1
            valorPagoNoMes += entrada;
        }
        saldoInvestimento -= valorPagoNoMes;

        tabelaDetalhada += `<tr>
            <td>${i}</td>
            <td>${saldoInicialMes.toFixed(2)}</td>
            <td>${rendimentoMes.toFixed(2)}</td>
            <td>${valorPagoNoMes.toFixed(2)}</td>
            <td>${saldoInvestimento.toFixed(2)}</td>
        </tr>`;
    }
    tabelaDetalhada += '</tbody></table>';

    const valorEfetivoParceladoComEntrada = valorVista - saldoInvestimento;


    resultadoDiv.innerHTML = `
        <h3>[3] Parcelamento com Entrada vs. À Vista:</h3>
        <p>Valor da entrada: R$ ${entrada.toFixed(2)}</p>
        <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
        <p>Número de parcelas: ${parcelas}</p>
        <p>Total nominal parcelado (entrada + parcelas): R$ ${totalParcelado.toFixed(2)}</p>
        <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Taxa de rendimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaRendimentoAjustada * 100).toFixed(4)}% ao mês</p>
        <p>Rendimento total gerado pelo investimento do valor à vista: R$ ${rendimentoTotalAcumulado.toFixed(2)}</p>
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
    
    // Para inflação, a função getAdjustedYieldRate com prefixo 'inflacao'
    // já retorna a taxa mensal que queremos usar como taxa de desconto.
    const { taxaMensal: inflacaoMensalAjustada } = getAdjustedYieldRate('inflacao', parcelas);

    let valorTotalInflacao = 0;
    for (let i = 1; i <= parcelas; i++) {
        valorTotalInflacao += valorParcela / Math.pow(1 + inflacaoMensalAjustada, i);
    }

    resultadoDiv.innerHTML = `
        <h3>[6] Simulação com Inflação:</h3>
        <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
        <p>Número de parcelas: ${parcelas}</p>
        <p>Taxa de inflação mensal utilizada: ${(inflacaoMensalAjustada * 100).toFixed(4)}%</p>
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
    
    const { taxaMensal: taxaInvestimentoAjustada, considerarIR: irConsiderado } = getAdjustedYieldRate('investimento', parcelas);

    let saldoInvestimento = valorVista;

    let tabelaDetalhada = '<p>Detalhes do Investimento:</p><table><thead><tr><th>Mês</th><th>Saldo Inicial (R$)</th><th>Rendimento (R$)</th><th>Parcela Paga (R$)</th><th>Saldo Final (R$)</th></tr></thead><tbody>';

    for (let i = 1; i <= parcelas; i++) {
        const rendimento = saldoInvestimento * taxaInvestimentoAjustada;
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
        <p>Valor da compra à vista: R$ ${valorVista.toFixed(2)}</p>
        <p>Valor de cada parcela: R$ ${valorParcela.toFixed(2)}</p>
        <p>Número de parcelas: ${parcelas}</p>
        <p>Taxa de investimento utilizada (após IR${irConsiderado === 'S' ? ' SIM' : ' NÃO'}): ${(taxaInvestimentoAjustada * 100).toFixed(4)}% ao mês</p>
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