class Analytics {
  constructor() {
    this.queue = [];
    this.isInitialized = false;

    // Try to send events periodically
    setInterval(() => {
      this.flush();
    }, 5000);
  }

  init() {
    this.isInitialized = true;
    this.flush();
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Store in localStorage for now
    const events = JSON.parse(localStorage.getItem("flora_analytics") || "[]");
    events.push(event);
    localStorage.setItem("flora_analytics", JSON.stringify(events.slice(-100)));

    // Add to queue
    this.queue.push(event);
    this.flush();
  }

  trackPageView(pageName) {
    this.track("page_view", { page: pageName });
  }

  flush() {
    if (!this.isInitialized || this.queue.length === 0) return;

    // Simulate sending events to a server
    const toSend = [...this.queue];
    this.queue = [];

    console.log("Sending analytics events:", toSend.length);
  }
}

const analytics = new Analytics();
export default analytics;
