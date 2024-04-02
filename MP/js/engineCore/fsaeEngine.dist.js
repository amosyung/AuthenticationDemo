/**
* ===========================================================================
* 
* Mercer web tool transpiled module output file.
* Copyright (C) 2022 Mercer LLC, All Rights Reserved.
* 
* ===========================================================================
* 
**/
"use strict";

define(["utility", "trace", "corejs"], (utility, trace) => {
  "use strict";

  let me = {};
  let isNullOrUndefined = utility.isNullOrUndefined,
    formatDollar = utility.formatDollar,
    roundToCents = utility.roundToCents,
    min = Math.min,
    max = Math.max;
  me.objName = "fsae";
  me.version = "1.0.61";

  let _traceIsOn = () => trace.isOn();
  let _trace = trace.categoryWriteLineMaker(me.objName);

  me.getAccountContributionMaximum = function getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId) {
    let ignoreContributionMaximumAdjustment = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let accountType = fsaeConfig.accountTypes[accountTypeId],
      contributionMaximumAdjustment = 0;
    if (!ignoreContributionMaximumAdjustment && "contributionMaximumAdjustment" in accountType) {
      contributionMaximumAdjustment = accountType.contributionMaximumAdjustment;
    }
    let result;
    if ("contributionMaximum" in accountType) {
      result = max(0, accountType.contributionMaximum + contributionMaximumAdjustment);
    } else if ("contributionMaximums" in accountType && !isNullOrUndefined(coverageLevelId)) {
      if (!(coverageLevelId in accountType.contributionMaximums)) {
        throw new Error("fsaeConfig accountTypes[\"".concat(accountTypeId, "\"].contributionMaximums is missing coverageLevelId \"").concat(coverageLevelId, "\""));
      }
      result = max(0, accountType.contributionMaximums[coverageLevelId] + contributionMaximumAdjustment);
    } else {
      result = Infinity;
    }
    return result;
  };
  me.getEmployerMaxMatchAmount = function getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId) {

    let result,
      accountType = fsaeConfig.accountTypes[accountTypeId];
    if ("employerMaxMatchAmount" in accountType) {
      result = accountType.employerMaxMatchAmount;
    } else if ("employerMaxMatchAmounts" in accountType && !isNullOrUndefined(coverageLevelId)) {
      if (!(coverageLevelId in accountType.employerMaxMatchAmounts)) {
        throw new Error("fsaeConfig accountTypes[\"".concat(accountTypeId, "\"].employerMaxMatchAmounts is missing coverageLevelId \"").concat(coverageLevelId, "\""));
      }
      result = accountType.employerMaxMatchAmounts[coverageLevelId];
    } else {
      result = 0;
    }
    return result;
  };
  me.calculateOptimalMaxContribution = function calculateOptimalMaxContribution(fsaeConfig, accountTypeId, coverageLevelId) {
    var _fsaeConfig$accountTy;

    let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId);
    let employerMatchRate = (_fsaeConfig$accountTy = fsaeConfig.accountTypes[accountTypeId].employerMatchRate) !== null && _fsaeConfig$accountTy !== void 0 ? _fsaeConfig$accountTy : 0;
    let employerMaxMatchAmount = me.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
    let suggested1 = contributionMaximum / (1 + employerMatchRate);
    let suggested2 = contributionMaximum - employerMaxMatchAmount;
    let result = max(suggested1, suggested2);
    _trace("".concat(accountTypeId, " calculateOptimalMaxContribution result: ").concat(result, " w/ max ").concat(contributionMaximum));
    return result;
  };
  me.calculateEmployerMatchAmount = function calculateEmployerMatchAmount(fsaeConfig, accountTypeId, contribution, coverageLevelId) {
    var _accountType$employer, _accountType$maximumE;

    let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId);
    let accountType = fsaeConfig.accountTypes[accountTypeId];
    let employerMatchRate = (_accountType$employer = accountType.employerMatchRate) !== null && _accountType$employer !== void 0 ? _accountType$employer : 0;
    let maximumExcludesCompanyFunds = (_accountType$maximumE = accountType.maximumExcludesCompanyFunds) !== null && _accountType$maximumE !== void 0 ? _accountType$maximumE : false;
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
    _trace("".concat(accountTypeId, " calculateEmployerMatchAmount result: ").concat(result, " w/ max ").concat(contributionMaximum));
    return result;
  };
  me.calculateContributions = function calculateContributions(fsaeConfig, accountTypeId, totalCosts, rolloverAmount, coverageLevelId) {
    var _accountType$contribu, _accountType$employer2, _accountType$maximumE2;

    let accountType = fsaeConfig.accountTypes[accountTypeId];
    let contributionMinimum = (_accountType$contribu = accountType.contributionMinimum) !== null && _accountType$contribu !== void 0 ? _accountType$contribu : 0;
    let contributionMaximum = me.getAccountContributionMaximum(fsaeConfig, accountTypeId, coverageLevelId);
    let employerMatchRate = (_accountType$employer2 = accountType.employerMatchRate) !== null && _accountType$employer2 !== void 0 ? _accountType$employer2 : 0;
    let employerMaxMatchAmount = me.getEmployerMaxMatchAmount(fsaeConfig, accountTypeId, coverageLevelId);
    let maximumExcludesCompanyFunds = (_accountType$maximumE2 = accountType.maximumExcludesCompanyFunds) !== null && _accountType$maximumE2 !== void 0 ? _accountType$maximumE2 : false;
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
  me.calculateFederalIncomeTax = function calculateFederalIncomeTax(fsaeConfig, income, filingStatusId, numberOfDependents) {

    let personalExemption = fsaeConfig.federalIncomeTax.personalExemptions[filingStatusId];
    let dependentExemption = fsaeConfig.federalIncomeTax.dependentExemption;
    let standardDeduction = fsaeConfig.federalIncomeTax.standardDeductions[filingStatusId];
    let brackets = fsaeConfig.federalIncomeTax.brackets[filingStatusId];
    let incomeTaxRates = fsaeConfig.federalIncomeTax.rates[filingStatusId];
    let taxableIncome = income - personalExemption - numberOfDependents * dependentExemption - standardDeduction;
    let i,
      result = 0,
      taxedSoFar = 0,
      numBrackets = brackets.length,
      taxableAtBracket = 0;
    for (i = 0; i < numBrackets; i += 1) {
      taxableAtBracket = min(brackets[i], taxableIncome) - taxedSoFar;
      result += incomeTaxRates[i] * taxableAtBracket;
      taxedSoFar += taxableAtBracket;
    }
    taxableAtBracket = taxableIncome - taxedSoFar;
    result += incomeTaxRates[i] * taxableAtBracket;
    return result;
  };
  me.calculateFicaPayrollTaxes = function calculateFicaPayrollTaxes(fsaeConfig, income) {

    let ficaPayrollTaxes = fsaeConfig.ficaPayrollTaxes;
    let socialSecurityLimit = ficaPayrollTaxes.socialSecurityLimit;
    let socialSecurityRate = ficaPayrollTaxes.socialSecurityRate;
    let medicareRate = ficaPayrollTaxes.medicareRate;
    let result;
    if (income >= socialSecurityLimit) {
      result = socialSecurityLimit * socialSecurityRate + medicareRate * income;
    } else {
      result = (socialSecurityRate + medicareRate) * income;
    }
    return result;
  };
  me.calculate = function calculate(fsaeConfig, accountTypeId, filingStatusId, numberOfDependents, primaryAnnualIncome, spouseAnnualIncome, rolloverAmount, costAmountOrAmounts, coverageLevelId) {

    _trace("".concat(accountTypeId, " >>========= calculate() called =========="));
    _trace("".concat(accountTypeId, " calculate(): tax info: ").concat(filingStatusId, "/").concat(numberOfDependents, "d") + "/".concat(formatDollar(primaryAnnualIncome), "/").concat(formatDollar(spouseAnnualIncome)));
    _trace("".concat(accountTypeId, " calculate(): r/o: ").concat(rolloverAmount, ", costs: [").concat(costAmountOrAmounts, "], coverageLevelId: ").concat(coverageLevelId));
    let startDateTime = new Date();
    if (!(accountTypeId in fsaeConfig.accountTypes)) {
      throw new Error("Invalid accountTypeId ".concat(accountTypeId));
    }
    switch (filingStatusId) {
      case "single":
      case "marriedFilingJoint":
      case "marriedFilingSeparate":
      case "headOfHousehold":
        break;
      case "":
        filingStatusId = "single";
        break;
      default:
        throw new Error("Invalid filingStatusId ".concat(filingStatusId));
    }

    let totalCosts = Array.isArray(costAmountOrAmounts) ? costAmountOrAmounts.reduce((p, c) => p + c, 0) : costAmountOrAmounts;

    let contributions = me.calculateContributions(fsaeConfig, accountTypeId, totalCosts, rolloverAmount, coverageLevelId);
    let suggestedContribution = contributions.suggestedContribution;
    let employerMatchingContribution = contributions.employerMatchingContribution;

    let incomeBefore = primaryAnnualIncome + (filingStatusId === "marriedFilingJoint" ? spouseAnnualIncome : 0);
    let incomeAfter = max(0, incomeBefore - suggestedContribution);
    let incomeTaxBefore = me.calculateFederalIncomeTax(fsaeConfig, incomeBefore, filingStatusId, numberOfDependents);
    let incomeTaxAfter = me.calculateFederalIncomeTax(fsaeConfig, incomeAfter, filingStatusId, numberOfDependents);
    let federalIncomeTaxSavings = incomeTaxBefore - incomeTaxAfter;

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

    let resultsToRound = ["totalCosts", "effectiveContributionMinimum", "effectiveContributionMaximum", "suggestedContribution", "employerMatchingContribution", "federalIncomeTaxSavings", "ficaTaxSavings", "totalTaxSavings", "totalMatchAndTaxSavings"];
    resultsToRound.forEach(resultName => {
      results[resultName] = roundToCents(results[resultName]);
    });
    let endDateTime = new Date();
    let elapsedMsec = endDateTime.getTime() - startDateTime.getTime();
    results.elapsedMsec = elapsedMsec;
    if (_traceIsOn()) {
      _trace("".concat(accountTypeId, " ***** Results *****"));
      _trace("".concat(accountTypeId, " accountTypeId = ").concat(results.accountTypeId));
      resultsToRound.forEach(resultName => {
        _trace("".concat(accountTypeId, " ").concat(resultName, ": ").concat(formatDollar(results[resultName], true, true)));
      });
    }
    _trace("".concat(accountTypeId, " <<======== calculate() returning; elapsed: ").concat(elapsedMsec, " msec. =========="));
    return results;
  };
  return me;
});
