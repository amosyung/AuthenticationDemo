//-------------------------------------------------------------------------------------------------
// appText.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(["trace", "utility", "mainConfig"],
/**
 * @param {object} trace
 * @param {object} utility
 * @param {object} mainConfig
 * @returns {object}
 */
function module(trace, utility, mainConfig) {
"use strict";

/**
 * @name AppText
 * @type {{
 *   strings: object.<string, string>
 *   initializeAsync: Function
 *   planDeductibles: Function
 *   planServiceCoverage: Function
 * }}
 */
let appText = {};
let _trace = trace.categoryWriteLineMaker("appText");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appText"); } }; tick();

let strFmt = utility.stringFormat, isNullOrUndefined = utility.isNullOrUndefined, formatDollar = utility.formatDollar,
	abs = Math.abs, round = Math.round;

let _strings = appText.strings = {
	deductibles: {},
	coverage: {}
};

appText.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			_strings.deductibles = mainConfig.planProvisionsDeductiblesStrings;
			_strings.coverage = mainConfig.planProvisionsCoverageStrings;
			resolve();
		}, params.delayMsec || 0);
	});
};

let _supportedCoverageProperties = new Set([
	"notCovered", "copay", "coinsurance", "deductible", "coinsuranceMinDollar", "coinsuranceMaxDollar", "coveredCount", "singleUseCostMax"]);

let _dollars = function dollars(amount) {
	let rounded = round(amount), absDiff = abs(amount - rounded), includeCents = (absDiff >= 0.005), excludeSign = true;
	let result = formatDollar(amount, includeCents, excludeSign);
	return result;
};

let _isSimpleDeductible = function isSimpleDeductible(d) {
	let result = false;
	if (!isNullOrUndefined(d) && Object.keys(d).length === 1 &&
		("general" in d) && Object.keys(d.general).length === 1 &&
		("amount" in d.general)) {
		result = true;
	}
	return result;
};

let _isSimpleZeroDeductible = function isSimpleZeroDeductible(d) {
	let result = false;
	if (_isSimpleDeductible(d) && d.general.amount === 0) {
		result = true;
	}
	return result;
};

let _deductibleHasAmountMap = function deductibleHasAmountMap(d) {
	let result = false;
	if (d && Object.keys(d).length === 1 && ("general" in d) && Object.keys(d.general).length === 1 && ("amountMap" in d.general)) {
		result = true;
	}
	return result;
};

let _amountMapHasTypicalFormat = function amountMapHasTypicalFormat(map) {
	let result = false;
	let keySet = new Set(Object.keys(map));
	let hasEEOnlyAmount = keySet.has("employeeOnly");
	if (hasEEOnlyAmount && keySet.size > 1) {
		keySet.delete("employeeOnly");
		let remainingValues = Array.from(keySet).map(function mapKeyToValue(key) { return map[key]; });
		let firstValue = remainingValues[0];
		result = remainingValues.every(function test(otherValue) { return otherValue === firstValue; });
	}
	return result;
};

let _getTypicalAmountMapNonEEOnlyAmount = function getTypicalAmountMapNonEEOnlyAmount(map) {
	let keySet = new Set(Object.keys(map)), result;
	keySet.delete("employeeOnly");
	result = map[Array.from(keySet).pop()];
	return result;
};

appText.planDeductibles = function planDeductibles(plan) {
	// Given a plan's configuration, returns a description of the deductibles suitable for display in the plan provisions table.

	let sd = _strings.deductibles, pd = plan.personDeductibles, fd = plan.familyDeductibles, result = null;

	// Reject any deductible objects containing objects with keys other than "general".
	// These are considered atypical and will require a manual description override.
	let pdKeys = isNullOrUndefined(pd) ? [] : Object.keys(pd), fdKeys = isNullOrUndefined(fd) ? [] : Object.keys(fd);
	if (pdKeys.length > 0 && pdKeys[0] !== "general") { return null; }
	if (fdKeys.length > 0 && fdKeys[0] !== "general") { return null; }
	if (pdKeys.length > 1 || fdKeys.length > 1) { return null; }

	let individualAmount, familyAmount;
	if (_isSimpleZeroDeductible(pd) && _isSimpleZeroDeductible(fd)) {
		// Case where there are both personal and family deductible objects, but they are simple zero amounts.
		result = sd.none;
	} else if (isNullOrUndefined(pd) && fd) {
		// Case where there is only a family deductible object.
		if (_isSimpleDeductible(fd) && !_isSimpleZeroDeductible(fd)) {
			// Case where the family deductible object just contains a simple amount.
			familyAmount = fd.general.amount;
			result = strFmt(sd.familyOnlySimpleFormat, _dollars(familyAmount));
		} else if (_deductibleHasAmountMap(fd) && _amountMapHasTypicalFormat(fd.general.amountMap)) {
			// Typical case where the family deductible object contains an amount map.
			// Atypical case is handled, while atypical cases will require overriding description.
			individualAmount = fd.general.amountMap.employeeOnly;
			familyAmount = _getTypicalAmountMapNonEEOnlyAmount(fd.general.amountMap);
			result = strFmt(sd.familyOnlyFormat, _dollars(individualAmount), _dollars(familyAmount));
		}
	} else if (pd && fd) {
		// Case where there are both personal and family deductible objects.
		if (_isSimpleDeductible(pd) && _isSimpleDeductible(fd)) {
			// Expected typical case where both have simple amounts.
			individualAmount = pd.general.amount;
			familyAmount = fd.general.amount;
			result = strFmt(sd.dualFormat, _dollars(individualAmount), _dollars(familyAmount));
		}
	}

	// If result is still null here, it is because the combination/structure of the personal and family deductible
	// objects is considered atypical. There is no automatic translation, and an overriding description is required.
	return result;
};

appText.planServiceCoverage = function planServiceCoverage(c) {
	// Given a plan's service coverage object, returns a description suitable for display in the plan provisions table.

	let sc = _strings.coverage, empty = "";

	// Special case coverage for if plan coverage is an array or else contains an unsupported property.
	if (Array.isArray(c)) {
		if (c.length !== 1) { return null; } // client implementation will need to provide a description instead.
		c = c[0]; // ... but can handle length 1 array as if were a plain coverage object.
	}
	let unsupportedProperties = Object.keys(c).filter(function filter(x) { return !_supportedCoverageProperties.has(x); });
	if (unsupportedProperties.length > 0) { return null; }
	// Special case for no coverage.
	if (c.notCovered) { return sc.notCovered; }
	// Special case for full coverage.
	let hasCopay = ("copay" in c), hasCoins = ("coinsurance" in c), deductible = ("deductible" in c) ? c.deductible : "default";
	if (hasCopay && !hasCoins && c.copay === 0 && deductible === "none") { return sc.fullyCovered; }

	let copayPart = hasCopay ? strFmt(sc.copayFormat, sc.copayPrefix, _dollars(c.copay), (c.copay > 0 ? sc.copaySuffix : sc.zeroCopaySuffix)) : empty;
	let hasCoinsMin = ("coinsuranceMinDollar" in c), hasCoinsMax = ("coinsuranceMaxDollar" in c), minMaxPart = empty;
	if (hasCoinsMin || hasCoinsMax) {
		minMaxPart = strFmt(sc.coinsuranceMinMaxPartFormat,
			hasCoinsMin ? sc.coinsuranceMinPrefix : empty,
			hasCoinsMin ? _dollars(c.coinsuranceMinDollar) : empty,
			hasCoinsMin && hasCoinsMax ? sc.coinsuranceSeparator : empty,
			hasCoinsMax ? sc.coinsuranceMaxPrefix : empty,
			hasCoinsMax ? _dollars(c.coinsuranceMaxDollar) : empty);
	}
	let hasSingleUseCostMax = ("singleUseCostMax" in c), singleUseCostMaxPart = empty;
	if (hasSingleUseCostMax) {
		singleUseCostMaxPart = strFmt(sc.singleUseCostMaxFormat, _dollars(c.singleUseCostMax));
	}

	let coinsurancePart = hasCoins ?
		strFmt(sc.coinsuranceFormat, sc.coinsurancePrefix, c.coinsurance * 100, sc.coinsuranceSuffix, minMaxPart) : empty;
	let coveredCountPart = ("coveredCount" in c) ? strFmt(sc.coveredCountFormat, c.coveredCount) : empty;

	let fmt, result;
	if (hasCopay && hasCoins) {
		fmt = deductible === "none" ? sc.deductibleNoneDualFormat :
			(deductible === "beforeCopay" ? sc.deductibleBeforeCopayDualFormat : sc.deductibleBeforeCoinsuranceDualFormat);
		result = strFmt(fmt, copayPart, coinsurancePart);
	} else if (hasCopay) {
		fmt = deductible === "none" ? sc.deductibleNoneCopayFormat :
			(deductible === "beforeCopay" ? sc.deductibleBeforeCopayFormat : sc.deductibleAfterCopayFormat);
		result = strFmt(fmt, copayPart);
	} else if (hasCoins) {
		fmt = deductible === "none" ? sc.deductibleNoneCoinsuranceFormat : sc.deductibleBeforeCoinsuranceFormat;
		result = strFmt(fmt, coinsurancePart);
	}
	result += singleUseCostMaxPart;
	result += coveredCountPart;
	return result;
};

_trace("module() returning");
return appText;
});
