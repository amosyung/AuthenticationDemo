//-------------------------------------------------------------------------------------------------
// wizardConfigPersonas.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// This file contains the configuration and slide content for the optional guided Q&A feature. This is
// the Personas version of the wizard, to show the user a sample persona having similar coverage needs.
//

define(["utility"], function module(utility) {
"use strict";

let wizardConfig = {};

//-------------------------------------------------------------------------------------------------
// general: Contains general/miscellaneous wizard options.
//
wizardConfig.general = {

	// previousButtonText: The text for the "Previous" button at the top of the slides.
	previousButtonText: "Go back&nbsp;&nbsp;<i class='fa fa-reply'></i>",

	// videoLibraryButtonText: The text for the video library "Learn More" button at the top of the slides.
	videoLibraryButtonText: "<i class=\"fas fa-play-circle\" style=\"padding: 2px 2px 0 0;\"></i>&nbsp;Learn more"
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

	"sectionAboutYou": {
		title: "Salary"
	},

	"sectionCoverage": {
		title: "Coverage"
	},

	"sectionUsage": {
		title: "Usage"
	},

	"sectionPreference": {
		title: "Preference"
	},

	"sectionMatch": {
		title: "Your Match"
	},

	"sectionCosts": {
		title: "Total Costs"
	},

	"sectionDetails": {
		title: "How It Adds Up"
	},

	"sectionFeedback": {
		title: "Feedback"
	}
};

//-------------------------------------------------------------------------------------------------
// sectionsOrder: An array defining the order in which sections are to be displayed in the section
//     map. Note that this does not affect the order in which slides are displayed -- this is just
//     for the positioning of the section map images.
//
wizardConfig.sectionsOrder = [
	"sectionAboutYou", "sectionCoverage", "sectionUsage", "sectionPreference", "sectionMatch", "sectionCosts", "sectionDetails", "sectionFeedback"
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
wizardConfig.summary = null; // The summary panel isn't used in the personas version of the wizard

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

	"slideStatus": {
		sectionId: "sectionAboutYou",
		titleHtml: "<h1>What is your annual salary?&nbsp;<button data-bs-target=\"#modal_slideStatus\" data-bs-toggle=\"modal\" title=\"Help\"><i class=\"far fa-info-circle\"></i></button></h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return config.personalFormItems.statusDropdown.displayWhen(appData, config); },
		fallbackSlideId: "slideCoverage",
		htmlContent: '\
		<!-- ======================================== BEGIN slideStatus ======================================== -->\
		<ul class="answers statusAnswers list-inline with-icons"></ul>\
		<p class="answerRequired hiddenNotApplicable text-center">Please select an answer to continue.</p>\
		<div class="text-center"><button class="nextButton btn btn-lg btn-primary">Next <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<!-- ======================================== END slideStatus ======================================== -->'
	},

	"slideCoverage": {
		sectionId: "sectionCoverage",
		titleHtml: '<h1>Who do you plan to cover?&nbsp;<button data-bs-target="#modal_slideCoverage" data-bs-toggle="modal" title="Help"><i class="far fa-info-circle"></i></button></h1>',
		htmlContent: '\
		<!-- ======================================== BEGIN slideCoverage ======================================== -->\
		<ul class="answers coverageLevelAnswers list-inline with-icons"></ul>\
		<p class="answerRequired hiddenNotApplicable text-center">Please select an answer to continue.</p>\
		<div class="text-center"><button class="nextButton btn btn-lg btn-primary">Next <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<!-- ======================================== END slideCoverage ======================================== -->'
	},

	"slideUsage": {
		sectionId: "sectionUsage",
		titleHtml: '<h1>How much care will you need?&nbsp;<button data-bs-target="#modal_slideUsage" data-bs-toggle="modal" title="Help"><i class="far fa-info-circle"></i></button></h1>',
		htmlContent: '\
		<!-- ======================================== BEGIN slideUsage ======================================== -->\
		<ul class="answers usageAnswers list-inline with-icons enableHoverAnswerText"></ul>\
		<div class="hoverAnswerText row text-center hiddenNotApplicable"><div class="alert alert-light col-sm-8 offset-sm-2"></div></div>\
		<div class="selectedAnswerText row text-center">\
			<div class="answerSpecific usageAnswers answer-low alert alert-warning col-sm-8 offset-sm-2">\
				I&apos;ll probably only visit the doctor for checkups and the occasional illness or minor injury.\
			</div>\
			<div class="answerSpecific usageAnswers answer-moderate alert alert-warning col-sm-8 offset-sm-2">\
				I have a medical condition that needs frequent attention, but my doctor and I have it under control.\
			</div>\
			<div class="answerSpecific usageAnswers answer-high alert alert-warning col-sm-8 offset-sm-2">\
				I have a serious medical condition, or expect to be hospitalized, or am having a baby.\
			</div>\
		</div>\
		<p class="answerRequired hiddenNotApplicable text-center">Please select an answer to continue.</p>\
		<div class="text-center"><button class="nextButton btn btn-lg btn-primary">Next <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<!-- ======================================== END slideUsage ======================================== -->'
	},

	"slidePreference": {
		sectionId: "sectionPreference",
		titleHtml: '<h1>In choosing a plan, what matters most to you?&nbsp;<button data-bs-target="#modal_slidePreference" data-bs-toggle="modal" title="Help"><i class="far fa-info-circle"></i></button></h1>',
		htmlContent: '\
		<!-- ======================================== BEGIN slidePreference ======================================== -->\
		<ul class="answers preferenceAnswers list-inline with-icons enableHoverAnswerText"></ul>\
		<div class="hoverAnswerText row text-center hiddenNotApplicable"><div class="alert alert-light col-sm-8 offset-sm-2"></div></div>\
		<div class="selectedAnswerText row text-center">\
			<div class="answerSpecific preferenceAnswers answer-lowerPremiums alert alert-warning col-sm-8 offset-sm-2">\
				This means your "best match" plan will have the lowest annual paycheck premiums.\
			</div>\
			<div class="answerSpecific preferenceAnswers answer-lowerOutOfPocketCosts alert alert-warning col-sm-8 offset-sm-2">\
				This means your "best match" plan will have the lowest estimated out-of-pocket costs.\
			</div>\
			<div class="answerSpecific preferenceAnswers answer-lowerTotalCosts alert alert-warning col-sm-8 offset-sm-2">\
				This means your "best match" plan will have the lowest estimated total costs.\
			</div>\
			<div class="answerSpecific preferenceAnswers answer-HSA alert alert-warning col-sm-8 offset-sm-2">\
				This means your "best match" plan will be an HSA-eligible plan with the lowest estimated total costs.\
			</div>\
		</div>\
		<p class="answerRequired hiddenNotApplicable text-center">Please select an answer to continue.</p>\
		<div class="text-center"><button class="nextButton btn btn-lg btn-primary">Next <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<!-- ======================================== END slidePreference ======================================== -->'
	},

	"slideMatch": {
		sectionId: "sectionMatch",
		titleHtml:
			"<h1>Your match: <span class='vueAppPersonasHost font-weight-normal'>\
				<match-name></match-name>\
			</span></h1>",
		htmlContent: '\
		<!-- ======================================== BEGIN slideMatch ======================================== -->\
		<div class="vueAppPersonasHost col-sm-10 offset-sm-1 mb-1 px-0">\
			<your-match></your-match>\
		</div>\
		<div class="text-center py-2"><button class="nextButton btn btn-lg btn-primary">Find out why <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<!-- ======================================== END slideMatch ======================================== -->'
	},

	"slideCosts": {
		sectionId: "sectionCosts",
		titleHtml: '<h1>Total costs&nbsp;<button data-bs-target="#modal_slideCosts" data-bs-toggle="modal" title="Help"><i class="far fa-info-circle"></i></button></h1>',
		htmlContent: '\
		<!-- ======================================== BEGIN slideCosts ======================================== -->\
		<div class="col-sm-10 offset-sm-1 text-center mb-4 px-0">\
			<div class="vueAppPersonasHost">\
				<p>\
					Take a look at how <match-name></match-name>&apos;s\
					total costs (paycheck costs + out-of-pocket costs) compare with each medical plan.\
				</p>\
				<plan-tiles view="totalCosts" amount-description="total costs"></plan-tiles>\
			</div>\
		</div>\
		<div class="text-center"><button class="nextButton btn btn-lg btn-primary">See details <i class="fa fa-chevron-right ps-1"></i></button></div>\
		<div class="text-center pt-3 small">\
			<span class="keyInfo">This situation may not be exactly the same as yours.</span><br>\
			You can customize this cost estimate using the <button class="clickGoesToFullTool nakedButton">interactive calculator &raquo;</button>.\
		</div>\
		<!-- ======================================== END slideCosts ======================================== -->'
	},

	"slideDetails": {
		sectionId: "sectionDetails",
		titleHtml: "<h1>How it adds up</h1>",
		htmlContent: '\
		<!-- ======================================== BEGIN slideDetails ======================================== -->\
		<div id="slideDetailsCarousel" class="carousel" data-bs-interval="false" data-bs-touch="false">\
			<ol class="carousel-indicators d-none d-xl-flex">\
				<li data-bs-target="#slideDetailsCarousel" data-bs-slide-to="0" class="active">1</li>\
				<li data-bs-target="#slideDetailsCarousel" data-bs-slide-to="1">2</li>\
				<li data-bs-target="#slideDetailsCarousel" data-bs-slide-to="2">3</li>\
				<li data-bs-target="#slideDetailsCarousel" data-bs-slide-to="3">4</li>\
			</ol>\
			<div class="carousel-inner" style="min-height: 36rem;">\
				<div class="carousel-item active">\
					<div class="d-block text-center">\
						<div class="vueAppPersonasHost">\
							<h3>Paycheck costs for coverage</h3>\
							<p>\
								<b>Paycheck costs for coverage</b> are the contributions you make toward the plan premiums. The company pays a\
								large share of the total plan premium cost, only passing a portion to you. Your premium contribution is not taxed.\
							</p>\
							<plan-tiles view="premiums" amount-description="paycheck costs"></plan-tiles>\
						</div> <!-- end class="vueAppPersonasHost" -->\
						<div class="text-center small p-3">\
							<span class="keyInfo">This situation may not be exactly the same as yours.</span><br>\
							You can customize this cost estimate using the\
							<button class="clickGoesToFullTool nakedButton">interactive calculator &raquo;</button>.\
						</div>\
					</div>\
				</div>\
				<div class="carousel-item">\
					<div class="d-block text-center">\
						<div class="vueAppPersonasHost">\
							<h3>Out-of-pocket costs for medical care + prescriptions</h3>\
							<p>\
								<b>Out-of-pocket costs</b> represent the amount you pay when you receive medical care or purchase a prescription.\
								These costs may be in the form of a deductible, coinsurance, or copay. You might make these payments at the time\
								of service, or you might receive a bill from your provider. If there is a company funding to an HSA, that amount\
								is deducted from the out-of-pocket costs.\
							</p>\
							<plan-tiles view="oopCosts" amount-description="out-of-pocket costs"></plan-tiles>\
						</div> <!-- end class="vueAppPersonasHost" -->\
						<div class="text-center small p-3">\
							<span class="keyInfo">This situation may not be exactly the same as yours.</span><br>\
							You can customize this cost estimate using the\
							<button class="clickGoesToFullTool nakedButton">interactive calculator &raquo;</button>.\
						</div>\
					</div>\
				</div>\
				<div class="carousel-item">\
					<div class="d-block text-center">\
						<div class="vueAppPersonasHost">\
							<h3>Potential tax savings from contributing to an HSA or FSA</h3>\
							<p>\
								<b>This <button data-bs-target="#modal_slideDetails_taxSavings" data-bs-toggle="modal">estimated</button> savings\
								is based on a $2,500 contribution. Your tax savings may vary.</b> With a\
								<button class="videoLibraryButton keepTextIfDisabled"\
									data-bs-target="#modal_SpecificVideo_HSA" data-bs-toggle="modal">Health Savings Account (HSA)</button>\
								or\
								<button class="videoLibraryButton keepTextIfDisabled"\
									data-bs-target="#modal_SpecificVideo_FSA" data-bs-toggle="modal">Flexible Spending Account (FSA)</button>,\
								you make tax-free contributions from your pay to your account. Then, you can make withdrawals to pay for eligible\
								health care expenses tax-free, which saves you money.\
							</p>\
							<!-- Estimated tax savings of $916 below is for 2021 tax year. See modal_slideDetails_taxSavings for assumptions. -->\
							<plan-tiles view="taxSavings" amount-description="estimated tax savings" tax-savings-assumption="916"></plan-tiles>\
						</div> <!-- end class="vueAppPersonasHost" -->\
						<div class="text-center small p-3">\
							<span class="keyInfo">This situation may not be exactly the same as yours.</span><br>\
							You can customize this cost estimate using the\
							<button class="clickGoesToFullTool nakedButton">interactive calculator &raquo;</button>.\
						</div>\
					</div>\
				</div>\
				<div class="carousel-item" style="margin-bottom: 4rem;">\
					<div class="d-block text-center">\
						<div class="vueAppPersonasHost">\
							<h3>Total costs</h3>\
							<plan-tiles view="totalCosts" amount-description="total costs"></plan-tiles>\
							<div class="alert alert-success mt-2 ms-md-5 me-md-5 pt-0">\
								<h3>Personalize your cost estimate</h3>\
								<p class="keyInfo"><match-name></match-name>&apos;s situation may not be exactly the same as yours.</p>\
								<p>You can customize this cost estimate using the interactive calculator.</p>\
							</div>\
						</div> <!-- end class="vueAppPersonasHost" -->\
						<div class="text-center m-3">\
							<button class="clickGoesToFullTool btn btn-lg btn-primary full-tool-button-shadow-pulse">\
								Calculate Now <i class="fa fa-chevron-right ps-1"></i>\
							</button>\
						</div>\
					</div>\
				</div>\
			</div>\
			<a class="carousel-control-prev" href="#slideDetailsCarousel" role="button" data-bs-slide="prev">\
				<i class="fad fa-chevron-circle-left"></i>\
				<span class="sr-only">Previous</span>\
			</a>\
			<a class="carousel-control-next" href="#slideDetailsCarousel" role="button" data-bs-slide="next">\
				<i class="fad fa-chevron-circle-right"></i>\
				<span class="sr-only">Next</span>\
			</a>\
		</div>\
		<div class="text-center simpleFeedbackEnabledOnly"><button class="btn btn-primary nextButton mt-3">Provide Feedback</button></div>\
		<!-- ======================================== END slideDetails ======================================== -->'
	},

	"slideFeedback": {
		sectionId: "sectionFeedback",
		titleHtml: "<h1>Give us your feedback</h1>",
		// eslint-disable-next-line no-unused-vars
		permitDisplayWhen: function when(appData, config) { return appData.features.simpleFeedbackEnabled; },
		htmlContent: '\
		<!-- ======================================== BEGIN slideSurvey ======================================== -->\
		<p>\
			<strong>We&apos;d love to know if this tool was helpful to you as you make your health plan decisions.</strong>\
			Feedback is optional and anonymous.\
		</p>\
		<h3 class="prompt">1.) Which plan do you think you will enroll in? <small>(feedback only &mdash; does not enroll you)</small></h3>\
		<div class="planRecommendationEnabledOnly bestMatchPlan">\
			<p>\
				The plan that best matched your inputs is the <strong><span class="prompt"></span></strong>.\
				This situation may not be exactly the same as yours.\
			</p>\
		</div>\
		<ul class="answers yourMatchingPlanAnswers list-inline"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<p>&nbsp;</p>\
		<h3 class="prompt">2.) Did this tool help you with your health plan choice?</h3>\
		<p>\
			1 is not helpful at all, 5 is very helpful.\
		</p>\
		<ul class="answers yourMatchRatingAnswers list-inline"></ul> <!-- Automatically filled. Change "ul" to "select" to get a dropdown. -->\
		<!-- ======================================== END slideSurvey ======================================== -->'
	}
};
/* eslint-enable max-len, quotes */

//-------------------------------------------------------------------------------------------------
// slidesOrder: An array defining the order in which slides are to be displayed as the user
//   navigates using the next/previous buttons. Slides that are mentioned below yet return
//   false for permitDisplayWhen() above are skipped.
//
wizardConfig.slidesOrder = [
	"slideStatus",
	"slideCoverage",
	"slideUsage",
	"slidePreference",
	"slideMatch",
	"slideCosts",
	"slideDetails",
	"slideFeedback"
];

//-------------------------------------------------------------------------------------------------
// additionalHelpModalsHtml: A string containing additional help-modal elements specific to the
//   wizard. At runtime, this content is inserted into the element #vueAppExtraHelpModalsForWizard
//   (see home.htm). A Vue instance is created for that element to define these additional modals.
//   If the wizard configuration does not require any additional help modals, set this to null.
//
// LATER: Derive the usage assumption services and counts below from configured values instead.
//
wizardConfig.additionalHelpModalsHtml = '\
	\
	<help-modal v-cloak v-once modal-id="modal_slideStatus" title="Salary band" hide-print="true">\
		<p>\
			Please indicate your salary band. Annual employee contributions (the amount deducted from your paycheck for\
			coverage) will vary based on your selection.\
		</p>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_slideCoverage" title="Coverage" hide-print="true">\
		<p>\
			Please indicate your coverage level choice. Your cost for medical insurance will vary based on whether you\
			cover just yourself, you and your spouse/partner, you and your child(ren), or you and your entire family.\
		</p>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_slideUsage" title="Usage Assumptions" hide-print="true">\
		<div class="coverageLevelSpecific employeeOnly">\
			<h3>Employee Only</h3>\
			<p>\
				<b>Low usage</b> means that you typically only use your medical coverage for preventive care\
				(e.g., physicals and recommended screenings) and one or two doctor visits and prescriptions a year.\
			</p>\
			<ul>\
				<li>1 routine physical\
				<li>2 PCP office visits\
				<li>1 blood test\
				<li>2 retail generic prescriptions (30-day supply each)\
			</ul>\
			<p>\
				<b>Moderate usage</b> means that you see the doctor a few times a year for an illness, injury,\
				or minor chronic condition. Prescriptions and outpatient treatment may also be needed.\
			</p>\
			<ul>\
				<li>1 routine physical\
				<li>3 PCP office visits\
				<li>2 specialist office visits\
				<li>3 blood tests\
				<li>1 X-ray\
				<li>1 emergency room visit\
				<li>2 retail generic prescriptions (30-day supply each)\
				<li>2 retail preferred brand prescriptions (30-day supply each)\
				<li>2 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
			<p>\
				<b>High usage</b> means that you use your medical coverage to manage a complex condition or injury\
				that requires a number of doctor visits, procedures, prescriptions, and perhaps an inpatient hospital stay.\
			</p>\
			<ul>\
				<li>1 routine physical\
				<li>6 PCP office visits\
				<li>7 specialist office visits\
				<li>10 blood tests\
				<li>1 X-ray\
				<li>1 emergency room visit\
				<li>1 MRI scan\
				<li>1 two-day inpatient stay\
				<li>8 retail generic prescriptions (30-day supply each)\
				<li>4 retail preferred brand prescriptions (30-day supply each)\
				<li>4 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
		</div>\
		<div class="coverageLevelSpecific employeeAndSpouse">\
			<h3>Employee + Spouse/Partner</h3>\
			<p>\
				<b>Low usage</b> means that you and your spouse/partner typically only use your medical coverage for preventive care\
				(e.g., physicals and recommended screenings) and one or two doctor visits and prescriptions a year.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>4 PCP office visits\
				<li>2 blood tests\
				<li>4 retail generic prescriptions (30-day supply each)\
			</ul>\
			<p>\
				<b>Moderate usage</b> means that you and your spouse/partner see the doctor a few times a year for an illness, injury,\
				or a minor chronic condition. Prescriptions and outpatient treatment may also be needed.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>6 PCP office visits\
				<li>4 specialist office visits\
				<li>6 blood tests\
				<li>2 X-rays\
				<li>2 emergency room visits\
				<li>4 retail generic prescriptions (30-day supply each)\
				<li>4 retail preferred brand prescriptions (30-day supply each)\
				<li>4 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
			<p>\
				<b>High usage</b> means that you and your spouse/partner use your medical coverage to manage a complex condition or injury\
				that requires a number of doctor visits, procedures, prescriptions, and perhaps an inpatient hospital stay.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>12 PCP office visits\
				<li>14 specialist office visits\
				<li>20 blood tests\
				<li>2 X-rays\
				<li>2 emergency room visits\
				<li>2 MRI scans\
				<li>2 two-day inpatient stays\
				<li>16 retail generic prescriptions (30-day supply each)\
				<li>8 retail preferred brand prescriptions (30-day supply each)\
				<li>8 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
		</div>\
		<div class="coverageLevelSpecific employeeAndChild employeeAndChildren">\
			<h3>Employee + Child(ren)</h3>\
			<p>\
				<b>Low usage</b> means that you and your child typically only use your medical coverage for preventive care\
				(e.g., physicals and recommended screenings) and one or two doctor visits and prescriptions a year.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>4 PCP office visits\
				<li>2 blood tests\
				<li>4 retail generic prescriptions (30-day supply each)\
			</ul>\
			<p>\
				<b>Moderate usage</b> means that you and your child see the doctor a few times a year for an illness, injury,\
				or minor chronic condition. Prescriptions and outpatient treatment may also be needed.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>6 PCP office visits\
				<li>4 specialist office visits\
				<li>6 blood tests\
				<li>2 X-rays\
				<li>2 emergency room visits\
				<li>4 retail generic prescriptions (30-day supply each)\
				<li>4 retail preferred brand prescriptions (30-day supply each)\
				<li>4 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
			<p>\
				<b>High usage</b> means that you and your child use your medical coverage to manage a complex condition or injury\
				that requires a number of doctor visits, procedures, prescriptions, and perhaps an inpatient hospital stay.\
			</p>\
			<ul>\
				<li>2 routine physicals\
				<li>12 PCP office visits\
				<li>14 specialist office visits\
				<li>20 blood tests\
				<li>2 X-rays\
				<li>2 emergency room visits\
				<li>2 MRI scans\
				<li>2 two-day inpatient stays\
				<li>16 retail generic prescriptions (30-day supply each)\
				<li>8 retail preferred brand prescriptions (30-day supply each)\
				<li>8 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
		</div>\
		<div class="coverageLevelSpecific employeeAndFamily">\
			<h3>Employee + Family</h3>\
			<p>\
				<b>Low usage</b> means that you and your family typically only use your medical coverage for preventive care\
				(e.g., physicals and recommended screenings) and one or two doctor visits and prescriptions a year.\
			</p>\
			<ul>\
				<li>4 routine physicals\
				<li>8 PCP office visits\
				<li>4 blood tests\
				<li>8 retail generic prescriptions (30-day supply each)\
			</ul>\
			<p>\
				<b>Moderate usage</b> means that you and your family see the doctor a few times a year for an illness, injury,\
				or minor chronic condition. Prescriptions and outpatient treatment may also be needed.\
			</p>\
			<ul>\
				<li>4 routine physicals\
				<li>11 PCP office visits\
				<li>94 specialist office visits\
				<li>9 blood tests\
				<li>1 X-ray\
				<li>1 emergency room visit\
				<li>6 retail generic prescriptions (30-day supply each)\
				<li>2 retail preferred brand prescriptions (30-day supply each)\
				<li>8 mail order generic prescriptions (90-day supply each)\
				<li>6 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
			<p>\
				<b>High usage</b> means that you and your family use your medical coverage to manage a complex condition or injury\
				that requires a number of doctor visits, procedures, prescriptions, and perhaps an inpatient hospital stay.\
			</p>\
			<ul>\
				<li>4 routine physicals\
				<li>13 PCP office visits\
				<li>9 specialist office visits\
				<li>15 blood tests\
				<li>2 X-rays\
				<li>2 emergency room visits\
				<li>1 MRI scan\
				<li>1 two-day inpatient stay\
				<li>14 retail generic prescriptions (30-day supply each)\
				<li>6 retail preferred brand prescriptions (30-day supply each)\
				<li>6 mail order preferred brand prescriptions (90-day supply each)\
			</ul>\
		</div>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_slidePreference" title="Preference" hide-print="true">\
		<p>\
			Choosing a health care plan can be a balancing act. Some people may prefer plans with lower premiums, while\
			others may prefer plans with lower estimated out-of-pocket costs.\
		</p>\
		<p>\
			Another factor that might matter to you is whether a plan offers a Health Savings Account (HSA).\
		</p>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_slideCosts" title="Total costs" hide-print="true">\
		<p>\
			When you click the "See Details" button, you&apos;ll see a breakdown of the paycheck costs and out-of-pocket\
			costs included in the total cost estimates for each medical plan. You’ll also see an estimate of your tax savings\
			if you were to contribute to a Health Care Flexible Spending Account (FSA) or Health Savings Account (HSA). These\
			hypothetical tax savings are not factored into the total cost estimates presented here.\
		</p>\
		<p>\
			Keep in mind that in addition to comparing total costs, you should also think about other considerations when\
			choosing a health plan, like your comfort level with a higher deductible and access to specific providers.\
		</p>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_slideDetails_taxSavings" title="Estimated tax savings" hide-print="true">\
		<p>This HSA/FSA tax savings is based on the following assumptions:</p>\
		<ul>\
			<li>24% federal income tax</li>\
			<li>5% state income tax*</li>\
			<li>7.65% in payroll tax</li>\
		</ul>\
		<p>\
			Your tax savings may vary. These hypothetical tax savings are not factored into the total cost estimates\
			presented here.</p>\
		<p>\
			Note that only high-deductible health plans allow you to contribute to an HSA, which offers additional advantages\
			over a Health Care FSA, such as higher contribution limits and the ability to carry over any unused balance year\
			after year.\
		</p>\
		<p class="small">\
			* Contributions are not subject to federal income tax. However, HSA contributions are currently subject to state\
			income tax in CA and NJ. Consult with your tax advisor to understand the potential tax implications of enrolling\
			in an HSA and/or FSA.\
		</p>\
	</help-modal>\
	\
	<!-- LATER: Perhaps have a dedicated Vue component for specific video help modals. -->\
	<help-modal v-cloak v-once modal-id="modal_SpecificVideo_HSA"\
		title="What is an HSA?" title-fa-icon-classes="far fa-play-circle" hide-print="true">\
		<div class="ratio ratio-16x9">\
			<iframe loading="lazy" allowfullscreen title="What is an HSA?"\
					data-deferred-src="https://player.vimeo.com/video/460340920"></iframe>\
			<!-- Alternate: <iframe loading="lazy" allowfullscreen title="What is an HSA? (with Employer Contribution)"\
					data-deferred-src="https://player.vimeo.com/video/460340678"></iframe> -->\
		</div>\
		<ul class="mt-4 ps-4">\
			<li>\
				Learn more about health benefit terms and concepts in the\
				<button class="videoLibraryButton" data-bs-target="#modal_VideoLibrary"\
					data-bs-dismiss="modal" data-bs-toggle="modal">Video Library</button>.\
			</li>\
		</ul>\
	</help-modal>\
	\
	<help-modal v-cloak v-once modal-id="modal_SpecificVideo_FSA"\
		title="What is an FSA?" title-fa-icon-classes="far fa-play-circle" hide-print="true">\
		<div class="ratio ratio-16x9">\
			<iframe loading="lazy" allowfullscreen title="What is an FSA?"\
					data-deferred-src="https://player.vimeo.com/video/460340023"></iframe>\
		</div>\
		<ul class="mt-4 ps-4">\
			<li>\
				Learn more about health benefit terms and concepts in the\
				<button class="videoLibraryButton" data-bs-target="#modal_VideoLibrary"\
					data-bs-dismiss="modal" data-bs-toggle="modal">Video Library</button>.\
			</li>\
		</ul>\
	</help-modal>\
'; // additionalHelpModalsHtml

//-------------------------------------------------------------------------------------------------
// vueComponentTemplates: The HTML templates for the Vue components supporting the personas model.
//   Client sites might customize component layout or content, and so each component's template is
//   included here and not inside appCore/components/*.js.
//
wizardConfig.vueComponentTemplates = {

	// Template for match-name Vue.js component defined in components/MatchName.js
	"match-name": '<span class="match-name">{{ persona ? persona.primaryName : "" }}</span>',

	// Template for your-match Vue.js component defined in components/YourMatch.js
	"your-match": '\
		<div v-if="persona" class="your-match">\
			<div class="alert alert-success pb-2">\
				<div class="d-xl-flex flex-row">\
					<div class="photo" v-html="persona.imageHtml"></div>\
					<div class="description d-lg-flex flex-column">\
						<div class="introduction mt-xl-1 my-3">\
							Based on your answers, your situation is closest to <span class="keyInfo">{{ persona.primaryName }}&apos;s</span>.\
						</div>\
						<div class="values d-md-flex flex-row">\
							<!-- coverageLevelId -->\
							<div class="coverage">\
								<div class="icon">\
									<img v-if="coverageLevelEmployeeOnly"\
										src="img/icons/hpce21-icon-coverage-01.svg" alt="Icon for myself only">\
									<img v-if="coverageLevelEmployeeAndSpouse"\
										src="img/icons/hpce21-icon-coverage-02.svg" alt="Icon for myself plus spouse or partner">\
									<img v-if="coverageLevelEmployeeAndChildren"\
										src="img/icons/hpce21-icon-coverage-03.svg" alt="Icon for myself plus child or children">\
									<img v-if="coverageLevelEmployeeAndFamily"\
										src="img/icons/hpce21-icon-coverage-04.svg" alt="Icon for myself plus family">\
								</div>\
								<div class="name">Coverage:</div>\
								<div class="value">{{ persona.coverageDescription }}</div>\
							</div>\
							<!-- usageLevelId -->\
							<div class="usage">\
								<div class="icon">\
									<img v-if="usageLevelLow"\
										src="img/icons/hpce21-icon-usage-01.svg" alt="Icon for low health care usage">\
									<img v-if="usageLevelModerate"\
										src="img/icons/hpce21-icon-usage-02.svg" alt="Icon for moderate health care usage">\
									<img v-if="usageLevelHigh"\
										src="img/icons/hpce21-icon-usage-03.svg" alt="Icon for high health care usage">\
								</div>\
								<div class="name">Usage:</div>\
								<div class="value">{{ persona.usageDescription }}</div>\
							</div>\
							<!-- preferenceId -->\
							<div v-if="preferenceLowerPremiums" class="preference">\
								<div class="icon">\
									<img src="img/icons/hpce21-icon-pref-01.svg" alt="Icon for lower premiums costs preference">\
								</div>\
								<div class="name">Preference:</div>\
								<div class="value">Lower premium costs</div>\
							</div>\
							<div v-if="preferenceLowerOutOfPocketCosts" class="preference">\
								<div class="icon">\
									<img src="img/icons/hpce21-icon-pref-02.svg" alt="Icon for lower out-of-pocket costs preference">\
								</div>\
								<div class="name">Preference:</div>\
								<div class="value">Lower out-of-pocket costs</div>\
							</div>\
							<div v-if="preferenceLowerTotalCosts" class="preference">\
								<div class="icon">\
									<img src="img/icons/hpce21-icon-pref-03.svg" alt="Icon for lower estimated total costs preference">\
								</div>\
								<div class="name">Preference:</div>\
								<div class="value">Lower total costs</div>\
							</div>\
							<div v-if="preferenceHSA" class="preference">\
								<div class="icon">\
									<img src="img/icons/hpce21-icon-pref-04.svg" alt="Icon for access to HSA preference">\
								</div>\
								<div class="name">Preference:</div>\
								<div class="value">Access to an HSA</div>\
							</div>\
						</div>\
					</div>\
				</div>\
			</div>\
			<div class="text-center">\
				<div v-html="basicDescription"></div>\
				<div v-html="preferenceDescription"></div>\
			</div>\
			<div class="bestMatchPlan">\
				<div class="icon">\
					<img class="bestMatchIcon" src="img/icons/icon-bestmatch.svg" alt="Best Match badge icon">\
				</div>\
				<div class="text">\
					{{ persona.primaryName }} chooses the <span class="winningPlanName">{{ winningPlanName }}.</span>\
				</div>\
			</div>\
		</div>\
	', // end "your-match" component template

	// Template for plan-tiles Vue.js component defined in components/PlanTiles.js
	"plan-tiles": '\
		<div v-if="mainResults" class="plan-tiles row justify-content-center" :class="extraClasses">\
			<template v-for="(item, index) in mainResults.orderedPlanIds">\
				<plan-tile :view="view"\
					:plan-id="item"\
					:amount-description="amountDescription"\
					:tax-savings-assumption="taxSavingsAssumption">\
				</plan-tile>\
			</template>\
		</div>\
	', // end "plan-tiles" component template

	// Template for plan-tile Vue.js component defined in components/PlanTile.js
	"plan-tile": '\
		<div v-if="mainResults" class="plan-tile col" :class="extraClasses">\
			<div class="flip-box">\
				<div class="flip-box-inner">\
					<div class="front">\
						<div v-if="viewTaxSavings" class="dollarIcons">\
							<img v-for="item in dollarIconCount" src="img/icons/hpce21-icon-dollars-red.svg" alt="Red dollar bill icon">\
						</div>\
						<div v-else class="dollarIcons">\
							<img v-for="item in dollarIconCount" src="img/icons/hpce21-icon-dollars-green.svg" alt="Green dollar bill icon">\
						</div>\
						<div class="amount">\
							<div v-if="viewTaxSavings && hasNoPrimaryAccountType" class="value">n/a</div>\
							<div v-else class="value align-text-bottom">{{ formatDollar(amount) }}</div>\
							<div class="description">{{ amountDescription }}</div>\
						</div>\
						<div class="planName">\
							<div class="text">{{ planName }}</div>\
							<img v-if="viewTotalCosts && winner" class="bestMatchIcon"\
								src="img/icons/icon-bestmatch.svg" alt="Best match badge icon">\
						</div>\
						<div v-if="primaryAccountType" class="carryover">\
							<img src="img/icons/hpce21-icon-moneybag.svg" alt="Money bag icon">\
							<span>{{ primaryAccountType }} balance eligible for carryover: {{ formatDollar(carryover) }}</span>\
						</div>\
					</div>\
					<div v-if="viewTotalCosts" class="back">\
						<div v-if="accountDescriptionCode === \'HSA_NoPlanFund\'">\
							If <match-name></match-name> contributes to a Health Savings Account (HSA), that tax-free money can be applied to\
							the cost of medical care and prescriptions for the current year. If there is any HSA balance remaining at the end\
							of the year, it can be used to offset out-of-pocket costs in future years.\
						</div>\
						<div v-if="accountDescriptionCode === \'HSA_PlanFund_SomeUnused\'">\
							In this example, the company&apos;s contribution to a Health Savings Account (HSA) was deducted from the cost of\
							medical care and prescriptions. Any remaining HSA balance carries over to the next year. <match-name></match-name>\
							may use the HSA balance to offset out-of-pocket costs in future years.\
						</div>\
						<div v-if="accountDescriptionCode === \'HSA_PlanFund_NoneLeft\'">\
							In this example, <match-name></match-name> has used all of the company&apos;s Health Savings Account (HSA)\
							contributions toward the cost of medical care and prescriptions for the current year. If there is an HSA balance\
							remaining from contributions <match-name></match-name> made, that money can be used to offset out-of-pocket\
							costs in future years.\
						</div>\
						<div v-if="accountDescriptionCode === \'FSA_NoPlanFund\'">\
							If <match-name></match-name> contributes to a Health Care Flexible Spending Account (FSA), that tax-free money can\
							be applied to the cost of medical care and prescriptions for the current year. With an FSA, the ability to carry\
							over unused money is limited, so check your plan details and estimate your FSA contributions carefully.\
						</div>\
						<div v-if="accountDescriptionCode === \'FSA_PlanFund_SomeUnused\'" style="font-size: 90%;">\
							In this example, the company&apos;s contribution to a Health Reimbursement Account (HRA) was deducted from the\
							cost of medical care and prescriptions. Any remaining HRA balance carries over to the next year.\
							<match-name></match-name> may also contribute to a Health Care Flexible Spending Account (FSA) to pay for eligible\
							expenses with tax-free money. With an FSA, the ability to carry over unused money is limited, so check your plan\
							details and estimate your FSA contributions carefully.\
						</div>\
						<div v-if="accountDescriptionCode === \'FSA_PlanFund_NoneLeft\'" style="font-size: 90%;">\
							In this example, the company&apos;s contribution to a Health Reimbursement Account (HRA) was deducted from the\
							cost of medical care and prescriptions. <match-name></match-name> may also contribute to a Health Care Flexible\
							Spending Account (FSA) to pay for eligible expenses with tax-free money. With an FSA, the ability to carry over\
							unused money is limited, so check your plan details and estimate your FSA contributions carefully.\
						</div>\
						<div v-if="accountDescriptionCode === \'NoAccountType\'">\
							This plan does not have an associated savings account.\
						</div>\
					</div>\
				</div>\
			</div>\
		</div>\
	' // end "plan-tile" component template
};

// Helper for defining iconHtml properties in answerKinds below.
let flipBoxIconHtml = function flipBoxIconHtml(fileName, altText) {
	let iconHtmlFmt = '\
		<div class="flip-box">\
			<div class="flip-box-inner">\
				<div class="flip-box-front"><img src="{0}" alt="{1}}"></div>\
				<div class="flip-box-back"><img src="{0}" alt="{1}}"></div>\
			</div>\
		</div>';
	let result = utility.stringFormat(iconHtmlFmt, fileName, altText);
	return result;
};

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

	"statusAnswers": {
		syncWithDropdownClass: "statusDropdown",
		full: {
			"salaryBand1": {
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-salary-01.svg", "Icon for first salary band")
			},
			"salaryBand2": {
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-salary-02.svg", "Icon for second salary band")
			},
			"salaryBand3": {
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-salary-03.svg", "Icon for third salary band")
			}
		}
	},

	"coverageLevelAnswers": {
		ordered: ["employeeOnly", "employeeAndSpouse", "employeeAndChildren", "employeeAndFamily"],
		full: {
			"employeeOnly": {
				description: "Myself<br>Only",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-coverage-01.svg", "Icon for myself only")
			},
			"employeeAndSpouse": {
				description: "Myself +<br>Spouse / Partner",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-coverage-02.svg", "Icon for myself plus spouse or partner")
			},
			"employeeAndChildren": {
				description: "Myself +<br>Child(ren)",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-coverage-03.svg", "Icon for myself plus child or children")
			},
			"employeeAndFamily": {
				description: "Myself +<br>Family",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-coverage-04.svg", "Icon for myself plus family")
			}
		}
	},

	"usageAnswers": {
		ordered: ["low", "moderate", "high"],
		full: {
			"low": {
				description: "Low",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-usage-01.svg", "Icon for low health care usage")
			},
			"moderate": {
				description: "Moderate",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-usage-02.svg", "Icon for moderate health care usage")
			},
			"high": {
				description: "High",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-usage-03.svg", "Icon for high health care usage")
			}
		}
	},

	"preferenceAnswers": {
		ordered: ["lowerPremiums", "lowerOutOfPocketCosts", "lowerTotalCosts", "HSA"],
		full: {
			"lowerPremiums": {
				description: "Lower premium costs from my paycheck",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-pref-01.svg", "Icon for lower premiums costs preference")
			},
			"lowerOutOfPocketCosts": {
				description: "Lower estimated out-of-pocket costs",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-pref-02.svg", "Icon for lower out-of-pocket costs preference")
			},
			"lowerTotalCosts": {
				description: "Lower estimated total costs",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-pref-03.svg", "Icon for lower estimated total costs preference")
			},
			"HSA": {
				description: "Access to a Health Savings Account (HSA)",
				iconHtml: flipBoxIconHtml("img/icons/hpce21-icon-pref-04.svg", "Icon for access to HSA preference")
			}
		}
	},

	"yourMatchingPlanAnswers": {
		syncWithDropdownClass: "yourMatchingPlanDropdown"
	},

	"yourMatchRatingAnswers": {
		syncWithDropdownClass: "yourMatchRatingDropdown"
	}
};
/* eslint-enable max-len */

//-------------------------------------------------------------------------------------------------
// allPersonas: Configuration for each of the personas included in the personas model. Personas
//   are selected by the combination of coverage level and usage level. Each persona has one or
//   more names for the individual(s) included, an image representing the individual or family, a
//   coverage level description, a usage level description, a set of usage assumptions by family
//   member, a basic description for the persona, and descriptions for each preference option.
//
/* eslint-disable quotes, camelcase */
wizardConfig.allPersonas = {
	// LATER: appValidation logic to validate allPersonas configuration

	// =====================================================
	// ===== employeeOnly personas
	// =====================================================

	employeeOnly_Low: {
		primaryName: 'Camila',
		imageHtml: '<img src="img/people/employeeOnly_Low.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee only',
		usageDescription: 'Low',
		usageAssumptions: {
			primary: { "medical": "low", "drugs": "low" }
		},
		basicDescription:
			'<p><b>She&apos;s generally healthy and doesn&apos;t need a lot of medical care.</b> She gets her annual physical, which is covered\
			in full, and sees her primary care provider a couple of times during the year to treat minor illnesses.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for\
				eligible expenses tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And, she\
				knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeOnly_Moderate: {
		primaryName: 'Richard',
		imageHtml: '<img src="img/people/employeeOnly_Moderate.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee only',
		usageDescription: 'Moderate',
		usageAssumptions: {
			primary: { "medical": "moderate", "drugs": "moderate" }
		},
		basicDescription:
			'<p><b>He leads an active lifestyle despite his arthritis and needs a moderate amount of medical care.</b> He goes to the ER\
			after injuring his knee, which requires an X-ray, some blood tests, prescriptions, and follow-up care. He also gets his annual\
			physical, which is covered in full.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeOnly_High: {
		primaryName: 'Gayle',
		imageHtml: '<img src="img/people/employeeOnly_High.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee only',
		usageDescription: 'High',
		usageAssumptions: {
			primary: { "medical": "high", "drugs": "high" }
		},
		basicDescription:
			'<p><b>She has diabetes and needs a lot of medical care to manage her chronic condition and its complications.</b> In addition to\
			her annual physical, which is covered in full, she needs frequent medical appointments and an ER visit. She also takes multiple\
			prescriptions, and her doctor is recommending surgery.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible\
				expenses tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And, she\
				knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	// =====================================================
	// ===== employeeAndSpouse personas
	// =====================================================

	employeeAndSpouse_Low: {
		primaryName: 'Randall',
		spouseName: 'Maggie',
		imageHtml: '<img src="img/people/employeeAndSpouse_Low.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + spouse/partner',
		usageDescription: 'Low',
		usageAssumptions: {
			primary: { "medical": "low", "drugs": "low" },
			spouse: { "medical": "low", "drugs": "low" }
		},
		basicDescription:
			'<p><b>He and his wife, {spouseName}, are both in good health and don&apos;t need a lot of medical care.</b> They get annual\
			physicals, which are covered in full, and need treatment for a couple minor issues.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndSpouse_Moderate: {
		primaryName: 'Andra',
		spouseName: 'Shawn',
		imageHtml: '<img src="img/people/employeeAndSpouse_Moderate.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + spouse/partner',
		usageDescription: 'Moderate',
		usageAssumptions: {
			primary: { "medical": "moderate", "drugs": "moderate" },
			spouse: { "medical": "moderate", "drugs": "moderate" }
		},
		basicDescription:
			'<p><b>She and her husband, {spouseName}, are considering fertility treatment, so they need a moderate amount of medical care.</b>\
			They get their annual physicals, which are covered in full, and also have quite a few doctor visits, prescriptions, and diagnostic\
			tests, along with an unexpected trip to the ER when {spouseName} falls off a ladder.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And,\
				she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndSpouse_High: {
		primaryName: 'Renata',
		spouseName: 'Joan',
		imageHtml: '<img src="img/people/employeeAndSpouse_High.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + spouse/partner',
		usageDescription: 'High',
		usageAssumptions: {
			primary: { "medical": "high", "drugs": "high" },
			spouse: { "medical": "high", "drugs": "high" }
		},
		basicDescription:
			'<p><b>She and her partner, {spouseName}, need a lot of medical care, including two upcoming surgeries.</b> They get their annual\
			physicals, which are covered in full. {primaryName} broke her hip when she slipped on the ice, so she needs a hip replacement, and\
			{spouseName} needs a hysterectomy. They go to numerous doctor appointments and a couple ER visits, fill multiple prescriptions,\
			and get diagnostic testing as well as post-surgical care.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And,\
				she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	// =====================================================
	// ===== employeeAndChildren personas
	// =====================================================

	employeeAndChildren_Low: {
		primaryName: 'Sam',
		child1Name: 'Bodhi',
		imageHtml: '<img src="img/people/employeeAndChildren_Low.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + child(ren)',
		usageDescription: 'Low',
		usageAssumptions: {
			primary: { "medical": "low", "drugs": "low" },
			childrenArray: [{ "medical": "low", "drugs": "low" }]
		},
		basicDescription:
			'<p><b>He and his son, {child1Name}, don&apos;t need a lot of medical care.</b> They both get annual physicals, which are covered in\
			full, and receive treatment for a couple minor conditions &mdash; {child1Name} has asthma and {primaryName} has allergies.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndChildren_Moderate: {
		primaryName: 'Malik',
		child1Name: 'Jayden',
		imageHtml: '<img src="img/people/employeeAndChildren_Moderate.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + child(ren)',
		usageDescription: 'Moderate',
		usageAssumptions: {
			primary: { "medical": "moderate", "drugs": "moderate" },
			childrenArray: [{ "medical": "moderate", "drugs": "moderate" }]
		},
		basicDescription:
			'<p><b>With his aching back and {child1Name}&apos;s sore ear, this father and son need a moderate amount of medical care.</b> They\
			both get annual physicals, which are covered in full. {child1Name} sees a specialist for his frequent ear infections, and\
			{primaryName} receives treatment for chronic back pain. Occasionally, severe symptoms require a trip to the ER.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndChildren_High: {
		primaryName: 'Elaine',
		child1Name: 'Alexis',
		imageHtml: '<img src="img/people/employeeAndChildren_High.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + child(ren)',
		usageDescription: 'High',
		usageAssumptions: {
			primary: { "medical": "high", "drugs": "high" },
			childrenArray: [{ "medical": "high", "drugs": "high" }]
		},
		basicDescription:
			'<p><b>She and her teenage daughter, {child1Name}, are trying to stay positive despite needing a lot of medical care.</b>\
			They both get annual physicals, which are covered in full. {primaryName} was diagnosed with colon cancer, which requires surgery,\
			medication, and follow-up care. {child1Name} sees a behavioral health specialist and takes medication for depression.\
			She also needs surgery for hip dysplasia.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible\
				expenses tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And,\
				she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	// =====================================================
	// ===== employeeAndFamily personas
	// =====================================================

	employeeAndFamily_Low: {
		primaryName: 'Nora',
		spouseName: 'Kal',
		imageHtml: '<img src="img/people/employeeAndFamily_Low.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + family',
		usageDescription: 'Low',
		usageAssumptions: {
			primary: { "medical": "low", "drugs": "low" },
			spouse: { "medical": "low", "drugs": "low" },
			childrenArray: [
				{ "medical": "low", "drugs": "low" },
				{ "medical": "low", "drugs": "low" }
			]
		},
		basicDescription:
			'<p><b>She and her husband, {spouseName}, and their two kids are all pretty healthy and don&apos;t need a lot of medical care.</b>\
			They get their annual physicals, which are covered in full, and go to the doctor from time to time for occasional illnesses.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize her take-home pay instead of paying more from her paycheck for coverage she may not need.\
				And, she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible\
				expenses tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from her paycheck to keep her medical and prescription bills as low as possible. And,\
				she knows she can save even more money by contributing to a tax-advantaged account, which lets her pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep her total costs (what she pays from her paycheck to have coverage and what she pays for her\
				medical care and prescriptions) as low as possible. And, she knows she can save even more money by contributing to a\
				tax-advantaged account, which lets her pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep her total costs down but would prefer a plan that gives her access to a Health Savings Account\
				(HSA). An HSA allows her to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndFamily_Moderate: {
		primaryName: 'Omar',
		spouseName: 'Larisa',
		imageHtml: '<img src="img/people/employeeAndFamily_Moderate.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + family',
		usageDescription: 'Moderate',
		usageAssumptions: {
			primary: { "medical": "moderate", "drugs": "moderate" },
			spouse: { "medical": "lowModerate", "drugs": "lowModerate" },
			childrenArray: [
				{ "medical": "moderateHigh", "drugs": "moderateHigh" },
				{ "medical": "low", "drugs": "low" }
			]
		},
		basicDescription:
			'<p><b>With some ongoing health issues to manage, he and his wife, {spouseName}, and their two kids need a moderate amount of medical\
			care.</b> They all get annual physicals, which are covered in full. {spouseName} takes medication for high blood pressure and is\
			followed closely by a specialist. Their oldest child receives ABA therapy for Autism and was also diagnosed with ADHD, so he&apos;ll\
			be adding a new prescription. They each typically see the doctor several times throughout the year for various illnesses, and\
			sometimes a trip to the ER is needed for serious injuries.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	},

	employeeAndFamily_High: {
		primaryName: 'Brett',
		spouseName: 'Kristin',
		child1Name: 'Dax',
		imageHtml: '<img src="img/people/employeeAndFamily_High.jpg" alt="Photo of closest match">',
		coverageDescription: 'Employee + family',
		usageDescription: 'High',
		usageAssumptions: {
			primary: { "medical": "high", "drugs": "high" },
			spouse: { "medical": "moderate", "drugs": "moderate" },
			childrenArray: [
				{ "medical": "low", "drugs": "low" },
				{ "medical": "low", "drugs": "low" }
			]
		},
		basicDescription:
			'<p><b>He has a heart condition, his wife, {spouseName}, is expecting, and their son, {child1Name}, has his share of illnesses &mdash;\
			it adds up to a lot of medical care.</b> They get their annual physicals, which are covered in full. {spouseName} sees a specialist\
			for her high-risk pregnancy, and {primaryName}&apos;s cardiac issue means numerous doctor appointments, hospital visits,\
			prescriptions, and tests. Plus, {child1Name} frequently needs antibiotics for recurring strep throat.</p>',
		preferenceDescriptions: {
			lowerPremiums:
				'<p>{primaryName} would rather maximize his take-home pay instead of paying more from his paycheck for coverage he may not need.\
				And, he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerOutOfPocketCosts:
				'<p>{primaryName} would rather pay more from his paycheck to keep his medical and prescription bills as low as possible. And,\
				he knows he can save even more money by contributing to a tax-advantaged account, which lets him pay for eligible expenses\
				tax-free!</p>',
			lowerTotalCosts:
				'<p>{primaryName} wants to keep his total costs (what he pays from his paycheck to have coverage and what he pays for his medical\
				care and prescriptions) as low as possible. And, he knows he can save even more money by contributing to a tax-advantaged account,\
				which lets him pay for eligible expenses tax-free!</p>',
			HSA:
				'<p>{primaryName} wants to keep his total costs down but would prefer a plan that gives him access to a Health Savings Account\
				(HSA). An HSA allows him to pay for current eligible expenses with tax-free money and also build up tax-free savings for future\
				health care expenses.</p>'
		}
	}
};
/* eslint-enable quotes, camelcase */

return wizardConfig; // important!
}); // important!
