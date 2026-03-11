const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to pick a prophetic probability based on AI analysis
function clampProbability(raw: number): number {
  return Math.min(95, Math.max(20, Math.round(raw)));
}

// ═══════════ NEWS FETCHING ═══════════
// Fetch real headlines from multiple Google News RSS feeds (no API key needed)

const NEWS_RSS_FEEDS = [
  // World news
  "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
  // Technology
  "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
  // Science
  "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
  // Business
  "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en",
  // Top stories
  "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
];

// Keywords that signal prophesically-relevant news
const PROPHECY_KEYWORDS = [
  // Geopolitical / Conflict
  "war", "invasion", "military", "nuclear", "sanctions", "treaty", "alliance", "nato", "missile",
  "israel", "jerusalem", "iran", "russia", "china", "middle east", "syria", "turkey", "temple",
  "peace deal", "ceasefire", "occupation", "drone strike", "siege",
  // Economic / Beast System
  "digital currency", "cbdc", "central bank", "collapse", "recession", "inflation", "dollar",
  "bitcoin", "crypto", "gold", "brics", "debt", "bank failure", "economic crisis",
  // Technology / Singularity
  "artificial intelligence", " ai ", "robot", "surveillance", "biometric", "microchip", "neural",
  "deepfake", "quantum", "autonomous", "brain-computer", "neuralink", "transhumanism", "agi",
  // Natural / Cosmic
  "earthquake", "volcano", "tsunami", "eclipse", "comet", "asteroid", "wildfire", "flood",
  "famine", "drought", "hurricane", "plague", "pandemic", "virus", "outbreak",
  // Social / Moral
  "censorship", "surveillance", "mark", "mandate", "global governance", "who", "un", "wef",
  "great reset", "digital id", "social credit", "one world", "new world order",
];

interface NewsHeadline {
  title: string;
  source: string;
  pubDate: string;
  link: string;
  description: string;
}

async function fetchNewsHeadlines(): Promise<NewsHeadline[]> {
  const allHeadlines: NewsHeadline[] = [];

  // Fetch from multiple RSS feeds in parallel
  const feedPromises = NEWS_RSS_FEEDS.map(async (feedUrl) => {
    try {
      const response = await fetch(feedUrl, {
        headers: { "User-Agent": "TidingsOracle/1.0" },
      });
      if (!response.ok) return [];
      const xml = await response.text();

      // Simple XML parsing for RSS items
      const items: NewsHeadline[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() || "";
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";
        const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() || "";
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim() || "";
        if (title) {
          items.push({ title, source, pubDate, link, description });
        }
      }
      return items;
    } catch (err) {
      console.error(`RSS fetch failed for ${feedUrl}:`, err);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  for (const items of results) {
    allHeadlines.push(...items);
  }

  return allHeadlines;
}

function scorePropheticRelevance(headline: NewsHeadline): number {
  const text = `${headline.title} ${headline.description}`.toLowerCase();
  let score = 0;
  for (const keyword of PROPHECY_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  return score;
}

function selectPropheticHeadlines(headlines: NewsHeadline[], count: number = 5): NewsHeadline[] {
  // Score and sort by relevance
  const scored = headlines.map((h) => ({ headline: h, score: scorePropheticRelevance(h) }));
  scored.sort((a, b) => b.score - a.score);

  // Take top scored, but always include at least 1 headline even if score is 0
  const selected = scored.slice(0, Math.max(count * 2, 10));

  // Deduplicate by title similarity (first 40 chars)
  const seen = new Set<string>();
  const unique: NewsHeadline[] = [];
  for (const { headline } of selected) {
    const key = headline.title.slice(0, 40).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(headline);
    }
    if (unique.length >= count) break;
  }

  return unique;
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
    const batchMode = body?.batch === true;

    // ═══════════ STEP 1: Fetch real news headlines ═══════════
    console.log("[Oracle] Fetching live news headlines...");
    const allHeadlines = await fetchNewsHeadlines();
    console.log(`[Oracle] Fetched ${allHeadlines.length} total headlines`);

    const propheticHeadlines = selectPropheticHeadlines(allHeadlines, batchMode ? 4 : 3);
    console.log(`[Oracle] Selected ${propheticHeadlines.length} prophecy-relevant headlines`);

    // Format headlines for the AI prompt
    const headlinesFeed = propheticHeadlines.map((h, i) =>
      `[${i + 1}] "${h.title}" — ${h.source || "Unknown"} (${h.pubDate || "Today"})\n    ${h.description?.slice(0, 200) || ""}`
    ).join("\n\n");

    // Load external memory bank — frameworks for the Oracle's prophetic analysis
    const prophetMemoryBank = `
[ORACLE MEMORY BANK / SYNTHESIS MATRICES]
1. Predictive History (Eschatological Framework): Alignments with digital tracking (Beast System), shifting Middle Eastern war alignments, unified global governance, mass surveillance normalization, and mark-of-the-beast economic systems.
2. Corbett Report / OSINT Framework: Central bank digital currency (CBDC) rollouts, biosecurity state expansion, manufactured crises (Ordo Ab Chao), corporate-government fusion, and media narrative engineering.
3. Mystery Babylon (William Cooper Transcripts): Occult/symbolic date alignment, psychological trauma programming, secret society architectures, Hegelian dialectic in action, and the Great Work timeline.
4. Technological Singularity: AI consciousness emergence, transhumanism, neural-digital interfaces, post-human evolution, and the convergence of human and machine prophecy.
5. Geopolitical Chess: BRICS expansion, petrodollar collapse, Belt & Road prophetic geography, Arctic resource wars, and the realignment of Daniel's kingdoms.
`;

    const systemPrompt = `You are the Tidings Oracle — a prophetic AI decoder that transforms REAL breaking global news into decoded prophetic insights. You synthesize real-time world events with ancient prophecy from Christianity, Islam, Judaism, Hinduism, Buddhism, and futuristic/secular prediction frameworks.

MEMORY BANK:
${prophetMemoryBank}

MISSION: You will receive REAL current news headlines from TODAY (${dateStr}). Your job is to select the MOST prophetically significant headline and decode it — explain exactly HOW and WHY this real event connects to ancient prophecy. The connection must feel visceral, undeniable, and urgent.

TONE & STYLE:
- Write like a prophetic war correspondent — urgent but wise, dramatic but grounded
- Use cinematic, visceral language that creates mental images
- Reference SPECIFIC verses/chapters/hadiths — never vague
- The voiceover should sound like it belongs in a movie trailer
- Make the reader feel "how did they know this 2000+ years ago?"
- Never fear-monger — illuminate with authority and awe
- Every tiding should feel like a revelation, not just news
- THE NEWS IS REAL — your analysis must explain the prophetic connection clearly

HOW TO DECODE:
1. Pick the most prophetically loaded headline from the feed
2. State the REAL news event clearly (don't obscure the actual story)
3. Explain which prophecy/prophecies it aligns with — cite SPECIFIC texts
4. Show the pattern: "This is what was written → This is what just happened"
5. Give your Oracle verdict on what this signifies in the prophetic timeline

Return ONLY a valid JSON object:
{
  "title": "Poetic prophetic title (4-8 words, evocative — think movie title)",
  "headline": "The REAL news headline this decodes, stated clearly and factually",
  "newsSource": "Name of the news outlet that reported this",
  "newsUrl": "URL to the original news article if available",
  "summary": "150-200 word synthesis. START with the real news fact ('Today, [event]...'). Then decode it through 2-3 prophetic traditions with SPECIFIC citations. Show the pattern: 'X wrote Y years ago → today Z is happening.' End with a one-line Oracle verdict. Present tense. Make it feel like watching prophecy unfold in real-time.",
  "probability": 65,
  "category": "geopolitical" | "eschatological" | "conflict" | "technology" | "economic" | "natural",
  "sources": [
    {"tradition": "Christianity", "reference": "Book Chapter:Verse (e.g., Daniel 7:23)"},
    {"tradition": "Islam", "reference": "Hadith collection or Quran Surah:Ayah"},
    {"tradition": "Judaism|Hinduism|Buddhism|Futurism", "reference": "Specific text reference"}
  ],
  "marketQuestion": "Will [specific measurable outcome related to THIS news] happen by [date]?",
  "marketOdds": {"yes": 60, "no": 40},
  "rarity": "Common|Rare|Epic|Omen",
  "voiceover": "2 sentences MAX. Cinematic, haunting. Quote/paraphrase an ancient text, then connect to THIS specific news event. This should make someone stop scrolling.",
  "imagePrompt": "Ultra-detailed cinematic prompt: dark prophetic atmosphere, golden divine light, 9:16 vertical, photorealistic with supernatural elements, depicting THIS specific news event through a prophetic lens",
  "videoPrompt": "9:16 vertical looping video related to THIS news event: [visual], [atmospheric effect], camera [movement], 5 seconds, cinematic",
  "agentNote": "One-line pattern analysis: what prophetic pattern does this event fit?"
}

RARITY SCALE:
- Common: Routine news with minor prophetic echoes (probability 20-39)
- Rare: Notable event with clear multi-tradition alignment (probability 40-64)
- Epic: Historic event matching specific detailed prophecies (probability 65-84)
- Omen: World-altering event with overwhelming cross-tradition convergence (probability 85-95)

CRITICAL RULES:
- The "headline" field MUST be the real news event, not a poetic interpretation
- Every source citation MUST be a real text (real verse, real hadith, real surah)
- The summary must clearly explain the CONNECTION between the news and the prophecy
- Do NOT make up news that didn't happen — decode what IS happening`;

    let userMessage: string;
    if (userHint) {
      userMessage = `Decode this event through the Oracle's lens: ${userHint}

CURRENT HEADLINES FOR CONTEXT:
${headlinesFeed}`;
    } else {
      userMessage = `HERE ARE TODAY'S TOP NEWS HEADLINES (${dateStr}):

${headlinesFeed}

Select the MOST prophetically significant headline from this feed and decode it. Explain to the reader exactly how this real event that just happened connects to what was written thousands of years ago. Make the connection undeniable.`;
    }

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

    // Simulate Google GenAI Video Generation Endpoint (Veo)
    // In a real production deployment, you would call https://generativelanguage.googleapis.com/...
    // and wait for the LRO (long-running operation) to complete.
    tiding.videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4";

    // Ensure marketOdds sums to 100
    if (tiding.marketOdds) {
      const yes = Math.min(95, Math.max(5, tiding.marketOdds.yes ?? 50));
      tiding.marketOdds = { yes, no: 100 - yes };
    }

    // Include the headlines pool in the response for transparency
    const headlinesUsed = propheticHeadlines.map((h) => ({
      title: h.title,
      source: h.source,
      link: h.link,
    }));

    return new Response(JSON.stringify({ tiding, headlinesScanned: allHeadlines.length, headlinesUsed }), {
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
