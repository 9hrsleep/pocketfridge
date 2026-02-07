import { OpenAI } from "openai";

const DEDALUS_API_KEY = "dsk-test-6b5dc1d381ea-609a871e49b770b08126a85c3544590a"; 

const client = new OpenAI({ 
  apiKey: DEDALUS_API_KEY, 
  baseURL: "https://api.dedaluslabs.ai/v1", 
  dangerouslyAllowBrowser: true 
});

export async function parseReceipt(base64Image: string) {
  console.log("Starting Scan. Image Length:", base64Image?.length || 0);

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
          content: `You are a smart fridge assistant. Analyze the receipt image.
          Extract every food item found. 
          CRITICAL INSTRUCTION: If an item is a meal (like "Hotbar Meal"), break it down into its main components if listed (e.g., "Chicken Tikka", "Rice"). 
          If quantity is not listed, assume 1.
          Return ONLY a valid JSON object with this EXACT structure:
          {
            "items": [
              { 
                "food_type": "Carrot", 
                "quantity": 10, 
                "price": 3.99, 
                "expiration_days": 7 
              }
            ]
          }
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