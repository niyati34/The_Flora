import { useState, useEffect, useRef } from "react";
import { useCustomerSupport } from "../context/CustomerSupportContext";

export default function CustomerSupportPage() {
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
  
  const [activeTab, setActiveTab] = useState('chat');
  const [messageInput, setMessageInput] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (ticketSubject.trim() && ticketDescription.trim()) {
      createTicket({
        subject: ticketSubject,
        description: ticketDescription,
        priority: ticketPriority,
        category: ticketCategory
      });
      setTicketSubject('');
      setTicketDescription('');
      setTicketPriority('medium');
      setTicketCategory('general');
      setShowTicketForm(false);
    }
  };

  const handleTicketStatusUpdate = (ticketId, newStatus) => {
    updateTicketStatus(ticketId, newStatus);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  // Mock FAQ data
  const faqs = [
    {
      question: "How do I care for my plants?",
      answer: "Each plant comes with care instructions. Generally, most indoor plants need indirect sunlight, regular watering (but not overwatering), and occasional fertilizing."
    },
    {
      question: "What if my plant arrives damaged?",
      answer: "We offer a 30-day guarantee. If your plant arrives damaged, contact us immediately with photos and we'll replace it or provide a refund."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. We ship Monday-Friday to ensure plant health."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the continental United States due to plant import/export regulations."
    },
    {
      question: "Can I return a plant?",
      answer: "Yes, within 30 days of purchase if the plant is in its original condition. We cannot accept returns for plants that have been planted or repotted."
    }
  ];

  return (
    <div className="customer-support-page">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 text-success mb-3">
            <i className="fas fa-headset me-3"></i>
            Customer Support
          </h1>
          <p className="lead text-muted">
            We're here to help with all your plant care questions and concerns
          </p>
        </div>

        {/* Support Options */}
        <div className="row mb-5">
          <div className="col-md-4 mb-4">
            <div className="card text-center h-100 support-option-card">
              <div className="card-body">
                <div className="support-icon mb-3">
                  <i className="fas fa-comments fa-3x text-primary"></i>
                </div>
                <h5 className="card-title">Live Chat</h5>
                <p className="card-text">Get instant help from our plant experts</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('chat')}
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card text-center h-100 support-option-card">
              <div className="card-body">
                <div className="support-icon mb-3">
                  <i className="fas fa-ticket-alt fa-3x text-warning"></i>
                </div>
                <h5 className="card-title">Support Tickets</h5>
                <p className="card-text">Create a ticket for complex issues</p>
                <button 
                  className="btn btn-warning"
                  onClick={() => setActiveTab('tickets')}
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card text-center h-100 support-option-card">
              <div className="card-body">
                <div className="support-icon mb-3">
                  <i className="fas fa-question-circle fa-3x text-info"></i>
                </div>
                <h5 className="card-title">FAQ</h5>
                <p className="card-text">Find answers to common questions</p>
                <button 
                  className="btn btn-info"
                  onClick={() => setActiveTab('faq')}
                >
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                      onClick={() => setActiveTab('chat')}
                    >
                      <i className="fas fa-comments me-2"></i>
                      Live Chat
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tickets')}
                    >
                      <i className="fas fa-ticket-alt me-2"></i>
                      Support Tickets
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
                      onClick={() => setActiveTab('faq')}
                    >
                      <i className="fas fa-question-circle me-2"></i>
                      FAQ
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="card-body">
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="chat-section">
                    <div className="chat-header mb-3">
                      <h5 className="mb-0">
                        <i className="fas fa-headset me-2 text-success"></i>
                        Live Chat Support
                      </h5>
                      <small className="text-muted">
                        Our team is online and ready to help
                      </small>
                    </div>
                    
                    <div 
                      className="chat-messages mb-3" 
                      ref={chatContainerRef}
                      style={{ height: '400px', overflowY: 'auto' }}
                    >
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`message ${message.isUser ? 'user-message' : 'support-message'}`}
                        >
                          <div className={`message-bubble ${message.isUser ? 'user' : 'support'}`}>
                            <div className="message-content">
                              {message.text}
                            </div>
                            <div className="message-time">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="message support-message">
                          <div className="message-bubble support">
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
                    
                    <div className="chat-input">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          className="btn btn-success"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="tickets-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <i className="fas fa-ticket-alt me-2 text-warning"></i>
                        Support Tickets
                      </h5>
                      <button
                        className="btn btn-warning"
                        onClick={() => setShowTicketForm(!showTicketForm)}
                      >
                        <i className="fas fa-plus me-2"></i>
                        {showTicketForm ? 'Cancel' : 'New Ticket'}
                      </button>
                    </div>
                    
                    {showTicketForm && (
                      <div className="ticket-form mb-4">
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">Create New Support Ticket</h6>
                            <form onSubmit={handleCreateTicket}>
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <label className="form-label">Subject *</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="col-md-3 mb-3">
                                  <label className="form-label">Priority</label>
                                  <select
                                    className="form-select"
                                    value={ticketPriority}
                                    onChange={(e) => setTicketPriority(e.target.value)}
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>
                                <div className="col-md-3 mb-3">
                                  <label className="form-label">Category</label>
                                  <select
                                    className="form-select"
                                    value={ticketCategory}
                                    onChange={(e) => setTicketCategory(e.target.value)}
                                  >
                                    <option value="general">General</option>
                                    <option value="technical">Technical</option>
                                    <option value="billing">Billing</option>
                                    <option value="shipping">Shipping</option>
                                    <option value="plant-care">Plant Care</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="form-label">Description *</label>
                                <textarea
                                  className="form-control"
                                  rows="4"
                                  value={ticketDescription}
                                  onChange={(e) => setTicketDescription(e.target.value)}
                                  required
                                />
                              </div>
                              <button type="submit" className="btn btn-warning">
                                <i className="fas fa-paper-plane me-2"></i>
                                Submit Ticket
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="tickets-list">
                      {tickets.length === 0 ? (
                        <div className="text-center py-4">
                          <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                          <h5>No tickets yet</h5>
                          <p className="text-muted">Create your first support ticket to get help</p>
                        </div>
                      ) : (
                        <div className="row">
                          {tickets.map((ticket) => (
                            <div key={ticket.id} className="col-12 mb-3">
                              <div className="card ticket-card">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <h6 className="card-title mb-1">{ticket.subject}</h6>
                                      <p className="card-text text-muted mb-2">
                                        {ticket.description}
                                      </p>
                                      <div className="d-flex gap-2">
                                        <span className={`badge bg-${getPriorityColor(ticket.priority)}`}>
                                          {ticket.priority}
                                        </span>
                                        <span className={`badge bg-${getStatusColor(ticket.status)}`}>
                                          {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className="badge bg-secondary">
                                          {ticket.category}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <small className="text-muted d-block">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                      </small>
                                      {ticket.status === 'open' && (
                                        <select
                                          className="form-select form-select-sm mt-2"
                                          value={ticket.status}
                                          onChange={(e) => handleTicketStatusUpdate(ticket.id, e.target.value)}
                                        >
                                          <option value="open">Open</option>
                                          <option value="in_progress">In Progress</option>
                                          <option value="resolved">Resolved</option>
                                          <option value="closed">Closed</option>
                                        </select>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                  <div className="faq-section">
                    <h5 className="mb-4">
                      <i className="fas fa-question-circle me-2 text-info"></i>
                      Frequently Asked Questions
                    </h5>
                    
                    <div className="accordion" id="faqAccordion">
                      {faqs.map((faq, index) => (
                        <div key={index} className="accordion-item">
                          <h2 className="accordion-header" id={`faq-${index}`}>
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#faq-collapse-${index}`}
                              aria-expanded="false"
                              aria-controls={`faq-collapse-${index}`}
                            >
                              {faq.question}
                            </button>
                          </h2>
                          <div
                            id={`faq-collapse-${index}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`faq-${index}`}
                            data-bs-parent="#faqAccordion"
                          >
                            <div className="accordion-body">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .customer-support-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .support-option-card {
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .support-option-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .support-icon {
          color: #6c757d;
        }
        
        .chat-section {
          height: 100%;
        }
        
        .chat-messages {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          background: #f8f9fa;
        }
        
        .message {
          margin-bottom: 15px;
        }
        
        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
        }
        
        .message-bubble.user {
          background: #007bff;
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 4px;
        }
        
        .message-bubble.support {
          background: white;
          color: #333;
          border: 1px solid #dee2e6;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 5px;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6c757d;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        .ticket-card {
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        
        .ticket-card:hover {
          transform: translateY(-2px);
        }
        
        .accordion-item {
          border: none;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .accordion-button {
          background: white;
          border: none;
          font-weight: 500;
        }
        
        .accordion-button:not(.collapsed) {
          background: #e7f3ff;
          color: #0d6efd;
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
        }
        
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom: 2px solid #0d6efd;
          background: none;
        }
      `}</style>
    </div>
  );
}
