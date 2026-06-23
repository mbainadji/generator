import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getSentMessages } from '../../firebaseService';

const BLUE = '#15397F';
const WHITE = '#FFFFFF';

export default function SentScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      getSentMessages(user.uid).then(msgs => {
        setMessages(msgs);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, []);

  if (loading) return <ActivityIndicator size="large" color={BLUE} style={{ flex: 1, marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📤 Messages envoyés</Text>
      {messages.length === 0 ? (
        <Text style={styles.empty}>Tu n'as encore envoyé aucun message anonyme.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.to}>À : {item.recipientUserId}</Text>
              <Text style={styles.message}>💬 {item.message}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''}
              </Text>
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
  empty: { textAlign: 'center', color: '#5C6B87', marginTop: 40 },
  card: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 12 },
  to: { fontSize: 11, color: '#5C6B87', marginBottom: 4 },
  message: { fontSize: 15, color: '#1a1a1a', marginBottom: 8 },
  date: { fontSize: 11, color: '#5C6B87' },
});
