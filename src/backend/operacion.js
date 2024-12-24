class Operacion {
    constructor(tipo, valor1, valor2, resultado) {
        this.tipo = tipo;
        this.valor1 = valor1;
        this.valor2 = valor2;
        this.resultado = resultado;
    }

    getTipo() {
        return this.tipo;
    }

    getValor1() {
        return this.valor1;
    }

    getValor2() {
        return this.valor2;
    }

    getResultado() {
        return this.resultado;
    }
}

module.exports = Operacion;