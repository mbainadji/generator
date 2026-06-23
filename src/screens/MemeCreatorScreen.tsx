import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Image, ScrollView, ActivityIndicator, Alert, Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AudioRecord from 'react-native-audio-record';
import Share from 'react-native-share';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { useShareIntent, getInitialShare, ShareIntentUtils, SharePayload } from 'react-native-nitro-share-intent';

const API_URL = 'http://192.168.88.240:3000/api';

type Tab = 'texte' | 'voix' | 'image';

export default function MemeCreatorScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('texte');
  const [textContext, setTextContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [memeResult, setMemeResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const viewShotRef = React.useRef<ViewShotRef>(null);

  const handleIncomingShare = (payload: SharePayload) => {
    if (ShareIntentUtils.isTextShare(payload) && payload.text) {
      setTextContext(payload.text);
      setActiveTab('texte');
    } else if (ShareIntentUtils.isFileShare(payload) && payload.files && payload.files[0]) {
      const fileUri = payload.files[0];
      if (ShareIntentUtils.isImageFile(fileUri)) {
        setSelectedImage(fileUri);
        setActiveTab('image');
      }
    }
  };

  useShareIntent(handleIncomingShare);

  useEffect(() => {
    getInitialShare().then((initial) => {
      if (initial) handleIncomingShare(initial);
    });
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission microphone',
            message: "L'app a besoin d'accéder au micro pour l'enregistrement vocal.",
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission refusée', 'Le micro est nécessaire pour cette fonctionnalité.');
          return;
        }
      }
      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'voice_meme.wav',
      };
      AudioRecord.init(options);
    };
    setupAudio();
  }, []);

  const handleTextSubmit = async () => {
    if (!textContext.trim()) return;
    setLoading(true);
    setMemeResult(null);
    try {
      const response = await fetch(`${API_URL}/context-reader`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContext }),
      });
      const data = await response.json();
      setMemeResult(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le backend Express. Vérifie ton serveur.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    try {
      setIsRecording(true);
      AudioRecord.start();
    } catch (err) {
      Alert.alert('Erreur Micro', "Impossible de démarrer l'enregistrement.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      const audioFileUri = await AudioRecord.stop();
      if (audioFileUri) sendAudioToBackend(audioFileUri);
    } catch (err) {
      Alert.alert('Erreur', 'Échec de la récupération du fichier audio.');
    }
  };

  const sendAudioToBackend = async (uri: string) => {
    setLoading(true);
    setMemeResult(null);
    const formData = new FormData();
    formData.append('audio', {
      uri: Platform.OS === 'android' ? `file://${uri}` : uri,
      type: 'audio/wav',
      name: 'voice_meme.wav',
    } as any);
    try {
      const response = await fetch(`${API_URL}/voice-to-meme`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      setMemeResult(data.meme);
      Alert.alert('Transcription Réussie', `Tu as dit : "${data.transcription}"`);
    } catch (error) {
      Alert.alert('Erreur', 'Échec du traitement audio par Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets[0] && response.assets[0].uri) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  const generateImageAI = async () => {
    if (!imagePrompt.trim()) return;
    setGeneratingImage(true);
    try {
      const response = await fetch(`${API_URL}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await response.json();
      if (data.image) {
        setSelectedImage(data.image);
      } else {
        Alert.alert('Erreur', data.error || "Échec de la génération d'image.");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le backend Express. Vérifie ton serveur.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const shareMeme = async () => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) return;
      const uri = await viewShotRef.current.capture();
      await Share.open({
        title: 'Meme ICT202',
        message: `🔥 ${memeResult?.topText} \n\n ${memeResult?.bottomText}`,
        url: Platform.OS === 'android' ? `file://${uri}` : uri,
        type: 'image/jpeg',
      });
    } catch (error) {
      console.log('Partage annulé', error);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'texte', label: 'T  Texte' },
    { key: 'voix', label: '🎤  Voix' },
    { key: 'image', label: '📤  Image' },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>🎭 G2 Meme Multimodal</Text>
        <View style={styles.tabBar}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          {activeTab === 'texte' && (
            <>
              <Text style={styles.cardLabel}>Colle un extrait de discussion</Text>
              <TextInput
                style={styles.input}
                placeholder={`Ex: « Frère je te jure j'avais dit à 18h... »`}
                placeholderTextColor="#6b6b7a"
                value={textContext}
                onChangeText={setTextContext}
                multiline
              />
              <TouchableOpacity style={styles.forgeBtn} onPress={handleTextSubmit}>
                <Text style={styles.forgeBtnText}>✨  Forger le meme</Text>
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'voix' && (
            <>
              <Text style={styles.cardLabel}>Enregistre ta voix</Text>
              <Text style={styles.cardHint}>Raconte la situation à voix haute, l'IA transcrit et génère le mème.</Text>
              <TouchableOpacity
                style={[styles.forgeBtn, isRecording && styles.forgeBtnRecording]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Text style={styles.forgeBtnText}>
                  {isRecording ? '🛑  Arrêter & Envoyer' : '🎙️  Enregistrer la voix'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'image' && (
            <>
              <Text style={styles.cardLabel}>Choisis une image de fond</Text>
              <Text style={styles.cardHint}>
                {selectedImage ? 'Image sélectionnée ✓' : 'Aucune image choisie pour le moment.'}
              </Text>
              <TouchableOpacity style={styles.forgeBtn} onPress={pickImage}>
                <Text style={styles.forgeBtnText}>🖼️  Choisir depuis la galerie</Text>
              </TouchableOpacity>
              <Text style={[styles.cardLabel, { marginTop: 20 }]}>Ou génère-la avec l'IA</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: un chat surpris devant un ordinateur, style cartoon"
                placeholderTextColor="#6b6b7a"
                value={imagePrompt}
                onChangeText={setImagePrompt}
                multiline
              />
              <TouchableOpacity
                style={[styles.forgeBtn, styles.forgeBtnRecording]}
                onPress={generateImageAI}
                disabled={generatingImage}
              >
                <Text style={styles.forgeBtnText}>
                  {generatingImage ? 'Génération en cours...' : "✨  Générer avec l'IA"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {loading && <ActivityIndicator size="large" color="#15397F" style={{ marginTop: 24 }} />}
        {memeResult && !loading && (
          <View style={styles.memeContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.memeShot}>
              <Text style={styles.memeTopText}>{memeResult.topText?.toUpperCase()}</Text>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.memeImage} />
              ) : (
                <View style={[styles.memeImage, { backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#ffffff55', fontSize: 12 }}>Aucune image — onglet Image pour en ajouter une</Text>
                </View>
              )}
              <Text style={styles.memeBottomText}>{memeResult.bottomText?.toUpperCase()}</Text>
            </ViewShot>
            <TouchableOpacity style={styles.shareBtn} onPress={shareMeme}>
              <Text style={styles.forgeBtnText}>🚀  Partager le Statut</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const RED = '#D7263D';
const BLUE = '#15397F';
const WHITE = '#FFFFFF';
const BORDER = '#D9E2F1';
const MUTED = '#5C6B87';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WHITE },
  container: { flex: 1, backgroundColor: WHITE, padding: 18 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginVertical: 16, color: BLUE },
  tabBar: { flexDirection: 'row', backgroundColor: WHITE, borderRadius: 999, padding: 4, borderWidth: 2, borderColor: BLUE, marginBottom: 18 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  tabActive: { backgroundColor: BLUE },
  tabText: { color: BLUE, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: WHITE, fontWeight: '800' },
  card: { backgroundColor: WHITE, padding: 18, borderRadius: 16, borderWidth: 2, borderColor: BORDER, marginBottom: 18 },
  cardLabel: { fontSize: 15, fontWeight: '700', marginBottom: 10, color: BLUE },
  cardHint: { fontSize: 13, color: MUTED, marginBottom: 16 },
  input: { backgroundColor: WHITE, borderWidth: 2, borderColor: BORDER, borderRadius: 10, padding: 12, minHeight: 100, textAlignVertical: 'top', color: '#1a1a1a', fontSize: 14 },
  forgeBtn: { backgroundColor: RED, paddingVertical: 14, borderRadius: 999, marginTop: 16, alignItems: 'center' },
  forgeBtnRecording: { backgroundColor: BLUE },
  forgeBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
  memeContainer: { backgroundColor: BLUE, padding: 10, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  memeShot: { width: '100%' },
  memeImage: { width: '100%', height: 300, resizeMode: 'cover', opacity: 0.85 },
  memeTopText: { color: WHITE, fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', top: 25, zIndex: 10, width: '90%', alignSelf: 'center', textShadowColor: '#000', textShadowRadius: 6 },
  memeBottomText: { color: WHITE, fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', bottom: 25, zIndex: 10, width: '90%', alignSelf: 'center', textShadowColor: '#000', textShadowRadius: 6 },
  shareBtn: { backgroundColor: RED, padding: 12, borderRadius: 999, marginTop: 12, width: '100%', alignItems: 'center' },
});
