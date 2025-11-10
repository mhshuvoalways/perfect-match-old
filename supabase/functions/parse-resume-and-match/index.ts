
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { childResume, userId } = await req.json();

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration not found");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all resumes uploaded for "AI Search" by this user
    const { data: uploadedResumes, error: fetchError } = await supabase
      .from("resume_library")
      .select("*")
      .eq("user_id", userId)
      .eq("uploaded_for", "AI Search");

    if (fetchError) {
      console.error("Error fetching uploaded resumes:", fetchError);
      throw fetchError;
    }

    if (!uploadedResumes || uploadedResumes.length === 0) {
      return new Response(
        JSON.stringify({
          matches: [],
          message: "No resumes found for AI Search",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(
      `Processing ${uploadedResumes.length} uploaded resumes against child: ${childResume.name}`
    );

    // Filter resumes by opposite gender
    const childGender = childResume.gender?.toLowerCase();
    const targetGender = childGender === 'male' ? 'female' : childGender === 'female' ? 'male' : null;
    
    let filteredResumes = uploadedResumes;
    if (targetGender) {
      filteredResumes = uploadedResumes.filter(resume => {
        const resumeGender = resume.parsed_data?.gender?.toLowerCase();
        return resumeGender === targetGender;
      });
      
      console.log(`Filtered ${uploadedResumes.length} resumes to ${filteredResumes.length} based on gender compatibility (child: ${childGender}, looking for: ${targetGender})`);
    } else {
      console.log("No gender filtering applied - child gender not specified");
    }

    if (filteredResumes.length === 0) {
      return new Response(
        JSON.stringify({
          matches: [],
          message: `No resumes found with compatible gender (looking for ${targetGender} candidates)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const matches: any = [];

    // Process each filtered uploaded resume against the single child
    for (const uploadedResume of filteredResumes) {
      console.log(`Processing resume ${uploadedResume.id} against child ${childResume.id}`);

      // Parse the resume if not already parsed
      const parsedData = uploadedResume.parsed_data;

      const matchPrompt = `
      You are an expert matchmaker. Compare these two profiles and provide a detailed compatibility analysis.

      UPLOADED RESUME PROFILE:
      ${JSON.stringify(parsedData, null, 2)}

      CHILD'S PROFILE:
      Name: ${childResume.name}
      Age: ${childResume.age}
      Location: ${childResume.location}
      Occupation: ${childResume.occupation}
      Education: ${childResume.education}
      Background: ${childResume.background}
      Hashkafa: ${childResume.hashkafa}
      Gender: ${childResume.gender}

      Analyze compatibility based on:
      1. Religious observance level compatibility
      2. Educational background compatibility
      3. Geographic proximity
      4. Age appropriateness
      5. Family values alignment
      6. Lifestyle compatibility
      7. Gender appropriateness (most important)

      Return ONLY a JSON object with this exact structure (no markdown formatting):
      {
        "match_score": number between 1-100,
        "highlights": {
          "strengths": ["list of compatibility strengths"],
          "concerns": ["list of potential concerns"],
          "summary": "2-3 sentence summary of the match"
        }
      }
      `;

      try {
        const matchResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openAIApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional shadchan (matchmaker) with deep understanding of Jewish matchmaking principles. Always return valid JSON without any markdown formatting or code blocks.",
                },
                {
                  role: "user",
                  content: matchPrompt,
                },
              ],
              temperature: 0.3,
              max_tokens: 800,
            }),
          }
        );

        const matchResult = await matchResponse.json();
        let responseContent = matchResult.choices[0].message.content.trim();
        
        // Clean up any markdown formatting that might be present
        responseContent = responseContent
          .replace(/```json\n?/g, '')  // Remove opening markdown
          .replace(/```\n?$/g, '')     // Remove closing markdown
          .replace(/^```\n?/g, '')     // Remove any leading markdown
          .trim();

        console.log(`Raw OpenAI response for resume ${uploadedResume.id}:`, responseContent);

        const matchData = JSON.parse(responseContent);

        matches.push({
          child_resume_id: childResume.id,
          resume_library_id: uploadedResume.id,
          match_score: matchData.match_score,
          highlights: matchData.highlights,
          parsed_data: parsedData,
        });
      } catch (matchError) {
        console.error(
          `Failed to match resume ${uploadedResume.id} with child ${childResume.id}:`,
          matchError
        );
        matches.push({
          child_resume_id: childResume.id,
          resume_library_id: uploadedResume.id,
          match_score: 50,
          highlights: {
            strengths: ["Analysis unavailable"],
            concerns: ["Could not analyze compatibility"],
            summary: "Match analysis failed, manual review recommended.",
          },
          parsed_data: parsedData,
        });
      }
    }

    console.log(`Generated ${matches.length} matches for child ${childResume.name}`);

    return new Response(
      JSON.stringify({
        matches: matches,
        userId,
        totalProcessed: filteredResumes.length,
        originalCount: uploadedResumes.length,
        filteredByGender: uploadedResumes.length - filteredResumes.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in parse-resume-and-match function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
