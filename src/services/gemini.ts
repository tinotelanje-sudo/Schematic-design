import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface DesignOutput {
  schematic: string;
  bom: Array<{
    item: string;
    description: string;
    package: string;
    quantity: number;
    lcscPartNumber?: string;
  }>;
}

export async function generateHardwareDesign(prompt: string): Promise<DesignOutput> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          schematic: {
            type: Type.STRING,
            description: "Detailed pin-to-pin wiring connections and schematic description in Markdown format.",
          },
          bom: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                description: { type: Type.STRING },
                package: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                lcscPartNumber: { type: Type.STRING },
              },
              required: ["item", "description", "package", "quantity"],
            },
          },
        },
        required: ["schematic", "bom"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate design data.");
  }
}

export async function generateHardwareImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
}
