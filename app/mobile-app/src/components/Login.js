import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import api from '../services/api';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleLogin() {
    try {
      const token = await api.login(username, password);
      await api.storeToken(token);
      setError(null);
      navigation.navigate('Dashboard');
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} 
        style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} 
        style={styles.input} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginVertical: 10, borderWidth: 1, borderColor: '#ccc', padding: 10 },
  error: { color: 'red', marginTop: 10 }
});
