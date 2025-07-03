// Navigation Functions
function exportLayout() {
    alert('Export functionality will be implemented here');
    console.log('Exporting layout...');
}

function importLayout() {
    alert('Import functionality will be implemented here');
    console.log('Importing layout...');
}

function saveAsDraft() {
    alert('Save as Draft functionality will be implemented here');
    console.log('Saving as draft...');
}

// Layout Builder Functions
let sectionCounter = 0;
let fieldCounter = 0;

function addComponent() {
    const canvas = document.getElementById('layoutCanvas');
    
    // Remove placeholder if it exists
    const placeholder = canvas.querySelector('.canvas-placeholder');
    if (placeholder) {
        placeholder.remove();
        canvas.classList.add('has-content');
    }

    sectionCounter++;
    const sectionId = `section-${sectionCounter}`;
    
    const sectionHTML = `
        <div class="layout-section" id="${sectionId}">
            <div class="section-header">
                <input type="text" class="section-title" value="Header Information" placeholder="Section Title">
                <div class="section-controls">
                    <button class="control-btn" onclick="addField('${sectionId}')">Add Field</button>
                    <button class="control-btn danger" onclick="removeSection('${sectionId}')">×</button>
                </div>
            </div>
            <div class="section-content">
                <div class="section-column" id="${sectionId}-left"></div>
                <div class="section-column" id="${sectionId}-right"></div>
            </div>
        </div>
    `;
    
    canvas.insertAdjacentHTML('beforeend', sectionHTML);
    console.log(`Section ${sectionId} added`);
}

function addField(sectionId) {
    const leftColumn = document.getElementById(`${sectionId}-left`);
    const rightColumn = document.getElementById(`${sectionId}-right`);
    
    // Determine which column to add to (alternate, left gets preference)
    const leftCount = leftColumn.children.length;
    const rightCount = rightColumn.children.length;
    
    const targetColumn = leftCount <= rightCount ? leftColumn : rightColumn;
    
    fieldCounter++;
    const fieldId = `field-${fieldCounter}`;
    
    const fieldHTML = `
        <div class="field-item" id="${fieldId}">
            <input type="text" class="field-name" placeholder="Field Name" value="">
            <select class="field-type">
                <option value="text">Text (255 char per line)</option>
                <option value="textarea">Text Area (255 char on screen)</option>
                <option value="picklist">Picklist</option>
                <option value="lookup">Lookup</option>
                <option value="lookup-acc">Lookup (Account)</option>
                <option value="pick-data">Pick a Data Type</option>
            </select>
            <button class="remove-field" onclick="removeField('${fieldId}')" title="Remove field">×</button>
        </div>
    `;
    
    targetColumn.insertAdjacentHTML('beforeend', fieldHTML);
    console.log(`Field ${fieldId} added to ${targetColumn.id}`);
}

function removeField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.remove();
        console.log(`Field ${fieldId} removed`);
    }
}

function removeSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.remove();
        console.log(`Section ${sectionId} removed`);
        
        // Check if canvas is empty and restore placeholder
        const canvas = document.getElementById('layoutCanvas');
        if (canvas.children.length === 0) {
            canvas.classList.remove('has-content');
            canvas.innerHTML = `
                <div class="canvas-placeholder">
                    <h3>Your Layout Canvas</h3>
                    <p>Drag and drop components here to build your Salesforce page layout</p>
                </div>
            `;
        }
    }
}

function clearCanvas() {
    const canvas = document.getElementById('layoutCanvas');
    canvas.innerHTML = `
        <div class="canvas-placeholder">
            <h3>Your Layout Canvas</h3>
            <p>Drag and drop components here to build your Salesforce page layout</p>
        </div>
    `;
    canvas.classList.remove('has-content');
    console.log('Canvas cleared');
}

// Responsive navbar handling
window.addEventListener('resize', function() {
    // Handle responsive behavior if needed
    console.log('Window resized');
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Salesforce Page Layout Builder initialized');
});