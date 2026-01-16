import { useState } from 'react';
import '../styles.css';

function CustomizationModal({ onClose, onGenerate, initialIngredients }) {
  const [step, setStep] = useState(1);
  const [customization, setCustomization] = useState({
    ingredients: initialIngredients || '',
    cuisine: 'Any',
    taste: 'Any',
    mealType: 'Any',
    portion: '2-3 people',
    dietary: 'None',
    spiceLevel: 'Medium',
    cookingTime: 'Any',
    difficulty: 'Any'
  });

  const questions = [
    {
      step: 1,
      title: "What ingredients do you have?",
      subtitle: "Enter ingredients separated by commas",
      field: 'ingredients',
      type: 'text',
      placeholder: 'e.g., chicken, rice, tomatoes, garlic'
    },
    {
      step: 2,
      title: "What cuisine type would you prefer?",
      field: 'cuisine',
      type: 'select',
      options: ['Any', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'American', 'French']
    },
    {
      step: 3,
      title: "What's your taste preference?",
      field: 'taste',
      type: 'select',
      options: ['Any', 'Sweet', 'Spicy', 'Savory', 'Tangy', 'Mild']
    },
    {
      step: 4,
      title: "What type of meal?",
      field: 'mealType',
      type: 'select',
      options: ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer']
    },
    {
      step: 5,
      title: "How many servings?",
      field: 'portion',
      type: 'select',
      options: ['1 person', '2-3 people', '4-5 people', '6+ people']
    },
    {
      step: 6,
      title: "Any dietary restrictions?",
      field: 'dietary',
      type: 'select',
      options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb', 'Dairy-Free']
    },
    {
      step: 7,
      title: "Spice level preference?",
      field: 'spiceLevel',
      type: 'select',
      options: ['Mild', 'Medium', 'Hot', 'Extra Hot']
    },
    {
      step: 8,
      title: "How much time do you have?",
      field: 'cookingTime',
      type: 'select',
      options: ['Any', 'Under 15 mins', '15-30 mins', '30-60 mins', 'Over 1 hour']
    }
  ];

  const currentQuestion = questions.find(q => q.step === step);
  const totalSteps = questions.length;

  const handleNext = () => {
    if (step === 1 && !customization.ingredients.trim()) {
      // Input validation - will be handled by parent component
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    onGenerate(customization);
  };

  const handleChange = (value) => {
    setCustomization({
      ...customization,
      [currentQuestion.field]: value
    });
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="progress-text">
          Step {step} of {totalSteps}
        </div>

        {/* Question Content */}
        <div className="modal-content">
          <h2 className="modal-title">{currentQuestion.title}</h2>
          {currentQuestion.subtitle && (
            <p className="modal-subtitle">{currentQuestion.subtitle}</p>
          )}

          <div className="modal-input-section">
            {currentQuestion.type === 'text' ? (
              <textarea
                className="modal-textarea"
                value={customization[currentQuestion.field]}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={currentQuestion.placeholder}
                autoFocus
                rows={3}
              />
            ) : (
              <div className="modal-options">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={`option-btn ${customization[currentQuestion.field] === option ? 'selected' : ''}`}
                    onClick={() => handleChange(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="modal-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={handleBack}>
              ← Back
            </button>
          )}
          <button className="btn-primary" onClick={handleNext}>
            {step === totalSteps ? 'Generate Recipe' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizationModal;
