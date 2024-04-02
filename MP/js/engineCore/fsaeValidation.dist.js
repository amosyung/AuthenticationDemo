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

  let _trace = trace.categoryWriteLineMaker("fsaeValidation"),
    strFmt = utility.stringFormat;
  class FsaeValidation extends ValidationBase {
    constructor() {
      super();
      this.validFollowRulesForSet = new Set(["HSA", "FSA", "LPFSA"]);
      this.validFilingStatusIds = ["single", "marriedFilingJoint", "marriedFilingSeparate", "headOfHousehold"];
    }
    checkAccountTypes(config) {

      let accountTypesOrder = config.accountTypesOrder,
        accountTypes = config.accountTypes;
      if (!this.checkObjectAndOrderContentsMatch("accountTypes", accountTypes, "accountTypesOrder", accountTypesOrder)) {
        return false;
      }
      let initialErrorCount = this.errors.length;
      accountTypesOrder.forEach(accountTypeId => {
        let accountType = accountTypes[accountTypeId];
        let desc1 = strFmt('accountTypes["{0}"]', accountTypeId);
        if (!this.checkRequiredObject(accountType, desc1)) {
          return;
        }

        this.checkRequiredString(accountType.description, strFmt("{0}.description", desc1));
        this.checkRequiredStringInSet(accountType.followRulesFor, strFmt("{0}.followRulesFor", desc1), this.validFollowRulesForSet);

        Object.entries(accountType).forEach(_ref => {
          let [propName, propValue] = _ref;
          let desc2 = strFmt("{0}.{1}", desc1, propName);
          switch (propName) {
            case "description":
            case "followRulesFor":
              break;
            case "contributionMaximums":
            case "employerMaxMatchAmounts":
              this.checkObjectMapsStringsToNumbers(propValue, desc2);
              break;
            case "contributionMinimum":
            case "contributionMaximum":
            case "employerMatchRate":
            case "employerMaxMatchAmount":
              this.checkOptionalNonNegativeNumber(propValue, desc2);
              break;
            case "maximumExcludesCompanyFunds":
            case "companyFundsDoNotRollOver":
              this.checkOptionalBoolean(propValue, desc2);
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
    checkFederalIncomeTax(config) {

      let federalIncomeTax = config.federalIncomeTax;
      if (!this.checkRequiredObject(federalIncomeTax, "federalIncomeTax")) {
        return false;
      }
      let initialErrorCount = this.errors.length;

      this.checkRequiredObject(federalIncomeTax.brackets, "federalIncomeTax.brackets");
      this.checkRequiredObject(federalIncomeTax.rates, "federalIncomeTax.rates");
      this.checkRequiredObject(federalIncomeTax.standardDeductions, "federalIncomeTax.standardDeductions");
      this.checkRequiredObject(federalIncomeTax.personalExemptions, "federalIncomeTax.personalExemptions");
      this.checkRequiredNumber(federalIncomeTax.dependentExemption, "federalIncomeTax.dependentExemption");

      Object.entries(federalIncomeTax).forEach(_ref2 => {
        let [propName, propValue] = _ref2;
        let desc = strFmt("federalIncomeTax.{0}", propName);
        switch (propName) {
          case "brackets":
          case "rates":
            this.checkObjectAndOrderContentsMatch(desc, propValue, "list of valid filing status ids", this.validFilingStatusIds);
            Object.entries(propValue).forEach(_ref3 => {
              let [filingStatusId, value] = _ref3;
              this.checkRequiredArray(value, strFmt("{0}.{1}", desc, filingStatusId));
            });
            break;
          case "standardDeductions":
          case "personalExemptions":
            this.checkObjectAndOrderContentsMatch(desc, propValue, "list of valid filing status ids", this.validFilingStatusIds);
            Object.entries(propValue).forEach(_ref4 => {
              let [filingStatusId, value] = _ref4;
              this.checkRequiredNumber(value, strFmt("{0}.{1}", desc, filingStatusId));
            });
            break;
          case "dependentExemption":
            break;
          default:
            if (!propName.startsWith("__engine_")) {
              this.addError('federalIncomeTax contains unknown property "{0}".', propName);
            }
            break;
        }
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkFicaPayrollTaxes(config) {

      let ficaPayrollTaxes = config.ficaPayrollTaxes;
      if (!this.checkRequiredObject(ficaPayrollTaxes, "ficaPayrollTaxes")) {
        return false;
      }
      let initialErrorCount = this.errors.length;

      this.checkRequiredNumber(ficaPayrollTaxes.socialSecurityLimit, "ficaPayrollTaxes.socialSecurityLimit");
      this.checkRequiredNumber(ficaPayrollTaxes.socialSecurityRate, "ficaPayrollTaxes.socialSecurityRate");
      this.checkRequiredNumber(ficaPayrollTaxes.medicareRate, "ficaPayrollTaxes.medicareRate");

      Object.keys(ficaPayrollTaxes).forEach(propName => {
        switch (propName) {
          case "socialSecurityLimit":
          case "socialSecurityRate":
          case "medicareRate":
            break;
          default:
            if (!propName.startsWith("__engine_")) {
              this.addError('ficaPayrollTaxes contains unknown property "{0}".', propName);
            }
            break;
        }
      });
      let success = initialErrorCount === this.errors.length;
      return success;
    }
    checkConfig(config, configId, noThrow) {

      _trace("checkConfig() called; configId: {0}, noThrow: {1}{2}", configId, noThrow, typeof noThrow === "undefined" ? " (false)" : "");
      this.clearErrors();
      delete config.hasPassedFsaeValidation;
      this.checkAccountTypes(config);
      this.checkFederalIncomeTax(config);
      this.checkFicaPayrollTaxes(config);
      let success = 0 === this.errors.length;
      if (success) {
        config.hasPassedFsaeValidation = true;
      } else {
        _trace("checkConfig: ".concat(configId, " had validation errors: \n\n... ").concat(this.errors.join("\n... "), "\n\n"));
        !noThrow && this.throwIfErrorsExist(configId);
      }
      _trace("checkConfig() returning success: {0}", success);
      return success;
    }
  }
  let fsaeValidation = new FsaeValidation();
  return fsaeValidation;
});
