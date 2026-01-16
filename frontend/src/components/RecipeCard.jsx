import { useState } from 'react';

function RecipeCard({ recipe, format = 'text', onSaveFavorite, onAskChatbot, showActions = true }) {
  const [showNutrition, setShowNutrition] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const fetchNutrition = async () => {
    if (nutritionData) {
      setShowNutrition(!showNutrition);
      return;
    }

    setLoadingNutrition(true);
    try {
      const response = await fetch('http://localhost:5000/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe })
      });
      const data = await response.json();
      if (data.success) {
        setNutritionData(data.nutrition);
        setShowNutrition(true);
      }
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  // Render JSON format recipe (modern card layout)
  if (format === 'json' && typeof recipe === 'object') {
    return (
      <div className="recipe-card">
        {/* Recipe Header */}
        <div className="recipe-header">
          <h2 className="recipe-title">{recipe.title || 'Delicious Recipe'}</h2>
          <p className="recipe-description">{recipe.description}</p>
          <div className="recipe-meta">
            {recipe.prepTime && (
              <span className="meta-item">Prep: {recipe.prepTime}</span>
            )}
            {recipe.cookTime && (
              <span className="meta-item">Cook: {recipe.cookTime}</span>
            )}
            {recipe.difficulty && (
              <span className="meta-item">{recipe.difficulty}</span>
            )}
            {recipe.servings && (
              <span className="meta-item">{recipe.servings}</span>
            )}
          </div>
        </div>

        {/* Recipe Body */}
        <div className="recipe-body">
          <div className="recipe-grid">
            {/* Ingredients */}
            <div className="ingredients-section">
              <h3 className="section-title">Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="instructions-section">
              <h3 className="section-title">Instructions</h3>
              <ol className="instructions-list">
                {recipe.instructions?.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Chef's Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="tips-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', borderLeft: '4px solid #d97706' }}>
              <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Chef's Tips</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {recipe.tips.map((tip, index) => (
                  <li key={index} style={{ padding: '0.3rem 0', color: '#666' }}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutrition Preview */}
          {recipe.nutrition && (
            <div className="nutrition-preview" style={{ marginTop: '1.5rem', padding: '1rem', background: '#d1fae5', borderRadius: '12px' }}>
              <h4 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Nutrition (per serving)</h4>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>{recipe.nutrition.calories} cal</span>
                <span>{recipe.nutrition.protein} protein</span>
                <span>{recipe.nutrition.carbs} carbs</span>
                <span>{recipe.nutrition.fat} fat</span>
              </div>
            </div>
          )}

          {/* Alternative Ingredients */}
          {recipe.alternatives && recipe.alternatives.length > 0 && (
            <div className="alternatives-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#dbeafe', borderRadius: '12px' }}>
              <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>Ingredient Alternatives</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {recipe.alternatives.map((alt, index) => (
                  <li key={index} style={{ padding: '0.3rem 0', color: '#666' }}>• {alt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="recipe-actions">
            <button onClick={onSaveFavorite} className="btn-action btn-favorite">
              Save to Favorites
            </button>
            <button onClick={onAskChatbot} className="btn-action btn-chatbot">
              Ask Chef AI
            </button>
            <button 
              onClick={fetchNutrition} 
              className="btn-action btn-nutrition"
              disabled={loadingNutrition}
            >
              {loadingNutrition ? 'Loading...' : 'Nutrition Info'}
            </button>
          </div>
        )}

        {/* Detailed Nutrition Modal */}
        {showNutrition && nutritionData && (
          <div style={{ 
            padding: '1.5rem', 
            background: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#059669' }}>Detailed Nutrition Analysis</h4>
              <button 
                onClick={() => setShowNutrition(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem' 
            }}>
              {nutritionData.perServing && Object.entries(nutritionData.perServing).map(([key, value]) => (
                <div key={key} style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontWeight: '700', color: '#764ba2', fontSize: '1.1rem' }}>{value}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>{key}</div>
                </div>
              ))}
            </div>
            {nutritionData.healthScore && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                  color: 'white', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  Health Score: {nutritionData.healthScore}/10
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render text format recipe (fallback)
  return (
    <div className="recipe-card">
      <div className="recipe-content">
        <pre className="recipe-text">{typeof recipe === 'string' ? recipe : JSON.stringify(recipe, null, 2)}</pre>
      </div>
      
      {showActions && (
        <div className="recipe-actions">
          <button onClick={onSaveFavorite} className="btn-action btn-favorite">
            Save to Favorites
          </button>
          <button onClick={onAskChatbot} className="btn-action btn-chatbot">
            Ask Chef AI
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
