//-------------------------------------------------------------------------------------------------
// appWizard.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(["jquery", "trace", "utility", "fsaeConfig", window.mpce.wizardConfigName, "appDispatch",
		"appCharts", "appData", "appEngine", "appStage", "appValidation", "appCore/components/HelpModal"],
/**
 * @param {object} $
 * @param {object} trace
 * @param {object} utility
 * @param {FsaeConfig} fsaeConfig
 * @param {WizardConfig} wizardConfig
 * @param {AppDispatch} appDispatch
 * @param {AppCharts} appCharts
 * @param {AppData} appData
 * @param {AppEngine} appEngine
 * @param {AppStage} appStage
 * @param {AppValidation} appValidation
 * @param {HelpModal} helpModal
 * @returns {object}
 */
function module($, trace, utility, fsaeConfig, wizardConfig, appDispatch,
				appCharts, appData, appEngine, appStage, appValidation, helpModal) {
"use strict";

// region Module data

/**
 * @name AppWizard
 * @type {{
 *   wizardConfigName: object
 *   $wizard: object
 *   $sectionMap: object
 *   $mainRow: object
 *   $slideArea: object
 *   $summary: object
 *   $slides: object
 *   $previousButton: object
 *   $nextButton: object
 *   sections: object
 *   sectionsOrder: string[]
 *   slides: object
 *   slidesOrder: string[]
 *   currentSlide: object
 *   previousSlide: object
 *   answerKinds: object
 *   explicitChoices: object
 *   initializeAsync: Function
 *   begin: Function
 *   addModalAndTooltipEventHandlers: Function
 *   validateWizardConfig: Function
 *   processWizardConfig: Function
 *   renderMain: Function
 *   renderSectionMap: Function
 *   renderSlideArea: Function
 *   renderButtonsAboveSlide: Function
 *   renderSummary: Function
 *   renderAllSlides: Function
 *   renderControlsForAnswerKind: Function
 *   renderButtonsForAnswerKind: Function
 *   renderDropdownForAnswerKind: Function
 *   renderControlsForAllSyncedAnswers: Function
 *   renderControlsForAllNonSyncedAnswers: Function
 *   renderButtonsBelowSlide: Function
 *   maybeSetUpPersonasModel: Function
 *   setUpPersonasModelHoverAnswerText: Function
 *   switchToFullTool: Function
 *   switchToWizard: Function
 *   didUseFullToolAlready: Function
 *   onEngineWillRunMpceCalculation: Function
 *   onEngineDidRunMpceCalculation: Function
 *   onAppWillCompileConfig: Function
 *   onAppDidCompileConfig: Function
 *   answerSelectedCallback: Function
 *   updateAnswerSpecificElements: Function
 *   maybeTransferToSummaryEffect: Function
 *   updateSingleSyncedAnswer: Function
 *   updateSyncedAnswersFromFullTool: Function
 *   onAppDidChangeDynamicItem: Function
 *   savingsAccountSliderStopped: Function
 *   changeSlides: Function
 *   updateSections: Function
 *   updateSummary: Function
 *   shouldCurrentSlideDisplay: Function
 *   maybeAutoMove: Function
 *   nextPreviousClick: Function
 *   canSlidePermitNext: Function
 *   moveNext: Function
 *   movePrevious: Function
 *   updateNextPreviousButtonState: Function
 *   sectionMapCellClick: Function
 *   earlierSectionMapCellClick: Function
 *   currentSectionMapCellClick: Function
 *   laterSectionMapCellClick: Function
 *   jumpToSlide: Function
 *   maybeHandlePersonasModelSelectedAnswer: Function
 * }}
 */
let appWizard = {};
let _trace = trace.categoryWriteLineMaker("appWizard");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appWizard"); } }; tick();

let _answerKinds, _explicitChoices, _summaryEnabled = false, _holdSummaryUpdates = false, _usedFullToolAlready = false, _reachedLastSlide = false;

let strFmt = utility.stringFormat, isNullOrUndefined = utility.isNullOrUndefined, formatDollar = utility.formatDollar;

let $body = $("body"), $nonWizard, $wizard, $sectionMap, $mainRow, $slideArea, $summary, $slides, $previousButton, $nextButton;

appWizard.wizardConfigName = window.mpce.wizardConfigName;

// As most of the wizard UI is rendered dynamically by appWizard and not contained directly in the MPCE's primary
// HTML file, we'll export key element references for potential use by event handlers in custom logic, for cases
// where the flexibility afforded by wizardConfig isn't sufficient for a client implementation.
appWizard.$wizard = null;
appWizard.$sectionMap = null;
appWizard.$mainRow = null;
appWizard.$slideArea = null;
appWizard.$summary = null;
appWizard.$slides = null;
appWizard.$previousButton = null;
appWizard.$nextButton = null;

appWizard.sections = null;
appWizard.sectionsOrder = null;
appWizard.slides = null;
appWizard.slidesOrder = null;
appWizard.currentSlide = null;
appWizard.previousSlide = null;
appWizard.answerKinds = _answerKinds = {};
appWizard.explicitChoices = _explicitChoices = {
	"applyFundsAnswers": true // so that the user won't be forced to "(select one)"; the default option will match the full tool.
};

// endregion Module data
// region Initialization and startup

appWizard.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let config = appEngine.configuration;

			appWizard.validateWizardConfig();
			appWizard.processWizardConfig();
			appWizard.renderMain();
			tick();
			// Allow for "data-action" style dropdowns directly in the wizard slides. But, typically, answer buttons and dropdowns
			// shown in slides are declared in wizardConfig.answerKinds and are synchronized with the dropdowns in the full tool.
			appStage.renderDynamicFormItems($wizard);
			tick();
			// Potentially reset the simple feedback feature, as slides may contain feedback links.
			appStage.maybeSetUpSimpleFeedbackFeature();
			tick();
			// Potentially reset the tax calculator, as slides may contain a tax calculator dropdown and button.
			appStage.maybeSetUpTaxCalculator();
			tick();
			appWizard.addModalAndTooltipEventHandlers();
			tick();
			if (!appData.features.fullToolEnabled) {
				_trace("Hiding all links to full tool as fullToolEnabled is false.");
				$body.find(".finalFullToolButton, .clickGoesToFullTool").addClass("notInUse hiddenNotApplicable");
			}
			if (appWizard.wizardConfigName === "wizardConfigPersonas" && typeof config.runHpceProductDemoAdjustments === "function") {
				config.runHpceProductDemoAdjustments();
			}
			resolve();
		}, params.delayMsec || 0);
	});
};

appWizard.begin = function begin(startingWithWizard, scenarioLoaded) {
	_trace("begin: startingWithWizard: {0}, scenarioLoaded: {1}", startingWithWizard, scenarioLoaded);

	// The first slide in slidesOrder is usually the initial one, but maybe auto move to another if it can't display.
	appWizard.currentSlide = appWizard.slides[appWizard.slidesOrder[0]];
	appWizard.maybeAutoMove("initial");

	let startedWithWizard = false;
	if (startingWithWizard) {
		appCharts.initializeMpceCharts("appWizard.begin", true); // preserveExisting
		let proceedWithStartingWizard = appDispatch.onWizardWillStart();
		if (proceedWithStartingWizard) {
			$body.addClass("duringWizard", 50);
			$wizard.show();
			$nonWizard.hide();
			startedWithWizard = true;
			appDispatch.onWizardDidStart(appWizard.currentSlide.slideId, appWizard.currentSlide.sectionId);
		} else {
			_trace("begin: startingWithWizard was true but was overridden by onWizardWillStart() returning false");
		}
		appStage.postAppInitializationUnhiding();
		if (scenarioLoaded) {
			// When a scenario is loaded, ensure answers are pre-selected and the summary is filled in.
			appWizard.switchToWizard();
		}
	}

	if (!startedWithWizard) {
		$body.removeClass("duringWizard", 50);
		$wizard.hide();
		$nonWizard.show();
	}
};

appWizard.addModalAndTooltipEventHandlers = function addModalAndTooltipEventHandlers() {
	_trace("addModalAndTooltipEventHandlers");

	appStage.initializePlanProvisionsFeature($wizard);
	appStage.addModalEventHandlers($wizard);
	appStage.addTooltipEventHandlers($wizard);
	appStage.addCarouselEventHandlers($wizard);
	$body.find(".clickGoesToFullTool:not(.notInUse)").off("click").on("click", appWizard.switchToFullTool);
	$body.find(".clickGoesToWizard:not(.notInUse)").off("click").on("click", appWizard.switchToWizard);

	$nextButton.off("click").on("click", function nextButtonClick(event) { appWizard.nextPreviousClick(event, "next"); });
	$previousButton.off("click").on("click", function previousButtonClick(event) { appWizard.nextPreviousClick(event, "previous"); });
};

// endregion Initialization
// region Validate and process wizard config

appWizard.validateWizardConfig = function validateWizardConfig() {
	_trace("===== validateWizardConfig called =====");

	let initialErrorCount = appValidation.errors.length, hasConfigErrors, message;

	appValidation.checkObjectAndOrderContentsMatch(
		"wizardConfig.sections", wizardConfig.sections, "wizardConfig.sectionsOrder", wizardConfig.sectionsOrder);

	// LATER: validate each section config object

	appValidation.checkObjectAndOrderContentsMatch(
		"wizardConfig.slides", wizardConfig.slides, "wizardConfig.slidesOrder", wizardConfig.slidesOrder);

	// LATER: validate each slide config object

	// LATER: validate wizardConfig.answerKinds and each answerKind config object

	hasConfigErrors = appValidation.errors.length > initialErrorCount;
	if (hasConfigErrors) {
		message = "wizardCheckConfig: Validation errors: \n\n... " + appValidation.errors.join("\n... ") + "\n\n";
		_trace("{0}", message);
		// eslint-disable-next-line no-alert
		alert(message);
	}

	_trace("===== validateWizardConfig returning =====");
};

appWizard.processWizardConfig = function processWizardConfig() {
	_trace("===== processWizardConfig called =====");

	wizardConfig = appDispatch.onWizardWillProcessConfig(wizardConfig) || wizardConfig;

	_trace(" ...> processing wizardConfig.sections");
	appWizard.sections = wizardConfig.sections;
	appWizard.sectionsOrder = wizardConfig.sectionsOrder;
	appWizard.sectionsOrder.forEach(function each(sectionId) {
		appWizard.sections[sectionId].visible = false;
	});

	_trace(" ...> processing wizardConfig.slides");
	appWizard.slides = wizardConfig.slides;
	appWizard.slidesOrder = wizardConfig.slidesOrder;
	let previousSlide = null, previousSlideId = null;
	// Mark up each slide with its own slideId and references to its neighbours for previous/next functionality
	appWizard.slidesOrder.forEach(function each(slideId, index) {
		let slide = appWizard.slides[slideId];
		slide.slideId = slideId;
		slide.slideIndex = index;
		if (typeof slide.permitDisplayWhen !== "function") {
			slide.permitDisplayWhen = function permitDisplayWhenDefault() { return true; };
		}
		slide.previousSlideId = slide.nextSlideId = null;
		if (previousSlide) {
			slide.previousSlideId = previousSlideId;
			previousSlide.nextSlideId = slideId;
		}
		previousSlide = slide;
		previousSlideId = slideId;
	});

	_trace(" ...> processing wizardConfig.answerKinds");
	let answerKindsCfg = wizardConfig.answerKinds;
	Object.keys(answerKindsCfg).forEach(function each(id) {
		let akc = answerKindsCfg[id], obj = JSON.parse(JSON.stringify(akc));
		obj.id = id;
		obj.answerSelectedCallback = appWizard.answerSelectedCallback.bind(null, id);
		obj.syncType = akc.syncWithDropdownClass ? "dropdown" : "none"; // Could eventually add support for radio buttons, if needed.
		_answerKinds[id] = obj;
	});

	appDispatch.onWizardDidProcessConfig(wizardConfig);

	_trace("===== processWizardConfig returning =====");
};

// endregion Validate and process wizard config
// region Rendering wizard UI into #wizardSection

appWizard.renderMain = function renderMain() {
	_trace("===== renderMain called =====");

	appDispatch.onWizardWillRenderUI();

	$nonWizard = $body.find("#nonWizardSections");
	appWizard.$wizard = $wizard = $body.find("#wizardSection");
	$body.addClass(appWizard.wizardConfigName);
	$wizard.empty();

	appWizard.renderSectionMap();
	appWizard.renderSlideArea();
	appWizard.renderButtonsAboveSlide();
	appWizard.renderSummary();
	appWizard.renderAllSlides();
	appWizard.renderControlsForAllSyncedAnswers();
	appWizard.renderControlsForAllNonSyncedAnswers();
	appWizard.renderButtonsBelowSlide();

	appStage.hookUpChartSectionEvents();
	appStage.hookUpSavingsSectionEvents(appWizard.savingsAccountSliderStopped);
	appStage.maybeSetUpVideoLibraryFeature();

	appStage.updateDynamicUsageCategoryContent();
	appStage.updateModelingContents(true); // forceRebuild = true
	appWizard.renderPlanProvisions();
	$wizard.find(".printOnly").remove(); // wizard copy of modeling contents doesn't need hidden elements specific to print view

	$wizard.find(".spouse")[(appData.hasSpouse() ? "removeClass" : "addClass")]("hiddenNotApplicable");
	let numberOfChildren = parseInt(appData.personal.numberOfChildrenStr, 10);
	for (let i = 1; i <= 5; i += 1) {
		$wizard.find(".child" + i)[(i <= numberOfChildren ? "removeClass" : "addClass")]("hiddenNotApplicable");
	}

	$wizard.find(".answerSpecific").addClass("hiddenNotApplicable");

	// Copy the master results table from the main tool into corresponding places in the wizard. The final results slide
	// version should appear similar to the main tool version, while the initial results slide version should be classed
	// with "alternate_noEmployeeFunding" with modifications to certain rows.
	$wizard.find("div.mainResultsTableDivCopy").html($nonWizard.find("div.mainResultsTableDiv").html());

	$wizard.find("div.mainResultsTableDivCopy.alternate_noEmployeeFunding table.resultsTable").addClass("alternate_noEmployeeFunding");
	$wizard.find("table.resultsTable.alternate_noEmployeeFunding .finalResultsVersion").remove();
	$wizard.find("table.resultsTable:not(.alternate_noEmployeeFunding) .intermediateResultsVersion").remove();
	// Also, from above and below the MPCE chart, copy the top notes and the footnotes.
	$wizard.find("div.mainChartTopNotesCopy").html($nonWizard.find("div.mainChartTopNotes").html());
	$wizard.find("div.mainChartTopNotesCopy.alternate_noEmployeeFunding .finalResultsVersion").remove();
	$wizard.find("div.mainChartFootnotesCopy").html($nonWizard.find("div.mainChartFootnotes").html());
	$wizard.find("div.mainChartFootnotesCopy.alternate_noEmployeeFunding .finalResultsVersion").remove();

	// If wizard config defines additionalHelpModalsHtml, fill in #vueAppExtraHelpModalsForWizard
	// and initialize a Vue instance to generate the additional help modals.
	if (!isNullOrUndefined(wizardConfig.additionalHelpModalsHtml)) {
		$body.find("#vueAppExtraHelpModalsForWizard").html(wizardConfig.additionalHelpModalsHtml);
		// noinspection JSValidateTypes
		let vueApp = Vue.createApp({});
		vueApp.use(appData.vuexStore);
		vueApp.component(helpModal.name, helpModal);
		vueApp.mount("#vueAppExtraHelpModalsForWizard");
	}

	appWizard.maybeSetUpPersonasModel();

	appDispatch.onWizardDidRenderUI();


	_trace("===== renderMain returning =====");
};

appWizard.renderSectionMap = function renderSectionMap() {
	_trace(" ...> renderSectionMap");

	let htmlFmt = '\
		<div class="row sectionMapRow">\
			<table class="col-md-12 sectionMapTable">\
				<tr>{0}</tr>\
			</table>\
		</div>';

	// Fill/format and place resulting HTML content in appropriate spot
	let configSections = appWizard.sections, cells = "";
	appWizard.sectionsOrder.forEach(function each(sectionId) {
		let section = configSections[sectionId], iconHtml = section.iconHtml || "", title = section.title;
		cells += strFmt(
			'<td class="{0} hiddenNotApplicable cell unvisited" data-section-id="{0}"><div class="icon">{1}</div><div class="title">{2}</div></td>',
			sectionId, iconHtml, title);
	});
	let html = strFmt(htmlFmt, cells);
	$wizard.append(html);

	// Cache references to key elements just rendered
	appWizard.$sectionMap = $sectionMap = $wizard.find(".sectionMapTable");

	// Hook up cell click events to support backward navigation to visited sections.
	// n.b. The click will take the user to the _first_ visible slide in the section.
	$sectionMap.find("td").off("click").on("click", appWizard.sectionMapCellClick);
};

appWizard.renderSlideArea = function renderSlideArea() {
	_trace(" ...> renderSlideArea");

	let generalCfg = wizardConfig.general;
	let previousIconHtml = (generalCfg && generalCfg.previousIconHtml) || "&lt;";
	let nextIconHtml = (generalCfg && generalCfg.nextIconHtml) || "&gt;";
	let htmlFmt = '\
		<div class="row mainRow">\
			<button class="previousArea previousButton" aria-label="Previous">{0}</button>\
			<div class="slideArea col" style="position: relative;"></div>\
			<button class="nextArea nextButton" aria-label="Next">{1}</button>\
		</div>';

	// Fill/format and place resulting HTML content in appropriate spot
	let html = strFmt(htmlFmt, previousIconHtml, nextIconHtml);
	$wizard.append(html);

	// Cache references to key elements just rendered
	appWizard.$mainRow = $mainRow = $wizard.find(".mainRow");
	appWizard.$slideArea = $slideArea = $wizard.find(".slideArea");
};

appWizard.renderButtonsAboveSlide = function renderButtonsAboveSlide() {
	_trace(" ...> renderButtonsAboveSlide");

	let htmlFmt = '\
	<nav class="buttonsAboveSlide row">\
		<div class="col text-start">\
			<button class="btn btn-primary previousButton">{0}</button>&nbsp;\
		</div>\
		<div class="col text-end">\
			<button class="btn btn-secondary videoLibraryButton" data-bs-target="#modal_VideoLibrary" data-bs-toggle="modal">{1}</button>&nbsp;\
		</div>\
	</nav>';

	// Fill/format and place resulting HTML content in appropriate spot
	let generalCfg = wizardConfig.general;
	let previousButtonText = (generalCfg && generalCfg.previousButtonText) || "Go back";
	let videoLibraryButtonText = (generalCfg && generalCfg.videoLibraryButtonText) || "Learn more";
	let html = strFmt(htmlFmt, previousButtonText, videoLibraryButtonText);
	$slideArea.append(html);

	// Cache references to key elements just rendered
	appWizard.$previousButton = $previousButton = $mainRow.find(".previousButton");
	appWizard.$nextButton = $nextButton = $mainRow.find(".nextButton");
};

appWizard.renderSummary = function renderSummary() {
	_trace(" ...> renderSummary");

	let htmlFmt = "", html;
	if (!isNullOrUndefined(wizardConfig.summary) && ("htmlContent" in wizardConfig.summary)) {
		// The summary panel is enabled. Fill/format and place resulting HTML content in appropriate spot.
		_summaryEnabled = true;
		htmlFmt = wizardConfig.summary.htmlContent;
		html = htmlFmt; // currently, no substitutions required
		$slideArea.append(html);
		// Cache references to key elements just rendered
		appWizard.$summary = $summary = $wizard.find(".summary");
	} else {
		// The summary panel is disabled;
		_summaryEnabled = false;
		appWizard.$summary = $summary = $();
	}
};

appWizard.renderAllSlides = function renderAllSlides() {
	_trace(" ...> renderAllSlides");

	let htmlFmt = '\
		<div class="slide {0}">\
			{1}\
			<div class="slideContent">\
				{2}\
			</div>\
		</div>';

	appWizard.slidesOrder.forEach(function each(slideId) {
		let slide = appWizard.slides[slideId], slideHtml = strFmt(htmlFmt, slideId, slide.titleHtml || "", slide.htmlContent);
		$slideArea.append(slideHtml);
		// Cache reference to individual slide element directly in corresponding slide config object
		slide.$slide = $slideArea.find("div.slide." + slideId);
	});

	// Cache references to entire collection of slides
	appWizard.$slides = $slides = $slideArea.find("div.slide");
};

appWizard.renderControlsForAnswerKind = function renderControlsForAnswerKind(id) {
	let answerKind = _answerKinds[id], $answers = $slides.find(".answers." + id), answersTagName = $answers.prop("tagName");
	$answers.empty();
	if (answersTagName === "UL") {
		appWizard.renderButtonsForAnswerKind(answerKind, $answers);
	} else if (answersTagName === "SELECT") {
		appWizard.renderDropdownForAnswerKind(answerKind, $answers);
	}
};

appWizard.renderButtonsForAnswerKind = function renderButtonsForAnswerKind(answerKind, $answers) {
	let makeAnswerButtonHtml = function makeAnswerButtonHtml(includeCheck, linkCssClass, answerId, description, maybeIconMarkup) {
		let linkClass = linkCssClass || "btn btn-secondary", checkClass = (wizardConfig.general && wizardConfig.general.checkCssClass) || "";
		let maybeDivCheck = (checkClass && includeCheck) ? strFmt("<div class='check'><i class='{0}'></i></div>", checkClass) : "";
		let result = strFmt("<li>{0}<button class='{1}' data-answer-id='{2}'>{3}<div class='text'>{4}</div></button></li>",
			maybeDivCheck, linkClass, answerId, !isNullOrUndefined(maybeIconMarkup) ? maybeIconMarkup : "", description);
		return result;
	};

	let includeCheck = $answers.hasClass("includeCheck");
	if (answerKind.syncType === "none") {
		answerKind.ordered && answerKind.ordered.forEach(function each(answerId) {
			$answers.append(makeAnswerButtonHtml(includeCheck, answerKind.linkCssClass, answerId,
				answerKind.full[answerId].description, answerKind.full[answerId].iconHtml));
		});
	} else if (answerKind.syncType === "dropdown") {
		let $dropdownOptions = $nonWizard.find("select." + answerKind.syncWithDropdownClass).first().find("option");
		// Check if there are overriding descriptions and/or iconHtml for the options in the answerKind object
		$dropdownOptions.each(/* @this HTMLElement */ function each() {
			let $option = $(this), value = $option.val(), description = $option.text(), maybeIconHtml;
			if ("full" in answerKind) {
				let valueOptions = answerKind.full[value];
				if (!isNullOrUndefined(valueOptions)) {
					if ("description" in valueOptions) { description = valueOptions.description; }
					if ("iconHtml" in valueOptions) { maybeIconHtml = valueOptions.iconHtml; }
				}
			}
			$answers.append(makeAnswerButtonHtml(includeCheck, answerKind.linkCssClass, value, description, maybeIconHtml));
		});
	}
	$answers.find(".btn").off("click").on("click", answerKind.answerSelectedCallback);
};

appWizard.renderDropdownForAnswerKind = function renderDropdownForAnswerKind(answerKind, $answers) {
	if (answerKind.syncType === "dropdown") {
		let $fullToolDropdown = $nonWizard.find("select." + answerKind.syncWithDropdownClass).first();
		if (!_explicitChoices[answerKind.id] && !_usedFullToolAlready) {
			$answers.append($(strFmt("<option value=''>{0}</option>",
				("selectOneText" in wizardConfig.general) ? wizardConfig.general.selectOneText : "(select one)")));
			$answers.addClass("required");
			$answers.addClass("form-control").append($fullToolDropdown.html()).val("");
		} else {
			$answers.addClass("form-control").append($fullToolDropdown.html()).data("selected-answer-id", $fullToolDropdown.val());
		}
		// Check if there are overriding descriptions for the options in the answerKind object
		$answers.find("option").each(/* @this HTMLElement */ function each() {
			let $option = $(this), value = $option.val(), description = $option.text();
			if ("full" in answerKind) {
				let valueOptions = answerKind.full[value];
				if (!isNullOrUndefined(valueOptions)) {
					if ("description" in valueOptions) { description = valueOptions.description; }
				}
			}
			$option.text(description);
		});
		$answers.off("change").on("change", answerKind.answerSelectedCallback);
	} else {
		$answers.text(strFmt("{{ answerKind {0} rendered to SELECT element must have a value for syncWithDropdownClass. }}", answerKind.id));
	}
};

appWizard.renderControlsForAllSyncedAnswers = function renderControlsForAllSyncedAnswers() {
	_trace(" ...> renderControlsForAllSyncedAnswers");
	Object.keys(_answerKinds).filter(
		function filter(id) { return _answerKinds[id].syncType !== "none"; }).forEach(appWizard.renderControlsForAnswerKind);
};

appWizard.renderControlsForAllNonSyncedAnswers = function renderControlsForAllNonSyncedAnswers() {
	_trace(" ...> renderControlsForAllNonSyncedAnswers");
	Object.keys(_answerKinds).filter(
		function filter(id) { return _answerKinds[id].syncType === "none"; }).forEach(appWizard.renderControlsForAnswerKind);
};

appWizard.renderButtonsBelowSlide = function renderButtonsBelowSlide() {
	_trace(" ...> renderButtonsBelowSlide");

	let htmlFmt = '\
		<nav class="buttonsBelowSlide">\
			<button class="btn btn-primary btn-lg previousButton">{0}</button>\
			<button class="btn btn-primary btn-lg nextButton">{1}</button>\
			<button class="btn btn-success btn-lg clickGoesToFullTool finalFullToolButton">{2}</button>\
		</nav>';

	// MAYBE: Allow titles for each button to be slide-specific?

	// Fill/format and place resulting HTML content in appropriate spot
	let generalCfg = wizardConfig.general;
	let previousButtonText = (generalCfg && generalCfg.previousButtonText) || "Previous";
	let nextButtonText = (generalCfg && generalCfg.nextButtonText) || "Next";
	let finalFullToolButtonText = (generalCfg && generalCfg.finalFullToolButtonText) || "Full tool";
	let html = strFmt(htmlFmt, previousButtonText, nextButtonText, finalFullToolButtonText);
	$slideArea.append(html);

	// Cache references to key elements just rendered
	appWizard.$previousButton = $previousButton = $mainRow.find(".previousButton");
	appWizard.$nextButton = $nextButton = $mainRow.find(".nextButton");
};

appWizard.maybeSetUpPersonasModel = function maybeSetUpPersonasModel() {
	if (appWizard.wizardConfigName !== "wizardConfigPersonas") {
		_trace(" ...> maybeSetUpPersonasModel called, but not required for configuration {0} =====", appWizard.wizardConfigName);
		return;
	}

	// Require the custom Vue components supporting the personas model. Then, initialize a Vue instance on each
	// element classed "vueAppPersonasHost", while providing each the shared Vuex store managed by appData.
	_trace(" ...> maybeSetUpPersonasModel called and running additional initialization");
	require([
		"appCore/components/MatchName",
		"appCore/components/YourMatch",
		"appCore/components/PlanTile",
		"appCore/components/PlanTiles"
	], function modulesLoaded(matchName, yourMatch, planTile, planTiles) {
		_trace("Additional components needed by wizardConfigPersonas have been loaded");
		_trace("Setting up new Vue app instances on elements with class vueAppPersonasHost");
		let $vueAppPersonasHostElements = $body.find(".vueAppPersonasHost:not(.notInUse)");
		$vueAppPersonasHostElements.each(/* @this HTMLElement */ function each() {
			let vueApp = Vue.createApp({});
			vueApp.use(appData.vuexStore);
			vueApp.component(matchName.name, matchName);
			vueApp.component(yourMatch.name, yourMatch);
			vueApp.component(planTile.name, planTile);
			vueApp.component(planTiles.name, planTiles);
			vueApp.mount($(this)[0]);
		});
		appData.vuexStore.dispatch("setAllPersonas", wizardConfig.allPersonas);
	});

	appWizard.setUpPersonasModelHoverAnswerText();
};

appWizard.setUpPersonasModelHoverAnswerText = function setUpPersonasModelHoverAnswerText() {
	_trace(" ...> setUpPersonasModelHoverAnswerText");

	let shouldShowHoverPanel = false, lastHideHoverTimeout = null;
	$wizard.find(".slide .answers.enableHoverAnswerText .btn").on({
		click: function onClick() {
			clearTimeout(lastHideHoverTimeout);
			let $slide = appWizard.currentSlide.$slide;
			$slide.find("div.hoverAnswerText").addClass("hiddenNotApplicable");
			$slide.find(".selectedAnswerText").removeClass("hiddenNotApplicable");
		},
		mouseenter: function onMouseEnter(event) {
			let $btn = $(event.currentTarget);
			shouldShowHoverPanel = !$btn.parent().hasClass("selectedAnswer");
			if (shouldShowHoverPanel) {
				clearTimeout(lastHideHoverTimeout);
				let answerId = $btn.data("answer-id"), $slide = appWizard.currentSlide.$slide, $hoverAnswerText = $slide.find("div.hoverAnswerText");
				$hoverAnswerText.removeClass("hiddenNotApplicable");
				$hoverAnswerText.find("> .alert").html($slide.find("div.answerSpecific.answer-" + answerId).html());
				$slide.find(".selectedAnswerText").addClass("hiddenNotApplicable");
			}
		},
		mouseleave: function onMouseLeave() {
			clearTimeout(lastHideHoverTimeout);
			shouldShowHoverPanel = false;
			let $slide = appWizard.currentSlide.$slide;
			lastHideHoverTimeout = setTimeout(function soon() {
				if (!shouldShowHoverPanel) {
					$slide.find("div.hoverAnswerText").addClass("hiddenNotApplicable");
					$slide.find(".selectedAnswerText").removeClass("hiddenNotApplicable");
				}
			}, 50);
		}
	}); // end object containing click, mouseenter, and mouseleave handlers
};

// endregion Rendering complete wizard UI into wizard section
// region Handling switch from wizard to full tool and back

appWizard.switchToFullTool = function switchToFullTool(event) {
	_trace("switchToFullTool");

	let isImplicitSwitch = isNullOrUndefined(event); // true if switching only to use tax calculator

	if (!isImplicitSwitch) { appDispatch.onWizardWillSwitchToFullTool(appWizard.currentSlide.slideId); }
	$body.removeClass("duringWizard");
	$nonWizard.stop(true, true);
	$wizard.stop(true, true);
	$wizard.slideUp(300);
	appCharts.destroyChartsInElement($wizard);
	appStage.maybeReflowCharts();

	let $fadeOut = $sectionMap.add($slideArea);
	$fadeOut.animate({ opacity: 0 }, {
		duration: 200, complete: function completeFadeOut() {
			appStage.maybeReflowCharts();
			$nonWizard.slideDown(400, function completeSlideDown() {
				$fadeOut.css({ opacity: 1 });
			});
		}
	});

	if (!isImplicitSwitch) {
		$body.find("#topMenu button.useWizardButton").focus();
		appDispatch.onWizardDidSwitchToFullTool(appWizard.currentSlide.slideId);
	}
};

appWizard.switchToWizard = function switchToWizard(event) {
	_trace("switchToWizard");

	let isImplicitSwitch = isNullOrUndefined(event); // true if switching back from tax calculator

	if (!isImplicitSwitch) { appDispatch.onWizardWillSwitchToWizard(appWizard.currentSlide.slideId); }
	_usedFullToolAlready = true;
	appWizard.updateSyncedAnswersFromFullTool();
	appWizard.updateSections("appWizard.switchToWizard");
	if (_summaryEnabled) { appWizard.updateSummary("appWizard.switchToWizard"); }
	appWizard.maybeAutoMove();
	$body.addClass("duringWizard");
	$nonWizard.stop(true, true);
	$wizard.stop(true, true);
	$wizard.slideDown(400);
	$nonWizard.slideUp(400);

	let $maybeWizardChart = appWizard.currentSlide.$slide.find(".mpceChart:not(.notInUse), .mpceChartNoEmployeeFunding:not(.notInUse)");
	if ($maybeWizardChart.length > 0) { $maybeWizardChart.css({ opacity: 0 }); }
	setTimeout(function timeout() {
		appCharts.initializeMpceCharts("appWizard.switchToWizard", true); // preserveExisting
		appCharts.requestChartUpdate("appWizard.switchToWizard", true); // doNotWait
		appStage.maybeReflowCharts();
		$maybeWizardChart.animate({ "opacity": 1 }, 250);
	}, 450);

	// Animate the opacity of the slide area to indicate some change may have occurred due to use of full tool
	let $fadeIn = $sectionMap.add($slideArea);
	$fadeIn.css({ opacity: 0 }).animate({ opacity: 1 }, { duration: 600, complete: function complete() { $fadeIn.css({ opacity: 1 }); } });

	if (!isImplicitSwitch) {
		$body.find("#topMenu button.useFullToolButton").focus();
		appDispatch.onWizardDidSwitchToWizard(appWizard.currentSlide.slideId);
	}
};

appWizard.didUseFullToolAlready = function didUseFullToolAlready() {
	// Of potential use to implementation custom logic which could render additional summary items.
	return _usedFullToolAlready;
};

// endregion Handling switch from wizard to full tool and back
// region Handling appDefault events of interest to wizard

appWizard.onEngineWillRunMpceCalculation = function onEngineWillRunMpceCalculation(inputs) {
	_trace("onEngineWillRunMpceCalculation");

	if (_summaryEnabled) { appWizard.updateSummary("appWizard.onEngineWillRunMpceCalculation"); }
	return inputs;
};

appWizard.onEngineDidRunMpceCalculation = function onEngineDidRunMpceCalculation(inputs, allResults) {
	_trace("onEngineDidRunMpceCalculation");

	let noEEFundingResults = allResults.alternate_noEmployeeFunding;
	if (noEEFundingResults) {
		let $noEEFundingTables = $slides.find(".resultsTable.alternate_noEmployeeFunding");
		$noEEFundingTables.length && appStage.updateResultsTables($noEEFundingTables, noEEFundingResults, "noEmployeeFunding");
		noEEFundingResults.orderedPlanIds.forEach(function each(planId) {
			$noEEFundingTables.find(".planSpecific." + planId + ":not(.notInUse)").show();
		});
	}


	return allResults;
};

appWizard.onAppWillCompileConfig = function onAppWillCompileConfig(reason, currentSubconfigId, newSubconfigId) {
	_trace("onAppWillCompileConfig: reason: {0}, current: {1}, new: {2}", reason, currentSubconfigId, newSubconfigId);
};

appWizard.onAppDidCompileConfig = function onAppDidCompileConfig(reason, oldSubconfigId, currentSubconfigId) {
	_trace("onAppDidCompileConfig: reason: {0}, old: {1}, current: {2}", reason, oldSubconfigId, currentSubconfigId);
	appWizard.renderControlsForAllSyncedAnswers();
	appWizard.updateSyncedAnswersFromFullTool();
};

// endregion Handling appDefault events of interest to wizard
// region Handling slide answer click and sync with full tool

appWizard.answerSelectedCallback = function answerSelectedCallback(answerKindId, event) {
	let $answers = $slides.find(".answers." + answerKindId), answersTagName = $answers.prop("tagName"), $control = $(event.currentTarget);
	let currentAnswerId = $answers.data("selected-answer-id"), selectedAnswerId, selectedAnswerDescription;

	let hasCheckEffect = false;
	if (answersTagName === "UL") {
		let $answerButtonClicked = $control;
		selectedAnswerId = $answerButtonClicked.data("answer-id");
		if (isNullOrUndefined(selectedAnswerId) || (selectedAnswerId === currentAnswerId)) { return; }
		_trace("answerSelectedCallback: answerKindId: {0}, selectedAnswerId: {1}", answerKindId, selectedAnswerId);
		let $controlParent = $answerButtonClicked.parent();
		let $buttonsNotClicked = $answers.find(".btn").not($answerButtonClicked), $buttonsNotClickedParents = $buttonsNotClicked.parent();
		$buttonsNotClickedParents.removeClass("selectedAnswer", 200);
		$buttonsNotClickedParents.find(".check").fadeOut(300);
		$controlParent.addClass("selectedAnswer", 400);
		let $check = $controlParent.find(".check");
		if ($check.length > 0) {
			if (!$.fx.off) {
				hasCheckEffect = true;
				$check.css({ width: 0 }).css({ opacity: 0 }).animate({ width: "34px", opacity: 1 },
					{ duration: 400, complete: function complete() { $check.css({ width: "" }).css({ opacity: "" }); } });
			} else {
				$check.show();
			}
		}
		$answers.data("selected-answer-id", selectedAnswerId);
		selectedAnswerDescription = $answerButtonClicked.text();
	} else if (answersTagName === "SELECT") {
		let $answersDropdown = $control;
		selectedAnswerId = $answersDropdown.val();
		_trace("answerSelectedCallback: answerKindId: {0}, selectedAnswerId: {1}", answerKindId, selectedAnswerId);
		$answers.val(selectedAnswerId);
		$answers.find("option[value='']").remove();
		$answers.data("selected-answer-id", selectedAnswerId);
		$answers.attr("data-option", selectedAnswerId);
		$answers.removeClass("required");
		selectedAnswerDescription = $answersDropdown.find(":selected").text();
	}
	let answerKind = _answerKinds[answerKindId], skipUpdateSummary = !_summaryEnabled;
	appWizard.updateAnswerSpecificElements(answerKindId, selectedAnswerId, selectedAnswerDescription);
	appWizard.updateNextPreviousButtonState("appWizard.answerSelectedCallback");

	let delayForEffectsMsec = 0;
	if (!$.fx.off) {
		// Optional effect: Pulsing the keyInfo value in the "You selected..." line, if there is one also classed animateChanged.
		let $keyInfo = $slides.find(".answerSpecific." + answerKindId + " .keyInfo.animateChange"), hasKeyInfoEffect = $keyInfo.length > 0;
		if (hasKeyInfoEffect) {
			$keyInfo.finish();
			let keyInfoCurrentColor = $keyInfo.css("color"), documentElementComputedStyle = getComputedStyle(document.documentElement);
			let keyInfoPulseTextColor = documentElementComputedStyle.getPropertyValue("--wizard-color-slide-keyInfo-pulse-text");
			let keyInfoPulseBackgroundColor = documentElementComputedStyle.getPropertyValue("--wizard-color-slide-keyInfo-pulse-background");
			$keyInfo.css({ color: keyInfoPulseTextColor, backgroundColor: keyInfoPulseBackgroundColor });
			$keyInfo.animate({ color: keyInfoCurrentColor, backgroundColor: "transparent" }, 1000, "linear");
		}
		// Optional effect: Showing the button/dropdown value being transferred to the summary area.
		let hasTransferEffect = false;
		if (_summaryEnabled) {
			let $transferEffectDest = $summary.find(answerKind.summaryValueSelector);
			hasTransferEffect = $transferEffectDest.length > 0;
			if (hasTransferEffect) {
				appWizard.maybeTransferToSummaryEffect($control, $summary.find(answerKind.summaryValueSelector));
			}
		}
		delayForEffectsMsec = (hasCheckEffect || hasKeyInfoEffect || hasTransferEffect) ? 600 : 0;
	}

	// Put the changes into effect after the computed delay for the effects in use.
	setTimeout(function completeChanges() {
		appDispatch.onWizardUserSelectedAnswer(appWizard.currentSlide.slideId, answerKindId, selectedAnswerId);
		_explicitChoices[answerKindId] = true;
		if (answerKind && answerKind.syncType === "dropdown") {
			let $fullToolDropdown = $nonWizard.find("select." + answerKind.syncWithDropdownClass).first(), oldValue = $fullToolDropdown.val();
			if (selectedAnswerId !== oldValue) {
				$fullToolDropdown.val(selectedAnswerId).trigger("change");
				skipUpdateSummary = true; // as changing dropdown value triggers results update, etc.
			}
		} else {
			// Wasn't an answer button that syncs with a full tool dropdown; could be a button specific to the personas model.
			appWizard.maybeHandlePersonasModelSelectedAnswer(appWizard.currentSlide.slideId, answerKindId, selectedAnswerId);
		}
		if (!skipUpdateSummary) { appWizard.updateSummary("appWizard.answerSelectedCallback"); }
	}, delayForEffectsMsec);
};

appWizard.updateAnswerSpecificElements = function updateAnswerSpecificElements(
	answerKindId, selectedAnswerId, selectedAnswerDescription) {
	$slides.find(".answerSpecific." + answerKindId).addClass("hiddenNotApplicable");
	$slides.find(".answerSpecific." + answerKindId + ".answer-" + selectedAnswerId).removeClass("hiddenNotApplicable");
	$slides.find(".answerSpecific." + answerKindId + ".answerTemplate").removeClass("hiddenNotApplicable");
	$slides.find(".answerSpecific." + answerKindId + ".answerTemplate .description").html(selectedAnswerDescription);
};

appWizard.maybeTransferToSummaryEffect = function maybeTransferToSummaryEffect($from, $to, optionalCompletionCallback) {
	_trace("appWizard.maybeTransferToSummaryEffect");

	let completionCallback = function completion() {
		_holdSummaryUpdates = false;
		appWizard.updateSummary("appWizard.maybeTransferToSummaryEffect() completion callback");
		(typeof optionalCompletionCallback === "function") && optionalCompletionCallback();
	};

	if (!$.fx.off && $from.length > 0 && $to.length > 0 && $to.is(":visible")) {
		_holdSummaryUpdates = true;
		$from.transfer({ to: $to, duration: 600 }, completionCallback);
	} else {
		completionCallback();
	}
};

appWizard.updateSingleSyncedAnswer = function updateSingleSyncedAnswer(answerKindId) {
	_trace("updateSingleSyncedAnswer: answerKindId: {0}", answerKindId);

	let ak = _answerKinds[answerKindId];
	if (ak.syncType !== "dropdown") { return; }
	if (!_explicitChoices[answerKindId] && !_usedFullToolAlready) { return; }

	let $selectedOption = $nonWizard.find("select." + ak.syncWithDropdownClass).first().find("option:selected");
	let selectedAnswerId = $selectedOption.val(), $answers = $slides.find(".answers." + answerKindId), answersTagName = $answers.prop("tagName");
	$answers.data("selected-answer-id", selectedAnswerId || "");

	if (answersTagName === "UL") {
		let $answerButtons = $answers.find(".btn"), $buttonParents = $answerButtons.parent();
		$buttonParents.removeClass("selectedAnswer");
		let $selectedAnswerButton = $answers.find("[data-answer-id='" + selectedAnswerId + "']");
		$selectedAnswerButton.parent().addClass("selectedAnswer");
		appWizard.updateAnswerSpecificElements(answerKindId, selectedAnswerId, $selectedAnswerButton.text());
	} else if (answersTagName === "SELECT") {
		let $answersDropdown = $answers;
		$answersDropdown.val(selectedAnswerId);
		$answersDropdown.find("option[value='']").remove();
		$answers.data("selected-answer-id", selectedAnswerId);
		$answersDropdown.attr("data-option", selectedAnswerId);
		$answers.removeClass("required");
		appWizard.updateAnswerSpecificElements(answerKindId, selectedAnswerId, $answersDropdown.find(":selected").text());
	}
};

appWizard.updateSyncedAnswersFromFullTool = function updateSyncedAnswersFromFullTool() {
	_trace("updateSyncedAnswersFromFullTool");

	Object.keys(_answerKinds).filter(
		function filter(id) { return _answerKinds[id].syncType !== "none"; }).forEach(appWizard.updateSingleSyncedAnswer);
	if (_summaryEnabled) { appWizard.updateSummary("appWizard.updateSyncedAnswersFromFullTool"); }
	appWizard.updateNextPreviousButtonState("appWizard.updateSyncedAnswersFromFullTool");
};

appWizard.onAppDidChangeDynamicItem = function onAppDidChangeDynamicItem(itemId, visible, newValue, oldValue, options) {
	_trace("onAppDidChangeDynamicItem: itemId: {0}, visible: {1}, newValue: {2}, oldValue: {3}, options: [{4}]",
		itemId, visible, newValue, oldValue, options.join(", "));

	let updatedAtLeastOne = false;
	Object.keys(_answerKinds).filter(
		function filter(id) { return _answerKinds[id].syncWithDropdownClass === itemId; }).forEach(function each(id) {
		$slides.find(".answers." + id).empty();
		appWizard.renderControlsForAnswerKind(id);
		appWizard.updateSingleSyncedAnswer(id);
		updatedAtLeastOne = true;
	});
	if (updatedAtLeastOne) {
		appWizard.updateSections("appWizard.onAppDidChangeDynamicItem");
		if (_summaryEnabled) { appWizard.updateSummary("appWizard.onAppDidChangeDynamicItem"); }
		appWizard.updateNextPreviousButtonState("appWizard.onAppDidChangeDynamicItem");
	}
};

appWizard.savingsAccountSliderStopped = function savingsAccountSliderStopped(kind, value) {
	_trace("savingsAccountSliderStopped: kind {0}, value {1}", kind, value);

	let $currentSlide = appWizard.currentSlide.$slide;

	switch (kind) {
		case "hsa":
			_explicitChoices.hsaContributionAmount = true;
			if (_summaryEnabled) {
				appWizard.maybeTransferToSummaryEffect(
					$currentSlide.find(".hsaSliderTextInput"), $summary.find(".value.hsaContributionAmount"));
			}
			break;
		case "fsa":
			_explicitChoices.fsaContributionAmount = true;
			if (_summaryEnabled) {
				appWizard.maybeTransferToSummaryEffect(
					$currentSlide.find(".fsaSliderTextInput"), $summary.find(".value.fsaContributionAmount"));
			}
			break;
		case "carryover":
			_explicitChoices.carryoverAmount = true;
			if (_summaryEnabled) {
				appWizard.maybeTransferToSummaryEffect(
					$currentSlide.find(".carryoverSliderTextInput"), $summary.find(".value.carryoverAmount"));
			}
			break;
		default:
			break;
	}
};

// endregion Handling slide answer click and sync with full tool
// region Handling slide change, section & summary updates

appWizard.changeSlides = function changeSlides(direction) {
	_trace("changeSlides called; direction [{0}]{1} displaying [{2}]", direction,
		appWizard.previousSlide ? (" hiding [" + appWizard.previousSlide.slideId + "]") : "", appWizard.currentSlide.slideId);

	let previousSlideId = appWizard.previousSlide ? appWizard.previousSlide.slideId : null, currentSlideId = appWizard.currentSlide.slideId;
	let dispatchEvents = previousSlideId !== null; // suppresses event dispatch for initial slide
	dispatchEvents && appDispatch.onWizardWillChangeSlides(previousSlideId, currentSlideId, direction);

	$slideArea.find(".slide .slideContent").finish();

	let $currentSlide = appWizard.currentSlide.$slide, $previousSlide = appWizard.previousSlide ? appWizard.previousSlide.$slide : $();
	let $currentSlideContent = $currentSlide.find(".slideContent"), $previousSlideContent = $previousSlide.find(".slideContent");
	let $maybeWizardChart = $currentSlide.find(".mpceChart:not(.notInUse), .mpceChartNoEmployeeFunding:not(.notInUse)");
	let chartIsOnCurrentSlide = $maybeWizardChart.length > 0;

	appWizard.updateSections("appWizard.changeSlides");
	if (_summaryEnabled) { appWizard.updateSummary("appWizard.changeSlides"); }
	appWizard.updateNextPreviousButtonState("appWizard.changeSlides");

	let $wizardAndSlideArea = $wizard.add($slideArea);
	appWizard.previousSlide && $wizardAndSlideArea.removeClass(appWizard.previousSlide.slideId + " " + appWizard.previousSlide.sectionId);
	$wizardAndSlideArea.addClass(currentSlideId + " " + appWizard.currentSlide.sectionId);
	if (chartIsOnCurrentSlide) { $maybeWizardChart.css({ opacity: 0 }); }

	$slideArea.find(".slide, .slideContent").stop(true, true);

	let effectDirection1, effectDirection2;
	if (direction === "next") {
		effectDirection1 = "left";
		effectDirection2 = "right";
	} else if (direction === "previous") {
		effectDirection1 = "right";
		effectDirection2 = "left";
	} else { // assume "fallback"
		effectDirection1 = effectDirection2 = "up";
	}

	// noinspection JSIgnoredPromiseFromCall,JSValidateTypes
	$previousSlideContent.fadeOut({ duration: 100 }).promise().done(function doneSlideContentHide() {
		// noinspection JSIgnoredPromiseFromCall
		$previousSlide.hide("slide", { direction: effectDirection1 }, 300).promise().done(
			function doneSlideHide() {
				$previousSlide.removeClass("slideVisible");
				$previousSlide.add($previousSlideContent).css({ display: "" });
				$currentSlideContent.hide();
				// noinspection JSIgnoredPromiseFromCall
				$currentSlide.show("slide", { direction: effectDirection2 }, 600).promise().done(
					function doneCurrentSlideShow() {
						$currentSlide.addClass("slideVisible");
						$currentSlide.css({ display: "" });
						// noinspection JSIgnoredPromiseFromCall
						$currentSlideContent.fadeIn({ duration: 600 }).promise().done(
							function doneCurrentSlideContentShow() {
								if (chartIsOnCurrentSlide) {
									appStage.maybeReflowCharts();
									// fading in the chart below prevents potential jarring effect if reflow adjusted size
									$maybeWizardChart.animate({ "opacity": 1 }, 450);
								}
							});
					});
			});
	});

	dispatchEvents && appDispatch.onWizardDidChangeSlides(previousSlideId, currentSlideId, direction);
};

appWizard.updateSections = function updateSections(callerId) {
	_trace("updateSections: callerId: {0}", callerId);

	// Display only those sections that have slides permitted to display.
	appWizard.sectionsOrder.forEach(function each(sectionId) {
		appWizard.sections[sectionId].visible = false;
	});
	appWizard.slidesOrder.forEach(function each(slideId) {
		let slide = appWizard.slides[slideId], sectionId = slide.sectionId, section = appWizard.sections[sectionId];
		if (!section.visible) { section.visible = slide.permitDisplayWhen(appData, appEngine.configuration); }
	});
	appWizard.sectionsOrder.forEach(function each(sectionId) {
		$sectionMap.find("." + sectionId)[appWizard.sections[sectionId].visible ? "removeClass" : "addClass"]("hiddenNotApplicable");
	});

	// Update the states of the previous (if any) and current section
	if (isNullOrUndefined(appWizard.previousSlide)) {
		let selector = strFmt("tr td.{0}", appWizard.currentSlide.sectionId);
		$sectionMap.find(selector).removeClass("unvisited").addClass("current");
	} else if (appWizard.previousSlide.sectionId !== appWizard.currentSlide.sectionId) {
		_trace("Moving from sectionId {0} to sectionId {1}", appWizard.previousSlide.sectionId, appWizard.currentSlide.sectionId);
		$sectionMap.find("td.current").removeClass("current");
		let selectorPrevious = strFmt("tr td.{0}", appWizard.previousSlide.sectionId);
		let selectorCurrent = strFmt("tr td.{0}", appWizard.currentSlide.sectionId);
		$sectionMap.find(selectorPrevious).removeClass("unvisited").addClass("visited");
		$sectionMap.find(selectorCurrent).removeClass("unvisited visited").addClass("current");
	}
};

appWizard.updateSummary = function updateSummary(callerId) {
	_trace("updateSummary: callerId: {0}", callerId);
	if (!_summaryEnabled) {
		_trace("updateSummary: returning because _summaryEnabled is false");
		return;
	}

	if (_holdSummaryUpdates) {
		_trace("updateSummary: _holdSummaryUpdates is true; returning prematurely.");
		return;
	}

	let isVisible = !$summary.hasClass("hiddenNotApplicable"), shouldBeVisible = !appWizard.currentSlide.hideSummary;
	if (isVisible && !shouldBeVisible) {
		appDispatch.onWizardWillHideSummary(appWizard.currentSlide.slideId);
		$summary.addClass("hiddenNotApplicable");
		return; // skip updating contents below
	} else if (!isVisible && shouldBeVisible) {
		appDispatch.onWizardWillShowSummary(appWizard.currentSlide.slideId);
		$summary.removeClass("hiddenNotApplicable");
		// and proceed with updating contents below
	}

	appDispatch.onWizardWillUpdateSummary(appWizard.currentSlide.slideId);

	Object.keys(_answerKinds).filter(
		function filter(id) { return _answerKinds[id].syncType === "dropdown"; }).forEach(function each(id) {
		let answerKind = _answerKinds[id];
		if (_explicitChoices[id] || _usedFullToolAlready) {
			let $selectedOption = $nonWizard.find("select." + answerKind.syncWithDropdownClass).first().find("option:selected");
			let description = $selectedOption.text();
			// Check if there is an overriding description for the selected option in the answerKind object
			if ("full" in answerKind) {
				let value = $selectedOption.val(), valueOptions = answerKind.full[value];
				if (!isNullOrUndefined(valueOptions)) {
					if ("description" in valueOptions) { description = valueOptions.description; }
				}
			}
			$summary.find(answerKind.summaryValueSelector).removeClass("unknown").html(description).attr("data-option", $selectedOption.val());

		} else {
			$summary.find(answerKind.summaryValueSelector).addClass("unknown");
		}
	});

	// Savings account contribution amounts
	if (_explicitChoices.hsaContributionAmount || _usedFullToolAlready) {
		$summary.find(".value.hsaContributionAmount").removeClass("unknown").html(formatDollar(appData.personal.hsaContributionAmount));
	} else {
		$summary.find(".value.hsaContributionAmount").addClass("unknown");
	}

	if (_explicitChoices.fsaContributionAmount || _usedFullToolAlready) {
		$summary.find(".value.fsaContributionAmount").removeClass("unknown").html(formatDollar(appData.personal.fsaContributionAmount));
	} else {
		$summary.find(".value.fsaContributionAmount").addClass("unknown");
	}

	if (_explicitChoices.carryoverAmount || _usedFullToolAlready) {
		$summary.find(".value.carryoverAmount").removeClass("unknown").html(formatDollar(appData.personal.carryoverAmount));
	} else {
		$summary.find(".value.carryoverAmount").addClass("unknown");
	}

	// For summary items classed with a section id and/or slide id, hide them if the corresponding
	// section isn't visible or if the corresponding slide is not currently permitted to display.
	let sections = appWizard.sections, slides = appWizard.slides;
	appWizard.sectionsOrder.forEach(function each(sectionId) {
		let section = sections[sectionId];
		$summary.find("." + sectionId + ":not(.notInUse)")[!section.visible ? "addClass" : "removeClass"]("hiddenBySectionId");
	});
	appWizard.slidesOrder.forEach(function each(slideId) {
		let slide = slides[slideId], shouldDisplay = slide.permitDisplayWhen(appData, appEngine.configuration);
		$summary.find("." + slideId + ":not(.notInUse)")[!shouldDisplay ? "addClass" : "removeClass"]("hiddenBySlideId");
	});

	appDispatch.onWizardDidUpdateSummary(appWizard.currentSlide.slideId);
};

appWizard.shouldCurrentSlideDisplay = function shouldCurrentSlideDisplay() {
	let result = appWizard.currentSlide.permitDisplayWhen(appData, appEngine.configuration);
	return result;
};

appWizard.someEarlierSlideCanDisplay = function someEarlierSlideCanDisplay() {
	let result = false, currentSlide = appWizard.currentSlide;
	if (!isNullOrUndefined(currentSlide.previousSlideId)) {
		let slides = appWizard.slides, slidesOrder = appWizard.slidesOrder, config = appEngine.configuration;
		let index = slidesOrder.indexOf(currentSlide.slideId) - 1;
		while (index >= 0 && !result) {
			result = slides[slidesOrder[index]].permitDisplayWhen(appData, config);
			index -= 1;
		}
	}
	return result;
};

appWizard.someLaterSlideCanDisplay = function someLaterSlideCanDisplay() {
	let result = false, currentSlide = appWizard.currentSlide;
	if (!isNullOrUndefined(currentSlide.nextSlideId)) {
		let slides = appWizard.slides, slidesOrder = appWizard.slidesOrder, config = appEngine.configuration;
		let index = slidesOrder.indexOf(currentSlide.slideId) + 1;
		while (index < slidesOrder.length && !result) {
			result = slides[slidesOrder[index]].permitDisplayWhen(appData, config);
			index += 1;
		}
	}
	return result;
};

appWizard.maybeAutoMove = function maybeAutoMove(reason) {
	// If the current slide should no longer display due to a change in eligibility criteria, moves the
	// user to a fallback slide, or if no fallback slide is specified, then to a previous slide that can
	// display (if any), else to a subsequent slide that can display (if any).

	if (appWizard.shouldCurrentSlideDisplay()) {
		if (reason === "initial") { appWizard.changeSlides("initial"); }
		return;
	}

	let fallbackSlideId = appWizard.currentSlide.fallbackSlideId;
	if (!isNullOrUndefined(fallbackSlideId) && (fallbackSlideId in appWizard.slides)) {
		// There is a fallback slide specified. Change to it.
		appWizard.previousSlide = appWizard.currentSlide;
		appWizard.currentSlide = appWizard.slides[fallbackSlideId];
		let shouldDisplay = appWizard.shouldCurrentSlideDisplay();
		if (!shouldDisplay) {
			if (appWizard.someEarlierSlideCanDisplay()) {
				_trace("Fallback slide {0} shouldDisplay false; calling movePrevious()", appWizard.currentSlide.slideId);
				appWizard.movePrevious();
			} else {
				_trace("Fallback slide {0} shouldDisplay false and none earlier; calling moveNext()", appWizard.currentSlide.slideId);
				appWizard.moveNext();
			}
		}
		reason = reason || "fallback";
	} else {
		// There's no fallback slide specified. Back the user up to a previous slide that can display (if any), else forward.
		appWizard.previousSlide = appWizard.currentSlide;
		if (appWizard.someEarlierSlideCanDisplay()) {
			appWizard.movePrevious();
			reason = reason || "previous";
		} else {
			appWizard.moveNext();
			reason = reason || "next";
		}
	}
	if (appWizard.currentSlide.slideId !== appWizard.previousSlide.slideId) {
		appWizard.changeSlides(reason);
	}
	_trace("maybeAutoMove: previous: {0}, current: {1}", appWizard.previousSlide.slideId, appWizard.currentSlide.slideId);
};

// endregion Handling slide change, section & summary updates
// region Next/previous button and section map click handling

appWizard.nextPreviousClick = function nextPreviousClick(event, direction) {
	_trace("nextPreviousClick: #{0}Button clicked", direction);
	appWizard.previousSlide = appWizard.currentSlide;
	if (direction === "next") {
		let noLaterSlideCanDisplay = $(event.currentTarget).hasClass("noLaterSlideCanDisplay");
		if (!noLaterSlideCanDisplay) {
			let forced = event.ctrlKey && event.altKey; // forcing the move is meant for testing purposes, not for users
			appWizard.moveNext(forced);
		}
	} else if (direction === "previous") {
		let noEarlierSlideCanDisplay = $(event.currentTarget).hasClass("noEarlierSlideCanDisplay");
		if (!noEarlierSlideCanDisplay) {
			appWizard.movePrevious();
		}
	}
	let changed = appWizard.currentSlide.slideId !== appWizard.previousSlide.slideId;
	if (changed) {
		appWizard.changeSlides(direction);
		_trace("nextPreviousClick: #{0}Button click did change slides: previous: {1}, current: {2}",
			direction, appWizard.previousSlide.slideId, appWizard.currentSlide.slideId);
	} else {
		_trace("nextPreviousClick: #{0}Button click did not change slides", direction);
	}
};

appWizard.canSlidePermitNext = function canSlidePermitNext(slideId, skipLastSlideCheck) {
	// Checks whether the slide specified by slideId would permit the user to proceed to the following slide,
	// by ensuring that any set of answers on the specified slideId have an answer already selected. Returns true
	// if the slide specified by slideId would permit "Next" to be clicked, false otherwise.
	let slide = appWizard.slides[slideId], result;
	if (isNullOrUndefined(slide.nextSlideId) && !skipLastSlideCheck) {
		result = false;
	} else {
		let $slide = slide.$slide;
		let $answers = $slide.find(".answers").not(".hiddenNotApplicable, .notInUse").filter(function match(index, element) {
			let exclude = $(element).parents(".hiddenNotApplicable, .notInUse").length > 0; return !exclude;
		});
		let hasAnswers = $answers.length > 0, hasSelectedAnswers = true;
		$answers.each(function each(index, element) {
			let selectedAnswerId = $(element).data("selected-answer-id");
			hasSelectedAnswers = hasSelectedAnswers && !isNullOrUndefined(selectedAnswerId);
		});
		result = ((hasAnswers && hasSelectedAnswers) || !hasAnswers);
		if (!result) {
			let $answerRequired = $slide.find(".answerRequired");
			if ($answerRequired.hasClass("hiddenNotApplicable")) {
				$answerRequired.removeClass("hiddenNotApplicable"); // not yet displayed; show it
			} else {
				$answerRequired.addClass("answerRequiredEmphasis"); // already displayed; emphasize it
			}
		}
	}
	_trace("canSlidePermitNext: slideId: {0}:{1} returning {2}", slideId, (result ? "" : " answer required;"), result);
	return result;
};

appWizard.moveNext = function moveNext(forced) {
	// Attempts to move to the next visible slide, if any. Unless the forced parameter is true, the user won't be
	// able to move off the current slide if they have not selected an answer within each visible set of answers.
	// This method may recursively call itself to skip over slides indicating they should not be displayed.
	_trace("moveNext: forced: {0}", forced);

	if (!isNullOrUndefined(appWizard.currentSlide.nextSlideId)) {
		let permitNext = forced ? true : appWizard.canSlidePermitNext(appWizard.currentSlide.slideId);
		if (permitNext) {
			appWizard.currentSlide = appWizard.slides[appWizard.currentSlide.nextSlideId];
			let shouldDisplay = appWizard.shouldCurrentSlideDisplay();
			if (!shouldDisplay) {
				_trace("{0} shouldDisplay false; recursively calling moveNext()", appWizard.currentSlide.slideId);
				appWizard.moveNext(true); // forced = true, i.e. no need to check for selected answers on slide that won't display
			}
		}
	}
};

appWizard.movePrevious = function movePrevious() {
	// Attempts to move to the previous visible slide, if any.
	_trace("movePrevious");

	if (!isNullOrUndefined(appWizard.currentSlide.previousSlideId)) {
		appWizard.currentSlide = appWizard.slides[appWizard.currentSlide.previousSlideId];
		let shouldDisplay = appWizard.shouldCurrentSlideDisplay();
		if (!shouldDisplay) {
			_trace("{0} shouldDisplay false; recursively calling movePrevious()", appWizard.currentSlide.slideId);
			appWizard.movePrevious();
		}
	}
};

appWizard.updateNextPreviousButtonState = function updateNextPreviousButtonState(callerId) {
	_trace("updateNextPreviousButtonState: callerId: {0}", callerId);

	let isFirst = !appWizard.someEarlierSlideCanDisplay(), isLast = !appWizard.someLaterSlideCanDisplay();
	let $answers = appWizard.currentSlide.$slide.find(".answers").not(".hiddenNotApplicable, .notInUse").filter(
		function match(index, element) { let exclude = $(element).parents(".hiddenNotApplicable, .notInUse").length > 0; return !exclude; });
	let hasAnswers = $answers.length > 0, hasSelectedAnswers = true;
	$answers.each(function each(index, element) {
		let selectedAnswerId = $(element).data("selected-answer-id");
		hasSelectedAnswers = hasSelectedAnswers && !isNullOrUndefined(selectedAnswerId);
	});
	let permitPrevious = !isFirst;
	let permitNext = !isLast && ((hasAnswers && hasSelectedAnswers) || !hasAnswers);
	if (permitNext) { appWizard.currentSlide.$slide.find(".answerRequired").removeClass("answerRequiredEmphasis").addClass("hiddenNotApplicable"); }
	$previousButton[permitPrevious ? "removeClass" : "addClass"]("disabled");
	$previousButton[!isFirst ? "removeClass" : "addClass"]("noEarlierSlideCanDisplay");
	$nextButton[permitNext ? "removeClass" : "addClass"]("disabled");
	$nextButton[!isLast ? "removeClass" : "addClass"]("noLaterSlideCanDisplay");
	if (isLast) {
		if (!_reachedLastSlide) {
			appDispatch.onWizardUserReachedLastSlide();
			_reachedLastSlide = true;
		}
	}
};

appWizard.sectionMapCellClick = function sectionMapCellClick(event) {
	// Called when the user has clicked on one of the section map table cells. Delegates to one of three helper
	// methods that follow, according to the position of the section map cell clicked.
	let $cell = $(event.currentTarget);
	let targetSectionId = $cell.data("section-id"), targetSectionIndex = appWizard.sectionsOrder.indexOf(targetSectionId);
	let currentSectionId = appWizard.currentSlide.sectionId, currentSectionIndex = appWizard.sectionsOrder.indexOf(currentSectionId);
	if (targetSectionIndex > currentSectionIndex) {
		appWizard.laterSectionMapCellClick(event, targetSectionId);
	} else if (targetSectionIndex < currentSectionIndex) {
		appWizard.earlierSectionMapCellClick(event, targetSectionId);
	} else {
		appWizard.currentSectionMapCellClick(event, targetSectionId);
	}
};

appWizard.earlierSectionMapCellClick = function earlierSectionMapCellClick(event, sectionId) {
	// Called when the user clicks on a section map cell in a position before the user's current section.
	// Such backward navigation is always permitted, i.e. not subject to checks for required answers.
	// Clicking an earlier section map cell takes the user to the first visible slide in that section.
	_trace("earlierSectionMapCellClick: sectionId: {0}", sectionId);
	appWizard.slidesOrder.some(function each(slideId) {
		let slide = appWizard.slides[slideId], shouldDisplay = slide.permitDisplayWhen(appData, appEngine.configuration);
		if (shouldDisplay && slide.sectionId === sectionId && (appWizard.currentSlide.slideId !== slideId)) {
			appWizard.jumpToSlide(slideId);
			return true;
		}
		return false;
	});
};

appWizard.currentSectionMapCellClick = function currentSectionMapCellClick(event, sectionId) {
	// Called when the user clicks on the section map cell corresponding to the section for the current
	// slide. In this case, the tool will attempt to cycle to the next visible slide in the current section,
	// or else back to the first slide in the section if at the last slide in the current section.
	// The user will not be permitted to cycle slides if the current slide requires answer selection.
	// For testing purposes, clicking while holding CTRL+ALT bypasses the check for required answers.
	let slides = appWizard.slides;
	let visibleSlidesInSection = appWizard.slidesOrder.slice().filter(function filter(slideId) {
		let slide = slides[slideId];
		return (slide.sectionId === sectionId) && slide.permitDisplayWhen(appData, appEngine.configuration);
	});
	if (visibleSlidesInSection.length <= 1) {
		_trace("currentSectionMapCellClick: sectionId: {0}: no other slides to cycle through", sectionId);
		return;
	}
	let forced = event.ctrlKey && event.altKey; // meant for testing purposes, not for users
	let permitNext = forced ? true : appWizard.canSlidePermitNext(appWizard.currentSlide.slideId, true); // true = skipLastSlideCheck
	if (!permitNext) {
		_trace("currentSectionMapCellClick: sectionId: {0}: cannot cycle to next slide; permitNext is false", sectionId);
		return;
	}
	let currentSlideId = appWizard.currentSlide.slideId, currentSlideIndexInSection = visibleSlidesInSection.indexOf(currentSlideId);
	let targetSlideIndexInSection = currentSlideIndexInSection + 1;
	if (targetSlideIndexInSection >= visibleSlidesInSection.length) { targetSlideIndexInSection = 0; } // wraparound
	let targetSlideId = visibleSlidesInSection[targetSlideIndexInSection];
	_trace("currentSectionMapCellClick: sectionId: {0}: cycling to next slide in section {1}", sectionId, targetSlideId);
	appWizard.jumpToSlide(targetSlideId);
};

appWizard.laterSectionMapCellClick = function laterSectionMapCellClick(event, sectionId) {
	// Called when the user clicks on a section map cell in a position after the user's current section.
	// In this case, the tool will attempt to simulate the user clicking the "Next" button repeatedly so as
	// to reach the first slide in the target section. The user will not be permitted to proceed beyond any
	// intervening slide that requires an answer to be selected. For testing purposes, clicking while holding
	// CTRL+ALT bypasses the check for required answers.
	let forced = event.ctrlKey && event.altKey; // meant for testing purposes, not for users
	let currentSlideId = appWizard.currentSlide.slideId, currentSlideIndex = appWizard.slidesOrder.indexOf(currentSlideId);
	let remainingSlidesOrder = appWizard.slidesOrder.slice(currentSlideIndex), closestPossibleSlideId = null;
	remainingSlidesOrder.some(function each(slideId) {
		let slide = appWizard.slides[slideId], shouldDisplay = slide.permitDisplayWhen(appData, appEngine.configuration);
		let wouldSlidePermitNext = (shouldDisplay && !forced) ? appWizard.canSlidePermitNext(slideId) : true;
		if (!wouldSlidePermitNext) { closestPossibleSlideId = slideId; return true; }
		if (shouldDisplay && sectionId === slide.sectionId) { closestPossibleSlideId = slideId; return true; }
		let $sectionMapCell = $sectionMap.find("tr td." + slide.sectionId);
		if ($sectionMapCell.hasClass("unvisited")) { $sectionMapCell.removeClass("unvisited").addClass("visited"); }
		return false;
	});
	if (!isNullOrUndefined(closestPossibleSlideId) && closestPossibleSlideId !== currentSlideId) {
		_trace("laterSectionMapCellClick: sectionId {0}: jumping to closest possible slide {1}", sectionId, closestPossibleSlideId);
		appWizard.jumpToSlide(closestPossibleSlideId);
	} else {
		_trace("laterSectionMapCellClick: sectionId {0}: cannot move further", sectionId);
	}
};

appWizard.jumpToSlide = function jumpToSlide(targetSlideId) {
	// Jumps to the slide specified by targetSlideId. This method assumes all necessary checks have already been
	// performed (e.g. intervening required answers have been provided) and merely effects the slide change with the
	// corresponding direction's slide change animation.
	_trace("jumpToSlide: targetSlideId: {0}", targetSlideId);
	appWizard.previousSlide = appWizard.currentSlide;
	appWizard.currentSlide = appWizard.slides[targetSlideId];
	let previousSlideIndex = appWizard.slidesOrder.indexOf(appWizard.previousSlide.slideId);
	let currentSlideIndex = appWizard.slidesOrder.indexOf(appWizard.currentSlide.slideId);
	let direction = currentSlideIndex > previousSlideIndex ? "next" : "previous";
	appWizard.changeSlides(direction);
};

// endregion Next/previous button and section map click handling
// region Personas model specific logic

appWizard.maybeHandlePersonasModelSelectedAnswer = function maybeHandlePersonasModelSelectedAnswer(slideId, answerKindId, selectedAnswerId) {
	if (appWizard.wizardConfigName !== "wizardConfigPersonas") { return; }
	_trace("maybeHandlePersonasModelSelectedAnswer: {0} / {1} / {2}", slideId, answerKindId, selectedAnswerId);

	let updateUsageAssumptions = false;
	if ("coverageLevelAnswers" === answerKindId) {
		appData.vuexStore.dispatch("setCoverageLevelId", selectedAnswerId);
		updateUsageAssumptions = true;
	} else if ("usageAnswers" === answerKindId) {
		appData.vuexStore.dispatch("setUsageLevelId", selectedAnswerId);
		updateUsageAssumptions = true;
	} else if ("preferenceAnswers" === answerKindId) {
		appData.vuexStore.dispatch("setPreferenceId", selectedAnswerId);
		let $planPriorityRadioButtonsInput = $body.find("input.planPriorityRadioButtonsInput[value='" + selectedAnswerId + "']");
		$planPriorityRadioButtonsInput.prop("checked", true);
		$planPriorityRadioButtonsInput.trigger("change");
	}

	if (updateUsageAssumptions) {
		let $partnerStatusDropdown = $body.find("select.partnerStatusDropdown");
		$partnerStatusDropdown.val(appData.vuexStore.getters.partnerStatus).trigger("change");
		let $numberOfChildrenDropdown = $body.find("select.numberOfChildrenDropdown");
		$numberOfChildrenDropdown.val(appData.vuexStore.getters.numberOfChildren.toString()).trigger("change");

		let usageAssumptions = appData.vuexStore.getters.usageAssumptions;
		["primary", "spouse"].forEach(function each(personId) {
			if (usageAssumptions.hasOwnProperty(personId)) {
				let $usageCategorySelect1 = $body.find("select.usageCategorySelect." + personId + "-s1");
				let $usageCategorySelect2 = $body.find("select.usageCategorySelect." + personId + "-s2");
				$usageCategorySelect1.val(usageAssumptions[personId]["medical"]).trigger("change");
				$usageCategorySelect2.val(usageAssumptions[personId]["drugs"]).trigger("change");
			}
		});
		if (usageAssumptions.hasOwnProperty("childrenArray")) {
			usageAssumptions.childrenArray.forEach(function each(object, index) {
				let personId = "child" + (index + 1);
				let $usageCategorySelect1 = $body.find("select.usageCategorySelect." + personId + "-s1");
				let $usageCategorySelect2 = $body.find("select.usageCategorySelect." + personId + "-s2");
				$usageCategorySelect1.val(usageAssumptions.childrenArray[index]["medical"]).trigger("change");
				$usageCategorySelect2.val(usageAssumptions.childrenArray[index]["drugs"]).trigger("change");
			});
		}
	}
	};

appWizard.renderPlanProvisions = () => {
	let $dynamicPlanProvisions = $wizard.find(".dynamicPlanProvisions");
	$dynamicPlanProvisions.each(function each(index, element) {
		appStage.renderDynamicPlanProvision(element, "table.selectedMedicalPlanProvisionsTable");
	});
};

// endregion Personas model specific logic

_trace("module() returning");
return appWizard;
});

// Satisfy WebStorm by declaring Vue and Vuex referenced properties and methods.
// LATER: A better place for these.

/**
 * @name Vue
 * @type {{
 *   component: Function
 *   use: Function
 * }}
 */

/**
 * @name Vuex
 * @type {{
 *   mapGetters: Function
 *   mapState: Function
 *   Store: Function
 * }}
 */

/**
 * @name paths.Vuex.Store
 * @type {{
 *   dispatch: Function
 * }}
 */
