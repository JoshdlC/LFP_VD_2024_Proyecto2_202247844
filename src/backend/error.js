class Error {
    constructor(valor, descripcion, fila, columna) {
        this.valor = valor;
        this.descripcion = descripcion;
        this.fila = fila
        this.columna = columna;
    }

    
}

module.exports = Error;