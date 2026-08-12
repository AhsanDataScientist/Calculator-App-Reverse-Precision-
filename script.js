let currentInput = "0";
let expression = "";
let isEvaluated = false;
let history = [];

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const historyList = document.getElementById("historyList");

function updateDisplay() {
    resultDisplay.innerText = currentInput;
    expressionDisplay.innerText = expression;
}

function appendNumber(num) {
    if (isEvaluated) {
        currentInput = num;
        expression = num;
        isEvaluated = false;
    } else {
        if (currentInput === "0" && num !== ".") {
            currentInput = num;
        } else {
            if (num === "." && currentInput.includes(".")) return;
            currentInput += num;
        }
        expression += num;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (isEvaluated) {
        expression = currentInput;
        isEvaluated = false;
    }
    
    if (expression === "") return;
    
    const lastChar = expression.slice(-1);
    if (["+", "-", "*", "/", "%"].includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += op;
    }
    
    currentInput = op;
    updateDisplay();
}

function clearAll() {
    currentInput = "0";
    expression = "";
    isEvaluated = false;
    updateDisplay();
}

function deleteLast() {
    if (isEvaluated) {
        clearAll();
        return;
    }
    expression = expression.slice(0, -1);
    currentInput = currentInput.slice(0, -1);
    if (currentInput === "") currentInput = "0";
    updateDisplay();
}

function calculateResult() {
    if (!expression || isEvaluated) return;

    try {
        let formattedExpression = expression.replace(/%/g, "/100");
        let evalResult = eval(formattedExpression);

        if (!isFinite(evalResult)) {
            currentInput = "Error";
            updateDisplay();
            return;
        }

        // Clean precision rounding for JavaScript floating-point issues
        evalResult = Math.round(evalResult * 1e12) / 1e12;

        addHistory(expression, evalResult);
        
        currentInput = String(evalResult);
        expression = expression + " =";
        isEvaluated = true;
        updateDisplay();
    } catch (e) {
        currentInput = "Error";
        updateDisplay();
    }
}

// Dedicated Reverse Calculation Logic
function runReverseCalculation() {
    const a = parseFloat(document.getElementById("revA").value);
    const b = parseFloat(document.getElementById("revB").value);
    const outputDiv = document.getElementById("revOutput");

    if (isNaN(a) || isNaN(b)) {
        alert("Please enter valid numbers in both fields.");
        return;
    }

    if (b === 0) {
        alert("Division by zero is not allowed.");
        return;
    }

    // Step 1: Divide
    const divResult = a / b;

    // Step 2: Multiply answer back by denominator
    const reconstructed = divResult * b;

    outputDiv.style.display = "block";
    outputDiv.innerHTML = `
        <strong>Step 1 (Division):</strong> ${a} ÷ ${b} = <b>${divResult}</b><br>
        <strong>Step 2 (Reverse):</strong> ${divResult} × ${b} = <b style="color: #10b981;">${reconstructed}</b>
    `;

    addHistory(`${a} ÷ ${b} × ${b}`, reconstructed);
}

// History Functions
function addHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 20) history.pop();
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; padding: 20px 0;">No history yet</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <span>${item.expr}</span>
            <strong style="color: #f8fafc;">${item.res}</strong>
        </div>
    `).join("");
}

function clearHistory() {
    history = [];
    renderHistory();
}

// Keyboard Support
document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (!isNaN(key)) appendNumber(key);
    if (["+", "-", "*", "/", "%"].includes(key)) appendOperator(key);
    if (key === "Enter" || key === "=") calculateResult();
    if (key === "Backspace") deleteLast();
    if (key === "Escape") clearAll();
    if (key === ".") appendNumber(".");
});