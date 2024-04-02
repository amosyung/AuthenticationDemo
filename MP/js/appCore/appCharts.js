//-------------------------------------------------------------------------------------------------
// appCharts.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains logic to create the MPCE and FSAE charts, using Highcharts.
//

define(["jquery", "trace", "utility", "appDispatch", "appData", "appEngine", "fsaeConfig", "highcharts/highcharts"],
/**
 * @param {object} $
 * @param {object} trace
 * @param {object} utility
 * @param {AppDispatch} appDispatch
 * @param {AppData} appData
 * @param {AppEngine} appEngine
 * @param {FsaeConfig} fsaeConfig
 * @param {object} highcharts
 * @returns {object}
 */
function module($, trace, utility, appDispatch, appData, appEngine, fsaeConfig, highcharts) {
"use strict";

/**
 * @name AppCharts
 * @type {{
 *   mpceCharts: object
 *   mpceConfigSeriesOrder: string[]
 *   mpceConfigSeries: object.<string, MpceChartSingleSeries>
 *   mpceStageSeriesArray: object
 *   mpceStageSeriesMap: object.<string, object>
 *   initializeAsync: Function
 *   applicationIsReady: Function
 *   startSubconfigChange: Function
 *   endSubconfigChange: Function
 *	maybeAdjustLegends: Function
 *   maybeReflowChart: Function
 *   determineUpdateMillisecondsDelay: Function
 *   requestChartUpdate: Function
 *   touchLastUpdate: Function
 *   initializeMpceCharts: Function
 *   destroyChartsInElement: Function
 *   mpceChartUpdate: Function
 *   mpceChartUpdateImpl: Function
 * }}
 */
let appCharts = {};
let _trace = trace.categoryWriteLineMaker("appCharts");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appCharts"); } }; tick();

let $body = $("body"), getText, _updateChartImpl, _applicationIsReady = false, _subconfigChangeInProgress = false, _updateMillisecondsDelay,
	_lastUpdate = 0, _reqCount = 0, _chartUpdateTimeoutId, $mainChartTableDiv, _tooltipHtmlCache = {};

let formatDollar = utility.formatDollar, isNullOrUndefined = utility.isNullOrUndefined, strFmt = utility.stringFormat;

appCharts.mpceCharts = {};

appCharts.mpceConfigSeriesOrder = null; // i.e. from mainConfig.mpceChartSeriesOrder
appCharts.mpceConfigSeries = null; // i.e. from mainConfig.mpceChartSeries

appCharts.mpceStageSeriesArray = null; // internal series used by mpceChartUpdateImpl; not directly for Highcharts.
appCharts.mpceStageSeriesMap = null; // ... and a map to each object by id.

appCharts.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let config = appEngine.configuration;
			_updateMillisecondsDelay = appCharts.determineUpdateMillisecondsDelay();
			getText = utility.getAppStringMaker(config.appStrings);
			appCharts.mpceConfigSeries = config.mpceChartSeries;
			appCharts.mpceConfigSeriesOrder = config.mpceChartSeriesOrder;
			$mainChartTableDiv = $body.find(".mainChartTableDiv");

			resolve();
		}, params.delayMsec || 0);
	});
};

appCharts.applicationIsReady = function applicationIsReady() {
	// To be called once the rest of the application is ready for appCharts to
	// start running calculations and rendering the charts.
	_trace("applicationIsReady");
	_applicationIsReady = true;
	appCharts.maybeReflowChart();
	appCharts.requestChartUpdate("appCharts.applicationIsReady", true); // doNotWait
};

appCharts.startSubconfigChange = function startSubconfigChange() {
	_trace("startSubconfigChange");
	_subconfigChangeInProgress = true;
};

appCharts.endSubconfigChange = function endSubconfigChange() {
	_trace("endSubconfigChange");
	_subconfigChangeInProgress = false;
};

appCharts.maybeAdjustLegends = function maybeAdjustLegends(chartsArray, chartDefaultsObj) {
	// Potentially adjust the legend width to be narrower than the configured value
	let legendMaximumWidth = chartDefaultsObj.legend.width || 320;
	let defaultLegendBorderWidth = chartDefaultsObj.legend.borderWidth || 0;
	let changedSomething = false;
	Object.values(chartsArray).forEach(function each(highchartsChart) {
		let legend = highchartsChart.options.legend, chartWidth = highchartsChart.chartWidth;
		let newBorderWidth = (chartWidth < 336) ? 0 : defaultLegendBorderWidth;
		if (legend.borderWidth !== newBorderWidth) {
			legend.borderWidth = newBorderWidth;
			changedSomething = true;
		}
		let constrainedNewWidth = Math.min(legendMaximumWidth, chartWidth - (newBorderWidth > 0 ? 10 : 0));
		if (legend.width !== constrainedNewWidth || legend.itemWidth !== constrainedNewWidth) {
			legend.width = legend.itemWidth = constrainedNewWidth;
			changedSomething = true;
		}
	});
	return changedSomething;
};

appCharts.maybeReflowChart = function maybeReflowChart() {
	let changedSomething = appCharts.maybeAdjustLegends(appCharts.mpceCharts, appEngine.configuration.mpceChartDefaults);
	Object.values(appCharts.mpceCharts).forEach(function each(highchartsChart) { highchartsChart.reflow(); });
	if (changedSomething) { appCharts.requestChartUpdate("appCharts.maybeReflowChart"); }
};

appCharts.determineUpdateMillisecondsDelay = function determineUpdateMillisecondsDelay() {
	// noinspection JSUnresolvedVariable
	let isLegacyEdge = $body.hasClass("isLegacyEdge"), updateDelay = trace.isOn() ? 400 : 200;
	if (isLegacyEdge) {
		// If running in the legacy version of Edge, increase the update delay. The JavaScript calculations take
		// considerably longer to run legacy Edge vs. any of Chrome, Firefox, Safari, or new Edge, and without
		// increasing this delay, slider thumb response is sluggish with live slider updating enabled.
		updateDelay *= 3;
	}
	_trace("determineUpdateMillisecondsDelay returning {0} msec", updateDelay);
	return updateDelay;
};

appCharts.requestChartUpdate = function requestChartUpdate(callerId, doNotWait) {
	// If the application is ready and the request is immediate, update right away. Otherwise,
	// capture all requests in a buffer and execute with a delay, because updating the results
	// and charts is an expensive operation.
	_trace("requestChartUpdate by {0}", callerId);

	if (!_applicationIsReady || _subconfigChangeInProgress) {
		_reqCount += 1;
		return;
	}

	if (doNotWait) {
		_updateChartImpl("doNotWait");
	} else {
		// Unless the time elapsed since last chart update was too long, queue up the request.
		let elapsed = new Date().getTime() - _lastUpdate;
		if (_reqCount > 0 && elapsed > _updateMillisecondsDelay) {
			_updateChartImpl("since >" + _updateMillisecondsDelay + "msec");
		} else {
			_reqCount += 1;
			_chartUpdateTimeoutId && clearTimeout(_chartUpdateTimeoutId);
			_chartUpdateTimeoutId = setTimeout(function requestChartUpdateTimeout() {
				if (_reqCount > 0) {
					_updateChartImpl("requestChartUpdateTimeout()");
				}
			}, _updateMillisecondsDelay);
		}
	}
};

appCharts.touchLastUpdate = function touchLastUpdate() {
	// Primarily for use by sliders. Sets _lastUpdate to the current time, so that the next update occurs
	// at least _updateMillisecondsDelay milliseconds later, and the thumb seems more initially responsive.
	_lastUpdate = new Date().getTime();
};

_updateChartImpl = function updateChartImpl(reason) {
	// Performs the actual chart update. n.b. updateChartImpl() isn't exported on appCharts for performance
	// reasons; it should never be called except indirectly through appCharts.requestChartUpdate() above.
	_trace("===== updateChartImpl updating now; reason: {0} =====", reason);
	if (_chartUpdateTimeoutId) {
		clearTimeout(_chartUpdateTimeoutId);
		_chartUpdateTimeoutId = null;
	}
	_lastUpdate = new Date().getTime();
	_reqCount = 0;
	_tooltipHtmlCache = {};
	appData.mpceCalculateArgs = appEngine.gatherMpceCalculateArgs(appData);
	let mpceEngineResults = appEngine.mpceCalculate(appData.mpceCalculateArgs);
	appData.setMpceEngineResults(mpceEngineResults);
	appCharts.mpceChartUpdate();
};

appCharts.initializeMpceCharts = function initializeMpceCharts(callerId, preserveExisting) {
	_trace("initializeMpceCharts: callerId: {0}", callerId);

	let config = appEngine.configuration, i, totalNumSeries, bOffset, stageSeriesArray, stageSeriesMap;

	if (!preserveExisting) {
		Object.keys(appCharts.mpceCharts).forEach(function each(chartId) {
			_trace("initializeMpceCharts is destroying a previous Highcharts MPCE chart instance on element #{0}", chartId);
			let highchartsChart = appCharts.mpceCharts[chartId];
			highchartsChart && highchartsChart.destroy();
			delete appCharts.mpceCharts[chartId];
		});
		appCharts.mpceCharts = {};
	} else {
		_trace("initializeMpceCharts preserving existing charts");
	}

	// Allocate a space for each column name in the chart. Actual names will be set by mpceChartUpdate().
	let planIdsForRegion = ("regions" in config) ? config.regions[appData.personal.regionId].plans : [];
	let emptyColumnNames = [];
	for (i = 0; i < planIdsForRegion.length; i += 1) {
		emptyColumnNames.push("");
	}

	let makeStageSeries = function makeStageSeries(seriesId, cfg, isAltStack) {
		let isPrimaryStack = !(isAltStack || false);
		let redundantLegend = !isPrimaryStack &&
			(isNullOrUndefined(cfg.alternateDescription) || cfg.alternateDescription === cfg.description) &&
			(isNullOrUndefined(cfg.alternateColor) || cfg.alternateColor === cfg.color);

		let stageSeries = {
			id: seriesId + (isPrimaryStack ? "_A" : "_B"),
			stack: (isPrimaryStack ? "A" : "B"),
			idNoSuffix: seriesId,
			description: isPrimaryStack ? cfg.description : (cfg.alternateDescription || cfg.description),
			descriptionInPrintTable: isPrimaryStack ? (cfg.descriptionInPrintTable || cfg.description) :
				(cfg.alternateDescriptionInPrintTable || cfg.alternateDescription || cfg.description),
			color: isPrimaryStack ? cfg.color : (cfg.alternateColor || cfg.color),
			displayInChart: cfg.displayInChart || "auto",
			displayInLegend: cfg.displayInLegend || "auto",
			displayInPrintTable: cfg.displayInPrintTable || "auto",
			isPrimaryStack: isPrimaryStack,
			values: [],
			zeros: [],
			includeInPrint: false,
			isSummaryRow: false,
			inContext: false,
			hasData: false,
			resetValues: function resetValues() {
				this.values = [];
				this.zeros = [];
				this.hasData = false;
			},
			showInChart: function showInChart() {
				let result = (this.displayInChart === "never") ? false :
					!this.includeInPrint && (this.displayInChart === "always" || this.inContext);
				return result;
			},
			showInLegend: function showInLegend() {
				let result;
				switch (this.displayInLegend) {
					case "never":
						result = false;
						break;
					case "always":
						result = !this.includeInPrint && !redundantLegend && this.showInChart();
						break;
					default:
						result = !this.includeInPrint && !redundantLegend && this.showInChart() && this.hasData;
						break;
				}
				return result;
			},
			showInPrintTable: function showInPrintTable() {
				let result;
				switch (this.displayInPrintTable) {
					case "never":
						result = false;
						break;
					case "always":
						result = this.includeInPrint || this.showInChart();
						break;
					default:
						result = (this.includeInPrint || this.showInChart()) && this.hasData;
						break;
				}
				return result;
			}
		};
		return stageSeries;
	};

	// Create our internal staging set of series and our Highcharts set of series. These series have twice the elements from
	// from mainConfig.mpceChartSeries: one for the primary "A" stack and one for the alternate but seldom-used "B" stack.

	totalNumSeries = appCharts.mpceConfigSeriesOrder.length * 2;
	bOffset = appCharts.mpceConfigSeriesOrder.length;
	stageSeriesArray = appCharts.mpceStageSeriesArray = Array.apply(null, new Array(totalNumSeries));
	stageSeriesMap = appCharts.mpceStageSeriesMap = {};

	// Make the staging and Highcharts series for the primary column stacks...
	appCharts.mpceConfigSeriesOrder.forEach(function each(seriesId, ix) {
		let seriesConfig = appCharts.mpceConfigSeries[seriesId];
		// noinspection JSValidateTypes
		stageSeriesMap[seriesId + "_A"] = stageSeriesArray[ix] = makeStageSeries(seriesId, seriesConfig);
		// noinspection JSValidateTypes
		stageSeriesMap[seriesId + "_B"] = stageSeriesArray[bOffset + ix] = makeStageSeries(seriesId, seriesConfig, true);
	});

	// Create the Highcharts chart configuration object. In order for chart style to be customized
	// per client without having to modify this core code, we attempt to read defaults from config,
	// and fill in the values required by the application.

	let $renderToElements = $body.find(".mpceChart:not(.notInUse), .mpceChartNoEmployeeFunding:not(.notInUse)");
	$renderToElements.each(/* @this HTMLElement */ function each() {

		let $renderToElement = $(this), renderToElementId = $renderToElement.attr("id");
		if (renderToElementId in appCharts.mpceCharts) {
			_trace("initializeMpceCharts skipping re-initialization of preserved existing chart on element #{0}", renderToElementId);
			return;
		}
		_trace("initializeMpceCharts is setting up MPCE chart on element #{0}", renderToElementId);
		$renderToElement.empty();
		let mpceChartConfig = JSON.parse(JSON.stringify(config.mpceChartDefaults)) || {};
		mpceChartConfig.title = mpceChartConfig.title || {};
		mpceChartConfig.title.text = mpceChartConfig.title.text || "";
		mpceChartConfig.chart = mpceChartConfig.chart || {};
		mpceChartConfig.chart.animation = false;
		mpceChartConfig.chart.renderTo = renderToElementId;
		mpceChartConfig.chart.type = "column";
		mpceChartConfig.xAxis = mpceChartConfig.xAxis || {};
		mpceChartConfig.xAxis.categories = emptyColumnNames; // n.b. actual names set in mpceChartUpdate()

		// Allow for two yAxis objects to be configured, or just the main one and we'll provide defaults for the worst case costs yAxis.
		let yaWcc = {}, ya = {}, valid = false, yAxisDistinctConfigs = false;
		if (Array.isArray(mpceChartConfig.yAxis) && mpceChartConfig.yAxis.length === 2) {
			yaWcc = mpceChartConfig.yAxis[0];
			ya = mpceChartConfig.yAxis[1];
			valid = true;
			yAxisDistinctConfigs = true;
		} else if (typeof mpceChartConfig.yAxis === "object") {
			mpceChartConfig.yAxis = isNullOrUndefined(mpceChartConfig.yAxis) ? [yaWcc = {}, ya = {}] : [yaWcc = {}, ya = mpceChartConfig.yAxis];
			valid = true;
		}
		if (!valid) { throw new Error("mainConfig.mpceChartDefaults.yAxis can only be null, a single object, or else an array of 2 objects."); }

		// Defaults in common across both yAxis objects.
		yaWcc.min = ya.min = 0;
		yaWcc.max = ya.max = 20000;
		yaWcc.minRange = ya.minRange = 0.1; // workaround which makes Y axis get drawn at chart bottom even when empty
		yaWcc.startOnTick = ya.startOnTick = false;
		yaWcc.endOnTick = ya.endOnTick = false;
		// ... for the usual stacked columns.
		ya.opposite = false;
		ya.title = ya.title || {};
		ya.title.text = ya.title.text || "";
		ya.labels = ya.labels || {};
		ya.labels.formatter = function yAxisLabelsFormatter() { return formatDollar(this.value); };
		ya.stackLabels = ya.stackLabels || { enabled: true };
		ya.stackLabels.formatter = function yAxisStackLabelsFormatter() { return formatDollar(this.total); };
		// ... for the worst case costs columns.
		yaWcc.opposite = true;
		yaWcc.title = { enabled: false };
		yaWcc.labels = { enabled: false };
		yaWcc.gridLineWidth = 0;
		yaWcc.stackLabels = yaWcc.stackLabels || { enabled: true };
		yaWcc.stackLabels.y = (ya.stackLabels && ya.stackLabels.enabled) ? -23 : 0; // leaves room for stack labels for usual stacked columns
		yaWcc.stackLabels.formatter = function yAxisStackLabelsFormatter() {
			let xAxis = this.axis.chart.xAxis[0], hasPlanIds = "planIds" in xAxis;
			if (hasPlanIds && this.x < xAxis.planIds.length) {
				let planResults = appData.getMpceEngineResults().main[xAxis.planIds[this.x]];
				if (!isNullOrUndefined(planResults) && !isFinite(planResults.worstCaseEmployeeCosts)) {
					return getText("txt_WorstCaseCostsUnlimited");
				}
			}
			return formatDollar(this.total);
		};
		yaWcc.stackLabels.style = yAxisDistinctConfigs ? yaWcc.stackLabels.style :
			{ fontSize: "14px", fontWeight: "normal", color: "#EE4444", textOutline: "none", cursor: "default" };

		mpceChartConfig.tooltip = mpceChartConfig.tooltip || {};
		mpceChartConfig.tooltip.formatter = function tooltipFormatter() {
			let result, cacheKey = strFmt("{0}+{1}", this.point.planId, this.point.seriesId);
			if (cacheKey in _tooltipHtmlCache) {
				result = _tooltipHtmlCache[cacheKey];
			} else {
				let point = {
					resultsVariant: this.point.resultsVariant,
					planId: this.point.planId,
					planName: this.x,
					value: this.point.value,
					seriesId: this.point.seriesId,
					seriesName: this.series.name
				};
				result = _tooltipHtmlCache[cacheKey] = appDispatch.onMpceChartNeedsTooltipHtml(point);
			}
			return result;
		};
		mpceChartConfig.plotOptions = mpceChartConfig.plotOptions || {};
		mpceChartConfig.plotOptions.series = mpceChartConfig.plotOptions.series || {};
		mpceChartConfig.plotOptions.series.events = {};
		mpceChartConfig.plotOptions.series.events.legendItemClick = function legendItemClick() { return false; };
		mpceChartConfig.plotOptions.column = mpceChartConfig.plotOptions.column || {};
		mpceChartConfig.plotOptions.column.stacking = "normal";
		mpceChartConfig.plotOptions.column.events = {};
		mpceChartConfig.plotOptions.column.events.click = function click(event) {
			let p = event.point, planId = p.planId, seriesId = p.seriesId, resultsVariant = p.resultsVariant;
			appDispatch.onMpceChartPlanColumnClicked(planId, seriesId, resultsVariant, appData.getMpceEngineResults());
			appDispatch.updateResultOutputs();
		};
		// NOTE: While mpceChartUpdate() will create the real series, we start with a dummy series below as Highcharts
		// doesn't seem to obey certain style properties (e.g. xAxis label padding) if there are no series to begin with.
		mpceChartConfig.series = [{ name: "temporary", showInLegend: false, data: [{ y: 0 }] }];
		let highchartsChart = new highcharts.Chart(mpceChartConfig);
		appCharts.mpceCharts[renderToElementId] = highchartsChart;
	});
};

appCharts.destroyChartsInElement = function destroyChartsInElement($parent) {
	// Used by the wizard when switching back to the main tool to remove the chart instances that
	// are specific to the wizard. Doing this significantly improves performance in the main tool,
	// particularly when the user moves any of the savings account sliders.
	_trace("destroyChartsInElement: $parent element id: {0}", $parent.attr("id"));
	let $charts = $parent.find(".mpceChart:not(.notInUse), .mpceChartNoEmployeeFunding:not(.notInUse)");
	let chartIdsToDestroy = new Set(), mpceChartsRemaining = {};
	$charts.each(/* @this HTMLElement */ function jqEach() { chartIdsToDestroy.add($(this).attr("id")); });
	Object.keys(appCharts.mpceCharts).forEach(function each(chartId) {
		let highchartsChart = appCharts.mpceCharts[chartId];
		if (chartIdsToDestroy.has(chartId)) {
			_trace("destroyChartsInElement is destroying a Highcharts MPCE chart instance on element #{0}", chartId);
			highchartsChart && highchartsChart.destroy();
			delete appCharts.mpceCharts[chartId];
		} else {
			mpceChartsRemaining[chartId] = highchartsChart;
		}
	});
	appCharts.mpceCharts = mpceChartsRemaining;
};

appCharts.mpceChartUpdate = function mpceChartUpdate() {
	_trace("mpceChartUpdate");

	appDispatch.onMpceChartWillUpdate();

	let standardChartOutput = false;
	Object.keys(appCharts.mpceCharts).forEach(function each(chartId) {
		let $el = $body.find("#" + chartId), chartKind = $el.hasClass("mpceChartNoEmployeeFunding") ? "noEmployeeFunding" : "standard";
		standardChartOutput = standardChartOutput || (chartKind === "standard");
		appCharts.mpceChartUpdateImpl(appCharts.mpceCharts[chartId], chartId, chartKind);
	});

	if (!standardChartOutput) {
		// Ensure the print output is populated, even if there was no standard chart to populate.
		appCharts.mpceChartUpdateImpl(null, null, "standard");
	}

	appDispatch.onMpceChartDidUpdate();
};

appCharts.mpceChartUpdateImpl = function mpceChartUpdateImpl(highchartsChart, highchartsChartElementId, chartKind) {
	_trace("mpceChartUpdateImpl: highchartsChart: {0}, highchartsChartElementId: {1}, chartKind: {2}",
		highchartsChart ? "[passed]" : "n/a", highchartsChartElementId, chartKind);

	// noinspection JSMismatchedCollectionQueryUpdate
    let allResults = appData.getMpceEngineResults(), resultsVariant, results, showWorstCaseCosts, showTotalCosts, showEEDetails, showERDetails,
		showERSummary, columnPlanIds = [], columnPlanNames = [], columnPlanNamesTable = [], altColumnPlanIds = [], altColumnPlanNames = [],
		altColumnPlanNamesTable = [], i, config = appEngine.configuration, hasPlanWithEEAppliedHSA = false, hasPlanWithERAppliedHSA = false,
		hasPlanWithEEAppliedFSA = false, hasPlanWithERAppliedFSA = false;

	// Select which set of results is to be charted. Usually, it will be the main results, but in some contexts the
	// chart desired is one where only employer funds are to be considered applied to the cost of care.
	if (chartKind === "standard") {
		resultsVariant = "main";
		showWorstCaseCosts = appData.personal.showWorstCaseCosts;
		showTotalCosts = appData.personal.showTotalCosts;
	} else if (chartKind === "noEmployeeFunding") {
		resultsVariant = "alternate_noEmployeeFunding";
		showWorstCaseCosts = false;
		showTotalCosts = false;
	}
	results = allResults[resultsVariant];
	if (!results) { return; }

	showEEDetails = !appData.features.summarizeEmployeeCosts;
	showERDetails = showTotalCosts && !showWorstCaseCosts && !appData.features.summarizeEmployerCosts;
	showERSummary = showTotalCosts && !showWorstCaseCosts && appData.features.summarizeEmployerCosts;

	// Set the series data. Note that all series must have data for the chart, but whether a series actually appears in
	// the chart depends on the state of options. Alternate series only appear in the chart if there is a plan in the
	// result requiring them, while regular series that are toggled off are set to a zero data series in the chart; we
	// don't actually remove any regular series; we show/hide them using the actual values array, or an all-zeros array.

	let stageSeriesArray = appCharts.mpceStageSeriesArray, m = appCharts.mpceStageSeriesMap;

	// First, clear the values in the staging series.
	stageSeriesArray.forEach(function eachStageSeries(stageSeries) { stageSeries.resetValues(); });

	// Next, for each plan result add the values to the corresponding staging series.
	results.orderedPlanIds.forEach(function eachPlanId(planId) {

		// Determine for this plan whether any voluntaryFundPaid amount should go into the HSA or FSA series.
		let r = results[planId], planConfig = config.plans[r.planId], maybeDualAccountTypeId = planConfig.fsaeAccountTypeId,
			planPaidByEmployeeHSA = 0, planPaidByEmployerHSA = 0, planPaidByEmployeeFSA = 0, planPaidByEmployerFSA = 0;

		if (maybeDualAccountTypeId) {
			let accountTypeId = appEngine.getPrimaryAccountTypeId(maybeDualAccountTypeId);
			let followRulesFor = fsaeConfig.accountTypes[accountTypeId].followRulesFor;
			if (followRulesFor === "HSA") {
				hasPlanWithEEAppliedHSA = hasPlanWithEEAppliedHSA || (r.voluntaryFundPaid > 0);
				planPaidByEmployeeHSA = r.voluntaryFundPaid;
				hasPlanWithERAppliedHSA = hasPlanWithERAppliedHSA || (r.planFundAndMatchTotalPaid > 0);
				planPaidByEmployerHSA = r.planFundAndMatchTotalPaid;
			} else if (followRulesFor === "FSA") {
				hasPlanWithEEAppliedFSA = hasPlanWithEEAppliedFSA || (r.voluntaryFundPaid > 0);
				planPaidByEmployeeFSA = r.voluntaryFundPaid;
				hasPlanWithERAppliedFSA = hasPlanWithERAppliedFSA || (r.planFundAndMatchTotalPaid > 0);
				planPaidByEmployerFSA = r.planFundAndMatchTotalPaid;
			}
		}

		if (!r.alternateChartStack) {
			columnPlanIds.push(r.planId);
			columnPlanNames.push(r.descriptionChart);
			columnPlanNamesTable.push(r.descriptionTable);
		} else {
			altColumnPlanIds.push(r.planId);
			altColumnPlanNames.push(r.descriptionChart);
			altColumnPlanNamesTable.push(r.descriptionTable);
		}

		// Now push the results into the appropriate staging series.
		let t = r.alternateChartStack ? "_B" : "_A";
		let pushValue = function push(seriesId, value, arrayPropKey) {
			m[seriesId + t][arrayPropKey || "values"].push({
				y: value, value: value, seriesId: seriesId, resultsVariant: resultsVariant, planId: r.planId
			});
		};
		pushValue("outOfPocketCosts", r.totalMedicalAndDrugCostsLessFundOffset);
		pushValue("paidByPlanFund", planPaidByEmployerHSA + planPaidByEmployerFSA);
		pushValue("paidByEmployeeHSACont", planPaidByEmployeeHSA);
		pushValue("paidByEmployeeFSACont", planPaidByEmployeeFSA);
		pushValue("employerOrPlanTotalCosts", r.employerOrPlanTotalAnnualCosts);
		pushValue("employeeTotalCosts", r.employeeTotalAnnualCosts);
		pushValue("paidByEmployerOrPlanExcludingFund", r.totalEmployerOrPlanPaidExcludingFund);
		pushValue("paidByRolloverFund", r.rolloverFundPaid);
		pushValue("annualEmployerPremiums", r.employerPlanPremium);
		pushValue("employeeAdditionalServicePremiums", r.employeeAdditionalServicePremiums);
		pushValue("annualEmployeePremiums", r.totalAnnualPayrollContributions);
		pushValue("totalCosts", r.totalCosts);

		// Also potentially need distinct zero arrays for each series to be hidden in the chart.
		["outOfPocketCosts", "paidByEmployerOrPlanExcludingFund", "paidByPlanFund", "paidByRolloverFund", "paidByEmployeeHSACont",
			"paidByEmployeeFSACont", "annualEmployerPremiums", "employeeAdditionalServicePremiums", "annualEmployeePremiums",
			"employerOrPlanTotalCosts", "employeeTotalCosts", "totalCosts"].forEach(
				function eachSeriesId(seriesId) { pushValue(seriesId, 0, "zeros"); });
	});

	// Next, set the variables that help each staging series to decide whether to show in chart, legend, or print table.
	["_A", "_B"].forEach(function eachSuffix(t) {
		m["outOfPocketCosts" + t].inContext = showEEDetails;
		m["outOfPocketCosts" + t].hasData = results.hasPlanWithEENetOutOfPocketCosts;
		m["employerOrPlanTotalCosts" + t].inContext = showERSummary;
		m["employerOrPlanTotalCosts" + t].hasData = true;
		m["employerOrPlanTotalCosts" + t].isSummaryRow = true;
		m["paidByEmployerOrPlanExcludingFund" + t].inContext = showERDetails;
		m["paidByEmployerOrPlanExcludingFund" + t].hasData = results.hasPlanWithERNonFundCosts;
		m["paidByPlanFund" + t].inContext = showERDetails;
		m["paidByPlanFund" + t].hasData = (hasPlanWithERAppliedHSA || hasPlanWithERAppliedFSA);
		m["paidByRolloverFund" + t].inContext = showTotalCosts;
		m["paidByRolloverFund" + t].hasData = results.hasPlanWithAppliedRollover;
		m["paidByEmployeeHSACont" + t].inContext = showEEDetails;
		m["paidByEmployeeHSACont" + t].hasData = hasPlanWithEEAppliedHSA;
		m["paidByEmployeeFSACont" + t].inContext = showEEDetails;
		m["paidByEmployeeFSACont" + t].hasData = hasPlanWithEEAppliedFSA;
		m["annualEmployerPremiums" + t].inContext = showERDetails;
		m["annualEmployerPremiums" + t].hasData = results.hasPlanWithERPremiums;
		m["employeeAdditionalServicePremiums" + t].inContext = showEEDetails;
		m["employeeAdditionalServicePremiums" + t].hasData = results.hasPlanWithEEAdditionalServicePremiums;
		m["annualEmployeePremiums" + t].inContext = showEEDetails;
		m["annualEmployeePremiums" + t].hasData = results.hasPlanWithEEPremiums;
		m["employeeTotalCosts" + t].inContext = !showEEDetails;
		m["employeeTotalCosts" + t].hasData = true;
		m["employeeTotalCosts" + t].includeInPrint = true;
		m["employeeTotalCosts" + t].isSummaryRow = true;
		m["totalCosts" + t].inContext = showTotalCosts;
		m["totalCosts" + t].hasData = true;
		m["totalCosts" + t].includeInPrint = showTotalCosts;
		m["totalCosts" + t].isSummaryRow = true;
	});

	// Update the actual Highcharts series data and column names and force the redraw now.
	if (highchartsChart) {

		// Remove any series currently in the Highcharts chart; we'll re-add only what's needed.
		while (highchartsChart.series.length > 0) { highchartsChart.series[0].remove(false); }

		// If showWorstCaseCosts is true, build series needed for worst case costs feature and y-Axis maximum synchronization.
		let worstCaseHighestValueCharted;
		if (showWorstCaseCosts) {
			worstCaseHighestValueCharted = results.highestEmployeeTotalAnnualCosts;

			// In cases where the worst case costs are unlimited, we need to use a more reasonable value for column height, so
			// it appears taller than plans with limited costs, but not so tall that other columns appear meaningless. The value
			// used as a substitute is the higher of $12,000 and 33% more than the highest value being charted, to nearest $2000.
			let substituteValueForUnlimited = Math.max(12000,
				Math.round((Math.max(worstCaseHighestValueCharted, results.nextHighestWorstCaseEmployeeCosts) * 1.33) / 2000) * 2000);
			let wccDataA = [], wccDataB = [], wccSeriesA = {}, wccSeriesB = {}, wccSeriesConfig = config.worstCaseCostsSeries;
			results.orderedPlanIds.forEach(function eachPlanId(planId) {
				let r = results[planId], wcc = r.worstCaseEmployeeCosts, value = isFinite(wcc) ? wcc : substituteValueForUnlimited;
				(r.alternateChartStack ? wccDataB : wccDataA).push(
					{ y: value, value: value, seriesId: "worstCaseCosts", resultsVariant: resultsVariant, planId: planId });
				worstCaseHighestValueCharted = Math.max(worstCaseHighestValueCharted, value);
			});
			Object.assign(wccSeriesA, wccSeriesConfig, { yAxis: 0, data: wccDataA, animation: false });
			if (results.hasPlanWithAlternateChartStack) {
				wccSeriesA.stack = "A";
				highchartsChart.addSeries(wccSeriesA, false, false);
				Object.assign(wccSeriesB, wccSeriesConfig, { yAxis: 0, data: wccDataB, showInLegend: false, animation: false, stack: "B" });
				highchartsChart.addSeries(wccSeriesB, false, false);
			} else {
				highchartsChart.addSeries(wccSeriesA, false, false);
			}
		}

		let yAxisMaxCfg = { max: Math.ceil((worstCaseHighestValueCharted * 1.15) / 250) * 250 };
		highchartsChart.yAxis[0].update(!showWorstCaseCosts ? { max: null } : yAxisMaxCfg);
		highchartsChart.yAxis[1].update(!showWorstCaseCosts ? { max: null } : yAxisMaxCfg);

		// Add regular series to the Highcharts chart only for those staging series actually required. That is, if no plan in
		// the results has alternateChartStack = true, then only the primary stack series are added to the Highcharts chart.
		stageSeriesArray.filter(function filter(stageSeries) {
			return stageSeries.isPrimaryStack || results.hasPlanWithAlternateChartStack;
		}).forEach(function each(stageSeries) {
			let highchartSeries = /** @type Highcharts.SeriesOptionsType */ {
				yAxis: 1, // (yAxis 1 is for the regular series, and 0 for worst case costs)
				name: stageSeries.description,
				data: stageSeries.showInChart() ? stageSeries.values : stageSeries.zeros,
				color: stageSeries.color,
				showInLegend: stageSeries.showInLegend(),
				animation: false,
				paddingLeft: 20
			};
			if (results.hasPlanWithAlternateChartStack) {
				highchartSeries.stack = stageSeries.stack;
			}
			highchartsChart.addSeries(highchartSeries, false, false);
		});

		// Set the plan names, attach plan ids for each column, and redraw.
		highchartsChart.xAxis[0].planIds = [];
		for (i = 0; i < results.orderedPlanIds.length; i += 1) {
			highchartsChart.xAxis[0].categories[i] = columnPlanNames[i];
			highchartsChart.xAxis[0].planIds.push(results.orderedPlanIds[i]);
		}
		highchartsChart.redraw();
	} else {
		// There was no Highcharts chart output element; show the print-only table in the screen view instead.
		// Occasionally it is useful to disable the chart during development, yet still see the calculation outputs.
		(chartKind === "standard") && $mainChartTableDiv.removeClass("printOnly");
	}

	if (chartKind === "standard") {
		// Generate the print table(s) for the final chart results that follows the chart in the print view.
		let printTableSets = results.hasPlanWithAlternateChartStack ? ["A", "B"] : ["A"], out = "";
		printTableSets.forEach(function each(stack) {
			let pRowFunc, planIds = (stack === "A") ? columnPlanIds : altColumnPlanIds,
				planNames = (stack === "A") ? columnPlanNamesTable : altColumnPlanNamesTable;
			out += strFmt("<table class='mainChartTable printTableFormat{0}'>", results.hasPlanWithAlternateChartStack ? (" stack_" + stack) : "");
			out += "<tr class='headerRow'><th>&nbsp;</th>";
			planIds.forEach(function eachPlanId(planId, ix) { out += strFmt("<th class='planName {0}'>{1}</th>", planId, planNames[ix]); });
			// Detail (non-summary) rows first.
			stageSeriesArray.filter(function filter(s) { return (s.stack === stack) && s.showInPrintTable() && !s.isSummaryRow; }).forEach(
				pRowFunc = function eachRow(s) {
					out += strFmt("</tr><tr class='{0}{1}'><td class='resultName'>{2}</td>",
						s.idNoSuffix, s.isSummaryRow ? " summaryRow" : "", s.descriptionInPrintTable);
					s.values.forEach(function eachCell(v, ix) {
						out += strFmt("<td class='resultValue {0}'>{1}</td>", planIds[ix], formatDollar(v.value));
					});
				});
			// And then the summary rows.
			stageSeriesArray.filter(function filter(s) {
				return (s.stack === stack) && s.showInPrintTable() && s.isSummaryRow;
			}).forEach(pRowFunc);
			out += "</tr></table>";
		});
		$mainChartTableDiv.html(out);
	}
};

_trace("module() returning");
return appCharts;
});
