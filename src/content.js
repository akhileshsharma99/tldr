chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'update_body') {
        // When the 'update_body' message is received, send a new 'body' message
        const bodyContent = document.body.innerText;
        chrome.runtime.sendMessage({ message: 'body', data: bodyContent });
    }
});

// Send the initial 'body' message when the script first runs
const bodyContent = document.body.innerText;
chrome.runtime.sendMessage({ message: 'body', data: bodyContent });
