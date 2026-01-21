/**
 * Superhero Comparison Application
 * 
 * This application allows users to view a list of superheroes, select two heroes,
 * and compare their stats (intelligence, strength, speed, durability, power, combat)
 * to determine a winner. The app provides two main views:
 * - Table view: Displays all superheroes with their stats and allows selection
 * - Comparison view: Shows a head-to-head comparison of two selected heroes
 * 
 * @module App
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main App component that manages the superhero comparison application.
 * 
 * This component handles:
 * - Fetching superhero data from the API
 * - Managing hero selection (up to 2 heroes)
 * - Switching between table and comparison views
 * - Calculating and displaying comparison results
 * 
 * @component
 * @returns {JSX.Element} The rendered application
 */
function App() {
  // State for storing the list of all superheroes fetched from API
  const [superheroes, setSuperheroes] = useState([]);
  // State for tracking up to 2 selected heroes for comparison
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  // State for managing current view: 'table' for hero list, 'comparison' for hero comparison
  const [currentView, setCurrentView] = useState('table');

  // Fetch superhero data from the API when component mounts
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles hero selection/deselection with a maximum of 2 heroes.
   * 
   * Behavior:
   * - If hero is already selected, it will be removed from selection
   * - If less than 2 heroes are selected, the new hero will be added
   * - If 2 heroes are already selected, the first hero will be replaced with the new one
   * 
   * @param {Object} hero - The superhero object to select/deselect
   * @param {number} hero.id - The unique identifier of the hero
   */
  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove hero if already selected
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add hero if less than 2 are selected
        return [...prev, hero];
      } else {
        // Replace the first hero if 2 are already selected (FIFO behavior)
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a hero is currently selected.
   * 
   * @param {number} heroId - The unique identifier of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches to the comparison view if exactly 2 heroes are selected.
   * This function is called when the user clicks the "Compare Heroes" button.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears the selected heroes.
   * This function is called when the user clicks the "Back to Heroes Table" button.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates the winner between two heroes based on their power stats.
   * 
   * Compares six stats (intelligence, strength, speed, durability, power, combat) and
   * awards a point to the hero with the higher value in each category. The hero with
   * more points wins.
   * 
   * @param {Object} hero1 - The first hero to compare
   * @param {Object} hero1.powerstats - The power statistics object
   * @param {number} hero1.powerstats.intelligence - Intelligence stat
   * @param {number} hero1.powerstats.strength - Strength stat
   * @param {number} hero1.powerstats.speed - Speed stat
   * @param {number} hero1.powerstats.durability - Durability stat
   * @param {number} hero1.powerstats.power - Power stat
   * @param {number} hero1.powerstats.combat - Combat stat
   * @param {Object} hero2 - The second hero to compare
   * @param {Object} hero2.powerstats - The power statistics object (same structure as hero1)
   * @returns {Object} The comparison result
   * @returns {Object|null} returns.winner - The winning hero object, or null if it's a tie
   * @returns {string} returns.score - The final score in format "X-Y" where X is winner's score
   */
  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat and award points to the hero with higher value
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
      // No points awarded if stats are equal
    });

    // Determine the winner based on total points
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      // It's a tie if scores are equal
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view showing two heroes side-by-side with their stats.
   * 
   * Displays:
   * - Hero cards with images and names
   * - Detailed stat-by-stat comparison
   * - Winner announcement or tie message
   * - Back button to return to the table view
   * 
   * @returns {JSX.Element|null} The comparison view JSX, or null if not exactly 2 heroes are selected
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
        
        {/* Hero cards section with images */}
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

        {/* Stat-by-stat comparison table */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this stat (or if it's a tie)
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

        {/* Final result section */}
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
   * Renders the table view showing all superheroes with their stats.
   * 
   * Displays:
   * - Selection status and count
   * - List of currently selected heroes
   * - Compare button (enabled when exactly 2 heroes are selected)
   * - Table with all heroes and their stats
   * - Checkboxes for hero selection
   * 
   * @returns {JSX.Element} The table view JSX
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
