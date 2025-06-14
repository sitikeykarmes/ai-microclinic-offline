// App/components/HomeScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from "react-native";

const tips = [
  "Drink plenty of water every day.",
  "Get at least 7-8 hours of sleep.",
  "Exercise regularly to boost your immune system.",
  "Wash your hands frequently.",
  "Eat a balanced diet with fruits and vegetables.",
  "Avoid smoking and excessive alcohol.",
  "Take short breaks if you sit for long hours.",
  "Don't skip breakfast!",
];

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tip, setTip] = useState("");

  const showRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setTip(tips[randomIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AI Microclinic</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Symptom Form")}
      >
        <Text style={styles.buttonText}>Start Symptom Check</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={
          () => alert("Image Diagnosis feature coming soon!") // Replace this with navigation if needed
        }
      >
        <Text style={styles.buttonText}>📸 Image Diagnosis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTip(""); // reset tip on open
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>💡 Health Tips</Text>
      </TouchableOpacity>

      {/* Modal for Health Tips */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>💡 Health Tip</Text>
            <Text style={styles.tipText}>
              {tip || "Tap below to get a health tip!"}
            </Text>
            <Button title="Show Tip" onPress={showRandomTip} />
            <View style={{ marginTop: 20 }}>
              <Button
                title="Close"
                color="#00796b"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00796b",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00796b",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "#e0f7fa",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#00796b",
  },

  tipText: {
    fontSize: 18,
    color: "#004d40",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 26,
  },
});
