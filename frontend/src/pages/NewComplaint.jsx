import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShieldAlt,
  FaPaperPlane,
  FaArrowLeft,
  FaRobot,
  FaUser,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";

export default function NewComplaint() {
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [botTyping, setBotTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, botTyping]);

  async function startSession() {
    try {
      const res = await complaintApi.start();
      setComplaintId(res.data.complaintId);
      setCurrentQuestion(res.data.firstQuestion);
      setMessages([{ from: "bot", text: res.data.firstQuestion }]);
    } catch (err) {
      toast.error("Could not start a new complaint session. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function addBotMessage(text) {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || sending) return;

    // Optimistically show user message
    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setAnswer("");
    setSending(true);
    setBotTyping(true);

    try {
      const res = await complaintApi.answer(complaintId, {
        question: currentQuestion,
        answer: trimmed,
      });

      setBotTyping(false);

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        addBotMessage(res.data.nextQuestion);
        // Re-focus input after bot reply
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        // All questions answered — classify
        addBotMessage(
          "Thank you! Analysing your case and identifying the right authority…"
        );

        try {
          const classifyRes = await complaintApi.classify(complaintId);
          const { crimeType, routedAuthority, requiredEvidence } =
            classifyRes.data.complaint;

          const crimeLabel = crimeType
            ? crimeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
            : "an unclassified incident";

          addBotMessage(
            `✅ I've classified this as "${crimeLabel}". I recommend filing with ${
              routedAuthority?.name || "the National Cybercrime Reporting Portal (cybercrime.gov.in)"
            }.`
          );

          if (requiredEvidence?.length > 0) {
            addBotMessage(
              `📎 Please gather the following evidence before filing:\n• ${requiredEvidence.join(
                "\n• "
              )}`
            );
          }
        } catch {
          addBotMessage(
            "I wasn't able to classify automatically — you can still submit the complaint and review it on the dashboard."
          );
        }

        addBotMessage(
          "You can now upload evidence and submit your complaint using the button below."
        );
        setFinished(true);
      }
    } catch (err) {
      setBotTyping(false);
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleSubmitComplaint() {
    setSubmitting(true);
    try {
      await complaintApi.submit(complaintId);
      toast.success("Complaint submitted successfully!");
      navigate(`/complaints/${complaintId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit complaint");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <FaSyncAlt className="mx-auto mb-3 animate-spin text-3xl text-stampRed" />
          <p className="text-sm text-paperText/60">Starting your secure session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-paperText/60 transition-colors hover:text-stampRed"
        >
          <FaArrowLeft className="text-xs" />
          Back to Dashboard
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
            <FaShieldAlt className="text-brass" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              Guided Complaint Assistant
            </h1>
            <p className="text-xs text-paperText/60">
              Answer a few questions to file your complaint
            </p>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex h-[55vh] flex-col gap-3 overflow-y-auto rounded-xl border border-paperDim bg-white p-4 shadow-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.from === "bot" && (
              <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink">
                <FaRobot className="text-xs text-brass" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                m.from === "user"
                  ? "rounded-br-sm bg-stampRed text-white"
                  : "rounded-bl-sm bg-paper text-paperText shadow-sm"
              }`}
            >
              {m.text}
            </div>
            {m.from === "user" && (
              <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stampRed/20">
                <FaUser className="text-xs text-stampRed" />
              </div>
            )}
          </div>
        ))}

        {botTyping && (
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink">
              <FaRobot className="text-xs text-brass" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-paper px-4 py-3 shadow-sm">
              <span className="flex gap-1">
                {[0, 1, 2].map((n) => (
                  <span
                    key={n}
                    className="h-2 w-2 rounded-full bg-paperText/40 animate-bounce"
                    style={{ animationDelay: `${n * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input / Submit */}
      {!finished ? (
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            id="complaint-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            disabled={sending}
            autoComplete="off"
            className="flex-1 rounded-xl border border-paperDim bg-white px-4 py-2.5 text-sm text-ink shadow-sm placeholder:text-paperText/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-stampRed disabled:bg-paper disabled:cursor-wait"
          />
          <button
            type="submit"
            disabled={sending || !answer.trim()}
            className="flex items-center gap-2 rounded-xl bg-stampRed px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stampRedDark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            {sending ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      ) : (
        <button
          onClick={handleSubmitComplaint}
          disabled={submitting}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-stampRed py-3 font-semibold text-white shadow-sm transition-colors hover:bg-stampRedDark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
        >
          {submitting ? (
            <>
              <FaSyncAlt className="animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <FaCheckCircle /> Continue to Evidence Upload & Submit
            </>
          )}
        </button>
      )}
    </div>
  );
}
