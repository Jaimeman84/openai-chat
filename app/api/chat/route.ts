import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  const { messages, model = "gpt-4o-mini" } = await request.json();

  const completion = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
