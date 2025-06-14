import { NativeModules } from "react-native";

const { TFLiteModule } = NativeModules;

export const loadModel = async (modelPath) => {
  return await TFLiteModule.loadModel(modelPath);
};

export const predictImage = async (imagePath) => {
  return await TFLiteModule.predict(imagePath);
};
