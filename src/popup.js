// Load the stored API key, or null if there's no stored key
chrome.storage.local.get(['api_key'], function (result) {
    if (!result.api_key) {
        // If there's no stored API key, show the input box
        document.getElementById('api-key-container').classList.remove('hide');
        document.getElementById('reset-api-key-button').classList.add('hide');

    } else {
        // If there's a stored API key, proceed with getting the summary and show the reset button
        document.getElementById('api-key-container').classList.add('hide');
        document.getElementById('reset-api-key-button').classList.remove('hide');
        chrome.runtime.sendMessage({ message: 'update_body' });
        requestSummary();
    }
});

function requestSummary() {
    // Remove the old summary if any
    document.getElementById('summary-result').innerText = '';
    document.getElementById('loader').classList.remove('hide');
    document.getElementById('summary-result').classList.add('hide');

    // Request the summary
    chrome.runtime.sendMessage({ message: 'get_summary' }, handleResponse);
}

// Handle the "Set API Key" button click
document.getElementById('api-key-button').addEventListener('click', () => {
    let apiKey = document.getElementById('api-key-input').value;
    // Store the API key
    chrome.storage.local.set({ api_key: apiKey }, function () {
        document.getElementById('api-key-container').classList.add('hide');
        document.getElementById('reset-api-key-button').classList.remove('hide');

        // Proceed with getting the summary
        chrome.runtime.sendMessage({ message: 'update_body' });
        requestSummary();
    });
});

// Handle the "Reset API Key" button click
document.getElementById('reset-api-key-button').addEventListener('click', () => {
    // Remove the stored API key
    chrome.storage.local.remove('api_key', function () {
        document.getElementById('api-key-container').classList.remove('hide');
        document.getElementById('reset-api-key-button').classList.add('hide');
        document.getElementById('loader').classList.add('hide');
        document.getElementById('summary-result').classList.add('hide');
    });
});

function handleResponse(response) {
    if (response.status === 'processing') {
        // If the summary isn't ready yet, we can display a message or retry after some delay
        setTimeout(() => {
            chrome.runtime.sendMessage({ message: 'get_summary' }, handleResponse);
        }, 1000); // Retry after 1 second
    } else {
        document.getElementById('loader').classList.remove('show');
        document.getElementById('loader').classList.add('hide');

        let summaryElement = document.getElementById('summary-result');
        summaryElement.classList.remove('hide');

        // Check if there's any data to display
        if (response.data && response.data.trim() !== '') {
            summaryElement.innerText = response.data;
        } else {
            summaryElement.innerText = 'No summary available.';
        }
    }
}
