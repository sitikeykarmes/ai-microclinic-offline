import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import RNFS from 'react-native-fs';

let tfliteModel = null;
let symptomList = [];
let diseaseMap = {};

export default function SymptomDiagnosis() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        // Load TFLite model
        const model = await loadTensorflowModel(
          require('../../android/app/src/main/assets/disease_model.tflite'),
        );
        tfliteModel = model;

        // Load symptom and disease mappings
        const symptomRaw = await RNFS.readFileAssets('symptom_mapping.json');
        const diseaseRaw = await RNFS.readFileAssets('disease_mapping.json');
        symptomList = JSON.parse(symptomRaw);
        diseaseMap = JSON.parse(diseaseRaw);

        console.log('✅ Model and mappings loaded');
      } catch (err) {
        console.error('Load failed:', err);
        Alert.alert('Load error', err.message);
      }
    };
    initModel();
  }, []);

  const toggleSymptom = symptom => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom],
    );
  };

  const predictDisease = async () => {
    if (!tfliteModel) return;

    try {
      const input = symptomList.map(s =>
        selectedSymptoms.includes(s) ? 1 : 0,
      );

      const floatInput = new Float32Array(input);
      const output = await tfliteModel.run([floatInput]);

      const key = Object.keys(output)[0];
      const probs = output[key];

      const maxIdx = probs.indexOf(Math.max(...probs));
      const disease = diseaseMap[maxIdx];

      setPrediction(disease);
    } catch (err) {
      console.error('Prediction error:', err);
      Alert.alert('Prediction failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Symptom Diagnosis</Text>

      <ScrollView style={styles.scrollArea}>
        {symptomList.map((symptom, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.symptomButton,
              selectedSymptoms.includes(symptom) && styles.selectedSymptom,
            ]}
            onPress={() => toggleSymptom(symptom)}
          >
            <Text
              style={[
                styles.symptomText,
                selectedSymptoms.includes(symptom) && styles.selectedText,
              ]}
            >
              {symptom.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.diagnoseButton} onPress={predictDisease}>
        <Text style={styles.buttonText}>Diagnose</Text>
      </TouchableOpacity>

      {prediction && (
        <Text style={styles.result}>🧠 Prediction: {prediction}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  scrollArea: { marginBottom: 20 },
  symptomButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
  },
  selectedSymptom: {
    backgroundColor: '#a5d6a7',
  },
  symptomText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  diagnoseButton: {
    backgroundColor: '#2a86ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#2a86ff',
    textAlign: 'center',
  },
});
