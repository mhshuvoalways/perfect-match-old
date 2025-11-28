
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeId, notes, userId } = await req.json();

    if (!resumeId || !notes || !userId) {
      throw new Error('Missing required parameters');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the resume details from resume_library
    const { data: resumeData, error: resumeError } = await supabase
      .from('resume_library')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resumeData) {
      throw new Error('Failed to fetch resume details');
    }

    // Extract resume information
    const resumeInfo = resumeData.parsed_data || {};
    const uploadedBy = resumeData.uploaded_by || 'Unknown';

    // Create comprehensive prompt that includes both resume details and notes
    const prompt = `
You are an expert matchmaker and profile writer. Based on the following resume details and research notes about a person, create a comprehensive and engaging shidduch profile that would be suitable for matchmaking purposes.

RESUME INFORMATION:
Uploaded by: ${uploadedBy}
${resumeInfo.name ? `Name: ${resumeInfo.name}` : ''}
${resumeInfo.age ? `Age: ${resumeInfo.age}` : ''}
${resumeInfo.location ? `Location: ${resumeInfo.location}` : ''}
${resumeInfo.occupation ? `Occupation: ${resumeInfo.occupation}` : ''}
${resumeInfo.education ? `Education: ${resumeInfo.education}` : ''}
${resumeInfo.background ? `Background: ${resumeInfo.background}` : ''}
${resumeInfo.hashkafa ? `Religious Level: ${resumeInfo.hashkafa}` : ''}
${resumeInfo.additional_info ? `Additional Information: ${resumeInfo.additional_info}` : ''}

RESEARCH NOTES FROM PARENT:
${notes.join('\n\n')}

Please create a warm, professional shidduch profile that:
1. Starts with the person's name and gives a compelling overview
2. Highlights their best qualities, personality traits, and character
3. Describes their background, values, and religious observance
4. Mentions their education, career, and interests
5. Describes what kind of family they come from
6. Includes any other relevant details for matchmaking
7. Maintains a tone that is authentic, warm, and appealing to potential matches

Write this as a flowing narrative profile (3-4 paragraphs) that a shadchan would be proud to present. Begin with something like "Sarah Cohen is an exceptional young woman..." and create a complete picture that combines the resume information with the personal insights from your research.
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert matchmaker and profile writer who creates engaging, comprehensive shidduch profiles for Jewish matchmaking purposes. You write in a warm, professional tone that highlights the best qualities while being authentic.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate AI profile');
    }

    const data = await response.json();
    const generatedProfile = data.choices[0].message.content;

    // Save the generated profile to ai_profiles table
    const { data: savedProfile, error: saveError } = await supabase
      .from('ai_profiles')
      .insert({
        summary: generatedProfile,
        resume_id: resumeId,
        parent_id: userId
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        id: savedProfile.id,
        summary: savedProfile.summary,
        created_at: savedProfile.created_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-ai-profile function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
