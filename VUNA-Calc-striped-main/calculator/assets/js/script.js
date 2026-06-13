let LAST_RESULT = 0;
var currentExpression = "";

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById("theme-toggle");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    btn.innerHTML = "☀️";
    btn.title = "Switch to light mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerHTML = "🌙";
    btn.title = "Switch to dark mode";
    localStorage.setItem("theme", "light");
  }
}

function initTheme() {
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("DOMContentLoaded", function () {
      const theme = localStorage.getItem("theme");
      const body = document.body;
      const btn = document.getElementById("theme-toggle");

      if (btn) {
        if (theme === "dark") {
          body.classList.add("dark-mode");
          btn.innerHTML = "☀️";
          btn.title = "Switch to light mode";
        } else {
          btn.innerHTML = "🌙";
          btn.title = "Switch to dark mode";
        }
      }
    });
  }
}

initTheme();

let left = "";
let operator = "";
let right = "";
let steps = [];
const MAX_STEPS = 6;

function appendToResult(value) {
  currentExpression += value.toString();
  updateResult();
}

function bracketToResult(value) {
  currentExpression += value;
  updateResult();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateResult();
}

function operatorToResult(value) {
  if (value === "^") {
    currentExpression += "**";
  } else {
    currentExpression += value;
  }
  updateResult();
}

function clearResult() {
  currentExpression = "";
  updateResult();
}

function normalizeExpression(expr) {
  return expr
    .replace(/asin\(/g, "asinDeg(")
    .replace(/acos\(/g, "acosDeg(")
    .replace(/atan\(/g, "atanDeg(")
    .replace(/sin\(/g, "sinDeg(")
    .replace(/cos\(/g, "cosDeg(")
    .replace(/tan\(/g, "tanDeg(")
    .replace(/asinh\(/g, "asinh(")
    .replace(/sinh\(/g, "sinh(")
    .replace(/\be\b/g, "Math.E")
    .replace(/\bpi\b/g, "Math.PI");
}

function tokenize(expr) {
  var tokens = [];
  var i = 0;
  while (i < expr.length) {
    var ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (
      /\d/.test(ch) ||
      (ch === "." && i + 1 < expr.length && /\d/.test(expr[i + 1]))
    ) {
      var num = "";
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      if (i < expr.length && /[eE]/.test(expr[i])) {
        num += expr[i];
        i++;
        if (i < expr.length && /[+-]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        while (i < expr.length && /\d/.test(expr[i])) {
          num += expr[i];
          i++;
        }
      }
      tokens.push({ type: "NUMBER", value: parseFloat(num) });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      var ident = "";
      while (i < expr.length && /[a-zA-Z_.]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }
      if (ident === "Math.E") {
        tokens.push({ type: "NUMBER", value: Math.E });
      } else if (ident === "Math.PI") {
        tokens.push({ type: "NUMBER", value: Math.PI });
      } else {
        tokens.push({ type: "FUNCTION", value: ident });
      }
      continue;
    }
    if (ch === "*" && i + 1 < expr.length && expr[i + 1] === "*") {
      tokens.push({ type: "OPERATOR", value: "**" });
      i += 2;
      continue;
    }
    if ("+-*/%".indexOf(ch) !== -1) {
      tokens.push({ type: "OPERATOR", value: ch });
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "LPAREN" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN" });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function applyFunction(name, arg) {
  var rad = Math.PI / 180;
  switch (name) {
    case "sinDeg":
      return Math.sin(arg * rad);
    case "cosDeg":
      return Math.cos(arg * rad);
    case "tanDeg":
      return Math.tan(arg * rad);
    case "asinDeg":
      return Math.asin(arg) / rad;
    case "acosDeg":
      return Math.acos(arg) / rad;
    case "atanDeg":
      return Math.atan(arg) / rad;
    case "sinh":
      return Math.sinh(arg);
    case "asinh":
      return Math.asinh(arg);
    case "sqrt":
      return Math.sqrt(arg);
    case "log":
      return Math.log(arg);
    case "ln":
      return Math.log(arg);
    case "exp":
      return Math.exp(arg);
    case "abs":
      return Math.abs(arg);
    case "ceil":
      return Math.ceil(arg);
    case "floor":
      return Math.floor(arg);
    case "round":
      return Math.round(arg);
    default:
      throw new Error("Unknown function: " + name);
  }
}

function parseExpression(tokens) {
  var pos = 0;
  function peek() {
    return tokens[pos] || null;
  }
  function consume() {
    return tokens[pos++] || null;
  }
  function expect(type) {
    var token = consume();
    if (!token || token.type !== type) throw new Error("Expected " + type);
    return token;
  }
  function parsePrimary() {
    var token = peek();
    if (!token) throw new Error("Unexpected end");
    if (token.type === "NUMBER") {
      consume();
      return token.value;
    }
    if (token.type === "LPAREN") {
      consume();
      var val = parseBinOp();
      expect("RPAREN");
      return val;
    }
    if (token.type === "FUNCTION") {
      var name = consume().value;
      expect("LPAREN");
      var arg = parseBinOp();
      expect("RPAREN");
      return applyFunction(name, arg);
    }
    throw new Error("Unexpected token");
  }
  function parseUnary() {
    var token = peek();
    if (
      token &&
      token.type === "OPERATOR" &&
      (token.value === "-" || token.value === "+")
    ) {
      consume();
      var val = parseUnary();
      return token.value === "-" ? -val : val;
    }
    return parsePrimary();
  }
  function parsePow() {
    var left = parseUnary();
    var token = peek();
    if (token && token.type === "OPERATOR" && token.value === "**") {
      consume();
      var right = parsePow();
      return Math.pow(left, right);
    }
    return left;
  }
  function parseTerm() {
    var left = parsePow();
    var token = peek();
    while (
      token &&
      token.type === "OPERATOR" &&
      (token.value === "*" || token.value === "/" || token.value === "%")
    ) {
      consume();
      var right = parsePow();
      if (token.value === "*") left *= right;
      else if (token.value === "/") {
        if (right === 0) throw new Error("Division by zero");
        left /= right;
      } else left %= right;
      token = peek();
    }
    return left;
  }
  function parseBinOp() {
    var left = parseTerm();
    var token = peek();
    while (
      token &&
      token.type === "OPERATOR" &&
      (token.value === "+" || token.value === "-")
    ) {
      consume();
      var right = parseTerm();
      if (token.value === "+") left += right;
      else left -= right;
      token = peek();
    }
    return left;
  }
  return parseBinOp();
}

function percentToResult() {
  if (!currentExpression) return;

  var match = currentExpression.match(/(.+?)(\*\*|[+\-*/^])([0-9.]*)$/);

  if (!match) {
    var num = parseFloat(currentExpression);
    if (isNaN(num)) return;
    currentExpression = (num / 100).toString();
  } else {
    var leftPart = match[1];
    var rightPart = match[3];
    if (!rightPart) return;

    var leftVal = calculateExpression(leftPart, LAST_RESULT);
    if (leftVal === "Error") {
      leftVal = parseFloat(leftPart);
    }
    var rightVal = parseFloat(rightPart);
    if (isNaN(leftVal) || isNaN(rightVal)) return;

    var percentVal = (leftVal * rightVal) / 100;
    currentExpression = percentVal.toString();
  }

  currentExpression += "*";
  updateResult();
}

function calculateExpression(expression, lastResult) {
  try {
    var normalizedExpression = normalizeExpression(expression);

    normalizedExpression = normalizedExpression.replace(
      /\bans\b/gi,
      lastResult,
    );

    var tokens = tokenize(normalizedExpression);
    if (tokens.length === 0) throw new Error();
    var result = parseExpression(tokens);

    if (isNaN(result) || !isFinite(result)) {
      throw new Error();
    }

    return result;
  } catch (e) {
    return "Error";
  }
}

function calculateResult() {
  if (!currentExpression) return;
  var display = document.getElementById("result");
  var result = calculateExpression(currentExpression, LAST_RESULT);
  result = String(result);

  LAST_RESULT = result;

  display.value = result;

  currentExpression = result;
  updateResult();
}

function updateResult() {
  document.getElementById("result").value = currentExpression || "0";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeExpression,
    calculateExpression,
    toggleTheme,
    appendToResult,
    bracketToResult,
    backspace,
    operatorToResult,
    clearResult,
    percentToResult,
    calculateResult,
    updateResult,
    left,
    operator,
    right,
    steps,
    MAX_STEPS,
    get LAST_RESULT() {
      return LAST_RESULT;
    },
    set LAST_RESULT(v) {
      LAST_RESULT = v;
    },
    get currentExpression() {
      return currentExpression;
    },
    set currentExpression(v) {
      currentExpression = v;
    },
  };
}
