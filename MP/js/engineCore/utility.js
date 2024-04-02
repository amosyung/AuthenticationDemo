//-------------------------------------------------------------------------------------------------
// utility.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Provides additional general-purpose utility functions used by the MPCE and FSAE engines.
//

// eslint-disable-next-line no-unused-vars
define([],
() => {
"use strict";

let me = {};

/**
 * Returns true if the value passed is a strictly null or strictly undefined object, false otherwise.
 *
 * @param {object} value - The object to test for null or undefined.
 * @returns {boolean} True if the value passed is a strictly null or strictly undefined object, false otherwise.
 */
me.isNullOrUndefined = function isNullOrUndefined(value) {
	return (typeof value === "undefined" || value === null);
};
let _isNullOrUndefined = me.isNullOrUndefined;

// Helpers for deepCopy() below.
let _deepCopyPreserveThese = (key, value) => {
	if (value === Infinity) {
		return "Infinity";
	} else if (value === -Infinity) {
		return "-Infinity";
	} else if (Number.isNaN(value)) {
		return "NaN";
	}
	return value;
};
let _deepCopyRestoreThese = (key, value) => {
	if (value === "Infinity") {
		return Infinity;
	} else if (value === -"-Infinity") {
		return -Infinity;
	} else if (value === "NaN") {
		return NaN;
	}
	return value;
};

/**
 * deepCopy performs a deep copy of an object using JSON round-tripping via JSON.parse() and JSON.stringify(),
 * while preserving special number values like positive and negative Infinity and NaN. NOTE: If the object being
 * deep copied has any functions, they will not be preserved.
 *
 * @param {object} object - The object to make a deep copy of.
 * @returns {object} - A deep copy of the object, using round-tripping to JSON and back.
 */
me.deepCopy = function deepCopy(object) {
	let result = JSON.parse(JSON.stringify(object, _deepCopyPreserveThese), _deepCopyRestoreThese);
	return result;
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} s - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
me.capitalizeFirstLetter = function capitalizeFirstLetter(s) {
	let result = (typeof s === "string" && s.length > 0) ? s[0].toUpperCase() + s.substr(1) : s;
	return result;
};

// Cache of format specifier regular expressions for stringFormat() below.
let _stringFormatRegExps = [];
for (let i = 0; i < 100; i += 1) {
	_stringFormatRegExps.push(new RegExp("\\{" + i + "\\}", "gm"));
}

/**
 * stringFormat is like C#'s string.Format() that can accept positional arguments.
 * Unlike C# in that it doesn't provide formatting of those individual arguments.
 *
 * @param {string} fmt - The format string.  Optional format specifiers such as {0}, {1}, etc.
 *   up to {99} may be included, and additional arguments will be substituted accordingly.
 * @param {...*} args - Additional arguments to be substituted.
 * @returns {string} The format string after substituting positional arguments.
 */
me.stringFormat = function stringFormat(fmt, ...args) {
	let result = fmt, argsLength = args.length;
	for (let i = 0; i < argsLength; i += 1) {
		result = result.replace(_stringFormatRegExps[i], () => args[i]); // fn maintains $ in args as literals
	}
	return result;
};

/**
 * Returns the minimum of three numbers.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @param {number} c - The third number.
 * @returns {number} The minimum of a, b, and c.
 */
me.min3 = function min3(a, b, c) {
	let result = Math.min(Math.min(a, b), c);
	return result;
};

/**
 * Constraints a value to within a minimum and maximum.
 *
 * @param {number} value - The value to constrain.
 * @param {number} min - The minimum value for the range.
 * @param {number} max - The maximum value for the range.
 * @returns {number} - If value is less than the minimum, returns the minimum. If value is
 *   greater than the maximum, returns the maximum. Otherwise, returns the value.
 */
me.constrain = function constrain(value, min, max) {
	let result = value < min ? min : (value > max ? max : value);
	return result;
};

/**
 * Formats a number as a dollar amount string with comma thousands separator and optional cents. If the
 * dollar amount is negative, it is formatted according to accounting conventions, i.e. wrapped in parentheses
 * instead of using a negative sign. Note: Doesn't round, just formats. (Round in advance if needed.)
 *
 * @param {number} amount - The number to format as a dollar amount.
 * @param {boolean} [includeCents=false] - A boolean indicating whether to include cents, or not.
 * @param {boolean} [excludeSign=false] - A boolean indicating whether to exclude the currency sign, or not.
 * @param {string} [thousandsChar=","] - The thousands separator character to use. Defaults to "," if undefined.
 * @param {string} [decimalChar="."] - The decimal separator character to use. Defaults to "." if undefined.
 * @param {string} [signChar="$"] - The currency sign character to use. Defaults to "$" if undefined.
 * @returns {string} The formatted dollar amount.
 */
me.formatDollar = function formatDollar(amount, includeCents, excludeSign, thousandsChar, decimalChar, signChar) {
	if (_isNullOrUndefined(amount) || typeof amount !== "number") { return "#N/A"; }
	if (!isFinite(amount)) { return amount.toString(); }
	// Defaults for sign, decimal, and thousands characters:
	thousandsChar = thousandsChar ?? ",";
	decimalChar = decimalChar ?? ".";
	signChar = signChar ?? "$";
	amount = Number.parseFloat(amount.toFixed(2)); // precision to cents only
	let negative = amount < 0;
	amount = Math.abs(amount);
	if (!includeCents) { amount = Math.round(amount); }
	let parts = amount.toString().split("."), whole = parts[0], wholeWithSeps = "";
	for (let i = whole.length - 1, count = 1; i >= 0; i -= 1, count += 1) {
		wholeWithSeps = whole.charAt(i) + wholeWithSeps;
		if (0 === (count % 3) && (i !== 0)) {
			wholeWithSeps = thousandsChar + wholeWithSeps;
		}
	}
	let dimes = (parts[1] ?? "00").charAt(0);
	let cents = (parts[1] ?? "00").charAt(1) ?? "0";
	let result = (negative ? "(" : "") + (excludeSign ? "" : signChar) +
		wholeWithSeps + (includeCents ? (decimalChar + dimes + cents) : "") + (negative ? ")" : "");
	return result;
};

/**
 * Rounds a dollar amount to cents, i.e. two decimal places.
 *
 * @param {number} amount - The dollar amount to round to two decimal places.
 * @returns {number} The rounded amount, if amount was finite, otherwise amount unchanged.
 */
me.roundToCents = function roundToCents(amount) {
	let result = isFinite(amount) ? (Math.round(amount * 100) / 100) : amount;
	return result;
};
let _roundToCents = me.roundToCents;

/**
 * Rounds to cents each of the properties of type number at the top level of the object.
 *
 * @param {object} obj - The object whose top-level number properties should be rounded to cents.
 */
me.roundResultNumbersToCents = function roundResultNumbersToCents(obj) {
	Object.keys(obj).filter((key) => typeof obj[key] === "number").forEach((key) => { obj[key] = _roundToCents(obj[key]); });
};


/**
 * Saves a string value as a session cookie; i.e. goes away when the browser is closed.
 *
 * @param {string} name - The name of the cookie to save.
 * @param {string} value - The value of the cookie to save.
 * @param {boolean} [raw=false] - If true, treats the value as already encoded.
 */
me.setSessionCookie = function setSessionCookie(name, value, raw) {
	document.cookie = `${name}=${raw ? value : encodeURIComponent(value)}`; // Note: no "expires" = session cookie.
};

/**
 * Returns the named cookie value, or null if there's no such cookie.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string} The named cookie value, or null if there's no such cookie.
 */
me.getCookie = function getCookie(name) {
	let result = null, cookies = document.cookie ? document.cookie.split("; ") : [];
	cookies.some((cookie) => {
		let parts = cookie.split("=");
		if (name === parts[0]) {
			result = decodeURIComponent(parts[1]);
			return true;
		}
		return false;
	});
	return result;
};

/**
 * Clears a specific cookie by immediately expiring it.
 *
 * @param {string} name - The name of the cookie to clear.
 */
me.clearCookie = function clearCookie(name) {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
let _clearCookie = me.clearCookie;

/**
 * Clears all cookies by immediately expiring them.
 */
me.clearAllCookies = function clearAllCookies() {
	let cookies = document.cookie ? document.cookie.split("; ") : [];
	cookies.forEach((cookie) => {
		let eq = cookie.indexOf("="), name = (eq > -1 ? cookie.substr(0, eq) : cookie);
		_clearCookie(name);
	});
};

/**
 * Given an object contentObj and a string contentId, returns the corresponding string content
 * in contentObj[contentId], or an error string if contentObj has no property named contentId.
 *
 * @param {object} contentObj - The object containing string content ids mapped to strings.
 * @param {string} contentId - The content id, e.g. "txt_SelectOne".
 * @returns {string} The string value for the content, e.g. "Select One", or ??[contentId]??
 *   if no such contentId found in contentObj.</returns>.
 */
me.getAppString = function getAppString(contentObj, contentId) {
	let result = contentObj ? (typeof contentObj[contentId] === "undefined" ? `??${contentId}??` : contentObj[contentId]) :
		"??_bad_contentObj_??";
	return result;
};
let _getAppString = me.getAppString;

/**
 * Makes and returns a function that calls getAppString() with the contentObj already filled in.
 * Can be used in a module to create a syntactically-simple local _appString() method that knows the
 * content source object and just takes the contentId argument.
 *
 * @param {object} contentObj - The object containing string content ids mapped to strings.
 * @returns {Function} A function that calls getAppString() with the contentObj already filled in.
 */
me.getAppStringMaker = function getAppStringMaker(contentObj) {
	return (contentId) => _getAppString(contentObj, contentId);
};

/**
 * Helper to get an object's "description" (or similar) property, whether it is a string, or
 * an object mapping language codes to strings. The alternate name for this method, descriptionHelper,
 * is for compatibility with older implementations and is deprecated; use getDescription instead.
 *
 * @param {object} obj - The object for which a description is desired.
 * @param {string} [propertyName1=undefined] - Same as propertyName2. Former param "langCode" is obsolete.
 * @param {string} [propertyName2=undefined] - An optional string that supplies an alternate property name to be
 *   referenced before "description". Alternate descriptions, e.g. "descriptionChart", may be referenced
 *   this way if present in an object, overriding the "description" while possibly falling back to it.
 * @returns {*} If the "description" property (or overridden property referenced by the optional
 *   propertyName) of the passed-in object is a string, then returns as-is. If the property an object,
 *   then the corresponding string contained in that object is returned, or the first found, if the key
 *   is absent.
 */
me.getDescription = function getDescription(obj, propertyName1, propertyName2) {
	if (_isNullOrUndefined(obj)) { return "[invalid object]"; }
	let propName = propertyName2 ?? propertyName1;
	let propValue = (propName && (propName in obj)) ? obj[propName] : obj.description;
	let result;
	if (typeof propValue === "string") {
		result = propValue;
	} else if (propValue) {
		result = propValue.toString();
	} else {
		result = obj.toString();
	}
	return result;
};

/**
 * Given a query string, returns an object with decoded key/value pairs. Where the query string contains a
 * named key once, the value contained in the object for that key is a plain string. Where the query string
 * contains a named key more than once, the value for that key is an array of strings.
 *
 * @param {string} queryString - The query string to parse into an object.
 * @returns {object} An object containing key/value pairs where the values are either plain strings or arrays
 *   of strings.
 */
me.parseQueryStringToObject = function parseQueryStringToObject(queryString) {
	if (_isNullOrUndefined(queryString) || queryString.length === 0) { return {}; }
	if (queryString[0] === "?") { queryString = queryString.substring(1); }
	let components = queryString.split("&"), result = {};
	components.forEach((component) => {
		let keyValuePair = component.split("=");
		let key = decodeURIComponent(keyValuePair[0]);
		let value = decodeURIComponent(keyValuePair[1]);
		if (typeof result[key] === "undefined") {
			// First entry with this name; store single value.
			result[key] = value;
		} else if (typeof result[key] === "string") {
			// Second entry with this name; replace both with array.
			let arr = [result[key], value];
			result[key] = arr;
		} else {
			// Third or later entry with this name; add to array.
			result[key].push(value);
		}
	});
	return result;
};

return me;
});
