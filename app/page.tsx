"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMessage: Message = { role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
          OpenAI Chat
        </span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={streaming}
          className="ml-auto text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 disabled:opacity-50 cursor-pointer"
        >
          <optgroup label="GPT-5">
            <option value="gpt-5.5">gpt-5.5</option>
            <option value="gpt-5.4">gpt-5.4</option>
            <option value="gpt-5.4-mini">gpt-5.4-mini</option>
          </optgroup>
          <optgroup label="GPT-4.1">
            <option value="gpt-4.1">gpt-4.1</option>
            <option value="gpt-4.1-mini">gpt-4.1-mini</option>
          </optgroup>
          <optgroup label="GPT-4o">
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-mini">gpt-4o-mini</option>
          </optgroup>
          <optgroup label="Reasoning">
            <option value="o4-mini">o4-mini</option>
            <option value="o3">o3</option>
            <option value="o3-mini">o3-mini</option>
          </optgroup>
        </select>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
            <p className="text-base">Send a message to get started</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-normal ${
                msg.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-sm whitespace-pre-wrap"
                  : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-sm"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <div className="[&_li>p]:m-0 [&_li>p:only-child]:m-0 space-y-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-0.5 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-0.5 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-1.5 mb-0.5 first:mt-0">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                      li: ({ children }) => <li className="my-0">{children}</li>,
                      code: ({ children, className }) =>
                        className ? (
                          <code className="block bg-zinc-100 dark:bg-zinc-900 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto my-1.5 whitespace-pre">{children}</code>
                        ) : (
                          <code className="bg-zinc-100 dark:bg-zinc-900 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                        ),
                      pre: ({ children }) => <>{children}</>,
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70">{children}</a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 italic my-1.5 text-zinc-500 dark:text-zinc-400">{children}</blockquote>
                      ),
                      hr: () => <hr className="border-zinc-200 dark:border-zinc-700 my-2" />,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-current align-middle animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={streaming}
            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
