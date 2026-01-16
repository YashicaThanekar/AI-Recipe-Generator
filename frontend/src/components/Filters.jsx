function Filters({ filters, setFilters }) {
  const cuisines = ['Any', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'American', 'French'];
  const tastes = ['Any', 'Sweet', 'Savory', 'Spicy', 'Tangy', 'Mild', 'Bold'];
  const mealTypes = ['Any', 'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];
  const portions = ['1 person', '2-3 people', '4-6 people', 'Family (8+)'];
  const dietaryOptions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'High-Protein'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="filters-section">
      <div className="filters-container">
        <h3 className="filters-title">Customize Your Recipe</h3>
        
        <div className="filters-grid">
          {/* Cuisine Filter */}
          <div className="filter-group">
            <label className="filter-label">Cuisine</label>
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="filter-select"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          {/* Taste Filter */}
          <div className="filter-group">
            <label className="filter-label">Taste</label>
            <select
              value={filters.taste}
              onChange={(e) => handleFilterChange('taste', e.target.value)}
              className="filter-select"
            >
              {tastes.map(taste => (
                <option key={taste} value={taste}>{taste}</option>
              ))}
            </select>
          </div>

          {/* Meal Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Meal Type</label>
            <select
              value={filters.mealType}
              onChange={(e) => handleFilterChange('mealType', e.target.value)}
              className="filter-select"
            >
              {mealTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Portion Filter */}
          <div className="filter-group">
            <label className="filter-label">Portion Size</label>
            <select
              value={filters.portion}
              onChange={(e) => handleFilterChange('portion', e.target.value)}
              className="filter-select"
            >
              {portions.map(portion => (
                <option key={portion} value={portion}>{portion}</option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div className="filter-group">
            <label className="filter-label">Dietary</label>
            <select
              value={filters.dietary}
              onChange={(e) => handleFilterChange('dietary', e.target.value)}
              className="filter-select"
            >
              {dietaryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;
