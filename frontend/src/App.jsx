/**
 * @file App.jsx
 * @description Main application component for the Superhero Comparison App.
 * Provides a table view of superheroes with their stats and a comparison view
 * to compare two selected superheroes side-by-side with a winner determination.
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main application component that manages superhero data and views.
 * Handles fetching superhero data, hero selection, and switching between
 * table view and comparison view.
 * 
 * @returns {JSX.Element} The main application UI
 */
function App() {
  // State management
  const [superheroes, setSuperheroes] = useState([]); // Array of all superhero objects
  const [selectedHeroes, setSelectedHeroes] = useState([]); // Array of up to 2 selected heroes for comparison
  const [currentView, setCurrentView] = useState('table'); // Current view: 'table' or 'comparison'

  // Fetch superhero data from API on component mount
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles selection/deselection of heroes for comparison.
   * Allows up to 2 heroes to be selected. If a third hero is selected,
   * it replaces the first selected hero (FIFO behavior).
   * 
   * @param {Object} hero - The superhero object to select or deselect
   */
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

  /**
   * Checks if a hero is currently selected for comparison.
   * 
   * @param {number|string} heroId - The ID of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches to the comparison view if exactly 2 heroes are selected.
   * Does nothing if the selection requirement is not met.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears the hero selections.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates the winner between two heroes by comparing their stats.
   * Each stat category (intelligence, strength, speed, durability, power, combat)
   * is compared, and the hero with more winning categories wins overall.
   * 
   * @param {Object} hero1 - First superhero object containing name, id, image, and powerstats properties
   * @param {Object} hero2 - Second superhero object containing name, id, image, and powerstats properties
   * @returns {Object} Object containing winner (hero object or null for tie) and score string
   */
  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat category and increment the winner's score
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
      // Ties in individual stats don't increment either score
    });

    // Determine overall winner based on category wins
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view displaying two heroes side-by-side.
   * Shows hero images, stat-by-stat comparison with visual indicators,
   * and the final winner determination.
   * 
   * @returns {JSX.Element|null} The comparison view JSX element, or null if exactly 2 heroes are not selected
   */
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
        
        {/* Hero cards section with images and names */}
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

        {/* Stat-by-stat comparison with winner highlighting */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this stat category
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

        {/* Final result announcement */}
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

  /**
   * Renders the main table view displaying all superheroes.
   * Includes selection checkboxes, hero stats, and a comparison button.
   * 
   * @returns {JSX.Element} The table view component
   */
  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      {/* Selection status and compare button */}
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
      
      {/* Main superhero data table */}
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
              <td>{hero.powerstats.intelligence}</td>
              <td>{hero.powerstats.strength}</td>
              <td>{hero.powerstats.speed}</td>
              <td>{hero.powerstats.durability}</td>
              <td>{hero.powerstats.power}</td>
              <td>{hero.powerstats.combat}</td>
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
