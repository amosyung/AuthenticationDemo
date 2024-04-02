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

define(["utility", "trace", "ValidationBase", "corejs"], (utility, trace, ValidationBase) => {
  "use strict";

  let _trace = trace.categoryWriteLineMaker("mpceValidation");
  let strFmt = utility.stringFormat,
    isNullOrUndefined = utility.isNullOrUndefined;
  const adjustmentAnswerPermittedIdFuncs = [
  (config, id) => id === "otherPlans" || config.plans && id in config.plans, (config, id) => id === "otherRegions" || config.regions && id in config.regions, (config, id) => id === "otherCoverageLevels" || config.coverageLevels && id in config.coverageLevels, (config, id) => id === "otherStatuses" || config.statuses && id in config.statuses];
  class MpceValidation extends ValidationBase {
    constructor() {
      super();
      this.validChargeTypeSet = new Set(["deductible", "copay", "coinsurance"]);
      this.validCategoriesFundEligibilitySet = new Set(["noFunds", "allFunds", "nonRestrictedFunds"]);
      this.validDeductibleSet = new Set(["none", "beforeCopay", "afterCopay", "beforeCoinsurance"]);
    }
    checkRegions(config) {

      let initialErrorCount = this.errors.length,
        regions = config.regions,
        regionsOrder = config.regionsOrder,
        plans = config.plans;
      if (!this.checkObjectAndOrderContentsMatch("regions", regions, "regionsOrder", regionsOrder)) {
        return false;
      }
      if (this.checkRequiredString(config.regionsDefaultId, "regionsDefaultId")) {
        if (!(config.regionsDefaultId in regions)) {
          this.addError('regionsDefaultId refers to unknown region id "{0}".', config.regionsDefaultId);
        }
      }
      regionsOrder.forEach(regionId => {
        let region = regions[regionId];
        let desc1 = strFmt('regions["{0}"]', regionId);
        if (!this.checkRequiredObject(region, desc1)) {
          return;
        }

        this.checkRequiredString(region.description, strFmt("{0}.description", desc1));
        if (this.checkRequiredArray(region.plans, strFmt("{0}.plans", desc1))) {
          region.plans.forEach(planId => {
            if (plans && !(planId in plans)) {
              this.addError('{0}.plans refers to unknown plan id "{1}".', desc1, planId);
            }
          });
        }

        Object.keys(region).forEach(propName => {
          switch (propName) {
            case "description":
            case "plans":
              break;
            default:
              if (!propName.startsWith("__engine_")) {
                this.addError('{0} contains unknown property "{1}".', desc1, propName);
              }
              break;
          }
        });
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkDeductiblesObject(config, obj, descBase) {

      let initialErrorCount = this.errors.length,
        hasGeneralGroup = false,
        categories = config.categories,
        categoriesMentioned = {},
        coverageLevels = config.coverageLevels,
        coverageLevelsOrder = config.coverageLevelsOrder,
        regions = config.regions,
        statuses = config.statuses;
      Object.entries(obj).forEach(_ref => {
        let [groupName, objForGroupName] = _ref;
        let desc1 = strFmt('{0}["{1}"]', descBase, groupName),
          isGeneralGroup = groupName === "general",
          hasAmount = false,
          hasAmountMap = false;
        hasGeneralGroup = isGeneralGroup || hasGeneralGroup;
        if (!this.checkRequiredObject(objForGroupName, desc1)) {
          return;
        }

        if (isGeneralGroup) {
          if (typeof objForGroupName.categories !== "undefined") {
            this.addError('{0} can\'t have a categories property; group id "general" catches all else.', desc1);
          }
        } else if (this.checkRequiredArray(objForGroupName.categories, strFmt("{0}.categories", desc1))) {
          if (categories) {
            objForGroupName.categories.forEach(categoryId => {
              if (!(categoryId in categories)) {
                this.addError('{0}.categories refers to unknown category id "{1}".', desc1, categoryId);
              } else if (typeof categoriesMentioned[categoryId] !== "undefined") {
                this.addError('{0}.categories refers to category id "{1}" already used' + ' by group id "{2}".', desc1, categoryId, categoriesMentioned[categoryId]);
              } else {
                categoriesMentioned[categoryId] = groupName;
              }
            });
          }
        }

        Object.entries(objForGroupName).forEach(_ref2 => {
          let [propName, propValue] = _ref2;
          let desc2 = strFmt("{0}.{1}", desc1, propName);
          switch (propName) {
            case "categories":
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
                  Object.keys(amountMap).forEach(amountMapId => {
                    if (amountMapId in coverageLevels) {
                      let coverageLevelId = amountMapId;
                      this.checkRequiredNumber(amountMap[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
                    } else if (amountMapId in regions || amountMapId in statuses) {
                      this.checkObjectAndOrderContentsMatch(strFmt('{0}["{1}"]', desc2, amountMapId), amountMap[amountMapId], "coverageLevelsOrder", coverageLevelsOrder);
                      Object.entries(amountMap[amountMapId]).forEach(_ref3 => {
                        let [coverageLevelId, value] = _ref3;
                        this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
                      });
                    } else {
                      this.addError('{0} contains an id "{1}" that is neither a ' + "coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkOutOfPocketMaximumsObject(config, obj, descBase, categoriesNotYetMentioned) {

      let initialErrorCount = this.errors.length,
        categories = config.categories,
        coverageLevels = config.coverageLevels,
        coverageLevelsOrder = config.coverageLevelsOrder,
        regions = config.regions,
        statuses = config.statuses;
      Object.entries(obj).forEach(_ref4 => {
        let [groupName, objForGroupName] = _ref4;
        let desc1 = strFmt('{0}["{1}"]', descBase, groupName);
        if (!this.checkRequiredObject(objForGroupName, desc1)) {
          return;
        }
        let hasAmount = false,
          hasAmountMap = false;

        if (this.checkRequiredArray(objForGroupName.categories, strFmt("{0}.categories", desc1))) {
          if (objForGroupName.categories.length === 0) {
            this.addError("{0}.categories must contain at least one category.", desc1);
          }
          if (categories) {
            objForGroupName.categories.forEach(categoryId => {
              if (!(categoryId in categories)) {
                this.addError('{0}.categories refers to unknown category id "{1}".', desc1, categoryId);
              } else {
                categoriesNotYetMentioned.delete(categoryId);
              }
            });
          }
        }

        Object.entries(objForGroupName).forEach(_ref5 => {
          let [propName, propValue] = _ref5;
          let desc2 = strFmt("{0}.{1}", desc1, propName);
          switch (propName) {
            case "categories":
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
                  Object.keys(amountMap).forEach(amountMapId => {
                    if (amountMapId in coverageLevels) {
                      let coverageLevelId = amountMapId;
                      this.checkRequiredNumber(amountMap[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
                    } else if (amountMapId in regions || amountMapId in statuses) {
                      this.checkObjectAndOrderContentsMatch(strFmt('{0}["{1}"]', desc2, amountMapId), amountMap[amountMapId], "coverageLevelsOrder", coverageLevelsOrder);
                      Object.entries(amountMap[amountMapId]).forEach(_ref6 => {
                        let [coverageLevelId, value] = _ref6;
                        this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
                      });
                    } else {
                      this.addError('{0} contains an id "{1}" that is neither a ' + "coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkPlans(config) {

      let plans = config.plans,
        plansOrder = config.plansOrder;
      if (!this.checkObjectAndOrderContentsMatch("plans", plans, "plansOrder", plansOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length,
        hasCostsObjectId,
        costsObjectId,
        costsObjectIds = {},
        requiringCategoriesFundEligibility,
        hasCategoriesFundEligibility,
        categories = config.categories,
        coverageLevelsOrder = config.coverageLevelsOrder,
        coverageLevels = config.coverageLevels,
        regions = config.regions,
        statuses = config.statuses,
        services = config.services;
      plansOrder.forEach(planId => {
        let plan = plans[planId];
        let desc1 = strFmt('plans["{0}"]', planId);
        hasCostsObjectId = false;
        requiringCategoriesFundEligibility = [];
        hasCategoriesFundEligibility = false;
        if (!this.checkRequiredObject(plan, desc1)) {
          return;
        }
        let categoriesNotMentionedInOopMaxObjects = new Set(config.categoriesOrder ? config.categoriesOrder.slice(0) : []);

        this.checkRequiredString(plan.description, strFmt("{0}.description", desc1));

        Object.entries(plan).forEach(_ref7 => {
          let [propName, propValue] = _ref7;
          let desc2 = strFmt("{0}.{1}", desc1, propName);
          switch (propName) {
            case "description":
              break;
            case "descriptionChart":
            case "descriptionTable":
            case "descriptionSelect":
            case "descriptionPlanProvisions":
              this.checkOptionalString(propValue, desc2);
              break;
            case "deductiblesDescription":
            case "outOfPocketMaximumsDescription":
            case "fundAmountsDescription":
            case "fundMatchDescription":
              this.checkOptionalString(propValue, desc2);
              break;
            case "fsaeAccountTypeId":
              this.checkOptionalString(propValue, desc2);
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
                Object.keys(propValue).forEach(amountMapId => {
                  if (amountMapId in coverageLevels) {
                    let coverageLevelId = amountMapId;
                    this.checkRequiredNumber(propValue[coverageLevelId], strFmt('{0}["{1}"]', desc2, coverageLevelId));
                  } else if (amountMapId in regions || amountMapId in statuses) {
                    this.checkObjectAndOrderContentsMatch(strFmt('{0}["{1}"]', desc2, amountMapId), propValue[amountMapId], "coverageLevelsOrder", coverageLevelsOrder);
                    Object.entries(propValue[amountMapId]).forEach(_ref8 => {
                      let [coverageLevelId, value] = _ref8;
                      this.checkRequiredNumber(value, strFmt('{0}["{1}"]["{2}"]', desc2, amountMapId, coverageLevelId));
                    });
                  } else {
                    this.addError('{0} contains an id "{1}" that is neither a ' + "coverageLevelId nor a regionId nor a statusId.", desc2, amountMapId);
                  }
                });
              }
              break;
            case "categoriesFundEligibility":
              hasCategoriesFundEligibility = true;
              if (this.checkOptionalObject(propValue, desc2) && propValue) {
                Object.entries(propValue).forEach(_ref9 => {
                  let [categoryId, value] = _ref9;
                  if (categories && !(categoryId in categories)) {
                    this.addError('{0} refers to unknown category id "{1}".', desc2, categoryId);
                  } else {
                    this.checkRequiredStringInSet(value, strFmt('{0}["{1}"]', desc2, categoryId), this.validCategoriesFundEligibilitySet);
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
                if (propValue !== "costs" && !/^costs_/.test(propValue)) {
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

        costsObjectIds[hasCostsObjectId ? costsObjectId : "costs"] = true;
        if (requiringCategoriesFundEligibility.length > 0 && !hasCategoriesFundEligibility) {
          this.addError("{0} has properties configured ({1}) that also require categoriesFundEligibility.", desc1, requiringCategoriesFundEligibility.join(", "));
        }
        if (categoriesNotMentionedInOopMaxObjects.size > 0) {
          this.addError("{0} must mention {1} {2} in at least one out-of-pocket maximum object's categories.", desc1, categoriesNotMentionedInOopMaxObjects.size > 1 ? "categories" : "category", categoriesNotMentionedInOopMaxObjects.map(v => "\"".concat(v, "\"")).join(", "));
        }
      });

      if (services) {
        let servicesKeys = Object.keys(services);
        Object.keys(costsObjectIds).forEach(costsObjId => {
          servicesKeys.forEach(serviceId => {
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkStatuses(config) {

      let initialErrorCount = this.errors.length,
        statuses = config.statuses,
        statusesOrder = config.statusesOrder;
      if (!this.checkObjectAndOrderContentsMatch("statuses", statuses, "statusesOrder", statusesOrder)) {
        return false;
      }
      if (this.checkRequiredString(config.statusesDefaultId, "statusesDefaultId")) {
        if (!(config.statusesDefaultId in statuses)) {
          this.addError('statusesDefaultId refers to unknown status id "{0}".', config.statusesDefaultId);
        }
      }
      statusesOrder.forEach(statusId => {
        let status = statuses[statusId];
        let desc1 = strFmt('statuses["{0}"]', statusId);
        if (!this.checkRequiredObject(status, desc1)) {
          return;
        }

        this.checkRequiredString(status.description, strFmt("{0}.description", desc1));

        Object.keys(status).forEach(propName => {
          if (propName !== "description") {
            if (!propName.startsWith("__engine_")) {
              this.addError('{0} contains unknown property "{1}".', desc1, propName);
            }
          }
        });
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkCoverageLevels(config) {

      let coverageLevels = config.coverageLevels,
        coverageLevelsOrder = config.coverageLevelsOrder;
      if (!this.checkObjectAndOrderContentsMatch("coverageLevels", coverageLevels, "coverageLevelsOrder", coverageLevelsOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length;
      coverageLevelsOrder.forEach(coverageLevelId => {
        let coverageLevel = coverageLevels[coverageLevelId];
        let desc1 = strFmt('coverageLevels["{0}"]', coverageLevelId);
        if (!this.checkRequiredObject(coverageLevel, desc1)) {
          return;
        }

        this.checkRequiredString(coverageLevel.description, strFmt("{0}.description", desc1));
        this.checkRequiredBoolean(coverageLevel.spouse, strFmt("{0}.spouse", desc1));
        this.checkRequiredNumber(coverageLevel.maxNumChildren, strFmt("{0}.maxNumChildren", desc1));

        Object.keys(coverageLevel).forEach(propName => {
          switch (propName) {
            case "description":
            case "spouse":
            case "maxNumChildren":
              break;
            default:
              if (!propName.startsWith("__engine_")) {
                this.addError('{0} contains unknown property "{1}".', desc1, propName);
              }
              break;
          }
        });
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkMapsStatusIdsToAmountsOrNulls(config, obj, descBase) {

      let statusesOrder = config.statusesOrder;
      if (!this.checkObjectAndOrderContentsMatch(descBase, obj, "statusesOrder", statusesOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length;
      statusesOrder.forEach(statusId => {
        let value = obj[statusId];
        if (typeof value === "string") {
          if (value === statusId) {
            this.addError('{0}["{1}"] cannot reference itself as a shortcut.', descBase, statusId);
          } else if (value in obj) {
            let otherPropValue = obj[value];
            if (typeof otherPropValue === "number" || otherPropValue === null) {
              obj[statusId] = otherPropValue;
            } else if (typeof otherPropValue === "string") {
              this.addError('{0}["{1}"] referenced by "{2}" at same level must be a number or null if n/a; ' + "cannot be another shortcut, since it appears later in statusesOrder.", descBase, value, statusId);
            } else {
              this.addError('{0}["{1}"] referenced by "{2}" at same level must be a number or null if n/a', descBase, value, statusId);
            }
          } else {
            this.addError('{0}["{1}"] maps to string "{2}" which is not a valid shortcut to a same-level id.', descBase, statusId, value);
          }
        } else if (typeof value !== "number" && value !== null) {
          this.addError('{0}["{1}"] must be a number, another statusId, or null if n/a.', descBase, statusId);
        }
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkAndProcessCoverageLevelCostsPerPlan(config, costsConfigPropName) {

      let plansOrder = config.plansOrder,
        costsObj = config[costsConfigPropName];
      if (!this.checkObjectAndOrderContentsMatch(costsConfigPropName, costsObj, "plansOrder", plansOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length,
        regions = config.regions,
        coverageLevels = config.coverageLevels,
        coverageLevelsOrder = config.coverageLevelsOrder;
      plansOrder.forEach(planId => {
        let desc1 = strFmt('{0}["{1}"]', costsConfigPropName, planId);
        let propValue1 = costsObj[planId];
        if (!this.checkRequiredType(propValue1, desc1, ["object", "string"])) {
          return;
        }
        if (typeof propValue1 === "string") {
          let otherPropValue = costsObj[propValue1];
          if (this.checkRequiredObject(otherPropValue, strFmt('{0}["{1}"] referenced by shortcut', costsConfigPropName, propValue1))) {
            costsObj[planId] = otherPropValue;
          }
          return;
        }
        Object.entries(propValue1).forEach(_ref10 => {
          let [coverageLevelOrRegionId, propValue2] = _ref10;
          let desc2 = strFmt('{0}["{1}"]', desc1, coverageLevelOrRegionId);
          if (!this.checkRequiredType(propValue2, desc2, ["object", "string"])) {
            return;
          }
          if (typeof propValue2 === "string") {
            let otherPropValue = propValue1[propValue2];
            if (this.checkRequiredObject(otherPropValue, strFmt('{0}["{1}"]["{2}"] referenced by shortcut', costsConfigPropName, planId, propValue2))) {
              propValue1[coverageLevelOrRegionId] = otherPropValue;
            }
            return;
          }
          if (regions && coverageLevelOrRegionId in regions) {
            this.checkObjectAndOrderContentsMatch(desc2, propValue2, "coverageLevelsOrder", coverageLevelsOrder);
            Object.entries(propValue2).forEach(_ref11 => {
              let [coverageLevelId, propValue3] = _ref11;
              if (typeof propValue3 === "string") {
                let otherPropValue = propValue2[propValue3];
                if (this.checkRequiredObject(otherPropValue, strFmt('{0}["{1}"] referenced by shortcut', desc2, coverageLevelId))) {
                  propValue2[coverageLevelId] = otherPropValue;
                }
                return;
              }
              let desc3 = strFmt('{0}["{1}"]', desc2, coverageLevelId);
              this.checkMapsStatusIdsToAmountsOrNulls(config, propValue2[coverageLevelId], desc3);
            });
          } else {
            if (coverageLevels && !(coverageLevelOrRegionId in coverageLevels)) {
              this.addError('{0}["{1}"] contains id "{2}" not found in regions or coverageLevels.', costsConfigPropName, planId, coverageLevelOrRegionId);
              return;
            }
            if (typeof propValue2 === "string") {
              let otherPropValue = propValue1[propValue2];
              if (this.checkRequiredObject(otherPropValue, strFmt('{0}["{1}"]["{2}"] referenced by shortcut', costsConfigPropName, planId, propValue2))) {
                propValue1[coverageLevelOrRegionId] = otherPropValue;
              }
              return;
            }
            desc2 = strFmt('{0}["{1}"]', desc1, coverageLevelOrRegionId);
            this.checkMapsStatusIdsToAmountsOrNulls(config, propValue2, desc2);
          }
        });
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    static permittedIdForLevel(config, permittedIdFuncs, id) {
      let levelWherePermitted = 0,
        permitted = false;
      permittedIdFuncs.some(permittedIdFunc => {
        permitted = permittedIdFunc(config, id);
        levelWherePermitted += 1;
        return permitted;
      });
      levelWherePermitted = permitted ? levelWherePermitted : 0;
      return levelWherePermitted;
    }
    checkInAdjustmentAnswer(config, obj, objPropName, permittedIdFuncs) {
      Object.entries(obj).forEach(_ref12 => {
        let [id, value] = _ref12;
        let permittedIdLevel = MpceValidation.permittedIdForLevel(config, permittedIdFuncs, id);
        if (permittedIdLevel > 0) {
          let desc = strFmt('{0}["{1}"]', objPropName, id);
          if (this.checkRequiredType(value, desc, ["object", "string", "number"])) {
            if (typeof value === "object") {
              this.checkInAdjustmentAnswer(config, value, desc, permittedIdFuncs.slice(permittedIdLevel));
            }
            if (typeof value === "string") {
              if (value in obj && id !== value) {
                obj[id] = obj[value];
              } else {
                this.addError('"{0}" maps to string "{1}" which is not a valid shortcut to a same-level id in {2}', id, value, objPropName);
              }
            }
          }
        } else {
          this.addError('"{0}" is not a valid next inner level id in {1}.', id, objPropName);
        }
      });
    }
    checkSingleAdjustmentObject(config, adjustmentId) {
      if (!(adjustmentId in config.adjustments)) {
        this.addError('adjustmentsOrder refers to object "{0}" not found in adjustments.', adjustmentId);
        return false;
      }
      let initialErrorCount = this.errors.length,
        descBase = strFmt('adjustments["{0}"]', adjustmentId);
      let adjustment = config.adjustments[adjustmentId],
        plans = config.plans;
      if (this.checkRequiredObject(adjustment, descBase)) {
        this.checkRequiredString(adjustment.label, strFmt("{0}.label", descBase));

        Object.entries(adjustment).forEach(_ref13 => {
          let [propName, propValue] = _ref13;
          let desc1 = strFmt("{0}.{1}", descBase, propName);
          switch (propName) {
            case "label":
              break;
            case "description":
              this.checkOptionalString(propValue, desc1);
              break;
            case "descriptionsByPlan":
              if (this.checkOptionalObject(propValue, desc1)) {
                Object.entries(propValue).forEach(_ref14 => {
                  let [planId, value] = _ref14;
                  if (plans && !(planId in plans)) {
                    this.addError('{0} refers to unknown plan id "{1}".', desc1, planId);
                  }
                  this.checkRequiredString(value, strFmt('{0}["{1}"]', desc1, planId));
                });
              }
              break;
            case "answersToAmount":
              if (this.checkRequiredObject(propValue, desc1)) {
                Object.entries(propValue).forEach(_ref15 => {
                  let [adjustmentAnswer, value] = _ref15;
                  let desc2 = strFmt('{0}["{1}"]', desc1, adjustmentAnswer);
                  if (this.checkRequiredType(value, desc2, ["object", "string", "number"])) {
                    if (typeof value === "object") {
                      this.checkInAdjustmentAnswer(config, propValue[adjustmentAnswer], desc2, adjustmentAnswerPermittedIdFuncs);
                    } else if (typeof value === "string") {
                      if (value in propValue && adjustmentAnswer !== value) {
                        propValue[adjustmentAnswer] = propValue[value];
                      } else {
                        this.addError('"{0}" maps to string "{1}" which is not a valid shortcut to a same-level id in {2}.', desc2, adjustmentAnswer, value, desc2);
                      }
                    }
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkAdjustments(config) {

      let initialErrorCount = this.errors.length;

      if ("adjustmentObjectKeys" in config) {
        this.addError("config.adjustmentObjectKeys with top-level adjustment objects no longer supported. " + "Use config.adjustments and config.adjustmentsOrder instead.");
      }
      let adjustments = config.adjustments,
        adjustmentsOrder = config.adjustmentsOrder;
      if (!this.checkObjectAndOrderContentsMatch("adjustments", adjustments, "adjustmentsOrder", adjustmentsOrder)) {
        return false;
      }
      if (this.checkRequiredArray(adjustmentsOrder, "adjustmentsOrder")) {
        adjustmentsOrder.forEach((adjustmentId, index) => {
          let desc = strFmt("adjustmentsOrder[{0}]", index);
          if (this.checkRequiredString(adjustmentId, desc)) {
            this.checkSingleAdjustmentObject(config, adjustmentId);
          }
        });
      }
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkServicePlanCoverageObject(config, obj, descBase) {

      let initialErrorCount = this.errors.length,
        hasAtLeastOneProperty,
        hasCopay,
        hasCoveredCount,
        hasDollarLimit;
      if (this.checkRequiredObject(obj, descBase)) {
        hasAtLeastOneProperty = false;
        hasCopay = false;
        hasCoveredCount = false;
        hasDollarLimit = false;
        Object.entries(obj).forEach(_ref16 => {
          let [propName, propValue] = _ref16;
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkServices(config) {

      let services = config.services;
      if (!this.checkRequiredObject(services, "services")) {
        return false;
      }
      let initialErrorCount = this.errors.length,
        regions = config.regions;
      Object.entries(services).forEach(_ref17 => {
        let [serviceId, service] = _ref17;
        let desc1 = strFmt('services["{0}"]', serviceId);
        if (!this.checkRequiredObject(service, desc1)) {
          return;
        }

        this.checkRequiredString(service.description, strFmt("{0}.description", desc1));
        let desc2 = strFmt("{0}.coverage", desc1);
        if (this.checkRequiredObject(service.coverage, desc2)) {
          if (this.checkObjectAndOrderContentsMatch(desc2, service.coverage, "plansOrder", config.plansOrder)) {
            Object.entries(service.coverage).forEach(_ref18 => {
              let [planId, servicePlanCoverage] = _ref18;
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

        Object.entries(service).forEach(_ref19 => {
          let [propName, propValue] = _ref19;
          let desc3 = strFmt("{0}.{1}", desc1, propName);
          switch (propName) {
            case "description":
            case "coverage":
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
              if (this.checkOptionalObject(propValue, desc3)) {
                Object.keys(service[propName]).forEach(regionId => {
                  let desc4 = strFmt('{0}["{1}"]', desc3, regionId);
                  this.checkRequiredType(propValue[regionId], desc4, propName === "costs" ? "number" : "string");
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
              if (/^costs_/.test(propName)) {
                if (this.checkOptionalObject(propValue, desc3)) {
                  Object.keys(service[propName]).forEach(regionId => {
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkCombinedLimits(config) {

      let combinedLimits = config.combinedLimits;
      if (!this.checkOptionalObject(combinedLimits, "combinedLimits")) {
        return false;
      }
      if (isNullOrUndefined(combinedLimits)) {
        return true;
      }
      let initialErrorCount = this.errors.length;
      Object.entries(combinedLimits).forEach(_ref20 => {
        let [combinedLimitId, combinedLimit] = _ref20;
        if (!this.checkRequiredObject(combinedLimit, strFmt('combinedLimits["{0}"]', combinedLimitId))) {
          return;
        }

        this.checkRequiredString(combinedLimit.description, strFmt('combinedLimits["{0}"].description', combinedLimitId));

        Object.entries(combinedLimit).forEach(_ref21 => {
          let [propName, propValue] = _ref21;
          let desc1 = strFmt('combinedLimits["{0}"].{1}', combinedLimitId, propName);
          switch (propName) {
            case "description":
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkCategories(config) {

      let categories = config.categories,
        categoriesOrder = config.categoriesOrder;
      if (!this.checkObjectAndOrderContentsMatch("categories", categories, "categoriesOrder", categoriesOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length;
      let allCategoryContents = [];
      categoriesOrder.forEach(categoryId => {
        let category = categories[categoryId];
        if (!this.checkRequiredObject(category, strFmt('categories["{0}"]', categoryId))) {
          return;
        }

        this.checkRequiredString(category.description, strFmt('categories["{0}"].description', categoryId));
        if (this.checkRequiredArray(category.orderedContents, strFmt('categories["{0}"].orderedContents', categoryId))) {
          allCategoryContents = allCategoryContents.concat(category.orderedContents);
        }

        Object.keys(category).forEach(propName => {
          switch (propName) {
            case "description":
            case "orderedContents":
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
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkUsageCategories(config) {

      let usageCategories = config.usageCategories,
        usageCategoriesOrder = config.usageCategoriesOrder;
      if (!this.checkObjectAndOrderContentsMatch("usageCategories", usageCategories, "usageCategoriesOrder", usageCategoriesOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length,
        services = config.services;
      usageCategoriesOrder.forEach(usageCategoryId => {
        let usageCategory = usageCategories[usageCategoryId];
        let desc1 = strFmt('usageCategories["{0}"]', usageCategoryId);
        if (!this.checkRequiredObject(usageCategory, desc1)) {
          return;
        }

        this.checkRequiredString(usageCategory.name, strFmt("{0}.name", desc1));
        this.checkRequiredString(usageCategory.description, strFmt("{0}.description", desc1));
        this.checkObjectAndOrderContentsMatch("options", usageCategory.options, "optionsOrder", usageCategory.optionsOrder);
        if (this.checkRequiredObject(usageCategory.options, strFmt("{0}.options", desc1))) {
          Object.entries(usageCategory.options).forEach(_ref22 => {
            let [optionId, option] = _ref22;
            let desc2 = strFmt('{0}.options["{1}"]', desc1, optionId);
            this.checkRequiredString(option.description, strFmt("{0}.description", desc2));
            if (this.checkRequiredObject(option.contents, strFmt("{0}.contents", desc2))) {
              Object.entries(option.contents).forEach(_ref23 => {
                let [serviceId, value] = _ref23;
                if (services && !(serviceId in services)) {
                  this.addError('{0}.contents refers to unknown service id "{1}".', desc2, serviceId);
                }
                this.checkRequiredNumber(value, strFmt('{0}.contents["{1}"]', desc2, serviceId));
              });
            }
          });
        }

        Object.entries(usageCategory).forEach(_ref24 => {
          var _usageCategory$simpli, _usageCategory$detail;
          let [propName, propValue] = _ref24;
          let desc3 = strFmt("{0}.{1}", desc1, propName);
          let optionSetToCheck,
            validOptions = new Set(usageCategory.optionsOrder);
          let simplifiedModelingOptions = new Set((_usageCategory$simpli = usageCategory.simplifiedModelingOptionsOrder) !== null && _usageCategory$simpli !== void 0 ? _usageCategory$simpli : usageCategory.optionsOrder);
          let detailedModelingOptions = new Set((_usageCategory$detail = usageCategory.detailedModelingOptionsOrder) !== null && _usageCategory$detail !== void 0 ? _usageCategory$detail : usageCategory.optionsOrder);
          switch (propName) {
            case "name":
            case "description":
            case "optionsOrder":
            case "options":
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

      config.disabledUsageCategoriesOrder = usageCategoriesOrder.filter(usageCategoryId => usageCategories[usageCategoryId].disabled);
      config.enabledUsageCategoriesOrder = usageCategoriesOrder.filter(usageCategoryId => !usageCategories[usageCategoryId].disabled);
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkAndProcessConfig(config, configId, noThrow) {

      _trace("checkAndProcessConfig() called; configId: {0}, noThrow: {1}{2}", configId, noThrow, typeof noThrow === "undefined" ? " (false)" : "");
      this.clearErrors();
      delete config.hasPassedMpceValidation;
      this.checkOptionalString(config.configId, "configId");
      this.checkRegions(config);
      this.checkPlans(config);
      this.checkStatuses(config);
      this.checkCoverageLevels(config);
      this.checkAndProcessCoverageLevelCostsPerPlan(config, "coverageLevelCostsPerPlan");
      if ("employerCoverageLevelCostsPerPlan" in config && !isNullOrUndefined(config.employerCoverageLevelCostsPerPlan)) {
        this.checkAndProcessCoverageLevelCostsPerPlan(config, "employerCoverageLevelCostsPerPlan");
      }
      this.checkAdjustments(config);
      this.checkServices(config);
      this.checkCombinedLimits(config);
      this.checkCategories(config);
      this.checkUsageCategories(config);
      let success = 0 === this.errors.length;
      if (success) {
        config.hasPassedMpceValidation = true;
      } else {
        _trace("checkAndProcessConfig: ".concat(configId, " had validation errors: \n\n... ").concat(this.errors.join("\n... "), "\n\n"));
        !noThrow && this.throwIfErrorsExist(configId);
      }
      _trace("checkAndProcessConfig() returning success: {0}", success);
      return success;
    }
  }
  let mpceValidation = new MpceValidation();
  return mpceValidation;
});
