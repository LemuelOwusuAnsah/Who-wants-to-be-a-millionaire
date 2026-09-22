import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, Globe2, HelpCircle, RotateCcw, SkipForward, Sparkles, Trophy, X, Zap } from 'lucide-react'
import { levels } from './data/questions'

const letters = ['A', 'B', 'C', 'D']
const totalQuestions = levels.reduce((total, level) => total + level.questions.length, 0)
const prizes = ['500', '1,000', '2,000', '5,000', '10,000', '25,000', '50,000', '100,000', '250,000', '1,000,000']

function App() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [eliminated, setEliminated] = useState([])
  const [usedFifty, setUsedFifty] = useState(false)
  const [usedSkip, setUsedSkip] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [finished, setFinished] = useState(false)

  const level = levels[levelIndex]
  const question = level.questions[questionIndex]
  const overallQuestion = levelIndex * 10 + questionIndex
  const progress = ((overallQuestion + (selected !== null ? 1 : 0)) / totalQuestions) * 100
  const resultPercent = Math.round((score / totalQuestions) * 100)

  useEffect(() => {
    if (selected !== null || finished) return undefined
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setSelected(-1)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [selected, finished, questionIndex, levelIndex])

  const feedback = useMemo(() => {
    if (selected === null) return null
    if (selected === -1) return { tone: 'warning', text: 'Time is up. The correct answer is highlighted.' }
    return selected === question.correct
      ? { tone: 'success', text: 'Correct. Your knowledge is taking you places.' }
      : { tone: 'error', text: `Not quite. The answer was ${question.options[question.correct]}.` }
  }, [question, selected])

  function chooseAnswer(index) {
    if (selected !== null || eliminated.includes(index)) return
    setSelected(index)
    if (index === question.correct) setScore((current) => current + 1)
  }

  function nextQuestion() {
    if (questionIndex < level.questions.length - 1) {
      setQuestionIndex((current) => current + 1)
    } else if (levelIndex < levels.length - 1) {
      setLevelIndex((current) => current + 1)
      setQuestionIndex(0)
      setUsedFifty(false)
      setUsedSkip(false)
    } else {
      setFinished(true)
    }
    setSelected(null)
    setEliminated([])
    setTimeLeft(30)
  }

  function useFiftyFifty() {
    if (usedFifty || selected !== null) return
    const wrong = question.options.map((_, index) => index).filter((index) => index !== question.correct)
    setEliminated(wrong.slice(0, 2))
    setUsedFifty(true)
  }

  function skipQuestion() {
    if (usedSkip || selected !== null) return
    setUsedSkip(true)
    nextQuestion()
  }

  function resetGame() {
    setLevelIndex(0); setQuestionIndex(0); setScore(0); setSelected(null); setEliminated([]); setUsedFifty(false); setUsedSkip(false); setTimeLeft(30); setFinished(false)
  }

  if (finished) {
    return <main className="app-shell"><section className="result-panel panel-glow"><div className="brand-mark"><Trophy size={22} /><span>WONDERS / MILLIONAIRE</span></div><div className="result-icon"><Sparkles size={34} /></div><p className="eyebrow">Final score</p><h1>{score} <span>/ {totalQuestions}</span></h1><p className="result-message">{resultPercent >= 90 ? 'Legendary. You are a true wonder expert.' : resultPercent >= 70 ? 'Excellent. You really know your wonders.' : resultPercent >= 50 ? 'Good job. A solid performance.' : 'Keep exploring. There are many wonders to discover.'}</p><button className="primary-button" onClick={resetGame}><RotateCcw size={18} /> Play again</button></section></main>
  }

  return (
    <main className="app-shell">
      <section className="game-panel panel-glow">
        <header className="topbar">
          <div className="brand"><div className="brand-mark"><Globe2 size={22} /><span>WONDERS / MILLIONAIRE</span></div><p>THE WORLD IS YOUR QUESTION</p></div>
          <div className="level-pill"><span className="live-dot" /> LEVEL {levelIndex + 1} <strong>{level.name.toUpperCase()}</strong></div>
        </header>
        <div className="content-grid">
          <div className="main-column">
            <div className="question-meta"><span>QUESTION {String(overallQuestion + 1).padStart(2, '0')} / {totalQuestions}</span><span>{prizes[questionIndex]} POINTS</span></div>
            <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
            <section className="question-card"><div className="question-tag"><HelpCircle size={16} /> IDENTIFY THE WONDER</div><h1>{question.question}</h1></section>
            <div className="answer-list">
              {question.options.map((option, index) => {
                const isCorrect = selected !== null && index === question.correct
                const isWrong = selected === index && !isCorrect
                return <button key={option} className={`answer ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${eliminated.includes(index) ? 'eliminated' : ''}`} onClick={() => chooseAnswer(index)} disabled={selected !== null || eliminated.includes(index)}><span className="answer-letter">{letters[index]}</span><span>{option}</span>{isCorrect && <Check className="answer-state" size={19} />}{isWrong && <X className="answer-state" size={19} />}</button>
              })}
            </div>
            {feedback && <div className={`feedback ${feedback.tone}`}>{feedback.tone === 'success' ? <Check size={17} /> : feedback.tone === 'error' ? <X size={17} /> : <Clock3 size={17} />}{feedback.text}</div>}
            <footer className="action-row"><div className="score"><span>YOUR SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button className="primary-button next-button" onClick={nextQuestion} disabled={selected === null}>{questionIndex === 9 && levelIndex === 2 ? 'See results' : 'Next question'} <ArrowRight size={18} /></button></footer>
          </div>
          <aside className="side-column"><div className={`timer ${timeLeft <= 10 ? 'urgent' : ''}`}><div className="timer-ring"><Clock3 size={22} /><strong>{String(timeLeft).padStart(2, '0')}</strong><span>SEC</span></div><div><span>TIME REMAINING</span><b>{timeLeft <= 10 ? 'Make your choice' : 'Think it through'}</b></div></div><div className="lifelines"><div className="side-heading"><span>LIFELINES</span><Zap size={16} /></div><button onClick={useFiftyFifty} disabled={usedFifty || selected !== null}><span className="lifeline-icon">½</span><span><b>50 / 50</b><small>{usedFifty ? 'Already used' : 'Remove two answers'}</small></span><span className="shortcut">F</span></button><button onClick={skipQuestion} disabled={usedSkip || selected !== null}><span className="lifeline-icon"><SkipForward size={17} /></span><span><b>Skip question</b><small>{usedSkip ? 'Already used' : 'Keep your streak alive'}</small></span><span className="shortcut">S</span></button></div><div className="prize-ladder"><div className="side-heading"><span>PRIZE LADDER</span><Trophy size={16} /></div>{[...prizes].reverse().map((prize, index) => <div className={`prize ${9 - index === questionIndex ? 'active' : ''}`} key={prize}><span>{String(10 - index).padStart(2, '0')}</span><strong>{prize}</strong></div>)}</div></aside>
        </div>
      </section>
      <p className="fine-print">A quiz for curious minds <span>•</span> Built around the world's unforgettable places</p>
    </main>
  )
}

export default App