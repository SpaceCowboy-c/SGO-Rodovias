export class ocorrencia{
    public id: number;
    public km: number;
    public grupo_tarefa: number;
    public dificuldade: number;
    public tempo_estimado: number;
    public descricao: string;
    public data: Date;

    constructor( id: number, km: number, grupo_tarefa: number, dificuldade: number,tempo_estimado: number,descricao: string, data: Date) {
        this.id = id;
        this.km = km;
        this.grupo_tarefa = grupo_tarefa;
        this.dificuldade = dificuldade;
        this.tempo_estimado = tempo_estimado;
        this.descricao = descricao;
        this.data = data;
    }
}