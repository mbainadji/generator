import { getFirestore, collection, doc, setDoc, getDocs, addDoc, query, where, orderBy, serverTimestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

export const ADMIN_EMAIL = 'mbainadjinehemi@gmail.com';

const db = getFirestore();

// Créer/mettre à jour le profil utilisateur à la connexion
export async function createUserProfile(user: any) {
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

// Récupérer tous les utilisateurs (admin seulement)
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => d.data());
}

// Envoyer un message anonyme
export async function sendAnonymousMessage(recipientUserId: string | null, message: string, senderInfo: any) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  await addDoc(collection(db, 'anonymous_messages'), {
    recipientUserId: recipientUserId || currentUser?.uid || null,
    message,
    senderUserId: currentUser?.uid || null,
    senderEmail: currentUser?.email || null,
    senderDisplayName: currentUser?.displayName || null,
    isStatusShare: recipientUserId === currentUser?.uid || recipientUserId === null,
    createdAt: serverTimestamp(),
    usedForMeme: false,
  });
}

// Récupérer les messages reçus
export async function getReceivedMessages(userId: string) {
  const q = query(
    collection(db, 'anonymous_messages'),
    where('recipientUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Récupérer les messages envoyés
export async function getSentMessages(userId: string) {
  const q = query(
    collection(db, 'anonymous_messages'),
    where('senderUserId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
