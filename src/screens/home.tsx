// src/screens/home.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const menuItems = [
    { label: 'Minhas Ocorrências', icon: 'people-outline', screen: 'TelaList' },
    { label: 'Abrir nova Ocorrência', icon: 'alert-circle-outline', screen: 'Ocorrencia' },
    { label: 'Ocorrências abertas', icon: 'alert-circle-outline', screen: 'TelaListTecnico' },
    { label: 'Relatórios', icon: 'document-text-outline', screen: null },
];

export default function Home() {

    const navigation = useNavigation();
    const handlePress = (screen: string | null) => {
        if (!screen) return; // tela ainda não implementada
        navigation.navigate(screen as never);
    };
    
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#a9c6e8', '#5b8bd0', '#3a6cb5']} style={styles.header}>
                <Text style={styles.title}>SGO-Rodovias</Text>
                <Text style={styles.subtitle}>O que você precisa hoje?</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.grid}>
                {menuItems.map((item) => (
                    <TouchableOpacity key={item.label} style={styles.card} onPress={() => handlePress(item.screen)}>
                        <Ionicons name={item.icon as any} size={28} color="#0d2b4e" />
                        <Text style={styles.cardText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <LinearGradient colors={['#3a6cb5', '#5b8bd0', '#a9c6e8']} style={styles.footer}>
                <Ionicons name="location-outline" size={16} color="#fff" />
                <Text style={styles.footerText}>Av Independência, 160, Relvado - RS</Text>
            </LinearGradient>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fb' },

    header: {
        paddingTop: 70,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    title: { fontSize: 30, fontWeight: 'bold', color: '#0d2b4e', textAlign: 'center'},

    subtitle: { fontSize: 14, color: '#1c3d5a', marginTop: 4, textAlign: 'center' },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 20,
        marginTop: 60,
    },

    card: {
        width: '47%',
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    cardText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#0d2b4e' },

    footer: {
        height: 160,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 20,
    },

    footerText: {
        color: '#0d2b4e',
        fontSize: 16,
        fontWeight: '500',
    },

});