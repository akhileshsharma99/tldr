import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

let summary = null;
let isSummaryReady = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'body') {
        summary = null;
        isSummaryReady = false;
        console.log('Processing...');
        const bodyContent = request.data;
        const model = new OpenAI({
            temperature: 0,
            openAIApiKey: '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'
        });
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const docs = await textSplitter.createDocuments([bodyContent]);

        // This convenience function creates a document chain prompted to summarize a set of documents.
        const chain = loadSummarizationChain(model, { type: "stuff" });

        const res = await chain.call({
            input_documents: docs,
        });

        summary = res.text.trim(); // replace this line with the actual summarization process 
        console.log(summary);
        isSummaryReady = true;
    }

    if (request.message === 'get_summary') {
        if (isSummaryReady) {
            // If the summary is ready, send it to the popup script
            sendResponse({ data: summary });
        } else {
            // If the summary isn't ready yet, let the popup script know
            sendResponse({ status: 'processing' });
        }
    }
});
