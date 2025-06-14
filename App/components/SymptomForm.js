import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const SYMPTOM_CATEGORIES = [
  {
    category: 'General',
    symptoms: [
      { name: 'Fever', icon: 'thermometer' },
      { name: 'Fatigue', icon: 'battery-low' },
      { name: 'Chills', icon: 'snowflake' },
      { name: 'Night Sweats', icon: 'weather-night' },
      { name: 'Weight Loss', icon: 'scale-bathroom' },
    ],
  },
  {
    category: 'Respiratory',
    symptoms: [
      { name: 'Cough', icon: 'lungs' },
      { name: 'Shortness of Breath', icon: 'weather-windy' },
      { name: 'Wheezing', icon: 'weather-windy-variant' },
      { name: 'Chest Pain', icon: 'heart-pulse' },
    ],
  },
  {
    category: 'Gastrointestinal',
    symptoms: [
      { name: 'Nausea', icon: 'emoticon-sick' },
      { name: 'Vomiting', icon: 'cup-off' },
      { name: 'Diarrhea', icon: 'toilet' },
      { name: 'Abdominal Pain', icon: 'stomach' },
      { name: 'Constipation', icon: 'emoticon-neutral-outline' },
    ],
  },
  {
    category: 'Neurological',
    symptoms: [
      { name: 'Headache', icon: 'head-outline' },
      { name: 'Dizziness', icon: 'axis-z-rotate-clockwise' },
      { name: 'Seizures', icon: 'flash' },
      { name: 'Numbness', icon: 'gesture-tap-button' },
    ],
  },
  {
    category: 'Dermatological',
    symptoms: [
      { name: 'Rash', icon: 'hand-back-left-outline' },
      { name: 'Itching', icon: 'gesture-tap-hold' },
      { name: 'Swelling', icon: 'water' },
      { name: 'Bruising', icon: 'bandage' },
    ],
  },
  {
    category: 'Others',
    symptoms: [
      { name: 'Blurred Vision', icon: 'eye-outline' },
      { name: 'Loss of Taste', icon: 'food-off' },
      { name: 'Loss of Smell', icon: 'emoticon-neutral' },
      { name: 'Joint Pain', icon: 'bone' },
    ],
  },
];

export default function SymptomForm() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const toggleSymptom = symptomName => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomName)
        ? prev.filter(s => s !== symptomName)
        : [...prev, symptomName],
    );
  };

  const handleSubmit = () => {
    let result = '';

    if (selectedSymptoms.length === 0) {
      result = '⚠️ Please select at least one symptom.';
    } else if (
      selectedSymptoms.includes('Fever') &&
      selectedSymptoms.includes('Cough') &&
      selectedSymptoms.includes('Shortness of Breath')
    ) {
      result =
        '🦠 You may be showing symptoms of a respiratory infection. Please consult a doctor.';
    } else if (
      selectedSymptoms.includes('Headache') &&
      selectedSymptoms.includes('Dizziness')
    ) {
      result =
        '🧠 These may be signs of a neurological condition. Monitor closely.';
    } else if (selectedSymptoms.includes('Abdominal Pain')) {
      result = '🥴 You may have a gastrointestinal issue. Stay hydrated.';
    } else {
      result =
        '✔️ Your symptoms are noted. Consider consulting a healthcare provider for further advice.';
    }

    setDiagnosisResult(result);
    setModalVisible(true);
  };

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <View style={styles.symptomsGrid}>
        {item.symptoms.map(symptom => (
          <TouchableOpacity
            key={symptom.name}
            style={[
              styles.symptomButton,
              selectedSymptoms.includes(symptom.name) && styles.selectedSymptom,
            ]}
            onPress={() => toggleSymptom(symptom.name)}
          >
            <MaterialCommunityIcons
              name={symptom.icon}
              size={24}
              color={
                selectedSymptoms.includes(symptom.name) ? '#2A86FF' : '#666'
              }
            />
            <Text
              style={[
                styles.symptomText,
                selectedSymptoms.includes(symptom.name) && styles.selectedText,
              ]}
            >
              {symptom.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={SYMPTOM_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item.category}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <LinearGradient colors={['#4A90E2', '#2A86FF']} style={styles.gradient}>
          <Text style={styles.submitText}>Analyze Symptoms</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(245,247,251,0.95)']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Diagnosis Result</Text>
            <Text style={styles.modalText}>{diagnosisResult}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.gradient}
              >
                <Text style={styles.closeText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  categoryContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A86FF',
    marginBottom: 10,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F8F9FD',
  },
  selectedSymptom: {
    backgroundColor: '#E8F0FE',
    borderColor: '#2A86FF',
    borderWidth: 1,
  },
  symptomText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#444',
  },
  selectedText: {
    color: '#2A86FF',
    fontWeight: '500',
  },
  submitButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2A86FF',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  closeButton: {
    width: 120,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 8,
    textAlign: 'center',
  },
});
