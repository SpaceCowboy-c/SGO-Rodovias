import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type GrupoTarefa = {
    id: number;
    descricao: string;
};

export default function CadastroTecnico() {
    const [cpf, setCpf] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    // guarda as competencias
    const [grupoTarefas, setGrupoTarefas] = useState<GrupoTarefa[]>([]);
    const [niveis, setNiveis] = useState<Record<number, number>>({}); // { grupo_tarefa_id: nivel }
    const [loadingGrupos, setLoadingGrupos] = useState(true);

    useEffect(() => {
        carregarGrupoTarefas();
    }, []);

    const carregarGrupoTarefas = async () => {  //busca o grupo_tarefa do banco
        setLoadingGrupos(true);

        const { data, error } = await supabase
            .from('grupo_tarefa')
            .select('id, descricao')
            .order('descricao', { ascending: true });

        setLoadingGrupos(false);

        if (error) {
            console.log('Erro ao buscar grupo_tarefa:', error.message);
            Alert.alert('Erro', 'Não foi possível carregar as áreas de competência.');
            return;
        }

        setGrupoTarefas(data ?? []);
    };

    const handleSelecionarNivel = (grupoId: number, nivel: number) => {    // Salva nível selecionado
        setNiveis((prev) => ({ ...prev, [grupoId]: nivel }));
    };

    const handleOk = () => { //fecha
        setSuccessVisible(false);
        setCpf('');
        setNome('');
        setTelefone('');
        setNiveis({});
    };

    const handleCpfChange = (texto: string) => {  // Formata CPF
        let valor = texto.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);

        let formatado = valor;
        if (valor.length > 9) {
            formatado = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6, 9)}-${valor.slice(9)}`;
        } else if (valor.length > 6) {
            formatado = `${valor.slice(0, 3)}.${valor.slice(3, 6)}.${valor.slice(6)}`;
        } else if (valor.length > 3) {
            formatado = `${valor.slice(0, 3)}.${valor.slice(3)}`;
        }

        setCpf(formatado);
    };

    const handleTelefoneChange = (texto: string) => {  //formata telefone
        let valor = texto.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);

        let formatado = valor;
        if (valor.length > 7) {
            formatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
        } else if (valor.length > 2) {
            formatado = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
        }

        setTelefone(formatado);
    };

    const handleCadastrar = async () => {  //cadastra o técnico e suas competências
        if (!cpf || !nome || !telefone) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const cpfNumeros = cpf.replace(/\D/g, '');  //tira os caracteres não numéricos do CPF
        if (cpfNumeros.length !== 11) {
            Alert.alert('Erro', 'CPF inválido. Preencha os 11 dígitos.');
            return;
        }

        // Apenas as competências que o usuário de fato selecionou um nível
        const competenciasSelecionadas = Object.entries(niveis).filter(
            ([, nivel]) => nivel > 0
        );

        setLoading(true);

        // 1) Cria o técnico e já recupera o id gerado
        const { data: tecnicoData, error: tecnicoError } = await supabase
            .from('tecnico')
            .insert({
                cpf: Number(cpfNumeros),
                nome,
                telefone: Number(telefone.replace(/\D/g, '')),
            })
            .select()
            .single();

        if (tecnicoError || !tecnicoData) {
            setLoading(false);
            console.log('Erro Supabase (tecnico):', tecnicoError?.message);
            Alert.alert('Erro', 'Não foi possível cadastrar o técnico.');
            return;
        }

        // 2) Insere uma linha em competencia para cada grupo_tarefa selecionado
        if (competenciasSelecionadas.length > 0) {
            const linhas = competenciasSelecionadas.map(([grupoTarefaId, nivel]) => ({  // Monta array de competências
                tecnico_id: tecnicoData.id,
                grupo_tarefa_id: Number(grupoTarefaId),
                nivel,
            }));

            const { error: competenciaError } = await supabase  //salva no banco
                .from('competencia')
                .insert(linhas);

            if (competenciaError) {
                console.log('Erro Supabase (competencia):', competenciaError.message);
                Alert.alert(
                    'Atenção',
                    'Técnico cadastrado, mas houve um erro ao salvar as competências.'
                );
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        setSuccessVisible(true);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <LinearGradient colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']} style={styles.header}>
                <Text style={styles.title}>Cadastro de Técnico</Text>
                <Text style={styles.subtitle}>Preencha os dados do técnico</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Nome completo"
                        placeholderTextColor="#9bb3c9"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={cpf}
                        onChangeText={handleCpfChange}
                        placeholder="000.000.000-00"
                        placeholderTextColor="#9bb3c9"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={telefone}
                        onChangeText={handleTelefoneChange}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#9bb3c9"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Competências</Text>

                    {loadingGrupos && (
                        <Text style={styles.helperText}>Carregando áreas de competência...</Text>
                    )}

                    {!loadingGrupos && grupoTarefas.length === 0 && (
                        <Text style={styles.helperText}>
                            Nenhuma área cadastrada em grupo_tarefa ainda.
                        </Text>
                    )}

                    {grupoTarefas.map((grupo) => (
                        <View key={grupo.id} style={styles.competenciaRow}>
                            <Text style={styles.competenciaLabel}>{grupo.descricao}</Text>
                            <View style={styles.nivelRow}>
                                {[1, 2, 3, 4, 5].map((n) => {
                                    const selecionado = niveis[grupo.id] === n;
                                    return (
                                        <TouchableOpacity
                                            key={n}
                                            style={[
                                                styles.nivelButton,
                                                selecionado && styles.nivelButtonSelecionado,
                                            ]}
                                            onPress={() => handleSelecionarNivel(grupo.id, n)}
                                        >
                                            <Text
                                                style={[
                                                    styles.nivelButtonText,
                                                    selecionado && styles.nivelButtonTextSelecionado,
                                                ]}
                                            >
                                                {n}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleCadastrar} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Cadastrar'}</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={successVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="checkmark" size={32} color="#fff" />
                        </View>
                        <Text style={styles.modalTitle}>Técnico cadastrado!</Text>
                        <Text style={styles.modalText}>O registro foi salvo com sucesso.</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={handleOk}>
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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

    subtitle: { fontSize: 14, color: '#1c3d5a', marginTop: 4, textAlign: 'center' },

    form: { padding: 24 },

    inputGroup: { marginBottom: 20 },

    label: { fontSize: 12, color: '#1c3d5a', marginBottom: 4, fontWeight: '600' },

    input: {
        backgroundColor: '#eef1f5',
        borderRadius: 12,
        fontSize: 15,
        color: '#0d2b4e',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    helperText: {
        fontSize: 13,
        color: '#5b7290',
        fontStyle: 'italic',
    },

    competenciaRow: {
        marginBottom: 14,
    },

    competenciaLabel: {
        fontSize: 14,
        color: '#0d2b4e',
        marginBottom: 6,
        fontWeight: '500',
    },

    nivelRow: {
        flexDirection: 'row',
        gap: 8,
    },

    nivelButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#eef1f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d8e1ea',
    },

    nivelButtonSelecionado: {
        backgroundColor: '#0d2b4e',
        borderColor: '#0d2b4e',
    },

    nivelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5b7290',
    },

    nivelButtonTextSelecionado: {
        color: '#fff',
    },

    button: {
        height: 50,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(13,43,78,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalCard: {
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

    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d2b4e', textAlign: 'center' },

    modalText: { fontSize: 14, color: '#1c3d5a', marginTop: 6, textAlign: 'center' },

    modalButton: {
        marginTop: 22,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 50,
    },

    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});