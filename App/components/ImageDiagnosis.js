import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

export default function ImageDiagnosis() {
  const [imageUri, setImageUri] = useState(null);

  const pickImageFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 1,
      },
      response => {
        if (response.didCancel) {
          // User cancelled
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 1,
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel) {
          // User cancelled
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri);
        }
      },
    );
  };

  // ...your imports and component logic remain the same

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialCommunityIcons
          name="camera-iris"
          size={64}
          color="#2A86FF"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.title}>Image Diagnosis</Text>
        <Text style={styles.subtitle}>
          Upload or capture medical images for AI-powered analysis
        </Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No image selected</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonLeft}
            onPress={pickImageFromGallery}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF5252']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonRight} onPress={takePhoto}>
            <LinearGradient
              colors={['#4A90E2', '#2A86FF']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A86FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 18,
    marginTop: 8,
    backgroundColor: '#eee',
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 18,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonLeft: {
    flex: 1,
    marginRight: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonRight: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
