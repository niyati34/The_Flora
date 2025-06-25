import { useState, useRef, useEffect } from "react";
import analytics from "../utils/analytics";

import { useCustomerSupport } from "../context/CustomerSupportContext";
const CustomerSupport = () => {
  const { open, openSupport, closeSupport } = useCustomerSupport();
  const [isOpen, setIsOpen] = useState(open);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm here to help you with your plant questions. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock responses for common plant questions
  const botResponses = {
    greetings: [
      "Hello! How can I help you with your plants today?",
      "Hi there! What plant question can I answer for you?",
      "Welcome! I'm here to help with all your plant care needs."
    ],
    watering: [
      "Most houseplants prefer to dry out slightly between waterings. Check the top inch of soil - if it's dry, it's time to water!",
      "Overwatering is more common than underwatering. Look for yellowing leaves as a sign of too much water.",
      "The finger test works great - stick your finger 1-2 inches into the soil. If it's dry, water your plant."
    ],
    light: [
      "Most houseplants prefer bright, indirect light. Direct sunlight can scorch the leaves.",
      "If your plant is stretching toward the window, it needs more light. Consider moving it closer or adding a grow light.",
      "South-facing windows get the most light, while north-facing get the least. East and west are usually perfect for most plants."
    ],
    fertilizer: [
      "During growing season (spring/summer), fertilize monthly with a balanced liquid fertilizer diluted to half strength.",
      "In winter, most plants rest and don't need fertilizer. Resume feeding in spring when new growth appears.",
      "Yellow leaves can indicate over-fertilizing. Flush the soil with water if you think you've overdone it."
    ],
    pests: [
      "Common signs of pests include sticky leaves, tiny webs, or small moving dots. Neem oil is a safe, effective treatment.",
      "Isolate any plant with pests immediately to prevent spread. Wipe leaves with soapy water as a first step.",
      "Prevention is key - keep plants healthy and inspect them regularly during watering."
    ],
    repotting: [
      "Repot when roots are circling the bottom or growing out of drainage holes. Usually every 1-2 years.",
      "Spring is the best time to repot when plants are actively growing and can recover quickly.",
      "Go up just one pot size when repotting. Too large a pot can lead to overwatering issues."
    ],
    default: [
      "That's a great question! For specific plant care advice, I recommend consulting our plant care guides or speaking with one of our experts.",
      "I'd be happy to help you find the right information. Can you tell me more about your specific plant or concern?",
      "For detailed plant identification or complex issues, you might want to try our Plant Scanner feature or contact our plant specialists."
    ]
  };

  const getKeywords = (text) => {
    const keywords = {
      greetings: ["hello", "hi", "hey", "good morning", "good afternoon", "help"],
      watering: ["water", "watering", "dry", "wet", "moisture", "overwater", "underwater"],
      light: ["light", "sun", "shade", "bright", "dark", "window", "sunlight"],
      fertilizer: ["fertilizer", "fertilize", "feed", "nutrients", "yellow", "growth"],
      pests: ["bugs", "pests", "insects", "aphids", "spider mites", "sticky", "webs"],
      repotting: ["repot", "pot", "roots", "container", "transplant", "rootbound"]
    };

    const lowerText = text.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerText.includes(word))) {
        return category;
      }
    }
    return "default";
  };

  const getBotResponse = (userMessage) => {
    const category = getKeywords(userMessage);
    const responses = botResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    analytics.track("customer_support_message_sent", {
      messageLength: inputMessage.length,
      category: getKeywords(inputMessage)
    });

    setInputMessage("");
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        sender: "bot",
        text: getBotResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      analytics.track("customer_support_bot_response", {
        responseCategory: getKeywords(inputMessage)
      });
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How often should I water my plants?",
    "Why are my plant's leaves turning yellow?",
    "What's the best light for houseplants?",
    "How do I know if my plant needs repotting?",
    "How can I get rid of plant pests?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  // Expose openSupport globally for navbar button
  if (typeof window !== "undefined") {
    window.openCustomerSupport = openSupport;
  }
  if (!open) {
    return (
      <div className="customer-support-widget">
        <button
          className="btn btn-success rounded-circle position-fixed"
          style={{
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }}
          onClick={() => {
            openSupport();
            analytics.track("customer_support_opened");
          }}
        >
          <i className="fas fa-comments fa-lg"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="customer-support-chat">
      <div
        className="position-fixed bg-white border rounded-lg shadow-lg"
        style={{
          bottom: "20px",
          right: "20px",
          width: "350px",
          height: "500px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Chat Header */}
        <div className="chat-header bg-success text-white p-3 rounded-top d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className="fas fa-leaf me-2"></i>
            <div>
              <h6 className="mb-0">Plant Support</h6>
              <small>We're here to help!</small>
            </div>
          </div>
          <button
            className="btn btn-sm text-white"
            onClick={() => {
              closeSupport();
              analytics.track("customer_support_closed");
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages flex-grow-1 p-3 overflow-auto" style={{ maxHeight: "300px" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message mb-3 ${message.sender === "user" ? "text-end" : ""}`}
            >
              <div
                className={`d-inline-block p-2 rounded ${
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "80%" }}
              >
                {message.text}
              </div>
              <div className="small text-muted mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message mb-3">
              <div className="d-inline-block p-2 rounded bg-light text-dark">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="quick-questions p-2 border-top">
            <small className="text-muted">Quick questions:</small>
            <div className="mt-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  className="btn btn-sm btn-outline-primary me-1 mb-1"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="chat-input p-3 border-top">
          <div className="input-group">
            <textarea
              className="form-control"
              placeholder="Ask about plant care..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="2"
              style={{ resize: "none" }}
            />
            <button
              className="btn btn-success"
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Typing indicator styles */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          background-color: #999;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerSupport;
