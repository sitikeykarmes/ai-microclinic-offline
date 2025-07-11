import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { preprocessImage } from '../utils/imageUtils';
import { loadModel, runModel } from '../models/ModelManager';

export default function ImageDiagnosis() {
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState('');
  const [diagnosisType, setDiagnosisType] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false);

  const diagnosisOptions = [
    { key: 'skin', label: 'Skin Cancer' },
    { key: 'pneumonia', label: 'Chest X-ray (Pneumonia)' },
    { key: 'tb', label: 'Chest X-ray (Tuberculosis)' },
    { key: 'wound', label: 'Wound Detection' },
  ];

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        includeBase64: true,
        maxWidth: 224,
        maxHeight: 224,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
          setImageName(response.assets[0].fileName || 'Selected Image');
        }
      },
    );
  };

  const handleModelSelection = async type => {
    setDiagnosisType(type);
    try {
      await loadModel(type);
      setModelLoaded(true);
    } catch (err) {
      Alert.alert('Model Load Failed', err.message);
    }
  };

  const handleDiagnose = async () => {
    try {
      // Set inputSize based on model
      let inputSize = 224;
      if (diagnosisType === 'wound') inputSize = 299;

      const input = await preprocessImage(imageUri, inputSize, diagnosisType);
      const outputObj = await runModel(diagnosisType, input);
      const output = Object.values(outputObj)[0];

      let label, confidence;

      if (diagnosisType === 'wound') {
        // Example: Suppose your wound model predicts among 3 classes
        // You must map the output index to class label
        // Replace with your actual wound class labels:
        const woundLabels = [
          'Abrasions',
          'Bruises',
          'Burns',
          'Cut',
          'Diabetic Wounds',
          'Ingrown_nails',
          'Laseration',
          'Normal',
          'Pressure Wounds',
          'Stab_wound',
          'Surgical Wounds',
          'Venous Wounds',
        ];
        const predictedIndex = output.indexOf(Math.max(...output));
        label = woundLabels[predictedIndex];
        confidence = output[predictedIndex] * 100;
      } else if (output.length === 1) {
        if (diagnosisType === 'pneumonia') {
          label = output[0] >= 0.5 ? 'Pneumonia' : 'Normal';
        } else if (diagnosisType === 'skin') {
          label = output[0] >= 0.5 ? 'Malignant' : 'Benign';
        } else if (diagnosisType === 'tb') {
          label = output[0] >= 0.5 ? 'TB Detected' : 'Normal';
        }
        confidence = (output[0] >= 0.5 ? output[0] : 1 - output[0]) * 100;
      }

      navigation.navigate('ImageDiagnosisResult', {
        imageUri,
        label,
        confidence,
        diagnosisType,
      });
    } catch (err) {
      Alert.alert('Diagnosis Failed', err.message);
    }
  };

  const canDiagnose = imageUri && modelLoaded;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Image Diagnosis</Text>

      <Text style={styles.sectionLabel}>Upload Image</Text>
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {imageUri ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                setImageUri(null);
                setImageName('');
                setModelLoaded(false);
              }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.uploadText}>
              Tap to upload an image for diagnosis
            </Text>
            <View style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* 👇 Image Name Below Image */}
      {imageUri && imageName ? (
        <Text style={styles.imageName}>{imageName}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>Select Model</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={diagnosisType}
          onValueChange={value => {
            if (value !== '') handleModelSelection(value);
          }}
        >
          <Picker.Item label="Select Model" value="" />
          {diagnosisOptions.map(option => (
            <Picker.Item
              key={option.key}
              label={option.label}
              value={option.key}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[styles.diagnoseButton, !canDiagnose && { opacity: 0.4 }]}
        disabled={!canDiagnose}
        onPress={handleDiagnose}
      >
        <Text style={styles.diagnoseButtonText}>Diagnose</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f8f9',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#fff',
  },
  uploadText: {
    color: '#888',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#eef1f4',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: '#444',
    fontWeight: '600',
  },
  uploadedImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'black',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 14,
  },
  imageName: {
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  diagnoseButton: {
    backgroundColor: '#2A86FF',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 40,
    alignItems: 'center',
  },
  diagnoseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
