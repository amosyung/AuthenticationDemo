//-------------------------------------------------------------------------------------------------
// appValidation.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains logic to validate portions of the application main configuration file.
//

define(["ValidationBase", "trace", "utility"],
/**
 * @param {Function} ValidationBase
 * @param {object} trace
 * @param {object} utility
 * @returns {object}
 */
function module(ValidationBase, trace, utility) {
"use strict";

/**
 * @name AppValidation
 * @type {{
 *   validChartSeriesDisplaySet: Set
 *	 checkGeneral: Function
 *   checkSubconfigs: Function
 *   checkMpceChartSeries: Function
 *   checkConfig: Function
 *   errors: string[]
 *   clearErrors: Function
 *   addError: Function
 *   checkType: Function
 *   checkRequiredBoolean: Function
 *   checkRequiredNumber: Function
 *   checkRequiredString: Function
 *   checkRequiredStringInSet: Function
 *   checkRequiredObject: Function
 *   checkRequiredArray: Function
 *   checkRequiredType: Function
 *   checkOptionalBoolean: Function
 *   checkOptionalNumber: Function
 *   checkOptionalNonNegativeNumber: Function
 *   checkOptionalWholeNonNegativeNumber: Function
 *   checkOptionalNumberPortion: Function
 *   checkOptionalString: Function
 *   checkOptionalStringInSet: Function
 *   checkOptionalObject: Function
 *   checkOptionalArray: Function
 *   checkOptionalType: Function
 *   checkObjectAndOrderContentsMatch: Function
 *   ifObjectCheckMapsStringsToStrings: Function
 *   checkObjectMapsStringsToNumbers: Function
 *   throwIfErrorsExist: Function
 * }}
 */
let me = new ValidationBase();
let _trace = trace.categoryWriteLineMaker("appValidation");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appValidation"); } }; tick();

let strFmt = utility.stringFormat;

me.validChartSeriesDisplaySet = new Set(["auto", "always", "never"]);

me.checkGeneral = function checkGeneral(config) {
	///	<summary>
	///	Checks the "general" object for consistency and expected structure.
	///	</summary>
	/// <param name="config" type="Object">The application main configuration object.</param>
	///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

	let initialErrorCount = me.errors.length, success, general = config.general;

	if (me.checkRequiredType(config.general, "config.general", "object")) {
		let validWizardConfigNamesSet = new Set(["wizardConfigGuideMe", "wizardConfigPersonas"]);
		me.checkRequiredStringInSet(general.wizardConfigName, "general.wizardConfigName", validWizardConfigNamesSet);
		// LATER: Validation of other properties.
	}

	success = (initialErrorCount === me.errors.length);
	return success;
};

me.checkSubconfigs = function checkSubconfigs(config) {
	///	<summary>
	///	Checks the "subconfigs", "subconfigsOrder", and "subconfigsDefaultId" properties, and related configuration,
	// for consistency and expected structure.
	///	</summary>
	/// <param name="config" type="Object">The application main configuration object.</param>
	///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

	let initialErrorCount = me.errors.length, success, subconfigs = config.subconfigs, subconfigsOrder = config.subconfigsOrder;
	if (!me.checkObjectAndOrderContentsMatch("subconfigs", subconfigs, "subconfigsOrder", subconfigsOrder)) { return false; }

	me.checkRequiredString(config.subconfigsDefaultId, "subconfigsDefaultId");

	subconfigsOrder.forEach(function each(subconfigId) {
		let subconfig = subconfigs[subconfigId], desc1 = strFmt('subconfigs["{0}"]', subconfigId);

		// First, check required properties.
		me.checkRequiredString(subconfig.description, strFmt("{0}.description", desc1));

		// Then, check optional properties.
		Object.keys(subconfig).forEach(function eachPropName(propName) {
			switch (propName) {
				case "description":
					// Required; checked above.
					break;

				case "subconfigObject":
					// subconfigObject is optional because the MPCE now supports dynamically loading subconfig modules.
					me.checkOptionalObject(subconfig.subconfigObject, strFmt("{0}.subconfigObject", desc1));
					break;

				default:
					me.addError('{0} contains unknown property "{1}".', desc1, propName);
					break;
			}
		});
	});

	success = (initialErrorCount === me.errors.length);
	return success;
};

me.checkMpceChartSeries = function checkMpceChartSeries(config) {
	///	<summary>
	///	Checks the "mpceChartSeries" and "mpceChartSeriesOrder" properties, and related configuration, for consistency
	/// and expected structure.
	///	</summary>
	/// <param name="config" type="Object">The application main configuration object.</param>
	///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

	let initialErrorCount = me.errors.length, success, series = config.mpceChartSeries;
	let requiredChartSeries = ["outOfPocketCosts", "employerOrPlanTotalCosts", "paidByEmployerOrPlanExcludingFund", "paidByPlanFund",
		"paidByRolloverFund", "paidByEmployeeHSACont", "paidByEmployeeFSACont", "annualEmployerPremiums", "employeeAdditionalServicePremiums",
		"annualEmployeePremiums", "employeeTotalCosts", "totalCosts"];

	me.checkObjectAndOrderContentsMatch("mpceChartSeries", series, "mpceChartSeriesOrder", config.mpceChartSeriesOrder);
	me.checkObjectAndOrderContentsMatch("mpceChartSeries", series, "valid chart series ids", requiredChartSeries);

	Object.keys(series).forEach(function each(seriesId) {
		let oneSeries = series[seriesId], desc1 = strFmt("mpceChartSeries.{0}", seriesId);

		if (!me.checkRequiredObject(oneSeries, desc1)) { return; }

		// First, check required properties.
		me.checkRequiredString(oneSeries.description, strFmt("{0}.description", desc1));

		// Then, check optional properties.
		Object.keys(oneSeries).forEach(function eachPropName(propName) {
			let propValue = oneSeries[propName];
			let desc2 = strFmt("{0}.{1}", desc1, propName);

			switch (propName) {
				case "description":
					// Required; checked above.
					break;

				case "color":
				case "descriptionInPrintTable":
				case "alternateDescription":
				case "alternateDescriptionInPrintTable":
				case "alternateColor":
					me.checkOptionalString(propValue, desc2);
					break;

				case "displayInLegend":
				case "displayInChart":
				case "displayInPrintTable":
					me.checkOptionalStringInSet(propValue, desc2, me.validChartSeriesDisplaySet);
					break;

				default:
					me.addError('{0} contains unknown property "{1}".', desc1, propName);
					break;
			}
		});
	});

	success = (initialErrorCount === me.errors.length);
	return success;
};

me.checkConfig = function checkConfig(config, configId, noThrow) {
	///	<summary>
	/// Public (intended) method intended to be called by the application core to ensure the main configuration
	/// object contents are consistent and meet certain defined expectations. If errors are found, an exception
	//  is thrown containing a message with the configuration error details.
	///	</summary>
	/// <param name="config" type="Object">The application main configuration object; mainConfig, typically.</param>
	/// <param name="configId" type="String">A string identifying which application main configuration object.</param>
	/// <param name="noThrow" type="Boolean">An optional boolean defaulting to false. If true, the throwing of
	///   any configuration errors found is suppressed and it becomes the caller's responsibility to check the return
	///   value and report the errors if indicated.</param>
	///	<returns type="Boolean">
	/// True if all checks passed, false otherwise. For failure, consult the errors array or call throwIfErrorsExist().
	/// </returns>

	let success;
	_trace("checkConfig() called; configId: {0}, noThrow: {1}{2}", configId, noThrow,
		typeof noThrow === "undefined" ? " (false)" : "");

	me.clearErrors();
	delete config.hasPassedAppValidation;

	me.checkGeneral(config);
	me.checkSubconfigs(config);
	me.checkMpceChartSeries(config);

	// LATER: Validation of more main configuration objects.

	success = (0 === me.errors.length);
	if (success) {
		config.hasPassedAppValidation = true;
	} else {
		_trace("checkConfig: " + configId + " had validation errors: \n\n... " + me.errors.join("\n... ") + "\n\n");
		!noThrow && me.throwIfErrorsExist(configId);
	}
	_trace("checkConfig() returning success: {0}", success);
	return success;
};

_trace("module() returning");
return me;
});
