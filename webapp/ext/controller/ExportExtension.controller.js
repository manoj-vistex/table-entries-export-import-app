sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/m/MessageBox",
    "bteexpimp/ext/controller/valuehelp/TransportRequest",
    "bteexpimp/ext/controller/valuehelp/TableName"
], function (
    ControllerExtension,
    Fragment,
    JSONModel,
    Token,
    MessageBox,
    TransportRequestValueHelp,
    TableNameValueHelp
) {
    "use strict";


    // ---------------------------------------------------------
    // OData information
    // ---------------------------------------------------------

    const SERVICE_NAMESPACE =
        "com.sap.gateway.srvd.vta.bte_expimp.v0001";

    const ENTITY_SET =
        "ExportImportLog";

    const ACTION_NAME =
        "export";


    return ControllerExtension.extend(
        "bteexpimp.ext.controller.ExportExtension",
        {

            // =====================================================
            // OPEN EXPORT DIALOG
            // =====================================================

            onExportPress: async function () {

                const oView =
                    this.base.getView();


                // Fresh model each time Export is opened
                const oExportModel =
                    new JSONModel({
                        description: "",
                        exportBy: "R",
                        transportRequest: "",
                        packageName: ""
                    });


                oView.setModel(
                    oExportModel,
                    "export"
                );


                // Load dialog only once
                if (!this._oExportDialog) {

                    this._oExportDialog =
                        await Fragment.load({
                            id: oView.getId(),
                            name:
                                "bteexpimp.ext.fragment.ExportDialog",
                            controller: this
                        });


                    oView.addDependent(
                        this._oExportDialog
                    );
                }


                // Clear previously entered table tokens
                const oMultiInput =
                    oView.byId(
                        "tableNamesInput"
                    );


                if (oMultiInput) {

                    oMultiInput.removeAllTokens();

                    oMultiInput.setValue("");
                }


                this._oExportDialog.open();
            },


            // =====================================================
            // MANUAL TABLE NAME ENTRY
            // =====================================================

            onTableSubmit: function (oEvent) {

                const oMultiInput =
                    oEvent.getSource();


                const sValue =
                    oEvent.getParameter("value") ||
                    oMultiInput.getValue();


                this._addTableTokens(
                    oMultiInput,
                    sValue
                );


                oMultiInput.setValue("");
            },


            // =====================================================
            // ADD TABLE TOKENS
            // =====================================================

            _addTableTokens: function (
                oMultiInput,
                sValue
            ) {

                if (!sValue) {
                    return;
                }


                /*
                 * Supports:
                 *
                 * TAB1
                 * TAB1;TAB2
                 * TAB1,TAB2
                 * TAB1 TAB2
                 */
                const aEnteredTables =
                    sValue
                        .split(/[;,\s]+/)
                        .map(function (sTableName) {

                            return sTableName
                                .trim()
                                .toUpperCase();
                        })
                        .filter(Boolean);


                const oExistingTables =
                    new Set(
                        oMultiInput
                            .getTokens()
                            .map(function (oToken) {

                                return oToken
                                    .getKey()
                                    .toUpperCase();
                            })
                    );


                aEnteredTables.forEach(
                    function (sTableName) {

                        if (
                            oExistingTables.has(
                                sTableName
                            )
                        ) {
                            return;
                        }


                        oMultiInput.addToken(
                            new Token({
                                key: sTableName,
                                text: sTableName
                            })
                        );


                        oExistingTables.add(
                            sTableName
                        );
                    }
                );
            },


            // =====================================================
            // EXPORT
            // =====================================================

            onExportConfirm: async function () {

                const oView =
                    this.base.getView();


                const oExportModel =
                    oView.getModel(
                        "export"
                    );


                const oData =
                    oExportModel.getData();


                const oMultiInput =
                    oView.byId(
                        "tableNamesInput"
                    );


                // -------------------------------------------------
                // Convert pending table value to token
                // -------------------------------------------------

                if (
                    oData.exportBy === "T" &&
                    oMultiInput
                ) {

                    const sPendingValue =
                        oMultiInput
                            .getValue()
                            .trim();


                    if (sPendingValue) {

                        this._addTableTokens(
                            oMultiInput,
                            sPendingValue
                        );


                        oMultiInput.setValue("");
                    }
                }


                // -------------------------------------------------
                // Collect table names
                // -------------------------------------------------

                const aTableNames =
                    oMultiInput
                        ? oMultiInput
                            .getTokens()
                            .map(function (oToken) {

                                return oToken.getKey();
                            })
                        : [];


                // -------------------------------------------------
                // Validation
                // -------------------------------------------------

                if (
                    !this._hasValue(
                        oData.description
                    )
                ) {

                    MessageBox.error(
                        "Enter Export Description"
                    );

                    return;
                }


                if (
                    !this._hasValue(
                        oData.exportBy
                    )
                ) {

                    MessageBox.error(
                        "Select Export By"
                    );

                    return;
                }


                if (
                    oData.exportBy === "R" &&
                    !this._hasValue(
                        oData.transportRequest
                    )
                ) {

                    MessageBox.error(
                        "Enter Transport Request"
                    );

                    return;
                }


                if (
                    oData.exportBy === "P" &&
                    !this._hasValue(
                        oData.packageName
                    )
                ) {

                    MessageBox.error(
                        "Enter Package"
                    );

                    return;
                }


                if (
                    oData.exportBy === "T" &&
                    aTableNames.length === 0
                ) {

                    MessageBox.error(
                        "Enter at least one Table Name"
                    );

                    return;
                }


                // -------------------------------------------------
                // TAB1;TAB2;TAB3
                // -------------------------------------------------

                const sTableNames =
                    aTableNames.join(";");


                this._oExportDialog.close();


                const oEditFlow =
                    this.base
                        .getExtensionAPI()
                        .getEditFlow();


                try {

                    await oEditFlow.securedExecution(

                        () =>
                            this._invokeExportAction({

                                description:
                                    oData.description || "",

                                exportBy:
                                    oData.exportBy,

                                transportRequest:
                                    oData.exportBy === "R"
                                        ? oData.transportRequest || ""
                                        : "",

                                packageName:
                                    oData.exportBy === "P"
                                        ? oData.packageName || ""
                                        : "",

                                tabname:
                                    oData.exportBy === "T"
                                        ? sTableNames
                                        : ""
                            }),

                        {
                            busy: {
                                check: true,
                                set: true
                            }
                        }
                    );

                } catch (oError) {

                    MessageBox.error(
                        this._getErrorMessage(
                            oError
                        )
                    );
                }
            },


            // =====================================================
            // RAP EXPORT ACTION
            // =====================================================

            _invokeExportAction: async function (
                oParameters
            ) {

                const oModel =
                    this.base
                        .getView()
                        .getModel();


                const sActionPath =
                    "/" +
                    ENTITY_SET +
                    "/" +
                    SERVICE_NAMESPACE +
                    "." +
                    ACTION_NAME +
                    "(...)";


                const oActionBinding =
                    oModel.bindContext(
                        sActionPath
                    );


                oActionBinding.setParameter(
                    "descr",
                    oParameters.description
                );


                oActionBinding.setParameter(
                    "expby",
                    oParameters.exportBy
                );


                oActionBinding.setParameter(
                    "trnum",
                    oParameters.transportRequest
                );


                oActionBinding.setParameter(
                    "packg",
                    oParameters.packageName
                );


                oActionBinding.setParameter(
                    "tabnm",
                    oParameters.tabname
                );


                await oActionBinding.invoke();


                oModel.refresh();
            },


            // =====================================================
            // CANCEL EXPORT
            // =====================================================

            onExportCancel: function () {

                if (this._oExportDialog) {

                    this._oExportDialog.close();
                }
            },


            // =====================================================
            // GENERAL HELPERS
            // =====================================================

            _hasValue: function (vValue) {

                return Boolean(
                    vValue &&
                    String(vValue).trim()
                );
            },


            _getErrorMessage: function (
                oError
            ) {

                if (!oError) {
                    return "Export failed";
                }


                if (oError.message) {
                    return oError.message;
                }


                return "Export failed";
            },


            onTransportRequestValueHelp: function () {

                if (!this._oTransportRequestValueHelp) {

                    this._oTransportRequestValueHelp =
                        new TransportRequestValueHelp(
                            this
                        );
                }

                this
                    ._oTransportRequestValueHelp
                    .open();
            },

            onTableNameValueHelp: function () {

                if (!this._oTableNameValueHelp) {

                    this._oTableNameValueHelp =
                        new TableNameValueHelp(
                            this
                        );
                }

                this
                    ._oTableNameValueHelp
                    .open();
            },
        }
    );
});