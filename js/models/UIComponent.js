// Domain Model: UIComponent
export class UIComponent {
    constructor(id, type, properties) {
        this.id = id;
        this.type = type; // 'button', 'heading', 'text', 'input', etc.
        this.properties = {
            x: properties.x || 0,
            y: properties.y || 0,
            width: properties.width || 100,
            height: properties.height || 40,
            fontSize: properties.fontSize || 16,
            fontWeight: properties.fontWeight || 400,
            color: properties.color || '#000000',
            backgroundColor: properties.backgroundColor || '#FFFFFF',
            padding: properties.padding || 8,
            margin: properties.margin || 0,
            borderRadius: properties.borderRadius || 0,
            semanticRole: properties.semanticRole || 'normal', // 'primary', 'secondary', 'normal'
            zIndex: properties.zIndex || 1
        };
        this.content = properties.content || '';
    }

    updateProperty(key, value) {
        if (key in this.properties) {
            this.properties[key] = value;
        }
    }

    // Calculate visual weight for perception engine
    getVisualWeight() {
        const sizeWeight = (this.properties.width * this.properties.height) / 10000;
        const contrastWeight = this.getContrast() / 21; // WCAG max contrast
        const positionWeight = (1 - this.properties.y / 1000) * 0.3; // Top elements get more weight
        const semanticWeight = {
            'primary': 1.5,
            'secondary': 1.0,
            'normal': 0.7
        }[this.properties.semanticRole];

        return (sizeWeight + contrastWeight + positionWeight) * semanticWeight;
    }

    // Calculate relative luminance for contrast
    getLuminance(color) {
        const rgb = this.hexToRgb(color);
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    getContrast() {
        const fgLum = this.getLuminance(this.properties.color);
        const bgLum = this.getLuminance(this.properties.backgroundColor);
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        return (lighter + 0.05) / (darker + 0.05);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    render() {
        return {
            ...this.properties,
            content: this.content,
            id: this.id,
            type: this.type
        };
    }
}
