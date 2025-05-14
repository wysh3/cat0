import {
  createGoogleGenerativeAI,
  GoogleGenerativeAIProviderOptions,
} from '@ai-sdk/google';
import { streamText, smoothStream, generateText } from 'ai';

export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const model = google('gemini-2.5-flash-preview-04-17');

  const result = streamText({
    model,
    messages,
    onError: ({ error }) => {
      console.error(error);
    },
    providerOptions: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    } satisfies GoogleGenerativeAIProviderOptions,
    experimental_transform: [smoothStream({ chunking: 'word' })],
  });

  return result.toDataStreamResponse();
}
