
import './App.css'
import ActiveLearningGame from './ActiveLearningGame'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/active-learning-game') {
    return <ActiveLearningGame />
  }

  return (
    <main>
      <h1>Jon Hutchins</h1>

      <h2>Senior Capstone Production Platform Page Test</h2>

      <p>
        This site will present my software projects, engineering decisions,
        and production systems.
      </p>

      <p>Initial frontend setup in progress.</p>

      <p>
        <a href="/active-learning-game">Active Learning Game</a>
      </p>
    </main>
  )
}

export default App
