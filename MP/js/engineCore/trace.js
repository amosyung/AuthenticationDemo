//-------------------------------------------------------------------------------------------------
// trace.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Provides trace functionality for debugging.  Trace information can be displayed by creating an
// HTML text area with the appropriate id (see below).  If no such text area exists, trace is
// effectively disabled.
//

/* eslint-disable no-console */
/* eslint-disable prefer-rest-params, prefer-spread */
define(["utility"],
(utility) => {
"use strict";

let trace = {};

// Private variables and methods

let _on = false;
let _traceOutputTextArea = null;
let _traceOutputTextAreaLogging = false;
let _consoleLogging = false;

let isNullOrUndefined = utility.isNullOrUndefined, strFmt = utility.stringFormat;

let _writeLineImpl = function writeLineImpl(highlightColor, format) { // eslint-disable-line no-unused-vars
	if (_traceOutputTextAreaLogging || _consoleLogging) {
		let args = Array.prototype.slice.call(arguments, 1);
		let toWrite = strFmt.apply(null, args);
		if (_traceOutputTextAreaLogging) {
			_traceOutputTextArea.value += `${toWrite}\n`;
			_traceOutputTextArea.scrollTop = _traceOutputTextArea.value.length;
		}
		if (_consoleLogging) {
			if (!highlightColor || highlightColor === "info" ||
				highlightColor === "warn" || highlightColor === "error") {
				console[highlightColor || "log"](toWrite);
			} else {
				console.log(`%c${toWrite}`, `color: ${highlightColor};`);
			}
		}
	}
};

let _categoryWriteLineImpl = function categoryWriteLineImpl(category, format) { // & args...
	let categoryPart = category.length ? `[${category}] ` : "";
	let formatPart = isNullOrUndefined(format) ? "" : ((typeof format === "string") ? format : "[format not a string]");
	let newFormat = categoryPart + formatPart;
	let highlightColor = trace.categoriesHighlightColor[category] ?? trace.categoriesHighlightColor["*"];
	let args = [highlightColor, newFormat].concat(Array.prototype.slice.call(arguments, 2));
	_writeLineImpl.apply(null, args);
};

let _categoryActive = function categoryActive(category) {
	let result = true;
	if (!isNullOrUndefined(trace.categoriesFilter)) {
		let specificallyActive = false, wildcardActive = false;
		if (category in trace.categoriesFilter) {
			specificallyActive = trace.categoriesFilter[category];
		} else {
			wildcardActive = trace.categoriesFilter["*"];
		}
		result = specificallyActive || wildcardActive;
	} // else categoriesFilter not active and result remains true
	return result;
};

// Public properties and methods

/**
 * Maps category names to booleans where true means include the category's trace messages in
 * trace output, while false means exclude the category's trace messages from trace output.
 * "*" is a catch-all for non-mentioned category ids.
 *
 * @type object
 */
trace.categoriesFilter = { "*": true };

/**
 * Maps category names to HTML colour codes for use in console.log() output.
 * "*" is a catch-all for non-mentioned category ids.
 * @type object
 */
trace.categoriesHighlightColor = { "*": "#333333" };

/**
 * Enables trace output to go to an HTML text area element corresponding to the passed-in id.
 * Calling this also turns trace back on() if it were off.
 *
 * @param {string} traceOutputTextAreaId - An id for an HTML text area element to write trace messages to.
 * @returns {boolean} True if text area logging could be enabled, false otherwise (i.e. no element corresponding
 *   to the passed-in ID was found.)
 */
trace.enableTextAreaLogging = function enableTextAreaLogging(traceOutputTextAreaId) {
	_traceOutputTextArea = null;
	if (typeof document !== "undefined" && document.getElementById) {
		_traceOutputTextArea = document.getElementById(traceOutputTextAreaId);
		if (_traceOutputTextArea !== null) {
			_traceOutputTextAreaLogging = true;
		} else {
			_traceOutputTextAreaLogging = false;
			if (typeof console.log === "function") {
				console.log(`Warning: trace.enableTextAreaLogging couldn't find an element with id ${traceOutputTextAreaId}`);
			}
		}
	}
	_on = _traceOutputTextAreaLogging || _consoleLogging;
	return _traceOutputTextAreaLogging;
};

/**
 * Disables trace output to the HTML text area previously set by enableTextAreaLogging().
 * The trace module removes any reference to the previously established text area.
 */
trace.disableTextAreaLogging = function disableTextAreaLogging() {
	_traceOutputTextArea = null;
	_traceOutputTextAreaLogging = false;
	_on = _consoleLogging;
};

/**
 * Enables trace output to go to the JavaScript console.log() method, if present. By default, trace output
 * to the console log is off. Calling this also turns trace back on() if it were off.
 *
 * @returns {boolean} True if console logging could be enabled (i.e. there is a console to log to), false otherwise.
 */
trace.enableConsoleLogging = function enableConsoleLogging() {
	_consoleLogging = (window.console && console && console.log && (typeof console.log === "function"));
	_on = _traceOutputTextAreaLogging || _consoleLogging;
	return _consoleLogging;
};

/**
 * Disables trace output going to the JavaScript console.log() method. By default, trace output to the console log is off.
 */
trace.disableConsoleLogging = function disableConsoleLogging() {
	_consoleLogging = false;
	_on = _traceOutputTextAreaLogging;
};

/**
 * @returns {boolean} Returns true if trace output is currently on, false otherwise.
 */
trace.isOn = function isOn() {
	return _on;
};

/**
 * Turns tracing on. Note: this does not configure an output (whether the text area with id "traceOutputTextArea",
 * or having called enableConsoleLogging()), so by itself this won't enable logging. However, if logging is set
 * up, off() and on() can be used to temporarily suppress tracing without having to remove the text area or call
 * disableConsoleLogging().
 */
trace.on = function on() {
	_on = true;
};

/**
 * Turns tracing off. Any text area or console logging set up remain so, but tracing is temporarily suppressed.
 * Call on() to resume seeing trace output to the set up outputs.
 */
trace.off = function off() {
	_on = false;
};

/**
 * Clears the trace output text area and/or console.
 */
trace.clear = function clear() {
	if (!_on) { return; }
	if (_traceOutputTextAreaLogging) { _traceOutputTextArea.value = ""; }
	if (_consoleLogging && typeof console.clear === "function") { console.clear(); }
};

/**
 * Like writeLine(), but includes a category string in the trace output. The category can also be used to
 * filter out unwanted categories from trace output, e.g. if one is debugging a specific area and doesn't
 * wish to see unrelated trace messages.
 *
 * @param {string} category - The category for the trace message.
 * @param {string} format - The format of the trace message to output, or nothing if just a newline is
 *   desired. Optional format specifiers such as {0}, {1}, etc. may be included, and additional arguments
 *   will be substituted accordingly.
 */
trace.categoryWriteLine = function categoryWriteLine(category, format) { // & args...
	if (!_on) { return; }
	category = category ?? "";
	if (!_categoryActive(category)) { return; }
	let args = [category, format].concat(Array.prototype.slice.call(arguments, 2));
	_categoryWriteLineImpl.apply(null, args);
};

/**
 * Writes out a string to the trace output, with optional format specifiers substituted. An implied newline is
 * output after the formatted trace message. The category, for filtering purposes, is an implied empty string;
 * to specify one, call categoryWriteLine().
 *
 * @param {string} format - The format of the trace message to output, or nothing if just a newline is
 *   desired. Optional format specifiers such as {0}, {1}, etc. may be included, and additional arguments
 *   will be substituted accordingly.
 */
// eslint-disable-next-line no-unused-vars
trace.writeLine = function writeLine(format) { // & args...
	if (!_on || !_categoryActive("")) { return; }
	_categoryWriteLineImpl.apply(null, [""].concat(Array.prototype.slice.call(arguments)));
};

/**
 * Makes and returns a function that calls categoryWriteLine() with the category already filled in. Can be used
 * in a module to create a syntactically-simple local _trace() method that knows the module's category name and
 * just takes the format and remaining arguments.
 *
 * @param {string} category - The category for the trace messages.
 * @returns {Function} A function that calls categoryWriteLine() with the category already filled in.
 */
trace.categoryWriteLineMaker = function categoryWriteLineMaker(category) {
	return function categoryWriteLineForCategory() {
		if (!_on || !_categoryActive(category)) { return; }
		let args = [category].concat(Array.prototype.slice.call(arguments));
		_categoryWriteLineImpl.apply(null, args);
	};
};

return trace;
});
/* eslint-enable no-console */
/* eslint-enable prefer-rest-params, prefer-spread */
