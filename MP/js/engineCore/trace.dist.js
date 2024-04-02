/**
* ===========================================================================
* 
* Mercer web tool transpiled module output file.
* Copyright (C) 2022 Mercer LLC, All Rights Reserved.
* 
* ===========================================================================
* 
**/
"use strict";

define(["utility"], utility => {
  "use strict";

  let trace = {};

  let _on = false;
  let _traceOutputTextArea = null;
  let _traceOutputTextAreaLogging = false;
  let _consoleLogging = false;
  let isNullOrUndefined = utility.isNullOrUndefined,
    strFmt = utility.stringFormat;
  let _writeLineImpl = function writeLineImpl(highlightColor, format) {
    if (_traceOutputTextAreaLogging || _consoleLogging) {
      let args = Array.prototype.slice.call(arguments, 1);
      let toWrite = strFmt.apply(null, args);
      if (_traceOutputTextAreaLogging) {
        _traceOutputTextArea.value += "".concat(toWrite, "\n");
        _traceOutputTextArea.scrollTop = _traceOutputTextArea.value.length;
      }
      if (_consoleLogging) {
        if (!highlightColor || highlightColor === "info" || highlightColor === "warn" || highlightColor === "error") {
          console[highlightColor || "log"](toWrite);
        } else {
          console.log("%c".concat(toWrite), "color: ".concat(highlightColor, ";"));
        }
      }
    }
  };
  let _categoryWriteLineImpl = function categoryWriteLineImpl(category, format) {
    var _trace$categoriesHigh;
    let categoryPart = category.length ? "[".concat(category, "] ") : "";
    let formatPart = isNullOrUndefined(format) ? "" : typeof format === "string" ? format : "[format not a string]";
    let newFormat = categoryPart + formatPart;
    let highlightColor = (_trace$categoriesHigh = trace.categoriesHighlightColor[category]) !== null && _trace$categoriesHigh !== void 0 ? _trace$categoriesHigh : trace.categoriesHighlightColor["*"];
    let args = [highlightColor, newFormat].concat(Array.prototype.slice.call(arguments, 2));
    _writeLineImpl.apply(null, args);
  };
  let _categoryActive = function categoryActive(category) {
    let result = true;
    if (!isNullOrUndefined(trace.categoriesFilter)) {
      let specificallyActive = false,
        wildcardActive = false;
      if (category in trace.categoriesFilter) {
        specificallyActive = trace.categoriesFilter[category];
      } else {
        wildcardActive = trace.categoriesFilter["*"];
      }
      result = specificallyActive || wildcardActive;
    }
    return result;
  };

  trace.categoriesFilter = {
    "*": true
  };

  trace.categoriesHighlightColor = {
    "*": "#333333"
  };

  trace.enableTextAreaLogging = function enableTextAreaLogging(traceOutputTextAreaId) {
    _traceOutputTextArea = null;
    if (typeof document !== "undefined" && document.getElementById) {
      _traceOutputTextArea = document.getElementById(traceOutputTextAreaId);
      if (_traceOutputTextArea !== null) {
        _traceOutputTextAreaLogging = true;
      } else {
        _traceOutputTextAreaLogging = false;
        if (typeof console.log === "function") {
          console.log("Warning: trace.enableTextAreaLogging couldn't find an element with id ".concat(traceOutputTextAreaId));
        }
      }
    }
    _on = _traceOutputTextAreaLogging || _consoleLogging;
    return _traceOutputTextAreaLogging;
  };

  trace.disableTextAreaLogging = function disableTextAreaLogging() {
    _traceOutputTextArea = null;
    _traceOutputTextAreaLogging = false;
    _on = _consoleLogging;
  };

  trace.enableConsoleLogging = function enableConsoleLogging() {
    _consoleLogging = window.console && console && console.log && typeof console.log === "function";
    _on = _traceOutputTextAreaLogging || _consoleLogging;
    return _consoleLogging;
  };

  trace.disableConsoleLogging = function disableConsoleLogging() {
    _consoleLogging = false;
    _on = _traceOutputTextAreaLogging;
  };

  trace.isOn = function isOn() {
    return _on;
  };

  trace.on = function on() {
    _on = true;
  };

  trace.off = function off() {
    _on = false;
  };

  trace.clear = function clear() {
    if (!_on) {
      return;
    }
    if (_traceOutputTextAreaLogging) {
      _traceOutputTextArea.value = "";
    }
    if (_consoleLogging && typeof console.clear === "function") {
      console.clear();
    }
  };

  trace.categoryWriteLine = function categoryWriteLine(category, format) {
    var _category;
    if (!_on) {
      return;
    }
    category = (_category = category) !== null && _category !== void 0 ? _category : "";
    if (!_categoryActive(category)) {
      return;
    }
    let args = [category, format].concat(Array.prototype.slice.call(arguments, 2));
    _categoryWriteLineImpl.apply(null, args);
  };

  trace.writeLine = function writeLine(format) {
    if (!_on || !_categoryActive("")) {
      return;
    }
    _categoryWriteLineImpl.apply(null, [""].concat(Array.prototype.slice.call(arguments)));
  };

  trace.categoryWriteLineMaker = function categoryWriteLineMaker(category) {
    return function categoryWriteLineForCategory() {
      if (!_on || !_categoryActive(category)) {
        return;
      }
      let args = [category].concat(Array.prototype.slice.call(arguments));
      _categoryWriteLineImpl.apply(null, args);
    };
  };
  return trace;
});
