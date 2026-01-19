import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="text-sm text-muted-foreground">
        您的浏览器不支持语音识别功能
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      variant={isListening ? "destructive" : "default"}
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      className="relative overflow-hidden"
    >
      {isListening ? (
        <>
          <MicOff className="mr-2 h-5 w-5" />
          正在听...
          <span className="absolute inset-0 animate-pulse bg-destructive/20" />
        </>
      ) : (
        <>
          <Mic className="mr-2 h-5 w-5" />
          语音输入
        </>
      )}
    </Button>
  );
}
