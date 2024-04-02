//-------------------------------------------------------------------------------------------------
// mainConfig.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// This is the primary configuration file, defining both defaults for the application in general,
// as well as region and status values for the MPCE engine that are in common between the various
// subconfig files. (There must be at least one subconfiguration file.)
//

define(["jquery", "mpceConfigGroup1"],
function module($, mpceConfigGroup1) {
"use strict";

let mainConfig = {};

//-------------------------------------------------------------------------------------------------
// general: Contains general/miscellaneous application options.
//
mainConfig.general = {

	// wizardEnabled: Whether the wizard guided Q&A feature is enabled or not.
	wizardEnabled: true,

	// wizardConfigName: Which wizard configuration to use. One of: "wizardConfigGuideMe", "wizardConfigPersonas".
	wizardConfigName: "wizardConfigGuideMe",

	// fullToolEnabled: If the wizard is enabled, this controls whether access to the full tool is enabled. If the
	// wizard is not enabled, this value is ignored. NOTE: If you are implementing a wizard-only site, you must still
	// set up most of the full tool (content, tables, etc.) as only that view supplies the printable report content.
	fullToolEnabled: true,

	// startingWithWizard: Determines whether the tool starts by default with the wizard, or else the full tool.
	// Explicit anchor links "#guided" or "#wizard" can make the wizard start first, even when this is false. Also,
	// a scenario saved while within the wizard can also make the wizard start first, even when this is false. If
	// the wizard is not enabled or wizardConfigName is wizardConfigPersonas then this value is ignored.
	startingWithWizard: false,

	// launchPageVimeoVideoUrl: Optional URL specifying a Vimeo video to show on the launch page (index.htm).
	// If not null and not empty, the launch page will display the video area over top the new launch page background,
	// otherwise the video area is hidden and the original launch page background is used.
	launchPageVimeoVideoPlayerUrl: "", // MPCE "https://player.vimeo.com/video/164580598" or HPCE "[...]/294013388"

	// showUserAgreementOnLaunch: Whether to display user agreement modal when tool launched.
	showUserAgreementOnLaunch: true,

	// simplifiedModelingEnabled: Whether simplified modeling view is enabled. Available via wizard and full tool.
	simplifiedModelingEnabled: true,

	// detailedModelingEnabled: Whether detailed modeling view is enabled. Only available via the full tool.
	detailedModelingEnabled: true,

	//chronicConditionModelingEnabled: Whether chronic modeling view is enabled. Available via wizard and full tool.
	chronicConditionModelingEnabled: true,

	// defaultModelingMode: Which mode to initially show: "simplified" or "detailed".
	defaultModelingMode: "simplified",

	// detailedModelingShowCategoryHeadings: Whether to display headings for each service category.
	detailedModelingShowCategoryHeadings: true,

	// detailedModelingServiceCountMax: Maximum value shown in detailed service count dropdown.
	detailedModelingServiceCountMax: 99,

	// planProvisionsFeature: Whether the plan provisions feature is enabled. If true, a "See plan provisions"
	// link shows above the chart, and clicking a chart column can also call up the same information.
	planProvisionsFeature: true,

	// includeDentalProvisions: Whether the plan provisions feature, if enabled, includes a separate tab and
	// static content for dental plans. If enabled, be sure to update the dental plan provisions static content.
	includeDentalProvisions: true,

	// saveScenarioEnabled: Whether to enable the feature to save the current scenario.
	saveScenarioEnabled: true,

	// planRecommendationEnabled: Whether to enable the feature to recommend a plan based on a user preference.
	planRecommendationEnabled: true,

	// simpleFeedbackEnabled: Whether to enable the feature to gather simple feedback via analytics.
	simpleFeedbackEnabled: true,

	// videoLibraryEnabled: Whether to enable the video library feature. Setting this to false hides all
	// default content in the tool that displays video library content or links to such content.
	videoLibraryEnabled: true,

	// taxCalculatorEnabled: Whether to enable the HSA/FSA tax calculator feature. The default is true.
	// Note: the tax calculator also won't show when all plans for a region lack an fsaeAccountTypeId.
	taxCalculatorEnabled: true,

	// sliderLiveUpdating: Whether or not to update results and charts based on slider thumbs being moved,
	// as opposed to only when the slider thumb is released.
	sliderLiveUpdating: true,

	// disableJQueryEffects: Whether or not to disable jQuery UI effects (animations), used primarily in the
	// wizard feature. This may be useful during development, or in cases where implementation calls for it.
	disableJQueryEffects: false,

	// fetchSsoProfileData: Whether to require fetching of user profile data from a containing SSO site's
	// GetProfileData.ashx endpoint before the tool can be used. Within clientCustom.onAppCoreDidInitialize(),
	// call appDefault.getSsoProfileData() to retrieve object returned by request, then process it; e.g. set
	// dropdown values, etc. For non-SSO sites, keep as false. Can also set to false temporarily when
	// developing/testing an SSO site locally, without the SSO bits underneath.
	fetchSsoProfileData: false, // IMPORTANT: Set to true for deployment in sites w/SSO enabled.

	// If fetchSsoProfileData is enabled, ssoGetProfileDataEndpoint should be the relative URL of the SSO
	// site endpoint for returning user profile data JSON. Usually, leave as-is, but if you, say, deploy
	// multiple site versions within a root SSO site, adjust the endpoint location here.
	ssoGetProfileDataEndpoint: "GetProfileData.ashx",

	// If deferToolUserInterfaceUnhide is true, then UI elements classed "hiddenUntilInitialized" (as well as
	// "hiddenOnceInitialized") will be left as-is once the app core has finished initialization. Instead, custom
	// logic would decide when to call appStage.postAppInitializationUnhiding(), e.g. if there is potentially more
	// custom initialization to perform (such as async config loading). Otherwise, this property should typically
	// be left at the default value of false. (A symptom of this being misconfigured, i.e. without corresponding
	// custom logic, is the tool loading message does not disappear.)
	deferToolUserInterfaceUnhide: false
};

// Important: If the personas model is being used, add the extra usage categories it needs.
if (mainConfig.general.wizardEnabled && mainConfig.general.wizardConfigName === "wizardConfigPersonas") {
	if ("addPersonasModelExtraUsageCategories" in mpceConfigGroup1) { mpceConfigGroup1.addPersonasModelExtraUsageCategories(); }
}

// For the HPCE product demo, adjust ACME default color scheme to use the pink button and top menu links.
// Ideally, remove this block before configuring and applying branding for a new client site implementation.
if ("wizardConfigPersonas" === mainConfig.general.wizardConfigName) {
	mainConfig.runHpceProductDemoAdjustments = function runHpceProductDemoAdjustments() {
		let style = document.documentElement.style;
		style.setProperty("--color-pageHeader-text", "#0077A0");
		style.setProperty("--color-pageHeader-topMenu-link", "#EE3D8B");
		style.setProperty("--color-pageHeader-topMenu-icon", "#EE3D8B");
		style.setProperty("--color-pageHeader-topMenu-icon-hover", "#C63378");
		style.setProperty("--color-btn-primary", "#EE3D8B");
		style.setProperty("--color-btn-primary-focus", "#EE3D8B");
		style.setProperty("--color-btn-primary-hover", "#C63378");
		style.setProperty("--color-btn-primary-active", "#B72F71");
		style.setProperty("--boxshadow-btn-primary-focus", "0 0 0 0.2rem #E0B8CA");
		$("#logo").attr("src", "img/logo_hpce.svg").css("width", "240px").css("maxWidth", "240px").css("height", "52px");
		$(".toolName").text("Health Plan Cost Estimator");
		$("div.mainTitle").css("fontWeight", "bold").css("textTransform", "uppercase").text("ACME Company");
		document.title = "HPCE";
	};
	mainConfig.runHpceProductDemoAdjustments();
}

//-------------------------------------------------------------------------------------------------
// mainChartSection: Options specific to the main chart section.
//
mainConfig.mainChartSection = {

	// showOopCostsDetails: Whether to show out-of-pocket cost detail amounts (copays, deductibles,
	// coinsurance, expenses not covered, etc.) in the corresponding chart tooltip. To adjust text in
	// the detail part of the tooltip, see the main HTML file template oopCostsDetails.
	showOopCostsDetails: true,

	// showEmployeePremiumsDetails: Whether to show employee premiums detail amounts (base premium,
	// surcharge/incentive adjustments, etc.) in the corresponding chart tooltip. To adjust text in
	// the detail part of the tooltip, see the main HTML file template employeePremiumsDetails.
	showEmployeePremiumsDetails: true,

	// showEmployerPremiumsDetails: Whether to show employer premiums detail amounts (base premium,
	// surcharge/incentive adjustments, etc.) in the corresponding chart tooltip. To adjust text in
	// the detail part of the tooltip, see the main HTML file template employeePremiumsDetails.
	// NOTE: This feature is only meaningful if showTotalCostsFeature (below) is set to true.
	showEmployerPremiumsDetails: true,

	// showWorstCaseCostsFeature: Whether the feature to show employee's worst case costs is enabled.
	showWorstCaseCostsFeature: true,

	// showWorstCaseCostsDefault: Whether the show worst case costs checkbox is initially checked.
	// This value is in effect regardless of whether the feature itself is enabled or not.
	showWorstCaseCostsDefault: false,

	// showTotalCostsFeature: Whether the feature to show total costs is enabled.
	showTotalCostsFeature: true,

	// showTotalCostsDefault: Whether the show total costs checkbox is initially checked.
	// This value is in effect regardless of whether the feature itself is enabled or not.
	showTotalCostsDefault: false,

	// summarizeEmployerCosts: Whether to summarize employer costs into one slice; otherwise, multiple slices.
	summarizeEmployerCosts: false,

	// summarizeEmployeeCosts: Whether to summarize employee costs into one slice; otherwise, multiple slices.
	summarizeEmployeeCosts: false
};

//-------------------------------------------------------------------------------------------------
// savingsAccountSection: Options specific to the savings account section.
//
mainConfig.savingsAccountSection = {

	// applyFundsToCostOfCareFeature: Whether the feature to apply/not apply funds to cost of care is enabled.
	applyFundsToCostOfCareFeature: true,

	// overAge55Default: Whether the overAge55 checkbox is initially checked.
	overAge55Default: false,

	// savingsSliderStepAmount: The step increment for both the HSA and FSA contribution sliders.
	savingsSliderStepAmount: 10,

	// hsaContributionsFeature: Whether the feature to permit HSA-type contributions via HSA slider is
	// enabled. Such funds go to plans associated with HSA-type accounts and fundAllowsContributions = true.
	hsaContributionsFeature: true,

	// hsaContributionAmountDefault: Initial value for the HSA contribution slider. Only meaningful if
	// hsaContributionsFeature is enabled.
	hsaContributionAmountDefault: 0,

	// fsaContributionsFeature: Whether the feature to permit FSA-type contributions via FSA slider is
	// enabled. Such funds go to plans associated with FSA-type accounts and fundAllowsContributions = true.
	fsaContributionsFeature: true,

	// fsaContributionAmountDefault: Initial value for the FSA contribution slider. Only meaningful if
	// fsaContributionsFeature is enabled.
	fsaContributionAmountDefault: 0,

	// fsaMaximumPermittedRollover: The maximum permitted rollover for FSA accounts. Only meaningful if
	// fsaContributionsFeature is enabled.
	fsaMaximumPermittedRollover: 640, // value current for 2024

	// fsaMaximumPermittedRolloverExcludesPlanFundAmount: Whether or not to exclude company funding from the
	// limitation on FSA rollover money. Leave as true if company money is in an HRA not subject to FSA rules.
	fsaMaximumPermittedRolloverExcludesPlanFundAmount: true,

	// carryoverAmountFeature: Whether the feature to permit incoming HSA/FSA carryover amount via carryover
	// slider is enabled. The carryover amount is assumed to be past funds carried over into the current year.
	carryoverAmountFeature: false,

	// carryoverAmountSliderMaximum: The maximum permitted value for the carryover amount slider.
	carryoverAmountSliderMaximum: 50000,

	// carryoverAmountSliderStepAmount: The step increment for the carryover amount slider.
	carryoverAmountSliderStepAmount: 50
};

//-------------------------------------------------------------------------------------------------
// subconfigs: Defines the available sub-configurations (subconfig). A subconfig contains
//    the remainder of the tool configuration and will be merged in with this main config file.
//    Sub-configs can be used to provide functionality for distinct employee groups.
//
// Structure: Object mapping string subconfig ids, each to an object with properties as follows:
//
// - description: Required string property containing the subconfig name suitable for display.
// - subconfigObject: Optional object property referring to the subconfig object, if the object
//     was loaded at the top of this file via RequireJS. Typically, this is the way most sites
//     will include subconfigs. In rare cases, omit this if the subconfig script module may be
//     loaded later by implementation-specific logic. For instance, implementations with a large
//     number of subconfigs and/or with authorization controls on subconfig script modules might
//     only conditionally load one/some of the available set of subconfigs.
//
mainConfig.subconfigs = {

	"group1": {
		description: "Group 1: States group 1",
		subconfigObject: mpceConfigGroup1
	}
};
mainConfig.subconfigsOrder = ["group1"];
mainConfig.subconfigsDefaultId = "group1";

//-------------------------------------------------------------------------------------------------
// regions, regionsOrder, plans, plansOrder, statuses, statusesOrder, coverageLevels,
// coverageLevelsOrder, coverageLevelsCostsPerPlan, services, combinedLimits, categories,
// categoriesOrder, usageCategories, usageCategoriesOrder:
//
// -----> See subconfigs (e.g. mpceConfig-Xyz.js)
//

//-------------------------------------------------------------------------------------------------
// personalFormItems: Defines the dynamic dropdowns and radio button sets appearing in both of
//   the "Tell us..." sections, and potentially elsewhere.
//
mainConfig.personalFormItems = {

	"subconfigDropdown": {
		description: "Employee group:",
		ordered: mainConfig.subconfigsOrder,
		full: mainConfig.subconfigs,
		defaultValue: mainConfig.subconfigsDefaultId,
		// Optional: helpModalId: "modal_SubconfigHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return config.subconfigsOrder.length > 1; }, // i.e. when multiple subconfigs
		appDataObj: "personal", // i.e. appData.personal
		variableName: "subconfig", // i.e. appData.personal.subconfig
		callback: "onSubconfigDropdownChanged" // maps to [clientCustom||appDefault].onSubconfigDropdownChanged()
	},

	"partnerStatusDropdown": {
		description: "Are you covering a spouse/partner?",
		// n.b. Don't change the ids below -- but you can change the order or descriptions. You may also add
		// an additional variation of "hasSpouseOrDP" in order to separate the spouse option from the DP option,
		// but the variant's id must still start with "hasSpouseOrDP", e.g. "hasSpouseOrDP_DP".
		ordered: ["noSpouseOrDP", "hasSpouseOrDP"],
		full: {
			"noSpouseOrDP": { description: "No" },
			"hasSpouseOrDP": { description: "Yes" }
		},
		defaultValue: "noSpouseOrDP",
		// Optional: helpModalId: "modal_PartnerStatusHelp",
		display: true, // or define optional displayWhen function
		appDataObj: "personal", // i.e. appData.personal
		variableName: "partnerStatus", // i.e. appData.personal.partnerStatus
		callback: "onPartnerStatusDropdownChanged" // maps to [clientCustom||appDefault].onPartnerStatusDropdownChanged()
	},

	"numberOfChildrenDropdown": {
		description: "How many children are you covering?",
		ordered: ["0", "1", "2", "3", "4", "5"],
		full: {
			"0": { description: "No children" },
			"1": { description: "1 child" },
			"2": { description: "2 children" },
			"3": { description: "3 children" },
			"4": { description: "4 children" },
			"5": { description: "5 or more children" }
		},
		defaultValue: "0",
		helpModalId: "modal_NumberOfChildrenHelp",
		display: true, // or define optional displayWhen function
		appDataObj: "personal", // i.e. appData.personal
		variableName: "numberOfChildrenStr", // i.e. appData.personal.numberOfChildrenStr
		callback: "onNumberOfChildrenDropdownChanged" // maps to [clientCustom||appDefault].onNumberOfChildrenDropdownChanged()
	},

	"regionDropdown": {
		description: "Location:",
		subconfigOrderedPropName: "regionsOrder",
		subconfigFullPropName: "regions",
		subconfigDefaultValuePropName: "regionsDefaultId",
		helpModalId: "modal_RegionHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return config.regionsOrder.length > 1; }, // i.e. when there are multiple regions
		appDataObj: "personal", // i.e. appData.personal
		variableName: "regionId", // i.e. appData.personal.regionId
		callback: "onRegionDropdownChanged" // maps to [clientCustom||appDefault].onRegionDropdownChanged()
	},

	"statusDropdown": {
		description: "Salary band:",
		subconfigOrderedPropName: "statusesOrder",
		subconfigFullPropName: "statuses",
		subconfigDefaultValuePropName: "statusesDefaultId",
		// Optional: helpModalId: "modal_StatusHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return config.statusesOrder.length > 1; }, // i.e. when there are multiple statuses
		// Example for specific subconfig: displayWhen: function when(appData, config) { return appData.personal.subconfig === "subconfigId"; },
		appDataObj: "personal", // i.e. appData.personal
		variableName: "statusId", // i.e. appData.personal.statusId
		callback: "onStatusDropdownChanged" // maps to [clientCustom||appDefault].onStatusDropdownChanged()
	},

	"planPriorityRadioButtons": {
		// n.b. Don't change the ids below -- but you can change the order or descriptions.
		ordered: ["none", "lowerPremiums", "lowerOutOfPocketCosts", "lowerTotalCosts", "lowerWorstCaseCosts", "HSA"],
		full: {
			"none": { description: "I don't know yet" },
			"lowerPremiums": { description: "Lower employee annual plan premiums" },
			"lowerOutOfPocketCosts": { description: "Lower estimated out-of-pocket costs" },
			"lowerTotalCosts": { description: "Lower estimated employee total costs" },
			"lowerWorstCaseCosts": {
				description: "Lower estimated employee worst case costs",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.features.showWorstCaseCostsFeature; }
			},
			"HSA": {
				description: "Access to a Health Savings Account (HSA)",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.features.hsaContributionsFeature; }
			}
		},
		defaultValue: "none", // IMPORTANT: Users should steer own decision making. Leave "none" as the default.
		display: true, // or define optional displayWhen function
		appDataObj: "personal", // i.e. appData.personal
		variableName: "planPriority", // i.e. appData.personal.planPriority
		callback: "onPlanPriorityChanged" // maps to [clientCustom||appDefault].onPlanPriorityChanged()
	},

	"applyFundsToCostOfCareDropdown": {
		description: "Funding to apply toward the cost of care:",
		ordered: ["applyAllFunds", "applyERFundsOnly", "applyEEFundsOnly", "applyNoFunds"],
		full: {
			"applyAllFunds": { description: "All funding sources" },
			"applyERFundsOnly": { description: "Company funding only" },
			"applyEEFundsOnly": { description: "Employee funding only" },
			"applyNoFunds": { description: "No funding" }
		},
		defaultValue: "applyAllFunds", // n.b. this default value is in effect regardless of whether the dropdown is visible or not
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return mainConfig.savingsAccountSection.applyFundsToCostOfCareFeature; },
		appDataObj: "personal", // i.e. appData.personal
		variableName: "applyFundsToCostOfCareOption", // i.e. appData.personal.applyFundsToCostOfCareOption
		callback: "onApplyFundsDropdownChanged" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	},

	"wellnessDropdown": {
		description: "Wellness rewards:",
		ordered: ["wellnessNone", "wellnessEmployee", "wellnessSpouse", "wellnessBoth"],
		full: {
			"wellnessNone": { description: "No" },
			"wellnessEmployee": { description: "Employee only" },
			"wellnessSpouse": {
				description: "Spouse/partner only",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.hasSpouse(); }
			},
			"wellnessBoth": {
				description: "Employee and spouse/partner",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.hasSpouse(); },
				fallbackValue: "wellnessEmployee" // otherwise, falls back to first visible value
			}
		},
		defaultValue: "wellnessNone",
		helpModalId: "modal_WellnessRewardsHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return true; },
		appDataObj: "custom", // i.e. appData.custom
		variableName: "wellnessAnswer", // i.e. appData.custom.wellnessAnswer
		callback: "onOtherDropdownChanged" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	},

	"tobaccoSurchargeDropdown": {
		description: "Tobacco use:",
		ordered: ["tobaccoNone", "tobaccoEmployee", "tobaccoSpouse", "tobaccoBoth"],
		full: {
			"tobaccoNone": { description: "No" },
			"tobaccoEmployee": { description: "Employee only" },
			"tobaccoSpouse": {
				description: "Spouse/partner only",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.hasSpouse(); },
				fallbackValue: "tobaccoNone"
			},
			"tobaccoBoth": {
				description: "Employee and spouse/partner",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.hasSpouse(); },
				fallbackValue: "tobaccoEmployee"
			}
		},
		defaultValue: "tobaccoNone",
		helpModalId: "modal_TobaccoUsageHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return false; }, // or return true to enable it
		appDataObj: "custom", // i.e. appData.custom
		variableName: "tobaccoSurchargeAnswer", // i.e. appData.custom.tobaccoSurchargeAnswer
		callback: "onOtherDropdownChanged" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	},

	"spouseSurchargeDropdown": {
		description: "Spouse/partner surcharge:",
		ordered: ["spouseSurchargeNo", "spouseSurchargeYes"],
		full: {
			"spouseSurchargeNo": { description: "No" },
			"spouseSurchargeYes": {
				description: "Yes",
				// eslint-disable-next-line no-unused-vars
				displayWhen: function when(appData, config) { return appData.hasSpouse(); },
				fallbackValue: "spouseSurchargeNo"
			}
		},
		defaultValue: "spouseSurchargeNo",
		helpModalId: "modal_SpouseSurchargeHelp",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return false; }, // or return appData.hasSpouse() to enable it
		appDataObj: "custom", // i.e. appData.custom
		variableName: "spouseSurchargeAnswer", // i.e. appData.custom.spouseSurchargeAnswer
		callback: "onOtherDropdownChanged" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	},

	"yourMatchingPlanDropdown": {
		description: "Which plan do you think you will enroll in? <small>(feedback only &mdash; does not enroll you)</small>",
		ordered: ["none"],
		full: {
			"none": { description: "I prefer not to say" }
		},
		dynamicSource: (obj) => { return obj.getAvailablePlansByRegionSelection(); },
		defaultValue: "none",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return true; },
		appDataObj: "custom", // i.e. appData.custom
		variableName: "yourMatchingPlanAnswer", // i.e. appData.custom.yourMatchingPlanAnswer
		callback: "onUserProvidedSimpleFeedback" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	},

	"yourMatchRatingDropdown": {
		description: "Did this tool help you with your medical plan choice? <small>(1 is not helpful, 5 is very helpful)</small>",
		ordered: ["none", "one", "two", "three", "four", "five"],
		full: {
			"none": { description: "I prefer not to say" },
			"one": { description: "1" },
			"two": { description: "2" },
			"three": { description: "3" },
			"four": { description: "4" },
			"five": { description: "5" }
		},
		defaultValue: "none",
		// eslint-disable-next-line no-unused-vars
		displayWhen: function when(appData, config) { return true; },
		appDataObj: "custom", // i.e. appData.custom
		variableName: "yourMatchRatingAnswer", // i.e. appData.custom.yourMatchRatingAnswer
		callback: "onUserProvidedSimpleFeedback" // maps to [clientCustom||appDefault].onOtherDropdownChanged()
	}
	// More dropdowns (e.g. for more incentives, surcharges, or other custom logic) are easy to add. Follow the
	// examples above. Make sure you also add a matching <div data-action="..."></div> element in the tool page.
};

//-------------------------------------------------------------------------------------------------
// taxCalculatorFormItems: Defines the sliders that appear in the tax calculator view.
//
// Tip: To use different text for a slider label depending on plan id, define a dynamicText object
// mapping plan ids to objects each containing "labelText" and optional "tooltipText" properties.
//
mainConfig.taxCalculatorFormItems = {

	"primaryAnnualIncomeSlider": {
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your annual income:</span>",
		tooltipText: "If your annual income exceeds $600,000, you are in the highest tax bracket " +
			"so will not receive any additional tax benefit. Simply choose $600,000 as your annual income.",
		textInputTitle: "Annual income",
		defaultValue: 10000,
		sliderMin: 0,
		sliderMax: 600000,
		sliderStep: 500,
		display: true,
		disabled: false,
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "primaryAnnualIncome", // i.e. appData.taxCalc.primaryAnnualIncome
		callback: "onPrimaryAnnualIncomeSliderChanged" // maps to [clientCustom||appDefault].onPrimaryAnnualIncomeSliderChanged()
	},

	"spouseAnnualIncomeSlider": {
		// n.b. Elsewhere the tool may reference both "spouse/partner" but the tax calculator excludes
		// "partner" because domestic partners are not married for federal tax filing status purposes.
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your spouse's annual income:</span>",
		tooltipText: "If your spouse's annual income exceeds $600,000, your spouse is in the highest tax bracket " +
			"so will not receive any additional tax benefit. Simply choose $600,000 as your spouse's annual income.",
		textInputTitle: "Spouse's annual income",
		defaultValue: 0,
		sliderMin: 0,
		sliderMax: 600000,
		sliderStep: 500,
		display: true,
		disabled: true, // initially disabled, but enabled when tax filing status is appropriate
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "spouseAnnualIncome", // i.e. appData.taxCalc.spouseAnnualIncome
		callback: "onSpouseAnnualIncomeSliderChanged" // maps to [clientCustom||appDefault].onSpouseAnnualIncomeSliderChanged()
	},

	"hsaEligibleExpensesSlider": {
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your estimated eligible medical expenses:</span>",
		tooltipText: "Use the slider to estimate your eligible out-of-pocket medical expenses for the upcoming plan year.",
		textInputTitle: "Estimated eligible medical expenses",
		defaultValue: 0,
		sliderMin: 0,
		sliderMax: 25000,
		sliderStep: 100,
		display: true,
		disabled: false,
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "hsaEligibleExpenses", // i.e. appData.taxCalc.hsaEligibleExpenses
		callback: "onHsaEligibleExpensesSliderChanged" // maps to [clientCustom||appDefault].onHsaEligibleExpensesSliderChanged()
	},

	"visionExpensesSlider": {
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your estimated eligible vision expenses:</span>",
		tooltipText: "Use the slider to estimate your eligible out-of-pocket vision expenses for the upcoming plan year.",
		textInputTitle: "Estimated eligible vision expenses",
		defaultValue: 0,
		sliderMin: 0,
		sliderMax: 10000,
		sliderStep: 100,
		display: true,
		disabled: false,
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "visionExpenses", // i.e. appData.taxCalc.visionExpenses
		callback: "onVisionExpensesSliderChanged" // maps to [clientCustom||appDefault].onVisionExpensesSliderChanged()
	},

	"dentalExpensesSlider": {
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your estimated eligible dental expenses:</span>",
		tooltipText: "Use the slider to estimate your eligible out-of-pocket dental expenses for the upcoming plan year.",
		textInputTitle: "Estimated eligible dental expenses",
		defaultValue: 0,
		sliderMin: 0,
		sliderMax: 10000,
		sliderStep: 100,
		display: true,
		disabled: false,
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "dentalExpenses", // i.e. appData.taxCalc.dentalExpenses
		callback: "onDentalExpensesSliderChanged" // maps to [clientCustom||appDefault].onDentalExpensesSliderChanged()
	},

	"otherExpensesSlider": {
		labelText: "<i class='fa fa-question-circle noPrint'></i> <span>Your estimated eligible other health care expenses:</span>",
		tooltipText: "Use the slider to estimate your eligible out-of-pocket other health care expenses for the upcoming plan year.",
		textInputTitle: "Estimated eligible other health care expenses",
		defaultValue: 0,
		sliderMin: 0,
		sliderMax: 10000,
		sliderStep: 100,
		display: false,
		disabled: false,
		appDataObj: "taxCalc", // i.e. appData.taxCalc
		variableName: "otherExpenses", // i.e. appData.taxCalc.otherExpenses
		callback: "onOtherExpensesSliderChanged" // maps to [clientCustom||appDefault].onOtherExpensesSliderChanged()
	}
};

//-------------------------------------------------------------------------------------------------
// mpceChartDefaults: Default values for the main chart, in the same format required by the
//    Highcharts.Chart() constructor. Note that the values here will be augmented with specific
//    additional settings (if not present already) and data required by the app.
//
mainConfig.mpceChartDefaults = {
	chart: {
		backgroundColor: "#FFFFFF",
		spacingTop: 6,
		spacingRight: 0,
		spacingBottom: 3, // padding between legend bottom border and chart bottom
		spacingLeft: 2 // padding between chart left and y axis labels
	},
	credits: { enabled: false },
	title: { text: "" },
	xAxis: {
		labels: {
			style: { fontSize: "13px", lineHeight: "14px", color: "#555555", textAlign: "center" },
			y: 14, // for vertical distance from x-axis line
			padding: 12 // for left and right of the label
		},
		lineColor: "#E6E6E6",
		tickWidth: 0
	},
	// NOTE: The "colors" array is no longer directly used by main chart; instead see mainConfig.mpceChartSeries below.
	yAxis: {
		gridLineColor: "#F0F0F0",
		title: { text: "" },
		labels: {
			style: { fontSize: "14px", fontVariantNumeric: "tabular-nums", color: "#555555" }
		},
		stackLabels: {
			enabled: true,
			allowOverlap: true,
			style: {
				fontSize: "17px", fontWeight: "bold", fontVariantNumeric: "tabular-nums",
				color: "#204060", textShadow: "1px 1px 0 #E8F1F9", cursor: "default"
			}
		},
		maxPadding: 0.07 // reduces likelihood that stack labels overlap with column tops
	},
	legend: {
		enabled: true,
		layout: "vertical",
		backgroundColor: "#FFFFFF",
		borderColor: "#D2D2D2",
		borderWidth: 1,
		borderRadius: 5,
		width: 385, // wider is ok too; the legend automatically shrinks for smaller screens
		margin: 8,
		itemMarginTop: 1,
		itemMarginBottom: 2,
		itemStyle: { fontSize: "14px", lineHeight: "14px", color: "#555555", fontWeight: "normal", cursor: "default", textOverflow: false },
		itemHoverStyle: { color: "#555555", fontWeight: "normal", cursor: "default" }
	},
	tooltip: {
		useHTML: true,
		shape: "square",
		backgroundColor: "rgba(240,244,248,0.97)" // slightly less annoying than the default
	},
	plotOptions: {
		series: {
			cursor: "pointer",
			groupPadding: 0.12,
			pointPadding: 0.19,
			states: {
				normal: { animation: false },
				inactive: {
					animation: false,
					opacity: 1 // turn off inactive series fading on hover
				}
			}
		}
	}
};

//-------------------------------------------------------------------------------------------------
// mpceChartSeries: Defines the properties for each of the required series in the main stacked
//   column chart. Must contain objects for each of: outOfPocketCosts, employerOrPlanTotalCosts,
//   paidByEmployerOrPlanExcludingFund, paidByPlanFund, paidByRolloverFund, paidByEmployeeHSACont,
//   paidByEmployeeFSACont, annualEmployerPremiums, employeeAdditionalServicePremiums,
//   annualEmployeePremiums, employeeTotalCosts, and totalCosts. The order these are displayed
//   in is controlled by mpceChartSeriesOrder.
//
// Structure: Object mapping required chart series ids, each to an object containing properties
//   for that series, as follows:
//
// - description: Required string property containing the description to show in the chart legend.
// - descriptionInPrintTable: Optional string property containing the description to show in the
//     print table version of chart data.
// - color: Required string property containing an HTML color code for the chart series' slice.
// - displayInChart: Optional string property; must be one of "auto", "always", or "never". If not
//     specified, it defaults to "auto", which means chart the series if context is appropriate;
//     e.g. if showing total costs and it is an employer/plan cost series. "always" forces a series
//     to always be charted. One could, say, use "always" to pull paidByPlanFund into default view.
// - displayInLegend: Optional string property; must be one of "auto", "always", or "never". If not
//     specified, it defaults to "auto", which means display if context is appropriate and there
//     is non-zero data currently charted. "always" forces the item to display in the legend
//     if it is currently charted and even if all values in the charted series are zero.
// - displayInPrintTable: Optional string property; must be one of "auto", "always", or "never". If
//     not specified, it defaults to "auto", which means display the series in the print table if
//     it would appear in the chart legend. "always" forces the item to display in the print table
//     if it is currently charted and even if all values in the charted series are zero.
// - alternateDescription: Optional string property containing an alternate description, used by
//     plans that have alternateChartStack set to true. Defaults to value for "description".
// - alternateDescriptionInPrintTable: Optional string property containing the description to show
//     in the print table version of chart data, for plans with alternateChartStack set to true.
// - alternateColor: Optional string property containing an alternate color for the slice, used by
//     plans that have alternateChartStack set to true. Defaults to value for "color".
//
mainConfig.mpceChartSeries = {

	outOfPocketCosts: {
		description: "Employee's cost of care (\"out-of-pocket costs\")",
		descriptionInPrintTable: "Employee's cost of care<br>(\"out-of-pocket costs\")",
		color: "#00A8C8",
		alternateColor: "#9BC0C7",
		displayInLegend: "always"
	},

	employerOrPlanTotalCosts: {
		// This summary series is ONLY active when mainChartSection.summarizeEmployerCosts is true, instead of
		// each of paidByEmployerOrPlanExcludingFund, paidByPlanFund, and annualEmployerPremiums.
		description: "Total costs paid/covered by the company or plan",
		color: "#654EA0",
		alternateColor: "#AAA5B5"
	},

	paidByEmployerOrPlanExcludingFund: {
		description: "Cost of care amount covered by the plan",
		color: "#428A4A",
		alternateColor: "#9BAB9C"
	},

	paidByPlanFund: {
		description: "Costs paid by company's funding or match",
		color: "#FC9949",
		alternateColor: "#E8D5C5"
	},

	paidByRolloverFund: {
		description: "Costs paid by funds carried over from 2023",
		color: "#009390",
		alternateColor: "#A1B5B4",
		displayInChart: "always"
	},

	paidByEmployeeHSACont: {
		description: "Costs paid by employee's HSA contributions",
		color: "#ED2F68",
		alternateColor: "#CCA7B1"
	},

	paidByEmployeeFSACont: {
		description: "Costs paid by employee's FSA contributions",
		color: "#69B876",
		alternateColor: "#BBD1BF"
	},

	annualEmployerPremiums: {
		description: "Company's annual plan premiums",
		color: "#654EA0",
		alternateColor: "#AAA5B5"
	},

	employeeAdditionalServicePremiums: {
		description: "Employee's service-specific added premiums",
		color: "#BFB943",
		alternateColor: "#DDDCBF"
	},

	annualEmployeePremiums: {
		description: "Employee's annual plan premiums (payroll contributions)",
		color: "#036E9F",
		alternateColor: "#94A8B2"
	},

	employeeTotalCosts: {
		// This summary series is ONLY active when mainChartSection.summarizeEmployeeCosts is true, instead of
		// each of outOfPocketCosts, paidByEmployeeHSACont, paidByEmployeeFSACont, and annualEmployeePremiums.
		description: "Employee's total costs",
		color: "#BBBBBB",
		alternateColor: "#DDDDDD"
	},

	totalCosts: {
		// This overall total series isn't ever directly in the chart or legend, but must be defined for the print table.
		// This is the sum of all individual series currently charted and should match the column stack label values.
		description: "Total costs<br>(employee, company, and plan)"
	}
};

//-------------------------------------------------------------------------------------------------
// mpceChartSeriesOrder: An array defining the order in which the chart series slices are stacked
//   the column chart, in order from top-most slice to bottom-most slice.
//
// NOTE: If you want to rearrange where a particular column slice appears within a stacked column,
// rearrange the ids below. You may NOT add or remove ids; exactly the 11 below are necessary and
// will be checked for. To include/exclude a particular series in the chart, instead adjust its
// visibility in mpceChartSeries using the displayInChart and displayInLegend properties.
//
mainConfig.mpceChartSeriesOrder = [
	// === TOP of stacked column ===
	"outOfPocketCosts",
	"employerOrPlanTotalCosts",
	"paidByEmployerOrPlanExcludingFund",
	"paidByPlanFund",
	"paidByRolloverFund",
	"paidByEmployeeHSACont",
	"paidByEmployeeFSACont",
	"annualEmployerPremiums",
	"employeeAdditionalServicePremiums",
	"annualEmployeePremiums",
	"employeeTotalCosts",
	// === BOTTOM of stacked column ===
	"totalCosts" // (totalCosts never charted; only in print table)
];

//-------------------------------------------------------------------------------------------------
// worstCaseCostsSeries: Default values for the worst case costs series that can be added to the
//   main chart if the worst case costs feature is enabled (see mainChartSection). When included,
//   this series is rendered behind the usual stacked columns as a slightly wider column outline.
//
mainConfig.worstCaseCostsSeries = {
	name: "(Red dotted lines are employee worst case costs, reduced by company funding when provided)",
	nameForTooltip: "Worst case costs for plan",
	pointPadding: 0.13,
	color: "#FFFFFF",
	borderColor: "#FFA0A0",
	borderWidth: 1,
	dashStyle: "LongDash"
};

//-------------------------------------------------------------------------------------------------
// fsaeChartDefaults: Default values for the FSAE chart. See mpceChartDefaults.
//
// For this chart's configuration, we're currently just copying everything from mpceChartDefaults,
// and then overriding only the values we want to be different.
//
mainConfig.fsaeChartDefaults = JSON.parse(JSON.stringify(mainConfig.mpceChartDefaults)); // makes a deep copy, EXCEPT functions!
mainConfig.fsaeChartDefaults.colors = [
	"#036E9F", // Total medical costs
	"#69B876", // Suggested Limited Purpose FSA contributions
	"#ED2F68", // Suggested HSA/FSA contributions
	"#00A8C8", // Potential federal income tax savings
	"#654EA0" // Potential FICA tax savings
];
mainConfig.fsaeChartDefaults.legend.width = 300; // wider is ok too; the legend automatically shrinks for smaller screens
delete mainConfig.fsaeChartDefaults.plotOptions.series.cursor;

//-------------------------------------------------------------------------------------------------
// appStrings: While most content is contained in the tool page HTML or inside other configuration
//    objects (e.g. plans, services, etc.) some app-specific content is required by JavaScript code
//    that either substitutes text or generates dynamic content. These strings are below. Customize
//    as needed for the client.
//
// NOTE: The _TooltipFormat strings below are interpreted by Highcharts and the markup you can
//   use in them is constrained. See http://api.highcharts.com/highcharts#tooltip.formatter
//
mainConfig.appStrings = {

	// Misc.
	"txt_DetailedModelingCustom": "-",
	"txt_PersonType_child": "Child",
	"txt_PersonType_primary": "My&nbsp;own",
	"txt_PersonType_spouse": "Spouse/partner",
	"txt_ZeroServiceCount": "-", // or "0", perhaps
	"txt_NA": "n/a", // not applicable slider value text (e.g. spouse salary in tax calculator when no spouse indicated)
	"txt_WorstCaseCostsUnlimited": "n/a", // replaces the dollar amount stack label when worst case costs are unlimited

	// Tax calculator view
	"txt_fsaeChartColumn_Default_SuggestedAnnualCont": "Suggested annual<br>contributions",
	"txt_fsaeChartColumn_FSA_SuggestedAnnualCont": "Suggested annual FSA<br>contributions",
	"txt_fsaeChartColumn_HSA+LPFSA_SuggestedAnnualCont": "*Suggested annual<br>contributions",
	"txt_fsaeChartColumn_HSA_MATCHED_SuggestedAnnualCont": "*Suggested annual HSA<br>contributions",
	"txt_fsaeChartColumn_HSA_MATCHED+LPFSA_SuggestedAnnualCont": "*Suggested annual<br>contributions",
	"txt_fsaeChartColumn_HSA_SuggestedAnnualCont": "*Suggested annual HSA<br>contributions",
	"txt_fsaeChartColumn_PotentialTaxSavings": "Potential<br>tax savings<br>", // Income tax & FICA tax savings combined
	"txt_fsaeChartColumn_TotalMedicalCosts": "Total medical, vision<br>and dental costs",
	"txt_fsaeChartSeries_FSA_SuggRegularAccountCont": "Suggested annual FSA contributions",
	"txt_fsaeChartSeries_HSA+LPFSA_SuggLimitedPurposeCont": "Suggested annual Limited Purpose FSA contributions",
	"txt_fsaeChartSeries_HSA+LPFSA_SuggRegularAccountCont": "Suggested annual HSA contributions",
	"txt_fsaeChartSeries_HSA_MATCHED_SuggLimitedPurposeCont": "Suggested annual Limited Purpose FSA contributions",
	"txt_fsaeChartSeries_HSA_MATCHED_SuggRegularAccountCont": "Suggested annual HSA contributions (excluding company match)",
	"txt_fsaeChartSeries_HSA_MATCHED+LPFSA_SuggLimitedPurposeCont": "Suggested annual Limited Purpose FSA contributions",
	"txt_fsaeChartSeries_HSA_MATCHED+LPFSA_SuggRegularAccountCont": "Suggested annual HSA contributions (excluding company match)",
	"txt_fsaeChartSeries_HSA_SuggRegularAccountCont": "Suggested annual HSA contributions",
	"txt_fsaeChartSeries_PotentialFicaTaxSavings": "Potential FICA tax savings",
	"txt_fsaeChartSeries_PotentialIncomeTaxSavings": "Potential federal income tax savings",
	"txt_fsaeChartSeries_TotalMedicalCosts": "Total medical, vision and dental costs",
	"txt_taxCalcHeadline_FSA": "Flexible Spending Account (FSA) Tax Calculator",
	"txt_taxCalcHeadline_HSA": "Health Savings Account (HSA) Tax Calculator",
	"txt_taxCalcHeadline_HSA+LPFSA": "Health Savings Account (HSA) with Limited Purpose FSA Tax Calculator",
	"txt_taxCalcHeadline_HSA_MATCHED": "Matched Health Savings Account (HSA) Tax Calculator",
	"txt_taxCalcHeadline_HSA_MATCHED+LPFSA": "Matched Health Savings Account (HSA) with Limited Purpose FSA Tax Calculator",

	// Dummy entry to facilitate copy/paste of above without worrying about last comma.
	"txt_dummy": "just because of the comma bit"
};

//-------------------------------------------------------------------------------------------------
// planProvisions: General configuration values for the plan provisions feature.
//
mainConfig.planProvisions = {

	// sectionsOrder: Defines which sections are to be included in the plan provisions table,
	// and in what order. If you don't want one of the standard sections included in the plan
	// provisions table, it can be removed or commented out.
	sectionsOrder: [
		"mainSectionHeader",
		"deductibles",
		"oopMaximums",
		"savingsPlanTypes",
		"savingsPlanFunding",
		"savingsPlanMatch",
		"adjustments",
		"separator",
		"servicesSectionHeader",
		"services"
	],

	// sectionLabels provides some of the string descriptions required by the plan provisions feature
	// that are not configured elsewhere.
	sectionLabels: {
		mainSection: "Plan features",
		deductibles: "Annual deductible<br>(in-network)",
		oopMaximums: "Annual out-of-pocket<br>maximums (in-network)",
		savingsPlanTypes: "Savings plan type(s) you can contribute to",
		savingsPlanFunding: "Company savings plan funding",
		savingsPlanMatch: "Company match on savings contributions",
		adjustments: "Adjustments",
		servicesSection: "Service costs"
	},

	// notApplicableText: Provides the text used when a particular plan doesn't have something; e.g. a plan
	// not having any associated savings accounts would show this in the savings plan types available row.
	notApplicableText: "<span style='color: #AAAAAA'>&ndash;</span>"
};

//-------------------------------------------------------------------------------------------------
// planProvisionsDeductiblesStrings: String and format string constants used when the tool attempts
//   to automatically translate plan deductible properties into text descriptions suitable for
//   display to the user. Any given plan could alternatively have an overriding description
//   in a "deductiblesDescription" property (and in some cases, one may be required.)
//
mainConfig.planProvisionsDeductiblesStrings = {
	none: "None",
	familyOnlySimpleFormat: "${0}",
	familyOnlyFormat: "${0} individual /<br>${1} family",
	dualFormat: "${0} per individual,<br>${1} family maximum"
};

//-------------------------------------------------------------------------------------------------
// planProvisionsCoverageStrings: String and format string constants used when the tool attempts to
//   automatically translate service coverage properties into text descriptions suitable for
//   display to the user. Any given service coverage object could alternatively have an overriding
//   description in a "description" property (and in some cases, one may be required.)
//
mainConfig.planProvisionsCoverageStrings = {
	notCovered: "not&nbsp;covered",
	fullyCovered: "$0", // for items where copay: 0, no coinsurance, and no deductible
	copayFormat: "{0}${1}{2}", // copayPrefix, amount, copaySuffix/zeroCopaySuffix
	copayPrefix: "", // text before a copay dollar amount; could be e.g. "you pay "
	copaySuffix: " copay", // text after a copay dollar amount; could be e.g. " copay"
	zeroCopaySuffix: "", // text after a zero copay dollar amount; or use same value as copaySuffix if you want
	coinsuranceFormat: "{0}{1}%{2}{3}", // coinsurancePrefix, amount, coinsuranceSuffix, coinsuranceMinMaxPart
	coinsurancePrefix: "", // text before a coinsurance percentage amount; could be e.g. "you pay "
	coinsuranceSuffix: "", // text after a coinsurance percentage amount; could be e.g. " coinsurance"
	coinsuranceMinMaxPartFormat: "<br>({0}{1}{2}{3}{4})", // coinsuranceMinPrefix, min amount, coinsuranceSeparator, coinsuranceMaxPrefix, max amount
	coinsuranceMinPrefix: "min:&nbsp;$",
	coinsuranceSeparator: ",&nbsp;",
	coinsuranceMaxPrefix: "max:&nbsp;$",
	singleUseCostMaxFormat: "<br>(max:&nbsp;${0})",
	deductibleNoneDualFormat: "{0}, then&nbsp;{1}", // {0} is copay part and {1} coinsurance part
	deductibleBeforeCopayDualFormat: "deductible, then&nbsp;{0}, then&nbsp;{1}", // {0} is copay part and {1} coinsurance part
	deductibleBeforeCoinsuranceDualFormat: "{0}&nbsp;then, after&nbsp;deductible, {1}", // {0} is copay part and {1} coinsurance part
	deductibleNoneCopayFormat: "{0}", // {0} is copay part
	deductibleBeforeCopayFormat: "{0}&nbsp;after<br>deductible", // {0} is copay part
	deductibleAfterCopayFormat: "{0}&nbsp;then<br>deductible", // {0} is copay part
	deductibleNoneCoinsuranceFormat: "{0}", // {0} is coinsurance part
	deductibleBeforeCoinsuranceFormat: "{0}&nbsp;after<br>deductible", // {0} is coinsurance part
	coveredCountFormat: " &mdash; up to {0} instances per year"
};

return mainConfig;
});

/**
 * @name MainConfig
 * @augments MpceConfig
 * @type {{
 *   general: object
 *   mainChartSection: object
 *   savingsAccountSection: object
 *   subconfigs: object.<string, object>
 *   subconfigsOrder: string[]
 *   subconfigsDefaultId: string
 *   personalFormItems: object
 *   taxCalculatorFormItems: object
 *   mpceChartDefaults: object
 *   mpceChartSeries: object.<string, MpceChartSingleSeries>
 *   mpceChartSeriesOrder: string[]
 *   fsaeChartDefaults: object
 *   appStrings: object.<string, string>
 * }}
 */

/**
 * @name MpceChartSingleSeries
 * @type {{
 *   description: string
 *   descriptionInPrintTable: ?string
 *   color: string
 *   displayInChart: ?string
 *   displayInLegend: ?string
 *   displayInPrintTable: ?string
 *   alternateDescription: ?string
 *   alternateDescriptionInPrintTable: ?string
 *   alternateColor: ?string
 * }}
 */
