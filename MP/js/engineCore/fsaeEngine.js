//-------------------------------------------------------------------------------------------------
// fsaeEngine.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the FSAE calculation engine's methods.  See also fsaeConfig.js for the configuration.
//
// IMPORTANT NOTE:  Generally, modification to the methods in the FSAE engine shouldn't be needed
//   unless the current version doesn't allow for some feature of a particular FSAE.  In that case,
//   the correct approach would be to extend the model by defining and adding new configuration
//   properties in fsaeConfig.js, followed by corresponding logic to validate the new properties in
//   fsaeValidation.js, and finally new logic to interpret the new properties in the engine logic
//   below.  Avoid adding non-generalized company/plan-specific logic directly in the engine.
//

define(["utility", "trace", "corejs"],
(utility, trace) => {
"use strict";

let me = {};

let isNullOrUndefined = utility.isNullOrUndefined, formatDollar = utility.formatDollar, roundToCents = utility.roundToCents,
	min = Math.min, max = Math.max;

me.objName = "fsae"; // For use in trace output
me.version = "1.0.62"; // Update for each published release of the engine.

let _traceIsOn = () => trace.isOn();
let _trace = trace.categoryWriteLineMaker(me.objName);

// For later:
// let _assert = function assert(condition, message) {
// 	if (!condition) {
// 		message = message ?? "unspecified";
// 		throw new Error("FSAE Engine assertion failure: " + message);
// 	}
// };

/**
 * @name FsaeConfig
 * @type {{
 *   accountTypes: object.<string, AccountType>,
 *   accountTypesOrder: string[],
 *   federalIncomeTax: object,
 *   ficaPayrollTaxes: object
 * }}
 */

/**
 * @name AccountType
 * @type {{
 *   followRulesFor: string,
 *   contributionMinimum: number,
 *   contributionMaximum: number,
 *   contributionMaximums: object,
 *   maximumExcludesCompanyFunds: boolean,
 *   employerMatchRate: number,
 *   employerMaxMatchAmount: number,
 *   employerMaxMatchAmounts: object,
 *   companyFundsDoNotRollOver: boolean
 * }}
 */

/**
 * Helper to return the contribution maximum for a given account type and coverage level. First, contributionMaximum is consulted.
 * Failing finding a value there, the plural contributionMaximums with a coverageLevelId key is then consulted. Failing finding a value
 * there, Infinity is returned (i.e. no maximum). Any non-finite value found will be adjusted by contributionMaximumAdjustment, unless
 * ignoreContributionMaximumAdjustment is true.
 * @param {FsaeConfig} fsaeConfig The FSAE configuration object.
 * @param {string} accountTypeId The account type id.
 * @param {string} coverageLevelId An optional coverage level id for when contributionMaximums (plural) needs to be consulted.
 * @param {boolean=false} ignoreContributionMaximumAdjustment If true, forces the method to ignore any contributionMaximumAdjustment value
 *   on the account type and instead only refer to contributionMaximum and contributionMaximums.
 * @returns {number} The account's contribution maximum, given the criteria.
 */
me.getAccountContributionMaximum = function getAccountContributionMaximum(
	fsaeConfig, accountTypeId, coverageLevelId, ignoreContributionMaximumAdjustment = false) {

	let accountType = fsaeConfig.accountTypes[accountTypeId], contributionMaximumAdjustment = 0;
	if (!ignoreContributionMaximumAdjustment && ("contributionMaximumAdjustment" in accountType)) {
		contributionMaximumAdjustment = accountType.contributionMaximumAdjustment;
	}

	let result;
	if ("contributionMaximum" in accountType) {
		// Has a single contributionMaximum value configured taking precedence over contributionMaximums (plural).
		result = max(0, accountType.contributionMaximum + contributionMaximumAdjustment);
	} else if (("contributionMaximums" in accountType) && !isNullOrUndefined(coverageLevelId)) {
		if (!(coverageLevelId in accountType.contributionMaximums)) {
			throw new Error(`fsaeConfig accountTypes["${accountTypeId}"].contributionMaximums is missing coverageLevelId "${coverageLevelId}"`);
		}
		// No single contributionMaximum value configured; look for contributionMaximums (plural) w/coverageLevelId.
		result = max(0, accountType.contributionMaximums[coverageLevelId] + contributionMaximumAdjustment);
	} else {
		// No maximum of either kind was configured
		result = Infinity;
	}
	return result;
};

me.getEmployerMaxMatchAmount = function getEmployerMaxMatchAmount(
	fsaeConfig, accountTypeId, coverageLevelId) {
	/// <summary>
	/// Helper to return the employer maximum match amount for a given account type and coverage level. First,
	/// employerMaxMatchAmount is consulted. Failing finding a value there, the plural employerMaxMatchAmounts
	/// with a coverageLevelId key is then consulted. Failing finding a value there, zero is returned.
	/// </summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="accountTypeId" type="String">The account type id.</param>
	///	<param name="coverageLevelId" type="String">An optional coverage level id for when employerMaxMatchAmounts
	///     (plural) needs to be consulted.</param>
	///	<returns type="Number">The account's employer maximum match amount, given the criteria.</returns>

	let result, accountType = fsaeConfig.accountTypes[accountTypeId];
	if ("employerMaxMatchAmount" in accountType) {
		// Has a single employerMaxMatchAmount value configured taking precedence over employerMaxMatchAmounts (plural).
		result = accountType.employerMaxMatchAmount;
	} else if (("employerMaxMatchAmounts" in accountType) && !isNullOrUndefined(coverageLevelId)) {
		if (!(coverageLevelId in accountType.employerMaxMatchAmounts)) {
			throw new Error(`fsaeConfig accountTypes["${accountTypeId}"].employerMaxMatchAmounts is missing coverageLevelId "${coverageLevelId}"`);
		}
		// No single employerMaxMatchAmount value configured; look for employerMaxMatchAmounts (plural) w/coverageLevelId.
		result = accountType.employerMaxMatchAmounts[coverageLevelId];
	} else {
		// No maximum of either kind was configured
		result = 0;
	}
	return result;
};

me.calculateOptimalMaxContribution = function calculateOptimalMaxContribution(
	fsaeConfig, accountTypeId, coverageLevelId) {
	/// <summary>
	/// Intended public helper for MPCE tool to calculate and return the optimal maximum employee
	/// contribution for a given account type. The optimal employee contribution maximum is the point
	/// at which the employee would start to sacrifice company match money because the combination of
	/// their own contribution and the match would put them over the configured contribution maximum.
	/// </summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="accountTypeId" type="String">The account type id.</param>
	///	<param name="coverageLevelId" type="String">An optional coverage level id for contributionMaximums
	///     (plural), which will be consulted only when contributionMaximum (singular) isn't defined.</param>
	///	<returns type="Number">The calculated optimal employee contribution maximum.</returns>

	let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId); // Applies to combined
	let employerMatchRate = fsaeConfig.accountTypes[accountTypeId].employerMatchRate ?? 0;
	let employerMaxMatchAmount = me.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
	let suggested1 = contributionMaximum / (1 + employerMatchRate);
	let suggested2 = contributionMaximum - employerMaxMatchAmount;
	let result = max(suggested1, suggested2);
	_trace(`${accountTypeId} calculateOptimalMaxContribution result: ${result} w/ max ${contributionMaximum}`);
	return result;
};

me.calculateEmployerMatchAmount = function calculateEmployerMatchAmount(
	fsaeConfig, accountTypeId, contribution, coverageLevelId) {
	/// <summary>
	/// Intended public helper for MPCE tool to calculates and returns the employer match amount for a
	/// given account type and contribution amount.
	/// </summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="accountTypeId" type="String">The account type id.</param>
	///	<param name="contribution" type="Number">The contribution amount.</param>
	///	<param name="coverageLevelId" type="String">An optional coverage level id for contributionMaximums
	///     (plural), which will be consulted only when contributionMaximum (singular) isn't defined.</param>
	///	<returns type="Number">The calculated employer match amount.</returns>

	let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId); // Applies to combined
	let accountType = fsaeConfig.accountTypes[accountTypeId];
	let employerMatchRate = accountType.employerMatchRate ?? 0;
	let maximumExcludesCompanyFunds = accountType.maximumExcludesCompanyFunds ?? false;
	let employerMaxMatchAmount = me.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
	let matchAmount = min(employerMaxMatchAmount, contribution * employerMatchRate);
	let result = matchAmount;
	if (!maximumExcludesCompanyFunds) {
		let totalContributions = contribution + matchAmount;
		let limitedTotalContributions = min(contributionMaximum, totalContributions);
		if (limitedTotalContributions < totalContributions) {
			result = limitedTotalContributions - contribution;
		}
	}
	result = max(0, result);
	_trace(`${accountTypeId} calculateEmployerMatchAmount result: ${result} w/ max ${contributionMaximum}`);
	return result;
};

me.calculateContributions = function calculateContributions(
	fsaeConfig, accountTypeId, totalCosts, rolloverAmount, coverageLevelId) {
	///	<summary>
	///	Helper method for calculate(). Calculates the user's suggested contribution and employer matching
	/// contribution, if applicable, subjecting both to the limits configured, if any.
	///	</summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="accountTypeId" type="String">The account type id.</param>
	///	<param name="totalCosts" type="Number">The total eligible costs.</param>
	///	<param name="rolloverAmount" type="Number">The rollover amount.</param>
	///	<param name="coverageLevelId" type="String">An optional coverage level id for contributionMaximums
	///     (plural), which will be consulted only when contributionMaximum (singular) isn't defined.</param>
	///	<returns type="Object">Object containing the resulting contribution amounts.  The contained
	///     properties are "suggestedContribution" and "employerMatchingContribution", both numbers.
	/// </returns>

	let accountType = fsaeConfig.accountTypes[accountTypeId];
	let contributionMinimum = accountType.contributionMinimum ?? 0; // Applies to user's only
	let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId); // Applies to combined
	let employerMatchRate = accountType.employerMatchRate ?? 0;
	let employerMaxMatchAmount = me.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
	let maximumExcludesCompanyFunds = accountType.maximumExcludesCompanyFunds ?? false;
	let contMaxMaybeAdjustedForMatch = contributionMaximum + (maximumExcludesCompanyFunds ? employerMaxMatchAmount : 0);
	let suggestedContribution;
	if (totalCosts > 0) {
		let remainingCosts = max(0, totalCosts - rolloverAmount);
		let limitedCosts = min(contMaxMaybeAdjustedForMatch, remainingCosts);
		let suggested1 = limitedCosts / (1 + employerMatchRate);
		let suggested2 = limitedCosts - employerMaxMatchAmount;
		suggestedContribution = max(contributionMinimum, max(suggested1, suggested2));
	} else {
		suggestedContribution = 0;
	}
	let employerMatchingContribution = min(employerMaxMatchAmount, suggestedContribution * employerMatchRate);
	let result = {
		effectiveContributionMinimum: contributionMinimum,
		effectiveContributionMaximum: contributionMaximum,
		suggestedContribution,
		employerMatchingContribution
	};
	return result;
};

me.calculateFederalIncomeTax = function calculateFederalIncomeTax(
	fsaeConfig, income, filingStatusId, numberOfDependents) {
	///	<summary>
	///	Private (intended) helper method for calculate().  Calculates estimated federal
	/// income tax owed on the passed-in income amount, given a filing status and number of dependents.
	///	</summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="income" type="Number">The total annual income amount.</param>
	///	<param name="filingStatusId" type="String">The filing status id; see calculate().</param>
	///	<param name="numberOfDependents" type="Number">The number of dependents, excluding any spouse.</param>
	///	<returns type="Number">The resulting estimated federal income tax amount.</returns>

	let personalExemption = fsaeConfig.federalIncomeTax.personalExemptions[filingStatusId];
	let dependentExemption = fsaeConfig.federalIncomeTax.dependentExemption;
	let standardDeduction = fsaeConfig.federalIncomeTax.standardDeductions[filingStatusId];
	let brackets = fsaeConfig.federalIncomeTax.brackets[filingStatusId];
	let incomeTaxRates = fsaeConfig.federalIncomeTax.rates[filingStatusId];
	// Adjust income to determine taxable income.
	let taxableIncome = income - personalExemption - (numberOfDependents * dependentExemption) - standardDeduction;
	// Calculate tax at each income tax bracket and rate.
	let i, result = 0, taxedSoFar = 0, numBrackets = brackets.length, taxableAtBracket = 0;
	for (i = 0; i < numBrackets; i += 1) {
		taxableAtBracket = min(brackets[i], taxableIncome) - taxedSoFar;
		result += incomeTaxRates[i] * taxableAtBracket;
		taxedSoFar += taxableAtBracket;
	}
	// Handle income in excess of last bracket; i.e. at the top rate.
	taxableAtBracket = taxableIncome - taxedSoFar;
	result += incomeTaxRates[i] * taxableAtBracket;
	return result;
};

me.calculateFicaPayrollTaxes = function calculateFicaPayrollTaxes(
	fsaeConfig, income) {
	///	<summary>
	///	Private (intended) helper method for calculate().  Calculates estimated FICA payroll
	/// taxes owed on the passed-in income amount.
	///	</summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="income" type="Number">The total annual income amount.</param>
	///	<returns type="Number">The resulting estimated FICA payroll taxes amount.</returns>

	let ficaPayrollTaxes = fsaeConfig.ficaPayrollTaxes;
	let socialSecurityLimit = ficaPayrollTaxes.socialSecurityLimit;
	let socialSecurityRate = ficaPayrollTaxes.socialSecurityRate;
	let medicareRate = ficaPayrollTaxes.medicareRate;
	let result;
	if (income >= socialSecurityLimit) {
		result = (socialSecurityLimit * socialSecurityRate) + (medicareRate * income);
	} else {
		result = (socialSecurityRate + medicareRate) * income;
	}
	return result;
};

me.calculate = function calculate(
	fsaeConfig, accountTypeId, filingStatusId, numberOfDependents, primaryAnnualIncome, spouseAnnualIncome,
	rolloverAmount, costAmountOrAmounts, coverageLevelId) {
	///	<summary>
	///	This is the main method to perform the FSAE (Flexible Spending Account Estimator) calculations.
	///	</summary>
	///	<param name="fsaeConfig" type="Object">The FSAE configuration object.</param>
	///	<param name="accountTypeId" type="String">One of the configured account type ids.</param>
	///	<param name="filingStatusId" type="String">The user's filing status id, which must be one
	///     of "single", "marriedFilingJoint", "marriedFilingSeparate", or "headOfHousehold".</param>
	///	<param name="numberOfDependents" type="Number">The user's number of dependents, excluding the spouse.</param>
	///	<param name="totalAnnualIncome" type="Number">The total annual income for tax purposes.  If filing
	///    status id is "marriedFilingJoint", pass family income, otherwise pass user's own income.</param>
	///	<param name="rolloverAmount" type="Number">A rollover amount from the previous plan year.
	///     Pass zero if not applicable to the account type.</param>
	///	<param name="costAmountOrAmounts" type="Object">A single Number, or an array of Numbers that will be
	///     combined into a single total eligible costs amount.</param>
	///	<param name="coverageLevelId" type="String">An optional coverageLevelId string used to select the appropriate
	///     contributionMaximums value ONLY for when a single contributionMaximum value hasn't been configured.</param>
	///	<returns type="Object">An object containing the results of the calculation.  The various result values
	///     currently returned are numbers representing dollar amounts. If formatting is required, it will
	///     need to be applied by user interface logic.
	/// </returns>

	_trace(`${accountTypeId} >>========= calculate() called ==========`);
	_trace(`${accountTypeId} calculate(): tax info: ${filingStatusId}/${numberOfDependents}d` +
		`/${formatDollar(primaryAnnualIncome)}/${formatDollar(spouseAnnualIncome)}`);
	_trace(`${accountTypeId} calculate(): r/o: ${rolloverAmount}, costs: [${costAmountOrAmounts}], coverageLevelId: ${coverageLevelId}`);

	let startDateTime = new Date();

	if (!(accountTypeId in fsaeConfig.accountTypes)) {
		throw new Error(`Invalid accountTypeId ${accountTypeId}`);
	}

	switch (filingStatusId) {
		case "single":
		case "marriedFilingJoint":
		case "marriedFilingSeparate":
		case "headOfHousehold":
			break;

		case "":
			// Apply default of "single" filing status.
			filingStatusId = "single";
			break;

		default:
			throw new Error(`Invalid filingStatusId ${filingStatusId}`);
	}

	// Accumulate costs into a single total.
	let totalCosts = Array.isArray(costAmountOrAmounts) ? costAmountOrAmounts.reduce((p, c) => p + c, 0) : costAmountOrAmounts;

	// Calculate suggested employee and employer matching contributions.
	let contributions = me.calculateContributions(fsaeConfig, accountTypeId, totalCosts, rolloverAmount, coverageLevelId);
	let suggestedContribution = contributions.suggestedContribution;
	let employerMatchingContribution = contributions.employerMatchingContribution;

	// Calculate estimate of federal income tax savings.  Include spouse's income if applicable filing status.
	let incomeBefore = primaryAnnualIncome + (filingStatusId === "marriedFilingJoint" ? spouseAnnualIncome : 0);
	let incomeAfter = max(0, incomeBefore - suggestedContribution);
	let incomeTaxBefore = me.calculateFederalIncomeTax(fsaeConfig, incomeBefore, filingStatusId, numberOfDependents);
	let incomeTaxAfter = me.calculateFederalIncomeTax(fsaeConfig, incomeAfter, filingStatusId, numberOfDependents);
	let federalIncomeTaxSavings = incomeTaxBefore - incomeTaxAfter;

	// Calculate estimate of FICA payroll taxes savings.  Note: Payroll tax savings are only on primary's income.
	incomeBefore = primaryAnnualIncome;
	incomeAfter = max(0, incomeBefore - suggestedContribution);
	let ficaTaxBefore = me.calculateFicaPayrollTaxes(fsaeConfig, incomeBefore);
	let ficaTaxAfter = me.calculateFicaPayrollTaxes(fsaeConfig, incomeAfter);
	let ficaTaxSavings = ficaTaxBefore - ficaTaxAfter;

	let totalTaxSavings = ficaTaxSavings + federalIncomeTaxSavings;

	let totalMatchAndTaxSavings = employerMatchingContribution + totalTaxSavings;

	let results = {
		accountTypeId,
		totalCosts,
		effectiveContributionMinimum: contributions.effectiveContributionMinimum,
		effectiveContributionMaximum: contributions.effectiveContributionMaximum,
		suggestedContribution,
		employerMatchingContribution,
		federalIncomeTaxSavings,
		ficaTaxSavings,
		totalTaxSavings,
		totalMatchAndTaxSavings
	};

	// Round all of these dollar amount results to the nearest penny.
	let resultsToRound = [
		"totalCosts",
		"effectiveContributionMinimum",
		"effectiveContributionMaximum",
		"suggestedContribution",
		"employerMatchingContribution",
		"federalIncomeTaxSavings",
		"ficaTaxSavings",
		"totalTaxSavings",
		"totalMatchAndTaxSavings"
	];
	resultsToRound.forEach((resultName) => { results[resultName] = roundToCents(results[resultName]); });

	let endDateTime = new Date();
	let elapsedMsec = endDateTime.getTime() - startDateTime.getTime();
	results.elapsedMsec = elapsedMsec;

	if (_traceIsOn()) {
		_trace(`${accountTypeId} ***** Results *****`);
		_trace(`${accountTypeId} accountTypeId = ${results.accountTypeId}`);
		resultsToRound.forEach((resultName) => {
			_trace(`${accountTypeId} ${resultName}: ${formatDollar(results[resultName], true, true)}`);
		});
	}

	_trace(`${accountTypeId} <<======== calculate() returning; elapsed: ${elapsedMsec} msec. ==========`);

	return results;
};

return me;
});
