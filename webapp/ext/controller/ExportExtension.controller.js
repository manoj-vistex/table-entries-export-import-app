sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/m/MessageBox",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem"
], function (
    ControllerExtension,
    Fragment,
    JSONModel,
    Token,
    MessageBox,
    SelectDialog,
    StandardListItem
) {
    "use strict";

    // ---------------------------------------------------------
    // OData information
    // ---------------------------------------------------------

    const SERVICE_NAMESPACE =
        "com.sap.gateway.srvd.vta.bte_expimp.v0001";

    const ENTITY_SET = "ExportImportLog";

    const ACTION_NAME = "export";


    return ControllerExtension.extend(
        "bteexpimp.ext.controller.ExportExtension",
        {

            // =====================================================
            // OPEN CUSTOM EXPORT DIALOG
            // =====================================================

            onExportPress: async function () {

                const oView = this.base.getView();

                // Fresh model each time Export is opened
                const oExportModel = new JSONModel({
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
            // MULTI TABLE ENTRY
            // =====================================================

            /**
             * Called when user types a table name
             * and presses Enter.
             *
             * Also supports:
             *
             * TAB1;TAB2;TAB3
             * TAB1,TAB2,TAB3
             *
             * in one entry.
             */
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


            /**
             * Converts entered text into MultiInput tokens.
             */
            _addTableTokens: function (
                oMultiInput,
                sValue
            ) {

                if (!sValue) {
                    return;
                }


                /*
                 * Split using:
                 *
                 * ;
                 * ,
                 * whitespace
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


                // Existing token keys
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

                        // Do not create duplicates
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
            // EXPORT BUTTON INSIDE DIALOG
            // =====================================================

            onExportConfirm: async function () {

                const oView =
                    this.base.getView();

                const oExportModel =
                    oView.getModel("export");

                const oData =
                    oExportModel.getData();

                const oMultiInput =
                    oView.byId(
                        "tableNamesInput"
                    );


                // -------------------------------------------------
                // If user typed something but did NOT press Enter,
                // convert that text into a token before exporting.
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
                // Collect table names from tokens
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

                if (!oData.description) {

                    MessageBox.error(
                        "Enter Export Description"
                    );

                    return;
                }

                if (!oData.exportBy) {

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
                // Convert tokens into one RAP parameter
                //
                // TAB1
                // TAB2
                // TAB3
                //
                // becomes:
                //
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
                        () => this._invokeExportAction({
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
            // CALL RAP STATIC ACTION
            // =====================================================

            _invokeExportAction: async function (
                oParameters
            ) {

                const oView =
                    this.base.getView();

                const oModel =
                    oView.getModel();


                /*
                 * RAP static action is collection-bound.
                 *
                 * Result:
                 *
                 * /EntitySet/
                 * com.sap.gateway.srvd...
                 * .Export(...)
                 */
                const sActionPath =
                    "/" +
                    ENTITY_SET +
                    "/" +
                    SERVICE_NAMESPACE +
                    "." +
                    ACTION_NAME +
                    "(...)";


                /*
                 * Create deferred OData V4
                 * action binding.
                 */
                const oActionBinding =
                    oModel.bindContext(
                        sActionPath
                    );


                // -------------------------------------------------
                // Set RAP action parameters
                // -------------------------------------------------

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


                /*
                 * IMPORTANT
                 *
                 * This code assumes you renamed the RAP
                 * abstract entity field to:
                 *
                 * tabnames : abap.string;
                 *
                 * If your RAP field is still called:
                 *
                 * tabname
                 *
                 * change "tabnames" below to "tabname".
                 */
                oActionBinding.setParameter(
                    "tabnm",
                    oParameters.tabname
                );

                /*
                 * Actual HTTP POST occurs here.
                 *
                 * This triggers your RAP:
                 *
                 * METHOD export.
                 */
                await oActionBinding.invoke();


                /*
                 * Refresh Export/Import logs after
                 * successful export.
                 */
                oModel.refresh();
            },


            // =====================================================
            // CANCEL
            // =====================================================

            onExportCancel: function () {

                if (
                    this._oExportDialog
                ) {

                    this._oExportDialog.close();
                }
            },


            // =====================================================
            // HELPERS
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

                const oView = this.base.getView();

                if (!this._oTransportRequestDialog) {

                    this._oTransportRequestDialog =
                        new SelectDialog({
                            title: "Select Transport Request",

                            confirm: function (oEvent) {

                                const oSelectedItem =
                                    oEvent.getParameter("selectedItem");

                                if (!oSelectedItem) {
                                    return;
                                }

                                oView.getModel("export").setProperty(
                                    "/transportRequest",
                                    oSelectedItem.getTitle()
                                );
                            }
                        });

                    this._oTransportRequestDialog.bindAggregation(
                        "items",
                        {
                            path: "/TransportRequestVH",

                            template: new StandardListItem({
                                title: "{trreq}",
                                description: "{descr}"
                            })
                        }
                    );

                    oView.addDependent(
                        this._oTransportRequestDialog
                    );
                }

                this._oTransportRequestDialog.open();
            },

            onTableNameValueHelp: function () {

                const oView = this.base.getView();

                const oMultiInput =
                    oView.byId("tableNamesInput");

                if (!this._oTableNameDialog) {

                    this._oTableNameDialog =
                        new SelectDialog({

                            title: "Select Table Names",

                            multiSelect: true,

                            rememberSelections: true,

                            search: (oEvent) => {
                                this._filterValueHelpItems(
                                    oEvent,
                                    [
                                        "tabnm",
                                        "descr"
                                    ]
                                );
                            },

                            confirm: (oEvent) => {

                                const aSelectedItems =
                                    oEvent.getParameter(
                                        "selectedItems"
                                    ) || [];

                                aSelectedItems.forEach(
                                    (oItem) => {

                                        this._addTableTokens(
                                            oMultiInput,
                                            oItem.getTitle()
                                        );
                                    }
                                );
                            }
                        });

                    this._oTableNameDialog
                        .bindAggregation(
                            "items",
                            {
                                path: "/TableNameVH",

                                template:
                                    new StandardListItem({
                                        title: "{tabnm}",
                                        description: "{descr}"
                                    })
                            }
                        );

                    oView.addDependent(
                        this._oTableNameDialog
                    );
                }

                this._oTableNameDialog.open();
            },

        }
    );
});