import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function OcorrenciasTecnico() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecionada, setSelecionada] = useState<any>(null);
    const [dificuldade, setDificuldade] = useState('');
    const [tempoEstimado, setTempoEstimado] = useState('');

    const fetchPendentes = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('ocorrencia')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.log('Erro ao buscar ocorrências:', error.message);
        } else {
            console.log('Ocorrências carregadas:', data);
            setOcorrencias(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchPendentes();
    }, []);

    const handleSalvar = async () => {
        if (!dificuldade || !tempoEstimado) {
            Alert.alert('Erro', 'Preencha dificuldade e tempo estimado.');
            return;
        }

        console.log('Salvando ocorrência ID:', selecionada.id);

        const { error } = await supabase
            .from('ocorrencia')
            .update({
                dificuldade: Number(dificuldade),
                tempo_estimado: Number(tempoEstimado),
            })
            .eq('id', selecionada.id);

        if (error) {
            console.log('Erro ao salvar:', error.message);
            Alert.alert('Erro', 'Não foi possível salvar.');
            return;
        }

        Alert.alert('Sucesso', 'Triagem salva com sucesso.');

        setSelecionada(null);
        setDificuldade('');
        setTempoEstimado('');

        fetchPendentes();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
                style={styles.header}
            >
                <Text style={styles.title}>Ocorrências - Técnico</Text>
                <Text style={styles.subtitle}>Pendentes de triagem</Text>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#0d2b4e"
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={ocorrencias}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            Nenhuma ocorrência encontrada.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                setSelecionada(item);
                                setDificuldade(
                                    item.dificuldade != null
                                        ? String(item.dificuldade)
                                        : ''
                                );
                                setTempoEstimado(
                                    item.tempo_estimado != null
                                        ? String(item.tempo_estimado)
                                        : ''
                                );
                            }}
                        >
                            <Text style={styles.cardTitle}>
                                Ocorrência #{item.id}
                            </Text>

                            <Text style={styles.cardDescricao}>
                                {item.descricao}
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Dificuldade:{' '}
                                {item.dificuldade ?? 'Não definida'}
                            </Text>

                            <Text style={styles.cardDescricao}>
                                Tempo estimado:{' '}
                                {item.tempo_estimado ?? 'Não definido'}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <Modal visible={!!selecionada} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Preencher triagem
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Dificuldade (1 a 5)"
                            placeholderTextColor="#9bb3c9"
                            keyboardType="numeric"
                            value={dificuldade}
                            onChangeText={setDificuldade}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="Tempo estimado (min)"
                            placeholderTextColor="#9bb3c9"
                            keyboardType="numeric"
                            value={tempoEstimado}
                            onChangeText={setTempoEstimado}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelecionada(null);
                                    setDificuldade('');
                                    setTempoEstimado('');
                                }}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleSalvar}
                            >
                                <Text style={styles.modalButtonText}>
                                    Salvar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fb',
    },

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
        color: '#0d2b4e',
    },

    subtitle: {
        fontSize: 14,
        color: '#1c3d5a',
        marginTop: 4,
    },

    list: {
        padding: 20,
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

    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0d2b4e',
        marginBottom: 6,
    },

    cardDescricao: {
        fontSize: 14,
        color: '#1c3d5a',
        marginBottom: 4,
    },

    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#5a7287',
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
        fontSize: 14,
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
        fontSize: 14,
    },
});