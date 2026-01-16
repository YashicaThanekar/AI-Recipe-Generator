import { useState, useEffect } from 'react';

function VoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(prev => prev ? `${prev}, ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          console.warn('Please allow microphone access to use voice input.');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setSupported(false);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported) {
      console.warn('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`btn-voice ${isListening ? 'listening' : ''}`}
      title={isListening ? 'Click to stop listening' : 'Click to speak ingredients'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      )}
    </button>
  );
}

export default VoiceInput;
