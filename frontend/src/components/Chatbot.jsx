import { useState, useRef, useEffect } from 'react';

function Chatbot({ recipeContext, onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Hi! I'm Chef Savora, your AI cooking assistant. I'm here to help with any questions about your recipe. What would you like to know?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick action suggestions
  const quickActions = [
    "How do I make it healthier?",
    "What can I substitute?",
    "How to store leftovers?",
    "Tips for beginners?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          recipeContext: recipeContext
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const botMessage = { role: 'assistant', text: data.answer };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Connection error. Make sure the backend is running on port 5000.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-widget">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <h3>Chef Savora - Recipe Assistant</h3>
          <button onClick={onClose} className="btn-close" aria-label="Close">×</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.role === 'user' ? 'message-user' : 'message-bot'}`}
            >
              <div dangerouslySetInnerHTML={{ 
                __html: msg.text
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br>')
              }} />
            </div>
          ))}
          
          {loading && (
            <div className="message message-bot">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {/* Quick Actions - Show only at start */}
          {messages.length === 1 && !loading && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              marginTop: '1rem' 
            }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(action)}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#764ba2'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#764ba2';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#764ba2';
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Ask anything about the recipe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || !input.trim()}
            className="btn-send"
          >
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
