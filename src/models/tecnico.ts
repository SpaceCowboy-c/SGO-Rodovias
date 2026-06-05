
export class tecnico {
    public id: number;
    public cpf: string;
    public nome: string;
    public telefone: string;
    public competencias: Record<number, number>;

    constructor(id: number, cpf: string, nome: string, telefone: string, competencias: Record<number, number>) {
        this.id = id;
        this.cpf = cpf;
        this.nome = nome;
        this.telefone = telefone;
        this.competencias = competencias;
    }
}
