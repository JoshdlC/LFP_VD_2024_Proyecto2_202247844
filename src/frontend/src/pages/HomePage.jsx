// filepath: /c:/Users/josue/Documents/LFP/LFP-Vacas/Lab_LFP/LFP_VD_2024_Proyecto2_202247844/src/frontend/src/pages/HomePage.jsx
import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  //* pone el archivo
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [outputContent, setOutputContent] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/cargarArchivo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      setOutputContent((prev) => prev + '\nArchivo cargado exitosamente.');
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file');
      setOutputContent((prev) => prev + '\nError al cargar el archivo.');
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await axios.post('http://localhost:3000/analizarTexto',  { texto: fileContent });
      setAnalysisResult(response.data);
      setOutputContent((prev) => prev + '\nAnálisis completado.');

    } catch (error) {
      console.error('Error analyzing text:', error);
      setOutputContent((prev) => prev + '\nError al analizar el texto.');
      setErrorMessage('Error analyzing text');
    }
  };

  const handleErrorsJson = async () => {
    try {
      const response = await axios.post('http://localhost:3000/generarErrores');
      console.log(response.data);
      setOutputContent((prev) => prev + '\nArchivo de errores generado.');

    } catch (error) {
      console.error('Error analyzing text:', error);
      setErrorMessage('Error generating errors JSON');
      setOutputContent((prev) => prev + '\nError al generar el archivo de errores.');

    }
  };

  return (
    <main className="homepage-main">
      <div className="homepage-title">
        <h1>NodeLex</h1>
      </div>
      <div className="homepage-buttons">
        <label className="button">
          Seleccionar Archivo
          <input type="file" className="hidden" onChange={handleFileChange}/>
        </label>
        <button className="button" onClick={handleFileUpload}>
          Subir Archivo
        </button>
        <button className="button" onClick={handleAnalyze}>
          Analizar
        </button>
        <Link to="/generarReportes" className="button">
          Generar Reportes
        </Link>
        <button className="button" onClick={handleErrorsJson}>
          Generar Archivo Errores
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <br></br>
      <div className='homepage-textarea'>
        <textarea 
        name='textAreaEntrada' 
        id='textAreaEntrada'
        value={fileContent}
        readOnly>
        </textarea>
        
        <textarea 
        name='textAreaSalida' 
        id='textAreaSalida'
        placeholder='CMD NodeLex'
        value={outputContent}
        disabled>
          
        </textarea>
      </div>
      <div className='homepage-analysis'>
        {analysisResult && (
          <div >
            <h2>Resultado del análisis</h2>
            <table border="1">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Fila</th>
                <th>Columna</th>
              </tr>
            </thead>
            <tbody>
              {analysisResult.lexemas.map((lexema, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{lexema.tipo}</td>
                  <td>{lexema.valor}</td>
                  <td>{lexema.fila}</td>
                  <td>{lexema.columna}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {analysisResult.errores.length > 0 && (
            <>
              <h2>Errores Encontrados</h2>
              <table border="1">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Valor</th>
                    <th>Descripción</th>
                    <th>Fila</th>
                    <th>Columna</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.errores.map((error, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{error.valor}</td>
                      <td>{error.descripcion}</td>
                      <td>{error.fila}</td>
                      <td>{error.columna}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          </div>
        )}
      </div>
    </main>
  );
}

export default HomePage;
