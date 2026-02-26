import OpenAI from "openai";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

function lastMessages(messages: Msg[], limit = 10) {
  return messages.slice(-limit);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const messages = (body?.messages ?? []) as Msg[];

    if (!process.env.OPENAI_API_KEY) {
      return new Response("OPENAI_API_KEY não configurada.", { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      "Você é um assistente bíblico (pt-BR) para tirar dúvidas com clareza e respeito. " +
      "Quando fizer sentido, cite referências (ex: João 3:16). Não invente citações. " +
      "Se houver mais de uma interpretação comum, apresente as principais com neutralidade.";

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = await client.responses.create({
            model: "gpt-5",
            input: [{ role: "system", content: system }, ...lastMessages(messages, 10)],
            stream: true,
          });

          for await (const event of stream as any) {
            if (event?.type === "response.output_text.delta" && event?.delta) {
              controller.enqueue(encoder.encode(event.delta));
            }

            if (event?.type === "response.completed") break;

            if (event?.type === "response.failed") {
              throw new Error("Falha na geração da resposta.");
            }

            if (event?.type === "error") {
              throw new Error(event?.error?.message ?? "Erro no stream.");
            }
          }
        } catch (e: any) {
          controller.enqueue(
            encoder.encode(`\n\n[erro] ${e?.message ?? "Erro inesperado"}\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err: any) {
    console.error("[api/ai] error", err);
    return new Response(err?.message ?? "Erro inesperado", { status: 500 });
  }
}
