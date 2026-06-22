export class ocorrencia {
    public id: number;
    public km: number;
    public grupo_tarefa_id: number;
    public dificuldade?: number;
    public tempo_estimado?: number;
    public descricao: string;
    public data: Date;
    public status: string;

    constructor(
        id: number,
        km: number,
        grupo_tarefa_id: number,
        descricao: string,
        data: Date,
        dificuldade?: number,
        tempo_estimado?: number,
        status: string = 'ativo'
    ) {
        this.id = id;
        this.km = km;
        this.grupo_tarefa_id = grupo_tarefa_id;
        this.descricao = descricao;
        this.data = data;
        this.dificuldade = dificuldade;
        this.tempo_estimado = tempo_estimado;
        this.status = status;
    }
}