window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.Timer = (function() {
  const Config = window.WondersQuiz.Config;
  let intervalId = null;
  let timeLeft = Config.TIMER_DURATION;
  let onTickCallback = null;
  let onTimeoutCallback = null;
  let onWarningCallback = null;
  let warningFired = false;

  function start(options) {
    stop();
    timeLeft = Config.TIMER_DURATION;
    warningFired = false;
    onTickCallback = options.onTick || null;
    onTimeoutCallback = options.onTimeout || null;
    onWarningCallback = options.onWarning || null;

    if (onTickCallback) onTickCallback(timeLeft);

    intervalId = setInterval(function() {
      timeLeft -= 1;
      if (onTickCallback) onTickCallback(timeLeft);

      if (timeLeft <= Config.TIMER_WARNING_THRESHOLD && !warningFired) {
        warningFired = true;
        if (onWarningCallback) onWarningCallback();
      }

      if (timeLeft <= 0) {
        stop();
        if (onTimeoutCallback) onTimeoutCallback();
      }
    }, 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function getTimeLeft() {
    return timeLeft;
  }

  return {
    start: start,
    stop: stop,
    getTimeLeft: getTimeLeft
  };
})();