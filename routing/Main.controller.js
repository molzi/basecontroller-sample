sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox) {
		"use strict";

		return Controller.extend("sap.training.odata.controller.Main", {
			onInit: function () {

            },
            
            onFlightChange: function(oEvent){
                // let sPath = oEvent.getParameter("rowContext").getPath();
                // console.log(sPath);

                // let oTable = this.getView().byId("idBookingTable");

                // oTable.bindElement(sPath);
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("Detail", {
                    flightpath: "1"
                }, false);
            },

            onCreateBooking: function(oEvent){
                let sCarrid = oEvent.getSource().data("Carrid"),
                    sConnid = oEvent.getSource().data("Connid"),
                    sFldate = oEvent.getSource().data("Fldate");

                let oBookingData = {
                    Carrid: sCarrid,
                    Connid: sConnid,
                    Fldate: sFldate,
                    Customid: '154',
                    Passname: 'Maximilian Olzinger',
                    Counter: "1"
                };

                let oModel = this.getView().getModel();

                oModel.create("/UX_C_Booking_TP", oBookingData, {
                    success: function(oData, response){
                        MessageBox.success("Booking created with booking number " + oData.Bookid);
                        let oBookingTable = this.getView().byId("idBookingTable"),
                            oSorter = new sap.ui.model.Sorter("OrderDate", true);

                        oBookingTable.getBinding("rows").sort([oSorter]);
                    }.bind(this),
                    error: function(oError){
                        let oMsg = JSON.parse(oError.responseText);
                        MessageBox.error(oMsg.error.innererror.errordetails[0].message, {
                            detail: oMsg
                        });
                    }.bind(this)
                });

            },

            onCancelBooking: function(oEvent){
                let sCarrid = oEvent.getSource().data("Carrid"),
                    sBookid = oEvent.getSource().data("Bookid");

                let oModel = this.getView().getModel();
                this.getView().setBusy(true);

                oModel.callFunction("/CancelBooking", {
                    method: "POST",
                    urlParameters: {
                        Carrid: sCarrid,
                        Bookid: sBookid
                    },
                    success: function(){
                        this.getView().setBusy(false);
                    }.bind(this),
                    error: function(oError){
                        this.getView().setBusy(false);
                        let oMsg = JSON.parse(oError.responseText);
                        MessageBox.error(oMsg.error.innererror.errordetails[0].message, {
                            detail: oMsg
                        });
                    }.bind(this)
                });
            }
		});
	});
