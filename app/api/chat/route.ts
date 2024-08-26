import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Function to generate the prompt based on the provided context and question
const generatePrompt = (context: string, question: string) => {
  const instructions = `
    Based on the context provided, answer the following question in plain text.
    Do not use Markdown, HTML, or any other formatting. 
    Use only single \\n for new lines and double \\n\\n for paragraph breaks, along with spaces for readability.
    
    Keep your responses concise and to the point. 
    Provide only the most essential information, avoiding unnecessary details. 
    If needed, ask in-depth questions first to fully understand the user's intent and situation. Ask follow-up questions if necessary.

    Ensure the information you provide is of the highest quality.

    If you don't know the answer, simply state "I don't know."\\n\\n
    If the user asks for a personal opinion, provide a professional and unbiased response.\\n\\n
    If the user asks for something outside of your expertise, state that it's beyond your knowledge.\\n\\n
  `;

  const contextSection = `Context:\\n${context}\\n\\n`;
  const questionSection = `Question: ${question}\\n`;

  return `${instructions}${contextSection}${questionSection}Answer:`;
};

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { history, userPrompt } = reqBody;

    if (!Array.isArray(history) || typeof userPrompt !== 'string') {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are an expert and experienced MMA coach.",
    });

    const context = history.map((msg: any) => `${msg.sender === "bot" ? "Bot" : "User"}: ${msg.text}`).join('\n');
    const prompt = generatePrompt(context, userPrompt);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text(); // Ensure to await text extraction

    console.log('Generated Response:', text); // Log the generated text

    return NextResponse.json({
      status: "success",
      data: { text },
    });

  } catch (error) {
    console.error('Error generating content:', error);

    let errorMessage = "Failed to generate response";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    return NextResponse.json({
      status: "error",
      message: errorMessage,
    }, { status: 500 });
  }
}
