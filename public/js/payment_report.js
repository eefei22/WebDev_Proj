// Selecting necessary elements from the DOM
const searchInput = document.querySelector('.input_group input'); // Input field for searching
const tableRows = Array.from(document.querySelectorAll('tbody tr')); // Table rows
const tableHeadings = Array.from(document.querySelectorAll('thead th')); // Table headings
const noMatchMessage = document.querySelector('.no-match-message'); // No match message element
const originalOrder = tableRows.slice(); // Array to store the original order of table rows

// Event listener for search input field
searchInput.addEventListener('input', searchTable);

// Function to handle table search
function searchTable() {
    const searchData = searchInput.value.toLowerCase();
    let noMatch = true;

    tableRows.forEach(row => {
        const tableData = row.textContent.toLowerCase();
        const found = tableData.includes(searchData);

        // Toggle hide class based on search result
        row.classList.toggle('hide', !found);
        if (found) noMatch = false;
    });

    // Show or hide the no match message based on the flag
    noMatchMessage.style.display = noMatch ? 'block' : 'none';
}

// Sorting data of HTML table
let sortAsc = true; // Flag to track sorting order, initially set to true (ascending)

// Event listener for table headings to trigger sorting
tableHeadings.forEach((head, index) => {
    head.addEventListener('click', () => {
        resetTable(); // Reset table to original order before sorting
        tableHeadings.forEach(h => h.classList.remove('active', 'asc', 'desc')); // Remove sorting indicator classes from all headings
        head.classList.add('active', sortAsc ? 'asc' : 'desc'); // Add sorting indicator class to clicked heading

        sortTable(index, sortAsc); // Sort table based on clicked heading
        sortAsc = !sortAsc; // Toggle sorting order after each click
    });
});

// Function to sort table based on column index and sorting order
function sortTable(column, ascending) {
    const tbody = document.querySelector('tbody');
    const rowsArray = Array.from(tbody.querySelectorAll('tr'));

    const sortedRows = rowsArray.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[column]?.textContent.trim() || '';
        const cellB = rowB.querySelectorAll('td')[column]?.textContent.trim() || '';

        // Custom sorting logic based on column index
        if ([3, 4].includes(column)) { // Date columns
            const dateA = parseDate(cellA);
            const dateB = parseDate(cellB);
            if (!dateA && !dateB) return 0;
            if (!dateA) return ascending ? -1 : 1;
            if (!dateB) return ascending ? 1 : -1;
            return ascending ? dateA - dateB : dateB - dateA;
        } else if (column === 6) { // Amount column
            const amountA = parseFloat(cellA.replace(/[^0-9.-]+/g, '')) || 0;
            const amountB = parseFloat(cellB.replace(/[^0-9.-]+/g, '')) || 0;
            return ascending ? amountA - amountB : amountB - amountA;
        } else { // Other columns
            return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    const fragment = document.createDocumentFragment();
    sortedRows.forEach(row => fragment.appendChild(row));
    tbody.appendChild(fragment);
}

// Function to parse date string to sortable format
function parseDate(dateString) {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('-');
    return new Date(`${year}-${month}-${day}`);
}

// Event listener for the reset checkbox
document.getElementById('reset').addEventListener('change', function () {
    if (this.checked) {
        resetTable(); // Call resetTable function when the checkbox is checked
        this.checked = false; // Uncheck the checkbox after resetting
    }
});

// Function to reset the table to its original order
function resetTable() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing table rows

    const fragment = document.createDocumentFragment();
    originalOrder.forEach(row => fragment.appendChild(row));
    tbody.appendChild(fragment);
}
