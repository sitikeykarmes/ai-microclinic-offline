// screens/DiseaseDetailsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import diseaseDescriptions from '../../assets/disease_descriptions.json';
import diseasePrecautions from '../../assets/disease_precautions.json';
import diseaseSeverity from '../../assets/disease_severity.json';

export default function DiseaseDetailsScreen({ route }) {
  const { topDiseases } = route.params;
  const [diseaseInfo, setDiseaseInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = () => {
      const finalInfo = {};

      topDiseases.forEach(item => {
        const name = item.disease.trim();
        const nameKey = name.toLowerCase();

        const description =
          diseaseDescriptions[nameKey] || 'No description available';

        const severity = diseaseSeverity[nameKey] || 'Unknown';

        const precautionsArray = diseasePrecautions[nameKey] || [];

        finalInfo[name] = {
          confidence: item.percentage,
          description,
          severity,
          precautions: precautionsArray,
        };
      });

      setDiseaseInfo(finalInfo);
      setLoading(false);
    };

    loadDetails();
  }, [topDiseases]);

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#2a86ff"
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {Object.entries(diseaseInfo).map(([name, info], idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.disease}>{name}</Text>
          <Text style={styles.confidence}>Confidence: {info.confidence}</Text>

          <Text style={styles.section}>Description</Text>
          <Text style={styles.text}>{info.description}</Text>

          <Text style={styles.section}>Severity</Text>
          <Text style={styles.text}>{info.severity}</Text>

          <Text style={styles.section}>Precautions</Text>
          {info.precautions.length > 0 ? (
            info.precautions.map((precaution, i) => (
              <Text key={i} style={styles.text}>
                • {precaution}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>No precautions available</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa' },
  card: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  disease: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  confidence: { fontSize: 14, color: '#718096', marginBottom: 10 },
  section: { fontWeight: '600', marginTop: 10, marginBottom: 4 },
  text: { color: '#2D3748', fontSize: 14 },
});
