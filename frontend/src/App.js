/**
 * @fileoverview Superhero Comparison Application
 * 
 * This React application provides a user interface for viewing, selecting, and comparing
 * superheroes based on their power statistics. Users can view a table of superheroes,
 * select up to two heroes, and compare their stats head-to-head to determine a winner.
 * 
 * The application has two main views:
 * - Table View: Displays all superheroes in a table with their statistics
 * - Comparison View: Shows a side-by-side comparison of two selected heroes
 * 
 * @author Copilot
 * @requires react
 * @requires ./App.css
 */

import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Main App component that manages the superhero comparison application.
 * 
 * This component handles the entire application state including fetching superhero data,
 * managing hero selections, switching between views, and rendering the appropriate UI.
 * 
 * @component
 * @returns {JSX.Element} The rendered App component
 */
function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroes, setSelectedHeroes] = useState([]);
  const [currentView, setCurrentView] = useState('table'); // 'table' or 'comparison'

  /**
   * Fetches the list of superheroes from the API on component mount.
   * Uses the useEffect hook to trigger the fetch operation once when the component is first rendered.
   */
  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then((data) => setSuperheroes(data))
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  /**
   * Handles the selection/deselection of a superhero.
   * 
   * This function manages the selection logic with the following rules:
   * - If a hero is already selected, clicking them will deselect them
   * - If fewer than 2 heroes are selected, the clicked hero is added to the selection
   * - If 2 heroes are already selected, the oldest selection is replaced with the new one
   * 
   * @param {Object} hero - The superhero object to select or deselect
   * @param {number} hero.id - The unique identifier of the superhero
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
        // Replace first selection if 2 already selected (FIFO replacement)
        return [prev[1], hero];
      }
    });
  };

  /**
   * Checks if a superhero is currently selected.
   * 
   * @param {number} heroId - The ID of the hero to check
   * @returns {boolean} True if the hero is selected, false otherwise
   */
  const isHeroSelected = (heroId) => {
    return selectedHeroes.some(h => h.id === heroId);
  };

  /**
   * Switches to the comparison view when exactly 2 heroes are selected.
   * 
   * This function is called when the user clicks the "Compare Heroes" button.
   * It only changes the view if exactly 2 heroes are currently selected.
   */
  const handleCompare = () => {
    if (selectedHeroes.length === 2) {
      setCurrentView('comparison');
    }
  };

  /**
   * Returns to the table view and clears the selected heroes.
   * 
   * This function is called when the user clicks the "Back to Heroes Table" button
   * from the comparison view. It resets both the view and the selection state.
   */
  const handleBackToTable = () => {
    setCurrentView('table');
    setSelectedHeroes([]);
  };

  /**
   * Calculates which hero wins in a head-to-head comparison.
   * 
   * Compares six power stats (intelligence, strength, speed, durability, power, combat)
   * between two heroes. Each stat comparison awards one point to the hero with the higher
   * value. The hero with the most points wins. If the points are equal, it's a tie.
   * 
   * @param {Object} hero1 - The first superhero object
   * @param {Object} hero1.powerstats - Object containing the hero's power statistics
   * @param {Object} hero2 - The second superhero object
   * @param {Object} hero2.powerstats - Object containing the hero's power statistics
   * @returns {Object} An object containing the winner and the score
   * @returns {Object|null} returns.winner - The winning hero object, or null if it's a tie
   * @returns {string} returns.score - The score in "X-Y" format
   */
  const calculateWinner = (hero1, hero2) => {
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    let hero1Score = 0;
    let hero2Score = 0;
    
    // Compare each stat and award points to the hero with the higher value
    stats.forEach(stat => {
      if (hero1.powerstats[stat] > hero2.powerstats[stat]) {
        hero1Score++;
      } else if (hero2.powerstats[stat] > hero1.powerstats[stat]) {
        hero2Score++;
      }
    });

    // Determine the winner based on total scores
    if (hero1Score > hero2Score) {
      return { winner: hero1, score: `${hero1Score}-${hero2Score}` };
    } else if (hero2Score > hero1Score) {
      return { winner: hero2, score: `${hero2Score}-${hero1Score}` };
    } else {
      // It's a tie - return null for winner
      return { winner: null, score: `${hero1Score}-${hero2Score}` };
    }
  };

  /**
   * Renders the comparison view displaying two heroes side-by-side.
   * 
   * This view shows:
   * - Hero images and names
   * - A detailed comparison of all six power stats
   * - Highlighting of winning stats for each hero
   * - The final winner announcement or tie declaration
   * 
   * @returns {JSX.Element|null} The comparison view component, or null if not exactly 2 heroes selected
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
        
        {/* Hero cards displaying images and names */}
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

        {/* Stats comparison table with highlighting for winners */}
        <div className="stats-comparison">
          {stats.map(stat => {
            const stat1 = hero1.powerstats[stat];
            const stat2 = hero2.powerstats[stat];
            // Determine which hero wins this stat comparison (or if it's a tie)
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

        {/* Final result section showing the overall winner or tie */}
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
   * 
   * This view includes:
   * - A selection counter showing how many heroes are selected
   * - Display of currently selected heroes
   * - A button to compare the selected heroes (enabled only when 2 are selected)
   * - A table showing all heroes with their stats and checkboxes for selection
   * 
   * @returns {JSX.Element} The table view component
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
