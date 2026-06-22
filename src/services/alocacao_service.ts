import { tecnico } from '../models/tecnico';
import { ocorrencia } from '../models/ocorrencia';

class AlocacaoService {
    sugerirEquipe(
        tecnicos: tecnico[],
        ocorrencia: ocorrencia
    ): tecnico[] {

        let quantidade = 1;

        if (ocorrencia.dificuldade === 2) {
            quantidade = 2;
        } else if ((ocorrencia.dificuldade ?? 0) >= 3) {
            quantidade = 4;
        }

        const ordenados = [...tecnicos].sort((a, b) =>
            (b.competencias[ocorrencia.grupo_tarefa_id] || 0) -
            (a.competencias[ocorrencia.grupo_tarefa_id] || 0)
        );

        return ordenados.slice(0, quantidade);
    }
}

export default new AlocacaoService();