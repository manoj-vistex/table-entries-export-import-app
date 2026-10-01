sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'bteexpimp',
            componentId: 'MessageObjectPage',
            contextPath: '/ExportImportLog/_Message'
        },
        CustomPageDefinitions
    );
});