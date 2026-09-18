window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.Lifelines = (function() {
  const Config = window.WondersQuiz.Config;
  const GameState = window.WondersQuiz.GameState;
  const DOM = window.WondersQuiz.DOM;

  function useFiftyFifty() {
    const state = GameState.getState();
    if (state.lifeline5050Used || state.answerSelected || !state.gameActive) {
      return { success: false };
    }

    const question = GameState.getCurrentQuestion();
    const wrongIndices = [];
    question.options.forEach(function(_, i) {
      if (i !== question.correct) wrongIndices.push(i);
    });

    const toRemove = DOM.randomSort(wrongIndices).slice(0, 2);
    state.lifeline5050Used = true;

    return {
      success: true,
      eliminated: toRemove
    };
  }

  function useSkip() {
    const state = GameState.getState();
    if (state.lifelineSkipUsed || state.answerSelected || !state.gameActive) {
      return { success: false };
    }

    state.lifelineSkipUsed = true;
    state.answerSelected = true;

    return { success: true };
  }

  function canUseFiftyFifty() {
    const state = GameState.getState();
    return !state.lifeline5050Used && !state.answerSelected && state.gameActive;
  }

  function canUseSkip() {
    const state = GameState.getState();
    return !state.lifelineSkipUsed && !state.answerSelected && state.gameActive;
  }

  return {
    useFiftyFifty: useFiftyFifty,
    useSkip: useSkip,
    canUseFiftyFifty: canUseFiftyFifty,
    canUseSkip: canUseSkip
  };
})();