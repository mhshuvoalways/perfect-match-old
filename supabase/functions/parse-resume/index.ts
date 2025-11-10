import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileContent } = await req.json();

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log(`Parsing resume from URL: ${fileContent}`);

    // Enhanced parsing prompt with more specific instructions
    const parsePrompt = `
    You are an expert resume parser. Analyze the following resume content and extract comprehensive profile information.

    RESUME CONTENT TO ANALYZE:
    ${fileContent}

    Extract and return ONLY a JSON object with this exact structure:
    {
      "name": "Full name of the person",
      "age": number or null if not found,
      "location": "City, State/Country where they live",
      "occupation": "Current job title or profession",
      "education": "Educational background, schools attended, degrees",
      "background": "Religious background, family values, community involvement, personal qualities",
      "hashkafa": "Religious observance level (Orthodox, Modern Orthodox, Conservative, Reform, etc.)",
      "gender": "Male or Female",
      "interests": ["hobby1", "hobby2", "interest3"],
      "personality_traits": ["trait1", "trait2", "trait3"],
      "family_values": "Family priorities, what they're looking for in a match"
    }`;

    console.log("Sending request to OpenAI for parsing...");

    const parseResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume parser specializing in extracting structured profile data for Jewish matchmaking purposes. You are thorough and extract as much relevant information as possible.",
            },
            {
              role: "user",
              content: parsePrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      }
    );

    if (!parseResponse.ok) {
      throw new Error(`OpenAI API error: ${parseResponse.statusText}`);
    }

    const parseResult = await parseResponse.json();

    console.log("OpenAI response received:", parseResult);

    let parsedData;

    try {
      const content = parseResult.choices[0].message.content.trim();
      console.log("Content to parse:", content);

      // Remove any markdown formatting if present
      const cleanContent = content
        .replace(/```json\n?/, "")
        .replace(/```\n?$/, "");
      parsedData = JSON.parse(cleanContent);

      console.log("Successfully parsed data:", parsedData);
    } catch (e) {
      console.error("Failed to parse extracted data:", e);
      console.error("Raw content:", parseResult.choices[0].message.content);

      // Create a more comprehensive fallback with some basic parsing attempt
      parsedData = {
        name: null,
        age: null,
        location: null,
        occupation: null,
        education: null,
        background: null,
        hashkafa: null,
        gender: null,
        interests: [],
        personality_traits: [],
        family_values: null,
      };

      // Try to extract at least the name if possible from the original content
      const rawContent = parseResult.choices[0].message.content;
      if (rawContent.includes("name")) {
        const nameMatch = rawContent.match(/"name":\s*"([^"]+)"/);
        if (nameMatch) {
          parsedData.name = nameMatch[1];
        }
      }
    }

    return new Response(
      JSON.stringify({
        parsedData,
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in parse-resume function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        parsedData: {
          name: null,
          age: null,
          location: null,
          occupation: null,
          education: null,
          background: null,
          hashkafa: null,
          gender: null,
          interests: [],
          personality_traits: [],
          family_values: null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
