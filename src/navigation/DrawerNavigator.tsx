import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import { signOutFromApp } from '../firebaseAuth';
import { ADMIN_EMAIL } from '../firebaseAuth';

import MemeCreatorScreen from '../screens/MemeCreatorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InboxScreen from '../screens/anonymous/InboxScreen';
import SentScreen from '../screens/anonymous/SentScreen';
import AdminScreen from '../screens/anonymous/AdminScreen';

const Drawer = createDrawerNavigator();
const BLUE = '#15397F';
const RED = '#D7263D';
const WHITE = '#FFFFFF';

function CustomDrawerContent(props: any) {
  const user = getAuth().currentUser;
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: WHITE }}>
      {/* En-tête profil */}
      <View style={styles.header}>
        {user?.photoURL && <Image source={{ uri: user.photoURL }} style={styles.avatar} />}
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menu items */}
      {[
        { label: '🎭  Accueil', screen: 'Accueil' },
        { label: '👤  Profil', screen: 'Profil' },
        { label: '📥  Boîte de réception', screen: 'Réception' },
        { label: '📤  Messages envoyés', screen: 'Envoyés' },
      ].map(item => (
        <TouchableOpacity
          key={item.screen}
          style={styles.menuItem}
          onPress={() => props.navigation.navigate(item.screen)}
        >
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Admin seulement */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.menuItem, styles.adminItem]}
          onPress={() => props.navigation.navigate('Admin')}
        >
          <Text style={[styles.menuText, { color: RED }]}>🔐  Admin</Text>
        </TouchableOpacity>
      )}

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutItem} onPress={signOutFromApp}>
        <Text style={[styles.menuText, { color: RED }]}>🚪  Déconnexion</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: BLUE },
          headerTintColor: WHITE,
          headerTitleStyle: { fontWeight: '800' },
          drawerStyle: { width: 280 },
        }}
      >
        <Drawer.Screen name="Accueil" component={MemeCreatorScreen} options={{ title: '🎭 Meme App' }} />
        <Drawer.Screen name="Profil" component={ProfileScreen} options={{ title: '👤 Mon Profil' }} />
        <Drawer.Screen name="Réception" component={InboxScreen} options={{ title: '📥 Boîte de réception' }} />
        <Drawer.Screen name="Envoyés" component={SentScreen} options={{ title: '📤 Messages envoyés' }} />
        <Drawer.Screen name="Admin" component={AdminScreen} options={{ title: '🔐 Admin' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: BLUE, marginBottom: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  name: { color: WHITE, fontWeight: '800', fontSize: 16 },
  email: { color: '#ccd6f6', fontSize: 12 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F4FF' },
  adminItem: { borderTopWidth: 2, borderTopColor: '#F0F4FF', marginTop: 8 },
  menuText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  logoutItem: { paddingVertical: 14, paddingHorizontal: 20, marginTop: 16 },
});
