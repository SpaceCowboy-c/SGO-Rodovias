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
    ActivityIndicator,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const roadIcon = require('../../assets/image.png');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation: any = useNavigation();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        try {
            setLoading(true);

            // Login no Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert('Erro', 'Email ou senha inválidos.');
                return;
            }

            if (!data.user) {
                Alert.alert('Erro', 'Usuário não encontrado.');
                return;
            }

            // Busca role na tabela perfil
            const { data: perfil, error: perfilError } = await supabase
                .from('perfil')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (perfilError) {
                Alert.alert('Erro', 'Perfil do usuário não encontrado.');
                return;
            }

            // Navega para Home enviando role
            navigation.navigate('Home' as any, {
                role: perfil.role,
                userId: data.user.id,
            } as any);
        } catch (err) {
            Alert.alert('Erro', 'Ocorreu um erro ao fazer login.');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
            style={styles.container}
        >
            <View style={[styles.wave, styles.waveBack]} />
            <View style={[styles.wave, styles.waveFront]} />

            <KeyboardAvoidingView
                style={styles.formWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Text style={styles.title}>SGO-Rodovias</Text>

                <Image
                    source={roadIcon}
                    style={styles.avatar}
                    resizeMode="contain"
                />

                {/* Campo Email */}
                <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#1c3d5a"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Campo Senha */}
                <View style={styles.inputGroup}>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                            secureTextEntry={!showPassword}
                            placeholder="Senha"
                            placeholderTextColor="#1c3d5a"
                            autoCapitalize="none"
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={18}
                                color="#1c3d5a"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Botão Login */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },

    formWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingTop: 280,
    },

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

    inputGroup: {
        marginBottom: 20,
    },

    input: {
        height: 40,
        borderBottomWidth: 1.2,
        borderBottomColor: '#1c3d5a',
        fontSize: 15,
        color: '#1c3d5a',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },

    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.2,
        borderBottomColor: '#1c3d5a',
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
        fontSize: 18,
        fontWeight: 'bold',
    },

    wave: {
        position: 'absolute',
        bottom: -60,
        left: -50,
        width: 600,
        height: 220,
        borderRadius: 300,
    },

    waveBack: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        transform: [{ rotate: '-8deg' }],
    },

    waveFront: {
        backgroundColor: 'rgba(13,43,78,0.25)',
        bottom: -90,
        transform: [{ rotate: '6deg' }],
    },
});