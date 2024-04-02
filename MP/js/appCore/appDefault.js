//-------------------------------------------------------------------------------------------------
// appDefault.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Provides default/base app functionality that may be overridden by a matching callback in
// clientCustom.js. DO NOT MODIFY THIS FILE DIRECTLY! If you want to override a callback whose
// implementation is in this file, simply define a matching function name on the clientCustom
// module and put your replacement logic there. The appDispatch module used by the app core will
// ensure that if you have defined a version of a callback in clientCustom, then _that_ one gets
// called over any version defined here. If you need to, your clientCustom version of a callback
// can call into methods in this file.
//

define(["jquery", "bootstrap", "trace", "utility", "appAnalytics", "fsaeConfig", "mpceEngine", "fsaeEngine"],
/**
 * @param {object} $
 * @param {object} bootstrap
 * @param {object} trace
 * @param {object} utility
 * @param {AppAnalytics} appAnalytics
 * @param {FsaeConfig} fsaeConfig
 * @param {object} mpceEngine
 * @param {object} fsaeEngine
 * @returns {object}
 */
function module($, bootstrap, trace, utility, appAnalytics, fsaeConfig, mpceEngine, fsaeEngine) {
"use strict";

/**
 * @name AppDefault
 * @type {{
 *   initializeAsync: Function
 *   showError: Function
 *   onAppCoreWillValidateMainConfig: Function
 *   onAppCoreDidValidateMainConfig: Function
 *   safeGetTemplateElement: Function
 *   safeGetTooltipTemplateElement: Function
 *   onAppCoreWillInitialize: Function
 *   onCoreModuleWillInitialize: Function
 *   onCoreModuleDidInitialize: Function
 *   onCoreModuleFailedToInitialize: Function
 *   maybeFetchDataBeforeFinishAppInit: Function
 *   getSsoProfileData: Function
 *   onAppCoreDidInitialize: Function
 *   onAppWillDisplayUserAgreement: Function
 *   onAppDidDisplayUserAgreement: Function
 *   onUserAcceptedUserAgreement: Function
 *   onUserRejectedUserAgreement: Function
 *   changeSubconfig: Function
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
 *   lookUpCustomAdjustmentAmount: Function
 *   lookUpPremiumAdjustment: Function
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
 *   onMpceChartNeedsAnnualPremiumsDetailHtmlImpl: Function
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
 *   updateContentForSpecificInputs: Function
 *   updateContentForSpecificSubconfig: Function
 *   updateContentForSpecificCoverageLevel: Function
 *   updateContentForSpecificRegion: Function
 *   updateContentForSpecificStatus: Function
 *   updateContentForSpecificPlanPriority: Function
 *   updateContentForSpecificApplyFundsOption: Function
 *   updateContentForOtherDropdownAnswer: Function
 *   onSubconfigDropdownChanged: Function
 *   onPartnerStatusDropdownChanged: Function
 *   onNumberOfChildrenDropdownChanged: Function
 *   onRegionDropdownChanged: Function
 *   onStatusDropdownChanged: Function
 *   onPlanPriorityChanged: Function
 *   onApplyFundsDropdownChanged: Function
 *   onOtherDropdownChanged: Function
 *   onPrimaryAnnualIncomeSliderChanged: Function
 *   onSpouseAnnualIncomeSliderChanged: Function
 *   onHsaEligibleExpensesSliderChanged: Function
 *   onVisionExpensesSliderChanged: Function
 *   onDentalExpensesSliderChanged: Function
 *   onOtherExpensesSliderChanged: Function
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
 *   setUpMpceEngineDevUI: Function
 * }}
 */
let appDefault = {};
let _trace = trace.categoryWriteLineMaker("appDefault");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appDefault"); } }; tick();

let appCharts, appTaxChart, appData, appDispatch, appEngine, appStage, appWizard, $head = $("head"), $body = $("body"), cachedSsoProfileData,
	getText, $mainChartTooltip, $oopCostsDetails, $employeePremiumsDetails, $employerPremiumsDetails, $taxChartTooltip,
	regExpMatchHtmlLineBreaks = /<br *\/?>/gim, regexMatchWhitespace = /\s+/, wasInWizardBeforeTaxView = false, mpceEngineDevUI = false,
	$mpceTraceOutput;

let strFmt = utility.stringFormat, isNullOrUndefined = utility.isNullOrUndefined, formatDollar = utility.formatDollar,
	getDescription = utility.getDescription;

appDefault.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			$mainChartTooltip = appDefault.safeGetTooltipTemplateElement("mainChartTooltip");
			$oopCostsDetails = appDefault.safeGetTemplateElement("oopCostsDetails");
			$employeePremiumsDetails = appDefault.safeGetTemplateElement("employeePremiumsDetails");
			$employerPremiumsDetails = appDefault.safeGetTemplateElement("employerPremiumsDetails");
			$taxChartTooltip = appDefault.safeGetTooltipTemplateElement("taxChartTooltip");

			resolve();
		}, params.delayMsec || 0);
	});
};

appDefault.showError = function showError(detail) {
	_trace("showError: {0}", detail);
	$body.find("#loadingToolSection").addClass("hiddenNotApplicable");
	$body.find("#error").removeClass("hiddenNotApplicable");
	if (typeof detail === "string" && detail.length > 0) {
		$body.find("#errorDetail").text(detail).removeClass("hiddenNotApplicable");
	} else {
		$body.find("#errorDetail").text(JSON.stringify(detail, null, 2)).removeClass("hiddenNotApplicable");
	}
	if (cachedSsoProfileData && ("errorDetail" in cachedSsoProfileData)) {
		let additionalDetail = cachedSsoProfileData.errorDetail;
		if (typeof additionalDetail === "string" && additionalDetail.length > 0) {
			$body.find("#additionalErrorDetail").text(additionalDetail).removeClass("hiddenNotApplicable");
		} else {
			$body.find("#additionalErrorDetail").text("\n\n" + JSON.stringify(additionalDetail, null, 2)).removeClass("hiddenNotApplicable");
		}
	}
	$body.find("#topMenu, #toolIntroSection, #personalSection, #adjustSection, #prioritiesSection, #mpceSection, " +
		"#taxIntroSection, #feedbackSection, #taxCalcSection, #wizardSection").addClass("hiddenNotApplicable");
};

// eslint-disable-next-line no-unused-vars
appDefault.onAppCoreWillValidateMainConfig = function onAppCoreWillValidateMainConfig(mainConfig) {
	// If present, onAppCoreWillValidateMainConfig() is called before the mainConfig object is validated.
	// NOTE: Currently, only certain parts of mainConfig are validated; it is not as thorough as either the
	// MPCE engine or FSAE engine config validation.
	_trace("onAppCoreWillValidateMainConfig");
};

// eslint-disable-next-line no-unused-vars
appDefault.onAppCoreDidValidateMainConfig = function onAppCoreDidValidateMainConfig(mainConfig) {
	// If present, onAppCoreDidValidateMainConfig() is called after the mainConfig object has been
	// successfully validated.
	_trace("onAppCoreDidValidateMainConfig");
};

appDefault.safeGetTemplateElement = function safeGetTemplateElement(cssClass, noErrorMessageDiv) {
	let $element = $body.find(".template." + cssClass), result;
	if ($element.length > 0) {
		// A template is defined for the CSS class. Return a clone of it but not having class "template".
		result = $element.first().clone().removeClass("template");
	} else if (!noErrorMessageDiv) {
		result = $(strFmt("<div style='color: red;'>Missing a template with CSS class \"{0}\"</div>", cssClass));
	}
	return result;
};

appDefault.safeGetTooltipTemplateElement = function safeGetTooltipTemplateElement(cssClass) {
	let result = appDefault.safeGetTemplateElement(cssClass, true) ||
		$(strFmt("<div class='{0} chartTooltip'><span class='seriesName'></span>: <span class='value'></span></div>", cssClass));
	return result;
};

appDefault.onAppCoreWillInitialize = function onAppCoreWillInitialize(mainConfig) {
	// If present, onAppCoreWillInitialize() is called before all core app module initialization.
	// This is an opportunity to modify, for instance, mainConfig or its subconfigs before any
	// of the user interface is rendered.
	_trace("onAppCoreWillInitialize");

	getText = utility.getAppStringMaker(mainConfig.appStrings);

	// Set up MPCE engine development UI if enabled.
	if (mainConfig["mpceEngineDevUI"]) {
		mpceEngineDevUI = true;
		appDefault.setUpMpceEngineDevUI();
	}
};

appDefault.onCoreModuleWillInitialize = function onCoreModuleWillInitialize(moduleName) {
	// If present, onCoreModuleWillInitialize() is called by the application just prior to a core
	// module being asked to run its initializeAsync() method. This is an opportunity to modify
	// anything that module might depend on during initialization.
	_trace("onCoreModuleWillInitialize: {0}", moduleName);
};

appDefault.onCoreModuleDidInitialize = function onCoreModuleDidInitialize(moduleName, obj) {
	// If present, onCoreModuleDidInitialize() is called by the application when a core module
	// has finished running its initializeAsync() method. This event provides an opportunity to
	// store a reference to the initialized module avoiding a circular reference problem if
	// we'd instead declared them as dependencies in define() above.
	_trace("onCoreModuleDidInitialize: {0}", moduleName);

	if ("appCharts" === moduleName) {
		appCharts = obj;
	} else if ("appTaxChart" === moduleName) {
		appTaxChart = obj;
	} else if ("appData" === moduleName) {
		appData = obj;
	} else if ("appDispatch" === moduleName) {
		appDispatch = obj;
	} else if ("appEngine" === moduleName) {
		appEngine = obj;
	} else if ("appStage" === moduleName) {
		appStage = obj;
	} else if ("appWizard" === moduleName) {
		appWizard = obj;
	}
};

appDefault.onCoreModuleFailedToInitialize = function onCoreModuleFailedToInitialize(moduleName) {
	_trace("onCoreModuleFailedToInitialize: {0}", moduleName);
	appDefault.showError("The core module '" + moduleName + "' failed to initialize.");
};

appDefault.maybeFetchDataBeforeFinishAppInit = function maybeFetchDataBeforeFinishAppInit(startingWithWizard) {
	// Maybe fetch and apply SSO user profile data before completing initialization.
	if (appData.features.fetchSsoProfileData) {
		_trace("maybeFetchDataBeforeFinishAppInit: Making web request for profile JSON data");
		let url = appData.features.ssoGetProfileDataEndpoint;
		$.ajax({
			url: url,
			success: function success(result, status, xhr) {
				tick();
				if (xhr.getResponseHeader("Content-Type").includes("application/json")) {
					_trace("Received user profile data:\n{0}", JSON.stringify(result, null, 2));
					cachedSsoProfileData = result;
					appDispatch.onAppCoreDidInitialize(startingWithWizard, appData.scenarioLoaded);
				} else {
					appDefault.showError("Unexpected Content-Type: " + xhr.getResponseHeader("Content-Type"));
				}
			},
			error: function onError(xhr, status, error) {
				tick();
				appDefault.showError(
					"Failed to load " + url + ": " + error + " / " + xhr.status + " " + xhr.statusText + ".");
			}
		});
	} else {
		appDispatch.onAppCoreDidInitialize(startingWithWizard, appData.scenarioLoaded);
	}
};

appDefault.getSsoProfileData = function getSsoProfileData() {
	return cachedSsoProfileData;
};

appDefault.onAppCoreDidInitialize = function onAppCoreDidInitialize(startingWithWizard, scenarioLoaded) {
	// If present, onAppCoreDidInitialize() is called after core app modules have all completed their
	// initialization. At this point, the main tool UI should be fully rendered and ready to display.
	// If startingWithWizard is true, this method should do everything except hide/unhide main tool UI,
	// as the wizard will be presenting itself first and it will take care of such when it is ready.
	// scenarioLoaded will be true if a saved scenario was successfully loaded from the query string.
	_trace("onAppCoreDidInitialize: startingWithWizard: {0}, scenarioLoaded: {1}", startingWithWizard, scenarioLoaded);

	if (appData.features.fullToolEnabled) { $body.addClass("fullToolEnabled"); }
	if (appData.features.wizardEnabled) { $body.addClass("wizardEnabled"); }

	appDefault.updateContentForSpecificInputs();
	tick();

	if (!startingWithWizard && !appData.features.deferToolUserInterfaceUnhide) {
		appStage.postAppInitializationUnhiding();
	}
	tick();

	// Maybe display the user agreement modal, if so configured.
	if (appData.features.showUserAgreementOnLaunch) { appStage.displayUserAgreementModal(); }

	if (appWizard) {
		appWizard.begin(startingWithWizard, scenarioLoaded);
	}
	tick();

	appCharts.applicationIsReady();
	if (appData.features.taxCalculatorEnabled) { appTaxChart.applicationIsReady(); }
	tick();

	if (appWizard && startingWithWizard) {
		appDispatch.onAppDidStartWithWizard();
	} else {
		appDispatch.onAppDidStartWithFullTool();
	}
	tick();
};

appDefault.onAppWillDisplayUserAgreement = function onAppWillDisplayUserAgreement() {
	// If present, onAppWillDisplayUserAgreement() is called before the app will display
	// the user agreement (if it is configured to display on launch).
	_trace("onAppWillDisplayUserAgreement");
};

appDefault.onAppDidDisplayUserAgreement = function onAppDidDisplayUserAgreement() {
	// If present, onAppDidDisplayUserAgreement() is called after the app has displayed
	// the user agreement (if it is configured to display on launch).
	_trace("onAppDidDisplayUserAgreement");
};

appDefault.onUserAcceptedUserAgreement = function onUserAcceptedUserAgreement() {
	// If present, onUserAcceptedUserAgreement() is called after the user has accepted
	// the user agreement (if it is configured to display on launch).
	_trace("onUserAcceptedUserAgreement");
};

appDefault.onUserRejectedUserAgreement = function onUserRejectedUserAgreement() {
	// If present, onUserRejectedUserAgreement() is called after the user has rejected
	// the user agreement (if it is configured to display on launch).
	_trace("onUserRejectedUserAgreement");
};

appDefault.changeSubconfig = function changeSubconfig(newSubconfigId) {
	// Users would typically use the subconfig dropdown to directly change the current subconfig. However, in some
	// a custom implementation may need to directly change the subconfig in response to other events or data. This
	// method can be used by clientCustom and will ensure that both appData.personal.subconfig and the subconfig
	// dropdown are updated before calling appEngine.changeSubconfig().
	_trace("changeSubconfig: newSubconfigId: {0}", newSubconfigId);
	appData.personal.subconfig = newSubconfigId;
	$body.find("#subconfigDropdown").val(newSubconfigId);
	appEngine.changeSubconfig(newSubconfigId);
};

appDefault.onAppWillLoadConfig = function onAppWillLoadConfig(subconfigId) {
	// If present, onAppWillLoadConfig() is called by the application just prior to a configuration file being
	// loaded dynamically. Note that this function will NOT be called for configuration files that were already
	// loaded by virtue of having been directly required at the top of mainConfig.
	_trace("onAppWillLoadConfig: subconfigId: {0}", subconfigId);
};

appDefault.onAppDidLoadConfig = function onAppDidLoadConfig(subconfigId, subconfigObject) {
	// If present, onAppDidLoadConfig() is called by the application just after a configuration file was
	// loaded dynamically. Note that this function will NOT be called for configuration files that were already
	// loaded by virtue of having been directly required at the top of mainConfig.
	_trace("onAppDidLoadConfig: subconfigId: {0}, subconfigObject.configId: {1}", subconfigId, subconfigObject.configId);
};

appDefault.onAppFailedToLoadConfig = function onAppFailedToLoadConfig(subconfigId, errorMessage) {
	// If present, onAppFailedToLoadConfig() is called by the application after a configuration file fails
	// to load dynamically, e.g. if the subconfigId did not resolve to a valid script module.
	_trace("onAppFailedToLoadConfig: subconfigId: {0}", subconfigId);
	appDefault.showError(errorMessage);
};

appDefault.onAppWillCompileConfig = function onAppWillCompileConfig(reason, currentSubconfigId, newSubconfigId) {
	// If present, onAppWillCompileConfig() is called by the application just prior to the configuration
	// being compiled, whether initially or due to a subsequent change to the selected subconfig, but NOT
	// when being compiled just for validation purposes.
	_trace("onAppWillCompileConfig: reason: {0}, current: {1}, new: {2}", reason, currentSubconfigId || "(none)", newSubconfigId);

	if (appWizard) {
		appWizard.onAppWillCompileConfig(reason, currentSubconfigId, newSubconfigId);
	}
};

appDefault.onAppDidCompileConfig = function onAppDidCompileConfig(reason, oldSubconfigId, currentSubconfigId) {
	// onAppDidCompileConfig() is called by the application just after the configuration has been compiled,
	// whether initially or due to a subsequent change to the selected subconfig, but NOT when being compiled
	// just for validation purposes.
	_trace("onAppDidCompileConfig: reason: {0}, old: {1}, current: {2}", reason, oldSubconfigId, currentSubconfigId);

	if (appStage && (reason !== "initial")) {
		// Note: appStage won't be initialized when some types of subconfig compilations occur, hence the guard
		// above; but part of appStage's own initialization is a call to the same method, so still gets handled.
		appStage.updateInterfaceForNewConfig();

		// Content specific to any of the dropdown values may have changed due to subconfig differences. However, previous
		// values aren't available as changes weren't user-initiated. Still, trigger content updates as it may be needed.
		appDefault.updateContentForSpecificInputs();
	}

	if (appWizard) {
		appWizard.onAppDidCompileConfig(reason, oldSubconfigId, currentSubconfigId);
	}
};

appDefault.onAppWillUpdateInterfaceForNewConfig = function onAppWillUpdateInterfaceForNewConfig() {
	// If present, onAppWillUpdateInterfaceForNewConfig() is called by the application just before it is
	// going to update the user interface to reflect changing to a new subconfig.
	_trace("onAppWillUpdateInterfaceForNewConfig");
};

appDefault.onAppDidUpdateInterfaceForNewConfig = function onAppDidUpdateInterfaceForNewConfig() {
	// If present, onAppDidUpdateInterfaceForNewConfig() is called by the application just after it has
	// updated the user interface to reflect changing to a new subconfig. If implementation-specific code
	// needed to perform any custom setup to the user interface that is somehow subconfig-dependent, an
	// override of this method is the ideal place to update such custom setup to the user interface.
	_trace("onAppDidUpdateInterfaceForNewConfig");
};

appDefault.onAppDidDisplayHelpModal = function onAppDidDisplayHelpModal(helpModalId) {
	_trace("onAppDidDisplayHelpModal: helpModalId: {0}", helpModalId);

	switch (helpModalId) {
		case "modal_UserAgreement":
		case "modal_SaveScenario":
			// do not track; there are already specific analytics events for these.
			break;

		default:
			appAnalytics.trackHelpModalEvent(helpModalId);
			break;
	}
};

appDefault.onAppDidChangeDynamicItem = function onAppDidChangeDynamicItem(itemId, visible, newValue, oldValue, options) {
	// If present, onAppDidChangeDynamicItem() is called by the application just after it has changed any of
	// the visibility, value, or options for a configured dynamic dropdown or set of radio buttons.
	_trace("onAppDidChangeDynamicItem: itemId: {0}, visible: {1}, newValue: {2}, oldValue: {3}, options: [{4}]",
		itemId, visible, newValue, oldValue, options.join(", "));

	if (appWizard) {
		appWizard.onAppDidChangeDynamicItem(itemId, visible, newValue, oldValue, options);
	}
};

appDefault.onAppWillSwitchToTaxView = function onAppWillSwitchToTaxView(selectedPlanId, accountTypeId) {
	// If present, onAppWillSwitchToTaxView() is called just prior to the app switching from
	// the MPCE to the tax view in response to a user request to switch. At this point, the tax
	// view is not yet on screen.
	_trace("onAppWillSwitchToTaxView for plan {0} with account {1}", selectedPlanId, accountTypeId);
	if (appWizard) {
		if ($body.hasClass("duringWizard")) {
			wasInWizardBeforeTaxView = true;
			appWizard.switchToFullTool();
		} else {
			wasInWizardBeforeTaxView = false;
		}
	}
};

appDefault.onAppDidSwitchToTaxView = function onAppDidSwitchToTaxView(selectedPlanId, accountTypeId) {
	// If present, onAppDidSwitchToTaxView() is called after the app has switched from the MPCE
	// to the tax view in response to a user request to switch. At this point, the tax view
	// should be on screen.
	_trace("onAppDidSwitchToTaxView for plan {0} with account {1}", selectedPlanId, accountTypeId);
};

appDefault.onAppWillSwitchToMpceView = function onAppWillSwitchToMpceView(selectedPlanId, accountTypeId) {
	// If present, onAppWillSwitchToMpceView() is called just prior to the app switching from
	// the tax to the MPCE view in response to a user request to switch. At this point, the MPCE
	// view is not yet on screen.
	_trace("onAppWillSwitchToMpceView for plan {0} with account {1}", selectedPlanId, accountTypeId);
	if (appWizard && wasInWizardBeforeTaxView) {
		appWizard.switchToWizard();
	}
};

appDefault.onAppDidSwitchToMpceView = function onAppDidSwitchToMpceView(selectedPlanId, accountTypeId) {
	// If present, onAppDidSwitchToMpceView() is called after the app has switched from the tax
	// to the MPCE view in response to a user request to switch. At this point, the MPCE view
	// should be on screen.
	_trace("onAppDidSwitchToMpceView for plan {0} with account {1}", selectedPlanId, accountTypeId);
};

appDefault.onEngineWillRunMpceCalculation = function onEngineWillRunMpceCalculation(inputs) {
	// If present, onEngineWillRunMpceCalculation() is called just prior to the app invoking
	// mpceEngine.calculateWithArgs(). This callback will receive a copy of the arguments that are going
	// to be passed to mpceEngine.calculateWithArgs(), and must return the same or similar object. Code
	// here has an opportunity to augment the arguments with additional information. e.g.
	// incentives, employee HSA contribution amount, company HSA match money, etc.
	_trace("onEngineWillRunMpceCalculation");

	if (mpceEngineDevUI) { $mpceTraceOutput.hide(); }

	let plansForRegion = appEngine.configuration.regions[appData.personal.regionId].plans, premiumAdjustments = {},
		fundRolloverAmounts = {}, fundContributions = {}, fundContributionLimits = {}, planFundAdjustmentAmounts = {},
		planFundAdditionalMatches = {};

	plansForRegion.forEach(function each(planId) {
		// !! NOTE !! Calls via appDispatch below mean the clientCustom versions will be called if defined.
		// So, ideally, you shouldn't need to override appDefault.onEngineWillRunMpceCalculation() but just
		// the handful of onAppNeeds___() methods for when a client has, say, custom premium adjustments
		// or HSA company match logic.
		premiumAdjustments[planId] = appDispatch.onAppNeedsPremiumAdjForPlan(planId);
		fundRolloverAmounts[planId] = appDispatch.onAppNeedsCarryoverAmountForPlan(planId);
		let contAndMatchForPlan = appDispatch.onAppNeedsSavingsContAndMatchForPlan(planId);
		fundContributions[planId] = contAndMatchForPlan.contForPlan;
		fundContributionLimits[planId] = contAndMatchForPlan.limitForPlan;
		planFundAdjustmentAmounts[planId] = contAndMatchForPlan.fundAmountAdjForPlan;
		planFundAdditionalMatches[planId] = contAndMatchForPlan.matchForPlan;
	});

	inputs.premiumAdjustmentAmounts = premiumAdjustments;
	inputs.fundRolloverAmounts = fundRolloverAmounts;
	inputs.voluntaryFundContributionAmounts = fundContributions;
	inputs.voluntaryFundContributionLimits = fundContributionLimits;
	inputs.planFundAdjustmentAmounts = planFundAdjustmentAmounts;
	inputs.planFundAdditionalMatchAmounts = planFundAdditionalMatches;

	if (appWizard) {
		inputs = appWizard.onEngineWillRunMpceCalculation(inputs);
	}

	if (mpceEngineDevUI) { $mpceTraceOutput.val(""); }

	return inputs;
};

appDefault.lookUpCustomAdjustmentAmount = function lookUpCustomAdjustmentAmount(adjustmentId, answer, planId) {
	// Helper method available to be called by clientCustom implementations of onAppNeedsPremiumAdjForPlan().
	// Used to look up custom premium adjustments from the MPCE configuration. This method will look up an
	// amount from the mentioned object using a key path of answer value, planId, regionId, coverageLevelId,
	// statusId, and failing all, returns zero.

	let result = mpceEngine.lookUpCustomAdjustmentAmount(appEngine.configuration, adjustmentId,
		answer, planId, appData.personal.regionId, appData.getCoverageLevelId(), appData.personal.statusId);
	_trace("lookUpCustomAdjustmentAmount: {0}/{1}/{2} = {3}", adjustmentId, planId, answer, result);
	return result;
};

// ... and for backward compatibility w/old clientCustom implementations, potentially:
appDefault.lookUpPremiumAdjustment = appDefault.lookUpCustomAdjustmentAmount;

appDefault.onAppNeedsPremiumAdjForPlan = function onAppNeedsPremiumAdjForPlan(planId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() when it needs the premium adjustment amounts for a given
	// planId. The appDefault implementation returns zero for both the employee and employer premium adjustments, but
	// if custom premium adjustment logic is required, make a clientCustom.onAppNeedsPremiumAdjForPlan() version that
	// does what you want, e.g. uses inputs to look up a value using appDefault.lookUpCustomAdjustmentAmount(), and
	// then returns that either to offset only employee premiums, or both employee and employer premiums.

	let result = { employee: 0, employer: 0 };
	_trace("onAppNeedsPremiumAdjForPlan for {0} result: { employee: {1}, employer: {2} }", planId, result.employee, result.employer);
	return result;
};

appDefault.onAppNeedsFundAmountAdjForPlan = function onAppNeedsFundAmountAdjForPlan(planId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() when it needs the company fund amount adjustment
	// for a given planId. The appDefault implementation returns 0, but if custom fund amount adjustment logic
	// is required, make a clientCustom.onAppNeedsFundAmountAdjForPlan() version that does what you want, e.g.
	// uses inputs to look up a value using appDefault.lookUpCustomAdjustmentAmount().
	let result = 0;
	_trace("onAppNeedsFundAmountAdjForPlan for planId {0} result: {1}", planId, result);
	return result;
};

// eslint-disable-next-line no-unused-vars
appDefault.onAppNeedsCarryoverAmountForPlan = function onAppNeedsCarryoverAmountForPlan(planId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() when it needs the incoming past years' carryover
	// amount for a given planId. The appDefault implementation simply returns, for all plans, the value input
	// via the carryover amount slider. If a client implementation needs to only apply the carryover to specific
	// plans, make a clientCustom.onAppNeedsCarryoverAmountForPlan() that only returns the carryover amount for
	// to plans where it applies, and zero otherwise.

	let result = appData.personal.carryoverAmount;
	_trace("onAppNeedsCarryoverAmountForPlan for planId {0} result: {1}", planId, result);
	return result;
};

appDefault.onAppNeedsSavingsContAndMatchForPlan = function onAppNeedsSavingsContAndMatchForPlan(planId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() when it needs the savings contribution amount and
	// company match amount for a given planId. The appDefault implementation returns zero for plans that do not
	// have a configured fundAllowsContributions = true. For the match amount the appDefault implementations returns
	// zero for plans that do not have a configured fundContributionsHaveMatch = true as well. Otherwise, it calls
	// the FSAE engine to calculate the company match for the plan's corresponding fsaeAccountTypeId.

	// IMPORTANT: This function must return values in an object structured as follows:
	let result = {
		planId: planId, accountTypeId: null, followRulesFor: null, eeDesiredCont: 0,
		contForPlan: 0, fundAmountAdjForPlan: 0, matchForPlan: 0, limitForPlan: 0
	};

	result.accountTypeId = appEngine.getPrimaryAccountTypeId(appEngine.configuration.plans[planId].fsaeAccountTypeId);
	if (result.accountTypeId) {
		let accountConfig = fsaeConfig.accountTypes[result.accountTypeId], innerResult;
		if (accountConfig) {
			switch (accountConfig.followRulesFor) {
				case "HSA":
					result.followRulesFor = "HSA";
					result.eeDesiredCont = appData.personal.hsaContributionAmount;
					innerResult = appDispatch.onAppNeedsHsaContAndMatchForPlan(planId, result.eeDesiredCont, result.accountTypeId);
					result.contForPlan = innerResult.hsaContForPlan || 0;
					result.fundAmountAdjForPlan = innerResult.fundAmountAdjForPlan || 0;
					result.matchForPlan = innerResult.matchForPlan || 0;
					result.limitForPlan = innerResult.limitForPlan || 0;
					break;
				case "FSA":
					result.followRulesFor = "FSA";
					result.eeDesiredCont = appData.personal.fsaContributionAmount;
					innerResult = appDispatch.onAppNeedsFsaContAndMatchForPlan(planId, result.eeDesiredCont, result.accountTypeId);
					result.contForPlan = innerResult.fsaContForPlan || 0;
					result.fundAmountAdjForPlan = innerResult.fundAmountAdjForPlan || 0;
					result.matchForPlan = innerResult.matchForPlan || 0;
					result.limitForPlan = innerResult.limitForPlan || 0;
					break;
				default:
					// results remain zero
					break;
			}
		} // else no associated account configured; results remain zero
	} // else plan hasn't fundContributionsHaveMatch = true, or no associated account; results remain zero

	_trace("onAppNeedsSavingsContAndMatchForPlan: for {0} [{1}/{2}] and eeDesiredCont {3} result: contForPlan {4}, " +
		"fundAmountAdjForPlan {5}, matchForPlan {6}, limitForPlan: {7}", result.planId, result.accountTypeId, result.followRulesFor,
		result.eeDesiredCont, result.contForPlan, result.fundAmountAdjForPlan, result.matchForPlan, result.limitForPlan);
	return result;
};

appDefault.onAppNeedsHsaContAndMatchForPlan = function onAppNeedsHsaContAndMatchForPlan(planId, eeDesiredHsaCont, accountTypeId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() indirectly via appDefault.onAppNeedsSavingsContAndMatchForPlan()
	// when it needs the limited HSA contribution amount, company adjusted fund amount and match, and effective contribution limit
	// for a given planId.

	let result, matchForPlan = 0, coverageLevelId = appData.getCoverageLevelId();
	let effectiveContLimitForPlan = appEngine.getEffectiveSavingsContLimitForPlan(
		planId, appData.personal.regionId, appData.personal.statusId, coverageLevelId, appData.personal.overAge55, false);
	let fundAmountAdjForPlan = appDispatch.onAppNeedsFundAmountAdjForPlan(planId);
	effectiveContLimitForPlan -= fundAmountAdjForPlan;
	// Limit employee's own contributions and potentially calculate employer matching contributions on those.
	let hsaContForPlan = Math.min(effectiveContLimitForPlan, eeDesiredHsaCont);
	if (hsaContForPlan > 0) { // calculate potential employer matching on employee contributions
		let accountConfig = fsaeConfig.accountTypes[accountTypeId];
		accountConfig.contributionMaximumAdjustment = appEngine.getSavingsContLimitAdjustmentForPlan(planId,
			appData.personal.regionId, appData.personal.statusId, coverageLevelId, appData.personal.overAge55, false);
		matchForPlan = fsaeEngine.calculateEmployerMatchAmount(fsaeConfig, accountTypeId, hsaContForPlan, coverageLevelId);
		delete accountConfig.contributionMaximumAdjustment; // Nullifies temporary contribution max adjustment.
	} // else limited contributions were zero; results remain zero.

	_trace("onAppNeedsHsaContAndMatchForPlan: for {0} and eeDesiredHsaCont {1} result: hsaContForPlan {2}, fundAmountAdjForPlan {3}, " +
		"matchForPlan {4}, limitForPlan {5}", planId, eeDesiredHsaCont, hsaContForPlan, fundAmountAdjForPlan, matchForPlan,
		effectiveContLimitForPlan);
	// IMPORTANT: This function must return _four_ values in an object structured as follows:
	result = {
		hsaContForPlan: hsaContForPlan, fundAmountAdjForPlan: fundAmountAdjForPlan,
		matchForPlan: matchForPlan, limitForPlan: effectiveContLimitForPlan
	};
	return result;
};

appDefault.onAppNeedsFsaContAndMatchForPlan = function onAppNeedsFsaContAndMatchForPlan(planId, eeDesiredFsaCont, accountTypeId) {
	// Called by appDefault.onEngineWillRunMpceCalculation() indirectly via appDefault.onAppNeedsSavingsContAndMatchForPlan()
	// when it needs the limited FSA contribution amount, company match amount, and effective contribution limit for a given planId.

	let result, matchForPlan = 0, coverageLevelId = appData.getCoverageLevelId(), fsaHasNoAge55CatchUp = false;
	let accountConfig = fsaeConfig.accountTypes[accountTypeId];
	let maximumExcludesCompanyFunds = accountConfig.maximumExcludesCompanyFunds || false;
	let effectiveContLimitForPlan = appEngine.getEffectiveSavingsContLimitForPlan(
		planId, appData.personal.regionId, appData.personal.statusId, coverageLevelId, fsaHasNoAge55CatchUp, maximumExcludesCompanyFunds);
	let fundAmountAdjForPlan = appDispatch.onAppNeedsFundAmountAdjForPlan(planId);
	if (!maximumExcludesCompanyFunds) {
		effectiveContLimitForPlan -= fundAmountAdjForPlan;
	}
	// Limit employee's own contributions and potentially calculate employer matching contributions on those.
	let fsaContForPlan = Math.min(effectiveContLimitForPlan, eeDesiredFsaCont);
	if (fsaContForPlan > 0) { // calculate potential employer matching on employee contributions
		accountConfig.contributionMaximumAdjustment = appEngine.getSavingsContLimitAdjustmentForPlan(planId,
			appData.personal.regionId, appData.personal.statusId, coverageLevelId, fsaHasNoAge55CatchUp, maximumExcludesCompanyFunds);
		matchForPlan = fsaeEngine.calculateEmployerMatchAmount(fsaeConfig, accountTypeId, fsaContForPlan, coverageLevelId);
		delete accountConfig.contributionMaximumAdjustment; // Nullifies temporary contribution max adjustment.
	} // else limited contributions were zero; results remain zero.

	_trace("onAppNeedsFsaContAndMatchForPlan: for {0} and eeDesiredFsaCont {1} result: fsaContForPlan {2}, fundAmountAdjForPlan {3}," +
		"matchForPlan {4}, limitForPlan {5}", planId, eeDesiredFsaCont, fsaContForPlan, fundAmountAdjForPlan, matchForPlan,
		effectiveContLimitForPlan);
	// IMPORTANT: This function must return _four_ values in an object structured as follows:
	result = {
		fsaContForPlan: fsaContForPlan, fundAmountAdjForPlan: fundAmountAdjForPlan,
		matchForPlan: matchForPlan, limitForPlan: effectiveContLimitForPlan
	};
	return result;
};

appDefault.onAppNeedsHsaSliderMinimum = function onAppNeedsHsaSliderMinimum() {
	// Called by appStage.hookUpSavingsSectionEvents() and appStage.maybeAdjustSavingsSliderBounds() when it needs to know
	// what minimum to use for the slider for the user's desired HSA contribution. The appDefault version currently returns 0.
	let result = 0;
	_trace("onAppNeedsHsaSliderMinimum: result: {0}", result);
	return result;
};

appDefault.onAppNeedsHsaSliderMaximum = function onAppNeedsHsaSliderMaximum() {
	// Called by appStage.hookUpSavingsSectionEvents() and appStage.maybeAdjustSavingsSliderBounds() when it needs to know
	// what maximum to use for the slider for the user's desired HSA contribution. The appDefault version returns the highest
	// HSA account contribution maximum given the active set of plans and the current coverage level.

	let result, config = appEngine.configuration, coverageLevelId = appData.getCoverageLevelId(), highestSoFar = null, highestPlanId = null;
	config.regions[appData.personal.regionId].plans.filter(function filter(planId) {
		let acctId = appEngine.getPrimaryAccountTypeId(config.plans[planId].fsaeAccountTypeId),
			acctCfg = acctId && fsaeConfig.accountTypes[acctId], isHSA = acctCfg && (acctCfg.followRulesFor === "HSA");
		return isHSA;
	}).forEach(function each(planId) {
		let limitForPlan = appEngine.getEffectiveSavingsContLimitForPlan(
			planId, appData.personal.regionId, appData.personal.statusId, coverageLevelId, appData.personal.overAge55, false);
		let fundAmountAdjForPlan = appDispatch.onAppNeedsFundAmountAdjForPlan(planId);
		limitForPlan -= fundAmountAdjForPlan;
		if ((highestSoFar === null) || (limitForPlan > highestSoFar)) {
			highestSoFar = limitForPlan;
			highestPlanId = planId;
		}
	});
	result = (highestSoFar !== null) ? highestSoFar : 0;
	_trace("onAppNeedsHsaSliderMaximum: result: {0} [{1}]", result, highestPlanId);
	return result;
};

appDefault.onAppNeedsFsaSliderMinimum = function onAppNeedsFsaSliderMinimum() {
	// Called by appStage.hookUpSavingsSectionEvents() and appStage.maybeAdjustSavingsSliderBounds() when it needs to know
	// what minimum to use for the slider for the user's desired FSA contribution. The appDefault version currently returns 0.
	let result = 0;
	_trace("onAppNeedsHsaSliderMinimum: result: {0}", result);
	return result;
};

appDefault.onAppNeedsFsaSliderMaximum = function onAppNeedsFsaSliderMaximum() {
	// Called by appStage.hookUpSavingsSectionEvents() and appStage.maybeAdjustSavingsSliderBounds() when it needs to know
	// what maximum to use for the slider for the user's desired FSA contribution. The appDefault version returns the highest
	// FSA account contribution maximum given the active set of plans and the current coverage level.

	let result, config = appEngine.configuration, coverageLevelId = appData.getCoverageLevelId(), highestSoFar = null, highestPlanId = null,
		fsaHasNoAge55CatchUp = false;
	config.regions[appData.personal.regionId].plans.map(function map(planId) {
		let acctId = appEngine.getPrimaryAccountTypeId(config.plans[planId].fsaeAccountTypeId),
			acctCfg = acctId && fsaeConfig.accountTypes[acctId], isFSA = acctCfg && (acctCfg.followRulesFor === "FSA");
		return { planId: planId, acctId: acctId, acctCfg: acctCfg, isFSA: isFSA };
	}).filter(function filter(obj) { return obj.isFSA; }).forEach(function each(obj) {
		let maximumExcludesCompanyFunds = obj.acctCfg && (obj.acctCfg.maximumExcludesCompanyFunds || false);
		let limitForPlan = appEngine.getEffectiveSavingsContLimitForPlan(obj.planId, appData.personal.regionId,
			appData.personal.statusId, coverageLevelId, fsaHasNoAge55CatchUp, maximumExcludesCompanyFunds);
		let fundAmountAdjForPlan = maximumExcludesCompanyFunds ? 0 : appDispatch.onAppNeedsFundAmountAdjForPlan(obj.planId);
		limitForPlan -= fundAmountAdjForPlan;
		if ((highestSoFar === null) || (limitForPlan > highestSoFar)) {
			highestSoFar = limitForPlan;
			highestPlanId = obj.planId;
		}
	});
	result = (highestSoFar !== null) ? highestSoFar : 0;
	_trace("onAppNeedsFsaSliderMaximum: result: {0} [{1}]", result, highestPlanId);
	return result;
};

appDefault.onEngineDidRunMpceCalculation = function onEngineDidRunMpceCalculation(inputs, allResults) {
	// If present, onEngineDidRunMpceCalculation() is called after the app has invoked
	// mpceEngine.calculateWithArgs(). This callback will receive a copy of the inputs that were passed
	// to mpceEngine.calculateWithArgs(), and the results it returned. This method must return the same
	// or similar results object. Custom code here has an opportunity to modify or act on the
	// results before they are handed back to the rest of the application. For instance, certain
	// results could be zeroed, modified, displayed, drive UI changes, etc.

	_trace("onEngineDidRunMpceCalculation");

	if (mpceEngineDevUI) { $mpceTraceOutput.show().scrollTop(0); }

	appDispatch.updateResultOutputs(allResults);

	if (appWizard) {
		allResults = appWizard.onEngineDidRunMpceCalculation(inputs, allResults);
	}

	if (appData.features.planRecommendationEnabled) {
		appDispatch.onAppCanMakePlanRecommendation(appData.personal.planPriority, allResults.main);
	}

	return allResults;
};

appDefault.updateResultOutputs = function updateResultOutputs(allResults) {
	allResults = allResults || appData.getMpceEngineResults();

	// Write out the coverage level description, usually positioned just above the chart.
	let config = appEngine.configuration, coverageLevelId = appData.getCoverageLevelId();
	$body.find(".coverageLevel").text(getDescription(config.coverageLevels[coverageLevelId]));

	// Hide all plan-specific outputs in markup (presumed classed as "planSpecific"), the company match row,
	// and the forfeited rollover amount row. The following logic will just show what is appropriate for the results.
	$body.find(".planSpecific:not(.notInUse)").hide();

	let mainResults = allResults.main;
	appStage.updateResultsTables($body.find(".resultsTable:not(.alternate_noEmployeeFunding)"), mainResults, "main");

	// Show this plan's plan-specific outputs that may appear elsewhere on the page
	mainResults.orderedPlanIds.forEach(function each(planId) {
		$body.find(".planSpecific." + planId + ":not(.notInUse)").show();
	});

	// Potentially hide the entire savings area if there were no plans permitting employee or employer contributions.
	$body.find(".savingsArea:not(.notInUse)")[
		mainResults.hasPlanAllowingEECont || mainResults.hasPlanWithERBaseFundAmount || mainResults.hasPlanAllowingERMatch ?
			"show" : "hide"]();

	// Potentially display the warning that there is a plan with funding that could have been applied
	$body.find(".warningHasFundsThatCouldHaveBeenApplied:not(.notInUse)")[
		mainResults.hasPlanWithFundsThatCouldHaveBeenApplied ? "removeClass" : "addClass"]("hiddenNotApplicable");
};

appDefault.onAppNeedsCustomResultsForPlan = function onAppNeedsCustomResultsForPlan(planResult, resultsVariant) {
	// If present, onAppNeedsCustomResultsForPlan is called before results tables are updated with new results. This
	// provides an opportunity for custom logic to add custom results to a plan's results, which will automatically
	// feed into generating the cell data for updating results tables.
	_trace("onAppNeedsCustomResultsForPlan: planResult.planId: {0} for resultsVariant: {1}", planResult.planId, resultsVariant);
};

appDefault.onAppWillUpdateResultsTablesForPlan = function onAppWillUpdateResultsTablesForPlan(
	results, planResult, cellsData, resultsVariant) {
	// If present, onAppWillUpdateResultsTablesForPlan is called before results tables are updated with new results. This
	// provides an opportunity for custom logic to override standard cell data contents, or add more cell data for output
	// to custom rows added to result tables markup.
	_trace("onAppWillUpdateResultsTablesForPlan: planResult.planId: {0} for resultsVariant: {1}", planResult.planId, resultsVariant);
};

appDefault.onAppCanMakePlanRecommendation = function onAppCanMakePlanRecommendation(planPriority, mainResults) {
	// If present and if the plan recommendation feature is enabled, onAppCanMakePlanRecommendation() is called
	// after the the MPCE engine has calculated results, including custom results, and updated the results tables.
	// This method provides an opportunity for the application to recommend specific plans based on the results
	// and the user's chosen plan priorities.

	// planPriorityHandled will indicate whether or not the planPriority value was handled by this implementation.
	// This will be the method's return value so e.g. clientCustom implementations could first call the appDefault
	// version of this method, and then only have to handle client-specific planPriority values.
	let isNullOrUndefinedOrNone = isNullOrUndefined(planPriority) || planPriority === "none";
	let planPriorityHandled = isNullOrUndefinedOrNone ||
		["lowerPremiums", "lowerOutOfPocketCosts", "lowerTotalCosts", "lowerWorstCaseCosts", "HSA", "FSA"].includes(planPriority);
	if (isNullOrUndefinedOrNone) {
		_trace("onAppCanMakePlanRecommendation: planPriority is {0}. Hiding all recommended plan results.", planPriority);
		mainResults.lastRecommendedPlanId = null;
		$body.find(".planRecommendationResult, .planRecommendationResultNone").addClass("hiddenNotApplicable");
		appDefault.noPlanRecommendation();
		return planPriorityHandled;
	}

	let recommendedPlanId = mainResults.plansByPlanPriority[0].planId;

	if (isNullOrUndefined(recommendedPlanId)) {
		mainResults.lastRecommendedPlanId = null;
		$body.find(".planRecommendationResult").addClass("hiddenNotApplicable");
		$body.find(".planRecommendationResultNone").removeClass("hiddenNotApplicable");
		_trace("onAppCanMakePlanRecommendation: planPriority {0} has no available matching plans.", planPriority);
	} else {
		mainResults.lastRecommendedPlanId = recommendedPlanId;
		let recommendedPlan = mainResults[recommendedPlanId];
		$body.find("div.bestMatchPlan").find("span.prompt").html(recommendedPlan.description);

		$body.find(".planRecommendationResultNone").addClass("hiddenNotApplicable");
		$body.find(".planRecommendationResult").removeClass("hiddenNotApplicable");
		$body.find(".recommendedPlanName").html(recommendedPlan.description);
		appDefault.highLightPlanRecommendation(recommendedPlanId);
		_trace("onAppCanMakePlanRecommendation: planPriority {0} has best matching planId {1}.", planPriority, recommendedPlanId);
	}

	return planPriorityHandled;
};

appDefault.highLightPlanRecommendation = (planId) => {
	$body.find('div.bestMatchPlan').show();
	$body.find('div.NoMatchPlan').hide();
	const firstRowCells = $body.find('table.selectedMedicalPlanProvisionsTable tr').first().find('th');
	let colIndex = -1, i = -1;

	firstRowCells.each((index, el) => {
		i += 1;
		const classList = $(el).attr('class');
		if ((typeof classList !== 'undefined') && classList.split(/\s+/).includes(planId)) {
			colIndex = i;
		}
	});
	$body.find('table.selectedMedicalPlanProvisionsTable td').each((index, el) => $(el).removeClass('recommended'));
	$body.find('table.selectedMedicalPlanProvisionsTable th').each((index, el) => $(el).removeClass('recommended'));
	$body.find('table.selectedMedicalPlanProvisionsTable td:nth-child(' + (colIndex + 1) + ')').each((index, el) => $(el).addClass('recommended'));
	$body.find('table.selectedMedicalPlanProvisionsTable th:nth-child(' + (colIndex + 1) + ')').each((index, el) => $(el).addClass('recommended'));
	$body.find('table.selectedMedicalPlanProvisionsTable tr.separator').each(
		(index, el) => $(el).find('td').each((index2, el2) => $(el2).removeClass('recommended'))
	);
};

appDefault.noPlanRecommendation = () => {
	$body.find('div.bestMatchPlan').hide();
	$body.find('div.NoMatchPlan').show();
	$body.find('table.selectedMedicalPlanProvisionsTable td').each((index, el) => $(el).removeClass('recommended'));
	$body.find('table.selectedMedicalPlanProvisionsTable th').each((index, el) => $(el).removeClass('recommended'));
};

appDefault.onMpceChartWillUpdate = function onMpceChartWillUpdate() {
	// If present, onMpceChartWillUpdate() is called just before the MPCE chart is updated.
	_trace("onMpceChartWillUpdate");
};

appDefault.onMpceChartDidUpdate = function onMpceChartDidUpdate() {
	// If present, onMpceChartDidUpdate() is called just after the MPCE chart is updated.
	_trace("onMpceChartDidUpdate");

	appDefault.updateContentForSpecificInputs(); // as there may be use of statusSpecific, etc. in chart and results tables
};

appDefault.onMpceChartNeedsTooltipHtml = function onMpceChartNeedsTooltipHtml(point) {
	_trace("onMpceChartNeedsTooltipHtml: point.planId: {0}, point.seriesId: {1}", point.planId, point.seriesId);

	/** @type object */ let $clone = $mainChartTooltip.clone(), details = "";
	$clone.addClass(point.seriesId);
	$clone.find(".resultsVariant").html(point.resultsVariant);
	$clone.find(".planId").html(point.planId);
	$clone.find(".planName").html(point.planName.replace(regExpMatchHtmlLineBreaks, " "));
	$clone.find(".seriesId").html(point.seriesId);
	$clone.find(".seriesName").html(point.seriesName);
	$clone.find(".value").html(formatDollar(point.value));
	// For worst-case costs series, potentially use alternate shorter series name, and maybe value "n/a".
	if (point.seriesId === "worstCaseCosts") {
		if (appEngine.configuration.worstCaseCostsSeries.nameForTooltip) {
			$clone.find(".seriesName").html(appEngine.configuration.worstCaseCostsSeries.nameForTooltip);
		}
		let planResults = appData.getMpceEngineResults().main[point.planId];
		if (!isNullOrUndefined(planResults) && !isFinite(planResults.worstCaseEmployeeCosts)) {
			$clone.find(".value").html(getText("txt_WorstCaseCostsUnlimited"));
		}
	}
	// Handle appending possible additional details
	switch (point.seriesId) {
		case "outOfPocketCosts":
			details = appData.features.showOopCostsDetails ? appDispatch.onMpceChartNeedsOutOfPocketCostsDetailHtml(point) : "";
			break;
		case "annualEmployeePremiums":
			details = appData.features.showEmployeePremiumsDetails ? appDispatch.onMpceChartNeedsAnnualEmployeePremiumsDetailHtml(point) : "";
			break;
		case "annualEmployerPremiums":
			details = appData.features.showEmployerPremiumsDetails ? appDispatch.onMpceChartNeedsAnnualEmployerPremiumsDetailHtml(point) : "";
			break;
		case "worstCaseCosts":
			details = appDispatch.onMpceChartNeedsWorstCaseCostsDetailHtml(point);
			break;
		default:
			break;
	}
	$clone.find(".details").html(details);
	let html = $clone[0].outerHTML;
	return html;
};

appDefault.onMpceChartNeedsOutOfPocketCostsDetailHtml = function onMpceChartNeedsOutOfPocketCostsDetailHtml(point) {
	let html, results = (appData.getMpceEngineResults())[point.resultsVariant], planResult = results[point.planId];
	let /** @type object */ $clone = $oopCostsDetails.clone();
	["totalCopays", "totalDeductibles", "totalCoinsurance", "totalExpensesNotCovered", "totalMedicalAndDrugCosts",
		"totalFundAmountOffset", "totalMedicalAndDrugCostsLessFundOffset"].forEach(function each(key) {
		$clone.find("tr." + key + " .value").html(formatDollar(planResult[key]));
	});
	// If no expenses not covered, don't show corresponding row.
	planResult.totalExpensesNotCovered === 0 && $clone.find("tr.totalExpensesNotCovered").hide();
	// If no fund amount offset, don't show subtotal, fund amount offset rows, and apply funds notes.
	if (planResult.totalFundAmountOffset === 0) {
		$clone.find("tr.totalMedicalAndDrugCosts").hide();
		$clone.find("tr.totalFundAmountOffset").hide();
		$clone.addClass("noFundAmountOffset");
	}
	planResult.totalFundAmount > 0 && $clone.addClass("hasFundAmount");
	// Add certain CSS classes to facilitate styling based on results variant, options, and limits reached.
	planResult.fundAllowsContributions && $clone.addClass("fundAllowsContributions");
	$clone.addClass(planResult.applyFundsToCostOfCareOption);
	$clone.addClass(point.resultsVariant);
	planResult.deductiblesMet.count > 0 && $clone.addClass("deductibleMet");
	planResult.outOfPocketMaximumsReached.count > 0 && $clone.addClass("oopMaxReached");
	html = $clone[0].outerHTML;
	return html;
};

appDefault.onMpceChartNeedsAnnualPremiumsDetailHtmlImpl = function onMpceChartNeedsPremiumDetailsHtmlImpl(point, kind) {
	let $clone = (kind === "employee") ? $employeePremiumsDetails.clone() : $employerPremiumsDetails.clone();
	let html, results = (appData.getMpceEngineResults())[point.resultsVariant], pr = results[point.planId];
	["totalAnnualPayrollContributionsExcludingAdjustment", "employeePlanPremiumAdjustment",
		"totalAnnualPayrollContributionsMaybeNegative", "totalAnnualPayrollContributions",
		"employerPlanPremiumExcludingAdjustment", "employerPlanPremiumAdjustment",
		"employerPlanPremiumMaybeNegative", "employerPlanPremium"].forEach(function each(key) {
		$clone.find("tr." + key + " .value").html(formatDollar(pr[key]));
	});
	$clone.find("tr.adjustmentAmount").addClass("hiddenNotApplicable");
	let namedAmounts = (kind === "employee") ? pr.employeeNamedPremiumAdjustmentAmounts : pr.employerNamedPremiumAdjustmentAmounts;
	Object.keys(namedAmounts).forEach(function each(key) {
		let $tr = $clone.find("tr." + key), $sign = $tr.find("td.sign"), $value = $tr.find("td.value");
		let value = namedAmounts[key], isNegative = value < 0, isZero = value === 0, absValue = Math.abs(value);
		$sign.html(isNegative ? "&ndash;" : "+");
		$value.html(formatDollar(absValue)).toggleClass("incentive", isNegative).toggleClass("surcharge", !isNegative);
		if (!isZero) { $tr.removeClass("hiddenNotApplicable"); }
	});
	html = $clone[0].outerHTML;
	return html;
};

appDefault.onMpceChartNeedsAnnualEmployeePremiumsDetailHtml = function onMpceChartNeedsAnnualEmployeePremiumsDetailHtml(point) {
	return appDefault.onMpceChartNeedsAnnualPremiumsDetailHtmlImpl(point, "employee");
};

appDefault.onMpceChartNeedsAnnualEmployerPremiumsDetailHtml = function onMpceChartNeedsAnnualEmployerPremiumsDetailHtml(point) {
	return appDefault.onMpceChartNeedsAnnualPremiumsDetailHtmlImpl(point, "employer");
};

// eslint-disable-next-line no-unused-vars
appDefault.onMpceChartNeedsWorstCaseCostsDetailHtml = function onMpceChartNeedsWorstCaseCostsDetailHtml(point) {
	return ""; // no default implementation but available to override if a client implementation wants to add something.
};

appDefault.onMpceChartPlanColumnClicked = function onMpceChartPlanColumnClicked(planId, seriesId, resultsVariant) {
	// If present, onMpceChartPlanColumnClicked is called if the user clicks on a plan's column in the MPCE chart.
	// This could be used, for instance, to change text in a dynamic footnote.
	_trace("onMpceChartPlanColumnClicked: planId: {0}, seriesId: {1}, resultsVariant: {2}", planId, seriesId, resultsVariant);

	if (appData.features.planProvisionsFeature) {
		appStage.showPlanProvisionsWithHighlightedPlan(planId);
	}
};

appDefault.onEngineWillRunFsaeCalculation = function onEngineWillRunFsaeCalculation(inputs) {
	// If present, onEngineWillRunFsaeCalculation() is called just prior to the app invoking
	// fsaeEngine.calculate(). This callback will receive a copy of the inputs that are going
	// to be passed to fsaeEngine.calculate(), and must return the same or similar object.
	// Code here has an opportunity to modify/augment the arguments as necessary.
	_trace("onEngineWillRunFsaeCalculation");

	return inputs;
};

appDefault.onEngineDidRunFsaeCalculation = function onEngineDidRunFsaeCalculation(inputs, results) {
	// If present, onEngineDidRunFsaeCalculation() is called after the app has invoked
	// fsaeEngine.calculate(). This callback will receive a copy of the inputs that were passed
	// to fsaeEngine.calculate(), and the results it returned. This method must return the same
	// or similar results object. Custom code here has an opportunity to modify or act on the
	// results before they are handed back to the rest of the application. For instance,
	// certain results could be zeroed, modified, page elements shown/hidden, etc.
	_trace("onEngineDidRunFsaeCalculation");

	return results;
};

appDefault.onFsaeChartWillUpdate = function onFsaeChartWillUpdate() {
	// If present, onFsaeChartWillUpdate() is called just before the FSAE chart is updated.
	_trace("onFsaeChartWillUpdate");
};

appDefault.onFsaeChartDidUpdate = function onFsaeChartDidUpdate() {
	// If present, onFsaeChartDidUpdate() is called just after the FSAE chart is updated.
	_trace("onFsaeChartDidUpdate");
};

appDefault.onFsaeChartNeedsTooltipHtml = function onFsaeChartNeedsTooltipHtml(point) {
	_trace("onFsaeChartNeedsTooltipHtml: point.seriesId: {0}", point.seriesId);

	/** @type object */ let $clone = $taxChartTooltip.clone();
	$clone.find(".seriesId").html(point.seriesId);
	$clone.find(".seriesName").html(point.seriesName);
	$clone.find(".value").html(formatDollar(point.value));
	let html = $clone[0].outerHTML;
	return html;
};

appDefault.onAppWillSwitchModelingMode = function onAppWillSwitchModelingMode(currentModelingMode, newModelingMode) {
	// If present, onAppWillSwitchModelingMode() is called just prior to the app changing
	// the current modeling view. Provides an opportunity for the app to modify other custom
	// elements dependent on the modeling view.
	_trace("onAppWillSwitchModelingMode: current: {0}, new: {1}", currentModelingMode, newModelingMode);
};

appDefault.onAppDidSwitchModelingMode = function onAppDidSwitchModelingMode(oldModelingMode, currentModelingMode) {
	// If present, onAppDidSwitchModelingMode() is called just after the app has changed the
	// current modeling view. Provides an opportunity for the app to modify other custom
	// elements dependent on the modeling view.
	_trace("onAppDidSwitchModelingMode: old: {0}, current: {1}", oldModelingMode, currentModelingMode);

	if (appWizard) {
		appWizard.maybeAutoMove(); // handles case where current slide was simplified or detailed modeling
	}
};

appDefault.onAppDidSwitchToSimplifiedModeling = function onAppDidSwitchToSimplifiedModeling() {
	// If present, onAppDidSwitchToSimplifiedModeling() is called just after the app has switched to simplified modeling.
	_trace("onAppDidSwitchToSimplifiedModeling");
};

appDefault.onAppDidSwitchToDetailedModeling = function onAppDidSwitchToDetailedModeling() {
	// If present, onAppDidSwitchToDetailedModeling() is called just after the app has switched to simplified modeling.
	_trace("onAppDidSwitchToDetailedModeling");
};

// eslint-disable-next-line no-unused-vars
appDefault.onAppWillSwitchTaxViewAccountType = function onAppWillSwitchTaxViewAccountType(accountTypeId) {
	// If present, onAppWillSwitchTaxViewAccountType() is called just prior to the app changing
	// the tax view to reflect a new account type (e.g. switching from a plan with an FSA to a
	// plan with an HSA, etc.) Provides an opportunity for the app to modify settings, etc. prior
	// to the change being effective.
	_trace("onAppWillSwitchTaxViewAccountType: accountTypeId before switch: {0}", accountTypeId);
};

// eslint-disable-next-line no-unused-vars
appDefault.onAppDidSwitchTaxViewAccountType = function onAppDidSwitchTaxViewAccountType(accountTypeId) {
	// If present, onAppDidSwitchTaxViewAccountType() is called after the app has changed the
	// tax view to reflect a new account type (e.g. switching from a plan with an FSA to a plan
	// with an HSA, etc.) Provides an opportunity for the app to modify content in the tax view,
	// etc. once the change is effective.
	_trace("onAppDidSwitchTaxViewAccountType: accountTypeId after switch: {0}", accountTypeId);
};

appDefault.onUserWindowResizeDidBegin = function onUserWindowResizeDidBegin(widthBeforeResize, heightBeforeResize) {
	// If present, onUserWindowResizeDidBegin() is called when the user starts resizing or
	// reorienting the browser. Provides an opportunity for the app to do something when
	// the resizing has begun.
	_trace("onUserWindowResizeDidBegin: before resize: {0} x {1}", widthBeforeResize, heightBeforeResize);
};

appDefault.onUserWindowResizeDidFinish = function onUserWindowResizeDidFinish(widthAfterResize, heightAfterResize) {
	// If present, onUserWindowResizeDidFinish() is called once the user has finished resizing
	// or reorienting the browser. The finish is defined as a certain amount of time (currently
	// 500 milliseconds) elapsing since the last size change.) Provides an opportunity for the
	// app to readjust custom elements, if desired, once resizing is finished.
	_trace("onUserWindowResizeDidFinish: after resize: {0} x {1}", widthAfterResize, heightAfterResize);
};

appDefault.onUserChangedSimplifiedModelingUsageCategoryOption = function onUserChangedSimplifiedModelingUsageCategoryOption(
	userId, usageCategoryId, value) {
	// If present, 	onUserChangedSimplifiedModelingUsageCategoryOption() is called if the user changes the
	// value of one of the simplified modeling usage category dropdowns. Provides an opportunity for the app
	// to adjust content based on, say, a specific utilization level having been selected.
	_trace("onUserChangedSimplifiedModelingUsageCategoryOption: userId: {0}, usageCategoryId: {1}, value: {2}",
		userId, usageCategoryId, value);
};

appDefault.onUserChangedDetailedModelingUsageCategoryOption = function onUserChangedDetailedModelingUsageCategoryOption(
	userId, usageCategoryId, value) {
	// If present, 	onUserChangedDetailedModelingUsageCategoryOption() is called if the user changes the
	// value of one of the detailed modeling usage category dropdowns. Provides an opportunity for the app
	// to adjust content based on, say, a specific utilization level having been selected.
	_trace("onUserChangedDetailedModelingUsageCategoryOption: userId: {0}, usageCategoryId: {1}, value: {2}",
		userId, usageCategoryId, value);
};

appDefault.onUserChangedDetailedModelingServiceCount = function onUserChangedDetailedModelingServiceCount(
	userId, serviceId, serviceCount) {
	// If present, 	onUserChangedDetailedModelingServiceCount() is called if the user changes the
	// value of one of the detailed modeling service count dropdowns.
	_trace("onUserChangedDetailedModelingServiceCount: userId: {0}, serviceId: {1}, serviceCount: {2}",
		userId, serviceId, serviceCount);
};

appDefault.onUserDidPrintResults = function onUserDidPrintResults() {
	// If present, onUserDidPrintResults() is called after the user has printed the results.
	_trace("onUserDidPrintResults");
};

appDefault.onUserDidSaveScenario = function onUserDidSaveScenario() {
	// If present, onUserDidSaveScenario() is called after the user has saved a scenario.
	_trace("onUserDidSaveScenario");
};

appDefault.onUserProvidedSimpleFeedback = function onUserProvidedSimpleFeedback(feedbackType, feedbackValue) {
	// If present, onUserProvidedSimpleFeedback() is called after the user has provided simple feedback.
	_trace("onUserProvidedSimpleFeedback: feedbackType: {0}, feedbackValue: {1}", feedbackType, feedbackValue);
	appAnalytics.trackCustomEvent(feedbackType, feedbackValue);
};

appDefault.onAppDidLoadWithScenario = function onAppDidLoadWithScenario() {
	// If present, onAppDidLoadWithScenario() is called to indicate the application has loaded with a scenario.
	_trace("onAppDidLoadWithScenario");
};

appDefault.onAppDidStartWithWizard = function onAppDidStartWithWizard() {
	// If present, onAppDidStartWithWizard() is called to indicate the application has started with the wizard UI.
	_trace("onAppDidStartWithWizard");
};

appDefault.onAppDidStartWithFullTool = function onAppDidStartWithFullTool() {
	// If present, onAppDidStartWithFullTool() is called to indicate the application has started with the full tool UI.
	_trace("onAppDidStartWithFullTool");
};

appDefault.updateContentForSpecificInputs = function updateContentForSpecificInputs() {
	// Updates markup to hide elements classed as subconfigSpecific, coverageLevelSpecific, regionSpecific,
	// statusSpecific, planPrioritySpecific, etc. based on the corresponding input values.
	appDispatch.updateContentForSpecificSubconfig(appData.personal.subconfig);
	appDispatch.updateContentForSpecificCoverageLevel(appData.getCoverageLevelId());
	appDispatch.updateContentForSpecificRegion(appData.personal.regionId);
	appDispatch.updateContentForSpecificStatus(appData.personal.statusId);
	appDispatch.updateContentForSpecificPlanPriority(appData.personal.planPriority);
	appDispatch.updateContentForSpecificApplyFundsOption(appData.personal.applyFundsToCostOfCareOption);
	let config = appEngine.configuration, personalFormItems = config.personalFormItems;
	Object.keys(personalFormItems).forEach(function each(itemId) {
		let item = personalFormItems[itemId];
		if (item.callback === "onOtherDropdownChanged") {
			appDispatch.updateContentForOtherDropdownAnswer(itemId, appData[item.appDataObj][item.variableName]);
		}
	});
};

appDefault.updateBodyClassWithPrefix = function updateBodyClassWithPrefix(prefix, value) {
	// Helper for certain updateContentForSpecific___() methods that follow. Removes CSS classes from the HTML body element
	// starting with prefix, and adds a new CSS class combining both prefix and value. Having some primary inputs reflected
	// in CSS classes on the body element provides some flexibility to implementations for CSS styling. An implementation
	// could, say, use the classes to change the colour scheme, adjust content based on subconfig or region, etc.
	$body.attr("class").split(regexMatchWhitespace).forEach(function each(c) { if (c.startsWith(prefix)) { $body.removeClass(c); } });
	$body.addClass(prefix + value);
};

appDefault.updateContentForSpecificSubconfig = function updateContentForSpecificSubconfig(newSubconfigId, oldSubconfigId) {
	// Updates markup to hide elements classed as subconfigSpecific, except for the new selected subconfigId.
	if (newSubconfigId !== oldSubconfigId) {
		_trace("updateContentForSpecificSubconfig new: {0}, old: {1}", newSubconfigId, oldSubconfigId);
		$body.find(".subconfigSpecific").hide();
		$body.find(".subconfigSpecific." + newSubconfigId + ":not(.notInUse)").show();
		appDefault.updateBodyClassWithPrefix("subconfig_", newSubconfigId);
	}
};

appDefault.updateContentForSpecificCoverageLevel = function updateContentForSpecificCoverageLevel(newCoverageLevelId, oldCoverageLevelId) {
	// Updates markup to hide elements classed as coverageLevelSpecific, except for the new selected coverageLevelId.
	if (newCoverageLevelId !== oldCoverageLevelId) {
		_trace("updateContentForSpecificCoverageLevel new: {0}, old: {1}", newCoverageLevelId, oldCoverageLevelId);
		$body.find(".coverageLevelSpecific").hide();
		$body.find(".coverageLevelSpecific." + newCoverageLevelId + ":not(.notInUse)").show();
		appDefault.updateBodyClassWithPrefix("coverageLevel_", newCoverageLevelId);
	}
};

appDefault.updateContentForSpecificRegion = function updateContentForSpecificRegion(newRegionId, oldRegionId) {
	// Updates markup to hide elements classed as regionSpecific, except for the new selected regionId.
	if (newRegionId !== oldRegionId) {
		_trace("updateContentForSpecificRegion new: {0}, old: {1}", newRegionId, oldRegionId);
		$body.find(".regionSpecific").hide();
		$body.find(".regionSpecific." + newRegionId + ":not(.notInUse)").show();
		appDefault.updateBodyClassWithPrefix("region_", newRegionId);
	}
};

appDefault.updateContentForSpecificStatus = function updateContentForSpecificStatus(newStatusId, oldStatusId) {
	// Updates markup to hide elements classed as statusSpecific, except for the new selected statusId.
	if (newStatusId !== oldStatusId) {
		_trace("updateContentForSpecificStatus new: {0}, old: {1}", newStatusId, oldStatusId);
		$body.find(".statusSpecific").hide();
		$body.find(".statusSpecific." + newStatusId + ":not(.notInUse)").show();
		appDefault.updateBodyClassWithPrefix("status_", newStatusId);
	}
};

appDefault.updateContentForSpecificPlanPriority = function updateContentForSpecificPlanPriority(newPlanPriority, oldPlanPriority) {
	// Updates markup to hide elements classed as planPrioritySpecific, except for the new selected planPriority.
	if (newPlanPriority !== oldPlanPriority) {
		_trace("updateContentForSpecificPlanPriority new: {0}, old: {1}", newPlanPriority, oldPlanPriority);
		$body.find(".planPrioritySpecific").hide();
		$body.find(".planPrioritySpecific." + newPlanPriority + ":not(.notInUse)").show();
	}
};

appDefault.updateContentForSpecificApplyFundsOption = function updateContentForSpecificApplyFundsOption(newApplyFundsOption, oldApplyFundsOption) {
	// Updates markup to hide elements classed as applyFundsOptionSpecific, except for the new selected applyFundsOption.
	if (newApplyFundsOption !== oldApplyFundsOption) {
		_trace("updateContentForSpecificApplyFundsOption new: {0}, old: {1}", newApplyFundsOption, oldApplyFundsOption);
		$body.find(".applyFundsOptionSpecific").hide();
		$body.find(".applyFundsOptionSpecific." + newApplyFundsOption + ":not(.notInUse)").show();
		let config = appEngine.configuration, $applyFundsDetail = $body.find(".applyFundsDetail");
		if ("applyFundsToCostOfCareDropdown" in config.personalFormItems) {
			let option = appData.personal.applyFundsToCostOfCareOption;
			$applyFundsDetail.attr("data-option", option).removeClass("hiddenNotApplicable");
			$body.find(".applyFundsDescription").text(config.personalFormItems.applyFundsToCostOfCareDropdown.full[option].description);
		} else {
			$applyFundsDetail.addClass("hiddenNotApplicable");
		}
	}
};

appDefault.updateContentForOtherDropdownAnswer = function updateContentForOtherDropdownAnswer(dropdownId, newAnswer, oldAnswer) {
	// Updates markup to hide elements classed as incentive[N], except for the new selected incentive answer value.
	if (newAnswer !== oldAnswer) {
		_trace("updateContentForOtherDropdownAnswer dropdownId: {0}, newAnswer: {1}, oldAnswer: {2}", dropdownId, newAnswer, oldAnswer);
		$body.find("." + dropdownId + ".answerSpecific").hide();
		$body.find("." + dropdownId + ".answerSpecific." + newAnswer + ":not(.notInUse)").show();
	}
};

//===========================================================================================
//		Events for items in mainConfig.personalFormItems
//===========================================================================================

appDefault.onSubconfigDropdownChanged = function onSubconfigDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "subconfigDropdown" control. NOTE: By the time
	// this has been called, appData.personal.subconfig has already been assigned the new value. If a
	// specific implementation needs to change the subconfig directly, call appDefault.changeSubconfig().
	_trace("onSubconfigDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	if (newValue !== oldValue) {
		// changeSubconfig implies updates to UI, chart, and content when finished; see onAppDidCompileConfig().
		appEngine.changeSubconfig(appData.personal.subconfig);
	}
};

appDefault.onPartnerStatusDropdownChanged = function onPartnerStatusDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "partnerStatusDropdown" control. NOTE: By the time
	// this has been called, appData.personal.partnerStatus has already been assigned the new value.
	_trace("onPartnerStatusDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appStage.updateModelingContents();
	appStage.maybeAdjustSavingsSliderBounds();
	if (newValue !== oldValue) {
		appDispatch.updateContentForSpecificCoverageLevel(appData.getCoverageLevelId(), appData.getLastCoverageLevelId());
	}
};

appDefault.onNumberOfChildrenDropdownChanged = function onNumberOfChildrenDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "numberOfChildrenDropdown" control. NOTE: By the time
	// this has been called, appData.personal.numberOfChildrenStr has already been assigned the new value.
	_trace("onNumberOfChildrenDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appStage.updateModelingContents();
	appStage.maybeAdjustSavingsSliderBounds();
	if (newValue !== oldValue) {
		appDispatch.updateContentForSpecificCoverageLevel(appData.getCoverageLevelId(), appData.getLastCoverageLevelId());
	}
};

appDefault.onRegionDropdownChanged = function onRegionDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "regionDropdown" control. NOTE: By the time
	// this has been called, appData.personal.regionId has already been assigned the new value.
	_trace("onRegionDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	if (appData.features.taxCalculatorEnabled) { appStage.updateTaxCalcSelectPlans(); } // plans may vary by region
	appStage.renderDynamicFormItems($("body"));
	appDefault.onAppDidChangeDynamicItem("yourMatchingPlanDropdown", null, newValue, oldValue, []);

	appStage.updateDynamicCostsAssumptionsContent("appDefault.onRegionDropdownChanged"); // costs may vary by region
	appCharts.requestChartUpdate("appDefault.onRegionDropdownChanged");
	appStage.maybeAdjustSavingsSliderBounds();
	if (newValue !== oldValue) { appDispatch.updateContentForSpecificRegion(newValue, oldValue); }
};

appDefault.onStatusDropdownChanged = function onStatusDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "statusDropdown" control. NOTE: By the time
	// this has been called, appData.personal.statusId has already been assigned the new value.
	_trace("onStatusDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appCharts.requestChartUpdate("appDefault.onStatusDropdownChanged");
	appStage.maybeAdjustSavingsSliderBounds();
	if (newValue !== oldValue) { appDispatch.updateContentForSpecificStatus(newValue, oldValue); }
};

appDefault.onPlanPriorityChanged = function onPlanPriorityChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "planPriorityRadioButtons" control. NOTE: By the time
	// this has been called, appData.personal.planPriority has already been assigned the new value.
	_trace("onPlanPriorityChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	if (newValue !== oldValue) {
		appCharts.requestChartUpdate("appDefault.onPlanPriorityChanged");
		appDispatch.updateContentForSpecificPlanPriority(newValue, oldValue);
		// Note: Recalculating results isn't required when plan priority preference changes. The information
		// required to perform a plan recommendation is present in already-calculated results.
		if (appData.features.planRecommendationEnabled) {
			appDispatch.onAppCanMakePlanRecommendation(newValue, (appData.getMpceEngineResults()).main);
		}
	}
};

appDefault.onApplyFundsDropdownChanged = function onApplyFundsDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "applyFundsToCostOfCare" control. NOTE: By the time
	// this has been called, appData.personal.applyFundsToCostOfCareOption has already been assigned the new value.
	_trace("onApplyFundsDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appCharts.requestChartUpdate("appDefault.onApplyFundsDropdownChanged");
	if (newValue !== oldValue) { appDispatch.updateContentForSpecificApplyFundsOption(newValue, oldValue); }
};

appDefault.onOtherDropdownChanged = function onOtherDropdownChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of one of the additional dropdowns. NOTE: By the time
	// this has been called, the appData target variable has already been assigned the new value.
	_trace("onOtherDropdownChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appCharts.requestChartUpdate("appDefault.onOtherDropdownChanged");
	appStage.maybeAdjustSavingsSliderBounds();
	if (newValue !== oldValue) { appDispatch.updateContentForOtherDropdownAnswer(itemId, newValue, oldValue); }
};

//===========================================================================================
//		Events for items in mainConfig.taxCalculatorFormItems
//===========================================================================================

appDefault.onPrimaryAnnualIncomeSliderChanged = function onPrimaryAnnualIncomeSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "primaryAnnualIncomeSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.primaryAnnualIncome has already been assigned the new value.
	_trace("onPrimaryAnnualIncomeSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onPrimaryAnnualIncomeSliderChanged");
};

appDefault.onSpouseAnnualIncomeSliderChanged = function onSpouseAnnualIncomeSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "spouseAnnualIncomeSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.spouseAnnualIncome has already been assigned the new value.
	_trace("onSpouseAnnualIncomeSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onSpouseAnnualIncomeSliderChanged");
};

appDefault.onHsaEligibleExpensesSliderChanged = function onHsaEligibleExpensesSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "hsaEligibleExpensesSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.hsaEligibleExpenses has already been assigned the new value.
	_trace("onHsaEligibleExpensesSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onHsaEligibleExpensesSliderChanged");
};

appDefault.onVisionExpensesSliderChanged = function onVisionExpensesSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "visionExpensesSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.visionExpenses has already been assigned the new value.
	_trace("onVisionExpensesSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onVisionExpensesSliderChanged");
};

appDefault.onDentalExpensesSliderChanged = function onDentalExpensesSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "dentalExpensesSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.dentalExpenses has already been assigned the new value.
	_trace("onDentalExpensesSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onDentalExpensesSliderChanged");
};

appDefault.onOtherExpensesSliderChanged = function onOtherExpensesSliderChanged(itemId, newValue, oldValue) {
	// Called when the user changes the value of the "otherExpensesSlider" control. NOTE: By the time
	// this has been called, appData.taxCalc.otherExpenses has already been assigned the new value.
	_trace("onOtherExpensesSliderChanged: itemId: {0}, newValue: {1}, oldValue: {2}", itemId, newValue, oldValue);

	appTaxChart.requestChartUpdate("appDefault.onOtherExpensesSliderChanged");
};

//===========================================================================================
//		Events specific to the wizard guided Q&A feature
//===========================================================================================

// eslint-disable-next-line no-unused-vars
appDefault.onWizardWillProcessConfig = function onWizardWillProcessConfig(wizardConfig) {
	// If present, onWizardWillProcessConfig() is called before the wizardConfig object is processed.
	// Custom code has an opportunity to modify the wizard configuration before it is processed.
	_trace("onWizardWillProcessConfig");

	let potentiallyModifiedConfig = wizardConfig;
	return potentiallyModifiedConfig;
};

// eslint-disable-next-line no-unused-vars
appDefault.onWizardDidProcessConfig = function onWizardDidProcessConfig(wizardConfig) {
	// If present, onWizardDidProcessConfig() is called after the wizardConfig object has been processed.
	// Custom code has an opportunity to modify some appWizard state including sections, sectionsOrder,
	// slides, slidesOrder, initialSlide, and answerKinds before any rendering of the wizard UI.
	_trace("onWizardDidProcessConfig");
};

appDefault.onWizardWillRenderUI = function onWizardWillRenderUI() {
	// If present, onWizardWillRenderUI() is called before the wizard has rendered its user interface
	// elements into #wizardSection. Custom code has an opportunity to modify wizard state before any
	// rendering has taken place.
	_trace("onWizardWillRenderUI");
};

appDefault.onWizardDidRenderUI = function onWizardDidRenderUI() {
	// If present, onWizardDidRenderUI() is called after the wizard has rendered its user interface
	// elements into #wizardSection. Custom code has an opportunity to mark up generated UI elements.
	_trace("onWizardDidRenderUI");
};

appDefault.onWizardWillChangeSlides = function onWizardWillChangeSlides(currentSlideId, newSlideId, direction) {
	// If present, onWizardWillChangeSlides() is called before the wizard will change slides.
	_trace("onWizardWillChangeSlides: currentSlideId: {0}, newSlideId: {1}, direction: {2}", currentSlideId, newSlideId, direction);
};

appDefault.onWizardWillHideSummary = function onWizardWillHideSummary(slideId) {
	// If present, onWizardWillHideSummary() is called when the wizard will hide the slide summary area.
	_trace("onWizardWillHideSummary: slideId: {0}", slideId);
};

appDefault.onWizardWillShowSummary = function onWizardWillShowSummary(slideId) {
	// If present, onWizardWillHideSummary() is called when the wizard will show the slide summary area.
	_trace("onWizardWillShowSummary: slideId: {0}", slideId);
};

appDefault.onWizardWillUpdateSummary = function onWizardWillUpdateSummary(slideId) {
	// If present, onWizardWillUpdateSummary() is called when the wizard will update the slide summary area.
	_trace("onWizardWillUpdateSummary: slideId: {0}", slideId);
};

appDefault.onWizardDidUpdateSummary = function onWizardDidUpdateSummary(slideId) {
	// If present, onWizardWillUpdateSummary() is called when the wizard did update the slide summary area.
	// Custom code may use this to add elements to the summary not handled automatically by the wizard, or
	// adjust markup in the summary generated by the wizard.
	_trace("onWizardDidUpdateSummary: slideId: {0}", slideId);
};

appDefault.onWizardDidChangeSlides = function onWizardDidChangeSlides(oldSlideId, currentSlideId, direction) {
	// If present, onWizardDidChangeSlides() is called after the wizard changed slides.
	_trace("onWizardDidChangeSlides: oldSlideId: {0}, currentSlideId: {1}, direction: {2}", oldSlideId, currentSlideId, direction);
};

appDefault.onWizardWillStart = function onWizardWillStart() {
	// If present, onWizardWillStart() is called before the wizard is to be the initial tool view shown to the
	// user. If the full tool is the initial view to be seen by the user, whether by virtue of configuration
	// or the user having selected the full tool on the launch page, onWizardWillStart() won't be called.
	_trace("onWizardWillStart");

	let proceedWithStart = true;
	return proceedWithStart;
};

appDefault.onWizardDidStart = function onWizardDidStart(initialSlideId, initialSectionId) {
	// If present, onWizardDidStart() is called after the wizard has been displayed as the initial tool view shown
	// to the user. If the full tool is the initial view to be seen by the user, whether by virtue of configuration
	// or the user having selected the full tool on the launch page, onWizardDidStart() won't be called.
	_trace("onWizardDidStart: initialSlideId: {0}, initialSectionId: {1}", initialSlideId, initialSectionId);
};

appDefault.onWizardWillSwitchToFullTool = function onWizardWillSwitchToFullTool(slideId) {
	// If present, onWizardWillSwitchToFullTool() is called before the tool switches to the full tool view.
	// At this time, the wizard view is still visible and the full tool view is not.
	_trace("onWizardWillSwitchToFullTool: slideId: {0}", slideId);
};

appDefault.onWizardDidSwitchToFullTool = function onWizardDidSwitchToFullTool(slideId) {
	// If present, onWizardDidSwitchToFullTool() is called after the tool switches to the full tool view.
	// At this time, the wizard view is no longer visible, while the full tool view is visible.
	_trace("onWizardDidSwitchToFullTool: slideId: {0}", slideId);
};

appDefault.onWizardWillSwitchToWizard = function onWizardWillSwitchToWizard(slideId) {
	// If present, onWizardWillSwitchToWizard() is called before the tool switches to the wizard view.
	// At this time, the wizard UI is not visible, while the full tool view is visible.
	_trace("onWizardWillSwitchToWizard: slideId: {0}", slideId);
};

appDefault.onWizardDidSwitchToWizard = function onWizardDidSwitchToWizard(slideId) {
	// If present, onWizardDidSwitchToWizard() is called after the tool switches to the wizard view.
	// At this time, the wizard UI is visible, while the full tool view is no longer visible.
	_trace("onWizardDidSwitchToWizard: slideId: {0}", slideId);
};

appDefault.onWizardUserSelectedAnswer = function onWizardUserSelectedAnswer(slideId, answerKind, answerId) {
	// If present, onWizardUserSelectedAnswer() is called after the user selected an answer on a slide.
	_trace("onWizardUserSelectedAnswer: slideId: {0}, answerKind: {1}, answerId: {2}", slideId, answerKind, answerId);
};

appDefault.onWizardUserReachedLastSlide = function onWizardUserReachedLastSlide() {
	// If present, onWizardUserReachedLastSlide() is called after the user has reached the last available slide.
	_trace("onWizardUserReachedLastSlide");
};

appDefault.setUpMpceEngineDevUI = function setUpMpceEngineDevUI() {
	// For development purposes only. Sets up a compact web UI to facilitate MPCE engine development.
	require(["mainConfig"], function required(mainConfig) {
		Object.assign(mainConfig.general, {
			wizardEnabled: false,
			showUserAgreementOnLaunch: false,
			simplifiedModelingEnabled: false,
			detailedModelingShowCategoryHeadings: false,
			planProvisionsFeature: false,
			planRecommendationEnabled: false,
			simpleFeedbackEnabled: false,
			videoLibraryEnabled: false,
			taxCalculatorEnabled: false,
			sliderLiveUpdating: false,
			disableJQueryEffects: true
		});
		Object.assign(mainConfig.mainChartSection, {
			showWorstCaseCostsFeature: false,
			showTotalCostsFeature: false
		});
	});
	$head.append("<style>\n" +
		"div.topmost.container-fluid { max-width: 2000px; padding: 0; }\n" +
		".sectionBody { padding-top: 0; padding-bottom: 3px; }\n" +
		".detailedModelingContents table { margin-bottom: 2px; }\n" +
		".detailedModelingContents table th.person { display: none; }\n" +
		".detailedModelingContents table td .form-control { height: unset; }\n" +
		"#mpceTraceOutput { font-family: monospace; font-size: 12px; }\n" +
		"</style>\n");
	$body.find("#pageHeader, #pageFooter, #personalSection").addClass("notInUse");
	$body.find("#adjustSection .sectionHeader, #adjustSection .sectionBody > .row > p.col-md-12").addClass("notInUse");
	$body.find("#mainChartOuter").append("<hr><button class='saveScenarioButton nakedButton'>Save scenario</button><br>");
	$body.find("#mainChartOuter").append("<button class='clearScenarioButton nakedButton'>Clear scenario</button>");
	// detailedModelingContents is rendered only at run time
	$body.find("#mpceSection .sectionHeader, #mpceSection .savingsArea").addClass("notInUse");
	$body.find("#mainChartOuter").removeClass("col-xl-6").addClass("col-xl-4");
	$body.find("#mainChartOuter").after("<div class='col-xl-8'><textarea id='mpceTraceOutput' rows='38' cols='140'></textarea></div>");
	$mpceTraceOutput = $body.find("#mpceTraceOutput");
	window.mpce.trace.categoriesFilter = { "*": false, mpce: true };
	trace.enableTextAreaLogging("mpceTraceOutput");
};

_trace("module() returning");
return appDefault;
});
