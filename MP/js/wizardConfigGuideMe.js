//-------------------------------------------------------------------------------------------------
// wizardConfigGuideMe.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// This file contains the configuration and slide content for the optional guided Q&A feature. This is
// the traditional "Guide Me" version of the wizard, corresponding to the inputs in the full tool.
//

define([], function module() {
"use strict";

let wizardConfig = {};

//-------------------------------------------------------------------------------------------------
// general: Contains general/miscellaneous wizard options.
//
wizardConfig.general = {

	// nextButtonText: The text for the "Next" button at the bottom of the slides, for narrower windows.
	nextButtonText: "Next &gt;",

	// nextIconHtml: Markup for the next button that may appear at right, for wider windows.
	nextIconHtml: '<div class="buttonContainer"><i class="fad fa-chevron-circle-right"></i></div>',

	// previousButtonText: The text for the "Previous" button at the bottom of the slides, for narrower windows.
	previousButtonText: "&lt; Previous",

	// previousIconHtml: Markup for the previous button that may appear at left, for wider windows.
	previousIconHtml: '<div class="buttonContainer"><i class="fad fa-chevron-circle-left"></i></div>',

	// finalFullToolButtonText: The text for the "Full tool" button at the bottom of the last slide.
	finalFullToolButtonText: "Full tool &gt;",

	// checkCssClass: For answer button lists having the "includeCheck" CSS class, the following CSS classes
	// will be added to a div inserted before the selected answer button. Tip: "" suppresses all checkmarks.
	checkCssClass: "far fa-check-square",

	// selectOneText: Text for the default no-value option in any answer dropdowns that may be present.
	selectOneText: "(select one)"
};

//-------------------------------------------------------------------------------------------------
// sections: Defines the different sections that appear in the section map, at top. Each slide
//   will belong to one of these sections. Each section has an id, a title (which appears in the
//   title row of sectionMapTable), and a set of images for the track and the icon itself.
//
// Structure: Object mapping string section ids, each to an object with properties as follows:
//
// - title: The section's title, to appear centered below its icon image in the section map.
// - iconHtml: The icon markup for the section, appearing to the right of the track images.
//
// Notes: Adjust related styles in custom.wizard.css to indicate if track and/or icon can stretch.
//   A section that does not contain any slides permitted to be displayed will NOT appear in the
//   section map at all. Sections can be added/removed, but the original 8 are probably sufficient
//   for most clients.
//
wizardConfig.sections = {

	"sectionIntro": {
		// The introduction section is meant to describe the wizard and Q&A process to the user.
		title: "Getting Started",
		iconHtml: ''
	},

	"sectionAboutYou": {
		// The "about you" section is for gathering details specific to the user him/herself and their employment.
		title: "About You",
		iconHtml: ''
	},

	"sectionFamily": {
		// The family section is for gathering details about the user's family members; spouse, number of children, etc.
		title: "Your Family",
		iconHtml: ''
	},

	"sectionAdjustments": {
		// The adjustments section is for determining if any incentives, surcharges, or other adjustments may apply.
		title: "Rewards &amp;<br>Surcharges",
		iconHtml: ''
	},

	"sectionUtilization": {
		// The utilization section is where the user provides assumptions about each family member's health care usage.
		title: "Health Care<br>Usage",
		iconHtml: ''
	},

	"sectionSavingsAccounts": {
		// The savings account section is where the user can model optional contributions to available HSA/FSAs.
		title: "Tax-Advantaged Accounts"
	},

	"sectionFinalResults": {
		// The results section displays the main results similar to those in the full tool, with HSA/FSA funding.
		title: "Results",
		iconHtml: ''
	},

	"sectionYourMatch": {
		// The your match section shows the plan that best matches the answer to the plan preferences question and
		// also includes a slide for feedback.
		title: "<span class='planRecommendationEnabledOnly'>Your match</span><span class='planRecommendationNotEnabledOnly'>Feedback</span>"
	},

	"sectionPotentialTaxSavings": {
		// The potential tax savings section shows the tax calculator as well as a sample calculation of a tax savings.
		// The sample tax calculation is not included in the full tool.
		title: "Potential Tax Savings"
	}
};

//-------------------------------------------------------------------------------------------------
// sectionsOrder: An array defining the order in which sections are to be displayed in the section
//     map. Note that this does not affect the order in which slides are displayed -- this is just
//     for the positioning of the section map images.
//
wizardConfig.sectionsOrder = [
	"sectionIntro", "sectionAboutYou", "sectionFamily", "sectionAdjustments",
	"sectionUtilization", "sectionSavingsAccounts", "sectionFinalResults", "sectionYourMatch",
	"sectionPotentialTaxSavings"
];

//-------------------------------------------------------------------------------------------------
// summary: Contains configuration specific to the summary panel that appears on some slides. At
//   the moment, the only property expected here is htmlContent, which should contain the markup
//   for a div with CSS class "summary", and containing other classed elements to be populated at
//   runtime by the wizard and client-specific code. Section ids and slide ids can also be used
//   to conditionally show/hide elements based on whether the corresponding section is visible or
//   the corresponding slide is permitted to display.
//
// WARNING: The htmlContent string value below is quoted with single quotes and uses JavaScript's
//   backslash line continuation mechanism to span multiple lines. Be mindful of this! A missing or
//   extra backslash or unencoded single quote WILL break your wizard configuration! If you want to
//   include an apostrophe in your markup's content, do so with "&apos;". Double quotes are fine.
//
wizardConfig.summary = {

	htmlContent: '\
	<!-- ======================================== BEGIN summary ======================================== -->\
	<aside class="summary container-fluid">\
		<div class="row summaryRow">\
			<div class="col-12 mainHeader">Summary</div>\
			<div class="col-5 slideSubconfig subconfig">Group</div>\
			<div class="col-7 slideSubconfig"><span class="label label-info subconfig value">?</span></div>\
			<div class="col-5 slideRegion region">Region</div>\
			<div class="col-7 slideRegion"><span class="label label-info region value">?</span></div>\
			<div class="col-5 slideStatus status">Salary band</div>\
			<div class="col-7 slideStatus"><span class="label label-info status value">?</span></div>\
			\
			<div class="col-12 header sectionAdjustments">Rewards &amp; Surcharges</div>\
			<div class="col-5 slideWellnessRewards wellnessAnswer">Wellness rewards</div>\
			<div class="col-7 slideWellnessRewards"><span class="label label-info wellnessAnswer value">?</span></div>\
			<div class="col-5 slideTobaccoSurcharge tobaccoSurchargeAnswer">Tobacco surcharge</div>\
			<div class="col-7 slideTobaccoSurcharge"><span class="label label-info tobaccoSurchargeAnswer value">?</span></div>\
			<div class="col-5 slideSpouseSurcharge spouseSurchargeAnswer">Spouse/partner<br> surcharge</div>\
			<div class="col-7 slideSpouseSurcharge"><span class="label label-info spouseSurchargeAnswer value">?</span></div>\
			\
			<!-- ===== For when simplified modeling is enabled: ===== -->\
			<div class="col-12 showWhenModelingModeIsSimplified people">\
				<div class="row usageCategory general">\
					<div class="col-12 header usageCategory general">Health care usage</div>\
				</div>\
				<!-- header[Mini] divs classed "category2" below show instead of header above when multiple usage categories. -->\
				<div class="row usageCategory category2">\
					<div class="col-5 header usageCategory category2">Usage</div>\
					<div class="col-3 headerMini usageCategory category2"><span class="usageCategory usageCategoryName category1"></div>\
					<div class="col-4 headerMini usageCategory category2"><span class="usageCategory usageCategoryName category2"></div>\
				</div>\
				<div class="row primary">\
					<div class="col-5 primary">Yourself</div>\
					<div class="col-3 primary"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 primary"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row spouse">\
					<div class="col-5 spouse">Spouse/partner</div>\
					<div class="col-3 spouse"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 spouse"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row child1">\
					<div class="col-5 child1">Child #1</div>\
					<div class="col-3 child1"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 child1"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row child2">\
					<div class="col-5 child2">Child #2</div>\
					<div class="col-3 child2"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 child2"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row child3">\
					<div class="col-5 child3">Child #3</div>\
					<div class="col-3 child3"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 child3"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row child4">\
					<div class="col-5 child4">Child #4</div>\
					<div class="col-3 child4"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 child4"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
				<div class="row child5">\
					<div class="col-5 child5">Child #5</div>\
					<div class="col-3 child5"><span class="usageCategory category1 label label-info value">?</span></div>\
					<div class="col-4 child5"><span class="usageCategory category2 label label-info value">?</span></div>\
				</div>\
			</div>\
			\
			<!-- For when detailed modeling is enabled: -->\
			<div class="col-4 header showWhenModelingModeIsDetailed">Usage &mdash; My own scenario</div>\
			<div class="col-12 primary showWhenModelingModeIsDetailed" style="white-space: normal; line-height: 1.2;">\
				See details in the <i>Health Care Usage</i> section.\
			</div>\
			\
			<div class="col-12 header sectionSavingsAccounts anyContributionsFeature">Employee savings contributions</div>\
			<div class="col-5 slideSavings hsaContributionsFeature">HSA plans</div>\
			<div class="col-7 slideSavings hsaContributionsFeature">\
				<span class="label label-info hsaContributionAmount value">&ndash;</span>\
			</div>\
			<div class="col-5 slideSavings fsaContributionsFeature">FSA plans</div>\
			<div class="col-7 slideSavings fsaContributionsFeature">\
				<span class="label label-info fsaContributionAmount value">&ndash;</span>\
			</div>\
			<div class="col-5 slideSavings carryoverAmountFeature">2023 carryover</div>\
			<div class="col-7 slideSavings carryoverAmountFeature">\
				<span class="label label-info carryoverAmount value">&ndash;</span>\
			</div>\
			</div>\
		</div>\
	</aside>\
	<!-- ======================================== END summary ======================================== -->'
};

//-------------------------------------------------------------------------------------------------
// slides: Defines the different slides that may appear in the wizard. Whether a slide displays
//   or not depends on the return value from its permitDisplayWhen function, if defined. The
//   order in which slides are presented to the user is defined by slidesOrder.
//
// Structure: Object mapping string slide ids, each to an object with properties as follows:
//
// - sectionId: The id for the section that this slide belongs to.
// - titleHtml: The title to appear at the top of the slide. Generally, use an <h1> tag.
// - hideSummary: Whether or not to hide the slide summary area, usually displayed at right.
// - permitDisplayWhen: A function accepting (appData, config) and returning a boolean. If the
//     result is true, then the slide is eligible for display, else it remains hidden.
// - fallbackSlideId: If the current slide is no longer permitted to display, fallbackSlideId can
//     be used to specify another slide to display instead. When no fallbackSlideId is specified
//     and the current slide is no longer permitted to display, the tool will move to the nearest
//     previous slide permitted to display, or else the nearest next slide permitted to display.
// - htmlContent: The slide's HTML content. Slides may contain plain content only, or content with
//      questions for the user to answer. Answers to questions should be contained in an unordered
//      list element classed "answers". Answers typically filled based on values from dropdowns in
//      the full tool; see also wizardConfig.answerKinds.
//
// WARNING: The htmlContent string values below are quoted with single quotes and use JavaScript's
//   backslash line continuation mechanism to span multiple lines. Be mindful of this! A missing or
//   extra backslash or unencoded single quote WILL break your wizard configuration! If you want to
//   include an apostrophe in your markup's content, do so with "&apos;". Double quotes are fine.
//
/* eslint-disable max-len, quotes */
wizardConfig.slides = {

	"slideIntro": {
		sectionId: "sectionIntro",
		titleHtml: "<h1>Introduction</h1>",
		hideSummary: true,

		htmlContent: '\
		<!-- ======================================== BEGIN slideIntro ======================================== -->\
		<div class="row">\
			<div class="col-lg-7">\
				<p>\
					Welcome to the <span class="toolName">Medical Plan Cost Estimator</span> tool&apos;s Guide Me Q&amp;A\
					feature&mdash;an easy way for you to provide the information used by the tool to estimate potential costs\
					for each health plan option <i>tailored just for you.</i>\
				</p>\
				<p>\
					Follow the steps and answer the questions to provide information about yourself, the family members you wish\
					to cover, and each family member&apos;s potential health care needs during the upcoming plan year.\
				</p>\
				<p>\
					The tool will then provide estimates of what you might spend for each plan in the upcoming plan year&mdash;in\
					terms of both your recurring payroll contributions (premiums) <i>and</i> your estimated out-of-pocket costs&mdash;all\
					based on the coverage options and health care usage assumptions that you supplied.\
				</p>\
				<h2 class="prompt contentAboutArrowsBesideSlide">To get started, please click the arrow to the right.</h2>\
				<h2 class="prompt contentAboutButtonsBelowSlide">To get started, please click the "Next" button below.</h2>\
			</div>\
			<div class="col-lg-5 d-none d-lg-block text-center">\
				<img src="img/icons/icon-tablet.png" alt="Tablet computer" style="pointer-events: none;">\
			</div>\
		</div>\
		<!-- ======================================== END slideIntro ======================================== -->'
	},

	"slideSubconfig": {
		sectionId: "sectionAboutYou",
		titleHtml: "<h1>Employee group</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return config.personalFormItems.subconfigDropdown.displayWhen(appData, config); },

		htmlContent: '\
		<!-- ======================================== BEGIN slideSubconfig ======================================== -->\
		<p>\
			The health care plan options available to you depend on your employee group.\
		</p>\
		<h2 class="prompt">\
			Which group below applies to you?\
		</h2>\
		<ul class="answers subconfigAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="notInUse">\
			Not sure? <button data-bs-target="#modal_SubconfigHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific subconfigAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideSubconfig ======================================== -->'
	},

	"slideRegion": {
		sectionId: "sectionAboutYou",
		titleHtml: "<h1>Region</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return config.personalFormItems.regionDropdown.displayWhen(appData, config); },

		htmlContent: '\
		<!-- ======================================== BEGIN slideRegion ======================================== -->\
		<p>\
			The health care plan options available to you depend on your region.\
		</p>\
		<h2 class="prompt">\
			Which region below applies to you?\
		</h2>\
		<ul class="answers regionAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="notInUse">\
			Not sure? <button data-bs-target="#modal_RegionHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific regionAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideRegion ======================================== -->'
	},

	"slideStatus": {
		sectionId: "sectionAboutYou",
		titleHtml: "<h1>Salary band</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return config.personalFormItems.statusDropdown.displayWhen(appData, config); },

		htmlContent: '\
		<!-- ======================================== BEGIN slideStatus ======================================== -->\
		<p>\
			The health care plan premiums you pay depend on your salary band.\
		</p>\
		<h2 class="prompt">\
			Which salary band below applies to you?\
		</h2>\
		<ul class="answers statusAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p>\
			Not sure? <button data-bs-target="#modal_StatusHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific statusAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideStatus ======================================== -->'
	},

	"slideSpouse": {
		sectionId: "sectionFamily",
		titleHtml: "<h1>Spouse/partner coverage</h1>",

		htmlContent: '\
		<!-- ======================================== BEGIN slideSpouse ======================================== -->\
		<p>\
			Company health plans provide the option for you to cover your spouse or partner.\
		</p>\
		<h2 class="prompt">\
			Will your plan also be covering a spouse/partner?\
		</h2>\
		<ul class="answers partnerStatusAnswers list-inline with-icons"></ul> <!-- Automatically filled. -->\
		<p>\
			<b>Note:</b> A surcharge may apply if your spouse/partner has access to\
			their own coverage and you elect to provide them coverage.\
		</p>\
		<p class="answerSpecific partnerStatusAnswers answer-hasSpouseOrDP">\
			You selected to <b class="keyInfo animateChange">cover a spouse/partner</b>.\
		</p>\
		<p class="answerSpecific partnerStatusAnswers answer-noSpouseOrDP">\
			You selected to <b class="keyInfo animateChange">not cover a spouse/partner</b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideSpouse ======================================== -->'
	},

	"slideChildren": {
		sectionId: "sectionFamily",
		titleHtml: "<h1>Number of eligible children</h1>",

		htmlContent: '\
		<!-- ======================================== BEGIN slideChildren ======================================== -->\
		<p>\
			If you have children that are eligible to be covered, you can also elect coverage for them under a company\
			health plan.\
		</p>\
		<h2 class="prompt">\
			How many eligible children do you want to cover?\
		</h2>\
		<ul class="answers numChildrenAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="answerSpecific numChildrenAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerSpecific numChildrenAnswers answer-5">\
			<b>Note:</b> For more than five children, consider combining health care usage for\
			children to estimate your total family costs.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideChildren ======================================== -->'
	},

	"slideWellnessRewards": {
		sectionId: "sectionAdjustments",
		titleHtml: "<h1>Wellness rewards</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return config.personalFormItems.wellnessDropdown.displayWhen(appData, config); },

		htmlContent: '\
		<!-- ======================================== BEGIN slideWellnessRewards ======================================== -->\
		<p>\
			Employee annual plan premiums for some health plan options may be reduced if you are eligible for the wellness rewards.\
		</p>\
		<h2 class="prompt">\
			Are you eligible for the wellness rewards?\
		</h2>\
		<ul class="answers wellnessAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p>\
			Not sure? <button data-bs-target="#modal_WellnessRewardsHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific wellnessAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideWellnessRewards ======================================== -->'
	},

	"slideTobaccoSurcharge": {
		sectionId: "sectionAdjustments",
		titleHtml: "<h1>Tobacco usage</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) {
			return config.personalFormItems.tobaccoSurchargeDropdown.displayWhen(appData, config);
		},

		htmlContent: '\
		<!-- ======================================== BEGIN slideTobaccoSurcharge ======================================== -->\
		<p>\
			A surcharge may apply to annual plan premiums for some health plan options if an indicated individual is a tobacco user.\
		</p>\
		<h2 class="prompt">\
			Are you a tobacco user?\
		</h2>\
		<ul class="answers tobaccoSurchargeAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="notInUse">\
			Not sure? <button data-bs-target="#modal_TobaccoUsageHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific tobaccoSurchargeAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideTobaccoSurcharge ======================================== -->'
	},

	"slideSpouseSurcharge": {
		sectionId: "sectionAdjustments",
		titleHtml: "<h1>Spouse/partner surcharge</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) {
			return config.personalFormItems.spouseSurchargeDropdown.displayWhen(appData, config);
		},

		htmlContent: '\
		<!-- ======================================== BEGIN slideSpouseSurcharge ======================================== -->\
		<p>\
			A premium surcharge may apply if your spouse/partner is offered medical coverage through their employer but you choose to cover them instead.\
		</p>\
		<h2 class="prompt">\
			Does the spouse/partner surcharge apply?\
		</h2>\
		<ul class="answers spouseSurchargeAnswers includeCheck"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="notInUse">\
			Not sure? <button data-bs-target="#modal_SpouseSurchargeHelp" data-bs-toggle="modal">Tell me more</button>\
		</p>\
		<p class="answerSpecific spouseSurchargeAnswers answerTemplate">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select an answer to continue.</p>\
		<!-- ======================================== END slideSpouseSurcharge ======================================== -->'
	},

	"slideSimplifiedModeling": {
		sectionId: "sectionUtilization",
		titleHtml: "<h1>Health care usage assumptions<span class='bothModelingModesEnabledOnly'> &mdash; Quick scenarios</span></h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.personal.currentModelingMode === "simplified"; },
		fallbackSlideId: "slideDetailedModeling",

		htmlContent: '\
		<!-- ======================================== BEGIN slideSimplifiedModeling ======================================== -->\
		<p>\
			Think about the amount of health care that you and any covered family members may need\
			in the coming year. For each individual, use the buttons below to select from a variety of "Quick scenarios".\
		</p>\
		<p class="bothModelingModesEnabledOnly">\
			Alternatively, you could <button class="detailedModelingButton nakedButton">create your own scenario</button>\
			by customizing the frequency of each type of service.\
		</p>\
		<div class="utilizationAnswers showWhenModelingModeIsSimplified">\
			<div class="header row">\
				<div class="col-2 d-none d-md-block">&nbsp;</div>\
				<div class="col-5 ps-0 d-none d-md-block usageCategory category1">\
					<button data-bs-target="#dynamic" data-bs-toggle="modal" class="usageCategoryDynamicHelpModalId category1">\
						<i class="fa fa-info-circle pe-1"></i><span class="usageCategoryDescription category1"></span>\
					</button>\
				</div>\
				<div class="col-5 ps-0 d-none d-md-block usageCategory category2">\
					<button data-bs-target="#dynamic" data-bs-toggle="modal" class="usageCategoryDynamicHelpModalId category2">\
						<i class="fa fa-info-circle pe-1"></i><span class="usageCategoryDescription category2"></span>\
					</button>\
				</div>\
			</div>\
			<div class="primary individual row">\
				<div class="col-md-2 personLabel">Yourself:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers primaryUsage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers primaryUsage2 list-inline"></ul></div>\
			</div>\
			<div class="spouse individual row">\
				<div class="col-md-2 personLabel">Spouse/<br class="d-md-block d-none">partner:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers spouseUsage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers spouseUsage2 list-inline"></ul></div>\
			</div>\
			<div class="child1 individual row">\
				<div class="col-md-2 personLabel">Child 1:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers child1Usage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers child1Usage2 list-inline"></ul></div>\
			</div>\
			<div class="child2 individual row">\
				<div class="col-md-2 personLabel">Child 2:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers child2Usage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers child2Usage2 list-inline"></ul></div>\
			</div>\
			<div class="child3 individual row">\
				<div class="col-md-2 personLabel">Child 3:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers child3Usage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers child3Usage2 list-inline"></ul></div>\
			</div>\
			<div class="child4 individual row">\
				<div class="col-md-2 personLabel">Child 4:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers child4Usage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers child4Usage2 list-inline"></ul></div>\
			</div>\
			<div class="child5 individual row">\
				<div class="col-md-2 personLabel">Child 5:</div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category1"><span class="usageCategoryName category1"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category1"><ul class="answers child5Usage1 list-inline"></ul></div>\
				<div class="col-4 d-md-none categoryLabel usageCategory category2"><span class="usageCategoryName category2"></span>:</div>\
				<div class="col-8 col-md-5 px-0 usageCategory category2"><ul class="answers child5Usage2 list-inline"></ul></div>\
			</div>\
		</div>\
		<p style="margin-top: 1rem;">\
			<span class="usageCategories medical drugs">\
				For definitions of the different usage levels, please see the\
				<button data-bs-target="#modal_UsageCategoryHelp_Medical" data-bs-toggle="modal">medical usage assumptions</button> and the\
				<button data-bs-target="#modal_UsageCategoryHelp_Drugs" data-bs-toggle="modal">prescription usage assumptions</button>.\
			</span>\
			<span>\
				You can also view the\
				<button data-bs-target="#modal_CostAssumptionsHelp" data-bs-toggle="modal">cost assumptions for each service</button>.\
			</span>\
		</p>\
		<p class="answerRequired hiddenNotApplicable">Please select a usage level for each combination of individual and usage category.</p>\
		<!-- ======================================== END slideSimplifiedModeling ======================================== -->'
	},

	"slideDetailedModeling": {
		sectionId: "sectionUtilization",
		titleHtml: "<h1>Health care usage assumptions<span class='bothModelingModesEnabledOnly'> &mdash; My own scenario</span></h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.personal.currentModelingMode === "detailed"; },
		fallbackSlideId: "slideSimplifiedModeling",
		hideSummary: true,

		htmlContent: '\
		<!-- ======================================== BEGIN slideDetailedModeling ======================================== -->\
		<p>\
			Think about the amount of health care that you and any covered family members may need\
			in the coming year.\
		</p>\
		<p>\
			For each individual, you can customize the frequency of each type of service.\
			<span class="bothModelingModesEnabledOnly">\
				Alternatively, you could <button class="simplifiedModelingButton nakedButton">select from quick scenarios</button>.\
			</span>\
		</p>\
		<div class="d-lg-none alert alert-info alert-dismissible" role="alert">\
			<b>Tip:</b> Creating your own scenario works best on wider screens. If you&apos;re on a mobile device,\
			consider rotating your device to landscape mode while using the modeling interface.\
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\
		</div>\
		<div class="modelingContents detailedModelingContents showWhenModelingModeIsDetailed"></div>\
		<!-- ======================================== END slideDetailedModeling ======================================== -->'
	},

	"slidePriorities": {
		sectionId: "sectionUtilization",
		titleHtml: "<h1>Plan preferences</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.planRecommendationEnabled; },

		htmlContent: '\
		<!-- ======================================== BEGIN slidePriorities ======================================== -->\
		<p>\
			Choosing a health care plan can be a balancing act. Some people may prefer plans with lower premiums, while others\
			may prefer plans with lower anticipated total costs.\
		</p>\
		<p>\
			Another factor that might matter is whether a plan offers an associated savings account.\
		</p>\
		<h2 class="prompt">\
			In selecting a plan, what matters most to you?\
		</h2>\
		<div class="radioButtonsDiv planPriorityRadioButtons"><div data-action="personalFormItems|planPriorityRadioButtons"></div></div>\
		<div class="planPriorityDescription alert alert-secondary mt-2">\
			<p class="planPrioritySpecific none">\
				In the results, the tool will not highlight any specific plan.\
			</p>\
			<p class="planPrioritySpecific lowerPremiums">\
				In the results, the tool will highlight the plan with the lowest employee annual premiums.\
			</p>\
			<p class="planPrioritySpecific lowerOutOfPocketCosts">\
				In the results, the tool will highlight the plan with the lowest estimated out-of-pocket costs.\
			</p>\
			<p class="planPrioritySpecific lowerTotalCosts">\
				In the results, the tool will highlight the plan with the lowest overall employee total costs (i.e.\
				including an estimate for anticipated out-of-pocket costs.)\
			</p>\
			<p class="planPrioritySpecific lowerWorstCaseCosts">\
				In the results, the tool will highlight the plan with the lowest estimated employee worst case total costs\
				(i.e. including an estimate for potential worst case out-of-pocket costs.)\
			</p>\
			<p class="planPrioritySpecific HSA">\
				In the results, the tool will highlight the plan with access to a Health Savings Account (HSA)\
				that has the lowest estimated employee total costs.\
			</p>\
		</div>\
		<!-- ======================================== END slidePriorities ======================================== -->'
	},

	"slideSavingsIntroduction": {
		sectionId: "sectionSavingsAccounts",
		titleHtml: "<h1>Optional accounts</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.anyContributionsFeature; },

		htmlContent: '\
		<!-- ======================================== BEGIN slideSavingsIntroduction ============================ -->\
		<p>\
			Your results are almost ready &mdash; the last thing to consider is whether you want to\
			contribute to a tax-advantaged account to lower your costs.\
		</p>\
		<p>\
			To help you save on taxes, each health plan offers an associated account that you can contribute\
			pre-tax dollars to: either a <strong>Health Savings Account (HSA)</strong> or a <strong>Flexible\
			Spending Account (FSA)</strong>. You can then use these tax-free funds to pay for out-of-pocket\
			costs (deductibles, copays, and coinsurance) and other eligible medical, vision, and dental expenses.\
		</p>\
		<h2>HSA vs. FSA: What’s the difference?</h2>\
		<h3 class="prompt">Health Savings Account (HSA)</h3>\
		<p>\
			You can contribute to an HSA only if you&apos;re enrolled in a high-deductible health plan (HDHP).\
			Money in an HSA is always yours to keep. Any funds you don&apos;t use during the plan year remain\
			yours and carry over each year. HSA funds can be invested, and your money grows tax-free, similar to\
			a retirement account. You can use the funds to pay for eligible health care expenses now or\
			later&ndash;even in retirement.\
			<div class="videoLibraryEnabledOnly">\
				<button class="videoLibraryButton"\
					data-bs-target="#modal_SpecificVideo_HSA" data-bs-toggle="modal">Learn more about the HSA</button>.\
			</div>\
		</p>\
		<h3 class="prompt">Flexible Spending Account (FSA)</h3>\
		<p>\
			You can contribute to a health care FSA instead if you do not enroll in an HDHP. FSA funds are subject\
			to a "use it or lose it" rule. For this reason, you should carefully estimate the amount to contribute\
			to an FSA. Any FSA balance not spent at the end of the plan year will be forfeited. In some cases, a\
			limited amount of unused FSA funds may be carried over. Be sure to check your plan&apos;s specific rules.\
			<div class="videoLibraryEnabledOnly">\
				<button class="videoLibraryButton"\
					data-bs-target="#modal_SpecificVideo_FSA" data-bs-toggle="modal">Learn more about the FSA</button>.\
			</div>\
		</p>\
		<br>\
		<p>\
			<strong>Next, you&apos;ll indicate how much you plan to contribute to an HSA or FSA.</strong>\
		</p>\
		<!-- ======================================== END slideSavingsIntroduction ============================ -->'
	},

	"slideSavings": {
		sectionId: "sectionSavingsAccounts",
		titleHtml: "<h1>Optional account contributions</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.anyContributionsFeature; },

		htmlContent: '\
		<!-- ======================================== BEGIN slideSavings ======================================== -->\
		<p>\
			Enter your expected annual account contributions below.\
		</p>\
		<table>\
			<tr class="hsaContributionsFeature hsaSliderRow savingsAccountSliderRow">\
				<td colspan="2">\
					<h3 class="prompt mb-1">What is your maximum desired contribution to an HSA?</h3>\
					<div class="slider hsaSlider noSliderLiveUpdating"></div>\
					<input class="sliderTextInput hsaSliderTextInput" title="Desired HSA contribution amount" maxlength="7">\
					<div class="sliderMaximumNote">&nbsp;&nbsp;(up to <span class="hsaSliderMaximum">$_,___</span>)</div>\
				</td>\
			</tr>\
			<tr class="hsaContributionsFeature over55Row">\
				<td>\
					<input type="checkbox" id="wizOver55" name="over55" class="over55" value="over55" title="Over age 55">\
				</td>\
				<td>\
					<label for="wizOver55" style="max-width: 530px;">\
						Check the box if you will be 55 or older to allow up to $1,000 more to an HSA, per IRS rules.\
					</label>\
				</td>\
			</tr>\
			<tr class="fsaContributionsFeature fsaSliderRow savingsAccountSliderRow">\
				<td colspan="2">\
					<h3 class="prompt mt-3 mb-1">What is your maximum desired contribution to an FSA?</h3>\
					<div class="slider fsaSlider noSliderLiveUpdating"></div>\
					<input class="sliderTextInput fsaSliderTextInput" title="Desired FSA contribution amount" maxlength="7">\
					<div class="sliderMaximumNote">&nbsp;&nbsp;(up to <span class="fsaSliderMaximum">$_,___</span>)</div>\
				</td>\
			</tr>\
			<tr class="carryoverAmountFeature carryoverSliderRow savingsAccountSliderRow">\
				<td colspan="2">\
					<h3 class="prompt mt-3 mb-1">How much in unused account funds could you carry over from 2023, if any?</h3>\
					<div class="slider carryoverSlider noSliderLiveUpdating"></div>\
					<input class="sliderTextInput carryoverSliderTextInput" title="Funds carried over" maxlength="7">\
				</td>\
			</tr>\
		</table>\
		<!-- ======================================== END slideSavings ======================================== -->'
	},

	"slideFinalResults": {
		sectionId: "sectionFinalResults",
		titleHtml: "<h1>Results</h1>",

		htmlContent: '\
		<!-- ======================================== BEGIN slideFinalResults ======================================== -->\
		<p class="px-0 col-xl-7 col-lg-7 col-sm-12">\
			This chart shows your estimated annual cost for each health plan option. Continue to the next\
			slide where you&apos;ll see your personalized "best match" plan recommendation.\
			<span class="fullToolEnabledOnly">\
				You can also use the <button class="clickGoesToFullTool nakedButton">full tool</button> to see\
				your cost estimates update as you make changes to your assumptions.\
			</span>\
		</p>\
		<div class="chartArea col-xl-6 col-lg-7 ps-0 float-start">\
			<div class="chartOptions">\
				<div class="showWorstCaseCostsItem form-check form-check-inline">\
					<input type="checkbox" id="showWorstCaseCosts2" class="showWorstCaseCosts form-check-input" value="showWorstCaseCosts">\
					<label class="form-check-label" for="showWorstCaseCosts2">Show employee worst case costs in the chart</label>\
				</div>\
				<div class="showTotalCostsItem form-check form-check-inline">\
					<input type="checkbox" id="showTotalCosts2" class="showTotalCosts form-check-input" value="showTotalCosts">\
					<label class="form-check-label" for="showTotalCosts2">Include company and plan costs in the chart</label>\
				</div>\
			</div>\
			<div class="mpceChartTitle d-table w-100">\
				<span class="coverageLevelHeading">Coverage level: <span class="coverageLevel"></span></span>\
				<span class="planProvisionsFeature noPrint d-table-cell text-end align-bottom pe-1">\
					<button class="planProvisionsButton" data-bs-target="#modal_PlanProvisions" data-bs-toggle="modal">\
						<i class="fal fa-table"></i>See plan provisions</button>\
				</span>\
			</div>\
			<div class="mainChartTopNotesCopy">\
				<!-- At runtime, gets filled with a copy of mainChartTopNotes from full tool. -->\
			</div>\
			<div id="wizardChart2" class="hchart mpceChart"></div>\
			<div class="mainChartFootnotesCopy">\
				<!-- At runtime, gets filled with a copy of mainChartFootnotes from full tool. -->\
			</div>\
		</div>\
		<div class="col-lg-5 offset-xl-1 ps-0 pe-0 float-end">\
			<div class="anyContributionsFeature applyFundsToCostOfCareFeature">\
				<h3 class="prompt mt-3 mb-1">Using the tax-advantaged accounts</h3>\
				Select the funding sources you would like to apply toward your out-of-pocket costs for care.\
				Based on your selection, the table below will show how these funds are used with each health plan:\
				<select class="answers applyFundsAnswers includeCheck form-control form-select mt-1"></select>\
				<p class="answerRequired hiddenNotApplicable">Please select the funding sources you would like to apply toward the cost of care.</p>\
			</div>\
			<div class="anyContributionsFeature mainResultsTableDivCopy">\
				<!-- At runtime, this div is filled with a copy of the contents of mainResultsTableDiv from the main tool. -->\
			</div>\
			<div class="resultTips alert alert-secondary fullToolNotEnabledOnly">\
				<p>To see the impact of changing your assumptions, use the "Previous" button to navigate back through the questions.</p>\
			</div>\
		</div>\
		<!-- ======================================== END slideFinalResults ======================================== -->'
	},

	"slideYourMatch": {
		sectionId: "sectionYourMatch",
		titleHtml: "<h1>Your match</h1>",
		hideSummary: true,
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.planRecommendationEnabled; },

		htmlContent: '\
		<!-- ======================================== BEGIN slideYourMatch ======================================== -->\
		<div class="alert alert-success">\
			<div class="bestMatchPlan">\
				<table border="0" cellpadding="0" cellspacing="0">\
					<tr>\
						<td class="icon">\
							<img class="bestMatchIcon" src="img/icons/icon-bestmatch.svg" alt="Best Match badge icon">\
						</td>\
						<td class="text">\
							Based on your inputs and what you indicated matters most to you, the plan with\
							<span class="planPrioritySpecific lowerPremiums">the lowest employee annual premiums is the</span>\
							<span class="planPrioritySpecific lowerOutOfPocketCosts">the lowest estimated out-of-pocket costs is the</span>\
							<span class="planPrioritySpecific lowerTotalCosts">the lowest estimated employee total costs is the</span>\
							<span class="planPrioritySpecific lowerWorstCaseCosts">lowest estimated employee worst case total costs is the</span>\
							<span class="planPrioritySpecific HSA">access to an HSA with the lowest estimated employee total costs is the</span>\
							<span class="planPrioritySpecific FSA">access to an FSA with the lowest estimated employee total costs is the</span>\
							<span class="recommendedPlanName prompt"></span>.\
						</td>\
					</tr>\
				</table>\
			</div>\
			<div class="NoMatchPlan">\
				<table border="0" cellpadding="0" cellspacing="0">\
					<tr>\
						<td class="text">\
							You haven’t selected an answer for what is most important to you when choosing a medical plan.\
							If you would like to choose what is most important to you so a match can be determined, please go\
							back to the Plan Preferences page in the Health Care Usage section.\
						</td>\
					</tr>\
				</table>\
			</div>\
		</div>\
		<div class="planProvisionsFeature table-responsive">\
			<div class="dynamicPlanProvisions">\
				<div class="preamble">\
					<div class="alert alert-warning" style="font-size:0.8em; padding: 5px 10px;">\
						<b>This table describes only the subset of plan provisions and services that are modeled in\
						this tool</b> and is not a substitute for plan documents. For complete terms and conditions,\
						refer to official plan documents. In the event of any discrepancy between information contained\
						in this tool and official plan documents, the latter shall govern in all cases.\
					</div>\
				</div>\
				<table class="planProvisionsTable medicalPlanProvisionsTable selectedMedicalPlanProvisionsTable"></table>\
				<br>\
			</div> <!-- class="dynamicPlanProvisions" -->\
		</div>\
		<!-- ======================================== END slideYourMatch ======================================== -->'
	},

	"slideSurvey": {
		sectionId: "sectionYourMatch",
		titleHtml: "<h1>Give us your feedback</h1>",
		hideSummary: true,
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.simpleFeedbackEnabled; },
		htmlContent: '\
		<!-- ======================================== BEGIN slideSurvey ======================================== -->\
		<p>\
			<strong>We&apos;d love to know if this tool was helpful to you as you make your health plan decisions.</strong>\
			Feedback is optional and anonymous.\
			<span class="taxCalculatorEnabledOnly">If you would prefer to not provide feedback, you can proceed to\
			the tax calculator to evaluate your potential tax savings.</span>\
		</p>\
		<h3 class="prompt">1.) Which plan do you think you will enroll in? <small>(feedback only &mdash; does not enroll you)</small></h3>\
		<div class="planRecommendationEnabledOnly bestMatchPlan">\
			<p>\
				The plan that best matched your inputs is the <strong><span class="prompt"></span></strong>.\
			</p>\
		</div>\
		<ul class="answers yourMatchingPlanAnswers list-inline"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p class="answerSpecific yourMatchingPlanAnswers answerTemplate notInUse">\
			You selected <b class="keyInfo animateChange description"></b>.\
		</p>\
		<p>&nbsp;</p>\
		<h3 class="prompt">2.) Did this tool help you with your health plan choice?</h3>\
		<p>\
			1 is not helpful at all, 5 is very helpful.\
		</p>\
<!-- TODO: remove this ul question. It is classed as notInUse to trick the tool into allowing the person\
				to navigate next without answer any of the other questions -->\
		<ul class="answers list-inline notInUse">\
			<li class="answers btn">test 1</li>\
			<li>test 2</li>\
		</ul>\
		<ul class="answers yourMatchRatingAnswers list-inline"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<!-- ======================================== END slideSurvey ======================================== -->'
	},

	"slidePotentialTaxSavings": {
		sectionId: "sectionPotentialTaxSavings",
		titleHtml: "<h1>Potential tax savings from contributing to a HSA or FSA</h1>",
		hideSummary: true,
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.taxCalculatorEnabled; },

		htmlContent: '\
		<!-- ======================================== BEGIN slidePotentialTaxSavings ======================================== -->\
		<p>\
			With a <span class="prompt">$2,500</span> contribution, for example, you could potentially have a tax savings\
			of <span class="prompt">$916.</span>\
		</p>\
		<p>\
			Example tax savings is based on a 24% federal income tax, 5% state income tax* and 7.65% in payroll tax.\
			Your tax savings may vary. With a Health Savings Account (HSA) or Flexible Spending Account (FSA),\
			you make tax-free contributions from your pay to your account. Then, you can make withdrawals to pay\
			for eligible health care expenses tax-free, which saves you money.\
		</p>\
		<p>\
			Note that only high-deductible health plans allow you to contribute to an HSA, which offers additional\
			advantages over a Health Care FSA, such as higher contribution limits and the ability to carry over any\
			unused balance year after year.\
		</p>\
		<p class="small">\
			<i>* Contributions are not subject to federal income tax. However, HSA contributions are currently\
			subject to state income tax in CA and NJ. Consult with your tax advisor to understand the potential\
			tax implications of enrolling in an HSA and/or FSA.</i>\
		</p>\
		<div class="col-lg-12 ps-0 pt-3 taxCalculatorEnabledOnly" style="clear: both;">\
			<h2 class="prompt">View your potential tax savings</h2>\
			<p>\
				Use this tax calculator to see the benefits of contributing to a plan&apos;s associated tax-advantaged\
				account.\
			</p>\
			<p>Select a plan in the dropdown menu below and then click "Show the tax calculator".</p>\
			<div class="row">\
				<div class="col-md-5 pe-0"><select class="taxCalcPlanSelect form-control form-select" title="Select a plan"></select></div>\
				<div class="col-md-7"><button class="btnSwitchToTaxView btn btn-primary btnSwitchToTaxView">Show the tax calculator</button></div>\
			</div>\
		</div>\
		<p>&nbsp;</p>\
		<div class="col-lg-7 resultTips alert alert-secondary fullToolEnabledOnly">\
			<p>To see the impact of changing your assumptions, you could either:</p>\
			<ul>\
				<li>Use the "Previous" button to navigate back through the questions, or</li>\
				<li>\
					Try the <button class="clickGoesToFullTool nakedButton"><b>full tool</b></button>,\
					where the results update as you make changes.\
				</li>\
			</ul>\
		</div>\
		<!-- ======================================== END slidePotentialTaxSavings ======================================== -->'
	}
};
/* eslint-enable max-len, quotes */

//-------------------------------------------------------------------------------------------------
// slidesOrder: An array defining the order in which slides are to be displayed as the user
//   navigates using the next/previous buttons. Slides that are mentioned below yet return
//   false for permitDisplayWhen() above are skipped.
//
wizardConfig.slidesOrder = [
	"slideIntro",
	"slideSubconfig",
	"slideRegion",
	"slideStatus",
	"slideSpouse",
	"slideChildren",
	"slideWellnessRewards",
	"slideTobaccoSurcharge",
	"slideSpouseSurcharge",
	"slideSimplifiedModeling",
	"slideDetailedModeling",
	"slidePriorities",
	"slideSavingsIntroduction",
	"slideSavings",
	"slideFinalResults",
	"slideYourMatch",
	"slideSurvey",
	"slidePotentialTaxSavings"
];

//-------------------------------------------------------------------------------------------------
// additionalHelpModalsHtml: A string containing additional help-modal elements specific to the
//   wizard. At runtime, this content is inserted into the element #vueAppExtraHelpModalsForWizard
//   (see home.htm). A Vue instance is created for that element to define these additional modals.
//   If the wizard configuration does not require any additional help modals, set this to null.
//
wizardConfig.additionalHelpModalsHtml = null; // Currently using the same set of modals from the full tool.

//-------------------------------------------------------------------------------------------------
// answerKinds: Defines the different sets of answers that may appear on slides in the wizard.
//
// Structure: Object mapping string answer kind ids, each to an object with properties as follows:
//
// - syncWithDropdownClass: Optional string for the id of a dropdown in the main tool, usually as in
//     mainConfig.personalFormItems, whose visible options will become the list of visible answers
//     for this answer kind. If not syncing with a dropdown, use properties "ordered" and "full"
//     to specify the list of options for this answer kind.
// - summaryValueSelector: A selector string for locating, within the summary area, the value for
//     this answer kind. This selector is used to both update the answer value in the summary area,
//     and for the transfer effect that occurs when the user selects an answer.
// - ordered: For answer option sets that do not sync with a dropdown, an array of strings defining
//     the ordering and contents of each answer option defined in the "full" object.
// - full: For answer option sets that do not sync with a dropdown, an object mapping string ids to
//     objects, and each object is expected to have a "description" string property. This object can
//     also optionally be included when syncing with a dropdown, to provide an alternate description
//     specific to the wizard, or to specify optional iconHtml for buttons that are to have an icon.
// - linkCssClass: The set of CSS classes that each generated answer link is to be classed with.
//     If not specified, defaults to "btn btn-secondary".
//
/* eslint-disable max-len */
wizardConfig.answerKinds = {

	"subconfigAnswers": { syncWithDropdownClass: "subconfigDropdown", summaryValueSelector: ".value.subconfig" },
	"regionAnswers": { syncWithDropdownClass: "regionDropdown", summaryValueSelector: ".value.region" },
	"statusAnswers": { syncWithDropdownClass: "statusDropdown", summaryValueSelector: ".value.status" },
	"partnerStatusAnswers": {
		syncWithDropdownClass: "partnerStatusDropdown",
		full: {
			"noSpouseOrDP": { description: "No, just me.", iconHtml: '<i class="fas fa-user"></i>' },
			"hasSpouseOrDP": { description: "Yes, include my spouse/partner.", iconHtml: '<i class="fas fa-user-plus"></i>' }
		}
	},
	"numChildrenAnswers": { syncWithDropdownClass: "numberOfChildrenDropdown" },
	"applyFundsAnswers": { syncWithDropdownClass: "applyFundsToCostOfCareDropdown", summaryValueSelector: ".value.applyFundsToCostOfCareOption" },
	"wellnessAnswers": { syncWithDropdownClass: "wellnessDropdown", summaryValueSelector: ".value.wellnessAnswer" },
	"tobaccoSurchargeAnswers": { syncWithDropdownClass: "tobaccoSurchargeDropdown", summaryValueSelector: ".value.tobaccoSurchargeAnswer" },
	"spouseSurchargeAnswers": { syncWithDropdownClass: "spouseSurchargeDropdown", summaryValueSelector: ".value.spouseSurchargeAnswer" },
	"yourMatchingPlanAnswers": { syncWithDropdownClass: "yourMatchingPlanDropdown" },
	"yourMatchRatingAnswers": { syncWithDropdownClass: "yourMatchRatingDropdown" },
	"modelingModeAnswers": {
		syncWithDropdownClass: "modelingModeDropdown",
		full: {
			"simplified": { description: "Select from quick scenarios" },
			"detailed": { description: "Create my own scenario" },
			"chronicConditioned": { description: "Chronic conditions scenario" }
		}
	},
	// Usage option answers for usage category #1
	"primaryUsage1": { syncWithDropdownClass: "primary-s1", summaryValueSelector: ".primary .category1.value" },
	"spouseUsage1": { syncWithDropdownClass: "spouse-s1", summaryValueSelector: ".spouse .category1.value" },
	"child1Usage1": { syncWithDropdownClass: "child1-s1", summaryValueSelector: ".child1 .category1.value" },
	"child2Usage1": { syncWithDropdownClass: "child2-s1", summaryValueSelector: ".child2 .category1.value" },
	"child3Usage1": { syncWithDropdownClass: "child3-s1", summaryValueSelector: ".child3 .category1.value" },
	"child4Usage1": { syncWithDropdownClass: "child4-s1", summaryValueSelector: ".child4 .category1.value" },
	"child5Usage1": { syncWithDropdownClass: "child5-s1", summaryValueSelector: ".child5 .category1.value" },
	// Usage option answers for usage category #2
	"primaryUsage2": { syncWithDropdownClass: "primary-s2", summaryValueSelector: ".primary .category2.value" },
	"spouseUsage2": { syncWithDropdownClass: "spouse-s2", summaryValueSelector: ".spouse .category2.value" },
	"child1Usage2": { syncWithDropdownClass: "child1-s2", summaryValueSelector: ".child1 .category2.value" },
	"child2Usage2": { syncWithDropdownClass: "child2-s2", summaryValueSelector: ".child2 .category2.value" },
	"child3Usage2": { syncWithDropdownClass: "child3-s2", summaryValueSelector: ".child3 .category2.value" },
	"child4Usage2": { syncWithDropdownClass: "child4-s2", summaryValueSelector: ".child4 .category2.value" },
	"child5Usage2": { syncWithDropdownClass: "child5-s2", summaryValueSelector: ".child5 .category2.value" }
};

return wizardConfig; // important!
}); // important!

/**
* @name WizardConfig
* @type {{
*   general: object.<string, string>
*   sections: object.<string, WizardSection>
*   sectionsOrder: string[]
*   summary: object.<string, string>
*   slides: object.<string, WizardSlide>
*   slidesOrder: string[]
*   additionalHelpModalsHtml: ?string
*   vueComponentTemplates: object.<string, string>
*   answerKinds: object.<string, AnswerKind>
*   allPersonas: object.<string, Persona>
* }}
*/

/**
* @name WizardSection
* @type {{
*   title: string
*   iconHtml: string
* }}
*/

/**
* @name WizardSlide
* @type {{
*   sectionId: string
*   titleHtml: string
*   hideSummary: ?boolean
*   permitDisplayWhen: ?Function
*   htmlContent: string
* }}
*/

/**
* @name AnswerKind
* @type {{
*   syncWithDropdownClass: ?string
*   summaryValueSelector: ?string
*   ordered: ?string[]
*   full: ?object
*   linkCssClass: ?string
* }}
*/

/**
 * @name Persona
 * @type {{
 *   primaryName: ?string
 *   spouseName: ?string
 *   child1Name: ?string
 *   child2Name: ?string
 *   child3Name: ?string
 *   child4Name: ?string
 *   child5Name: ?string
 *   imageHtml: string
 *   usageDescription: string
 *   usageAssumptions: object.<string, object.<string, string>>
 *   basicDescription: string
 *   preferenceDescriptions: object.<string, string>
 * }}
 */
