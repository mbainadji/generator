import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import LoginScreen from './src/screens/LoginScreen';
import MemeCreatorScreen from './src/screens/MemeCreatorScreen';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#15397F" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <MemeCreatorScreen />;
}
