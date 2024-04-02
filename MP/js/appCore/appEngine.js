//-------------------------------------------------------------------------------------------------
// appEngine.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(
["trace", "utility", "mainConfig", "fsaeConfig", "appDispatch", "mpceValidation", "fsaeValidation", "mpceEngine", "fsaeEngine"],
/**
 * @param {object} trace
 * @param {object} utility
 * @param {MainConfig} mainConfig
 * @param {FsaeConfig} fsaeConfig
 * @param {AppDispatch} appDispatch
 * @param {object} mpceValidation
 * @param {object} fsaeValidation
 * @param {object} mpceEngine
 * @param {object} fsaeEngine
 * @returns {object}
 */
function module(trace, utility, mainConfig, fsaeConfig, appDispatch, mpceValidation, fsaeValidation, mpceEngine, fsaeEngine) {
"use strict";

/**
 * @name AppEngine
 * @type {{
 *   currentSubconfigId: string
 *   configuration: object
 *   preservedMainConfigValues: object.<string, object>
 *   initializeAsync: Function
 *   preserveMainConfigValues: Function
 *   restoreMainConfigValues: Function
 *   changeSubconfig: Function
 *   compileConfigAsync: Function
 *   compileConfigImpl: Function
 *   getCoverageLevelId: Function
 *   getPrimaryAccountTypeId: Function
 *   getSavingsContLimitAdjustmentForPlan: Function
 *   getEffectiveSavingsContLimitForPlan: Function
 *   gatherMpceCalculateArgs: Function
 *   mpceCalculate: Function
 *   gatherFsaeCalculateArgs: Function
 *   fsaeCalculate: Function
 * }}
 */
let appEngine = {};
let _trace = trace.categoryWriteLineMaker("appEngine");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appEngine"); } }; tick();

let isNullOrUndefined = utility.isNullOrUndefined;

appEngine.currentSubconfigId = "";
appEngine.configuration = null;
appEngine.preservedMainConfigValues = {
	"originalPlansByRegion": {}
};

appEngine.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve, reject) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let initialSubconfigId = mainConfig.subconfigsDefaultId;

			// First: Preserve certain values from mainConfig that may get replaced/trimmed by compileConfig()
			// so we can use them in subsequent calls of compileConfig().
			appEngine.preserveMainConfigValues();

			// Set appEngine.configuration to just mainConfig initially. A subconfig will be compiled in later.
			appEngine.configuration = Object.assign({ compiled: false }, mainConfig);

			// Validate the FSAE configuration. There is only one; no compilation and no subconfigs concept here.
			try {
				fsaeValidation.checkConfig(fsaeConfig, "fsaeConfig", false); // false = do throw if any error(s)
			} catch (e) {
				appDispatch.showError(e.toString());
				throw e;
			}

			// Validate and process combinations of tool main config plus MPCE subconfigs, for already-loaded subconfig
			// objects other than the one initially selected by default (which gets compiled and validated last, below).
			// Developers must ensure that sites promoted to production never fail these validation checks. When
			// such validation fails, an error is thrown and an alert displayed.
			mainConfig.subconfigsOrder.filter(function filter(subconfigId) { return subconfigId !== initialSubconfigId; }).forEach(
				function each(subconfigId) {
					if (mainConfig.subconfigs[subconfigId].subconfigObject) {
						appEngine.compileConfigImpl(subconfigId, null, "validation");
					}
				});

			// Now that validation of other MPCE subconfigs is complete, do the initial subconfig, which then remains active.
			appEngine.compileConfigAsync(initialSubconfigId, "initial").then(
				function resolved() { resolve(); },
				function rejected() { reject(); }
			);
		}, params.delayMsec || 0);
	});
};

appEngine.preserveMainConfigValues = function preserveMainConfigValues() {
	// Preserves certain values in mainConfig that are potentially replaced/trimmed by compileConfigAsync()
	let originalPlansByRegion = appEngine.preservedMainConfigValues.originalPlansByRegion;
	mainConfig.regions && Object.keys(mainConfig.regions).forEach(function each(regionId) {
		originalPlansByRegion[regionId] = mainConfig.regions[regionId].plans.slice(0); // copies by value
	});
};

appEngine.restoreMainConfigValues = function restoreMainConfigValues() {
	// Restores the values that were preserved by preserveCommonConfigValues()
	let originalPlansByRegion = appEngine.preservedMainConfigValues.originalPlansByRegion;
	mainConfig.regions && Object.keys(mainConfig.regions).forEach(function each(regionId) {
		mainConfig.regions[regionId].plans = originalPlansByRegion[regionId].slice(0); // copies by value
	});
};

appEngine.changeSubconfig = function changeSubconfig(newSubconfigId, reason) {
	_trace("changeSubconfig: from appEngine.currentSubconfigId: {0} to newSubconfigId {1}", appEngine.currentSubconfigId, newSubconfigId);
	appEngine.compileConfigAsync(newSubconfigId, isNullOrUndefined(reason) ? "changed" : reason).then(
		// eslint-disable-next-line no-empty-function
		function resolvedNoOp() {}, function rejectedNoOp() {}
	);
	// n.b. events raised will result in UI updates, etc.
};

appEngine.compileConfigAsync = function compileConfigAsync(newSubconfigId, reason) {
	_trace("compileConfigAsync: new: {0}, reason: {1}, current: {2}", newSubconfigId, reason, appEngine.currentSubconfigId || "[none]");
	if (typeof newSubconfigId !== "string" || newSubconfigId.length === 0) {
		throw new Error("compileConfigAsync() was passed an invalid newSubconfigId value");
	}

	return new Promise(function executor(resolve, reject) {
		let hasEntryForId = newSubconfigId in mainConfig.subconfigs;
		let hasObjectForEntry = hasEntryForId ? ("subconfigObject" in mainConfig.subconfigs[newSubconfigId]) : false;
		if (!hasEntryForId || !hasObjectForEntry) {
			// Treat newSubconfigId as a module name. If such a module is not explicitly configured in _requireConfig.js,
			// then it should also include a correct relative path to the JavaScript file.
			appDispatch.onAppWillLoadConfig(newSubconfigId);
			require([newSubconfigId], function moduleLoaded(newSubconfigObject) {
					// Success case
					_trace("compileConfigAsync success callback: Succeeded in loading subconfig script module '{0}'.", newSubconfigId);
					appDispatch.onAppDidLoadConfig(newSubconfigId, newSubconfigObject);
					appEngine.compileConfigImpl(newSubconfigId, newSubconfigObject, reason);
					resolve();
				},
				function moduleFailedToLoad(/* err */) {
					_trace("compileConfigAsync error callback: Failed to load subconfig script module '{0}'.", newSubconfigId);
					let errorMessage = "Failed to load configuration script module with id '" + newSubconfigId + "'.";
					appDispatch.onAppFailedToLoadConfig(newSubconfigId, errorMessage);
					reject();
				});
			_trace("compileConfigAsync: Returning after requesting load of subconfig script module '{0}'.", newSubconfigId);
		} else {
			// There is both an entry and a subconfigObject on the entry. No need to load via RequireJS now as it has
			// already been loaded on application startup, but continue async so both paths resume in the same manner.
			setTimeout(function compileConfigAsyncTimeout() {
				_trace("compileConfigAsync: setTimeout callback: Compiling already-loaded subconfig '{0}'.", newSubconfigId);
				appEngine.compileConfigImpl(newSubconfigId, null, reason);
				resolve();
			}, 1);
			_trace("compileConfigAsync: Returning after requesting async compilation of already-loaded subconfig '{0}'.", newSubconfigId);
		}
	});
};

appEngine.compileConfigImpl = function compileConfigImpl(newSubconfigId, maybeNewSubconfigObject, reason) {
	_trace("compileConfigImpl: id: {0} {2}, reason: {1}",
		newSubconfigId, reason, maybeNewSubconfigObject ? "(loaded dynamically)" : "(loaded at startup)");

	let oldSubconfigId;

	if (reason !== "initial") {
		oldSubconfigId = appEngine.currentSubconfigId;
	}

	if (reason !== "validation") {
		appDispatch.onAppWillCompileConfig(reason, oldSubconfigId, newSubconfigId);
	}

	// Replace the values that may have been replaced/trimmed by an earlier call to compileConfig().
	appEngine.restoreMainConfigValues();

	let subconfigObject;
	if (maybeNewSubconfigObject) {
		// One was passed in directly, loaded dynamically by RequireJS in compileConfig() above.
		subconfigObject = maybeNewSubconfigObject;
	} else {
		// None was passed in directly. newSubconfigId must instead refer to an already-loaded subconfig.
		let subconfig = mainConfig.subconfigs[newSubconfigId];
		subconfigObject = subconfig.subconfigObject;
	}

	// Combine mainConfig object with the new subconfigObject
	appEngine.currentSubconfigId = newSubconfigId;
	let newConfig = Object.assign({ compiled: true }, mainConfig, utility.deepCopy(subconfigObject));

	// IMPORTANT: The main config may mention plans that are available in some but not all subconfigs. Before returning,
	// we need to remove any mention of plans that aren't actually configured in the subconfig. However, as we haven't
	// yet validated the subconfig, we only do this if regions, regionsOrder, plans, and plansOrder are present.
	if (Array.isArray(newConfig.regionsOrder) && ("regions" in newConfig) && typeof newConfig.regions === "object" &&
		Array.isArray(newConfig.plansOrder) && ("plans" in newConfig) && typeof newConfig.plans === "object") {
		newConfig.regionsOrder.forEach(function each(regionId) {
			let region = newConfig.regions[regionId];
			let newPlansForRegion = region.plans.filter(function filter(planId) { return (planId in newConfig.plans); });
			region.plans = newPlansForRegion;
		});
	}

	appEngine.configuration = newConfig;

	_trace("calling mpceValidation.checkAndProcessConfig() for subconfigId: {0}", newSubconfigId);
	try {
		mpceValidation.checkAndProcessConfig(appEngine.configuration, newSubconfigId, false); // false = do throw if any error(s)
	} catch (e) {
		appDispatch.showError(e.toString());
		throw e;
	}

	if (reason !== "validation") {
		appDispatch.onAppDidCompileConfig(reason, oldSubconfigId, newSubconfigId);
	}
};

appEngine.getCoverageLevelId = function getCoverageLevelId(hasSpouse, numChildren) {
	// Given whether user has a spouse, plus how many children, returns the corresponding coverageLevelId from the MPCE configuration.
	let result = mpceEngine.getCoverageLevelId(appEngine.configuration, hasSpouse, numChildren, { skipTracing: true });
	_trace("getCoverageLevelId result: {0}", result);
	return result;
};

appEngine.getPrimaryAccountTypeId = function getPrimaryAccountTypeId(maybeDualAccountTypeId) {
	// Given a potentially dual (compound) FSAE accountTypeId string, such as "HSA+LPFSA" as may be configured as the
	// fsaeAccountTypeId in an MPCE plan, this function extracts the "primary" account type id, being the first, or the
	// same id passed in if there was no "+" sign indicating the dual kind, or undefined if such or null was passed in.
	let result;
	if (!isNullOrUndefined(maybeDualAccountTypeId)) {
		let components = maybeDualAccountTypeId.split("+"); // e.g. "HSA+LPFSA"
		result = components[0]; // e.g. the "HSA" part if compound, or the whole if no "+" was found
	}
	return result;
};

appEngine.getSavingsContLimitAdjustmentForPlan = function getSavingsContLimitAdjustmentForPlan(
	planId, regionId, statusId, coverageLevelId, hsaOverAge55Adjustment, maximumExcludesCompanyFunds) {
	// Given a planId, regionId, statusId, coverageLevelId, hsaOverAge55Adjustment flag, and maximumExcludesCompanyFunds
	// flag, returns the effective savings contribution limit _adjustment_ for the plan, or zero if fundAllowsContributions
	// is false. The effective savings contribution limit _adjustment_ is the configured company fund amount (or 0 if
	// maximumExcludesCompanyFunds is true), plus an additional $1000 if hsaOverAge55Adjustment is set.
	let result = 0, hsaOverAge55Amount, planFundAmount, config = appEngine.configuration, planConfig = config.plans[planId];
	if (planConfig.fundAllowsContributions && planConfig.fsaeAccountTypeId) {
		hsaOverAge55Amount = (hsaOverAge55Adjustment ? 1000 : 0);
		planFundAmount = maximumExcludesCompanyFunds ? 0 : mpceEngine.getPlanFundAmount(planConfig, regionId, statusId, coverageLevelId);
		result = hsaOverAge55Amount - planFundAmount;
	} // else, result remains 0
	_trace("getSavingsContLimitAdjustmentForPlan for {0}/{1}/{2}/{3}/{4}/{5} result: {6}", planId, regionId, statusId,
		coverageLevelId, hsaOverAge55Adjustment, maximumExcludesCompanyFunds, result);
	return result;
};

appEngine.getEffectiveSavingsContLimitForPlan = function getEffectiveSavingsContLimitForPlan(
	planId, regionId, statusId, coverageLevelId, hsaOverAge55Adjustment, maximumExcludesCompanyFunds) {
	// Given a planId, regionId, statusId, coverageLevelId, hsaOverAge55Adjustment flag, and maximumExcludesCompanyFunds
	// flag, returns the effective savings contribution limit for the plan, or zero if fundAllowsContributions is false.
	// The effective savings contribution limit for a plan is the configured maximum in the associated FSAE account type,
	// less any company fund amount and potential maximum match amount (or 0 if maximumExcludesCompanyFunds is true),
	// plus an additional $1000 if hsaOverAge55Adjustment is set.
	let result = 0, adjustments, employerMaxMatchAmount, accountTypeId, config = appEngine.configuration,
		planConfig = config.plans[planId], accountConfig;
	// First: For the plan to have a non-zero savings contribution limit, it must BOTH allow
	// contributions AND have an fsaeAccountTypeId. Without either, then no contribution limit.
	if (planConfig.fundAllowsContributions && planConfig.fsaeAccountTypeId) {
		accountTypeId = appEngine.getPrimaryAccountTypeId(planConfig.fsaeAccountTypeId); // e.g. get "HSA" from "HSA+LPFSA"
		accountConfig = fsaeConfig.accountTypes[accountTypeId];
		adjustments = appEngine.getSavingsContLimitAdjustmentForPlan(planId, regionId,
			statusId, coverageLevelId, hsaOverAge55Adjustment, maximumExcludesCompanyFunds);
		if (!maximumExcludesCompanyFunds) {
			employerMaxMatchAmount = fsaeEngine.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
			if (isFinite(employerMaxMatchAmount)) { adjustments -= employerMaxMatchAmount; }
		}
		accountConfig.contributionMaximumAdjustment = adjustments;
		result = fsaeEngine.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId);
		accountConfig.contributionMaximumAdjustment = 0;
	} // else, result remains 0
	_trace("getEffectiveSavingsContLimitForPlan for planId {0} result: {1}", planId, result);
	return result;
};

appEngine.gatherMpceCalculateArgs = function gatherMpceCalculateArgs(appData) {
	_trace("gatherMpceCalculateArgs");

	let args = {}, personInputs = appData.makeMpcePersonInputsObjects();
	args.regionId = appData.personal.regionId;
	args.statusId = appData.personal.statusId;
	args.primary = personInputs.primary;
	args.spouse = personInputs.spouse;
	args.childrenArray = personInputs.childrenArray;
	args.applyFundsToCostOfCareOption = appData.personal.applyFundsToCostOfCareOption;
	args.planPriority = appData.personal.planPriority;
	args.resultsVariantsToInclude = appData.features.wizardEnabled ? ["noEmployeeFunding"] : [];
	args.fsaeConfig = fsaeConfig; // LATER: Consolidate MPCE and FSAE engines into single engine w/single config file
	// By default, the following remain undefined, but may be overridden by logic in onEngineWillRunMpceCalculation():
	// args.fundRolloverAmounts
	// args.voluntaryFundContributionAmounts
	// args.premiumAdjustmentAmounts
	// args.planFundAdditionalMatchAmounts
	// args.voluntaryFundContributionLimits
	// args.planFundAdjustmentAmounts
	return args;
};

appEngine.mpceCalculate = function mpceCalculate(mpceCalculateArgs) {
	_trace("mpceCalculate");

	let maybeModifiedArgs = appDispatch.onEngineWillRunMpceCalculation(mpceCalculateArgs);

	// Make the call into mpceEngine.calculateWithArgs() with the potentially modified arguments.
	let config = appEngine.configuration;
	let allResults = mpceEngine.calculateWithArgs(config, maybeModifiedArgs, maybeModifiedArgs.resultsVariantsToInclude);
	let maybeModifiedResults = appDispatch.onEngineDidRunMpceCalculation(maybeModifiedArgs, allResults);

	return maybeModifiedResults;
};

appEngine.gatherFsaeCalculateArgs = function gatherFsaeCalculateArgs(appData) {
	_trace("gatherFsaeCalculateArgs");

	let args;
	if (!isNullOrUndefined(appData.taxCalc.fsaeSelectedPlanId)) {
		args = {
			config: fsaeConfig,
			selectedPlanId: appData.taxCalc.fsaeSelectedPlanId,
			regionId: appData.personal.regionId,
			statusId: appData.personal.statusId,
			coverageLevelId: appData.getCoverageLevelId(),
			overAge55: appData.personal.overAge55,
			accountTypeId: appData.taxCalc.fsaeAccountTypeId,
			filingStatusId: appData.taxCalc.taxFilingStatus,
			numberOfDependents: parseInt(appData.taxCalc.taxNumDependentsStr, 10),
			primaryAnnualIncome: appData.taxCalc.primaryAnnualIncome,
			spouseAnnualIncome: appData.taxCalc.spouseAnnualIncome,
			rolloverAmount: 0, // The medical costs passed to the tax calculator were already adjusted for the rollover amount, if any
			hsaEligibleExpenses: appData.taxCalc.hsaEligibleExpenses,
			visionExpenses: appData.taxCalc.visionExpenses,
			dentalExpenses: appData.taxCalc.dentalExpenses,
			otherExpenses: appData.taxCalc.otherExpenses
		};
	}

	return args;
};

appEngine.fsaeCalculate = function fsaeCalculate(fsaeCalculateArgs) {
	_trace("fsaeCalculate");

	let args, fsaeCfg, selectedPlanId, regionId, statusId, coverageLevelId, overAge55, maybeDualAccountTypeId,
		filingStatusId, numberOfDependents, primaryAnnualIncome, spouseAnnualIncome, rolloverAmount,
		hsaEligibleExpenses, visionExpenses, dentalExpenses, otherExpenses, dual = false, components, accountTypeId1 = "",
		accountTypeId2 = "", resultsAccount1, resultsAccount2, results, accountTypeIdToAdjust, contMaxAdjustment;

	args = appDispatch.onEngineWillRunFsaeCalculation(fsaeCalculateArgs);

	fsaeCfg = args.config;
	selectedPlanId = args.selectedPlanId;
	regionId = args.regionId;
	statusId = args.statusId;
	coverageLevelId = args.coverageLevelId;
	overAge55 = args.overAge55;
	maybeDualAccountTypeId = args.accountTypeId;
	filingStatusId = args.filingStatusId;
	numberOfDependents = args.numberOfDependents;
	primaryAnnualIncome = args.primaryAnnualIncome;
	spouseAnnualIncome = args.spouseAnnualIncome;
	rolloverAmount = args.rolloverAmount;
	hsaEligibleExpenses = args.hsaEligibleExpenses;
	visionExpenses = args.visionExpenses;
	dentalExpenses = args.dentalExpenses;
	otherExpenses = args.otherExpenses;

	// If the accountTypeId has a plus sign, then assume the first part is one accountTypeId
	// representing an account for hsaEligibleExpenses, and the second is another accountTypeId
	// representing an account for vision and dental expenses (e.g. LPFSA). However, we don't
	// hard-code the accountTypeIds themselves since they may vary.
	if (maybeDualAccountTypeId.includes("+")) {
		dual = true;
		components = maybeDualAccountTypeId.split("+");
		accountTypeId1 = components[0]; // e.g. "HSA"
		accountTypeId2 = components[1]; // e.g. "LPFSA"
	}

	// IMPORTANT: For plans where fundAllowsContributions is true, further reduce the contribution maximum by the
	// company base funding and catch-up limit (if selected), but only for accountTypeId1 (if dual, i.e. the HSA part)
	// or accountTypeId (if not dual). Where fundAllowsContributions is false, no adjustment made.
	if (appEngine.configuration.plans[selectedPlanId].fundAllowsContributions) {
		accountTypeIdToAdjust = dual ? accountTypeId1 : maybeDualAccountTypeId;
		let followRulesFor = fsaeConfig.accountTypes[accountTypeIdToAdjust].followRulesFor;
		let maximumExcludesCompanyFunds = fsaeConfig.accountTypes[accountTypeIdToAdjust].maximumExcludesCompanyFunds || false;
		contMaxAdjustment = appEngine.getSavingsContLimitAdjustmentForPlan(selectedPlanId, regionId, statusId, coverageLevelId,
			(followRulesFor === "HSA" ? overAge55 : false), (followRulesFor === "FSA" ? maximumExcludesCompanyFunds : false));
		let fundAmountAdjForPlan = maximumExcludesCompanyFunds ? 0 : appDispatch.onAppNeedsFundAmountAdjForPlan(selectedPlanId);
		contMaxAdjustment -= fundAmountAdjForPlan;
		fsaeCfg.accountTypes[accountTypeIdToAdjust].contributionMaximumAdjustment = contMaxAdjustment;
	} // else fundAllowsContributions is false; no adjustment made.

	if (dual) {
		// Two accountTypeIds are in play, e.g. HSA + LPFSA. We simulate such a combination by calling
		// the fsaeEngine.calculate() twice; once for the first, and once for the second, then combine
		// the results. Note: We adjust the primaryAnnualIncome passed to the second to account for
		// assumed tax savings from the first's recommended contribution.

		resultsAccount1 = fsaeEngine.calculate(fsaeCfg, accountTypeId1, filingStatusId, numberOfDependents,
			primaryAnnualIncome, spouseAnnualIncome, rolloverAmount, [hsaEligibleExpenses], coverageLevelId);

		primaryAnnualIncome -= resultsAccount1.suggestedContribution;

		resultsAccount2 = fsaeEngine.calculate(fsaeCfg, accountTypeId2, filingStatusId, numberOfDependents,
			primaryAnnualIncome, spouseAnnualIncome, 0, [visionExpenses, dentalExpenses, otherExpenses], coverageLevelId);

		// Combine the results. Notably, the result returned is augmented with one result not normally
		// returned by the fsaeEngine: suggestedLimitedPurposeContribution.
		results = {
			accountTypeId: maybeDualAccountTypeId,
			totalCosts: resultsAccount1.totalCosts + resultsAccount2.totalCosts,
			suggestedContribution: resultsAccount1.suggestedContribution,
			suggestedLimitedPurposeContribution: resultsAccount2.suggestedContribution,
			employerMatchingContribution: resultsAccount1.employerMatchingContribution + resultsAccount2.employerMatchingContribution,
			federalIncomeTaxSavings: resultsAccount1.federalIncomeTaxSavings + resultsAccount2.federalIncomeTaxSavings,
			ficaTaxSavings: resultsAccount1.ficaTaxSavings + resultsAccount2.ficaTaxSavings,
			totalTaxSavings: resultsAccount1.totalTaxSavings + resultsAccount2.totalTaxSavings,
			totalMatchAndTaxSavings: resultsAccount1.totalMatchAndTaxSavings + resultsAccount2.totalMatchAndTaxSavings
		};
	} else { // !dual
		results = fsaeEngine.calculate(fsaeCfg, maybeDualAccountTypeId, filingStatusId, numberOfDependents,
			primaryAnnualIncome, spouseAnnualIncome, rolloverAmount, [hsaEligibleExpenses, visionExpenses, dentalExpenses, otherExpenses],
			coverageLevelId);
		results.suggestedLimitedPurposeContribution = 0;
	}

	if (accountTypeIdToAdjust) {
		// Nullify any temporary adjustment that had been made.
		delete fsaeCfg.accountTypes[accountTypeIdToAdjust].contributionMaximumAdjustment;
	}

	results = appDispatch.onEngineDidRunFsaeCalculation(args, results);

	return results;
};

_trace("module() returning");
return appEngine;
});
