// let scrapeZillow = document.getElementById("startextractdata");
// scrapeZillow.addEventListener("click", async () => {
//     // Get current active Tab
//     let [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     })

//     // Execute script to parse data
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: scrapeDataFromPage,
//     });
// })

let startExtractButton = document.getElementById("startextractdata");

// Add a click event listener to the button
startExtractButton.addEventListener("click", () => {
    // Send a message to the background script to start scraping
    chrome.runtime.sendMessage({ action: "startScraping" });
});

function exportDataToCSV() {
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
    chrome.storage.local.get('propertiesData', function (result) {
        if (result.propertiesData && result.propertiesData.length) {
            // Extract headers
            const headers = Object.keys(result.propertiesData[0]).join(',') + '\n';

            // Convert data to CSV format
            const rows = result.propertiesData.map(row => {
                return Object.values(row).map(value => {
                    // Handle commas, quotes, and newlines in values
                    let stringValue = (value === null || value === undefined) ? '' : value.toString();
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
                    }
                    return stringValue;
                }).join(',');
            }).join('\n');

            const csvContent = headers + rows;

            // Create a Blob and a URL for it
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "propertiesData.csv");
            document.body.appendChild(link); // Required for Firefox

            // Trigger the download
            link.click();
            document.body.removeChild(link); // Clean up
        } else {
            console.log('No data available for export');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var link = document.querySelector('.has-text-info a'); // Adjusted selector to target <a> within .has-text-info
    if (link) { // Check if the link is found
        link.addEventListener('click', function () {
            chrome.tabs.create({ url: chrome.runtime.getURL('view_data.html') }); // Open view_data.html in a new tab
        });
    } else {
        console.log('Link not found'); // Log if the link is not found
    }
});

// Attach this function to your button's click event
document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('export_data');
    if (button) {
        button.addEventListener('click', exportDataToCSV);
    } else {
        console.log('Button not found');
    }
});

// Clear DATA from chrome storage
document.addEventListener('DOMContentLoaded', function () {
    const clearButton = document.getElementById('clear_button');
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            // This clears all data stored in chrome.storage.local
            chrome.storage.local.clear(function () {
                console.log('All properties data cleared from local storage.');
            });
        });
    }
});