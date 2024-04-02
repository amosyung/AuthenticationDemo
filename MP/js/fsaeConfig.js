//-------------------------------------------------------------------------------------------------
// fsaeConfig.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// This file contains the configuration for a given Flexible Spending Account Estimator (FSAE).
// This configuration is intended to contain client-specific customization to drive the generic
// FSAE engine in a data-driven fashion, permitting it to be maintained as common across clients.
// Briefly, the FSAE configuration object describes:
//
//     * ACCOUNT TYPES, e.g. flexible spending accounts (FSA) vs. health savings accounts (HSA).
//     * FEDERAL INCOME TAX, including tax brackets, rates, and some exemptions/deductions.
//     * FICA PAYROLL TAXES, including Social Security limit and rate and Medicare rate.
//
// For more detail, please refer to the sections below.
//

define([], function module() {
"use strict";

let config = {};

//-------------------------------------------------------------------------------------------------
// accountTypes: Defines the different account types that can be modeled by the FSAE.
//
// Structure: Object mapping string account type ids, each to an object containing properties
//     as follows:
//
// - description: Required string property containing the account type name suitable for display.
// - followRulesFor: Required string property containing one of "HSA", "FSA", or "LPFSA". Drives
//     certain key rules; e.g. whether to increase account limits by $1000 if age 55+ is indicated,
//     whether rollovers are unlimited or limited to a set amount, etc.
// - contributionMinimum: Optional number property indicating the minimum contribution amount for
//     the account type. If not specified, zero is assumed.
// - contributionMaximum: Optional number property indicating the maximum contribution amount for
//     the account type. If specified, this value takes precedence over contributionMaximums. If
//     contributionMaximums is also not specified, then Infinity is assumed.
// - contributionMaximums: Optional object mapping coverageLevelIds to maximum contribution amount
//     for the account type for the coverageLevelId. IMPORTANT: Currently, the FSAE engine doesn't
//     validate this object's keys as valid coverage level ids since there is no direct linkage
//     between MPCE engine/config and FSAE engine/config. Moreover, for HSAs, the tool will select
//     the corresponding maximum, adjust for company fund amount (if applicable) and the over age
//     55 limit increase (if applicable), then set a single contributionMaximumAdjustment value
//     on the account type at runtime, for adjusting the configured values below.
// - maximumExcludesCompanyFunds: Optional boolean indicating whether or not to count company fund
//     and match amounts as part of the contribution maximums. If not specified, false is assumed.
//     Can be set to true to exclude non-cashable company FSA contributions from the limits,
//     allowing an employee to personally contribute the maximum. Only for followRulesFor = "FSA".
// - employerMatchRate: Optional number property indicating the rate of employer matching
//     contributions. If not specified, zero is assumed.
// - employerMaxMatchAmount: Optional number property indicating the maximum dollar amount of
//      employer matching provided. i.e. Limits the money from employerMatchRate. If specified, this
//      value takes precedence over employerMaxMatchAmounts. If employerMaxMatchAmounts is also not
//      specified, then zero is assumed.
// - employerMaxMatchAmounts: Optional object mapping coverageLevelIds to maximum employer matching
//     amount for the account type for the coverageLevelId. (Note: As with contributionMaximums, the
//     keys for this object aren't currently validated by the FSAE engine.
// - companyFundsDoNotRollOver: Optional boolean indicating whether or not to count company fund
//     and match amounts as part of the potential amount rolling over, i.e. not applied toward the
//     cost of care. If not specified, false is assumed. Only for followRulesFor = "FSA".
//
config.accountTypes = {
	"FSA": {
		description: "Flexible Spending Account&nbsp;(FSA)",
		followRulesFor: "FSA",
		contributionMinimum: 0,
		contributionMaximums: {
			"employeeOnly": 3200,
			"employeeAndSpouse": 3200,
			"employeeAndChild": 3200,
			"employeeAndChildren": 3200,
			"employeeAndFamily": 3200
		}
	},

	"HSA": {
		description: "Health Savings Account&nbsp;(HSA)",
		followRulesFor: "HSA",
		contributionMinimum: 0,
		contributionMaximums: {
			"employeeOnly": 4150,
			"employeeAndSpouse": 8300,
			"employeeAndChild": 8300,
			"employeeAndChildren": 8300,
			"employeeAndFamily": 8300
		}
	},

	// Example: HSA plan with company match based on a percentage & limit.
	// Of course, if the client has no matched HSA, remove this example.
	"HSA_MATCHED": {
		description: "Matched Health Savings Account&nbsp;(HSA)",
		followRulesFor: "HSA",
		contributionMinimum: 0,
		contributionMaximums: {
			"employeeOnly": 4150,
			"employeeAndSpouse": 8300,
			"employeeAndChild": 8300,
			"employeeAndChildren": 8300,
			"employeeAndFamily": 8300
		},
		employerMatchRate: 1.00, // match 100% of employee contributions...
		employerMaxMatchAmounts: { // ...up to the amount based on coverage level
			"employeeOnly": 1250,
			"employeeAndSpouse": 1750,
			"employeeAndChild": 1750,
			"employeeAndChildren": 1750,
			"employeeAndFamily": 1750
		}
	},

	"LPFSA": {
		description: "Limited-Purpose Flexible Spending Account&nbsp;(LPFSA)",
		followRulesFor: "LPFSA",
		contributionMinimum: 0,
		contributionMaximums: {
			"employeeOnly": 3200,
			"employeeAndSpouse": 3200,
			"employeeAndChild": 3200,
			"employeeAndChildren": 3200,
			"employeeAndFamily": 3200
		}
	}
};

//-------------------------------------------------------------------------------------------------
// accountTypesOrder: An array defining the order in which account types are to be
//     displayed and/or iterated over.  The set of account type ids here must match exactly the
//     set of account type ids defined in config.accountTypes.
//
config.accountTypesOrder = ["FSA", "HSA", "HSA_MATCHED", "LPFSA"];

//-------------------------------------------------------------------------------------------------
// federalIncomeTax: Defines the different values required for the federal income tax
//   estimate calculation.
//
// Structure: An object containing properties as follows:
//
// - brackets: Required object mapping filing type ids (see below*) to an array containing numbers, each
//     of which is the upper limit for the income tax bracket.
// - rates: Required object mapping filing type ids (see below*) to an array containing numbers, each of
//     which is the tax rate effective at the corresponding bracket (and below). The final rate
//     in the array should be the rate for income in excess of the last corresponding bracket.
// - standardDeductions: Required object mapping filing type ids (see below*) to numbers for the
//     standard deduction amount for that filing type.
// - personalExemptions: Required object mapping filing type ids (see below*) to numbers for the
//     standard personal exemption amount for that filing type.
// - dependentExemption: Required number for the additional exemption amount per dependent.
//
// * The required filing type ids are "single", "marriedFilingJoint", "marriedFilingSeparate", and
// "headOfHousehold".
//
config.federalIncomeTax = {
	// Values current as of: 2023

	brackets: {
        single: [11000, 44725, 95375, 182100, 231250, 578125],
        marriedFilingJoint: [22000, 89450, 190750, 364200, 462500, 693750],
        marriedFilingSeparate: [11000, 44725, 95375, 182100, 231250, 346875],
        headOfHousehold: [15700, 59850, 95350, 182100, 231250, 578100]
	},

	rates: {
		// Rates are currently identical across filing types.
		single: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
		marriedFilingJoint: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
		marriedFilingSeparate: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
		headOfHousehold: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]
	},

	standardDeductions: {
        single: 13850,
        marriedFilingJoint: 27700,
        marriedFilingSeparate: 13850,
        headOfHousehold: 20800
	},

	personalExemptions: { // suspended in 2018 so set to $0
		single: 0,
		marriedFilingJoint: 0,
		marriedFilingSeparate: 0,
		headOfHousehold: 0
	},

	dependentExemption: 0 // suspended in 2018 so set to $0
};

//-------------------------------------------------------------------------------------------------
// ficaPayrollTaxes: Defines the different values required for the FICA payroll taxes
//   estimate calculation.
//
// Structure: An object containing properties as follows:
//
// - socialSecurityLimit: Required number for the current Social Security income limit;
//     i.e. the income amount beyond which Social Security deductions are not required.
// - socialSecurityRate: Required number property for the employee's Social Security tax rate.
// - medicareRate: Required number property for the employee's Medicare payroll tax rate.
//
config.ficaPayrollTaxes = {
	// Values current as of: 2023

	socialSecurityLimit: 160200,
	socialSecurityRate: 0.062,
	medicareRate: 0.0145
};

return config; // important!
}); // important!
