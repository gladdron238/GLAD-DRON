
import { GoogleGenAI, Modality } from '@google/genai';
import { AspectRatio, Quality } from '../types';

export const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
      const data = result.split(',')[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};

interface GenerateImageParams {
  prompt: string;
  quality: Quality;
  aspectRatio: AspectRatio;
  imageBase64?: { mimeType: string; data: string };
}

export const generateImage = async ({
  prompt,
  quality,
  aspectRatio,
  imageBase64,
}: GenerateImageParams): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Переменная окружения API_KEY не установлена.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (quality === 'hd') {
    if (imageBase64) {
      throw new Error("Загрузка изображений не поддерживается для генерации в высоком качестве.");
    }
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/png',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("Генерация изображения не удалась или не вернула изображений.");
    }
  } else {
    // Standard Quality using Gemini Flash Image
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      parts.unshift({
        inlineData: {
          data: imageBase64.data,
          mimeType: imageBase64.mimeType,
        },
      });
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("Генерация изображения не удалась или не вернула данных изображения.");
  }
};
