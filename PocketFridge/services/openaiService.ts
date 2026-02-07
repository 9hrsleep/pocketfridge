import { OpenAI } from "openai";

const DEDALUS_API_KEY = process.env.EXPO_PUBLIC_DEDALUS_KEY;

// Safety check (Optional but good for debugging)
if (!DEDALUS_API_KEY) {
  throw new Error("Missing API Key. could it find .env file?");
}
const client = new OpenAI({ 
  apiKey: DEDALUS_API_KEY, 
  baseURL: "https://api.dedaluslabs.ai/v1",
  dangerouslyAllowBrowser: true 
});

export async function parseReceipt(base64Image: string) {
  console.log("Starting Scan. Image Length:", base64Image?.length || 0);
  const todayDate = new Date().toISOString().split('T')[0];

  if (!base64Image) {
    console.error("Error: Image taken is empty!");
    return null;
  }
  try {
    const response = await client.chat.completions.create({
      // Dedalus requires the "provider/model" format
      model: "openai/gpt-4o", 
      messages: [
        {
          role: "system",
          content: `You are a smart fridge assistant. Today is ${todayDate}. Analyze the receipt image.
          Extract every food item found. If the item doesnt seem like food, don't add it to the list.
          Assume the quantity based on the weight and price (e.g. if chicken breast costs $13, assume quantity is like 4 servings).
          Return ONLY a valid JSON object with this EXACT structure:
          {
            "new_foods": [
              { 
                "food_type": "Carrot", 
                "quantity": 10, 
                "price": 3.99, 
                "category": "vegetable",
                "date_added": "${todayDate}",  // Use current date in YYYY-MM-DD format
                "date_expiring": "2026-02-17" // Use current date + expiration_days in YYYY-MM-DD format
                "icon_name": "carrot"
              }
            ]
          }
          "date_expiring" MUST be calculated by adding days to "${todayDate}". 
          (e.g. if Milk lasts 7 days, date_expiring is ${todayDate} + 7 days).

          For "icon_name", choose the BEST match from this exact list of available icons. 
          If the food is "Steak" or "Beef", use "beefsteak".
          If the food is "Bread", use "wheatbread".
          If no exact match exists, pick the closest category representative (e.g. use "broccoli" for generic greens, or null if totally unsure).
          
          AVAILABLE ICONS: 
          [beefsteak, broccoli, butter, carrot, chickenbreast, chickenbroth, cucumber, egg, garlic, 
          greenbean, greenbellpepper, heavycream, impossibleburger, jalapeno, ketchup, lime, milk, 
          parmesan, peanutbutter, potato, redbellpepper, rigatoni, salmon, shallot, shrimp, 
          spaghetti, tomato, tomatopaste, wheatbread, yogurt]
          the category can only be one of: vegetable, fruit, carbs, meat, seafood, dairy, condiment, or other. 
          For "expiration_days", use your general knowledge to estimate how long the food lasts in a fridge (e.g., Milk = 7, Rice = 4, Canned Goods = 365).
          Do not include markdown formatting.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Scan this receipt." },
            { 
              type: "image_url", 
              image_url: { url: `data:image/jpeg;base64,${base64Image}` } 
            },
          ],
        },
      ],
    });
    // console.log("API Success. Response:", response); // See the raw response
    const content = response.choices[0].message.content;
    const cleanContent = content?.replace(/```json/g, "").replace(/```/g, "") || "{}";
    
    return JSON.parse(cleanContent);

  } catch (error: any) { // Error handling
    console.error("ERROR: Something in parseReceipt Failed");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }
    return null;
  }
}