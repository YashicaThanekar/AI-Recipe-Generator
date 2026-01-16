import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';

function History({ user }) {
  const [historyRecipes, setHistoryRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        console.log('History: No user logged in');
        setLoading(false);
        return;
      }

      console.log('History: Fetching history for user:', user.uid);

      try {
        const historyQuery = query(
          collection(db, `users/${user.uid}/history`),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(historyQuery);
        console.log('History: Fetched', snapshot.docs.length, 'documents');
        
        const recipes = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('History document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            // Handle both timestamp formats
            displayDate: data.createdAt ? new Date(data.createdAt) : 
                        data.timestamp?.toDate ? data.timestamp.toDate() : 
                        new Date()
          };
        });
        setHistoryRecipes(recipes);
        console.log('History loaded:', recipes.length, 'recipes');
      } catch (error) {
        console.error('Error fetching history:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Try alternative query without ordering if it fails
        try {
          console.log('History: Trying alternative query without ordering');
          const snapshot = await getDocs(collection(db, `users/${user.uid}/history`));
          console.log('History (alternative): Fetched', snapshot.docs.length, 'documents');
          
          const recipes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              displayDate: data.createdAt ? new Date(data.createdAt) : 
                          data.timestamp?.toDate ? data.timestamp.toDate() : 
                          new Date()
            };
          });
          // Sort manually
          recipes.sort((a, b) => b.displayDate - a.displayDate);
          setHistoryRecipes(recipes);
          console.log('History loaded (unordered):', recipes.length, 'recipes');
        } catch (err) {
          console.error('Error fetching history (alternative):', err);
          console.error('Error code:', err.code);
          console.error('Error message:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="history-page">
        <div className="page-container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>Login Required</h2>
            <p>Please login to view your recipe history</p>
            <Link to="/login" className="btn-primary">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <span>Loading your history...</span>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="page-container">
        <h1 className="page-title">Recipe History</h1>
        <p className="page-subtitle">Your previously generated recipes</p>

        {historyRecipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p>No recipes in your history yet!</p>
            <Link to="/" className="btn-primary">
              Generate Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="compact-recipes-grid">
            {historyRecipes.map((item) => (
              <div 
                key={item.id} 
                className="compact-recipe-card"
                onClick={() => setSelectedRecipe(item)}
              >
                <div className="compact-card-header">
                  <h3 className="compact-recipe-title">
                    {typeof item.recipe === 'object' ? item.recipe.title : 'Recipe'}
                  </h3>
                  <span className="compact-date">
                    {item.displayDate?.toLocaleDateString()}
                  </span>
                </div>
                
                <p className="compact-recipe-description">
                  {typeof item.recipe === 'object' ? item.recipe.description : item.recipe.substring(0, 120) + '...'}
                </p>
                
                <div className="compact-recipe-tags">
                  {item.filters?.cuisine && (
                    <span className="compact-tag">{item.filters.cuisine}</span>
                  )}
                  {item.filters?.mealType && (
                    <span className="compact-tag">{item.filters.mealType}</span>
                  )}
                  {typeof item.recipe === 'object' && item.recipe.difficulty && (
                    <span className="compact-tag">{item.recipe.difficulty}</span>
                  )}
                </div>
                
                <div className="compact-card-footer">
                  <span className="view-more-text">Click to view full recipe →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
            <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedRecipe(null)}
              >
                ✕
              </button>
              <div className="modal-recipe-content">
                <RecipeCard 
                  recipe={selectedRecipe.recipe}
                  format={typeof selectedRecipe.recipe === 'object' ? 'json' : 'text'}
                  showActions={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
