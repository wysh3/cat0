import {
  createGoogleGenerativeAI,
  GoogleGenerativeAIProviderOptions,
} from '@ai-sdk/google';
import { streamText, smoothStream } from 'ai';

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash-preview-04-17'),
    messages,
    experimental_transform: [smoothStream({ chunking: 'word' })],
    providerOptions: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    } satisfies GoogleGenerativeAIProviderOptions,
  });

  return result.toDataStreamResponse();
}
