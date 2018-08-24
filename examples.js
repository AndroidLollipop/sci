var e = require("./simpleAndCleanInterfaceForRepl.js")
var repl = e.getRepl()
var youClod = (x) => console.log(require("util").inspect(x, { showHidden: false, depth: null }))
console.log(repl("(123*456)+(789*0.12)"))
console.log(repl("num camila = 5"))
console.log(repl("camila"))
console.log(repl("num young = 7+3*6"))
console.log(repl("young"))
console.log(repl("num havana = camila + young"))
console.log(repl("havana"))
console.log(repl("str youAre = 'autistic'"))
console.log(repl("((1+2)*(3+(4*5)))+havana"))
console.log(repl("1+2-3+4-5"))
console.log(repl("7+3*6*7*9"))
console.log(repl("7*3+6*7*9"))
console.log(repl("7+7+8*3+5*3+3"))
console.log(repl("7+7+8*3+5*3+3/3"))
console.log(repl("(7+7+8*3+5*3+3/3)/3"))
console.log(repl("-7+4"))
console.log(repl("4+-7*2"))
console.log(repl("-6+3*-(1+3*3+-(5*3+1))"))
youClod(repl("num potato(p1, p2, p3){num skye = 1;num scotland = 2; return p1+p2+p3+skye+scotland}"))
console.log(repl("potato(1,2,3)"))
console.log(repl("num famine(p1, p2, p3){num skye = 1;num scotland = 2; num add(p1, p2, p3, p4, p5){return p1+p2+p3+p4+p5}; return add(p1,p2,p3,skye,scotland)}"))
console.log(repl("famine(1,2,3)"))
console.log(repl("num closure(multiplier, start){num add(){skye = skye + 1; return skye*multiplier}; num skye = start/multiplier-1; return add}")) // no ++ or += yet, unfortunately
console.log(repl("num    parserReliabilityTest    (  multiplier  , start  )    {   num add  ()  {  skye = skye + 1   ; return skye  *  multiplier  }   ; num skye = start  /  multiplier  -  1  ; return add }  ")) // no ++ or += yet, unfortunately
console.log(repl("num clo = closure(1, 10)"))
console.log(repl("num ver = closure(2, 20)"))
console.log(repl("clo()"))
console.log(repl("ver()"))
console.log(repl("clo()"))
console.log(repl("ver()"))
console.log(repl("clo()"))
console.log(repl("ver()"))
console.log(repl("num rte = parserReliabilityTest (  2  * 3   , 8 * 4   )"))
console.log(repl("rte()"))
console.log(repl("rte()"))
// skye is trapped
console.log(repl("skye"))
console.log(repl("num slowFibonacci(n){if(n < 3){return 1};return slowFibonacci(n-1)+slowFibonacci(n-2)}"))
console.log(repl("slowFibonacci(10)"))
console.log(repl("(if (slowFibonacci(10)==55){1}else{2})+1"))
console.log(repl("if (slowFibonacci(10)==55){1}else{2}"))
console.log(repl("(if (slowFibonacci(10)==55){1}else{2})"))
console.log(repl("num s(n){if(n<3){1}else{s(n-1)+s(n-2)}}"))
console.log(repl("num res = s(10)"))
console.log(repl("if(res==55){1}else{2}"))
console.log(repl("if(res==55){1}else{2}+1"))
console.log(repl("num k = 0"))
console.log(repl("while(k<10){k=k+1}"))