import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import 'react-native-gesture-handler';