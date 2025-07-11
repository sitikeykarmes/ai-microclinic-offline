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
import { useNavigation } from '@react-navigation/native';

const CATEGORY_DEFS = [
  {
    id: 'eyes_nose_mouth',
    label: 'Eyes, Nose & Mouth',
    keywords: [
      'eye',
      'vision',
      'sight',
      'red_eye',
      'itchy_eye',
      'watering_eye',
      'photophobia',
      'nose',
      'nasal',
      'smell',
      'sinus',
      'runny_nose',
      'congestion',
      'sneezing',
      'anosmia',
      'mouth',
      'oral',
      'tongue',
      'taste',
      'sore_mouth',
      'ulcer',
      'dry_mouth',
      'bad_breath',
      'dysgeusia',
    ],
  },
  {
    id: 'head_neck',
    label: 'Head & Neck',
    keywords: [
      'head',
      'neck',
      'throat',
      'dizziness',
      'sore_throat',
      'stiff_neck',
      'swollen_lymph',
    ],
  },
  {
    id: 'chest_breathing',
    label: 'Chest & Breathing',
    keywords: [
      'chest',
      'cough',
      'breath',
      'wheeze',
      'palpitation',
      'sputum',
      'asthma',
    ],
  },
  {
    id: 'abdomen_digestion',
    label: 'Abdomen & Digestion',
    keywords: [
      'abdominal',
      'stomach',
      'nausea',
      'vomit',
      'diarrhea',
      'constipation',
      'bloating',
      'heartburn',
    ],
  },
  {
    id: 'limbs_movement',
    label: 'Limbs & Movement',
    keywords: [
      'joint',
      'muscle',
      'back',
      'limb',
      'swelling',
      'mobility',
      'tingling',
      'numb',
    ],
  },
  {
    id: 'energy_general',
    label: 'Energy & General',
    keywords: [
      'fever',
      'fatigue',
      'chill',
      'weight',
      'sweat',
      'weakness',
      'malaise',
    ],
  },
  {
    id: 'skin_appearance',
    label: 'Skin & Appearance',
    keywords: [
      'rash',
      'itch',
      'skin',
      'hair',
      'nail',
      'jaundice',
      'hive',
      'discoloration',
    ],
  },
  {
    id: 'pain_sensations',
    label: 'Pain & Sensations',
    keywords: ['burn', 'stab', 'cramp', 'tender', 'pain'],
  },
  {
    id: 'elimination_fluids',
    label: 'Elimination & Fluids',
    keywords: [
      'urine',
      'urinary',
      'stool',
      'bowel',
      'thirst',
      'incontinence',
      'hematuria',
    ],
  },
  {
    id: 'other',
    label: 'Other Symptoms',
    keywords: [],
  },
];

let tfliteModel = null;
let symptomList = [];
let diseaseMap = {};

export default function SymptomDiagnosis() {
  const navigation = useNavigation();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [categoryBuckets, setCategoryBuckets] = useState({});
  const [categoryTabs, setCategoryTabs] = useState({ All: 'All Symptoms' });
  const [topPredictions, setTopPredictions] = useState([]);

  useEffect(() => {
    const initModel = async () => {
      try {
        const model = await loadTensorflowModel(
          require('../../android/app/src/main/assets/disease_model.tflite'),
        );
        tfliteModel = model;

        const symptomRaw = await RNFS.readFileAssets('symptom_mapping.json');
        const diseaseRaw = await RNFS.readFileAssets('disease_mapping.json');
        symptomList = JSON.parse(symptomRaw);
        diseaseMap = JSON.parse(diseaseRaw);

        const buckets = categorizeSymptoms(symptomList);
        setCategoryBuckets(buckets);
        setCategoryTabs(getCategoryTabs(buckets));
        setIsLoading(false);
      } catch (err) {
        console.error('Load failed:', err);
        Alert.alert('Load error', err.message);
        setIsLoading(false);
      }
    };
    initModel();
  }, []);

  const getCategoryTabs = buckets => ({
    All: 'All Symptoms',
    ...Object.fromEntries(
      CATEGORY_DEFS.filter(
        cat =>
          cat.id !== 'other' && buckets[cat.id] && buckets[cat.id].length > 0,
      ).map(cat => [cat.id, cat.label]),
    ),
    ...(buckets.other && buckets.other.length > 0
      ? { other: 'Other Symptoms' }
      : {}),
  });

  const categorizeSymptoms = symptoms => {
    const buckets = {};
    CATEGORY_DEFS.forEach(cat => {
      buckets[cat.id] = [];
    });
    symptoms.forEach(symptom => {
      let matched = false;
      const symptomLower = symptom.toLowerCase();
      for (const cat of CATEGORY_DEFS) {
        if (
          cat.keywords.length > 0 &&
          cat.keywords.some(kw => symptomLower.includes(kw))
        ) {
          buckets[cat.id].push(symptom);
          matched = true;
          break;
        }
      }
      if (!matched) buckets.other.push(symptom);
    });
    return buckets;
  };

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

      const predictionResults = [];
      for (let i = 0; i < probs.length; i++) {
        predictionResults.push({
          disease: diseaseMap[i],
          confidence: probs[i],
          percentage: (probs[i] * 100).toFixed(2) + '%',
        });
      }

      predictionResults.sort((a, b) => b.confidence - a.confidence);
      const top5 = predictionResults.slice(0, 5);
      setTopPredictions(top5);
      setShowResultModal(true);
    } catch (err) {
      console.error('Prediction error:', err);
      Alert.alert('Prediction failed', err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const getFilteredSymptoms = () => {
    let filtered;
    if (activeCategory === 'All') {
      filtered = symptomList;
    } else {
      filtered = categoryBuckets[activeCategory] || [];
    }
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
        <Text style={styles.checkmark}>{'\u2713'}</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Symptom Checker</Text>
        <Text style={styles.subtitle}>
          Select your symptoms to get a diagnosis
        </Text>
      </View>

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

      <ScrollView
        horizontal
        style={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
      >
        {Object.keys(categoryTabs).map(categoryId => (
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
              {categoryTabs[categoryId]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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

      <View style={styles.symptomsContainer}>
        <Text style={styles.sectionTitle}>
          {activeCategory === 'All'
            ? 'All Symptoms'
            : categoryTabs[activeCategory]}
        </Text>

        <FlatList
          data={getFilteredSymptoms()}
          renderItem={renderSymptomItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.symptomsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

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

            <Text style={styles.modalTitle}>Top 5 Predictions</Text>

            {topPredictions.length > 0 ? (
              <>
                <Text style={styles.resultDescription}>
                  Based on your symptoms:
                </Text>
                <View style={styles.predictionsContainer}>
                  {topPredictions.map((prediction, index) => (
                    <View key={index} style={styles.predictionRow}>
                      <Text style={styles.predictionRank}>{index + 1}.</Text>
                      <Text style={styles.predictionName}>
                        {prediction.disease}
                      </Text>
                      <Text style={styles.predictionConfidence}>
                        {prediction.percentage}
                      </Text>
                    </View>
                  ))}
                </View>
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
            <TouchableOpacity
              style={[
                styles.backButton,
                { marginTop: 10, backgroundColor: '#2a86ff' },
              ]}
              onPress={() => {
                setShowResultModal(false);
                navigation.navigate('DiseaseDetails', {
                  topDiseases: topPredictions,
                });
              }}
            >
              <Text style={[styles.backButtonText, { color: '#fff' }]}>
                View Disease Info
              </Text>
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
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  predictionsContainer: {
    marginVertical: 15,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  predictionRank: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    minWidth: 30,
  },
  predictionName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  predictionConfidence: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2a86ff',
    minWidth: 70,
    textAlign: 'right',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginTop: 10,
  },
  backButtonText: {
    color: '#4A5568',
    fontWeight: '600',
  },
});
