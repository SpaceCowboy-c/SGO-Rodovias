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
    const [email, setEmail] = useState('');  // Estado do email digitado
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [lembrarMe, setLembrarMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation: any = useNavigation();

    const handleLogin = async () => {  // Função de login
        if (!email.trim() || !password.trim()) {  //verifica se os campos estão preenchidos
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({  // Faz login no Supabase Auth
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

            // Busca role na tabela perfil  - O role diz o que cada pessoa pode fazer.
            const { data: perfil, error: perfilError } = await supabase
                .from('perfil')  //busca os dados dessa tabela
                .select('role')
                .eq('id', data.user.id)  //Filtra pelo ID
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
            colors={['#a9c6e8', '#5b8bd0', '#0d2b4e']}
            style={styles.container}
        >
            {/* Blobs decorativos, no mesmo espírito do fundo ondulado do modelo */}
            <View style={[styles.blob, styles.blobTopRight]} />
            <View style={[styles.blob, styles.blobBottomLeft]} />
            <View style={[styles.blob, styles.blobBottomLeftSmall]} />

            <KeyboardAvoidingView
                style={styles.centerWrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.card}>
                    <Image
                        source={roadIcon}
                        style={styles.avatar}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>SGO-Rodovias</Text>

                    {/* Campo Email */}
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#9bb3c9"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Campo Senha */}
                    <View style={[styles.inputGroup, styles.passwordGroup]}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            secureTextEntry={!showPassword}
                            placeholder="Senha"
                            placeholderTextColor="#9bb3c9"
                            autoCapitalize="none"
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={18}
                                color="#5b7290"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Lembrar de mim (apenas visual, igual ao modelo) */}
                    <TouchableOpacity
                        style={styles.lembrarRow}
                        onPress={() => setLembrarMe(!lembrarMe)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, lembrarMe && styles.checkboxAtivo]}>
                            {lembrarMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                        </View>
                        <Text style={styles.lembrarText}>Lembrar de mim</Text>
                    </TouchableOpacity>

                    {/* Botão Login */}
                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['#5b8bd0', '#0d2b4e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Entrar</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },

    blob: {
        position: 'absolute',
        borderRadius: 999,
    },

    blobTopRight: {
        width: 280,
        height: 280,
        top: -100,
        right: -90,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },

    blobBottomLeft: {
        width: 380,
        height: 380,
        bottom: -160,
        left: -140,
        backgroundColor: 'rgba(13,43,78,0.30)',
        transform: [{ rotate: '12deg' }],
    },

    blobBottomLeftSmall: {
        width: 180,
        height: 180,
        bottom: -40,
        left: 60,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },

    centerWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 32,
        paddingVertical: 36,
        paddingHorizontal: 28,
        shadowColor: '#0d2b4e',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
    },

    avatar: {
        width: 64,
        height: 64,
        alignSelf: 'center',
        marginBottom: 8,
    },

    title: {
        textAlign: 'center',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#0d2b4e',
        marginBottom: 28,
    },

    inputGroup: {
        marginBottom: 16,
    },

    input: {
        height: 50,
        backgroundColor: '#eef1f5',
        borderRadius: 25,
        fontSize: 15,
        color: '#0d2b4e',
        paddingHorizontal: 20,
    },

    passwordGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef1f5',
        borderRadius: 25,
        paddingRight: 8,
    },

    passwordInput: {
        flex: 1,
        backgroundColor: 'transparent',
    },

    eyeButton: {
        paddingHorizontal: 10,
    },

    lembrarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },

    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#9bb3c9',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkboxAtivo: {
        backgroundColor: '#3a6cb5',
        borderColor: '#3a6cb5',
    },

    lembrarText: {
        fontSize: 13,
        color: '#5b7290',
    },

    button: {
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3a6cb5',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },

    forgotText: {
        textAlign: 'center',
        marginTop: 18,
        fontSize: 13,
        color: '#3a6cb5',
        fontWeight: '600',
    },
});