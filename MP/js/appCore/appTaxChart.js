//-------------------------------------------------------------------------------------------------
// appTaxChart.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Contains logic to create the FSAE chart, using Highcharts.
//

define(["jquery", "trace", "utility", "appDispatch", "appData", "appEngine", "appCharts", "highcharts/highcharts"],
/**
 * @param {object} $
 * @param {object} trace
 * @param {object} utility
 * @param {AppDispatch} appDispatch
 * @param {AppData} appData
 * @param {AppEngine} appEngine
 * @param {AppCharts} appCharts
 * @param {object} highcharts
 * @returns {object}
 */
function module($, trace, utility, appDispatch, appData, appEngine, appCharts, highcharts) {
"use strict";

/**
 * @name AppTaxChart
 * @type {{
 *   fsaeChart: object
 *   fsaeChartInitialized: boolean
 *   fsaeAllSeries: object[]
 *   fsaeSeriesMap: object.<string, object>
 *   initializeAsync: Function
 *   applicationIsReady: Function
 *   maybeReflowChart: Function
 *   requestChartUpdate: Function
 *   initializeFsaeChart: Function
 *   fsaeChartUpdate: Function
 * }}
 */
let appTaxChart = {};
let _trace = trace.categoryWriteLineMaker("appTaxChart");
_trace("module() called");

let tick = function tick() { if (window && window.mpce && typeof window.mpce.tick === "function") { window.mpce.tick("appTaxChart"); } }; tick();

let $body = $("body"), getText, _updateChartImpl, _applicationIsReady = false, _updateMillisecondsDelay, _lastUpdate = 0, _reqCount = 0,
	_chartUpdateTimeoutId, $renderToElement, $taxChartTableDiv, _tooltipHtmlCache = {};

let formatDollar = utility.formatDollar, isNullOrUndefined = utility.isNullOrUndefined, strFmt = utility.stringFormat;

/** @type Highcharts.Chart */ appTaxChart.fsaeChart = null;
appTaxChart.fsaeChartInitialized = false;
appTaxChart.fsaeAllSeries = [];
appTaxChart.fsaeSeriesMap = {};

appTaxChart.initializeAsync = function initializeAsync(params) {
	_trace("initializeAsync");

	return new Promise(function executor(resolve) {
		setTimeout(function runInitializeAsync() {
			_trace("initializeAsync runInitializeAsync()");
			tick();

			let config = appEngine.configuration;
			_updateMillisecondsDelay = appCharts.determineUpdateMillisecondsDelay();
			getText = utility.getAppStringMaker(config.appStrings);
			$taxChartTableDiv = $body.find(".taxChartTableDiv");

			resolve();
		}, params.delayMsec || 0);
	});
};

appTaxChart.applicationIsReady = function applicationIsReady() {
	// To be called once the rest of the application is ready for appTaxChart to
	// start running calculations and rendering the charts.
	_trace("applicationIsReady");
	_applicationIsReady = true;
	if ($renderToElement && $renderToElement.is(":visible")) {
		appTaxChart.maybeReflowChart();
		appTaxChart.requestChartUpdate("appTaxChart.applicationIsReady", true); // doNotWait
	} // else when user elects to show it, it will be updated
};

appTaxChart.maybeReflowChart = function maybeReflowChart() {
	if (appTaxChart.fsaeChartInitialized) {
		let changedSomething = appCharts.maybeAdjustLegends([appTaxChart.fsaeChart], appEngine.configuration.fsaeChartDefaults);
		appTaxChart.fsaeChart.reflow();
		if (changedSomething) { appTaxChart.requestChartUpdate("appTaxChart.maybeReflowChart"); }
	}
};

appTaxChart.requestChartUpdate = function requestChartUpdate(callerId, doNotWait) {
	// If the application is ready and the request is immediate, update right away. Otherwise,
	// capture all requests in a buffer and execute with a delay, because updating the results
	// and charts is an expensive operation.
	_trace("requestChartUpdate by {0}", callerId);

	if (!_applicationIsReady) {
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
	appData.fsaeCalculateArgs = appData.features.taxCalculatorEnabled ? appEngine.gatherFsaeCalculateArgs(appData) : null;
	appData.fsaeEngineResults = appData.fsaeCalculateArgs ? appEngine.fsaeCalculate(appData.fsaeCalculateArgs) : null;
	appData.fsaeEngineResults && appTaxChart.fsaeChartUpdate();
};

appTaxChart.initializeFsaeChart = function initializeFsaeChart(callerId) {
	_trace("initializeFsaeChart: callerId: {0}", callerId);

	let columnNames = [], fsaeChartConfig, map = appTaxChart.fsaeSeriesMap, config = appEngine.configuration;

	if (!isNullOrUndefined(appTaxChart.fsaeChart)) {
		let elementId = $body.find(appTaxChart.fsaeChart.renderTo).attr("id");
		_trace("initializeFsaeChart is destroying previous Highcharts FSAE chart instance on element #{0}", elementId);
		appTaxChart.fsaeChart.destroy();
	}
	appTaxChart.fsaeChart = null;
	appTaxChart.fsaeChartInitialized = false;

	// Get the name for each column in the chart; some overridden later in fsaeChartUpdate().
	columnNames.push(getText("txt_fsaeChartColumn_TotalMedicalCosts"));
	columnNames.push(getText("txt_fsaeChartColumn_Default_SuggestedAnnualCont"));
	columnNames.push(getText("txt_fsaeChartColumn_PotentialTaxSavings"));

	// Create the individual chart series.
	map.totalMedicalCostSeries = { name: getText("txt_fsaeChartSeries_TotalMedicalCosts"), data: [], showInLegend: true };
	map.suggLimitedPurposeContSeries = { name: getText("txt_fsaeChartSeries_SuggLimitedPurposeCont"), data: [], showInLegend: false };
	map.suggRegularAccountContSeries = { name: getText("txt_fsaeChartSeries_SuggRegularAccountCont"), data: [], showInLegend: false };
	map.potentialIncomeTaxSavingsSeries = { name: getText("txt_fsaeChartSeries_PotentialIncomeTaxSavings"), data: [], showInLegend: true };
	map.potentialFicaTaxSavingsSeries = { name: getText("txt_fsaeChartSeries_PotentialFicaTaxSavings"), data: [], showInLegend: true };
	appTaxChart.fsaeAllSeries = [map.totalMedicalCostSeries, map.suggLimitedPurposeContSeries, map.suggRegularAccountContSeries,
		map.potentialIncomeTaxSavingsSeries, map.potentialFicaTaxSavingsSeries];

	// Create the HighCharts chart configuration object. In order for chart style to be customized
	// per client without having to modify this core code, we attempt to read defaults from config,
	// and fill in the values required by the application.

	$renderToElement = $body.find(".taxChart:not(.notInUse)");
	if ($renderToElement.length > 0) {
		let renderToElementId = $renderToElement.attr("id");
		_trace("initializeFsaeChart is setting up FSAE chart on element #{0}", renderToElementId);
		$renderToElement.empty();
		fsaeChartConfig = config.fsaeChartDefaults || {};
		fsaeChartConfig.title = fsaeChartConfig.title || {};
		fsaeChartConfig.title.text = fsaeChartConfig.title.text || "";
		fsaeChartConfig.chart = fsaeChartConfig.chart || {};
		fsaeChartConfig.chart.animation = false;
		fsaeChartConfig.chart.renderTo = renderToElementId;
		fsaeChartConfig.chart.type = "column";
		fsaeChartConfig.xAxis = fsaeChartConfig.xAxis || {};
		fsaeChartConfig.xAxis.categories = columnNames;
		// The tax chart's configuration is usually configured as a clone of the MPCE chart's configuration. If the configured value for
		// the yAxis happens to be an array, then for the tax chart, use only the last object in that array. (The first yAxis configured
		// for the MPCE when it is an array is for the worst case costs columns, which isn't the appearance we want for the tax chart.)
		if (Array.isArray(fsaeChartConfig.yAxis)) {
			fsaeChartConfig.yAxis = fsaeChartConfig.yAxis.pop();
		}
		fsaeChartConfig.yAxis = fsaeChartConfig.yAxis || {};
		fsaeChartConfig.yAxis.title = fsaeChartConfig.yAxis.title || {};
		fsaeChartConfig.yAxis.title.text = fsaeChartConfig.yAxis.title.text || "";
		fsaeChartConfig.yAxis.labels = fsaeChartConfig.yAxis.labels || {};
		fsaeChartConfig.yAxis.labels.formatter = function yAxisLabelsFormatter() { return formatDollar(this.value); };
		fsaeChartConfig.yAxis.min = 0;
		fsaeChartConfig.yAxis.minRange = 0.1; // workaround which makes Y axis get drawn at chart bottom even when empty
		fsaeChartConfig.yAxis.stackLabels = fsaeChartConfig.yAxis.stackLabels || { enabled: true };
		fsaeChartConfig.yAxis.stackLabels.formatter = function yAxisStackLabelsFormatter() { return formatDollar(this.total); };
		fsaeChartConfig.tooltip = fsaeChartConfig.tooltip || {};
		fsaeChartConfig.tooltip.formatter = function tooltipFormatter() {
			let result, cacheKey = strFmt("{0}", this.point.seriesId);
			if (cacheKey in _tooltipHtmlCache) {
				result = _tooltipHtmlCache[cacheKey];
			} else {
				let point = {
					value: this.y,
					seriesId: this.point.seriesId,
					seriesName: this.series.name
				};
				result = _tooltipHtmlCache[cacheKey] = appDispatch.onFsaeChartNeedsTooltipHtml(point);
			}
			return result;
		};
		fsaeChartConfig.plotOptions = fsaeChartConfig.plotOptions || {};
		fsaeChartConfig.plotOptions.series = fsaeChartConfig.plotOptions.series || {};
		fsaeChartConfig.plotOptions.series.events = { legendItemClick: function legendItemClick() { return false; } };
		fsaeChartConfig.plotOptions.column = fsaeChartConfig.plotOptions.column || {};
		fsaeChartConfig.plotOptions.column.stacking = "normal";
		fsaeChartConfig.series = appTaxChart.fsaeAllSeries;

		appTaxChart.fsaeChart = new highcharts.Chart(fsaeChartConfig);
		appTaxChart.fsaeChartInitialized = true;

		// Re-assign refs to each series back to the series map; Highcharts replaced w/own initialized objects.
		map.totalMedicalCostSeries = appTaxChart.fsaeChart.series[0];
		map.suggLimitedPurposeContSeries = appTaxChart.fsaeChart.series[1];
		map.suggRegularAccountContSeries = appTaxChart.fsaeChart.series[2];
		map.potentialIncomeTaxSavingsSeries = appTaxChart.fsaeChart.series[3];
		map.potentialFicaTaxSavingsSeries = appTaxChart.fsaeChart.series[4];
	}
};

appTaxChart.fsaeChartUpdate = function fsaeChartUpdate() {
	_trace("fsaeChartUpdate");

	appDispatch.onFsaeChartWillUpdate();

	let results = appData.fsaeEngineResults;
	let showLimitedPurpose = results.accountTypeId.includes("+");
	let regularSavingsSeriesName = getText(strFmt("txt_fsaeChartSeries_{0}_SuggRegularAccountCont", results.accountTypeId));
	let limitedPurposeSeriesName = getText(strFmt("txt_fsaeChartSeries_{0}_SuggLimitedPurposeCont", results.accountTypeId));

	let makeValue = function makeValue(seriesId) { return { y: results[seriesId], value: results[seriesId], seriesId: seriesId }; };
	let zero = makeValue("zeroSeries", 0);

	if (appTaxChart.fsaeChartInitialized) {
		appTaxChart.fsaeSeriesMap.totalMedicalCostSeries.setData([makeValue("totalCosts"), zero, zero], false);
		appTaxChart.fsaeSeriesMap.suggLimitedPurposeContSeries.setData(
			[zero, makeValue("suggestedLimitedPurposeContribution"), zero], false);
		appTaxChart.fsaeSeriesMap.suggRegularAccountContSeries.setData([zero, makeValue("suggestedContribution"), zero], false);
		appTaxChart.fsaeSeriesMap.potentialIncomeTaxSavingsSeries.setData([zero, zero, makeValue("federalIncomeTaxSavings")], false);
		appTaxChart.fsaeSeriesMap.potentialFicaTaxSavingsSeries.setData([zero, zero, makeValue("ficaTaxSavings")], false);

		// If accountTypeId contains "+" (e.g. as in "HSA+LPFSA" or "HSA+LPHCSA") then show series for LP contributions, else hide it.
		appTaxChart.fsaeSeriesMap.suggLimitedPurposeContSeries.update({ showInLegend: showLimitedPurpose }, false);
		appTaxChart.fsaeSeriesMap.suggLimitedPurposeContSeries[showLimitedPurpose ? "show" : "hide"]();

		// Update middle column name accordingly
		appTaxChart.fsaeChart.xAxis[0].categories[1] = getText(
			strFmt("txt_fsaeChartColumn_{0}_SuggestedAnnualCont", results.accountTypeId));

		// Update the names for the contribution series based on the account type
		appTaxChart.fsaeSeriesMap.suggRegularAccountContSeries.update({ name: regularSavingsSeriesName, showInLegend: true }, false);
		if (showLimitedPurpose) {
			appTaxChart.fsaeSeriesMap.suggLimitedPurposeContSeries.update({ name: limitedPurposeSeriesName }, false);
		}
		appTaxChart.fsaeChart.redraw();

	} else {
		$taxChartTableDiv.removeClass("printOnly");
	}

	// Generate the print table
	let out = strFmt("<table class='taxChartTable printTableFormat {0}'><tr class='headerRow'>", results.accountTypeId.replace("+", "_"));
	out += strFmt("<th class='resultName totalCosts'>{0}</th>", getText("txt_fsaeChartSeries_TotalMedicalCosts"));
	out += strFmt("<th class='resultName regularSavingsCont'>{0}</th>", regularSavingsSeriesName);
	if (showLimitedPurpose) {
		out += strFmt("<th class='resultName limitedPurposeCont'>{0}</th>", limitedPurposeSeriesName);
	}
	out += strFmt("<th class='resultName federalIncomeTaxSavings'>{0}</th>", getText("txt_fsaeChartSeries_PotentialIncomeTaxSavings"));
	out += strFmt("<th class='resultName ficaTaxSavings'>{0}</th>", getText("txt_fsaeChartSeries_PotentialFicaTaxSavings"));
	out += "</tr><tr class='regularRow'>";
	out += strFmt("<td class='resultValue totalCosts'>{0}</td>", formatDollar(results.totalCosts));
	out += strFmt("<td class='resultValue regularSavingsCont'>{0}</td>", formatDollar(results.suggestedContribution));
	if (showLimitedPurpose) {
		out += strFmt("<td class='resultValue limitedPurposeCont'>{0}</td>", formatDollar(results.suggestedLimitedPurposeContribution));
	}
	out += strFmt("<td class='resultValue federalIncomeTaxSavings'>{0}</td>", formatDollar(results.federalIncomeTaxSavings));
	out += strFmt("<td class='resultValue ficaTaxSavings'>{0}</td>", formatDollar(results.ficaTaxSavings));
	out += "</tr></table>";

	$taxChartTableDiv.html(out);

	appDispatch.onFsaeChartDidUpdate();
};

_trace("module() returning");
return appTaxChart;
});
