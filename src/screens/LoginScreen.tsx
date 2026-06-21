import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { signInWithGoogle } from '../firebaseAuth';

const RED = '#D7263D';
const BLUE = '#15397F';
const WHITE = '#FFFFFF';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Connexion échouée', error?.message ?? 'Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 Meme App ICTD</Text>
      <Text style={styles.subtitle}>
        Connecte-toi pour créer des memes et recevoir des messages anonymes
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={WHITE} />
        ) : (
          <Text style={styles.buttonText}>Se connecter avec Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: BLUE, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#5C6B87', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: RED, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999 },
  buttonText: { color: WHITE, fontWeight: '800', fontSize: 15 },
});
