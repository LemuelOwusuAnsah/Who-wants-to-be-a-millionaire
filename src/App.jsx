import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, Globe2, Heart, HelpCircle, LockKeyhole, Pause, Play, RotateCcw, SkipForward, Sparkles, Trophy, UserRound, X, Zap } from 'lucide-react'
import { levels } from './data/questions'
import { clearSession, getLeaderboard, getProfiles, getSession, recordLeaderboard, saveProfile, saveSession } from './utils/storage'

const letters = ['A', 'B', 'C', 'D']
const totalQuestions = levels.reduce((total, level) => total + level.questions.length, 0)
const prizes = ['500', '1,000', '2,000', '5,000', '10,000', '25,000', '50,000', '100,000', '250,000', '1,000,000']
const maxHearts = 5

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [view, setView] = useState('lobby')
  const [profiles, setProfiles] = useState(() => getProfiles())
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard())
  const [playerName, setPlayerName] = useState('')
  const [player, setPlayer] = useState(null)
  const [levelIndex, setLevelIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(maxHearts)
  const [selected, setSelected] = useState(null)
  const [eliminated, setEliminated] = useState([])
  const [usedFifty, setUsedFifty] = useState(false)
  const [usedSkip, setUsedSkip] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [error, setError] = useState('')

  const level = levels[levelIndex]
  const question = level.questions[questionIndex]
  const overallQuestion = levelIndex * 10 + questionIndex
  const progress = ((overallQuestion + (selected !== null ? 1 : 0)) / totalQuestions) * 100
  const resultPercent = Math.round((score / totalQuestions) * 100)
  const savedRun = player ? getSession(player.name) : null

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 2400)
    return () => window.clearTimeout(splashTimer)
  }, [])

  useEffect(() => {
    if (showSplash || view !== 'game' || paused || selected !== null || gameOver) return undefined
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          resolveAnswer(-1)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [showSplash, view, paused, selected, gameOver])

  useEffect(() => {
    if (showSplash || view !== 'game') return undefined
    function handleKey(event) {
      if (event.key.toLowerCase() === 'p') setPaused((current) => !current)
      if (event.key.toLowerCase() === 'f') useFiftyFifty()
      if (event.key.toLowerCase() === 's') skipQuestion()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const feedback = useMemo(() => {
    if (selected === null) return null
    if (selected === -1) return { tone: 'warning', text: 'Time is up. A heart was lost.' }
    return selected === question.correct
      ? { tone: 'success', text: 'Correct. Your knowledge is taking you places.' }
      : { tone: 'error', text: `Not quite. The answer was ${question.options[question.correct]}.` }
  }, [question, selected])

  function persistProgress(next = {}) {
    if (!player) return
    saveSession(player.name, {
      levelIndex: next.levelIndex ?? levelIndex,
      questionIndex: next.questionIndex ?? questionIndex,
      score: next.score ?? score,
      hearts: next.hearts ?? hearts,
      bestLevelIndex: Math.max(next.levelIndex ?? levelIndex, savedRun?.bestLevelIndex ?? 0),
      bestScore: Math.max(next.score ?? score, savedRun?.bestScore ?? 0),
      updatedAt: Date.now(),
    })
  }

  function startGame({ resume = false, fromLevel = 0 } = {}) {
    const name = playerName.trim() || player?.name
    if (!name) {
      setError('Enter a name to create your local player profile.')
      return
    }
    const profile = { name, lastPlayed: Date.now(), bestScore: player?.bestScore ?? 0, bestLevelIndex: player?.bestLevelIndex ?? 0 }
    const session = getSession(name)
    const startLevel = resume && session ? Math.max(session.bestLevelIndex ?? 0, fromLevel) : fromLevel
    setPlayer(profile)
    setProfiles(saveProfile(profile))
    setLevelIndex(startLevel)
    setQuestionIndex(resume && session?.levelIndex === startLevel ? session.questionIndex : 0)
    setScore(resume && session ? session.score : 0)
    setHearts(resume && session ? session.hearts : maxHearts)
    setSelected(null)
    setEliminated([])
    setUsedFifty(false)
    setUsedSkip(false)
    setTimeLeft(30)
    setPaused(false)
    setGameOver(false)
    setError('')
    saveSession(name, {
      levelIndex: startLevel,
      questionIndex: resume && session?.levelIndex === startLevel ? session.questionIndex : 0,
      score: resume && session ? session.score : 0,
      hearts: resume && session ? session.hearts : maxHearts,
      bestLevelIndex: Math.max(startLevel, session?.bestLevelIndex ?? 0),
      bestScore: Math.max(resume && session ? session.score : 0, session?.bestScore ?? 0),
      updatedAt: Date.now(),
    })
    setView('game')
  }

  function resolveAnswer(index) {
    if (selected !== null || gameOver) return
    const correct = index === question.correct
    const nextHearts = correct ? hearts : hearts - 1
    const nextScore = correct ? score + 1 : score
    setSelected(index)
    setScore(nextScore)
    setHearts(nextHearts)
    persistProgress({ score: nextScore, hearts: nextHearts })
    if (!correct && nextHearts <= 0) {
      window.setTimeout(() => {
        setGameOver(true)
        setPaused(false)
      }, 650)
    }
  }

  function chooseAnswer(index) {
    if (selected !== null || eliminated.includes(index)) return
    resolveAnswer(index)
  }

  function nextQuestion() {
    if (gameOver) return
    if (questionIndex < level.questions.length - 1) {
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      persistProgress({ questionIndex: nextIndex })
    } else if (levelIndex < levels.length - 1) {
      const nextLevel = levelIndex + 1
      setLevelIndex(nextLevel)
      setQuestionIndex(0)
      setUsedFifty(false)
      setUsedSkip(false)
      persistProgress({ levelIndex: nextLevel, questionIndex: 0 })
    } else {
      finishGame()
      return
    }
    setSelected(null)
    setEliminated([])
    setTimeLeft(30)
  }

  function finishGame() {
    if (player) {
      const entry = { name: player.name, score, levelIndex: 2, completedAt: Date.now() }
      setLeaderboard(recordLeaderboard(entry))
      clearSession(player.name)
    }
    setView('results')
  }

  function useFiftyFifty() {
    if (usedFifty || selected !== null || paused) return
    const wrong = question.options.map((_, index) => index).filter((index) => index !== question.correct)
    setEliminated(wrong.slice(0, 2))
    setUsedFifty(true)
  }

  function skipQuestion() {
    if (usedSkip || selected !== null || paused) return
    setUsedSkip(true)
    nextQuestion()
  }

  function resetToLobby() {
    setView('lobby')
    setGameOver(false)
    setPaused(false)
    setSelected(null)
  }

  function resetGame() {
    if (player) clearSession(player.name)
    setPlayer(null)
    setPlayerName('')
    setScore(0)
    setHearts(maxHearts)
    setLevelIndex(0)
    setQuestionIndex(0)
    setView('lobby')
    setGameOver(false)
    setSelected(null)
  }

  if (showSplash) return <Splash onEnter={() => setShowSplash(false)} />
  if (view === 'lobby') return <Lobby profiles={profiles} leaderboard={leaderboard} playerName={playerName} setPlayerName={(value) => { setPlayerName(value); setError('') }} error={error} onStart={() => startGame()} onResume={() => startGame({ resume: true })} savedRun={playerName.trim() ? getSession(playerName.trim()) : null} />
  if (view === 'results') return <Results score={score} resultPercent={resultPercent} player={player} leaderboard={leaderboard} onAgain={() => startGame()} onLobby={resetToLobby} />

  return <GameView level={level} levelIndex={levelIndex} question={question} questionIndex={questionIndex} overallQuestion={overallQuestion} progress={progress} score={score} hearts={hearts} selected={selected} eliminated={eliminated} usedFifty={usedFifty} usedSkip={usedSkip} timeLeft={timeLeft} paused={paused} gameOver={gameOver} feedback={feedback} onAnswer={chooseAnswer} onNext={nextQuestion} onFifty={useFiftyFifty} onSkip={skipQuestion} onPause={() => setPaused((current) => !current)} onResumeBest={() => startGame({ resume: true })} onLobby={resetToLobby} onRestart={resetGame} />
}

function Splash({ onEnter }) {
  return <main className="splash-screen" aria-label="Lemsy Games loading"><div className="splash-atmosphere" /><div className="splash-content"><div className="splash-orbit" aria-hidden="true"><span className="splash-orbit-ring ring-one" /><span className="splash-orbit-ring ring-two" /><span className="splash-core"><Globe2 size={30} /></span></div><p className="splash-kicker">AN ORIGINAL EXPERIENCE</p><h1 className="splash-title">LEMSY <span>GAMES</span></h1><p className="splash-subtitle">Curiosity starts here</p><div className="splash-loader" aria-label="Loading game"><span /></div><button className="splash-skip" onClick={onEnter}>Enter game <ArrowRight size={14} /></button></div><p className="splash-footer">LEMSY GAMES <span>•</span> PRESENTS</p></main>
}

function Lobby({ profiles, leaderboard, playerName, setPlayerName, error, onStart, onResume, savedRun }) {
  const selectedProfile = profiles.find((profile) => profile.name.toLowerCase() === playerName.trim().toLowerCase())
  return <main className="lobby-shell"><section className="lobby-panel panel-glow"><div className="lobby-hero"><div className="brand-mark"><Globe2 size={22} /><span>WONDERS / MILLIONAIRE</span></div><p className="eyebrow">A LEMSY GAMES ORIGINAL</p><h1>How far will<br /><em>curiosity</em> take you?</h1><p className="lobby-copy">Three levels. Thirty wonders. Five hearts between you and the million.</p><div className="profile-entry"><label htmlFor="player-name">Local player profile</label><div className="name-input"><UserRound size={18} /><input id="player-name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onStart()} placeholder="Your name" maxLength={18} /><span>{playerName.length}/18</span></div>{error && <p className="form-error">{error}</p>}{selectedProfile && <p className="saved-note">Welcome back, {selectedProfile.name}. Your best: {selectedProfile.bestScore} points.</p>}<div className="lobby-actions"><button className="primary-button" onClick={onStart}><Play size={17} /> {savedRun ? 'New run' : 'Start game'} <ArrowRight size={17} /></button>{savedRun && <button className="secondary-button" onClick={onResume}><RotateCcw size={16} /> Continue level {savedRun.bestLevelIndex + 1}</button>}</div></div></div><Leaderboard entries={leaderboard} /></section><p className="fine-print">Your profile stays on this device <span>•</span> No account required</p></main>
}

function Leaderboard({ entries }) {
  return <aside className="leaderboard"><div className="side-heading"><span>LOCAL LEADERBOARD</span><Trophy size={16} /></div>{entries.length === 0 ? <div className="leaderboard-empty"><Trophy size={22} /><span>Be the first<br />wonder expert.</span></div> : entries.slice(0, 5).map((entry, index) => <div className="leader-row" key={entry.name}><span className={`rank rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span><strong>{entry.name}</strong><b>{entry.score}<small> pts</small></b></div>)}</aside>
}

function GameView({ level, levelIndex, question, questionIndex, overallQuestion, progress, score, hearts, selected, eliminated, usedFifty, usedSkip, timeLeft, paused, gameOver, feedback, onAnswer, onNext, onFifty, onSkip, onPause, onResumeBest, onLobby, onRestart }) {
  return <main className="app-shell"><section className="game-panel panel-glow"><header className="topbar"><div className="brand"><div className="brand-mark"><Globe2 size={22} /><span>WONDERS / MILLIONAIRE</span></div><p>THE WORLD IS YOUR QUESTION</p></div><div className="game-tools"><div className="hearts" aria-label={`${hearts} hearts remaining`}>{Array.from({ length: maxHearts }, (_, index) => <Heart key={index} size={17} fill={index < hearts ? 'currentColor' : 'none'} className={index < hearts ? 'heart-full' : 'heart-empty'} />)}</div><div className="level-pill"><span className="live-dot" /> LEVEL {levelIndex + 1} <strong>{level.name.toUpperCase()}</strong></div><button className="icon-button" onClick={onPause} aria-label={paused ? 'Resume game' : 'Pause game'}>{paused ? <Play size={17} /> : <Pause size={17} />}</button></div></header><div className="content-grid"><div className="main-column"><div className="question-meta"><span>QUESTION {String(overallQuestion + 1).padStart(2, '0')} / {totalQuestions}</span><span>{prizes[questionIndex]} POINTS</span></div><div className="progress-track"><div style={{ width: `${progress}%` }} /></div><section className="question-card"><div className="question-tag"><HelpCircle size={16} /> LEVEL {levelIndex + 1} / {level.questions.length} QUESTIONS</div><h1>{question.question}</h1></section><div className="answer-list">{question.options.map((option, index) => { const isCorrect = selected !== null && index === question.correct; const isWrong = selected === index && !isCorrect; return <button key={option} className={`answer ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${eliminated.includes(index) ? 'eliminated' : ''}`} onClick={() => onAnswer(index)} disabled={selected !== null || eliminated.includes(index)}><span className="answer-letter">{letters[index]}</span><span>{option}</span>{isCorrect && <Check className="answer-state" size={19} />}{isWrong && <X className="answer-state" size={19} />}</button> })}</div>{feedback && <div className={`feedback ${feedback.tone}`}>{feedback.tone === 'success' ? <Check size={17} /> : feedback.tone === 'error' ? <X size={17} /> : <Clock3 size={17} />}{feedback.text}</div>}<footer className="action-row"><div className="score"><span>YOUR SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button className="primary-button next-button" onClick={onNext} disabled={selected === null || gameOver}>{questionIndex === 9 && levelIndex === 2 ? 'See results' : 'Next question'} <ArrowRight size={18} /></button></footer></div><aside className="side-column"><div className={`timer ${timeLeft <= 10 ? 'urgent' : ''}`}><div className="timer-ring"><Clock3 size={22} /><strong>{String(timeLeft).padStart(2, '0')}</strong><span>SEC</span></div><div><span>TIME REMAINING</span><b>{timeLeft <= 10 ? 'Make your choice' : paused ? 'Game paused' : 'Think it through'}</b></div></div><div className="lifelines"><div className="side-heading"><span>LIFELINES</span><Zap size={16} /></div><button onClick={onFifty} disabled={usedFifty || selected !== null || paused}><span className="lifeline-icon">½</span><span><b>50 / 50</b><small>{usedFifty ? 'Already used' : 'Remove two answers'}</small></span><span className="shortcut">F</span></button><button onClick={onSkip} disabled={usedSkip || selected !== null || paused}><span className="lifeline-icon"><SkipForward size={17} /></span><span><b>Skip question</b><small>{usedSkip ? 'Already used' : 'Keep your streak alive'}</small></span><span className="shortcut">S</span></button></div><div className="prize-ladder"><div className="side-heading"><span>PRIZE LADDER</span><Trophy size={16} /></div>{[...prizes].reverse().map((prize, index) => <div className={`prize ${9 - index === questionIndex ? 'active' : ''} ${9 - index > questionIndex ? 'locked' : ''}`} key={prize}><span>{String(10 - index).padStart(2, '0')}</span><strong>{prize}</strong></div>)}</div></aside></div></section>{paused && <PauseModal onResume={onPause} onLobby={onLobby} />}{gameOver && <GameOverModal levelIndex={levelIndex} score={score} hearts={hearts} onResume={onResumeBest} onRestart={onRestart} />}</main>
}

function PauseModal({ onResume, onLobby }) { return <div className="modal-backdrop"><section className="modal-card"><div className="modal-icon"><Pause size={24} /></div><p className="eyebrow">GAME PAUSED</p><h2>Your progress is safe.</h2><p>The timer is stopped. Come back when you are ready to make your next choice.</p><button className="primary-button" onClick={onResume}><Play size={17} /> Resume game</button><button className="text-button" onClick={onLobby}>Save and return to lobby</button></section></div> }

function GameOverModal({ levelIndex, score, hearts, onResume, onRestart }) { return <div className="modal-backdrop"><section className="modal-card game-over-card"><div className="modal-icon danger"><Heart size={24} /></div><p className="eyebrow">ALL HEARTS SPENT</p><h2>That round is over.</h2><p>You reached level {levelIndex + 1} with {score} correct answers. Your best level is saved locally.</p><div className="modal-actions"><button className="primary-button" onClick={onResume}><RotateCcw size={17} /> Resume best level</button><button className="secondary-button" onClick={onRestart}>Restart from level one</button></div><small>{hearts} hearts remaining</small></section></div> }

function Results({ score, resultPercent, player, leaderboard, onAgain, onLobby }) { return <main className="app-shell"><section className="result-panel panel-glow"><div className="brand-mark"><Trophy size={22} /><span>WONDERS / MILLIONAIRE</span></div><div className="result-icon"><Sparkles size={34} /></div><p className="eyebrow">{player?.name}'S FINAL SCORE</p><h1>{score} <span>/ {totalQuestions}</span></h1><p className="result-message">{resultPercent >= 90 ? 'Legendary. You are a true wonder expert.' : resultPercent >= 70 ? 'Excellent. You really know your wonders.' : resultPercent >= 50 ? 'Good job. A solid performance.' : 'Keep exploring. There are many wonders to discover.'}</p><div className="result-actions"><button className="primary-button" onClick={onAgain}><RotateCcw size={18} /> Play again</button><button className="secondary-button" onClick={onLobby}><Trophy size={16} /> View leaderboard</button></div><div className="result-mini-board"><div className="side-heading"><span>TOP LOCAL SCORES</span><Trophy size={16} /></div>{leaderboard.slice(0, 3).map((entry, index) => <div className="leader-row" key={entry.name}><span className="rank">{String(index + 1).padStart(2, '0')}</span><strong>{entry.name}</strong><b>{entry.score}<small> pts</small></b></div>)}</div></section></main> }

export default App
