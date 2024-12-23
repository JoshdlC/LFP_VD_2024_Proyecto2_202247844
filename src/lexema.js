class Lexema {
    constructor(tipo, valor, fila, columna) {
        this.tipo = tipo;
        this.valor = valor;
        this.fila = fila;
        this.columna = columna;
    }

    getTipo() {
        return this.tipo;
    }
    
    getValor() {
        return this.valor;
    }

    getFila() {
        return this.fila;
    }

    getColumna() {
        return this.columna;
    }
}


module.exports = Lexema;