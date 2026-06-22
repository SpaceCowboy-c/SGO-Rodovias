export class Competencia {
    tecnico_id: number;
    grupo_tarefa_id: number;
    nivel: number; // 1 a 5

    constructor(tecnico_id: number, grupo_tarefa_id: number, nivel: number) {
        this.tecnico_id = tecnico_id;
        this.grupo_tarefa_id = grupo_tarefa_id;
        this.nivel = nivel;
    }
}