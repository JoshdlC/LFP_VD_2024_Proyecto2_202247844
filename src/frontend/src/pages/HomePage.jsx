// filepath: /c:/Users/josue/Documents/LFP/LFP-Vacas/Lab_LFP/LFP_VD_2024_Proyecto2_202247844/src/frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main className="homepage-main">
      <div className="homepage-title">
        <h1>NodeLex</h1>
      </div>
      <div className="homepage-buttons">
        <label className="button">
          Cargar
          <input type="file" className="hidden" />
        </label>
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
