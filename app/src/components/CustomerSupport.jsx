import { useState, useEffect, useRef } from "react";
import { useCustomerSupport } from "../context/CustomerSupportContext";

export default function CustomerSupport() {
  const { 
    isOpen, 
    toggleSupport, 
    sendMessage, 
    messages, 
    isTyping,
    createTicket,
    tickets,
    updateTicketStatus
  } = useCustomerSupport();
  
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketCategory, setTicketCategory] = useState("general");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      scrollToBottom();
    }
  }, [isOpen, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (ticketSubject.trim() && ticketDescription.trim()) {
      createTicket({
        subject: ticketSubject.trim(),
        description: ticketDescription.trim(),
        priority: ticketPriority,
        category: ticketCategory
      });
      setTicketSubject("");
      setTicketDescription("");
      setShowTicketForm(false);
      setActiveTab("tickets");
    }
  };

  const handleTicketStatusUpdate = (ticketId, status) => {
    updateTicketStatus(ticketId, status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "#007bff";
      case "in-progress": return "#ffc107";
      case "resolved": return "#28a745";
      case "closed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const faqs = [
    {
      question: "How do I care for my new plant?",
      answer: "Start by placing your plant in appropriate lighting conditions and water according to the care instructions. Most plants prefer well-draining soil and moderate watering."
    },
    {
      question: "What should I do if my plant's leaves turn yellow?",
      answer: "Yellow leaves can indicate overwatering, underwatering, or nutrient deficiency. Check soil moisture and adjust watering accordingly."
    },
    {
      question: "How often should I repot my plants?",
      answer: "Most plants benefit from repotting every 1-2 years, or when roots become pot-bound. Spring is usually the best time for repotting."
    },
    {
      question: "What's the best way to propagate my plants?",
      answer: "Propagation methods vary by plant type. Common methods include stem cuttings, leaf cuttings, division, and air layering."
    },
    {
      question: "How can I prevent pests on my plants?",
      answer: "Regular inspection, proper watering, and good air circulation help prevent pests. Isolate affected plants and treat with appropriate methods."
    }
  ];

  if (!isOpen) {
    return (
      <div className="customer-support-widget">
        <button 
          className="support-toggle-btn"
          onClick={toggleSupport}
          title="Get Customer Support"
        >
          <i className="fas fa-headset"></i>
          <span>Support</span>
        </button>
      </div>
    );
  }

  return (
    <div className="customer-support-container">
      <style>
        {`
          .customer-support-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            overflow: hidden;
            border: 1px solid #e9ecef;
          }
          
          .support-header {
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
          }
          
          .support-title {
            font-size: 1.2rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .support-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background-color 0.3s ease;
          }
          
          .support-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .support-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          }
          
          .support-tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            color: #666;
            font-weight: 500;
            border-bottom: 3px solid transparent;
          }
          
          .support-tab.active {
            color: #6A9304;
            border-bottom-color: #6A9304;
            background: white;
          }
          
          .support-tab:hover {
            background: rgba(106, 147, 4, 0.1);
          }
          
          .support-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          
          .tab-content {
            flex: 1;
            overflow: hidden;
            display: none;
          }
          
          .tab-content.active {
            display: flex;
            flex-direction: column;
          }
          
          /* Chat Tab Styles */
          .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f8f9fa;
          }
          
          .message {
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
          }
          
          .message.user {
            align-items: flex-end;
          }
          
          .message.agent {
            align-items: flex-start;
          }
          
          .message-bubble {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 0.9rem;
            line-height: 1.4;
            word-wrap: break-word;
          }
          
          .message.user .message-bubble {
            background: #6A9304;
            color: white;
            border-bottom-right-radius: 6px;
          }
          
          .message.agent .message-bubble {
            background: white;
            color: #333;
            border: 1px solid #e9ecef;
            border-bottom-left-radius: 6px;
          }
          
          .message-time {
            font-size: 0.75rem;
            color: #999;
            margin-top: 5px;
            margin-left: 10px;
          }
          
          .message.user .message-time {
            margin-right: 10px;
            margin-left: 0;
          }
          
          .typing-indicator {
            padding: 12px 16px;
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 18px;
            border-bottom-left-radius: 6px;
            align-self: flex-start;
            margin-left: 20px;
            margin-bottom: 15px;
          }
          
          .typing-dots {
            display: flex;
            gap: 4px;
          }
          
          .typing-dot {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
          }
          
          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          
          @keyframes typing {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
          
          .chat-input {
            padding: 20px;
            border-top: 1px solid #e9ecef;
            background: white;
          }
          
          .chat-input-form {
            display: flex;
            gap: 10px;
          }
          
          .chat-input-field {
            flex: 1;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            padding: 12px 20px;
            outline: none;
            transition: border-color 0.3s ease;
          }
          
          .chat-input-field:focus {
            border-color: #6A9304;
          }
          
          .chat-send-btn {
            background: #6A9304;
            color: white;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .chat-send-btn:hover {
            background: #5a7d03;
            transform: scale(1.1);
          }
          
          /* Tickets Tab Styles */
          .tickets-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .tickets-header {
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            background: white;
          }
          
          .tickets-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
          }
          
          .btn-primary {
            background: #6A9304;
            color: white;
          }
          
          .btn-primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          
          .tickets-list {
            flex: 1;
            overflow-y: auto;
            padding: 0 20px 20px;
          }
          
          .ticket-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .ticket-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .ticket-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          
          .ticket-subject {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }
          
          .ticket-meta {
            display: flex;
            gap: 10px;
            align-items: center;
            font-size: 0.8rem;
            color: #666;
          }
          
          .ticket-priority,
          .ticket-status {
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.75rem;
          }
          
          .ticket-description {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.4;
          }
          
          .ticket-form {
            padding: 20px;
            background: white;
            border-top: 1px solid #e9ecef;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
          
          .form-label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 0.9rem;
          }
          
          .form-control {
            width: 100%;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 0.9rem;
            transition: border-color 0.3s ease;
          }
          
          .form-control:focus {
            border-color: #6A9304;
            outline: none;
          }
          
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          /* FAQ Tab Styles */
          .faq-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          
          .faq-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            margin-bottom: 15px;
            overflow: hidden;
          }
          
          .faq-question {
            padding: 15px 20px;
            background: #f8f9fa;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-weight: 600;
            color: #333;
            transition: background-color 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .faq-question:hover {
            background: #e9ecef;
          }
          
          .faq-answer {
            padding: 0 20px;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s ease;
            background: white;
          }
          
          .faq-item.expanded .faq-answer {
            padding: 20px;
            max-height: 200px;
          }
          
          .faq-chevron {
            transition: transform 0.3s ease;
          }
          
          .faq-item.expanded .faq-chevron {
            transform: rotate(180deg);
          }
          
          /* Widget Styles */
          .customer-support-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
          }
          
          .support-toggle-btn {
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .support-toggle-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.4);
          }
          
          .support-toggle-btn i {
            font-size: 1.2rem;
          }
          
          @media (max-width: 480px) {
            .customer-support-container {
              width: 100%;
              height: 100%;
              bottom: 0;
              right: 0;
              border-radius: 0;
            }
            
            .support-header {
              border-radius: 0;
            }
            
            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="support-header">
        <div className="support-title">
          <i className="fas fa-headset"></i>
          Customer Support
        </div>
        <button className="support-close" onClick={toggleSupport}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="support-tabs">
        <button 
          className={`support-tab ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <i className="fas fa-comments me-2"></i>
          Chat
        </button>
        <button 
          className={`support-tab ${activeTab === "tickets" ? "active" : ""}`}
          onClick={() => setActiveTab("tickets")}
        >
          <i className="fas fa-ticket-alt me-2"></i>
          Tickets
        </button>
        <button 
          className={`support-tab ${activeTab === "faq" ? "active" : ""}`}
          onClick={() => setActiveTab("faq")}
        >
          <i className="fas fa-question-circle me-2"></i>
          FAQ
        </button>
      </div>

      <div className="support-content">
        {/* Chat Tab */}
        <div className={`tab-content ${activeTab === "chat" ? "active" : ""}`}>
          <div className="chat-container">
            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <div className="message-bubble">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input">
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  className="chat-input-field"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="chat-send-btn">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tickets Tab */}
        <div className={`tab-content ${activeTab === "tickets" ? "active" : ""}`}>
          <div className="tickets-container">
            <div className="tickets-header">
              <div className="tickets-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTicketForm(!showTicketForm)}
                >
                  <i className="fas fa-plus me-2"></i>
                  {showTicketForm ? "Cancel" : "New Ticket"}
                </button>
                {tickets.length > 0 && (
                  <button className="btn btn-secondary">
                    <i className="fas fa-download me-2"></i>
                    Export
                  </button>
                )}
              </div>
              
              {showTicketForm && (
                <form onSubmit={handleCreateTicket} className="ticket-form">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-control"
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-control"
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="product">Product</option>
                        <option value="shipping">Shipping</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Please provide detailed information about your issue..."
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>
            
            <div className="tickets-list">
              {tickets.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-ticket-alt fa-3x mb-3"></i>
                  <p>No tickets yet. Create your first ticket to get help!</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="ticket-item"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="ticket-header">
                      <div>
                        <div className="ticket-subject">{ticket.subject}</div>
                        <div className="ticket-meta">
                          <span>#{ticket.id}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span 
                          className="ticket-priority"
                          style={{ backgroundColor: getPriorityColor(ticket.priority) + "20", color: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority}
                        </span>
                        <span 
                          className="ticket-status"
                          style={{ backgroundColor: getStatusColor(ticket.status) + "20", color: getStatusColor(ticket.status) }}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-description">
                      {ticket.description.length > 100 
                        ? ticket.description.substring(0, 100) + "..." 
                        : ticket.description
                      }
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FAQ Tab */}
        <div className={`tab-content ${activeTab === "faq" ? "active" : ""}`}>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => {
                    const item = document.querySelector(`.faq-item:nth-child(${index + 1})`);
                    item.classList.toggle("expanded");
                  }}
                >
                  {faq.question}
                  <i className="fas fa-chevron-down faq-chevron"></i>
                </button>
                <div className="faq-answer">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
