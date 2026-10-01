sap.ui.define([

    "sap/ui/base/Object",

    "sap/ui/model/Filter",

    "sap/ui/model/FilterOperator",

    "sap/m/SearchField",

    "sap/m/Input",

    "sap/m/Label",

    "sap/m/Text",

    "sap/ui/table/Table",

    "sap/ui/table/Column",

    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",

    "sap/ui/comp/filterbar/FilterBar",

    "sap/ui/comp/filterbar/FilterGroupItem"

], function (

    BaseObject,

    Filter,

    FilterOperator,

    SearchField,

    Input,

    Label,

    Text,

    Table,

    Column,

    ValueHelpDialog,

    FilterBar,

    FilterGroupItem

) {

    "use strict";


    return BaseObject.extend(

        "bteexpimp.ext.controller.valuehelp.TransportRequest",

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

                if (
                    !this
                        ._oTransportRequestDialog
                ) {

                    this
                        ._createDialog();
                }


                // -------------------------------------------------
                // Reset search and filters
                // -------------------------------------------------

                this
                    ._oTransportRequestSearch
                    .setValue("");


                this
                    ._oTransportRequestFilter
                    .setValue("");


                this
                    ._oTransportDescriptionFilter
                    .setValue("");


                this
                    ._applyFilters();


                this
                    ._oTransportRequestTable
                    .clearSelection();


                this
                    ._oTransportRequestDialog
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

                this._oTransportRequestSearch =
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

                this._oTransportRequestFilter =
                    new Input({

                        width:
                            "100%"
                    });


                this._oTransportDescriptionFilter =
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

                        /*
                         * Gives each advanced filter enough
                         * horizontal space.
                         */
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
                        ._oTransportRequestSearch
                );


                // -------------------------------------------------
                // Transport Request filter
                // -------------------------------------------------

                oFilterBar.addFilterGroupItem(

                    new FilterGroupItem({

                        groupName:
                            "General",

                        name:
                            "TransportRequest",

                        label:
                            "Transport Request",

                        visibleInFilterBar:
                            true,

                        visibleInAdvancedArea:
                            true,

                        control:
                            this
                                ._oTransportRequestFilter
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
                                ._oTransportDescriptionFilter
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
                            "Single",

                        selectionBehavior:
                            "RowOnly",

                        width:
                            "100%",

                        rowSelectionChange:
                            (oEvent) => {

                                const oContext =
                                    oEvent
                                        .getParameter(
                                            "rowContext"
                                        );


                                if (!oContext) {

                                    return;
                                }


                                const sTransportRequest =
                                    oContext
                                        .getProperty(
                                            "trreq"
                                        );


                                oView
                                    .getModel(
                                        "export"
                                    )
                                    .setProperty(
                                        "/transportRequest",
                                        sTransportRequest
                                    );


                                this
                                    ._oTransportRequestDialog
                                    .close();
                            }
                    });


                // -------------------------------------------------
                // Transport Request column
                // -------------------------------------------------

                oTable.addColumn(

                    new Column({

                        width:
                            "18rem",

                        label:
                            new Label({

                                text:
                                    "Transport Request"
                            }),

                        template:
                            new Text({

                                text:
                                    "{trreq}"
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
                        "/TransportRequestVH"
                });


                this._oTransportRequestTable =
                    oTable;


                // =================================================
                // VALUE HELP DIALOG
                // =================================================

                this._oTransportRequestDialog =
                    new ValueHelpDialog({

                        title:
                            "Transport Request",

                        key:
                            "trreq",

                        descriptionKey:
                            "descr",

                        supportMultiselect:
                            false,

                        supportRanges:
                            false,

                        filterMode:
                            true,

                        cancel:
                            () => {

                                this
                                    ._oTransportRequestDialog
                                    .close();
                            }
                    });


                this
                    ._oTransportRequestDialog
                    .setFilterBar(
                        oFilterBar
                    );


                this
                    ._oTransportRequestDialog
                    .setTable(
                        oTable
                    );


                oView.addDependent(
                    this
                        ._oTransportRequestDialog
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
                // trreq OR descr
                // -------------------------------------------------

                const sSearch =
                    this
                        ._oTransportRequestSearch
                        .getValue()
                        .trim();


                if (sSearch) {

                    aFilters.push(

                        new Filter({

                            filters: [

                                new Filter(
                                    "trreq",
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
                // Transport Request
                // -------------------------------------------------

                const sTransportRequest =
                    this
                        ._oTransportRequestFilter
                        .getValue()
                        .trim();


                if (sTransportRequest) {

                    aFilters.push(

                        new Filter(
                            "trreq",
                            FilterOperator.Contains,
                            sTransportRequest
                        )
                    );
                }


                // -------------------------------------------------
                // Description
                // -------------------------------------------------

                const sDescription =
                    this
                        ._oTransportDescriptionFilter
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
                        ._oTransportRequestTable
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