import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

let summary = null;
let isSummaryReady = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === 'body') {
        chrome.storage.local.get(['api_key'], async function (result) {
            if (!result.api_key) {
                summary = '';
                return
            }
            summary = null;
            isSummaryReady = false;
            console.log('Processing...');
            const bodyContent = request.data;
            const model = new OpenAI({
                temperature: 0,
                openAIApiKey: result.api_key
            });
            const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const docs = await textSplitter.createDocuments([bodyContent]);

            // This convenience function creates a document chain prompted to summarize a set of documents.
            const chain = loadSummarizationChain(model, { type: "stuff" });

            summary = await chain.call({
                input_documents: docs,
            })
                .then((res) => {
                    console.log(res.text.trim());
                    return res.text.trim();
                })
                .catch((e) => {
                    console.log(e);
                    return '';
                });

            isSummaryReady = true;
        });
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


// Listen for URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // If the URL has changed, ask the content script to send a new 'body' message
        chrome.tabs.sendMessage(tabId, { message: 'update_body' });
    }
});
