import {
  createGoogleGenerativeAI,
  GoogleGenerativeAIProviderOptions,
} from '@ai-sdk/google';
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

  const model = google('gemini-2.5-pro-exp-03-25');
  const model2 = mistral('mistral-small-latest');
  const model3 = openai('gpt-4.1-mini');
  const model4 = openrouter('deepseek/deepseek-r1:free');

  const result = streamText({
    model: model3,
    messages,
    onError: ({ error }) => {
      console.error(error);
    },
    // providerOptions: {
    //   thinkingConfig: {
    //     thinkingBudget: 0,
    //   },
    // } satisfies GoogleGenerativeAIProviderOptions,
    experimental_transform: [smoothStream({ chunking: 'word' })],
  });

  return result.toDataStreamResponse({ sendReasoning: true });
}
