//-------------------------------------------------------------------------------------------------
// fsaeValidation.src.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the FSAE_VALIDATION.checkConfig() method (and supporting methods) used to validate an
// FSAE configuration object.  While this validation logic is kept separate from the actual FSAE
// engine, this and the engine ought to be maintained together when configuration schema changes.
//
// NOTE: While the checks performed are numerous and detailed, please do not assume that these
// checks are exhaustive or constitute a substitute for more detailed testing or review.
//

define(["utility", "trace", "ValidationBase", "corejs"],
(utility, trace, ValidationBase) => {
"use strict";

let _trace = trace.categoryWriteLineMaker("fsaeValidation"), strFmt = utility.stringFormat;

class FsaeValidation extends ValidationBase {

	constructor() {
		super();
		this.validFollowRulesForSet = new Set(["HSA", "FSA", "LPFSA"]);
		this.validFilingStatusIds = ["single", "marriedFilingJoint", "marriedFilingSeparate", "headOfHousehold"];
	}

	checkAccountTypes(config) {
		///	<summary>
		///	Checks the "accountTypes" and "accountTypesOrder" properties, and related configuration, for
		/// consistency and expected structure.
		///	</summary>
		/// <param name="config" type="Object">The FSAE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let accountTypesOrder = config.accountTypesOrder, accountTypes = config.accountTypes;

		if (!this.checkObjectAndOrderContentsMatch("accountTypes", accountTypes, "accountTypesOrder", accountTypesOrder)) {
			return false;
		}

		let initialErrorCount = this.errors.length;

		accountTypesOrder.forEach((accountTypeId) => {
			let accountType = accountTypes[accountTypeId];
			let desc1 = strFmt('accountTypes["{0}"]', accountTypeId);
			if (!this.checkRequiredObject(accountType, desc1)) { return; }

			// First, check required properties.
			this.checkRequiredString(accountType.description, strFmt("{0}.description", desc1));
			this.checkRequiredStringInSet(accountType.followRulesFor, strFmt("{0}.followRulesFor", desc1), this.validFollowRulesForSet);

			// Next, check optional and unknown properties.
			Object.entries(accountType).forEach(([propName, propValue]) => {
				let desc2 = strFmt("{0}.{1}", desc1, propName);

				switch (propName) {
					case "description":
					case "followRulesFor":
						// Required; checked above.
						break;

					case "contributionMaximums":
					case "employerMaxMatchAmounts":
						// "contributionMaximums" permits the contributionMaximum to vary by some string
						// value, typically a coverage level id as from the tool configuration. The same
						// approach applies to "employerMaxMatchAmounts", in lieu of its singular version.
						// It is expected that these properties, if present, will be objects mapping a
						// coverage level id string to a number. However, since the FSAE and MPCE engines
						// are considered distinct, we don't validate the coverage level ids here.
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

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkFederalIncomeTax(config) {
		///	<summary>
		///	Checks the "federalIncomeTax" property and related configuration for consistency and
		/// expected structure.
		///	</summary>
		/// <param name="config" type="Object">The FSAE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let federalIncomeTax = config.federalIncomeTax;

		if (!this.checkRequiredObject(federalIncomeTax, "federalIncomeTax")) { return false; }

		let initialErrorCount = this.errors.length;

		// First, check required properties.
		this.checkRequiredObject(federalIncomeTax.brackets, "federalIncomeTax.brackets");
		this.checkRequiredObject(federalIncomeTax.rates, "federalIncomeTax.rates");
		this.checkRequiredObject(federalIncomeTax.standardDeductions, "federalIncomeTax.standardDeductions");
		this.checkRequiredObject(federalIncomeTax.personalExemptions, "federalIncomeTax.personalExemptions");
		this.checkRequiredNumber(federalIncomeTax.dependentExemption, "federalIncomeTax.dependentExemption");

		// Next, check optional and unknown properties.
		Object.entries(federalIncomeTax).forEach(([propName, propValue]) => {
			let desc = strFmt("federalIncomeTax.{0}", propName);

			switch (propName) {
				case "brackets":
				case "rates":
					// Additional checks on these required properties.
					this.checkObjectAndOrderContentsMatch(desc, propValue, "list of valid filing status ids", this.validFilingStatusIds);
					Object.entries(propValue).forEach(([filingStatusId, value]) => {
						this.checkRequiredArray(value, strFmt("{0}.{1}", desc, filingStatusId));
					});
					break;

				case "standardDeductions":
				case "personalExemptions":
					// Additional checks on these required properties.
					this.checkObjectAndOrderContentsMatch(desc, propValue, "list of valid filing status ids", this.validFilingStatusIds);
					Object.entries(propValue).forEach(([filingStatusId, value]) => {
						this.checkRequiredNumber(value, strFmt("{0}.{1}", desc, filingStatusId));
					});
					break;

				case "dependentExemption":
					// Required; checked above.
					break;

				default:
					if (!propName.startsWith("__engine_")) {
						this.addError('federalIncomeTax contains unknown property "{0}".', propName);
					}
					break;
			}
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkFicaPayrollTaxes(config) {
		///	<summary>
		///	Checks the "ficaPayrollTaxes" property and related configuration for consistency and
		/// expected structure.
		///	</summary>
		/// <param name="config" type="Object">The FSAE configuration object.</param>
		///	<returns type="Boolean">True if the checks passed, false otherwise.</returns>

		let ficaPayrollTaxes = config.ficaPayrollTaxes;

		if (!this.checkRequiredObject(ficaPayrollTaxes, "ficaPayrollTaxes")) { return false; }

		let initialErrorCount = this.errors.length;

		// First, check required properties.
		this.checkRequiredNumber(ficaPayrollTaxes.socialSecurityLimit, "ficaPayrollTaxes.socialSecurityLimit");
		this.checkRequiredNumber(ficaPayrollTaxes.socialSecurityRate, "ficaPayrollTaxes.socialSecurityRate");
		this.checkRequiredNumber(ficaPayrollTaxes.medicareRate, "ficaPayrollTaxes.medicareRate");

		// Next, check optional and unknown properties.
		Object.keys(ficaPayrollTaxes).forEach((propName) => {
			switch (propName) {
				case "socialSecurityLimit":
				case "socialSecurityRate":
				case "medicareRate":
					// Required; checked above.
					break;

				default:
					if (!propName.startsWith("__engine_")) {
						this.addError('ficaPayrollTaxes contains unknown property "{0}".', propName);
					}
					break;
			}
		});

		let success = (initialErrorCount === this.errors.length);
		return success;
	}

	checkConfig(config, configId, noThrow) {
		///	<summary>
		/// Public (intended) method intended to be called by the test harness and any FSAE user interface to ensure
		/// the FSAE configuration object contents are consistent and meet certain defined expectations.  If errors
		/// are found, an exception is thrown containing a message with the configuration error details.
		///	</summary>
		/// <param name="config" type="Object">The FSAE configuration object.</param>
		/// <param name="configId" type="String">A string identifying which FSAE configuration object.</param>
		/// <param name="noThrow" type="Boolean">An optional boolean defaulting to false. If true, the throwing of
		///   any configuration errors found is suppressed and it becomes the caller's responsibility to check the return
		///   value and report the errors if indicated.</param>
		///	<returns type="Boolean">
		/// True if all checks passed, false otherwise. For failure, consult the errors array or call throwIfErrorsExist().
		/// </returns>

		_trace("checkConfig() called; configId: {0}, noThrow: {1}{2}", configId, noThrow,
			typeof noThrow === "undefined" ? " (false)" : "");

		this.clearErrors();
		delete config.hasPassedFsaeValidation;

		this.checkAccountTypes(config);
		this.checkFederalIncomeTax(config);
		this.checkFicaPayrollTaxes(config);

		let success = (0 === this.errors.length);
		if (success) {
			config.hasPassedFsaeValidation = true;
		} else {
			_trace(`checkConfig: ${configId} had validation errors: \n\n... ${this.errors.join("\n... ")}\n\n`);
			!noThrow && this.throwIfErrorsExist(configId);
		}

		_trace("checkConfig() returning success: {0}", success);
		return success;
	}
}

let fsaeValidation = new FsaeValidation(); // singleton
return fsaeValidation;
});
