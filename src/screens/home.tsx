// src/screens/home.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const menuUser = [
    { label: 'Minhas Ocorrências', icon: 'people-outline', screen: 'TelaList' },
    { label: 'Abrir nova Ocorrência', icon: 'alert-circle-outline', screen: 'TelaOcorrencia' },
    { label: 'Contatos', icon: 'person-outline', screen: null }, // ainda não criada
    { label: 'Configurações', icon: 'settings-outline', screen: null }, // ainda não criada
];

const menuTecnico = [
    { label: 'Ocorrências abertas', icon: 'alert-circle-outline', screen: 'TelaListTecnico' },
    { label: 'Abrir nova Ocorrência', icon: 'alert-circle-outline', screen: 'TelaOcorrencia' },
    { label: 'Cadastro Técnicos', icon: 'document-text-outline', screen: 'CadastroTecnico' },
    { label: 'Listagem Técnicos', icon: 'document-text-outline', screen: 'ListagemTecnicos' },
    { label: 'Relatórios', icon: 'bar-chart-outline', screen: null }, // ainda não criada
    { label: 'Meu Perfil', icon: 'person-outline', screen: null }, // ainda não criada
];

export default function Home() {
    const navigation: any = useNavigation();
    const route: any = useRoute();

    const role = route?.params?.role ?? 'user';   // Pega role enviado pelo login

    const menuItems = role === 'tecnico' ? menuTecnico : menuUser;

    const handlePress = (screen: string | null) => {   // Função chamada ao clicar no card
        if (!screen) return;

        navigation.navigate(screen);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']}
                style={styles.header}
            >
                <Text style={styles.title}>SGO-Rodovias</Text>
                <Text style={styles.subtitle}>O que você precisa hoje?</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={`${item.label}-${index}`}
                        style={styles.card}
                        onPress={() => handlePress(item.screen)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconBadge}>
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color="#3a6cb5"
                            />
                        </View>
                        <Text style={styles.cardText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <LinearGradient
                colors={['#a9c6e8', '#5b8bd0', '#3a6cb5', '#0d2b4e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomBar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f7fb'
    },

    header: {
        paddingTop: 70,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#0d2b4e',
        textAlign: 'center'
    },

    subtitle: {
        fontSize: 14,
        color: '#1c3d5a',
        marginTop: 4,
        textAlign: 'center'
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 20,
        marginTop: 60,
        paddingBottom: 30,
    },

    card: {
        width: '47%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#0d2b4e',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#eaf2fb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    cardText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0d2b4e',
        textAlign: 'center',
        paddingHorizontal: 8,
    },

    bottomBar: {
        height: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
});