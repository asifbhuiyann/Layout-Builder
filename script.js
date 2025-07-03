// Navigation Functions
function showExportOptions() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'block';
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('exportModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function importLayout() {
    alert('Import functionality will be implemented here');
    console.log('Importing layout...');
}

function saveAsDraft() {
    alert('Save as Draft functionality will be implemented here');
    console.log('Saving as draft...');
}

// Export Functions
function exportAsPDF() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    
    if (sections.length === 0) {
        alert('No layout to export. Please add some components first.');
        return;
    }

    html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f5f5'
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('salesforce-layout.pdf');
        closeExportModal();
    });
}

function exportAsDOCX() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    
    if (sections.length === 0) {
        alert('No layout to export. Please add some components first.');
        return;
    }

    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } = docx;
    
    const children = [];
    
    // Add title
    children.push(new Paragraph({
        children: [new TextRun({
            text: "Salesforce Page Layout",
            bold: true,
            size: 32
        })],
        alignment: AlignmentType.CENTER
    }));
    
    children.push(new Paragraph({ text: "" })); // Empty line
    
    sections.forEach((section, index) => {
        const recordType = section.querySelector('.record-type')?.value || '';
        const sectionTitle = section.querySelector('.section-title')?.value || '';
        
        // Add section header
        if (recordType) {
            children.push(new Paragraph({
                children: [new TextRun({
                    text: `Record Type: ${recordType}`,
                    bold: true,
                    size: 24
                })],
                alignment: AlignmentType.LEFT
            }));
        }
        
        children.push(new Paragraph({
            children: [new TextRun({
                text: sectionTitle,
                bold: true,
                size: 20
            })],
            alignment: AlignmentType.LEFT
        }));
        
        // Add fields
        const fields = section.querySelectorAll('.field-item');
        if (fields.length > 0) {
            const tableRows = [];
            
            // Header row
            tableRows.push(new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: "Field Name" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Data Type" })] })
                ]
            }));
            
            fields.forEach(field => {
                const fieldName = field.querySelector('.field-name')?.value || 'Unnamed Field';
                const fieldType = field.querySelector('.field-type')?.value || 'text';
                
                tableRows.push(new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: fieldName })] }),
                        new TableCell({ children: [new Paragraph({ text: fieldType })] })
                    ]
                }));
            });
            
            children.push(new Table({
                rows: tableRows,
                width: { size: 100, type: "pct" }
            }));
        }
        
        children.push(new Paragraph({ text: "" })); // Empty line between sections
    });
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });
    
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'salesforce-layout.docx';
        a.click();
        URL.revokeObjectURL(url);
        closeExportModal();
    });
}

function exportAsXLS() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    
    if (sections.length === 0) {
        alert('No layout to export. Please add some components first.');
        return;
    }

    const wb = XLSX.utils.book_new();
    const wsData = [];
    
    // Add header
    wsData.push(['Salesforce Page Layout']);
    wsData.push([]); // Empty row
    
    sections.forEach((section, index) => {
        const recordType = section.querySelector('.record-type')?.value || '';
        const sectionTitle = section.querySelector('.section-title')?.value || '';
        
        // Add section info
        if (recordType) {
            wsData.push([`Record Type: ${recordType}`]);
        }
        wsData.push([sectionTitle]);
        wsData.push(['Field Name', 'Data Type']); // Header row
        
        const fields = section.querySelectorAll('.field-item');
        fields.forEach(field => {
            const fieldName = field.querySelector('.field-name')?.value || 'Unnamed Field';
            const fieldType = field.querySelector('.field-type')?.value || 'text';
            wsData.push([fieldName, fieldType]);
        });
        
        wsData.push([]); // Empty row between sections
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Style the header
    ws['A1'] = { v: 'Salesforce Page Layout', t: 's', s: { font: { bold: true, sz: 16 } } };
    
    XLSX.utils.book_append_sheet(wb, ws, 'Layout');
    XLSX.writeFile(wb, 'salesforce-layout.xlsx');
    closeExportModal();
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
    
    // Record type field only for the first section
    const recordTypeField = sectionCounter === 1 ? 
        `<input type="text" class="record-type" value="Record Type ${sectionCounter}" placeholder="Record Type Name">` : 
        '';
    
    const sectionHTML = `
        <div class="layout-section" id="${sectionId}">
            <div class="section-header">
                <div class="section-info">
                    ${recordTypeField}
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