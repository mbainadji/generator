import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { signOutFromApp } from '../firebaseAuth';

const BLUE = '#15397F';
const RED = '#D7263D';
const WHITE = '#FFFFFF';

const APP_LINK_BASE = 'https://meme-ictd-anonyme.web.app/msg';

export default function ProfileScreen() {
  const user = getAuth().currentUser;
  const shareLink = `${APP_LINK_BASE}/${user?.uid}`;

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Envoie-moi un message anonyme 👀\n${shareLink}`,
        title: 'Mon lien de messages anonymes',
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de partager le lien.');
    }
  };

  return (
    <View style={styles.container}>
      {user?.photoURL && (
        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
      )}
      <Text style={styles.name}>{user?.displayName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.linkBox}>
        <Text style={styles.linkLabel}>Ton lien partageable</Text>
        <Text style={styles.link} numberOfLines={2}>{shareLink}</Text>
        <TouchableOpacity style={styles.btn} onPress={handleShareLink}>
          <Text style={styles.btnText}>📤  Partager mon lien</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOutFromApp}>
        <Text style={styles.btnText}>🚪  Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, alignItems: 'center', padding: 24, paddingTop: 48 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', color: BLUE, marginBottom: 4 },
  email: { fontSize: 13, color: '#5C6B87', marginBottom: 24 },
  linkBox: { width: '100%', backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 16 },
  linkLabel: { fontSize: 13, fontWeight: '700', color: BLUE, marginBottom: 6 },
  link: { fontSize: 12, color: '#5C6B87', marginBottom: 12 },
  btn: { backgroundColor: BLUE, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  logoutBtn: { backgroundColor: RED, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 999, marginTop: 8 },
  btnText: { color: WHITE, fontWeight: '800', fontSize: 14 },
});
