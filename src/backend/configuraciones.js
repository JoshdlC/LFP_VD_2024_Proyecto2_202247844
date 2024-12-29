class Configuraciones {
    constructor(tipo, fondo, fuente, forma, tipoFuente){
        this.tipo = tipo;
        this.fondo = fondo;
        this.fuente = fuente;
        this.forma = forma;
        this.tipoFuente = tipoFuente;
    }

    getTipo(){
        return this.tipo;
    }

    getFondo(){
        return this.fondo;
    }

    getFuente(){
        return this.fuente;
    }

    getForma(){
        return this.forma;
    }

    getTipoFuente(){
        return this.tipoFuente;
    }
}

module.exports = Configuraciones;