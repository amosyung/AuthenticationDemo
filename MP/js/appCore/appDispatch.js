//-------------------------------------------------------------------------------------------------
// appDispatch.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Provides methods permitting the rest of the application to easily invoke callbacks that may
// be present either on appDefault or clientCustom.
//

define(["trace", "appDefault", "clientCustom", "appAnalytics"],
/**
 * @param {object} trace
 * @param {AppDefault} appDefault
 * @param {object} clientCustom
 * @param {AppAnalytics} appAnalytics
 * @returns {object}
 */
function module(trace, appDefault, clientCustom, appAnalytics) {
"use strict";

/**
 * @name AppDispatch
 * @type {{
 *   initializeAsync: Function
 *   customCallbackHelper: Function
 *   showError: Function
 *   onAppCoreWillValidateMainConfig: Function
 *   onAppCoreDidValidateMainConfig: Function
 *   onAppCoreWillInitialize: Function
 *   onCoreModuleWillInitialize: Function
 *   onCoreModuleDidInitialize: Function
 *   onCoreModuleFailedToInitialize: Function
 *   onAppCoreDidInitialize: Function
 *   onAppWillDisplayUserAgreement: Function
 *   onAppDidDisplayUserAgreement: Function
 *   onUserAcceptedUserAgreement: Function
 *   onUserRejectedUserAgreement: Function
 *   onAppWillLoadConfig: Function
 *   onAppDidLoadConfig: Function
 *   onAppFailedToLoadConfig: Function
 *   onAppWillCompileConfig: Function
 *   onAppDidCompileConfig: Function
 *   onAppWillUpdateInterfaceForNewConfig: Function
 *   onAppDidUpdateInterfaceForNewConfig: Function
 *   onAppDidDisplayHelpModal: Function
 *   onAppDidChangeDynamicItem: Function
 *   onAppWillSwitchToTaxView: Function
 *   onAppDidSwitchToTaxView: Function
 *   onAppWillSwitchToMpceView: Function
 *   onAppDidSwitchToMpceView: Function
 *   onEngineWillRunMpceCalculation: Function
 *   onAppNeedsPremiumAdjForPlan: Function
 *   onAppNeedsFundAmountAdjForPlan: Function
 *   onAppNeedsCarryoverAmountForPlan: Function
 *   onAppNeedsSavingsContAndMatchForPlan: Function
 *   onAppNeedsHsaContAndMatchForPlan: Function
 *   onAppNeedsFsaContAndMatchForPlan: Function
 *   onAppNeedsHsaSliderMinimum: Function
 *   onAppNeedsHsaSliderMaximum: Function
 *   onAppNeedsFsaSliderMinimum: Function
 *   onAppNeedsFsaSliderMaximum: Function
 *   onEngineDidRunMpceCalculation: Function
 *   updateResultOutputs: Function
 *   onAppNeedsCustomResultsForPlan: Function
 *   onAppWillUpdateResultsTablesForPlan: Function
 *   onAppCanMakePlanRecommendation: Function
 *   onMpceChartWillUpdate: Function
 *   onMpceChartDidUpdate: Function
 *   onMpceChartNeedsTooltipHtml: Function
 *   onMpceChartNeedsOutOfPocketCostsDetailHtml: Function
 *   onMpceChartNeedsAnnualEmployeePremiumsDetailHtml: Function
 *   onMpceChartNeedsAnnualEmployerPremiumsDetailHtml: Function
 *   onMpceChartNeedsWorstCaseCostsDetailHtml: Function
 *   onMpceChartPlanColumnClicked: Function
 *   onEngineWillRunFsaeCalculation: Function
 *   onEngineDidRunFsaeCalculation: Function
 *   onFsaeChartWillUpdate: Function
 *   onFsaeChartDidUpdate: Function
 *   onFsaeChartNeedsTooltipHtml: Function
 *   onAppWillSwitchModelingMode: Function
 *   onAppDidSwitchModelingMode: Function
 *   onAppDidSwitchToSimplifiedModeling: Function
 *   onAppDidSwitchToDetailedModeling: Function
 *   onAppWillSwitchTaxViewAccountType: Function
 *   onAppDidSwitchTaxViewAccountType: Function
 *   onUserWindowResizeDidBegin: Function
 *   onUserWindowResizeDidFinish: Function
 *   onUserChangedSimplifiedModelingUsageCategoryOption: Function
 *   onUserChangedDetailedModelingUsageCategoryOption: Function
 *   onUserChangedDetailedModelingServiceCount: Function
 *   onUserDidPrintResults: Function
 *   onUserDidSaveScenario: Function
 *   onUserProvidedSimpleFeedback: Function
 *   onAppDidLoadWithScenario: Function
 *   onAppDidStartWithWizard: Function
 *   onAppDidStartWithFullTool: Function
 *   updateContentForSpecificSubconfig: Function
 *   updateContentForSpecificCoverageLevel: Function
 *   updateContentForSpecificRegion: Function
 *   updateContentForSpecificStatus: Function
 *   updateContentForSpecificPlanPriority: Function
 *   updateContentForSpecificApplyFundsOption: Function
 *   updateContentForOtherDropdownAnswer: Function
 *   onWizardWillProcessConfig: Function
 *   onWizardDidProcessConfig: Function
 *   onWizardWillRenderUI: Function
 *   onWizardDidRenderUI: Function
 *   onWizardWillChangeSlides: Function
 *   onWizardWillHideSummary: Function
 *   onWizardWillShowSummary: Function
 *   onWizardWillUpdateSummary: Function
 *   onWizardDidUpdateSummary: Function
 *   onWizardDidChangeSlides: Function
 *   onWizardWillStart: Function
 *   onWizardDidStart: Function
 *   onWizardWillSwitchToFullTool: Function
 *   onWizardDidSwitchToFullTool: Function
 *   onWizardWillSwitchToWizard: Function
 *   onWizardDidSwitchToWizard: Function
 *   onWizardUserSelectedAnswer: Function
 *   onWizardUserReachedLastSlide: Function
 * }}
 */
let appDispatch = {};
let _trace = trace.categoryWriteLineMaker("appDispatch");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appDispatch"); } }; tick();

let _predefinedCallbackMethodNames, cch, analyticsEnabled = null;

appDispatch.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			analyticsEnabled = appAnalytics.isEnabled();

			resolve();
		}, params.delayMsec || 0);
	});
};

appDispatch.customCallbackHelper = cch = function customCallbackHelper(methodName, argsArray, callBoth) {
	// Callback helper. If the method specified by methodName exists on clientCustom, calls
	// it, passing the argsArray arguments via apply(), and returning the value returned by the
	// callback. If the method specified by methodName does not exist on clientCustom, tries
	// instead to call the same method on appDefault. Failing that, returns undefined if no
	// args were passed, or the first arg if some were passed. This pattern permits us to have
	// client-specific code that handles some but not all events without always having to
	// test for the existence or location of each callback at the call site. If callBoth is
	// true, calls both the appDefault and the clientCustom versions, but returns only the
	// result from the clientCustom version, unless appDefault was the only version.

	let result, handled = false;

	// First, if appAnalytics has a matching method name, call it.
	if (analyticsEnabled) {
		if ((methodName in appAnalytics) && typeof appAnalytics[methodName] === "function") {
			// No return value expected. Analytics should not do anything except track events.
			appAnalytics[methodName].apply(null, argsArray);
		}
	}

	// Next, perform normal dispatch to appDefault and/or clientCustom.
	if (callBoth && (methodName in appDefault) && typeof appDefault[methodName] === "function") {
		_trace("{0}() forwarding to appDefault first (callBoth case)", methodName);
		result = appDefault[methodName].apply(null, argsArray);
		handled = true;
	}
	if ((methodName in clientCustom) && typeof clientCustom[methodName] === "function") {
		_trace("{0}() forwarding to clientCustom", methodName);
		result = clientCustom[methodName].apply(null, argsArray);
		handled = true;
	}
	if (!handled && (methodName in appDefault) && typeof appDefault[methodName] === "function") {
		_trace("{0}() forwarding to appDefault", methodName);
		result = appDefault[methodName].apply(null, argsArray);
		handled = true;
	}
	if (!handled) {
		_trace("{0}() not forwarding; no impl in clientCustom or appDefault; returning default.", methodName);
		if (argsArray.length > 0) { result = argsArray[0]; }
	}
	return result;
};

// Make all the pre-defined callback methods. Note that additional callbacks configured
// in mainConfig can be present on appDefault or clientCustom and will be invoked via
// appDispatch.customCallbackHelper() directly.

_predefinedCallbackMethodNames = [
	// (these are roughly in the same order as they appear in appDefault.js)
	"showError",
	"onAppCoreWillValidateMainConfig",
	"onAppCoreDidValidateMainConfig",
	"onAppCoreWillInitialize", // see note below
	"onCoreModuleWillInitialize", // ditto
	"onCoreModuleDidInitialize", // ditto
	"onCoreModuleFailedToInitialize", // ditto
	"onAppCoreDidInitialize", // ditto
	"onAppWillDisplayUserAgreement",
	"onAppDidDisplayUserAgreement",
	"onUserAcceptedUserAgreement",
	"onUserRejectedUserAgreement",
	"onAppWillLoadConfig",
	"onAppDidLoadConfig",
	"onAppFailedToLoadConfig",
	"onAppWillCompileConfig",
	"onAppDidCompileConfig",
	"onAppWillUpdateInterfaceForNewConfig",
	"onAppDidUpdateInterfaceForNewConfig",
	"onAppDidDisplayHelpModal",
	"onAppDidChangeDynamicItem",
	"onAppWillSwitchToTaxView",
	"onAppDidSwitchToTaxView",
	"onAppWillSwitchToMpceView",
	"onAppDidSwitchToMpceView",
	"onEngineWillRunMpceCalculation",
	"onAppNeedsPremiumAdjForPlan",
	"onAppNeedsFundAmountAdjForPlan",
	"onAppNeedsCarryoverAmountForPlan",
	"onAppNeedsSavingsContAndMatchForPlan",
	"onAppNeedsHsaContAndMatchForPlan",
	"onAppNeedsFsaContAndMatchForPlan",
	"onAppNeedsHsaSliderMinimum",
	"onAppNeedsHsaSliderMaximum",
	"onAppNeedsFsaSliderMinimum",
	"onAppNeedsFsaSliderMaximum",
	"onEngineDidRunMpceCalculation",
	"updateResultOutputs",
	"onAppNeedsCustomResultsForPlan",
	"onAppWillUpdateResultsTablesForPlan",
	"onAppCanMakePlanRecommendation",
	"onMpceChartWillUpdate",
	"onMpceChartDidUpdate",
	"onMpceChartNeedsTooltipHtml",
	"onMpceChartNeedsOutOfPocketCostsDetailHtml",
	"onMpceChartNeedsAnnualEmployeePremiumsDetailHtml",
	"onMpceChartNeedsAnnualEmployerPremiumsDetailHtml",
	"onMpceChartNeedsWorstCaseCostsDetailHtml",
	"onMpceChartPlanColumnClicked",
	"onEngineWillRunFsaeCalculation",
	"onEngineDidRunFsaeCalculation",
	"onFsaeChartWillUpdate",
	"onFsaeChartDidUpdate",
	"onFsaeChartNeedsTooltipHtml",
	"onAppWillSwitchModelingMode",
	"onAppDidSwitchModelingMode",
	"onAppDidSwitchToSimplifiedModeling",
	"onAppDidSwitchToDetailedModeling",
	"onAppWillSwitchTaxViewAccountType",
	"onAppDidSwitchTaxViewAccountType",
	"onUserWindowResizeDidBegin",
	"onUserWindowResizeDidFinish",
	"onUserChangedSimplifiedModelingUsageCategoryOption",
	"onUserChangedDetailedModelingUsageCategoryOption",
	"onUserChangedDetailedModelingServiceCount",
	"onUserDidPrintResults",
	"onUserDidSaveScenario",
	"onUserProvidedSimpleFeedback",
	"onAppDidLoadWithScenario",
	"onAppDidStartWithFullTool",
	"onAppDidStartWithWizard",
	"updateContentForSpecificSubconfig",
	"updateContentForSpecificCoverageLevel",
	"updateContentForSpecificRegion",
	"updateContentForSpecificStatus",
	"updateContentForSpecificPlanPriority",
	"updateContentForSpecificApplyFundsOption",
	"updateContentForOtherDropdownAnswer",
	// Wizard-specific:
	"onWizardWillProcessConfig",
	"onWizardDidProcessConfig",
	"onWizardWillRenderUI",
	"onWizardDidRenderUI",
	"onWizardWillChangeSlides",
	"onWizardWillHideSummary",
	"onWizardWillShowSummary",
	"onWizardWillUpdateSummary",
	"onWizardDidUpdateSummary",
	"onWizardDidChangeSlides",
	"onWizardWillStart",
	"onWizardDidStart",
	"onWizardWillSwitchToFullTool",
	"onWizardDidSwitchToFullTool",
	"onWizardWillSwitchToWizard",
	"onWizardDidSwitchToWizard",
	"onWizardUserSelectedAnswer",
	"onWizardUserReachedLastSlide"
];

_predefinedCallbackMethodNames.forEach(function each(callbackMethodName) {
	appDispatch[callbackMethodName] = function dispatcher() { return cch(callbackMethodName, Array.prototype.slice.call(arguments)); };
});

// Special: Override the ___Initialize() methods to call BOTH implementations (if present),
// because each may need to store references to core modules and run initialization code.
// We don't give clientCustom the chance to bypass appDefault's implementations of these.

appDispatch.onAppCoreWillInitialize = function onAppCoreWillInitialize() {
	return cch("onAppCoreWillInitialize", Array.prototype.slice.call(arguments), true); // callBoth = true
};

appDispatch.onCoreModuleWillInitialize = function onCoreModuleWillInitialize() {
	return cch("onCoreModuleWillInitialize", Array.prototype.slice.call(arguments), true); // callBoth = true
};

appDispatch.onCoreModuleDidInitialize = function onCoreModuleDidInitialize() {
	return cch("onCoreModuleDidInitialize", Array.prototype.slice.call(arguments), true); // callBoth = true
};

appDispatch.onCoreModuleFailedToInitialize = function onCoreModuleFailedToInitialize() {
	return cch("onCoreModuleFailedToInitialize", Array.prototype.slice.call(arguments), true); // callBoth = true
};

appDispatch.onAppCoreDidInitialize = function onAppCoreDidInitialize() {
	return cch("onAppCoreDidInitialize", Array.prototype.slice.call(arguments), true); // callBoth = true
};

_trace("module() returning");
return appDispatch;
});
