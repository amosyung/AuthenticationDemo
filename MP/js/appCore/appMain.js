//-------------------------------------------------------------------------------------------------
// appMain.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(
["jquery", "trace", "utility", "mainConfig", "appAnalytics", "appCharts", "appTaxChart", "appData", "appDefault",
	"appDispatch", "appEngine", "appStage", "appText", "appValidation", "mpceEngine", "fsaeEngine", "clientCustom", "jqueryUI", "touchPunch"],
/**
 * @param {object} $
 * @param {object} trace
 * @param {object} utility
 * @param {MainConfig} mainConfig
 * @param {AppAnalytics} appAnalytics
 * @param {AppCharts} appCharts
 * @param {AppTaxChart} appTaxChart
 * @param {AppData} appData
 * @param {AppDefault} appDefault
 * @param {AppDispatch} appDispatch
 * @param {AppEngine} appEngine
 * @param {AppStage} appStage
 * @param {AppText} appText
 * @param {AppValidation} appValidation
 * @param {object} mpceEngine
 * @param {object} fsaeEngine
 * @param {object} clientCustom
 * @returns {object}
 */
function module($, trace, utility, mainConfig, appAnalytics, appCharts, appTaxChart, appData, appDefault,
	appDispatch, appEngine, appStage, appText, appValidation, mpceEngine, fsaeEngine, clientCustom) {
"use strict";

/**
 * @name AppMain
 * @type {{
 *   appCoreVersion: string
 *   begin: Function
 * }}
 */
let appMain = {};
let _trace = trace.categoryWriteLineMaker("appMain");
_trace("module() called");

let strFmt = utility.stringFormat, $body = $("body");

// IMPORTANT: The core tool version below should be updated only when changes are made to the
// common application core ("appCore/"), and not otherwise. For client site versioning, use
// the client-specific release number and year found at the top of clientCustom.js.
appMain.appCoreVersion = "2.73";

let _initializeCoreModuleAsync = function initializeCoreModuleAsync(coreModule, coreModuleId) {
	let initParams = { delayMsec: 1 };
	return new Promise(function executor(resolve, reject) {
		let errorMessage;
		if (coreModule) {
			_trace("About to initialize core module {0}.", coreModuleId);
			window.mpce[coreModuleId] = coreModule; // helps with debugging
			appDispatch.onCoreModuleWillInitialize(coreModuleId);
			if (typeof coreModule.initializeAsync === "function") {
				coreModule.initializeAsync(initParams).then(function resolved() {
					appDispatch.onCoreModuleDidInitialize(coreModuleId, coreModule);
					resolve();
				}, function rejected() {
					appDispatch.onCoreModuleFailedToInitialize(coreModuleId);
					_trace(errorMessage = strFmt("Core module {0} failed to initialize", coreModuleId));
					reject(new Error(errorMessage));
				});
			} else {
				_trace(errorMessage = strFmt("Core module {0} doesn't have an initializeAsync method.", coreModuleId));
				reject(new Error(errorMessage));
			}
		} else {
			_trace(errorMessage = strFmt("Core module {0} object reference was null or undefined.", coreModuleId));
			reject(new Error(errorMessage));
		}
	});
};

appMain.begin = function begin() {
	_trace("begin");

	$(function onDocumentReady() {
		_trace("appMain $(document).ready()");
		let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appMain"); } };
		tick();

		// Validate the main configuration and report resulting errors if necessary.
		appDispatch.onAppCoreWillValidateMainConfig(mainConfig);
		try {
			appValidation.checkConfig(mainConfig, "mainConfig", false); // false = do throw if any error(s)
		} catch (e) {
			appDefault.showError(e.toString());
			throw e;
		}
		appDispatch.onAppCoreDidValidateMainConfig(mainConfig);
		tick();

		// Initialize the application core modules -- except the optional wizard, which gets handled later if enabled.
		appDispatch.onAppCoreWillInitialize(mainConfig);

		let p0 = Promise.resolve();
		p0.then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appAnalytics, "appAnalytics");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appDefault, "appDefault");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appDispatch, "appDispatch");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appEngine, "appEngine");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appData, "appData");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appCharts, "appCharts");
		}).then(function resolved() {
			tick();
			if (appData.features.taxCalculatorEnabled) {
				return _initializeCoreModuleAsync(appTaxChart, "appTaxChart");
			}
			return Promise.resolve();
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appText, "appText");
		}).then(function resolved() {
			tick();
			return _initializeCoreModuleAsync(appStage, "appStage");
		}).then(function resolved() {
			tick();
			_trace("appMain finished initializing core modules.");
			let _features = appData.features;
			$.fx.off = _features.disableJQueryEffects;

			let scenarioLoaded = appData.scenarioLoaded;
			if (scenarioLoaded) { _trace("appData had loaded a saved scenario."); }

			// Add tooltip to copyright notice with relevant version/release numbers.
			$body.find("#copyrightNotice, .copyrightNotice").attr("title", strFmt("v. {0} / {1} / {2} ({3})",
				appMain.appCoreVersion, mpceEngine.version, clientCustom.releaseNumber, clientCustom.releaseYear));

			// If the wizard feature is enabled and there's a spot for it in the application markup that isn't marked not in use,
			// then attempt to load the wizard's modules and initialize the main wizard module as another core module so it can
			// reference parts of the app core it needs.
			let $wizardSection = $body.find("#wizardSection");
			if (_features.wizardEnabled && $wizardSection.length > 0 && !$wizardSection.hasClass("notInUse")) {

				let wizardConfigName = window.mpce.wizardConfigName = appData.features.wizardConfigName;
				require([wizardConfigName, "appWizard"], function wizardModulesLoaded(wizardConfig, appWizard) {
						tick();
						_trace("Wizard modules successfully loaded.");
						_initializeCoreModuleAsync(appWizard, "appWizard").then(function resolved2() {
							tick();
							if (!_features.fullToolEnabled) {
								_trace("Will start with wizard UI because mainConfig.general.fullToolEnabled is false.");
								_features.startingWithWizard = true;
							} else {
								// The full tool is enabled. Whether to start in the wizard or not depends on a handful of conditions.
								_trace("Both the wizard UI and full tool UI are enabled. wizardConfigName: {0}", wizardConfigName);
								if (scenarioLoaded) {
									if (wizardConfigName === "wizardConfigGuideMe") {
										if (appData.personal.savedDuringWizard) {
											_trace("Will start loaded scenario in the wizard UI because it was saved while in the wizard UI.");
											_features.startingWithWizard = true;
										} else {
											_trace("Will start loaded scenario in the full tool UI it was saved while in the full tool UI.");
											_features.startingWithWizard = false;
										}
									} else if (wizardConfigName === "wizardConfigPersonas") {
										_trace("Will start loaded scenario in the full tool UI because wizardConfigName is wizardConfigPersonas.");
										_features.startingWithWizard = false;
									}
								} else if (window.location.hash === "#guided" || window.location.hash === "#wizard") {
									_trace("Will start with wizard UI first because URL has one of #guided or #wizard.");
									_features.startingWithWizard = true;
								} else if (window.location.hash === "#fullTool") {
									_trace("Will start with full tool UI first because URL has #fullTool.");
									_features.startingWithWizard = false;
								} else if (wizardConfigName === "wizardConfigPersonas") {
									_trace("Will start with wizard UI because wizardConfigName is wizardConfigPersonas and URL has no override.");
									_features.startingWithWizard = true;
								} else if (_features.startingWithWizard) {
									_trace("Will start with wizard UI because no other conditions overrode mainConfig.general.startingWithWizard.");
								} else {
									_trace("Will start with full tool UI; no anchor link or configuration requesting wizard first.");
								}
							}
							appDefault.maybeFetchDataBeforeFinishAppInit(_features.startingWithWizard);
							tick();
						});
					},
					function wizardModulesFailedToLoad(/* err */) {
						_trace("mainConfig.general.wizardEnabled was true but either of wizardConfig or appWizard modules could not load; " +
							"assuming tool excludes wizard.");
						_features.fullToolEnabled = true;
						_features.wizardEnabled = _features.startingWithWizard = false;
						appDefault.maybeFetchDataBeforeFinishAppInit(false);
						tick();
					});

			} else {
				if (_features.wizardEnabled) {
					_trace("mainConfig.general.wizardEnabled was true but #wizardSection element not found; proceeding with full tool only.");
				} else {
					_trace("mainConfig.general.wizardEnabled is false; proceeding with full tool only.");
				}
				_features.fullToolEnabled = true;
				_features.wizardEnabled = _features.startingWithWizard = false;
				appDefault.maybeFetchDataBeforeFinishAppInit(false);
				tick();
			}
		});
	});
};

_trace("module() returning");
return appMain;
});
