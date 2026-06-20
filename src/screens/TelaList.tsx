import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function MinhasOcorrencias() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selecionada, setSelecionada] = useState<any>(null);
    const [km, setKm] = useState('');
    const [tipoProblema, setTipoProblema] = useState('');
    const [descricao, setDescricao] = useState('');
    const [successVisible, setSuccessVisible] = useState(false);

    const fetchMinhas = async () => {
        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('ocorrencia')
            .select('*')
            .order('id', { ascending: false });

        if (error) console.log('Erro:', error.message);
        else setOcorrencias(data || []);

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchMinhas(); }, []);

    const formatarData = (iso: string) => {
        const [ano, mes, dia] = iso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const abrirEdicao = (item: any) => {
        setSelecionada(item);
        setKm(item.km != null ? String(item.km) : '');
        setTipoProblema(item.tipo_problema ?? '');
        setDescricao(item.descricao ?? '');
    };

    const fecharEdicao = () => {
        setSelecionada(null);
        setKm('');
        setTipoProblema('');
        setDescricao('');
    };

    const handleOk = () => {
        setSuccessVisible(false);
    };

    const handleSalvar = async () => {
        if (!km || !tipoProblema || !descricao) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const { error } = await supabase
            .from('ocorrencia')
            .update({
                km: Number(km),
                tipo_problema: tipoProblema,
                descricao: descricao,
            })
            .eq('id', selecionada.id);

        if (error) {
            console.log('Erro ao salvar:', error.message);
            Alert.alert('Erro', 'Não foi possível salvar.');
            return;
        }

        fecharEdicao();
        setSuccessVisible(true);
        fetchMinhas();
    };

    const renderItem = ({ item }: { item: any }) => {
        const ativo = item.status === 'ativo';
        return (
            <TouchableOpacity style={styles.card} onPress={() => abrirEdicao(item)}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>KM {item.km} • {item.tipo_problema}</Text>
                    <View style={[styles.badge, { backgroundColor: ativo ? '#2ecc71' : '#9aa5b1' }]}>
                        <Text style={styles.badgeText}>{ativo ? 'Ativo' : 'Finalizado'}</Text>
                    </View>
                </View>
                <Text style={styles.cardDescricao}>{item.descricao}</Text>
                <Text style={styles.cardInfo}>{formatarData(item.data)}</Text>
                <TouchableOpacity
                    style={styles.excluirButton}
                    onPress={() => handleExcluir(item.id)}
                >
                    <Text style={styles.excluirButtonText}>Excluir chamado</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const handleExcluir = (id: number) => {
        Alert.alert(
            'Excluir chamado',
            'Tem certeza que deseja excluir este chamado? Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase
                            .from('ocorrencia')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            console.log('Erro ao excluir:', error.message);
                            Alert.alert('Erro', 'Não foi possível excluir o chamado.');
                            return;
                        }

                        fetchMinhas();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']} style={styles.header}>
                <Text style={styles.title}>Minhas Ocorrências</Text>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#0d2b4e" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={ocorrencias}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMinhas(); }} />}
                    ListEmptyComponent={<Text style={styles.empty}>Você ainda não abriu nenhum chamado.</Text>}
                />
            )}

            <Modal visible={!!selecionada} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Editar ocorrência</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="KM"
                            placeholderTextColor="#9bb3c9"
                            keyboardType="numeric"
                            value={km}
                            onChangeText={setKm}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="Tipo de problema"
                            placeholderTextColor="#9bb3c9"
                            value={tipoProblema}
                            onChangeText={setTipoProblema}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12, height: 90, textAlignVertical: 'top' }]}
                            placeholder="Descrição"
                            placeholderTextColor="#9bb3c9"
                            multiline
                            value={descricao}
                            onChangeText={setDescricao}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={fecharEdicao}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButton} onPress={handleSalvar}>
                                <Text style={styles.modalButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de sucesso, mesmo padrão da tela de Abrir Chamado */}
            <Modal visible={successVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalCard}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="checkmark" size={32} color="#fff" />
                        </View>
                        <Text style={styles.successModalTitle}>Atualizado!</Text>
                        <Text style={styles.successModalText}>Sua ocorrência foi atualizada com sucesso.</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleOk}>
                            <Text style={styles.modalButtonText}>OK</Text>
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

    title: { fontSize: 24, fontWeight: 'bold', color: '#0d2b4e' },

    list: { padding: 20 },

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

    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0d2b4e' },

    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    cardDescricao: { fontSize: 14, color: '#1c3d5a', marginBottom: 6 },

    cardInfo: { fontSize: 12, color: '#5a7287' },

    empty: { textAlign: 'center', marginTop: 40, color: '#5a7287' },

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

    cancelText: { color: '#5a7287', fontSize: 14 },

    modalButton: {
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },

    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // Estilos do modal de sucesso, mesmo padrão da tela "Abrir Chamado"
    successModalCard: {
        width: '82%',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
    },

    modalIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3a6cb5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },

    successModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0d2b4e',
        textAlign: 'center',
    },

    successModalText: {
        fontSize: 14,
        color: '#1c3d5a',
        marginTop: 6,
        textAlign: 'center',
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