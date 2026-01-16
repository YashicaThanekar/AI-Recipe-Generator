import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import VoiceInput from '../components/VoiceInput';
import RecipeCard from '../components/RecipeCard';
import Chatbot from '../components/Chatbot';
import CustomizationModal from '../components/CustomizationModal';
import RecipeCarousel from '../components/RecipeCarousel';
import Notification from '../components/Notification';

function Home({ user }) {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [recipeFormat, setRecipeFormat] = useState('text');
  const [loading, setLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    cuisine: 'Any',
    taste: 'Any',
    mealType: 'Any',
    portion: '2-3 people',
    dietary: 'None'
  });

  // Example ingredient suggestions
  const exampleIngredients = [
    'Chicken, Rice, Tomatoes',
    'Paneer, Spinach, Cream',
    'Eggs, Bread, Cheese',
    'Pasta, Garlic, Olive Oil',
    'Salmon, Lemon, Dill'
  ];

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      setNotification({ message: 'Please enter some ingredients!', type: 'warning' });
      return;
    }

    // Show customization modal
    setShowCustomization(true);
  };

  const handleCustomizationSubmit = async (customizationData) => {
    setShowCustomization(false);
    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: customizationData.ingredients.split(',').map(i => i.trim()),
          cuisine: customizationData.cuisine,
          taste: customizationData.taste,
          mealType: customizationData.mealType,
          portion: customizationData.portion,
          dietary: customizationData.dietary,
          spiceLevel: customizationData.spiceLevel,
          cookingTime: customizationData.cookingTime
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecipe(data.recipe);
        setRecipeFormat(data.format || 'text');
        
        // Update filters state to match customization
        setFilters({
          cuisine: customizationData.cuisine,
          taste: customizationData.taste,
          mealType: customizationData.mealType,
          portion: customizationData.portion,
          dietary: customizationData.dietary
        });
        
        // Save to history if user is logged in
        if (user) {
          await saveToHistory(data.recipe, customizationData);
        }
      } else {
        setNotification({ message: 'Error generating recipe: ' + data.error, type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({ message: 'Failed to generate recipe. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCarouselRecipeClick = async (suggestedRecipe) => {
    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: [],
          recipeName: suggestedRecipe.name,
          cuisine: suggestedRecipe.cuisine,
          taste: 'Any',
          mealType: 'Any',
          portion: '2-3 people',
          dietary: 'None',
          spiceLevel: 'Medium',
          cookingTime: suggestedRecipe.time
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecipe(data.recipe);
        setRecipeFormat(data.format || 'text');
        setIngredients(''); // Clear ingredients field
        
        // Update filters
        setFilters({
          cuisine: suggestedRecipe.cuisine,
          taste: 'Any',
          mealType: 'Any',
          portion: '2-3 people',
          dietary: 'None'
        });
        
        // Save to history if user is logged in
        if (user) {
          const customizationData = {
            ingredients: suggestedRecipe.name,
            cuisine: suggestedRecipe.cuisine,
            taste: 'Any',
            mealType: 'Any',
            portion: '2-3 people',
            dietary: 'None'
          };
          await saveToHistory(data.recipe, customizationData);
        }
      } else {
        setNotification({ message: 'Error generating recipe: ' + data.error, type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({ message: 'Failed to generate recipe. Please check your connection and try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (recipeData, customizationData = null) => {
    if (!user) {
      console.log('Cannot save to history: User not logged in');
      return;
    }
    
    console.log('Attempting to save to history for user:', user.uid);
    
    try {
      const historyData = {
        recipe: recipeData,
        ingredients: customizationData ? customizationData.ingredients : ingredients,
        filters: customizationData ? {
          cuisine: customizationData.cuisine,
          taste: customizationData.taste,
          mealType: customizationData.mealType,
          portion: customizationData.portion,
          dietary: customizationData.dietary
        } : filters,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        userId: user.uid
      };
      
      console.log('History data to save:', historyData);
      const docRef = await addDoc(collection(db, `users/${user.uid}/history`), historyData);
      console.log('Recipe saved to history successfully! Doc ID:', docRef.id);
    } catch (error) {
      console.error('Error saving to history:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setNotification({ message: 'Failed to save to history: ' + error.message, type: 'error' });
    }
  };

  const saveToFavorites = async () => {
    if (!user) {
      setNotification({ message: 'Please login to save favorites!', type: 'warning' });
      return;
    }

    if (!recipe) {
      setNotification({ message: 'No recipe to save!', type: 'warning' });
      return;
    }

    console.log('Attempting to save to favorites for user:', user.uid);

    try {
      const favoriteData = {
        recipe: recipe,
        ingredients: ingredients,
        filters: filters,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        userId: user.uid
      };
      
      console.log('Favorite data to save:', favoriteData);
      const docRef = await addDoc(collection(db, `users/${user.uid}/favorites`), favoriteData);
      console.log('Recipe saved to favorites successfully! Doc ID:', docRef.id);
      setNotification({ message: 'Recipe saved to favorites!', type: 'success' });
    } catch (error) {
      console.error('Error saving to favorites:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setNotification({ message: 'Failed to save to favorites: ' + error.message, type: 'error' });
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Turn Ingredients Into Delicious Recipes</h1>
          <p className="hero-subtitle">
            Powered by AI - Enter your ingredients and let our smart chef create the perfect recipe for you
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Enter ingredients (e.g., chicken, rice, tomatoes)..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <VoiceInput onTranscript={setIngredients} />
          </div>

          <button 
            className="btn-generate" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>

          {/* Example Chips */}
          <div className="example-chips">
            <span className="chip-label">Try:</span>
            {exampleIngredients.map((example, index) => (
              <button
                key={index}
                className="example-chip"
                onClick={() => setIngredients(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Result */}
      {recipe && (
        <div className="recipe-section">
          <RecipeCard 
            recipe={recipe}
            format={recipeFormat}
            onSaveFavorite={saveToFavorites}
            onAskChatbot={() => setShowChatbot(true)}
          />
        </div>
      )}

      {/* Chatbot Modal */}
      {showChatbot && (
        <Chatbot 
          recipeContext={recipe}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {/* Customization Modal */}
      {showCustomization && (
        <CustomizationModal 
          initialIngredients={ingredients}
          onClose={() => setShowCustomization(false)}
          onGenerate={handleCustomizationSubmit}
        />
      )}

      {/* Suggested Recipes Carousel */}
      <RecipeCarousel onRecipeGenerate={handleCarouselRecipeClick} />

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About SavoraAI</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Revolutionizing Home Cooking with AI</h3>
              <p>
                SavoraAI is your intelligent cooking companion that transforms the way you cook at home. 
                Using advanced AI technology, we help you create delicious recipes from whatever ingredients 
                you have on hand. No more food waste, no more boring meals!
              </p>
              <p>
                Whether you're a beginner or an experienced chef, SavoraAI adapts to your skill level, 
                dietary preferences, and taste preferences to provide personalized recipe recommendations 
                that make cooking fun and accessible for everyone.
              </p>
            </div>
            <div className="about-features">
              <div className="feature-card">
                <span className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg></span>
                <h4>AI-Powered</h4>
                <p>Advanced algorithms create perfect recipes</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                <h4>Personalized</h4>
                <p>Tailored to your preferences & dietary needs</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                <h4>Instant Results</h4>
                <p>Get recipes in seconds, not hours</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                <h4>Global Cuisine</h4>
                <p>Explore flavors from around the world</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="how-to-use-section">
        <div className="container">
          <h2 className="section-title">How to Use SavoraAI</h2>
          <p className="section-subtitle">Get started in 3 simple steps</p>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
              <h3>Enter Ingredients</h3>
              <p>Type in the ingredients you have at home, or use voice input for hands-free convenience.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
              <h3>Customize Preferences</h3>
              <p>Select your cuisine type, dietary restrictions, spice level, cooking time, and more.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></div>
              <h3>Cook & Enjoy</h3>
              <p>Follow the AI-generated recipe with step-by-step instructions and cooking tips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">Perfect for home cooks of all levels</p>
          <div className="pricing-cards">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="plan-badge">Free</div>
              <h3 className="plan-name">Starter</h3>
              <div className="plan-price">
                <span className="price">$0</span>
                <span className="period">/forever</span>
              </div>
              <ul className="plan-features">
                <li className="included">10 recipes per day</li>
                <li className="included">Basic recipe generation</li>
                <li className="included">Standard cuisines</li>
                <li className="included">Save to favorites</li>
                <li className="included">Recipe history (30 days)</li>
                <li className="excluded">Voice input</li>
                <li className="excluded">AI chatbot assistance</li>
                <li className="excluded">Advanced customization</li>
                <li className="excluded">Meal planning</li>
              </ul>
              <button className="plan-btn btn-free">Get Started</button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card pricing-card-featured">
              <div className="plan-badge plan-badge-pro">Most Popular</div>
              <h3 className="plan-name">Pro</h3>
              <div className="plan-price">
                <span className="price">$9.99</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li className="included">Unlimited recipes</li>
                <li className="included">Advanced AI recipe generation</li>
                <li className="included">All global cuisines</li>
                <li className="included">Unlimited favorites & history</li>
                <li className="included">Voice input support</li>
                <li className="included">AI chatbot assistance</li>
                <li className="included">Advanced customization options</li>
                <li className="included">Weekly meal planner</li>
                <li className="included">Nutrition analysis</li>
                <li className="included">Priority support</li>
              </ul>
              <button className="plan-btn btn-pro">Upgrade to Pro</button>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card">
              <div className="plan-badge">Premium</div>
              <h3 className="plan-name">Chef</h3>
              <div className="plan-price">
                <span className="price">$19.99</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li className="included">Everything in Pro</li>
                <li className="included">Recipe video tutorials</li>
                <li className="included">Live cooking classes</li>
                <li className="included">Personal chef consultation</li>
                <li className="included">Custom diet plans</li>
                <li className="included">Grocery list integration</li>
                <li className="included">Family sharing (5 members)</li>
                <li className="included">Early access to new features</li>
                <li className="included">Ad-free experience</li>
                <li className="included">24/7 premium support</li>
              </ul>
              <button className="plan-btn btn-premium">Go Premium</button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Home;
