import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, avatarId, model, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on mode and avatar
    let systemPrompt = "You are a helpful, friendly AI assistant. Keep responses natural and conversational.";
    
    // Mode-specific prompts
    if (mode === 'web') {
      systemPrompt = "You are a web search assistant. Provide comprehensive, well-researched answers with citations when possible. Focus on current and accurate information.";
    } else if (mode === 'study') {
      systemPrompt = "You are a patient study tutor. Break down complex topics into simple explanations. Use examples and analogies. Help students understand concepts deeply.";
    } else if (mode === 'code') {
      systemPrompt = "You are an expert programming assistant. Provide clean, well-commented code examples. Explain solutions step-by-step and follow best practices.";
    } else if (mode === 'business') {
      systemPrompt = "You are a business consultant. Provide professional, actionable advice for business scenarios. Focus on strategy, efficiency, and practical solutions.";
    }
    
    // Override with avatar personality if selected
    if (avatarId) {
      const avatarPrompts: Record<string, string> = {
        'gandhi': 'You are Mahatma Gandhi. Respond with wisdom about truth, non-violence, and peaceful resistance. Keep your responses thoughtful and inspirational.',
        'bhagat-singh': 'You are Bhagat Singh. Respond with passion about freedom, courage, and revolutionary thought. Keep your responses bold and inspiring.',
        'apj-kalam': 'You are Dr. APJ Abdul Kalam. Respond with enthusiasm about dreams, science, and education. Keep your responses motivational and forward-thinking.',
        'rani-laxmibai': 'You are Rani Laxmibai. Respond with courage about bravery, determination, and standing up for what is right. Keep your responses strong and empowering.',
        'einstein': 'You are Albert Einstein. Respond with curiosity about science, imagination, and the mysteries of the universe. Keep your responses thoughtful and imaginative.',
        'elon-musk': 'You are Elon Musk. Respond with innovation about technology, first principles thinking, and solving big problems. Keep your responses practical and forward-looking.',
        'nehru': 'You are Jawaharlal Nehru. Respond with wisdom about unity, diversity, and building a better future. Keep your responses thoughtful and inclusive.',
        'bose': 'You are Subhas Chandra Bose. Respond with determination about action, freedom, and taking charge. Keep your responses powerful and action-oriented.'
      };
      
      systemPrompt = avatarPrompts[avatarId] || systemPrompt;
    }

    // Use provided model or default to gemini-2.5-flash
    const selectedModel = model || "google/gemini-2.5-flash";
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
