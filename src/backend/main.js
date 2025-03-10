const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;
const cors = require('cors');
const { exec } = require('child_process');

const Lexema = require('./lexema');
const Error = require('./error');
const Configuraciones = require('./configuraciones');
const Operacion = require('./operacion');
const { config } = require('process');

// const { analizadorLexico } = require('./analizadorLexico');
// const analizadorSintactico  = require('./analizadorSinc');

// Middleware
app.use(express.json()); // Para analizar JSON en el cuerpo de la solicitud0
app.use(bodyParser.urlencoded({ extended: true }));

// Habilitar CORS para todas las rutas
app.use(cors());

// Variables globales
let datosGlobalString = '';
let datosGlobalFile = '';
let lexemas = [];
let errores = [];
let operacionesArray = [];
let textoSinErrores = '';
let configuraciones = {};
let configLex = [];
let configPar = [];
let operacionesGlobal = [];

let contadorComas = 0;
let contadorCorchetesCierre = 0;
let contadorCorchetesApertura = 0;
let contadorParentesisCierre = 0;
let contadorParentesisApertura = 0;
let contadorLlavesCierre = 0;
let contadorLlavesApertura = 0;
let contadorComillasDobles = 0;


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

let letrasTilde = [160, 130, 161, 162, 163, 181, 144, 214, 224, 233]; //? letras con tilde en ASCII

// Endpoint para cargar archivo
app.post('/cargarArchivo', upload.single('file'), (req, res) => {
    
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
    }
    res.status(200).json({ message: 'Archivo cargado exitosamente', file });

    fs.readFile(file.path, 'utf-8', (error, data) => {
        if (error) {
            return res.status(500).json({ error: 'Error al leer el archivo', detalles: error.message });
        }
        datosGlobalFile = data;
    });
});



// Endpoint para analizar archivo
app.post('/analizarTexto', (req, res) => {
    if (!datosGlobalFile) {
        return res.status(400).json({ error: 'No hay archivo cargado para analizar' });
    }
    console.log('Analizando archivo...');
    try {
        lexemas = []; // Reiniciar lexemas
        errores = []; // Reiniciar errores

        analizadorLexico(datosGlobalFile);
        // generarReportesHTML();
        // analizadorSintactico(textoSinErrores);
        
        console.log(textoSinErrores);
        res.status(200).json({ message: 'Análisis completado', lexemas, errores });
    } catch (error) {
        console.error('Error al analizar texto:', error);
        res.status(500).json({ error: 'Error al analizar texto', detalles: error.message });
    }
});

// Endpoint para generar archivo de errores
app.post('/generarErrores', (req, res) => {
    if (errores.length === 0) {
        return res.status(200).json({ message: 'No se encontraron errores léxicos' });
    }

    const erroresConTipo = errores.map((error, index) => {
        return { numero: index + 1, ...error, tipo: 'error léxico' };
    });

    fs.writeFileSync('errores.json', JSON.stringify(erroresConTipo, null, 2));
    res.status(200).json({ message: 'Archivo de errores generado', errores: erroresConTipo });
});




app.post('/generarReportes', (req, res) => {
    if (lexemas.length === 0 && errores.length === 0) {
        return res.status(400).json({ error: 'No se han realizado análisis léxicos' });
    }
    try {
    // generarReportesHTML();
        generarReportesGraphviz();
        res.status(200).json({ message: 'Reportes generados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reportes', detalles: error.message });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor en línea, Bienvenido a NodeLex' });
});




//! Analizador léxico   
function analizadorLexico(texto) {
    const palabrasReservadas = [
        'Operaciones', 'operacion', 'valor1', 'valor2', 'nombre',
        'ConfiguracionesLex', 'texto', 'fondo', 'fuente', 'forma', 'tipoFuente', 'ConfiguracionesParser', 
        'suma', 'resta', 'potencia', 'multiplicacion', 'division', 'raiz', 'inverso', 'seno', 'coseno', 'tangente', 'mod', 'promedio', 'max', 'min', 'conteo', 'imprimir', 'generarReporte', 
        'red', 'blue', 'yellow', 'black', 'white', 'circle', 'box', 'diamond'
    ];


    let fila=1;
    let columna = 1;
    let contador = 0;
    const archivoLimpio = fs.createWriteStream('archivoLimpio.nlex'); //* Crear archivo limpio para escribirlo


    console.log()
    console.log("Analizando archivo...")

    console.log(texto)
    console.log('--------------------------------------')
    console.log('Largo del texto: ', texto.length)
    console.log("Antes del while")
    while (contador < texto.length) {
        // Obtenemos el char actual
        let codigo = texto.charCodeAt(contador);

        //* Ignoramos espacios en blanco
        if (codigo === 32) {
            contador++;
            columna++;
            archivoLimpio.write(' ');
            continue;
        }

        //* Ignoramos saltos de línea
        else if (codigo === 10 || codigo === 13) {
            if (codigo === 10){
                fila++;
                columna = 1;
                archivoLimpio.write('\n');
            }
            // fila++;

            contador++;
            console.log(`Salto de línea detectado. Línea actual: ${fila}`);
            
            continue;
        }

        //* Ignoramos tabulaciones
        else if (codigo === 9) {
            contador++;
            columna=columna+4;
            archivoLimpio.write('\t');
            continue;
        }

        //? Si es un dígito
        else if (codigo >= 48 && codigo <= 57) {
            console.log("Es un número")
            let numero = '';
            while ((codigo >= 48 && codigo <= 57) || codigo === 46) { //* Incluimos el punto decimal en la condición
                numero += texto[contador];
                contador++;
                columna++;
                codigo = texto.charCodeAt(contador);
            }
            lexemas.push(new Lexema('Número', numero, fila, columna));
            textoSinErrores += numero;
            archivoLimpio.write(numero);
            if (texto.charCodeAt(contador) === 44) { //* Si encontramos una coma
                lexemas.push(new Lexema('Coma', ',', fila, columna));
                // fila++; //* Aumentamos la fila
                columna = 1; //* Reiniciamos la columna
                contador++; //* Avanzamos el contador para saltar la coma
                textoSinErrores += ',';
                archivoLimpio.write(',');
            } else if (texto.charCodeAt(contador) !== 46 && texto.charCodeAt(contador) !== 44) { //* Si no es un punto ni un espacio en blanco
                // fila++; //* Aumentamos la fila
            }
        }

        //? Si es una letra
        else if ((codigo >= 65 && codigo <= 90) || (codigo >= 97 && codigo <= 122) || letrasTilde.includes(codigo)) {
            console.log("Es una letra")
            let palabra = '';
            while ((codigo >= 65 && codigo <= 90) || (codigo >= 97 && codigo <= 122) || letrasTilde.includes(codigo)) {
                palabra += texto[contador];
                contador++;
                columna++;
                codigo = texto.charCodeAt(contador);
            }

            if (palabrasReservadas.includes(palabra)) {
                console.log('Palabra reservada: ', palabra)
                lexemas.push(new Lexema('Palabra reservada', palabra, fila, columna));
            } else {
                lexemas.push(new Lexema('Identificador', palabra, fila, columna));
            }
            textoSinErrores += palabra;
            archivoLimpio.write(palabra);
            continue;
        }

        //? Si es un operador
        // else if (codigo === 43 || codigo === 45 )   {
        //     lexemas.push(new Lexema('Operador', texto[contador], fila));
        //     textoSinErrores += texto[contador];
        //     columna++;
        //     contador++;
        // }

        // //* Si es un diagonal Se ignora por ser un comentario
        // else if (codigo === 47) {
            
        //     textoSinErrores += texto[contador];
        //     columna++;
        //     contador++;
        // }



        //* Si es un paréntesis de apertura
        else if (codigo === 40) {
            lexemas.push(new Lexema('Paréntesis de apertura', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es un paréntesis de cierre
        else if (codigo === 41) {
            lexemas.push(new Lexema('Paréntesis de cierre', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es una llave de apertura
        else if (codigo === 123) {
            lexemas.push(new Lexema('Llave de apertura', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);

            // fila++; //? Aumentamos la fila
            columna++;
            contador++;
        }

        //* Si es una llave de cierre
        else if (codigo === 125) {
            lexemas.push(new Lexema('Llave de cierre', texto[contador], fila, columna));
            if (texto.charCodeAt(contador + 1) !== 44) {
                // fila++; //? Aumentamos la fila
            }
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es un corchete de apertura
        else if (codigo === 91) {
            lexemas.push(new Lexema('Corchete de apertura', texto[contador], fila, columna));
            // fila++; //? Aumentamos la fila
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
            
        }
        
        //* Si es un corchete de cierre
        else if (codigo === 93) {
            lexemas.push(new Lexema('Corchete de cierre', texto[contador], fila, columna));
            if (texto.charCodeAt(contador + 1) !== 44) {
                // fila++; //? Aumentamos la fila
            }
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es un punto y coma
        else if (codigo === 59) {
            lexemas.push(new Lexema('Punto y coma', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es dos puntos
        else if (codigo === 58){
            lexemas.push(new Lexema('Dos puntos', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //? Si es una comilla doble
        else if (codigo === 34) {
            let cadena = '';
            
            contador++;
            codigo = texto.charCodeAt(contador);
            while (codigo !== 34) {
                cadena += texto[contador];
                contador++;
                codigo = texto.charCodeAt(contador);
            }
            columna++;
            contador++;
            codigo = texto.charCodeAt(contador);
            console.log('Cadena: ', cadena);
            if (palabrasReservadas.includes(cadena)) {
                lexemas.push(new Lexema('Palabra reservada', cadena, fila, columna));
            } else {
                lexemas.push(new Lexema('Identificador', cadena, fila, columna));
            }
            textoSinErrores += `"${cadena}"`;
            archivoLimpio.write(`"${cadena}"`);
            continue;
            
        }

        //* Si viene una coma
        else if (codigo === 44) {
            lexemas.push(new Lexema('Coma', texto[contador], fila, columna));
            // fila++; //? Aumentamos la fila
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);

            columna++;
            contador++;
        }

        //*Si viene un punto
        else if (codigo === 46){
            lexemas.push(new Lexema('Punto', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si viene un igual
        else if (codigo === 61) {
            lexemas.push(new Lexema('Igual', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            archivoLimpio.write(texto[contador]);
            columna++;
            contador++;
        }

        //* Si es un comentario simple
        else if (codigo === 47 && texto.charCodeAt(contador + 1) === 47) {
            while (contador < texto.length && texto.charCodeAt(contador) !== 10) {
                contador++;
            }
            fila++;
            columna = 1;
            archivoLimpio.write('\n');
            contador++;
        }

        //* Si es un comentario de bloque
        else if ((codigo === 47 && texto.charCodeAt(contador + 1) === 42) || (codigo === 42 && texto.charCodeAt(contador + 1) === 47)) {
            contador += 2;
            while (contador < texto.length && (texto.charCodeAt(contador) !== 42 || texto.charCodeAt(contador + 1) !== 47)) {
                if (texto.charCodeAt(contador) === 10) {
                    fila++;
                    columna = 1;
                    archivoLimpio.write('\n');	
                }
                contador++;
            }
            contador += 2;
        }
        /*
        */

        //* Si es un caracter no reconocido
        else {
            let valor = '';
            while (contador < texto.length && !palabrasReservadas.includes(valor) && texto[contador] !== ' ' && texto[contador] !== ',' && texto[contador] !== '\n') {
                valor += texto[contador];
                
                contador++;
            }
            if (!palabrasReservadas.includes(valor)) {
                columna++;
                errores.push(new Error('Valor no reconocido', valor, fila, columna, 'Error léxico'));
            } else {
                columna++;
                textoSinErrores += valor;
                archivoLimpio.write(valor);
                lexemas.push(new Lexema('Palabra reservada', valor, fila, columna));
            }
        }

    }


    datosGlobalFile = textoSinErrores;


    archivoLimpio.end(() => {  //* Cerrar archivo limpio
        // Leer el archivo limpio y pasar su contenido al analizador sintáctico
        fs.readFile('archivoLimpio.nlex', 'utf8', (err, data) => {
            if (err) {
                console.error('Error leyendo archivo limpio:', err);
                return;
            }
            console.log('Data del archivo: \n', data);
            try {
                analizadorSintactico(data);
                console.log('Archivo limpio cerrado');
                console.log('Terminaron los analizadores');
                console.log('Análisis completado');
                // console.log('Realizando operaciones...');
                realizarOps();
                if (operacionesGlobal.length === 0) {
                    console.log('-'.repeat(50));
                    console.log('No se encontraron operaciones');
                    console.log('-'.repeat(50));
                } else {
                    console.log('-'.repeat(50));
                    console.log('Operaciones encontradas:');
                    console.log(operacionesGlobal);
                    console.log('-'.repeat(50));
                }
            } catch (error) {
                console.log(error);
            }
        });
        
        console.log('Archivo limpio cerradox2');
    });
    console.log('Archivo limpio cerradox3');
    
}


function analizadorSintactico(texto) {
    
    
    let columna = 1;
    let fila = 1;
    let contador = 0;

    //* abrir archivo limpio para escribirlo
    
    let tipoOperacion = ['resta', 'suma', 'multiplicacion', 'division', 'potencia', 'raiz', 'inverso', 'seno', 'coseno', 'tangente', 'mod'];

    operacionesFlag = false;
    // const json = JSON.parse(texto);
    // if (!json.Operaciones) {
    //     console.log('No se encontró la clave operaciones en el archivo JSON');
    //     return;
    // }
    console.log("-".repeat(50));
    console.log("Data recibida: \n", texto);
    console.log("");
    console.log("Comenzando análisis sintáctico...");
    console.log("");

    while (contador < texto.length) {
        let codigo = texto.charCodeAt(contador);
        console.log(`Procesando carácter: ${texto[contador]} (código: ${codigo}) en posición ${contador}`); // Depuración
        console.log(`${texto[contador+1]}${texto[contador+2]}${texto[contador+3]}`)
        console.log('Analisis Sinc...')

        //* Si encuentra la O de Operaciones
        if (codigo === 79){
                        const palabra = texto.substring(contador, contador + 11);
            console.log(palabra)
            if (palabra === 'Operaciones') {
                console.log("Operaciones encontradas");
                contador += 12; // Avanza el contador después de 'Operaciones = '
                const operaciones = revisarOperacionesSinc(texto, contador);
                console.log(operaciones);

                contador += operaciones.length;
            } else {
                contador++;
            }
            
        }

        //* Si encuentra la C ya sea de ConfiguracionesLex o ConfiguracionesParser
        else if (codigo === 67 ){
            const palabra = texto.substring(contador, contador + 18);
            console.log(`${palabra} en posición ${contador}`);
            // console.log(palabra)
            if (palabra === 'ConfiguracionesLex') {
                console.log("ConfiguracionesLex encontrada");
                contador += 19;
                // contadorCorchetesApertura++;
                contador = revisarConfigs(texto, contador, 'lex'); // Actualiza el contador con el valor devuelto
            } else if (palabra === 'ConfiguracionesPar') {
                console.log("ConfiguracionesParser encontrada");
                contador += 22;
                // contadorCorchetesApertura++;
                contador = revisarConfigs(texto, contador, 'par'); // Actualiza el contador con el valor devuelto
            } else {
                console.log("Error de sintaxis: Configuración no válida");
                contador++;
            }
        }
        //* Si encuentra la i de imprimir
        else if (codigo === 105){
            const palabra = texto.substring(contador, contador + 8);
            console.log(`${palabra} en posición ${contador}`);
            contador = revisarInstr(texto, contador);
        }
        //* si encuentra p de promedio
        else if (codigo === 112 ){
            const palabra = texto.substring(contador, contador + 8);
            console.log(`${palabra} en posición ${contador}`);
            contador = revisarInstr(texto, contador);
        }
        //* si encuentra c de conteo
        else if (codigo === 99 ){
            const palabra = texto.substring(contador, contador + 6);
            console.log(`${palabra} en posición ${contador}`);
            contador = revisarInstr(texto, contador);
        }
        //* si encuentra m de max o min
        else if (codigo === 109 ){
            const palabra = texto.substring(contador, contador + 3);
            console.log(`${palabra} en posición ${contador}`);
            contador = revisarInstr(texto, contador);
        }
        //* si encuentra g de generarReporte
        else if (codigo === 103 ){
            const palabra = texto.substring(contador, contador + 14);
            contador = revisarInstr(texto, contador);
            contador = revisarInstr(texto, contador);
        }

        //* Si encuentra "
        else if (codigo === 34) { 
            contador++; //* Avanza el contador después de la comilla de apertura
            let cadena = '';
            contadorComas++;
            while (contador < texto.length && texto.charCodeAt(contador) !== 34) { // '"' en ASCII
                cadena += texto[contador];
                contador++;
            }
            if (texto.charCodeAt(contador) === 34) {
                contador++; //* Avanza el contador después de la comilla de cierre
                console.log(`Cadena encontrada: "${cadena}"`);
                contadorComas++;
            } else {
                console.log("Error de sintaxis: Falta una comilla de cierre");
                errores.push(new Error('Falta una comilla de cierre', '"', fila, columna, 'Error sintáctico'));
            }
        }
        
        //* Si encuentra numeros
        else if (codigo >= 48 && codigo <= 57) { 
            let numero = '';
            while (contador < texto.length && ((codigo >= 48 && codigo <= 57) || codigo === 46)) { // Incluye el punto decimal
                numero += texto[contador];
                contador++;
                codigo = texto.charCodeAt(contador);
            }
            console.log(`Número encontrado: ${numero}`);
        }
        //* Si encuentra :
        else if (codigo === 58){
            contador++;
        }
        //* Si encuentra (
        else if (codigo === 40){
            contadorParentesisApertura++;
            contador++;
        }
        //* Si encuentra )
        else if (codigo === 41){
            contadorParentesisCierre++;
            contador++;
        }
        //* Si encuentra [
        else if (codigo === 91){
            contador++;
            contadorCorchetesApertura++;
        }
        //* Si encuentra ]
        else if (codigo === 93){
            contadorCorchetesCierre++;
            contador++;
        }
        //* Si encuentra {
        else if (codigo === 123){
            contadorLlavesApertura++;
            contador++;
        }
        //* Si encuentra }
        else if (codigo === 125){
            contadorLlavesCierre++;
            contador++;
            
        }
        //* Si encuentra ,
        else if (codigo === 44){
            contadorComas++;
            contador++;
        }
        
        //* Si encuentra un salto de linea o un espacio sigue
        else if (codigo === 10 || codigo === 32){
            contador++;
        }
        else {
            console.log("Error de sintaxis: Caracter no reconocido");
        }
    }

    console.log('Corchetes apertura: ', contadorCorchetesApertura);
    console.log('Corchetes cierre: ', contadorCorchetesCierre);
    console.log('Parentesis apertura: ', contadorParentesisApertura);
    console.log('Parentesis cierre: ', contadorParentesisCierre);
    console.log('Llaves apertura: ', contadorLlavesApertura);
    console.log('Llaves cierre: ', contadorLlavesCierre);
    console.log('Comas: ', contadorComas);
    console.log('Comillas dobles: ', contadorComillasDobles);
    
    const diferenciaCorchetes = contadorCorchetesApertura - contadorCorchetesCierre;
    const diferenciaParentesis = contadorParentesisApertura - contadorParentesisCierre;
    const diferenciaLlaves = contadorLlavesApertura - contadorLlavesCierre;
    if (diferenciaCorchetes > 0){
        console.log("Error de sintaxis: Falta un corchete de cierre");
        errores.push(new Error(`Falta(n)  ${Math.abs(diferenciaCorchetes)} corchete(s) de cierre`, ']', 'N/A', 'N/A', 'Error sintáctico'));
    }
    else if (diferenciaCorchetes < 0){
        console.log("Error de sintaxis: Falta un corchete de apertura");
        errores.push(new Error(`Falta(n) ${Math.abs(diferenciaCorchetes)} corchete(s) de apertura`, '[', 'N/A', 'N/A', 'Error sintáctico'));
    }

    if (diferenciaParentesis > 0){
        console.log("Error de sintaxis: Falta un paréntesis de cierre");
        errores.push(new Error(`Falta(n) ${Math.abs(diferenciaParentesis)} paréntesis de cierre`, ')', 'N/A', 'N/A', 'Error sintáctico'));
    }
    else if (diferenciaParentesis < 0){
        console.log("Error de sintaxis: Falta un paréntesis de apertura");
        errores.push(new Error(`Falta(n) ${Math.abs(diferenciaParentesis)} paréntesis de apertura`, '(', 'N/A', 'N/A', 'Error sintáctico'));
    }

    if (diferenciaLlaves > 0){
        console.log("Error de sintaxis: Falta una llave de cierre");
        errores.push(new Error(`Falta(n) ${Math.abs(diferenciaLlaves)} llave de cierre`, '}', 'N/A', 'N/A', 'Error sintáctico'));
    }
    if (diferenciaLlaves < 0){
        console.log("Error de sintaxis: Falta una llave de apertura");
        errores.push(new Error(`Falta(n) ${Math.abs(diferenciaLlaves)} llave de apertura`, '{', 'N/A', 'N/A', 'Error sintáctico'));
    }
        
    if (contadorComillasDobles % 2 !== 0){
        console.log("Error de sintaxis: Falta una comilla doble");
        errores.push(new Error('Falta una comilla doble', '"', 'N/A', 'N/A', 'Error sintáctico'));
    }

    console.log('Analisís sintáctico completado');
    console.log("-".repeat(50));
    return;
}


//! Revisa operaciones anidadas
function procesarOperacionesSinc(texto, contador) {
    const operaciones = [];
    while (contador < texto.length) {
        const codigo = texto.charCodeAt(contador);

        if (codigo === 123) { // '{' en ASCII
            contador++; // Avanza el contador después de '{'
            // contadorLlavesApertura++;
            const operacion = {};
            while (contador < texto.length && texto.charCodeAt(contador) !== 125) { // '}' en ASCII
                const atributo = texto.substring(contador, texto.indexOf(':', contador)).trim();
                contador = texto.indexOf(':', contador) + 1;
                let valor;
                if (texto.charAt(contador) === '{') {
                    valor = procesarOperacionesSinc(texto, contador);
                    contador = texto.indexOf('}', contador) + 1;
                    // contadorLlavesCierre++;
                } else if (texto.charAt(contador) === '[') {
                    valor = procesarOperacionesSinc(texto, contador);
                    contador = texto.indexOf(']', contador) + 1;
                    // contadorCorchetesCierre++;
                } else {
                    const nextComma = texto.indexOf(',', contador);
                    const nextBrace = texto.indexOf('}', contador);
                    if (nextComma === -1 || nextBrace < nextComma) {
                        valor = texto.substring(contador, nextBrace).trim();
                        contador = nextBrace;
                    } else {
                        valor = texto.substring(contador, nextComma).trim();
                        contador = nextComma + 1;
                    }
                }
                operacion[atributo] = valor;
            }
            if (texto.charCodeAt(contador) !== 125) {
                throw new Error(`Error sintáctico: falta '}' en la operación`);
            }
            operaciones.push(operacion);
            contador++; // Avanza el contador después de '}'
            // contadorLlavesCierre++;
        } else {
            contador++;
        }
    }
    return operaciones;
}

//! Revisa las operaciones principales
function revisarOperacionesSinc (texto, contador){
    const operaciones = [];
    while (contador < texto.length) {
        const codigo = texto.charCodeAt(contador);

        if (codigo === 123) { // '{' en ASCII
            contador++; // Avanza el contador después de '{'
            // contadorLlavesApertura++;
            const operacion = {};
            while (contador < texto.length && texto.charCodeAt(contador) !== 125) { // '}' en ASCII
                const atributo = texto.substring(contador, texto.indexOf(':', contador)).trim();
                contador = texto.indexOf(':', contador) + 1;
                let valor;
                if (texto.charAt(contador) === '{') {
                    valor = procesarOperacionesSinc(texto, contador);
                    contador = texto.indexOf('}', contador) + 1;
                    // contadorLlavesCierre++;
                } else if (texto.charAt(contador) === '[') {
                    valor = procesarOperacionesSinc(texto, contador);
                    contador = texto.indexOf(']', contador) + 1;
                    // contadorCorchetesCierre++;
                } else {
                    const nextComma = texto.indexOf(',', contador);
                    const nextBrace = texto.indexOf('}', contador);
                    if (nextComma === -1 || nextBrace < nextComma) {
                        valor = texto.substring(contador, nextBrace).trim();
                        contador = nextBrace;
                    } else {
                        valor = texto.substring(contador, nextComma).trim();
                        contador = nextComma + 1;
                    }
                }
                operacion[atributo] = valor;
            }
            if (texto.charCodeAt(contador) !== 125) {
                throw new Error(`Error sintáctico: falta '}' en la operación`);
            }
            operaciones.push(operacion);
            contador++; //? Avanza el contador después de '}'
            // contadorLlavesCierre++;
        } else if (codigo === 91) { //* '[' en ASCII
            contador++; //? Avanza el contador después de '['
            contadorCorchetesApertura++;
        } else if (codigo === 93) { //* ']' en ASCII
            contador++; //? Avanza el contador después de ']'
            // contadorCorchetesCierre++;
        } else {
            contador++;
        }
    }
    return operaciones;
}


//? Revisa las instrucciones cargadas
function revisarInstr(texto, contador){
    console.log();
    console.log('Revisando instrucciones...');
    while (contador < texto.length) {
        const codigo = texto.charCodeAt(contador);
        //* Si encuentra la i de imprimir
        if (codigo === 105) {
            const palabra = texto.substring(contador, contador + 8);
            if (palabra === 'imprimir') {
                console.log("Imprimir encontrado");
                contador += 9;
                contadorParentesisApertura++;
                const valor = texto.substring(contador + 1, texto.indexOf(')', contador)).trim();
                console.log('Instruccion Imprimir: \n ', valor, ' \n');
                contador += valor.length + 2;
                contadorParentesisCierre++;

            }
        } else if (codigo === 99) { //* Si encuentra c de conteo
            const palabra = texto.substring(contador, contador + 6);
            if (palabra === 'conteo') {
                console.log("Conteo encontrado");
                contador += 7; // Avanza el contador después de 'conteo()'
                contadorParentesisApertura++;
                contadorParentesisCierre++;
            }
        } else if (codigo === 112) { //* si encuentra p de promedio
            const palabra = texto.substring(contador, contador + 8);
            if (palabra === 'promedio') {
                console.log("Promedio encontrado");
                contador += 9; //* Avanza el contador después de 'promedio'
                contadorParentesisApertura++;
                const valor = texto.substring(contador + 1, texto.indexOf(')', contador)).trim();
                console.log('Promedio de las operaciones: ', valor);
                contador += valor.length + 2; //* Avanza el contador después del valor y ')'
                contadorParentesisCierre++;

            }
        } else if (codigo === 109) { //* si encuentra m de max o min
            const palabra = texto.substring(contador, contador + 3);
            if (palabra === 'max') {
                console.log("Max encontrado");
                contador += 4; //* Avanza el contador después de 'max'
                contadorParentesisApertura++;
                const valor = texto.substring(contador + 1, texto.indexOf(')', contador)).trim();
                console.log('Valor: ', valor);
                contador += valor.length + 2; //* Avanza el contador después del valor y ')'
                contadorParentesisCierre++;

            } else if (palabra === 'min') {
                console.log("Min encontrado");
                contador += 4; //* Avanza el contador después de 'min'
                contadorParentesisApertura++;
                const valor = texto.substring(contador + 1, texto.indexOf(')', contador)).trim();
                console.log('Valor: ', valor);
                contador += valor.length + 2; //* Avanza el contador después del valor y ')'
                contadorParentesisCierre++;

            }
        } else if (codigo === 103) { //* si encuentra g de generarReporte
            const palabra = texto.substring(contador, contador + 14);
            if (palabra === 'generarReporte') {
                console.log("GenerarReporte encontrado");
                contador += 15; //* Avanza el contador después de 'generarReporte'
                contadorParentesisApertura++;
                const parametros = texto.substring(contador + 1, texto.indexOf(')', contador)).split(',').map(param => param.trim());
                console.log('Parámetros: ', parametros);
                contador += parametros.join(', ').length + 2; //* Avanza el contador después de los parámetros y ')'
                contadorParentesisCierre++;

            }
        } else {
            contador++;
        }
    }
    return contador;
}


//? Revisa las configuraciones cargadas
function revisarConfigs(texto, contador, tipo){
    let configuraciones = {};
    while (contador < texto.length) {
        const codigo = texto.charCodeAt(contador);
        const codNext = texto.charCodeAt(contador + 1);
        const codTres = texto.charCodeAt(contador + 2);
        if (codigo === 93) { //* ']' en ASCII
            contadorCorchetesCierre++;
            console.log("Corchete de cierre encontrado \n Configuraciones completadas");
            contador++;
            break;
        }
        if (codigo === 102 && codNext === 111 && codTres === 110) { //* 'fo' en ASCII
            
            const palabraConfig = texto.substring(contador, contador + 5);
            if (palabraConfig.startsWith('fondo')) {
                console.log("Fondo encontrado");
                contador += 5; //* Avanza el contador después de 'fondo: '
                if (texto.charCodeAt(contador) !== 58) { // Verifica si falta ':'
                    console.log("Error de sintaxis: Falta ':' después de 'fondo'");
                    errores.push(new Error("Falta ':' después de 'fondo'", ':', fila, columna, 'Error sintáctico'));
                } else {
                    contador++; // Avanza el contador después de ':'
                }
                const valor = extraerValor(texto, contador);
                configuraciones.fondo = valor;
                contador += valor.length + 1; //* Avanza el contador después del valor
                verificarCaracterSiguiente(texto, contador);
            }
        } else if (codigo === 102 && codNext === 117) { //* 'f' en ASCII
            const palabraConfig = texto.substring(contador, contador + 6);
            if (palabraConfig.startsWith('fuente')) {
                console.log("Fuente encontrada");
                contador += 6; //* Avanza el contador después de 'fuente: '
                if (texto.charCodeAt(contador) !== 58) { // Verifica si falta ':'
                    console.log("Error de sintaxis: Falta ':' después de 'fuente'");
                    errores.push(new Error("Falta ':' después de 'fuente'", ':', fila, columna, 'Error sintáctico'));
                } else {
                    contador++; // Avanza el contador después de ':'
                }
                const valor = extraerValor(texto, contador);
                configuraciones.fuente = valor;
                contador += valor.length + 1; //* Avanza el contador después del valor
                verificarCaracterSiguiente(texto, contador);
            }
        } else if (codigo === 102 && codNext === 111 && codTres === 114) { //* 'f' en ASCII
            const palabraConfig = texto.substring(contador, contador + 5);
            if (palabraConfig.startsWith('forma')) {
                console.log("Forma encontrada");
                contador += 5; //* Avanza el contador después de 'forma: '
                if (texto.charCodeAt(contador) !== 58) { // Verifica si falta ':'
                    console.log("Error de sintaxis: Falta ':' después de 'forma'");
                    errores.push(new Error("Falta ':' después de 'forma'", ':', fila, columna, 'Error sintáctico'));
                } else {
                    contador++; // Avanza el contador después de ':'
                }
                const valor = extraerValor(texto, contador);
                configuraciones.forma = valor;
                contador += valor.length + 1; //* Avanza el contador después del valor
                verificarCaracterSiguiente(texto, contador);
            }
        } else if (codigo === 116) { //* 't' en ASCII
            const palabraConfig = texto.substring(contador, contador + 10);
            if (palabraConfig.startsWith('tipoFuente')) {
                console.log("Tipo de Fuente encontrado");
                contador += 10; //* Avanza el contador después de 'tipoFuente: '
                if (texto.charCodeAt(contador) !== 58) { // Verifica si falta ':'
                    console.log("Error de sintaxis: Falta ':' después de 'tipoFuente'");
                    errores.push(new Error("Falta ':' después de 'tipoFuente'", ':', fila, columna, 'Error sintáctico'));
                } else {
                    contador++; // Avanza el contador después de ':'
                }
                const valor = extraerValor(texto, contador);
                configuraciones.tipoFuente = valor;
                contador += valor.length + 1; //* Avanza el contador después del valor
                verificarCaracterSiguiente(texto, contador);
            }
        } else if (codigo === 44) { //* ',' en ASCII
            console.log("Coma encontrada en posición ", contador);
            contador++; //* Avanza el contador después de la coma
        } else {
            contador++;
        }
    }
    if (tipo === 'lex') {
        configuraciones.tipo = 'lex';
        configLex.push(configuraciones);
    } else {
        configuraciones.tipo = 'par';
        configPar.push(configuraciones);
    }
    return contador;
}


function extraerValor(texto, contador) {
    let valor = '';
    if (texto.charCodeAt(contador) === 34) { // Verifica si el valor empieza con comillas dobles
        contador++; // Avanza el contador después de la comilla de apertura
        while (contador < texto.length && texto.charCodeAt(contador) !== 34) {
            valor += texto[contador];
            contador++;
        }
        if (texto.charCodeAt(contador) === 34) {
            contador++; // Avanza el contador después de la comilla de cierre
        } else {
            console.log("Error de sintaxis: Falta una comilla de cierre");
            errores.push(new Error('Falta una comilla de cierre', '"', fila, columna, 'Error sintáctico'));
        }
    } else {
        while (contador < texto.length && texto.charCodeAt(contador) !== 44 && texto.charCodeAt(contador) !== 93) {
            valor += texto[contador];
            contador++;
        }
    }
    return valor.trim();
}


function verificarCaracterSiguiente(texto, contador) {
    const codigo = texto.charCodeAt(contador);
    console.log(`Verificando carácter siguiente: ${texto[contador]} (código: ${codigo}) en posición ${contador}`); // Depuración
    if (
        codigo !== 44 && // ',' en ASCII
        codigo !== 125 && // '}' en ASCII
        codigo !== 34 && // '"' en ASCII
        !(codigo >= 48 && codigo <= 57) && // Números en ASCII (0-9)
        codigo !== 46 && // '.' en ASCII
        !((codigo >= 65 && codigo <= 90) || (codigo >= 97 && codigo <= 122)) // Letras en ASCII (A-Z, a-z)
    ) {
        console.log("Error de sintaxis: Caracter no esperado después del valor");
        errores.push(new Error('Caracter no esperado después del valor', texto[contador], 'N/A', 'N/A', 'Error sintáctico'));
    }
}



function archivoErrores(){
    console.log("Generando archivo de errores...");

    let archivo = fs.createWriteStream('errores.json', {
        flags: 'w'
    })

    // ! REVISAR CODIGO
    // let erroresDuplicados = [...errores];
    // for (let i = 0; i < erroresDuplicados.length; i++){
    //     errores.push(erroresDuplicados[i]);
    // }

    // archivo.write(JSON.stringify(errores, null, 2)); 
    // archivo.end();

    let erroresConTipo = errores.map((error, index) => {
        return {numero: index + 1, ...error, tipo: "error lexico" };
    });

    archivo.write(JSON.stringify(erroresConTipo, null, 2)); 
    archivo.end();
}
 
function evaluarOperacion(operacion){
    return operacion.evaluar();
}


function procesarOperaciones(operacionesArray) {
    return operacionesArray.map(operacion => {
        // Evalúa los valores anidados antes de evaluar la operación principal
        if (Array.isArray(operacion.valor1)) {
            operacion.valor1 = procesarOperaciones(operacion.valor1).map(op => op.getResultado());
        } else if (operacion.valor1 instanceof Operacion) {
            operacion.valor1 = operacion.valor1.evaluar();
        }

        if (Array.isArray(operacion.valor2)) {
            operacion.valor2 = procesarOperaciones(operacion.valor2).map(op => op.getResultado());
        } else if (operacion.valor2 instanceof Operacion) {
            operacion.valor2 = operacion.valor2.evaluar();
        }

        // Evalúa la operación
        const resultadoOperacion = evaluarOperacion(operacion);
        console.log(`Operación: ${operacion.getTipo()}, Resultado: ${resultadoOperacion}`);
        return operacion;
    });
}

function evaluarValor(valor) {
    if (Array.isArray(valor)) {
        return procesarOperaciones(valor).map(op => op.getResultado()); // Procesa arreglos de operaciones anidadas y retorna los resultados
    } else if (valor instanceof Operacion) {
        return valor.evaluar(); // Evalúa operaciones anidadas
    } else {
        return valor; // Retorna directamente el valor si es un número
    }
}

function realizarOps() {
    try {
        console.log("Realizando operaciones...");
        const data = fs.readFileSync('archivoLimpio.nlex', 'utf8');
        const operacionesMatch = data.match(/Operaciones\s*=\s*\[(.*?)\](?=\s*Configuraciones)/s);
        if (operacionesMatch) {
            const operacionesStr = operacionesMatch[1].trim();
            console.log('Operaciones: ', operacionesStr);
            const operacionesArray = parseOperacionesPersonalizado(operacionesStr);
            console.log("||||Operaciones encontradas:", operacionesArray);
            operacionesGlobal = procesarOperaciones(operacionesArray);
            console.log("Resultados de las operaciones:", operacionesGlobal);
        } else {
            console.log("No se encontraron operaciones en el archivo.");
        }
    } catch (error) {
        console.error("Error al procesar las operaciones:", error);
    }
}

function parseOperacionesPersonalizado(operacionesStr) {
    const operacionesArray = [];
    const regex = /{[^{}]*}/g; // Extrae objetos delimitados por llaves
    let match;

    while ((match = regex.exec(operacionesStr)) !== null) {
        console.log(`Operación encontrada: ${match[0]}`);
        const operacion = parseOperacionPersonalizada(match[0]);
        operacionesArray.push(operacion);
        console.log('parse Operaciones', operacionesArray);
    }

    return operacionesArray;
}

function parseOperacionPersonalizada(operacionStr) {
    const regex = /"(\w+)":\s*(\[[^\]]*\]|\{[^}]*\}|[^,{}]+)/g; // Captura pares clave-valor, incluyendo anidados
    let match;
    const operacion = {};

    while ((match = regex.exec(operacionStr)) !== null) {
        const key = match[1];
        let value = match[2].trim();

        // Verifica si el valor es un arreglo o un objeto anidado
        if (value.startsWith('[') && value.endsWith(']')) {
            value = parseOperacionesPersonalizado(value.slice(1, -1));
        } else if (value.startsWith('{') && value.endsWith('}')) {
            value = parseOperacionPersonalizada(value.slice(1, -1));
        } else if (!isNaN(parseFloat(value))) {
            value = parseFloat(value); // Convierte números
        } else {
            value = value.replace(/"/g, ''); // Remueve comillas de cadenas
        }

        operacion[key] = value; // Asigna la clave y el valor al objeto
    }

    // Asignar un nombre por defecto si el valor de `nombre` está indefinido
    if (!operacion.nombre) {
        operacion.nombre = 'operacion';
    }

    const anidada = Array.isArray(operacion.valor1) || Array.isArray(operacion.valor2);

    return new Operacion(operacion.operacion, operacion.valor1, operacion.valor2, null, operacion.nombre, anidada);
}




//? Ya sirve, nomas es de mandar bien las operaciones
function generarReportesGraphviz(){
    console.log("Generando reportes Graphviz...");
    if (operacionesGlobal.length === 0) {
        console.log("No se encontraron operaciones.");
        return;
    }
    
    const data = fs.readFileSync('archivoLimpio.nlex', 'utf8');
    const configuracionesMatch = data.match(/ConfiguracionesLex\s*=\s*\[(.*?)\]/s);
    /*
    let fondo = "#ffffff";
    let fuenteColor = "#000000";
    let forma = "ellipse";
    let tipoFuente = "Arial";

    if (configuracionesMatch) {
        const configuracionesStr = configuracionesMatch[1].trim();
        const configuraciones = JSON.parse(configuracionesStr.replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
        fondo = configuraciones.fondo || fondo;
        fuenteColor = configuraciones.fuente || fuenteColor;
        forma = configuraciones.forma || forma;
        tipoFuente = configuraciones.tipoFuente || tipoFuente;
    }*/
    console.log('Configuraciones Lex: ', configLex);
    forma = configLex[0].forma;
    console.log('Forma: ', forma);
    fondo = configLex[0].fondo;
    console.log('Fondo: ', fondo);
    fuenteColor = configLex[0].fuente;
    console.log('Fuente: ', fuenteColor);
    tipoFuente = configLex[0].tipoFuente;
    console.log('Tipo de Fuente: ', tipoFuente);
    try {
        
        let dot = `digraph G { 
        node [shape=${forma}];
        node [style=filled];
        node [fillcolor=${fondo}];
        node [fontcolor=${fuenteColor}];
        node [fontname=${tipoFuente}];
        edge [color="#000000"];
        rankdir=TB;
        `;

        let nodoId = 0;

        function generarNodo(operacion) {
            const currentId = nodoId++;
            let label = `${operacion.operacion}\\n ${operacion.resultado}`;
            dot += `node${currentId} [label="${label}"];\n`;
    
            if (Array.isArray(operacion.valor1)) {
                operacion.valor1.forEach(valor => {
                    const childId = generarNodo(valor);
                    dot += `node${currentId} -> node${childId};\n`;
                });
            } else if (typeof operacion.valor1 === 'object' && operacion.valor1.operacion) {
                const childId = generarNodo(operacion.valor1);
                dot += `node${currentId} -> node${childId};\n`;
            } else {
                const childId = nodoId++;
                dot += `node${childId} [label="${operacion.valor1}"];\n`;
                dot += `node${currentId} -> node${childId};\n`;
            }
    
            if (operacion.valor2 !== undefined) {
                if (Array.isArray(operacion.valor2)) {
                    operacion.valor2.forEach(valor => {
                        const childId = generarNodo(valor);
                        dot += `node${currentId} -> node${childId};\n`;
                    });
                } else if (typeof operacion.valor2 === 'object' && operacion.valor2.operacion) {
                    const childId = generarNodo(operacion.valor2);
                    dot += `node${currentId} -> node${childId};\n`;
                } else {
                    const childId = nodoId++;
                    dot += `node${childId} [label="${operacion.valor2}"];\n`;
                    dot += `node${currentId} -> node${childId};\n`;
                }
            }
    
            return currentId;
        }
    
        operacionesGlobal.forEach(operacion => {
            generarNodo(operacion);
        });
    
        dot += `}\n`;

        fs.writeFile('grafo.dot', dot, (error) => {
            if (error) {
                console.log('Error al generar .dot');
            } else {
                console.log('Archivo .dot generado correctamente');
                exec('dot -Tpng grafo.dot -o grafo.png', (error) => {
                    if (error) {
                        console.log('Error al generar .png');
                        console.log(error);
                    } else {
                        console.log('Archivo .png generado correctamente');
                    }
                });
            }
        });    
    } catch (error) {
        console.log('Error al generar reportes:', error);
    }
}


// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});

module.exports = {
    realizarOps,
    generarReportesGraphviz
};