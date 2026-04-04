import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the LLM Architecture Expert Chat!\n\nI can help with tokenization, embeddings, attention mechanisms, next-token prediction, and OSS models like LLaMA, Qwen, and Mistral.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputVal.trim() || loading) return;

    const userMessage: Message = { role: "user", content: inputVal.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputVal("");
    setLoading(true);

    try {
      const candidateUrls = ["/api/chat", "http://localhost:3000/api/chat"];

      let lastError: unknown = null;
      let replyText: string | null = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages }),
          });

          const raw = await res.text();
          let data: any = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            throw new Error(`Non-JSON response from ${url}: ${raw.slice(0, 120)}`);
          }

          if (!res.ok) {
            throw new Error(data?.error || `HTTP ${res.status} from ${url}`);
          }

          if (typeof data?.reply === "string" && data.reply.trim().length > 0) {
            replyText = data.reply;
            break;
          }

          throw new Error(`Missing 'reply' in response from ${url}`);
        } catch (err) {
          lastError = err;
        }
      }

      if (replyText) {
        setMessages([...newMessages, { role: "assistant", content: replyText }]);
      } else {
        console.error("Chat request failed:", lastError);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "I cannot reach the backend right now. Make sure backend is running on port 3000, then try again.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I cannot reach the backend right now. Make sure backend is running on port 3000, then try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setShowHint(false);
        }}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all z-50 ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        aria-label="Open LLM expert chat"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {showHint && !isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="fixed bottom-24 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg z-40 flex items-center gap-2 pointer-events-none"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ask me about LLM architecture</span>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <h3 className="font-semibold text-foreground">LLM Expert Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors hover:bg-muted p-1 rounded"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm break-words ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm prose dark:prose-invert prose-sm max-w-none"
                    }`}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground p-3 rounded-2xl rounded-tl-sm text-sm opacity-70">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-muted/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                  placeholder="Tokenization, embeddings, attention..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  disabled={loading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputVal.trim() || loading}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  title="Send message (Enter key)"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only answers LLM architecture questions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
