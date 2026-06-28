import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, Share
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { launchImageLibrary } from 'react-native-image-picker';
import Share2 from 'react-native-share';

const BLUE = '#15397F';
const RED = '#D7263D';
const WHITE = '#FFFFFF';

const COLORS = ['#FFFFFF', '#000000', '#FFD700', '#FF6B6B', '#4ECDC4', '#15397F', '#D7263D', '#2ECC71'];
const BG_COLORS = ['transparent', '#FFD700', '#FF6B6B', '#4ECDC4', '#15397F', '#000000', '#FFFFFF', '#2ECC71'];

export default function StickerScreen() {
  const viewShotRef = useRef<any>(null);
  const [stickerText, setStickerText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#15397F');
  const [fontSize, setFontSize] = useState(32);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets[0]?.uri) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  };

  const exportSticker = async () => {
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture();
      await Share2.open({
        title: 'Sticker Multimodal',
        url: `file://${uri}`,
        type: 'image/png',
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'exporter le sticker.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>🎨 Créateur de Sticker</Text>

      {/* Aperçu du sticker */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={[styles.preview, { backgroundColor: bgColor === 'transparent' ? '#f0f0f0' : bgColor }]}
      >
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
        )}
        {stickerText !== '' && (
          <Text style={[styles.stickerText, { color: textColor, fontSize }]}>
            {stickerText}
          </Text>
        )}
        {!selectedImage && stickerText === '' && (
          <Text style={{ color: '#aaa', fontSize: 14 }}>Aperçu du sticker</Text>
        )}
      </ViewShot>

      {/* Texte */}
      <View style={styles.card}>
        <Text style={styles.label}>✏️ Texte du sticker</Text>
        <TextInput
          style={styles.input}
          placeholder="Écris ton texte ici..."
          placeholderTextColor="#6b6b7a"
          value={stickerText}
          onChangeText={setStickerText}
          multiline
        />

        {/* Taille du texte */}
        <Text style={styles.label}>Taille : {fontSize}px</Text>
        <View style={styles.sizeRow}>
          {[20, 28, 36, 48, 64].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeBtn, fontSize === s && styles.sizeBtnActive]}
              onPress={() => setFontSize(s)}
            >
              <Text style={[styles.sizeBtnText, fontSize === s && { color: WHITE }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Couleur du texte */}
        <Text style={styles.label}>Couleur du texte</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, textColor === c && styles.colorDotSelected]}
              onPress={() => setTextColor(c)}
            />
          ))}
        </View>
      </View>

      {/* Fond */}
      <View style={styles.card}>
        <Text style={styles.label}>🎨 Couleur de fond</Text>
        <View style={styles.colorRow}>
          {BG_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c === 'transparent' ? '#f0f0f0' : c },
                bgColor === c && styles.colorDotSelected
              ]}
              onPress={() => setBgColor(c)}
            >
              {c === 'transparent' && <Text style={{ fontSize: 10 }}>∅</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Image de fond */}
        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>🖼️ Choisir une image</Text>
        </TouchableOpacity>
        {selectedImage && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#aaa', marginTop: 8 }]} onPress={() => setSelectedImage(null)}>
            <Text style={styles.btnText}>❌ Supprimer l'image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Export */}
      <TouchableOpacity style={styles.exportBtn} onPress={exportSticker}>
        <Text style={styles.exportBtnText}>📤 Exporter & Partager le Sticker</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 16, marginTop: 8, textAlign: 'center' },
  preview: {
    width: 280, height: 280, alignSelf: 'center', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    overflow: 'hidden', elevation: 4,
  },
  previewImage: { position: 'absolute', width: '100%', height: '100%' },
  stickerText: { fontWeight: '900', textAlign: 'center', padding: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  card: { backgroundColor: '#F0F4FF', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: BLUE, marginBottom: 8 },
  input: {
    backgroundColor: WHITE, borderRadius: 8, padding: 12,
    minHeight: 80, textAlignVertical: 'top', fontSize: 15, color: '#1a1a1a', marginBottom: 12,
  },
  sizeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  sizeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: WHITE, borderWidth: 1, borderColor: BLUE },
  sizeBtnActive: { backgroundColor: BLUE },
  sizeBtnText: { color: BLUE, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: RED },
  btn: { backgroundColor: BLUE, padding: 12, borderRadius: 999, alignItems: 'center' },
  btnText: { color: WHITE, fontWeight: '700' },
  exportBtn: { backgroundColor: RED, padding: 16, borderRadius: 999, alignItems: 'center', marginTop: 8 },
  exportBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
});
