window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.Feedback = (function() {
  const Config = window.WondersQuiz.Config;
  const DOM = window.WondersQuiz.DOM;

  function show(message, type) {
    const refs = window.WondersQuiz.Renderer.getRefs();
    const el = refs.feedbackMsg;
    if (!el) return;

    DOM.removeClass(el, Config.FEEDBACK_TYPES.SUCCESS);
    DOM.removeClass(el, Config.FEEDBACK_TYPES.ERROR);
    DOM.removeClass(el, Config.FEEDBACK_TYPES.INFO);

    if (type) DOM.addClass(el, type);
    DOM.setHTML(el, message);
  }

  function success(message) {
    show('<i class="fas fa-check-circle" style="color:#35c96b;"></i> ' + message, Config.FEEDBACK_TYPES.SUCCESS);
  }

  function error(message) {
    show('<i class="fas fa-times-circle" style="color:#ff6b6b;"></i> ' + message, Config.FEEDBACK_TYPES.ERROR);
  }

  function info(message) {
    show(message, Config.FEEDBACK_TYPES.INFO);
  }

  function reset() {
    show('Select an answer to begin', Config.FEEDBACK_TYPES.INFO);
  }

  function correctAnswer(index) {
    return String.fromCharCode(65 + index);
  }

  function incorrectFeedback(correctIndex) {
    error('Incorrect. The correct answer was ' + correctAnswer(correctIndex) + '.');
  }

  function timeoutFeedback(correctIndex) {
    show('<i class="fas fa-hourglass-end" style="color:#ff6b6b;"></i> Time\'s up! The correct answer was ' + correctAnswer(correctIndex) + '.', Config.FEEDBACK_TYPES.ERROR);
  }

  function lifelineUsed(name) {
    info('<i class="fas fa-bolt" style="color:#f5b342;"></i> ' + name + ' used!');
  }

  return {
    show: show,
    success: success,
    error: error,
    info: info,
    reset: reset,
    correctAnswer: correctAnswer,
    incorrectFeedback: incorrectFeedback,
    timeoutFeedback: timeoutFeedback,
    lifelineUsed: lifelineUsed
  };
})();