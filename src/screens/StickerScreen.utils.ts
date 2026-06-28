import { Alert, NativeModules, Platform } from 'react-native';
import Share2 from 'react-native-share';
import RNFS from 'react-native-fs';

const { WhatsAppStickerModule } = NativeModules;
const API_URL = 'https://onrender.com';

/**
 * Appelle le backend Render qui utilise la clé API Gemini pour générer une image de sticker
 */
export const generateAISticker = async (prompt: string): Promise<string | null> => {
  try {
    const res = await fetch(`${API_URL}/generate-ia-sticker`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur serveur (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    
    // Le serveur renverra l'image générée par Gemini au format base64
    if (data && data.image) {
      // Si la chaîne ne contient pas le préfixe data:image, on l'ajoute
      if (!data.image.startsWith('data:')) {
        return `data:image/png;base64,${data.image}`;
      }
      return data.image;
    } else {
      throw new Error("Aucune donnée d'image retournée par l'API Gemini.");
    }
  } catch (error: any) {
    console.error(error);
    Alert.alert('Erreur Gemini IA', error?.message || "Impossible de générer l'autocollant.");
    return null;
  }
};

export const exportStickerPng = async (viewShotRef: any) => {
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

export const sendWebpToWhatsApp = async (viewShotRef: any) => {
  try {
    if (!viewShotRef.current) return;
    if (Platform.OS !== 'android') {
      Alert.alert('Info', 'Cette fonctionnalité est uniquement disponible sur Android.');
      return;
    }

    Alert.alert('Traitement', 'Finalisation du pack WhatsApp...');
    const uri = await viewShotRef.current.capture();

    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/png',
      name: 'sticker.png',
    } as any);

    const res = await fetch(`${API_URL}/convert-sticker`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!res.ok) {
      throw new Error(`Le serveur distant a répondu avec le code : ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.sticker) {
      throw new Error('La conversion finale du pack a échoué.');
    }

    const targetDir = `${RNFS.CachesDirectoryPath}/stickers`;
    await RNFS.mkdir(targetDir);

    const stickerFileName1 = 'sticker_1.webp';
    const stickerFileName2 = 'sticker_2.webp';
    const stickerFileName3 = 'sticker_3.webp';

    const path1 = `${targetDir}/${stickerFileName1}`;
    const path2 = `${targetDir}/${stickerFileName2}`;
    const path3 = `${targetDir}/${stickerFileName3}`;

    const cleanBase64 = data.sticker.replace('data:image/webp;base64,', '');
    await RNFS.writeFile(path1, cleanBase64, 'base64');
    await RNFS.writeFile(path2, cleanBase64, 'base64');
    await RNFS.writeFile(path3, cleanBase64, 'base64');

    const contentsJson = {
      android_client_id: "com.ictd202.memesapp",
      ios_app_store_link: "",
      android_play_store_link: "",
      sticker_packs: [
        {
          identifier: "multimodal_pack_1",
          name: "Multimodal IA Stickers",
          publisher: "Multimodal App",
          tray_image_file: stickerFileName1,
          publisher_email: "",
          publisher_website: "",
          privacy_policy_website: "",
          license_agreement_website: "",
          image_data_version: "1",
          avoid_cache: true,
          animated_sticker_pack: false,
          stickers: [
            { image_file: stickerFileName1, emojis: ["✨", "🎨"] },
            { image_file: stickerFileName2, emojis: ["✨", "🎨"] },
            { image_file: stickerFileName3, emojis: ["✨", "🎨"] }
          ]
        }
      ]
    };

    await RNFS.writeFile(`${targetDir}/contents.json`, JSON.stringify(contentsJson), 'utf8');

    const result = await WhatsAppStickerModule.sendToWhatsApp("multimodal_pack_1", "Multimodal IA Stickers");
    console.log(result);
    Alert.alert('Succès', 'Sticker IA exporté vers WhatsApp !');

  } catch (e: any) {
    console.error(e);
    Alert.alert('Erreur technique', e?.message || "Échec de traitement réseau.");
  }
};
