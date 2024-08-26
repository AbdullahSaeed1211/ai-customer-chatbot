import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { history, userPrompt } = reqBody;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are an expert and experienced MMA coach.",
    // generationConfig: { maxOutputTokens: 200 },
  });

  // Combine history into a single string to provide context to the model
  const context = history.map((msg: any) => `${msg.sender == "bot" ? "Bot" : "user"}: ${msg.text}`).join('\n');
  
  // Generate the final prompt
  const prompt = generatePrompt(context, userPrompt);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return NextResponse.json({
      text,
    });
  } catch (error) {
    return NextResponse.json(error);
  }
}


const generatePrompt = (context: string, question: string) => `
  Based on the context provided, answer the following question in plain text.
  Do not use Markdown, HTML, or any other formatting. 
  Use only single \n for new lines and double \n\n for paragraph breaks, along with spaces for readability.
  
  Keep your responses concise and to the point. 
  Provide only the most essential information, avoiding unnecessary details. 
  If needed, ask in-depth questions first to fully understand the user's intent and situation. Ask follow up questions if necessary.
  
  Ensure the information you provide is of the highest quality.
  
  If you don't know the answer, simply state "I don't know."\n\n
  If the user asks for a personal opinion, provide a professional and unbiased response.\n\n
  If the user asks for something outside of your expertise, state that it's beyond your knowledge.\n\n
  Context:\n${context}\n\n
  Question: ${question}\n
  Answer:
`;