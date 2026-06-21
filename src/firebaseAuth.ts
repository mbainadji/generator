import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const ADMIN_EMAIL = 'mbainadjinehemi@gmail.com';

GoogleSignin.configure({
  webClientId: '1091172594695-l45qv77hljo753j27brfcufe4dcno0d8.apps.googleusercontent.com',
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult: any = await GoogleSignin.signIn();
  // Compatible avec les deux formats de réponse selon la version du SDK
  const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
  if (!idToken) {
    throw new Error('Connexion Google annulée ou idToken manquant.');
  }
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(googleCredential);
}

export async function signOutFromApp() {
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    // déjà déconnecté côté Google, on ignore
  }
  await auth().signOut();
}
