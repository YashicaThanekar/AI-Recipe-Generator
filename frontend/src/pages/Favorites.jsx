import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';

function Favorites({ user }) {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        console.log('Favorites: No user logged in');
        setLoading(false);
        return;
      }

      console.log('Favorites: Fetching favorites for user:', user.uid);

      try {
        const favoritesQuery = query(
          collection(db, `users/${user.uid}/favorites`),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(favoritesQuery);
        console.log('Favorites: Fetched', snapshot.docs.length, 'documents');
        
        const recipes = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Favorites document:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            // Handle both timestamp formats
            displayDate: data.createdAt ? new Date(data.createdAt) : 
                        data.timestamp?.toDate ? data.timestamp.toDate() : 
                        new Date()
          };
        });
        setFavoriteRecipes(recipes);
        console.log('Favorites loaded:', recipes.length, 'recipes');
      } catch (error) {
        console.error('Error fetching favorites:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Try alternative query without ordering if it fails
        try {
          console.log('Favorites: Trying alternative query without ordering');
          const snapshot = await getDocs(collection(db, `users/${user.uid}/favorites`));
          console.log('Favorites (alternative): Fetched', snapshot.docs.length, 'documents');
          
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
          setFavoriteRecipes(recipes);
          console.log('Favorites loaded (unordered):', recipes.length, 'recipes');
        } catch (err) {
          console.error('Error fetching favorites (alternative):', err);
          console.error('Error code:', err.code);
          console.error('Error message:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (recipeId) => {
    if (!window.confirm('Remove this recipe from favorites?')) return;
    
    try {
      await deleteDoc(doc(db, `users/${user.uid}/favorites`, recipeId));
      setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      console.warn('Failed to remove from favorites');
    }
  };

  if (!user) {
    return (
      <div className="favorites-page">
        <div className="page-container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>Login Required</h2>
            <p>Please login to view your favorite recipes</p>
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
        <span>Loading your favorites...</span>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="page-container">
        <h1 className="page-title">Favorite Recipes</h1>
        <p className="page-subtitle">Your saved recipes collection ({favoriteRecipes.length} recipes)</p>

        {favoriteRecipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p>No favorite recipes yet!</p>
            <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>
              Generate a recipe and click "Save to Favorites" to add it here
            </p>
            <Link to="/" className="btn-primary">
              Discover Recipes
            </Link>
          </div>
        ) : (
          <div className="compact-recipes-grid">
            {favoriteRecipes.map((item) => (
              <div 
                key={item.id} 
                className="compact-recipe-card favorite-card"
              >
                <div className="compact-card-header">
                  <h3 className="compact-recipe-title">
                    {typeof item.recipe === 'object' ? item.recipe.title : 'Recipe'}
                  </h3>
                  <button 
                    className="compact-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(item.id);
                    }}
                    title="Remove from favorites"
                  >
                    ×
                  </button>
                </div>
                
                <div onClick={() => setSelectedRecipe(item)} style={{ cursor: 'pointer' }}>
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
                    <span className="compact-date">Saved {item.displayDate?.toLocaleDateString()}</span>
                    <span className="view-more-text">View recipe →</span>
                  </div>
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
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button 
                    className="btn-remove"
                    onClick={() => {
                      handleRemoveFavorite(selectedRecipe.id);
                      setSelectedRecipe(null);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Remove from Favorites
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
