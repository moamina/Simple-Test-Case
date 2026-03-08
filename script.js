let testCases = JSON.parse(localStorage.getItem('testCases')) || [
    {
        caseId: 'TC-101',
        summary: 'Login with valid credentials',
        description: 'Verify that a user can log in with correct email and password.',
        preconditions: 'User is registered.',
        steps: '1. Go to login page\n2. Enter credentials\n3. Click Login',
        testData: 'user@example.com / pass123',
        expected: 'User redirected to dashboard',
        actual: '',
        priority: 'High',
        status: 'Done',
        createdBy: 'System',
        createdDate: new Date().toLocaleDateString()
    }
];

const modal = document.getElementById('create-modal');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');
const editIndexInput = document.getElementById('edit-index');

const createBtn = document.getElementById('create-btn');
const closeBtn = document.querySelectorAll('.close-modal');
const form = document.getElementById('test-case-form');
const listContainer = document.getElementById('test-case-list');
const exportBtn = document.getElementById('export-btn');

// --- Functions ---

function renderTable() {
    listContainer.innerHTML = '';
    testCases.forEach((tc, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: #0052CC; font-weight: 600;">${tc.caseId}</td>
            <td style="font-weight: 500;">${tc.summary}</td>
            <td>${tc.priority}</td>
            <td><span class="badge ${getStatusClass(tc.status)}">${tc.status}</span></td>
            <td>${tc.createdBy}</td>
            <td>${tc.createdDate}</td>
            <td>
                <button class="btn btn-text" style="color: #0052CC; margin-right: 8px;" onclick="editTestCase(${index})">Edit</button>
                <button class="btn btn-text" style="color: #FF5630;" onclick="deleteTestCase(${index})">Delete</button>
            </td>
        `;
        listContainer.appendChild(row);
    });
    localStorage.setItem('testCases', JSON.stringify(testCases));
}

function getStatusClass(status) {
    switch(status) {
        case 'To Do': return 'badge-todo';
        case 'In Progress': return 'badge-progress';
        case 'Done': return 'badge-done';
        default: return '';
    }
}

function deleteTestCase(index) {
    if(confirm('Are you sure you want to delete this test case?')) {
        testCases.splice(index, 1);
        renderTable();
    }
}

function editTestCase(index) {
    const tc = testCases[index];

    // Set modal to Edit mode
    modalTitle.innerText = 'Edit Test Case';
    submitBtn.innerText = 'Update';
    editIndexInput.value = index;

    // Fill form fields
    document.getElementById('createdBy').value = tc.createdBy;
    document.getElementById('caseId').value = tc.caseId;
    document.getElementById('summary').value = tc.summary;
    document.getElementById('description').value = tc.description;
    document.getElementById('preconditions').value = tc.preconditions;
    document.getElementById('steps').value = tc.steps;
    document.getElementById('testData').value = tc.testData;
    document.getElementById('expected').value = tc.expected;
    document.getElementById('actual').value = tc.actual;
    document.getElementById('status').value = tc.status;
    document.getElementById('priority').value = tc.priority;

    modal.style.display = 'block';
}

function resetModal() {
    modalTitle.innerText = 'Create Test Case';
    submitBtn.innerText = 'Create';
    editIndexInput.value = '-1';
    form.reset();
}

// --- Event Listeners ---

createBtn.addEventListener('click', () => {
    resetModal();
    modal.style.display = 'block';
});

closeBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.style.display = 'none';
        resetModal();
    });
});

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        resetModal();
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const editIndex = parseInt(editIndexInput.value);

    const caseData = {
        createdBy: document.getElementById('createdBy').value,
        createdDate: editIndex >= 0 ? testCases[editIndex].createdDate : new Date().toLocaleDateString(),
        caseId: document.getElementById('caseId').value,
        summary: document.getElementById('summary').value,
        description: document.getElementById('description').value,
        preconditions: document.getElementById('preconditions').value,
        steps: document.getElementById('steps').value,
        testData: document.getElementById('testData').value,
        expected: document.getElementById('expected').value,
        actual: document.getElementById('actual').value,
        status: document.getElementById('status').value,
        priority: document.getElementById('priority').value
    };

    if (editIndex >= 0) {
        // Update existing
        testCases[editIndex] = caseData;
    } else {
        // Create new
        testCases.push(caseData);
    }

    renderTable();
    modal.style.display = 'none';
    resetModal();
});

exportBtn.addEventListener('click', () => {
    if (testCases.length === 0) {
        alert('No data to export!');
        return;
    }

    try {
        // Prepare data for Excel with specific columns requested
        const data = testCases.map(tc => ({
            'Created BY': tc.createdBy,
            'Created Date': tc.createdDate,
            'TestCaseID': tc.caseId,
            'TestCaseTitle': tc.summary,
            'Description': tc.description,
            'Preconditions': tc.preconditions,
            'TestCaseSteps': tc.steps,
            'TestData': tc.testData,
            'ExpectedResult': tc.expected,
            'Actual': tc.actual,
            'Status': tc.status,
            'Priority': tc.priority
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");

        // Download file
        XLSX.writeFile(workbook, "Test_Cases_Updated.xlsx");
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export to Excel. Please check the console for details.');
    }
});

// Initial Render
renderTable();
