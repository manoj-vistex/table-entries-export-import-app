sap.ui.define([

    "sap/ui/base/Object",

    "sap/ui/model/Filter",

    "sap/ui/model/FilterOperator",

    "sap/m/Token",

    "sap/m/SearchField",

    "sap/m/Input",

    "sap/m/Label",

    "sap/m/Text",

    "sap/ui/table/Table",

    "sap/ui/table/Column",

    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",

    "sap/ui/comp/filterbar/FilterBar",

    "sap/ui/comp/filterbar/FilterGroupItem",

    "sap/m/HBox",

    "sap/m/VBox"

], function (

    BaseObject,

    Filter,

    FilterOperator,

    Token,

    SearchField,

    Input,

    Label,

    Text,

    Table,

    Column,

    ValueHelpDialog,

    FilterBar,

    FilterGroupItem,
    HBox,
    
    VBox

) {

    "use strict";


    return BaseObject.extend(

        "bteexpimp.ext.controller.valuehelp.TableName",

        {

            constructor: function (
                oController
            ) {

                BaseObject.call(
                    this
                );


                this._oController =
                    oController;
            },


            // =====================================================
            // VIEW
            // =====================================================

            _getView: function () {

                return this
                    ._oController
                    .base
                    .getView();
            },


            // =====================================================
            // OPEN VALUE HELP
            // =====================================================

            open: function () {

                const oView =
                    this._getView();


                const oMultiInput =
                    oView.byId(
                        "tableNamesInput"
                    );


                if (
                    !this
                        ._oTableNameDialog
                ) {

                    this
                        ._createDialog();
                }


                // -------------------------------------------------
                // Reset search and filters
                // -------------------------------------------------

                this
                    ._oTableNameSearch
                    .setValue("");


                this
                    ._oTableNameFilter
                    .setValue("");


                this
                    ._oTableDescriptionFilter
                    .setValue("");


                this
                    ._applyFilters();


                // =================================================
                // PRESERVE EXISTING TOKENS
                // =================================================

                const aExistingTokens =
                    oMultiInput
                        .getTokens()
                        .map(

                            function (oToken) {

                                return new Token({

                                    key:
                                        oToken.getKey(),

                                    text:
                                        oToken.getText()
                                });
                            }
                        );


                this
                    ._oTableNameDialog
                    .setTokens(
                        aExistingTokens
                    );


                this
                    ._oTableNameDialog
                    .open();
            },


            // =====================================================
            // CREATE VALUE HELP
            // =====================================================
            
            _createDialog: function () {

                const oView =
                    this._getView();


                // =================================================
                // BASIC SEARCH
                // =================================================

                this._oTableNameSearch =
                    new SearchField({

                        width:
                            "48rem",

                        placeholder:
                            "Search",

                        search:
                            () => {

                                this
                                    ._applyFilters();
                            }
                    });


                // =================================================
                // FILTER FIELDS
                // =================================================

                this._oTableNameFilter =
                    new Input({

                        width:
                            "100%"
                    });


                this._oTableDescriptionFilter =
                    new Input({

                        width:
                            "100%"
                    });


                // =================================================
                // FILTER BAR
                // =================================================

                const oFilterBar =
                    new FilterBar({

                        advancedMode:
                            true,

                        expandAdvancedArea:
                            true,

                        filterBarExpanded:
                            true,

                        showGoOnFB:
                            true,

                        showClearOnFB:
                            false,

                        showRestoreOnFB:
                            false,

                        filterContainerWidth:
                            "36rem",

                        search:
                            () => {

                                this
                                    ._applyFilters();
                            }
                    });


                oFilterBar.setBasicSearch(
                    this
                        ._oTableNameSearch
                );


                // -------------------------------------------------
                // Table Name filter
                // -------------------------------------------------

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName:
                            "General",

                        name:
                            "TableName",

                        label:
                            "Table Name",

                        visibleInFilterBar:
                            true,

                        visibleInAdvancedArea:
                            true,

                        control:
                            this
                                ._oTableNameFilter
                    })
                );


                // -------------------------------------------------
                // Description filter
                // -------------------------------------------------

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName:
                            "General",

                        name:
                            "Description",

                        label:
                            "Description",

                        visibleInFilterBar:
                            true,

                        visibleInAdvancedArea:
                            true,

                        control:
                            this
                                ._oTableDescriptionFilter
                    })
                );


                // =================================================
                // RESULT TABLE
                // =================================================

                const oTable =
                    new Table({

                        visibleRowCount:
                            10,

                        selectionMode:
                            "MultiToggle",

                        selectionBehavior:
                            "RowOnly",

                        width:
                            "100%"
                    });


                // -------------------------------------------------
                // Table Name column
                // -------------------------------------------------

                oTable.addColumn(

                    new Column({

                        width:
                            "18rem",

                        label:
                            new Label({

                                text:
                                    "Table Name"
                            }),

                        template:
                            new Text({

                                text:
                                    "{tabnm}"
                            })
                    })
                );


                // -------------------------------------------------
                // Description column
                // -------------------------------------------------

                oTable.addColumn(

                    new Column({

                        width:
                            "32rem",

                        label:
                            new Label({

                                text:
                                    "Description"
                            }),

                        template:
                            new Text({

                                text:
                                    "{descr}"
                            })
                    })
                );


                // -------------------------------------------------
                // OData binding
                // -------------------------------------------------

                oTable.bindRows({

                    path:
                        "/TableNameVH",

                    events: {

                        dataReceived:
                            () => {

                                if (
                                    this
                                        ._oTableNameDialog
                                ) {

                                    this
                                        ._oTableNameDialog
                                        .update();
                                }
                            }
                    }
                });


                this._oTableNameTable =
                    oTable;


                // =================================================
                // VALUE HELP DIALOG
                // =================================================

                this._oTableNameDialog =
                    new ValueHelpDialog({

                        title:
                            "Table Name",

                        key:
                            "tabnm",

                        descriptionKey:
                            "descr",

                        supportMultiselect:
                            true,

                        supportRanges:
                            false,


                        // -----------------------------------------
                        // OK
                        // -----------------------------------------

                        ok:
                            (oEvent) => {

                                const oMultiInput =
                                    this
                                        ._getView()
                                        .byId(
                                            "tableNamesInput"
                                        );


                                const aTokens =
                                    oEvent
                                        .getParameter(
                                            "tokens"
                                        ) || [];


                                oMultiInput
                                    .destroyTokens();


                                aTokens.forEach(

                                    function (oToken) {

                                        const sTableName =
                                            oToken
                                                .getKey();


                                        oMultiInput.addToken(

                                            new Token({

                                                key:
                                                    sTableName,

                                                text:
                                                    sTableName
                                            })
                                        );
                                    }
                                );


                                this
                                    ._oTableNameDialog
                                    .close();
                            },


                        // -----------------------------------------
                        // CANCEL
                        // -----------------------------------------

                        cancel:
                            () => {

                                this
                                    ._oTableNameDialog
                                    .close();
                            }
                    });


                this
                    ._oTableNameDialog
                    .setFilterBar(
                        oFilterBar
                    );


                this
                    ._oTableNameDialog
                    .setTable(
                        oTable
                    );


                oView.addDependent(
                    this
                        ._oTableNameDialog
                );
            },
            
            // =====================================================
            // APPLY FILTERS
            // =====================================================

            _applyFilters: function () {

                const aFilters =
                    [];


                // -------------------------------------------------
                // Basic Search
                //
                // tabnm OR descr
                // -------------------------------------------------

                const sSearch =
                    this
                        ._oTableNameSearch
                        .getValue()
                        .trim();


                if (sSearch) {

                    aFilters.push(

                        new Filter({

                            filters: [

                                new Filter(
                                    "tabnm",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "descr",
                                    FilterOperator.Contains,
                                    sSearch
                                )
                            ],

                            and:
                                false
                        })
                    );
                }


                // -------------------------------------------------
                // Table Name
                // -------------------------------------------------

                const sTableName =
                    this
                        ._oTableNameFilter
                        .getValue()
                        .trim();


                if (sTableName) {

                    aFilters.push(

                        new Filter(
                            "tabnm",
                            FilterOperator.Contains,
                            sTableName
                        )
                    );
                }


                // -------------------------------------------------
                // Description
                // -------------------------------------------------

                const sDescription =
                    this
                        ._oTableDescriptionFilter
                        .getValue()
                        .trim();


                if (sDescription) {

                    aFilters.push(

                        new Filter(
                            "descr",
                            FilterOperator.Contains,
                            sDescription
                        )
                    );
                }


                // -------------------------------------------------
                // Apply
                // -------------------------------------------------

                const oBinding =
                    this
                        ._oTableNameTable
                        .getBinding(
                            "rows"
                        );


                if (oBinding) {

                    oBinding.filter(
                        aFilters
                    );
                }
            }

        }
    );
});