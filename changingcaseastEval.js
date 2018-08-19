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
var evaluateExpression = (scopeGetter, scopeSetter) => (expression) => {
    if (expression.type == "variable declaration") {

    }
    else if (expression.type == "parenthesized expression") {
        if (expression.children[0] == undefined) {
            return undefined
        }
        return evaluateExpression(scopeGetter, scopeSetter)(expression.children[0])
    }
    else if (expression.type == "expression") {
        if (expression.children[0] == undefined) {
            return undefined
        }
        var acc = evaluateExpression(scopeGetter, scopeSetter)(expression.children[0])
        for (var i = 1; i < expression.children.length; i+=2) {
            acc = operate(acc, expression.children[i], evaluateExpression(scopeGetter, scopeSetter)(expression.children[i+1]))
        }
        return acc
    }
    else if (expression.type == "float literal") {
        return { type: "number", value: parseFloat(expression.canonicalString) } // technically i'm not supposed to do this
    }
    else if (expression.type == "integral literal") {
        return { type: "number", value: parseInt(expression.canonicalString) }
    }
    else if (expression.type == "identifier") {
        return scopeGetter(expression.canonicalString)
    }
}
module.exports = {
    evaluateExpression: evaluateExpression
}