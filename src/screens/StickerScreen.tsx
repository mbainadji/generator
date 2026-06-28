import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { launchImageLibrary } from 'react-native-image-picker';
import { styles, COLORS, BG_COLORS, WHITE } from './StickerScreen.styles';
import { exportStickerPng, sendWebpToWhatsApp } from './StickerScreen.utils';

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

  const handleExport = () => exportStickerPng(viewShotRef);
  const handleWhatsApp = () => sendWebpToWhatsApp(viewShotRef);

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
      <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
        <Text style={styles.exportBtnText}>📤 Exporter & Partager</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#25D366', marginTop: 10 }]} onPress={handleWhatsApp}>
        <Text style={styles.exportBtnText}>💬 Envoyer comme Sticker WhatsApp</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
