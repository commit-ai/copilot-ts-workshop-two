/**
 * @file App.jsx
 * @description Main application component for the Superhero Comparison app.
 * Provides functionality to view superheroes in a table, select them for comparison,
 * and display a detailed comparison of their power statistics.
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main application component that manages superhero data and comparison functionality.
 * 
 * @component
 * @returns {JSX.Element} The main application interface with table view or comparison view
 */
function App() {
  // State for storing all superheroes fetched from the API
  const [superheroes, setSuperheroes] = useState([]);
  // State for tracking which heroes are selected for comparison (max 2)
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  // State for managing which view to display: 'table' for hero list or 'comparison' for head-to-head
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'

  // Fetch superheroes data from the API when component mounts
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles the selection and deselection of heroes for comparison.
   * Implements a maximum selection of 2 heroes with automatic replacement logic.
   * 
   * @param {Object} hero - The hero object to select or deselect
   * @param {number} hero.id - Unique identifier for the hero
   * @param {string} hero.name - Name of the hero
   */
  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove hero if already selected (toggle off)
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add hero if less than 2 are currently selected
        return [...prev, hero];
      } else {
        // Replace the oldest selection (first in array) when 2 are already selected
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a hero is currently selected for comparison.
   * 
   * @param {number} heroId - The ID of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches to the comparison view if exactly 2 heroes are selected.
   * Triggered when the user clicks the "Compare Heroes" button.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears the hero selections.
   * Triggered when the user clicks the "Back to Heroes Table" button.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates the winner between two heroes by comparing their power statistics.
   * Each stat category (intelligence, strength, speed, etc.) is scored individually,
   * and the hero with more winning categories is declared the overall winner.
   * 
   * @param {Object} hero1 - The first hero to compare
   * @param {Object} hero2 - The second hero to compare
   * @returns {Object} Object containing the winner (or null for tie) and the score string
   * @returns {Object.winner} - The winning hero object, or null if tied
   * @returns {Object.score} - Score string in format "X-Y"
   */
  const calculateWinner = (hero1, hero2) => {
    // All stat categories used for comparison
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat category and award points
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
    });

    // Determine overall winner based on total points won
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view showing two heroes side-by-side with their stats
   * and determining a winner based on stat comparisons.
   * Returns null if not exactly 2 heroes are selected.
   * 
   * @returns {JSX.Element|null} The comparison view JSX or null if not exactly 2 heroes selected
   */
  const renderComparison = () => {
    if (selectedHeroes.length !== 2) return null;
    
    const [hero1, hero2] = selectedHeroes;
    const result = calculateWinner(hero1, hero2);
    // All stat categories to display in comparison
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
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this particular stat, or if it's a tie
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

  /**
   * Renders the main table view displaying all superheroes with selection checkboxes
   * and stats. Includes controls for comparing selected heroes.
   * 
   * @returns {JSX.Element} The table view JSX with hero data and selection controls
   */
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
