import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, smoothStream, generateText } from 'ai';

export const maxDuration = 60;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = google('gemini-2.5-flash-preview-04-17');
  const model2 = mistral('mistral-large-latest');
  const model3 = openai('gpt-4.1-mini');
  const model4 = openrouter('deepseek/deepseek-r1-0528-qwen3-8b:free');

  const result = streamText({
    model: model2,
    messages,
    onError: ({ error }) => {
      console.error(error);
    },
    experimental_transform: [smoothStream({ chunking: 'word' })],
  });

  return result.toDataStreamResponse({ sendReasoning: true });
}
