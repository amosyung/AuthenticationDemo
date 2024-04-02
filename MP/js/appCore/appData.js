//-------------------------------------------------------------------------------------------------
// appData.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(["jquery", "trace", "utility", "appDispatch", "appEngine", "mpceEngine", "LZString", "Vuex"],
/**
 * @param {object} $
 * @param {object} trace
 * @param {object} utility
 * @param {AppDispatch} appDispatch
 * @param {AppEngine} appEngine
 * @param {MpceEngine} mpceEngine
 * @param {object} LZString
 * @returns {object}
 */
function module($, trace, utility, appDispatch, appEngine, mpceEngine, LZString) {
"use strict";

/**
 * @name AppData
 * @type {{
 *   vuexStore: Vuex.Store
 *   disclaimerAccepted: boolean
 *   scenarioLoaded: boolean
 *   scenarioLoadingError: boolean
 *   mpceCalculateArgs: object
 *   setMpceEngineResults: Function
 *   getMpceEngineResults: Function
 *   fsaeCalculateArgs: object
 *   fsaeEngineResults: object
 *   features: object
 *   personal: object
 *   custom: object
 *   taxCalc: object
 *   initializeAsync: Function
 *   hasSpouse: Function
 *   hasChildren: Function
 *   getCoverageLevelId: Function
 *   getLastCoverageLevelId: Function
 *   getModelingInputsOrderedIds: Function
 *   getModelingInputsForPerson: Function
 *   addPersonModelingInputsObject: Function
 *   updateModelingInputsForSubconfigChange: Function
 *   setSimplifiedModelingUsageCategoryOption: Function
 *   getSimplifiedModelingUsageCategoryOption: Function
 *   setDetailedModelingUsageCategoryOption: Function
 *   getDetailedModelingServiceCounts: Function
 *   getDetailedModelingUsageCategoryOption: Function
 *   setDetailedModelingPersonServiceCount: Function
 *   getDetailedModelingPersonServiceCount: Function
 *   makeMpcePersonInputsObjects: Function
 *   personInputsObjectsFromSimplified: Function
 *   personInputsObjectsFromDetailed: Function
 *   getEnabledPersonIds: Function
 *   getDisabledPersonIds: Function
 *   saveScenario: Function
 *   maybeLoadSavedScenario: Function
 * }}
 */
let appData = {};
let _trace = trace.categoryWriteLineMaker("appData");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appData"); } }; tick();

let isNullOrUndefined = utility.isNullOrUndefined, $body = $("body"), _lastCoverageLevelId, _maximumNumberOfChildren = 5;

let _ts = function traceSet(propName, value) { _trace("{0} set: {1}", propName, value); };

appData.disclaimerAccepted = false;
appData.scenarioLoaded = false;
appData.scenarioLoadingError = false;

appData.mpceCalculateArgs = null; // the args that'll be passed to appEngine.mpceCalculate()
appData.fsaeCalculateArgs = null; // the args that'll be passed to appEngine.fsaeCalculate()

let _mpceEngineResults = null; // the results that'll come back from appEngine.mpceCalculate()
appData.fsaeEngineResults = null; // the results that'll come back from appEngine.fsaeCalculate()

appData.setMpceEngineResults = function setMpceEngineResults(results) {
	_mpceEngineResults = results;
	appData.vuexStore.dispatch("setMpceEngineResults", results);
};
appData.getMpceEngineResults = function getMpceEngineResults() { return _mpceEngineResults; };

appData.vuexStore = Vuex.createStore({
	state: {
		mpceEngineResults: {},
		allPersonas: {},
		coverageLevelId: "employeeOnly",
		usageLevelId: "low",
		preferenceId: "lowerPremiums",
		winningPlanName: null,
		winningPlanId: null
	},
	getters: {
		mainResults: function get(state) {
			let result = state.mpceEngineResults.main;
			return result;
		},
		personaId: function get(state) {
			let result = state.coverageLevelId + "_" + utility.capitalizeFirstLetter(state.usageLevelId); // e.g. "employeeOnly_Low"
			return result;
		},
		persona: function get(state, getters) {
			let result = state.allPersonas[getters.personaId];
			return result;
		},
		usageAssumptions: function get(state, getters) {
			let result = getters.persona.usageAssumptions;
			return result;
		},
		winningPlanId: function get(state) {
			let mainResults = state.mpceEngineResults.hasOwnProperty("main") ? state.mpceEngineResults.main : null;
			let result = isNullOrUndefined(mainResults) ? null : mainResults.plansByPlanPriority[0].planId;
			return result;
		},
		winningPlanName: function get(state, getters) {
			let winningPlanId = getters.winningPlanId, result = appEngine.configuration.plans[winningPlanId].description;
			return result;
		},
		partnerStatus: function get(state) {
			let c = state.coverageLevelId, result = (c === "employeeAndSpouse" || c === "employeeAndFamily") ? "hasSpouseOrDP" : "noSpouseOrDP";
			return result;
		},
		numberOfChildren: function get(state, getters) {
			let result = getters.usageAssumptions.hasOwnProperty("childrenArray") ? getters.usageAssumptions.childrenArray.length : 0;
			return result;
		}
	},
	mutations: {
		SET_MPCE_ENGINE_RESULTS: function m(s, v) { return (s.mpceEngineResults = v); },
		SET_ALL_PERSONAS: function m(s, v) { return (s.allPersonas = v); },
		SET_COVERAGE_LEVEL_ID: function m(s, v) { return (s.coverageLevelId = v); },
		SET_USAGE_LEVEL_ID: function m(s, v) { return (s.usageLevelId = v); },
		SET_PREFERENCE_ID: function m(s, v) { return (s.preferenceId = v); }
	},
	actions: {
		setMpceEngineResults: function a(c, v) { c.commit("SET_MPCE_ENGINE_RESULTS", v); },
		setAllPersonas: function a(c, v) { c.commit("SET_ALL_PERSONAS", v); },
		setCoverageLevelId: function a(c, v) { c.commit("SET_COVERAGE_LEVEL_ID", v); },
		setUsageLevelId: function a(c, v) { c.commit("SET_USAGE_LEVEL_ID", v); },
		setPreferenceId: function a(c, v) { c.commit("SET_PREFERENCE_ID", v); }
	}
});

// appData.features holds information related to which MPCE tool features are enabled and how.
// Don't change the values below. For client implementations, adjust the values in mainConfig.js.
appData.features = Object.seal({
	// Settings from mainConfig.general
	wizardEnabled: false,
	wizardConfigName: null,
	fullToolEnabled: true,
	startingWithWizard: false,
	showUserAgreementOnLaunch: true,
	simplifiedModelingEnabled: true,
	detailedModelingEnabled: true,
	chronicConditionModelingEnabled: true,
	bothModelingModesEnabled: true, // derived
	defaultModelingMode: "simplified",
	detailedModelingShowCategoryHeadings: true,
	detailedModelingServiceCountMax: 99,
	saveScenarioEnabled: true,
	planRecommendationEnabled: true,
	simpleFeedbackEnabled: true,
	videoLibraryEnabled: true,
	taxCalculatorEnabled: true,
	sliderLiveUpdating: true,
	disableJQueryEffects: false,
	fetchSsoProfileData: false,
	ssoGetProfileDataEndpoint: null,
	deferToolUserInterfaceUnhide: false,
	// Settings from mainConfig.mainChartSection
	showOopCostsDetails: true,
	showEmployeePremiumsDetails: true,
	showEmployerPremiumsDetails: true,
	showWorstCaseCostsFeature: true,
	showWorstCaseCostsDefault: false,
	showTotalCostsFeature: true,
	showTotalCostsDefault: false,
	summarizeEmployerCosts: false,
	summarizeEmployeeCosts: false,
	planProvisionsFeature: true,
	includeDentalProvisions: true,
	// Settings from mainConfig.savingsAccountSection
	applyFundsToCostOfCareFeature: true,
	overAge55Default: false,
	savingsSliderStepAmount: 10,
	hsaContributionsFeature: true,
	hsaContributionAmountDefault: 0,
	fsaContributionsFeature: true,
	fsaContributionAmountDefault: 0,
	fsaMaximumPermittedRollover: 0,
	fsaMaximumPermittedRolloverExcludesPlanFundAmount: true,
	carryoverAmountFeature: false,
	carryoverAmountSliderMaximum: 5000,
	carryoverAmountSliderStepAmount: 50,
	hsaOrFsaContributionsFeature: true, // derived
	anyContributionsFeature: true // derived
});
let _features = appData.features; // shortcut

// _scenario provides all backing storage for appData.personal, appData.custom, appData.taxCalc, and for both
// simplified and detailed modeling inputs. The _scenario object can be JSON-serialized, compressed, and
// encoded for use as a query string parameter, enabling users to load previously saved scenarios from a URL.
let _scenario = Object.seal({
	savedDuringWizard: null,
	currentModelingMode: null,
	showWorstCaseCosts: false,
	showTotalCosts: false,
	applyFundsToCostOfCareOption: "applyAllFunds",
	overAge55: false,
	hsaContributionAmount: 0,
	fsaContributionAmount: 0,
	carryoverAmount: 0,
	subconfig: null,
	regionId: null,
	statusId: null,
	partnerStatus: null,
	numberOfChildren: 0,
	planPriority: null,
	modelingInputs: {},
	modelingInputsOrderedIds: [],
	custom: {},
	fsaeSelectedPlanId: null,
	fsaeAccountTypeId: null,
	taxFilingStatus: "single",
	taxNumDependents: 0,
	primaryAnnualIncome: 0,
	spouseAnnualIncome: 0,
	spouseAnnualIncomePreserved: 0,
	hsaEligibleExpenses: 0,
	visionExpenses: 0,
	dentalExpenses: 0,
	otherExpenses: 0
});

let	_modelingInputs = _scenario.modelingInputs; // shortcut
let _modelingInputsOrderedIds = _scenario.modelingInputsOrderedIds; // shortcut

// appData.personal holds information related to the MPCE calculation. Most values are set
// automatically from controls created based on mainConfig.personalFormItems.
appData.personal = Object.seal({

	get savedDuringWizard() { return _scenario.savedDuringWizard; },

	get currentModelingMode() { return _scenario.currentModelingMode; },
	set currentModelingMode(v) { _ts("currentModelingMode", v); _scenario.currentModelingMode = v; },

	get showWorstCaseCosts() { return _scenario.showWorstCaseCosts; },
	set showWorstCaseCosts(v) { _ts("showWorstCaseCosts", v); _scenario.showWorstCaseCosts = v; },

	get showTotalCosts() { return _scenario.showTotalCosts; },
	set showTotalCosts(v) { _ts("showTotalCosts", v); _scenario.showTotalCosts = v; },

	get applyFundsToCostOfCareOption() { return _scenario.applyFundsToCostOfCareOption; },
	set applyFundsToCostOfCareOption(v) { _ts("applyFundsToCostOfCareOption", v); _scenario.applyFundsToCostOfCareOption = v; },

	get overAge55() { return _scenario.overAge55; },
	set overAge55(v) { _ts("overAge55", v); _scenario.overAge55 = v; },

	get hsaContributionAmount() { return _scenario.hsaContributionAmount; },
	set hsaContributionAmount(v) { _ts("hsaContributionAmount", v); _scenario.hsaContributionAmount = v; },

	get fsaContributionAmount() { return _scenario.fsaContributionAmount; },
	set fsaContributionAmount(v) { _ts("fsaContributionAmount", v); _scenario.fsaContributionAmount = v; },

	get carryoverAmount() { return _scenario.carryoverAmount; },
	set carryoverAmount(v) { _ts("carryoverAmount", v); _scenario.carryoverAmount = v; },

	get subconfig() { return _scenario.subconfig; },
	set subconfig(v) { _ts("subconfig", v); _scenario.subconfig = v; },

	get regionId() { return _scenario.regionId; },
	set regionId(v) { _ts("regionId", v); _scenario.regionId = v; },

	get statusId() { return _scenario.statusId; },
	set statusId(v) { _ts("statusId", v); _scenario.statusId = v; },

	get partnerStatus() { return _scenario.partnerStatus; },
	set partnerStatus(v) {
		_ts("partnerStatus", v);
		_lastCoverageLevelId = appData.getCoverageLevelId();
		_scenario.partnerStatus = v;
		_modelingInputs.spouse.enabled = v && v.startsWith("hasSpouseOrDP"); // n.b. allows for multi "hasSpouseOrDP_" values
	},

	get numberOfChildren() { return _scenario.numberOfChildren; },
	get numberOfChildrenStr() { return _scenario.numberOfChildren.toString(); },
	set numberOfChildrenStr(v) {
		_ts("numberOfChildrenStr", v);
		_lastCoverageLevelId = appData.getCoverageLevelId();
		let numberOfChildren = parseInt(v, 10);
		_scenario.numberOfChildren = numberOfChildren;
		for (let childIndex = 1; childIndex <= _maximumNumberOfChildren; childIndex += 1) {
			let childId = "child" + childIndex;
			_modelingInputs[childId].enabled = childIndex <= numberOfChildren;
		}
	},

	get planPriority() { return _scenario.planPriority; },
	set planPriority(v) { _ts("planPriority", v); _scenario.planPriority = v; }
});
let _personal = appData.personal; // shortcut

// appData.custom can hold additional user inputs specific to a client implementation, such as answers
// for additional client-specific dropdowns; e.g wellness, tobacco surcharge, spousal surcharge, etc.
Object.defineProperty(appData, "custom", { get: function getCustom() { return _scenario.custom; } });

// appData.taxCalc holds information related to the FSAE calculation. Some values are set
// automatically from controls created based on mainConfig.taxCalculatorFormItems.
appData.taxCalc = Object.seal({

	get fsaeSelectedPlanId() { return _scenario.fsaeSelectedPlanId; },
	set fsaeSelectedPlanId(v) { _ts("fsaeSelectedPlanId", v); _scenario.fsaeSelectedPlanId = v; },

	get fsaeAccountTypeId() { return _scenario.fsaeAccountTypeId; },
	set fsaeAccountTypeId(v) { _ts("fsaeAccountTypeId", v); _scenario.fsaeAccountTypeId = v; },

	get taxFilingStatus() { return _scenario.taxFilingStatus; },
	set taxFilingStatus(v) { _ts("taxFilingStatus", v); _scenario.taxFilingStatus = v; },

	get taxNumDependents() { return _scenario.taxNumDependents; },
	get taxNumDependentsStr() { return _scenario.taxNumDependents.toString(); },
	set taxNumDependentsStr(v) { _ts("taxNumDependentsStr", v); _scenario.taxNumDependents = parseInt(v, 10); },

	get primaryAnnualIncome() { return _scenario.primaryAnnualIncome; },
	set primaryAnnualIncome(v) { _ts("primaryAnnualIncome", v); _scenario.primaryAnnualIncome = v; },

	get spouseAnnualIncome() { return _scenario.spouseAnnualIncome; },
	set spouseAnnualIncome(v) { _ts("spouseAnnualIncome", v); _scenario.spouseAnnualIncome = v; },

	get spouseAnnualIncomePreserved() { return _scenario.spouseAnnualIncomePreserved; },
	set spouseAnnualIncomePreserved(v) { _ts("spouseAnnualIncomePreserved", v); _scenario.spouseAnnualIncomePreserved = v; },

	get hsaEligibleExpenses() { return _scenario.hsaEligibleExpenses; },
	set hsaEligibleExpenses(v) { _ts("hsaEligibleExpenses", v); _scenario.hsaEligibleExpenses = v; },

	get visionExpenses() { return _scenario.visionExpenses; },
	set visionExpenses(v) { _ts("visionExpenses", v); _scenario.visionExpenses = v; },

	get dentalExpenses() { return _scenario.dentalExpenses; },
	set dentalExpenses(v) { _ts("dentalExpenses", v); _scenario.dentalExpenses = v; },

	get otherExpenses() { return _scenario.otherExpenses; },
	set otherExpenses(v) { _ts("otherExpenses", v); _scenario.otherExpenses = v; }
});

appData.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let config = appEngine.configuration;

			[config.general, config.mainChartSection, config.savingsAccountSection].forEach(function each(settingsObject) {
				if (settingsObject) {
					Object.keys(settingsObject).forEach(function eachKey(key) {
						if (key in _features) { _features[key] = settingsObject[key]; }
					});
				}
			});

			if (!_features.simplifiedModelingEnabled && !_features.detailedModelingEnabled) {
				_features.simplifiedModelingEnabled = true;
			}
			_features.bothModelingModesEnabled = _features.simplifiedModelingEnabled && _features.detailedModelingEnabled;
			if (!_features.bothModelingModesEnabled) {
				_features.defaultModelingMode = _features.detailedModelingEnabled ? "detailed" : "simplified";
			}
			_features.hsaOrFsaContributionsFeature = _features.hsaContributionsFeature || _features.fsaContributionsFeature;
			_features.anyContributionsFeature = _features.hsaOrFsaContributionsFeature || _features.carryoverAmountFeature;

			// Initialize user defaults
			_personal.currentModelingMode = _features.defaultModelingMode;
			_personal.showWorstCaseCosts = _features.showWorstCaseCostsDefault;
			_personal.showTotalCosts = _features.showTotalCostsDefault;
			_personal.overAge55 = _features.overAge55Default;
			_personal.hsaContributionAmount = _features.hsaContributionAmountDefault;
			_personal.fsaContributionAmount = _features.fsaContributionAmountDefault;
			// Initialize modeling input object contents for all potential individuals.
			appData.addPersonModelingInputsObject("primary", "primary", 1, true);
			appData.addPersonModelingInputsObject("spouse", "spouse", 1, appData.hasSpouse());
			let numberOfChildren = _personal.numberOfChildren;
			for (let childIndex = 1; childIndex <= _maximumNumberOfChildren; childIndex += 1) {
				let childId = "child" + childIndex;
				appData.addPersonModelingInputsObject(childId, "child", childIndex, childIndex <= numberOfChildren);
			}
			appData.updateModelingInputsForSubconfigChange();

			// Set value defaults from personalFormItems and taxCalculatorFormItems
			[config.personalFormItems, config.taxCalculatorFormItems].forEach(function each(formItemsCollection) {
				Object.keys(formItemsCollection).forEach(function eachItemId(itemId) {
					let item = formItemsCollection[itemId];
					if (item.appDataObj && item.variableName) {
						if ("defaultValue" in item) {
							appData[item.appDataObj][item.variableName] = item.defaultValue;
						} else if (item.subconfigDefaultValuePropName) {
							appData[item.appDataObj][item.variableName] = config[item.subconfigDefaultValuePropName];
						}
					}
				});
			});

			appData.maybeLoadSavedScenario();
			// Potentially adjust current modeling mode if feature settings disagree with the saved scenario.
			if ((!_features.simplifiedModelingEnabled && _personal.currentModelingMode === "simplified") ||
				(!_features.detailedModelingEnabled && _personal.currentModelingMode === "detailed")) {
				_personal.currentModelingMode = _features.defaultModelingMode;
			}

			resolve();
		}, params.delayMsec || 0);
	});
};

appData.hasSpouse = function hasSpouse() {
	let result = _personal.partnerStatus && _personal.partnerStatus.startsWith("hasSpouseOrDP");
	return result;
};

appData.hasChildren = function hasChildren() {
	let result = _personal.numberOfChildren > 0;
	return result;
};

appData.getCoverageLevelId = function getCoverageLevelId() {
	let result = appEngine.getCoverageLevelId(appData.hasSpouse(), _personal.numberOfChildren);
	return result;
};

appData.getLastCoverageLevelId = function getLastCoverageLevelId() {
	return _lastCoverageLevelId;
};

appData.getModelingInputsOrderedIds = function getModelingInputsOrderedIds() {
	return _modelingInputsOrderedIds.slice();
};

appData.getModelingInputsForPerson = function getModelingInputsForPerson(id) {
	return _modelingInputs[id];
};

appData.addPersonModelingInputsObject = function addPersonModelingInputsObject(id, type, index, enabled) {
	_trace("addPersonModelingInputsObject: id: {0}, type: {1}, index: {2}, enabled: {3}", id, type, index, enabled);

	_modelingInputs[id] = Object.seal({ type: type, index: index, enabled: enabled, simplified: {}, detailed: {}, detailedServices: {} });
	_modelingInputsOrderedIds.push(id);
};

appData.updateModelingInputsForSubconfigChange = function updateModelingInputsForSubconfigChange() {
	_trace("updateModelingInputsForSubconfigChange");

	let config = appEngine.configuration;
	_modelingInputsOrderedIds.forEach(function eachId(id) {

		let personSimplifiedUsageCategoryOptions = _modelingInputs[id].simplified;
		config.enabledUsageCategoriesOrder.forEach(function eachUsageCategoryId(usageCategoryId) {
			let usageCategory = config.usageCategories[usageCategoryId];

			// Adjust person's usage category options for simplified modeling.
			let simplifiedModelingOptions = usageCategory.simplifiedModelingOptionsOrder || usageCategory.optionsOrder;
			if (!(usageCategoryId in personSimplifiedUsageCategoryOptions) ||
				!simplifiedModelingOptions.includes(personSimplifiedUsageCategoryOptions[usageCategoryId])) {
				let simplifiedModelingDefault = usageCategory.simplifiedModelingDefault || simplifiedModelingOptions[0];
				personSimplifiedUsageCategoryOptions[usageCategoryId] = simplifiedModelingDefault;
			}

			// Potentially adjust person's usage category options for detailed modeling, but only if nothing yet selected.
			let personDetailedServicesCount = Object.keys(_modelingInputs[id].detailedServices).length;
			let personDetailedUsageCategoryOptions = _modelingInputs[id].detailed;
			if (personDetailedServicesCount === 0) {
				let detailedModelingOptions = usageCategory.detailedModelingOptionsOrder || usageCategory.optionsOrder;
				if (!(usageCategoryId in personDetailedUsageCategoryOptions) ||
					!detailedModelingOptions.includes(personDetailedUsageCategoryOptions[usageCategoryId])) {
					let detailedModelingDefault;
					if ("detailedModelingDefault" in usageCategory) {
						detailedModelingDefault = usageCategory.detailedModelingDefault;
					} else {
						detailedModelingDefault = (detailedModelingOptions.length > 0) ? detailedModelingOptions[0] : null;
					}
					personDetailedUsageCategoryOptions[usageCategoryId] = detailedModelingDefault;
					appData.setDetailedModelingUsageCategoryOption(id, usageCategoryId, detailedModelingDefault);
					// LATER: BUG HERE: If trying to default e.g. medical: high & drugs: high, won't work because second time through the
					// forEach above for enabled usage categories, personDetailedServicesCount !== 0, so else triggered below and second usage
					// category's contents aren't set. Fortunately, so far we haven't used defaults other than "none" for detailed modeling.
				}
			} else {
				// There's a set of service ids and counts already. Don't assign a default for the usage category.
				personDetailedUsageCategoryOptions[usageCategoryId] = null;
			}
		});
	});
};

appData.setSimplifiedModelingUsageCategoryOption = function setSimplifiedModelingUsageCategoryOption(
	personId, usageCategoryId, usageCategoryOption) {
	_trace("setSimplifiedModelingUsageCategoryOption: personId: {0}, usageCategoryId: {1}, usageCategoryOption: {2}",
		personId, usageCategoryId, usageCategoryOption);

	let personUsageCategoryOptions = _modelingInputs[personId].simplified;
	personUsageCategoryOptions[usageCategoryId] = usageCategoryOption;
};

appData.getSimplifiedModelingUsageCategoryOption = function getSimplifiedModelingUsageCategoryOption(
	personId, usageCategoryId) {
	// No trace; called frequently when rendering.
	let result = _modelingInputs[personId].simplified[usageCategoryId] || null;
	return result;
};

appData.setDetailedModelingUsageCategoryOption = function setDetailedModelingUsageCategoryOption(
	personId, usageCategoryId, usageCategoryOption) {
	_trace("setDetailedModelingUsageCategoryOption: personId: {0}, usageCategoryId: {1}, usageCategoryOption: {2}",
		personId, usageCategoryId, usageCategoryOption);

	let config = appEngine.configuration;

	// Reset contents & fill with selected usage category options
	let personServiceUsage = _modelingInputs[personId].detailedServices = {};
	let personUsageCategoryOptions = _modelingInputs[personId].detailed;
	personUsageCategoryOptions[usageCategoryId] = usageCategoryOption;
	let allServiceCounts = mpceEngine.inputsFromEnabledUsageCategoryOptions(config, personUsageCategoryOptions);
	config.categoriesOrder.forEach(function eachCategoryId(categoryId) {
		let category = config.categories[categoryId], serviceIdsInCategory = category.orderedContents;
		serviceIdsInCategory.forEach(function eachServiceId(serviceId) {
			let value = (serviceId in allServiceCounts) ? allServiceCounts[serviceId] : null;
			// noinspection JSIncompatibleTypesComparison
			if (isNullOrUndefined(value) || value === 0) {
				delete personServiceUsage[serviceId];
			} else {
				personServiceUsage[serviceId] = value;
			}
		});
	});
};

appData.getDetailedModelingServiceCounts = function getDetailedModelingServiceCounts(personId) {
	let result = mpceEngine.inputsFromEnabledUsageCategoryOptions(appEngine.configuration, _modelingInputs[personId].detailed);
	return result;
};

appData.getDetailedModelingUsageCategoryOption = function getDetailedModelingUsageCategoryOption(personId, usageCategoryId) {
	// No trace; called frequently when rendering.
	let result = _modelingInputs[personId].detailed[usageCategoryId] || null;
	return result;
};

appData.setDetailedModelingPersonServiceCount = function setDetailedModelingPersonServiceCount(personId, serviceId, value) {
	_trace("setDetailedModelingPersonServiceCount: personId: {0}, serviceId: {1}, value: {2}", personId, serviceId, value);

	let config = appEngine.configuration, personServiceUsage = _modelingInputs[personId].detailedServices;
	if (isNullOrUndefined(value) || value === 0) {
		delete personServiceUsage[serviceId];
	} else {
		personServiceUsage[serviceId] = value;
	}
	// Since the user overrode a specific service's count, they're no longer on pre-set usage category options.
	// Clear all of the currently enabled usage category options for the person. Those that are disabled, i.e. from
	// another subconfig not currently selected, remain as-is in case user should switch back to the other subconfig.
	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId) {
		_modelingInputs[personId].detailed[usageCategoryId] = null;
	});
};

appData.getDetailedModelingPersonServiceCount = function getDetailedModelingPersonServiceCount(personId, serviceId) {
	// No trace; called frequently when rendering.
	let personServiceUsage = _modelingInputs[personId].detailedServices;
	let result = personServiceUsage[serviceId] || 0;
	return result;
};

appData.makeMpcePersonInputsObjects = function makeMpcePersonInputsObjects() {
	_trace("makeMpcePersonInputsObjects for _personal.currentModelingMode: \"{0}\"", _personal.currentModelingMode);

	let result = (_personal.currentModelingMode === "simplified") ?
		appData.personInputsObjectsFromSimplified() :
		appData.personInputsObjectsFromDetailed();
	return result;
};

appData.personInputsObjectsFromSimplified = function personInputsObjectsFromSimplified() {
	_trace("personInputsObjectsFromSimplified");

	let config = appEngine.configuration, result = { primary: null, spouse: null, childrenArray: [] };
	_modelingInputsOrderedIds.forEach(function eachId(id) {
		let personModelingInputs = _modelingInputs[id];
		if (personModelingInputs.enabled) { // i.e. skip the disabled ones; they're only for preserving inputs
			let personUsageCategoryOptions = _modelingInputs[id].simplified;
			let inputs = mpceEngine.inputsFromEnabledUsageCategoryOptions(config, personUsageCategoryOptions);
			if (id.startsWith("child")) {
				result.childrenArray.push(inputs);
			} else {
				result[id] = inputs;
			}
		} // else, personModelingInputs wasn't enabled; not included in inputs to be passed to the calculations
	});
	return result;
};

appData.personInputsObjectsFromDetailed = function personInputsObjectsFromDetailed() {
	_trace("personInputsObjectsFromDetailed");

	let config = appEngine.configuration, result = { primary: null, spouse: null, childrenArray: [] };

	_modelingInputsOrderedIds.forEach(function eachId(id) {
		let personModelingInputs = _modelingInputs[id];
		if (personModelingInputs.enabled) { // i.e. skip the disabled ones; they're only for preserving inputs
			let personServiceUsage = _modelingInputs[id].detailedServices, inputs = {};
			Object.keys(personServiceUsage).forEach(function eachServiceId(serviceId) {
				if ((serviceId in config.services) && personServiceUsage[serviceId] > 0) {
					inputs[serviceId] = personServiceUsage[serviceId];
				}
			});
			if (id.startsWith("child")) {
				result.childrenArray.push(inputs);
			} else {
				result[id] = inputs;
			}
		} // else, personModelingInputs wasn't enabled; not included in inputs to be passed to the calculations
	});

	return result;
};

appData.getEnabledPersonIds = function getEnabledPersonIds() {
	// Helper for rendering. Returns a list of the enabled person ids in the modeling inputs.
	let result = _modelingInputsOrderedIds.filter(function filter(v) { return _modelingInputs[v].enabled; });
	return result;
};

appData.getDisabledPersonIds = function getDisabledPersonIds() {
	// Helper for rendering. Returns a list of the disabled person ids in the modeling inputs.
	let result = _modelingInputsOrderedIds.filter(function filter(v) { return !_modelingInputs[v].enabled; });
	return result;
};

// region Support for encoding and compressing saved scenarios

// Note: The scenario compression mechanism is not foolproof. That is, it assumes that certain characters
// and combinations won't ever be present in appData's scenario storage. These assumptions permit shortcuts
// with respect to JSON token replacement in order to yield payloads that fit comfortably within a URL.
// Consider this mechanism specific to the MPCE and not suitable for general purpose use.

let compressor = {
	// WARNING: The data below should, in general, be considered fixed. Changing any of the mappings
	// risks breaking compatibility with previously encoded scenarios. New combinations may be appended,
	// but do not change any existing mapping without carefully considering the consequences.
	fixedAbbrForEncoding: [
		{ replaceExp: /":\s*false([,}])/g, with: '":F$1' },
		{ replaceExp: /":\s*true([,}])/g, with: '":T$1' },
		{ replaceExp: /":\s*null([,}])/g, with: '":N$1' },
		{ replaceExp: /":\s*{}}}/g, with: '":Q' },
		{ replaceExp: /":\s*{}}/g, with: '":P' },
		{ replaceExp: /":\s*{}/g, with: '":O' }
	],
	fixedAbbrForDecoding: [
		{ replaceExp: /":F([,}])/g, with: '":false$1' },
		{ replaceExp: /":T([,}])/g, with: '":true$1' },
		{ replaceExp: /":N([,}])/g, with: '":null$1' },
		{ replaceExp: /":Q/g, with: '":{}}}' },
		{ replaceExp: /":P/g, with: '":{}}' },
		{ replaceExp: /":O/g, with: '":{}' }
	],
	builtInDictPrefix1: "¡", // inverted exclamation mark
	builtInDictPrefix2: "µ", // micro symbol
	builtInDictPrefix3: "°", // degree symbol
	builtInDictArray: [
		"ALL_LOCATIONS", "ALL_OTHER_LOCATIONS", "FSA", "HSA", "OTHER",
		"applyAllFunds", "applyEEFundsOnly", "applyERFundsOnly", "applyFundsToCostOfCareOption", "applyNoFunds",
		"bloodTest", "carryoverAmount", "child", "child1", "child2",
		"child3", "child4", "child5", "currentModelingMode", "custom",
		"dentalExpenses", "detailed", "detailedServices", "drugs", "drugsMailPref90Days",
		"drugsRetailGeneric30Days", "drugsRetailPref30Days", "emergencyRoomVisit", "enabled", "frequent",
		"fsaContributionAmount", "fsaeAccountTypeId", "fsaeSelectedPlanId", "general", "group1",
		"hasSpouseOrDP", "headOfHousehold", "high", "hsaContributionAmount", "hsaEligibleExpenses",
		"low", "lowerPremiums", "lowerTotalCosts", "marriedFilingJoint", "marriedFilingSeparate",
		"medical", "medium", "modelingInputs", "modelingInputsOrderedIds", "moderate",
		"mriScan", "noSpouseOrDP", "none", "numberOfChildren", "onlyRegion",
		"onlyStatus", "other", "otherExpenses", "otherRegions", "otherStatuses",
		"overAge55", "partnerStatus", "primary", "primaryAnnualIncome", "primaryCarePhysician",
		"regionId", "routinePhysical", "salaryBand1", "salaryBand2", "salaryBand3",
		"savedDuringWizard", "showTotalCosts", "simplified", "single", "specialistOfficeVisit",
		"spouse", "spouseAnnualIncome", "spouseAnnualIncomePreserved", "spouseSurchargeAnswer", "spouseSurchargeNo",
		"spouseSurchargeYes", "statusId", "subconfig", "taxFilingStatus", "taxNumDependents",
		"tobaccoBoth", "tobaccoEmployee", "tobaccoNone", "tobaccoSpouse", "tobaccoSurchargeAnswer",
		"twoDayInpatientStay", "type", "visionExpenses", "wellnessAnswer", "wellnessBoth",
		"wellnessEmployee", "wellnessNone", "wellnessSpouse", "xray"
	],
	mapBuiltInWordToToken: {},
	mapBuiltInTokenToWord: {},
	customDictPrefix1: "¥", // yen symbol
	customDictPrefix2: "£", // pound symbol
	customDictPrefix3: "±", // plus-minus symbol
	customDictDelimiter: "§" // section symbol
};

if (compressor.builtInDictArray.length > 99) {
	throw new Error("appData compressor.builtInDictArray must not contain more than 99 words");
}

(function initializeBuiltInDictionary() {
	let i, token, word;
	for (i = 0; i < compressor.builtInDictArray.length; i += 1) {
		token = i.toString();
		if (token.length < 2) { token = "0" + token; }
		word = compressor.builtInDictArray[i];
		compressor.mapBuiltInWordToToken[word] = token;
		compressor.mapBuiltInTokenToWord[token] = word;
	}
}());

compressor.compressScenarioToURIComponent = function compressScenarioToURIComponent(scenario) {
	let json = JSON.stringify(scenario), originalJsonLength = json.length;
	// Replace certain fixed abbreviations for common values in the JSON with more compact representations.
	compressor.fixedAbbrForEncoding.forEach(function each(abbr) { json = json.replace(abbr.replaceExp, abbr.with); });
	// Use the fixed built-in dictionary to replace any matching quoted strings that appear in the JSON.
	Object.keys(compressor.mapBuiltInWordToToken).forEach(function each(word) {
		let token = compressor.mapBuiltInWordToToken[word];
		json = json.replace(new RegExp('{"' + word + '"', "g"), compressor.builtInDictPrefix1 + token);
		json = json.replace(new RegExp('"' + word + '"}', "g"), compressor.builtInDictPrefix2 + token);
		json = json.replace(new RegExp('"' + word + '"', "g"), compressor.builtInDictPrefix3 + token);
	});
	// Build and use a custom dictionary of most frequently appearing words remaining in the JSON.
	let freqMap = {}, freqArray = [], i = 0, matches = Array.from(json.match(/([a-zA-Z][a-zA-Z0-9]+)/g));
	matches.forEach(function each(match) { if (match in freqMap) { freqMap[match] += 1; } else { freqMap[match] = 1; } });
	// Filter out words where there wouldn't be significant savings; i.e. not frequent enough to make up for encoding overhead.
	Object.keys(freqMap).forEach(function each(word) {
		let f = freqMap[word], len = word.length, rawLen = (len + 2) * f, encodedLen = (2 * f) + len + 1, savings = rawLen - encodedLen;
		if (savings > 0) { freqArray.push({ key: word, freq: f, savings: savings, token: null }); }
	});
	// Sort the word frequency map by words with most savings first, and then take the top 36.
	freqArray.sort(function compare(a, b) { return (a.savings > b.savings) ? -1 : ((b.savings > a.savings) ? 1 : 0); }).slice(0, 36);
	freqArray.forEach(function each(item) { item.token = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".substring(i, i + 1); i += 1; });
	let customDictStr = freqArray.map(function map(item) { return item.key; }).join("/");
	freqArray.forEach(function each(item) {
		let token = item.token;
		json = json.replace(new RegExp('{"' + item.key + '"', "g"), compressor.customDictPrefix1 + token);
		json = json.replace(new RegExp('"' + item.key + '"}', "g"), compressor.customDictPrefix2 + token);
		json = json.replace(new RegExp('"' + item.key + '"', "g"), compressor.customDictPrefix3 + token);
	});
	// Remove quotes on property keys not already replaced by tokens.
	json = json.replace(/"([a-zA-Z][a-zA-Z0-9]*)":/g, "$1:");
	// Append the custom dictionary to the end of the resulting JSON.
	json = json + compressor.customDictDelimiter + customDictStr;
	// Use LZString to compress the resulting JSON to a URI component string.
	// noinspection JSUnresolvedFunction
	let compressed = LZString.compressToEncodedURIComponent(json);
	// Finally, replace "-" in compressed version with "_" so URL doesn't wrap on "-" when rendered
	compressed = compressed.replace(/-/g, "_");
	_trace("compressor.compressScenarioToURIComponent: original JSON length {0}, compressed length {1}.", originalJsonLength, compressed.length);
	return compressed;
};

compressor.decompressScenarioFromURIComponent = function decompressScenarioFromURIComponent(compressedScenario) {
	// Convert "_" back to "-" because that's what LZString had originally produced.
	let compressedScenarioNoUnderscores = compressedScenario.replace(/_/g, "-");
	// Use LZString to decompress the encoded scenario string.
	// noinspection JSUnresolvedFunction
	let uncompressed = LZString.decompressFromEncodedURIComponent(compressedScenarioNoUnderscores);
	// Split the custom dictionary away from the encoded JSON.
	if (isNullOrUndefined(uncompressed) || uncompressed.length === 0) {
		throw new Error("Result from LZString decompress was null or zero length");
	}
	let components = uncompressed.split(compressor.customDictDelimiter);
	if (components.length !== 2) {
		throw new Error("Unexpected number of components in uncompressed scenario data");
	}
	let json = components[0];
	// Reconstitute the custom dictionary and use it to replace corresponding tokens in the encoded JSON.
	let customDictStr = components[1], customDictWords = customDictStr.split("/"), customDictMap = {}, i = 0;
	customDictWords.forEach(function each(word) { customDictMap["0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".substring(i, i + 1)] = word; i += 1; });
	Object.keys(customDictMap).forEach(function each(key) {
		let word = customDictMap[key];
		json = json.replace(new RegExp(compressor.customDictPrefix1 + key, "g"), '{"' + word + '"');
		json = json.replace(new RegExp(compressor.customDictPrefix2 + key, "g"), '"' + word + '"}');
		json = json.replace(new RegExp(compressor.customDictPrefix3 + key, "g"), '"' + word + '"');
	});
	// Use the fixed built-in dictionary to replace corresponding tokens in the encoded JSON.
	Object.keys(compressor.mapBuiltInTokenToWord).forEach(function each(token) {
		let word = compressor.mapBuiltInTokenToWord[token];
		json = json.replace(new RegExp(compressor.builtInDictPrefix1 + token, "g"), '{"' + word + '"');
		json = json.replace(new RegExp(compressor.builtInDictPrefix2 + token, "g"), '"' + word + '"}');
		json = json.replace(new RegExp(compressor.builtInDictPrefix3 + token, "g"), '"' + word + '"');
	});
	// Restore quotes on all property keys.
	json = json.replace(/([a-zA-Z][a-zA-Z0-9]*):/g, '"$1":');
	// Replace certain fixed abbreviations in the JSON with their original representations.
	compressor.fixedAbbrForDecoding.forEach(function eachAbbr(obj) { json = json.replace(obj.replaceExp, obj.with); });
	_trace("decompressScenarioFromURIComponent: compressed scenario length {0}, original JSON length {1}.", compressedScenario.length, json.length);
	return json;
};

appData.saveScenario = function saveScenario() {
	_trace("saveScenario");
	_scenario.savedDuringWizard = $body.hasClass("duringWizard");
	let scenario = compressor.compressScenarioToURIComponent(_scenario);
	return scenario;
};

appData.maybeLoadSavedScenario = function maybeLoadSavedScenario() {
	// noinspection JSUnresolvedVariable
	let scenario = utility.parseQueryStringToObject(window.location.search).scenario;
	if (isNullOrUndefined(scenario) || scenario.length === 0) {
		_trace("maybeLoadSavedScenario: no scenario parameter detected");
		return;
	}
	_trace("maybeLoadSavedScenario: scenario: {0}", scenario);
	let jsonOriginal = JSON.stringify(_scenario); // in case of error
	try {
		let json = compressor.decompressScenarioFromURIComponent(scenario);
		let loadedScenario = JSON.parse(json);
		Object.assign(_scenario, loadedScenario);
	} catch (e) {
		_trace("maybeLoadSavedScenario: exception: {0}", e.toString());
		$body.find(".scenarioLoadingErrorMessage").removeClass("hiddenNotApplicable");
		appData.scenarioLoadingError = true;
		let restoredScenario = JSON.parse(jsonOriginal);
		Object.assign(_scenario, restoredScenario);
		return;
	} finally {
		// IMPORTANT: Re-establish shortcuts into _scenario
		_modelingInputs = _scenario.modelingInputs;
		_modelingInputsOrderedIds = _scenario.modelingInputsOrderedIds;
	}
	// If the loaded scenario refers to a non-default subconfig, the engine needs to change to that subconfig.
	if (_personal.subconfig !== appEngine.currentSubconfigId) {
		// LATER: There may be a race condition here if the subconfig referred to by the new subconfig id hasn't
		// loaded yet. (Consider rare case where appEngine needs to load subconfig dynamically using RequireJS.)
		appEngine.changeSubconfig(_personal.subconfig, "scenarioLoaded");
	}
	$body.find(".scenarioLoadingMessage").removeClass("hiddenNotApplicable");
	appData.scenarioLoaded = true;
	$body.addClass("scenarioLoaded");
	appDispatch.onAppDidLoadWithScenario();
};

// endregion Support for encoding and compressing saved scenarios

_trace("module() returning");
return appData;
});
