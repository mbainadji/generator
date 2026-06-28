import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Share, KeyboardAvoidingView, Platform
} from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getSentMessages, sendAnonymousMessage } from '../../firebaseService';

const BLUE = '#15397F';
const RED  = '#D7263D';
const WHITE = '#FFFFFF';
const LINK_BASE = 'https://meme-ictd-anonyme.web.app/msg';

export default function SentScreen() {
  const [messages, setMessages]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage]     = useState('');
  const user = getAuth().currentUser;
  const shareLink = `${LINK_BASE}/${user?.uid}`;

  useEffect(() => {
    if (user) {
      getSentMessages(user.uid)
        .then(msgs => { setMessages(msgs); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, []);

  const handleShare = async () => {
    if (!newMessage.trim()) return;
    try {
      // Sauvegarder dans Firestore avant de partager
      await sendAnonymousMessage(user?.uid || '', newMessage.trim(), {});
      // Recharger la liste
      const msgs = await getSentMessages(user?.uid || '');
      setMessages(msgs);
      // Partager sur les réseaux
      await Share.share({
        message: `💬 "${newMessage.trim()}"

👀 Réponds-moi anonymement :
${shareLink}`,
      });
    } catch (e) {}
    setNewMessage('');
    setModalVisible(false);
  };

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

      {/* Bouton + en bas à droite */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>✏️</Text>
      </TouchableOpacity>

      {/* Modal nouveau message */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'android' ? 'height' : 'padding'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>✉️ Nouveau message</Text>
            <Text style={styles.modalSub}>
              Écris un message à partager sur ton statut.{'\n'}
              Ton lien de réponse sera ajouté automatiquement en bas.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Écris ton message ici..."
              placeholderTextColor="#8b8fa8"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={300}
              autoFocus
            />
            <Text style={styles.counter}>{newMessage.length}/300</Text>

            <View style={styles.modalLink}>
              <Text style={styles.modalLinkLabel}>🔗 Lien ajouté automatiquement :</Text>
              <Text style={styles.modalLinkText} numberOfLines={1}>{shareLink}</Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Partager sur mon statut</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setNewMessage(''); }}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    backgroundColor: RED, width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 6,
  },
  fabText: { fontSize: 22 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: {
    backgroundColor: WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#5C6B87', marginBottom: 16, lineHeight: 20 },
  input: {
    backgroundColor: '#F0F4FF', borderRadius: 12, padding: 14,
    minHeight: 100, textAlignVertical: 'top', fontSize: 15, color: '#1a1a1a',
  },
  counter: { textAlign: 'right', color: '#8b8fa8', fontSize: 11, marginTop: 4, marginBottom: 12 },
  modalLink: { backgroundColor: '#E8F0FE', borderRadius: 8, padding: 10, marginBottom: 16 },
  modalLinkLabel: { fontSize: 11, color: BLUE, fontWeight: '700', marginBottom: 2 },
  modalLinkText: { fontSize: 11, color: '#5C6B87' },
  shareBtn: { backgroundColor: RED, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginBottom: 10 },
  shareBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: '#5C6B87', fontSize: 14 },
});
