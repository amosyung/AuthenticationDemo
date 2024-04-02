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
    roundToCents = utility.roundToCents,
    min = Math.min,
    min3 = utility.min3,
    max = Math.max,
    strFmt = utility.stringFormat,
    formatDollar = utility.formatDollar,
    getDescription = utility.getDescription;
  me.objName = "mpce";
  me.version = "1.0.61";

  let _traceIsOn = () => trace.isOn();
  let _trace = trace.categoryWriteLineMaker(me.objName);
  let _assert = function assert(condition, message) {
    if (!condition) {
      var _message;
      message = (_message = message) !== null && _message !== void 0 ? _message : "unspecified";
      throw new Error("MPCE Engine assertion failure: ".concat(message));
    }
  };

  me.makeLimitObjectCategoryToIdMap = function makeLimitObjectCategoryToIdMap(mpceConfig, mapName, limitObjectName) {
    let plans = mpceConfig.plans,
      categoriesOrder = mpceConfig.categoriesOrder;
    mpceConfig.plansOrder.forEach(planId => {
      let plan = plans[planId],
        planMap = plan[mapName] = {},
        planLimitObject = plan[limitObjectName];
      if (typeof planLimitObject !== "undefined") {
        categoriesOrder.forEach(categoryId => {
          planMap[categoryId] = "general";
        });
        Object.keys(planLimitObject).filter(id => id !== "general").forEach(id => {
          let categories = planLimitObject[id].categories;
          categories.forEach(categoryId => {
            planMap[categoryId] = id;
          });
        });
      }
    });
  };

  me.makeOopMaximumObjectCategoryToIdsMap = function makeOopMaximumObjectCategoryToIdsMap(mpceConfig, mapName, limitObjectName) {
    let plans = mpceConfig.plans;
    mpceConfig.plansOrder.forEach(planId => {
      let plan = plans[planId],
        planMap = plan[mapName] = {},
        planLimitObject = plan[limitObjectName];
      if (typeof planLimitObject !== "undefined") {
        Object.entries(planLimitObject).forEach(_ref => {
          let [id, obj] = _ref;
          let categories = obj.categories;
          categories.forEach(categoryId => {
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
  me.maybeMarkupConfig = function maybeMarkupConfig(config) {

    if (config.isMarkedUpAlready) {
      return;
    }

    _trace("maybeMarkupConfig() performing config markup.");

    let servicesWithDeductibleOrderByPlan = config.__engine_servicesWithDeductibleOrderByPlan = {};
    let servicesNoDeductibleOrderByPlan = config.__engine_servicesNoDeductibleOrderByPlan = {};
    config.plansOrder.forEach(planId => {
      servicesWithDeductibleOrderByPlan[planId] = [];
      servicesNoDeductibleOrderByPlan[planId] = [];
    });
    let categories = config.categories,
      services = config.services,
      plans = config.plans;
    config.categoriesOrder.forEach(categoryId => {
      categories[categoryId].orderedContents.forEach(serviceId => {
        let service = services[serviceId],
          serviceCoverage = service.coverage;

        service.__engine_categoryId = categoryId;

        Object.entries(serviceCoverage).forEach(_ref2 => {
          let [planId, planCoverage] = _ref2;
          if (!Array.isArray(planCoverage)) {
            serviceCoverage[planId] = [planCoverage];
          }
        });

        Object.entries(serviceCoverage).forEach(_ref3 => {
          let [planId, planCoverageArray] = _ref3;
          let plan = plans[planId],
            hasDeductible = false;
          planCoverageArray.forEach(planCoverage => {
            hasDeductible = hasDeductible || planCoverage.deductible !== "none";
            if (typeof planCoverage.__engine_eligibleForFundsKind === "undefined") {
              var _plan$categoriesFundE, _plan$categoriesFundE2;
              planCoverage.__engine_eligibleForFundsKind = (_plan$categoriesFundE = (_plan$categoriesFundE2 = plan.categoriesFundEligibility) === null || _plan$categoriesFundE2 === void 0 ? void 0 : _plan$categoriesFundE2[categoryId]) !== null && _plan$categoriesFundE !== void 0 ? _plan$categoriesFundE : "noFunds";
            }
          });

          if (hasDeductible) {
            servicesWithDeductibleOrderByPlan[planId].push(serviceId);
          } else {
            servicesNoDeductibleOrderByPlan[planId].push(serviceId);
          }
        });
      });
    });

    me.makeLimitObjectCategoryToIdMap(config, "__engine_categoryToPersonDeductibleId", "personDeductibles");
    me.makeLimitObjectCategoryToIdMap(config, "__engine_categoryToFamilyDeductibleId", "familyDeductibles");

    me.makeOopMaximumObjectCategoryToIdsMap(config, "__engine_categoryToPersonOopMaxIds", "personOutOfPocketMaximums");
    me.makeOopMaximumObjectCategoryToIdsMap(config, "__engine_categoryToFamilyOopMaxIds", "familyOutOfPocketMaximums");

    config.isMarkedUp = true;
  };

  me.inputsFromEnabledUsageCategoryOptions = function inputsFromEnabledUsageCategoryOptions(config, usageCategoryOptions) {
    let result = {};
    Object.entries(usageCategoryOptions).forEach(_ref4 => {
      let [usageCategoryId, optionId] = _ref4;
      let usageCategory = config.usageCategories[usageCategoryId];
      if (usageCategory && !usageCategory.disabled) {
        let contents = optionId ? usageCategory.options[optionId].contents : {};
        Object.entries(contents).forEach(_ref5 => {
          let [serviceId, count] = _ref5;
          result[serviceId] = count + (serviceId in result ? result[serviceId] : 0);
        });
      }
    });
    return result;
  };
  me.lookUpCustomAdjustmentAmount = function lookUpCustomAdjustmentAmount(config, adjustmentId, answer, planId, regionId, coverageLevelId, statusId) {

    if (!config.hasPassedMpceValidation) {
      throw new Error("Config has not passed MPCE validation.");
    }
    if (!config.adjustmentsOrder.includes(adjustmentId)) {
      throw new Error(strFmt("Passed adjustmentId {0} not present in adjustmentsOrder", adjustmentId));
    }
    let inner = config.adjustments[adjustmentId].answersToAmount,
      resolved = false,
      result = 0;
    let path = [{
      key: answer,
      altKey: "otherAnswers"
    }, {
      key: planId,
      altKey: "otherPlans"
    }, {
      key: regionId,
      altKey: "otherRegions"
    }, {
      key: coverageLevelId,
      altKey: "otherCoverageLevels"
    }, {
      key: statusId,
      altKey: "otherStatuses"
    }];
    path.forEach(pathObj => {
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
  me.getPlanFundAmount = function getPlanFundAmount(plan, regionId, statusId, coverageLevelId, restricted) {

    let result,
      fundAmountMap = restricted !== "restricted" ? plan.fundAmountMap : plan.restrictedFundAmountMap;
    if (typeof fundAmountMap !== "undefined") {
      result = typeof fundAmountMap[regionId] !== "undefined" ? fundAmountMap[regionId][coverageLevelId] : typeof fundAmountMap[statusId] !== "undefined" ? fundAmountMap[statusId][coverageLevelId] : fundAmountMap[coverageLevelId];
    } else {
      result = 0;
    }
    return result;
  };
  me.getCoverageLevelId = function getCoverageLevelId(config, hasSpouse, numChildren, options) {

    let result = null,
      coverageLevels = config.coverageLevels;
    config.coverageLevelsOrder.some(coverageLevelId => {
      let coverageLevel = coverageLevels[coverageLevelId];
      if (hasSpouse && !coverageLevel.spouse) {
        return false;
      }

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
  me.determineCoverageLevelId = function determineCoverageLevelId(config, spouse, childrenArray) {

    let hasSpouse = !isNullOrUndefined(spouse),
      numChildren = childrenArray.length;
    let result = me.getCoverageLevelId(config, hasSpouse, numChildren);
    return result;
  };
  me.determineCoverageLevel = function determineCoverageLevel(config, spouse, childrenArray) {
    return me.determineCoverageLevelId(config, spouse, childrenArray);
  };
  me.getMinDeductibleAvailable = function getMinDeductibleAvailable(personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId) {
    let pa = personAmounts,
      pg = personDeductiblesId,
      fa = familyAmounts,
      fg = familyDeductiblesId;
    let result = min(pg && pa.dedsById[pg] ? pa.dedsById[pg].available : Infinity, fg && fa.dedsById[fg] ? fa.dedsById[fg].available : Infinity);
    return result;
  };
  me.accumulateDeductibleUsed = function accumulateDeductibleUsed(amount, personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId) {

    let pa = personAmounts,
      pg = personDeductiblesId,
      fg = familyDeductiblesId;
    if (typeof pg !== "undefined") {
      pa.dedsById[pg].used = roundToCents(pa.dedsById[pg].used + amount);
      let prevPersonalAmount = pa.dedsById[pg].available,
        newPersonalAmount = roundToCents(prevPersonalAmount - amount);
      _assert(newPersonalAmount >= 0, "Available personal deductible amount should never be negative");
      pa.dedsById[pg].available = newPersonalAmount;
      if (prevPersonalAmount !== newPersonalAmount && newPersonalAmount === 0) {
        pa.dedsById[pg].limitMet = true;
      }
    }
    if (typeof fg !== "undefined") {
      let fa = familyAmounts;
      fa.dedsById[fg].used = roundToCents(fa.dedsById[fg].used + amount);
      let prevFamilyAmount = fa.dedsById[fg].available,
        newFamilyAmount = roundToCents(prevFamilyAmount - amount);
      _assert(newFamilyAmount >= 0, "Available family deductible amount should never be negative");
      fa.dedsById[fg].available = newFamilyAmount;
      if (prevFamilyAmount !== newFamilyAmount && newFamilyAmount === 0) {
        fa.dedsById[fg].limitMet = true;
      }
    }
  };
  me.getMinOopAvailable = function getMinOopAvailable(chargeType, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {
    let pa = personAmounts,
      pMinAvail = Infinity;
    personOopMaxIds.filter(id => pa.oopsById[id].chargeTypeSet.has(chargeType)).every(id => {
      pMinAvail = min(pMinAvail, pa.oopsById[id].available);
      return pMinAvail !== 0;
    });
    let fa = familyAmounts,
      fMinAvail = Infinity;
    familyOopMaxIds.filter(id => fa.oopsById[id].chargeTypeSet.has(chargeType)).every(id => {
      fMinAvail = min(fMinAvail, fa.oopsById[id].available);
      return fMinAvail !== 0;
    });
    let result = min(pMinAvail, fMinAvail);
    return result;
  };
  me.accumulateOopUsed = function accumulateOopUsed(chargeType, amount, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {
    _assert(chargeType === "deductible" || chargeType === "copay" || chargeType === "coinsurance", "chargeType must be deductible, copay, or coinsurance");
    if (amount > 0) {
      personOopMaxIds.forEach(oopMaxId => {
        let pa = personAmounts,
          chargeTypeSetForId = pa.oopsById[oopMaxId].chargeTypeSet;
        if (chargeTypeSetForId.has(chargeType)) {
          pa.oopsById[oopMaxId].used = roundToCents(pa.oopsById[oopMaxId].used + amount);
          let prevPersonalAmount = pa.oopsById[oopMaxId].available,
            newPersonalAmount = roundToCents(prevPersonalAmount - amount);
          _assert(newPersonalAmount >= 0, "Available personal out-of-pocket amount should never be negative");
          pa.oopsById[oopMaxId].available = newPersonalAmount;
          if (prevPersonalAmount !== newPersonalAmount && newPersonalAmount === 0) {
            pa.oopsById[oopMaxId].maxReached = true;
          }
        }
      });
      familyOopMaxIds.forEach(oopMaxId => {
        let fa = familyAmounts,
          chargeTypeSetForId = fa.oopsById[oopMaxId].chargeTypeSet;
        if (chargeTypeSetForId.has(chargeType)) {
          fa.oopsById[oopMaxId].used = roundToCents(fa.oopsById[oopMaxId].used + amount);
          let prevFamilyAmount = fa.oopsById[oopMaxId].available,
            newFamilyAmount = roundToCents(prevFamilyAmount - amount);
          _assert(newFamilyAmount >= 0, "Available family out-of-pocket amount should never be negative");
          fa.oopsById[oopMaxId].available = newFamilyAmount;
          if (prevFamilyAmount !== newFamilyAmount && newFamilyAmount === 0) {
            fa.oopsById[oopMaxId].maxReached = true;
          }
        }
      });
    }
  };
  me.calculateDeductible = function calculateDeductible(costLeft, singleUseCostMaxLeft, personAmounts, personDeductiblesId, personOopMaxIds, familyAmounts, familyDeductiblesId, familyOopMaxIds) {

    let minDedAvailable = me.getMinDeductibleAvailable(personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId);
    let minOopAvailable = me.getMinOopAvailable("deductible", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
    let minDedOrOopAvailable = min(minDedAvailable, minOopAvailable);
    let deductible = min3(costLeft, singleUseCostMaxLeft, minDedOrOopAvailable);
    if (deductible > 0) {
      me.accumulateDeductibleUsed(deductible, personAmounts, personDeductiblesId, familyAmounts, familyDeductiblesId);
      me.accumulateOopUsed("deductible", deductible, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
    }
    return deductible;
  };
  me.calculateCopay = function calculateCopay(costLeft, singleUseCostMaxLeft, nominalCopay, copayNotTowardsOOPMax, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {

    let copay = min3(costLeft, nominalCopay, singleUseCostMaxLeft);
    if (!(copayNotTowardsOOPMax !== null && copayNotTowardsOOPMax !== void 0 ? copayNotTowardsOOPMax : false)) {
      let minOopAvailable = me.getMinOopAvailable("copay", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
      copay = min(copay, minOopAvailable);
      if (copay > 0) {
        me.accumulateOopUsed("copay", copay, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
      }
    }
    return copay;
  };
  me.calculateCoinsurance = function calculateCoinsurance(costLeft, singleUseCostMaxLeft, nominalCoinsuranceRate, coinsuranceMinDollar, coinsuranceMaxDollar, coinsuranceNotTowardsOOPMax, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds) {

    let coinsurance = roundToCents(costLeft * nominalCoinsuranceRate);
    coinsurance = max(coinsurance, coinsuranceMinDollar !== null && coinsuranceMinDollar !== void 0 ? coinsuranceMinDollar : -Infinity);
    coinsurance = min(coinsurance, coinsuranceMaxDollar !== null && coinsuranceMaxDollar !== void 0 ? coinsuranceMaxDollar : Infinity);
    coinsurance = min3(coinsurance, costLeft, singleUseCostMaxLeft);
    if (!(coinsuranceNotTowardsOOPMax !== null && coinsuranceNotTowardsOOPMax !== void 0 ? coinsuranceNotTowardsOOPMax : false)) {
      let minOopAvailable = me.getMinOopAvailable("coinsurance", personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
      coinsurance = min(coinsurance, minOopAvailable);
      if (coinsurance > 0) {
        me.accumulateOopUsed("coinsurance", coinsurance, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
      }
    }
    return coinsurance;
  };
  me.calculateService = function calculateService(plan, planId, service, personAmounts, familyAmounts, personNumber) {
    var _service$coverage$not, _plan$__engine_catego, _plan$__engine_catego2;

    if (service.id.startsWith("additionalServices") && service.cost === 1.0) {
      service.cost = service.count;
      service.count = 1;
    }
    let combinedLimitId,
      combinedLimitAvailable = Infinity;
    if (typeof service.coverage.combinedLimitId !== "undefined") {
      var _personAmounts$combin, _personAmounts$combin2, _familyAmounts$combin, _familyAmounts$combin2;
      combinedLimitId = service.coverage.combinedLimitId;
      let personCombinedLimitAvailable = (_personAmounts$combin = (_personAmounts$combin2 = personAmounts.combinedLimitsById[combinedLimitId]) === null || _personAmounts$combin2 === void 0 ? void 0 : _personAmounts$combin2.available) !== null && _personAmounts$combin !== void 0 ? _personAmounts$combin : Infinity;
      let familyCombinedLimitAvailable = (_familyAmounts$combin = (_familyAmounts$combin2 = familyAmounts.combinedLimitsById[combinedLimitId]) === null || _familyAmounts$combin2 === void 0 ? void 0 : _familyAmounts$combin2.available) !== null && _familyAmounts$combin !== void 0 ? _familyAmounts$combin : Infinity;
      combinedLimitAvailable = min(personCombinedLimitAvailable, familyCombinedLimitAvailable);
    }

    let coveredCount, notCoveredCount;
    if ((_service$coverage$not = service.coverage.notCovered) !== null && _service$coverage$not !== void 0 ? _service$coverage$not : false) {
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
    let personOopMaxIds = (_plan$__engine_catego = plan.__engine_categoryToPersonOopMaxIds[service.__engine_categoryId]) !== null && _plan$__engine_catego !== void 0 ? _plan$__engine_catego : [];
    let familyOopMaxIds = (_plan$__engine_catego2 = plan.__engine_categoryToFamilyOopMaxIds[service.__engine_categoryId]) !== null && _plan$__engine_catego2 !== void 0 ? _plan$__engine_catego2 : [];
    let coveredCountLeft = coveredCount;
    while (coveredCountLeft > 0 && combinedLimitAvailable > 0) {
      var _service$coverage$sin;
      let deductible = 0,
        copay = 0,
        coinsurance = 0,
        additionalPremium = 0;
      let partial = coveredCountLeft > 1 ? 1 : coveredCountLeft;
      coveredCountLeft -= partial;

      let costLeft = service.cost * partial;
      let singleUseCostMaxLeft = (_service$coverage$sin = service.coverage.singleUseCostMax) !== null && _service$coverage$sin !== void 0 ? _service$coverage$sin : Infinity;

      if (costLeft > 0 && service.coverage.deductible === "beforeCopay") {
        deductible = me.calculateDeductible(costLeft, singleUseCostMaxLeft, personAmounts, personDeductibleId, personOopMaxIds, familyAmounts, familyDeductibleId, familyOopMaxIds);
        costLeft -= deductible;
        singleUseCostMaxLeft -= deductible;
      }

      if (costLeft > 0 && typeof service.coverage.copay !== "undefined") {
        copay = me.calculateCopay(costLeft, singleUseCostMaxLeft, service.coverage.copay, service.coverage.copayNotTowardsOOPMax, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
        costLeft -= service.coverage.copayDoesNotReduceCost ? 0 : copay;
        singleUseCostMaxLeft -= copay;
      }

      if (costLeft > 0 && (typeof service.coverage.deductible === "undefined" || service.coverage.deductible === "afterCopay" || service.coverage.deductible === "beforeCoinsurance")) {
        deductible = me.calculateDeductible(costLeft, singleUseCostMaxLeft, personAmounts, personDeductibleId, personOopMaxIds, familyAmounts, familyDeductibleId, familyOopMaxIds);
        costLeft -= deductible;
        singleUseCostMaxLeft -= deductible;
      }

      if (costLeft > 0 && typeof service.coverage.coinsurance !== "undefined") {
        coinsurance = me.calculateCoinsurance(costLeft, singleUseCostMaxLeft, service.coverage.coinsurance, service.coverage.coinsuranceMinDollar, service.coverage.coinsuranceMaxDollar, service.coverage.coinsuranceNotTowardsOOPMax, personAmounts, personOopMaxIds, familyAmounts, familyOopMaxIds);
        costLeft -= coinsurance;
        singleUseCostMaxLeft -= coinsurance;
      }

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
    }

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
    notCoveredCount += coveredCountLeft;
    service.expensesNotCovered += notCoveredCount * service.cost;
    if (_traceIsOn()) {
      let personDedMaxed = personDeductibleId && personAmounts.dedsById[personDeductibleId].limitMet;
      let familyDedMaxed = familyDeductibleId && familyAmounts.dedsById[familyDeductibleId].limitMet;
      let personOopMaxed = personOopMaxIds.some(id => personAmounts.oopsById[id].maxReached);
      let familyOopMaxed = familyOopMaxIds.some(id => familyAmounts.oopsById[id].maxReached);
      let serviceDesc = service.__engine_categoryId + "/" + service.id + (service.coverageIndex > 0 ? "[" + service.coverageIndex + "]" : "");
      _trace("{0} | {1}  {2} {3} {4} {5} {6} {7} {8} {9} {10}{11}{12}{13}{14}", planId, serviceDesc.padStart(32), service.count.toString().padStart(4), formatDollar(service.cost, true, true, "").padStart(9), coveredCount.toString().padStart(4), (service.deductibles > 0 ? formatDollar(service.deductibles, true, true, "") : "-.--").padStart(8), (service.copays > 0 ? formatDollar(service.copays, true, false, "", ".", service.coverage.copayNotTowardsOOPMax ? "*" : "") : "-.--").padStart(8), (service.coinsurance > 0 ? formatDollar(service.coinsurance, true, false, "", ".", service.coverage.coinsuranceNotTowardsOOPMax ? "*" : "") : "-.--").padStart(8), (service.reimbursed > 0 ? formatDollar(service.reimbursed, true, true, "") : "-.--").padStart(9), (service.additionalPremiums > 0 ? formatDollar(service.additionalPremiums, true, true, "") : "-.--").padStart(9), notCoveredCount > 0 ? " ncc:" + notCoveredCount.toString().padStart(2) : "", service.isLastCoverageEntry && service.expensesNotCovered > 0 ? " (" + formatDollar(service.expensesNotCovered, true, true, "") + ")" : "", personDedMaxed || familyDedMaxed ? " d" + (personDedMaxed ? personNumber : "") + (familyDedMaxed ? "F" : "") : "", personOopMaxed || familyOopMaxed ? " o" + (personOopMaxed ? personNumber : "") + (familyOopMaxed ? "F" : "") : "", service.combinedLimitAttained ? " @ MAX COMBINED LIMIT" : "");
    }
  };
  me.resolveAmountMapOrAmount = function resolveAmountMapOrAmount(amountMap, amount, regionId, statusId, coverageLevelId) {
    let map = amountMap,
      result;
    if (typeof map !== "undefined") {
      result = typeof map[regionId] !== "undefined" ? map[regionId][coverageLevelId] : typeof map[statusId] !== "undefined" ? map[statusId][coverageLevelId] : map[coverageLevelId];
    } else {
      result = amount;
    }
    return result;
  };
  me.getServiceCost = function getServiceCost(plan, service, regionId) {
    var _plan$costsObjectId;
    let result,
      costsObjectId = (_plan$costsObjectId = plan.costsObjectId) !== null && _plan$costsObjectId !== void 0 ? _plan$costsObjectId : "costs";
    if (costsObjectId in service && regionId in service[costsObjectId]) {
      result = service[costsObjectId][regionId];
    } else {
      result = service.defaultCost;
    }
    return result;
  };
  me.calculatePlanServices = function calculatePlanServices(params, plan, services, servicesWithDeductibleOrderByPlan, servicesNoDeductibleOrderByPlan, combinedLimits, peopleServices) {
    let planId = params.planId,
      regionId = params.regionId,
      statusId = params.statusId,
      coverageLevelId = params.coverageLevelId;
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
      deductiblesMet: {
        count: 0,
        family: [],
        person: []
      },
      outOfPocketMaximumsReached: {
        count: 0,
        family: [],
        person: []
      }
    };
    let r = planServicesResults;
    Object.seal(r);

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

    let familyAmounts = {
      who: "family",
      dedsById: {},
      oopsById: {},
      combinedLimitsById: {}
    };
    Object.seal(familyAmounts);

    let familyDeductibles = plan.familyDeductibles;
    if (typeof familyDeductibles !== "undefined") {
      Object.entries(familyDeductibles).forEach(_ref6 => {
        let [id, obj] = _ref6;
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
    let familyOutOfPocketMaximums = plan.familyOutOfPocketMaximums;
    if (typeof familyOutOfPocketMaximums !== "undefined") {
      Object.entries(familyOutOfPocketMaximums).forEach(_ref7 => {
        var _obj$chargeTypes;
        let [id, obj] = _ref7;
        let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
        familyAmounts.oopsById[id] = {
          chargeTypeSet: new Set((_obj$chargeTypes = obj.chargeTypes) !== null && _obj$chargeTypes !== void 0 ? _obj$chargeTypes : ["deductible", "copay", "coinsurance"]),
          max: amount,
          maxReached: false,
          available: amount,
          used: 0
        };
        Object.seal(familyAmounts.oopsById[id]);
      });
    }

    if (typeof combinedLimits !== "undefined") {
      Object.entries(combinedLimits).forEach(_ref8 => {
        let [id, obj] = _ref8;
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

    let peopleAmounts = [],
      peopleServicesLength = peopleServices.length;
    for (let i = 0; i < peopleServicesLength; i += 1) {
      let personAmounts = {
        who: "person_".concat(i),
        dedsById: {},
        oopsById: {},
        combinedLimitsById: {}
      };
      Object.seal(personAmounts);
      let personDeductibles = plan.personDeductibles;
      if (typeof personDeductibles !== "undefined") {
        Object.entries(personDeductibles).forEach(_ref9 => {
          let [id, obj] = _ref9;
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
        Object.entries(personOutOfPocketMaximums).forEach(_ref10 => {
          var _obj$chargeTypes2;
          let [id, obj] = _ref10;
          let amount = me.resolveAmountMapOrAmount(obj.amountMap, obj.amount, regionId, statusId, coverageLevelId);
          personAmounts.oopsById[id] = {
            chargeTypeSet: new Set((_obj$chargeTypes2 = obj.chargeTypes) !== null && _obj$chargeTypes2 !== void 0 ? _obj$chargeTypes2 : ["deductible", "copay", "coinsurance"]),
            max: amount,
            maxReached: false,
            available: amount,
            used: 0
          };
          Object.seal(personAmounts.oopsById[id]);
        });
      }
      if (typeof combinedLimits !== "undefined") {
        Object.entries(combinedLimits).forEach(_ref11 => {
          let [id, obj] = _ref11;
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

    let calculateServicesInnerFunc = function calculateServicesInner(servicesOrderArray) {
      for (let p = 0, personNumber = 1; p < peopleServicesLength; p += 1, personNumber += 1) {
        _trace("{0} | person #{1}:{2}", planId, personNumber, personNumber === 1 ? "               service   cnt    @ cost  cov      ded    copay    coins     reimb     add_p  misc" : "");
        let personServices = peopleServices[p],
          personAmounts = peopleAmounts[p];
        servicesOrderArray.forEach(serviceId => {
          let personServiceCount = personServices[serviceId];
          if (typeof personServiceCount === "undefined") {
            return;
          }
          let configService = services[serviceId];
          service.__engine_categoryId = configService.__engine_categoryId;
          service.id = serviceId;
          service.count = personServiceCount;
          service.cost = me.getServiceCost(plan, configService, regionId);
          r.totalRawExpenses += service.count * service.cost;

          let serviceCoverageArray = configService.coverage[planId],
            serviceCoverageArrayLength = serviceCoverageArray.length;
          let serviceCoverage;
          for (let k = 0; k < serviceCoverageArrayLength; k += 1) {
            serviceCoverage = service.coverage = serviceCoverageArray[k];
            service.coverageIndex = k;
            service.isLastCoverageEntry = k === serviceCoverageArrayLength - 1;
            me.calculateService(plan, planId, service, personAmounts, familyAmounts, personNumber);
            if (typeof serviceCoverage.coveredCount !== "undefined") {
              service.count = max(0, service.count - serviceCoverage.coveredCount);
            } else if (typeof serviceCoverage.coveredCountFromDollarLimit !== "undefined") {
              service.count = max(0, service.count - serviceCoverage.coveredCountFromDollarLimit);
            }

            r.totalDeductibles += service.deductibles;
            r.totalCopays += service.copays;
            r.totalCoinsurance += service.coinsurance;
            r.employeeAdditionalServicePremiums += service.additionalPremiums;
            let maybeEligibleFundCosts = service.deductibles + service.copays + service.coinsurance;
            r.totalFundEligibleCostsRestrictedPart += serviceCoverage.__engine_eligibleForFundsKind === "allFunds" ? maybeEligibleFundCosts : 0;
            r.totalFundEligibleCosts += serviceCoverage.__engine_eligibleForFundsKind !== "noFunds" ? maybeEligibleFundCosts : 0;

            r.totalRawExpenses += serviceCoverage.copayDoesNotReduceCost ? service.copays : 0;

            if (service.combinedLimitAttained) {
              break;
            }

          }

          r.totalFundEligibleCostsRestrictedPart += serviceCoverage.__engine_eligibleForFundsKind === "allFunds" ? service.expensesNotCovered : 0;
          r.totalFundEligibleCosts += serviceCoverage.__engine_eligibleForFundsKind !== "noFunds" ? service.expensesNotCovered : 0;
          r.totalExpensesNotCovered += service.expensesNotCovered;
        });
      }
    };

    _trace("{0} .----- first pass: services with deductible: ------------------------------------------------------------------", planId);
    calculateServicesInnerFunc(servicesWithDeductibleOrderByPlan[planId]);
    _trace("{0} +----- second pass: services without deductible: --------------------------------------------------------------", planId);
    calculateServicesInnerFunc(servicesNoDeductibleOrderByPlan[planId]);
    r.totalMedicalAndDrugCostsExcludingDeductibles = r.totalCopays + r.totalCoinsurance + r.totalExpensesNotCovered;
    r.totalMedicalAndDrugCosts = r.totalDeductibles + r.totalCopays + r.totalCoinsurance + r.totalExpensesNotCovered;

    r.totalEmployerOrPlanPaidExcludingFund = r.totalRawExpenses - r.totalMedicalAndDrugCosts;
    _trace("{0} +--------------------------------------------------------------------------------------------------------------", planId);
    _trace("{0} |                                                     total deds + copays +  coins  =  oop costs     add_ps", planId);
    _trace("{0} | total services OOP costs & additional premiums:       {1} {2} {3}  =  {4}   {5}", planId, (r.totalDeductibles > 0 ? formatDollar(r.totalDeductibles, true, true, "") : "-.--").padStart(8), (r.totalCopays > 0 ? formatDollar(r.totalCopays, true, true, "") : "-.--").padStart(8), (r.totalCoinsurance > 0 ? formatDollar(r.totalCoinsurance, true, true, "") : "-.--").padStart(8), (r.totalMedicalAndDrugCosts > 0 ? formatDollar(r.totalMedicalAndDrugCosts, true, true, "") : "-.--").padStart(9), (r.employeeAdditionalServicePremiums > 0 ? formatDollar(r.employeeAdditionalServicePremiums, true, true, "") : "-.--").padStart(8));
    _trace("{0} '--------------------------------------------------------------------------------------------------------------", planId);

    let dsMet = r.deductiblesMet;
    Object.keys(familyAmounts.dedsById).filter(k => familyAmounts.dedsById[k].limitMet).forEach(k => {
      dsMet.family.push(k);
    });
    peopleAmounts.forEach(pa => {
      Object.keys(pa.dedsById).filter(k => pa.dedsById[k].limitMet).forEach(k => {
        dsMet.person.push("".concat(pa.who, "/").concat(k));
      });
    });
    dsMet.count = dsMet.family.length + dsMet.person.length;

    let oopsReached = r.outOfPocketMaximumsReached;
    Object.keys(familyAmounts.oopsById).filter(k => familyAmounts.oopsById[k].maxReached).forEach(k => {
      oopsReached.family.push(k);
    });
    peopleAmounts.forEach(pa => {
      Object.keys(pa.oopsById).filter(k => pa.oopsById[k].maxReached).forEach(k => {
        oopsReached.person.push("".concat(pa.who, "/").concat(k));
      });
    });
    oopsReached.count = oopsReached.family.length + oopsReached.person.length;
    Object.freeze(planServicesResults);
    return planServicesResults;
  };
  me.calculatePlanFunds = function calculatePlanFunds(params, servicesResults, plan, fundRolloverAmount, voluntaryFundContributionAmount, planFundAdditionalMatchAmount, applyFundsToCostOfCareOption, voluntaryFundContributionLimit, planFundAdjustmentAmount) {
    var _plan$fundAllowsContr, _plan$fundContributio;
    let planFundsResults = {
      fundAllowsContributions: (_plan$fundAllowsContr = plan.fundAllowsContributions) !== null && _plan$fundAllowsContr !== void 0 ? _plan$fundAllowsContr : false,
      fundContributionsHaveMatch: (_plan$fundContributio = plan.fundContributionsHaveMatch) !== null && _plan$fundContributio !== void 0 ? _plan$fundContributio : false,
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
      totalCurrentYearFundContributions: 0
    };

    let r = planFundsResults;
    Object.seal(r);
    let regionId = params.regionId,
      statusId = params.statusId,
      coverageLevelId = params.coverageLevelId;
    r.planFundAmountRestrictedPart = me.getPlanFundAmount(plan, regionId, statusId, coverageLevelId, "restricted");
    r.planFundAmountExcludingAdjustment = r.planFundAmountRestrictedPart + me.getPlanFundAmount(plan, regionId, statusId, coverageLevelId);
    r.planFundAmount = r.planFundAmountExcludingAdjustment + planFundAdjustmentAmount;
    r.planFundAndMatchTotal = r.planFundAmount + planFundAdditionalMatchAmount;

    r.planFundAdjustmentAmount = planFundAdjustmentAmount;
    r.planFundAdditionalMatchAmount = planFundAdditionalMatchAmount;
    r.incomingFundRolloverAmount = fundRolloverAmount;
    r.voluntaryFundContributionAmount = voluntaryFundContributionAmount;
    r.voluntaryFundContributionLimit = voluntaryFundContributionLimit;
    r.totalFundAmount = r.planFundAndMatchTotal + voluntaryFundContributionAmount + fundRolloverAmount;
    let restrictedFundAmountRemaining = r.planFundAmountRestrictedPart;
    let unrestrictedFundAmountRemaining = r.planFundAndMatchTotal + fundRolloverAmount + voluntaryFundContributionAmount - r.planFundAmountRestrictedPart;
    if (applyFundsToCostOfCareOption === "applyERCoreFundsOnly") {
      let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
      restrictedFundAmountRemaining -= restrictedFundAmountOffset;
      let unrestrictedFundAmountOffset = min(max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0), r.planFundAmount - r.planFundAmountRestrictedPart);
      unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
      r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

      r.planFundPaid = r.totalFundAmountOffset;
      r.planFundAdditionalMatchPaid = 0;
      r.voluntaryFundPaid = 0;
      r.rolloverFundPaid = 0;
    } else if (applyFundsToCostOfCareOption === "applyERFundsOnly") {
      let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
      restrictedFundAmountRemaining -= restrictedFundAmountOffset;
      let unrestrictedFundAmountOffset = min(max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0), r.planFundAndMatchTotal - r.planFundAmountRestrictedPart);
      unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
      r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

      r.planFundPaid = min(r.totalFundAmountOffset, r.planFundAmount - restrictedFundAmountRemaining);
      r.planFundAdditionalMatchPaid = min(r.totalFundAmountOffset - r.planFundPaid, planFundAdditionalMatchAmount);
      r.voluntaryFundPaid = 0;
      r.rolloverFundPaid = 0;
    } else if (applyFundsToCostOfCareOption === "applyEEFundsOnly") {
      let restrictedFundAmountOffset = 0;
      restrictedFundAmountRemaining -= restrictedFundAmountOffset;
      let unrestrictedFundAmountOffset = min(max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0), fundRolloverAmount + voluntaryFundContributionAmount);
      unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
      r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

      r.planFundPaid = 0;
      r.planFundAdditionalMatchPaid = 0;
      r.voluntaryFundPaid = min(r.totalFundAmountOffset, voluntaryFundContributionAmount);
      r.rolloverFundPaid = r.totalFundAmountOffset - r.voluntaryFundPaid;
    } else if (applyFundsToCostOfCareOption === "applyAllFunds") {
      let restrictedFundAmountOffset = min(servicesResults.totalFundEligibleCostsRestrictedPart, r.planFundAmountRestrictedPart);
      restrictedFundAmountRemaining -= restrictedFundAmountOffset;
      let unrestrictedFundAmountOffset = min(max(servicesResults.totalFundEligibleCosts - restrictedFundAmountOffset, 0), r.planFundAndMatchTotal + fundRolloverAmount + voluntaryFundContributionAmount - r.planFundAmountRestrictedPart);
      unrestrictedFundAmountRemaining -= unrestrictedFundAmountOffset;
      r.totalFundAmountOffset = restrictedFundAmountOffset + unrestrictedFundAmountOffset;

      r.planFundPaid = min(r.totalFundAmountOffset, r.planFundAmount - restrictedFundAmountRemaining);
      r.planFundAdditionalMatchPaid = min(r.totalFundAmountOffset - r.planFundPaid, planFundAdditionalMatchAmount);
      r.voluntaryFundPaid = min(r.totalFundAmountOffset - (r.planFundPaid + r.planFundAdditionalMatchPaid), voluntaryFundContributionAmount);
      r.rolloverFundPaid = r.totalFundAmountOffset - (r.planFundPaid + r.planFundAdditionalMatchPaid + r.voluntaryFundPaid);
    }

    r.planFundAndMatchTotalPaid = r.planFundPaid + r.planFundAdditionalMatchPaid;
    r.planFundAndMatchTotalUnused = r.planFundAndMatchTotal - r.planFundAndMatchTotalPaid;
    r.planFundUnused = r.planFundAmount - r.planFundPaid;
    r.planFundAdditionalMatchUnused = r.planFundAdditionalMatchAmount - r.planFundAdditionalMatchPaid;
    r.totalMedicalAndDrugCostsLessFundOffset = servicesResults.totalMedicalAndDrugCosts - r.totalFundAmountOffset;
    r.fundCarryoverBalance = restrictedFundAmountRemaining + unrestrictedFundAmountRemaining;
    r.fundCarryoverBalanceRestrictedPart = restrictedFundAmountRemaining;
    r.fundCarryoverBalanceUnrestrictedPart = unrestrictedFundAmountRemaining;
    Object.freeze(planFundsResults);
    return planFundsResults;
  };
  me.calculatePlanPremiums = function calculatePlanPremiums(params, coverageLevelCostsPerPlan, employerCoverageLevelCostsPerPlan, premiumAdjustmentObjectOrAmount, employeeAdditionalServicePremiums) {
    var _premiumAdjustmentObj, _premiumAdjustmentObj2, _premiumAdjustmentObj3, _premiumAdjustmentObj4, _employerCoverageLeve;
    let planId = params.planId,
      regionId = params.regionId,
      statusId = params.statusId,
      coverageLevelId = params.coverageLevelId;
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

    let employeePlanPremiumAdjustment = 0,
      employerPlanPremiumAdjustment = 0,
      employeeNamedAmounts = {},
      employerNamedAmounts = {};
    if (!isNullOrUndefined(premiumAdjustmentObjectOrAmount)) {
      switch (typeof premiumAdjustmentObjectOrAmount) {
        case "number":
          employeePlanPremiumAdjustment = premiumAdjustmentObjectOrAmount;
          break;
        case "object":
          employeePlanPremiumAdjustment = (_premiumAdjustmentObj = premiumAdjustmentObjectOrAmount.employee) !== null && _premiumAdjustmentObj !== void 0 ? _premiumAdjustmentObj : 0;
          employerPlanPremiumAdjustment = (_premiumAdjustmentObj2 = premiumAdjustmentObjectOrAmount.employer) !== null && _premiumAdjustmentObj2 !== void 0 ? _premiumAdjustmentObj2 : 0;
          employeeNamedAmounts = (_premiumAdjustmentObj3 = premiumAdjustmentObjectOrAmount.employeeNamedAmounts) !== null && _premiumAdjustmentObj3 !== void 0 ? _premiumAdjustmentObj3 : {};
          employerNamedAmounts = (_premiumAdjustmentObj4 = premiumAdjustmentObjectOrAmount.employerNamedAmounts) !== null && _premiumAdjustmentObj4 !== void 0 ? _premiumAdjustmentObj4 : {};
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

    let eePlanPremiums = coverageLevelCostsPerPlan[planId];
    if (typeof eePlanPremiums[regionId] !== "undefined") {
      var _eePlanPremiums$regio;
      r.totalAnnualPayrollContributionsExcludingAdjustment = (_eePlanPremiums$regio = eePlanPremiums[regionId][coverageLevelId][statusId]) !== null && _eePlanPremiums$regio !== void 0 ? _eePlanPremiums$regio : 0;
    } else {
      var _eePlanPremiums$cover;
      r.totalAnnualPayrollContributionsExcludingAdjustment = (_eePlanPremiums$cover = eePlanPremiums[coverageLevelId][statusId]) !== null && _eePlanPremiums$cover !== void 0 ? _eePlanPremiums$cover : 0;
    }
    r.totalAnnualPayrollContributionsMaybeNegative = r.totalAnnualPayrollContributionsExcludingAdjustment + employeePlanPremiumAdjustment;
    r.totalAnnualPayrollContributions = max(0, r.totalAnnualPayrollContributionsMaybeNegative);

    let erPlanPremiums = (_employerCoverageLeve = employerCoverageLevelCostsPerPlan === null || employerCoverageLevelCostsPerPlan === void 0 ? void 0 : employerCoverageLevelCostsPerPlan[planId]) !== null && _employerCoverageLeve !== void 0 ? _employerCoverageLeve : null;
    if (erPlanPremiums) {
      if (typeof erPlanPremiums[regionId] !== "undefined") {
        var _erPlanPremiums$regio;
        r.employerPlanPremiumExcludingAdjustment = (_erPlanPremiums$regio = erPlanPremiums[regionId][coverageLevelId][statusId]) !== null && _erPlanPremiums$regio !== void 0 ? _erPlanPremiums$regio : 0;
      } else {
        var _erPlanPremiums$cover;
        r.employerPlanPremiumExcludingAdjustment = (_erPlanPremiums$cover = erPlanPremiums[coverageLevelId][statusId]) !== null && _erPlanPremiums$cover !== void 0 ? _erPlanPremiums$cover : 0;
      }
    } else {
      r.employerPlanPremiumExcludingAdjustment = 0;
    }
    r.employerPlanPremiumMaybeNegative = r.employerPlanPremiumExcludingAdjustment + employerPlanPremiumAdjustment;
    r.employerPlanPremium = max(0, r.employerPlanPremiumMaybeNegative);
    Object.freeze(planPremiumsResults);
    return planPremiumsResults;
  };
  me.calculatePlanWorstCaseOopCosts = function calculatePlanWorstCaseOopCosts(params, plan, config, numberOfPeople) {
    let services = config.services,
      planId = params.planId,
      regionId = params.regionId,
      isUnlimited = false,
      basedOn;
    Object.keys(services).every(serviceId => {
      let service = services[serviceId],
        coverages = service.coverage[planId],
        coveragesLength = coverages.length,
        i,
        coverage,
        isLastCoverageEntry,
        basedOnProp;
      for (i = 0; i < coveragesLength; i += 1) {
        coverage = coverages[i];
        isLastCoverageEntry = i === coveragesLength - 1;
        if ("additionalPremium" in coverage && coverage.additionalPremium > 0) {
          basedOnProp = "additionalPremium";
          isUnlimited = true;
        } else if ("coinsuranceNotTowardsOOPMax" in coverage && coverage.coinsuranceNotTowardsOOPMax && coverage.coinsurance > 0) {
          basedOnProp = "coinsuranceNotTowardsOOPMax";
          isUnlimited = true;
        } else if ("copayNotTowardsOOPMax" in coverage && coverage.copayNotTowardsOOPMax && coverage.copay > 0) {
          basedOnProp = "copayNotTowardsOOPMax";
          isUnlimited = true;
        } else if ("notCovered" in coverage && coverage.notCovered) {
          basedOnProp = "notCovered";
          isUnlimited = true;
        } else if (isLastCoverageEntry) {
          if ("coveredCount" in coverage && coverage.coveredCount > 0) {
            basedOnProp = "coveredCount";
            isUnlimited = true;
          } else if ("dollarLimit" in coverage && coverage.dollarLimit > 0) {
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
      return {
        amount: Infinity,
        basedOn
      };
    }

    let combinations = {},
      statusId = params.statusId,
      coverageLevelId = params.coverageLevelId;
    let hasAllChargeTypes = c => isNullOrUndefined(c) || c.includes("deductible") && c.includes("copay") && c.includes("coinsurance");
    ["family", "person"].forEach(type => {
      let outOfPocketMaximumsPropName = type + "OutOfPocketMaximums",
        prefix = type === "person" ? numberOfPeople.toString() + "x_" : "";
      if (outOfPocketMaximumsPropName in plan) {
        let oopMaximums = plan[outOfPocketMaximumsPropName];
        Object.entries(oopMaximums).forEach(_ref12 => {
          let [oopMaxId, oopMaxObj] = _ref12;
          if (!hasAllChargeTypes(oopMaxObj.chargeTypes)) {
            return;
          }
          let categories = oopMaxObj.categories.concat().sort(),
            categoriesSet = new Set(categories),
            csv = categories.join(",");
          let amount = (type === "person" ? numberOfPeople : 1) * me.resolveAmountMapOrAmount(oopMaxObj.amountMap, oopMaxObj.amount, regionId, statusId, coverageLevelId);
          if (!(csv in combinations) || amount < combinations[csv].amount) {
            combinations[csv] = {
              categoriesSet,
              amount,
              from: prefix + oopMaxId
            };
          }
        });
      }
    });

    let madeChange,
      nextCombinations,
      loopCountFailSafe = 0;
    do {
      madeChange = false;
      nextCombinations = Object.assign({}, combinations);
      loopCountFailSafe += 1;
      let keys = Object.keys(combinations);
      for (let i = 0; i < keys.length; i += 1) {
        let oKey = keys[i],
          outerSet = combinations[oKey].categoriesSet;
        for (let j = 0; j < keys.length; j += 1) {
          if (i !== j) {
            let iKey = keys[j],
              innerSet = combinations[iKey].categoriesSet;
            let categoriesSet = innerSet.union(outerSet),
              categories = Array.from(categoriesSet).sort(),
              csv = categories.join(",");
            let amount = combinations[oKey].amount + combinations[iKey].amount;
            if (!(csv in combinations) || amount < combinations[csv].amount) {
              nextCombinations[csv] = {
                categoriesSet,
                amount,
                from: combinations[oKey].from + "," + combinations[iKey].from
              };
              madeChange = true;
            }
          }
        }
      }
      combinations = nextCombinations;
    } while (madeChange && loopCountFailSafe < 100);
    let allCategoriesCsv = config.categoriesOrder.concat().sort().join(","),
      result = {
        amount: Infinity,
        basedOn: "indeterminate"
      };
    if (allCategoriesCsv in combinations) {
      result.amount = combinations[allCategoriesCsv].amount;
      result.basedOn = combinations[allCategoriesCsv].from;
    }
    return result;
  };
  me.determinePrimarySavingsAccountType = function determinePrimarySavingsAccountType(config, fsaeConfig, planId) {
    let result = null;
    if (!isNullOrUndefined(fsaeConfig)) {
      let planConfig = config.plans[planId],
        maybeDualAccountTypeId = planConfig.fsaeAccountTypeId;
      if (!isNullOrUndefined(maybeDualAccountTypeId)) {
        let components = maybeDualAccountTypeId.split("+");
        let primaryAccountTypeId = components[0];
        result = fsaeConfig.accountTypes[primaryAccountTypeId].followRulesFor;
      }
    }
    return result;
  };
  me.calculateSinglePlan = function calculateSinglePlan(config, fsaeConfig, planId, regionId, statusId, coverageLevelId, peopleServices, fundRolloverAmount, voluntaryFundContributionAmount, premiumAdjustmentObjectOrAmount, planFundAdditionalMatchAmount, applyFundsToCostOfCareOption, voluntaryFundContributionLimit, planFundAdjustmentAmount) {
    var _plan$alternateChartS;

    let plan = config.plans[planId],
      servicesResults,
      fundsResults,
      premiumsResults;
    _trace("".concat(planId, " >>========= calculateSinglePlan() called =========="));
    let params = {
      planId,
      planName: plan.description,
      description: plan.description,
      descriptionChart: getDescription(plan, "descriptionChart"),
      descriptionTable: getDescription(plan, "descriptionTable"),
      descriptionSelect: getDescription(plan, "descriptionSelect"),
      descriptionPlanProvisions: getDescription(plan, "descriptionPlanProvisions"),
      fsaeAccountTypeId: plan.fsaeAccountTypeId,
      fsaePrimaryAccountType: me.determinePrimarySavingsAccountType(config, fsaeConfig, planId),
      regionId,
      statusId,
      coverageLevelId,
      coverageLevel: getDescription(config.coverageLevels[coverageLevelId]),
      alternateChartStack: (_plan$alternateChartS = plan.alternateChartStack) !== null && _plan$alternateChartS !== void 0 ? _plan$alternateChartS : false,
      applyFundsToCostOfCareOption
    };
    Object.freeze(params);

    let s = servicesResults = me.calculatePlanServices(params, plan, config.services, config.__engine_servicesWithDeductibleOrderByPlan, config.__engine_servicesNoDeductibleOrderByPlan, config.combinedLimits, peopleServices);

    let f = fundsResults = me.calculatePlanFunds(params, servicesResults, plan, fundRolloverAmount, voluntaryFundContributionAmount, planFundAdditionalMatchAmount, applyFundsToCostOfCareOption, voluntaryFundContributionLimit, planFundAdjustmentAmount);

    let p = premiumsResults = me.calculatePlanPremiums(params, config.coverageLevelCostsPerPlan, config.employerCoverageLevelCostsPerPlan, premiumAdjustmentObjectOrAmount, servicesResults.employeeAdditionalServicePremiums);

    let totalsResults = {
      totalCareAndPayrollContributions: f.totalMedicalAndDrugCostsLessFundOffset + p.totalAnnualPayrollContributions + p.employeeAdditionalServicePremiums,
      employerOrPlanTotalAnnualCosts: s.totalEmployerOrPlanPaidExcludingFund + f.planFundAndMatchTotalPaid + p.employerPlanPremium,
      employeeTotalAnnualCosts: f.totalMedicalAndDrugCostsLessFundOffset + f.voluntaryFundPaid + p.totalAnnualPayrollContributions + p.employeeAdditionalServicePremiums
    };
    totalsResults.totalCosts = totalsResults.employerOrPlanTotalAnnualCosts + totalsResults.employeeTotalAnnualCosts + f.rolloverFundPaid;

    let r = {};
    Object.assign(r, params);
    Object.assign(r, servicesResults);
    Object.assign(r, fundsResults);
    Object.assign(r, premiumsResults);
    Object.assign(r, totalsResults);

    let wcResult = me.calculatePlanWorstCaseOopCosts(params, plan, config, peopleServices.length);
    r.worstCaseEmployeeCosts = wcResult.amount + p.totalAnnualPayrollContributions - r.planFundAmount - r.planFundAdditionalMatchAmount;
    r.worstCaseEmployeeCostsBasedOn = wcResult.basedOn;

    utility.roundResultNumbersToCents(r);

    if (_traceIsOn()) {
      _trace("{0} ***** Results ****", r.planId);
      let entries = Object.entries(r);
      for (let [k, v] of entries) {
        typeof v === "string" && _trace("{0} {1}: \"{2}\"", r.planId, k, r[k]);
      }
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
      for (let [k, v] of entries) {
        typeof v === "number" && _trace("{0} {1}: {2}", r.planId, k, formatDollar(r[k], true, true));
      }
      _trace("{0} <<======== calculateSinglePlan() returning ==========", r.planId);
    }

    return r;
  };
  me.rankPlansByPriorities = function rankPlansByPriorities(config, planResults, planPriority) {

    let rankings = {};

    let plansByEmployeePremiums = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].totalAnnualPayrollContributions
    })).sort((a, b) => a.value - b.value);
    rankings.plansByEmployeePremiums = plansByEmployeePremiums;

    let plansByOutOfPocketCosts = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].totalMedicalAndDrugCostsLessFundOffset + planResults[planId].voluntaryFundPaid
    })).sort((a, b) => a.value - b.value);
    rankings.plansByOutOfPocketCosts = plansByOutOfPocketCosts;

    let plansByEmployeeTotalAnnualCosts = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].employeeTotalAnnualCosts
    })).sort((a, b) => a.value - b.value);
    rankings.plansByEmployeeTotalAnnualCosts = plansByEmployeeTotalAnnualCosts;

    let plansByWorstCaseEmployeeCosts = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].worstCaseEmployeeCosts
    })).sort((a, b) => a.value - b.value);
    rankings.plansByWorstCaseEmployeeCosts = plansByWorstCaseEmployeeCosts;

    let plansByAccessToHSA = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].employeeTotalAnnualCosts,
      "type": planResults[planId].fsaePrimaryAccountType
    })).sort((a, b) => {
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

    let plansByAccessToFSA = planResults.orderedPlanIds.map(planId => ({
      planId,
      "value": planResults[planId].employeeTotalAnnualCosts,
      "type": planResults[planId].fsaePrimaryAccountType
    })).sort((a, b) => {
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

    _trace("calculateImpl() called; args:\n{0}", JSON.stringify(args, null, 2));

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
    let fsaeConfig = args.fsaeConfig;

    if (!config.hasPassedMpceValidation) {
      throw new Error("Config has not passed MPCE validation.");
    }
    let startDateTime = new Date();

    me.maybeMarkupConfig(config);

    if (!(regionId in config.regions)) {
      throw new Error("Unknown regionId ".concat(regionId));
    }
    if (!(statusId in config.statuses)) {
      throw new Error("Unknown statusId ".concat(statusId));
    }
    if (isNullOrUndefined(primary)) {
      throw new Error("Parameter primary must not be null or undefined.");
    }
    if (!Array.isArray(childrenArray)) {
      throw new Error("The childrenArray parameter must be an array of objects. " + "Pass an empty array for no children.");
    }

    let coverageLevelId = me.determineCoverageLevelId(config, spouse, childrenArray);
    let results = {
      orderedPlanIds: []
    };
    let peopleServices = [primary];
    if (!isNullOrUndefined(spouse)) {
      peopleServices.push(spouse);
    }
    peopleServices = peopleServices.concat(childrenArray);
    let region = config.regions[regionId];
    _trace("calculateImpl(): {0} plans: {1}", regionId, region.plans.join(", "));

    region.plans.forEach(planId => {
      var _fundRolloverAmounts$, _voluntaryFundContrib, _voluntaryFundContrib2, _premiumAdjustmentAmo, _planFundAdditionalMa, _planFundAdjustmentAm;
      let fundRolloverAmountForPlan = (_fundRolloverAmounts$ = fundRolloverAmounts === null || fundRolloverAmounts === void 0 ? void 0 : fundRolloverAmounts[planId]) !== null && _fundRolloverAmounts$ !== void 0 ? _fundRolloverAmounts$ : 0;
      let voluntaryFundContributionAmountForPlan = (_voluntaryFundContrib = voluntaryFundContributionAmounts === null || voluntaryFundContributionAmounts === void 0 ? void 0 : voluntaryFundContributionAmounts[planId]) !== null && _voluntaryFundContrib !== void 0 ? _voluntaryFundContrib : 0;
      let voluntaryFundContributionLimitForPlan = (_voluntaryFundContrib2 = voluntaryFundContributionLimits === null || voluntaryFundContributionLimits === void 0 ? void 0 : voluntaryFundContributionLimits[planId]) !== null && _voluntaryFundContrib2 !== void 0 ? _voluntaryFundContrib2 : null;
      let premiumAdjustmentAmountOrObjectForPlan = (_premiumAdjustmentAmo = premiumAdjustmentAmounts === null || premiumAdjustmentAmounts === void 0 ? void 0 : premiumAdjustmentAmounts[planId]) !== null && _premiumAdjustmentAmo !== void 0 ? _premiumAdjustmentAmo : 0;
      let planFundAdditionalMatchAmountForPlan = (_planFundAdditionalMa = planFundAdditionalMatchAmounts === null || planFundAdditionalMatchAmounts === void 0 ? void 0 : planFundAdditionalMatchAmounts[planId]) !== null && _planFundAdditionalMa !== void 0 ? _planFundAdditionalMa : 0;
      let planFundAdjustmentAmountForPlan = (_planFundAdjustmentAm = planFundAdjustmentAmounts === null || planFundAdjustmentAmounts === void 0 ? void 0 : planFundAdjustmentAmounts[planId]) !== null && _planFundAdjustmentAm !== void 0 ? _planFundAdjustmentAm : 0;
      _trace("calculateImpl(): calling calculateSinglePlan() for {0}", planId);
      let singlePlanResult = me.calculateSinglePlan(config, fsaeConfig, planId, regionId, statusId, coverageLevelId, peopleServices, fundRolloverAmountForPlan, voluntaryFundContributionAmountForPlan, premiumAdjustmentAmountOrObjectForPlan, planFundAdditionalMatchAmountForPlan, applyFundsToCostOfCareOption, voluntaryFundContributionLimitForPlan, planFundAdjustmentAmountForPlan);
      results.orderedPlanIds.push(singlePlanResult.planId);
      results[planId] = singlePlanResult;
    });

    let aggregateResults = me.rankPlansByPriorities(config, results, planPriority);

    (function iife() {
      let highestTotalCosts = 0,
        highestEmployeeTotalAnnualCosts = 0,
        highestWorstCaseEmployeeCosts = 0,
        nextHighestWorstCaseEmployeeCosts = 0;
      let bitPlanWithEEPremiums = 0,
        bitPlanWithEEAdditionalServicePremiums = 0,
        bitPlanWithERPremiums = 0,
        bitPlanAllowingEECont = 0,
        bitPlanWithEECont = 0,
        bitPlanWithAppliedEECont = 0,
        bitPlanWithERBaseFundAmount = 0,
        bitPlanAllowingERMatch = 0,
        bitPlanWithERMatchAmount = 0,
        bitPlanWithAppliedERCont = 0,
        bitPlanWithEEGrossOutOfPocketCosts = 0,
        bitPlanWithEENetOutOfPocketCosts = 0,
        bitPlanWithFundsThatCouldHaveBeenApplied = 0,
        bitPlanWithERNonFundCosts = 0,
        bitPlanWithIncomingRollover = 0,
        bitPlanWithAppliedRollover = 0,
        bitPlanWithCarryoverBalance = 0,
        bitPlanWithAlternateChartStack = 0;
      results.orderedPlanIds.forEach(planId => {
        let r = results[planId];
        if (r.totalCosts > highestTotalCosts) {
          highestTotalCosts = r.totalCosts;
        }
        if (r.employeeTotalAnnualCosts > highestEmployeeTotalAnnualCosts) {
          highestEmployeeTotalAnnualCosts = r.employeeTotalAnnualCosts;
        }
        if (r.worstCaseEmployeeCosts > highestWorstCaseEmployeeCosts) {
          if (isFinite(highestWorstCaseEmployeeCosts)) {
            nextHighestWorstCaseEmployeeCosts = highestWorstCaseEmployeeCosts;
          }
          highestWorstCaseEmployeeCosts = r.worstCaseEmployeeCosts;
        } else if (isFinite(r.worstCaseEmployeeCosts) && r.worstCaseEmployeeCosts > nextHighestWorstCaseEmployeeCosts) {
          nextHighestWorstCaseEmployeeCosts = r.worstCaseEmployeeCosts;
        }
        bitPlanWithEEPremiums |= r.totalAnnualPayrollContributions > 0;
        bitPlanWithEEAdditionalServicePremiums |= r.employeeAdditionalServicePremiums > 0;
        bitPlanWithERPremiums |= r.employerPlanPremium > 0;
        bitPlanAllowingEECont |= r.fundAllowsContributions;
        bitPlanWithEECont |= r.voluntaryFundContributionAmount > 0;
        bitPlanWithAppliedEECont |= r.voluntaryFundPaid > 0;
        bitPlanWithERBaseFundAmount |= r.planFundAmount > 0;
        bitPlanAllowingERMatch |= r.fundContributionsHaveMatch;
        bitPlanWithERMatchAmount |= r.planFundAdditionalMatchAmount > 0;
        bitPlanWithAppliedERCont |= r.planFundPaid > 0 || r.planFundAdditionalMatchPaid > 0;
        bitPlanWithEEGrossOutOfPocketCosts |= r.totalMedicalAndDrugCosts > 0;
        bitPlanWithEENetOutOfPocketCosts |= r.totalMedicalAndDrugCostsLessFundOffset > 0;
        bitPlanWithFundsThatCouldHaveBeenApplied |= applyFundsToCostOfCareOption !== "applyAllFunds" && r.totalMedicalAndDrugCostsLessFundOffset > 0 && r.fundCarryoverBalance > 0;
        bitPlanWithERNonFundCosts |= r.totalEmployerOrPlanPaidExcludingFund > 0;
        bitPlanWithIncomingRollover |= r.incomingFundRolloverAmount > 0;
        bitPlanWithAppliedRollover |= r.rolloverFundPaid > 0;
        bitPlanWithCarryoverBalance |= r.fundCarryoverBalance > 0;
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
      aggregateResults.hasPlanWithAppliedFunds = aggregateResults.hasPlanWithAppliedEECont || aggregateResults.hasPlanWithAppliedERCont || aggregateResults.hasPlanWithAppliedRollover;
    })();
    for (let [k, v] of Object.entries(aggregateResults)) {
      _trace("Aggregate: {0}: {1}", k, Array.isArray(v) ? JSON.stringify(v) : v);
    }
    Object.assign(results, aggregateResults);
    let endDateTime = new Date();
    let elapsedMsec = endDateTime.getTime() - startDateTime.getTime();
    results.elapsedMsec = elapsedMsec;
    _trace("calculateImpl() returning; elapsed: {0} msec", elapsedMsec);
    return results;
  };
  me.calculateWithArgs = function calculateWithArgs(config, args, resultsVariantsToInclude) {

    if (isNullOrUndefined(config) || Object.keys(config).length === 0) {
      throw new Error("config must not be null, undefined, or empty");
    }
    if (isNullOrUndefined(args) || Object.keys(args).length === 0) {
      throw new Error("args must not be null, undefined, or empty");
    }

    let results = {};
    let mainArgs = Object.freeze(Object.assign({}, args));
    results.main = me.calculateImpl(config, mainArgs);

    if (Array.isArray(resultsVariantsToInclude) && resultsVariantsToInclude.includes("noEmployeeFunding")) {
      let isTraceOn = _traceIsOn(),
        oldTraceFn = _trace;
      if (isTraceOn) {
        _trace("Disabling MPCE trace function before calculation of noEmployeeFunding result variant.");
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
