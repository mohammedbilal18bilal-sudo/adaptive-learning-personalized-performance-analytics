import { useState } from "react";
import API_BASE_URL from "../services/api";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm LearnSmart. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    const question = message.trim();

    if (!question || loading) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: "Please log in again to use LearnSmart.",
        },
      ]);
      return;
    }

    setMessages((previous) => [
      ...previous,
      { role: "user", text: question },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.message || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Unable to get a response: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="learnsmart-chatbot">
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close LearnSmart" : "Open LearnSmart"}
      >
        {isOpen ? "✕" : "💬"}
        {!isOpen && <span> Ask LearnSmart</span>}
      </button>

      {isOpen && (
        <section className="chatbot-window">
          <header className="chatbot-header">
            <div>
              <strong>LearnSmart AI</strong>
              <small> Your learning assistant</small>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chatbot-message ${item.role}`}
              >
                {item.text}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message assistant">
                Thinking...
              </div>
            )}
          </div>

          <form className="chatbot-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              aria-label="Your question"
            />

            <button type="submit" disabled={loading || !message.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}