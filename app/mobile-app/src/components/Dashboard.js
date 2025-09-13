import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ayurvedic Herb Supply Chain</Text>
      <Button title="Register Collector" onPress={() => navigation.navigate('CollectorRegister')} />
      <Button title="Submit Collection Event" onPress={() => navigation.navigate('CollectionEventForm')} />
      <Button title="Scan QR Code" onPress={() => navigation.navigate('QRCodeScanner')} />
      <Button title="Recall Notifications" onPress={() => navigation.navigate('RecallNotification')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' }
});
