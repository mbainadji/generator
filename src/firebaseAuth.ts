import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithCredential, GoogleAuthProvider, signOut } from '@react-native-firebase/auth';

export const ADMIN_EMAIL = 'mbainadjinehemi@gmail.com';

GoogleSignin.configure({
  webClientId: '1091172594695-l45qv77hljo753j27brfcufe4dcno0d8.apps.googleusercontent.com',
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult: any = await GoogleSignin.signIn();
  const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
  if (!idToken) throw new Error('Connexion Google annulée ou idToken manquant.');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(getAuth(), credential);
}

export async function signOutFromApp() {
  try { await GoogleSignin.signOut(); } catch (e) {}
  await signOut(getAuth());
}
