//-------------------------------------------------------------------------------------------------
// clientCustom.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// This is where client-specific logic should go. The application provides a variety of callbacks
// that can be overridden here. The callbacks have a default implementation in appDefault.js, but
// generally, a callback specified in this file will be called instead of an appDefault version.
//

/* eslint-disable no-unused-vars */
define(["jquery", "trace", "utility", "appDefault", "fsaeConfig", "fsaeEngine"],
function module($, trace, utility, appDefault, fsaeConfig, fsaeEngine) {
"use strict";

let clientCustom = {}, _trace = trace.categoryWriteLineMaker("clientCustom"), strFmt = utility.stringFormat, formatDollar = utility.formatDollar,
	isNullOrUndefined = utility.isNullOrUndefined, getDescription = utility.getDescription, appCharts, appData, appDispatch, appEngine, appStage,
	appTaxChart, appWizard, $body = $("body");

clientCustom.releaseNumber = 1; // Client-specific release number. Increment every time you deploy.
clientCustom.releaseYear = 2023; // Client-specific year. Should reflect year of deployment.

clientCustom.onCoreModuleDidInitialize = function onCoreModuleDidInitialize(moduleName, obj) {
	_trace("onCoreModuleDidInitialize: {0}", moduleName);

	// IMPORTANT: Store references to the core modules that we will require later.
	switch (moduleName) {
		case "appCharts": appCharts = obj; break;
		case "appData": appData = obj; break;
		case "appDispatch": appDispatch = obj; break;
		case "appEngine": appEngine = obj; break;
		case "appStage": appStage = obj; break;
		case "appTaxChart": appTaxChart = obj; break;
		case "appWizard": appWizard = obj; break;
		default: break;
	}
};
/* eslint-enable no-unused-vars */

clientCustom.onAppCoreDidInitialize = function onAppCoreDidInitialize(startingWithWizard, scenarioLoaded) {
	_trace("onAppCoreDidInitialize: startingWithWizard: {0}, scenarioLoaded: {1}", startingWithWizard, scenarioLoaded);

	// Example: Perhaps apply new defaults from SSO user profile data within a site deployed with SSO.
	// if (!scenarioLoaded) { clientCustom.maybeApplySsoProfileDataDefaults(); }

	// Example: Perhaps apply new defaults from query string parameters.
	// if (!scenarioLoaded) { clientCustom.maybeApplyQueryStringDefaults(); } // see commented-out method below

	// Example: Perhaps apply new defaults from the tool_setup cookie.
	// if (!scenarioLoaded) { clientCustom.maybeApplyCookieDefaults("tool_setup"); } // see commented-out method below
};

/* =======================================================================================================================================
clientCustom.maybeApplySsoProfileDataDefaults = function maybeApplySsoProfileDataDefaults() {
	_trace("maybeApplySsoProfileDataDefaults");

	let profileData = appDefault.getSsoProfileData();
	if (profileData) {
		// ... use the data here to populate dropdowns, adjust content, etc.
	}
};

clientCustom.maybeApplyQueryStringDefaults = function maybeApplyQueryStringDefaults() {
	_trace("maybeApplyQueryStringDefaults");

	// Example: If there is a "groupCode" query string parameter, and its value matches "G1" or "G2",
	// then change the default subconfig dropdown value accordingly.

	let params = utility.parseQueryStringToObject(window.location.search), groupCode;
	groupCode = params.groupCode ? params.groupCode.toUpperCase() : "";
	if (groupCode === "G1") {
		$("#subconfigDropdown").val("group1").trigger("change");
	} else if (groupCode === "G2") {
		$("#subconfigDropdown").val("group2").trigger("change");
	}
};

clientCustom.maybeApplyCookieDefaults = function maybeApplyCookieDefaults(cookieName) {
	_trace("maybeApplyCookieDefaults: cookieName: {0}", cookieName);

	// Example: Pull out a handful of values from the named cookie, including potentially
	// a user name, location value, and status value, and map to configured values.

	let cookieValue = utility.getCookie(cookieName), cookieClean, cookieArray, cookieUserName = null,
		cookieLocation = null, cookieStatus = null, escapedUserName;
	_trace("maybeApplyCookieDefaults: cookieName: [{0}], cookieValue: [{1}]", cookieName, cookieValue);

	if (!isNullOrUndefined(cookieValue) && cookieValue.length > 0) {
		cookieClean = decodeURI(cookieValue);
		cookieArray = cookieClean.split("|");
		if (cookieArray.length > 0) { cookieUserName = cookieArray[0]; }
		if (cookieArray.length > 2) { cookieLocation = cookieArray[2]; }
		if (cookieArray.length > 4) { cookieStatus = cookieArray[4]; }

		// Example of displaying personalized greeting text above the Step 1 panel.
		if (cookieUserName && cookieUserName.length > 0) {
			escapedUserName = $("<div></div>").text(cookieUserName).html(); // just in case there are special characters
			$("#greeting").html(strFmt("<p>Welcome, {0}.</p>", escapedUserName)).show().addClass("personalized");
		}

		// Example mapping the six distinct PT/FT1-5 values from cookieStatus into the config dropdown. If the
		// cookie value is "PT", then the config dropdown is set to "Group 2" and hidden. If the cookie value
		// starts with "FT" (e.g. "FT1" through "FT5"), then the config dropdown is set to "Group 1" and hidden.
		if (cookieStatus && cookieStatus.length > 0) {
			if (cookieStatus === "PT") {
				$("#subconfigDropdown").val("group2").trigger("change");
				$("div.dropdownDiv.subconfigDropdown").addClass("notInUse"); // hides and won't be undone by displayWhen() logic
			} else if (cookieStatus.startsWith("FT")) {
				$("#subconfigDropdown").val("group1").trigger("change");
				$("div.dropdownDiv.subconfigDropdown").addClass("notInUse"); // ditto
			}
		}

		// Example mapping the multiple values for the cookieLocation into "UT", and anything else to "ALL_OTHER_LOCATIONS".
		if (cookieLocation && cookieLocation.length > 0) {
			if (cookieLocation === "UT") {
				$("#regionDropdown").val("UT").trigger("change");
			} else {
				$("#regionDropdown").val("ALL_OTHER_LOCATIONS").trigger("change");
			}
		}
	}
};
======================================================================================================================================= */

clientCustom.onAppNeedsPremiumAdjForPlan = function onAppNeedsPremiumAdjForPlan(planId) {
	let config = appEngine.configuration;
	let result = { employee: 0, employer: 0, employeeNamedAmounts: {}, employerNamedAmounts: {} };

	if ("wellnessPremiumIncentives" in config.adjustments) {
		// Maybe include adjustment from wellnessPremiumIncentives based on value of appData.custom.wellnessAnswer.
		// For wellness, employer premiums are offset by an opposite amount, so overall premiums paid remains constant.
		// (Notice that this same dropdown answer also drives a company fund amount adjustment, further below.)
		let wellnessAmount = appDefault.lookUpCustomAdjustmentAmount("wellnessPremiumIncentives", appData.custom["wellnessAnswer"], planId);
		result.employeeNamedAmounts.wellnessPremiumIncentives = wellnessAmount;
		result.employerNamedAmounts.wellnessPremiumIncentives = -wellnessAmount;
		result.employee += wellnessAmount;
		result.employer -= wellnessAmount;
	}

	if ("tobaccoSurcharges" in config.adjustments) {
		// Maybe adjust premiums via tobaccoSurcharges config based on value of appData.custom.tobaccoSurchargeAnswer.
		// For tobacco, employer premiums are not offset by an opposite amount; i.e. overall premiums can increase.
		let tobaccoSurchargeAmount = appDefault.lookUpCustomAdjustmentAmount("tobaccoSurcharges", appData.custom["tobaccoSurchargeAnswer"], planId);
		result.employeeNamedAmounts.tobaccoSurcharges = tobaccoSurchargeAmount;
		result.employee += tobaccoSurchargeAmount;
	}

	if ("spouseSurcharges" in config.adjustments) {
		// Maybe adjust premiums via spouseSurcharges config based on value of appData.custom.spouseSurchargeAnswer.
		// For spouse surcharge, employer premiums are not offset by an opposite amount; i.e. overall premiums can increase.
		let spouseSurchargeAmount = appDefault.lookUpCustomAdjustmentAmount("spouseSurcharges", appData.custom["spouseSurchargeAnswer"], planId);
		result.employeeNamedAmounts.spouseSurcharges = spouseSurchargeAmount;
		result.employee += spouseSurchargeAmount;
	}

	_trace("onAppNeedsPremiumAdjForPlan for {0}: { employee: {1}, employer: {2}, namedAmounts... }", planId, result.employee, result.employer);
	return result;
};

clientCustom.onAppNeedsFundAmountAdjForPlan = function onAppNeedsFundAmountAdjForPlan(planId) {
	let config = appEngine.configuration, result = 0;

	if ("wellnessFundIncentives" in config.adjustments) {
		// Maybe adjust company fund amount via wellnessFundIncentives config based on value of appData.custom.wellnessAnswer.
		// Note that company fund amount adjustments are distinct from company matching funds; matching funds arise only as a
		// consequence of employee contributions, while these adjustments can arise e.g. from wellness incentives.
		result += appDefault.lookUpCustomAdjustmentAmount("wellnessFundIncentives", appData.custom["wellnessAnswer"], planId);
	}

	_trace("onAppNeedsFundAmountAdjForPlan for planId {0} result: {1}", planId, result);
	return result;
};

/* =======================================================================================================================================
clientCustom.onAppNeedsCustomResultsForPlan = function onAppNeedsCustomResultsForPlan(planResult, resultsVariant) {
	_trace("onAppNeedsCustomResultsForPlan: planResult.planId: {0} for resultsVariant: {1}", planResult.planId, resultsVariant);

	let r = planResult; // short alias

	// Examples of adding custom values for output to the results tables. The app core would populate corresponding rows.
	// A corresponding row would have a CSS class matching the key of the added result. e.g. if adding a result such as
	// planResult.sampleCustomResultName, include a table row such as <tr class="sampleCustomResultName">...</tr>.

	// Example #1: Converting annual plan premiums and voluntary fund contribution amounts to amounts per pay period.
	// r.totalWeeklyPayrollContributions = Math.round(r.totalAnnualPayrollContributions / 52);
	// r.totalMonthlyPayrollContributions = Math.round(r.totalAnnualPayrollContributions / 12);
	// r.monthlyVoluntaryFundContributionAmount = Math.round(r.voluntaryFundContributionAmount / 12);
	// r.monthlyTotalPayrollDeduction = r.totalMonthlyPayrollContributions + r.monthlyVoluntaryFundContributionAmount;

	// Example #2: Showing base company funding amount and wellness funding credits separately.
	// planResult.companyFundingExcludingWellness = planResult.planFundAmount - planResult.planFundAdjustmentAmount;
	// planResult.wellnessFundingCredits = planResult.planFundAdjustmentAmount;

	// Example #3: Determining a "wellness cash back" incentive (e.g. if premium reductions exceed premiums) for a single plan.
	// planResult.wellnessCashBack = null; // using null as default result for non-matching plans yields cells classed "noValue".
	// if (planResult.planId === "SAMPLE_HSA1") {
	// 		planResult.wellnessCashBack = 0;
	// 	if (planResult.totalAnnualPayrollContributionsMaybeNegative < 0) {
	// 		planResult.wellnessCashBack = -planResult.totalAnnualPayrollContributionsMaybeNegative;
	// 	}
	// }
};
======================================================================================================================================= */

//===========================================================================================
//		Events for items in mainConfig.personalFormItems
//===========================================================================================

// (None required, currently.)

//===========================================================================================
//		Events specific to the wizard guided Q&A feature
//===========================================================================================

// (None required, currently.)

// There are many additional callbacks that clientCustom could override if needed. Refer to
// appDefault.js for their proper definitions. You can copy & paste from appDefault to here,
// but be sure to have clientCustom's defined as clientCustom.___ and not appDefault.___.

return clientCustom;
});
