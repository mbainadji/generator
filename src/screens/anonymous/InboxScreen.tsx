import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Share, Alert } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getReceivedMessages } from '../../firebaseService';

const BLUE = '#15397F';
const RED = '#D7263D';
const WHITE = '#FFFFFF';

export default function InboxScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      getReceivedMessages(user.uid).then(msgs => {
        setMessages(msgs);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  const shareMessage = async (msg: any) => {
    try {
      await Share.share({
        message: `💬 "${msg.message}"\n\n— Quelqu'un 👀\n\nRéponds-moi aussi : https://memeapp-ictd.web.app/msg/${user?.uid}`,
      });
    } catch (e) {}
  };

  if (loading) return <ActivityIndicator size="large" color={BLUE} style={{ flex: 1, marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📥 Boîte de réception</Text>
      {messages.length === 0 ? (
        <Text style={styles.empty}>Aucun message reçu pour l'instant.\nPartage ton lien pour en recevoir !</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.message}>💬 {item.message}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''}
              </Text>
              <TouchableOpacity style={styles.shareBtn} onPress={() => shareMessage(item)}>
                <Text style={styles.shareBtnText}>📤 Partager sur mes réseaux</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 16, marginTop: 8 },
  empty: { textAlign: 'center', color: '#5C6B87', marginTop: 40, lineHeight: 24 },
  card: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 12 },
  message: { fontSize: 15, color: '#1a1a1a', marginBottom: 8, lineHeight: 22 },
  date: { fontSize: 11, color: '#5C6B87', marginBottom: 10 },
  shareBtn: { backgroundColor: BLUE, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  shareBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },
});
