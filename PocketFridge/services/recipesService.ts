// services/recipesService.ts

import { OpenAI } from "openai";
import { FridgeItem } from "../types"; 

const DEDALUS_API_KEY = process.env.EXPO_PUBLIC_DEDALUS_KEY;

const client = new OpenAI({
  apiKey: DEDALUS_API_KEY,
  baseURL: "https://api.dedaluslabs.ai/v1",
  dangerouslyAllowBrowser: true,
});

export type GeneratedRecipe = {
  id: string;
  title: string;
  why_this_recipe: string;
  ingredients_used: Array<{ name: string; quantity?: string }>;
  ingredients_optional?: Array<{ name: string; quantity?: string }>;
  steps: string[];
  time_minutes?: number;
  difficulty?: "easy" | "medium" | "hard";
  image_url: string; // <--- WEB URL
};

// 1. THE HACK: A function to get a real image URL without an API key
function getWebImage(query: string) {
  // Uses Bing's public thumbnail service. Safe, fast, and high quality.
  const encoded = encodeURIComponent(query + " food recipe aesthetic high quality");
  return `https://tse2.mm.bing.net/th?q=${encoded}&w=800&h=600&c=7&rs=1&p=0`;
}

export async function generateRecipesFromFridge(
  items: FridgeItem[],
  count: number = 4
): Promise<GeneratedRecipe[]> {
  
  if (items.length === 0) return [];

  // 2. Sort by Expiry (Soonest first)
  const sortedItems = [...items].sort((a, b) => {
    if (!a.date_expiring) return 1;
    if (!b.date_expiring) return -1;
    return new Date(a.date_expiring).getTime() - new Date(b.date_expiring).getTime();
  });

  // 3. Take top 10 items to send to context
  const contextItems = sortedItems.slice(0, 10).map(i => ({
    name: i.food_type,
    qty: i.quantity,
    exp: i.date_expiring
  }));

  const systemPrompt = `
    You are a chef assistant. Generate ${count} creative recipes using the provided fridge inventory.
    Prioritize ingredients expiring soon.
    Return ONLY valid JSON:
    {
      "recipes": [
        {
          "id": "unique_id",
          "title": "Recipe Title",
          "image_keywords": "Search terms for a photo of this dish (e.g. 'Spaghetti Carbonara')",
          "why_this_recipe": "Brief reason (e.g. Uses up your expiring spinach)",
          "ingredients_used": [{ "name": "Chicken", "quantity": "1 lb" }],
          "steps": ["Step 1", "Step 2"],
          "time_minutes": 30,
          "difficulty": "medium"
        }
      ]
    }
    Do not use markdown.
  `;

  const userPrompt = `Here is my fridge inventory: ${JSON.stringify(contextItems)}`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "{}";
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanContent);
    
    // 4. Transform and Attach Web Images
    const recipes = (parsed.recipes || []).map((r: any) => ({
      ...r,
      // Generate the URL immediately using the keywords
      image_url: getWebImage(r.image_keywords || r.title)
    }));

    return recipes;

  } catch (error) {
    console.error("Recipe Generation Failed:", error);
    return [];
  }
}