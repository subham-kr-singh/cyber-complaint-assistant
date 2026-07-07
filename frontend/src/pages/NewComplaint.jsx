import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShieldAlt, FaPaperPlane } from "react-icons/fa";
import { complaintApi } from "../context/ApiContext.jsx";

export default function NewComplaint() {
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    startSession();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages]);

  async function startSession() {
    try {
      const res = await complaintApi.start();
      setComplaintId(res.data.complaintId);
      setCurrentQuestion(res.data.firstQuestion);
      setMessages([{ from: "bot", text: res.data.firstQuestion }]);
    } catch (err) {
      toast.error("Could not start a new complaint session");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!answer.trim()) return;

    const userAnswer = answer;
    setMessages((prev) => [...prev, { from: "user", text: userAnswer }]);
    setAnswer("");

    try {
      const res = await complaintApi.answer(complaintId, {
        question: currentQuestion,
        answer: userAnswer,
      });

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        setMessages((prev) => [...prev, { from: "bot", text: res.data.nextQuestion }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Thanks. Let me analyze this and identify the right authority..." },
        ]);
        const classifyRes = await complaintApi.classify(complaintId);
        const { crimeType, routedAuthority } = classifyRes.data.complaint;
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `This looks like a case of "${crimeType.replace(/_/g, " ")}". I recommend filing with ${
              routedAuthority?.name || "the national cybercrime portal"
            }.`,
          },
        ]);
        setFinished(true);
      }
    } catch (err) {
      toast.error("Something went wrong, please try again");
    }
  }

  async function handleSubmitComplaint() {
    try {
      await complaintApi.submit(complaintId);
      toast.success("Complaint submitted!");
      navigate(`/complaints/${complaintId}`);
    } catch (err) {
      toast.error("Could not submit complaint");
    }
  }

  if (loading) return <div className="p-8 text-center text-paperText/60">Starting your session...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <FaShieldAlt className="text-xl text-brass" aria-hidden="true" />
        <h1 className="font-display text-xl font-semibold text-ink">Guided Complaint Assistant</h1>
      </div>

      <div className="h-[60vh] space-y-3 overflow-y-auto rounded-lg border border-paperDim bg-white p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                m.from === "user" ? "bg-stampRed text-white" : "bg-paper text-paperText"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {!finished ? (
        <form onSubmit={handleSend} className="mt-4 flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 rounded border border-paperDim px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded bg-stampRed px-4 py-2 text-white transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
          >
            <FaPaperPlane /> Send
          </button>
        </form>
      ) : (
        <button
          onClick={handleSubmitComplaint}
          className="mt-4 w-full rounded bg-stampRed py-2.5 font-semibold text-white transition-colors hover:bg-stampRedDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stampRed"
        >
          Continue to Evidence Upload & Submit
        </button>
      )}
    </div>
  );
}
