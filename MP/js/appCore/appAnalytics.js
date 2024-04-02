//-------------------------------------------------------------------------------------------------
// appAnalytics.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(["trace", "utility"],
/**
 * @param {object} trace
 * @param {object} utility
 * @returns {object}
 */
function module(trace, utility) {
"use strict";

/**
 * @name AppAnalytics
 * @type {{
 *   initializeAsync: Function
 *   isEnabled: Function
 *   trackHelpModalEvent: Function
 *   trackCustomEvent: Function
 * }}
 */
let appAnalytics = {};
let _trace = trace.categoryWriteLineMaker("appAnalytics");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appAnalytics"); } }; tick();

let isNullOrUndefined = utility.isNullOrUndefined, _matomoPaq = null, _enabled = null;

// Object describing which appDispatch methods will be tracked as simple analytics events.
// Each key maps an appDispatch method name to an event name to send to Matomo. Methods tracked
// in this manner will not carry any event value data.
let	_appDispatchSimpleTrackedMethodsMap = {
	"onAppDidDisplayUserAgreement": "DisplayedUserAgreement",
	"onUserAcceptedUserAgreement": "AcceptedUserAgreement",
	"onUserRejectedUserAgreement": "RejectedUserAgreement",
	"onWizardWillStart": "StartedWithWizard",
	"onAppDidSwitchToSimplifiedModeling": "SwitchedToSimplifiedModeling",
	"onAppDidSwitchToDetailedModeling": "SwitchedToDetailedModeling",
	"onAppDidSwitchToTaxView": "SwitchedToTaxView",
	"onAppDidSwitchToMpceView": "SwitchedToMpceView",
	"onUserDidPrintResults": "PrintedResults",
	"onUserDidSaveScenario": "SavedScenario",
	"onAppDidLoadWithScenario": "LoadedWithScenario",
	"onWizardDidSwitchToFullTool": "SwitchedToFullTool",
	"onWizardDidSwitchToWizard": "SwitchedToWizard",
	"onWizardUserReachedLastSlide": "WizardReachedLastSlide"
};

appAnalytics.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let analyticsEnabled =
				!isNullOrUndefined(window.mpceMatomo) && !isNullOrUndefined(window.mpceMatomo.url) && !isNullOrUndefined(window._paq);

			if (analyticsEnabled) {
				_trace("Matomo was set up; analytics enabled.");
				_matomoPaq = window._paq;
				_enabled = true;
				let _trackEventImpl = function trackEventImpl(dispatchFuncName, eventName, eventValue) {
					_trace("trackEvent: eventName: {0}, eventValue: {1}", eventName, eventValue);
					_matomoPaq.push(["trackEvent", eventName, eventValue || "default"]);
				};
				Object.keys(_appDispatchSimpleTrackedMethodsMap).forEach(function each(appDispatchMethodName) {
					let matomoEventName = _appDispatchSimpleTrackedMethodsMap[appDispatchMethodName];
					appAnalytics[appDispatchMethodName] = function trackEvent() { _trackEventImpl(appDispatchMethodName, matomoEventName); };
				});
				appAnalytics.trackHelpModalEvent = function trackHelpModalEvent(helpModalId) {
					_trace("trackHelpModalEvent: helpModalId: {0}", helpModalId);
					_matomoPaq.push(["trackEvent", "HelpModal", helpModalId]);
				};
				appAnalytics.trackCustomEvent = function trackCustomEvent(eventName, eventValue) {
					_trace("trackCustomEvent: eventName: {0}, eventValue: {1}", eventName, eventValue);
					_matomoPaq.push(["trackEvent", eventName, eventValue || "default"]);
				};
			} else {
				_trace("Matomo was not set up; analytics disabled.");
				_enabled = false;
			}

			resolve();
		}, params.delayMsec || 0);
	});
};

appAnalytics.isEnabled = function isEnabled() {
	return _enabled;
};

appAnalytics.trackHelpModalEvent = function noOp() {
	// If analytics is enabled, trackHelpModal gets assigned an implementation in initializeAsync.
};

appAnalytics.trackCustomEvent = function noOp() {
	// If analytics is enabled, trackCustomEvent gets assigned an implementation in initializeAsync.
};

_trace("module() returning");
return appAnalytics;
});
