import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './Login';

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    if (!showLogin) {
      fetch('/api/superheroes')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Ensure data is an array
          if (Array.isArray(data)) {
            setSuperheroes(data);
          } else {
            setSuperheroes([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching superheroes:', error);
          setSuperheroes([]); // Set empty array on error
        });
    }
  }, [showLogin]);

  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected
        return [prev[1], hero];
      }
    });
  };

  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  const handleCompare = async () => {
    if (selectedHeroes.length === 2) {
      try {
        const response = await fetch(`/api/superheroes/compare?id1=${selectedHeroes[0].id}&id2=${selectedHeroes[1].id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setComparisonResult(result);
        setCurrentView('comparison');
      } catch (error) {
        console.error('Error fetching comparison:', error);
      }
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
    setComparisonResult(null);
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2 || !comparisonResult) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const { categories, overall_winner } = comparisonResult;

    return (
      <div className="comparison-view">
        <button className="back-button" onClick={handleBackToTable}>
          ← Back to Heroes Table
        </button>
        <h1>Superhero Comparison</h1>
        
        <div className="comparison-container">
          <div className="hero-card">
            <img src={hero1.image} alt={hero1.name} className="hero-image" />
            <h2>{hero1.name}</h2>
          </div>
          
          <div className="vs-section">
            <h2>VS</h2>
          </div>
          
          <div className="hero-card">
            <img src={hero2.image} alt={hero2.name} className="hero-image" />
            <h2>{hero2.name}</h2>
          </div>
        </div>

        <div className="stats-comparison">
          {categories.map(category => {
            const winner = category.winner === 1 ? 'hero1' : category.winner === 2 ? 'hero2' : 'tie';
            
            return (
              <div key={category.name} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {category.id1_value}
                </div>
                <div className="stat-name">
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>
                  {category.id2_value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="final-result">
          <h2>Final Result</h2>
          {overall_winner === 'tie' ? (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: {(() => {
                const hero1Wins = categories.filter(cat => cat.winner === 1).length;
                const hero2Wins = categories.filter(cat => cat.winner === 2).length;
                return `${hero1Wins}-${hero2Wins}`;
              })()}</p>
            </div>
          ) : (
            <div className="winner-announcement">
              <h3>🏆 {overall_winner === 1 ? hero1.name : hero2.name} Wins!</h3>
              <p>Score: {(() => {
                const hero1Wins = categories.filter(cat => cat.winner === 1).length;
                const hero2Wins = categories.filter(cat => cat.winner === 2).length;
                return overall_winner === 1 ? `${hero1Wins}-${hero2Wins}` : `${hero2Wins}-${hero1Wins}`;
              })()}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      <div className="selection-info">
        <p>Select 2 superheroes to compare ({selectedHeroes.length}/2 selected)</p>
        {selectedHeroes.length > 0 && (
          <div className="selected-heroes">
            Selected: {selectedHeroes.map(h => h.name).join(', ')}
          </div>
        )}
        <button 
          className="compare-button" 
          onClick={handleCompare}
          disabled={selectedHeroes.length !== 2}
        >
          Compare Heroes
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Intelligence</th>
            <th>Strength</th>
            <th>Speed</th>
            <th>Durability</th>
            <th>Power</th>
            <th>Combat</th>
          </tr>
        </thead>
        <tbody>
          {superheroes.map((hero) => (
            <tr 
              key={hero.id} 
              className={isHeroSelected(hero.id) ? 'selected-row' : ''}
            >
              <td>
                <input
                  type="checkbox"
                  checked={isHeroSelected(hero.id)}
                  onChange={() => handleHeroSelection(hero)}
                />
              </td>
              <td>{hero.id}</td>
              <td>{hero.name}</td>
              <td><img src={hero.image} alt={hero.name} width="50" /></td>
              <td>{hero.powerstats?.intelligence || 0}</td>
              <td>{hero.powerstats?.strength || 0}</td>
              <td>{hero.powerstats?.speed || 0}</td>
              <td>{hero.powerstats?.durability || 0}</td>
              <td>{hero.powerstats?.power || 0}</td>
              <td>{hero.powerstats?.combat || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (showLogin) {
    return (
      <div className="App">
        <Login onLogin={() => setShowLogin(false)} />
      </div>
    );
  }
  return (
    <div className="App">
      <header className="App-header">
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
