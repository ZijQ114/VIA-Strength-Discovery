import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, Strength, Activity, FamilyMember } from "../types";
import { ALL_STRENGTHS } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to format family strings
const formatMember = (m: FamilyMember) => `${m.name} (${m.pronouns})`;

const getFamilyContext = (profile: UserProfile): string => {
  return `
    User Name: ${profile.name} (${profile.pronouns})
    Occupation: ${profile.occupation}
    Partner: ${profile.partner ? formatMember(profile.partner) : "None"}
    Pets: ${profile.pets.length ? profile.pets.map(formatMember).join(", ") : "None"}
    Children: ${profile.children.length ? profile.children.map(formatMember).join(", ") : "None"}
  `;
};

// Schema for generating activities
const activitySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      strengthId: { type: Type.INTEGER, description: "The ID of the VIA strength (1-24) this activity relates to." },
      title: { type: Type.STRING, description: "A short, catchy title for the activity." },
      description: { type: Type.STRING, description: "One simple paragraph (Grade 6-8 reading level) describing what to do. Include placeholders like [Pet Name] if applicable." }
    },
    required: ["strengthId", "title", "description"]
  }
};

const singleActivitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    strengthId: { type: Type.INTEGER },
    title: { type: Type.STRING },
    description: { type: Type.STRING }
  },
  required: ["strengthId", "title", "description"]
};

export const generateDailyActivities = async (profile: UserProfile, previousActivities: string[]): Promise<Activity[]> => {
  if (!apiKey) {
    console.error("API Key missing");
    return [];
  }

  // Filter strengths to focus on (Top Strengths)
  const targetStrengths = ALL_STRENGTHS.filter(s => profile.topStrengths.includes(s.id));
  const strengthNames = targetStrengths.map(s => `${s.name} (ID: ${s.id})`).join(", ");

  const familyContext = getFamilyContext(profile);

  const prompt = `
    Generate 2 distinct micro-activities for a user to practice their character strengths today.
    
    Target Strengths (Choose 2 different ones from this list): ${strengthNames}
    
    User Context:
    ${familyContext}
    
    Requirements:
    1. Readability: Grade 6-8 level. Simple and direct.
    2. Length: Max one paragraph per activity.
    3. Personalization: Dynamically use the names of pets, partner, or children if relevant to the activity context.
    4. Tone: Encouraging, warm, and positive.
    5. Avoid repeating these previously done activities: ${previousActivities.slice(-10).join(", ")}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: activitySchema,
        temperature: 0.7,
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      isCustom: false
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return [
      {
        id: crypto.randomUUID(),
        strengthId: targetStrengths[0]?.id || 1,
        title: `Practice ${targetStrengths[0]?.name || 'Love'}`,
        description: `Take a moment today to reflect on how you can express ${targetStrengths[0]?.name || 'Love'} in your daily routine.`,
        isCustom: false
      },
      {
        id: crypto.randomUUID(),
        strengthId: targetStrengths[1]?.id || 2,
        title: `Practice ${targetStrengths[1]?.name || 'Perspective'}`,
        description: `Try to look at a current challenge from a new angle using your strength of ${targetStrengths[1]?.name || 'Perspective'}.`,
        isCustom: false
      }
    ];
  }
};

export const getSpecificStrengthActivity = async (strengthId: number, profile: UserProfile): Promise<Activity | null> => {
  if (!apiKey) return null;

  const strength = ALL_STRENGTHS.find(s => s.id === strengthId);
  if (!strength) return null;

  const familyContext = getFamilyContext(profile);

  const prompt = `
    Suggest ONE simple, specific micro-activity to practice the character strength of "${strength.name}" right now.
    User Context: ${familyContext}
    Keep it short, simple, and inspiring.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: singleActivitySchema,
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      strengthId: strengthId,
      id: crypto.randomUUID(),
      isCustom: true
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const analyzeMoodAndSuggest = async (mood: string, profile: UserProfile): Promise<Activity[]> => {
  if (!apiKey) return [];

  const familyContext = getFamilyContext(profile);

  const prompt = `
    The user is feeling: "${mood}".
    User Context: ${familyContext}
    
    Suggest 2 actionable, simple activities based on VIA Character Strengths to help them cope, improve their mood, or solve their problem.
    Select the most appropriate Strength ID (1-24) for the advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: activitySchema,
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      isCustom: true
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    strengthId: { type: Type.INTEGER },
    reasoning: { type: Type.STRING }
  }
};

export const reverseAnalyzeAction = async (actionDescription: string): Promise<{ strengthId: number, reasoning: string } | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this user action and identify which ONE VIA Character Strength (ID 1-24) it best demonstrates: "${actionDescription}". Return the ID and a brief reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });
    return JSON.parse(response.text || "null");
  } catch (e) {
    console.error(e);
    return null;
  }
};