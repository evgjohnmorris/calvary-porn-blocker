import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, Switch, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

const App = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  
  // Hardcoded for demo, normally stored securely
  const CORRECT_PIN = '1234'; 

  useEffect(() => {
    // In a full implementation, this would fetch status from the native module
    // e.g., NativeModules.VpnManager.getStatus()
    setLogs(['[System] Initialized', '[DNS] Blocklist loaded']);
  }, []);

  const handleUnlock = () => {
    if (pinInput === CORRECT_PIN) {
      setIsLocked(false);
      setPinInput('');
      Alert.alert('Unlocked', 'You can now change settings.');
    } else {
      Alert.alert('Error', 'Incorrect PIN');
      setPinInput('');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
  };

  const toggleSwitch = () => {
    if (isLocked) {
      Alert.alert('Locked', 'Please unlock settings with your PIN first.');
      return;
    }
    setIsEnabled(previousState => {
      const newState = !previousState;
      // Call native module to start/stop VPN or Network Extension
      // NativeModules.VpnManager.toggleProtection(newState);
      setLogs(prev => [`[Action] Protection ${newState ? 'Enabled' : 'Disabled'}`, ...prev]);
      return newState;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Calvary Blocker</Text>
          <Text style={styles.subtitle}>Protection is currently {isEnabled ? 'Active' : 'Inactive'}</Text>
        </View>

        {isLocked ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Settings Locked</Text>
            <Text style={styles.description}>Enter PIN to modify protection settings.</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={pinInput}
              onChangeText={setPinInput}
              placeholder="Enter PIN (1234)"
            />
            <TouchableOpacity style={styles.button} onPress={handleUnlock}>
              <Text style={styles.buttonText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shield Status</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enable Protection</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
            <TouchableOpacity style={[styles.button, { marginTop: 20, backgroundColor: '#4b5563' }]} onPress={handleLock}>
              <Text style={styles.buttonText}>Lock Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity Logs</Text>
          <View style={styles.logContainer}>
            {logs.length === 0 ? (
              <Text style={styles.logText}>No recent blocks.</Text>
            ) : (
              logs.map((log, i) => <Text key={i} style={styles.logText}>{log}</Text>)
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonText}>Accountability Partner Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#f9fafb',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  logContainer: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 8,
    minHeight: 100,
  },
  logText: {
    color: '#10b981',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default App;
