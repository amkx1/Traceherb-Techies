import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../services/api';

export default function CollectionEventForm() {
  const [species, setSpecies] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timestamp, setTimestamp] = useState('');

  async function handleSubmit() {
    const event = {
      collectorId: 'collector-id', // replace by real auth info
      species,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      quantity: parseFloat(quantity),
      unit: 'kg',
      quality: {},
      timestamp
    };

    try {
      await api.createCollection(event);
      Alert.alert('Success', 'Collection event recorded');
      setSpecies(''); setLatitude(''); setLongitude(''); setQuantity(''); setTimestamp('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Species" value={species} onChangeText={setSpecies} style={styles.input} />
      <TextInput placeholder="Latitude" value={latitude} onChangeText={setLatitude} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Longitude" value={longitude} onChangeText={setLongitude} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Quantity (kg)" value={quantity} onChangeText={setQuantity} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Timestamp (ISO 8601)" value={timestamp} onChangeText={setTimestamp} style={styles.input} />
      <Button title="Submit Collection" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 15, borderWidth: 1, borderColor: '#ccc', padding: 10 }
});
