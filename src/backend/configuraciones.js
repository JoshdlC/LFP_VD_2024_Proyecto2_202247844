class Configuraciones {
    constructor(fondo, fuente, forma, tipoFuente){
        this.fondo = fondo;
        this.fuente = fuente;
        this.forma = forma;
        this.tipoFuente = tipoFuente;
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