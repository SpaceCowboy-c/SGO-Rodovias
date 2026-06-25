import { Ionicons } from '@expo/vector-icons';

export type ClimaInfo = {
    temperatura: number;   //Temperatura atual
    vento: number;         //Velocidade do vento
    descricao: string;     //Descrição do clima
    icon: keyof typeof Ionicons.glyphMap; 
};

function interpretarCodigoClima( //recebe os dados do clima via API e retorna uma descrição e um ícone correspondente
    codigo: number  //retorna sempre em número ( 0 para chuva...)
): { descricao: string; icon: keyof typeof Ionicons.glyphMap } {

    // Se o código for 0:
    // significa céu limpo
    if (codigo === 0)
        return {
            descricao: 'Céu limpo',
            icon: 'sunny-outline'
        };

    // Se o código estiver entre 1, 2 ou 3:
    // significa parcialmente nublado
    if ([1, 2, 3].includes(codigo))
        return {
            descricao: 'Parcialmente nublado',
            icon: 'partly-sunny-outline'
        };

    // Se o código for 45 ou 48:
    // significa neblina
    if ([45, 48].includes(codigo))
        return {
            descricao: 'Neblina',
            icon: 'cloud-outline'
        };

    // Se o código estiver nesses números:
    // representa chuvisco
    if ([51, 53, 55, 56, 57].includes(codigo))
        return {
            descricao: 'Chuvisco',
            icon: 'rainy-outline'
        };

    // Códigos relacionados à chuva
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo))
        return {
            descricao: 'Chuva',
            icon: 'rainy-outline'
        };

    // Códigos relacionados à neve
    if ([71, 73, 75, 77, 85, 86].includes(codigo))
        return {
            descricao: 'Neve',
            icon: 'snow-outline'
        };

    // Códigos relacionados à tempestade
    if ([95, 96, 99].includes(codigo))
        return {
            descricao: 'Tempestade',
            icon: 'thunderstorm-outline'
        };

    // Se o código não estiver em nenhum caso acima,
    // retorna um estado padrão.
    return {
        descricao: 'Indisponível',
        icon: 'help-circle-outline'
    };
}


export async function buscarClima(
    latitude: number,
    longitude: number
): Promise<ClimaInfo | null> {

    try {
        // https://api.open-meteo.com/v1/forecast?latitude=-29&longitude=-51...
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

        // Faz a requisição HTTP para a API
        const response = await fetch(url);

        const data = await response.json();   // Converte a resposta em JSON


        if (!data?.current_weather) //teve resposta?
            return null;

        // Pega o código do clima e traduz usando a função anterior
        const { descricao, icon } =
            interpretarCodigoClima(
                data.current_weather.weathercode
            );

        // Retorna os dados organizados no formato ClimaInfo
        return {

            temperatura: Math.round(
                data.current_weather.temperature
            ),

            vento: Math.round(
                data.current_weather.windspeed
            ),
            descricao,
            icon,
        };

    } catch (err) {

        console.log('Erro ao buscar clima:', err);
        return null;
    }
}