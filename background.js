chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "scrapingDone") {
        try {
            exportDataToCSV();
            console.log('Data export complete');
            showDownloadCompleteNotification();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }
});

function showDownloadCompleteNotification() {
    chrome.notifications.create('', {
      type: 'basic',  // Required: Defines the style of the notification
      title: 'Download Complete',  // Required: The title of the notification
      message: 'All data has been successfully downloaded.',  // Required: Main notification content
      iconUrl: 'images.png'  // Optional: Path to the notification icon
    }, function(notificationId) {
      // Callback function to handle the notification ID or errors
      if (chrome.runtime.lastError) {
          console.error('Notification failed: ', chrome.runtime.lastError);
      } else {
          console.log('Notification shown with ID:', notificationId);
      }
    });
  }

  function exportDataToCSV() {
    chrome.storage.local.get('propertiesData', function(result) {
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