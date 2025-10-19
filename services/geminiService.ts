import { GoogleGenAI, Type } from "@google/genai";
import { type Flashcard } from '../types';

// A type helper for the raw card data from the API before we add an ID
type RawFlashcard = Omit<Flashcard, 'id'>;

export const generateFlashcardsFromText = async (text: string): Promise<Flashcard[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Tạo một bộ flashcards học tập chất lượng cao từ tài liệu được cung cấp, trong đó mỗi flashcard bao gồm một câu hỏi sâu sắc (Mặt 1) và một câu trả lời ngắn gọn, chính xác (Mặt 2), tập trung vào các khái niệm, định nghĩa và thông tin quan trọng nhất..
    
VĂN BẢN:
---
${text}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: {
                                type: Type.STRING,
                                description: "Câu hỏi cho flashcard."
                            },
                            answer: {
                                type: Type.STRING,
                                description: "Câu trả lời cho câu hỏi."
                            }
                        },
                        required: ["question", "answer"]
                    }
                },
            },
        });
        
        const jsonText = response.text;
        const parsedFlashcards: RawFlashcard[] = JSON.parse(jsonText);
        
        if (!Array.isArray(parsedFlashcards) || parsedFlashcards.length === 0) {
            throw new Error(" không thể tạo flashcards từ văn bản được cung cấp.");
        }
        
        // Add a unique ID to each card for state management in the editor
        const flashcardsWithIds: Flashcard[] = parsedFlashcards.map(card => ({
            ...card,
            id: crypto.randomUUID(),
        }));

        return flashcardsWithIds;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        throw new Error("Đã xảy ra lỗi khi giao tiếp. Vui lòng thử lại sau.");
    }
};
