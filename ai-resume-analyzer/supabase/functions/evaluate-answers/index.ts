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
    const { jobRole, questions } = await req.json();

    if (!questions || !jobRole) {
      return new Response(
        JSON.stringify({ error: "Questions and job role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) throw new Error("AI_API_KEY is not configured");

    const qaText = questions
      .map(
        (q: { type: string; question: string; answer: string; correctAnswer?: string }, i: number) =>
          `Q${i + 1} (${q.type}): ${q.question}\nAnswer: ${q.answer}${
            q.correctAnswer ? `\nCorrect Answer: ${q.correctAnswer}` : ""
          }`
      )
      .join("\n\n");

    const prompt = `You are an expert interview evaluator for a ${jobRole} position. Evaluate these interview answers and provide constructive feedback:\n\n${qaText}\n\nRespond with a JSON object containing: overallScore (0-100), categoryScores (object with category scores), feedback (array of feedback strings), strengths (array), areasForImprovement (array).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`API error: ${status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error("No response from API");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("evaluate-answers error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
