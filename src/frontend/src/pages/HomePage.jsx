// filepath: /c:/Users/josue/Documents/LFP/LFP-Vacas/Lab_LFP/LFP_VD_2024_Proyecto2_202247844/src/frontend/src/pages/HomePage.jsx
import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePage() {

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3000/cargarArchivo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  return (
    <main className="homepage-main">
      <div className="homepage-title">
        <h1>NodeLex</h1>
      </div>
      <div className="homepage-buttons">
        <label className="button">
          Cargar
          <input type="file" className="hidden" onChange={handleFileChange}/>
        </label>
        <button className="button" onClick={handleFileUpload}>
          Subir Archivo
        </button>
        <Link to="/analizar" className="button">
          Analizar
        </Link>
        <Link to="/generarReportes" className="button">
          Generar Reportes
        </Link>
        <Link to="/generarErrores" className="button">
          Generar Archivo Errores
        </Link>
      </div>
      <br></br>
      <div className='homepage-textarea'>
        <textarea>

        </textarea>
        <textarea>
          
        </textarea>
      </div>
    </main>
  );
}

export default HomePage;
