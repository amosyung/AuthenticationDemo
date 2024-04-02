//-------------------------------------------------------------------------------------------------
// mpceEngine.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the MPCE calculation engine's methods.  See also mpceConfig.js for the configuration.
//
// IMPORTANT NOTE:  Generally, modification to the methods in the MPCE engine shouldn't be needed
//   unless the current version doesn't allow for some feature of a particular MPCE.  In that case,
//   the correct approach would be to extend the model by defining and adding new configuration
//   properties in mpceConfig.js, followed by corresponding logic to validate the new properties in
//   mpceValidation.js, and finally new logic to interpret the new properties in the engine logic
//   below.  Avoid adding non-generalized company/plan-specific logic directly in the engine.
//

define(["utility", "trace", "corejs"],
(utility, trace) => {
"use strict";

/**
 * @name MpceEngine
 * @type {{
 *   objName: string
 *   version: string
 *   makeLimitObjectCategoryToIdMap: Function
 *   makeOopMaximumObjectCategoryToIdsMap: Function
 *   maybeMarkupConfig: Function
 *   inputsFromEnabledUsageCategoryOptions: Function
 *   lookUpCustomAdjustmentAmount: Function
 *   getPlanFundAmount: Function
 *   getCoverageLevelId: Function
 *   determineCoverageLevelId: Function
 *   determineCoverageLevel: Function
 *   getMinDeductibleAvailable: Function
 *   accumulateDeductibleUsed: Function
 *   getMinOopAvailable: Function
 *   accumulateOopUsed: Function
 *   calculateDeductible: Function
 *   calculateCopay: Function
 *   calculateCoinsurance: Function
 *   calculateService: Function
 *   resolveAmountMapOrAmount: Function
 *   getServiceCost: Function
 *   calculatePlanServices: Function
 *   calculatePlanFunds: Function
 *   calculatePlanPremiums: Function
 *   calculatePlanWorstCaseOopCosts: Function
 *   determinePrimarySavingsAccountType: Function
 *   calculateSinglePlan: Function
 *   rankPlansByPriorities: Function
 *   calculateImpl: Function
 *   calculateWithArgs: Function
 * }}
 */
let me = {};

let isNullOrUndefined = utility.isNullOrUndefined, roundToCents = utility.roundToCents, min = Math.min, min3 = utility.min3,
	max = Math.max, strFmt = utility.stringFormat, formatDollar = utility.formatDollar, getDescription = utility.getDescription;

me.objName = "mpce"; // For use in trace output
me.version = "1.0.62"; // Update for each published release of the engine.

let _traceIsOn = () => trace.isOn();
let _trace = trace.categoryWriteLineMaker(me.objName);

let _assert = function assert(condition, message) {
	if (!condition) {
		message = message ?? "unspecified";
		throw new Error(`MPCE Engine assertion failure: ${message}`);
	}
};

/**
 * @name MpceConfig
 * @type {{
 *   configId: string|undefined
 *   regions: object.<string, Region>
 *   regionsOrder: string[]
 *   regionsDefaultId: string
 *   plans: object.<string, Plan>
 *   plansOrder: string[]
 *   statuses: object.<string, Status>
 *   statusesOrder: string[]
 *   statusesDefaultId: string
 *   coverageLevels: object.<string, CoverageLevel>
 *   coverageLevelsOrder: string[]
 *   coverageLevelCostsPerPlan: object.<string, object>
 *   employerCoverageLevelCostsPerPlan: ?object.<string, object>
 *   adjustments: object.<string, object>
 *   adjustmentsOrder: string[]
 *   services: object.<string, Service>
 *   combinedLimits: object.<string, CombinedLimit>
 *   categories: object.<string, Category>
 *   categoriesOrder: string[]
 *   usageCategories: object.<string, UsageCategory>
 *   usageCategoriesOrder: string[]
 *   isMarkedUpAlready: boolean
 * }}
 */

/**
 * @name Region
 * @type {{
 *   description: string
 *   plans: string[]
 * }}
 */

/**
 * @name Plan
 * @type {{
 *   description: string,
 *   descriptionChart: string|undefined
 *   descriptionTable: string|undefined
 *   descriptionSelect: string|undefined
 *   descriptionPlanProvisions: string|undefined
 *   deductiblesDescription: string|undefined
 *   personDeductibles: object.<string, object>|undefined
 *   familyDeductibles: object.<string, object>|undefined
 *   outOfPocketMaximumsDescription: string|undefined
 *   personOutOfPocketMaximums: object.<string, object>|undefined
 *   familyOutOfPocketMaximums: object.<string, object>|undefined
 *   fundAmountsDescription: string|undefined
 *   fundAmountMap: object.<string, object>|undefined
 *   fundMatchDescription: string|undefined
 *   restrictedFundAmountMap:  object.<string, object>|undefined
 *   categoriesFundEligibility: string[]|undefined
 *   fundAllowsContributions: boolean|undefined
 *   fundContributionsHaveMatch: boolean|undefined
 *   fsaeAccountTypeId: string|undefined
 *   costsObjectId: string|undefined
 *   noTaxCalculator: boolean|undefined
 *   excludeFromTable: boolean|undefined
 *   __engine_categoryToPersonDeductibleId: object.<string, object>|undefined
 *   __engine_categoryToFamilyDeductibleId: object.<string, object>|undefined
 *   __engine_categoryToPersonOopMaxIds: object.<string, object>|undefined
 *   __engine_categoryToFamilyOopMaxIds: object.<string, object>|undefined
 * }}
 */

/** @name Status
 * @type {{
 *   description: string
 * }}
 */

/** @name CoverageLevel
 * @type {{
 *   description: string
 *   spouse: boolean
 *   maxNumChildren: number
 * }}
 */

/**
 * @name Service
 * @type {{
 *   description: string
 *   descriptionForCosts: string|undefined
 *   descriptionForUsage: string|undefined
 *   descriptionPlanProvisions: string|undefined
 *   userInputServiceCountMax: number|undefined
 *   userInputServiceCountIncrement: number|undefined
 *   defaultCost: number|undefined
 *   costs: object.<string, number>|undefined
 *   coverage: object.<string, ServiceCoverage>
 * }}
 */

/**
 * @name ServiceCoverage
 * @type {{
 *   notCovered: boolean|undefined
 *   copay: number|undefined
 *   coinsurance: number|undefined
 *   deductible: string|undefined
 *   additionalPremium: number|undefined
 *   copayNotTowardsOOPMax: boolean|undefined
 *   copayDoesNotReduceCost: boolean|undefined
 *   coveredCount: number|undefined
 *   dollarLimit: number|undefined
 *   coinsuranceNotTowardsOOPMax: boolean|undefined
 *   coinsuranceMinDollar: number|undefined
 *   coinsuranceMaxDollar: number|undefined
 *   singleUseCostMax: number|undefined
 *   combinedLimitId: string|undefined
 * }}
 */

/**
 * @name CombinedLimit
 * @type {{
 *   personReimburseLimit: number|undefined
 *   familyReimburseLimit: number|undefined
 * }}
 */

/** @name Category
 * @type {{
 *   description: string
 *   orderedContents: string[]
 * }}
 */

/** @name UsageCategory
 * @type {{
 *   name: string
 *   description: string
 *   optionsOrder: string[]
 *   simplifiedModelingOptionsOrder: string[]
 *   simplifiedModelingDefault: string
 *   detailedModelingOptionsOrder: string[]
 *   detailedModelingDefault: string
 *   options: object.<string, UsageCategoryOptions>
 *   disabled: boolean
 * }}
 */

/** @name UsageCategoryOptions
 * @type {{
 *   description: string
 *   contents: string[]
 * }}
 */

/**
 * Private (intended) helper method for maybeMarkupConfig().  Attaches a new map to each plan object
 * which allows easy lookup of the person/family deductible id for a given category.
 * @param {MpceConfig} mpceConfig The MPCE configuration object.
 * @param {string} mapName The name of the map to create in each plan.
 * @param {string} limitObjectName The limit object the map will be based on.
 */
me.makeLimitObjectCategoryToIdMap = function makeLimitObjectCategoryToIdMap(
	mpceConfig, mapName, limitObjectName) {

	let plans = mpceConfig.plans, categoriesOrder = mpceConfig.categoriesOrder;
	mpceConfig.plansOrder.forEach((planId) => {
		let plan = plans[planId], planMap = plan[mapName] = {}, planLimitObject = plan[limitObjectName];
		if (typeof planLimitObject !== "undefined") {
			// First, map each service category id to the "general" limit object id.
			categoriesOrder.forEach((categoryId) => { planMap[categoryId] = "general"; });
			// Then override for all custom ids defined in the limit object.
			Object.keys(planLimitObject).filter((id) => id !== "general").forEach((id) => {
				let categories = planLimitObject[id].categories;
				categories.forEach((categoryId) => { planMap[categoryId] = id; });
			});
		}
	});
};

/**
 * Private (intended) helper method for maybeMarkupConfig().  Attaches a new map to each plan object
 * which allows easy lookup of the person/family out-of-pocket maximum ids for a given service category.
 * @param {MpceConfig} mpceConfig The MPCE configuration object.
 * @param {string} mapName The name of the map to create in each plan.
 * @param {string} limitObjectName The limit object the map will be based on.
 */
me.makeOopMaximumObjectCategoryToIdsMap = function makeOopMaximumObjectCategoryToIdsMap(
	mpceConfig, mapName, limitObjectName) {

	let plans = mpceConfig.plans;
	mpceConfig.plansOrder.forEach((planId) => {
		let plan = plans[planId], planMap = plan[mapName] = {}, planLimitObject = plan[limitObjectName];
		if (typeof planLimitObject !== "undefined") {
			Object.entries(planLimitObject).forEach(([id, obj]) => {
				let categories = obj.categories;
				categories.forEach((categoryId) => {
					if (categoryId in planMap) {
						planMap[categoryId].push(id);
					} else {
						planMap[categoryId] = [id];
					}
				});
			});
		}
	});
};

me.maybeMarkupConfig = function maybeMarkupConfig(
	config) {
	///	<summary>
	///	Private (intended) helper method for calculateImpl() which performs additional markup on the
	/// MPCE configuration object.  The additional markup entails:
	///   (1) adding a "__engine_categoryId" property to each service to quickly find the category a service is in,
	///   (2) wrap all single plan coverage objects in an array, so all plan coverage objects are arrays,
	///   (3) adding an "__engine_eligibleForFundsKind" property to each plan coverage within the service, to quickly
	///       determine whether a fund amount (if any) can be used to offset copays, coinsurance, and deductibles
	//        for the service.
	///   (4) building two arrays which will determine the calculation order for a given plan: one
	///       containing services with deductibles, and one containing services with no deductibles.
	///   (5) adding to each plan a mapping from service category to deductible/out-of-pocket maximum ids.
	///	</summary>
	/// <param name="config" type="Object">The MPCE configuration object.</param>
	///	<returns type="undefined"></returns>

	if (config.isMarkedUpAlready) { return; } // Config object is already marked up; nothing to do.

	_trace("maybeMarkupConfig() performing config markup.");

	// Initialization related to markup (4) above.
	let servicesWithDeductibleOrderByPlan = config.__engine_servicesWithDeductibleOrderByPlan = {};
	let servicesNoDeductibleOrderByPlan = config.__engine_servicesNoDeductibleOrderByPlan = {};
	config.plansOrder.forEach((planId) => {
		servicesWithDeductibleOrderByPlan[planId] = [];
		servicesNoDeductibleOrderByPlan[planId] = [];
	});

	let categories = config.categories, services = config.services, plans = config.plans;
	config.categoriesOrder.forEach((categoryId) => {

		categories[categoryId].orderedContents.forEach((serviceId) => {
			let service = services[serviceId], serviceCoverage = service.coverage;

			// Markup (1) above.
			service.__engine_categoryId = categoryId;

			// Markup (2) above.
			Object.entries(serviceCoverage).forEach(([planId, planCoverage]) => {
				if (!Array.isArray(planCoverage)) {
					serviceCoverage[planId] = [planCoverage];
				} // else, it's already an array...
			});

			// Markups (3) and (4) above.
			Object.entries(serviceCoverage).forEach(([planId, planCoverageArray]) => {
				let plan = plans[planId], hasDeductible = false;
				planCoverageArray.forEach((planCoverage) => {
					hasDeductible = hasDeductible || (planCoverage.deductible !== "none");
					if (typeof planCoverage.__engine_eligibleForFundsKind === "undefined") {
						planCoverage.__engine_eligibleForFundsKind = plan.categoriesFundEligibility?.[categoryId] ?? "noFunds";
					} // else, there was already an __engine_eligibleForFundsKind defined explicitly; let it stand.
				});

				// For markup (4)
				if (hasDeductible) {
					servicesWithDeductibleOrderByPlan[planId].push(serviceId);
				} else {
					servicesNoDeductibleOrderByPlan[planId].push(serviceId);
				}
			}); // end for each planId in service.Coverage
		});// end for each serviceId within the category's orderedContents
	}); // end for each category

	// For markup (5) ... deductibles
	me.makeLimitObjectCategoryToIdMap(config, "__engine_categoryToPersonDeductibleId", "personDeductibles");
	me.makeLimitObjectCategoryToIdMap(config, "__engine_categoryToFamilyDeductibleId", "familyDeductibles");

	// For markup (5) ... out-of-pocket maximums
	me.makeOopMaximumObjectCategoryToIdsMap(config, "__engine_categoryToPersonOopMaxIds", "personOutOfPocketMaximums");
	me.makeOopMaximumObjectCategoryToIdsMap(config, "__engine_categoryToFamilyOopMaxIds", "familyOutOfPocketMaximums");

	// Important: Mark the configuration as already marked up, so it isn't performed again on
	// subsequent calls to calculateImpl().
	config.isMarkedUp = true;
};

/**
 * Given an object mapping usage category ids to an option for that usage category, returns an object
 * with the effective service contents for that set of usage category options.
 * @param {MpceConfig} config - The MPCE configuration object.
 * @param {object} usageCategoryOptions - An object mapping usage category ids to an option for the category.
 * @returns {object} An object mapping service ids to counts for the service.
 */
me.inputsFromEnabledUsageCategoryOptions = function inputsFromEnabledUsageCategoryOptions(
	config, usageCategoryOptions) {

	let result = {};
	Object.entries(usageCategoryOptions).forEach(([usageCategoryId, optionId]) => {
		let usageCategory = config.usageCategories[usageCategoryId];
		if (usageCategory && !usageCategory.disabled) {
			let contents = optionId ? usageCategory.options[optionId].contents : {};
			Object.entries(contents).forEach(([serviceId, count]) => {
				result[serviceId] = count + ((serviceId in result) ? result[serviceId] : 0);
			});
		}
	});
	return result;
};

me.lookUpCustomAdjustmentAmount = function lookUpCustomAdjustmentAmount(
	config, adjustmentId, answer, planId, regionId, coverageLevelId, statusId) {
	///	<summary>
	///	Helper method available to be called by application logic. Used to look up custom adjustment amounts from
	/// the MPCE configuration. This method will look up an amount from the mentioned object using a key path of
	/// answer value, planId, regionId, coverageLevelId, and statusId. Failing all, zero is returned. In addition
	/// to valid answers, plan, region, coverage level, and status ids, the special values "otherAnswers",
	/// "otherPlans", "otherRegions", "otherCoverageLevels", and "otherStatuses" can be used at the appropriate
	/// level to provide a default path/value for any corresponding type of id not already specified.
	///	</summary>
	/// <param name="config" type="Object">The MPCE configuration object.</param>
	/// <param name="adjustmentId" type="String">The id of the adjustment object in config.adjustments.</param>
	/// <param name="answer" type="String">The top-level answer key as currently selected by the user.</param>
	/// <param name="planId" type="String">The planId for which the adjustment amount is required.</param>
	/// <param name="regionId" type="String">The user's regionId.</param>
	/// <param name="coverageLevelId" type="String">The user's coverageLevelId.</param>
	/// <param name="statusId" type="String">The user's statusId.</param>
	///	<returns type="Number">The configured amount, or zero if the arguments do not resolve to a configured value.</returns>

	if (!config.hasPassedMpceValidation) {
		throw new Error("Config has not passed MPCE validation.");
	}
	if (!config.adjustmentsOrder.includes(adjustmentId)) {
		throw new Error(strFmt("Passed adjustmentId {0} not present in adjustmentsOrder", adjustmentId));
	}
	let inner = config.adjustments[adjustmentId].answersToAmount, resolved = false, result = 0;
	let path = [
		{ key: answer, altKey: "otherAnswers" },
		{ key: planId, altKey: "otherPlans" },
		{ key: regionId, altKey: "otherRegions" },
		{ key: coverageLevelId, altKey: "otherCoverageLevels" },
		{ key: statusId, altKey: "otherStatuses" }
	];

	path.forEach((pathObj) => {
		if (!resolved && typeof inner === "object" && inner !== null) {
			if (pathObj.key in inner) {
				inner = inner[pathObj.key];
			} else if (pathObj.altKey in inner) {
				inner = inner[pathObj.altKey];
			}
			if (typeof inner === "number") {
				resolved = true;
				result = inner;
			}
		}
	});

	_trace("lookUpCustomAdjustmentAmount for {0}, {1}, {2} result: {3}", adjustmentId, planId, answer, result);
	return result;
};

me.getPlanFundAmount = function getPlanFundAmount(
	plan, regionId, statusId, coverageLevelId, restricted) {
	///	<summary>
	///	Given a plan configuration object, regionId, statusId, and coverageLevelId, returns the fund amount
	/// configured, if any, or zero.
	///	</summary>
	///	<param name="plan" type="Object">An MPCE plan configuration object.</param>
	///	<param name="regionId" type="String">The region id.</param>
	///	<param name="statusId" type="String">The status id.</param>
	///	<param name="coverageLevelId" type="String">The coverage level id.</param>
	///	<param name="restricted" type="String">If passed and matches "restricted", then restrictedFundAmountMap is consulted
	///    instead of the default fundAmountMap.</param>
	///	<returns type="Number">The fund amount configured for the specified combination of parameters, or zero if none.</returns>

	// Consult the corresponding fundAmountMap keyed on coverage level (or region first) if present, or zero if undefined.
	let result, fundAmountMap = (restricted !== "restricted") ? plan.fundAmountMap : plan.restrictedFundAmountMap;
	if (typeof fundAmountMap !== "undefined") {
		// There may or may not be a regionId or statusId level in the amountMap.
		result = (typeof fundAmountMap[regionId] !== "undefined") ? fundAmountMap[regionId][coverageLevelId] :
			((typeof fundAmountMap[statusId] !== "undefined") ? fundAmountMap[statusId][coverageLevelId] : fundAmountMap[coverageLevelId]);
	} else {
		result = 0;
	}
	return result;
};

me.getCoverageLevelId = function getCoverageLevelId(
	config, hasSpouse, numChildren, options) {
	///	<summary>
	///	Given a boolean indicating whether the user has a spouse, and an integer indicating the number of
	/// children, returns the appropriate coverage level ID from the config. Callers might use this method to
	/// determine a coverage level ID prior to invoking calculateImpl() to, for instance, determine premium adjustment
	/// amounts, matching savings account funds, or other client-specific logic driven by coverage level.
	///	</summary>
	///	<param name="config" type="Object">The MPCE configuration object.</param>
	///	<param name="hasSpouse" type="Boolean">True if there is a spouse, false/null/undefined otherwise.</param>
	///	<param name="numChildren" type="Number">The number of children (a whole number)or 0/null/undefined if none.</param>
	///	<param name="options" type="Object">Optional object specifying options for getCoverageLevelId(). Currently, the
	///    only valid option is "skipTracing" (boolean), assumed false if not present. This method may be called frequently
	///    in certain app contexts; set skipTrace in those frequent spots but not in main calculation calls.</param>
	///	<returns type="String">The corresponding coverageLevelId from the config.coverageLevels object.</returns>

	let result = null, coverageLevels = config.coverageLevels;
	config.coverageLevelsOrder.some((coverageLevelId) => {
		let coverageLevel = coverageLevels[coverageLevelId];
		// If there's a spouse and the current coverage level doesn't cover the spouse, then skip it.
		if ((hasSpouse && !coverageLevel.spouse)) { return false; }

		// Then, determine if the number of children covered is sufficient.  If so,
		// then we've located the appropriate coverage level and can stop iterating.
		if (coverageLevel.maxNumChildren >= numChildren) {
			result = coverageLevelId;
			return true;
		}
		return false;
	});

	if (null === result) {
		throw new Error(strFmt("No suitable coverageLevel for hasSpouse: {0}, numChildren: {1}.", hasSpouse, numChildren));
	}

	if (!options || !options.skipTracing) {
		_trace("getCoverageLevelId for hasSpouse: {0}, numChildren: {1} result: {2}", hasSpouse, numChildren, result);
	}
	return result;
};

me.determineCoverageLevelId = function determineCoverageLevelId(
	config, spouse, childrenArray) {
	///	<summary>
	///	Private (intended) helper method for calculateImpl().  Given an object (or null)
	/// for the spouse, and an array for the children (perhaps containing zero objects), returns the
	/// appropriate coverage level based on which of the objects are defined or not.
	///	</summary>
	///	<param name="config" type="Object">The MPCE configuration object.</param>
	///	<param name="spouse" type="Object">A defined object if there is a spouse, or null/undefined otherwise.</param>
	///	<param name="childrenArray" type="Array">An array of children objects.</param>
	///	<returns type="String">The corresponding coverageLevelId from the config.coverageLevels object.</returns>

	let hasSpouse = !isNullOrUndefined(spouse), numChildren = childrenArray.length;
	let result = me.getCoverageLevelId(config, hasSpouse, numChildren);
	return result;
};

me.determineCoverageLevel = function determineCoverageLevel(
	config, spouse, childrenArray) {
	// The new name is "determineCoverageLevelId", but this version is here in case an older
	// MPCE happened to call it by the original name. While the original was intended to be
	// private, in practice something like this was needed by client-specific logic prior
	// to calling calculateImpl().
	return me.determineCoverageLevelId(config, spouse, childrenArray);
};

me.getMinDeductibleAvailable = function getMinDeductibleAvailable(
	personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId) {
	// Returns the lowest deductible amount available, whether personal or family.
	let pa = personAmounts, pg = personDeductiblesId, fa = familyAmounts, fg = familyDeductiblesId;
	let result = min(
		(pg && pa.dedsById[pg]) ? pa.dedsById[pg].available : Infinity,
		(fg && fa.dedsById[fg]) ? fa.dedsById[fg].available : Infinity);
	return result;
};

me.accumulateDeductibleUsed = function accumulateDeductibleUsed(
	amount, personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId) {
	///	<summary>
	///	Private (intended) helper method for calculateDeductible() that accumulates a resulting amount
	/// to the corresponding person and/or family deductible amounts, if applicable.
	///	</summary>
	///	<param name="amount" type="Number">The amount to accumulate.</param>
	///	<param name="personAmounts" type="Object">Object holding the person's deductible and OOP amounts.</param>
	///	<param name="personDeductiblesId" type="String">The person deductible id for this service.</param>
	///	<param name="familyAmounts" type="Object">Object holding the family's deductible and OOP amounts.</param>
	///	<param name="familyDeductiblesId" type="String">The family deductible id for this service.</param>
	///	<returns type="undefined"></returns>

	let pa = personAmounts, pg = personDeductiblesId, fg = familyDeductiblesId;
	if (typeof pg !== "undefined") {
		pa.dedsById[pg].used = roundToCents(pa.dedsById[pg].used + amount);
		let prevPersonalAmount = pa.dedsById[pg].available, newPersonalAmount = roundToCents(prevPersonalAmount - amount);
		_assert(newPersonalAmount >= 0, "Available personal deductible amount should never be negative");
		pa.dedsById[pg].available = newPersonalAmount;
		if (prevPersonalAmount !== newPersonalAmount && newPersonalAmount === 0) {
			pa.dedsById[pg].limitMet = true;
		}
	}
	if (typeof fg !== "undefined") {
		let fa = familyAmounts;
		fa.dedsById[fg].used = roundToCents(fa.dedsById[fg].used + amount);
		let prevFamilyAmount = fa.dedsById[fg].available, newFamilyAmount = roundToCents(prevFamilyAmount - amount);
		_assert(newFamilyAmount >= 0, "Available family deductible amount should never be negative");
		fa.dedsById[fg].available = newFamilyAmount;
		if (prevFamilyAmount !== newFamilyAmount && newFamilyAmount === 0) {
			fa.dedsById[fg].limitMet = true;
		}
	}
};

me.getMinOopAvailable = function getMinOopAvailable(
	chargeType, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {
	// Returns the lowest out-of-pocket amount available for the charge type and ids, whether person or family.
	let pa = personAmounts, pMinAvail = Infinity;
	personOopMaxIds.filter((id) => pa.oopsById[id].chargeTypeSet.has(chargeType)).every(
		(id) => {
			pMinAvail = min(pMinAvail, pa.oopsById[id].available);
			return pMinAvail !== 0;
		});
	let fa = familyAmounts, fMinAvail = Infinity;
	familyOopMaxIds.filter((id) => fa.oopsById[id].chargeTypeSet.has(chargeType)).every(
		(id) => {
			fMinAvail = min(fMinAvail, fa.oopsById[id].available);
			return fMinAvail !== 0;
		});
	let result = min(pMinAvail, fMinAvail);
	return result;
};

me.accumulateOopUsed = function accumulateOopUsed(
	chargeType, amount, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {
	///	<summary>
	///	Private (intended) helper method for calculateDeductible(), calculateCopay(), and calculateCoinsurance()
	/// that accumulates a resulting amount to the corresponding person and/or family OOP amounts, if applicable.
	///	</summary>
	///	<param name="chargeType" type="String">One of "deductible", "copay", or "coinsurance".</param>
	///	<param name="amount" type="Number">The amount to accumulate.</param>
	///	<param name="personAmounts" type="Object">Object holding the person's deductible and OOP amounts.</param>
	///	<param name="personOopMaxIds" type="Array">The person out of pocket maximum ids for this service.</param>
	///	<param name="familyAmounts" type="Object">Object holding the family's deductible and OOP amounts.</param>
	///	<param name="familyOopMaxIds" type="Array">The family out of pocket maximum ids for this service.</param>
	///	<returns type="undefined"></returns>
	_assert(chargeType === "deductible" || chargeType === "copay" || chargeType === "coinsurance",
		"chargeType must be deductible, copay, or coinsurance");
	if (amount > 0) {
		personOopMaxIds.forEach((oopMaxId) => {
			let pa = personAmounts, chargeTypeSetForId = pa.oopsById[oopMaxId].chargeTypeSet;
			// Only accumulate if the charge type matches the kinds of charges the maximum applies to
			if (chargeTypeSetForId.has(chargeType)) {
				pa.oopsById[oopMaxId].used = roundToCents(pa.oopsById[oopMaxId].used + amount);
				let prevPersonalAmount = pa.oopsById[oopMaxId].available, newPersonalAmount = roundToCents(prevPersonalAmount - amount);
				_assert(newPersonalAmount >= 0, "Available personal out-of-pocket amount should never be negative");
				pa.oopsById[oopMaxId].available = newPersonalAmount;
				if (prevPersonalAmount !== newPersonalAmount && newPersonalAmount === 0) {
					pa.oopsById[oopMaxId].maxReached = true;
				}
			}
		});
		familyOopMaxIds.forEach((oopMaxId) => {
			let fa = familyAmounts, chargeTypeSetForId = fa.oopsById[oopMaxId].chargeTypeSet;
			// Only accumulate if the charge type matches the kinds of charges the maximum applies to
			if (chargeTypeSetForId.has(chargeType)) {
				fa.oopsById[oopMaxId].used = roundToCents(fa.oopsById[oopMaxId].used + amount);
				let prevFamilyAmount = fa.oopsById[oopMaxId].available, newFamilyAmount = roundToCents(prevFamilyAmount - amount);
				_assert(newFamilyAmount >= 0, "Available family out-of-pocket amount should never be negative");
				fa.oopsById[oopMaxId].available = newFamilyAmount;
				if (prevFamilyAmount !== newFamilyAmount && newFamilyAmount === 0) {
					fa.oopsById[oopMaxId].maxReached = true;
				}
			}
		});
	}
};

me.calculateDeductible = function calculateDeductible(
	costLeft, singleUseCostMaxLeft, personAmounts, personDeductiblesId, personOopMaxIds,
	familyAmounts, familyDeductiblesId, familyOopMaxIds) {
	///	<summary>
	///	Private (intended) helper method for calculateService() that calculates the
	/// deductible for a service (if any) and accumulates to corresponding person and family amounts.
	///	</summary>
	///	<param name="costLeft" type="Number">The amount of cost remaining for the service.</param>
	///	<param name="singleUseCostMaxLeft" type="Number">Serves to limit the overall cost for a single service.</param>
	///	<param name="personAmounts" type="Object">Object holding the person's deductible and OOP amounts.</param>
	///	<param name="personDeductiblesId" type="String">The person deductible id for this service.</param>
	///	<param name="personOopMaxIds" type="Array">The person out of pocket maximum ids for this service.</param>
	///	<param name="familyAmounts" type="Object">Object holding the family's deductible and OOP amounts.</param>
	///	<param name="familyDeductiblesId" type="String">The family deductible id for this service.</param>
	///	<param name="familyOopMaxIds" type="Array">The family out of pocket maximum ids for this service.</param>
	///	<returns type="Number">The deductible amount calculated.</returns>

	// The deductible paid will be the smaller of the cost left, the per-person deductible available,
	// the family deductible available, the per-person out-of-pocket maximum available for the charge type,
	// and the family out-of-pocket maximum available for the charge type.
	let minDedAvailable = me.getMinDeductibleAvailable(personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId);
	let minOopAvailable = me.getMinOopAvailable("deductible", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
	let minDedOrOopAvailable = min(minDedAvailable, minOopAvailable);
	let deductible = min3(costLeft, singleUseCostMaxLeft, minDedOrOopAvailable);
	if (deductible > 0) {
		// Adjust the deductible amounts and out-of-pocket amounts used and available.
		me.accumulateDeductibleUsed(deductible, personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId);
		me.accumulateOopUsed("deductible", deductible, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
	}
	return deductible;
};

me.calculateCopay = function calculateCopay(
	costLeft, singleUseCostMaxLeft, nominalCopay, copayNotTowardsOOPMax, personAmounts, personOopMaxIds,
	familyAmounts, familyOopMaxIds) {
	///	<summary>
	///	Private (intended) helper method for calculateService() that calculates the
	/// copay for a service (if any) and accumulates to corresponding person and family amounts.
	///	</summary>
	///	<param name="costLeft" type="Number">The amount of cost remaining for the service.</param>
	///	<param name="singleUseCostMaxLeft" type="Number">Serves to limit the overall cost for a single service.</param>
	///	<param name="nominalCopay" type="Number">The nominal copay amount; i.e. the amount that normally would
	///    be paid irrespective of out of pocket maximums and the cost of the service.</param>
	///	<param name="copayNotTowardsOOPMax" type="Boolean">A boolean, true indicating that the copay does
	///    not count towards the out of pocket max, false otherwise.</param>
	///	<param name="personAmounts" type="Object">Object holding the person's deductible and OOP amounts.</param>
	///	<param name="personOopMaxIds" type="Array">The person out of pocket maximum ids for this service.</param>
	///	<param name="familyAmounts" type="Object">Object holding the family's deductible and OOP amounts.</param>
	///	<param name="familyOopMaxIds" type="Array">The family out of pocket maximum ids for this service.</param>
	///	<returns type="Number">The copay amount calculated.</returns>

	// Calculate the potential copay to be paid, irrespective of out-of-pocket maximums.
	let copay = min3(costLeft, nominalCopay, singleUseCostMaxLeft);
	if (!(copayNotTowardsOOPMax ?? false)) {
		// Calculate the actual copay to be paid taking into account out-of-pocket maximums.
		let minOopAvailable = me.getMinOopAvailable("copay", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
		copay = min(copay, minOopAvailable);
		if (copay > 0) {
			// Adjust the out-of-pocket amounts used and available.
			me.accumulateOopUsed("copay", copay, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
		}
	}
	return copay;
};

me.calculateCoinsurance = function calculateCoinsurance(
	costLeft, singleUseCostMaxLeft, nominalCoinsuranceRate, coinsuranceMinDollar, coinsuranceMaxDollar, coinsuranceNotTowardsOOPMax,
	personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {
	///	<summary>
	///	Private (intended) helper method for calculateService() that calculates the
	/// coinsurance for a service (if any) and accumulates to corresponding person and family amounts.
	///	</summary>
	///	<param name="costLeft" type="Number">The amount of cost remaining for the service.</param>
	///	<param name="singleUseCostMaxLeft" type="Number">Serves to limit the overall cost for a single service.</param>
	///	<param name="nominalCoinsuranceRate" type="Number">The nominal coinsurance rate; i.e. the percentage
	///    of the costs left that normally would be paid irrespective of out of pocket maximums.</param>
	///	<param name="coinsuranceMinDollar" type="Number">The minimum dollar amount to enforce for the
	///    coinsurance, or undefined if not applicable.  Note: May increase the coinsurance above the nominal
	///    rate, but never more than the cost remaining.</param>
	///	<param name="coinsuranceMaxDollar" type="Number">The maximum dollar amount to enforce for the
	///    coinsurance, or undefined if not applicable.</param>
	///	<param name="coinsuranceNotTowardsOOPMax" type="Boolean">A boolean, true indicating that the coinsurance
	///    does not count towards the out of pocket max, false otherwise.</param>
	///	<param name="personAmounts" type="Object">Object holding the person's deductible and OOP amounts.</param>
	///	<param name="personOopMaxIds" type="Array">The person out of pocket maximum ids for this service.</param>
	///	<param name="familyAmounts" type="Object">Object holding the family's deductible and OOP amounts.</param>
	///	<param name="familyOopMaxIds" type="Array">The family out of pocket maximum ids for this service.</param>
	///	<returns type="Number">The coinsurance amount calculated.</returns>

	// Calculate the potential coinsurance to be paid, irrespective of out-of-pocket maximums.
	let coinsurance = roundToCents(costLeft * nominalCoinsuranceRate);
	// Adjust for any potential min or max dollar amounts
	coinsurance = max(coinsurance, coinsuranceMinDollar ?? -Infinity);
	coinsurance = min(coinsurance, coinsuranceMaxDollar ?? Infinity);
	coinsurance = min3(coinsurance, costLeft, singleUseCostMaxLeft);
	if (!(coinsuranceNotTowardsOOPMax ?? false)) {
		// Calculate the actual coinsurance to be paid, taking into account out-of-pocket maximums.
		let minOopAvailable = me.getMinOopAvailable("coinsurance", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
		coinsurance = min(coinsurance, minOopAvailable);
		if (coinsurance > 0) {
			// Adjust the out-of-pocket amounts used and available.
			me.accumulateOopUsed("coinsurance", coinsurance, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
		}
	}
	return coinsurance;
};

me.calculateService = function calculateService(
	plan, planId, service, personAmounts, familyAmounts, personNumber) {
	///	<summary>
	///	Private (intended) helper method for calculateSinglePlan() that calculates
	/// deductibles, copays, and coinsurance for a single service.  Note that, while a service is
	/// typically EITHER copay-based or coinsurance-based, in some exceptional cases there could be
	/// both a copay and a coinsurance amount... this method handles all cases.
	///	</summary>
	///	<param name="plan" type="Object">An MPCE plan configuration object.</param>
	///	<param name="planId" type="String">The id for the plan under which the service is being calculated.</param>
	///	<param name="service" type="Object">Object container for service-specific in and out parameters.
	///     See the definition of this object in calculateSinglePlan().</param>
	///	<param name="personAmounts" type="Object">Object container for person amounts in and out parameters.
	///     See the definition of this object in calculateSinglePlan().</param>
	///	<param name="familyAmounts" type="Object">Object container for family amounts in and out parameters.
	///     See the definition of this object in calculateSinglePlan().</param>
	///	<param name="personNumber" type="Number">For trace purposes, ordinal number of the person for whom the
	///     service is being calculated.</param>
	///	<returns type="undefined"></returns>

	// Special case: If the service id starts with "additionalServices" and has a cost of 1 dollar, then the count
	// is meant to represent a dollar amount of additional medical services, and not a count for a specific service.
	// So, set the cost to be the count and the count to be 1 to optimize the loop below for this special case.
	if (service.id.startsWith("additionalServices") && service.cost === 1.0) {
		service.cost = service.count;
		service.count = 1;
	}

	let combinedLimitId, combinedLimitAvailable = Infinity;
	if (typeof service.coverage.combinedLimitId !== "undefined") {
		combinedLimitId = service.coverage.combinedLimitId;
		let personCombinedLimitAvailable = personAmounts.combinedLimitsById[combinedLimitId]?.available ?? Infinity;
		let familyCombinedLimitAvailable = familyAmounts.combinedLimitsById[combinedLimitId]?.available ?? Infinity;
		combinedLimitAvailable = min(personCombinedLimitAvailable, familyCombinedLimitAvailable);
	}

	// Determine how many and how much of the services are covered.  First, if notCovered is true, then
	// none of the services are covered.  Otherwise, if there is no coveredCount defined on the serviceCoverage
	// object, then all of the services will be covered.  Otherwise, some may be covered, and some may not.
	let coveredCount, notCoveredCount;
	if (service.coverage.notCovered ?? false) {
		coveredCount = 0;
		notCoveredCount = service.count;
	} else {
		if (typeof service.coverage.coveredCount !== "undefined") {
			coveredCount = min(service.count, service.coverage.coveredCount);
		} else if (typeof service.coverage.dollarLimit !== "undefined") {
			service.coverage.coveredCountFromDollarLimit = service.coverage.dollarLimit / service.cost;
			coveredCount = min(service.count, service.coverage.coveredCountFromDollarLimit);
		} else {
			coveredCount = service.count;
		}
		notCoveredCount = service.count - coveredCount;
	}

	service.deductibles = 0;
	service.copays = 0;
	service.coinsurance = 0;
	service.additionalPremiums = 0;
	service.reimbursed = 0;
	service.expensesNotCovered = 0;
	service.combinedLimitAttained = false;

	let personDeductibleId = plan.__engine_categoryToPersonDeductibleId[service.__engine_categoryId];
	let familyDeductibleId = plan.__engine_categoryToFamilyDeductibleId[service.__engine_categoryId];

	let personOopMaxIds = plan.__engine_categoryToPersonOopMaxIds[service.__engine_categoryId] ?? [];
	let familyOopMaxIds = plan.__engine_categoryToFamilyOopMaxIds[service.__engine_categoryId] ?? [];

	let coveredCountLeft = coveredCount;

	while ((coveredCountLeft > 0) && (combinedLimitAvailable > 0)) {
		let deductible = 0, copay = 0, coinsurance = 0, additionalPremium = 0;
		let partial = (coveredCountLeft > 1) ? 1 : coveredCountLeft;
		coveredCountLeft -= partial;

		// costLeft is our starting point for further application of deductible, copay, and coinsurance.
		let costLeft = service.cost * partial;
		let singleUseCostMaxLeft = service.coverage.singleUseCostMax ?? Infinity;

		//---------------------------------------------------------------------------------------------------
		// DEDUCTIBLE, IF CALCULATED BEFORE COPAYS.

		if (costLeft > 0 && service.coverage.deductible === "beforeCopay") {
			deductible = me.calculateDeductible(costLeft, singleUseCostMaxLeft,
				personAmounts, personDeductibleId, personOopMaxIds,
				familyAmounts, familyDeductibleId, familyOopMaxIds);
			costLeft -= deductible;
			singleUseCostMaxLeft -= deductible;
		}

		//---------------------------------------------------------------------------------------------------
		// COPAYS.

		if (costLeft > 0 && typeof service.coverage.copay !== "undefined") {
			// Calculate the potential copay to be paid, irrespective of out-of-pocket maximums.
			copay = me.calculateCopay(costLeft, singleUseCostMaxLeft,
				service.coverage.copay, service.coverage.copayNotTowardsOOPMax,
				personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
			costLeft -= (service.coverage.copayDoesNotReduceCost ? 0 : copay);
			singleUseCostMaxLeft -= copay;
		}

		//---------------------------------------------------------------------------------------------------
		// DEDUCTIBLE, IF CALCULATED AFTER COPAYS / BEFORE COINSURANCE.

		if (costLeft > 0 && ((typeof service.coverage.deductible === "undefined") ||
			service.coverage.deductible === "afterCopay" || service.coverage.deductible === "beforeCoinsurance")) {
			deductible = me.calculateDeductible(costLeft, singleUseCostMaxLeft,
				personAmounts, personDeductibleId, personOopMaxIds,
				familyAmounts, familyDeductibleId, familyOopMaxIds);
			costLeft -= deductible;
			singleUseCostMaxLeft -= deductible;
		}

		//---------------------------------------------------------------------------------------------------
		// COINSURANCE.

		if (costLeft > 0 && typeof service.coverage.coinsurance !== "undefined") {
			coinsurance = me.calculateCoinsurance(costLeft, singleUseCostMaxLeft,
				service.coverage.coinsurance, service.coverage.coinsuranceMinDollar,
				service.coverage.coinsuranceMaxDollar, service.coverage.coinsuranceNotTowardsOOPMax,
				personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
			costLeft -= coinsurance;
			singleUseCostMaxLeft -= coinsurance;
		}

		//---------------------------------------------------------------------------------------------------
		// ADDITIONAL PREMIUM.
		// Doesn't reduce cost. Isn't counted in out-of-pocket costs. Isn't eligible for fund reimbursement.

		if (typeof service.coverage.additionalPremium !== "undefined") {
			additionalPremium = service.coverage.additionalPremium;
		}

		let reimbursed = min(combinedLimitAvailable, costLeft);
		combinedLimitAvailable = roundToCents(combinedLimitAvailable - reimbursed);
		costLeft = roundToCents(costLeft - reimbursed);
		service.deductibles = roundToCents(service.deductibles + deductible);
		service.copays = roundToCents(service.copays + copay);
		service.coinsurance = roundToCents(service.coinsurance + coinsurance);
		service.additionalPremiums = roundToCents(service.additionalPremiums + additionalPremium);
		service.reimbursed = roundToCents(service.reimbursed + reimbursed);
		service.expensesNotCovered = roundToCents(service.expensesNotCovered + costLeft);
	} // end while (coveredCountLeft > 0) && (combinedLimitAvailable > 0)

	if (typeof combinedLimitId !== "undefined") {
		if (typeof personAmounts.combinedLimitsById[combinedLimitId] !== "undefined") {
			personAmounts.combinedLimitsById[combinedLimitId].used += service.reimbursed;
			personAmounts.combinedLimitsById[combinedLimitId].available -= service.reimbursed;
		}
		if (typeof familyAmounts.combinedLimitsById[combinedLimitId] !== "undefined") {
			familyAmounts.combinedLimitsById[combinedLimitId].used += service.reimbursed;
			familyAmounts.combinedLimitsById[combinedLimitId].available -= service.reimbursed;
		}
	}
	service.combinedLimitAttained = !(combinedLimitAvailable > 0);
	notCoveredCount += coveredCountLeft; // n.b. may be > 0 if loop exited due to combined limit reached
	service.expensesNotCovered += (notCoveredCount * service.cost);

	if (_traceIsOn()) {
		let personDedMaxed = personDeductibleId && personAmounts.dedsById[personDeductibleId].limitMet;
		let familyDedMaxed = familyDeductibleId && familyAmounts.dedsById[familyDeductibleId].limitMet;
		let personOopMaxed = personOopMaxIds.some((id) => personAmounts.oopsById[id].maxReached);
		let familyOopMaxed = familyOopMaxIds.some((id) => familyAmounts.oopsById[id].maxReached);
		let serviceDesc = service.__engine_categoryId + "/" + service.id + (service.coverageIndex > 0 ? ("[" + service.coverageIndex + "]") : "");
		_trace("{0} | {1}  {2} {3} {4} {5} {6} {7} {8} {9} {10}{11}{12}{13}{14}",
			planId,
			serviceDesc.padStart(32),
			service.count.toString().padStart(4),
			formatDollar(service.cost, true, true, "").padStart(9),
			coveredCount.toString().padStart(4),
			((service.deductibles > 0) ? formatDollar(service.deductibles, true, true, "") : "-.--").padStart(8),
			((service.copays > 0) ? formatDollar(service.copays, true, false, "", ".",
				(service.coverage.copayNotTowardsOOPMax ? "*" : "")) : "-.--").padStart(8),
			((service.coinsurance > 0) ? formatDollar(service.coinsurance, true, false, "", ".",
				(service.coverage.coinsuranceNotTowardsOOPMax ? "*" : "")) : "-.--").padStart(8),
			((service.reimbursed > 0) ? formatDollar(service.reimbursed, true, true, "") : "-.--").padStart(9),
			((service.additionalPremiums > 0) ? formatDollar(service.additionalPremiums, true, true, "") : "-.--").padStart(9),
			(notCoveredCount > 0) ? (" ncc:" + notCoveredCount.toString().padStart(2)) : "",
			(service.isLastCoverageEntry && service.expensesNotCovered > 0) ?
				(" (" + formatDollar(service.expensesNotCovered, true, true, "") + ")") : "",
			(personDedMaxed || familyDedMaxed) ? (" d" + (personDedMaxed ? personNumber : "") + (familyDedMaxed ? "F" : "")) : "",
			(personOopMaxed || familyOopMaxed) ? (" o" + (personOopMaxed ? personNumber : "") + (familyOopMaxed ? "F" : "")) : "",
			service.combinedLimitAttained ? " @ MAX COMBINED LIMIT" : "");
	}
};

me.resolveAmountMapOrAmount = function resolveAmountMapOrAmount(
	amountMap, amount, regionId, statusId, coverageLevelId) {
	// Resolves a configured amount (deductible, or out-of-pocket maximum) from a potential amountMap with key paths, or a plain amount.
	let map = amountMap, result;
	if (typeof map !== "undefined") {
		// There may or may not be a regionId level or statusId level in the amountMap.
		result = typeof map[regionId] !== "undefined" ? map[regionId][coverageLevelId] :
			(typeof map[statusId] !== "undefined" ? map[statusId][coverageLevelId] : map[coverageLevelId]);
	} else {
		result = amount;
	}
	return result;
};

me.getServiceCost = function getServiceCost(plan, service, regionId) {
	// If there's a configured costs object mentioning the region, use that value, else the default cost.
	let result, costsObjectId = plan.costsObjectId ?? "costs";
	if ((costsObjectId in service) && (regionId in service[costsObjectId])) {
		result = service[costsObjectId][regionId];
	} else {
		result = service.defaultCost;
	}
	return result;
};

me.calculatePlanServices = function calculatePlanServices(
	params, plan, services, servicesWithDeductibleOrderByPlan, servicesNoDeductibleOrderByPlan, combinedLimits, peopleServices) {

	let planId = params.planId, regionId = params.regionId, statusId = params.statusId, coverageLevelId = params.coverageLevelId;

	let planServicesResults = {
		totalDeductibles: 0,
		totalCopays: 0,
		totalCoinsurance: 0,
		employeeAdditionalServicePremiums: 0,
		totalExpensesNotCovered: 0,
		totalRawExpenses: 0,
		totalFundEligibleCosts: 0,
		totalFundEligibleCostsRestrictedPart: 0,
		totalMedicalAndDrugCostsExcludingDeductibles: 0,
		totalMedicalAndDrugCosts: 0,
		totalEmployerOrPlanPaidExcludingFund: 0,
		deductiblesMet: { count: 0, family: [], person: [] },
		outOfPocketMaximumsReached: { count: 0, family: [], person: [] }
	};
	let r = planServicesResults;
	Object.seal(r);

	// Container for service-specific in/out parameters for calculateService().
	let service = {
		id: "",
		__engine_categoryId: "",
		count: 0,
		cost: 0,
		coverage: null,
		coverageIndex: 0,
		deductibles: 0,
		copays: 0,
		coinsurance: 0,
		additionalPremiums: 0,
		reimbursed: 0,
		expensesNotCovered: 0,
		combinedLimitAttained: false,
		isLastCoverageEntry: false
	};
	Object.seal(service);

	// Container for family-specific in/out parameters for calculateService().
	let familyAmounts = {
		who: "family",
		dedsById: {},
		oopsById: {},
		combinedLimitsById: {}
	};
	Object.seal(familyAmounts);

	// If the plan configuration specifies a familyDeductibles object, for each id, look inside for
	// either an amountMap (keyed on coverageLevelId, or regionId then coverageLevelId) or an amount.
	// If neither, defaults to infinity.
	let familyDeductibles = plan.familyDeductibles;
	if (typeof familyDeductibles !== "undefined") {
		Object.entries(familyDeductibles).forEach(([id, obj]) => {
			let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
			familyAmounts.dedsById[id] = {
				limit: amount,
				limitMet: false,
				available: amount,
				used: 0
			};
			Object.seal(familyAmounts.dedsById[id]);
		});
	}
	// If the plan configuration specifies a familyOutOfPocketMaximums object, for each id, look inside
	// for either an amountMap (keyed on coverageLevelId, or regionId then coverageLevelId) or an amount.
	// If neither, defaults to infinity.
	let familyOutOfPocketMaximums = plan.familyOutOfPocketMaximums;
	if (typeof familyOutOfPocketMaximums !== "undefined") {
		Object.entries(familyOutOfPocketMaximums).forEach(([id, obj]) => {
			let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
			familyAmounts.oopsById[id] = {
				chargeTypeSet: new Set(obj.chargeTypes ?? ["deductible", "copay", "coinsurance"]),
				max: amount,
				maxReached: false,
				available: amount,
				used: 0
			};
			Object.seal(familyAmounts.oopsById[id]);
		});
	}

	// Set up family combined limits, if any.
	if (typeof combinedLimits !== "undefined") {
		Object.entries(combinedLimits).forEach(([id, obj]) => {
			let amount = obj.familyReimburseLimit;
			if (typeof amount !== "undefined") {
				familyAmounts.combinedLimitsById[id] = {
					limit: amount,
					available: amount,
					used: 0
				};
				Object.seal(familyAmounts.combinedLimitsById[id]);
			}
		});
	}

	// Containers for person-specific in/out parameters for calculateService().
	let peopleAmounts = [], peopleServicesLength = peopleServices.length;
	for (let i = 0; i < peopleServicesLength; i += 1) {
		let personAmounts = {
			who: `person_${i}`,
			dedsById: {},
			oopsById: {},
			combinedLimitsById: {}
		};
		Object.seal(personAmounts);

		let personDeductibles = plan.personDeductibles;
		if (typeof personDeductibles !== "undefined") {
			Object.entries(personDeductibles).forEach(([id, obj]) => {
				let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
				personAmounts.dedsById[id] = {
					limit: amount,
					limitMet: false,
					available: amount,
					used: 0
				};
				Object.seal(personAmounts.dedsById[id]);
			});
		}

		let personOutOfPocketMaximums = plan.personOutOfPocketMaximums;
		if (typeof personOutOfPocketMaximums !== "undefined") {
			Object.entries(personOutOfPocketMaximums).forEach(([id, obj]) => {
				let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
				personAmounts.oopsById[id] = {
					chargeTypeSet: new Set(obj.chargeTypes ?? ["deductible", "copay", "coinsurance"]),
					max: amount,
					maxReached: false,
					available: amount,
					used: 0
				};
				Object.seal(personAmounts.oopsById[id]);
			});
		}

		if (typeof combinedLimits !== "undefined") {
			Object.entries(combinedLimits).forEach(([id, obj]) => {
				let amount = obj.personReimburseLimit;
				if (typeof amount !== "undefined") {
					personAmounts.combinedLimitsById[id] = {
						limit: amount,
						available: amount,
						used: 0
					};
					Object.seal(personAmounts.combinedLimitsById[id]);
				}
			});
		}

		peopleAmounts.push(personAmounts);
	}

	// We need to perform the logic here twice; once for services in the plan that have
	// a deductible and then for services in the plan that have no deductible.  We define
	// this inner helper function here so it can access enclosing scoped variables.
	let calculateServicesInnerFunc = function calculateServicesInner(servicesOrderArray) {
		for (let p = 0, personNumber = 1; p < peopleServicesLength; p += 1, personNumber += 1) {
			_trace("{0} | person #{1}:{2}", planId, personNumber,
				personNumber === 1 ? "               service   cnt    @ cost  cov      ded    copay    coins     reimb     add_p  misc" : "");
			let personServices = peopleServices[p], personAmounts = peopleAmounts[p];
			servicesOrderArray.forEach((serviceId) => {
				let personServiceCount = personServices[serviceId];
				if (typeof personServiceCount === "undefined") { return; }

				let configService = services[serviceId];
				service.__engine_categoryId = configService.__engine_categoryId;
				service.id = serviceId;
				service.count = personServiceCount;
				service.cost = me.getServiceCost(plan, configService, regionId);

				r.totalRawExpenses += (service.count * service.cost); // raw expenses = expenses irrespective of insurance

				// Now iterate through the coverage objects for the service and calculate the expenses after
				// insurance.  Note: maybeMarkupConfig() has ensured everything in coverage is in an array so
				// we can treat them consistently and not have arrays as an exception case.
				let serviceCoverageArray = configService.coverage[planId], serviceCoverageArrayLength = serviceCoverageArray.length;
				let serviceCoverage;
				for (let k = 0; k < serviceCoverageArrayLength; k += 1) {
					serviceCoverage = service.coverage = serviceCoverageArray[k];
					service.coverageIndex = k;
					service.isLastCoverageEntry = (k === serviceCoverageArrayLength - 1);
					me.calculateService(plan, planId, service, personAmounts, familyAmounts, personNumber);

					if (typeof serviceCoverage.coveredCount !== "undefined") {
						// Reduce the visit count for the next coverage object.
						service.count = max(0, service.count - serviceCoverage.coveredCount);
					} else if (typeof serviceCoverage.coveredCountFromDollarLimit !== "undefined") {
						// Reduce the visit count for the next coverage object.
						service.count = max(0, service.count - serviceCoverage.coveredCountFromDollarLimit);
					}

					// Accumulate the per-service results into the overall results for the plan.
					r.totalDeductibles += service.deductibles;
					r.totalCopays += service.copays;
					r.totalCoinsurance += service.coinsurance;
					r.employeeAdditionalServicePremiums += service.additionalPremiums;
					let maybeEligibleFundCosts = service.deductibles + service.copays + service.coinsurance;
					r.totalFundEligibleCostsRestrictedPart +=
						(serviceCoverage.__engine_eligibleForFundsKind === "allFunds") ? maybeEligibleFundCosts : 0;
					r.totalFundEligibleCosts +=
						(serviceCoverage.__engine_eligibleForFundsKind !== "noFunds") ? maybeEligibleFundCosts : 0;

					// Perhaps gross up totalRawExpenses if service coverage indicates the copay doesn't reduce
					// the cost of the service; i.e. the copay acts like a surcharge. While this is exceptional,
					// this adjustment does keep everything in balance when copayDoesNotReduceCost is true.
					r.totalRawExpenses += serviceCoverage.copayDoesNotReduceCost ? service.copays : 0;

					// Special case: We don't process any coverage objects in the array that may follow a
					// coverage object referencing a combined limit once such limit has been attained.
					if (service.combinedLimitAttained) { break; }

					// Note: We don't accumulate expensesNotCovered for each coverage object, only
					// for the last one, which is why it is below outside of the loop.

				} // end for each object on the service coverage array

				r.totalFundEligibleCostsRestrictedPart +=
					(serviceCoverage.__engine_eligibleForFundsKind === "allFunds") ? service.expensesNotCovered : 0;
				r.totalFundEligibleCosts +=
					(serviceCoverage.__engine_eligibleForFundsKind !== "noFunds") ? service.expensesNotCovered : 0;

				r.totalExpensesNotCovered += service.expensesNotCovered;
			});
		} // end for each personService in peopleServices
	}; // end inner helper function()

	_trace("{0} .----- first pass: services with deductible: ------------------------------------------------------------------", planId);
	calculateServicesInnerFunc(servicesWithDeductibleOrderByPlan[planId]);
	_trace("{0} +----- second pass: services without deductible: --------------------------------------------------------------", planId);
	calculateServicesInnerFunc(servicesNoDeductibleOrderByPlan[planId]);

	r.totalMedicalAndDrugCostsExcludingDeductibles = r.totalCopays + r.totalCoinsurance + r.totalExpensesNotCovered;
	r.totalMedicalAndDrugCosts = r.totalDeductibles + r.totalCopays + r.totalCoinsurance + r.totalExpensesNotCovered;

	// Employer or plan (insurance) covered costs, excluding what any plan fund has paid.
	r.totalEmployerOrPlanPaidExcludingFund = r.totalRawExpenses - r.totalMedicalAndDrugCosts;

	_trace("{0} +--------------------------------------------------------------------------------------------------------------", planId);
	_trace("{0} |                                                     total deds + copays +  coins  =  oop costs     add_ps", planId);
	_trace("{0} | total services OOP costs & additional premiums:       {1} {2} {3}  =  {4}   {5}", planId,
		((r.totalDeductibles > 0) ? formatDollar(r.totalDeductibles, true, true, "") : "-.--").padStart(8),
		((r.totalCopays > 0) ? formatDollar(r.totalCopays, true, true, "") : "-.--").padStart(8),
		((r.totalCoinsurance > 0) ? formatDollar(r.totalCoinsurance, true, true, "") : "-.--").padStart(8),
		((r.totalMedicalAndDrugCosts > 0) ? formatDollar(r.totalMedicalAndDrugCosts, true, true, "") : "-.--").padStart(9),
		((r.employeeAdditionalServicePremiums > 0) ? formatDollar(r.employeeAdditionalServicePremiums, true, true, "") : "-.--").padStart(8));
	_trace("{0} '--------------------------------------------------------------------------------------------------------------", planId);

	// Include in the results for the plan which specific deductibles were met.
	let dsMet = r.deductiblesMet;
	Object.keys(familyAmounts.dedsById).filter((k) => familyAmounts.dedsById[k].limitMet).forEach((k) => { dsMet.family.push(k); });
	peopleAmounts.forEach((pa) => {
		Object.keys(pa.dedsById).filter((k) => pa.dedsById[k].limitMet).forEach((k) => { dsMet.person.push(`${pa.who}/${k}`); });
	});
	dsMet.count = dsMet.family.length + dsMet.person.length;

	// Include in the results for the plan which specific out-of-pocket maximums were reached.
	let oopsReached = r.outOfPocketMaximumsReached;
	Object.keys(familyAmounts.oopsById).filter((k) => familyAmounts.oopsById[k].maxReached).forEach((k) => { oopsReached.family.push(k); });
	peopleAmounts.forEach((pa) => {
		Object.keys(pa.oopsById).filter((k) => pa.oopsById[k].maxReached).forEach((k) => { oopsReached.person.push(`${pa.who}/${k}`); });
	});
	oopsReached.count = oopsReached.family.length + oopsReached.person.length;

	Object.freeze(planServicesResults); // r was a synonym for this
	return planServicesResults;
};

me.calculatePlanFunds = function calculatePlanFunds(
	params, servicesResults, plan, fundRolloverAmount, voluntaryFundContributionAmount, planFundAdditionalMatchAmount,
	applyFundsToCostOfCareOption, voluntaryFundContributionLimit, planFundAdjustmentAmount) {

	let planFundsResults = {
		fundAllowsContributions: plan.fundAllowsContributions ?? false,
		fundContributionsHaveMatch: plan.fundContributionsHaveMatch ?? false,
		planFundAmountRestrictedPart: 0,
		planFundAmountExcludingAdjustment: 0,
		planFundAmount: 0,
		planFundAndMatchTotal: 0,
		planFundAdjustmentAmount: 0,
		planFundAdditionalMatchAmount: 0,
		incomingFundRolloverAmount: 0,
		voluntaryFundContributionAmount: 0,
		voluntaryFundContributionLimit: null,
		totalFundAmount: 0,
		totalFundAmountOffset: 0,
		planFundPaid: 0,
		planFundAdditionalMatchPaid: 0,
		voluntaryFundPaid: 0,
		rolloverFundPaid: 0,
		planFundAndMatchTotalPaid: 0,
		planFundAndMatchTotalUnused: 0,
		planFundUnused: 0,
		planFundAdditionalMatchUnused: 0,
		fundCarryoverBalance: 0,
		fundCarryoverBalanceRestrictedPart: 0,
		fundCarryoverBalanceUnrestrictedPart: 0,
		totalMedicalAndDrugCostsLessFundOffset: 0,
		totalCurrentYearFundContributions: 0 // Deprecated. See note below.
	};
	let r = planFundsResults;
	Object.seal(r);

	let regionId = params.regionId, statusId = params.statusId, coverageLevelId = params.coverageLevelId;
	r.planFundAmountRestrictedPart = me.getPlanFundAmount(plan, regionId, statusId, coverageLevelId, "restricted");
	r.planFundAmountExcludingAdjustment = r.planFundAmountRestrictedPart + me.getPlanFundAmount(plan, regionId, statusId, coverageLevelId);
	r.planFundAmount = r.planFundAmountExcludingAdjustment + planFundAdjustmentAmount;
	r.planFundAndMatchTotal = r.planFundAmount + planFundAdditionalMatchAmount;

	// These were inputs, but are handy to have in results, too:
	r.planFundAdjustmentAmount = planFundAdjustmentAmount;
	r.planFundAdditionalMatchAmount = planFundAdditionalMatchAmount;
	r.incomingFundRolloverAmount = fundRolloverAmount;
	r.voluntaryFundContributionAmount = voluntaryFundContributionAmount;
	r.voluntaryFundContributionLimit = voluntaryFundContributionLimit;
	r.totalFundAmount = r.planFundAndMatchTotal + voluntaryFundContributionAmount + fundRolloverAmount;

	let restrictedFundAmountRemaining = r.planFundAmountRestrictedPart;
	let unrestrictedFundAmountRemaining =
		r.planFundAndMatchTotal + fundRolloverAmount + voluntaryFundContributionAmount - r.planFundAmountRestrictedPart;

	if (applyFundsToCostOfCareOption === "applyERCoreFundsOnly") {

		// Restricted funds should be used before unrestricted funds.
		let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
		restrictedFundAmountRemaining -= restrictedFundAmountOffset;
		let unrestrictedFundAmountOffset = min(
			max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0),
			r.planFundAmount - r.planFundAmountRestrictedPart);
		unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
		r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

		// Amounts paid when for applying ER core funds only. Plan funds are considered to be used first.
		r.planFundPaid = r.totalFundAmountOffset;
		r.planFundAdditionalMatchPaid = 0;
		r.voluntaryFundPaid = 0;
		r.rolloverFundPaid = 0;

	} else if (applyFundsToCostOfCareOption === "applyERFundsOnly") {

		// Restricted funds should be used before unrestricted funds.
		let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
		restrictedFundAmountRemaining -= restrictedFundAmountOffset;
		let unrestrictedFundAmountOffset = min(
			max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0),
			r.planFundAndMatchTotal - r.planFundAmountRestrictedPart);
		unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
		r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

		// Amounts paid when applying ER core + match funds only. Plan funds are considered to be used first, then plan match funds.
		r.planFundPaid = min(r.totalFundAmountOffset, r.planFundAmount - restrictedFundAmountRemaining);
		r.planFundAdditionalMatchPaid = min(r.totalFundAmountOffset - r.planFundPaid, planFundAdditionalMatchAmount);
		r.voluntaryFundPaid = 0;
		r.rolloverFundPaid = 0;

	} else if (applyFundsToCostOfCareOption === "applyEEFundsOnly") {

		// Restricted funds arise only from employer/plan funds and so are not applied for EE only case.
		let restrictedFundAmountOffset = 0;
		restrictedFundAmountRemaining -= restrictedFundAmountOffset;
		let unrestrictedFundAmountOffset = min(
			max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0),
			fundRolloverAmount + voluntaryFundContributionAmount);
		unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
		r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

		// Amounts paid when applying EE funds only. Current year contributions are considered to be used first, then rollover funds.
		r.planFundPaid = 0;
		r.planFundAdditionalMatchPaid = 0;
		r.voluntaryFundPaid = min(r.totalFundAmountOffset, voluntaryFundContributionAmount);
		r.rolloverFundPaid = r.totalFundAmountOffset - r.voluntaryFundPaid;

	} else if (applyFundsToCostOfCareOption === "applyAllFunds") {

		let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
		restrictedFundAmountRemaining -= restrictedFundAmountOffset;
		let unrestrictedFundAmountOffset = min(
			max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0),
			r.planFundAndMatchTotal + fundRolloverAmount + voluntaryFundContributionAmount - r.planFundAmountRestrictedPart);
		unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
		r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

		// Amounts paid when applying all funds. Plan funds are considered to be used first, then plan match funds, then current
		// year contributions, then rollover funds.
		r.planFundPaid = min(r.totalFundAmountOffset, r.planFundAmount - restrictedFundAmountRemaining);
		r.planFundAdditionalMatchPaid = min(r.totalFundAmountOffset - r.planFundPaid, planFundAdditionalMatchAmount);
		r.voluntaryFundPaid = min(
			r.totalFundAmountOffset - (r.planFundPaid + r.planFundAdditionalMatchPaid), voluntaryFundContributionAmount);
		r.rolloverFundPaid = r.totalFundAmountOffset - (r.planFundPaid + r.planFundAdditionalMatchPaid + r.voluntaryFundPaid);

	} // else applyFundsToCostOfCareOption was "applyNoFunds" or not recognized; all funds roll over instead.

	r.planFundAndMatchTotalPaid = r.planFundPaid + r.planFundAdditionalMatchPaid;
	r.planFundAndMatchTotalUnused = r.planFundAndMatchTotal - r.planFundAndMatchTotalPaid;
	r.planFundUnused = r.planFundAmount - r.planFundPaid;
	r.planFundAdditionalMatchUnused = r.planFundAdditionalMatchAmount - r.planFundAdditionalMatchPaid;

	r.totalMedicalAndDrugCostsLessFundOffset = servicesResults.totalMedicalAndDrugCosts - r.totalFundAmountOffset;
	r.fundCarryoverBalance = restrictedFundAmountRemaining + unrestrictedFundAmountRemaining;
	r.fundCarryoverBalanceRestrictedPart = restrictedFundAmountRemaining;
	r.fundCarryoverBalanceUnrestrictedPart = unrestrictedFundAmountRemaining;

	Object.freeze(planFundsResults); // r was a synonym for this
	return planFundsResults;
};

me.calculatePlanPremiums = function calculatePlanPremiums(
	params, coverageLevelCostsPerPlan, employerCoverageLevelCostsPerPlan, premiumAdjustmentObjectOrAmount, employeeAdditionalServicePremiums) {

	let planId = params.planId, regionId = params.regionId, statusId = params.statusId, coverageLevelId = params.coverageLevelId;

	let planPremiumsResults = {
		employeePlanPremiumAdjustment: 0,
		employerPlanPremiumAdjustment: 0,
		employeeNamedPremiumAdjustmentAmounts: null,
		employerNamedPremiumAdjustmentAmounts: null,
		employeeAdditionalServicePremiums: 0,
		totalAnnualPayrollContributionsExcludingAdjustment: 0,
		totalAnnualPayrollContributionsMaybeNegative: 0,
		totalAnnualPayrollContributions: 0,
		employerPlanPremiumExcludingAdjustment: 0,
		employerPlanPremiumMaybeNegative: 0,
		employerPlanPremium: 0
	};
	let r = planPremiumsResults;
	Object.seal(r);

	// Determine employee and employer premium adjustments from scalar amount or object passed in.
	let employeePlanPremiumAdjustment = 0, employerPlanPremiumAdjustment = 0, employeeNamedAmounts = {}, employerNamedAmounts = {};
	if (!isNullOrUndefined(premiumAdjustmentObjectOrAmount)) {
		switch (typeof premiumAdjustmentObjectOrAmount) {
			case "number":
				employeePlanPremiumAdjustment = premiumAdjustmentObjectOrAmount;
				break;
			case "object":
				employeePlanPremiumAdjustment = premiumAdjustmentObjectOrAmount.employee ?? 0;
				employerPlanPremiumAdjustment = premiumAdjustmentObjectOrAmount.employer ?? 0;
				employeeNamedAmounts = premiumAdjustmentObjectOrAmount.employeeNamedAmounts ?? {};
				employerNamedAmounts = premiumAdjustmentObjectOrAmount.employerNamedAmounts ?? {};
				break;
			default:
				break;
		}
	}
	r.employeePlanPremiumAdjustment = employeePlanPremiumAdjustment;
	r.employerPlanPremiumAdjustment = employerPlanPremiumAdjustment;
	r.employeeNamedPremiumAdjustmentAmounts = employeeNamedAmounts;
	r.employerNamedPremiumAdjustmentAmounts = employerNamedAmounts;
	r.employeeAdditionalServicePremiums = employeeAdditionalServicePremiums;

	// Determine annual employee payroll contributions. Note: coverageLevelCostsPerPlan may or may not have a level
	// for regionId. First, try to find the regionId. If it isn't defined, then just try to find it based on statusId.
	let eePlanPremiums = coverageLevelCostsPerPlan[planId];
	if (typeof eePlanPremiums[regionId] !== "undefined") {
		r.totalAnnualPayrollContributionsExcludingAdjustment = (eePlanPremiums[regionId][coverageLevelId][statusId] ?? 0);
	} else {
		r.totalAnnualPayrollContributionsExcludingAdjustment = (eePlanPremiums[coverageLevelId][statusId] ?? 0);
	}
	r.totalAnnualPayrollContributionsMaybeNegative = r.totalAnnualPayrollContributionsExcludingAdjustment + employeePlanPremiumAdjustment;
	r.totalAnnualPayrollContributions = max(0, r.totalAnnualPayrollContributionsMaybeNegative);

	// Determine annual employer plan premiums; lookup is similar to coverageLevelCostsPerPlan, just above.
	let erPlanPremiums = employerCoverageLevelCostsPerPlan?.[planId] ?? null;
	if (erPlanPremiums) {
		if (typeof erPlanPremiums[regionId] !== "undefined") {
			r.employerPlanPremiumExcludingAdjustment = (erPlanPremiums[regionId][coverageLevelId][statusId] ?? 0);
		} else {
			r.employerPlanPremiumExcludingAdjustment = (erPlanPremiums[coverageLevelId][statusId] ?? 0);
		}
	} else {
		r.employerPlanPremiumExcludingAdjustment = 0;
	}
	r.employerPlanPremiumMaybeNegative = r.employerPlanPremiumExcludingAdjustment + employerPlanPremiumAdjustment;
	r.employerPlanPremium = max(0, r.employerPlanPremiumMaybeNegative);

	Object.freeze(planPremiumsResults); // r was a synonym for this
	return planPremiumsResults;
};

me.calculatePlanWorstCaseOopCosts = function calculatePlanWorstCaseOopCosts(
	params, plan, config, numberOfPeople) {

	// First, if any service coverage object for the plan has either an additionalPremium, or is notCovered and has a cost
	// greater than zero, then worst case out-of-pocket costs for the plan are unlimited, because use of those services yields
	// costs that are not subject to any OOP maximum. If this is the case then no further processing is necessary.
	let services = config.services, planId = params.planId, regionId = params.regionId, isUnlimited = false, basedOn;
	Object.keys(services).every((serviceId) => {
		let service = services[serviceId], coverages = service.coverage[planId], coveragesLength = coverages.length, i, coverage,
			isLastCoverageEntry, basedOnProp;
		for (i = 0; i < coveragesLength; i += 1) {
			coverage = coverages[i];
			isLastCoverageEntry = (i === coveragesLength - 1);
			if (("additionalPremium" in coverage) && coverage.additionalPremium > 0) {
				basedOnProp = "additionalPremium";
				isUnlimited = true;
			} else if (("coinsuranceNotTowardsOOPMax" in coverage) && coverage.coinsuranceNotTowardsOOPMax && coverage.coinsurance > 0) {
				basedOnProp = "coinsuranceNotTowardsOOPMax";
				isUnlimited = true;
			} else if (("copayNotTowardsOOPMax" in coverage) && coverage.copayNotTowardsOOPMax && coverage.copay > 0) {
				basedOnProp = "copayNotTowardsOOPMax";
				isUnlimited = true;
			} else if (("notCovered" in coverage) && coverage.notCovered) {
				basedOnProp = "notCovered";
				isUnlimited = true;
			} else if (isLastCoverageEntry) {
				if (("coveredCount" in coverage) && coverage.coveredCount > 0) {
					basedOnProp = "coveredCount";
					isUnlimited = true;
				} else if (("dollarLimit" in coverage) && coverage.dollarLimit > 0) {
					basedOnProp = "dollarLimit";
					isUnlimited = true;
				}
			}
			if (isUnlimited) {
				basedOn = strFmt("{0}.coverage[{1}] has {2}", serviceId, i, basedOnProp);
				break;
			}
		}
		return !isUnlimited;
	});
	if (isUnlimited) {
		return { amount: Infinity, basedOn };
	}
	// After considering whether specific services could have given rise to potentially unlimited OOP costs, we can ignore
	// services and work at the category level, to determine whether there is a combination of out-of-pocket maximums with
	// a finite dollar amount that would limit all categories.

	// First, build up a map containing all configured out-of-pocket maximum objects for the plan, whether person or
	// family out-of-pocket maximums, keyed on the categories configured for the maximum. In the resulting object, each
	// per-person amount is multiplied by the number of people, while family amounts remain as-is. In case of overlap
	// between categories configured by a person OOP max object and a family OOP max object, the lower amount wins.
	// Only OOP maximum objects that do not limit by charge type are included.
	let combinations = {}, statusId = params.statusId, coverageLevelId = params.coverageLevelId;
	let hasAllChargeTypes = (c) => isNullOrUndefined(c) || (c.includes("deductible") && c.includes("copay") && c.includes("coinsurance"));
	["family", "person"].forEach((type) => {
		let outOfPocketMaximumsPropName = type + "OutOfPocketMaximums", prefix = (type === "person" ? numberOfPeople.toString() + "x_" : "");
		if (outOfPocketMaximumsPropName in plan) {
			let oopMaximums = plan[outOfPocketMaximumsPropName];
			Object.entries(oopMaximums).forEach(([oopMaxId, oopMaxObj]) => {
				if (!hasAllChargeTypes(oopMaxObj.chargeTypes)) { return; }
				let categories = oopMaxObj.categories.concat().sort(), categoriesSet = new Set(categories), csv = categories.join(",");
				let amount = (type === "person" ? numberOfPeople : 1) *
					me.resolveAmountMapOrAmount(oopMaxObj.amountMap, oopMaxObj.amount, regionId, statusId, coverageLevelId);
				if (!(csv in combinations) || (amount < combinations[csv].amount)) {
					combinations[csv] = { categoriesSet, amount, from: prefix + oopMaxId };
				}
			});
		}
	});

	// Next, generate additional combinations of the out-of-pocket maximum objects until no more new or lower
	// combinations are possible. Following that, the effective out-of-pocket maximum for the full set of categories
	// may have been determined, or there is no such full set.
	let madeChange, nextCombinations, loopCountFailSafe = 0;
	do {
		madeChange = false;
		nextCombinations = Object.assign({}, combinations);
		loopCountFailSafe += 1;
		let keys = Object.keys(combinations);
		for (let i = 0; i < keys.length; i += 1) {
			let oKey = keys[i], outerSet = combinations[oKey].categoriesSet;
			for (let j = 0; j < keys.length; j += 1) {
				if (i !== j) {
					let iKey = keys[j], innerSet = combinations[iKey].categoriesSet;
					let categoriesSet = innerSet.union(outerSet), categories = Array.from(categoriesSet).sort(), csv = categories.join(",");
					let amount = combinations[oKey].amount + combinations[iKey].amount;
					if (!(csv in combinations) || (amount < combinations[csv].amount)) {
						nextCombinations[csv] = { categoriesSet, amount, from: combinations[oKey].from + "," + combinations[iKey].from };
						madeChange = true;
					}
				}
			}
		}
		combinations = nextCombinations;
	} while (madeChange && loopCountFailSafe < 100);
	// If the loop didn't terminate within the fail safe count, assume there is no satisfying set.
	// If the loop did terminate within the fail safe count, there may be a satisfying set.
	let allCategoriesCsv = config.categoriesOrder.concat().sort().join(","), result = { amount: Infinity, basedOn: "indeterminate" };
	if (allCategoriesCsv in combinations) {
		result.amount = combinations[allCategoriesCsv].amount;
		result.basedOn = combinations[allCategoriesCsv].from;
	}
	return result;
};

me.determinePrimarySavingsAccountType = function determinePrimarySavingsAccountType(config, fsaeConfig, planId) {
	// Private (intended) helper method for calculateSinglePlan() that determines a plan's primary savings account
	// type. Returns null if the plan has no fsaeAccountTypeId or if account configuration is not available.
	// Otherwise, returns the primary account type based on the value of the followRulesFor property for the first
	// account specified by fsaeAccountTypeId (which may contain two ids; e.g. "HSA+LPFSA").
	let result = null;
	if (!isNullOrUndefined(fsaeConfig)) {
		let planConfig = config.plans[planId], maybeDualAccountTypeId = planConfig.fsaeAccountTypeId;
		if (!isNullOrUndefined(maybeDualAccountTypeId)) {
			let components = maybeDualAccountTypeId.split("+"); // e.g. "HSA+LPFSA"
			let primaryAccountTypeId = components[0]; // e.g. the "HSA" part if compound, or the whole if no "+" was found
			result = fsaeConfig.accountTypes[primaryAccountTypeId].followRulesFor;
		}
	}
	return result;
};

me.calculateSinglePlan = function calculateSinglePlan(
	config, fsaeConfig, planId, regionId, statusId, coverageLevelId, peopleServices, fundRolloverAmount, voluntaryFundContributionAmount,
	premiumAdjustmentObjectOrAmount, planFundAdditionalMatchAmount, applyFundsToCostOfCareOption, voluntaryFundContributionLimit,
	planFundAdjustmentAmount) {
	///	<summary>
	///	Private (intended) helper method for calculateImpl() which performs the calculation for the specified planId.
	///	</summary>
	///	<param name="config" type="Object">The MPCE configuration object.</param>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object. LATER: Consolidate into the MPCE configuration object.</param>
	///	<param name="planId" type="String">The planId for the calculation.</param>
	///	<param name="regionId" type="String">The regionId for the calculation.</param>
	///	<param name="statusId" type="String">The employee statusId for the calculation.</param>
	///	<param name="coverageLevelId" type="String">The employee coverageLevelId for the calculation.</param>
	///	<param name="peopleServices" type="Array">An array of objects.  Each object contains a map of service
	///     ids to counts for a person.  If a given service id is not mentioned, it's assumed to be zero.</param>
	///	<param name="fundRolloverAmount" type="Number">The fund rollover amount (from a prior year.)</param>
	///	<param name="voluntaryFundContributionAmount" type="Number">The voluntary fund contribution amount
	///     (for the current year.)</param>
	///	<param name="premiumAdjustmentObjectOrAmount" type="Object">If a number, then it is treated as an amount
	///     that adjusts only the configured employee plan premium. If an object, then values for both employee and
	///     employer premiums are retrieved from values within keyed as "employee" and "employer", or zero failing
	///     those.</param>
	///	<param name="planFundAdditionalMatchAmount" type="Number">An additional plan fund matching amount.  This
	///     would be determined outside the engine by custom logic, if the plan allows for a match on voluntary
	///     contributions, for instance.</param>
	///	<param name="applyFundsToCostOfCareOption" type="String">Specifies how to apply fund amounts to the cost
	// 		of care. Valid options are applyNoFunds, applyERCoreFundsOnly, applyERFundsOnly, applyEEFundsOnly,
	// 	    and applyAllFunds.</param>
	///	<param name="voluntaryFundContributionLimit" type="Number">The voluntary fund contribution limit (for the
	///     current year.) NOTE: This is only added to results; not (yet) enforced at the MPCE engine level.</param>
	///	<param name="planFundAdjustmentAmount" type="Number">An adjustment to the plan core fund amount, not
	///     considered a matching amount. This would be determined outside the engine by custom logic.</param>
	///	<returns type="Object">An object containing the calculation results for the plan.  The result
	///     object contains the planId to which it corresponds, as well as the various result values,
	///     which are currently numbers representing dollar amounts.
	/// </returns>

	let plan = config.plans[planId], servicesResults, fundsResults, premiumsResults;

	_trace(`${planId} >>========= calculateSinglePlan() called ==========`);

	let params = {
		planId,
		planName: plan.description,
		description: plan.description,
		descriptionChart: getDescription(plan, "descriptionChart"),
		descriptionTable: getDescription(plan, "descriptionTable"),
		descriptionSelect: getDescription(plan, "descriptionSelect"),
		descriptionPlanProvisions: getDescription(plan, "descriptionPlanProvisions"),
		// LATER: Consolidate MPCE and FSAE engines into single engine w/single config file
		fsaeAccountTypeId: plan.fsaeAccountTypeId,
		fsaePrimaryAccountType: me.determinePrimarySavingsAccountType(config, fsaeConfig, planId),
		regionId,
		statusId,
		coverageLevelId,
		coverageLevel: getDescription(config.coverageLevels[coverageLevelId]),
		alternateChartStack: plan.alternateChartStack ?? false,
		applyFundsToCostOfCareOption
	};
	Object.freeze(params);

	// Calculate the total of deductibles, copays, coinsurance, etc. for all services used.
	let s = servicesResults = me.calculatePlanServices(params, plan, config.services, config.__engine_servicesWithDeductibleOrderByPlan,
		config.__engine_servicesNoDeductibleOrderByPlan, config.combinedLimits, peopleServices);

	// Determine fund amounts, which fund amounts applied, and total fund offset amount.
	let f = fundsResults = me.calculatePlanFunds(params, servicesResults, plan, fundRolloverAmount, voluntaryFundContributionAmount,
		planFundAdditionalMatchAmount, applyFundsToCostOfCareOption, voluntaryFundContributionLimit, planFundAdjustmentAmount);

	// Determine employee and employer plan premiums with adjustments based on specific criteria.
	let p = premiumsResults = me.calculatePlanPremiums(params, config.coverageLevelCostsPerPlan,
		config.employerCoverageLevelCostsPerPlan, premiumAdjustmentObjectOrAmount, servicesResults.employeeAdditionalServicePremiums);

	// Calculate final totals that combine various results from above sets.
	let totalsResults = {
		totalCareAndPayrollContributions:
			f.totalMedicalAndDrugCostsLessFundOffset + p.totalAnnualPayrollContributions + p.employeeAdditionalServicePremiums,
		employerOrPlanTotalAnnualCosts: s.totalEmployerOrPlanPaidExcludingFund + f.planFundAndMatchTotalPaid + p.employerPlanPremium,
		employeeTotalAnnualCosts: f.totalMedicalAndDrugCostsLessFundOffset + f.voluntaryFundPaid +
			p.totalAnnualPayrollContributions + p.employeeAdditionalServicePremiums
	};
	totalsResults.totalCosts = totalsResults.employerOrPlanTotalAnnualCosts + totalsResults.employeeTotalAnnualCosts + f.rolloverFundPaid;

	// Combine result parts into one object. While keeping these structured might be better, for legacy
	// compatibility (for now) primary results are expected as properties at top level of returned object.
	let r = {};
	Object.assign(r, params);
	Object.assign(r, servicesResults);
	Object.assign(r, fundsResults);
	Object.assign(r, premiumsResults);
	Object.assign(r, totalsResults);

	// Determine employee worst case costs: worst case out-of-pocket costs plus annual premiums, less any plan base and matching amounts.
	let wcResult = me.calculatePlanWorstCaseOopCosts(params, plan, config, peopleServices.length);
	r.worstCaseEmployeeCosts = wcResult.amount + p.totalAnnualPayrollContributions - r.planFundAmount - r.planFundAdditionalMatchAmount;
	r.worstCaseEmployeeCostsBasedOn = wcResult.basedOn;

	// Round to be rid of any fractional cents that might remain.
	utility.roundResultNumbersToCents(r);

	// Trace out the results for debugging purposes
	if (_traceIsOn()) {
		_trace("{0} ***** Results ****", r.planId);
		let entries = Object.entries(r);
		// Strings first, quoted. The objects, in JSON. Then non-numbers, unquoted. Then numbers, formatted.
		for (let [k, v] of entries) { typeof v === "string" && _trace("{0} {1}: \"{2}\"", r.planId, k, r[k]); }
		for (let [k, v] of entries) {
			if (typeof v === "object") {
				let json = v ? JSON.stringify(r[k], null, 2).replace(/\s+/g, "").replace(/([,{:])/g, "$1 ").replace(/}/g, " }") : "[null]";
				json = json.replace(/"(count|family|person)"/g, "$1");
				_trace("{0} {1}: {2}", r.planId, k, json);
			}
		}
		for (let [k, v] of entries) {
			typeof v !== "object" && typeof v !== "string" && typeof v !== "number" && _trace("{0} {1}: {2}", r.planId, k, r[k]);
		}
		for (let [k, v] of entries) { typeof v === "number" && _trace("{0} {1}: {2}", r.planId, k, formatDollar(r[k], true, true)); }
		_trace("{0} <<======== calculateSinglePlan() returning ==========", r.planId);
	}

	// n.b. caller receives an unsealed object, to allow for attaching supplementary values.
	return r;
};

me.rankPlansByPriorities = function rankPlansByPriorities(config, planResults, planPriority) {
	///	<summary>
	/// Helper for calculateImpl() to rank the plan results according to various priorities.
	///	</summary>
	///	<param name="planResults" type="Object">MPCE engine results so far, including plan results but not yet any aggregate results.</param>
	///	<returns type="Object">An object with various arrays ranking the plans according to the various priorities.</returns>

	let rankings = {};

	// Determine ranking of plans by lowest employee premiums
	let plansByEmployeePremiums = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].totalAnnualPayrollContributions }))
		.sort((a, b) => (a.value - b.value));
	rankings.plansByEmployeePremiums = plansByEmployeePremiums;

	// Determine ranking of plans by lowest out-of-pocket costs
	let plansByOutOfPocketCosts = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].totalMedicalAndDrugCostsLessFundOffset + planResults[planId].voluntaryFundPaid }))
		.sort((a, b) => (a.value - b.value));
	rankings.plansByOutOfPocketCosts = plansByOutOfPocketCosts;

	// Determine ranking of plans by lowest employee total costs
	let plansByEmployeeTotalAnnualCosts = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].employeeTotalAnnualCosts }))
		.sort((a, b) => (a.value - b.value));
	rankings.plansByEmployeeTotalAnnualCosts = plansByEmployeeTotalAnnualCosts;

	// Determine ranking of plans by lowest employee worst-case costs
	let plansByWorstCaseEmployeeCosts = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].worstCaseEmployeeCosts }))
		.sort((a, b) => (a.value - b.value));
	rankings.plansByWorstCaseEmployeeCosts = plansByWorstCaseEmployeeCosts;

	// Determine ranking of plans by access to HSA then lowest employee total costs
	let plansByAccessToHSA = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].employeeTotalAnnualCosts, "type": planResults[planId].fsaePrimaryAccountType }))
		.sort((a, b) => {
			let result;
			if (a.type === "HSA" && b.type !== "HSA") {
				result = -1;
			} else if (a.type !== "HSA" && b.type === "HSA") {
				result = 1;
			} else {
				result = a.value - b.value;
			}
			return result;
		});
	rankings.plansByAccessToHSA = plansByAccessToHSA;

	// Determine ranking of plans by access to FSA then lowest employee total costs
	let plansByAccessToFSA = planResults.orderedPlanIds
		.map((planId) => ({ planId, "value": planResults[planId].employeeTotalAnnualCosts, "type": planResults[planId].fsaePrimaryAccountType }))
		.sort((a, b) => {
			let result;
			if (a.type === "FSA" && b.type !== "FSA") {
				result = -1;
			} else if (a.type !== "FSA" && b.type === "FSA") {
				result = 1;
			} else {
				result = a.value - b.value;
			}
			return result;
		});
	rankings.plansByAccessToFSA = plansByAccessToFSA;

	let plansByPlanPriority;
	switch (planPriority) {
		case "lowerPremiums":
			plansByPlanPriority = plansByEmployeePremiums;
			break;
		case "lowerOutOfPocketCosts":
			plansByPlanPriority = plansByOutOfPocketCosts;
			break;
		case "lowerWorstCaseCosts":
			plansByPlanPriority = plansByWorstCaseEmployeeCosts;
			break;
		case "HSA":
			plansByPlanPriority = plansByAccessToHSA;
			break;
		case "FSA":
			plansByPlanPriority = plansByAccessToFSA;
			break;
		case "lowerTotalCosts":
		default:
			plansByPlanPriority = plansByEmployeeTotalAnnualCosts;
			break;
	}
	rankings.plansByPlanPriority = plansByPlanPriority;
	return rankings;
};

me.calculateImpl = function calculateImpl(config, args) {
	///	<summary>
	///	Private (intended) implementation method for calculateWithArgs() which performs the actual calculations.
	///	</summary>
	///	<param name="config" type="Object">The MPCE configuration object.</param>
	///	<param name="args" type="Object">An object containing the required arguments: regionId, statusId, primary,
	///     spouse, childrenArray, fundRolloverAmounts, voluntaryFundContributionAmounts, planFundAdditionalMatchAmounts,
	//      applyFundsToCostOfCareOption, planPriority, voluntaryFundContributionLimits, planFundAdjustmentAmounts.
	//      See comments below in calculateImpl() for type and structure of each.</param>
	///	<returns type="Array">An ordered array of result objects, each of which contains the calculation results
	///     for a configured plan.  Each result object contains a planId to which it corresponds, as well as the
	///     various result values, which are currently numbers representing dollar amounts.  If formatting is
	///     required, it will need to be applied by user interface logic. While the array contains the results
	///     ordered in the required display order, the array object has also been augmented with properties,
	///     one for each plan id, mapping to the respective result object for that plan, to facilitate direct
	///     retrieval of a specific plan's results.
	/// </returns>
	// LATER: Update docs

	_trace("calculateImpl() called; args:\n{0}", JSON.stringify(args, null, 2));

	//	<param name="regionId" type="String">The region id to use for the calculation.</param>
	//	<param name="statusId" type="String">The employee status id to use for the calculation.</param>
	//	<param name="primary" type="Object">A required object mapping the primary's (employee's) service ids
	//     to counts.  Only services that have a non-zero count need be mentioned in the object.</param>
	//	<param name="spouse" type="Object">An optional object mapping the spouse's service ids to counts.
	//     Note that if null or undefined is passed, then the calculation assumes there is no spouse, and
	//     selects a coverage level accordingly.</param>
	//	<param name="childrenArray" type="Object">A required array of objects each representing a child.
	//     Each contained object should map child N's service ids to counts.</param>
	//	<param name="fundRolloverAmounts" type="Object">An optional object mapping plan names to prior year
	//     fund rollover amounts.  If null or undefined is passed, or if a particular plan isn't mentioned,
	//     then the calculation assumes no fund rollover amount for the corresponding plan(s).</param>
	//	<param name="voluntaryFundContributionAmounts" type="Object">An optional object mapping plan names to
	//     current year planned voluntary fund contribution amounts, for plans that permit savings contributions.
	//     If null or undefined is passed, or if a particular plan isn't mentioned, then the calculation assumes no
	//     fund contribution amount for the corresponding plan(s).</param>
	//	<param name="premiumAdjustmentAmounts" type="Object">An optional object mapping plan names to current year
	//     premium amount adjustments.  If null or undefined is passed, or if a particular plan isn't mentioned,
	//     then the calculation uses configured costs as-is.  If a particular plan has a numeric value specified
	//     in this object, then it is added (or subtracted, if negative) to configured employee premiums ONLY.
	//     If a particular plan has an object value specified, then values for both employee and employer premiums
	//     are retrieved from values within keyed as "employee" and "employer", or zero failing those.</param>
	//	<param name="planFundAdditionalMatchAmounts" type="Object">An optional object mapping plan names to
	//     plan fund additional match amounts. Such amounts, if necessary, would be determined outside the
	//     engine by custom logic if a particular plan allows a match on voluntary fund contributions.</param>
	//	<param name="applyFundsToCostOfCareOption" type="String">Specifies how to apply fund amounts to the cost
	// 		of care. Valid options are applyNoFunds, applyERCoreFundsOnly, applyERFundsOnly, applyEEFundsOnly,
	// 	    and applyAllFunds.</param>
	//	<param name="planPriority" type="String">One of "FSA", "HSA", "lowerOutOfPocketCosts", "lowerPremiums",
	//      "lowerTotalCosts", "lowerWorstCaseCosts".</param>
	//	<param name="voluntaryFundContributionLimits" type="Number">An optional object mapping plan names to
	//     current year voluntary fund contribution limit amounts, for plans that permit savings contributions.
	//     NOTE: This is only only added to results, for display purposes; this is not (yet) enforced at the
	//     MPCE engine level.</param>
	//	<param name="planFundAdjustmentAmounts" type="Object">An optional object mapping plan names to plan fund
	//     adjustment amounts. Plan fund adjustment amounts are distinct from matching money as they are not
	//     dependent on employee contributions, and so are considered employer core fund amounts and not matching
	//     fund amounts. Such amounts, if necessary, would be determined outside the engine by custom logic.</param>

	let regionId = args.regionId;
	let statusId = args.statusId;
	let primary = args.primary;
	let spouse = args.spouse;
	let childrenArray = args.childrenArray;
	let fundRolloverAmounts = args.fundRolloverAmounts;
	let voluntaryFundContributionAmounts = args.voluntaryFundContributionAmounts;
	let premiumAdjustmentAmounts = args.premiumAdjustmentAmounts;
	let planFundAdditionalMatchAmounts = args.planFundAdditionalMatchAmounts;
	let applyFundsToCostOfCareOption = args.applyFundsToCostOfCareOption;
	let planPriority = args.planPriority;
	let voluntaryFundContributionLimits = args.voluntaryFundContributionLimits;
	let planFundAdjustmentAmounts = args.planFundAdjustmentAmounts;
	let fsaeConfig = args.fsaeConfig; // LATER: Consolidate MPCE and FSAE engines into single engine w/single config file

	if (!config.hasPassedMpceValidation) {
		throw new Error("Config has not passed MPCE validation.");
	}

	let startDateTime = new Date();

	// Perform lazy initialization of additional configuration markup.
	me.maybeMarkupConfig(config);

	// Validation of required parameters.
	if (!(regionId in config.regions)) { throw new Error(`Unknown regionId ${regionId}`); }
	if (!(statusId in config.statuses)) { throw new Error(`Unknown statusId ${statusId}`); }
	if (isNullOrUndefined(primary)) { throw new Error("Parameter primary must not be null or undefined."); }
	if (!Array.isArray(childrenArray)) {
		throw new Error("The childrenArray parameter must be an array of objects. " +
			"Pass an empty array for no children.");
	}

	// Determine the appropriate coverage level based on the presence or absence of the
	// spouse and/or children input objects.
	let coverageLevelId = me.determineCoverageLevelId(config, spouse, childrenArray);

	let results = {
		orderedPlanIds: []
	};

	let peopleServices = [primary];
	if (!isNullOrUndefined(spouse)) { peopleServices.push(spouse); }
	peopleServices = peopleServices.concat(childrenArray);

	let region = config.regions[regionId];
	_trace("calculateImpl(): {0} plans: {1}", regionId, region.plans.join(", "));

	// For each plan in the region, calculate the results for that plan, and insert that plan's results object into the results array.
	region.plans.forEach((planId) => {

		let fundRolloverAmountForPlan = fundRolloverAmounts?.[planId] ?? 0;
		let voluntaryFundContributionAmountForPlan = voluntaryFundContributionAmounts?.[planId] ?? 0;
		let voluntaryFundContributionLimitForPlan = voluntaryFundContributionLimits?.[planId] ?? null;
		let premiumAdjustmentAmountOrObjectForPlan = premiumAdjustmentAmounts?.[planId] ?? 0;
		let planFundAdditionalMatchAmountForPlan = planFundAdditionalMatchAmounts?.[planId] ?? 0;
		let planFundAdjustmentAmountForPlan = planFundAdjustmentAmounts?.[planId] ?? 0;

		_trace("calculateImpl(): calling calculateSinglePlan() for {0}", planId);
		let singlePlanResult = me.calculateSinglePlan(config, fsaeConfig, planId, regionId, statusId, coverageLevelId, peopleServices,
			fundRolloverAmountForPlan, voluntaryFundContributionAmountForPlan, premiumAdjustmentAmountOrObjectForPlan,
			planFundAdditionalMatchAmountForPlan, applyFundsToCostOfCareOption, voluntaryFundContributionLimitForPlan,
			planFundAdjustmentAmountForPlan);

		results.orderedPlanIds.push(singlePlanResult.planId); // add plan id to the array, for ordered access
		results[planId] = singlePlanResult; // add directly as a property based on plan id, for direct querying
	});

	let aggregateResults = me.rankPlansByPriorities(config, results, planPriority);

	// Append results to indicate whether at least one plan in the region's set meets a condition. These results, all
	// booleans, could be used to drive content and/or show/hide sections based on the presence or absence of these
	// characteristics. e.g. if no plan allows employee contributions and none has employer contributions, savings
	// account results could be hidden.
	(function iife() {
		let highestTotalCosts = 0, highestEmployeeTotalAnnualCosts = 0, highestWorstCaseEmployeeCosts = 0, nextHighestWorstCaseEmployeeCosts = 0;
		let bitPlanWithEEPremiums = 0, bitPlanWithEEAdditionalServicePremiums = 0, bitPlanWithERPremiums = 0, bitPlanAllowingEECont = 0,
			bitPlanWithEECont = 0, bitPlanWithAppliedEECont = 0, bitPlanWithERBaseFundAmount = 0, bitPlanAllowingERMatch = 0,
			bitPlanWithERMatchAmount = 0, bitPlanWithAppliedERCont = 0, bitPlanWithEEGrossOutOfPocketCosts = 0, bitPlanWithEENetOutOfPocketCosts = 0,
			bitPlanWithFundsThatCouldHaveBeenApplied = 0, bitPlanWithERNonFundCosts = 0, bitPlanWithIncomingRollover = 0,
			bitPlanWithAppliedRollover = 0, bitPlanWithCarryoverBalance = 0, bitPlanWithAlternateChartStack = 0;

		results.orderedPlanIds.forEach((planId) => {
			let r = results[planId];
			if (r.totalCosts > highestTotalCosts) { highestTotalCosts = r.totalCosts; }
			if (r.employeeTotalAnnualCosts > highestEmployeeTotalAnnualCosts) { highestEmployeeTotalAnnualCosts = r.employeeTotalAnnualCosts; }
			// Highest and next highest worst case employee costs are needed to render meaningful output when
			// the worst case costs column is being included in the chart.
			if (r.worstCaseEmployeeCosts > highestWorstCaseEmployeeCosts) {
				if (isFinite(highestWorstCaseEmployeeCosts)) { nextHighestWorstCaseEmployeeCosts = highestWorstCaseEmployeeCosts; }
				highestWorstCaseEmployeeCosts = r.worstCaseEmployeeCosts;
			} else if (isFinite(r.worstCaseEmployeeCosts) && (r.worstCaseEmployeeCosts > nextHighestWorstCaseEmployeeCosts)) {
				nextHighestWorstCaseEmployeeCosts = r.worstCaseEmployeeCosts;
			}
			bitPlanWithEEPremiums |= (r.totalAnnualPayrollContributions > 0);
			bitPlanWithEEAdditionalServicePremiums |= (r.employeeAdditionalServicePremiums > 0);
			bitPlanWithERPremiums |= (r.employerPlanPremium > 0);
			bitPlanAllowingEECont |= (r.fundAllowsContributions);
			bitPlanWithEECont |= (r.voluntaryFundContributionAmount > 0);
			bitPlanWithAppliedEECont |= (r.voluntaryFundPaid > 0);
			bitPlanWithERBaseFundAmount |= (r.planFundAmount > 0);
			bitPlanAllowingERMatch |= (r.fundContributionsHaveMatch);
			bitPlanWithERMatchAmount |= (r.planFundAdditionalMatchAmount > 0);
			bitPlanWithAppliedERCont |= ((r.planFundPaid > 0) || (r.planFundAdditionalMatchPaid > 0));
			bitPlanWithEEGrossOutOfPocketCosts |= (r.totalMedicalAndDrugCosts > 0);
			bitPlanWithEENetOutOfPocketCosts |= (r.totalMedicalAndDrugCostsLessFundOffset > 0);
			bitPlanWithFundsThatCouldHaveBeenApplied |= (applyFundsToCostOfCareOption !== "applyAllFunds") &&
				(r.totalMedicalAndDrugCostsLessFundOffset > 0) && (r.fundCarryoverBalance > 0);
			bitPlanWithERNonFundCosts |= (r.totalEmployerOrPlanPaidExcludingFund > 0);
			bitPlanWithIncomingRollover |= (r.incomingFundRolloverAmount > 0);
			bitPlanWithAppliedRollover |= (r.rolloverFundPaid > 0);
			bitPlanWithCarryoverBalance |= (r.fundCarryoverBalance > 0);
			bitPlanWithAlternateChartStack |= r.alternateChartStack;
		});
		aggregateResults.highestTotalCosts = highestTotalCosts;
		aggregateResults.highestEmployeeTotalAnnualCosts = highestEmployeeTotalAnnualCosts;
		aggregateResults.highestWorstCaseEmployeeCosts = highestWorstCaseEmployeeCosts;
		aggregateResults.nextHighestWorstCaseEmployeeCosts = nextHighestWorstCaseEmployeeCosts;
		aggregateResults.hasPlanWithUnlimitedWorstCaseCosts = !isFinite(highestWorstCaseEmployeeCosts);
		aggregateResults.hasPlanWithEEPremiums = Boolean(bitPlanWithEEPremiums);
		aggregateResults.hasPlanWithEEAdditionalServicePremiums = Boolean(bitPlanWithEEAdditionalServicePremiums);
		aggregateResults.hasPlanWithERPremiums = Boolean(bitPlanWithERPremiums);
		aggregateResults.hasPlanAllowingEECont = Boolean(bitPlanAllowingEECont);
		aggregateResults.hasPlanWithEECont = Boolean(bitPlanWithEECont);
		aggregateResults.hasPlanAllowingOrWithEECont = Boolean(bitPlanAllowingEECont | bitPlanWithEECont);
		aggregateResults.hasPlanWithAppliedEECont = Boolean(bitPlanWithAppliedEECont);
		aggregateResults.hasPlanAllowingERMatch |= Boolean(bitPlanAllowingERMatch);
		aggregateResults.hasPlanWithERBaseFundAmount = Boolean(bitPlanWithERBaseFundAmount);
		aggregateResults.hasPlanWithERMatchAmount = Boolean(bitPlanWithERMatchAmount);
		aggregateResults.hasPlanWithERCont = Boolean(bitPlanWithERBaseFundAmount | bitPlanWithERMatchAmount);
		aggregateResults.hasPlanWithAppliedERCont = Boolean(bitPlanWithAppliedERCont);
		aggregateResults.hasPlanWithEEGrossOutOfPocketCosts = Boolean(bitPlanWithEEGrossOutOfPocketCosts);
		aggregateResults.hasPlanWithEENetOutOfPocketCosts = Boolean(bitPlanWithEENetOutOfPocketCosts);
		aggregateResults.hasPlanWithFundsThatCouldHaveBeenApplied = Boolean(bitPlanWithFundsThatCouldHaveBeenApplied);
		aggregateResults.hasPlanWithERNonFundCosts = Boolean(bitPlanWithERNonFundCosts);
		aggregateResults.hasPlanWithIncomingRollover = Boolean(bitPlanWithIncomingRollover);
		aggregateResults.hasPlanWithAppliedRollover = Boolean(bitPlanWithAppliedRollover);
		aggregateResults.hasPlanWithCarryoverBalance = Boolean(bitPlanWithCarryoverBalance);
		aggregateResults.hasPlanWithAlternateChartStack = Boolean(bitPlanWithAlternateChartStack);

		aggregateResults.hasPlanWithAppliedFunds = aggregateResults.hasPlanWithAppliedEECont ||
			aggregateResults.hasPlanWithAppliedERCont || aggregateResults.hasPlanWithAppliedRollover;
	}());

	for (let [k, v] of Object.entries(aggregateResults)) { _trace("Aggregate: {0}: {1}", k, Array.isArray(v) ? JSON.stringify(v) : v); }
	Object.assign(results, aggregateResults);

	let endDateTime = new Date();
	let elapsedMsec = endDateTime.getTime() - startDateTime.getTime();
	results.elapsedMsec = elapsedMsec;

	_trace("calculateImpl() returning; elapsed: {0} msec", elapsedMsec);
	return results;
};

me.calculateWithArgs = function calculateWithArgs(
	config, args, resultsVariantsToInclude) {
	///	<summary>
	///	New main function the app should call to perform calculations. calculateWithArgs() in turn calls calculateImpl(),
	/// potentially multiple times if resultsVariantsToInclude specifies a result variant to include in the results.
	///	</summary>
	///	<param name="config" type="Object">The MPCE configuration object.</param>
	///	<param name="args" type="Object">An object containing the required argument properties. The properties
	///     should have the same names as the arguments currently shown below in the calculateImpl() function docs.</param>
	///	<param name="resultsVariantsToInclude" type="Array">An optional array of strings, each representing a known
	///     result variant to include. At the moment, "noEmployeeFunding" is the only variant recognized.</param>
	///	<returns type="Array">See below in the calculateImpl() function docs.</returns>

	if (isNullOrUndefined(config) || Object.keys(config).length === 0) {
		throw new Error("config must not be null, undefined, or empty");
	}
	if (isNullOrUndefined(args) || Object.keys(args).length === 0) {
		throw new Error("args must not be null, undefined, or empty");
	}

	// Run the primary calculation that fills results.main
	let results = {};
	let mainArgs = Object.freeze(Object.assign({}, args));
	results.main = me.calculateImpl(config, mainArgs);

	// Potentially run alternate scenario calculation if caller requested.
	if (Array.isArray(resultsVariantsToInclude) && resultsVariantsToInclude.includes("noEmployeeFunding")) {
		let isTraceOn = _traceIsOn(), oldTraceFn = _trace;
		if (isTraceOn) {
			_trace("Disabling MPCE trace function before calculation of noEmployeeFunding result variant.");
			// eslint-disable-next-line no-empty-function
			_trace = function traceNoOp() {};
		}
		let noEmployeeFundingArgs = Object.assign({}, args);
		noEmployeeFundingArgs.fundRolloverAmounts = null;
		noEmployeeFundingArgs.voluntaryFundContributionAmounts = null;
		noEmployeeFundingArgs.planFundAdditionalMatchAmounts = null;
		noEmployeeFundingArgs.applyFundsToCostOfCareOption = "applyERCoreFundsOnly";
		Object.freeze(noEmployeeFundingArgs);
		let noEmployeeFundingResult = me.calculateImpl(config, noEmployeeFundingArgs);
		results.alternate_noEmployeeFunding = noEmployeeFundingResult;
		if (isTraceOn) {
			_trace = oldTraceFn;
			_trace("Finished calculation of noEmployeeFunding result variant. MPCE trace function re-enabled.");
		}
	}

	return results;
};

return me;
});
