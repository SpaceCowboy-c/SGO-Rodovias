import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function MinhasOcorrencias() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const renderItem = ({ item }: { item: any }) => {
        const ativo = item.status === 'ativo';
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>KM {item.km} • {item.tipo_problema}</Text>
                    <View style={[styles.badge, { backgroundColor: ativo ? '#2ecc71' : '#9aa5b1' }]}>
                        <Text style={styles.badgeText}>{ativo ? 'Ativo' : 'Finalizado'}</Text>
                    </View>
                </View>
                <Text style={styles.cardDescricao}>{item.descricao}</Text>
                <Text style={styles.cardInfo}>{formatarData(item.data)}</Text>
            </View>
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
});