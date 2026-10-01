sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheExportImportLogList.iSeeThisPage();
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Action");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Status");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Package");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Transport Request");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Table Name");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Created By");
            Then.onTheExportImportLogList.onFilterBar().iCheckFilterField("Created On");
            Then.onTheExportImportLogList.onTable().iCheckColumns(6, {"Description":{"header":"Description"},"Action":{"header":"Action"},"ExportBy":{"header":"Export by"},"Status":{"header":"Status"},"CreatedBy":{"header":"Created By"},"CreatedOn":{"header":"Created On"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheExportImportLogList.onFilterBar().iExecuteSearch();
            
            Then.onTheExportImportLogList.onTable().iCheckRows();

            When.onTheExportImportLogList.onTable().iPressRow(0);
            Then.onTheExportImportLogObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});