import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

export const ADMIN_EMAIL = 'mbainadjinehemi@gmail.com';

// Créer/mettre à jour le profil utilisateur à la connexion
export async function createUserProfile(user: any) {
  await firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

// Récupérer tous les utilisateurs (admin seulement)
export async function getAllUsers() {
  const snap = await firestore().collection('users').get();
  return snap.docs.map(d => d.data());
}

// Envoyer un message anonyme à un utilisateur
export async function sendAnonymousMessage(recipientUserId: string, message: string, senderInfo: any) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  await firestore().collection('anonymous_messages').add({
    recipientUserId,
    message,
    senderUserId: currentUser?.uid || null,
    senderEmail: currentUser?.email || null, // visible admin seulement
    senderDisplayName: currentUser?.displayName || null, // visible admin seulement
    createdAt: firestore.FieldValue.serverTimestamp(),
    usedForMeme: false,
  });
}

// Récupérer les messages reçus d'un utilisateur
export async function getReceivedMessages(userId: string) {
  const snap = await firestore()
    .collection('anonymous_messages')
    .where('recipientUserId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Récupérer les messages envoyés par un utilisateur
export async function getSentMessages(userId: string) {
  const snap = await firestore()
    .collection('anonymous_messages')
    .where('senderUserId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
