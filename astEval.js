// see tokparse.js for ast definition
// i haven't defined the ast properly yet so i can't write asteval yet
var operate = (p1, op, p2) => {
    if (op.canonicalString == "+") {
        if (p1.type == p2.type) {
            return { type: p1.type, value: p1.value + p2.value }
        }
    }
    else if (op.canonicalString == "-") {
        if (p1.type == p2.type) {
            return { type: p1.type, value: p1.value - p2.value }
        }
        
    }
    else if (op.canonicalString == "*") {
        if (p1.type == p2.type) {
            return { type: p1.type, value: p1.value * p2.value }
        }

    }
    else if (op.canonicalString == "/") {
        if (p1.type == p2.type) {
            return { type: p1.type, value: p1.value / p2.value }
        }

    }
    return undefined
}
var emptyScope = () => {
    var scopeDict = {}
    return ([(name) => scopeDict[name], (name, value) => scopeDict[name] = value, (name, value) => scopeDict[name] = value])
}
var adjoinScope = ([scopeGetter, scopeSetter, scopeDefiner]) => ([newScopeGetter, newScopeSetter, newScopeDefiner]) => {
    return ([(name) => {
        if (newScopeGetter(name) == undefined) {
            return scopeGetter(name)
        }
        return newScopeGetter(name)
    }, (name, value) => {
        if (newScopeGetter(name) == undefined) {
            return scopeSetter(name, value)
        }
        return newScopeSetter(name, value)
    }, newScopeDefiner])
} // i imagine this is how scope is implemented in javascript, and that explains why setting an undeclared variable makes it global
var defineInScope = ([parentScopeGetter, parentScopeSetter, parentScopeDefiner]) => (identifiers) => ([scopeGetter, scopeSetter, scopeDefiner]) => (expressions) => {
    for (var i = 0; i < identifiers.children.length; i++) {
        if (expressions.children[i] == undefined) {
            return undefined
        }
        scopeDefiner(identifiers.children[i].canonicalString, evaluateExpression([parentScopeGetter, parentScopeSetter, parentScopeDefiner])(expressions.children[i]))
    }
}
var collapseString = (nodeChildren) => {
    var ret = ""
    nodeChildren.map(x => x.type == "alphanumeric literal" ? ret += x.canonicalString: x.canonicalString == "\\" ? ret += "\\" : x.canonicalString == "n" ? ret += "\n" : ret += x.canonicalString)
    return ret
}
var evaluateExpression = ([scopeGetter, scopeSetter, scopeDefiner]) => (expression) => {
    if (expression.type == "function declaration") {
        scopeDefiner(expression.children.filter((x) => x.type == "identifier")[0].canonicalString, { type: "function", parentScope: [scopeGetter, scopeSetter, scopeDefiner], parameters: expression.children.filter((x) => x.type == "parameter declaration")[0], body: expression.children.filter((x) => x.type == "function body")[0]})
        return scopeGetter(expression.children.filter((x) => x.type == "identifier")[0].canonicalString)
    }
    else if (expression.type == "if expression" || expression.type == "if else expression") {
        var [L, C, R] = expression.children[0].children
        L = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(L)
        R = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(R)
        if (L.type !== "number" || R.type !== "number") {
            return { type: "void" }
        }
        if (C.canonicalString == "==") {
            if (L.value == R.value) {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[1])
            }
            else if (expression.type == "if else expression") {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[2])
            }
        }
        else if (C.canonicalString == ">") {
            if (L.value > R.value) {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[1])
            }
            else if (expression.type == "if else expression") {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[2])
            }
        }
        else if (C.canonicalString == "<") {
            if (L.value < R.value) {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[1])
            }
            else if (expression.type == "if else expression") {
                return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[2])
            }
        }
        return { type: "void "}
    }
    else if (expression.type == "function call") {
        var target = scopeGetter(expression.children.filter((x) => x.type == "identifier")[0].canonicalString)
        var targetScope = adjoinScope(target.parentScope)(emptyScope())
        defineInScope([scopeGetter, scopeSetter, scopeDefiner])(target.parameters)(targetScope)(expression.children.filter((x) => x.type == "function call bindings")[0])
        var expRes = evaluateExpression(targetScope)(target.body)
        if (expRes.type !== "!!!INTERNAL INTERPRETER CONTROL" || expRes.control !== "return") { // someone is trying to trick us
            return undefined
        }
        return expRes.value
    }
    else if (expression.type == "function body") {
        var expRes
        for (var i = 0; i < expression.children.length; i++) {
            expRes = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[i])
            if (expRes.type == "!!!INTERNAL INTERPRETER CONTROL") {
                return expRes
            }
        }
        return { type: "!!!INTERNAL INTERPRETER CONTROL", control: "return", value: expRes } // functions implicitly return, only {} returns undefined
    }
    else if (expression.type == "return statement") {
        var expRes = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[0])
        return { type: "!!!INTERNAL INTERPRETER CONTROL", control: "return", value: expRes } // this could be a source of vulnerabilities, damn
    }
    else if (expression.type == "variable declaration") {
        var expRes = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[3])
        scopeDefiner(expression.children.filter((x) => x.type == "identifier")[0].canonicalString, expRes)
        return expRes
    }
    else if (expression.type == "variable set") {
        var expRes = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[2])
        scopeSetter(expression.children.filter((x) => x.type == "identifier")[0].canonicalString, expRes)
        return expRes
    }
    else if (expression.type == "parenthesized expression") {
        if (expression.children[0] == undefined) {
            return undefined
        }
        return evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[0])
    }
    else if (expression.type == "expression") {
        if (expression.children[0] == undefined) {
            return undefined
        }
        var acc = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[0])
        for (var i = 1; i < expression.children.length; i+=2) {
            acc = operate(acc, expression.children[i], evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[i+1]))
        }
        return acc
    }
    else if (expression.type == "negated literal") {
        if (expression.children[0] == undefined) {
            return undefined
        }
        var expRes = evaluateExpression([scopeGetter, scopeSetter, scopeDefiner])(expression.children[0])
        if (expRes.type !== "number") {
            return undefined
        }
        return { type: "number", value: -expRes.value }
    }
    else if (expression.type == "float literal") {
        return { type: "number", value: parseFloat(expression.canonicalString) } // technically i'm not supposed to do this
    }
    else if (expression.type == "integral literal") {
        return { type: "number", value: parseInt(expression.canonicalString) }
    }
    else if (expression.type == "string literal") {
        return { type: "string", value: collapseString(expression.children) }
    }
    else if (expression.type == "identifier") {
        return scopeGetter(expression.canonicalString)
    }
}
module.exports = {
    evaluateExpression: evaluateExpression,
    emptyScope: emptyScope,
    adjoinScope: adjoinScope
}