import { useEffect, useState } from 'react';
import './App.css';

const POWERSTAT_CATEGORIES = [
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'strength', label: 'Strength' },
  { key: 'speed', label: 'Speed' },
  { key: 'durability', label: 'Durability' },
  { key: 'power', label: 'Power' },
  { key: 'combat', label: 'Combat' },
];

function App() {
  const [superheroes, setSuperheroes] = useState([]);
  const [selectedHeroIds, setSelectedHeroIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    fetch('/api/superheroes')
      .then((response) => response.json())
      .then(setSuperheroes)
      .catch((error) => console.error('Error fetching superheroes:', error));
  }, []);

  const selectedHeroes = superheroes.filter((hero) => selectedHeroIds.includes(hero.id));
  const [firstHero, secondHero] = selectedHeroes;
  const comparisons = firstHero && secondHero
    ? POWERSTAT_CATEGORIES.map((category) => {
      const firstValue = firstHero.powerstats[category.key];
      const secondValue = secondHero.powerstats[category.key];
      const winnerId = firstValue === secondValue
        ? null
        : firstValue > secondValue ? firstHero.id : secondHero.id;

      return {
        ...category,
        firstValue,
        secondValue,
        winnerId,
      };
    })
    : [];
  const firstHeroWins = comparisons.filter((comparison) => comparison.winnerId === firstHero?.id).length;
  const secondHeroWins = comparisons.filter((comparison) => comparison.winnerId === secondHero?.id).length;
  const overallWinner = firstHeroWins === secondHeroWins
    ? null
    : firstHeroWins > secondHeroWins ? firstHero : secondHero;

  function toggleHeroSelection(heroId) {
    setSelectedHeroIds((currentIds) => {
      if (currentIds.includes(heroId)) {
        return currentIds.filter((id) => id !== heroId);
      }

      return currentIds.length === 2 ? currentIds : [...currentIds, heroId];
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superheroes</h1>
        {isComparing ? (
          <section className="comparison" aria-labelledby="comparison-heading">
            <h2 id="comparison-heading">Hero comparison</h2>
            <div className="comparison-heroes">
              <article className="comparison-hero">
                <img src={`/assets/${firstHero.image}`} alt={firstHero.name} />
                <h3>{firstHero.name}</h3>
                <p>{firstHeroWins} category wins</p>
              </article>
              <p className="versus" aria-label={`${firstHero.name} versus ${secondHero.name}`}>VS</p>
              <article className="comparison-hero">
                <img src={`/assets/${secondHero.image}`} alt={secondHero.name} />
                <h3>{secondHero.name}</h3>
                <p>{secondHeroWins} category wins</p>
              </article>
            </div>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <caption>Powerstats comparison</caption>
                <thead>
                  <tr>
                    <th scope="col">{firstHero.name}</th>
                    <th scope="col">Category</th>
                    <th scope="col">{secondHero.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison) => {
                    const isDraw = comparison.winnerId === null;
                    const firstHeroWon = comparison.winnerId === firstHero.id;
                    const secondHeroWon = comparison.winnerId === secondHero.id;

                    return (
                      <tr key={comparison.key}>
                        <td data-label={firstHero.name} className={firstHeroWon ? 'stat-winner' : ''}>
                          {comparison.firstValue}
                          {firstHeroWon && <span className="winner-indicator">Wins</span>}
                        </td>
                        <th scope="row" data-label="Category">
                          {comparison.label}
                          {isDraw && <span className="draw-indicator">Draw</span>}
                        </th>
                        <td data-label={secondHero.name} className={secondHeroWon ? 'stat-winner' : ''}>
                          {secondHeroWon && <span className="winner-indicator">Wins</span>}
                          {comparison.secondValue}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="comparison-result" role="status">
              {overallWinner ? `${overallWinner.name} wins!` : "It's a tie!"}
            </p>
            <button type="button" onClick={() => setIsComparing(false)}>
              Back to table
            </button>
          </section>
        ) : (
          <>
            <div className="selection-controls">
              <p className="selection-summary" aria-live="polite">
                Selected: {selectedHeroes.length > 0
                  ? selectedHeroes.map((hero) => hero.name).join(' vs ')
                  : 'Choose two heroes'}
              </p>
              <button
                type="button"
                disabled={selectedHeroIds.length !== 2}
                onClick={() => setIsComparing(true)}
              >
                Compare selected heroes
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Image</th>
                    <th scope="col">Select</th>
                    <th scope="col">Intelligence</th>
                    <th scope="col">Strength</th>
                    <th scope="col">Speed</th>
                    <th scope="col">Durability</th>
                    <th scope="col">Power</th>
                    <th scope="col">Combat</th>
                  </tr>
                </thead>
                <tbody>
                  {superheroes.map((hero) => {
                    const isSelected = selectedHeroIds.includes(hero.id);

                    return (
                      <tr key={hero.id} className={isSelected ? 'selected-hero' : ''}>
                        <td data-label="ID">{hero.id}</td>
                        <td data-label="Name">{hero.name}</td>
                        <td data-label="Image"><img src={`/assets/${hero.image}`} alt={hero.name} width="50" /></td>
                        <td className="select-cell" data-label="Select">
                          <input
                            type="checkbox"
                            aria-label={`Select ${hero.name}`}
                            checked={isSelected}
                            disabled={!isSelected && selectedHeroIds.length === 2}
                            onChange={() => toggleHeroSelection(hero.id)}
                          />
                        </td>
                        <td data-label="Intelligence">{hero.powerstats.intelligence}</td>
                        <td data-label="Strength">{hero.powerstats.strength}</td>
                        <td data-label="Speed">{hero.powerstats.speed}</td>
                        <td data-label="Durability">{hero.powerstats.durability}</td>
                        <td data-label="Power">{hero.powerstats.power}</td>
                        <td data-label="Combat">{hero.powerstats.combat}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
