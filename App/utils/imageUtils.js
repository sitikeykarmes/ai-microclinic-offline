// utils/imageUtils.js
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { Buffer } from 'buffer';

/**
 * Preprocesses an image for model inference.
 * - For 'wound': ResNet50-style preprocessing (299x299, BGR, mean subtraction, no /255)
 * - For others: Normalizes to [0,1] (224x224, RGB order)
 */
export async function preprocessImage(uri, inputSize = 224, type = 'skin') {
  // Set size and mean for wound model
  let size = inputSize;
  let mean = [0, 0, 0];

  if (type === 'wound') {
    size = 299;
    mean = [103.939, 116.779, 123.68]; // B, G, R mean for ResNet50
  }

  // 1. Resize the image
  const resizedImage = await ImageResizer.createResizedImage(
    uri,
    size,
    size,
    'JPEG',
    100,
  );

  // 2. Read image as base64 and decode to bytes
  const base64Image = await RNFS.readFile(resizedImage.uri, 'base64');
  const rawImageData = Buffer.from(base64Image, 'base64');

  // 3. Allocate input buffer (Float32Array)
  const input = new Float32Array(size * size * 3);

  // 4. Preprocessing logic
  if (type === 'wound') {
    // ResNet50 expects BGR order and mean subtraction, no /255
    // rawImageData is RGBA, so we map to BGR
    for (
      let i = 0, j = 0;
      i < rawImageData.length && j < input.length;
      i += 4, j += 3
    ) {
      input[j] = rawImageData[i + 2] - mean[0]; // B
      input[j + 1] = rawImageData[i + 1] - mean[1]; // G
      input[j + 2] = rawImageData[i] - mean[2]; // R
    }
  } else {
    // For other models: normalize to [0,1], RGB order
    for (
      let i = 0, j = 0;
      i < rawImageData.length && j < input.length;
      i += 4, j += 3
    ) {
      input[j] = rawImageData[i] / 255.0; // R
      input[j + 1] = rawImageData[i + 1] / 255.0; // G
      input[j + 2] = rawImageData[i + 2] / 255.0; // B
    }
  }

  return input;
}
