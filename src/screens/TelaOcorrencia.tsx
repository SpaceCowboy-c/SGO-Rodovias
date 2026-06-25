import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location'; // NOVO IMPORT

const tiposProblema = ['equipamentos', 'infraestrutura', 'Iluminação'];  // Lista fixa de tipos de problema

export default function TelaOcorrencia() {
    const [km, setKm] = useState('');
    const [tipoProblema, setTipoProblema] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    const handleOk = () => { // Fecha modal de sucesso ao cadastrar - limpa os campos 
        setSuccessVisible(false);
        setKm('');
        setTipoProblema('');
        setDescricao('');
        setData('');
    };

    const handleCadastrar = async () => {     // Função para cadastrar ocorrência
        if (!km || !tipoProblema || !descricao || !data) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const [dia, mes, ano] = data.split('/');  // Converte data DD/MM/AAAA para AAAA-MM-DD
        const dataFormatada = `${ano}-${mes}-${dia}`;

        setLoading(true);

        const { data: userData } = await supabase.auth.getUser();

        // CAPTURA DA LOCALIZAÇÃO
        let latitude: number | null = null;
        let longitude: number | null = null;

        const { status } = await Location.requestForegroundPermissionsAsync();    // Solicita permissão de localização

        if (status === 'granted') {
            const posicao = await Location.getCurrentPositionAsync({});
            latitude = posicao.coords.latitude;  // Captura posição atual
            longitude = posicao.coords.longitude;
        }

        // INSERT NO SUPABASE COM LAT/LONG
        const { error } = await supabase.from('ocorrencia').insert({
            km: Number(km),
            tipo_problema: tipoProblema,
            descricao,
            data: dataFormatada,
            status: 'ativo',
            criado_por: userData.user?.id,
            latitude,
            longitude,
        });

        setLoading(false);

        if (error) {
            console.log('Erro Supabase:', error.message);
            Alert.alert('Erro', 'Não foi possível cadastrar a ocorrência.');
            return;
        }

        setSuccessVisible(true);
    };

    const handleDataChange = (texto: string) => {  // Formata a digitação da data
        let valor = texto.replace(/\D/g, '');

        if (valor.length > 8) valor = valor.slice(0, 8);

        let formatado = valor;

        if (valor.length > 4) {
            formatado = `${valor.slice(0, 2)}/${valor.slice(2, 4)}/${valor.slice(4)}`;
        } else if (valor.length > 2) {
            formatado = `${valor.slice(0, 2)}/${valor.slice(2)}`;
        }

        setData(formatado);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
                style={styles.header}
            >
                <Text style={styles.title}>Abrir Chamado</Text>
                <Text style={styles.subtitle}>
                    Conte pra gente o que encontrou na via
                </Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>KM</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={km}
                        onChangeText={setKm}
                        placeholder="Ex: 45"
                        placeholderTextColor="#9bb3c9"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tipo de Problema</Text>
                    <View style={styles.chipsRow}>
                        {tiposProblema.map((tipo) => (
                            <TouchableOpacity
                                key={tipo}
                                style={[
                                    styles.chip,
                                    tipoProblema === tipo && styles.chipSelected
                                ]}
                                onPress={() => setTipoProblema(tipo)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        tipoProblema === tipo &&
                                        styles.chipTextSelected
                                    ]}
                                >
                                    {tipo}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Data</Text>
                    <TextInput
                        style={styles.input}
                        value={data}
                        onChangeText={handleDataChange}
                        placeholder="DD/MM/AAAA"
                        placeholderTextColor="#9bb3c9"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={descricao}
                        onChangeText={setDescricao}
                        placeholder="Descreva a ocorrência"
                        placeholderTextColor="#9bb3c9"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleCadastrar}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Salvando...' : 'Cadastrar'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={successVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="checkmark" size={32} color="#fff" />
                        </View>

                        <Text style={styles.modalTitle}>Chamado aberto!</Text>

                        <Text style={styles.modalText}>
                            Seu registro foi salvo com sucesso.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleOk}
                        >
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

    subtitle: {
        fontSize: 14,
        color: '#1c3d5a',
        marginTop: 4,
        textAlign: 'center',
    },

    form: { padding: 24 },

    inputGroup: { marginBottom: 20 },

    label: {
        fontSize: 12,
        color: '#1c3d5a',
        marginBottom: 4,
        fontWeight: '600',
    },

    input: {
        backgroundColor: '#eef1f5',
        borderRadius: 12,
        fontSize: 15,
        color: '#0d2b4e',
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    textArea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },

    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: '#eef1f5',
    },

    chipSelected: {
        backgroundColor: '#0d2b4e',
    },

    chipText: {
        fontSize: 13,
        color: '#1c3d5a',
    },

    chipTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },

    button: {
        height: 50,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

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

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0d2b4e',
        textAlign: 'center',
    },

    modalText: {
        fontSize: 14,
        color: '#1c3d5a',
        marginTop: 6,
        textAlign: 'center',
    },

    modalButton: {
        marginTop: 22,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 50,
    },

    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});