// Challenge Renderer - Visualizes components and provides interactive controls
export class ChallengeRenderer {
    constructor() {
        this.canvas = document.getElementById('uiCanvas');
        this.controlsPanel = document.getElementById('propertyControls');
    }

    render(components, onUpdate) {
        this.renderCanvas(components);
        this.renderControls(components, onUpdate);
    }

    renderCanvas(components) {
        if (!this.canvas) return;
        
        let html = '<div class="component-workspace">';
        
        components.forEach(comp => {
            const props = comp.properties;
            const rendered = comp.render();
            
            html += `
                <div class="ui-component ${comp.type}" 
                     data-id="${comp.id}"
                     style="
                         position: absolute;
                         left: ${props.x}px;
                         top: ${props.y}px;
                         width: ${props.width}px;
                         height: ${props.height}px;
                         font-size: ${props.fontSize}px;
                         font-weight: ${props.fontWeight};
                         color: ${props.color};
                         background-color: ${props.backgroundColor};
                         padding: ${props.padding}px;
                         margin: ${props.margin}px;
                         border-radius: ${props.borderRadius}px;
                         display: flex;
                         align-items: center;
                         justify-content: center;
                         box-sizing: border-box;
                         z-index: ${props.zIndex};
                     ">
                    ${rendered.content}
                </div>
            `;
        });
        
        html += '</div>';
        this.canvas.innerHTML = html;
    }

    renderControls(components, onUpdate) {
        if (!this.controlsPanel) return;
        
        let html = '<div class="controls-wrapper">';
        
        // Component selector
        html += '<div class="control-group">';
        html += '<label>Select Component:</label>';
        html += '<select id="componentSelector" class="component-select">';
        components.forEach(comp => {
            html += `<option value="${comp.id}">${comp.content || comp.id}</option>`;
        });
        html += '</select>';
        html += '</div>';
        
        // Add controls for first component by default
        if (components.length > 0) {
            html += this.renderComponentControls(components[0], onUpdate);
        }
        
        html += '</div>';
        this.controlsPanel.innerHTML = html;
        
        // Set up component selector change
        const selector = document.getElementById('componentSelector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                const selectedComp = components.find(c => c.id === e.target.value);
                if (selectedComp) {
                    this.controlsPanel.innerHTML = '<div class="controls-wrapper">' +
                        this.renderComponentControls(selectedComp, onUpdate) +
                        '</div>';
                    this.setupControlListeners(selectedComp, onUpdate);
                }
            });
        }
        
        this.setupControlListeners(components[0], onUpdate);
    }

    renderComponentControls(component, onUpdate) {
        const props = component.properties;
        
        let html = `<div class="component-controls" data-component="${component.id}">`;
        
        // Size controls
        html += '<div class="control-group">';
        html += '<label>Width:</label>';
        html += `<input type="range" data-prop="width" min="50" max="500" value="${props.width}" />`;
        html += `<span class="value-display">${props.width}px</span>`;
        html += '</div>';
        
        html += '<div class="control-group">';
        html += '<label>Height:</label>';
        html += `<input type="range" data-prop="height" min="20" max="200" value="${props.height}" />`;
        html += `<span class="value-display">${props.height}px</span>`;
        html += '</div>';
        
        // Font controls
        html += '<div class="control-group">';
        html += '<label>Font Size:</label>';
        html += `<input type="range" data-prop="fontSize" min="10" max="48" value="${props.fontSize}" />`;
        html += `<span class="value-display">${props.fontSize}px</span>`;
        html += '</div>';
        
        html += '<div class="control-group">';
        html += '<label>Font Weight:</label>';
        html += `<select data-prop="fontWeight">
            <option value="300" ${props.fontWeight === 300 ? 'selected' : ''}>Light</option>
            <option value="400" ${props.fontWeight === 400 ? 'selected' : ''}>Normal</option>
            <option value="500" ${props.fontWeight === 500 ? 'selected' : ''}>Medium</option>
            <option value="600" ${props.fontWeight === 600 ? 'selected' : ''}>Semibold</option>
            <option value="700" ${props.fontWeight === 700 ? 'selected' : ''}>Bold</option>
        </select>`;
        html += '</div>';
        
        // Color controls
        html += '<div class="control-group">';
        html += '<label>Text Color:</label>';
        html += `<input type="color" data-prop="color" value="${props.color}" />`;
        html += '</div>';
        
        html += '<div class="control-group">';
        html += '<label>Background:</label>';
        html += `<input type="color" data-prop="backgroundColor" value="${props.backgroundColor}" />`;
        html += '</div>';
        
        // Spacing controls
        html += '<div class="control-group">';
        html += '<label>Padding:</label>';
        html += `<input type="range" data-prop="padding" min="0" max="40" value="${props.padding}" />`;
        html += `<span class="value-display">${props.padding}px</span>`;
        html += '</div>';
        
        html += '<div class="control-group">';
        html += '<label>Margin:</label>';
        html += `<input type="range" data-prop="margin" min="0" max="40" value="${props.margin}" />`;
        html += `<span class="value-display">${props.margin}px</span>`;
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }

    setupControlListeners(component, onUpdate) {
        const controls = document.querySelectorAll('.component-controls input, .component-controls select');
        
        controls.forEach(control => {
            const prop = control.dataset.prop;
            const updateHandler = () => {
                let value = control.type === 'range' || control.type === 'number' 
                    ? parseInt(control.value) 
                    : control.value;
                
                if (control.tagName === 'SELECT') {
                    value = parseInt(value);
                }
                
                onUpdate(component.id, prop, value);
                
                // Update value display for range inputs
                const valueDisplay = control.parentElement.querySelector('.value-display');
                if (valueDisplay && control.type === 'range') {
                    valueDisplay.textContent = `${value}px`;
                }
            };
            
            control.addEventListener('input', updateHandler);
            control.addEventListener('change', updateHandler);
        });
    }
}
