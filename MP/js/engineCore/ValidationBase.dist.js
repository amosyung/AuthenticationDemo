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

define(["utility", "corejs"], utility => {
  "use strict";

  let isNullOrUndefined = utility.isNullOrUndefined,
    strFmt = utility.stringFormat;
  class ValidationBase {
    constructor() {
      this.errors = [];
    }
    clearErrors() {

      let errors = this.errors;
      while (errors.length > 0) {
        errors.pop();
      }
    }
    addError(fmt) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      let formattedError = strFmt(fmt, ...args);
      this.errors.push(formattedError);
    }
    checkType(value, valueName, typeNameOrNames) {

      let typeNames = Array.isArray(typeNameOrNames) ? typeNameOrNames : [typeNameOrNames];
      let initialErrorCount = this.errors.length,
        matchedOne = false;
      typeNames.some(typeName => {
        if (typeName === "array") {
          matchedOne = Array.isArray(value);
        } else if (typeName === "object") {
          matchedOne = typeof value === "object" && !Array.isArray(value);
        } else {
          matchedOne = typeof value === typeName;
        }
        return matchedOne;
      });
      if (!matchedOne) {
        let isMultiple = typeNames.length > 1;
        let errorMessage = strFmt("{0} must be{1} of {2} {3}.", valueName, isMultiple ? " one" : "", isMultiple ? "the following types:" : "type", typeNames.join(", "));
        this.addError(errorMessage);
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkRequiredBoolean(value, valueName) {
      return this.checkRequiredType(value, valueName, "boolean");
    }
    checkRequiredNumber(value, valueName) {
      return this.checkRequiredType(value, valueName, "number");
    }
    checkRequiredString(value, valueName) {
      return this.checkRequiredType(value, valueName, "string");
    }
    checkRequiredStringInSet(value, valueName, set) {
      let initialErrorCount = this.errors.length;
      if (this.checkRequiredType(value, valueName, "string")) {
        if (!set.has(value)) {
          this.addError("{0} must be one of: {1}.", valueName, set.map(v => "\"".concat(v, "\"")).join(", "));
        }
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkRequiredObject(value, valueName) {
      return this.checkRequiredType(value, valueName, "object");
    }
    checkRequiredArray(value, valueName) {
      return this.checkRequiredType(value, valueName, "array");
    }
    checkRequiredType(value, valueName, typeNameOrNames) {

      let initialErrorCount = this.errors.length;
      if (isNullOrUndefined(value)) {
        this.addError("{0} is required.", valueName);
      } else {
        this.checkType(value, valueName, typeNameOrNames);
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOptionalBoolean(value, valueName) {
      return this.checkOptionalType(value, valueName, "boolean");
    }

    checkOptionalNumber(value, valueName) {
      return this.checkOptionalType(value, valueName, "number");
    }
    checkOptionalNonNegativeNumber(value, valueName) {
      let initialErrorCount = this.errors.length;
      if (!isNullOrUndefined(value)) {
        if (this.checkOptionalType(value, valueName, "number")) {
          if (value < 0) {
            this.addError("{0} must not be negative.", valueName);
          }
        }
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOptionalWholeNonNegativeNumber(value, valueName) {
      let initialErrorCount = this.errors.length;
      if (!isNullOrUndefined(value)) {
        if (this.checkOptionalType(value, valueName, "number")) {
          if (value < 0 || value !== Math.round(value)) {
            this.addError("{0} must be a whole non-negative number.", valueName);
          }
        }
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOptionalNumberPortion(value, valueName) {
      let initialErrorCount = this.errors.length;
      if (!isNullOrUndefined(value)) {
        if (this.checkOptionalType(value, valueName, "number")) {
          if (value < 0 || value > 1) {
            this.addError("{0} must be in the range [0, 1].", valueName);
          }
        }
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOptionalString(value, valueName) {
      return this.checkOptionalType(value, valueName, "string");
    }
    checkOptionalStringInSet(value, valueName, set) {
      let initialErrorCount = this.errors.length;
      if (!isNullOrUndefined(value)) {
        if (this.checkOptionalType(value, valueName, "string")) {
          if (!set.has(value)) {
            this.addError("{0} must be one of: {1}.", valueName, set.map(v => "\"".concat(v, "\"")).join(", "));
          }
        }
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOptionalObject(value, valueName) {
      return this.checkOptionalType(value, valueName, "object");
    }
    checkOptionalArray(value, valueName) {
      return this.checkOptionalType(value, valueName, "array");
    }
    checkOptionalType(value, valueName, typeNameOrNames) {

      let initialErrorCount = this.errors.length;
      if (!isNullOrUndefined(value)) {
        this.checkType(value, valueName, typeNameOrNames);
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkObjectAndOrderContentsMatch(objName, obj, orderArrayName, orderArray) {

      let initialErrorCount = this.errors.length;
      this.checkRequiredObject(obj, objName);
      this.checkRequiredArray(orderArray, orderArrayName);
      if (initialErrorCount !== this.errors.length) {
        return false;
      }

      let contents = {};
      orderArray.forEach(id => {
        if (typeof id !== "string") {
          this.addError("{0} must contain only string id values.", orderArrayName);
          return;
        }
        if (typeof contents[id] !== "undefined") {
          this.addError('{0} refers to "{1}" more than once.', orderArrayName, id);
          return;
        }
        contents[id] = true;
      });
      Object.keys(obj).forEach(id => {
        if (id in contents) {
          delete contents[id];
        } else {
          this.addError('{0} contains id "{1}" not found in {2}.', objName, id, orderArrayName);
        }
      });
      Object.keys(contents).forEach(id => {
        this.addError('{0} refers to "{1}" not found in {2}.', orderArrayName, id, objName);
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }

    ifObjectCheckMapsStringsToStrings(obj, objName) {

      let initialErrorCount = this.errors.length;
      if (typeof obj === "object") {
        Object.entries(obj).forEach(_ref => {
          let [key, value] = _ref;
          this.checkRequiredString(value, strFmt('{0}["{1}"]', objName, key));
        });
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkObjectMapsStringsToNumbers(obj, objName) {

      let initialErrorCount = this.errors.length;
      if (!this.checkRequiredObject(obj, objName)) {
        return false;
      }
      if (typeof obj === "object") {
        Object.entries(obj).forEach(_ref2 => {
          let [key, value] = _ref2;
          this.checkRequiredNumber(value, strFmt('{0}["{1}"]', objName, key));
        });
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    throwIfErrorsExist(configId) {

      if (this.errors.length > 0) {
        let joinedErrors = this.errors.join("\n\n- ");
        this.clearErrors();
        throw new Error("\n\nIn config \"".concat(configId, "\", these errors were found:\n\n- ").concat(joinedErrors, "\n"));
      }
    }
  }
  return ValidationBase;
});
