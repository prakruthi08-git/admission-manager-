import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  dashboardData: any;
}

export function Chatbot({ dashboardData }: ChatbotProps) {
  const { user } = useAuth();
  const role = user?.role || "Student";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm your admission assistant. How can I help you today?`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Role-specific suggested questions
  const getSuggestedQuestions = () => {
    switch (role) {
      case "Admin":
        return [
          "How many seats are remaining?",
          "What's the fill rate?",
          "Quota status?",
          "Program information?",
          "Give me an overview",
          "What can I configure?"
        ];
      case "Admission Officer":
        return [
          "How many seats are remaining?",
          "Pending documents?",
          "Pending fees?",
          "How many students admitted?",
          "Program information?",
          "What can I manage?"
        ];
      case "Management":
        return [
          "What's the fill rate?",
          "How many students admitted?",
          "Give me an overview",
          "Quota status?",
          "Program performance?",
          "What reports are available?"
        ];
      default:
        return [
          "How many seats are remaining?",
          "What's the fill rate?",
          "How many students admitted?",
          "Pending documents?",
          "Pending fees?",
          "Quota status?"
        ];
    }
  };

  const suggestedQuestions = getSuggestedQuestions();

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    const totalAdmitted = dashboardData.programsIntake.reduce((acc: number, curr: any) => acc + curr.admitted, 0);
    const totalIntake = dashboardData.programsIntake.reduce((acc: number, curr: any) => acc + curr.intake, 0);
    const fillRate = totalIntake > 0 ? ((totalAdmitted / totalIntake) * 100).toFixed(1) : 0;
    const remainingSeats = totalIntake - totalAdmitted;

    // Greetings
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return "Hello! I'm your admission assistant. I can help you with information about admissions, seats, documents, fees, and quota status. What would you like to know?";
    }

    // Remaining/Available seats
    if (message.includes("remaining") || message.includes("available") || message.includes("left") || message.includes("open")) {
      return `There are ${remainingSeats} seats remaining out of ${totalIntake} total seats (${fillRate}% filled).`;
    }

    // Fill rate / progress
    if ((message.includes("fill") && message.includes("rate")) || message.includes("progress") || message.includes("percentage")) {
      return `The current fill rate is ${fillRate}%. ${totalAdmitted} out of ${totalIntake} seats have been filled.`;
    }

    // Total admitted
    if ((message.includes("total") || message.includes("how many")) && message.includes("admitted")) {
      return `A total of ${totalAdmitted} students have been admitted so far across all programs.`;
    }

    // Pending documents
    if (message.includes("pending") && (message.includes("document") || message.includes("docs"))) {
      return `There are ${dashboardData.pendingDocuments} applicants with pending documents that need verification.`;
    }

    // Pending fees
    if (message.includes("pending") && message.includes("fee")) {
      return `There are ${dashboardData.pendingFees} admissions with pending fee payments.`;
    }

    // Quota information
    if (message.includes("quota")) {
      const quotaInfo = dashboardData.quotaStats.map((q: any) =>
        `${q.quotaType}: ${q.filled}/${q.filled + q.remaining} filled`
      ).join(", ");
      return `Current quota status: ${quotaInfo}`;
    }

    // Program-specific information
    if (message.includes("program") || message.includes("course")) {
      const programInfo = dashboardData.programsIntake.map((p: any) =>
        `${p.program}: ${p.admitted}/${p.intake} admitted`
      ).join(", ");
      return `Program status: ${programInfo}`;
    }

    // Statistics overview
    if (message.includes("stats") || message.includes("overview") || message.includes("summary")) {
      return `Admission Overview: ${totalAdmitted} admitted, ${remainingSeats} remaining, ${fillRate}% fill rate, ${dashboardData.pendingDocuments} pending documents, ${dashboardData.pendingFees} pending fees.`;
    }

    // Help
    if (message.includes("help") || message.includes("what") || message.includes("can you")) {
      switch (role) {
        case "Admin":
          return "As Admin, I can help you with: admission statistics, remaining seats, fill rates, quota status, program information, and system configuration guidance. Try asking about 'remaining seats', 'quota status', or 'what can I configure?'";
        case "Admission Officer":
          return "As Admission Officer, I can help you with: admission statistics, remaining seats, pending documents/fees, student admissions, and program information. Try asking about 'pending documents', 'remaining seats', or 'what can I manage?'";
        case "Management":
          return "As Management, I can help you with: admission statistics, fill rates, student admissions, quota status, program performance, and overview reports. Try asking about 'fill rate', 'overview', or 'what reports are available?'";
        default:
          return "I can help you with admission stats, seats, documents, fees, and quotas. Try asking about 'remaining seats', 'fill rate', 'pending documents', or 'quota status'.";
      }
    }

    // Thanks
    if (message.includes("thank") || message.includes("thanks")) {
      return "You're welcome! Is there anything else I can help you with regarding admissions?";
    }

    // Goodbye
    if (message.includes("bye") || message.includes("goodbye")) {
      return "Goodbye! Feel free to ask me anytime about admission information.";
    }

    // Default response with suggestions
    return "I'm sorry, I didn't understand that. I can help with admission stats, seats, documents, fees, and quotas. Try asking about 'remaining seats', 'fill rate', 'pending documents', or 'quota status'.";
  };

  const handleSuggestedQuestion = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(question),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(currentInput),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Admission Assistant
          </DialogTitle>
        </DialogHeader>
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.isBot
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-4 border-t">
          {messages.length > 0 && messages[messages.length - 1].isBot && (
            <div className="space-y-3 mb-4">
              <p className="text-xs text-muted-foreground font-medium">Quick Questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors border"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about admissions..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}