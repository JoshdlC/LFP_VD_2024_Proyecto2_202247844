const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const cors = require('cors');
const { exec } = require('child_process');

const Lexema = require('./lexema');
const Error = require('./error');
const Configuraciones = require('./configuraciones');
const Operacion = require('./operacion');

// Middleware
app.use(express.json()); // Para analizar JSON en el cuerpo de la solicitud0
app.use(express.text());

// Habilitar CORS para todas las rutas
app.use(cors());

// Variables globales
let datosGlobalString = '';
let datosGlobalFile = '';
let lexemas = [];
let errores = [];
let operacionesArray = [];
let textoSinErrores = '';


let letrasTilde = [160, 130, 161, 162, 163, 181, 144, 214, 224, 233]; //? letras con tilde en ASCII

// Endpoint para cargar archivo
app.post('/cargarArchivo', (req, res) => {
    const { rutaArchivo } = req.body;
    console.log(rutaArchivo)

    if (!rutaArchivo) {
        return res.status(400).json({ 
            error: 'La ruta del archivo no fue proporcionada. Asegúrate de enviar un campo rutaArchivo en el cuerpo de la solicitud.', 
        });
    }

    try {
        //* Leer el archivo como texto sin importar la extensión
        const datos = fs.readFileSync(rutaArchivo, 'utf-8');

        //* Guardar los datos globalmente
        datosGlobalFile = datos;
        datosGlobalString = datos; //* No es necesario convertir a JSON si es un texto plano.

        res.status(200).json({ 
            message: 'Archivo cargado exitosamente', 
            contenido: datos 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al leer el archivo', 
            detalles: error.message 
        });
    }
});

// Endpoint para analizar archivo
app.post('/analizarTexto', (req, res) => {
    if (!datosGlobalFile) {
        return res.status(400).json({ error: 'No hay archivo cargado para analizar' });
    }

    try {
        lexemas = []; // Reiniciar lexemas
        errores = []; // Reiniciar errores

        analizadorLexico(datosGlobalFile);
        res.status(200).json({ message: 'Análisis completado', lexemas, errores });
    } catch (error) {
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

// Endpoint para realizar operaciones
app.post('/realizarOperaciones', (req, res) => {
    if (!datosGlobalFile) {
        return res.status(400).json({ error: 'No hay archivo cargado para realizar operaciones' });
    }

    try {
        const json = JSON.parse(datosGlobalFile);
        operacionesArray = [];

        procesarOperaciones(json.operaciones);
        res.status(200).json({ message: 'Operaciones realizadas correctamente', operaciones: operacionesArray });
    } catch (error) {
        res.status(500).json({ error: 'Error al realizar operaciones', detalles: error.message });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor en línea, Bienvenido a NodeLex' });
});

//! Analizador léxico   
function analizadorLexico(texto) {
    const palabrasReservadas = [
        'operaciones', 'operacion', 'valor1', 'valor2',
        'ConfiguracionesLex', 'texto', 'fondo', 'fuente', 'forma', 'tipoFuente', 'ConfiguracionesParser',
        'suma', 'resta', 'potencia', 'multiplicacion', 'division', 'raiz', 'inverso', 'seno', 'coseno', 'tangente', 'mod', 'promedio', 'max', 
        'red', 'blue', 'yellow', 'black', 'white', 'circle', 'box', 'diamond'
    ];


    let fila=1;
    let columna = 1;
    let contador = 0;
    

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
            continue;
        }

        //* Ignoramos saltos de línea
        else if (codigo === 10 || codigo === 13) {
            if (codigo === 10){
                fila++;
                columna = 1;
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
            continue;
        }

        //* Si es un dígito
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
        
            if (texto.charCodeAt(contador) === 44) { //* Si encontramos una coma
                lexemas.push(new Lexema('Coma', ',', fila, columna));
                // fila++; //* Aumentamos la fila
                columna = 1; //* Reiniciamos la columna
                contador++; //* Avanzamos el contador para saltar la coma
                textoSinErrores += ',';
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
            continue;
        }

        //? Si es un operador
        else if (codigo === 43 || codigo === 45 || codigo === 42 || codigo === 47)   {
            lexemas.push(new Lexema('Operador', texto[contador], fila));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si es un paréntesis de apertura
        else if (codigo === 40) {
            lexemas.push(new Lexema('Paréntesis de apertura', texto[contador], fila));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si es un paréntesis de cierre
        else if (codigo === 41) {
            lexemas.push(new Lexema('Paréntesis de cierre', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si es una llave de apertura
        else if (codigo === 123) {
            lexemas.push(new Lexema('Llave de apertura', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
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
            columna++;
            contador++;
        }

        //* Si es un corchete de apertura
        else if (codigo === 91) {
            lexemas.push(new Lexema('Corchete de apertura', texto[contador], fila, columna));
            // fila++; //? Aumentamos la fila
            textoSinErrores += texto[contador];
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
            columna++;
            contador++;
        }

        //* Si es un punto y coma
        else if (codigo === 59) {
            lexemas.push(new Lexema('Punto y coma', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si es dos puntos
        else if (codigo === 58){
            lexemas.push(new Lexema('Dos puntos', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
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
            continue;
            
        }

        //* Si viene una coma
        else if (codigo === 44) {
            lexemas.push(new Lexema('Coma', texto[contador], fila, columna));
            // fila++; //? Aumentamos la fila
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //*Si viene un punto
        else if (codigo === 46){
            lexemas.push(new Lexema('Punto', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si viene un igual
        else if (codigo === 61) {
            lexemas.push(new Lexema('Igual', texto[contador], fila, columna));
            textoSinErrores += texto[contador];
            columna++;
            contador++;
        }

        //* Si es un caracter no reconocido
        else {
            let valor = '';
            while (contador < texto.length && !palabrasReservadas.includes(valor) && texto[contador] !== ' ' && texto[contador] !== ',' && texto[contador] !== '\n') {
                valor += texto[contador];
                
                contador++;
            }
            if (!palabrasReservadas.includes(valor)) {
                columna++;
                errores.push(new Error('Valor no reconocido', valor, fila, columna));
            } else {
                columna++;
                textoSinErrores += valor;
                lexemas.push(new Lexema('Palabra reservada', valor, fila, columna));
            }
        }

    }
    datosGlobalFile = textoSinErrores;
}

// Función para procesar operaciones
function procesarOperaciones(operacionesArray) {
    // Implementa la lógica para evaluar operaciones y almacenar resultados en operacionesArray.
}

function analizadorSintactico(textoSinErrores) {
    
}

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});