//-------------------------------------------------------------------------------------------------
// mpceValidation.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the mpceValidation.checkAndProcessConfig() method (and supporting methods) used to
// validate an MPCE configuration object.  While this validation logic is kept separate from the
// actual MPCE engine, this and the engine ought to be maintained together when configuration
// schema changes.
//
// NOTE: While the checks performed are numerous and detailed, please do not assume that these
// checks are exhaustive or constitute a substitute for more detailed testing or review.
//

define(["utility", "trace", "ValidationBase", "corejs"],
(utility, trace, ValidationBase) => {
"use strict";

let _trace = trace.categoryWriteLineMaker("mpceValidation");

let strFmt = utility.stringFormat, isNullOrUndefined = utility.isNullOrUndefined;

const adjustmentAnswerPermittedIdFuncs = [
	// Helper functions for checkInAdjustmentAnswer().
	(config, id) => (id === "otherPlans") || (config.plans && (id in config.plans)),
	(config, id) => (id === "otherRegions") || (config.regions && (id in config.regions)),
	(config, id) => (id === "otherCoverageLevels") || (config.coverageLevels && (id in config.coverageLevels)),
	(config, id) => (id === "otherStatuses") || (config.statuses && (id in config.statuses))
];

class MpceValidation extends ValidationBase {

	constructor() {
		super();
		this.validChargeTypeSet = new Set(["deductible", "copay", "coinsurance"]);
		this.validCategoriesFundEligibilitySet = new Set(["noFunds", "allFunds", "nonRestrictedFunds"]);
		this.validDeductibleSet = new Set(["none", "beforeCopay", "afterCopay", "beforeCoinsurance"]);
	}

	checkRegions(config) {
		///	<summary>
		///	Checks the "regions" and "regionsOrder" properties, and related configuration, for consistency and
		/// expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length, regions = config.regions, regionsOrder = config.regionsOrder, plans = config.plans;
		if (!this.checkObjectAndOrderContentsMatch("regions", regions, "regionsOrder", regionsOrder)) { return false; }

		if (this.checkRequiredString(config.regionsDefaultId, "regionsDefaultId")) {
			if (!(config.regionsDefaultId in regions)) {
				this.addError('regionsDefaultId refers to unknown region id "{0}".', config.regionsDefaultId);
			}
		}

		regionsOrder.forEach((regionId) => {
			let region = regions[regionId];
			let desc1 = strFmt('regions["{0}"]', regionId);
			if (!this.checkRequiredObject(region, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(region.description, strFmt("{0}.description", desc1));

			if (this.checkRequiredArray(region.plans, strFmt("{0}.plans", desc1))) {
				region.plans.forEach((planId) => {
					if (plans && !(planId in plans)) {
						this.addError('{0}.plans refers to unknown plan id "{1}".', desc1, planId);
					}
				});
			}

			// Next, check optional and unknown properties.
			Object.keys(region).forEach((propName) => {
				switch (propName) {
					case "description":
					case "plans":
						// Required; checked above.
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkDeductiblesObject(config, obj, descBase) {
		///	<summary>
		///	Checks the "personDeductibles" and "familyDeductibles" objects that may be defined for a plan.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		/// <param name="obj" type="Object">The deductibles object to check.</param>
		/// <param name="descBase" type="String">The property base description, for error reporting.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length, hasGeneralGroup = false, categories = config.categories, categoriesMentioned = {},
			coverageLevels = config.coverageLevels, coverageLevelsOrder = config.coverageLevelsOrder, regions = config.regions,
			statuses = config.statuses;

		Object.entries(obj).forEach(([groupName, objForGroupName]) => {
			let desc1 = strFmt('{0}["{1}"]', descBase, groupName), isGeneralGroup = (groupName === "general"),
				hasAmount = false, hasAmountMap = false;
			hasGeneralGroup = isGeneralGroup || hasGeneralGroup;
			if (!this.checkRequiredObject(objForGroupName, desc1)) { return; }

			// First, check required properties.
			if (isGeneralGroup) {
				// Group "general" must not have a categories property.
				if (typeof objForGroupName.categories !== "undefined") {
					this.addError('{0} can\'t have a categories property; group id "general" catches all else.', desc1);
				}
			} else if (this.checkRequiredArray(objForGroupName.categories, strFmt("{0}.categories", desc1))) {
				// Every other group must have a categories property, containing a subset of valid category ids.
				if (categories) {
					objForGroupName.categories.forEach((categoryId) => {
						if (!(categoryId in categories)) {
							this.addError('{0}.categories refers to unknown category id "{1}".', desc1, categoryId);
						} else if (typeof categoriesMentioned[categoryId] !== "undefined") {
							this.addError('{0}.categories refers to category id "{1}" already used' +
								' by group id "{2}".', desc1, categoryId, categoriesMentioned[categoryId]);
						} else {
							categoriesMentioned[categoryId] = groupName;
						}
					});
				}
			}

			// Next, check optional and unknown properties.
			Object.entries(objForGroupName).forEach(([propName, propValue]) => {
				let desc2 = strFmt("{0}.{1}", desc1, propName);

				switch (propName) {
					case "categories":
						// Required (in most cases); checked above.
						break;

					case "amount":
						if (hasAmountMap) {
							this.addError("{0} can't have both amount and amountMap properties.", desc1);
						} else {
							this.checkRequiredNumber(propValue, desc2);
							hasAmount = true;
						}
						break;

					case "amountMap":
						if (hasAmount) {
							this.addError("{0} can't have both amount and amountMap properties.", desc1);
						} else {
							let amountMap = propValue;
							if (this.checkRequiredObject(amountMap, desc2)) {
								Object.keys(amountMap).forEach((amountMapId) => {
									if (amountMapId in coverageLevels) {
										// It's a coverage level id.  It ought to map to a number.
										let coverageLevelId = amountMapId;
										this.checkRequiredNumber(amountMap[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
									} else if ((amountMapId in regions) || (amountMapId in statuses)) {
										// It's a region id or a status id. It ought to map to an object with coverage level ids.
										this.checkObjectAndOrderContentsMatch(
											strFmt('{0}["{1}"]', desc2, amountMapId), amountMap[amountMapId],
											"coverageLevelsOrder", coverageLevelsOrder);
										Object.entries(amountMap[amountMapId]).forEach(([coverageLevelId, value]) => {
											this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
										});
									} else {
										this.addError('{0} contains an id "{1}" that is neither a ' +
											"coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
									}
								});
							}
							hasAmountMap = true;
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
			if (!(hasAmount || hasAmountMap)) {
				this.addError("{0} must contain either an amount or amountMap property.", desc1);
			}
		});

		if (!hasGeneralGroup) {
			this.addError('{0} must contain a group with id "general".', descBase);
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkOutOfPocketMaximumsObject(config, obj, descBase, categoriesNotYetMentioned) {
		///	<summary>
		///	Checks the "personOutOfPocketMaximums" and "familyOutOfPocketMaximums" objects that may be defined for a plan.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		/// <param name="obj" type="Object">The out-of-pocket maximums object to check.</param>
		/// <param name="descBase" type="String">The property base description, for error reporting.</param>
		/// <param name="categoriesNotYetMentioned" type="Set">A set of categories not yet mentioned in an out-of-pocket
		// maximums object for the plan, to be updated based on the contents of the current one. being checked.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length, categories = config.categories, coverageLevels = config.coverageLevels,
			coverageLevelsOrder = config.coverageLevelsOrder, regions = config.regions, statuses = config.statuses;

		Object.entries(obj).forEach(([groupName, objForGroupName]) => {
			let desc1 = strFmt('{0}["{1}"]', descBase, groupName);
			if (!this.checkRequiredObject(objForGroupName, desc1)) { return; }

			let hasAmount = false, hasAmountMap = false;

			// First, check required properties.
			if (this.checkRequiredArray(objForGroupName.categories, strFmt("{0}.categories", desc1))) {
				// Every out-of-pocket maximum object must have a categories property containing a non-empty subset of valid category ids.
				if (objForGroupName.categories.length === 0) {
					this.addError("{0}.categories must contain at least one category.", desc1);
				}
				if (categories) {
					objForGroupName.categories.forEach((categoryId) => {
						if (!(categoryId in categories)) {
							this.addError('{0}.categories refers to unknown category id "{1}".', desc1, categoryId);
						} else {
							categoriesNotYetMentioned.delete(categoryId);
						}
					});
				}
			}

			// Next, check optional and unknown properties.
			Object.entries(objForGroupName).forEach(([propName, propValue]) => {
				let desc2 = strFmt("{0}.{1}", desc1, propName);

				switch (propName) {
					case "categories":
						// Required; checked above.
						break;

					case "chargeTypes":
						if (this.checkOptionalArray(propValue, desc2)) {
							if (propValue.length > 0) {
								propValue.forEach((chargeType, i) => {
									this.checkRequiredStringInSet(chargeType, strFmt("{0}[{1}]", desc2, i), this.validChargeTypeSet);
								});
							} else {
								this.addError("{0} must have at least one entry.", desc2);
							}
						}
						break;

					case "amount":
						if (hasAmountMap) {
							this.addError("{0} can't have both amount and amountMap properties.", desc1);
						} else {
							this.checkRequiredNumber(propValue, desc2);
							hasAmount = true;
						}
						break;

					case "amountMap":
						if (hasAmount) {
							this.addError("{0} can't have both amount and amountMap properties.", desc1);
						} else {
							let amountMap = propValue;
							if (this.checkRequiredObject(amountMap, desc2)) {
								Object.keys(amountMap).forEach((amountMapId) => {
									if (amountMapId in coverageLevels) {
										// It's a coverage level id.  It ought to map to a number.
										let coverageLevelId = amountMapId;
										this.checkRequiredNumber(amountMap[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
									} else if ((amountMapId in regions) || (amountMapId in statuses)) {
										// It's a region id or a status id. It ought to map to an object with coverage level ids.
										this.checkObjectAndOrderContentsMatch(
											strFmt('{0}["{1}"]', desc2, amountMapId), amountMap[amountMapId],
											"coverageLevelsOrder", coverageLevelsOrder);
										Object.entries(amountMap[amountMapId]).forEach(([coverageLevelId, value]) => {
											this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
										});
									} else {
										this.addError('{0} contains an id "{1}" that is neither a ' +
											"coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
									}
								});
							}
							hasAmountMap = true;
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
			if (!(hasAmount || hasAmountMap)) {
				this.addError("{0} must contain either an amount or amountMap property.", desc1);
			}
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkPlans(config) {
		///	<summary>
		///	Checks the "plans" and "plansOrder" properties, and related configuration, for consistency and expected
		/// structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let plans = config.plans, plansOrder = config.plansOrder;
		if (!this.checkObjectAndOrderContentsMatch("plans", plans, "plansOrder", plansOrder)) { return false; }

		let initialErrorCount = this.errors.length, hasCostsObjectId, costsObjectId, costsObjectIds = {},
			requiringCategoriesFundEligibility, hasCategoriesFundEligibility, categories = config.categories,
			coverageLevelsOrder = config.coverageLevelsOrder, coverageLevels = config.coverageLevels, regions = config.regions,
			statuses = config.statuses, services = config.services;

		plansOrder.forEach((planId) => {
			let plan = plans[planId];
			let desc1 = strFmt('plans["{0}"]', planId);
			hasCostsObjectId = false; // until we discover otherwise
			requiringCategoriesFundEligibility = [];
			hasCategoriesFundEligibility = false;
			if (!this.checkRequiredObject(plan, desc1)) { return; }

			let categoriesNotMentionedInOopMaxObjects = new Set(config.categoriesOrder ? config.categoriesOrder.slice(0) : []);

			// First, check required properties.
			this.checkRequiredString(plan.description, strFmt("{0}.description", desc1));

			// Next, check optional and unknown properties.
			Object.entries(plan).forEach(([propName, propValue]) => {
				let desc2 = strFmt("{0}.{1}", desc1, propName);

				switch (propName) {
					case "description":
						// Required; checked above.
						break;

					case "descriptionChart":
					case "descriptionTable":
					case "descriptionSelect":
					case "descriptionPlanProvisions":
						// Alternate plan descriptions that, if present, will be used for the chart column
						// label, column table headers, and select (dropdown) control, respectively. Often,
						// a different and/or shorter version is required for these instances, or a special
						// character is added to indicate a footnote, etc.
						this.checkOptionalString(propValue, desc2);
						break;

					case "deductiblesDescription":
					case "outOfPocketMaximumsDescription":
					case "fundAmountsDescription":
					case "fundMatchDescription":
						// Optional descriptions for the deductibles, out-of-pocket maximums, fund amount map, and
						// fund match, which would be used in the plan provisions table instead of any automatically
						// generated descriptions.
						this.checkOptionalString(propValue, desc2);
						break;

					case "fsaeAccountTypeId":
						// Used by the new HTML5 tool UI to determine which tax calculator to display
						// for this plan. If present, this would be one of e.g. "LPFSA", "HSA", "FSA", etc.
						// from the FSAE configuration, but we presently don't validate cross-config, so
						// the only thing we do here is make sure it is a string.
						this.checkOptionalString(propValue, desc2);
						// LATER: Cross-validate that the referenced accountTypeId exists in fsaeConfig.js
						break;

					case "personDeductibles":
					case "familyDeductibles":
						if (this.checkOptionalObject(propValue, desc2)) {
							this.checkDeductiblesObject(config, propValue, desc2);
						}
						break;

					case "personOutOfPocketMaximums":
					case "familyOutOfPocketMaximums":
						if (this.checkOptionalObject(propValue, desc2)) {
							this.checkOutOfPocketMaximumsObject(config, propValue, desc2, categoriesNotMentionedInOopMaxObjects);
						}
						break;

					case "fundAmountMap":
					case "restrictedFundAmountMap":
						requiringCategoriesFundEligibility.push(propName);
						if (this.checkRequiredObject(propValue, desc2)) {
							Object.keys(propValue).forEach((amountMapId) => {
								if (amountMapId in coverageLevels) {
									// It's a coverage level id.  It ought to map to a number.
									let coverageLevelId = amountMapId;
									this.checkRequiredNumber(propValue[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
								} else if ((amountMapId in regions) || (amountMapId in statuses)) {
									// It's a region id or status id.  Then it ought to map to an object with
									// coverage level ids.
									this.checkObjectAndOrderContentsMatch(strFmt('{0}["{1}"]', desc2, amountMapId),
										propValue[amountMapId], "coverageLevelsOrder", coverageLevelsOrder);
									Object.entries(propValue[amountMapId]).forEach(([coverageLevelId, value]) => {
										this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
									});
								} else {
									this.addError('{0} contains an id "{1}" that is neither a ' +
										"coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
								}
							});
						}
						break;

					case "categoriesFundEligibility":
						hasCategoriesFundEligibility = true;
						if (this.checkOptionalObject(propValue, desc2) && propValue) {
							Object.entries(propValue).forEach(([categoryId, value]) => {
								if (categories && !(categoryId in categories)) {
									this.addError('{0} refers to unknown category id "{1}".', desc2, categoryId);
								} else {
									this.checkRequiredStringInSet(value,
										strFmt('{0}["{1}"]', desc2, categoryId), this.validCategoriesFundEligibilitySet);
								}
							});
						}
						break;

					case "excludeFromTable":
						this.checkOptionalBoolean(propValue, desc2);
						break;

					case "fundAllowsContributions":
					case "fundContributionsHaveMatch":
						this.checkOptionalBoolean(propValue, desc2);
						requiringCategoriesFundEligibility.push(propName);
						break;

					case "alternateChartStack":
					case "noTaxCalculator":
						this.checkOptionalBoolean(propValue, desc2);
						break;

					case "costsObjectId":
						if (this.checkOptionalString(propValue, desc2)) {
							if ((propValue !== "costs") && !((/^costs_/).test(propValue))) {
								this.addError('{0} must be "costs" or start with "costs_".', desc2);
							} else {
								hasCostsObjectId = true;
								costsObjectId = propValue;
							}
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});

			// Add the plan's costs object id, if any, or "costs", to the set of costs object ids to check for later.
			costsObjectIds[hasCostsObjectId ? costsObjectId : "costs"] = true;

			if (requiringCategoriesFundEligibility.length > 0 && !hasCategoriesFundEligibility) {
				this.addError("{0} has properties configured ({1}) that also require categoriesFundEligibility.",
					desc1, requiringCategoriesFundEligibility.join(", "));
			}

			if (categoriesNotMentionedInOopMaxObjects.size > 0) {
				this.addError("{0} must mention {1} {2} in at least one out-of-pocket maximum object's categories.",
					desc1, categoriesNotMentionedInOopMaxObjects.size > 1 ? "categories" : "category",
					categoriesNotMentionedInOopMaxObjects.map((v) => `"${v}"`).join(", "));
			}
		});

		// Check that each service mentions each of the costs object ids defined by all plans, or has a defaultCost.
		if (services) {
			let servicesKeys = Object.keys(services);
			Object.keys(costsObjectIds).forEach((costsObjId) => {
				servicesKeys.forEach((serviceId) => {
					let service = services[serviceId];
					let desc1 = strFmt('services["{0}"]', serviceId);
					if (typeof service === "object" && !(costsObjId in service) && !("defaultCost" in service)) {
						if (costsObjId !== "costs") {
							this.addError('{0} is missing a costs object with id "{1}".', desc1, costsObjId);
						} else {
							this.addError("{0}.defaultCost or {0}.costs is required.", desc1, costsObjId);
						}
					}
				});
			});
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkStatuses(config) {
		///	<summary>
		///	Checks the "statuses" and "statusesOrder" properties, and related configuration, for consistency and
		/// expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length, statuses = config.statuses, statusesOrder = config.statusesOrder;
		if (!this.checkObjectAndOrderContentsMatch("statuses", statuses, "statusesOrder", statusesOrder)) { return false; }

		if (this.checkRequiredString(config.statusesDefaultId, "statusesDefaultId")) {
			if (!(config.statusesDefaultId in statuses)) {
				this.addError('statusesDefaultId refers to unknown status id "{0}".', config.statusesDefaultId);
			}
		}

		statusesOrder.forEach((statusId) => {
			let status = statuses[statusId];
			let desc1 = strFmt('statuses["{0}"]', statusId);
			if (!this.checkRequiredObject(status, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(status.description, strFmt("{0}.description", desc1));

			// Next, check optional and unknown properties.
			Object.keys(status).forEach((propName) => {
				if (propName !== "description") { // only known property, already dealt with above
					if (!propName.startsWith("__engine_")) {
						this.addError('{0} contains unknown property "{1}".', desc1, propName);
					}
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkCoverageLevels(config) {
		///	<summary>
		///	Checks the "coverageLevels" and "coverageLevelsOrder" properties, and related configuration, for
		/// consistency and expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let coverageLevels = config.coverageLevels, coverageLevelsOrder = config.coverageLevelsOrder;
		if (!this.checkObjectAndOrderContentsMatch("coverageLevels", coverageLevels, "coverageLevelsOrder", coverageLevelsOrder)) {
			return false;
		}

		let initialErrorCount = this.errors.length;

		coverageLevelsOrder.forEach((coverageLevelId) => {
			let coverageLevel = coverageLevels[coverageLevelId];
			let desc1 = strFmt('coverageLevels["{0}"]', coverageLevelId);
			if (!this.checkRequiredObject(coverageLevel, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(coverageLevel.description, strFmt("{0}.description", desc1));
			this.checkRequiredBoolean(coverageLevel.spouse, strFmt("{0}.spouse", desc1));
			this.checkRequiredNumber(coverageLevel.maxNumChildren, strFmt("{0}.maxNumChildren", desc1));

			// Next, check optional and unknown properties.
			Object.keys(coverageLevel).forEach((propName) => {
				switch (propName) {
					case "description":
					case "spouse":
					case "maxNumChildren":
						// Required; checked above.
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkMapsStatusIdsToAmountsOrNulls(config, obj, descBase) {
		///	<summary>
		///	Helper for checkAndProcessCoverageLevelCostsPerPlan() to verify innermost object maps status ids to numbers or nulls.
		///	</summary>
		/// <param name="obj" type="Object">The service plan coverage object to check.</param>
		/// <param name="descBase" type="String">The property base description, for error reporting.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let statusesOrder = config.statusesOrder;
		if (!this.checkObjectAndOrderContentsMatch(descBase, obj, "statusesOrder", statusesOrder)) { return false; }

		let initialErrorCount = this.errors.length;

		statusesOrder.forEach((statusId) => {
			let value = obj[statusId];
			if (typeof value === "string") {
				// A shortcut, but only if it refers to another valid status id at the same level.
				if (value === statusId) {
					this.addError('{0}["{1}"] cannot reference itself as a shortcut.', descBase, statusId);
				} else if (value in obj) {
					let otherPropValue = obj[value];
					if (typeof otherPropValue === "number" || otherPropValue === null) {
						obj[statusId] = otherPropValue;
					} else if (typeof otherPropValue === "string") {
						this.addError('{0}["{1}"] referenced by "{2}" at same level must be a number or null if n/a; ' +
							"cannot be another shortcut, since it appears later in statusesOrder.", descBase, value, statusId);
						// NOTE: Shortcuts that refer to an earlier statusId that was also a shortcut are currently passed
						// through by this logic. However, referring to a later statusId that is also a shortcut won't resolve,
						// given the order in which the shortcuts are processed.
					} else {
						this.addError('{0}["{1}"] referenced by "{2}" at same level must be a number or null if n/a',
							descBase, value, statusId);
					}
				} else {
					this.addError('{0}["{1}"] maps to string "{2}" which is not a valid shortcut to a same-level id.',
						descBase, statusId, value);
				}
			} else if (typeof value !== "number" && value !== null) {
				this.addError('{0}["{1}"] must be a number, another statusId, or null if n/a.', descBase, statusId);
			}
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkAndProcessCoverageLevelCostsPerPlan(config, costsConfigPropName) {
		///	<summary>
		///	Checks the "coverageLevelsCostPerPlan" property, and related configuration, for consistency and
		/// expected structure. Performs additional replacement of "shortcuts" that may be present, e.g. say,
		/// the mapping of "employeeAndChild" premiums to the same set as "employeeAndChildren".
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		/// <param name="costsConfigPropName" type="String">Property name for the costs config object to check.
		///   Used for checking employerCoverageLevelCostsPerPlan with same logic as coverageLevelCostsPerPlan.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let plansOrder = config.plansOrder, costsObj = config[costsConfigPropName];
		if (!this.checkObjectAndOrderContentsMatch(costsConfigPropName, costsObj, "plansOrder", plansOrder)) { return false; }

		let initialErrorCount = this.errors.length, regions = config.regions, coverageLevels = config.coverageLevels,
			coverageLevelsOrder = config.coverageLevelsOrder;

		plansOrder.forEach((planId) => {
			let desc1 = strFmt('{0}["{1}"]', costsConfigPropName, planId);
			let propValue1 = costsObj[planId];
			if (!this.checkRequiredType(propValue1, desc1, ["object", "string"])) { return; }

			if (typeof propValue1 === "string") {
				// Shortcut substitution. Replace string value with reference to other property's object value.
				let otherPropValue = costsObj[propValue1];
				if (this.checkRequiredObject(otherPropValue, strFmt(
						'{0}["{1}"] referenced by shortcut', costsConfigPropName, propValue1))) {
					costsObj[planId] = otherPropValue;
				}
				return;
			}
			Object.entries(propValue1).forEach(([coverageLevelOrRegionId, propValue2]) => {
				let desc2 = strFmt('{0}["{1}"]', desc1, coverageLevelOrRegionId);
				if (!this.checkRequiredType(propValue2, desc2, ["object", "string"])) { return; }

				if (typeof propValue2 === "string") {
					// Shortcut substitution. Replace string value with reference to other property's object value.
					let otherPropValue = propValue1[propValue2];
					if (this.checkRequiredObject(otherPropValue, strFmt(
							'{0}["{1}"]["{2}"] referenced by shortcut', costsConfigPropName, planId, propValue2))) {
						propValue1[coverageLevelOrRegionId] = otherPropValue;
					}
					return;
				}
				// The next level could be either a coverageLevelId, or a regionId.
				if (regions && (coverageLevelOrRegionId in regions)) {
					// It's a region id, and the next level should be coverage level ids.
					this.checkObjectAndOrderContentsMatch(desc2, propValue2, "coverageLevelsOrder", coverageLevelsOrder);
					Object.entries(propValue2).forEach(([coverageLevelId, propValue3]) => {
						if (typeof propValue3 === "string") {
							// Shortcut substitution. Replace string value with reference to other property's object value.
							let otherPropValue = propValue2[propValue3];
							if (this.checkRequiredObject(otherPropValue, strFmt(
									'{0}["{1}"] referenced by shortcut', desc2, coverageLevelId))) {
								propValue2[coverageLevelId] = otherPropValue;
							}
							return;
						}

						let desc3 = strFmt('{0}["{1}"]', desc2, coverageLevelId);
						this.checkMapsStatusIdsToAmountsOrNulls(config, propValue2[coverageLevelId], desc3);
					});
				} else {
					// Not a region id; should therefore be a coverage level id.
					if (coverageLevels && !(coverageLevelOrRegionId in coverageLevels)) {
						this.addError('{0}["{1}"] contains id "{2}" not found in regions or coverageLevels.',
							costsConfigPropName, planId, coverageLevelOrRegionId);
						return;
					}
					if (typeof propValue2 === "string") {
						// Shortcut substitution. Replace string value with reference to other property's object value.
						let otherPropValue = propValue1[propValue2];
						if (this.checkRequiredObject(otherPropValue, strFmt(
								'{0}["{1}"]["{2}"] referenced by shortcut', costsConfigPropName, planId, propValue2))) {
							propValue1[coverageLevelOrRegionId] = otherPropValue;
						}
						return;
					}
					desc2 = strFmt('{0}["{1}"]', desc1, coverageLevelOrRegionId);
					this.checkMapsStatusIdsToAmountsOrNulls(config, propValue2, desc2);
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	static permittedIdForLevel(config, permittedIdFuncs, id) {
		// Helper for checkInAdjustmentAnswer().
		let levelWherePermitted = 0, permitted = false;
		permittedIdFuncs.some((permittedIdFunc) => {
			permitted = permittedIdFunc(config, id);
			levelWherePermitted += 1;
			return permitted;
		});
		levelWherePermitted = permitted ? levelWherePermitted : 0;
		return levelWherePermitted;
	}

	checkInAdjustmentAnswer(config, obj, objPropName, permittedIdFuncs) {
		// Helper for checkSingleAdjustmentObject(). This is a recursive function.
		Object.entries(obj).forEach(([id, value]) => {
			let permittedIdLevel = MpceValidation.permittedIdForLevel(config, permittedIdFuncs, id);
			if (permittedIdLevel > 0) {
				let desc = strFmt('{0}["{1}"]', objPropName, id);
				if (this.checkRequiredType(value, desc, ["object", "string", "number"])) {
					if (typeof value === "object") {
						// recurse one level deeper
						this.checkInAdjustmentAnswer(config, value, desc, permittedIdFuncs.slice(permittedIdLevel));
					}
					if (typeof value === "string") {
						if ((value in obj) && id !== value) {
							// Copy over the value referred to by the shortcut string
							obj[id] = obj[value];
						} else {
							this.addError('"{0}" maps to string "{1}" which is not a valid shortcut to a same-level id in {2}',
								id, value, objPropName);
						}
					} // else it is a number, which is fine
				}
			} else {
				this.addError('"{0}" is not a valid next inner level id in {1}.', id, objPropName);
			}
		});
	}

	checkSingleAdjustmentObject(config, adjustmentId) {
		// Helper for checkAdjustmentObjects() to check a single adjustment object.
		if (!(adjustmentId in config.adjustments)) {
			this.addError('adjustmentsOrder refers to object "{0}" not found in adjustments.', adjustmentId);
			return false;
		}

		let initialErrorCount = this.errors.length, descBase = strFmt('adjustments["{0}"]', adjustmentId);
		let adjustment = config.adjustments[adjustmentId], plans = config.plans;

		if (this.checkRequiredObject(adjustment, descBase)) {

			// First, check required properties.
			this.checkRequiredString(adjustment.label, strFmt("{0}.label", descBase));

			// Next, check optional and unknown properties.
			Object.entries(adjustment).forEach(([propName, propValue]) => {
				let desc1 = strFmt("{0}.{1}", descBase, propName);

				switch (propName) {
					case "label":
						// Required; checked above.
						break;

					case "description":
						this.checkOptionalString(propValue, desc1);
						break;

					case "descriptionsByPlan":
						if (this.checkOptionalObject(propValue, desc1)) {
							Object.entries(propValue).forEach(([planId, value]) => {
								if (plans && !(planId in plans)) {
									this.addError('{0} refers to unknown plan id "{1}".', desc1, planId);
								}
								this.checkRequiredString(value, strFmt('{0}["{1}"]', desc1, planId));
							});
						}
						break;

					case "answersToAmount":
						if (this.checkRequiredObject(propValue, desc1)) {
							// At the top level, an adjustment answersToAmount object has answers, e.g. "wellnessNone", "wellnessEmployee",
							// but then beyond that, the structure may or may not contain levels for planId, regionId, coverageLevelId, statusId
							// until ultimately leading to a number. A helper checkInAdjustmentAnswer() uses recursion to validate the
							// complete hierarchy of ids.
							Object.entries(propValue).forEach(([adjustmentAnswer, value]) => {
								let desc2 = strFmt('{0}["{1}"]', desc1, adjustmentAnswer);
								if (this.checkRequiredType(value, desc2, ["object", "string", "number"])) {
									if (typeof value === "object") {
										this.checkInAdjustmentAnswer(config, propValue[adjustmentAnswer], desc2, adjustmentAnswerPermittedIdFuncs);
									} else if (typeof value === "string") {
										if ((value in propValue) && adjustmentAnswer !== value) {
											// Copy over the value referred to by the shortcut string
											propValue[adjustmentAnswer] = propValue[value];
										} else {
											this.addError('"{0}" maps to string "{1}" which is not a valid shortcut to a same-level id in {2}.',
												desc2, adjustmentAnswer, value, desc2);
										}
									} // else it is a number, which is fine
								}
							});
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', descBase, propName);
						}
						break;
				}
			});
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkAdjustments(config) {
		///	<summary>
		///	Checks the custom-named adjustment amount objects for consistency and expected structure. Performs
		/// additional replacement of "shortcuts" that may be present, e.g. say, the mapping of "employeeAndChild"
		/// adjustment amounts to the same set as "employeeAndChildren".
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length;

		// Prior to engine v1.0.51, adjustment answers and amounts were defined as top-level objects in the MPCE configuration.
		// Starting with engine v1.0.51, these have been moved into a config.adjustments object. The old style adjustment objects
		// are no longer supported, and so we check for these as this may arise during upgrading of a client implementation.
		if ("adjustmentObjectKeys" in config) {
			this.addError("config.adjustmentObjectKeys with top-level adjustment objects no longer supported. " +
				"Use config.adjustments and config.adjustmentsOrder instead.");
		}

		let adjustments = config.adjustments, adjustmentsOrder = config.adjustmentsOrder;
		if (!this.checkObjectAndOrderContentsMatch("adjustments", adjustments, "adjustmentsOrder", adjustmentsOrder)) { return false; }

		if (this.checkRequiredArray(adjustmentsOrder, "adjustmentsOrder")) {
			adjustmentsOrder.forEach((adjustmentId, index) => {
				let desc = strFmt("adjustmentsOrder[{0}]", index);
				if (this.checkRequiredString(adjustmentId, desc)) {
					this.checkSingleAdjustmentObject(config, adjustmentId);
				}
			});
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkServicePlanCoverageObject(config, obj, descBase) {
		///	<summary>
		///	Helper for checkServices().  Checks a plan coverage object defined within a service.
		///	</summary>
		/// <param name="obj" type="Object">The service plan coverage object to check.</param>
		/// <param name="descBase" type="String">The property base description, for error reporting.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let initialErrorCount = this.errors.length, hasAtLeastOneProperty, hasCopay, hasCoveredCount, hasDollarLimit;

		if (this.checkRequiredObject(obj, descBase)) {
			hasAtLeastOneProperty = false;
			hasCopay = false;
			hasCoveredCount = false;
			hasDollarLimit = false;
			Object.entries(obj).forEach(([propName, propValue]) => {
				hasAtLeastOneProperty = true;
				let desc1 = strFmt("{0}.{1}", descBase, propName);

				switch (propName) {
					case "description":
						this.checkOptionalString(propValue, desc1);
						break;

					case "coinsurance":
						this.checkOptionalNumberPortion(propValue, desc1);
						break;

					case "coinsuranceMinDollar":
					case "coinsuranceMaxDollar":
					case "additionalPremium":
					case "copay":
						this.checkOptionalNonNegativeNumber(propValue, desc1);
						if (propName === "copay") {
							hasCopay = true;
						}
						break;

					case "notCovered":
					case "copayNotTowardsOOPMax":
					case "copayDoesNotReduceCost":
					case "coinsuranceNotTowardsOOPMax":
						if (this.checkOptionalBoolean(propValue, desc1)) {
							if (!propValue) {
								this.addError("{0} must be true if specified; leave it out if false.", desc1);
							}
						}
						break;

					case "coveredCount":
						this.checkOptionalWholeNonNegativeNumber(propValue, desc1);
						hasCoveredCount = true;
						break;

					case "dollarLimit":
						this.checkOptionalWholeNonNegativeNumber(propValue, desc1);
						hasDollarLimit = true;
						break;

					case "deductible":
						this.checkOptionalStringInSet(propValue, desc1, this.validDeductibleSet);
						break;

					case "singleUseCostMax":
						this.checkOptionalNonNegativeNumber(propValue, desc1);
						break;

					case "combinedLimitId":
						if (this.checkOptionalString(propValue, desc1)) {
							if (!(propValue in config.combinedLimits)) {
								this.addError('{0} refers to unknown combined limit id "{1}".', desc1, propValue);
							}
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', descBase, propName);
						}
						break;
				}
			});
			if (!hasAtLeastOneProperty) {
				this.addError('{0} must have properties; minimum is "notCovered: true".', descBase);
			}
			if (hasCopay && hasDollarLimit) {
				this.addError('{0} specifies "copay" and "dollarLimit"; dollar limits are only supported with coinsurance.', descBase);
			}
			if (hasCoveredCount && hasDollarLimit) {
				this.addError('{0} specifies both "coveredCount" and "dollarLimit"; only one or the other may be specified.', descBase);
			}
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkServices(config) {
		///	<summary>
		///	Checks the "services" property, and related configuration, for consistency and expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let services = config.services;
		if (!this.checkRequiredObject(services, "services")) { return false; }

		let initialErrorCount = this.errors.length, regions = config.regions;

		Object.entries(services).forEach(([serviceId, service]) => {
			let desc1 = strFmt('services["{0}"]', serviceId);
			if (!this.checkRequiredObject(service, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(service.description, strFmt("{0}.description", desc1));

			let desc2 = strFmt("{0}.coverage", desc1);
			if (this.checkRequiredObject(service.coverage, desc2)) {
				if (this.checkObjectAndOrderContentsMatch(desc2, service.coverage, "plansOrder", config.plansOrder)) {
					Object.entries(service.coverage).forEach(([planId, servicePlanCoverage]) => {
						let desc3 = strFmt('{0}["{1}"]', desc2, planId);
						if (Array.isArray(servicePlanCoverage)) {
							if (servicePlanCoverage.length > 0) {
								servicePlanCoverage.forEach((obj, i) => {
									this.checkServicePlanCoverageObject(config, obj, strFmt("{0}[{1}]", desc3, i));
								});
							} else {
								this.addError("{0} must have at least one entry.", desc3);
							}
						} else {
							this.checkServicePlanCoverageObject(config, servicePlanCoverage, desc3);
						}
					});
				}
			}

			// Next, check optional and unknown properties.
			Object.entries(service).forEach(([propName, propValue]) => {
				let desc3 = strFmt("{0}.{1}", desc1, propName);

				switch (propName) {
					case "description":
					case "coverage":
						// Required; checked above.
						break;

					case "descriptionForCosts":
					case "descriptionForUsage":
					case "descriptionPlanProvisions":
					case "footnoteIndicator":
					case "footnoteText":
						this.checkOptionalString(propValue, desc3);
						break;

					case "defaultCost":
						this.checkOptionalNonNegativeNumber(propValue, desc3);
						break;

					case "costs":
					case "costsForDisplay":
						// Note: Though not likely, technically "costs" is optional, but only if all plans define
						// their own costsObjectIds.  So that's why "costs" isn't required, if you were wondering.
						// Refer to checkPlans(); it checks that each service has matching costs object ids.
						if (this.checkOptionalObject(propValue, desc3)) {
							Object.keys(service[propName]).forEach((regionId) => {
								let desc4 = strFmt('{0}["{1}"]', desc3, regionId);
								this.checkRequiredType(propValue[regionId], desc4, (propName === "costs") ? "number" : "string");
								if (regions && !(regionId in regions)) {
									this.addError('{0} refers to unknown region id "{1}".', desc3, regionId);
								}
							});
						}
						break;

					case "userInputServiceCountMax":
					case "userInputServiceCountIncrement":
						this.checkOptionalWholeNonNegativeNumber(propValue, desc3);
						break;

					default:
						// Check for special case of a custom costs_NNN object.
						if ((/^costs_/).test(propName)) {
							if (this.checkOptionalObject(propValue, desc3)) {
								Object.keys(service[propName]).forEach((regionId) => {
									this.checkRequiredNumber(propValue[regionId], strFmt('{0}["{1}"]', desc3, regionId));
									if (regions && !(regionId in regions)) {
										this.addError('{0} refers to unknown region id "{1}".', desc3, regionId);
									}
								});
							}
							return;
						}
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkCombinedLimits(config) {
		///	<summary>
		///	Checks the "combinedLimits" property, and related configuration, for consistency and expected structure.
		///	</summary>
		///	<param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let combinedLimits = config.combinedLimits;
		if (!this.checkOptionalObject(combinedLimits, "combinedLimits")) { return false; }
		if (isNullOrUndefined(combinedLimits)) { return true; }

		let initialErrorCount = this.errors.length;

		Object.entries(combinedLimits).forEach(([combinedLimitId, combinedLimit]) => {
			if (!this.checkRequiredObject(combinedLimit, strFmt('combinedLimits["{0}"]', combinedLimitId))) { return; }

			// First, check required properties.
			this.checkRequiredString(combinedLimit.description, strFmt('combinedLimits["{0}"].description', combinedLimitId));

			// Next, check optional and unknown properties.
			Object.entries(combinedLimit).forEach(([propName, propValue]) => {
				let desc1 = strFmt('combinedLimits["{0}"].{1}', combinedLimitId, propName);

				switch (propName) {
					case "description":
						// Required; checked above.
						break;

					case "personReimburseLimit":
					case "familyReimburseLimit":
						this.checkOptionalNonNegativeNumber(propValue, desc1);
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('combinedLimits["{0}"] contains unknown property "{1}".', combinedLimitId, propName);
						}
						break;
				}
			});
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkCategories(config) {
		///	<summary>
		///	Checks the "categories" and "categoriesOrder" properties, and related configuration, for consistency
		/// and expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let categories = config.categories, categoriesOrder = config.categoriesOrder;
		if (!this.checkObjectAndOrderContentsMatch("categories", categories, "categoriesOrder", categoriesOrder)) { return false; }

		let initialErrorCount = this.errors.length;

		let allCategoryContents = [];
		categoriesOrder.forEach((categoryId) => {
			let category = categories[categoryId];
			if (!this.checkRequiredObject(category, strFmt('categories["{0}"]', categoryId))) { return; }

			// First, check required properties.
			this.checkRequiredString(category.description, strFmt('categories["{0}"].description', categoryId));

			if (this.checkRequiredArray(category.orderedContents, strFmt('categories["{0}"].orderedContents', categoryId))) {
				allCategoryContents = allCategoryContents.concat(category.orderedContents);
			}

			// Next, check optional and unknown properties.
			Object.keys(category).forEach((propName) => {
				switch (propName) {
					case "description":
					case "orderedContents":
						// Required; checked above.
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('categories["{0}"] contains unknown property "{1}".', categoryId, propName);
						}
						break;
				}
			});
		});
		let services = config.services;
		if (services) {
			this.checkObjectAndOrderContentsMatch("services", services, "combined category orderedContents", allCategoryContents);
		}

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkUsageCategories(config) {
		///	<summary>
		///	Checks the "usageCategories" and "usageCategoriesOrder" properties, and related configuration, for
		/// consistency and expected structure.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let usageCategories = config.usageCategories, usageCategoriesOrder = config.usageCategoriesOrder;
		if (!this.checkObjectAndOrderContentsMatch("usageCategories", usageCategories, "usageCategoriesOrder", usageCategoriesOrder)) {
			return false;
		}

		let initialErrorCount = this.errors.length, services = config.services;

		usageCategoriesOrder.forEach((usageCategoryId) => {
			let usageCategory = usageCategories[usageCategoryId];
			let desc1 = strFmt('usageCategories["{0}"]', usageCategoryId);
			if (!this.checkRequiredObject(usageCategory, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(usageCategory.name, strFmt("{0}.name", desc1));
			this.checkRequiredString(usageCategory.description, strFmt("{0}.description", desc1));
			this.checkObjectAndOrderContentsMatch("options", usageCategory.options, "optionsOrder", usageCategory.optionsOrder);

			if (this.checkRequiredObject(usageCategory.options, strFmt("{0}.options", desc1))) {
				Object.entries(usageCategory.options).forEach(([optionId, option]) => {
					let desc2 = strFmt('{0}.options["{1}"]', desc1, optionId);
					this.checkRequiredString(option.description, strFmt("{0}.description", desc2));
					if (this.checkRequiredObject(option.contents, strFmt("{0}.contents", desc2))) {
						Object.entries(option.contents).forEach(([serviceId, value]) => {
							if (services && !(serviceId in services)) {
								this.addError('{0}.contents refers to unknown service id "{1}".', desc2, serviceId);
							}
							this.checkRequiredNumber(value, strFmt('{0}.contents["{1}"]', desc2, serviceId));
							// LATER: Check for unknown properties inside the option object
						});
					}
				});
			}

			// Next, check optional and unknown properties.
			Object.entries(usageCategory).forEach(([propName, propValue]) => {
				let desc3 = strFmt("{0}.{1}", desc1, propName);
				let optionSetToCheck, validOptions = new Set(usageCategory.optionsOrder);
				let simplifiedModelingOptions = new Set(usageCategory.simplifiedModelingOptionsOrder ?? usageCategory.optionsOrder);
				let detailedModelingOptions = new Set(usageCategory.detailedModelingOptionsOrder ?? usageCategory.optionsOrder);

				switch (propName) {
					case "name":
					case "description":
					case "optionsOrder":
					case "options":
						// Required; checked above.
						break;

					case "disabled":
						this.checkOptionalBoolean(propValue, desc3);
						break;

					case "simplifiedModelingOptionsOrder":
					case "detailedModelingOptionsOrder":
						if (this.checkOptionalArray(propValue, desc3)) {
							propValue.forEach((optionId, i) => {
								this.checkRequiredStringInSet(optionId, strFmt("{0}[{1}]", desc3, i), validOptions);
							});
						}
						break;

					case "simplifiedModelingDefault":
					case "detailedModelingDefault":
						optionSetToCheck = propName.startsWith("simplified") ? simplifiedModelingOptions : detailedModelingOptions;
						if (this.checkOptionalString(propValue, desc3)) {
							this.checkRequiredStringInSet(propValue, strFmt("{0}", desc3), optionSetToCheck);
						}
						break;

					default:
						if (!propName.startsWith("__engine_")) {
							this.addError('{0} contains unknown property "{1}".', desc1, propName);
						}
						break;
				}
			});
		});

		// Attach to the config properties for facilitating separate iteration of disabled vs. enabled usage categories.
		config.disabledUsageCategoriesOrder = usageCategoriesOrder.filter((usageCategoryId) => usageCategories[usageCategoryId].disabled);
		config.enabledUsageCategoriesOrder = usageCategoriesOrder.filter((usageCategoryId) => !usageCategories[usageCategoryId].disabled);

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkAndProcessConfig(config, configId, noThrow) {
		///	<summary>
		/// Public (intended) method intended to be called by the test harness and any MPCE user interface to ensure the MPCE
		/// configuration object contents are consistent and meet certain defined expectations. This method also handles the
		/// expansion processing of certain permitted configuration shortcuts, so the MPCE engine won't have to handle them
		/// specially. If errors are found, an exception is thrown containing a message with the configuration error details.
		///	</summary>
		/// <param name="config" type="Object">The MPCE configuration object.</param>
		/// <param name="configId" type="String">A string identifying which MPCE configuration object.</param>
		/// <param name="noThrow" type="Boolean">An optional boolean defaulting to false. If true, the throwing of
		///   any configuration errors found is suppressed and it becomes the caller's responsibility to check the return
		///   value and report the errors if indicated.</param>
		///	<returns type="Boolean">
		/// True if all checks passed, false otherwise. For failure, consult the errors array or call throwIfErrorsExist().
		/// </returns>

		_trace("checkAndProcessConfig() called; configId: {0}, noThrow: {1}{2}", configId, noThrow,
			typeof noThrow === "undefined" ? " (false)" : "");

		this.clearErrors();
		delete config.hasPassedMpceValidation;

		this.checkOptionalString(config.configId, "configId");
		this.checkRegions(config);
		this.checkPlans(config);
		this.checkStatuses(config);
		this.checkCoverageLevels(config);
		this.checkAndProcessCoverageLevelCostsPerPlan(config, "coverageLevelCostsPerPlan");
		if (("employerCoverageLevelCostsPerPlan" in config) && !isNullOrUndefined(config.employerCoverageLevelCostsPerPlan)) {
			this.checkAndProcessCoverageLevelCostsPerPlan(config, "employerCoverageLevelCostsPerPlan");
		}
		this.checkAdjustments(config);
		this.checkServices(config);
		this.checkCombinedLimits(config);
		this.checkCategories(config);
		this.checkUsageCategories(config);

		let success = (0 === this.errors.length);
		if (success) {
			config.hasPassedMpceValidation = true;
		} else {
			_trace(`checkAndProcessConfig: ${configId} had validation errors: \n\n... ${this.errors.join("\n... ")}\n\n`);
			!noThrow && this.throwIfErrorsExist(configId);
		}
		_trace("checkAndProcessConfig() returning success: {0}", success);
		return success;
	}
}

let mpceValidation = new MpceValidation(); // singleton
return mpceValidation;
});
