# Gramática Libre de Contexto

## Símbolos Terminales
* Operaciones
* "valor1"
* "valor2"
* "operacion"
* "suma"
* "resta"
* "multiplicacion"
* "division"
* "potencia"
* "raiz"
* "inverso"
* "seno"
* "coseno"
* "tangente"
* "mod"
* "nombre"
* ConfiguracionesLex
* ConfiguracionesParser
* fondo
* fuente
* forma
* tipoFuente
* :
* ,
* Limitadores ({, }, [, ], (, ))
* =

## Símbolos No Terminales

* Program
* Statement
* Operacion
* TipoOperacion
* Term
* Factor
* ConfiguracionesLexStatement
* ConfiguracionesParStatement
* OperacionesStatement
* NombreOp
* Propiedades
* Propiedad
* Fondo
* Fuente
* Forma
* TipoFuente
* Color
* TipoForma
* NombreFuente
* Digito
* InstruccionesStatement
* TipoReporte
* Imprimir
* Conteo
* Promedio
* Max
* Min
* GenerarReporte
* ParaReporte
  

## Reglas de Producción
`<Program> ::= <Statement> | <Statement> <Program>`  

`<Statement> ::= <OperacionesStatement> <ConfiguracionesLexStatement> <ConfiguracionesParStatement> <InstruccionesStatement>` 

`<OperacionesStatement> ::= "Operaciones" "=" "[" <Operacion> "]"`  
`<Operacion> ::= "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <num> "," "valor2" ":" <num> "}"  `   
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <Operacion> "," "valor2" ":" <num> "}"  `   
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <num> "," "valor2" ":" <Operacion> "}" `  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <Operacion> "," "valor2" ":" <Operacion> "}" `  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <Operacion> "," "valor2" ":" <Operacion> "}"`    
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <num> "," "valor2" ":" <Operacion> "}"`  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <Operacion> "," "valor2" ":" <num> "}"`  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <num> "," "valor2" ":" <num> "}"`  
`<TipoOperacion> ::= "suma" | "resta" | "multiplicacion" | "division" | "potencia" | "raiz" | "inverso" | "seno" | "coseno" | "tangente" | "mod" `

`<ConfiguracionesLexStatement> ::= "ConfiguracionesLex" "=" "[" <Propiedades> "]" `  
`<ConfiguracionesParStatement> ::= "ConfiguracionesParser" "=" "[" <Propiedades> "]" `
`<Propiedades> ::= <Propiedad> | <Propiedad> "," <Propiedades> `   
`<Propiedad> ::= <Fondo> | <Fuente> | <Forma> | <TipoFuente>`  
`<Fondo> ::= "fondo:" <Color>`
`<Fuente> ::= "fuente:" <Color> `  
`<Forma> ::= "forma:" <TipoForma> `  
`<TipoFuente> ::= "tipoFuente:" <NombreFuente> `  
`<Color> ::=  "\"#\"" <Digito> <Digito> <Digito> <Digito> <Digito> <Digito>`  
`<TipoForma> ::= "\"box\"" | "\"diamond\"" | "\"circle\"" `  
`<NombreFuente> ::= "\"Times-Roman\"" | "\"Arial\""   `

`<InstruccionesStatement> ::= <Instruccion> <Instrucciones> | <Instruccion>`
`<Instruccion> ::= <Imprimir> | <Conteo> | <Promedio> | <Max> | <Min> | <GenerarReporte>`  
`<Imprimir> ::= "imprimir" "(" <Cadena> ")" `     
`<Conteo> ::= "conteo" "(" ")" `  
`<Promedio> ::= "promedio" "(" <TipoOperacion> ")" `  
`<Max> ::= "max" "(" <TipoOperacion> ")" `  
`<Min> ::= "min" "(" <TipoOperacion> ")" `  
`<GenerarReporte> ::= "generarReporte" "(" <ParaReporte> ")" | "generarReporte" "(" ")" `   
`<ParaReporte> ::= <TipoReporte> | <TipoReporte> "," <Cadena>  `   
`<TipoReporte> ::= "errores" | "tokens" | "arbol"`   
`<Cadena> ::= "\"" <Caracteres> "\"" `  
`<Caracteres> ::= <Caracter> <Caracteres> | <Caracter>`  
` <Caracter> ::= <Letra> | <num> `    
`<Letra> ::= "A" | "B" | "C" | ... | "Z" | "a" | "b" | "c" | ... | "z"`  
` <num> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"` 
