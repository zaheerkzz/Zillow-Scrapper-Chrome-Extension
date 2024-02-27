chrome.storage.local.get('propertiesData', function(result) {
    if (result.propertiesData) {
        const tableBody = document.getElementById('properties-body');
        result.propertiesData.forEach(property => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${property.fullAddress}</td>
                <td>${property.bedrooms}</td>
                <td>${property.bathrooms}</td>
                <td>${property.address}</td>
                <td>${property.city}</td>
                <td>${property.state}</td>
                <td>${property.zipcode}</td>
                <td>${property.county}</td>
                <td>${property.leasingAgent}</td>
                <td>${property.listedBy}</td>
                <td>${property.price}</td>
                <td><a href="${property.url}">Link</a></td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        console.log('No properties data found in local storage.');
    }
});
