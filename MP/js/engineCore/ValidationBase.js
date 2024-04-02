//-------------------------------------------------------------------------------------------------
// ValidationBase.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the ValidationBase class defining functionality common to both the mpceValidation
// object (see mpceValidation.js) and fsaeValidation object (see fsaeValidation.js).
//

define(["utility", "corejs"],
(utility) => {
"use strict";

let isNullOrUndefined = utility.isNullOrUndefined, strFmt = utility.stringFormat;

class ValidationBase {

	constructor() {
		this.errors = [];
	}

	clearErrors() {
		///	<summary>
		/// Clears the errors array property, without changing the array being referenced.
		///	</summary>
		///	<returns type="undefined"></returns>

		let errors = this.errors;
		while (errors.length > 0) {
			errors.pop();
		}
	}

	addError(fmt, ...args) {
		///	<summary>
		///	Adds an error string to the list of errors.  Accepts a format string and variable arguments.
		///	</summary>
		///	<param name="format" type="String">The format string.  Optional format specifiers such as
		///    {0}, {1}, etc. may be included, and additional arguments will be substituted accordingly.
		/// </param>
		let formattedError = strFmt(fmt, ...args);
		this.errors.push(formattedError);
	}

	checkType(value, valueName, typeNameOrNames) {
		///	<summary>
		///	Helper providing common implementation part for checkRequiredType() and checkOptionalType().
		///	</summary>
		/// <param name="value" type="Object">The value to check.</param>
		/// <param name="valueName" type="Object">The value name to emit in any error message.</param>
		/// <param name="typeNameOrNames" type="Object">The type name or names to look for in typeof(value)
		///    A string can be passed for a single name, or an array for multiple names.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let typeNames = Array.isArray(typeNameOrNames) ? typeNameOrNames : [typeNameOrNames];
		let initialErrorCount = this.errors.length, matchedOne = false;
		typeNames.some((typeName) => {
			if (typeName === "array") {
				matchedOne = Array.isArray(value);
			} else if (typeName === "object") {
				matchedOne = (typeof value === "object") && !Array.isArray(value);
			} else {
				matchedOne = (typeof value === typeName);
			}
			return matchedOne;
		});

		if (!matchedOne) {
			let isMultiple = (typeNames.length > 1);
			let errorMessage = strFmt("{0} must be{1} of {2} {3}.",
				valueName, isMultiple ? " one" : "", isMultiple ? "the following types:" : "type", typeNames.join(", "));
			this.addError(errorMessage);
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkRequiredBoolean(value, valueName) {
		/// <summary>Specialization of checkRequiredType() that checks for type "boolean".</summary>
		return this.checkRequiredType(value, valueName, "boolean");
	}

	checkRequiredNumber(value, valueName) {
		/// <summary>Specialization of checkRequiredType() that checks for type "number".</summary>
		return this.checkRequiredType(value, valueName, "number");
	}

	checkRequiredString(value, valueName) {
		/// <summary>Specialization of checkRequiredType() that checks for type "string".</summary>
		return this.checkRequiredType(value, valueName, "string");
	}

	checkRequiredStringInSet(value, valueName, set) {
		/// <summary>Specialization of checkRequiredType() that checks for type "string" and value in the set.</summary>
		let initialErrorCount = this.errors.length;
		if (this.checkRequiredType(value, valueName, "string")) {
			if (!set.has(value)) {
				this.addError("{0} must be one of: {1}.", valueName, set.map((v) => `"${v}"`).join(", "));
			}
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkRequiredObject(value, valueName) {
		/// <summary>Specialization of checkRequiredType() that checks for type "object".</summary>
		return this.checkRequiredType(value, valueName, "object");
	}

	checkRequiredArray(value, valueName) {
		/// <summary>Specialization of checkRequiredType() that checks for type "array".</summary>
		return this.checkRequiredType(value, valueName, "array");
	}

	checkRequiredType(value, valueName, typeNameOrNames) {
		///	<summary>
		///	Checks that the value is not null or undefined and it has typeof matching one of typeNameOrNames,
		/// which can be either a single string or an array of strings.  If it is null or undefined or doesn't
		/// match one of the types, it appends an error and returns false.  Special case: Pass "array" to test
		/// for array specifically; arrays won't match for "object".
		///	</summary>
		/// <param name="value" type="Object">The value to check.</param>
		/// <param name="valueName" type="Object">The value name to emit in any error message.</param>
		/// <param name="typeNameOrNames" type="Object">The type name or names to look for in typeof(value)
		///    A string can be passed for a single name, or an array for multiple names.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;
		if (isNullOrUndefined(value)) {
			this.addError("{0} is required.", valueName);
		} else {
			this.checkType(value, valueName, typeNameOrNames);
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOptionalBoolean(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "boolean".</summary>
		return this.checkOptionalType(value, valueName, "boolean");
	}

	// noinspection JSUnusedGlobalSymbols
	checkOptionalNumber(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "number".</summary>
		return this.checkOptionalType(value, valueName, "number");
	}

	checkOptionalNonNegativeNumber(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "number" and, if defined, non-negative.</summary>
		let initialErrorCount = this.errors.length;
		if (!isNullOrUndefined(value)) {
			if (this.checkOptionalType(value, valueName, "number")) {
				if (value < 0) {
					this.addError("{0} must not be negative.", valueName);
				}
			}
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOptionalWholeNonNegativeNumber(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "number" and, if defined, non-negative and whole.</summary>
		let initialErrorCount = this.errors.length;
		if (!isNullOrUndefined(value)) {
			if (this.checkOptionalType(value, valueName, "number")) {
				if (value < 0 || value !== Math.round(value)) {
					this.addError("{0} must be a whole non-negative number.", valueName);
				}
			}
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOptionalNumberPortion(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "number" and, if defined, range between 0 and 1.</summary>
		let initialErrorCount = this.errors.length;
		if (!isNullOrUndefined(value)) {
			if (this.checkOptionalType(value, valueName, "number")) {
				if (value < 0 || value > 1) {
					this.addError("{0} must be in the range [0, 1].", valueName);
				}
			}
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOptionalString(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "string".</summary>
		return this.checkOptionalType(value, valueName, "string");
	}

	checkOptionalStringInSet(value, valueName, set) {
		/// <summary>Specialization of checkOptionalType() that checks for type "string" and value in the set.</summary>
		let initialErrorCount = this.errors.length;
		if (!isNullOrUndefined(value)) {
			if (this.checkOptionalType(value, valueName, "string")) {
				if (!set.has(value)) {
					this.addError("{0} must be one of: {1}.", valueName, set.map((v) => `"${v}"`).join(", "));
				}
			}
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOptionalObject(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "object".</summary>
		return this.checkOptionalType(value, valueName, "object");
	}

	checkOptionalArray(value, valueName) {
		/// <summary>Specialization of checkOptionalType() that checks for type "array".</summary>
		return this.checkOptionalType(value, valueName, "array");
	}

	checkOptionalType(value, valueName, typeNameOrNames) {
		///	<summary>
		///	Checks that if the value is not null or undefined, then it has typeof matching one of
		/// typeNameOrNames, which can be either a single string or an array of strings.  If it doesn't match
		/// one of the types, it appends an error and returns false.  Special case: Pass "array" to test for
		/// array specifically; arrays won't match for "object".
		///	</summary>
		/// <param name="value" type="Object">The value to check.</param>
		/// <param name="valueName" type="Object">The value name to emit in any error message.</param>
		/// <param name="typeNameOrNames" type="Object">The type name or names to look for in typeof value
		///    A string can be passed for a single name, or an array for multiple names.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;
		if (!isNullOrUndefined(value)) {
			this.checkType(value, valueName, typeNameOrNames);
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkObjectAndOrderContentsMatch(objName, obj, orderArrayName, orderArray) {
		///	<summary>
		///	Ensures that a given object and its associated order array have matching contents; that is,
		/// that every named inner object is present in the order array, and vice-versa.
		///	</summary>
		///	<param name="objName" type="String">The name or description of the object that follows, for
		///     troubleshooting.</param>
		///	<param name="obj" type="Object">The object to check.</param>
		///	<param name="orderArrayName" type="String">The name or description of the array that follows, for
		///     troubleshooting.</param>
		///	<param name="orderArray" type="Array">The order array to check.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;
		this.checkRequiredObject(obj, objName);
		this.checkRequiredArray(orderArray, orderArrayName);
		if (initialErrorCount !== this.errors.length) {
			return false;
		}

		// Walk orderArray and add the ids the temporary object "contents"
		let contents = {};
		orderArray.forEach((id) => {
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
		// Iterate through properties in obj, removing them from "contents" if found, complaining if not found.
		Object.keys(obj).forEach((id) => {
			if ((id in contents)) {
				delete contents[id];
			} else {
				this.addError('{0} contains id "{1}" not found in {2}.', objName, id, orderArrayName);
			}
		});
		// Last, complain about whatever that's still in contents; it was in the orderArray but not in obj.
		Object.keys(contents).forEach((id) => { this.addError('{0} refers to "{1}" not found in {2}.', orderArrayName, id, objName); });
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	// noinspection JSUnusedGlobalSymbols
	ifObjectCheckMapsStringsToStrings(obj, objName) {
		///	<summary>
		///	Ensures that if a given value is an object, then it must map string keys to string values.
		///	</summary>
		///	<param name="obj" type="Object">The object to check.</param>
		///	<param name="objName" type="String">The name or description of the object that follows, for troubleshooting.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;
		if (typeof obj === "object") {
			Object.entries(obj).forEach(([key, value]) => { this.checkRequiredString(value, strFmt('{0}["{1}"]', objName, key)); });
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkObjectMapsStringsToNumbers(obj, objName) {
		///	<summary>
		///	Ensures that a given value is an object and that it maps string keys to number values.
		///	</summary>
		///	<param name="obj" type="Object">The object to check.</param>
		///	<param name="objName" type="String">The name or description of the object that follows, for troubleshooting.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;
		if (!this.checkRequiredObject(obj, objName)) {
			return false;
		}
		if (typeof obj === "object") {
			Object.entries(obj).forEach(([key, value]) => { this.checkRequiredNumber(value, strFmt('{0}["{1}"]', objName, key)); });
		}
		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	throwIfErrorsExist(configId) {
		///	<summary>
		/// If the errors array property has any errors, an error message constructed, and an exception thrown.
		//  Otherwise, if there are no errors, nothing happens.
		///	</summary>
		/// <param name="configId" type="String">A string identifying which configuration object in resulting errors.</param>
		///	<returns type="undefined"></returns>

		if (this.errors.length > 0) {
			let joinedErrors = this.errors.join("\n\n- ");
			this.clearErrors();
			throw new Error(`\n\nIn config "${configId}", these errors were found:\n\n- ${joinedErrors}\n`);
		}
	}
}
return ValidationBase;
});
