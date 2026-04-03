import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAskGenie } from "@workspace/api-client-react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function AskGenie({ caseData }: { caseData?: any }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your Small Claims Genie. Ask me anything about your case, California small claims court procedures, or I can analyze your uploaded documents.' }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speechSupported = !!getSpeechRecognition();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const mutation = useAskGenie({
    mutation: {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      },
      onError: () => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' }]);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullText = (question + interimText).trim();
    if (!fullText) return;
    if (isRecording) stopRecording();
    setMessages(prev => [...prev, { role: 'user', content: fullText }]);
    mutation.mutate({ data: { question: fullText, caseId: caseData?.id } });
    setQuestion("");
    setInterimText("");
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    const baseText = question;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalPart = "";
      let interimPart = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalPart += transcript;
        } else {
          interimPart += transcript;
        }
      }
      const prefix = baseText ? baseText + " " : "";
      setQuestion(prefix + finalPart);
      setInterimText(interimPart);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setInterimText("");
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText((prev) => {
        if (prev) {
          setQuestion((q) => q + prev);
        }
        return "";
      });
    };

    recognition.start();
    setIsRecording(true);
  }, [question]);

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4 space-y-4 min-h-[400px] max-h-[500px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
              msg.role === 'user'
                ? 'bg-navy text-white rounded-tr-none'
                : 'bg-white border text-foreground rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white border text-foreground rounded-lg rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-3 bg-navy/5 rounded-lg mx-2 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-navy">Listening...</span>
          </div>
          {(question || interimText) && (
            <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
              {question}{interimText && <span className="opacity-50">{interimText}</span>}
            </span>
          )}
        </div>
      )}

      {isRecording && (
        <div className="text-center text-xs text-muted-foreground py-1">
          Speak now — click mic again to stop
        </div>
      )}

      <div className="px-2 pb-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={question + (interimText ? interimText : "")}
              onChange={(e) => { setQuestion(e.target.value); setInterimText(""); }}
              placeholder="Ask Small Claims Genie a question..."
              className="bg-white pr-10"
              disabled={mutation.isPending}
            />
            {speechSupported && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                  isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={mutation.isPending}
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!(question + interimText).trim() || mutation.isPending}
            className="bg-gold hover:bg-gold/90 text-navy rounded-full h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
