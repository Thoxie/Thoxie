import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useAskGenie } from "@workspace/api-client-react";
import { useAuth } from "@clerk/react";

export function AskGenie({ caseData }: { caseData?: any }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your Small Claims Genie. Ask me anything about your case, California small claims court procedures, or I can analyze your uploaded documents.' }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

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

  const transcribeMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
        reader.readAsDataURL(audioBlob);
      });
      const basePath = import.meta.env.BASE_URL || "/";
      const token = await getToken();
      const res = await fetch(`${basePath}api/ai/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ audioData: base64 }),
      });
      if (!res.ok) throw new Error("Transcription failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.text) {
        setQuestion(data.text);
      }
    },
    onError: (err) => {
      console.error("Transcription failed:", err);
      setQuestion("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    mutation.mutate({ data: { question, caseId: caseData?.id } });
    setQuestion("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const levels = Array.from(data.slice(0, 20)).map(v => v / 255);
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      console.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        transcribeMutation.mutate(audioBlob);
      };
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setIsRecording(false);
    setAudioLevels(new Array(20).fill(0));
  };

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
        <div className="flex items-center justify-center gap-1 py-3 bg-navy/5 rounded-lg mx-2 mb-2">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className="w-1 bg-navy rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, level * 32)}px` }}
            />
          ))}
        </div>
      )}

      {(isRecording || transcribeMutation.isPending) && (
        <div className="text-center text-xs text-muted-foreground py-1">
          {transcribeMutation.isPending ? "Transcribing..." : "Recording... release to transcribe"}
        </div>
      )}

      <div className="px-2 pb-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Small Claims Genie a question..."
              className="bg-white pr-10"
              disabled={mutation.isPending || isRecording}
            />
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={() => { if (isRecording) stopRecording(); }}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                isRecording ? "bg-red-500 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              disabled={mutation.isPending}
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!question.trim() || mutation.isPending}
            className="bg-gold hover:bg-gold/90 text-navy rounded-full h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
