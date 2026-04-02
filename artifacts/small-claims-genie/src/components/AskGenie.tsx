import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { askGenie } from "@workspace/api-client-react";

export function AskGenie({ caseData }: { caseData?: any }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your Small Claims Genie. Ask me anything about your case, California small claims court procedures, or how to prepare for your hearing.' }
  ]);

  const mutation = useMutation({
    mutationFn: (q: string) => askGenie({ question: q, caseId: caseData?.id }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' }]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    mutation.mutate(question);
    setQuestion("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-bold text-navy">Ask The Genie AI</h2>
      </div>
      <p className="text-sm text-muted-foreground">Get instant answers about California small claims court procedures, your case strategy, and more.</p>

      <div className="border rounded-xl bg-muted/20 min-h-[400px] flex flex-col">
        <ScrollArea className="flex-1 p-4 max-h-[400px]">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
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
                <div className="bg-white border text-foreground rounded-lg rounded-tl-none px-4 py-2.5 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-navy/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your case..."
              className="flex-1 bg-white"
              disabled={mutation.isPending}
            />
            <Button type="submit" size="icon" disabled={!question.trim() || mutation.isPending} className="bg-navy hover:bg-navy/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
