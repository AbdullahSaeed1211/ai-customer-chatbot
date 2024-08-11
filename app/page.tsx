import Chatbot from "@/components/Chatbot";

export default function Home() {
  return (
    <main className="h-screen flex flex-col justify-center items-center">
      Chat with the bot below:
      <Chatbot />
    </main>
  );
}
