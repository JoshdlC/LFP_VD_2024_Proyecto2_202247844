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
  

## Reglas de Producción
`<Program> ::= <Statement> | <Statement> <Program>`  

`<Statement> ::= <OperacionesStatement>  `     
`| <ConfiguracionesParStatement> `  
`| <ConfiguracionesLexStatement> ` 

`<OperacionesStatement> ::= "Operaciones" "=" "[" <Operacion> "]"`  
`<Operacion> ::= "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <num> "," "valor2" ":" <num> "}"  `   
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <Operacion> "," "valor2" ":" <num> "}"  `   
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <num> "," "valor2" ":" <Operacion> "}" `  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> "," "nombre" ":" <NombreOp> ","  "valor1" ":" <Operacion> "," "valor2" ":" <Operacion> "}" `  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <Operacion> "," "valor2" ":" <Operacion> "}"`    
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <num> "," "valor2" ":" <Operacion> "}"`  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <Operacion> "," "valor2" ":" <num> "}"`  
&emsp; &emsp; ` | "{" "operacion" ":" <TipoOperacion> ","  "valor1" ":" <num> "," "valor2" ":" <num> "}"`  

`<ConfiguracionesParStatement> ::= "ConfiguracionesParser" "=" "[" <Propiedades> "]" `
`<ConfiguracionesLexStatement> ::= "ConfiguracionesLex" "=" "[" <Propiedades> "]" `  
`<Propiedades> ::= <Propiedad> | <Propiedad> "," <Propiedades> `   
`<Propiedad> ::= <Fondo> | <Fuente> | <Forma> | <TipoFuente>`  
`<Fondo> ::= "fondo:" <Color>`
`<Fuente> ::= "fuente:" <Color> `  
`<Forma> ::= "forma:" <TipoForma> `  
`<TipoFuente> ::= "tipoFuente:" <NombreFuente> `  
`<Color> ::=  "\"#\"" <Digito> <Digito> <Digito> <Digito> <Digito> <Digito>`  
`<TipoForma> ::= "\"box\"" | "\"diamond\"" | "\"circle\"" `  
`<NombreFuente> ::= "\"Times-Roman\"" | "\"Arial\"" |  `

` `