import { useEffect, useState } from 'react';
import './App.css';

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
  const scores = selectedHeroes.map((hero) => ({
    hero,
    total: Object.values(hero.powerstats).reduce((sum, stat) => sum + stat, 0),
  }));
  const isTie = scores.length === 2 && scores[0].total === scores[1].total;
  const winner = isTie ? null : scores.reduce((leadingScore, score) => (
    score.total > leadingScore.total ? score : leadingScore
  ), scores[0]);

  function toggleHeroSelection(heroId) {
    setSelectedHeroIds((currentIds) => (
      currentIds.includes(heroId)
        ? currentIds.filter((id) => id !== heroId)
        : [...currentIds, heroId]
    ));
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Superheroes</h1>
        {isComparing ? (
          <section aria-labelledby="comparison-heading">
            <h2 id="comparison-heading">Hero comparison</h2>
            <p>{selectedHeroes.map((hero) => hero.name).join(' vs ')}</p>
            <p role="status">
              {isTie ? 'Tie!' : `${winner.hero.name} wins!`}
            </p>
            <button type="button" onClick={() => setIsComparing(false)}>
              Back to table
            </button>
          </section>
        ) : (
          <>
            <button
              type="button"
              disabled={selectedHeroIds.length !== 2}
              onClick={() => setIsComparing(true)}
            >
              Compare selected heroes
            </button>
            <table>
              <thead>
                <tr>
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
                    className={selectedHeroIds.includes(hero.id) ? 'selected-hero' : ''}
                    onClick={() => toggleHeroSelection(hero.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleHeroSelection(hero.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td>{hero.id}</td>
                    <td>{hero.name}</td>
                    <td><img src={`/assets/${hero.image}`} alt={hero.name} width="50" /></td>
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
          </>
        )}
      </header>
    </div>
  );
}

export default App;
