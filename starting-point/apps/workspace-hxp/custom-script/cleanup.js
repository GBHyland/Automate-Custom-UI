const { Configuration, DocumentApi, QueryApi } = require('@hylandsoftware/hxcs-js-client/cjs/index');
const { subDays, format } = require('date-fns');
const { getAuthToken } = require('../../../scripts/utils/get-auth-token');

// use: npx nx run workspace-hxp:cleanup [days]
(async () => {
    const basePath = process.env['APP_CONFIG_ECM_HOST'];
    const configuration = new Configuration({
        basePath,
        accessToken: await getAuthToken(),
    });

    const queryApi = new QueryApi(configuration);
    const documentApi = new DocumentApi(configuration);

    const logError = (message, error) => {
        console.error(message, {
            message: error.message,
            code: error.code,
            method: error.config.method,
            url: error.config.url,
            data: error.config.data,
            response: error.response
                ? {
                    statusText: error.response.statusText,
                    data: error.response.data,
                }
                : null,
        });
    };

    const deleteDocumentsById = async (documents) => {
        const docCount = documents.length;
        const logLimit = 100;
        const logAll = docCount <= logLimit * 2;
        const upperLimit = docCount - logLimit;

        let successCount = 0;
        let processedCount = 0;

        console.log(`🟡 Deleting found documents...`);

        for (const doc of documents) {
            processedCount++;
            try {
                await documentApi.deleteDocumentById(doc.sys_id);
                successCount++;

                // Log only first and last <logLimit> deletions
                if (logAll || processedCount <= logLimit || processedCount > upperLimit) {
                    console.log(`${processedCount}. Deleted "${doc.sys_title}"`);
                } else if (processedCount === logLimit + 1) {
                    console.log(`Deleting ${docCount - logLimit * 2} document(s) silently...`);
                }
            } catch (error) {
                logError(`❌ Failed to delete document ${processedCount} "${doc.sys_title}", id: "${doc.sys_id}":`, error);
            }
        }
        console.log(`✅ Successfully deleted ${successCount} document(s)`);
        if (successCount < processedCount) {
            console.log(`❗️ Failed to delete ${processedCount - successCount} document(s)`);
        }
    };

    const fetchDocuments = async (query) => {
        const limit = 100;
        let offset = 0;
        let allDocuments = [];
        let response;

        try {
            response = await queryApi.getDocumentsByQuery({ query, limit, offset });
        } catch (error) {
            logError('❌ Failed to get documents:', error);
            return [];
        }

        const totalCount = response.data.totalCount;
        if (totalCount === 0) {
            console.log(`✅ No documents found, skipping cleanup`);
            return [];
        }

        const pagesCount = Math.ceil(totalCount / limit);
        console.log(`Total count: ${totalCount}, pages: ${pagesCount}`);

        allDocuments = response.data.documents;
        if (pagesCount > 1) {
            console.log(`Found ${allDocuments.length} document(s) on page 1`);
        }

        for (let page = 1; page < pagesCount; page++) {
            const logPage = `page ${page + 1}`;
            offset = page * limit;
            try {
                response = await queryApi.getDocumentsByQuery({ query, limit, offset });
            } catch (error) {
                logError(`❌ Failed to fetch ${logPage}:`, error);
                continue;
            }
            const foundDocs = response.data.documents;
            console.log(`Found ${foundDocs.length} document(s) on ${logPage}`);
            allDocuments = allDocuments.concat(foundDocs);
        }

        const finalCount = allDocuments.length;
        if (finalCount < totalCount) {
            console.log(`👻 Found ${totalCount - finalCount} potential ghost document(s)`);
        }
        if (finalCount > 0) {
            console.log(`👀 Found ${finalCount} valid document(s)`);
        } else {
            console.log(`❗️ No valid documents found, skipping cleanup`);
            return [];
        }

        return allDocuments;
    };

    const days = process.argv[2];
    const beforeDate = subDays(new Date(), days);
    const formattedDate = format(beforeDate, 'yyyy-MM-dd');

    console.log(`🔍 Searching for documents created before ${formattedDate}, on ${basePath}`);

    console.log(`1️⃣ Starting with direct children of root...`);
    const queryRoot = `SELECT * FROM SysContent WHERE sys_parentId = '00000000-0000-0000-0000-000000000000' AND sys_created <= DATE '${formattedDate}'`;
    const documentsRoot = await fetchDocuments(queryRoot);
    if (documentsRoot.length > 0) await deleteDocumentsById(documentsRoot)

    const queryMore = `SELECT * FROM SysContent WHERE sys_created <= DATE '${formattedDate}'`;
    console.log(`2️⃣ Looking for the rest of documents...`);
    const documentsMore = await fetchDocuments(queryMore);
    if (documentsMore.length > 0) await deleteDocumentsById(documentsMore)

    console.log(`🧹 Cleanup completed`);
})();
