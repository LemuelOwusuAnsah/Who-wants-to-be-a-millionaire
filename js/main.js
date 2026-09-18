(function() {
  const Config = window.WondersQuiz.Config;
  const DOM = window.WondersQuiz.DOM;
  const Timer = window.WondersQuiz.Timer;
  const GameState = window.WondersQuiz.GameState;
  const Lifelines = window.WondersQuiz.Lifelines;
  const Scoring = window.WondersQuiz.Scoring;
  const Renderer = window.WondersQuiz.Renderer;
  const Feedback = window.WondersQuiz.Feedback;

  function handleOptionClick(index) {
    if (GameState.getState().answerSelected || !GameState.isGameActive()) return;

    Timer.stop();
    GameState.selectAnswer(index);

    const isCorrect = Scoring.evaluateAnswer(index);
    Renderer.highlightAnswer(index);
    Renderer.renderScore();

    if (isCorrect) {
      Feedback.success('Correct! Well done.');
    } else {
      Feedback.incorrectFeedback(GameState.getCurrentQuestion().correct);
    }

    Renderer.setNextButtonState(false);
  }

  function handleTimeOut() {
    if (GameState.getState().answerSelected || !GameState.isGameActive()) return;

    GameState.selectAnswer(-1);
    Renderer.disableAllOptions();
    Renderer.highlightAnswer(-1);
    Feedback.timeoutFeedback(GameState.getCurrentQuestion().correct);
    Renderer.setNextButtonState(false);
  }

  function handleNext() {
    if (!GameState.getState().answerSelected) return;

    if (!GameState.isLastQuestionInLevel()) {
      GameState.advanceToNextQuestion();
      loadQuestion();
    } else if (!GameState.isLastLevel()) {
      GameState.advanceToNextLevel();
      Renderer.resetLifelines();
      Renderer.renderLevelIndicator();
      Renderer.renderProgress();
      loadQuestion();
      Feedback.info('Welcome to ' + GameState.getCurrentLevelName() + '. Keep going!');
    } else {
      endGame();
    }
  }

  function loadQuestion() {
    if (!GameState.isGameActive()) return;

    GameState.resetAnswer();
    const refs = Renderer.getRefs();

    Renderer.renderQuestion();
    Renderer.renderOptions(handleOptionClick);
    Renderer.enableOptions();
    Renderer.renderProgress();
    Renderer.resetTimerDisplay();
    Renderer.setNextButtonState(true);

    Feedback.reset();
    Timer.start({
      onTick: Renderer.renderTimer,
      onWarning: Renderer.renderTimerWarning,
      onTimeout: handleTimeOut
    });
  }

  function endGame() {
    GameState.setGameActive(false);
    Timer.stop();
    Renderer.disableAllOptions();
    Renderer.clearOptions();
    Renderer.renderProgress();
    DOM.setWidth(Renderer.getRefs().progressBar, '100%');
    DOM.setText(Renderer.getRefs().questionText, '🏆 Quiz Completed!');
    Feedback.success('Amazing! You scored ' + Scoring.getScore() + ' out of ' + GameState.getTotalQuestions() + '. ' + Scoring.getFinalMessage());
    Renderer.setNextButtonState(false, 'Restart', 'fas fa-rotate-right');
    DOM.on(Renderer.getRefs().nextBtn, 'click', restartQuiz);
  }

  function showGameOver(title, message) {
    GameState.setGameActive(false);
    Timer.stop();
    Renderer.showGameOver(title, message, Scoring.getScore());
  }

  function restartQuiz() {
    GameState.reset();
    Renderer.hideGameOver();
    Renderer.resetLifelines();
    Renderer.renderLevelIndicator();
    Renderer.renderScore();
    Renderer.renderProgress();
    Renderer.setNextButtonState(true);
    DOM.on(Renderer.getRefs().nextBtn, 'click', handleNext);
    loadQuestion();
  }

  function handleFiftyFifty() {
    const result = Lifelines.useFiftyFifty();
    if (!result.success) return;

    Renderer.setLifelineState(Config.LIFELINES.FIFTY_FIFTY, true);
    Renderer.eliminateOptions(result.eliminated);
    Feedback.lifelineUsed('50:50');
  }

  function handleSkip() {
    const result = Lifelines.useSkip();
    if (!result.success) return;

    Timer.stop();
    Renderer.setLifelineState(Config.LIFELINES.SKIP, true);
    Renderer.disableAllOptions();
    Feedback.lifelineUsed('Skip');
    Renderer.setNextButtonState(false);
  }

  function bindEvents() {
    const refs = Renderer.getRefs();
    DOM.on(refs.nextBtn, 'click', handleNext);
    DOM.on(refs.lifeline5050Btn, 'click', handleFiftyFifty);
    DOM.on(refs.lifelineSkipBtn, 'click', handleSkip);
    DOM.on(refs.playAgainBtn, 'click', restartQuiz);
  }

  function init() {
    Renderer.cacheElements();
    bindEvents();
    Renderer.renderLevelIndicator();
    Renderer.renderScore();
    loadQuestion();
  }

  document.addEventListener('DOMContentLoaded', init);
})();