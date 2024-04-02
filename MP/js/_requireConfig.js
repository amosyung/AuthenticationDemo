//-------------------------------------------------------------------------------------------------
// _requireConfig.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//
// Configuration for RequireJS, defining the script modules for the app, their paths, etc. This
// file is considered client-specific because the count and names of subconfig files mentioned
// in the client-specific configs section may vary by client. The rest is application core.
//

require.config({

	baseUrl: "./js/",

	waitSeconds: 90, // increase script load timeout from default of 7 seconds

	paths: {

		// Client-specific configs and logic at root of "js/"
		// n.b. _requireConfig.js (this) also client-specific.
		mainConfig:			"mainConfig",
		mpceConfigGroup1:	"mpceConfig-group1",
		fsaeConfig:			"fsaeConfig",
		clientCustom:		"clientCustom",
		wizardConfigGuideMe:	"wizardConfigGuideMe",
		wizardConfigPersonas:	"wizardConfigPersonas",

		// ========== In theory, you shouldn't need to touch anything below this line ==========

		// Application core modules in "js/appCore/".
		appAnalytics:		"appCore/appAnalytics",
		appCharts:			"appCore/appCharts",
		appData:			"appCore/appData",
		appDefault:			"appCore/appDefault",
		appDispatch:		"appCore/appDispatch",
		appEngine:			"appCore/appEngine",
		appMain:			"appCore/appMain",
		appStage:			"appCore/appStage",
		appTaxChart:		"appCore/appTaxChart",
		appText:			"appCore/appText",
		appValidation:		"appCore/appValidation",
		appWizard:			"appCore/appWizard",

		// MPCE/FSAE engine core modules in "js/engineCore/".
		fsaeEngine:			"engineCore/fsaeEngine",
		fsaeValidation:		"engineCore/fsaeValidation",
		mpceEngine:			"engineCore/mpceEngine",
		mpceValidation:		"engineCore/mpceValidation",
		trace:				"engineCore/trace",
		utility:			"engineCore/utility",
		ValidationBase:		"engineCore/ValidationBase",

		// Third-party vendor libraries in "js/vendor/".
		bootstrap:			"vendor/bootstrap.bundle.min",
		corejs:				"vendor/core.min",
		"highcharts/highcharts":	"vendor/highcharts.min",
		jquery:				"vendor/jquery.min",
		jqueryUI:			"vendor/jquery-ui.min",
		LZString:			"vendor/lz-string.min",
		touchPunch:			"vendor/jquery.ui.touch-punch.min",
		Vue:				"vendor/vue.global.min",
		Vuex:				"vendor/vuex.global.min"
	},

	shim: {
		// Declare dependencies for modules that aren't define()-aware.
		touchPunch: { deps: ["jquery", "jqueryUI"] },
		Vuex: { deps: ["Vue"] }
	}
});
