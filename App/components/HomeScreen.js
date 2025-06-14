// screens/HomeScreen.js
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Microclinic</Text>
      <Text style={styles.description}>
        Your AI-powered health companion for quick symptom analysis and
        image-based diagnosis. Get instant medical insights with cutting-edge
        artificial intelligence technology.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FB',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2A86FF',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
});
