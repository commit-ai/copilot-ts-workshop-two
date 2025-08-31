import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'

  useEffect(() => {
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
  }, []);

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

  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  const getSafeStat = (hero, stat) => {
    if (!hero.powerstats || hero.powerstats[stat] === null || hero.powerstats[stat] === undefined) {
      return 0;
    }
    const value = parseInt(hero.powerstats[stat]);
    return isNaN(value) ? 0 : value;
  };

  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    stats.forEach(stat => {
      const stat1 = getSafeStat(hero1, stat);
      const stat2 = getSafeStat(hero2, stat);
      if (stat1 > stat2) {
        hero1Score++;
      } else if (stat2 > stat1) {
        hero2Score++;
      }
    });

    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const result = calculateWinner(hero1, hero2);
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

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
          {stats.map(stat => {
            const stat1 = getSafeStat(hero1, stat);
            const stat2 = getSafeStat(hero2, stat);
            const winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {stat1}
                </div>
                <div className="stat-name">
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
                <div className={`stat-value ${winner === 'hero2' ? 'winner' : ''}`}>
                  {stat2}
                </div>
              </div>
            );
          })}
        </div>

        <div className="final-result">
          <h2>Final Result</h2>
          {result.winner ? (
            <div className="winner-announcement">
              <h3>🏆 {result.winner.name} Wins!</h3>
              <p>Score: {result.score}</p>
            </div>
          ) : (
            <div className="tie-announcement">
              <h3>🤝 It's a Tie!</h3>
              <p>Score: {result.score}</p>
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
              <td>{getSafeStat(hero, 'intelligence')}</td>
              <td>{getSafeStat(hero, 'strength')}</td>
              <td>{getSafeStat(hero, 'speed')}</td>
              <td>{getSafeStat(hero, 'durability')}</td>
              <td>{getSafeStat(hero, 'power')}</td>
              <td>{getSafeStat(hero, 'combat')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
