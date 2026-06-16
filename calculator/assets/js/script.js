let LAST_RESULT = 0;
var currentExpression = "";
var KNOWN_FUNCTIONS = new Set([
  "sinDeg",
  "cosDeg",
  "tanDeg",
  "asinDeg",
  "acosDeg",
  "atanDeg",
  "sinh",
  "asinh",
  "sqrt",
  "log",
  "ln",
  "exp",
  "abs",
  "ceil",
  "floor",
  "round",
  "deriv",
  "integral",
]);

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
      } else if (KNOWN_FUNCTIONS.has(ident)) {
        tokens.push({ type: "FUNCTION", value: ident });
      } else {
        tokens.push({ type: "VARIABLE", value: ident });
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
    if (ch === ",") {
      tokens.push({ type: "COMMA" });
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

function evaluateDerivative(exprTokens, varName, point) {
  var h = 1e-8;
  var varsPlus = {};
  varsPlus[varName] = point + h;
  var f_plus = parseExpression(exprTokens, varsPlus);
  var varsMinus = {};
  varsMinus[varName] = point - h;
  var f_minus = parseExpression(exprTokens, varsMinus);
  return (f_plus - f_minus) / (2 * h);
}

function evaluateIntegral(exprTokens, varName, a, b) {
  var n = 1000;
  var h = (b - a) / n;
  var vars = {};
  var sum = 0;
  vars[varName] = a;
  sum += parseExpression(exprTokens, vars);
  vars[varName] = b;
  sum += parseExpression(exprTokens, vars);
  for (var i = 1; i < n; i++) {
    vars[varName] = a + i * h;
    var val = parseExpression(exprTokens, vars);
    sum += (i % 2 === 1 ? 4 : 2) * val;
  }
  return (sum * h) / 3;
}

function parseExpression(tokens, varValues) {
  var pos = 0;
  var vars = varValues || {};
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
  function collectTokensUntilComma() {
    var collected = [];
    var depth = 0;
    while (pos < tokens.length) {
      var t = tokens[pos];
      if (t.type === "LPAREN") depth++;
      if (t.type === "RPAREN") {
        if (depth === 0) break;
        depth--;
      }
      if (depth === 0 && t.type === "COMMA") break;
      collected.push(t);
      pos++;
    }
    return collected;
  }
  function parsePrimary() {
    var token = peek();
    if (!token) throw new Error("Unexpected end");
    if (token.type === "NUMBER") {
      consume();
      return token.value;
    }
    if (token.type === "VARIABLE") {
      consume();
      if (token.value in vars) {
        return vars[token.value];
      }
      throw new Error("Unknown variable: " + token.value);
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
      if (name === "deriv") {
        var exprTokens = collectTokensUntilComma();
        expect("COMMA");
        var varToken = peek();
        if (!varToken || varToken.type !== "VARIABLE")
          throw new Error("Expected variable name");
        consume();
        var varName = varToken.value;
        expect("COMMA");
        var point = parseBinOp();
        expect("RPAREN");
        return evaluateDerivative(exprTokens, varName, point);
      }
      if (name === "integral") {
        exprTokens = collectTokensUntilComma();
        expect("COMMA");
        varToken = peek();
        if (!varToken || varToken.type !== "VARIABLE")
          throw new Error("Expected variable name");
        consume();
        varName = varToken.value;
        expect("COMMA");
        var a = parseBinOp();
        expect("COMMA");
        var b = parseBinOp();
        expect("RPAREN");
        return evaluateIntegral(exprTokens, varName, a, b);
      }
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

function calculateExpression(expression, lastResult, vars) {
  try {
    var normalizedExpression = normalizeExpression(expression);

    if (lastResult !== undefined && lastResult !== null) {
      normalizedExpression = normalizedExpression.replace(
        /\bans\b/gi,
        lastResult,
      );
    }

    var tokens = tokenize(normalizedExpression);
    if (tokens.length === 0) throw new Error();
    var result = parseExpression(tokens, vars);

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
    evaluateDerivative,
    evaluateIntegral,
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
