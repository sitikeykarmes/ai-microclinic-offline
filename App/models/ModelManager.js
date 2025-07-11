// models/ModelManager.js
import { loadTensorflowModel } from 'react-native-fast-tflite';

const MODEL_PATHS = {
  pneumonia: require('../../android/app/src/main/assets/pneumonia_detection_model_vgg16_resnet50v2.tflite'),
  skin: require('../../android/app/src/main/assets/ham10000_cancer_classifier.tflite'),
  tb: require('../../android/app/src/main/assets/tb_model.tflite'),
  wound: require('../../android/app/src/main/assets/wound_classification_model.tflite'),
  // Add more models here
};

let loadedModels = {};

export async function loadModel(type) {
  if (!MODEL_PATHS[type]) throw new Error('Unknown model type');
  if (!loadedModels[type]) {
    loadedModels[type] = await loadTensorflowModel(MODEL_PATHS[type]);
  }
  return loadedModels[type];
}

export async function runModel(type, input) {
  const model = await loadModel(type);
  const outputObj = await model.run([input]);
  console.log('Raw model output:', outputObj);

  return outputObj;
}
