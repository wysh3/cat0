import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const { text: title } = await generateText({
      model: openai('gpt-4.1-mini'),
      system: `\n
   Generate a concise thread title based on the user's first message in a conversation.
- The title must be a maximum of 80 characters.
- Do NOT use quotation marks or colons.
- Focus on capturing the core intent or topic of the message in a clear, natural way.
`,
      prompt,
    });

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Failed to generate title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
