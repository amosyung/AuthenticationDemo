//-------------------------------------------------------------------------------------------------
// appStage.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains the bulk of the logic to set up and run the tool's user interface.
//

define(["jquery", "bootstrap", "trace", "utility", "appDispatch", "appData", "appEngine", "appCharts", "appTaxChart", "appText",
		"fsaeConfig", "appCore/components/HelpModal"],
/**
 * @param {object} $
 * @param {object} bootstrap
 * @param {object} trace
 * @param {object} utility
 * @param {AppDispatch} appDispatch
 * @param {AppData} appData
 * @param {AppEngine} appEngine
 * @param {AppCharts} appCharts
 * @param {AppTaxChart} appTaxChart
 * @param {AppText} appText
 * @param {FsaeConfig} fsaeConfig
 * @returns {object}
 */
/* eslint-disable no-unused-vars */
function module($, bootstrap, trace, utility, appDispatch, appData, appEngine, appCharts, appTaxChart, appText, fsaeConfig, helpModal) {
/* eslint-enable no-unused-vars */
"use strict";

// region Module data

/**
 * @name AppStage
 * @type {{
 *   windowWidth: ?number
 *   windowHeight: ?number
 *   dynamicItemIds: string[]
 *   dynamicItems: object.<string, object>
 *   sliderIds: string[]
 *   sliders: object.<string, object>
 *   triggeringIds: string[]
 *   $dynamicResultsSections: JQuery
 *   initializeAsync: Function
 *   addPrintEventHandlers: Function
 *   setUpVueAppHelpModals: Function
 *   displayUserAgreementModal: Function
 *   addModalEventHandlers: Function
 *   addTooltipEventHandlers: Function
 *   addCarouselEventHandlers: Function
 *   updateDynamicCostsAssumptionsContent: Function
 *   updateDynamicUsageCategoryContent: Function
 *   initializePlanProvisionsFeature: Function
 *   updateDynamicPlanProvisionsContent: Function
 *   showPlanProvisionsWithHighlightedPlan: Function
 *   renderDynamicFormItems: Function
 *   renderSingleFormItem: Function
 *   getNextDynamicControlId: Function
 *   getVisibleDynamicItemOptionValues: Function
 *   setDynamicItemControlValues: Function
 *   renderDynamicDropdown: Function
 *   makeDropdownOptions: Function
 *   renderDynamicRadioButtons: Function
 *   makeRadioButtons: Function
 *   maybeUpdateOtherDynamicItems: Function
 *   maybeUpdateOtherDynamicItemsImpl: Function
 *   renderDynamicSlider: Function
 *   postAppInitializationUnhiding: Function
 *   isSizeExtraSmall: Function
 *   isSizeSmall: Function
 *   isSizeMedium: Function
 *   isSizeLarge: Function
 *   isSizeExtraLarge: Function
 *   isSizeMediumOrLower: Function
 *   isSizeSmallOrLower: Function
 *   isSizeSmallOrHigher: Function
 *   updateInterfaceForNewConfig: Function
 *   resizeSetup: Function
 *   handleResizeFinished: Function
 *   maybeReflowCharts: Function
 *   hookUpModelingModeEvents: Function
 *   setUpModelingModes: Function
 *   setCurrentModelingMode: Function
 *   updateModelingContents: Function
 *   lowHighGenDrop: Function
 *   rebuildSimplifiedModelingContents: Function
 *   hookUpSimplifiedModelingEvents: Function
 *   rebuildDetailedModelingContents: Function
 *   updateDetailedModelingServiceDropdownCounts: Function
 *   hookUpDetailedModelingEvents: Function
 *   hookUpChartSectionEvents: Function
 *   maybeSetUpContributionsFeatures: Function
 *   hookUpSavingsSectionEvents: Function
 *   hookUpSavingsSliderEvents: Function
 *   hookUpOverAge55Events: Function
 *   maybeAdjustSavingsSliderBounds: Function
 *   maybeAdjustSavingsSliderMaximums: Function
 *   maybeAdjustSavingsSliderBoundsImpl: Function
 *   maybeRemakeResultsTablesCells: Function
 *   makeResultTableCellData: Function
 *   invalidatePlanResultKeysCache: Function
 *   updateResultsTablesCells: Function
 *   updateResultsTables: Function
 *   maybeSetUpSaveScenarioFeature: Function
 *   maybeSetUpPlanRecommendationFeature: Function
 *   maybeSetUpSimpleFeedbackFeature: Function
 *   maybeSetUpVideoLibraryFeature: Function
 *   maybeSetUpTaxCalculator: Function
 *   hookUpViewSwitchButtonEvents: Function
 *   updateTaxCalcSelectPlans: Function
 *   maybePopulateHsaEligibleExpensesSlider: Function
 *   switchTaxViewToAccountTypeForPlan: Function
 *   taxFilingStatusChanged: Function
 *   taxNumDependentsChanged: Function
 *   getAvailablePlansByRegionSelection: Function
 * }}
 */
let appStage = {};
let _trace = trace.categoryWriteLineMaker("appStage");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appStage"); } }; tick();

let getText, _resizeTimeout = null, $body = $("body"), $simplifiedModelingContents, $detailedModelingContents, $chronicConditionModelingContents, $showWorstCaseCosts, $showTotalCosts,
	$over55, $over55Row, $nonTaxCalcSections, $taxIntroSection, $taxCalcSection, $taxFilingStatusSelect, $taxNumDependentsSelect,
	_nextDynamicControlSeqId = 1;

let strFmt = utility.stringFormat, isNullOrUndefined = utility.isNullOrUndefined, formatDollar = utility.formatDollar,
	getDescription = utility.getDescription, constrain = utility.constrain, capitalizeFirstLetter = utility.capitalizeFirstLetter;

/* eslint-disable no-unused-vars */
let $detectSize_xs, $detectSize_sm, $detectSize_md, $detectSize_lg, $detectSize_xl;
/* eslint-enable no-unused-vars */

appStage.$dynamicResultsSections = null;

appStage.windowWidth = null;
appStage.windowHeight = null;

appStage.dynamicItemIds = [];
appStage.dynamicItems = {};
appStage.sliderIds = [];
appStage.sliders = {};
appStage.triggeringIds = []; // for maybeUpdateOtherControls() to avoid circular logic

// endregion Module data
// region Initialization

appStage.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	getText = utility.getAppStringMaker(appEngine.configuration.appStrings);

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			$detectSize_xs = $body.find(">div.xs.d-block.d-sm-none");
			$detectSize_sm = $body.find(">div.sm.d-none.d-sm-block.d-md-none");
			$detectSize_md = $body.find(">div.md.d-none.d-md-block.d-lg-none");
			$detectSize_lg = $body.find(">div.lg.d-none.d-lg-block.d-xl-none");
			$detectSize_xl = $body.find(">div.lg.d-none.d-xl-block");

			appStage.$dynamicResultsSections = $body.find(appData.features.wizardEnabled ? "#mpceSection, #wizardSection" : "#mpceSection");
			appStage.setUpVueAppHelpModals();
			appStage.renderDynamicFormItems($body); // i.e. configured dropdowns, radio buttons, and tax calculator sliders
			appStage.setUpModelingModes();
			appStage.hookUpChartSectionEvents();
			appStage.maybeSetUpContributionsFeatures();
			appStage.addPrintEventHandlers();
			appStage.maybeSetUpSaveScenarioFeature();
			appStage.maybeSetUpPlanRecommendationFeature();
			appStage.maybeSetUpSimpleFeedbackFeature();
			appStage.maybeSetUpVideoLibraryFeature();
			appStage.maybeSetUpTaxCalculator();
			appStage.initializePlanProvisionsFeature($body);
			appStage.addModalEventHandlers($body);
			appStage.addTooltipEventHandlers($body);
			appStage.addCarouselEventHandlers($body);
			appStage.updateInterfaceForNewConfig(true); // initializing = true
			appStage.resizeSetup();
			appStage.handleResizeFinished(true); // firstCall = true

			resolve();
		}, params.delayMsec || 0);
	});
};

// endregion Initialization
// region Top menu

appStage.addPrintEventHandlers = function addPrintEventHandlers() {
	_trace("addPrintEventHandlers");

	// Items classed printButton get hooked up to windows.print(). Other ids just for backward compatibility.
	$body.find(".printButton, #menu_print, #menu_print1, #menu_print2").off("click").on("click", function click(event) {
		event.preventDefault();
		event.stopPropagation();
		appDispatch.onUserDidPrintResults();
		window.print();
	});
};

// endregion Top menu
// region Modal help dialogs and tooltips

appStage.setUpVueAppHelpModals = function setUpVueAppHelpModals() {
	_trace("setUpVueAppHelpModals");

	let vuaApp = Vue.createApp({});
	vuaApp.use(appData.vuexStore);
	vuaApp.component(helpModal.name, helpModal);
	vuaApp.mount("#vueAppHelpModals");
};

appStage.displayUserAgreementModal = function displayUserAgreementModal() {
	_trace("displayUserAgreementModal");

	appDispatch.onAppWillDisplayUserAgreement();

	$body.find("#modal_UserAgreement_AgreeButton").off("click").on("click", function uaAgreeButtonClicked() {
		appDispatch.onUserAcceptedUserAgreement();
		$body.find("#modal_UserAgreement").modal("hide");
		appData.disclaimerAccepted = true;
	});

	$body.find("#modal_UserAgreement_DisagreeButton").off("click").on("click", function uaDisagreeButtonClicked() {
		appDispatch.onUserRejectedUserAgreement();
		appData.disclaimerAccepted = false;
		$body.find("#pageBodyDisagree").attr("hidden", false);
		$body.find("#pageBody, #topMenu").attr("hidden", true);
		$body.find("#modal_UserAgreement").modal("hide");
	});

	$body.find("#modal_UserAgreement").modal({ backdrop: "static", keyboard: false });
	$body.find("#modal_UserAgreement").modal("show");

	appDispatch.onAppDidDisplayUserAgreement();
};

appStage.addModalEventHandlers = function addModalEventHandlers($parent) {
	_trace("addModalEventHandlers: parent element: {0}", $parent.attr("id"));

	$body.find(".modal").off("shown.bs.modal").on("shown.bs.modal", function shownBsModal(event) {
		let $eventTarget = $(event.target);
		// Set the focus to the first button in the modal's footer.
		$eventTarget.find(".modal-footer button").first().focus();
		// For video content that may appear in a modal, iframe elements should have their src attribute value initially
		// stored only in a data-deferred-src attribute, so we can avoid unnecessary loading of Vimeo supporting assets.
		// The code below ensures any such iframe elements in the current modal have their src attributes initialized.
		$eventTarget.find("iframe[data-deferred-src]").each(/* @this HTMLElement */ function each() {
			if (utility.isNullOrUndefined($(this).attr("src"))) {
				$(this).attr("src", $(this).data("deferred-src"));
			}
		});
		// Perhaps track modal display for analytics purposes.
		appDispatch.onAppDidDisplayHelpModal(event.target.id);
	});

	// Ensure the modal-open class remains on the body element when a modal is still open,
	// to handle the case when a modal is instantiated from another modal.
	$(document).off("hidden.bs.modal").on("hidden.bs.modal", function onHiddenBsModal() {
		if ($(".modal:visible").length) { $body.addClass("modal-open"); }
	});
};

appStage.addTooltipEventHandlers = function addTooltipEventHandlers($parent) {
	_trace("addTooltipEventHandlers: parent element: {0}", $parent.attr("id"));

	$parent.find("[data-bs-toggle='tooltip']").tooltip();
};

appStage.addCarouselEventHandlers = function addCarouselEventHandlers($parent) {
	_trace("addCarouselEventHandlers: parent element: {0}", $parent.attr("id"));

	$parent.find(".carousel").carousel();
};

appStage.updateDynamicCostsAssumptionsContent = function updateDynamicCostsAssumptionsTable(reason) {
	_trace("updateDynamicCostsAssumptionsContent: reason: {0}", reason);

	$body.find(".dynamicCostsAssumptions").each(function each(index, element) {
		let $dest = $(element), regionId = appData.personal.regionId, config = appEngine.configuration, categories = config.categories,
			services = config.services, $catTemplate = $dest.find(".category.template"), $svcTemplate = $dest.find(".service.template");
		$dest.find(".dynamicItem").remove(); // removes the generated content from a previous call
		$dest.find(".region.description").html(config.regions[regionId].description); // fills in region if present
		let $contentDestination = $svcTemplate.parent();
		config.categoriesOrder.forEach(function eachCategoryId(categoryId) {
			let category = categories[categoryId], $catClone = $catTemplate.clone().removeClass("template").addClass("dynamicItem");
			$catClone.addClass(categoryId);
			$catClone.find(".description").html(category.description); // e.g. into <th> elements
			$contentDestination.append($catClone);
			category.orderedContents.forEach(function eachServiceId(serviceId) {
				let service = services[serviceId], excluded = service.hasOwnProperty("descriptionForCosts") && null === service.descriptionForCosts;
				if (!excluded) {
					let $svcClone = $svcTemplate.clone().removeClass("template").addClass("dynamicItem"),
						cost = service.costs && service.costs[regionId] ? service.costs[regionId] : service.defaultCost;
					$svcClone.addClass(serviceId);
					$svcClone.find(".description").html(service.descriptionForCosts || service.description);
					$svcClone.find(".cost.includeCents").text(formatDollar(cost, true)); // e.g. into <td> elements etc.
					$svcClone.find(".cost.doNotIncludeCents").text(formatDollar(cost, false));
					$svcClone.find(".cost").not(".includeCents, .doNotIncludeCents").text(
						formatDollar(cost, (cost % 1) > 0)); // i.e. include cents when significant, not otherwise
					$contentDestination.append($svcClone);
				} // if not excluded from the costs table
			}); // for each service within the category
		}); // for each category in the configuration
	}); // for each content destination
};

appStage.updateDynamicUsageCategoryContent = function updateDynamicUsageCategoryContent(reason) {
	_trace("updateDynamicUsageCategoryContent: reason: {0}", reason);

	let config = appEngine.configuration;

	// Dynamic assumptions content for each usage category
	let services = config.services;
	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId) {
		let usageCategory = config.usageCategories[usageCategoryId];
		// for each element classed dynamicUsageCategoryAssumptions (plus legacy CSS class name) that needs content filled in...
		let selector = strFmt(".dynamicUsageCategoryAssumptions.{0}, .dynamicHealthStatusAssumptions", usageCategoryId);
		$body.find(selector).each(function eachIndexAndElement(index, element) {
			let $dest = $(element), options = usageCategory.options, optionsOrder = usageCategory.optionsOrder;
			$dest.find(".dynamicItem").remove(); // removes the generated content from a previous call
			$dest.find(".usageCategoryOption").addClass("hiddenNotApplicable"); // some may not necessarily be configured
			optionsOrder.forEach(function eachUsageCategoryOption(usageCategoryOption) {
				let option = options[usageCategoryOption], optionContents = option.contents,
					$svcTemplate = $dest.find("." + usageCategoryOption + ".contents .service.template"),
					$svcDestination = $svcTemplate.parent();
				$dest.find(".usageCategoryOption." + usageCategoryOption).removeClass("hiddenNotApplicable");
				$dest.find("." + usageCategoryOption + ".description").html(option.description);
				Object.keys(optionContents).forEach(function eachServiceId(serviceId) {
					let service = services[serviceId], $svcClone = $svcTemplate.clone().removeClass("template").addClass("dynamicItem"),
						count = optionContents[serviceId], description = service.description; // unless overridden
					if (service.descriptionForUsage) { // may also contain a plural part; e.g. "biopsy || biopsies"
						let maybeUsePlural = (count === 0) || (count > 1), components = service.descriptionForUsage.split("||");
						description = (components.length < 2) ? components[0] : (maybeUsePlural ? components[1] : components[0]);
						description = description.replace(/{s}/g, maybeUsePlural ? "s" : "");
					}
					$svcClone.addClass(serviceId);
					$svcClone.find(".service.count").text(serviceId.startsWith("additionalServices") ? formatDollar(count) : count.toString());
					$svcClone.find(".service.description").html(description);
					$svcDestination.append($svcClone);
				}); // for each service within the usage category option
			}); // for each usage category in the configuration
		}); // for each content destination
	}); // for each enabled usage category

	// Other content specific to different sets of usage categories. Elements classed "usageCategory" or "usageCategories"
	// are hidden, and then only those with added CSS classes in the enabled set but not the disabled set are unhidden.
	// Usage category labels are substituted in elements classed "usageCategoryName" and "usageCategoryDescription".

	// First, class as "hiddenNotApplicable" all elements in the set of those classed "usageCategories".
	$body.find(".usageCategory, .usageCategories").addClass("hiddenNotApplicable");
	// Then, remove "hiddenNotApplicable" from those in set classed with an enabled category, but no disabled ones.
	// Enabled categories can also have an equivalent CSS class "usageCategoryN", where N is its index.
	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
		let usageCategory = config.usageCategories[usageCategoryId];

		// Unhiding, by usage category ids.
		let byUsageCategoryIds = "." + usageCategoryId;
		if (config.disabledUsageCategoriesOrder.length > 0) {
			byUsageCategoryIds += ":not(.";
			byUsageCategoryIds += config.disabledUsageCategoriesOrder.join("):not(.");
			byUsageCategoryIds += ")";
		}
		$body.find(".usageCategory" + byUsageCategoryIds).removeClass("hiddenNotApplicable");
		$body.find(".usageCategories" + byUsageCategoryIds).removeClass("hiddenNotApplicable");

		// Unhiding, by enabled usage category index.
		$body.find(".usageCategory.category" + (index + 1)).removeClass("hiddenNotApplicable");
		$body.find(".usageCategories.category" + (index + 1)).removeClass("hiddenNotApplicable");

		// Substituting the usage category's name or description into HTML elements where necessary.
		// Can be done either by usage category id or enabled usage category index.
		let nameSelector = strFmt(".usageCategoryName.{0}, .usageCategoryName.category{1}", usageCategoryId, index + 1);
		$body.find(nameSelector).html(usageCategory.name);
		let descSelector = strFmt(".usageCategoryDescription.{0}, .usageCategoryDescription.category{1}", usageCategoryId, index + 1);
		$body.find(descSelector).html(usageCategory.description);

		// Updating the data-bs-target for any element classed usageCategoryDynamicHelpModalId.
		let setHelpModalIdSelector = strFmt(
			".usageCategoryDynamicHelpModalId.{0}, .usageCategoryDynamicHelpModalId.category{1}", usageCategoryId, index + 1);
		let modalId = strFmt("modal_UsageCategoryHelp_{0}", capitalizeFirstLetter(usageCategoryId));
		$body.find(setHelpModalIdSelector).attr("data-bs-target", "#" + modalId);
	});
};

appStage.initializePlanProvisionsFeature = function initializePlanProvisionsFeature($parent) {
	_trace("initializePlanProvisionsFeature");

	if (!appData.features.planProvisionsFeature) {
		$parent.find(".planProvisionsFeature").addClass("hiddenNotApplicable");
	}
	if (!appData.features.includeDentalProvisions) {
		$parent.find("#planProvisionsTabList, #dentalPlanProvisions, .planProvisionsCategoryHeader").remove();
	}

	let $modalPlanProvisions = $body.find("#modal_PlanProvisions");
	$modalPlanProvisions.off("hidden.bs.modal").on("hidden.bs.modal", function onHiddenBsModal() {
		$modalPlanProvisions.find("table.medicalPlanProvisionsTable th.planSpecific, table.medicalPlanProvisionsTable td.planSpecific").removeClass("selected");
	});
	$modalPlanProvisions.off("shown.bs.modal").on("shown.bs.modal", function onShownBsModal() {
		$modalPlanProvisions.find(".modal-body").scrollTop(0);
	});
};

appStage.renderDynamicPlanProvision = (element, provisionTableSelector) => {
		let config = appEngine.configuration;
		let txt_NA = config.planProvisions.notApplicableText;
	let $dest = $(element), plansOrder = config.plansOrder, $planProvisionsTable = $dest.find(provisionTableSelector);
		$planProvisionsTable.empty();

		let renderHeader = function renderHeader(sectionId, sectionLabel) {
			let html = strFmt("<tr class='header {0}'><th>{1}</th>", sectionId, sectionLabel);
			plansOrder.forEach(function eachPlanId(planId) {
				html += strFmt("<th class='planSpecific {0}'>{1}</th>", planId, getDescription(config.plans[planId], "descriptionPlanProvisions"));
			});
			html += "</tr>";
			$planProvisionsTable.append(html);
		};

		let renderDeductibles = function renderDeductibles(sectionId) {
			let html = strFmt("<tr class='{0}'><td class='label'>{1}</td>", sectionId, config.planProvisions.sectionLabels.deductibles);
			plansOrder.forEach(function eachPlanId(planId) {
				// Use the plan's deductiblesDescription property, if defined. Else, attempt to automatically generate a description
				// for the deductibles. Failing that, show alert indicating that deductiblesDescription must instead be set.
				let plan = config.plans[planId], description = plan.deductiblesDescription;
				if (isNullOrUndefined(description)) {
					description = appText.planDeductibles(plan);
					if (isNullOrUndefined(description)) {
						let alertMessage = strFmt('plans["{0}"] requires a "deductiblesDescription" as the structure of ' +
							"personDeductibles and/or familyDeductibles isn't currently supported for automatic translation", planId);
						// eslint-disable-next-line no-alert
						alert(alertMessage);
						description = "<span class='todo'>[deductiblesDescription required]</span>";
					}
				}
				html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, description);
			});
			html += "</tr>";
			$planProvisionsTable.append(html);
		};

		let renderOopMaximums = function renderOopMaximums(sectionId) {
			let html = strFmt("<tr class='{0}'><td class='label'>{1}</td>", sectionId, config.planProvisions.sectionLabels.oopMaximums);
			plansOrder.forEach(function eachPlanId(planId) {
				// Use the plan's outOfPocketMaximumsDescription property, if defined. Else, attempt to automatically generate a description
				// for the out-of-pocket maximums. Failing that, show alert indicating that outOfPocketMaximumsDescription must instead be set.
				let plan = config.plans[planId], description = plan.outOfPocketMaximumsDescription;
				if (isNullOrUndefined(description)) {
					description = null; // MAYBE FOR FUTURE ACME: Implement this.
					if (isNullOrUndefined(description)) {
						let alertMessage = strFmt('plans["{0}"] requires an "outOfPocketMaximumsDescription" as the structure of ' +
							"personOutOfPocketMaximums and/or familyOutOfPocketMaximums isn't currently supported for automatic translation",
							planId);
						// eslint-disable-next-line no-alert
						alert(alertMessage);
						description = "<span class='todo'>[outOfPocketMaximumsDescription required]</span>";
					}
				}
				html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, description);
			});
			html += "</tr>";
			$planProvisionsTable.append(html);
		};

		let renderSavingsPlanTypes = function renderSavingsPlanTypes(sectionId) {
			// LATER: We may need a way to override the description on a per-plan basis
			let html = strFmt("<tr class='{0}'><td class='label'>{1}</td>", sectionId, config.planProvisions.sectionLabels.savingsPlanTypes);
			let hasAtLeastOnePlanWithSavingsPlanType = false;
			plansOrder.forEach(function eachPlanId(planId) {
				let maybeDualAccountTypeId = config.plans[planId].fsaeAccountTypeId, description, components, accountTypeId1, accountTypeId2;
				if (isNullOrUndefined(maybeDualAccountTypeId)) {
					description = txt_NA;
				} else {
					hasAtLeastOnePlanWithSavingsPlanType = true;
					if (maybeDualAccountTypeId.includes("+")) {
						components = maybeDualAccountTypeId.split("+");
						accountTypeId1 = components[0]; // e.g. "HSA" in "HSA+LPFSA"
						accountTypeId2 = components[1]; // e.g. "LPFSA" in "HSA+LPFSA"
					} else {
						accountTypeId1 = maybeDualAccountTypeId;
					}
					description = fsaeConfig.accountTypes[accountTypeId1].description;
					if (accountTypeId2) {
						description += " with<br>" + fsaeConfig.accountTypes[accountTypeId2].description;
					}
				}
				html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, description);
			});
			if (hasAtLeastOnePlanWithSavingsPlanType) {
				$planProvisionsTable.append(html);
			}
		};

		let renderSavingsPlanFunding = function renderSavingsPlanFunding(sectionId) {
			let html = strFmt("<tr class='{0}'><td class='label'>{1}</td>", sectionId, config.planProvisions.sectionLabels.savingsPlanFunding);
			let hasAtLeastOnePlanWithFunding = false;
			plansOrder.forEach(function eachPlanId(planId) {
				// Use the plan's fundAmountsDescription property, if defined. Else, attempt to automatically generate a description
				// for the fund amounts. Failing that, show alert indicating that fundAmountsDescription must instead be set.
				let plan = config.plans[planId], description = plan.fundAmountsDescription;
				if (!isNullOrUndefined(description)) {
					hasAtLeastOnePlanWithFunding = true;
				} else {
					if ("fundAmountMap" in plan || "restrictedFundAmountMap" in plan) {
						hasAtLeastOnePlanWithFunding = true;
						description = null; // MAYBE FOR FUTURE ACME: Implement this.
					} else {
						description = txt_NA;
					}
					if (isNullOrUndefined(description)) {
						let alertMessage = strFmt('plans["{0}"] requires a "fundAmountsDescription" as the structure of ' +
							"fundAmountMap and/or restrictedFundAmountMap isn't currently supported for automatic translation", planId);
						// eslint-disable-next-line no-alert
						alert(alertMessage);
						description = "<span class='todo'>[fundAmountsDescription required]</span>";
					}
				}
				html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, description);
			});
			if (hasAtLeastOnePlanWithFunding) {
				$planProvisionsTable.append(html);
			}
		};

		let renderSavingsPlanMatch = function renderSavingsPlanMatch(sectionId) {
			let html = strFmt("<tr class='{0}'><td class='label'>{1}</td>", sectionId, config.planProvisions.sectionLabels.savingsPlanMatch);
			let hasAtLeastOnePlanWithMatch = false;
			plansOrder.forEach(function eachPlanId(planId) {
				// Use the plan's fundMatchDescription property, if defined. Else, attempt to automatically generate a description
				// for the fund match. Failing that, show alert indicating that fundMatchDescription must instead be set.
				let plan = config.plans[planId], description = plan.fundMatchDescription;
				if (!isNullOrUndefined(description)) {
					hasAtLeastOnePlanWithMatch = true;
				} else {
					let fundAllowsContributions = plan.fundAllowsContributions || false;
					let fundContributionsHaveMatch = plan.fundContributionsHaveMatch || false;
					if (fundAllowsContributions && fundContributionsHaveMatch) {
						hasAtLeastOnePlanWithMatch = true;
						description = null; // MAYBE FOR FUTURE ACME: Implement this.
					} else {
						description = txt_NA;
					}
					if (isNullOrUndefined(description)) {
						let alertMessage = strFmt('plans["{0}"] requires a "fundMatchDescription" because fundAllowsContributions and ' +
							"fundContributionsHaveMatch are true", planId);
						// eslint-disable-next-line no-alert
						alert(alertMessage);
						description = "<span class='todo'>[fundAmountsDescription required]</span>";
					}
				}
				html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, description);
			});
			if (hasAtLeastOnePlanWithMatch) {
				$planProvisionsTable.append(html);
			}
		};

		let renderAdjustments = function renderAdjustments(sectionId) {
			let adjustments = config.adjustments;
			Object.keys(adjustments).forEach(function eachAdjustmentId(adjustmentId) {
				let adjustment = adjustments[adjustmentId];
				let html = strFmt("<tr class='{0} {1}'><td class='label'>{2}</td>", sectionId, adjustmentId, adjustment.label);
				plansOrder.forEach(function eachPlanId(planId) {
					let adjustmentDescriptionHtml = ("descriptionsByPlan" in adjustment) && (planId in adjustment.descriptionsByPlan) ?
						adjustment.descriptionsByPlan[planId] : (adjustment.description || txt_NA);
					html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, adjustmentDescriptionHtml);
				});
				$planProvisionsTable.append(html);
			});
		};

		let renderSeparator = function renderSeparator(sectionId) {
			let html = strFmt("<tr class='{0}'><td></td><td colspan='{1}'>&nbsp;</td></tr>", sectionId, plansOrder.length);
			$planProvisionsTable.append(html);
		};

		let renderServicesCoverage = function renderServicesCoverage(sectionId) {
			let services = config.services, footnotesHtml = "";
			Object.keys(services).forEach(function eachServiceId(serviceId) {
				let service = services[serviceId], serviceDescription = getDescription(service, "descriptionPlanProvisions");
				let hasFootnote = service.hasOwnProperty("footnoteIndicator") && service.hasOwnProperty("footnoteText");
				if (hasFootnote) {
					serviceDescription += service.footnoteIndicator;
					footnotesHtml += strFmt("<span class='{0}'>{1} {2}</span><br>", serviceId, service.footnoteIndicator, service.footnoteText);
				}
				let html = strFmt("<tr class='{0} {1}'><td class='label'>{2}</td>", sectionId, serviceId, serviceDescription);

				plansOrder.forEach(function eachPlanId(planId) {
					let planCoverage = service.coverage[planId], planCoverageHtml, isCoverageArray = false;
					if (Array.isArray(planCoverage) && planCoverage.length > 1) {
						// If the plan coverage object is an array, expect the first element to contain a description.
						isCoverageArray = true;
						planCoverageHtml = planCoverage[0].description || null;
					} else if ("description" in planCoverage) {
						// Use a description if one is provided...
						planCoverageHtml = planCoverage.description;
					} else {
						// ... otherwise, try automatic translation. May still yield null if certain rare properties used.
						planCoverageHtml = appText.planServiceCoverage(planCoverage);
					}

					if (planCoverageHtml === null) {
						let alertMessage = strFmt('services["{0}"].coverage["{1}"]{2} requires a "description" property as {3} ' +
							"are not supported by automatic translation to assumption text", serviceId, planId, (isCoverageArray ? "[0]" : ""),
							(isCoverageArray) ? "coverage arrays" : "certain properties");
						// eslint-disable-next-line no-alert
						alert(alertMessage);
						planCoverageHtml = "<span class='todo''>[service coverage description required]</span>";
					}
					html += strFmt("<td class='planSpecific {0}'>{1}</td>", planId, planCoverageHtml);
				});
				html += "</tr>";
				$planProvisionsTable.append(html);
			});
			if (footnotesHtml.length > 0) {
				$planProvisionsTable.append(strFmt("<tfoot><tr class='serviceSpecificFootnotes'><td colspan='{0}'>{1}</td></tr></tfoot>",
					plansOrder.length + 1, footnotesHtml));
			}
		};

		config.planProvisions.sectionsOrder.forEach(function eachSection(key) {
			switch (key) {
				case "mainSectionHeader": renderHeader(key, config.planProvisions.sectionLabels.mainSection); break;
				case "deductibles": renderDeductibles(key); break;
				case "oopMaximums": renderOopMaximums(key); break;
				case "savingsPlanTypes": renderSavingsPlanTypes(key); break;
				case "savingsPlanFunding": renderSavingsPlanFunding(key); break;
				case "savingsPlanMatch": renderSavingsPlanMatch(key); break;
				case "adjustments": renderAdjustments(key); break;
				case "separator": renderSeparator(key); break;
				case "servicesSectionHeader": renderHeader(key, config.planProvisions.sectionLabels.servicesSection); break;
				case "services": case "servicesSection": renderServicesCoverage("services"); break;
				default:
					// eslint-disable-next-line no-alert
					alert("Unknown section type " + key + " in mainConfig.planProvisions.sectionsOrder");
					break;
			}
		});

	};

appStage.updateDynamicPlanProvisionsContent = function updateDynamicPlanProvisionsContent(reason) {
	_trace("updateDynamicPlanProvisionsContent: reason: {0}", reason);

	// Attach click event to plan provisions tables so that clicking any cell for a plan highlights that plan's column.
	let $medicalPlanProvisionsTables = $body.find("table.medicalPlanProvisionsTable");
	$medicalPlanProvisionsTables.off("click").on("click", function click(event) {
		let $target = $(event.target);
		$medicalPlanProvisionsTables.find("th.planSpecific, td.planSpecific").removeClass("selected");
		let selectedCellClasses = $target.closest("th.planSpecific, td.planSpecific").attr("class");
		if (selectedCellClasses && selectedCellClasses.length > 0) {
			selectedCellClasses = selectedCellClasses.replace(/planSpecific /, "");
			let selectedPlanId = selectedCellClasses;
			$medicalPlanProvisionsTables.find(strFmt("th.planSpecific.{0}, td.planSpecific.{0}", selectedPlanId)).addClass("selected");
		}
	});

	// Reset and rebuild the contents for each plan provisions table.
	let $dynamicPlanProvisions = $body.find(".dynamicPlanProvisions");
	$dynamicPlanProvisions.each(function each(index, element) {
		appStage.renderDynamicPlanProvision(element, "table.medicalPlanProvisionsTable");
	});
};

appStage.showPlanProvisionsWithHighlightedPlan = function showPlanProvisionsWithHighlightedPlan(planId) {
	let $modalPlanProvisions = $body.find("#modal_PlanProvisions"), $medicalPlanProvisionsTables = $body.find("table.medicalPlanProvisionsTable");
	$medicalPlanProvisionsTables.find("th.planSpecific, td.planSpecific").removeClass("selected");
	$medicalPlanProvisionsTables.find(strFmt("th.planSpecific.{0}, td.planSpecific.{0}", planId)).addClass("selected");
	$modalPlanProvisions.modal("show");
};

// endregion Modal help dialogs and tooltips
// region Dynamic form item rendering and handling

appStage.renderDynamicFormItems = function renderDynamicFormItems($parent) {
	// Renders all items with a "data-action" attribute.
	let parentElementId = $parent.attr("id");
	_trace("renderDynamicFormItems: parent element #{0}", parentElementId);

	// run through the DOM looking for specific dynamic hookups and replace them with real HTML code
	$parent.find("div[data-action], span[data-action]").each(/* @this HTMLElement */ function each() {
		appStage.renderSingleFormItem($(this).data("action"), this);
	});
};

appStage.renderSingleFormItem = function renderSingleFormItem(action, jqElement) {
	let actionArray, configObjId, itemId, configObj, item, itemType, config = appEngine.configuration, errMsg;

	// Parse action string and read item from config.
	actionArray = action.split("|"); // e.g. personalFormItems|partnerStatusDropdown
	if (actionArray.length !== 2) {
		$(jqElement).text(errMsg = strFmt("{{ Failed; {0} must have exactly two bar-separated components. }}", action));
		_trace("{0}", errMsg);
		return;
	}
	configObjId = actionArray[0];
	itemId = actionArray[1];
	configObj = config[configObjId];
	if (isNullOrUndefined(configObj)) {
		$(jqElement).text(errMsg = strFmt("{{ Failed; missing config object for {0}. }}", configObjId));
		_trace("{0}", errMsg);
		return;
	}
	if (itemId.endsWith("Dropdown")) {
		itemType = "Dropdown";
	} else if (itemId.endsWith("RadioButtons")) {
		itemType = "RadioButtons";
	} else if (itemId.endsWith("Slider")) {
		itemType = "Slider";
	} else {
		$(jqElement).text(errMsg = strFmt("{{ Failed; suffix for {0} must be one of Dropdown, RadioButtons, or Slider. }}", itemId));
		_trace("{0}", errMsg);
		return;
	}
	item = configObj[itemId];
	if (isNullOrUndefined(item)) {
		$(jqElement).text(errMsg = strFmt("{{ Failed; missing config item for {0}.{1} }}", configObjId, itemId));
		_trace("{0}", errMsg);
		return;
	}
	// Attach additional properties to the item, including a displayWhen() function if one isn't defined already.
	// The default displayWhen() implementation just returns the value of the item's "display" property.
	item.itemId = itemId;
	item.itemType = itemType;
	item.configObjId = configObjId;
	if (typeof item.displayWhen !== "function") { item.displayWhen = function displayWhenDefault() { return item.display; }; }
	item.$elements = isNullOrUndefined(item.$elements) ? $(jqElement) : item.$elements.add(jqElement);
	if (item.$elements) {
		item.$elements = item.$elements.add(jqElement);
	} else {
		item.$elements = $(jqElement);
	}
	// Next, process according to item type (dropdown, radio buttons, or slider) and remember for later processing.
	if (itemType === "Dropdown") {
		item.itemDivClass = "dropdownDiv";
		appStage.renderDynamicDropdown(configObjId, item);
		appStage.dynamicItemIds.push(item.itemId);
		appStage.dynamicItems[item.itemId] = item;
	} else if (itemType === "RadioButtons") {
		item.itemDivClass = "radioButtonsDiv";
		appStage.renderDynamicRadioButtons(configObjId, item);
		appStage.dynamicItemIds.push(item.itemId);
		appStage.dynamicItems[item.itemId] = item;
	} else if (itemType === "Slider") {
		item.itemDivClass = "sliderDiv";
		appStage.renderDynamicSlider(configObjId, item);
		appStage.sliderIds.push(item.itemId);
		appStage.sliders[item.itemId] = item;
	}
};

appStage.getNextDynamicControlId = function getNextDynamicControlId() {
	let result = "dynamicId_" + _nextDynamicControlSeqId;
	_nextDynamicControlSeqId += 1;
	return result;
};

appStage.getVisibleDynamicItemOptionValues = function getVisibleDynamicItemOptionValues(item) {
	let config = appEngine.configuration, ordered = item.ordered || config[item.subconfigOrderedPropName],
		fullObj = item.full || config[item.subconfigFullPropName];
	let result = ordered.filter(function filter(value) {
		let obj = fullObj[value];
		if (!isNullOrUndefined(obj)) { return (typeof obj.displayWhen !== "function" ? true : obj.displayWhen(appData, config)); }
		throw new Error(strFmt("mainConfig.{0}.{1}.ordered contains unknown option '{2}'", item.configObjId, item.itemId, value));
	});
	return result;
};

appStage.setDynamicItemControlValues = function setDynamicItemControlValues(item, newValue, shouldTriggerChange, $elementsToExclude) {
	$elementsToExclude = isNullOrUndefined($elementsToExclude) ? $() : $elementsToExclude;
	let $controls = $(), $textInputs = $(), $printLabels = $body.find("." + item.itemId + ".print .value");
	let config = appEngine.configuration, itemConfig = config[item.configObjId][item.itemId], fullObj;
	switch (item.itemType) {
		case "Dropdown":
			$controls = $body.find("select." + item.itemId).not($elementsToExclude);
			if ($controls.length > 0) { $controls.val(newValue); $controls.attr("data-option", newValue); }
			fullObj = itemConfig.full || config[itemConfig.subconfigFullPropName];
			$printLabels.html(getDescription(fullObj[newValue]));
			break;
		case "RadioButtons":
			$controls = $body.find("input." + item.itemId + "Input[value=" + newValue + "]").not($elementsToExclude);
			if ($controls.length > 0) { $controls.prop("checked", true); }
			fullObj = itemConfig.full || config[itemConfig.subconfigFullPropName];
			$printLabels.html(getDescription(fullObj[newValue]));
			break;
		case "Slider":
			$controls = $body.find("." + item.itemId + ".slider").not($elementsToExclude);
			if ($controls.length > 0) { $controls.slider("value", newValue); }
			$textInputs = $body.find("." + item.itemId + ".sliderTextInput").not($elementsToExclude);
			if ($textInputs.length > 0) { $textInputs.val(formatDollar(newValue)); }
			$printLabels.html(formatDollar(newValue));
			break;
		default:
			break;
	}
	if (shouldTriggerChange && $controls.length > 0) { $controls.trigger("change"); }
};

appStage.renderDynamicDropdown = function renderDynamicDropdown(configObjId, item) {
	let itemId = item.itemId, i, controlId, out, optionsResult, plainLabel = item.description || "", selectedDescription = "";
	let initialValue = appData[item.appDataObj][item.variableName];
	for (i = 0; i < item.$elements.length; i += 1) {
		controlId = appStage.getNextDynamicControlId();
		out = "";
		if (plainLabel.length > 0) {
			out += strFmt("<label for='{0}'>{1}</label>", controlId, item.helpModalId ?
				strFmt("<button data-bs-target='#{0}' data-bs-toggle='modal'>{1}</button>", item.helpModalId, plainLabel) :
				plainLabel);
		}
		out += strFmt("<select id='{0}' name='{1}' class='{1} form-control form-select' data-option='{2}'>", controlId, itemId, initialValue);
		optionsResult = appStage.makeDropdownOptions(item, initialValue);
		selectedDescription = optionsResult.selectedDescription;
		out += optionsResult.html;
		item.currentVisibleValues = optionsResult.visibleValues;
		out += "</select>";
		$(item.$elements[i]).html(out);
	}
	$body.off("change", "select." + itemId).on("change", "select." + itemId, /* @this HTMLElement */ function onItemChanged() {
		let $element = $(this), newValue = $element.val(), oldValue = appData[item.appDataObj][item.variableName];
		if (newValue !== oldValue) {
			// Set the value in the corresponding appData object, then execute callback, if specified.
			appData[item.appDataObj][item.variableName] = newValue;
			$element.attr("data-option", newValue);
			// Ensure all potential additional instances of the same dynamic item reflect the same value.
			appStage.setDynamicItemControlValues(item, newValue, false, $element);
			appStage.maybeUpdateOtherDynamicItems(item.itemId);
			appDispatch.customCallbackHelper(item.callback, [itemId, newValue, oldValue]);
		}
	});
	let visible = item.displayWhen(appData, appEngine.configuration);
	_trace("renderDynamicDropdown: {0}.{1}: rendered{2}.", configObjId, item.itemId, visible ? "" : " as HIDDEN");
	$body.find("." + itemId + ":not(.answerSpecific):not(.notInUse)").toggle(visible);
	$body.find("." + itemId + ".print .name").html(plainLabel);
	$body.find("." + itemId + ".print .value").html(selectedDescription);
};

appStage.makeDropdownOptions = function makeDropdownOptions(item, currentValue) {
	let config = appEngine.configuration, result, html = "", visibleValues, selectedDescription = "",
		fullObj = item.full || config[item.subconfigFullPropName];
	visibleValues = appStage.getVisibleDynamicItemOptionValues(item);
	visibleValues.forEach(function each(value) {
		let description = getDescription(fullObj[value]), selected;
		selected = (value === currentValue);
		if (selected) { selectedDescription = description; }
		html += strFmt("<option value='{0}' {1}>{2}</option>", value, selected ? " selected='selected'" : "", description);
	});
	if (!isNullOrUndefined(item.dynamicSource)) {
		const dropdownValues = item.dynamicSource(this);
		dropdownValues.forEach((obj) => {
			const selected = obj.id === currentValue;
			if (selected) { selectedDescription = obj.value; }
			html += strFmt("<option value='{0}' {1}>{2}</option>", obj.id, selected ? " selected='selected'" : "", obj.value);
		});
	}
	result = { html: html, visibleValues: visibleValues, selectedDescription: selectedDescription };
	return result;
};

appStage.renderDynamicRadioButtons = function renderDynamicRadioButtons(configObjId, item) {
	let itemId = item.itemId, i, name, out, optionsResult, plainLabel = item.description || "", selectedDescription = "";
	let initialValue = appData[item.appDataObj][item.variableName];
	for (i = 0; i < item.$elements.length; i += 1) {
		name = itemId + "_" + i;
		out = strFmt("<fieldset name='{0}'>", name);
		if (plainLabel.length > 0) {
			out += strFmt("<legend>{0}</legend>", item.helpModalId ?
				strFmt("<button data-bs-target='#{0}' data-bs-toggle='modal'>{1}</button>", item.helpModalId, plainLabel) :
				plainLabel);
		}
		optionsResult = appStage.makeRadioButtons(item, name, initialValue);
		selectedDescription = optionsResult.selectedDescription;
		out += optionsResult.html;
		item.currentVisibleValues = optionsResult.visibleValues;
		out += "</fieldset>";
		$(item.$elements[i]).html(out);
	}
	$body.off("change", "." + itemId + "Input").on("change", "." + itemId + "Input", /* @this HTMLElement */ function onItemChanged() {
		let $element = $(this), newValue = $element.val(), oldValue = appData[item.appDataObj][item.variableName];
		if (newValue !== oldValue) {
			// Set the value in the corresponding appData object, then execute callback, if specified.
			appData[item.appDataObj][item.variableName] = newValue;
			// Ensure all potential additional instances of the same dynamic item reflect the same value.
			appStage.setDynamicItemControlValues(item, newValue, false, $element);
			appStage.maybeUpdateOtherDynamicItems(item.itemId);
			appDispatch.customCallbackHelper(item.callback, [itemId, newValue, oldValue]);
		}
	});
	let visible = item.displayWhen(appData, appEngine.configuration);
	$body.find("." + itemId + ":not(.answerSpecific):not(.notInUse)").toggle(visible);
	$body.find("." + itemId + ".print .name").html(plainLabel);
	$body.find("." + itemId + ".print .value").html(selectedDescription);
	_trace("renderDynamicRadioButtons: {0}.{1}: rendered{2}.", configObjId, itemId, visible ? "" : " as HIDDEN");
};

appStage.makeRadioButtons = function makeRadioButtons(item, name, currentValue) {
	let config = appEngine.configuration, result, html = "", selectedDescription = "";
	let fullObj = item.full || config[item.subconfigFullPropName], visibleValues = appStage.getVisibleDynamicItemOptionValues(item);
	visibleValues.forEach(function each(value) {
		let description = getDescription(fullObj[value]), selected = (value === currentValue), controlId = appStage.getNextDynamicControlId();
		if (selected) { selectedDescription = description; }
		html += strFmt(
			"<div class='field'><input type='radio' id='{0}' class='{1}Input' name='{2}' value='{3}' {4}><label for='{0}'>{5}</label></div>",
			controlId, item.itemId, name, value, selected ? "checked='checked'" : "", description);
	});
	result = { html: html, visibleValues: visibleValues, selectedDescription: selectedDescription };
	return result;
};

appStage.maybeUpdateOtherDynamicItems = function maybeUpdateOtherDynamicItems(triggeringId) {
	// Important: If the dropdown changes the current subconfig, then return now.
	// Only after the new subconfig is in effect will other dynamic items be updated.
	let item = appStage.dynamicItems[triggeringId];
	if (item.appDataObj === "personal" && item.variableName === "subconfig") {
		_trace("*** maybeUpdateOtherDynamicItems detected subconfig change; holding other dynamic items update until new subconfig in effect.");
		appStage.triggeringIds.push(triggeringId);
		return;
	} // else, it was not the subconfig dropdown; pass the call through to the implementation method.
	appStage.maybeUpdateOtherDynamicItemsImpl(triggeringId, false);
};

appStage.maybeUpdateOtherDynamicItemsImpl = function maybeUpdateOtherDynamicItemsImpl(triggeringId, continuing) {
	let config = appEngine.configuration, triggeringIds = appStage.triggeringIds;

	if (!continuing) { triggeringIds.push(triggeringId); }
	_trace(">>> {0} >>> maybeUpdateOtherDynamicItems: {1}: {2}", triggeringIds.length,
		continuing ? "continuing for" : "triggering now", triggeringIds);
	let triggeringItem = appStage.dynamicItems[triggeringId];

	appStage.dynamicItemIds.filter(function filter(itemId) { return !triggeringIds.includes(itemId); }).forEach(function each(itemId) {

		let item = appStage.dynamicItems[itemId];
		let oldVisible = $body.find("." + item.itemDivClass + "." + itemId).css("display") !== "none",
			visible = item.displayWhen(appData, config), oldValue, currentValue, currentVisibleValues, newVisibleValues,
			visibleValuesChanged, fallbackValue, triggerChange, optionsResult, fullObj = item.full || config[item.subconfigFullPropName];
		if (oldVisible !== visible) { _trace("{0} will be {1}", item.itemId, visible ? "made visible" : "hidden"); }
		$body.find("." + itemId + ":not(.answerSpecific):not(.notInUse)").toggle(visible);
		newVisibleValues = appStage.getVisibleDynamicItemOptionValues(item);
		currentVisibleValues = item.currentVisibleValues;
		oldValue = currentValue = appData[item.appDataObj][item.variableName];
		// In case the current dynamic item happened to be a dynamic item mapping to the same appData object
		// and variable name as the triggering item, assign the new value to the current dynamic item.
		if (triggeringItem && (item.appDataObj === triggeringItem.appDataObj) && (item.variableName === triggeringItem.variableName)) {
			appStage.setDynamicItemControlValues(item, currentValue, false);
		}
		// If the set of visible options has changed, regenerate it, potentially adjusting the
		// current value if it is no longer in the visible set.
		visibleValuesChanged = newVisibleValues.join(",") !== currentVisibleValues.join(",");
		if (visibleValuesChanged) {
			if (!newVisibleValues.includes(currentValue)) {
				// The current value is not in the list of new visible values. Determine the fallback if available,
				// else first visible value in the new options.
				fallbackValue = ((currentValue in fullObj) && ("fallbackValue" in fullObj[currentValue])) ?
					fullObj[currentValue].fallbackValue : newVisibleValues[0];
				currentValue = fallbackValue;
				triggerChange = true;
			}
			if (item.itemType === "Dropdown") {
				item.$elements.each(/* @this HTMLElement */ function jqEach() {
					let $element = $(this), $select = $element.find("select");
					optionsResult = appStage.makeDropdownOptions(item, currentValue);
					$select.empty().append(optionsResult.html);
					$select.attr("data-option", currentValue);
				});
			} else if (item.itemType === "RadioButtons") {
				item.$elements.each(/* @this HTMLElement */ function jqEach() {
					let $element = $(this), $fieldset = $element.find("fieldset"), name = $fieldset.attr("name");
					optionsResult = appStage.makeRadioButtons(item, name, currentValue);
					$fieldset.empty().append(optionsResult.html);
				});
			}
			item.currentVisibleValues = newVisibleValues;
			appStage.setDynamicItemControlValues(item, currentValue, triggerChange);
		}
		// Dispatch event only if any of visibility, selected value, or set of visible values changed.
		if (oldVisible !== visible || oldValue !== currentValue || visibleValuesChanged) {
			appDispatch.onAppDidChangeDynamicItem(item.itemId, visible, currentValue, oldValue, newVisibleValues);
		}
	});
	_trace("<<< {0} <<< maybeUpdateOtherDynamicItems: returning after triggeringId {1}", triggeringIds.length, triggeringIds);
	triggeringIds.pop();
};

let _onKeyDownFilterNumericTextInput = function onKeyDownFilterNumericTextInput(event) {
	let e = event;
	if ([13, 8, 46, 9, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) { return; } // Permit backspace, delete, tab, end/home/arrow keys.
	if ([65, 67, 86, 88].includes(e.keyCode) && (e.ctrlKey || e.metaKey)) { return; } // Permit CTRL-A/C/V/X.
	if (e.keyCode >= 48 && e.keyCode <= 57 && !e.shiftKey && !e.ctrlKey && !e.metaKey) { return; } // Permit regular number keys 0 through 9.
	if (e.keyCode >= 96 && e.keyCode <= 105 && !e.shiftKey && !e.ctrlKey && !e.metaKey) { return; } // Permit number pad number keys 0 through 9.
	e.preventDefault();
};

let _selectAllTextOnFocus = function selectAllTextOnFocus(event) {
	// Instead of directly calling select(), it is performed asynchronously to work around issues with Microsoft
	// Edge and Safari on Mac. See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8229660/
	setTimeout(event.target.select.bind(event.target), 0);
};

appStage.renderDynamicSlider = function renderDynamicSlider(configObjId, item) {
	if (configObjId === "taxCalculatorFormItems" && !appData.features.taxCalculatorEnabled) { return; }
	let config = appEngine.configuration, itemId = item.itemId, visible = item.displayWhen(appData, config), out = "", escapedTooltipText;

	if (visible) {
		/** @namespace item.dynamicText */
		if (typeof item.dynamicText === "object") {
			// NOTE: If there is a dynamicText section, it takes precedence and labelText/tooltipText are ignored.
			$.each(item.dynamicText, function each(propName, value) {
				let propNameCss = propName.replace("+", "_"), labelText = value.labelText || propName + " missing label",
					tooltipText = value.tooltipText || "";
				if (tooltipText !== "") {
					escapedTooltipText = tooltipText.replace(/'/g, "&apos;");
					out += strFmt("<div class='{0}Text sliderTextWithTooltip planSpecific {1}' data-bs-toggle='tooltip' tabindex='0' " +
						"data-placement='top' title='{2}'>{3}</div>", itemId, propNameCss, escapedTooltipText, labelText);
				} else {
					out += strFmt("<div class='{0}Text sliderTextNoTooltip planSpecific {1}'>{2}</div>", itemId, propNameCss, labelText);
				}
				$body.find("." + itemId + ".print." + propNameCss + " .name").html(labelText);
			});
		} else if (item.labelText !== "") {
			// There was no dynamicText section, but there was a top-level labelText property.
			if (item.tooltipText && item.tooltipText !== "") {
				escapedTooltipText = item.tooltipText.replace(/'/g, "&apos;");
				out += strFmt(
					"<div class='{0}Text sliderTextWithTooltip' data-bs-toggle='tooltip' tabindex='0' data-placement='top' title='{1}'>{2}</div><br>",
					itemId, escapedTooltipText, item.labelText);
			} else {
				out += strFmt("<div class='{0}Text sliderTextNoTooltip'>{1}</div><br>", itemId, item.labelText);
			}
			$body.find("." + itemId + ".print .name").html(item.labelText);
		} // else no label to show
		out += strFmt("<div class='{0} slider'></div>", itemId);
		let textInputTitleAttr = (("textInputTitle" in item) ? item.textInputTitle : "").replace(/'/g, "&apos;");
		out += strFmt("<input class='{0} sliderTextInput' type='text' maxlength='7' title='{1}'><br>", itemId, textInputTitleAttr);
		item.$elements.html(out);
		let $slider = $body.find("." + itemId + ".slider"), $textInput = $body.find("." + itemId + ".sliderTextInput");
		let sliderSlideChangeFunc = function sliderSlideChange(event, ui, eventType) {
			if (event.originalEvent) {
				if (eventType === "change" || (appData.features.sliderLiveUpdating && eventType === "slide")) {
					let $eventTarget = $(event.target), newValue = ui.value, oldValue = appData[item.appDataObj][item.variableName];
					appData[item.appDataObj][item.variableName] = newValue;
					appStage.setDynamicItemControlValues(item, newValue, false, $eventTarget);
					appDispatch.customCallbackHelper(item.callback, [itemId, newValue, oldValue]);
				}
			}
		};
		$slider.slider({
			value: appData[item.appDataObj][item.variableName],
			range: "min",
			min: item.sliderMin,
			max: item.sliderMax,
			step: item.sliderStep,
			slide: function slide(event, ui) { sliderSlideChangeFunc(event, ui, "slide"); },
			change: function change(event, ui) { sliderSlideChangeFunc(event, ui, "change"); }
		});
		let formatted = formatDollar($slider.slider("value"));
		$body.find("." + itemId + ".print .value").html(formatted);
		$textInput.val(formatted);
		$textInput.off("focus").on("focus", function focus(event) { // Remove formatting when acquiring focus, and select
			let value = appData[item.appDataObj][item.variableName], newText = value === 0 ? "" : value.toString();
			$textInput.val(newText);
			newText.length > 0 && _selectAllTextOnFocus(event);
		});
		$textInput.off("blur").on("blur", function blur() { // Restore dollar formatting when losing focus
			$textInput.val(formatDollar(appData[item.appDataObj][item.variableName]));
		});
		let _textInputChangeFunc = function textInputChangeFunc(event, ui, eventType) {
			let $eventTarget = $(event.target), inputString = $eventTarget.val().trim();
			let inputValue = inputString.length === 0 ? 0 : Number.parseInt(inputString, 10);
			let currentSliderMin = $slider.slider("option", "min"), currentSliderMax = $slider.slider("option", "max");
			let newValue = constrain(inputValue, currentSliderMin, currentSliderMax);
			let oldValue = appData[item.appDataObj][item.variableName];
			appData[item.appDataObj][item.variableName] = newValue;
			appStage.setDynamicItemControlValues(item, newValue, false, $eventTarget);
			appDispatch.customCallbackHelper(item.callback, [itemId, newValue, oldValue]);
			if (eventType === "keyup" && event.keyCode === 13) { $eventTarget.trigger("blur"); } // i.e. on enter key
		};
		$textInput.off("keydown").on("keydown", _onKeyDownFilterNumericTextInput);
		$textInput.off("keyup").on("keyup", function keyup(event, ui) { _textInputChangeFunc(event, ui, "keyup"); });
		$textInput.off("change").on("change", function change(event, ui) { _textInputChangeFunc(event, ui, "change"); });
		// Fill the print label, and text input with the initial value.
		if (item.disabled) {
			$slider.slider({ disabled: true });
			$textInput.prop("disabled", true).addClass("disabled");
		}
	} else {
		// else DON'T render the slider, and hide any item classed with the precise itemId
		$body.find("." + itemId).addClass("notInUse");
	}
	_trace("renderDynamicSlider: {0}.{1}: {2}.", configObjId, item.itemId, visible ? "rendered" : "NOT rendered");
};

// endregion Dynamic form item rendering and event handling
// region Updating UI after changes

appStage.postAppInitializationUnhiding = function postAppInitializationUnhiding() {
	$body.addClass("initialized");
};

appStage.isSizeExtraSmall = function isSizeExtraSmall() {
	return $detectSize_xs.is(":visible");
};

appStage.isSizeSmall = function isSizeSmall() {
	return $detectSize_sm.is(":visible");
};

appStage.isSizeMedium = function isSizeMedium() {
	return $detectSize_md.is(":visible");
};

appStage.isSizeLarge = function isSizeLarge() {
	return $detectSize_lg.is(":visible");
};

appStage.isSizeExtraLarge = function isSizeExtraLarge() {
	return $detectSize_xl.is(":visible");
};

appStage.isSizeMediumOrLower = function isSizeSmallOrLower() {
	return $detectSize_md.is(":visible") || $detectSize_sm.is(":visible") || $detectSize_xs.is(":visible");
};

appStage.isSizeSmallOrLower = function isSizeSmallOrLower() {
	return $detectSize_sm.is(":visible") || $detectSize_xs.is(":visible");
};

appStage.updateInterfaceForNewConfig = function updateInterfaceForNewConfig(initializing) {
	_trace("updateInterfaceForNewConfig: {0}", initializing ? "initializing" : "due to change");

	if (!initializing) { appDispatch.onAppWillUpdateInterfaceForNewConfig(); }
	_trace("updateInterfaceForNewConfig: Notifying appCharts to hold updates while subconfig changing.");
	appCharts.startSubconfigChange(); // holds all engine calculations & chart updates until we say ended
	appStage.updateModelingContents(true); // forceRebuild = true
	let triggeringIds = appStage.triggeringIds;
	if (!initializing) {
		appStage.maybeUpdateOtherDynamicItemsImpl(triggeringIds.length > 0 ? triggeringIds[triggeringIds.length - 1] : "", true); // continuing = true
	}
	appStage.maybeAdjustSavingsSliderBounds();
	appCharts.initializeMpceCharts("appStage.updateInterfaceForNewConfig");
	if (appData.features.taxCalculatorEnabled) {
		appTaxChart.initializeFsaeChart("appStage.updateInterfaceForNewConfig");
		if (!initializing) { appStage.updateTaxCalcSelectPlans(); }
	}
	appStage.updateDynamicCostsAssumptionsContent("appStage.updateInterfaceForNewConfig");
	appStage.updateDynamicUsageCategoryContent("appStage.updateInterfaceForNewConfig");
	if (appData.features.planProvisionsFeature) { appStage.updateDynamicPlanProvisionsContent("appStage.updateInterfaceForNewConfig"); }
	_trace("updateInterfaceForNewConfig: Notifying appCharts that subconfig change has completed.");
	appCharts.endSubconfigChange();
	appCharts.requestChartUpdate("appStage.updateInterfaceForNewConfig");
	if (!initializing) { appDispatch.onAppDidUpdateInterfaceForNewConfig(); }
	_trace("updateInterfaceForNewConfig returning");
};

appStage.resizeSetup = function resizeSetup() {
	_trace("resizeSetup");

	$(window).off("resize").on("resize", function onWindowResize() {
		if (_resizeTimeout) {
			clearTimeout(_resizeTimeout);
		} else {
			appDispatch.onUserWindowResizeDidBegin(appStage.windowWidth, appStage.windowHeight);
		}
		_resizeTimeout = setTimeout(appStage.handleResizeFinished, 500); // msec
	});
};

appStage.handleResizeFinished = function handleResizeFinished(firstCall) {
	let $window = $(window);
	appStage.windowWidth = $window.innerWidth();
	appStage.windowHeight = $window.innerHeight();
	_trace("handleResizeFinished: {0}{1} x {2}", firstCall ? "first call; " : "", appStage.windowWidth, appStage.windowHeight);

	if (_resizeTimeout) {
		clearTimeout(_resizeTimeout);
		_resizeTimeout = null;
	}

	if (!firstCall) {
		appDispatch.onUserWindowResizeDidFinish(appStage.windowWidth, appStage.windowHeight);
	}

	appStage.maybeReflowCharts();
};

appStage.maybeReflowCharts = function maybeReflowCharts() {
	_trace("maybeReflowCharts");
	appCharts.maybeReflowChart();
	if (appData.features.taxCalculatorEnabled) { appTaxChart.maybeReflowChart(); }
};

// endregion Updating UI after changes
// region Simplified and detailed modeling areas

appStage.hookUpModelingModeEvents = function hookUpModelingModeEvents() {
	_trace("hookUpModelingModeEvents");
	let $simplifiedModelingButton = $body.find(".simplifiedModelingButton");
	let $detailedModelingButton = $body.find(".detailedModelingButton");
	let $chronicConditionModelingButton = $body.find(".chronicConditionModelingButton");
	let $modelingModeSelect = $body.find("select.modelingModeDropdown");
	// Hook up event handlers for the links and the hidden select that supports wizard button sync.
	$simplifiedModelingButton.off("click").on("click", function simplifiedModelingTabClicked() {
		appStage.setCurrentModelingMode("simplified");
	});
	$detailedModelingButton.off("click").on("click", function detailedModelingTabClicked() {
		appStage.setCurrentModelingMode("detailed");
	});
	$chronicConditionModelingButton.off("click").on("click", function chronicConditionModelingTabClicked() {
		appStage.setCurrentModelingMode("chronicConditioned");
	});
	$modelingModeSelect.off("change").on("change", /* @this HTMLElement */ function modelingModeChanged() {
		appStage.setCurrentModelingMode($(this).val());
	});
};

appStage.setUpModelingModes = function setUpModelingModes() {
	_trace("setUpModelingModes");
	if (appData.features.simplifiedModelingEnabled) { $body.addClass("simplifiedModelingEnabled"); }
	if (appData.features.detailedModelingEnabled) { $body.addClass("detailedModelingEnabled"); }
	if (appData.features.chronicConditionModelingEnabled) { $body.addClass("chronicConditionModelingEnabled"); }
	if (appData.features.bothModelingModesEnabled) { $body.addClass("bothModelingModesEnabled"); }
	appStage.setCurrentModelingMode(); // initializes control states based on appData default
	let $simplifiedModelingButton = $body.find(".simplifiedModelingButton");
	let $detailedModelingButton = $body.find(".detailedModelingButton");
	let $chronicConditionModelingButton = $body.find(".chronicConditionModelingButton");
	let $modelingModeSelect = $body.find("select.modelingModeDropdown");
	// Duplicate the content of each modeling tab into the hidden select that supports wizard button sync.
	$modelingModeSelect.find("option[value='simplified']").text($simplifiedModelingButton.html());
	$modelingModeSelect.find("option[value='detailed']").text($detailedModelingButton.html());
	$modelingModeSelect.find("option[value='chronicConditions']").text($chronicConditionModelingButton.html());	
	appStage.hookUpModelingModeEvents();
};

appStage.setCurrentModelingMode = function setCurrentModelingMode(desiredModelingMode) {
	_trace("setCurrentModelingMode: desiredModelingMode: {0}", desiredModelingMode);

	let oldModelingMode = "";

	if (desiredModelingMode) {
		appDispatch.onAppWillSwitchModelingMode(appData.personal.currentModelingMode, desiredModelingMode);
		oldModelingMode = appData.personal.currentModelingMode || "";
		appData.personal.currentModelingMode = desiredModelingMode;
	} // else, no desiredModelingMode arg -> initialize based on appData default
	
	const modeClassesToSet = {};
	switch (oldModelingMode) {
		case "simplified": 
		modeClassesToSet.oldModeClass = 'modelingModeIsSimplified'; 
		modeClassesToSet.classToDeactivate = '.simplifiedModelingPaneTabLi, .simplifiedModelingButton, .simplifiedModelingPane';
			break;
		case "detailed": 
		modeClassesToSet.oldModeClass =  'modelingModeIsDetailed'; 
		modeClassesToSet.classToDeactivate = '.detailedModelingPaneTabLi, .detailedModelingButton, .detailedModelingPane';
			break;
		case "chronicConditioned": 
		modeClassesToSet.oldModeClass = 'modelingModeIsChronicCondition'; 
		modeClassesToSet.classToDeactivate = '.chronicConditionModelingPaneTabLi, .chronicConditionModelingButton, .chronicConditionModelingPane';
			break;
	}
	switch(appData.personal.currentModelingMode) {
		case "simplified": 
		modeClassesToSet.newModeClass = 'modelingModeIsSimplified'; 
		modeClassesToSet.classToActivate = '.simplifiedModelingPaneTabLi, .simplifiedModelingButton, .simplifiedModelingPane';
			break;
		case "detailed": 
		modeClassesToSet.newModeClass =  'modelingModeIsDetailed'; 
		modeClassesToSet.classToActivate = '.detailedModelingPaneTabLi, .detailedModelingButton, .detailedModelingPane';
			break;
		case "chronicConditioned": 
		modeClassesToSet.newModeClass = 'modelingModeIsChronicCondition'; 
		modeClassesToSet.classToActivate = '.chronicConditionModelingPaneTabLi, .chronicConditionModelingButton, .chronicConditionModelingPane';
			break;
	}
	$body.switchClass(modeClassesToSet.classToDeactivate, modeClassesToSet.newModeClass);
	$body.find(modeClassesToSet.classToDeactivate).removeClass("active");
	$body.find(modeClassesToSet.classToActivate).addClass("active");
	$body.find("select.modelingModeDropdown").val(appData.personal.currentModelingMode);

	if (appData.personal.currentModelingMode === "detailed") {
		/*switch (oldModelingMode){
			case "simplified":
				$body.switchClass("modelingModeIsSimplified", "modelingModeIsDetailed");
				break;
			case "chronicConditions":
				$body.switchClass("modelingModeIsChronicCondition", "modelingModeIsDetailed");
				break;
		}*/
		//$body.switchClass("modelingModeIsSimplified", "modelingModeIsDetailed");
		// $body.find(".simplifiedModelingPaneTabLi, .simplifiedModelingButton, .simplifiedModelingPane").removeClass("active");
		// $body.find(".detailedModelingPaneTabLi, .detailedModelingButton, .detailedModelingPane").addClass("active");
		// $body.find("select.modelingModeDropdown").val("detailed");
	} else if (appData.personal.currentModelingMode === "simplified"){
		/*switch (oldModelingMode){
			case "detailed":
				$body.switchClass("modelingModeIsDetailed", "modelingModeIsSimplified");
				break;
			case "chronicConditions":
				$body.switchClass("modelingModeIsChronicCondition", "modelingModeIsSimplified");
				break;
		}*/
		//$body.switchClass("modelingModeIsDetailed", "modelingModeIsSimplified");
		// $body.find(".detailedModelingPaneTabLi, .detailedModelingButton, .detailedModelingPane").removeClass("active");
		// $body.find(".simplifiedModelingPaneTabLi, .simplifiedModelingButton, .simplifiedModelingPane").addClass("active");
		// $body.find("select.modelingModeDropdown").val("simplified");
	} else if (appData.personal.currentModelingMode === "chronicConditioned"){
		/*switch (oldModelingMode){
			case "detailed":
				$body.switchClass("modelingModeIsDetailed", "modelingModeIsChronicCondition");
				break;
			case "simplified":
				$body.switchClass("modelingModeIsSimplified", "modelingModeIsChronicCondition");
				break;
		}*/
		// $body.find(".detailedModelingPaneTabLi, .detailedModelingButton, .detailedModelingPane").removeClass("active");
		// $body.find(".simplifiedModelingPaneTabLi, .simplifiedModelingButton, .simplifiedModelingPane").addClass("active");
		// $body.find("select.modelingModeDropdown").val("chronicConditioned");
	}
	else {
		throw new Error(`Unhandled modeling mode: ${appData.personal.currentModelingMode}`);
	}
	appStage.updateModelingContents();

	if (desiredModelingMode) {
		appDispatch.onAppDidSwitchModelingMode(oldModelingMode, appData.personal.currentModelingMode);
		if (appData.personal.currentModelingMode === "simplified") {
			appDispatch.onAppDidSwitchToSimplifiedModeling();
		} else if (appData.personal.currentModelingMode === "detailed") {
			appDispatch.onAppDidSwitchToDetailedModeling();
		}
	}
};

appStage.updateModelingContents = function updateModelingContents(forceRebuild) {

	let inactives, actives, inactivesSelector = "", activesSelector = "";
	if (forceRebuild) {
		appData.updateModelingInputsForSubconfigChange();
		_trace("updateModelingContents: rebuilding modeling contents because forceRebuild flag set.");
		appStage.rebuildSimplifiedModelingContents();
		appStage.rebuildDetailedModelingContents();
		appStage.rebuildChronicConditionModelingContents();
		appStage.hookUpModelingModeEvents();
	}
	inactives = appData.getDisabledPersonIds();
	if (inactives.length > 0) {
		inactivesSelector = inactives.map(function map(v) { return "." + v; }).reduce(function r(p, c) { return p + ", " + c; });
		$body.find(inactivesSelector).addClass("hiddenNotApplicable");
	}
	actives = appData.getEnabledPersonIds();
	if (actives.length > 0) {
		activesSelector = actives.map(function map(v) { return "." + v; }).reduce(function r(p, c) { return p + ", " + c; });
		$body.find(activesSelector).removeClass("hiddenNotApplicable");
	}
	_trace("updateModelingContents: show [{0}] hide [{1}]", activesSelector, inactivesSelector);

	appCharts.requestChartUpdate("appStage.updateModelingContents");
};

appStage.lowHighGenDrop = function lowHighGenDrop(userId, index, usageCategoryId, selected, detailed, title) {
	_trace("lowHighGenDrop: userId: {0}, index: {1}, usageCategoryId: {2}, selected: {3}, detailed: {4}, title: {5}",
		userId, index, usageCategoryId, selected, detailed || "false", title);

	let config = appEngine.configuration;
	let out, selectedDescription = "&nbsp;", optionsArray, detailedModelingCustomText = getText("txt_DetailedModelingCustom");
	let selectUserSpecificClass = strFmt("{0}-{1}{2}", userId, detailed ? "d" : "s", index);
	out = strFmt("<div class='usageCategoryDropdownOuter usageCategory category{0} {1} noPrint'>", index, usageCategoryId);
	out += "<div class='usageCategoryDropdown'>";
	out += strFmt("<select name='{0}' data-user-id='{1}' data-usage-category-id='{2}' " +
		"class='usageCategorySelect {0} {2} form-control form-select' title='{3}'>",
		selectUserSpecificClass, userId, usageCategoryId, title);
	let usageCategory = config.usageCategories[usageCategoryId];
	if (detailed) {
		out += strFmt("<option data-name='{0}' data-value='' value=''>{1}</option>", selectUserSpecificClass, detailedModelingCustomText);
		optionsArray = usageCategory.detailedModelingOptionsOrder || usageCategory.optionsOrder;
	} else {
		optionsArray = usageCategory.simplifiedModelingOptionsOrder || usageCategory.optionsOrder;
	}
	optionsArray.forEach(function each(optionId) {
		let description = getDescription(usageCategory.options[optionId]);
		out += strFmt("<option data-name='{0}' data-value='{1}' value='{1}' {2}>{3}</option>",
			selectUserSpecificClass, optionId, (selected === optionId) ? "selected='selected'" : "", description);
		if (selected === optionId) { selectedDescription = description; }
	});
	out += "</select></div></div>";
	out += strFmt("<div class='{0} usageCategory category{1} {2} {3} printOnly'>{4}</div>",
		selectUserSpecificClass, index, userId, usageCategoryId, selectedDescription);
	return out;
};

appStage.rebuildSimplifiedModelingContents = function rebuildSimplifiedModelingContents() {
	_trace("rebuildSimplifiedModelingContents");

	$simplifiedModelingContents = $body.find(".simplifiedModelingContents");
	$simplifiedModelingContents.empty();

	let out = "", config = appEngine.configuration;
	out += "<div class='personContainer headings'>";
	out += "  <div class='title'>&nbsp;</div>";
	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
		let modalId = strFmt("modal_UsageCategoryHelp_{0}", capitalizeFirstLetter(usageCategoryId));
		out += strFmt("<div class='usageCategory category{0} {1}'>", index + 1, usageCategoryId);
		out += strFmt("  <button data-bs-target='#{0}' data-bs-toggle='modal'><i class='fa fa-info-circle'></i>{1}</button>",
			modalId, getDescription(config.usageCategories[usageCategoryId]));
		out += "</div>";
	});
	out += "</div>";

	appData.getModelingInputsOrderedIds().forEach(function eachPersonId(personId) {
		let userModelingInputs = appData.getModelingInputsForPerson(personId);
		let maybeHiddenNotApplicable = userModelingInputs.enabled ? "" : " hiddenNotApplicable";
		let personText = getText("txt_PersonType_" + userModelingInputs.type);

		// Visible control
		out += strFmt("<div class='personContainer {0}{1}'>", personId, maybeHiddenNotApplicable);
		out += strFmt("<div class='personTitle'>{0}</div>", personText);

		config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
			let usageCategoryOption = appData.getSimplifiedModelingUsageCategoryOption(personId, usageCategoryId);
			let usageCategory = config.usageCategories[usageCategoryId];
			// Rare, just in case: if usageCategoryOption no longer valid (after subconfig change), switch to first visible.
			let visibleOptions = usageCategory.simplifiedModelingOptionsOrder || usageCategory.optionsOrder;
			if (!visibleOptions.includes(usageCategoryOption)) {
				usageCategoryOption = visibleOptions[0];
				appData.setSimplifiedModelingUsageCategoryOption(personId, usageCategoryId, usageCategoryOption);
			}
			let personTextForTitle = personText + (userModelingInputs.type === "child" ? (" " + userModelingInputs.index) : "");
			let dropdownTitle = (personTextForTitle + ": " + getDescription(config.usageCategories[usageCategoryId])).replace(/'/g, "&apos;");
			out += appStage.lowHighGenDrop(personId, index + 1, usageCategoryId, usageCategoryOption, false, dropdownTitle);
		});
		out += "</div>"; // the one w/class personContainer
	});

	// Also optionally include the definitions for low, moderate, high by grabbing the header and content from
	// the help modal that has been augmented specifically with the CSS class "usageCategoryHelpSource".
	let usageCategoryHelpForPrint = "";
	config.enabledUsageCategoriesOrder.forEach(function eachUsageCategoryId(usageCategoryId) {
		let helpSourceDiv = $body.find(".usageCategoryHelpSource." + usageCategoryId);
		usageCategoryHelpForPrint += "<div class='usageCategoryHelpForPrint'>";
		usageCategoryHelpForPrint += "<h4>" + helpSourceDiv.find("div.modal-header :header").html() + "</h4>";
		usageCategoryHelpForPrint += helpSourceDiv.find("div.modal-body").html();
		usageCategoryHelpForPrint += "</div>";
	});

	$simplifiedModelingContents.html(out);
	$body.find(".usageCategoryHelpForPrint").html(usageCategoryHelpForPrint);
	appStage.addModalEventHandlers($simplifiedModelingContents);
	appStage.hookUpSimplifiedModelingEvents();
};

appStage.hookUpSimplifiedModelingEvents = function hookUpSimplifiedModelingEvents() {
	_trace("hookUpSimplifiedModelingEvents");

	let config = appEngine.configuration, $simplifiedDropdownSelects = $simplifiedModelingContents.find(".usageCategoryDropdown select");
	$simplifiedDropdownSelects.off("change").on("change", /* @this HTMLElement */ function onSelectChanged() {
		_trace("$simplifiedDropdownSelects change event");
		let $el = $(this), userId = $el.data("user-id"), usageCategoryId = $el.data("usage-category-id"), value = $el.val();
		appDispatch.onUserChangedSimplifiedModelingUsageCategoryOption(userId, usageCategoryId, value);
		appData.setSimplifiedModelingUsageCategoryOption(userId, usageCategoryId, value);
		$simplifiedModelingContents.find(strFmt(".usageCategory.printOnly.{0}.{1}", userId, usageCategoryId)).html(
			getDescription(config.usageCategories[usageCategoryId].options[value]));
		appCharts.requestChartUpdate('$simplifiedDropdownSelects.on("change")');
	});
};

appStage.rebuildDetailedModelingContents = function rebuildDetailedModelingContents() {
	_trace("rebuildDetailedModelingContents");

	let out, zeroText = getText("txt_ZeroServiceCount"), config = appEngine.configuration;
	let showCategoryHeadings = appData.features.detailedModelingShowCategoryHeadings;

	$detailedModelingContents = $body.find(".detailedModelingContents");
	$detailedModelingContents.empty();

	if (showCategoryHeadings) {
		out = "<table class='withCategoryHeadings table-responsive'>";
	} else {
		out = "<table class='table-responsive'>";
	}

	// Header for first column, containing links to each usage category's help modal.
	out += "<tr><th class='person'><div class='personTypeHeader'>&nbsp;</div>";
	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
		let modalId = strFmt("modal_UsageCategoryHelp_{0}", capitalizeFirstLetter(usageCategoryId));
		out += strFmt("<div class='usageCategory category{0} {1}'><button data-bs-target='#{2}' data-bs-toggle='modal'>" +
			"<i class='fa fa-info-circle'></i>{3}</button></div>", index + 1, usageCategoryId, modalId,
			getDescription(config.usageCategories[usageCategoryId]));
	});
	out += "</th>";

	// Loop through the user names - header
	let modelingInputsOrderedIds = appData.getModelingInputsOrderedIds();
	modelingInputsOrderedIds.forEach(function eachPersonId(personId) {
		let userModelingInputs = appData.getModelingInputsForPerson(personId);
		let maybeHiddenNotApplicable = userModelingInputs.enabled ? "" : " hiddenNotApplicable";
		let personText = getText("txt_PersonType_" + userModelingInputs.type);
		out += strFmt("<th class='person {0}{1}'><div class='personTypeHeader'>{2}</div>",
			personId, maybeHiddenNotApplicable, personText);
		config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
			let personTextForTitle = personText + (userModelingInputs.type === "child" ? (" " + userModelingInputs.index) : "");
			let dropdownTitle = (personTextForTitle + ": " + getDescription(config.usageCategories[usageCategoryId])).replace(/'/g, "&apos;");
			out += appStage.lowHighGenDrop(personId, index + 1, usageCategoryId,
				appData.getDetailedModelingUsageCategoryOption(personId, usageCategoryId), true, dropdownTitle);
		});
		out += "</th>";
	});
	out += "</tr>";

	let categoryIndex = 0, numCategories = config.categoriesOrder.length, footnotesHtml = "";
	let serviceCountMax = appData.features.detailedModelingServiceCountMax;
	config.categoriesOrder.forEach(function eachCategoryId(categoryId) {
		categoryIndex += 1;
		let category = config.categories[categoryId], categoryDescription = getDescription(category);
		if (showCategoryHeadings) {
			let extraCategoryRowCssClass = "";
			if (numCategories === 1) {
				extraCategoryRowCssClass = "onlyCategory";
			} else if (categoryIndex === 1) {
				extraCategoryRowCssClass = "firstCategory";
			} else if (categoryIndex === numCategories) {
				extraCategoryRowCssClass = "lastCategory";
			}
			out += strFmt("<tr class='category {0} {1}'><th class='categoryDescription' colspan='{2}'>{3}</th></tr>",
				categoryId, extraCategoryRowCssClass, modelingInputsOrderedIds.length + 1, categoryDescription);
		}
		let serviceIndex = 0, numServices = category.orderedContents.length;
		category.orderedContents.forEach(function each(serviceId) {
			serviceIndex += 1;
			let service = config.services[serviceId], serviceDescription = getDescription(service);
			let hasFootnote = service.hasOwnProperty("footnoteIndicator") && service.hasOwnProperty("footnoteText");
			if (hasFootnote) {
				serviceDescription += service.footnoteIndicator;
				footnotesHtml += strFmt("<span class='{0}'>{1} {2}</span><br>", serviceId, service.footnoteIndicator, service.footnoteText);
			}
			let extraServiceRowCssClass = "";
			if (numServices === 1) {
				extraServiceRowCssClass = "onlyServiceInCategory";
			} else if (serviceIndex === 1) {
				extraServiceRowCssClass = "firstServiceInCategory";
			} else if (serviceIndex === numServices) {
				extraServiceRowCssClass = "lastServiceInCategory";
			}
			out += strFmt("<tr class='{0} service {1} {2}'><td class='serviceDescription'>{3}</td>",
				categoryId, serviceId, extraServiceRowCssClass, serviceDescription);
			modelingInputsOrderedIds.forEach(function eachPersonId(personId) {
				let userModelingInputs = appData.getModelingInputsForPerson(personId);
				let maybeHiddenNotApplicable = userModelingInputs.enabled ? "" : " hiddenNotApplicable", k;
				let userSpecificServiceClass = personId + "-" + serviceId;
				let serviceCount = appData.getDetailedModelingPersonServiceCount(personId, serviceId);
				let personTextForTitle = getText("txt_PersonType_" + userModelingInputs.type) +
					(userModelingInputs.type === "child" ? (" " + userModelingInputs.index) : "");
				let dropdownTitle = (personTextForTitle + ": " + serviceDescription).replace(/'/g, "&apos;");
				let isAdditionalServices = serviceId.startsWith("additionalServices");
				out += strFmt("<td class='{0}{2}'>" +
					"<select name='{3}' data-user-id='{0}' data-service-id='{1}' " +
					"class='serviceCountSelect {5} {3} form-control form-select noPrint' title='{4}'>", personId, serviceId,
					maybeHiddenNotApplicable, userSpecificServiceClass, dropdownTitle, isAdditionalServices ? "additionalServices" : "");
				let selectMax = isNullOrUndefined(service.userInputServiceCountMax) ? serviceCountMax : service.userInputServiceCountMax;
				let selectIncrement = isNullOrUndefined(service.userInputServiceCountIncrement) ?
					1 : service.userInputServiceCountIncrement;
				for (k = 0; k <= selectMax; k += selectIncrement) {
					let countText = (k === 0) ? zeroText : (isAdditionalServices ? formatDollar(k) : k.toString());
					out += strFmt("<option value='{0}' {1}>{2}</option>", k, serviceCount === k ? " selected='selected'" : "", countText);
				}
				out += "</select>";
				out += strFmt("<div class='{0} serviceCount printOnly'>{1}</div>", userSpecificServiceClass,
					(isAdditionalServices ? formatDollar(serviceCount) : serviceCount.toString()));
				out += "</td>";
			});
			out += "</tr>";
		});
	});

	out += "</table>";
	if (footnotesHtml.length > 0) { out += strFmt("<div class='serviceSpecificFootnotes'>{0}</div>", footnotesHtml); }
	$detailedModelingContents.html(out);
	appStage.addModalEventHandlers($detailedModelingContents);
	appStage.hookUpDetailedModelingEvents();
};

appStage.rebuildChronicConditionModelingContents = function rebuildChronicConditionModelingContents() {
	const config = appEngine.configuration;
	$chronicConditionModelingContents = $body.find(".chronicConditionModelingContents");
	$chronicConditionModelingContents.empty();

	let out = "<table class='withCategoryHeadings table-responsive'>";
	out += "<tr><th class='person'><div class='personTypeHeader'>ABC&nbsp;</div>";

	config.enabledUsageCategoriesOrder.forEach(function each(usageCategoryId, index) {
		let modalId = strFmt("modal_UsageCategoryHelp_{0}", capitalizeFirstLetter(usageCategoryId));
		out += strFmt("<div class='usageCategory category{0} {1}'><button data-bs-target='#{2}' data-bs-toggle='modal'>" +
			"<i class='fa fa-info-circle'></i>{3}</button></div>", index + 1, usageCategoryId, modalId,
			getDescription(config.usageCategories[usageCategoryId]));
	});

	out += "</table>";
	$chronicConditionModelingContents.html(out);
	appStage.addModalEventHandlers($chronicConditionModelingContents);
	appStage.hookUpChronicConditionedModelingEvents();
}

appStage.hookUpChronicConditionedModelingEvents = function hookUpchronicConditionedModelingEvents() {
}

appStage.updateDetailedModelingServiceDropdownCounts = function updateDetailedModelingServiceDropdownCounts(userIdOrIds) {
	_trace("updateDetailedModelingServiceDropdownCounts: userIdOrIds: {0}", userIdOrIds);

	let config = appEngine.configuration, userIds = Array.isArray(userIdOrIds) ? userIdOrIds : [userIdOrIds];
	userIds.forEach(function each(userId) {
		let serviceCounts = appData.getDetailedModelingServiceCounts(userId);
		// Update individual service values to match new counts
		config.categoriesOrder.forEach(function eachCategoryId(categoryId) {
			let category = config.categories[categoryId];
			category.orderedContents.forEach(function eachServiceId(serviceId) {
				let userServiceId = userId + "-" + serviceId;
				let visibleValue = serviceCounts[serviceId] || "0";
				$detailedModelingContents.find("." + userServiceId).val(visibleValue);
				$detailedModelingContents.find(".serviceCount." + userServiceId).html(visibleValue);
			});
		});
	});
};

appStage.hookUpDetailedModelingEvents = function hookUpDetailedModelingEvents() {
	_trace("hookUpDetailedModelingEvents");

	let config = appEngine.configuration, $detailedDropdownSelects = $detailedModelingContents.find("select.usageCategorySelect"),
		$detailedServiceCountSelects = $detailedModelingContents.find("select.serviceCountSelect"),
		detailedModelingCustomText = getText("txt_DetailedModelingCustom");

	$detailedDropdownSelects.off("change").on("change", /* @this HTMLElement */ function onSelectChanged() {
		_trace("$detailedDropdownSelects change event");
		let $el = $(this), value = $el.val(), userId = $el.data("user-id"), usageCategoryId = $el.data("usage-category-id");
		let $others = $detailedDropdownSelects.filter(
			strFmt("[data-user-id='{0}'][data-usage-category-id='{1}']", userId, usageCategoryId)).not($el);
		if ($others.length > 0) { $others.val(value); }
		appDispatch.onUserChangedDetailedModelingUsageCategoryOption(userId, usageCategoryId, value);
		if (value !== "") {
			appData.setDetailedModelingUsageCategoryOption(userId, usageCategoryId, value);
			appStage.updateDetailedModelingServiceDropdownCounts(userId);
			$detailedModelingContents.find(strFmt(".usageCategory.printOnly.{0}.{1}", userId, usageCategoryId)).html(
				getDescription(config.usageCategories[usageCategoryId].options[value]));
			appCharts.requestChartUpdate('$detailedDropdownSelects.on("change")');
		} else {
			$detailedModelingContents.find(strFmt(".usageCategory.printOnly.{0}.{1}", userId, usageCategoryId)).html(detailedModelingCustomText);
		}
	});

	$detailedServiceCountSelects.off("change").on("change", /* @this HTMLElement */ function onSelectChanged() {
		_trace("$detailedServiceCountSelects change event");
		let $el = $(this), userId = $el.data("user-id"), serviceId = $el.data("service-id"), serviceCount = parseInt($el.val().toString(), 10);
		if ($el.hasClass("additionalServices")) { // additionalServices will not be constrained to detailedModelingServiceCountMax
			serviceCount = Math.max(0, isNaN(serviceCount) ? 0 : serviceCount);
		} else {
			serviceCount = Math.max(0, Math.min(appData.features.detailedModelingServiceCountMax, isNaN(serviceCount) ? 0 : serviceCount));
		}
		$el.val(serviceCount); // potentially update w/validated value
		let $others = $detailedServiceCountSelects.filter(strFmt("[data-user-id='{0}'][data-service-id='{1}']", userId, serviceId)).not($el);
		if ($others.length > 0) { $others.val(serviceCount); }
		$detailedModelingContents.find(strFmt(".serviceCount.{0}-{1}", userId, serviceId)).html(serviceCount.toString());
		$detailedModelingContents.find(strFmt(".{0}-d1, .{0}-d2", userId)).val(""); // reset dropdowns at top; no longer representative
		$detailedModelingContents.find(strFmt(".{0}-d1.printOnly, .{0}-d2.printOnly", userId)).html(detailedModelingCustomText);
		appDispatch.onUserChangedDetailedModelingServiceCount(userId, serviceId, serviceCount);
		appData.setDetailedModelingPersonServiceCount(userId, serviceId, serviceCount);
		appCharts.requestChartUpdate('$detailedServiceCountSelects.on("change")');
	});
};

// endregion Simplified and detailed modeling areas
// region MPCE section chart and controls (at left)

appStage.hookUpChartSectionEvents = function hookUpChartSectionEvents() {
	_trace("hookUpChartSectionEvents");

	// Div for misc. chart options, and checkboxes for each available option (only one right now).
	let showWorstCaseCostsFeature = appData.features.showWorstCaseCostsFeature, showTotalCostsFeature = appData.features.showTotalCostsFeature;
	let anyChartOptionFeatureEnabled = showWorstCaseCostsFeature || showTotalCostsFeature;
	let $showWorstCaseCostsCheckboxesChanging = [], $showTotalCostsCheckboxesChanging = [];
	$body.find("#chartOptions:not(.notInUse), .chartOptions:not(.notInUse)").toggle(anyChartOptionFeatureEnabled);
	$body.find("#showWorstCaseCostsItem:not(.notInUse), .showWorstCaseCostsItem:not(.notInUse)").toggle(appData.features.showWorstCaseCostsFeature);
	$body.find("#showTotalCostsItem:not(.notInUse), .showTotalCostsItem:not(.notInUse)").toggle(appData.features.showTotalCostsFeature);

	$showWorstCaseCosts = $body.find("#showWorstCaseCosts, .showWorstCaseCosts");
	$showTotalCosts = $body.find("#showTotalCosts, .showTotalCosts");

	$showWorstCaseCosts.off("change.hookUpChartSectionEvents");
	if (showWorstCaseCostsFeature) {
		$showWorstCaseCosts.prop("checked", appData.personal.showWorstCaseCosts);
		$showWorstCaseCosts.on("change.hookUpChartSectionEvents",
			function onShowWorstCaseCostsChanged(event) {
				let $eventTarget = $(event.target);
				$showWorstCaseCostsCheckboxesChanging.push($eventTarget);
				if ($showWorstCaseCostsCheckboxesChanging.length <= 1) {
					let $notTargets = $showWorstCaseCosts.not($eventTarget);
					let checked = appData.personal.showWorstCaseCosts = $eventTarget.is(":checked");
					$notTargets.prop("checked", checked);
					if (checked) {
						appData.personal.showTotalCosts = false;
						$showTotalCosts.prop("checked", false);
					}
					appCharts.requestChartUpdate('$showWorstCaseCosts.on("change.hookUpChartSectionEvents")');
				}
				$showWorstCaseCostsCheckboxesChanging.pop();
			});
		$showWorstCaseCosts.first().trigger("change");
	}

	$showTotalCosts.off("change.hookUpChartSectionEvents");
	if (showTotalCostsFeature) {
		$showTotalCosts.prop("checked", appData.personal.showTotalCosts);
		$showTotalCosts.on("change.hookUpChartSectionEvents",
			function onShowTotalCostsChanged(event) {
				let $eventTarget = $(event.target);
				$showTotalCostsCheckboxesChanging.push($eventTarget);
				if ($showTotalCostsCheckboxesChanging.length <= 1) {
					let $notTargets = $showTotalCosts.not($eventTarget);
					let checked = appData.personal.showTotalCosts = $eventTarget.is(":checked");
					$notTargets.prop("checked", checked);
					if (checked) {
						appData.personal.showWorstCaseCosts = false;
						$showWorstCaseCosts.prop("checked", false);
					}
					appCharts.requestChartUpdate('$showTotalCosts.on("change.hookUpChartSectionEvents")');
				}
				$showTotalCostsCheckboxesChanging.pop();
			});
		$showTotalCosts.first().trigger("change");
	}
};

// endregion MPCE section chart and controls (at left)
// region MPCE savings account area and controls (at right)

appStage.maybeSetUpContributionsFeatures = function maybeSetUpContributionsFeatures() {
	_trace("maybeSetUpContributionsFeatures");

	appStage.hookUpSavingsSectionEvents();
};

appStage.hookUpSavingsSectionEvents = function hookUpSavingsSectionEvents(optionalSliderStopCallback) {
	_trace("hookUpSavingsSectionEvents");

	if (!appData.features.applyFundsToCostOfCareFeature) {
		$body.find(".applyFundsToCostOfCareFeature").addClass("notInUse");
	}

	if (appData.features.hsaContributionsFeature) {
		appStage.hookUpSavingsSliderEvents("hsa", "hsaContributionAmount", optionalSliderStopCallback);
		appStage.hookUpOverAge55Events();
	} else {
		$body.find(".hsaContributionsFeature").addClass("notInUse");
	}

	if (appData.features.fsaContributionsFeature) {
		appStage.hookUpSavingsSliderEvents("fsa", "fsaContributionAmount", optionalSliderStopCallback);
	} else {
		$body.find(".fsaContributionsFeature").addClass("notInUse");
	}

	if (!appData.features.hsaOrFsaContributionsFeature) {
		$body.find(".hsaOrFsaContributionsFeature").addClass("notInUse");
	}

	if (appData.features.carryoverAmountFeature) {
		appStage.hookUpSavingsSliderEvents("carryover", "carryoverAmount", optionalSliderStopCallback);
	} else {
		$body.find(".carryoverAmountFeature").addClass("notInUse");
	}

	if (appData.features.anyContributionsFeature) {
		$body.addClass("anyContributionsFeature");
	} else {
		$body.find(".anyContributionsFeature").addClass("notInUse");
	}
};

appStage.hookUpSavingsSliderEvents = function hookUpSavingsSliderEvents(kind, appDataPersonalKey, optionalSliderStopCallback) {
	_trace("hookUpSavingsSliderEvents for kind: {0}", kind);

	let $sliderRows = $body.find("." + kind + "SliderRow"), $sliders = $body.find("." + kind + "Slider.slider"),
		$textInputs = $sliderRows.find(".sliderTextInput"), $printLabel = $body.find("." + kind + "SliderPrint .value"),
		$sliderChangedTip = $sliderRows.find(".sliderChangedTip:not(.notInUse)");
	let sliderSlideChangeFunc, sliderMin, sliderMax, sliderStep, $slidersChanging = [], sliderChangedTipTimeoutId = null;
	let stopCallback = typeof optionalSliderStopCallback === "function" ? optionalSliderStopCallback : $.noop;
	let kindInitialCaps = capitalizeFirstLetter(kind);

	if (appData.features[kind + "ContributionsFeature"] || appData.features[kind + "AmountFeature"]) {
		$sliderChangedTip.addClass("hiddenNotApplicable");
		if ($sliders.length) {
			$sliders.each(/* @this HTMLElement */ function each() {
				let $el = $(this);
				if ($el.hasClass("ui-slider")) { $el.slider("destroy"); }
			});
			sliderSlideChangeFunc = function sliderSlideChange(event, ui, eventType) {
				if (event.originalEvent) {
					let $eventTarget = $(event.target), $slidersNotEventTarget = $sliders.not($eventTarget);
					$slidersChanging.push($eventTarget);
					if ($slidersChanging.length <= 1) {
						let value = ui.value, formatted = formatDollar(value);
						$slidersNotEventTarget.slider("value", value);
						$textInputs.val(formatted);
						$printLabel.html(formatted);
						let shouldUpdateNow = eventType === "change" ||
							(appData.features.sliderLiveUpdating && eventType === "slide" && !$eventTarget.hasClass("noSliderLiveUpdating"));
						if (shouldUpdateNow) {
							appData.personal[appDataPersonalKey] = value;
							appCharts.requestChartUpdate(strFmt('$body.find(".{0}Slider").slider() {1}', kind, eventType));
						}
					}
					$slidersChanging.pop();
				}
			};
			if (kind === "carryover") {
				sliderMin = 0;
				sliderMax = appData.features.carryoverAmountSliderMaximum;
				sliderStep = appData.features.carryoverAmountSliderStepAmount;
			} else {
				sliderMin = appDispatch[strFmt("onAppNeeds{0}SliderMinimum", kindInitialCaps)]();
				sliderMax = appDispatch[strFmt("onAppNeeds{0}SliderMaximum", kindInitialCaps)]();
				sliderStep = appData.features.savingsSliderStepAmount;
			}
			$body.find("." + kind + "SliderMinimum").html(formatDollar(sliderMin));
			$body.find("." + kind + "SliderMaximum").html(formatDollar(sliderMax));

			$textInputs.off("focus").on("focus", function focus(event) { // Remove formatting when acquiring focus, and select
				let value = appData.personal[appDataPersonalKey], newText = value === 0 ? "" : value.toString();
				$textInputs.val(newText);
				newText.length > 0 && _selectAllTextOnFocus(event);
			});
			$textInputs.off("blur").on("blur", function focus() { // Restore dollar formatting when losing focus
				$textInputs.val(formatDollar(appData.personal[appDataPersonalKey]));
				stopCallback(kind);
			});
			let _textInputChangeFunc = function textInputChangeFunc(event, ui, eventType) {
				let $eventTarget = $(event.target), inputString = $eventTarget.val().trim();
				let inputValue = inputString.length === 0 ? 0 : Number.parseInt(inputString, 10);
				let currentSliderMin = $sliders.slider("option", "min"), currentSliderMax = $sliders.slider("option", "max");
				let newValue = constrain(inputValue, currentSliderMin, currentSliderMax);
				$sliders.slider({ value: newValue });
				$printLabel.html(formatDollar(newValue));
				appData.personal[appDataPersonalKey] = newValue;
				if (eventType === "keyup" && event.keyCode === 13) { $eventTarget.trigger("blur"); } // i.e. on enter key
				appCharts.requestChartUpdate(strFmt('$body.find(".{0}.sliderTextInput").textInputChangeFunc() {1}', kind, eventType));
			};
			$textInputs.off("keydown").on("keydown", _onKeyDownFilterNumericTextInput);
			$textInputs.off("keyup").on("keyup", function keyup(event, ui) { _textInputChangeFunc(event, ui, "keyup"); });
			$textInputs.off("change").on("change", function change(event, ui) { _textInputChangeFunc(event, ui, "change"); });

			appData.personal[appDataPersonalKey] = Math.min(Math.max(appData.personal[appDataPersonalKey], sliderMin), sliderMax);
			$sliders.slider({
				value: appData.personal[appDataPersonalKey],
				range: "min",
				min: sliderMin,
				max: sliderMax,
				step: sliderStep,
				start: function start() {
					appCharts.touchLastUpdate();
					$body.find(".active" + kindInitialCaps + "SliderHighlight").addClass("sliderHighlight");
				},
				stop: function stop() {
					stopCallback(kind);
					$body.find(".active" + kindInitialCaps + "SliderHighlight").removeClass("sliderHighlight");
					if (appStage.isSizeMediumOrLower()) {
						$sliderChangedTip.removeClass("hiddenNotApplicable");
						sliderChangedTipTimeoutId && clearTimeout(sliderChangedTipTimeoutId);
						sliderChangedTipTimeoutId = setTimeout(function delayed() {
							$sliderChangedTip.addClass("hiddenNotApplicable");
							sliderChangedTipTimeoutId = null;
						}, 3000);
					}
				},
				slide: function slide(event, ui) { sliderSlideChangeFunc(event, ui, "slide"); },
				change: function change(event, ui) { sliderSlideChangeFunc(event, ui, "change"); }
			});
			let formatted = formatDollar($sliders.slider("value"));
			$printLabel.html(formatted);
			$textInputs.val(formatted);
			if (sliderMax === 0) {
				$sliderRows.find(".savingsAccountSliderLabel").add($textInputs).addClass("disabled");
				$textInputs.prop("disabled", true);
				$sliders.slider({ disabled: true });
			}
		}
	}
};

appStage.hookUpOverAge55Events = function hookUpOverAge55Events() {
	_trace("hookUpOverAge55Events");

	let $over55CheckboxesChanging = [], initialValue = appData.personal.overAge55;
	$over55 = $body.find("#over55, .over55");
	$over55Row = $body.find("#over55Row, .over55Row");
	$over55.prop("checked", initialValue);
	$over55Row.find(".checkedDescription").toggleClass("hiddenNotApplicable", !initialValue);
	$over55Row.find(".uncheckedDescription").toggleClass("hiddenNotApplicable", initialValue);
	$over55.off("change.hookUpOverAge55Events").on("change.hookUpOverAge55Events",
		function onOver55Changed(event) {
			let $eventTarget = $(event.target);
			$over55CheckboxesChanging.push($eventTarget);
			if ($over55CheckboxesChanging.length <= 1) {
				let $notTargets = $over55.not($eventTarget);
				let checked = appData.personal.overAge55 = $eventTarget.is(":checked");
				$over55Row.find(".checkedDescription").toggleClass("hiddenNotApplicable", !checked);
				$over55Row.find(".uncheckedDescription").toggleClass("hiddenNotApplicable", checked);
				$notTargets.prop("checked", checked);
				appStage.maybeAdjustSavingsSliderBounds();
			}
			$over55CheckboxesChanging.pop();
		});
	$over55.first().trigger("change");
};

appStage.maybeAdjustSavingsSliderBounds = function maybeAdjustSavingsSliderBounds() {
	_trace("maybeAdjustSavingsSliderBounds");

	if (appData.features.hsaContributionsFeature) {
		appStage.maybeAdjustSavingsSliderBoundsImpl("hsa");
	}
	if (appData.features.fsaContributionsFeature) {
		appStage.maybeAdjustSavingsSliderBoundsImpl("fsa");
	}
};

// ... and for backward compatibility w/old clientCustom implementations, potentially:
appStage.maybeAdjustSavingsSliderMaximums = appStage.maybeAdjustSavingsSliderBounds;

appStage.maybeAdjustSavingsSliderBoundsImpl = function maybeAdjustSavingsSliderBoundsImpl(sliderKind) {
	_trace("maybeAdjustSavingsSliderBoundsImpl: sliderKind: {0}", sliderKind);

	let $sliderRow, $sliders, $sliderMinimum, $sliderMaximum, $sliderTextInput, minCallbackName, maxCallbackName, appDataPersonalKey,
		currentSliderMinimum, newSliderMinimum, currentSliderMaximum, newSliderMaximum, currentSliderValue, newSliderValue;

	switch (sliderKind) {
		case "hsa":
			$sliderRow = $body.find(".hsaSliderRow");
			$sliders = $body.find(".hsaSlider");
			$sliderMinimum = $body.find(".hsaSliderMinimum");
			$sliderMaximum = $body.find(".hsaSliderMaximum");
			$sliderTextInput = $body.find(".hsaSliderTextInput");
			minCallbackName = "onAppNeedsHsaSliderMinimum";
			maxCallbackName = "onAppNeedsHsaSliderMaximum";
			appDataPersonalKey = "hsaContributionAmount";
			break;
		case "fsa":
			$sliderRow = $body.find(".fsaSliderRow");
			$sliders = $body.find(".fsaSlider");
			$sliderMinimum = $body.find(".fsaSliderMinimum");
			$sliderMaximum = $body.find(".fsaSliderMaximum");
			$sliderTextInput = $body.find(".fsaSliderTextInput");
			minCallbackName = "onAppNeedsFsaSliderMinimum";
			maxCallbackName = "onAppNeedsFsaSliderMaximum";
			appDataPersonalKey = "fsaContributionAmount";
			break;
		default:
			return;
	}
	if (typeof $sliders.slider("instance") === "undefined") { return; }
	currentSliderMinimum = $sliders.slider("option", "min");
	currentSliderMaximum = $sliders.slider("option", "max");
	newSliderMinimum = appDispatch[minCallbackName]();
	newSliderMaximum = appDispatch[maxCallbackName]();

	if (newSliderMinimum !== currentSliderMinimum || newSliderMaximum !== currentSliderMaximum) {
		$sliderMinimum.html(formatDollar(newSliderMinimum));
		$sliderMaximum.html(formatDollar(newSliderMaximum));

		currentSliderValue = $sliders.slider("option", "value"); // preserve; may need to be limited
		_trace("Changing {0} slider bounds [{1}, {2}] to [{3}, {4}]", sliderKind, currentSliderMinimum, currentSliderMaximum,
			newSliderMinimum, newSliderMaximum);
		$sliders.slider("option", "max", newSliderMaximum);
		if (currentSliderValue < newSliderMinimum) {
			newSliderValue = newSliderMinimum;
			_trace("Limiting current {0} slider value from {1} to new minimum {2}", sliderKind, currentSliderValue, newSliderValue);
			appData.personal[appDataPersonalKey] = newSliderValue;
			$sliders.slider("option", "value", newSliderValue);
			$sliderTextInput.val(formatDollar(newSliderValue));
		}
		if (currentSliderValue > newSliderMaximum) {
			newSliderValue = newSliderMaximum;
			_trace("Limiting current {0} slider value from {1} to new maximum {2}", sliderKind, currentSliderValue, newSliderValue);
			appData.personal[appDataPersonalKey] = newSliderValue;
			$sliders.slider("option", "value", newSliderValue);
			$sliderTextInput.val(formatDollar(newSliderValue));
		}
		if (newSliderMaximum === 0) {
			$sliderRow.find(".savingsAccountSliderLabel").add($sliderTextInput).addClass("disabled");
			$sliderTextInput.prop("disabled", true);
			$sliders.slider({ disabled: true });
		} else {
			$sliderRow.find(".savingsAccountSliderLabel").add($sliderTextInput).removeClass("disabled");
			$sliderTextInput.prop("disabled", false);
			$sliders.slider({ disabled: false });
		}
		appCharts.requestChartUpdate("appStage.maybeAdjustSavingsSliderBoundsImpl for slider: " + sliderKind);
	}
};

// endregion MPCE savings account area and controls (at right)
// region MPCE savings account result tables

appStage.maybeRemakeResultsTablesCells = function maybeRemakeResultsTablesCells($resultsTables, orderedPlanIds) {
	// Compare the old set of ordered plan ids on the tables (if any) to the new set required. If same,
	// then nothing more to do. If different, clear old dynamic table cells and recreate them for new set.
	let oldPlanIdsCsv = $resultsTables.data("plan-ids-csv"), newPlanIdsCsv = orderedPlanIds.join(",");
	if (oldPlanIdsCsv === newPlanIdsCsv) {
		return;
	}
	_trace("maybeRemakeResultsTablesCells: for [{0}]", newPlanIdsCsv);
	$resultsTables.data("plan-ids-csv", newPlanIdsCsv);
	$resultsTables.find("tr:not(.noDynamicCells) td.planSpecific, tr:not(.noDynamicCells) th.planSpecific").remove();

	// Gather some information up front about each plan's potential associated account type.
	let plans = appEngine.configuration.plans, planDataMap = {};
	orderedPlanIds.forEach(function each(id) {
		let accountTypeId = appEngine.getPrimaryAccountTypeId(plans[id].fsaeAccountTypeId);
		let accountConfig = accountTypeId && fsaeConfig.accountTypes[accountTypeId];
		planDataMap[id] = {
			isFSA: accountConfig && (accountConfig.followRulesFor === "FSA"),
			isHSA: accountConfig && (accountConfig.followRulesFor === "HSA")
		};
	});

	// For each results table, and each row of each such table, generate appropriate cells for each plan id.
	$resultsTables.each(function each(tableIndex, tableElement) {

		let $table = $(tableElement), $trs = $table.find("tr:not(.noDynamicCells)");
		$trs.each(function eachRow(trIndex, trElement) {
			let $tr = $(trElement), tag = $tr.children().first().is("th") ? "th" : "td";
			orderedPlanIds.forEach(function eachPlanId(planId) {
				let planData = planDataMap[planId], maybeHighlight = "";
				if ($tr.hasClass("voluntaryFundContributionAmount")) {
					maybeHighlight = planData.isFSA ? " activeFsaSliderHighlight" : (planData.isHSA ? " activeHsaSliderHighlight" : "");
				} else if ($tr.hasClass("incomingFundRolloverAmount")) {
					maybeHighlight = " activeCarryoverSliderHighlight";
				}
				$tr.append(strFmt("<{0} class='planSpecific {1}{2}'></{0}>", tag, planId, maybeHighlight));
			}); // end for each plan id
		}); // end for each table row

	}); // end for each results table

	// For rows that were classed noDynamicCells, update the colspan of any cell classed spansAllPlans.
	$resultsTables.find("tr.noDynamicCells th.spansAllPlans, tr.noDynamicCells td.spansAllPlans").attr("colspan", orderedPlanIds.length);
	$resultsTables.find("tr.noDynamicCells th.spansAllCells, tr.noDynamicCells td.spansAllCells").attr("colspan", orderedPlanIds.length + 1);
};

appStage.makeResultTableCellData = function makeResultTableCellData(value) {
	let result = { value: value }, valueType = isNullOrUndefined(value) ? "null" : typeof value, negatedValue;
	switch (valueType) {
		case "number":
			result.zero = (value === 0);
			result.negative = (value < 0);
			result.formatted = formatDollar(value);
			negatedValue = result.negatedValue = -value;
			result.negatedValueNegative = (negatedValue < 0);
			result.negatedValueFormatted = formatDollar(negatedValue);
			break;
		case "string":
			result.formatted = value;
			break;
		case "boolean":
			result.formatted = value.toString();
			break;
		case "null":
			result.formatted = "";
			result.noValue = true;
			break;
		default:
			result.formatted = "type unknown";
			break;
	}
	return result;
};

let _planResultKeysCache = null;

appStage.invalidatePlanResultKeysCache = function invalidatePlanResultKeysCache() {
	_trace("invalidatePlanResultKeysCache");
	_planResultKeysCache = null;
};

appStage.updateResultsTablesCells = function updateResultsTablesCells($resultsTables, cellsData, planResult, resultsVariant) {
	_trace("updateResultsTablesCells: {0}/{1}", resultsVariant, planResult.planId);

	// Write out each output to corresponding elements, with appropriate classes for targeted styling.
	let planId = planResult.planId, limitedRolloverAmount = planResult.potentialRolloverWasLimited, isMainResults = (resultsVariant === "main"),
		cacheInitialized = !isNullOrUndefined(_planResultKeysCache), cacheSet = cacheInitialized ? null : new Set(),
		$dynamicResultsSections = appStage.$dynamicResultsSections;

	Object.keys(cellsData).forEach(function each(key) {
		let cellData = cellsData[key], zero = cellData.zero, $elems, $elemsNonTable, $elemsNeg, $elemsNegNonTable, hasElems;
		$elems = $resultsTables.find(strFmt(".{0}:not(.notInUse):not(.negated) .{1}", key, planId)); // table cells for plain value output
		$elemsNonTable = $dynamicResultsSections.find(strFmt(".planResult.{0}.{1}:not(.notInUse):not(.negated){2}",
			planId, key, isMainResults ? ":not(.alternate_noEmployeeFunding)" : ("." + resultsVariant)));
		$elems.length && $elems.html(zero ? "" : cellData.formatted); // table cells don't get "$0" as cell content, to facilitate styling
		$elemsNonTable.length && $elemsNonTable.html(cellData.formatted); // but elements elsewhere may get literal "$0" as content
		$elems = $elems.add($elemsNonTable);
		hasElems = cacheInitialized || ($elems.length > 0); // Optimization: no need to check length if cache already initialized.
		$elems[(zero ? "addClass" : "removeClass")]("zero");
		$elems[(cellData.negative ? "addClass" : "removeClass")]("negative");
		$elems[(cellData.noValue ? "addClass" : "removeClass")]("noValue");
		if (("negatedValue" in cellData)) {
			$elemsNeg = $resultsTables.find(strFmt(".{0}:not(.notInUse).negated .{1}", key, planId)); // elements for negated value output
			$elemsNegNonTable = $dynamicResultsSections.find(strFmt(".planResult.{0}.{1}:not(.notInUse).negated{2}",
				planId, key, isMainResults ? ":not(.alternate_noEmployeeFunding)" : ("." + resultsVariant)));
			$elemsNeg.length && $elemsNeg.html(zero ? "" : cellData.negatedValueFormatted);
			$elemsNegNonTable.length && $elemsNegNonTable.html(cellData.negatedValueFormatted);
			$elemsNeg = $elemsNeg.add($elemsNegNonTable);
			hasElems = hasElems || ($elemsNeg.length > 0);
			$elemsNeg[(zero ? "addClass" : "removeClass")]("zero");
			$elemsNeg[(cellData.negatedValueNegative ? "addClass" : "removeClass")]("negative");
		}
		if (key === "limitedPotentialRollover") {
			$elems[(limitedRolloverAmount ? "addClass" : "removeClass")]("limitedRolloverAmount");
			$elemsNeg && $elemsNeg[(limitedRolloverAmount ? "addClass" : "removeClass")]("limitedRolloverAmount");
		}
		if (!cacheInitialized && hasElems) { cacheSet.add(key); }
	});

	if (!cacheInitialized) {
		_planResultKeysCache = Array.from(cacheSet).sort();
		_trace("updateResultsTableCells: _planResultKeysCache has {0} entries: {1}",
			_planResultKeysCache.length, _planResultKeysCache.join(", "));
	}
};

appStage.updateResultsTables = function updateResultsTables($resultsTables, results, resultsVariant) {
	_trace("updateResultsTables: {0}", resultsVariant);

	let config = appEngine.configuration, plans = config.plans;

	let planIdsToShowInTable = results.orderedPlanIds.filter(function filter(planId) {
		return !(plans[planId].excludeFromTable);
	});
	appStage.maybeRemakeResultsTablesCells($resultsTables, planIdsToShowInTable);

	// Hide company match, carryover, and forfeited rollover amount rows. Later logic will just show what is appropriate for the results.
	$resultsTables.find(".planFundAdditionalMatchAmount, .incomingFundRolloverAmount, .forfeitedPotentialRollover").hide();

	// Mark up results with forfeited rollover information; this may get set to true in the loop below. In the future, a better
	// place for this limiting could be the MPCE engine, if it were made aware of related FSAE account type and corresponding rules.
	results.hasPlanWithForfeitedRollover = false;

	// Now, loop through each plan's results from the MPCE.
	planIdsToShowInTable.forEach(function eachPlanId(planId) {
		let pr = results[planId], planConfig = plans[planId];

		// Mark up the plan's results with a potentially limited carryover balance, if its account follows FSA rules.
		// LATER: This is calculation logic and ought not be in appStage but moved into either the MPCE or FSAE engine.
		let accountTypeId = appEngine.getPrimaryAccountTypeId(planConfig.fsaeAccountTypeId);
		let accountConfig = accountTypeId && fsaeConfig.accountTypes[accountTypeId];
		let isFSA = pr.isFSA = accountConfig && (accountConfig.followRulesFor === "FSA");
		pr.isHSA = accountConfig && (accountConfig.followRulesFor === "HSA");
		if (isFSA) {
			let fsaCompanyFundsDoNotRollOver = accountConfig.companyFundsDoNotRollOver || false;
			let unusedIncomingRolloverFunds = pr.incomingFundRolloverAmount - pr.rolloverFundPaid;
			let fsaFundsEligibleForRollover;
			if (fsaCompanyFundsDoNotRollOver) {
				// The FSA plan does NOT permit company funds (base amount plus match) to be rolled over.
				fsaFundsEligibleForRollover = pr.fundCarryoverBalance - pr.planFundAndMatchTotalUnused -
					unusedIncomingRolloverFunds; // past years' unused funds not subject to limitation so exclude then add back
				pr.limitedPotentialRollover = Math.min(appData.features.fsaMaximumPermittedRollover, fsaFundsEligibleForRollover) +
					unusedIncomingRolloverFunds;
			} else {
				// The FSA plan permits company funds (base amount plus match) to be rolled over.
				fsaFundsEligibleForRollover = pr.fundCarryoverBalance -
					unusedIncomingRolloverFunds; // past years' unused funds not subject to limitation so exclude then add back
				let fsaFundAmountSubjectToRolloverLimit = Math.max(0, fsaFundsEligibleForRollover -
					(appData.features.fsaMaximumPermittedRolloverExcludesPlanFundAmount ? pr.planFundUnused : 0));
				let fsaFundAmountNotSubjectToRolloverLimit = fsaFundsEligibleForRollover - fsaFundAmountSubjectToRolloverLimit;
				pr.limitedPotentialRollover = fsaFundAmountNotSubjectToRolloverLimit +
					Math.min(appData.features.fsaMaximumPermittedRollover, fsaFundAmountSubjectToRolloverLimit) +
					unusedIncomingRolloverFunds;
			}
			pr.forfeitedPotentialRollover = pr.fundCarryoverBalance - pr.limitedPotentialRollover;
		} else {
			pr.limitedPotentialRollover = pr.fundCarryoverBalance;
			pr.forfeitedPotentialRollover = 0;
		}
		pr.potentialRolloverWasLimited = pr.forfeitedPotentialRollover > 0;
		results.hasPlanWithForfeitedRollover = results.hasPlanWithForfeitedRollover || pr.potentialRolloverWasLimited;

		// Prior to building up formatted results for output to the results tables, give implementation-specific code
		// an opportunity to add additional custom results to the plan.
		appDispatch.onAppNeedsCustomResultsForPlan(pr, resultsVariant);

		// For each referenced plan result, generate formatted result data to be output to matching elements in the page.
		let cellsData = {};

		let resultsToMakeCellDataFor = !isNullOrUndefined(_planResultKeysCache) ? _planResultKeysCache : Object.keys(pr);
		resultsToMakeCellDataFor.forEach(function eachResult(key) { cellsData[key] = appStage.makeResultTableCellData(pr[key]); });

		// Prior to output, give implementation-specific code an opportunity to potentially modify cellsData.
		appDispatch.onAppWillUpdateResultsTablesForPlan(results, pr, cellsData, resultsVariant);
		appStage.updateResultsTablesCells($resultsTables, cellsData, pr, resultsVariant);
	});

	// Show the company funding row if there was a plan in the results with an ER base fund amount.
	$resultsTables.find(".planFundAmount:not(.notInUse)")[results.hasPlanWithERBaseFundAmount ? "show" : "hide"]();

	// Show the company match row if there was a plan in the results with an ER matching fund amount.
	$resultsTables.find(".planFundAdditionalMatchAmount:not(.notInUse)")[results.hasPlanAllowingERMatch ? "show" : "hide"]();

	// Suppress the carryover amount row if the feature is disabled.
	if (!appData.features.carryoverAmountFeature) { $resultsTables.find(".incomingFundRolloverAmount").addClass("hiddenNotApplicable"); }

	// Show the incoming fund rollover row if applicable
	$resultsTables.find(".incomingFundRolloverAmount:not(.notInUse)")[results.hasPlanWithIncomingRollover ? "show" : "hide"]();

	// Show the forfeited rollover row if there was a plan in the results with a forfeited rollover amount.
	$resultsTables.find(".forfeitedPotentialRollover:not(.notInUse)")[results.hasPlanWithForfeitedRollover ? "show" : "hide"]();
};

// endregion MPCE savings account result tables
// region Saving scenario

appStage.maybeSetUpSaveScenarioFeature = function maybeSetUpSaveScenarioFeature() {
	_trace("maybeSetUpSaveScenarioFeature");

	let $clearScenarioButton = $body.find(".clearScenarioButton");
	$clearScenarioButton.off("click").on("click", function click() {
		let linkWithoutScenario = strFmt("{0}//{1}{2}", window.location.protocol, window.location.host, window.location.pathname);
		location.replace(linkWithoutScenario);
	});

	if (appData.features.saveScenarioEnabled) {
		$body.addClass("saveScenarioEnabled");
		let $saveScenarioButton = $body.find(".saveScenarioButton");
		$saveScenarioButton.off("click").on("click", function click() {
			_trace("$saveScenarioButton click event");
			let scenario = appData.saveScenario();
			let fullScenarioUrl = strFmt(
				"{0}//{1}{2}?scenario={3}", window.location.protocol, window.location.host, window.location.pathname, scenario);
			$body.find(".saveScenarioUrlLink").html(fullScenarioUrl).attr("href", fullScenarioUrl);
			$body.find(".saveScenarioUrlText").val(fullScenarioUrl);
			appDispatch.onUserDidSaveScenario();
			$body.find("#modal_SaveScenario").modal("show");
		});
	}
};

// endregion Saving scenario
// region Plan recommendation

appStage.maybeSetUpPlanRecommendationFeature = function maybeSetUpPlanRecommendationFeature() {
	_trace("maybeSetUpPlanRecommendationFeature");

	if (appData.features.planRecommendationEnabled) {
		$body.addClass("planRecommendationEnabled");
	} else {
		$body.find("#prioritiesSection").addClass("notInUse");
	}
};

// endregion Plan recommendation
// region Simple feedback

appStage.maybeSetUpSimpleFeedbackFeature = function maybeSetUpSimpleFeedbackFeature() {
	_trace("maybeSetUpSimpleFeedbackFeature");

	if (appData.features.simpleFeedbackEnabled) {
		$body.addClass("simpleFeedbackEnabled");
		let $simpleFeedbackElements = $body.find("button.feedbackButton");
		$simpleFeedbackElements.off("click").on("click", function click(event) {
			let $ct = $(event.currentTarget), type = $ct.data("feedback-type"), value = $ct.data("feedback-value");
			appDispatch.onUserProvidedSimpleFeedback(type, value);
		});
	} else {
		$body.find("#feedbackSection").addClass("notInUse");
		$body.find(".simpleFeedback").addClass("notInUse");
	}
};

// endregion Simple feedback
// region Video Library

appStage.maybeSetUpVideoLibraryFeature = function maybeSetUpVideoLibraryFeature() {
	_trace("maybeSetUpVideoLibraryFeature");

	if (appData.features.videoLibraryEnabled) {
		$body.addClass("videoLibraryEnabled");
	} else {
		$body.find(".videoLibraryButton").attr("disabled", "disabled");
		$body.find(".videoLibraryButton.keepTextIfDisabled").each(/* @this HTMLElement */ function each() {
			$("<span>" + $(this).text() + "</span>").insertAfter($(this));
		});
	}
};

// endregion Video Library
// region Tax calculator

appStage.maybeSetUpTaxCalculator = function maybeSetUpTaxCalculator() {
	_trace("maybeSetUpTaxCalculator");
	$nonTaxCalcSections = $body.find(
		"#toolIntroSection, #personalSection, #adjustSection, #prioritiesSection, #mpceSection, #feedbackSection, #taxIntroSection").not(".notInUse");
	$taxIntroSection = $body.find("#taxIntroSection:not(.notInUse)");
	$taxCalcSection = $body.find("#taxCalcSection:not(.notInUse)");
	if (!appData.features.taxCalculatorEnabled) {
		$taxCalcSection.addClass("notInUse");
		$taxIntroSection.addClass("notInUse");
		_trace("maybeSetUpTaxCalculator: skipping rest as taxCalculatorEnabled is false");
		return;
	}
	$body.addClass("taxCalculatorEnabled");
	$taxFilingStatusSelect = $body.find("#taxFilingStatusSelect");
	if (appData.taxCalc.taxFilingStatus) { $taxFilingStatusSelect.val(appData.taxCalc.taxFilingStatus); }
	$taxNumDependentsSelect = $body.find("#taxNumDependentsSelect");
	if (appData.taxCalc.taxNumDependentsStr) { $taxNumDependentsSelect.val(appData.taxCalc.taxNumDependentsStr); }
	appStage.taxFilingStatusChanged(true); // firstCall = true
	$taxFilingStatusSelect.off("change").on("change", function onSelectChanged() { appStage.taxFilingStatusChanged(); });
	appStage.taxNumDependentsChanged(true); // firstCall = true
	$taxNumDependentsSelect.off("change").on("change", function onSelectChanged() { appStage.taxNumDependentsChanged(); });
	appStage.hookUpViewSwitchButtonEvents();
	appStage.updateTaxCalcSelectPlans();
};

appStage.hookUpViewSwitchButtonEvents = function hookUpViewSwitchButtonEvents() {
	_trace("hookUpViewSwitchButtonEvents");
	// Currently, the main tool always starts in MPCE view.
	$body.addClass("mpceView");
	if (!appData.features.taxCalculatorEnabled) {
		_trace("hookUpViewSwitchButtonEvents: skipping rest as taxCalculatorEnabled is false");
		return;
	}

	// MPCE -> Tax button
	$body.find("#btnSwitchToTaxView, .btnSwitchToTaxView").off("click").on("click", function click(event) {
		let selectedPlanId = appData.taxCalc.fsaeSelectedPlanId, accountTypeId = appData.taxCalc.fsaeAccountTypeId,
			accountTypeIdCss = accountTypeId.replace("+", "_");
		event.preventDefault();
		event.stopPropagation();
		appDispatch.onAppWillSwitchToTaxView(selectedPlanId, accountTypeId);
		$body.addClass("taxView");
		$body.removeClass("mpceView");
		$nonTaxCalcSections.hide();
		appStage.maybePopulateHsaEligibleExpensesSlider(selectedPlanId, accountTypeId);
		$body.find("select.planSelect").trigger("change");	// trigger dropdown change to set default values
		$taxCalcSection.find(".sectionBody").removeClass("printOnly");
		$taxCalcSection.find(".planSpecific").hide(); // hide everything plan-specific in the section...
		$taxCalcSection.find("." + selectedPlanId + ":not(.notInUse)").show(); // but do show anything related to the currently selected plan
		$taxCalcSection.find("." + accountTypeIdCss + ":not(.notInUse)").show(); // and associated account type.
		$taxCalcSection.show();
		appTaxChart.maybeReflowChart();
		appTaxChart.requestChartUpdate('$body.find("#btnSwitchToTaxView, .btnSwitchToTaxView").on("click")');
		appDispatch.onAppDidSwitchToTaxView(selectedPlanId, accountTypeId);
		$(window).trigger("resize");
	});

	// Tax -> MPCE button
	$body.find("#btnSwitchToMpceView, .btnSwitchToMpceView").off("click").on("click", function click(event) {
		let selectedPlanId = appData.taxCalc.fsaeSelectedPlanId, accountTypeId = appData.taxCalc.fsaeAccountTypeId;
		event.preventDefault();
		event.stopPropagation();
		appDispatch.onAppWillSwitchToMpceView(selectedPlanId, accountTypeId);
		$body.addClass("mpceView");
		$body.removeClass("taxView");
		$nonTaxCalcSections.show();
		$taxCalcSection.hide();
		appCharts.maybeReflowChart();
		appCharts.requestChartUpdate('$body.find("#btnSwitchToMpceView, .btnSwitchToMpceView").on("click")');
		appDispatch.onAppDidSwitchToMpceView();
		$(window).trigger("resize");
	});
};

appStage.updateTaxCalcSelectPlans = function updateTaxCalcSelectPlans() {
	_trace("updateTaxCalcSelectPlans");

	if (!appData.features.taxCalculatorEnabled) {
		_trace("updateTaxCalcSelectPlans: skipping rest as taxCalculatorEnabled is false");
		return;
	}
	let regionId, planIdsForRegion, firstListedPlanWithAccountTypeId, config = appEngine.configuration;
	let $taxCalcPlanSelects = $body.find("select.taxCalcPlanSelect");

	// Build the dropdown contents according to configuration
	$taxCalcPlanSelects.empty();
	regionId = appData.personal.regionId;
	planIdsForRegion = config.regions[regionId].plans;
	// Loop through plans and set options
	firstListedPlanWithAccountTypeId = "";
	planIdsForRegion.forEach(function eachPlanIdForRegion(planId) {
		let plan = config.plans[planId];
		if (plan.fsaeAccountTypeId && !plan.noTaxCalculator) {
			$taxCalcPlanSelects.append($("<option></option>").val(planId).html(getDescription(plan, "descriptionSelect")));
			if (firstListedPlanWithAccountTypeId === "") { firstListedPlanWithAccountTypeId = planId; }
		}
	});

	let $taxCalcPlanSelectsChanging = [];
	if (firstListedPlanWithAccountTypeId.length > 0) {
		$taxIntroSection.removeClass("hiddenNotApplicable");
		appStage.switchTaxViewToAccountTypeForPlan(firstListedPlanWithAccountTypeId);
		// Bind actions to the dropdown
		$taxCalcPlanSelects.off("change").on("change", function onSelectChanged(event) {
			_trace("select.taxCalcPlanSelect change event");
			let $eventTarget = $(event.target), selectedPlanId = $eventTarget.val();
			$taxCalcPlanSelectsChanging.push($eventTarget);
			if ($taxCalcPlanSelectsChanging.length <= 1) {
				$taxCalcPlanSelects.not($eventTarget).val(selectedPlanId);
			}
			$taxCalcPlanSelectsChanging.pop();
			appStage.switchTaxViewToAccountTypeForPlan(selectedPlanId);
			$taxCalcSection.hide();
		});
	} else {
		appData.taxCalc.fsaeSelectedPlanId = appData.taxCalc.fsaeAccountTypeId = null;
		$taxCalcSection.hide();
		$taxIntroSection.addClass("hiddenNotApplicable");
	}
};

appStage.getAvailablePlansByRegionSelection = () => {
	_trace("getAvailablePlansByRegionSelection");

	let regionId = appData.personal.regionId;
	let config = appEngine.configuration;
	let planIdsForRegion = config.regions[regionId].plans;
	const result = [];
	planIdsForRegion.forEach((planId) => {
		let plan = config.plans[planId];
		let obj = {
			"id": planId,
			"value": plan.description
		};
		result.push(obj);
	});
	return result;
};

appStage.maybePopulateHsaEligibleExpensesSlider = function maybePopulateHsaEligibleExpensesSlider(selectedPlanId, accountTypeId) {
	_trace("maybePopulateHsaEligibleExpensesSlider: selectedPlanId: {0}, accountTypeId: {1}", selectedPlanId, accountTypeId);

	// Helper to populate the value for hsaEligibleExpensesSlider when switching to the tax calculator.
	let expensesForHsaSlider = 0, j, planId, r, mainResults = (appData.getMpceEngineResults()).main, formatted;
	if (mainResults) {
		for (j = 0; j < mainResults.orderedPlanIds.length; j += 1) {
			planId = mainResults.orderedPlanIds[j];
			r = mainResults[planId];
			if (r.planId === selectedPlanId) {
				expensesForHsaSlider = Math.round(Math.max(0, r.totalMedicalAndDrugCosts - r.planFundAmount - r.incomingFundRolloverAmount));
				break;
			}
		}
	}
	formatted = formatDollar(expensesForHsaSlider);
	appData.taxCalc.hsaEligibleExpenses = expensesForHsaSlider;
	$body.find(".hsaEligibleExpensesSlider.slider").slider("option", "value", expensesForHsaSlider);
	$body.find(".hsaEligibleExpensesSlider.print .value").html(formatted);
	$body.find(".hsaEligibleExpensesSlider.sliderTextInput").val(formatted);
};

appStage.switchTaxViewToAccountTypeForPlan = function switchTaxViewToAccountTypeForPlan(planId) {
	_trace("switchTaxViewToAccountTypeForPlan");
	if (!appData.features.taxCalculatorEnabled) {
		_trace("switchTaxViewToAccountTypeForPlan: skipping rest as taxCalculatorEnabled is false");
		return;
	}
	let config = appEngine.configuration;
	appDispatch.onAppWillSwitchTaxViewAccountType(appData.taxCalc.fsaeAccountTypeId);
	// Update the saved values.
	appData.taxCalc.fsaeSelectedPlanId = planId;
	appData.taxCalc.fsaeAccountTypeId = config.plans[planId].fsaeAccountTypeId;
	if (!isNullOrUndefined(appData.taxCalc.fsaeAccountTypeId) && appData.taxCalc.fsaeAccountTypeId.length > 0) {
		// Update the tax view's title to match, and make sure the tax area is made visible if it should be.
		$body.find("#taxCalcHeadline").html(getText("txt_taxCalcHeadline_" + appData.taxCalc.fsaeAccountTypeId));
		$body.find("#taxCalcSourcePlanName").html(getDescription(config.plans[planId]));
	} else {
		$taxCalcSection.hide();
	}
	appDispatch.onAppDidSwitchTaxViewAccountType(appData.taxCalc.fsaeAccountTypeId);
};

appStage.taxFilingStatusChanged = function taxFilingStatusChanged(firstCall) {
	let oldTaxFilingStatus = appData.taxCalc.taxFilingStatus, newTaxFilingStatus = $taxFilingStatusSelect.val(),
		$spouseAnnualIncomeSlider = $body.find(".spouseAnnualIncomeSlider .slider");
	_trace("taxFilingStatusChanged{0}: old: {1}, new: {2}", firstCall ? " [first call]" : "",
		oldTaxFilingStatus, newTaxFilingStatus);
	$body.find(".taxFilingStatusSelect.print .value").html($taxFilingStatusSelect.find("option:selected").text());
	if (newTaxFilingStatus !== oldTaxFilingStatus || firstCall) {
		// enable spouse annual income slider only for marriedFilingJoint; disable otherwise
		if (newTaxFilingStatus === "marriedFilingJoint") {
			// Switching to marriedFilingJoint from something else
			$spouseAnnualIncomeSlider.slider({ disabled: false });
			$body.find(".spouseAnnualIncomeSliderText").removeClass("disabled");
			if (!firstCall) { appData.taxCalc.spouseAnnualIncome = appData.taxCalc.spouseAnnualIncomePreserved; }
			$spouseAnnualIncomeSlider.slider("option", "value", appData.taxCalc.spouseAnnualIncome);
			let formatted = formatDollar(appData.taxCalc.spouseAnnualIncome);
			$body.find(".spouseAnnualIncomeSlider.print .value").html(formatted);
			$body.find(".spouseAnnualIncomeSlider.sliderTextInput").val(formatted).prop("disabled", false).removeClass("disabled");
		} else {
			// Switching to something else from marriedFilingJoint
			$spouseAnnualIncomeSlider.slider({ disabled: true });
			$body.find(".spouseAnnualIncomeSliderText").addClass("disabled");
			appData.taxCalc.spouseAnnualIncomePreserved = appData.taxCalc.spouseAnnualIncome;
			appData.taxCalc.spouseAnnualIncome = 0;
			$spouseAnnualIncomeSlider.slider("option", "value", appData.taxCalc.spouseAnnualIncome);
			// Override default $0 label with N/A
			let txt_NA = getText("txt_NA");
			$body.find(".spouseAnnualIncomeSlider.print .value").html(txt_NA);
			$body.find(".spouseAnnualIncomeSlider.sliderTextInput").val(txt_NA).prop("disabled", true).addClass("disabled");
		}
		appData.taxCalc.taxFilingStatus = newTaxFilingStatus;
		appTaxChart.requestChartUpdate("appStage.taxFilingStatusChanged");
	}
};

appStage.taxNumDependentsChanged = function taxNumDependentsChanged(firstCall) {
	let oldTaxNumDependentsStr = appData.taxCalc.taxNumDependentsStr, newTaxNumDependentsStr = $taxNumDependentsSelect.val();
	_trace("taxNumDependentsChanged{0}: old: {1}, new: {2}", firstCall ? " [first call]" : "",
		oldTaxNumDependentsStr, newTaxNumDependentsStr);
	$body.find(".taxNumDependentsSelect.print .value").html($taxNumDependentsSelect.find("option:selected").text());
	appData.taxCalc.taxNumDependentsStr = newTaxNumDependentsStr;
	appTaxChart.requestChartUpdate("appStage.taxNumDependentsChanged");
};

// endregion Tax calculator

_trace("module() returning");
return appStage;
});
