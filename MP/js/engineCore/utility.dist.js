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

define([], () => {
  "use strict";

  let me = {};

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

  me.deepCopy = function deepCopy(object) {
    let result = JSON.parse(JSON.stringify(object, _deepCopyPreserveThese), _deepCopyRestoreThese);
    return result;
  };

  me.capitalizeFirstLetter = function capitalizeFirstLetter(s) {
    let result = typeof s === "string" && s.length > 0 ? s[0].toUpperCase() + s.substr(1) : s;
    return result;
  };

  let _stringFormatRegExps = [];
  for (let i = 0; i < 100; i += 1) {
    _stringFormatRegExps.push(new RegExp("\\{" + i + "\\}", "gm"));
  }

  me.stringFormat = function stringFormat(fmt) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    let result = fmt,
      argsLength = args.length;
    for (let i = 0; i < argsLength; i += 1) {
      result = result.replace(_stringFormatRegExps[i], () => args[i]);
    }

    return result;
  };

  me.min3 = function min3(a, b, c) {
    let result = Math.min(Math.min(a, b), c);
    return result;
  };

  me.constrain = function constrain(value, min, max) {
    let result = value < min ? min : value > max ? max : value;
    return result;
  };

  me.formatDollar = function formatDollar(amount, includeCents, excludeSign, thousandsChar, decimalChar, signChar) {
    var _thousandsChar, _decimalChar, _signChar, _parts$, _charAt, _parts$2;
    if (me.isNullOrUndefined(amount) || typeof amount !== "number") {
      return "#N/A";
    }
    if (!isFinite(amount)) {
      return amount.toString();
    }
    thousandsChar = (_thousandsChar = thousandsChar) !== null && _thousandsChar !== void 0 ? _thousandsChar : ",";
    decimalChar = (_decimalChar = decimalChar) !== null && _decimalChar !== void 0 ? _decimalChar : ".";
    signChar = (_signChar = signChar) !== null && _signChar !== void 0 ? _signChar : "$";
    amount = Number.parseFloat(amount.toFixed(2));
    let negative = amount < 0;
    amount = Math.abs(amount);
    if (!includeCents) {
      amount = Math.round(amount);
    }
    let parts = amount.toString().split("."),
      whole = parts[0],
      wholeWithSeps = "";
    for (let i = whole.length - 1, count = 1; i >= 0; i -= 1, count += 1) {
      wholeWithSeps = whole.charAt(i) + wholeWithSeps;
      if (0 === count % 3 && i !== 0) {
        wholeWithSeps = thousandsChar + wholeWithSeps;
      }
    }
    let dimes = ((_parts$ = parts[1]) !== null && _parts$ !== void 0 ? _parts$ : "00").charAt(0);
    let cents = (_charAt = ((_parts$2 = parts[1]) !== null && _parts$2 !== void 0 ? _parts$2 : "00").charAt(1)) !== null && _charAt !== void 0 ? _charAt : "0";
    let result = (negative ? "(" : "") + (excludeSign ? "" : signChar) + wholeWithSeps + (includeCents ? decimalChar + dimes + cents : "") + (negative ? ")" : "");
    return result;
  };

  me.roundToCents = function roundToCents(amount) {
    let result = isFinite(amount) ? Math.round(amount * 100) / 100 : amount;
    return result;
  };

  me.roundResultNumbersToCents = function roundResultNumbersToCents(obj) {
    Object.keys(obj).filter(key => typeof obj[key] === "number").forEach(key => {
      obj[key] = me.roundToCents(obj[key]);
    });
  };

  me.isNullOrUndefined = function isNullOrUndefined(value) {
    return typeof value === "undefined" || value === null;
  };

  me.setSessionCookie = function setSessionCookie(name, value, raw) {
    document.cookie = "".concat(name, "=").concat(raw ? value : encodeURIComponent(value));
  };

  me.getCookie = function getCookie(name) {
    let result = null,
      cookies = document.cookie ? document.cookie.split("; ") : [];
    cookies.some(cookie => {
      let parts = cookie.split("=");
      if (name === parts[0]) {
        result = decodeURIComponent(parts[1]);
        return true;
      }
      return false;
    });
    return result;
  };

  me.clearCookie = function clearCookie(name) {
    document.cookie = "".concat(name, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT");
  };

  me.clearAllCookies = function clearAllCookies() {
    let cookies = document.cookie ? document.cookie.split("; ") : [];
    cookies.forEach(cookie => {
      let eq = cookie.indexOf("="),
        name = eq > -1 ? cookie.substr(0, eq) : cookie;
      me.clearCookie(name);
    });
  };

  me.getAppString = function getAppString(contentObj, contentId) {
    let result = contentObj ? typeof contentObj[contentId] === "undefined" ? "??".concat(contentId, "??") : contentObj[contentId] : "??_bad_contentObj_??";
    return result;
  };

  me.getAppStringMaker = function getAppStringMaker(contentObj) {
    return contentId => me.getAppString(contentObj, contentId);
  };

  me.getDescription = function getDescription(obj, propertyName1, propertyName2) {
    if (me.isNullOrUndefined(obj)) {
      return "[invalid object]";
    }
    let propName = propertyName2 !== null && propertyName2 !== void 0 ? propertyName2 : propertyName1;
    let propValue = propName && propName in obj ? obj[propName] : obj.description;
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

  me.parseQueryStringToObject = function parseQueryStringToObject(queryString) {
    if (me.isNullOrUndefined(queryString) || queryString.length === 0) {
      return {};
    }
    if (queryString[0] === "?") {
      queryString = queryString.substring(1);
    }
    let components = queryString.split("&"),
      result = {};
    components.forEach(component => {
      let keyValuePair = component.split("=");
      let key = decodeURIComponent(keyValuePair[0]);
      let value = decodeURIComponent(keyValuePair[1]);
      if (typeof result[key] === "undefined") {
        result[key] = value;
      } else if (typeof result[key] === "string") {
        let arr = [result[key], value];
        result[key] = arr;
      } else {
        result[key].push(value);
      }
    });
    return result;
  };
  return me;
});
