import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Alert
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import AlocacaoService from '../services/alocacao_service';

export default function OcorrenciasTecnico() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<any>(null);

    const [modalTriagem, setModalTriagem] = useState(false);
    const [modalEquipe, setModalEquipe] = useState(false);

    const [dificuldade, setDificuldade] = useState('');
    const [tempoEstimado, setTempoEstimado] = useState('');

    const [equipeSelecionada, setEquipeSelecionada] = useState<any[]>([]);

    useEffect(() => {
        carregarOcorrencias();
    }, []);

    async function carregarOcorrencias() {
        const { data, error } = await supabase
            .from('ocorrencia')
            .select('*')
            .neq('status', 'finalizado');

        if (error) {
            console.log(error);
            Alert.alert('Erro', error.message);
            return;
        }

        setOcorrencias(data || []);
    }

    async function handleCardClick(ocorrencia: any) {
        // Primeiro clique → triagem
        if (!ocorrencia.dificuldade || !ocorrencia.tempo_estimado) {
            setOcorrenciaSelecionada(ocorrencia);
            setModalTriagem(true);
            return;
        }

        // Segundo clique → algoritmo
        const { data: tecnicos, error } = await supabase
            .from('tecnico')
            .select(`
                *,
                competencia (
                    grupo_tarefa_id,
                    nivel
                )
            `);

        if (error || !tecnicos) {
            console.log(error);
            Alert.alert('Erro ao carregar técnicos');
            return;
        }

        const tecnicosFormatados = tecnicos.map((t: any) => ({
            ...t,
            competencias: Object.fromEntries(
                t.competencia.map((c: any) => [
                    c.grupo_tarefa_id,
                    c.nivel
                ])
            )
        }));

        const equipe = AlocacaoService.sugerirEquipe(
            tecnicosFormatados,
            ocorrencia
        );

        setEquipeSelecionada(equipe);
        setModalEquipe(true);
    }

    async function salvarTriagem() {
        if (!dificuldade || !tempoEstimado) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const { data: grupos, error: grupoError } = await supabase
            .from('grupo_tarefa')
            .select('id, descricao')
            .ilike('descricao', `%${ocorrenciaSelecionada.tipo_problema}%`);

        if (grupoError || !grupos || grupos.length === 0) {
            console.log(grupoError);
            Alert.alert(
                'Erro',
                'Não foi possível localizar o grupo da tarefa.'
            );
            return;
        }

        const { error } = await supabase
            .from('ocorrencia')
            .update({
                dificuldade: Number(dificuldade),
                tempo_estimado: Number(tempoEstimado),
                grupo_tarefa_id: grupos[0].id
            })
            .eq('id', ocorrenciaSelecionada.id);

        if (error) {
            console.log(error);
            Alert.alert('Erro ao salvar triagem');
            return;
        }

        setModalTriagem(false);
        setDificuldade('');
        setTempoEstimado('');
        carregarOcorrencias();
    }

    async function finalizarOcorrencia(id: number) {
        const { error } = await supabase
            .from('ocorrencia')
            .update({
                status: 'finalizado'
            })
            .eq('id', id);

        if (error) {
            console.log(error);
            Alert.alert('Erro ao finalizar ocorrência');
            return;
        }

        // Remove da lista, mas mantém no banco
        setOcorrencias((prev) =>
            prev.filter((ocorrencia) => ocorrencia.id !== id)
        );

        Alert.alert('Sucesso', 'Ocorrência finalizada.');
    }

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardClick(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                    {item.tipo_problema}
                </Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.cardDescricao}>
                {item.descricao}
            </Text>

            <Text style={styles.cardInfo}>
                KM: {item.km}
            </Text>

            <Text style={styles.cardInfo}>
                Dificuldade: {item.dificuldade ?? 'Aguardando triagem'}
            </Text>

            <Text style={styles.cardInfo}>
                Tempo: {item.tempo_estimado ?? 'Aguardando triagem'}
            </Text>

            <TouchableOpacity
                style={styles.excluirButton}
                onPress={() => finalizarOcorrencia(item.id)}
            >
                <Text style={styles.excluirButtonText}>
                    Finalizar ocorrência
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
                style={styles.header}
            >
                <Text style={styles.title}>Ocorrências Técnicas</Text>
            </LinearGradient>

            <FlatList
                data={ocorrencias}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            {/* Modal Triagem */}
            <Modal visible={modalTriagem} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Triagem da Ocorrência
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Dificuldade"
                            keyboardType="numeric"
                            value={dificuldade}
                            onChangeText={setDificuldade}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="Tempo estimado"
                            keyboardType="numeric"
                            value={tempoEstimado}
                            onChangeText={setTempoEstimado}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setModalTriagem(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={salvarTriagem}
                            >
                                <Text style={styles.modalButtonText}>
                                    Salvar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Equipe */}
            <Modal visible={modalEquipe} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Equipe Sugerida
                        </Text>

                        {equipeSelecionada.map((tecnico) => (
                            <Text
                                key={tecnico.id}
                                style={styles.cardInfo}
                            >
                                • {tecnico.nome}
                            </Text>
                        ))}

                        <TouchableOpacity
                            style={[styles.modalButton, { marginTop: 20 }]}
                            onPress={() => setModalEquipe(false)}
                        >
                            <Text style={styles.modalButtonText}>
                                Fechar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fb' },

    header: {
        paddingTop: 70,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0d2b4e'
    },

    list: {
        padding: 20
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0d2b4e'
    },

    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#2ecc71'
    },

    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },

    cardDescricao: {
        fontSize: 14,
        color: '#1c3d5a',
        marginBottom: 6
    },

    cardInfo: {
        fontSize: 12,
        color: '#5a7287'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(13,43,78,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalCard: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
    },

    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0d2b4e',
        marginBottom: 16,
        textAlign: 'center',
    },

    input: {
        backgroundColor: '#eef1f5',
        borderRadius: 12,
        fontSize: 15,
        color: '#0d2b4e',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },

    cancelText: {
        color: '#5a7287',
        fontSize: 14
    },

    modalButton: {
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },

    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },

    excluirButton: {
        marginTop: 10,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },

    excluirButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});