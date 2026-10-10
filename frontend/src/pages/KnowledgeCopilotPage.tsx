import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, FileText, Download, ThumbsUp, ThumbsDown, Sparkles, Filter } from "lucide-react";

interface CitationItem {
  citation_id: string;
  doc_title: string;
  doc_type: string;
  page: number;
  section: string;
  snippet: string;
  is_conflicting: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  status?: string;
  citations?: CitationItem[];
  latency_ms?: number;
}

export const KnowledgeCopilotPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      content:
        "Hello! I am your **VisionGuard Knowledge Copilot**. I can help you investigate quality defect events, correlate machine telemetry, retrieve authoritative SOP guidelines, and perform evidence-grounded root cause analysis. Select a production line or defect incident below to begin.",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [selectedLine, setSelectedLine] = useState("LINE-A");
  const [selectedMachine, setSelectedMachine] = useState("MCH-STAMP-01");
  const [selectedIncident, setSelectedIncident] = useState("DEF-2026-0941");
  const [permissionLevel] = useState("standard");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationItem | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const incParam = searchParams.get("incident");
    const lineParam = searchParams.get("line");
    if (incParam) setSelectedIncident(incParam);
    if (lineParam) setSelectedLine(lineParam);
  }, [searchParams]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputQuery.trim() || isStreaming) return;

    const userText = inputQuery.trim();
    setInputQuery("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);

    const assistantMsgId = `ast-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: "assistant",
      content: "",
      status: "Retrieving evidence...",
      citations: [],
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          production_line_id: selectedLine,
          machine_id: selectedMachine,
          incident_id: selectedIncident,
          permission_level: permissionLevel,
        }),
      });

      if (!response.body) throw new Error("ReadableStream not supported.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let accumulatedCitations: CitationItem[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "token") {
                accumulatedText += parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedText, status: undefined } : msg
                  )
                );
              } else if (parsed.type === "citations") {
                accumulatedCitations = parsed.citations;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, citations: accumulatedCitations } : msg
                  )
                );
              } else if (parsed.type === "status") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, status: parsed.content } : msg
                  )
                );
              } else if (parsed.type === "done") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, latency_ms: parsed.latency_ms } : msg
                  )
                );
              }
            } catch (err) {
              console.error("SSE parse error:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: "⚠️ System connection error. Ensure the FastAPI backend is running on port 8000." }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setInputQuery(q);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-bgMain">
      {/* Copilot Control Bar */}
      <div className="bg-bgSidebar border-b border-borderDark px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primaryBlue/20 border border-primaryBlue/40 flex items-center justify-center text-primaryBlue">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-textPrimary">Knowledge Copilot Chat Workspace</h2>
            <p className="text-[11px] text-textSecondary">Evidence-Grounded RAG & Industrial Diagnostics</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-bgCard border border-borderDark px-2.5 py-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-textSecondary" />
            <span className="text-textSecondary">Line:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="bg-transparent text-textPrimary focus:outline-none cursor-pointer"
            >
              <option value="LINE-A" className="bg-bgCard">Line A (Stamping)</option>
              <option value="LINE-B" className="bg-bgCard">Line B (Weld & CNC)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-bgCard border border-borderDark px-2.5 py-1 rounded-lg">
            <span className="text-textSecondary">Machine:</span>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="bg-transparent text-textPrimary focus:outline-none cursor-pointer"
            >
              <option value="MCH-STAMP-01" className="bg-bgCard">HydroPress 500T</option>
              <option value="MCH-HEAT-02" className="bg-bgCard">Furnace TI-1200</option>
              <option value="MCH-WELD-01" className="bg-bgCard">RoboWeld Laser</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-bgCard border border-borderDark px-2.5 py-1 rounded-lg">
            <span className="text-textSecondary">Defect Event:</span>
            <select
              value={selectedIncident}
              onChange={(e) => setSelectedIncident(e.target.value)}
              className="bg-transparent text-textPrimary focus:outline-none cursor-pointer"
            >
              <option value="DEF-2026-0941" className="bg-bgCard">DEF-0941 (Surface Crack)</option>
              <option value="DEF-2026-0938" className="bg-bgCard">DEF-0938 (Porosity Void)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                  msg.sender === "user"
                    ? "bg-primaryBlue text-white"
                    : "bg-bgCard border border-borderDark text-primaryBlue"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Box */}
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed space-y-3 ${
                  msg.sender === "user"
                    ? "bg-primaryBlue/20 border border-primaryBlue/30 text-textPrimary"
                    : "bg-bgCard border border-borderDark text-textPrimary"
                }`}
              >
                {/* Streaming Status */}
                {msg.status && (
                  <div className="flex items-center gap-2 text-[11px] text-warningOrange font-mono animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{msg.status}</span>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Citations Panel */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-borderDark space-y-2">
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                      Traceable Source Citations ({msg.citations.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.citation_id}
                          onClick={() => setActiveCitation(cit)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
                            cit.is_conflicting
                              ? "bg-defectRed/10 border-defectRed/40 text-defectRed hover:bg-defectRed/20"
                              : "bg-bgSidebar border-borderDark text-textSecondary hover:text-textPrimary hover:border-primaryBlue"
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>{cit.citation_id} {cit.doc_title} (p.{cit.page})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                {msg.sender === "assistant" && msg.content && !msg.status && (
                  <div className="flex items-center justify-between text-[10px] text-textSecondary pt-2">
                    <span>Latency: {msg.latency_ms ?? 340} ms • Grounded RAG</span>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-successGreen transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <button className="hover:text-defectRed transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Citation Viewer Sidebar Modal */}
        {activeCitation && (
          <div className="w-80 bg-bgSidebar border-l border-borderDark p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primaryBlue font-mono">Source Citation Detail</span>
                <button
                  onClick={() => setActiveCitation(null)}
                  className="text-xs text-textSecondary hover:text-textPrimary"
                >
                  Close ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-textPrimary">{activeCitation.doc_title}</h4>
                <div className="text-[11px] text-textSecondary space-y-1">
                  <p>Type: <span className="text-textPrimary font-mono uppercase">{activeCitation.doc_type}</span></p>
                  <p>Page: <span className="text-textPrimary font-mono">{activeCitation.page}</span></p>
                  <p>Section: <span className="text-textPrimary">{activeCitation.section}</span></p>
                </div>
              </div>

              <div className="p-3 bg-bgCard border border-borderDark rounded-lg text-xs text-textPrimary space-y-2">
                <p className="text-[10px] font-bold text-textSecondary uppercase">Extracted Chunk Snippet</p>
                <p className="italic text-textSecondary leading-relaxed">{activeCitation.snippet}</p>
              </div>
            </div>

            <button className="w-full py-2 bg-primaryBlue text-white text-xs font-medium rounded-lg hover:bg-primaryBlue/90 transition-colors flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Download Document PDF
            </button>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 bg-bgSidebar/50 border-t border-borderDark flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-textSecondary text-[11px] font-medium shrink-0">Sample Queries:</span>
        <button
          onClick={() => handleQuickQuestion("Why might the metal component have developed a crack on Production Line A?")}
          className="px-2.5 py-1 rounded bg-bgCard border border-borderDark text-textSecondary hover:text-textPrimary hover:border-primaryBlue shrink-0 transition-colors"
        >
          Why crack on Line A?
        </button>
        <button
          onClick={() => handleQuickQuestion("What diagnostic sensor thresholds are required per SOP-402 for HydroPress 500T?")}
          className="px-2.5 py-1 rounded bg-bgCard border border-borderDark text-textSecondary hover:text-textPrimary hover:border-primaryBlue shrink-0 transition-colors"
        >
          SOP-402 HydroPress thresholds
        </button>
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-bgSidebar border-t border-borderDark">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about defect root causes, SOP procedures, or missing measurements..."
            className="flex-1 bg-bgCard border border-borderDark rounded-xl px-4 py-3 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primaryBlue transition-colors"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !inputQuery.trim()}
            className="px-5 py-3 rounded-xl bg-primaryBlue text-white font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primaryBlue/90 transition-all flex items-center gap-2 shadow-lg shadow-primaryBlue/20"
          >
            <Send className="w-4 h-4" />
            <span>Ask Copilot</span>
          </button>
        </form>
      </div>
    </div>
  );
};
