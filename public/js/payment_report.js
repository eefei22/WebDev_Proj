const searchInput = document.querySelector('.input_group input'); // Input field for searching
const tableRows = Array.from(document.querySelectorAll('tbody tr')); // Table rows
const tableHeadings = Array.from(document.querySelectorAll('thead th')); // Table headings
const noMatchMessage = document.querySelector('.no-match-message'); // No match message element
const resetBtn = document.getElementById('reset'); // Reset button
const originalOrder = tableRows.map(row => row.cloneNode(true)); // Store the original order of table rows

// Event listener for search input field
searchInput.addEventListener('input', searchTable);

// Event listener for reset button
resetBtn.addEventListener('change', resetTable);

// Function to handle table search
function searchTable() {
    const searchData = searchInput.value.toLowerCase();
    let noMatch = true;

    tableRows.forEach(row => {
        if (searchData === '') {
            row.classList.remove('hide');
            noMatch = false;
        } else {
            const tableData = row.textContent.toLowerCase();
            const found = tableData.includes(searchData);

            // Toggle hide class based on search result
            row.classList.toggle('hide', !found);
            if (found) noMatch = false;
        }
    });

    // Show or hide the no match message based on the flag
    noMatchMessage.style.display = noMatch ? 'block' : 'none';
}

// Sorting data of HTML table
let sortAsc = true; // Flag to track sorting order, initially set to true (ascending)

// Event listener for table headings to trigger sorting
tableHeadings.forEach((head, index) => {
    head.addEventListener('click', () => {
        resetTable(false); // Reset table to original order before sorting
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
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

// Function to reset table to its original order
function resetTable(resetSort = true) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    originalOrder.forEach(row => tbody.appendChild(row.cloneNode(true)));
    noMatchMessage.style.display = 'none'; // Hide no match message when table is reset

    if (resetSort) {
        tableHeadings.forEach(h => h.classList.remove('active', 'asc', 'desc')); // Remove sorting indicator classes from all headings
        sortAsc = true; // Reset sorting flag
    }
}

// Export table data to PDF
const toPDFBtn = document.getElementById('toPDF');
toPDFBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableElement = document.getElementById('mainTable');

    // Clone the table to prevent affecting the original table
    const clonedTable = tableElement.cloneNode(true);
    clonedTable.id = 'clonedTable'; // Assign a unique ID to the cloned table

    // Append the cloned table to the document body temporarily
    document.body.appendChild(clonedTable);

    doc.autoTable({
        html: '#clonedTable', // Use the cloned table for PDF generation
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 9 }
    });

    // Remove the cloned table from the document body after PDF generation
    document.body.removeChild(clonedTable);

    doc.save('payment_report.pdf');
});
