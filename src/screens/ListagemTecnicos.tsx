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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function ListagemTecnicos() {
    const [tecnicos, setTecnicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecionado, setSelecionado] = useState<any>(null);
    //campos para edição
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [successVisible, setSuccessVisible] = useState(false);

    const fetchTecnicos = async () => {  
        setLoading(true);

        const { data, error } = await supabase  // Busca todos os técnicos no banco
            .from('tecnico')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.log('Erro ao buscar técnicos:', error.message);
        } else {
            console.log('Técnicos carregados:', data);
            setTecnicos(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchTecnicos();
    }, []);

    //Garante quantidade fixa de dígitos (ex: CPF com zeros à esquerda)
    const paraDigitos = (valor: any, tamanho: number) => {
        if (valor == null) return '';
        return String(valor).padStart(tamanho, '0');
    };

    const formatarCpf = (digitos: string) => {
        if (digitos.length <= 3) return digitos;
        if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
        if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
        return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
    };

    const formatarTelefone = (digitos: string) => {
        if (digitos.length <= 2) return digitos;
        if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    };

    const handleCpfChange = (texto: string) => {
        let valor = texto.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        setCpf(formatarCpf(valor));
    };

    const handleTelefoneChange = (texto: string) => {
        let valor = texto.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        setTelefone(formatarTelefone(valor));
    };

    const abrirEdicao = (item: any) => {  //abre tela de edição
        setSelecionado(item);
        setNome(item.nome ?? '');
        setCpf(formatarCpf(paraDigitos(item.cpf, 11)));
        setTelefone(formatarTelefone(paraDigitos(item.telefone, 11)));
    };

    const fecharEdicao = () => {
        setSelecionado(null);
        setNome('');
        setCpf('');
        setTelefone('');
    };

    const handleOk = () => {  //fecha o modal
        setSuccessVisible(false);
    };

    const handleSalvar = async () => {   // Salva alterações no banco
        if (!nome || !cpf || !telefone) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const cpfDigitos = cpf.replace(/\D/g, '');
        const telefoneDigitos = telefone.replace(/\D/g, '');

        if (cpfDigitos.length !== 11) {
            Alert.alert('Erro', 'CPF inválido. Preencha os 11 dígitos.');
            return;
        }

        console.log('Salvando técnico ID:', selecionado.id);

        const { error } = await supabase   // Atualiza técnico no Supabase
            .from('tecnico')
            .update({
                nome,
                cpf: Number(cpfDigitos),
                telefone: Number(telefoneDigitos),
            })
            .eq('id', selecionado.id);

        if (error) {
            console.log('Erro ao salvar:', error.message);
            Alert.alert('Erro', 'Não foi possível salvar.');
            return;
        }

        fecharEdicao();   // Fecha modal e atualiza lista
        setSuccessVisible(true);
        fetchTecnicos();
    };

    const handleExcluirTecnico = (id: number) => {   //aba de excluir
        Alert.alert(
            'Excluir técnico',
            'Tem certeza que deseja excluir este técnico? Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase //delete no banco 
                            .from('tecnico')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            console.log('Erro ao excluir:', error.message);
                            Alert.alert('Erro', 'Não foi possível excluir o técnico.');
                            return;
                        }

                        fetchTecnicos();  //atualiza a lista
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
                style={styles.header}
            >
                <Text style={styles.title}>Técnicos</Text>
                <Text style={styles.subtitle}>Gerencie os técnicos cadastrados</Text>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#0d2b4e"
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={tecnicos}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.empty}>
                            Nenhum técnico encontrado.
                        </Text>
                    }
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => abrirEdicao(item)}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>
                                        {item.nome}
                                    </Text>
                                </View>

                                <Text style={styles.cardDescricao}>
                                    CPF: {formatarCpf(paraDigitos(item.cpf, 11))}
                                </Text>

                                <Text style={styles.cardDescricao}>
                                    Telefone: {formatarTelefone(paraDigitos(item.telefone, 11))}
                                </Text>

                                <TouchableOpacity
                                    style={styles.finalizarButton}
                                    onPress={() => handleExcluirTecnico(item.id)}
                                >
                                    <Text style={styles.finalizarButtonText}>
                                        Excluir técnico
                                    </Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <Modal visible={!!selecionado} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Editar técnico
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nome"
                            placeholderTextColor="#9bb3c9"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="CPF"
                            placeholderTextColor="#9bb3c9"
                            keyboardType="numeric"
                            value={cpf}
                            onChangeText={handleCpfChange}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="Telefone"
                            placeholderTextColor="#9bb3c9"
                            keyboardType="numeric"
                            value={telefone}
                            onChangeText={handleTelefoneChange}
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
                        <Text style={styles.successModalText}>Técnico atualizado com sucesso.</Text>
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

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0d2b4e',
    },

    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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

    finalizarButton: {
        marginTop: 10,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },

    finalizarButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});