import { tecnico } from '../models/tecnico';
import { ocorrencia } from '../models/ocorrencia';

class AlocacaoService {

    // Método que sugere uma equipe de técnicos
    sugerirEquipe(

        tecnicos: tecnico[], //tec disponiíveis
        ocorrencia: ocorrencia //ocorrencia que esta aberta

    ): tecnico[] { 

        // Define a quantidade padrão de técnicos como 1
        let quantidade = 1;


        // Se a dificuldade for 2:
        // serão necessários 2 técnicos
        if (ocorrencia.dificuldade === 2) {
            quantidade = 2;

        } else if ((ocorrencia.dificuldade ?? 0) >= 3) {
            quantidade = 4;
        }

        // Faz uma cópia do array de técnicos
        const ordenados = [...tecnicos].sort((a, b) =>

            // Ordena os técnicos com base na competência
            // relacionada ao grupo de tarefa da ocorrência
            (b.competencias[ocorrencia.grupo_tarefa_id] || 0) -

            (a.competencias[ocorrencia.grupo_tarefa_id] || 0)
        );

        return ordenados.slice(0, quantidade); //retorna os tecnicos selecionados
    }
}
export default new AlocacaoService();