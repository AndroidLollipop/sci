// named after Prelude from Haskell
const a = require("./astEval.js")
const setTimeoutArray = [] // mutating consts is fine, only assigning to them is forbidden
const setTimeoutShim = (fn, timeout) => {
    return setTimeoutArray.push(setTimeout(fn, timeout))-1
}
const clearTimeoutShim = (id) => setTimeoutArray[id] !== undefined ? clearTimeout(setTimeoutArray[id]) : undefined
const flattenArray = (array) => {
    var res = "["
    for (var i = 0; i < array.array.length; i++) {
        if (array.array[i].type == "array") {
            ret = flattenArray(array.array[i])
            res += ret
        }
        else if (array.array[i].type == "function") {
            res += "Function"
        }
        else if (array.array[i].type == "string") {
            res += '"' + array.array[i].value + '"'
        }
        else if (array.array[i].value !== undefined) {
            res += array.array[i].value
        }
        else {
            res += array.array[i].type
        }
        if (i < (array.array.length - 1)) {
            res += ", "
        }
    }
    return res + "]"
}
const Prelude = {
    print: {
        type: "function",
        parentScope: a.emptyScope(), // it's unnecessary to define parentScope, () => {} * 3 is fine, but whatever honestly
        parameters: { type: "parameter declaration", canonicalString: "(x)", // canonicalString is unnecessary, i'm including it to make builtins consistent with regular functions
            children: [{ type: "identifier", canonicalString: "x", children: []}] // canonicalString is necessary here as it defines the parameters for the builtin
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALCONSOLELOG(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                if (x !== undefined) {
                    if (x.value !== undefined) {
                        console.log(x.value)
                    }
                    else if (x.type == "array") {
                        console.log(flattenArray(x))
                    }
                    else if (x.type == "function") {
                        console.log("Function")
                    }
                    else {
                        console.log(x.type)
                    }
                }
                return x
            }}]
        }
    },
    typeOf: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x)", // canonicalString is unnecessary, i'm including it to make builtins consistent with regular functions
            children: [{ type: "identifier", canonicalString: "x", children: []}] // canonicalString is necessary here as it defines the parameters for the builtin
        },
        body: {
            type: "function body",
            canonicalString: "{return RUNTIMETYPEOF(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                return x !== undefined && x.type !== undefined ? { type: "string", value: x.type } : { type: "void" }
            }}]
        }
    },
    void : { type: "void" },
    mathSin: {
        type: "function",
        parentScope: a.emptyScope(), // it's unnecessary to define parentScope, () => {} * 3 is fine, but whatever honestly
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALTRIGSIN(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                return x !== undefined && x.type == "number" ? { type: "number", value: Math.sin(x.value) } : { type: "void" }
            }}]
        }
    },
    mathPi: {
        type: "number",
        value: Math.PI
    },
    arrayLength: {
        type: "function",
        parentScope: a.emptyScope(), // it's unnecessary to define parentScope, () => {} * 3 is fine, but whatever honestly
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return ARRAYLENGTH(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                return x !== undefined && x.type == "array" ? { type: "number", value: x.array.length } : { type: "void" }
            }}]
        }
    },
    arrayPush: {
        type: "function",
        parentScope: a.emptyScope(), // it's unnecessary to define parentScope, () => {} * 3 is fine, but whatever honestly
        parameters: { type: "parameter declaration", canonicalString: "(x,y)",
            children: [{ type: "identifier", canonicalString: "x", children: []}, { type: "identifier", canonicalString: "y", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return ARRAYPUSH(x,y)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                var y = scopeGetter("y")
                return x !== undefined && x.type == "array" ? (x.array.push(y),y) : { type: "void" }
            }}]
        }
    },
    setTimeout: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x,y)",
            children: [{ type: "identifier", canonicalString: "x", children: []}, { type: "identifier", canonicalString: "y", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALSETTIMEOUT(x,y)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                var y = scopeGetter("y")
                return x !== undefined && x.type == "function" && y !== undefined && y.type == "number" ? { type: "number", value: setTimeoutShim(() => a.evaluateExpression(x.parentScope)(x.body), y.value)} : { type: "void" }
            }}]
        }
    },
    clearTimeout: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALCLEARTIMEOUT(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                return x !== undefined && x.type == "number" ? (clearTimeoutShim(x.value), { type: "void" }) : { type: "void" }
            }}]
        }
    },
    stringify: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALSTRINGIFY(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                if (x !== undefined) {
                    if (x.value !== undefined) {
                        return { type: "string", value: x.value+"" }
                    }
                    else if (x.type == "array") {
                        return { type: "string", value: flattenArray(x) }
                    }
                    else if (x.type == "function") {
                        return { type: "string", value: "Function" }
                    }
                    else {
                        return { type: "string", value: x.type }
                    }
                }
                return { type: "string", value: "undefined" }
            }}]
        }
    },
    parseFloat: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALPARSEFLOAT(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                if (x !== undefined && x.type == "string") {
                    var res = parseFloat(x.value)
                    if (res !== NaN) {
                        return { type: "number", value: res }
                    }
                }
                return { type: "void" }
            }}]
        }
    },
    parseInt: {
        type: "function",
        parentScope: a.emptyScope(),
        parameters: { type: "parameter declaration", canonicalString: "(x)",
            children: [{ type: "identifier", canonicalString: "x", children: []}]
        },
        body: {
            type: "function body",
            canonicalString: "{return EXTERNALPARSEINT(x)}",
            children: [{ type: "!!!BUILTIN", builtin: ([scopeGetter, scopeSetter, scopeDefiner]) => {
                var x = scopeGetter("x")
                if (x !== undefined && x.type == "string") {
                    var res = parseInt(x.value)
                    if (res !== NaN) {
                        return { type: "number", value: res }
                    }
                }
                return { type: "void" }
            }}]
        }
    }
}
module.exports = {
    Prelude: Prelude
}