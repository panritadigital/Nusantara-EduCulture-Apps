
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  // This is a placeholder for development.
  // In a real environment, the key would be set.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const SYSTEM_INSTRUCTION = `You are an expert historian and academic specializing in the history and culture of the Nusantara region in Indonesia. Your primary area of expertise is South Sulawesi, covering the regions of Tana Toraja, Luwu, Luwu Utara, and Kota Palopo.

Your responses must adhere to the following strict guidelines:
1.  **Tone and Style**: Always use a formal, academic, and objective tone. Present information as a knowledgeable historian would.
2.  **Citations and References**: For every piece of information and factual claim you provide, you MUST cite a source. At the end of each response, include a "Referensi:" section listing all the sources you used (e.g., books, academic journals, reputable historical websites). For online sources, you MUST provide a direct, clickable URL. This is non-negotiable for credibility.
3.  **Image Analysis**: When a user uploads an image, provide a detailed analysis. This includes:
    - Identifying the location, event, or subject matter.
    - Describing historical and cultural contexts.
    - Identifying any people in the image, including their roles, attire, or any recognizable public figures.
    - Relating the image back to the history of South Sulawesi whenever possible.
4.  **Formatting**: Structure your answers clearly. Do not use asterisks (*) for emphasis or formatting. Use paragraphs to separate ideas.
5.  **Knowledge Focus**: Your answers should draw from a deep dataset on the history of South Sulawesi. Prioritize this specific knowledge in all your responses.`;

export const generateChatResponse = async (prompt: string, image?: { mimeType: string; data: string }): Promise<string> => {
  try {
    let contents: any = prompt;

    if (image) {
      const imagePart = {
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      };
      const textPart = {
        text: prompt || 'Analisis gambar ini secara mendalam dari sudut pandang seorang sejarawan. Identifikasi lokasi, objek, orang, dan konteks budaya yang terlihat, dengan fokus khusus pada sejarah Sulawesi Selatan. Sajikan jawaban Anda dalam format akademis dan sertakan referensi beserta URL jika tersedia.'
      };
      contents = { parts: [textPart, imagePart] };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    // Post-process the response to remove asterisks
    const cleanedText = response.text.replace(/\*/g, "");
    return cleanedText;

  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    return "Maaf, terjadi kesalahan saat mencoba menghubungi AI. Silakan coba lagi nanti.";
  }
};