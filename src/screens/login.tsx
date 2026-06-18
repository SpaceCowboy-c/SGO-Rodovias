import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

import {
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const roadIcon = require('../../assets/image.png'); 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Erro', 'Email ou senha inválidos.');
            return;
        }

        navigation.navigate('Home' as never); 
    };
    return (
        <LinearGradient colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']} style={styles.container}>
            <View style={[styles.wave, styles.waveBack]} />
            <View style={[styles.wave, styles.waveFront]} />

            <KeyboardAvoidingView
                style={styles.formWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Text style={styles.title}>SGO-Rodovias</Text>
                <Image source={roadIcon} style={styles.avatar} resizeMode="contain" />

                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#1c3d5a"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                            secureTextEntry={!showPassword}
                            placeholder="Password"
                            placeholderTextColor="#1c3d5a"
                            autoCapitalize="none"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#1c3d5a" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: 'hidden' },

    formWrapper: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingTop: 280 },

    avatar: {
        position: 'absolute',
        top: 80,
        left: '60%',
        marginLeft: -60,
        width: 120,
        height: 120,
    },


    title: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#0d2b4e',
    },

    inputGroup: { marginBottom: 20 },

    label: { fontSize: 12, color: '#1c3d5a', marginBottom: -2 },

    input: {
        height: 40,
        borderBottomWidth: 1.2,
        borderBottomColor: '#1c3d5a',
        fontSize: 15,
        color: '#1c3d5a',
        paddingHorizontal: 0,
        paddingVertical: 0,
        textAlignVertical: 'center', // ajuda no Android a centralizar o texto
    },

    passwordRow: {   // linha abaixo do input
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.2,
        borderBottomColor: '#1c3d5a',
    },

    row: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },

    rowText: { fontSize: 12, color: '#1c3d5a' },

    button: {
        height: 50,
        backgroundColor: '#0d2b4e',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,

    },

    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    wave: {
        position: 'absolute',
        bottom: -60,
        left: -50,
        width: 600,
        height: 220,
        borderRadius: 300,
    },

    waveBack: { backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ rotate: '-8deg' }] },

    waveFront: { backgroundColor: 'rgba(13,43,78,0.25)', bottom: -90, transform: [{ rotate: '6deg' }] },
});