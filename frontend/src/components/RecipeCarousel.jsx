import { useState, useEffect } from 'react';
import './RecipeCarousel.css';

function RecipeCarousel({ onRecipeGenerate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const itemsPerView = 3; // Show 3 recipes at a time

  // Sample recipes with images
  const suggestedRecipes = [
    {
      id: 1,
      name: 'Creamy Butter Chicken',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500',
      cuisine: 'Indian',
      time: '45 min',
      description: 'Rich and creamy chicken curry with aromatic spices'
    },
    {
      id: 2,
      name: 'Classic Margherita Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      cuisine: 'Italian',
      time: '30 min',
      description: 'Fresh mozzarella, tomatoes, and basil on crispy crust'
    },
    {
      id: 3,
      name: 'Pad Thai Noodles',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500',
      cuisine: 'Thai',
      time: '25 min',
      description: 'Sweet and tangy stir-fried noodles with peanuts'
    },
    {
      id: 4,
      name: 'Beef Tacos',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
      cuisine: 'Mexican',
      time: '20 min',
      description: 'Seasoned beef with fresh toppings and crispy shells'
    },
    {
      id: 5,
      name: 'Greek Salad Bowl',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500',
      cuisine: 'Greek',
      time: '15 min',
      description: 'Fresh vegetables with feta cheese and olive oil'
    },
    {
      id: 6,
      name: 'Sushi Rolls',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
      cuisine: 'Japanese',
      time: '40 min',
      description: 'Fresh fish and vegetables wrapped in seasoned rice'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(interval);
    }
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = suggestedRecipes.length - itemsPerView;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = suggestedRecipes.length - itemsPerView;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleRecipeClick = (recipe) => {
    if (onRecipeGenerate) {
      // Scroll to top to see the generated recipe
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onRecipeGenerate(recipe);
    }
  };

  return (
    <section 
      className="recipe-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <h2 className="section-title">Suggested Recipes</h2>
        
        <div className="carousel-container">
          <button 
            className="carousel-btn carousel-btn-prev" 
            onClick={handlePrev}
            aria-label="Previous recipe"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="carousel-wrapper">
            <div 
              className="carousel-track"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {suggestedRecipes.map((recipe, index) => (
                <div 
                  key={recipe.id} 
                  className="carousel-slide"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="recipe-carousel-card">
                    <div className="recipe-image-wrapper">
                      <img 
                        src={recipe.image} 
                        alt={recipe.name}
                        className="recipe-image"
                        loading="lazy"
                      />
                      <div className="recipe-overlay">
                        <span className="recipe-cuisine">{recipe.cuisine}</span>
                        <span className="recipe-time">{recipe.time}</span>
                      </div>
                    </div>
                    <div className="recipe-info">
                      <h3 className="recipe-name">{recipe.name}</h3>
                      <p className="recipe-description">{recipe.description}</p>
                      <button className="recipe-try-btn">
                        Try This Recipe →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="carousel-btn carousel-btn-next" 
            onClick={handleNext}
            aria-label="Next recipe"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="carousel-dots">
          {Array.from({ length: suggestedRecipes.length - itemsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecipeCarousel;
