class Operacion {
    constructor(tipo, valor1, valor2, resultado=null, nombre='op', anidada=false) {
        this.tipo = tipo;
        this.valor1 = valor1;
        this.valor2 = valor2;
        this.resultado = resultado;
        this.nombre = nombre;
        this.anidada = anidada;
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

    getNombre() {
        return this.nombre;
    }

    evaluar() {
        let valor1 = Array.isArray(this.valor1)
            ? this.valor1.map(op => (op instanceof Operacion ? op.evaluar() : op)).pop()
            : this.valor1 instanceof Operacion
            ? this.valor1.evaluar()
            : this.valor1;

        let valor2 = Array.isArray(this.valor2)
            ? this.valor2.map(op => (op instanceof Operacion ? op.evaluar() : op)).pop()
            : this.valor2 instanceof Operacion
            ? this.valor2.evaluar()
            : this.valor2;

        switch (this.tipo) {
            case 'suma':
                this.resultado = valor1 + valor2;
                break;
            case 'resta':
                this.resultado = valor1 - valor2;
                break;
            case 'multiplicacion':
                this.resultado = valor1 * valor2;
                break;
            case 'division':
                this.resultado = valor1 / valor2;
                break;
            case 'potencia':
                this.resultado = Math.pow(valor1, valor2);
                break;
            case 'raiz':
                this.resultado = Math.pow(valor1, 1 / valor2);
                break;
            case 'seno':
                this.resultado = Math.sin((valor1)); // Convierte a radianes
                break;
            case 'coseno':
                this.resultado = Math.cos((valor1)); // Convierte a radianes
                break;
            case 'tangente':
                this.resultado = Math.tan((valor1 )); // Convierte a radianes
                break;
            case 'mod':
                this.resultado = valor1 % valor2;
                break;
            default:
                this.resultado = 'Operación no válida';
        }

        return this.resultado;
    }
}

module.exports = Operacion;