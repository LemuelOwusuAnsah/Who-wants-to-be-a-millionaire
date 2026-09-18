window.WondersQuiz = window.WondersQuiz || {};

window.WondersQuiz.DOM = (function() {
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function createElement(tag, className, innerHTML) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  }

  function clearElement(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function addClass(el, className) {
    if (el) el.classList.add(className);
  }

  function removeClass(el, className) {
    if (el) el.classList.remove(className);
  }

  function toggleClass(el, className, force) {
    if (el) el.classList.toggle(className, force);
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setHTML(el, html) {
    if (el) el.innerHTML = html;
  }

  function setDisabled(el, disabled) {
    if (el) el.disabled = disabled;
  }

  function setWidth(el, width) {
    if (el) el.style.width = width;
  }

  function on(el, event, handler) {
    if (el) el.addEventListener(event, handler);
  }

  function randomSort(array) {
    return array.slice().sort(function() {
      return Math.random() - 0.5;
    });
  }

  return {
    $: $,
    $$: $$,
    createElement: createElement,
    clearElement: clearElement,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    setText: setText,
    setHTML: setHTML,
    setDisabled: setDisabled,
    setWidth: setWidth,
    on: on,
    randomSort: randomSort
  };
})();