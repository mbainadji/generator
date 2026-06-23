import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { getAllUsers, getReceivedMessages, getSentMessages } from '../../firebaseService';
import { ADMIN_EMAIL } from '../../firebaseAuth';
import { getAuth } from '@react-native-firebase/auth';

const BLUE = '#15397F';
const RED = '#D7263D';
const WHITE = '#FFFFFF';

export default function AdminScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalType, setModalType] = useState<'sent' | 'inbox' | null>(null);
  const [modalMessages, setModalMessages] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    getAllUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  const openModal = async (u: any, type: 'sent' | 'inbox') => {
    setSelectedUser(u);
    setModalType(type);
    setModalLoading(true);
    const msgs = type === 'inbox'
      ? await getReceivedMessages(u.uid)
      : await getSentMessages(u.uid);
    setModalMessages(msgs);
    setModalLoading(false);
  };

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <View style={styles.container}>
        <Text style={styles.denied}>⛔ Accès refusé</Text>
      </View>
    );
  }

  if (loading) return <ActivityIndicator size="large" color={BLUE} style={{ flex: 1, marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Admin — Tous les utilisateurs</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnBlue} onPress={() => openModal(item, 'sent')}>
                <Text style={styles.btnText}>📤 Envoyés</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnRed} onPress={() => openModal(item, 'inbox')}>
                <Text style={styles.btnText}>📥 Réception</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={!!modalType} animationType="slide" onRequestClose={() => setModalType(null)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            {modalType === 'inbox' ? '📥 Messages reçus' : '📤 Messages envoyés'} — {selectedUser?.displayName}
          </Text>
          {modalLoading ? (
            <ActivityIndicator size="large" color={BLUE} />
          ) : (
            <ScrollView>
              {modalMessages.length === 0 ? (
                <Text style={styles.empty}>Aucun message.</Text>
              ) : (
                modalMessages.map((msg: any) => (
                  <View key={msg.id} style={styles.msgCard}>
                    <Text style={styles.msgText}>💬 {msg.message}</Text>
                    {/* Identité visible seulement par admin */}
                    {modalType === 'inbox' && (
                      <Text style={styles.sender}>
                        👤 De : {msg.senderDisplayName || 'Anonyme'} ({msg.senderEmail || '?'})
                      </Text>
                    )}
                    <Text style={styles.date}>
                      {msg.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || ''}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalType(null)}>
            <Text style={styles.btnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 16, marginTop: 8 },
  denied: { fontSize: 18, color: RED, textAlign: 'center', marginTop: 40 },
  userCard: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: BLUE },
  userEmail: { fontSize: 12, color: '#5C6B87', marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnBlue: { flex: 1, backgroundColor: BLUE, padding: 10, borderRadius: 999, alignItems: 'center' },
  btnRed: { flex: 1, backgroundColor: RED, padding: 10, borderRadius: 999, alignItems: 'center' },
  btnText: { color: WHITE, fontWeight: '700', fontSize: 13 },
  modal: { flex: 1, padding: 16, backgroundColor: WHITE },
  modalTitle: { fontSize: 16, fontWeight: '800', color: BLUE, marginBottom: 16, marginTop: 40 },
  msgCard: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 14, marginBottom: 10 },
  msgText: { fontSize: 14, color: '#1a1a1a', marginBottom: 6 },
  sender: { fontSize: 12, color: RED, marginBottom: 4 },
  date: { fontSize: 11, color: '#5C6B87' },
  empty: { textAlign: 'center', color: '#5C6B87', marginTop: 40 },
  closeBtn: { backgroundColor: RED, padding: 14, borderRadius: 999, alignItems: 'center', marginTop: 16 },
});
