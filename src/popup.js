chrome.runtime.sendMessage({ message: 'get_summary' }, handleResponse);

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
        summaryElement.classList.add('show');

        // Check if there's any data to display
        if (response.data && response.data.trim() !== '') {
            summaryElement.innerText = response.data;
        } else {
            summaryElement.innerText = 'No summary available.';
        }
    }
}
