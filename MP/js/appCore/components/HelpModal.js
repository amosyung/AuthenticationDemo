//-------------------------------------------------------------------------------------------------
// HelpModal.js
//
// Copyright (C) 2022 Mercer LLC, All Rights Reserved.
//

define(["jquery", "trace", "Vue", "Vuex"],
/**
 * @param {object} $
 * @param {object} trace
 * @returns {object}
 */
function module($, trace) {
	"use strict";

	let _trace = trace.categoryWriteLineMaker("components");
	_trace("HelpModal module() called");

	/**
	 * @name HelpModal
	 * @type {{
	 *   name: string
	 *   template: string
	 *   props: string[]
	 * }}
	 */
	let helpModal = {
		name: "help-modal",

		// The help-modal component is used in both the wizard and the full tool and so its template is
		// contained in the templates section of home.htm. Search there for "help-modal template".
		template: $("body").find(".help-modal.template").clone().removeClass("template")[0].outerHTML,

		props: [
			"title",
			"modalId",
			"extraClasses",
			"titleFaIconClasses",
			"hideHeader",
			"hidePrint",
			"hideClose"
		]
	};

	_trace("HelpModal module() returning");
	return helpModal;
});
