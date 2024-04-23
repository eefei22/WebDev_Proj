// Selecting necessary elements from the DOM
const search = document.querySelector('.input_group input'); // Input field for searching
const tableRows = document.querySelectorAll('tbody tr'); // Table rows
const tableHeadings = document.querySelectorAll('thead th'); // Table headings
const noMatchMessage = document.querySelector('.no-match-message'); // No match message element
const originalOrder = Array.from(tableRows); // Array to store the original order of table rows

// Event listener for search input field
search.addEventListener('input', searchTable);

// Function to handle table search
function searchTable() {
    let noMatch = true;

    tableRows.forEach(row => {
        let tableData = row.textContent.toLowerCase();
        let searchData = search.value.toLowerCase();

        const found = tableData.indexOf(searchData) >= 0;

        // Toggle hide class based on search result
        row.classList.toggle('hide', !found);

        if (found) {
            noMatch = false;
        }
    });

    // Show or hide the no match message based on the flag
    noMatchMessage.style.display = noMatch ? 'block' : 'none';
}

// Sorting data of HTML table
let sortAsc = true; // Flag to track sorting order, initially set to true (ascending)

// Event listener for table headings to trigger sorting
tableHeadings.forEach((head, i) => {
    head.addEventListener('click', () => {
        resetTable(); // Reset table to original order before sorting
        tableHeadings.forEach(h => h.classList.remove('active', 'asc', 'desc')); // Remove sorting indicator classes from all headings
        head.classList.add('active', sortAsc ? 'asc' : 'desc'); // Add sorting indicator class to clicked heading

        const columnIndex = i;
        sortTable(columnIndex, sortAsc); // Sort table based on clicked heading
        sortAsc = !sortAsc; // Toggle sorting order after each click
    });
});

// Function to sort table based on column index and sorting order
function sortTable(column, ascending) {
    const tbody = document.querySelector('tbody');
    const rowsArray = Array.from(tbody.querySelectorAll('tr'));

    const sortedRows = rowsArray.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[column].textContent.trim(); // Get content of cell A
        const cellB = rowB.querySelectorAll('td')[column].textContent.trim(); // Get content of cell B

        // Custom sorting logic based on column index
        if (column === 3 || column === 4) { // Date columns
            // Convert date string to sortable format
            const dateA = cellA === '-' ? null : new Date(parseDate(cellA));
            const dateB = cellB === '-' ? null : new Date(parseDate(cellB));

            // Handle null values (entries with '-')
            if (!dateA && !dateB) {
                return 0;
            } else if (!dateA) {
                return ascending ? -1 : 1;
            } else if (!dateB) {
                return ascending ? 1 : -1;
            }

            return ascending ? dateA - dateB : dateB - dateA;
        } else if (column === 6) { // Amount column
            // Extract numerical value from the amount string
            const amountA = parseFloat(cellA.substring(2));
            const amountB = parseFloat(cellB.substring(2));

            return ascending ? amountA - amountB : amountB - amountA;
        } else { // Other columns
            // Perform simple string comparison
            return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    // Append sorted rows to tbody
    sortedRows.forEach(row => tbody.appendChild(row));
}

// Function to parse date string to sortable format
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
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

    // Append original order of rows to tbody
    originalOrder.forEach(row => tbody.appendChild(row));
}