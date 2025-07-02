import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CustomerSupportContext = createContext();

export function CustomerSupportProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to Flora Nature customer support. How can I help you today?",
      sender: "support",
      timestamp: new Date().toISOString(),
      type: "text"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: "Plant Care Question",
      description: "I need help with my Monstera plant care",
      priority: "medium",
      category: "care",
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Auto-responder for common questions
  const autoResponder = useCallback((message) => {
    const lowerMessage = message.toLowerCase();
    let response = "Thank you for your message. Our team will get back to you soon.";
    
    if (lowerMessage.includes("plant") && lowerMessage.includes("care")) {
      response = "For plant care questions, check our care guide or I can connect you with our plant experts.";
    } else if (lowerMessage.includes("order") || lowerMessage.includes("shipping")) {
      response = "For order and shipping inquiries, please provide your order number and I'll help you track it.";
    } else if (lowerMessage.includes("return") || lowerMessage.includes("refund")) {
      response = "Our return policy allows returns within 30 days. Please check our return policy page for details.";
    } else if (lowerMessage.includes("payment") || lowerMessage.includes("billing")) {
      response = "We accept all major credit cards, UPI, and digital wallets. Is there a specific payment issue?";
    }
    
    return response;
  }, []);

  const toggleSupport = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sendMessage = useCallback((text) => {
    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text"
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Auto-response after 2 seconds
    setTimeout(() => {
      setIsTyping(false);
      const autoResponse = {
        id: Date.now() + 1,
        text: autoResponder(text),
        sender: "support",
        timestamp: new Date().toISOString(),
        type: "text"
      };
      setMessages(prev => [...prev, autoResponse]);
    }, 2000);
  }, [autoResponder]);

  const createTicket = useCallback((ticketData) => {
    const newTicket = {
      id: Date.now(),
      ...ticketData,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTickets(prev => [...prev, newTicket]);
    
    // Add system message about ticket creation
    const systemMessage = {
      id: Date.now() + 1,
      text: `Ticket #${newTicket.id} created successfully. We'll get back to you within 24 hours.`,
      sender: "system",
      timestamp: new Date().toISOString(),
      type: "text"
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const updateTicketStatus = useCallback((ticketId, status) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    
    // Add status update message
    const statusMessage = {
      id: Date.now(),
      text: `Ticket #${ticketId} status updated to: ${status}`,
      sender: "system",
      timestamp: new Date().toISOString(),
      type: "text"
    };
    setMessages(prev => [...prev, statusMessage]);
  }, []);

  const closeSupport = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openSupport = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Save messages and tickets to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('flora_customer_support_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('flora_customer_support_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  // Load messages and tickets from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('flora_customer_support_messages');
    const savedTickets = localStorage.getItem('flora_customer_support_tickets');
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  const value = {
    isOpen,
    toggleSupport,
    sendMessage,
    messages,
    isTyping,
    createTicket,
    tickets,
    updateTicketStatus,
    openSupport,
    closeSupport
  };

  return (
    <CustomerSupportContext.Provider value={value}>
      {children}
    </CustomerSupportContext.Provider>
  );
}

export function useCustomerSupport() {
  const context = useContext(CustomerSupportContext);
  if (!context) {
    throw new Error('useCustomerSupport must be used within a CustomerSupportProvider');
  }
  return context;
}
