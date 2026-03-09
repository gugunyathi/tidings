const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to pick a prophetic probability based on AI analysis
function clampProbability(raw: number): number {
  return Math.min(95, Math.max(20, Math.round(raw)));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current date context
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const body = await req.json().catch(() => ({}));
    const userHint = body?.topic || "";

    const systemPrompt = `You are the Tidings Oracle — an AI that synthesizes major current world news with prophecy from Christianity, Islam, Judaism, Hinduism, Buddhism and other traditions, plus futuristic speculation and prediction markets.

Your mission: Turn a real current world event into a Tiding — a prophetic news card.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Short poetic title (5-10 words)",
  "headline": "The actual current news event this is based on (1 sentence, factual)",
  "summary": "150-word synthesis connecting the news to prophecy. Cite specific books/chapters/verses. Use sage, cinematic language. Avoid fear-mongering.",
  "probability": 65,
  "category": "geopolitical" | "eschatological" | "conflict",
  "sources": [
    {"tradition": "Christianity", "reference": "Specific book + verse"},
    {"tradition": "Islam", "reference": "Specific Hadith or Quran verse"},
    {"tradition": "Judaism", "reference": "Specific Torah/Talmud reference"}
  ],
  "marketQuestion": "Prediction market question about whether this event will escalate (future-tense)",
  "marketOdds": {"yes": 60, "no": 40},
  "voiceover": "10-second cinematic voiceover script (2 sentences max, dramatic)",
  "imagePrompt": "Detailed cinematic image prompt for AI image generation: 'Biblical Epic meets Near-Future Tech 2026 aesthetic. 4K, dramatic lighting, [specific scene]'",
  "agentNote": "One sentence from the Synthesizer Agent about the pattern detected"
}

The probability should reflect genuine cross-tradition consensus (20-95 range).
The imagePrompt must be very specific and cinematic — something that could be used for Midjourney or Imagen.
Base this on a REAL news event happening in ${dateStr}.`;

    const userMessage = userHint
      ? `Generate a tiding about this topic: ${userHint}`
      : `Generate a tiding about a significant current world event happening around ${dateStr}. Pick from geopolitics, natural events, technology, or social upheaval.`;

    // Call Gemini via Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in AI response:", rawContent);
      return new Response(JSON.stringify({ error: "AI returned invalid format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tiding = JSON.parse(jsonMatch[0]);
    tiding.probability = clampProbability(tiding.probability ?? 50);
    tiding.id = `ai-${Date.now()}`;
    tiding.timestamp = `${dateStr} · Synthesizer Agent`;

    // Ensure marketOdds sums to 100
    if (tiding.marketOdds) {
      const yes = Math.min(95, Math.max(5, tiding.marketOdds.yes ?? 50));
      tiding.marketOdds = { yes, no: 100 - yes };
    }

    return new Response(JSON.stringify({ tiding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-tiding error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
