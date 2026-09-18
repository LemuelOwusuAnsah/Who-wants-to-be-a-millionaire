window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.Scoring = (function() {
  const GameState = window.WondersQuiz.GameState;

  function evaluateAnswer(index) {
    const isCorrect = GameState.isCorrectAnswer(index);
    if (isCorrect) {
      GameState.incrementScore();
    }
    return isCorrect;
  }

  function getScore() {
    return GameState.getState().score;
  }

  function getFinalMessage() {
    const total = GameState.getTotalQuestions();
    const score = getScore();
    const percentage = (score / total) * 100;

    if (percentage >= 90) return 'Legendary! You are a true wonder-expert!';
    if (percentage >= 70) return 'Excellent! You really know your wonders.';
    if (percentage >= 50) return 'Good job! A solid performance.';
    return 'Keep exploring — there are many wonders to discover!';
  }

  return {
    evaluateAnswer: evaluateAnswer,
    getScore: getScore,
    getFinalMessage: getFinalMessage
  };
})();