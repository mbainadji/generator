import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const BLUE = '#15397F';
const RED  = '#D7263D';
const WHITE = '#FFFFFF';

interface Props {
  recipientUid: string;
  onClose: () => void;
}

export default function SendMessageScreen({ recipientUid, onClose }: Props) {
  const [recipient, setRecipient] = useState<any>(null);
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sent, setSent]         = useState(false);

  useEffect(() => {
    firestore()
      .collection('users')
      .doc(recipientUid)
      .get()
      .then(doc => {
        if (doc.exists) setRecipient(doc.data());
        setLoadingUser(false);
      })
      .catch(() => setLoadingUser(false));
  }, [recipientUid]);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Message vide', "Écris quelque chose avant d'envoyer.");
      return;
    }
    setSending(true);
    try {
      await firestore().collection('anonymous_messages').add({
        recipientUserId: recipientUid,
        message: message.trim(),
        senderUserId: null,
        senderEmail: null,
        senderDisplayName: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        usedForMeme: false,
      });
      setSent(true);
    } catch (e) {
      Alert.alert('Erreur', "L'envoi a échoué. Réessaie.");
    } finally {
      setSending(false);
    }
  };

  if (loadingUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (sent) {
    return (
      <View style={styles.center}>
        <Text style={styles.sentEmoji}>✅</Text>
        <Text style={styles.sentTitle}>Message envoyé !</Text>
        <Text style={styles.sentSub}>
          {recipient?.displayName || "L'utilisateur"} recevra ton message de façon anonyme.
        </Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={onClose}>
          <Text style={styles.btnText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        {recipient?.photoURL ? (
          <Image source={{ uri: recipient.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarLetter}>
              {(recipient?.displayName || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.headerTitle}>Envoie un message anonyme à</Text>
        <Text style={styles.headerName}>{recipient?.displayName || 'Utilisateur inconnu'}</Text>
        <Text style={styles.headerSub}>Ton identité restera complètement cachée 👀</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Ton message</Text>
        <TextInput
          style={styles.input}
          placeholder="Écris ce que tu veux lui dire..."
          placeholderTextColor="#8b8fa8"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <Text style={styles.counter}>{message.length}/500</Text>
        <TouchableOpacity
          style={[styles.btnPrimary, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color={WHITE} />
            : <Text style={styles.btnText}>🚀 Envoyer anonymement</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
          <Text style={styles.btnCancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: WHITE },
  header: { backgroundColor: BLUE, padding: 28, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: { backgroundColor: RED, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: WHITE, fontSize: 32, fontWeight: '800' },
  headerTitle: { color: '#ccd6f6', fontSize: 13, marginBottom: 4 },
  headerName: { color: WHITE, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  headerSub: { color: '#ccd6f6', fontSize: 12 },
  card: { padding: 20, margin: 16, backgroundColor: '#F0F4FF', borderRadius: 16 },
  label: { fontSize: 14, fontWeight: '700', color: BLUE, marginBottom: 8 },
  input: {
    backgroundColor: WHITE, borderWidth: 2, borderColor: '#D9E2F1',
    borderRadius: 10, padding: 14, minHeight: 120,
    textAlignVertical: 'top', fontSize: 15, color: '#1a1a1a',
  },
  counter: { textAlign: 'right', color: '#8b8fa8', fontSize: 11, marginTop: 4, marginBottom: 16 },
  btnPrimary: { backgroundColor: RED, paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginBottom: 10 },
  btnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
  btnCancel: { paddingVertical: 10, alignItems: 'center' },
  btnCancelText: { color: '#5C6B87', fontSize: 14 },
  sentEmoji: { fontSize: 56, marginBottom: 16 },
  sentTitle: { fontSize: 22, fontWeight: '800', color: BLUE, marginBottom: 8 },
  sentSub: { color: '#5C6B87', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
});
