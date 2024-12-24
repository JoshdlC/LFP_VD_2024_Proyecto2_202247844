const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Variables globales
let datosGlobalString = '';
let datosGlobalFile = '';
let lexemas = [];
let errores = [];
let operacionesArray = [];

// Endpoint para cargar archivo
app.post('/cargarArchivo', (req, res) => {
    const { rutaArchivo } = req.body;

    if (!rutaArchivo) {
        return res.status(400).json({ 
            error: 'La ruta del archivo no fue proporcionada. Asegúrate de enviar un campo "rutaArchivo" en el cuerpo de la solicitud.' 
        });
    }

    try {
        // Leer el archivo como texto sin importar la extensión
        const datos = fs.readFileSync(rutaArchivo, 'utf-8');

        // Guardar los datos globalmente
        datosGlobalFile = datos;
        datosGlobalString = datos; // No es necesario convertir a JSON si es un texto plano.

        res.status(200).json({ 
            message: 'Archivo cargado exitosamente', 
            contenido: datos 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al cargar archivo', 
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

        analizarTexto(datosGlobalFile);
        res.status(200).json({ message: 'Análisis completado', lexemas, errores });
    } catch (error) {
        res.status(500).json({ error: 'Error al analizar texto', detalles: error.message });
    }
});

// Endpoint para generar archivo de errores
app.get('/generarErrores', (req, res) => {
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

app.post('/', (req, res) => {
    res.status(200).json({ message: 'Servidor en línea' });
});

// Función para analizar texto
function analizarTexto(texto) {
    // Aquí implementa la lógica de analizarTexto basada en el script original.
    // Se omite en este ejemplo por longitud, pero incluirías la lógica relevante.
}

// Función para procesar operaciones
function procesarOperaciones(operacionesArray) {
    // Implementa la lógica para evaluar operaciones y almacenar resultados en operacionesArray.
}

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});