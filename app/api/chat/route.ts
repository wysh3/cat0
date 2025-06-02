import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, smoothStream } from 'ai';

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
}
