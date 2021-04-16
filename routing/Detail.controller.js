sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox) {
		"use strict";

		return Controller.extend("sap.training.odata.controller.Detail", {
			onInit: function () {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.getRoute("Detail").attachPatternMatched(function(oEvent){
                        console.log(oEvent.getParameter("arguments").flightpath)
                }.bind(this), this);
            },
		});
	});
