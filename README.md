# TaxCalcBR

## Brazilian Financial Planning and Interest Comparison System

---

### Description
TaxCalcBR is a comprehensive financial planning and analysis system designed for the **Brazilian market**. It combines a **Python backend** for handling financial data (like fetching SELIC and IPCA rates from the Central Bank) and a **dynamic web interface built with HTML, CSS, and JavaScript**. The system allows users to compare various payment scenarios (cash vs. installments, interest, late payments, inflation effects) and simulate investment returns.

---

### Features
* **Real-Time Financial Indices**: Displays the current **SELIC** (annualized) and **IPCA** (12-month accumulated) rates, fetched directly from the Brazilian Central Bank.
* **Detailed Comparisons**: Offers **7 distinct financial analysis modes**, including cash vs. installments, down payment scenarios, late payment impact, inflation simulation, and alternative investment comparisons.
* **Compound Interest Calculations**: Supports calculations with and without **Income Tax (IR)** considerations on yields.
* **Net Present Value (NPV)**: Calculates the NPV for inflation simulations to aid investment decisions.
* **User-Friendly Interface**: Features a **responsive web interface** with dynamic input fields that adapt based on the selected option, providing **real-time calculations** without page reloads.
* **Robust Input Handling**: Supports flexible input formats for financial data (e.g., values with commas or periods).
* **Modular Architecture**: Clear separation between logic and visual components (e.g., `script.js` for calculations) for easier maintenance and testing.

---

### System Modeling
The system intelligently processes financial data to:
* Convert interest rates between different periods (e.g., annual to monthly).
* Perform cumulative calculations, such as annualized returns, leveraging **compound interest** principles.
* Compare various payment and investment strategies using robust mathematical formulas.

---

### Data Manipulation
* **Data Retrieval**: Connects to the **Brazilian Central Bank API** to fetch up-to-date SELIC and IPCA rates.
* **Data Cleaning**: Ensures raw data is properly formatted and free from extraneous characters for accurate calculations.
* **Financial Algorithms**: Implements precise mathematical formulas for reliable financial projections and comparative analysis.

---

### Web Interface
The interactive web-based graphical interface is developed using pure **HTML, CSS, and JavaScript**:
* **Dynamic Inputs**: Input fields automatically adjust and appear/disappear based on the user's selected analysis option, streamlining the user experience.
* **Real-Time Results**: Calculations are performed instantly, and results are displayed dynamically on the same page, eliminating the need for page reloads.
* **Smooth Navigation**: The interface automatically scrolls to display the results after a calculation is performed, ensuring optimal usability.

---

### Goals
The primary objective of TaxCalcBR is to facilitate **informed financial decisions** by providing a streamlined, accurate, and user-friendly platform for managing and analyzing key financial indices in Brazil. By automating the retrieval and calculation of crucial market rates, TaxCalcBR empowers users to evaluate various financial scenarios with minimal effort.

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
    git clone [https://github.com/gabrielbribeiroo/TaxCalcBR.git](https://github.com/gabrielbribeiroo/TaxCalcBR.git)
    ```
2.  **Python (Optional for Data Sourcing)**:
    * Ensure you have **Python** and **Jupyter** installed.
    * Execute `finances.ipynb` to explore how real **SELIC/CDI** data can be queried from the Central Bank.
3.  **Web Interface (No Dependencies)**:
    * Open the `index.html` file directly in your web browser.
    * The current **SELIC** and **IPCA** rates will be displayed automatically upon loading.
    * Choose one of the **7 analysis options** from the dropdown menu.
    * Fill in the dynamic input fields as required.
    * Click the "Calcular" button to view the results.
    * The calculated financial planning and analysis results will appear dynamically below the form.

---

## License
This project is licensed under the **MIT License**.