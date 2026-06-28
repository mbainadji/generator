import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getReceivedMessages } from '../../firebaseService';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import Share2 from 'react-native-share';

const BLUE = '#15397F';
const RED  = '#D7263D';
const WHITE = '#FFFFFF';
const LINK_BASE = 'https://meme-ictd-anonyme.web.app/msg';

export default function InboxScreen() {
  const [messages, setMessages]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const viewShotRef = useRef<ViewShotRef>(null);
  const user = getAuth().currentUser;
  const shareLink = `${LINK_BASE}/${user?.uid}`;

  const loadMessages = () => {
    if (user) {
      getReceivedMessages(user.uid)
        .then(msgs => {
          setMessages(msgs);
          setLoading(false);
          setRefreshing(false);
        })
        .catch(() => { setLoading(false); setRefreshing(false); });
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const onRefresh = () => { setRefreshing(true); loadMessages(); };

  const shareAsStatus = async (msg: any) => {
    setSelectedMsg(msg);
    setTimeout(async () => {
      try {
        if (!viewShotRef.current?.capture) return;
        const uri = await viewShotRef.current.capture();
        await Share2.open({
          url: `file://${uri}`,
          type: 'image/jpeg',
          message: shareLink,
        });
      } catch (e) {}
      setSelectedMsg(null);
    }, 300);
  };

  if (loading) return <ActivityIndicator size="large" color={BLUE} style={{ flex: 1, marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📥 Boîte de réception</Text>

      {selectedMsg && (
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.95 }}
          style={styles.hiddenShot}>
          <View style={styles.statusCard}>
            <Text style={styles.statusQuote}>💬</Text>
            <Text style={styles.statusMessage}>"{selectedMsg.message}"</Text>
            <Text style={styles.statusAuthor}>— Quelqu'un 👀</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.statusCta}>Envoie-moi un message anonyme :</Text>
            <Text style={styles.statusLink}>{shareLink}</Text>
          </View>
        </ViewShot>
      )}

      <TouchableOpacity style={styles.newMsgBtn} onPress={() => Share.share({
        message: `👀 Envoie-moi un message anonyme !\n\n${shareLink}`,
      })}>
        <Text style={styles.newMsgBtnText}>✉️ Nouveau message — partager mon lien</Text>
      </TouchableOpacity>

      {messages.length === 0 ? (
        <Text style={styles.empty}>Aucun message reçu pour l'instant.\nTire vers le bas pour rafraîchir.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.message}>💬 {item.message}</Text>
              <Text style={styles.date}>
                {item.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''}
              </Text>
              <TouchableOpacity style={styles.statusBtn} onPress={() => shareAsStatus(item)}>
                <Text style={styles.btnText}>🖼️ Nouveau statut</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Share.share({
                message: `💬 "${item.message}"\n\n— Quelqu'un 👀\n\nRéponds-moi aussi : ${shareLink}`,
              })}>
                <Text style={styles.btnText}>📤 Partager le texte</Text>
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
  newMsgBtn: { backgroundColor: RED, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginBottom: 16 },
  newMsgBtnText: { color: WHITE, fontWeight: '800', fontSize: 14 },
  statusBtn: { backgroundColor: RED, paddingVertical: 8, borderRadius: 999, alignItems: 'center', marginBottom: 8 },
  shareBtn: { backgroundColor: BLUE, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  btnText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  hiddenShot: { position: 'absolute', left: -9999, top: -9999, width: 400 },
  statusCard: { width: 400, padding: 40, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  statusQuote: { fontSize: 48, marginBottom: 16 },
  statusMessage: { fontSize: 20, color: WHITE, fontWeight: '700', textAlign: 'center', marginBottom: 16, lineHeight: 28 },
  statusAuthor: { fontSize: 14, color: '#ccd6f6', marginBottom: 24 },
  statusDivider: { width: 60, height: 2, backgroundColor: RED, marginBottom: 24 },
  statusCta: { fontSize: 12, color: '#ccd6f6', marginBottom: 8 },
  statusLink: { fontSize: 11, color: WHITE, fontWeight: '700', textAlign: 'center' },
});
