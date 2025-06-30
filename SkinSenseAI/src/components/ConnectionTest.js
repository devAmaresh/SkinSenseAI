import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import ApiService from '../services/api';

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setConnectionStatus('testing');
      const result = await ApiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setBackendHealth('Backend is running and accessible');
      } else {
        setConnectionStatus('failed');
        setBackendHealth(`Connection failed: Status ${result.status}`);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setBackendHealth(`Error: ${error.message}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#00ff00';
      case 'failed': return '#ff0000';
      default: return '#ffff00';
    }
  };

  return (
    <View style={{ padding: 20, margin: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Backend Connection Status
      </Text>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View 
          style={{ 
            width: 12, 
            height: 12, 
            borderRadius: 6, 
            backgroundColor: getStatusColor(),
            marginRight: 10 
          }} 
        />
        <Text style={{ color: 'white', flex: 1 }}>
          {connectionStatus === 'testing' ? 'Testing...' : 
           connectionStatus === 'connected' ? 'Connected' : 'Failed'}
        </Text>
      </View>
      
      {backendHealth && (
        <Text style={{ color: 'white', fontSize: 12, marginBottom: 10 }}>
          {backendHealth}
        </Text>
      )}
      
      <TouchableOpacity 
        onPress={testBackendConnection}
        style={{ 
          backgroundColor: 'rgba(0,245,255,0.2)', 
          padding: 10, 
          borderRadius: 5,
          borderWidth: 1,
          borderColor: 'rgba(0,245,255,0.4)'
        }}
      >
        <Text style={{ color: '#00f5ff', textAlign: 'center' }}>
          Test Connection
        </Text>
      </TouchableOpacity>
    </View>
  );
}