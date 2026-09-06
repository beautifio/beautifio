import { createServiceClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const PERSONA_PROMPT = "Kamu adalah Kak Nara, sahabat dekat yang suportif dan relatable.";

export async function runBeautifioTrendEngine(topic: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: PERSONA_PROMPT },
      { role: "user", content: `Buatkan artikel berdasarkan tren berikut: ${topic}` }
    ],
    response_format: { type: "json_object" }
  });

  const data = JSON.parse(completion.choices[0].message.content || "{}");
  
  // Service client: this runs as a background/editorial job with no user session.
  const supabase = createServiceClient();
  const { error } = await supabase.from("articles").insert({
    title: data.title,
    content: data.content,
    slug: data.slug,
    category: data.category,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;

  return { success: true };
}
