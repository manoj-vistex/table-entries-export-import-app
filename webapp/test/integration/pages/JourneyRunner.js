sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"bteexpimp/test/integration/pages/ExportImportLogList",
	"bteexpimp/test/integration/pages/ExportImportLogObjectPage",
	"bteexpimp/test/integration/pages/MessageObjectPage"
], function (JourneyRunner, ExportImportLogList, ExportImportLogObjectPage, MessageObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('bteexpimp') + '/test/flp.html#app-preview',
        pages: {
			onTheExportImportLogList: ExportImportLogList,
			onTheExportImportLogObjectPage: ExportImportLogObjectPage,
			onTheMessageObjectPage: MessageObjectPage
        },
        async: true
    });

    return runner;
});

