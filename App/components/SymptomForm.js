import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { loadTensorflowModel } from 'react-native-fast-tflite';
import RNFS from 'react-native-fs';

let tfliteModel = null;
let symptomList = [];
let diseaseMap = {};
const symptomCategories = {
  All: 'All Symptoms',
  head: 'Head/Neck',
  chest: 'Chest',
  abdomen: 'Abdomen',
  limbs: 'Limbs',
  skin: 'Skin',
  general: 'General',
};

export default function SymptomDiagnosis() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

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

        setIsLoading(false);
        console.log('✅ Model and mappings loaded');
      } catch (err) {
        console.error('Load failed:', err);
        Alert.alert('Load error', err.message);
        setIsLoading(false);
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
    if (!tfliteModel || selectedSymptoms.length === 0) {
      Alert.alert('Selection Needed', 'Please select at least one symptom');
      return;
    }

    try {
      setIsPredicting(true);
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
      setShowResultModal(true);
    } catch (err) {
      console.error('Prediction error:', err);
      Alert.alert('Prediction failed', err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  // Filter symptoms based on search and category
  const getFilteredSymptoms = () => {
    let filtered = symptomList;

    // Apply category filter
    if (activeCategory !== 'All') {
      // In a real app, you'd filter by actual category mapping
      filtered = filtered.filter(symptom =>
        symptom.toLowerCase().includes(activeCategory),
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(symptom =>
        symptom.toLowerCase().includes(query),
      );
    }

    return filtered;
  };

  const renderSymptomItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.symptomItem,
        selectedSymptoms.includes(item) && styles.selectedSymptomItem,
      ]}
      onPress={() => toggleSymptom(item)}
    >
      <Text style={styles.symptomText}>{item.replace(/_/g, ' ')}</Text>
      {selectedSymptoms.includes(item) && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2a86ff" />
        <Text style={styles.loadingText}>Loading Diagnosis System...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Checker</Text>
        <Text style={styles.subtitle}>
          Select your symptoms to get a diagnosis
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search symptoms..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        style={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
      >
        {Object.keys(symptomCategories).map(categoryId => (
          <TouchableOpacity
            key={categoryId}
            style={[
              styles.categoryButton,
              activeCategory === categoryId && styles.activeCategory,
            ]}
            onPress={() => setActiveCategory(categoryId)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === categoryId && styles.activeCategoryText,
              ]}
            >
              {symptomCategories[categoryId]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Symptoms Preview */}
      {selectedSymptoms.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.sectionTitle}>Selected Symptoms</Text>
          <ScrollView
            horizontal
            style={styles.selectedScroll}
            showsHorizontalScrollIndicator={false}
          >
            {selectedSymptoms.map((symptom, index) => (
              <View key={index} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>
                  {symptom.replace(/_/g, ' ')}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleSymptom(symptom)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Symptoms List */}
      <View style={styles.symptomsContainer}>
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All'
            ? 'All Symptoms'
            : symptomCategories[activeCategory]}
        </Text>

        <FlatList
          data={getFilteredSymptoms()}
          renderItem={renderSymptomItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.symptomsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Diagnosis Button */}
      <TouchableOpacity
        style={[
          styles.diagnoseButton,
          selectedSymptoms.length === 0 && styles.disabledButton,
        ]}
        onPress={predictDisease}
        disabled={selectedSymptoms.length === 0 || isPredicting}
      >
        {isPredicting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get Diagnosis</Text>
        )}
      </TouchableOpacity>

      {/* Result Modal */}
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.resultIcon}>{prediction ? '✅' : '⚠️'}</Text>

            <Text style={styles.modalTitle}>Diagnosis Result</Text>

            {prediction ? (
              <>
                <Text style={styles.diseaseName}>{prediction}</Text>
                <Text style={styles.resultDescription}>
                  Based on your symptoms, this is the most likely condition.
                  Please consult with a healthcare professional for
                  confirmation.
                </Text>
              </>
            ) : (
              <Text style={styles.resultDescription}>
                Unable to determine diagnosis based on selected symptoms.
              </Text>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.backButtonText}>Back to Symptoms</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#4A5568',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  categoryContainer: {
    marginBottom: 16,
    maxHeight: 50,
  },
  categoryButton: {
    backgroundColor: '#EDF2F7',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  activeCategory: {
    backgroundColor: '#2a86ff',
  },
  categoryText: {
    color: '#4A5568',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
  selectedContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 10,
  },
  selectedScroll: {
    maxHeight: 50,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  selectedTagText: {
    color: '#3182CE',
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#90CDF4',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  symptomsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  symptomsList: {
    paddingBottom: 20,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedSymptomItem: {
    backgroundColor: '#F0FFF4',
    borderColor: '#68D391',
    borderWidth: 1,
  },
  symptomText: {
    fontSize: 16,
    color: '#2D3748',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  diagnoseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a86ff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#2a86ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#CBD5E0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultIcon: {
    fontSize: 60,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2a86ff',
    textAlign: 'center',
    marginVertical: 20,
  },
  resultDescription: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  backButtonText: {
    color: '#4A5568',
    fontWeight: '600',
  },
});
