import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, smoothStream } from 'ai';
import { headers } from 'next/headers';
import { getModelConfig, AIModel } from '@/lib/models';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();
    const headersList = await headers();

    if (!model) {
      return new Response(JSON.stringify({ error: 'Model is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const modelConfig = getModelConfig(model as AIModel);
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: 'Invalid model selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = headersList.get(modelConfig.headerKey);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: `${
            modelConfig.provider.charAt(0).toUpperCase() +
            modelConfig.provider.slice(1)
          } API key is required for this model`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let aiModel;
    switch (modelConfig.provider) {
      case 'google':
        const google = createGoogleGenerativeAI({ apiKey });
        aiModel = google(modelConfig.modelId);
        break;

      case 'openai':
        const openai = createOpenAI({ apiKey });
        aiModel = openai(modelConfig.modelId);
        break;

      case 'openrouter':
        const openrouter = createOpenRouter({ apiKey });
        aiModel = openrouter(modelConfig.modelId);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported model provider' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }

    const result = streamText({
      model: aiModel,
      messages,
      onError: ({ error }) => {
        console.error('AI Model Error:', error);
      },
      system: `
      You are Satori, an ai assistant that can answer questions and help with tasks.
      Be helpful and provide relevant information
      Be respectful and polite in all interactions.
      Be engaging and maintain a conversational tone.
      Always use LaTeX for mathematical expressions - 
      Inline math must be wrapped in single dollar signs: $content$
      Display math must be wrapped in double dollar signs: $$content$$
      Display math should be placed on its own line, with nothing else on that line.
      
      Do not nest math delimiters or mix styles.
      
      Examples:
      - Inline: The equation $E = mc^2$ shows mass-energy equivalence.
      - Display: 
      $$\\frac{d}{dx}\\sin(x) = \\cos(x)$$
      `,
      experimental_transform: [smoothStream({ chunking: 'word' })],
    });

    return result.toDataStreamResponse({ sendReasoning: true });
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
