/**
 * @fileoverview Superhero Comparison Application
 * 
 * This React application allows users to browse a table of superheroes and compare
 * two heroes side-by-side. Users can select up to 2 heroes from a table view and
 * then switch to a comparison view that shows detailed stats and determines a winner.
 * 
 * Features:
 * - Table view displaying all superheroes with their stats
 * - Selection mechanism allowing users to pick 2 heroes for comparison
 * - Comparison view showing heroes side-by-side with stat-by-stat breakdown
 * - Winner calculation based on who wins more stat categories
 * - Responsive design with smooth transitions between views
 * 
 * @author React Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main App component that manages the superhero comparison application.
 * 
 * This component handles the overall state management including:
 * - Loading superhero data from the API
 * - Managing hero selection state (up to 2 heroes)
 * - Switching between table and comparison views
 * - Coordinating the comparison logic and display
 * 
 * @component
 * @returns {JSX.Element} The main application component
 */
function App() {
  // State for storing the complete list of superheroes fetched from API
  const [superheroes, setSuperheroes] = useState([]);
  
  // State for tracking which heroes are currently selected for comparison (max 2)
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  
  // State for managing the current view mode: 'table' for hero selection or 'comparison' for hero comparison
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'

  /**
   * Effect hook to fetch superhero data from the API when component mounts.
   * Makes a GET request to /api/superheroes and updates the superheroes state.
   * Includes error handling for failed requests.
   */
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles the selection and deselection of heroes for comparison.
   * 
   * This function implements the selection logic:
   * - If hero is already selected, remove them from selection
   * - If less than 2 heroes selected, add the new hero
   * - If 2 heroes already selected, replace the first one with the new selection
   * 
   * @param {Object} hero - The superhero object to select/deselect
   * @param {string|number} hero.id - Unique identifier for the hero
   * @param {string} hero.name - Name of the superhero
   */
  const handleHeroSelection = (hero) => {
    setSelectedHeroes(prev => {
      if (prev.find(h => h.id === hero.id)) {
        // Remove if already selected - allows users to deselect heroes
        return prev.filter(h => h.id !== hero.id);
      } else if (prev.length < 2) {
        // Add if less than 2 selected - normal selection flow
        return [...prev, hero];
      } else {
        // Replace first selection if 2 already selected - maintains max of 2 heroes
        // This creates a "sliding window" effect where newest selection replaces oldest
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a hero is currently selected for comparison.
   * 
   * @param {string|number} heroId - The unique identifier of the hero to check
   * @returns {boolean} True if the hero is in the selectedHeroes array, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches the view to comparison mode when exactly 2 heroes are selected.
   * This function acts as a guard to ensure comparison only happens with valid selection.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears all hero selections.
   * This provides a clean slate for users to make new comparisons.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]); // Clear selections for fresh start
  };

  /**
   * Calculates the winner between two superheroes based on their power statistics.
   * 
   * The comparison uses a head-to-head scoring system across 6 stat categories:
   * intelligence, strength, speed, durability, power, and combat.
   * Each hero gets 1 point for each stat category they win.
   * 
   * @param {Object} hero1 - First superhero to compare
   * @param {Object} hero1.powerstats - Power statistics object for hero1
   * @param {Object} hero2 - Second superhero to compare  
   * @param {Object} hero2.powerstats - Power statistics object for hero2
   * @returns {Object} Result object containing winner and score
   * @returns {Object|null} result.winner - The winning hero object, or null for tie
   * @returns {string} result.score - Score string in format "X-Y"
   */
  const calculateWinner = (hero1, hero2) => {
    // Define all stat categories used for comparison
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat category and award points
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++; // Hero1 wins this stat category
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++; // Hero2 wins this stat category
      }
      // Ties in individual stats don't award points to either hero
    });

    // Determine overall winner based on total score
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      // Overall tie - no winner
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view showing two heroes side-by-side with detailed stats.
   * 
   * This function creates the complete comparison interface including:
   * - Hero cards with images and names
   * - Stat-by-stat comparison with visual indicators for winners
   * - Final result section showing overall winner or tie
   * - Back button to return to table view
   * 
   * @returns {JSX.Element|null} The comparison view JSX or null if less than 2 heroes selected
   */
  const renderComparison = () => {
    // Guard clause: only render if exactly 2 heroes are selected
    if (selectedHeroes.length !== 2) return null;
    
    // Destructure selected heroes for cleaner code
    const [hero1, hero2] = selectedHeroes;
    const result = calculateWinner(hero1, hero2);
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    return (
      <div className="comparison-view">
        <button className="back-button" onClick={handleBackToTable}>
          ← Back to Heroes Table
        </button>
        <h1>Superhero Comparison</h1>
        
        {/* Hero profile cards showing basic info */}
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

        {/* Detailed stat-by-stat comparison */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine winner for visual highlighting
            const winner = stat1 > stat2 ? 'hero1' : stat1 < stat2 ? 'hero2' : 'tie';
            
            return (
              <div key={stat} className="stat-row">
                <div className={`stat-value ${winner === 'hero1' ? 'winner' : ''}`}>
                  {stat1}
                </div>
                <div className="stat-name">
                  {/* Capitalize first letter of stat name for display */}
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
   * Renders the main table view showing all available superheroes.
   * 
   * This function creates the hero selection interface including:
   * - Selection status display showing current selections and count
   * - Compare button that's enabled only when exactly 2 heroes are selected
   * - Data table with all heroes showing stats and selection checkboxes
   * - Visual highlighting for selected rows
   * 
   * @returns {JSX.Element} The table view JSX with hero selection interface
   */
  const renderTable = () => (
    <div className="table-view">
      <h1>Superheroes</h1>
      
      {/* Selection status and controls */}
      <div className="selection-info">
        <p>Select 2 superheroes to compare ({selectedHeroes.length}/2 selected)</p>
        {selectedHeroes.length > 0 && (
          <div className="selected-heroes">
            Selected: {selectedHeroes.map(h => h.name).join(', ')}
          </div>
        )}
        {/* Compare button is only enabled when exactly 2 heroes are selected */}
        <button 
          className="compare-button" 
          onClick={handleCompare}
          disabled={selectedHeroes.length !== 2}
        >
          Compare Heroes
        </button>
      </div>
      
      {/* Main data table with all superhero information */}
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
                {/* Checkbox for hero selection - triggers handleHeroSelection on change */}
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

  // Main component render - conditionally displays either table or comparison view
  return (
    <div className="App">
      <header className="App-header">
        {/* Conditional rendering based on current view state */}
        {currentView === 'table' ? renderTable() : renderComparison()}
      </header>
    </div>
  );
}

export default App;
