import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <nav className="bg-blue-700 my-3 py-4 px-10 rounded-lg flex items-center justify-between text-white shadow-lg">
            <h1 className="text-2xl font-bold">Por Josué de la Cruz</h1>
            <ul className="flex gap-x-4">
                <li>
                    <Link to="/" className="hover:underline">Inicio</Link>
                </li>
                <li>
                    <Link to="/cargar" className="hover:underline">Cargar Archivo</Link>
                </li>
                <li>
                    <Link to="/analizar" className="hover:underline">Analizar Texto</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;