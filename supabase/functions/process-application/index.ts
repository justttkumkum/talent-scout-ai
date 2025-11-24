import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, linkedinUrl, techStack, resumeUrl, zapierWebhook } = await req.json();
    
    console.log('Processing application for:', name);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const analysisPrompt = `Analyze this candidate's application:

Name: ${name}
Email: ${email}
LinkedIn: ${linkedinUrl || 'Not provided'}
Tech Stack: ${techStack.join(', ')}
Resume URL: ${resumeUrl}

Based on the information provided, analyze and provide:

1. Candidate Type: Determine if they are Backend, Frontend, or Fullstack developer
2. Scores (0-10 scale):
   - Technical Skill: Based on tech stack breadth and depth
   - Experience Relevance: Based on technologies and implied experience
   - Communication: Based on how they present themselves
   - Education Quality: Infer from overall presentation
3. Education Category: Estimate one of: State Board, CBSE, ICSE, IB, Other
4. Strengths: 2-3 key strengths (max 100 words)
5. Weaknesses: 1-2 areas for improvement (max 100 words)

Return your analysis in this exact JSON format:
{
  "candidateType": "backend|frontend|fullstack",
  "technicalSkill": 8,
  "experienceRelevance": 7,
  "communication": 8,
  "educationQuality": 7,
  "educationCategory": "CBSE",
  "strengths": "Strong technical skills...",
  "weaknesses": "Could improve..."
}`;

    console.log('Calling AI for analysis...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert recruiter analyzing candidate applications. Always respond with valid JSON matching the requested format.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('AI returned invalid JSON');
    }

    // Apply recommendation rules
    const recommendation = 
      (analysis.technicalSkill >= 7 && analysis.experienceRelevance >= 6)
        ? 'Recommended'
        : 'Not Recommended';

    console.log('Recommendation:', recommendation);

    // Insert into database
    const { data: application, error: dbError } = await supabase
      .from('applications')
      .insert({
        name,
        email,
        linkedin_url: linkedinUrl || null,
        tech_stack: techStack,
        resume_url: resumeUrl,
        candidate_type: analysis.candidateType,
        technical_skill_score: analysis.technicalSkill,
        experience_relevance_score: analysis.experienceRelevance,
        communication_score: analysis.communication,
        education_quality_score: analysis.educationQuality,
        education_category: analysis.educationCategory,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendation,
        zapier_webhook_url: zapierWebhook || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Application saved to database');

    // Send Zapier webhook if provided
    if (zapierWebhook) {
      console.log('Sending Zapier webhook...');
      try {
        await fetch(zapierWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            candidateType: analysis.candidateType,
            technicalSkill: analysis.technicalSkill,
            experienceRelevance: analysis.experienceRelevance,
            communication: analysis.communication,
            educationQuality: analysis.educationQuality,
            educationCategory: analysis.educationCategory,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            recommendation,
            resumeUrl,
            linkedinUrl: linkedinUrl || null,
            techStack: techStack.join(', '),
            submittedAt: new Date().toISOString(),
          }),
        });
        console.log('Zapier webhook sent successfully');
      } catch (webhookError) {
        console.error('Zapier webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        application,
        analysis: {
          ...analysis,
          recommendation
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing application:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
