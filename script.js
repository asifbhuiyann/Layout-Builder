// Navigation Functions
function showExportOptions() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'block';
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'none';
}

function showImportOptions() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'block';
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const exportModal = document.getElementById('exportModal');
    const importModal = document.getElementById('importModal');
    
    if (event.target === exportModal) {
        exportModal.style.display = 'none';
    }
    if (event.target === importModal) {
        importModal.style.display = 'none';
    }
}

function importLayout() {
    showImportOptions();
}

// Import Functions
function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const layoutData = JSON.parse(e.target.result);
                    restoreLayoutData(layoutData);
                    showNotification('JSON layout imported successfully!', 'success');
                    closeImportModal();
                } catch (error) {
                    console.error('Error importing JSON:', error);
                    showNotification('Error importing JSON file. Please check the format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function importXML() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const xmlContent = e.target.result;
                    parseXMLLayout(xmlContent);
                    showNotification('XML layout imported successfully!', 'success');
                    closeImportModal();
                } catch (error) {
                    console.error('Error importing XML:', error);
                    showNotification('Error importing XML file. Please check the format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    if (file.name.endsWith('.csv')) {
                        parseCSVLayout(e.target.result);
                    } else {
                        parseExcelLayout(e.target.result);
                    }
                    showNotification('File imported successfully!', 'success');
                    closeImportModal();
                } catch (error) {
                    console.error('Error importing file:', error);
                    showNotification('Error importing file. Please check the format.', 'error');
                }
            };
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }
    };
    
    input.click();
}

function parseXMLLayout(xmlContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Clear existing layout
    clearCanvas();
    
    // Extract layout name
    const layoutNameElement = xmlDoc.querySelector('layoutName, Layout, title');
    const layoutName = layoutNameElement ? layoutNameElement.textContent : 'Imported Layout';
    
    // Create first section
    addComponent();
    
    // Set layout name
    const firstSection = document.querySelector('.layout-section');
    const layoutNameInput = firstSection.querySelector('.layout-name');
    if (layoutNameInput) {
        layoutNameInput.value = layoutName;
    }
    
    // Extract sections
    const sections = xmlDoc.querySelectorAll('section, Section, layoutSection');
    if (sections.length === 0) {
        // If no sections found, treat the whole document as fields
        const fields = xmlDoc.querySelectorAll('field, Field, item');
        addFieldsToSection('section-1', fields);
    } else {
        sections.forEach((section, index) => {
            if (index > 0) {
                addComponent(); // Add additional sections
            }
            
            const sectionId = `section-${index + 1}`;
            const sectionElement = document.getElementById(sectionId);
            
            // Set section title
            const sectionTitle = section.getAttribute('name') || section.getAttribute('title') || `Section ${index + 1}`;
            const sectionTitleInput = sectionElement.querySelector('.section-title');
            if (sectionTitleInput) {
                sectionTitleInput.value = sectionTitle;
            }
            
            // Add fields
            const fields = section.querySelectorAll('field, Field, item');
            addFieldsToSection(sectionId, fields);
        });
    }
}

function parseCSVLayout(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Clear existing layout
    clearCanvas();
    
    // Create first section
    addComponent();
    
    // Set layout name
    const firstSection = document.querySelector('.layout-section');
    const layoutNameInput = firstSection.querySelector('.layout-name');
    if (layoutNameInput) {
        layoutNameInput.value = 'CSV Imported Layout';
    }
    
    // Process data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            
            // Determine if this is a single or double column field
            const columnSpan = values.length > 2 ? 2 : 1;
            
            if (columnSpan === 1) {
                addField('section-1', 1);
                const fields = document.querySelectorAll('.field-item');
                const lastField = fields[fields.length - 1];
                
                const fieldName = values[0] || `Field ${i}`;
                const fieldType = mapDataType(values[1] || 'text');
                
                const fieldNameInput = lastField.querySelector('.field-name');
                const fieldTypeSelect = lastField.querySelector('.field-type');
                
                if (fieldNameInput) fieldNameInput.value = fieldName;
                if (fieldTypeSelect) fieldTypeSelect.value = fieldType;
            } else {
                addField('section-1', 2);
                const fieldRows = document.querySelectorAll('.field-row-double');
                const lastRow = fieldRows[fieldRows.length - 1];
                const fieldItems = lastRow.querySelectorAll('.field-item');
                
                // First field
                const fieldName1 = values[0] || `Field ${i}A`;
                const fieldType1 = mapDataType(values[1] || 'text');
                
                const fieldNameInput1 = fieldItems[0].querySelector('.field-name');
                const fieldTypeSelect1 = fieldItems[0].querySelector('.field-type');
                
                if (fieldNameInput1) fieldNameInput1.value = fieldName1;
                if (fieldTypeSelect1) fieldTypeSelect1.value = fieldType1;
                
                // Second field
                if (fieldItems.length > 1) {
                    const fieldName2 = values[2] || `Field ${i}B`;
                    const fieldType2 = mapDataType(values[3] || 'text');
                    
                    const fieldNameInput2 = fieldItems[1].querySelector('.field-name');
                    const fieldTypeSelect2 = fieldItems[1].querySelector('.field-type');
                    
                    if (fieldNameInput2) fieldNameInput2.value = fieldName2;
                    if (fieldTypeSelect2) fieldTypeSelect2.value = fieldType2;
                }
            }
        }
    }
}

function parseExcelLayout(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Clear existing layout
    clearCanvas();
    
    // Create first section
    addComponent();
    
    // Set layout name
    const firstSection = document.querySelector('.layout-section');
    const layoutNameInput = firstSection.querySelector('.layout-name');
    if (layoutNameInput) {
        layoutNameInput.value = data[0] && data[0][0] ? data[0][0] : 'Excel Imported Layout';
    }
    
    // Find the start of field data
    let startRow = 1;
    for (let i = 1; i < data.length; i++) {
        if (data[i] && data[i][0] && data[i][0].toString().toLowerCase().includes('field')) {
            startRow = i + 1;
            break;
        }
    }
    
    // Process field data
    for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        if (row && row[0]) {
            const fieldName = row[0];
            const fieldType = mapDataType(row[1] || 'text');
            
            addField('section-1', 1);
            const fields = document.querySelectorAll('.field-item');
            const lastField = fields[fields.length - 1];
            
            const fieldNameInput = lastField.querySelector('.field-name');
            const fieldTypeSelect = lastField.querySelector('.field-type');
            
            if (fieldNameInput) fieldNameInput.value = fieldName;
            if (fieldTypeSelect) fieldTypeSelect.value = fieldType;
        }
    }
}

function addFieldsToSection(sectionId, fields) {
    Array.from(fields).forEach(field => {
        const fieldName = field.getAttribute('name') || field.getAttribute('label') || field.textContent || 'Unnamed Field';
        const fieldType = mapDataType(field.getAttribute('type') || field.getAttribute('dataType') || 'text');
        
        addField(sectionId, 1);
        const fieldItems = document.querySelectorAll('.field-item');
        const lastField = fieldItems[fieldItems.length - 1];
        
        const fieldNameInput = lastField.querySelector('.field-name');
        const fieldTypeSelect = lastField.querySelector('.field-type');
        
        if (fieldNameInput) fieldNameInput.value = fieldName;
        if (fieldTypeSelect) fieldTypeSelect.value = fieldType;
    });
}

function mapDataType(inputType) {
    const typeMap = {
        'string': 'text',
        'varchar': 'text',
        'char': 'text',
        'int': 'number',
        'integer': 'number',
        'decimal': 'number',
        'float': 'number',
        'double': 'number',
        'boolean': 'checkbox',
        'bool': 'checkbox',
        'date': 'date',
        'datetime': 'datetime',
        'timestamp': 'datetime',
        'email': 'email',
        'url': 'url',
        'phone': 'phone',
        'tel': 'phone',
        'textarea': 'text-area',
        'longtext': 'text-area-long',
        'richtext': 'text-area-rich',
        'select': 'picklist',
        'dropdown': 'picklist',
        'list': 'picklist',
        'multiselect': 'picklist-multi-select',
        'lookup': 'lookup-relationship',
        'reference': 'lookup-relationship',
        'currency': 'currency',
        'percent': 'percent',
        'percentage': 'percent',
        'location': 'geolocation',
        'geo': 'geolocation',
        'encrypted': 'text-encrypted',
        'time': 'time',
        'autonumber': 'auto-number',
        'sequence': 'auto-number',
        'formula': 'formula',
        'calculated': 'formula',
        'rollup': 'rollup-summary',
        'summary': 'rollup-summary'
    };
    
    const normalizedType = inputType.toLowerCase().replace(/[^a-z]/g, '');
    return typeMap[normalizedType] || 'text';
}

function exportJSON() {
    const layoutData = captureLayoutData();
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'salesforce-layout.json';
    link.click();
    
    closeExportModal();
    showNotification('JSON layout exported successfully!', 'success');
}

function exportAsXML() {
    const layoutData = captureLayoutData();

    const xmlDoc = document.implementation.createDocument('', '', null);
    const root = xmlDoc.createElement('layout');
    root.setAttribute('timestamp', layoutData.timestamp);

    layoutData.sections.forEach(section => {
        const sectionElement = xmlDoc.createElement('section');
        sectionElement.setAttribute('id', section.id);

        if (section.layoutName) {
            const nameEl = xmlDoc.createElement('layoutName');
            nameEl.textContent = section.layoutName;
            sectionElement.appendChild(nameEl);
        }

        if (section.recordType) {
            const recordTypeEl = xmlDoc.createElement('recordType');
            recordTypeEl.textContent = section.recordType;
            sectionElement.appendChild(recordTypeEl);
        }

        if (section.sectionTitle) {
            const titleEl = xmlDoc.createElement('sectionTitle');
            titleEl.textContent = section.sectionTitle;
            sectionElement.appendChild(titleEl);
        }

        section.fields.forEach(field => {
            const fieldEl = xmlDoc.createElement('field');
            fieldEl.setAttribute('id', field.id);
            fieldEl.setAttribute('name', field.name);
            fieldEl.setAttribute('type', field.type);
            fieldEl.setAttribute('columnSpan', field.columnSpan);
            if (field.rowId) {
                fieldEl.setAttribute('rowId', field.rowId);
            }
            sectionElement.appendChild(fieldEl);
        });

        root.appendChild(sectionElement);
    });

    xmlDoc.appendChild(root);
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(xmlDoc);
    const blob = new Blob([xmlStr], { type: 'application/xml' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'salesforce-layout.xml';
    link.click();

    closeExportModal();
    showNotification('XML layout exported successfully!', 'success');
}


function captureLayoutData() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    const layoutData = {
        sections: [],
        counters: {
            sectionCounter: sectionCounter,
            fieldCounter: fieldCounter
        },
        timestamp: new Date().toISOString()
    };

    sections.forEach(section => {
        const sectionData = {
            id: section.id,
            layoutName: '',
            recordType: '',
            sectionTitle: '',
            fields: []
        };

        // Get layout name (only for first section)
        const layoutNameInput = section.querySelector('.layout-name');
        if (layoutNameInput) {
            sectionData.layoutName = layoutNameInput.value;
        }

        // Get record type (only for first section)
        const recordTypeInput = section.querySelector('.record-type');
        if (recordTypeInput) {
            sectionData.recordType = recordTypeInput.value;
        }

        // Get section title
        const sectionTitleInput = section.querySelector('.section-title');
        if (sectionTitleInput) {
            sectionData.sectionTitle = sectionTitleInput.value;
        }

        // Get all fields
        const fieldItems = section.querySelectorAll('.field-item');
        fieldItems.forEach(field => {
            const fieldData = {
                id: field.id,
                name: '',
                type: '',
                columnSpan: 1,
                rowId: ''
            };

            // Get field name
            const fieldNameInput = field.querySelector('.field-name');
            if (fieldNameInput) {
                fieldData.name = fieldNameInput.value;
            }

            // Get field type
            const fieldTypeSelect = field.querySelector('.field-type');
            if (fieldTypeSelect) {
                fieldData.type = fieldTypeSelect.value;
            }

            // Determine column span
            const fieldRow = field.closest('.field-row');
            if (fieldRow) {
                if (fieldRow.classList.contains('field-row-single')) {
                    fieldData.columnSpan = 1;
                } else if (fieldRow.classList.contains('field-row-double')) {
                    fieldData.columnSpan = 2;
                    fieldData.rowId = fieldRow.id;
                }
            }

            sectionData.fields.push(fieldData);
        });

        layoutData.sections.push(sectionData);
    });

    return layoutData;
}

function restoreLayoutData(layoutData) {
    // Clear existing canvas
    clearCanvas();
    
    // Restore counters
    if (layoutData.counters) {
        sectionCounter = layoutData.counters.sectionCounter || 0;
        fieldCounter = layoutData.counters.fieldCounter || 0;
    }

    // Restore sections
    layoutData.sections.forEach((sectionData, index) => {
        // Create section
        const canvas = document.getElementById('layoutCanvas');
        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.remove();
            canvas.classList.add('has-content');
        }

        const sectionId = sectionData.id;
        const isFirstSection = index === 0;
        
        // Layout name field only for the first section
        const layoutNameField = isFirstSection ? 
            `<input type="text" class="layout-name" value="${sectionData.layoutName || 'My Salesforce Layout'}" placeholder="Layout Name">` : 
            '';

        // Record type field only for the first section
        const recordTypeField = isFirstSection ? 
            `<input type="text" class="record-type" value="${sectionData.recordType}" placeholder="Record Type Name">` : 
            '';
        
        const sectionHTML = `
            <div class="layout-section" id="${sectionId}">
                <div class="section-header">
                    <div class="section-info">
                        ${layoutNameField}
                        ${recordTypeField}
                        <input type="text" class="section-title" value="${sectionData.sectionTitle}" placeholder="Section Title">
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
        
        canvas.insertAdjacentHTML('beforeend', sectionHTML);

        // Restore fields
        const fieldsContainer = document.getElementById(`${sectionId}-fields`);
        const processedRows = new Set();
        
        sectionData.fields.forEach(fieldData => {
            if (fieldData.columnSpan === 1) {
                // Single column field
                const fieldHTML = `
                    <div class="field-row field-row-single" id="${fieldData.id}">
                        <div class="field-item field-single-col">
                            <input type="text" class="field-name" placeholder="Field Name" value="${fieldData.name}">
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
                            <button class="remove-field" onclick="removeField('${fieldData.id}')" title="Remove field">×</button>
                        </div>
                    </div>
                `;
                fieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
                
                // Set the selected option
                const fieldTypeSelect = document.querySelector(`#${fieldData.id} .field-type`);
                if (fieldTypeSelect) {
                    fieldTypeSelect.value = fieldData.type;
                }
                
            } else if (fieldData.columnSpan === 2 && fieldData.rowId && !processedRows.has(fieldData.rowId)) {
                // Double column field - process entire row
                processedRows.add(fieldData.rowId);
                
                // Get all fields in this row
                const rowFields = sectionData.fields.filter(f => f.rowId === fieldData.rowId);
                
                let rowHTML = `<div class="field-row field-row-double" id="${fieldData.rowId}">`;
                
                rowFields.forEach(rowField => {
                    rowHTML += `
                        <div class="field-item field-double-col" id="${rowField.id}">
                            <input type="text" class="field-name" placeholder="Field Name" value="${rowField.name}">
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
                            <button class="remove-field" onclick="removeFieldFromRow('${fieldData.rowId}', '${rowField.id}')" title="Remove field">×</button>
                        </div>
                    `;
                });
                
                // Add placeholder if only one field in row
                if (rowFields.length === 1) {
                    rowHTML += `
                        <div class="field-placeholder" onclick="addFieldToRow('${fieldData.rowId}')">
                            <span class="placeholder-text">Click to add field</span>
                        </div>
                    `;
                }
                
                rowHTML += `</div>`;
                fieldsContainer.insertAdjacentHTML('beforeend', rowHTML);
                
                // Set the selected options for all fields in this row
                rowFields.forEach(rowField => {
                    const fieldTypeSelect = document.querySelector(`#${rowField.id} .field-type`);
                    if (fieldTypeSelect) {
                        fieldTypeSelect.value = rowField.type;
                    }
                });
            }
        });
    });

    console.log('Layout restored successfully');
}


// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Helper function to get field value
function getFieldValue(element, fallback = '') {
    if (!element) return fallback;
    
    // Get the actual value, trimmed
    const value = element.value ? element.value.trim() : '';
    
    // If empty, return fallback
    return value || fallback;
}

// Helper function to get selected option text
function getSelectedOptionText(selectElement, fallback = 'Text') {
    if (!selectElement) return fallback;
    
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    return selectedOption ? selectedOption.text : fallback;
}

// Export Functions
function exportAsPDF() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    
    if (sections.length === 0) {
        alert('No layout to export. Please add some components first.');
        return;
    }

    // Temporarily expand field inputs to show full text
    const fieldInputs = canvas.querySelectorAll('.field-name');
    const originalStyles = [];
    
    fieldInputs.forEach((input, index) => {
        originalStyles[index] = {
            width: input.style.width,
            minWidth: input.style.minWidth
        };
        input.style.width = 'auto';
        input.style.minWidth = input.scrollWidth + 'px';
    });

    html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f5f5',
        width: canvas.scrollWidth,
        height: canvas.scrollHeight
    }).then(canvasElement => {
        // Restore original styles
        fieldInputs.forEach((input, index) => {
            input.style.width = originalStyles[index].width;
            input.style.minWidth = originalStyles[index].minWidth;
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        const imgData = canvasElement.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvasElement.height * imgWidth) / canvasElement.width;
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

    // Get layout name from first section
    const layoutNameInput = sections[0].querySelector('.layout-name');
    const layoutName = getFieldValue(layoutNameInput, 'Salesforce Page Layout');

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${layoutName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1E88E5; text-align: center; font-size: 2rem; }
                h2 { color: #1565C0; border-bottom: 2px solid #E3F2FD; padding-bottom: 5px; }
                h3 { color: #8BC34A; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-wrap: break-word; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .record-type { background-color: #F1F8E9; padding: 10px; margin: 10px 0; border-left: 4px solid #8BC34A; }
                .section { margin: 20px 0; }
                .field-name { max-width: 200px; word-wrap: break-word; }
                .field-type { max-width: 150px; word-wrap: break-word; }
            </style>
        </head>
        <body>
            <h1>${layoutName}</h1>
    `;

    sections.forEach((section, index) => {
        const recordTypeInput = section.querySelector('.record-type');
        const sectionTitleInput = section.querySelector('.section-title');
        
        const recordType = getFieldValue(recordTypeInput, '');
        const sectionTitle = getFieldValue(sectionTitleInput, `Section ${index + 1}`);
        
        htmlContent += `<div class="section">`;
        
        if (recordType) {
            htmlContent += `<div class="record-type"><strong>Record Type:</strong> ${recordType}</div>`;
        }
        
        htmlContent += `<h3>${sectionTitle}</h3>`;
        
        const fields = section.querySelectorAll('.field-item');
        if (fields.length > 0) {
            htmlContent += `
                <table>
                    <thead>
                        <tr>
                            <th>Field Name</th>
                            <th>Data Type</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            fields.forEach((field, fieldIndex) => {
                const fieldNameInput = field.querySelector('.field-name');
                const fieldTypeSelect = field.querySelector('.field-type');
                
                const fieldName = getFieldValue(fieldNameInput, `Field ${fieldIndex + 1}`);
                const fieldType = getSelectedOptionText(fieldTypeSelect, 'Text');
                
                htmlContent += `
                    <tr>
                        <td class="field-name">${fieldName}</td>
                        <td class="field-type">${fieldType}</td>
                    </tr>
                `;
            });
            
            htmlContent += `
                    </tbody>
                </table>
            `;
        }
        
        htmlContent += `</div>`;
    });

    htmlContent += `
        </body>
        </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], {
        type: 'application/msword;charset=utf-8'
    });
    
    // Use FileSaver.js to save the file
    saveAs(blob, `${layoutName.replace(/[^a-zA-Z0-9]/g, '-')}.doc`);
    closeExportModal();
}

function exportAsXLS() {
    const canvas = document.getElementById('layoutCanvas');
    const sections = canvas.querySelectorAll('.layout-section');
    
    if (sections.length === 0) {
        alert('No layout to export. Please add some components first.');
        return;
    }

    // Get layout name from first section
    const layoutNameInput = sections[0].querySelector('.layout-name');
    const layoutName = getFieldValue(layoutNameInput, 'Salesforce Page Layout');

    const wb = XLSX.utils.book_new();
    const wsData = [];
    
    // Add header with layout name
    wsData.push([layoutName]);
    wsData.push([]); // Empty row
    
    sections.forEach((section, index) => {
        const recordTypeInput = section.querySelector('.record-type');
        const sectionTitleInput = section.querySelector('.section-title');
        
        const recordType = getFieldValue(recordTypeInput, '');
        const sectionTitle = getFieldValue(sectionTitleInput, `Section ${index + 1}`);
        
        // Add section info
        if (recordType) {
            wsData.push([`Record Type: ${recordType}`]);
        }
        wsData.push([sectionTitle]);
        wsData.push(['Field Name', 'Data Type']); // Header row
        
        const fields = section.querySelectorAll('.field-item');
        fields.forEach((field, fieldIndex) => {
            const fieldNameInput = field.querySelector('.field-name');
            const fieldTypeSelect = field.querySelector('.field-type');
            
            const fieldName = getFieldValue(fieldNameInput, `Field ${fieldIndex + 1}`);
            const fieldType = getSelectedOptionText(fieldTypeSelect, 'Text');
            
            wsData.push([fieldName, fieldType]);
        });
        
        wsData.push([]); // Empty row between sections
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-adjust column widths
    const colWidths = [];
    wsData.forEach(row => {
        row.forEach((cell, colIndex) => {
            const cellLength = cell ? cell.toString().length : 0;
            colWidths[colIndex] = Math.max(colWidths[colIndex] || 0, cellLength);
        });
    });
    
    ws['!cols'] = colWidths.map(width => ({ wch: Math.min(width + 5, 50) }));
    
    // Style the header
    ws['A1'] = { v: layoutName, t: 's', s: { font: { bold: true, sz: 16 } } };
    
    XLSX.utils.book_append_sheet(wb, ws, 'Layout');
    XLSX.writeFile(wb, `${layoutName.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`);
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
    
    // Layout name field only for the first section
    const layoutNameField = sectionCounter === 1 ? 
        `<input type="text" class="layout-name" value="My Salesforce Layout" placeholder="Layout Name">` : 
        '';

    // Record type field only for the first section
    const recordTypeField = sectionCounter === 1 ? 
        `<input type="text" class="record-type" value="Record Type ${sectionCounter}" placeholder="Record Type Name">` : 
        '';
    
    const sectionHTML = `
        <div class="layout-section" id="${sectionId}">
            <div class="section-header">
                <div class="section-info">
                    ${layoutNameField}
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
    
    // Auto-load draft when page loads
    const draftLoaded = loadDraft();
    if (draftLoaded) {
        console.log('Previous draft loaded automatically');
    }
});