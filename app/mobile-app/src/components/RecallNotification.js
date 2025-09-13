import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import api from '../services/api';

export default function RecallNotification() {
  const [recalls, setRecalls] = useState([]);

  useEffect(() => {
    api.getRecentRecalls()
      .then(setRecalls)
      .catch(() => setRecalls([]));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recall Notifications</Text>
      {recalls.length === 0 ? (
        <Text>No active recalls.</Text>
      ) : recalls.map(r => (
        <Text key={r.batchId} style={styles.record}>
          Batch {r.batchId} recalled on {r.date}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  record: { marginBottom: 10 }
});
