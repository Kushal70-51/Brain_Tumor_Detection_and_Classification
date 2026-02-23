import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Globe, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  isOnline?: boolean;
}

const MOCK_RESPONSES: Record<string, string> = {
  pituitary: "Pituitary tumors are growths that develop in the pituitary gland. Most are benign (noncancerous) and are called pituitary adenomas. They can affect hormone production and may cause vision problems if they grow large enough.",
  glioma: "Gliomas are tumors that originate in the glial cells of the brain. They account for about 33% of all brain tumors. Treatment typically involves surgery, radiation therapy, and chemotherapy depending on the grade.",
  meningioma: "Meningiomas arise from the meninges — the membranes that surround the brain and spinal cord. Most are benign and slow-growing. Surgical removal is the primary treatment option.",
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I'm your NeuroAI assistant. Ask me anything about brain tumors, MRI analysis, or neurological conditions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.toLowerCase();
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const matchedKey = Object.keys(MOCK_RESPONSES).find((k) => query.includes(k));
    const isOnline = !matchedKey;
    const content = matchedKey
      ? MOCK_RESPONSES[matchedKey]
      : `Based on your query about "${userMsg.content}", here's what I found: Brain tumors are classified into various types based on their origin, growth rate, and malignancy. For accurate diagnosis, an MRI scan combined with biopsy is recommended. Please consult a neurologist for personalized medical advice.`;

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content,
      timestamp: new Date(),
      isOnline,
    };
    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="glass-card flex flex-col h-[480px]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border/50 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">NeuroAI Chat</p>
          <p className="text-[10px] text-muted-foreground">AI-powered medical assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[10px] text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                  msg.role === "user" ? "bg-primary/20" : "bg-secondary"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <div className={`max-w-[75%] space-y-1.5`}>
                <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                  <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  {msg.isOnline && (
                    <span className="flex items-center gap-1 text-[10px] text-warning">
                      <Globe className="w-2.5 h-2.5" />
                      Online sources
                    </span>
                  )}
                </div>
                {msg.role === "ai" && msg.id !== "welcome" && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[9px] text-muted-foreground leading-snug">
                      For educational purposes only. Consult a medical professional.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about brain tumors..."
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-30 transition-opacity hover:opacity-90"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
