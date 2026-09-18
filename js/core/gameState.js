window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.GameState = (function() {
  const Config = window.WondersQuiz.Config;
  const Questions = window.WondersQuiz.Questions;

  const state = {
    currentLevel: 0,
    currentQuestionIndex: 0,
    score: 0,
    answerSelected: false,
    selectedOptionIndex: -1,
    correctAnswerIndex: -1,
    lifeline5050Used: false,
    lifelineSkipUsed: false,
    gameActive: true
  };

  function getState() {
    return state;
  }

  function getCurrentLevel() {
    return Questions[state.currentLevel];
  }

  function getCurrentQuestion() {
    const level = getCurrentLevel();
    return level.questions[state.currentQuestionIndex];
  }

  function getCurrentLevelName() {
    return getCurrentLevel().name;
  }

  function getTotalQuestions() {
    return Questions.reduce(function(acc, lvl) {
      return acc + lvl.questions.length;
    }, 0);
  }

  function getProgressPercent() {
    return (state.currentQuestionIndex / Config.QUESTIONS_PER_LEVEL) * 100;
  }

  function selectAnswer(index) {
    if (state.answerSelected) return false;
    state.answerSelected = true;
    state.selectedOptionIndex = index;
    return true;
  }

  function isCorrectAnswer(index) {
    return index === getCurrentQuestion().correct;
  }

  function incrementScore() {
    state.score += 1;
  }

  function resetAnswer() {
    state.answerSelected = false;
    state.selectedOptionIndex = -1;
    state.correctAnswerIndex = getCurrentQuestion().correct;
  }

  function isLastQuestionInLevel() {
    const level = getCurrentLevel();
    return state.currentQuestionIndex === level.questions.length - 1;
  }

  function isLastLevel() {
    return state.currentLevel === Questions.length - 1;
  }

  function advanceToNextQuestion() {
    state.currentQuestionIndex += 1;
  }

  function advanceToNextLevel() {
    state.currentLevel += 1;
    state.currentQuestionIndex = 0;
    state.lifeline5050Used = false;
    state.lifelineSkipUsed = false;
  }

  function setGameActive(active) {
    state.gameActive = active;
  }

  function isGameActive() {
    return state.gameActive;
  }

  function reset() {
    state.currentLevel = 0;
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answerSelected = false;
    state.selectedOptionIndex = -1;
    state.correctAnswerIndex = -1;
    state.lifeline5050Used = false;
    state.lifelineSkipUsed = false;
    state.gameActive = true;
  }

  return {
    getState: getState,
    getCurrentLevel: getCurrentLevel,
    getCurrentQuestion: getCurrentQuestion,
    getCurrentLevelName: getCurrentLevelName,
    getTotalQuestions: getTotalQuestions,
    getProgressPercent: getProgressPercent,
    selectAnswer: selectAnswer,
    isCorrectAnswer: isCorrectAnswer,
    incrementScore: incrementScore,
    resetAnswer: resetAnswer,
    isLastQuestionInLevel: isLastQuestionInLevel,
    isLastLevel: isLastLevel,
    advanceToNextQuestion: advanceToNextQuestion,
    advanceToNextLevel: advanceToNextLevel,
    setGameActive: setGameActive,
    isGameActive: isGameActive,
    reset: reset
  };
})();