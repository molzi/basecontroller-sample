/**
 * @author Maximilian Olzinger <maximilian.olzinger@clouddna.at>
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessagePopover",
	"sap/ui/core/Fragment",
	"sap/m/MessageItem",
	"sap/ui/core/message/Message",
], function (Controller, History, Log, MessageBox, MessagePopover, _Fragment, MessageItem, Message) {
	"use strict";

	return Controller.extend("xxx.controller.BaseController", {
		_sContentDensityClass: "",

		setDirtyState: function (bState) {
			if (sap.ushell) {
				sap.ushell.Container.setDirtyFlag(bState);

				let sState = bState ? "true" : "false";
				this.logInfo("Dirty Flag set to: " + sState);
			}
			this.logWarning("Cant set Dirty Flag: Not in Launchpad Mode!");
		},

		/*
		 * @openDialog
		 * @public
		 * @param {string} sObjectName - Name of the Controller Proberty, e.g. "createDialog" when you want to use the this.createDialog Object in the inheriting Controller
		 * @param {string} sFragmentName - Name of the Fragment including the namespace.
		 * @param {function} fnAfterOpen - Function to be called after an already loaded Fragment is opened
		 * @param {function} fnAfterCreation - Function to be called after Fragment is initially loaded
		 */
		openDialog: function (sObjectName, sFragmentName, fnAfterOpen, fnAfterCreation) {
			if (!this[sObjectName]) {
				Fragment.load({
					id: this.getView().getId(),
					name: sFragmentName,
					controller: this
				}).then(function (oDialog) {
					this[sObjectName] = oDialog;
					//Set dependent
					this.getView().addDependent(this[sObjectName]);
					//Set content density
					this[sObjectName].addStyleClass(this._getContentDensityClass());

					this[sObjectName].open();
					this.logInfo("Dialog '" + sFragmentName + "' opened");
					if (fnAfterCreation) {
						fnAfterCreation();
					}
				}.bind(this));
			} else {
				this[sObjectName].open();
				this.logInfo("Dialog '" + sFragmentName + "' opened");
				if (fnAfterOpen) {
					fnAfterOpen();
				}
			}
		},

		/*
		 * @deleteODataEntry
		 * @public
		 * @param {string} sModelName - Model Name, empty string is default model
		 * @param {string} sPath - URL of REST-Client.
		 * @param {object} oParameters - Contains parameters for the message box and the odata call
		 * @param {string} [oParameters.dialogTitle] - Delete-Dialog Title.
		 * @param {string} [oParameters.dialogText] - Delete-Dialog Text.
		 * @param {string} [oParameters.urlParameters] - OData Url-Parameters
		 * @param {function} fnSuccess - OData-Success function
		 * @param {function} fnError - OData-Error function
		 */
		deleteODataEntry: function (sModelName, sPath, oParameters, fnSuccess, fnError) {
			let sTitle = "Delete",
				sText = "Do you want do delete this entry?",
				oUrlParameters = {};

			if (oParameters) {
				sTitle = oParameters.hasOwnProperty("dialogTitle") ? oParameters.dialogTitle : sTitle;
				sText = oParameters.hasOwnProperty("dialogText") ? oParameters.dialogText : sText;
				oUrlParameters = oParameters.hasOwnProperty("urlParameters") ? oParameters.urlParameters : oUrlParameters;
			}

			sModelName = sModelName === "" ? undefined : sModelName;

			MessageBox.confirm(sText, {
				title: sTitle,
				onClose: function (oAction) {
					if (oAction == MessageBox.Action.OK) {
						this.getModel(sModelName).remove(sPath, {
							urlParameters: oUrlParameters,
							success: function (oData, response) {
								fnSuccess();
								this.logInfo("Entry deleted");
							}.bind(this),
							error: function (oError) {
								fnError();
								this.logError("Entry was not deleted");
							}.bind(this)
						});
					}
				}.bind(this)
			});
		},

		getRouter: function () {
			this.setContentDensity();

			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		emptyMessageModel: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		addMessage: function (sTitle, sType, sDescription) {
			sap.ui.getCore().getMessageManager().addMessages(new Message({
				message: sTitle,
				type: sType,
				description: sDescription
			}));
		},

        onMessagePopoverPress: function (oEvent) {
			let oPopover = new MessagePopover({
				items: {
					path: "messageModel>/",
					template: new MessageItem({
						type: "{messageModel>type}",
						title: "{messageModel>message}",
						description: "{messageModel>description}"
					})
				}
			});

			this.getView().addDependent(oPopover);
			oPopover.openBy(oEvent.getSource());
		},


		removeMessage: function (sTitle) {
			let oMessageManager = sap.ui.getCore().getMessageManager(),
				oModel = oMessageManager.getMessageModel();

			oModel.getData().forEach(function (oMessage) {
				if (oMessage.message === sTitle) {
					oMessageManager.removeMessages(oMessage);
				}
			});
		},

		setContentDensity: function () {
			this.getView().addStyleClass(this._getContentDensityClass());
		},

		_getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		onNavBack: function () {
			let oPreviousHash = History.getInstance().getPreviousHash();

			if (oPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("Master", {}, true);
			}
		},

		logDebug: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.debug("DEBUG - " + sMessage);
		},

		logError: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.error("ERROR - " + sMessage);
		},

		logFatal: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.fatal("FATAL - " + sMessage);
		},

		logInfo: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.info("INFO - " + sMessage);
		},

		logTrace: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.trace("TRACE - " + sMessage);
		},

		logWarning: function (sMessage) {
			let oLogger = Log.getLogger(this.getView().getControllerName());
			oLogger.warning("WARNING - " + sMessage);
		},

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		geti18nText: function (sId, aParams) {
			let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			return oBundle.getText(sId, aParams);
		}
	});
});
