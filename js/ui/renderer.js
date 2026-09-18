window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.Renderer = (function() {
  const Config = window.WondersQuiz.Config;
  const DOM = window.WondersQuiz.DOM;
  const GameState = window.WondersQuiz.GameState;

  let refs = {};

  function cacheElements() {
    refs = {
      questionText: DOM.$('#questionText'),
      optionsContainer: DOM.$('#optionsContainer'),
      nextBtn: DOM.$('#nextBtn'),
      scoreDisplay: DOM.$('#scoreDisplay'),
      feedbackMsg: DOM.$('#feedbackMsg'),
      levelIndicator: DOM.$('#levelIndicator'),
      progressBar: DOM.$('#progressBar'),
      timerDisplay: DOM.$('#timerDisplay'),
      timerValue: DOM.$('#timerValue'),
      lifeline5050Btn: DOM.$('#lifeline5050'),
      lifelineSkipBtn: DOM.$('#lifelineSkip'),
      gameOverOverlay: DOM.$('#gameOverOverlay'),
      gameOverTitle: DOM.$('#gameOverTitle'),
      gameOverMessage: DOM.$('#gameOverMessage'),
      gameOverScore: DOM.$('#gameOverScore'),
      playAgainBtn: DOM.$('#playAgainBtn')
    };
  }

  function getRefs() {
    return refs;
  }

  function renderLevelIndicator() {
    DOM.setHTML(refs.levelIndicator, '<i class="fas fa-star"></i> ' + GameState.getCurrentLevelName());
  }

  function renderQuestion() {
    const question = GameState.getCurrentQuestion();
    DOM.setText(refs.questionText, question.question);
  }

  function renderOptions(onOptionClick) {
    const question = GameState.getCurrentQuestion();
    DOM.clearElement(refs.optionsContainer);

    question.options.forEach(function(opt, idx) {
      const btn = DOM.createElement('button', 'option-btn');
      btn.setAttribute('data-index', idx);
      btn.innerHTML = '<span class="option-letter">' + Config.LETTERS[idx] + '</span> <span>' + opt + '</span>';
      DOM.on(btn, 'click', function() {
        onOptionClick(idx);
      });
      refs.optionsContainer.appendChild(btn);
    });
  }

  function enableOptions() {
    DOM.$$('.option-btn').forEach(function(btn) {
      btn.disabled = false;
      DOM.removeClass(btn, 'correct');
      DOM.removeClass(btn, 'wrong');
      DOM.removeClass(btn, 'selected');
      DOM.removeClass(btn, 'eliminated');
      btn.style.opacity = '';
      btn.style.textDecoration = '';
    });
  }

  function highlightAnswer(selectedIndex) {
    const question = GameState.getCurrentQuestion();
    const isCorrect = selectedIndex === question.correct;
    const buttons = DOM.$$('.option-btn');

    buttons.forEach(function(btn, i) {
      btn.disabled = true;
      if (i === selectedIndex) DOM.addClass(btn, 'selected');
      if (i === question.correct) {
        DOM.addClass(btn, 'correct');
      } else if (i === selectedIndex && !isCorrect) {
        DOM.addClass(btn, 'wrong');
      }
    });

    return isCorrect;
  }

  function eliminateOptions(indices) {
    const buttons = DOM.$$('.option-btn');
    indices.forEach(function(i) {
      if (buttons[i]) {
        buttons[i].disabled = true;
        DOM.addClass(buttons[i], 'eliminated');
      }
    });
  }

  function disableAllOptions() {
    DOM.$$('.option-btn').forEach(function(btn) {
      btn.disabled = true;
    });
  }

  function renderScore() {
    DOM.setText(refs.scoreDisplay, GameState.getState().score);
  }

  function renderProgress() {
    DOM.setWidth(refs.progressBar, GameState.getProgressPercent() + '%');
  }

  function renderTimer(value) {
    DOM.setText(refs.timerValue, value);
  }

  function renderTimerWarning() {
    DOM.addClass(refs.timerDisplay, 'warning');
  }

  function resetTimerDisplay() {
    DOM.removeClass(refs.timerDisplay, 'warning');
  }

  function setNextButtonState(disabled, label, icon) {
    DOM.setDisabled(refs.nextBtn, disabled);
    if (label && icon) {
      DOM.setHTML(refs.nextBtn, label + ' <i class="' + icon + '"></i>');
    }
  }

  function setLifelineState(type, disabled) {
    const btn = type === Config.LIFELINES.FIFTY_FIFTY ? refs.lifeline5050Btn : refs.lifelineSkipBtn;
    DOM.setDisabled(btn, disabled);
  }

  function resetLifelines() {
    DOM.setDisabled(refs.lifeline5050Btn, false);
    DOM.setDisabled(refs.lifelineSkipBtn, false);
  }

  function showGameOver(title, message, score) {
    DOM.setText(refs.gameOverTitle, title);
    DOM.setText(refs.gameOverMessage, message);
    DOM.setText(refs.gameOverScore, score);
    DOM.addClass(refs.gameOverOverlay, 'active');
  }

  function hideGameOver() {
    DOM.removeClass(refs.gameOverOverlay, 'active');
  }

  function clearOptions() {
    DOM.clearElement(refs.optionsContainer);
  }

  return {
    cacheElements: cacheElements,
    getRefs: getRefs,
    renderLevelIndicator: renderLevelIndicator,
    renderQuestion: renderQuestion,
    renderOptions: renderOptions,
    enableOptions: enableOptions,
    highlightAnswer: highlightAnswer,
    eliminateOptions: eliminateOptions,
    disableAllOptions: disableAllOptions,
    renderScore: renderScore,
    renderProgress: renderProgress,
    renderTimer: renderTimer,
    renderTimerWarning: renderTimerWarning,
    resetTimerDisplay: resetTimerDisplay,
    setNextButtonState: setNextButtonState,
    setLifelineState: setLifelineState,
    resetLifelines: resetLifelines,
    showGameOver: showGameOver,
    hideGameOver: hideGameOver,
    clearOptions: clearOptions
  };
})();