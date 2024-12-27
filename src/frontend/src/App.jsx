import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './styles.css';
// import NavBar from './components/NavBar';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
                {/* <NavBar /> */}
                <div className="container mx-auto mt-5">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        {/* <Route path="/cargar" element={<h1>Cargar Archivo</h1>} />
                        <Route path="/analizar" element={<h1>Analizar Texto</h1>} /> */}
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;