import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import api from '../services/api';

export default function ProvenanceDisplay({ route }) {
  const { batchId } = route.params;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProvenance(batchId)
      .then(jsonStr => setData(JSON.parse(jsonStr)))
      .catch(() => setError('Failed to load provenance data'));
  }, [batchId]);

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!data) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Provenance for Batch {batchId}</Text>
      <Text style={styles.text}>{JSON.stringify(data, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  heading: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  text: { fontFamily: 'monospace' },
  error: { color: 'red' }
});
