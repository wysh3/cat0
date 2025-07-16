import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getModelConfig, AIModel } from '@/lib/models';

export async function POST(req: Request) {
  try {
    const { prompt, isTitle, messageId, threadId, model } = await req.json();
    const headersList = await headers();

    if (!model) {
      return NextResponse.json(
        { error: 'Model parameter is required' },
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(model as AIModel);
    const apiKey = headersList.get(modelConfig.headerKey) as string;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `API key for ${modelConfig.provider} is required to enable chat title generation.`,
        },
        { status: 400 }
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
        return NextResponse.json(
          { error: 'Unsupported model provider' },
          { status: 400 }
        );
    }

    const { text: rawTitle } = await generateText({
      model: aiModel,
      system: `You are a title generator that creates concise, descriptive titles for chat conversations.

Rules:
- Generate a short, descriptive title (maximum 60 characters)
- Capture the main topic or intent of the user's message
- Use clear, natural language without technical jargon unless necessary
- Do NOT use quotes, colons, or special formatting
- Do NOT answer the user's question - only create a title
- Focus on the key subject matter or action being discussed

Examples:
- User: "How do I center a div in CSS?" → Title: "CSS div centering help"
- User: "Can you explain quantum computing?" → Title: "Quantum computing explanation"
- User: "I'm having trouble with my React component state" → Title: "React component state issue"
- User: "Write a Python function to sort a list" → Title: "Python list sorting function"`,
      prompt,
    });

    // Filter out reasoning tokens for reasoning models (like Deepseek R1)
    let title = rawTitle.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Remove any quotes, colons, or ellipsis that might have been added
    title = title.replace(/^["']|["']$/g, ''); // Remove leading/trailing quotes
    title = title.replace(/\.{3,}$/g, ''); // Remove trailing ellipsis
    title = title.replace(/:$/, ''); // Remove trailing colon
    title = title.trim();

    return NextResponse.json({ title, isTitle, messageId, threadId });
  } catch (error) {
    console.error('Failed to generate title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
