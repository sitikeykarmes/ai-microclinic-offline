import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import ImageResizer from 'react-native-image-resizer';

let tfliteModel = null;

export default function ImageDiagnosis() {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const model = await loadTensorflowModel(
          require('../../android/app/src/main/assets/ham10000_cancer_classifier.tflite'),
        );
        tfliteModel = model;
        setModelLoaded(true);
        console.log('✅ Model loaded');
      } catch (err) {
        console.error('Model load failed:', err);
        Alert.alert('Error', 'Model load failed: ' + err.message);
      }
    };
    init();
  }, []);

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
          setPrediction(null);
        }
      },
    );
  };

  const preprocessImage = async uri => {
    try {
      // Resize image to 224x224
      const resizedImage = await ImageResizer.createResizedImage(
        uri,
        224,
        224,
        'JPEG',
        100,
      );

      // Read resized image as base64
      const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');

      // Decode base64 to raw bytes (RGBA)
      const rawImageData = Buffer.from(base64Image, 'base64');

      // Prepare Float32Array for model input: [1, 224, 224, 3]
      const input = new Float32Array(1 * 224 * 224 * 3);

      // Iterate over pixels, skip alpha channel, normalize RGB to [0,1]
      for (let i = 0, j = 0; i < rawImageData.length; i += 4, j += 3) {
        input[j] = rawImageData[i] / 255.0; // R
        input[j + 1] = rawImageData[i + 1] / 255.0; // G
        input[j + 2] = rawImageData[i + 2] / 255.0; // B
      }

      return input;
    } catch (err) {
      console.error('Preprocessing error:', err);
      Alert.alert('Preprocessing Error', err.message);
    }
  };

  const runDiagnosis = async () => {
    if (!imageUri || !modelLoaded) return;

    try {
      const input = await preprocessImage(imageUri);
      const outputObj = await tfliteModel.run([input]); // Pass input as array
      console.log('Model output:', outputObj);

      const outputKey = Object.keys(outputObj)[0];
      const output = outputObj[outputKey];

      if (output instanceof Float32Array && output.length === 1) {
        const score = output[0];
        const label = score >= 0.5 ? 'Malignant' : 'Benign';
        const confidence = (score >= 0.5 ? score : 1 - score) * 100;
        setPrediction(`${label} (${confidence.toFixed(2)}%)`);
      } else {
        setPrediction('Unexpected model output');
        console.warn('Output shape unexpected:', output);
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      Alert.alert('Diagnosis Failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Diagnosis</Text>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {prediction && (
        <Text style={styles.prediction}>Diagnosis: {prediction}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#28a745' }]}
        onPress={runDiagnosis}
        disabled={!modelLoaded}
      >
        <Text style={styles.buttonText}>
          {modelLoaded ? 'Diagnose' : 'Loading Model...'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  image: {
    width: 224,
    height: 224,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ddd',
  },
  prediction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2a86ff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
