let scrapeZillow = document.getElementById("startextractdata");
scrapeZillow.addEventListener("click", async () => {
    // Get current active Tab
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })

    // Execute script to parse data
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeDataFromPage,
    });
})

function exportDataToCSV() {
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

// function to scrape Data
function scrapeDataFromPage() {
    var container = document.getElementById('search-page-list-container');

    function smoothScrollToEnd(currentScrollPosition, stepSize, callback) {
        if (currentScrollPosition < container.scrollHeight) {
            container.scrollTop = currentScrollPosition;
            setTimeout(() => smoothScrollToEnd(currentScrollPosition + stepSize, stepSize, callback), 100);
        } else {
            setTimeout(() => {
                container.scrollTop = 0;
                callback();
            }, 1000);
        }
    }

    async function collectURLs() {
        const links = document.querySelectorAll('#search-page-list-container ul.photo-cards > li:not([data-test="search-list-first-ad"]) a.property-card-link');
        let propertiesData = [];
        // Convert NodeList to array
        const linksArray = Array.from(links);

        // Remove duplicates
        const uniqueLinks = linksArray.filter((link, index) => {
            return linksArray.findIndex(l => l.href === link.href) === index;
        });

        for (let link of uniqueLinks) {
            const url = link.href;
            console.log('url:' + url);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 3 seconds
            link.click(); // Simulate a click on the link to navigate
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for the page to load

            try {
                // Full Adress
                const buildingAdressElement = document.querySelector('h2[data-test-id="bdp-building-address"]');
                const fullAddress = buildingAdressElement ? buildingAdressElement.textContent.trim() : 'Adress not found';

                // Address
                const AdressElement = document.querySelector('h2[data-test-id="bdp-building-address"]');
                const AddressText = AdressElement ? AdressElement.textContent : 'Adress not found';
                const address = AddressText.split(',')[0];

                // Price
                const buildingPriceElement = document.querySelector('div[class="units-table__text--sectionheading"]');
                const buildingPriceElement2 = document.querySelector('span[class="unit-card__unit-price units-table__text--sectionheading"]');

                const price = buildingPriceElement ? buildingPriceElement.textContent : buildingPriceElement2.textContent;

                const elements = document.querySelectorAll('.bdp-home-dna-val');
                const bedrooms = elements[0] ? elements[0].textContent : '';
                const bathrooms = elements[1] ? elements[1].textContent : '';
                // const area = elements[2] ? elements[2].textContent : '';

                // Agennt /Listed
                const ListedBy = document.querySelector('div[class="ds-listing-agent-header"]');
                const ListedByText = ListedBy ? ListedBy.textContent : '';

                const LeasingAgent = document.querySelector('span[class="ds-listing-agent-display-name"]');
                const LeasingAgentText = LeasingAgent ? LeasingAgent.textContent : '';

                // const LeasingAgentContact = document.querySelector('li[class="ds-listing-agent-info-text"]');
                // const LeasingAgentContactText = LeasingAgentContact ? LeasingAgentContact.textContent : '';

                // City,State, County, Zip
                const breadcrumbs = document.querySelector('[data-test-id="wow-bdp-breadcrumbs"] ul').querySelectorAll('li');
                const state = breadcrumbs[0] ? breadcrumbs[0].querySelector('a').textContent : '';
                const county = breadcrumbs[1] ? breadcrumbs[1].querySelector('a').textContent : '';
                const city = breadcrumbs[2] ? breadcrumbs[2].querySelector('a').textContent : '';
                const zipcode = breadcrumbs[3] ? breadcrumbs[3].querySelector('a').textContent : '';

                // Image
                // let propertyImageElement = document.querySelector('figure.media-stream__figure img');
                // let propertyImageSrc = propertyImageElement ? propertyImageElement.src : '';

                let propertyData = {
                    fullAddress,
                    bedrooms,
                    bathrooms,
                    address,
                    city,
                    state,
                    zipcode,
                    county,
                    // area,
                    leasingAgent: LeasingAgentText,
                    listedBy: ListedByText,
                    price,
                    // leasingAgentContact: LeasingAgentContactText,
                    url,
                    // propertyImageSrc
                };

                // Add the property data to the array
                console.log('propertyData: ' + propertyData);
                propertiesData.push(propertyData);
            } catch {
                try {
                    //Full Adress
                    const buildingAdressElement = document.querySelector('h1');
                    const fullAddress = buildingAdressElement ? buildingAdressElement.textContent : 'Adress not found';

                    // Address
                    const AdressElement = document.querySelector('h1');
                    const AddressText = AdressElement ? AdressElement.textContent : 'Adress not found';
                    const address = AddressText.split(',')[0];

                    // Price
                    const buildingPriceElement = document.querySelector('span[data-testid="price"]');
                    const price = buildingPriceElement ? buildingPriceElement.textContent : '';

                    const elements = document.querySelectorAll('span[data-testid="bed-bath-item"]');
                    const bedrooms = elements[0] ? elements[0].textContent : '';
                    const bathrooms = elements[1] ? elements[1].textContent : '';
                    // const area = elements[2] ? elements[2].textContent : '';

                    // Agennt /Listed
                    const ListedBy = document.querySelector('div[class="ds-listing-agent-header"]');
                    const ListedByText = ListedBy ? ListedBy.textContent : '';

                    const LeasingAgent = document.querySelector('span[class="ds-listing-agent-display-name"]');
                    const LeasingAgentText = LeasingAgent ? LeasingAgent.textContent : '';

                    // const LeasingAgentContact = document.querySelector('li[class="ds-listing-agent-info-text"]');
                    // const LeasingAgentContactText = LeasingAgentContact ? LeasingAgentContact.textContent : '';

                    // City,State, County, Zip
                    const breadcrumbs = document.querySelector('ul[class="ds-breadcrumbs"]').querySelectorAll('li');
                    const state = breadcrumbs[0] ? breadcrumbs[0].querySelector('a').textContent : '';
                    const county = breadcrumbs[1] ? breadcrumbs[1].querySelector('a').textContent : '';
                    const city = breadcrumbs[2] ? breadcrumbs[2].querySelector('a').textContent : '';
                    const zipcode = breadcrumbs[3] ? breadcrumbs[3].querySelector('a').textContent : '';

                    // Image
                    // let propertyImageElement = document.querySelector('div[data-testid="side-by-side-component"]').querySelector('ul').querySelector('li img');
                    // let propertyImageSrc = propertyImageElement ? propertyImageElement.src : '';

                    let propertyData = {
                        fullAddress,
                        bedrooms,
                        bathrooms,
                        address,
                        city,
                        state,
                        zipcode,
                        county,
                        // area,
                        leasingAgent: LeasingAgentText,
                        listedBy: ListedByText,
                        // leasingAgentContact: LeasingAgentContactText,
                        price,
                        url,
                        // propertyImageSrc
                    };

                    // Add the property data to the array
                    console.log('propertyData2: ' + propertyData);
                    propertiesData.push(propertyData);
                } catch (error) {
                    console.log('Error112 ' + error);
                }
            }
            // Go back to the previous page
            // try {
            //     setTimeout(function() {
            //         window.history.back();
            //     }, 2000); // 2000 milliseconds = 3 seconds
            // } catch {
            //     console.log('stuckkkkkkkkkkkkkk');
            window.history.back();
            // console.clear();
            // }
        }

        // After all properties are collected, save the array to chrome.storage.local
        chrome.storage.local.get('propertiesData', function (result) {
            let currentData = result.propertiesData || []; // Get current data or set to empty array if none

            // Filter out any new items that have a URL already present in currentData
            let newDataToAdd = propertiesData.filter(newItem =>
                !currentData.some(existingItem => existingItem.url === newItem.url)
            );

            // Combine the existing data with the new, filtered data
            let updatedData = currentData.concat(newDataToAdd);

            // Set the updated data back into storage
            chrome.storage.local.set({ 'propertiesData': updatedData }, function () {
                console.log('Properties data updated in local storage, duplicates skipped.');
            });
        });

        // Check if there is a next button
        const nextButton = document.querySelector('a[rel="next"]');
        if (nextButton) {
            nextButton.click(); // Click on the next button
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for the page to load
            scrapeDataFromPage(); // Call the scraping function recursively
        } else {
            chrome.runtime.sendMessage({ action: "scrapingDone" }, response => {
                if (chrome.runtime.lastError) {
                    console.error(`Message send failed: ${chrome.runtime.lastError.message}`);
                }
            });
        }
    }

    smoothScrollToEnd(0, 100, collectURLs);
}

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