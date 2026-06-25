import { tecnico } from "../models/tecnico";
import { ocorrencia } from "../models/ocorrencia";
import { equipe } from "../models/equipe";


export class AStarAlocacao {

    // Método responsável por sugerir a melhor equipe
    sugerirEquipe(

        // Lista de técnicos disponíveis
        tecnicos: tecnico[],

        // Ocorrência que precisa ser atendida
        ocorrencia: ocorrencia

    ): equipe | null { 
        return null;
    }
}