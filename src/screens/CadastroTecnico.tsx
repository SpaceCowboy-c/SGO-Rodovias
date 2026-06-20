import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function CadastroTecnico() {
    const [cpf, setCpf] = useState('');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    const handleOk = () => {
        setSuccessVisible(false);
        setCpf('');
        setNome('');
        setTelefone('');
    };

    const handleCpfChange = (texto: string) => {
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

    const handleTelefoneChange = (texto: string) => {
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

    const handleCadastrar = async () => {
        if (!cpf || !nome || !telefone) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) {
            Alert.alert('Erro', 'CPF inválido. Preencha os 11 dígitos.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.from('tecnico').insert({
            cpf: Number(cpfNumeros),
            nome,
            telefone: Number(telefone.replace(/\D/g, '')),
        });

        setLoading(false);

        if (error) {
            console.log('Erro Supabase:', error.message);
            Alert.alert('Erro', 'Não foi possível cadastrar o técnico.');
            return;
        }

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