// ImageDiagnosisResult.js

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const DESCRIPTIONS = {
  pneumonia:
    'Pneumonia is a lung infection that inflames the air sacs. If detected early, it can be treated with antibiotics or antiviral medication.',
  skin: 'Skin cancer is the abnormal growth of skin cells. Early detection increases chances of successful treatment.',
  tb: 'Tuberculosis (TB) is a serious infectious disease that primarily affects the lungs. It spreads through airborne droplets and requires a combination of antibiotics for effective treatment.',
};

export default function ImageDiagnosisResult({ route }) {
  const { imageUri, label, confidence, diagnosisType } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Diagnosis Result</Text>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Text style={styles.resultText}>
        Result: <Text style={styles.bold}>{label}</Text>
      </Text>
      <Text style={styles.confidenceText}>
        Confidence: {confidence.toFixed(2)}%
      </Text>
      <Text style={styles.description}>
        {DESCRIPTIONS[diagnosisType] || 'No description available.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  image: {
    width: 224,
    height: 224,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    color: '#28a745',
  },
  confidenceText: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});
