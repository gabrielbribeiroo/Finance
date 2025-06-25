# TaxCalcBR

## Brazilian Financial Planning and Interest Comparison System

---

### Description
TaxCalcBR is a comprehensive financial planning and analysis system designed for the **Brazilian market**. It combines a **Python backend** (primarily for exploring data sourcing and backend logic) and a **dynamic web interface** built with **HTML, CSS, and JavaScript**. The system empowers users to compare various payment scenarios, understand interest impacts, and simulate investment returns based on real-time financial indices.

---

### Features
* **Real-Time Financial Indices**: Displays the current **SELIC** (annualized) and **IPCA** (12-month accumulated) rates, fetched directly from the Brazilian Central Bank for immediate financial context.
* **7 Detailed Comparison Modes**: Offers diverse financial analysis options to suit various needs:
    * **Yield vs. Installments**: Analyze the effective cost considering potential investment yields and cash discounts.
    * **Cash vs. Installments**: Directly compare different offer values.
    * **Down Payment + Installments vs. Cash**: Evaluate scenarios involving an initial down payment, now including investment simulation to assess true cost.
    * **Compare Two Installment Options**: Determine the most cost-effective choice between two payment plans.
    * **Late Payment Impact**: Calculate the corrected value of overdue installments, factoring in penalties and daily interest.
    * **Inflation Simulation**: Understand the real value of future payments by calculating the Net Present Value (NPV) with estimated inflation.
    * **Alternative Investment Comparison**: See if investing a lump sum while making installment payments is more advantageous than an outright cash purchase.
* **Compound Interest Calculations**: Supports intricate interest calculations, with or without **Income Tax (IR)** considerations on investment yields, applying Brazilian tax rules.
* **User-Friendly Interface**: Features a **responsive web interface** with dynamic input fields that adapt instantly to the selected analysis option, providing **real-time calculations** without page reloads.
* **Robust Input Handling**: Ensures flexible and reliable processing of numerical inputs, accommodating common Brazilian number formatting (e.g., values with commas or periods).
* **Modular Architecture**: Designed with a clear separation between calculation logic (`script.js`) and visual components, making it easy to maintain, test, and expand.

---

### System Modeling
The system intelligently processes financial data to:
* Convert interest rates between different periods (e.g., annual to monthly) accurately.
* Perform cumulative calculations, such as annualized returns, leveraging **compound interest** principles.
* Compare various payment and investment strategies using robust mathematical formulas and established financial models.

---

### Data Manipulation
* **Real-time Data Retrieval**: Connects directly to the **Brazilian Central Bank API** to fetch up-to-date **SELIC** and **IPCA** rates, ensuring all calculations are based on current market conditions.
* **Data Validation**: Ensures raw input data is properly formatted and free from extraneous characters, preventing calculation errors and improving reliability.
* **Financial Algorithms**: Implements precise mathematical formulas for reliable financial projections and comprehensive comparative analysis.

---

### Web Interface
The interactive web-based graphical interface is developed using pure **HTML, CSS, and JavaScript**:
* **Dynamic Inputs**: Input fields automatically adjust and appear/disappear based on the user's selected analysis option, streamlining the user experience and preventing unnecessary clutter.
* **Real-Time Results**: Calculations are performed instantly, and results are displayed dynamically on the same page, eliminating the need for page reloads and providing immediate feedback.
* **Smooth Navigation**: The interface automatically scrolls to display the results after a calculation is performed, ensuring optimal usability and a seamless user flow.

---

### Goals
The primary objective of TaxCalcBR is to facilitate **informed financial decisions** by providing a streamlined, accurate, and user-friendly platform for managing and analyzing key financial indices in Brazil. By automating the retrieval and calculation of crucial market rates and offering diverse simulation tools, TaxCalcBR empowers users to confidently evaluate various financial scenarios with minimal effort, promoting better financial literacy and effective planning.

---

### Languages and Tools
#### 🖥 Back-end
<div style="display: inline_block"><cbr>
  <img align = "top" alt = "Python" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" />
  <img align = "top" alt = "Jupyter" height = "50" width = "50" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Jupyter_logo.svg" />
</div>

#### 🌐 Front-end
<div style="display: inline_block"><cbr>
  <img align = "top" alt = "HTML" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" />
  <img align = "top" alt = "CSS" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" />
  <img align = "top" alt = "JavaScript" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" />
</div>

#### 🔧 Development Tools
<div style="display: inline_block"><cbr>
  <img align = "top" alt = "GoogleColab" height = "50" width = "50" src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Colaboratory_SVG_Logo.svg" />
  <img align = "top" alt = "VSCode" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" />
  <img align = "top" alt = "PowerShell" height = "50" width = "50" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/powershell/powershell-original.svg" />
</div>

---

### Instructions for Use
1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/gabrielbribeiroo/TaxCalcBR.git](https://github.com/gabrielbribeiroo/Finance.git)
    ```
2.  **Python (Optional for Data Sourcing)**:
    * Ensure you have **Python** and **Jupyter** installed.
    * Execute `finances.ipynb` to explore how real **SELIC/CDI** data can be queried from the Central Bank. This is mainly for backend data exploration and understanding the data integration possibilities.
3.  **Web Interface (No Dependencies)**:
    * Open the `index.html` file directly in your web browser.
    * The current **SELIC** and **IPCA** rates will be automatically displayed at the top of the page upon loading.
    * Choose one of the **7 analysis options** from the dropdown menu to reveal relevant input fields.
    * Fill in the dynamic input fields with your financial data.
    * Click the "Calcular" button to instantly view your personalized financial analysis results.
    * The calculated results, including detailed simulations (where applicable), will appear dynamically below the form.

---

## License
This project is licensed under the **MIT License**.