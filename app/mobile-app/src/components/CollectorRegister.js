import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../services/api';

export default function CollectorRegister() {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [location, setLocation] = useState('');

  async function handleRegister() {
    try {
      await api.registerCollector({ id: Date.now().toString(), name, org, location });
      Alert.alert('Success', 'Collector registered');
      setName(''); setOrg(''); setLocation('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Organization" value={org} onChangeText={setOrg} style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <Button title="Register Collector" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 15, borderWidth: 1, borderColor: '#ccc', padding: 10 }
});
