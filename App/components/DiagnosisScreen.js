// screens/DiagnosisScreen.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function DiagnosisScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Diagnosis Type</Text>
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('SymptomForm')}
      >
        <MaterialCommunityIcons
          name="clipboard-pulse"
          size={32}
          color="#2A86FF"
        />
        <Text style={styles.optionText}>Symptom Analyzer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ImageDiagnosis')}
      >
        <MaterialCommunityIcons name="camera-iris" size={32} color="#2A86FF" />
        <Text style={styles.optionText}>Image Diagnosis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2A86FF',
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 30,
    marginVertical: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    width: '100%',
  },
  optionText: {
    marginLeft: 18,
    alignItems: 'center',
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
});
