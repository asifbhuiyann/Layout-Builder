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
    
    // Remove placeholder if it exists (only for the first component)
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
                <div class="section-info">
                    <input type="text" class="record-type" value="Record Type ${sectionCounter}" placeholder="Record Type Name">
                    <input type="text" class="section-title" value="Header Information ${sectionCounter}" placeholder="Section Title">
                </div>
                <div class="section-controls">
                    <button class="control-btn" onclick="addField('${sectionId}', 1)">Add Field - 1 Col</button>
                    <button class="control-btn" onclick="addField('${sectionId}', 2)">Add Field - 2 Col</button>
                    <button class="control-btn danger" onclick="removeSection('${sectionId}')">×</button>
                </div>
            </div>
            <div class="section-content">
                <div class="fields-container" id="${sectionId}-fields"></div>
            </div>
        </div>
    `;
    
    // Always append to the end (after existing components)
    canvas.insertAdjacentHTML('beforeend', sectionHTML);
    console.log(`Section ${sectionId} added`);
}

function addField(sectionId, columnSpan = 2) {
    const fieldsContainer = document.getElementById(`${sectionId}-fields`);
    
    let fieldHTML = '';
    
    if (columnSpan === 1) {
        // Single column field - takes full width
        fieldCounter++;
        const fieldId = `field-${fieldCounter}`;
        
        fieldHTML = `
            <div class="field-row field-row-single" id="${fieldId}">
                <div class="field-item field-single-col">
                    <input type="text" class="field-name" placeholder="Field Name" value="">
                    <select class="field-type">
                        <option value="auto-number">Auto Number</option>
                        <option value="formula">Formula</option>
                        <option value="rollup-summary">Roll-Up Summary</option>
                        <option value="lookup-relationship">Lookup Relationship</option>
                        <option value="master-detail-relationship">Master-Detail Relationship</option>
                        <option value="external-lookup-relationship">External Lookup Relationship</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="currency">Currency</option>
                        <option value="date">Date</option>
                        <option value="datetime">Date/Time</option>
                        <option value="email">Email</option>
                        <option value="geolocation">Geolocation</option>
                        <option value="number">Number</option>
                        <option value="percent">Percent</option>
                        <option value="phone">Phone</option>
                        <option value="picklist">Picklist</option>
                        <option value="picklist-multi-select">Picklist (Multi-Select)</option>
                        <option value="text">Text</option>
                        <option value="text-area">Text Area</option>
                        <option value="text-area-long">Text Area (Long)</option>
                        <option value="text-area-rich">Text Area (Rich)</option>
                        <option value="text-encrypted">Text (Encrypted)</option>
                        <option value="time">Time</option>
                        <option value="url">URL</option>
                    </select>
                    <button class="remove-field" onclick="removeField('${fieldId}')" title="Remove field">×</button>
                </div>
            </div>
        `;
    } else {
        // Double column field - creates TWO fields side by side immediately
        const fieldId1 = `field-${++fieldCounter}`;
        const fieldId2 = `field-${++fieldCounter}`;
        const rowId = `row-${fieldCounter}`;
        
        fieldHTML = `
            <div class="field-row field-row-double" id="${rowId}">
                <div class="field-item field-double-col" id="${fieldId1}">
                    <input type="text" class="field-name" placeholder="Field Name" value="">
                    <select class="field-type">
                        <option value="auto-number">Auto Number</option>
                        <option value="formula">Formula</option>
                        <option value="rollup-summary">Roll-Up Summary</option>
                        <option value="lookup-relationship">Lookup Relationship</option>
                        <option value="master-detail-relationship">Master-Detail Relationship</option>
                        <option value="external-lookup-relationship">External Lookup Relationship</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="currency">Currency</option>
                        <option value="date">Date</option>
                        <option value="datetime">Date/Time</option>
                        <option value="email">Email</option>
                        <option value="geolocation">Geolocation</option>
                        <option value="number">Number</option>
                        <option value="percent">Percent</option>
                        <option value="phone">Phone</option>
                        <option value="picklist">Picklist</option>
                        <option value="picklist-multi-select">Picklist (Multi-Select)</option>
                        <option value="text">Text</option>
                        <option value="text-area">Text Area</option>
                        <option value="text-area-long">Text Area (Long)</option>
                        <option value="text-area-rich">Text Area (Rich)</option>
                        <option value="text-encrypted">Text (Encrypted)</option>
                        <option value="time">Time</option>
                        <option value="url">URL</option>
                    </select>
                    <button class="remove-field" onclick="removeFieldFromRow('${rowId}', '${fieldId1}')" title="Remove field">×</button>
                </div>
                <div class="field-item field-double-col" id="${fieldId2}">
                    <input type="text" class="field-name" placeholder="Field Name" value="">
                    <select class="field-type">
                        <option value="auto-number">Auto Number</option>
                        <option value="formula">Formula</option>
                        <option value="rollup-summary">Roll-Up Summary</option>
                        <option value="lookup-relationship">Lookup Relationship</option>
                        <option value="master-detail-relationship">Master-Detail Relationship</option>
                        <option value="external-lookup-relationship">External Lookup Relationship</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="currency">Currency</option>
                        <option value="date">Date</option>
                        <option value="datetime">Date/Time</option>
                        <option value="email">Email</option>
                        <option value="geolocation">Geolocation</option>
                        <option value="number">Number</option>
                        <option value="percent">Percent</option>
                        <option value="phone">Phone</option>
                        <option value="picklist">Picklist</option>
                        <option value="picklist-multi-select">Picklist (Multi-Select)</option>
                        <option value="text">Text</option>
                        <option value="text-area">Text Area</option>
                        <option value="text-area-long">Text Area (Long)</option>
                        <option value="text-area-rich">Text Area (Rich)</option>
                        <option value="text-encrypted">Text (Encrypted)</option>
                        <option value="time">Time</option>
                        <option value="url">URL</option>
                    </select>
                    <button class="remove-field" onclick="removeFieldFromRow('${rowId}', '${fieldId2}')" title="Remove field">×</button>
                </div>
            </div>
        `;
    }
    
    // Add the field row to the container
    fieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
    console.log(`Field added (${columnSpan} column${columnSpan > 1 ? 's' : ''})`);
}

function removeField(fieldId) {
    const fieldRow = document.getElementById(fieldId);
    if (fieldRow) {
        fieldRow.remove();
        console.log(`Field ${fieldId} removed`);
    }
}

function removeFieldFromRow(rowId, fieldId) {
    const row = document.getElementById(rowId);
    const field = document.getElementById(fieldId);
    
    if (row && field) {
        const remainingFields = row.querySelectorAll('.field-item');
        
        if (remainingFields.length <= 1) {
            // Only one field left, remove entire row
            row.remove();
            console.log(`Row ${rowId} removed`);
        } else {
            // Remove this specific field and replace with placeholder
            field.outerHTML = `
                <div class="field-placeholder" onclick="addFieldToRow('${rowId}')">
                    <span class="placeholder-text">Click to add field</span>
                </div>
            `;
            console.log(`Field ${fieldId} removed from row ${rowId}`);
        }
    }
}

function addFieldToRow(rowId) {
    const row = document.getElementById(rowId);
    const placeholder = row.querySelector('.field-placeholder');
    
    if (placeholder) {
        fieldCounter++;
        const newFieldId = `field-${fieldCounter}`;
        
        const newFieldHTML = `
            <div class="field-item field-double-col" id="${newFieldId}">
                <input type="text" class="field-name" placeholder="Field Name" value="">
                <select class="field-type">
                    <option value="auto-number">Auto Number</option>
                    <option value="formula">Formula</option>
                    <option value="rollup-summary">Roll-Up Summary</option>
                    <option value="lookup-relationship">Lookup Relationship</option>
                    <option value="master-detail-relationship">Master-Detail Relationship</option>
                    <option value="external-lookup-relationship">External Lookup Relationship</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="currency">Currency</option>
                    <option value="date">Date</option>
                    <option value="datetime">Date/Time</option>
                    <option value="email">Email</option>
                    <option value="geolocation">Geolocation</option>
                    <option value="number">Number</option>
                    <option value="percent">Percent</option>
                    <option value="phone">Phone</option>
                    <option value="picklist">Picklist</option>
                    <option value="picklist-multi-select">Picklist (Multi-Select)</option>
                    <option value="text">Text</option>
                    <option value="text-area">Text Area</option>
                    <option value="text-area-long">Text Area (Long)</option>
                    <option value="text-area-rich">Text Area (Rich)</option>
                    <option value="text-encrypted">Text (Encrypted)</option>
                    <option value="time">Time</option>
                    <option value="url">URL</option>
                </select>
                <button class="remove-field" onclick="removeFieldFromRow('${rowId}', '${newFieldId}')" title="Remove field">×</button>
            </div>
        `;
        
        placeholder.outerHTML = newFieldHTML;
        console.log(`Field ${newFieldId} added to row ${rowId}`);
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
    
    // Reset counters
    sectionCounter = 0;
    fieldCounter = 0;
    
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