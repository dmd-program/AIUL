document.addEventListener('DOMContentLoaded', function() {
    // Load Kanit font and ensure it's loaded before generating images
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Create a font loader to ensure fonts are loaded
    document.fonts.ready.then(function() {
        console.log("Fonts loaded and ready for use");
    });
    
    // Get elements
    const tagTypeSelect = document.getElementById('tagType');
    const useModifierCheckbox = document.getElementById('useModifier');
    const modifierGroup = document.querySelector('.modifier-group');
    const modifierTypeSelect = document.getElementById('modifierType');
    const tagSizeSelect = document.getElementById('tagSize');
    const generateTagButton = document.getElementById('generateTag');
    const downloadPNGButton = document.getElementById('downloadPNG');
    const downloadSVGButton = document.getElementById('downloadSVG');
    
    const tagContainer = document.getElementById('tagContainer');
    const tagMain = document.querySelector('.tag-main');
    const tagText = document.querySelector('.tag-text');
    const tagModifier = document.querySelector('.tag-modifier');
    const modifierText = document.querySelector('.modifier-text');
    const downloadMessage = document.querySelector('.download-message');
    
    // Get the syllabus language elements
    const syllabusLanguage = document.getElementById('syllabusLanguage');
    const syllabusText = document.getElementById('syllabusText');
    const copySyllabus = document.getElementById('copySyllabus');

    // Initialize with default values
    updateTagText(tagTypeSelect.value);
    updateModifierText(modifierTypeSelect.value);
    updateTagSize(tagSizeSelect.value);
    
    // Call updatePreview once on initial load to ensure proper styling
    updatePreview();
    
    // Event listeners
    useModifierCheckbox.addEventListener('change', function() {
        modifierGroup.style.display = this.checked ? 'block' : 'none';
        tagModifier.style.display = this.checked ? 'flex' : 'none';
        updatePreview();
    });
    
    tagTypeSelect.addEventListener('change', function() {
        updateTagText(this.value);
        updatePreview();
    });
    
    modifierTypeSelect.addEventListener('change', function() {
        updateModifierText(this.value);
        updatePreview();
    });
    
    // Force update preview when size changes
    tagSizeSelect.addEventListener('change', function() {
        updateTagSize(this.value);
        // Apply border width explicitly based on selected size
        const borderWidth = getBorderWidth();
        tagMain.style.borderWidth = borderWidth + 'px';
        tagModifier.style.borderWidth = borderWidth + 'px';
        updatePreview();
    });
    
    generateTagButton.addEventListener('click', function() {
        // Set current date/time for filename
        window.generatedAt = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Ensure the preview matches what will be downloaded
        updatePreview();
        
        // Make download buttons active
        downloadPNGButton.disabled = false;
        downloadSVGButton.disabled = false;
        
        // Show success message
        showMessage('Tag generated successfully! You can now download it.', 'success');
        
        // Store the original SVG for later use
        window.generatedSVG = createSVG(false);

        // Generate syllabus language
        generateSyllabusLanguage();
        
        // Show the syllabus language section
        syllabusLanguage.style.display = 'block';
        
        // Scroll to the syllabus language section
        setTimeout(function() {
            syllabusLanguage.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });
    // Copy to clipboard functionality
    copySyllabus.addEventListener('click', function() {
        navigator.clipboard.writeText(syllabusText.textContent)
            .then(() => {
                showMessage('Syllabus language copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showMessage('Failed to copy to clipboard. Please try again.', 'error');
            });
    });
    function generateSyllabusLanguage() {
        const tagType = tagTypeSelect.value;
        const useModifier = useModifierCheckbox.checked;
        const modifierType = useModifier ? modifierTypeSelect.value : null;
        
        // Get the license name based on the tag type
        let licenseName, licenseDesc;
        switch(tagType) {
            case 'NA':
                licenseName = 'Not Allowed';
                licenseDesc = 'no AI tools are permitted. All work must be entirely your own without assistance from AI tools.';
                break;
            case 'WA':
                licenseName = 'With Approval';
                licenseDesc = 'limited AI assistance is permitted only with instructor pre-approval. If you wish to use any AI tools, you must request permission in advance and document how they will be used.';
                break;
            case 'CD':
                licenseName = 'Conceptual Development';
                licenseDesc = 'you may use AI tools for research and idea generation, but the final work must be entirely your own. You must document any AI tools used in your process.';
                break;
            case 'TC':
                licenseName = 'Transformative Collaboration';
                licenseDesc = 'you may use AI as a collaborative tool, but you must significantly transform and modify any AI outputs. Your work should demonstrate critical thinking and creative direction.';
                break;
            case 'DP':
                licenseName = 'Directed Production';
                licenseDesc = 'you may use AI-assisted creation with clear direction and modification from you. The concept, direction, and post-processing should demonstrate your creative input.';
                break;
            case 'IU':
                licenseName = 'Integrated Usage';
                licenseDesc = 'AI usage is a required component of this assignment. You are expected to demonstrate sophisticated use of AI tools and document your process thoroughly.';
                break;
        }
        
        // Get the modifier description if applicable
        let modifierName = '';
        let modifierDesc = '';
        
        if (useModifier && modifierType) {
            switch(modifierType) {
                case 'WR':
                    modifierName = 'Writing';
                    modifierDesc = 'This applies specifically to written content.';
                    break;
                case 'IM':
                    modifierName = 'Image';
                    modifierDesc = 'This applies specifically to visual content.';
                    break;
                case 'VD':
                    modifierName = 'Video';
                    modifierDesc = 'This applies specifically to video content.';
                    break;
                case 'AU':
                    modifierName = 'Audio';
                    modifierDesc = 'This applies specifically to audio content.';
                    break;
                case '3D':
                    modifierName = '3D Design';
                    modifierDesc = 'This applies specifically to 3D modeling and design.';
                    break;
                case 'TR':
                    modifierName = 'Traditional Media';
                    modifierDesc = 'This applies specifically to physical art media.';
                    break;
                case 'MX':
                    modifierName = 'Mixed Media';
                    modifierDesc = 'This applies to projects combining multiple media types.';
                    break;
            }
        }
        
        // Generate the syllabus text
        let syllabusString = `<strong>AIUL-${tagType}${useModifier ? '-'+modifierType : ''}:</strong> This assignment is tagged AIUL-${tagType}${useModifier ? '-'+modifierType : ''} (${licenseName}${useModifier ? ' for '+modifierName : ''}), which means ${licenseDesc} ${modifierDesc}`;
        
        // Add documentation requirements for CD through IU
        if (['CD', 'TC', 'DP', 'IU'].includes(tagType)) {
            syllabusString += `<p><strong>Documentation Requirement:</strong> For this assignment, you must include documentation of your AI usage process including:</p>
            <ul>
                <li>Which AI tools you used</li>
                <li>How you used them in your process</li>
                <li>What prompts or inputs you provided</li>
                <li>How you modified or integrated AI outputs</li>
                <li>Your reflections on the human-AI collaboration process</li>
            </ul>`;
        }
        
        // Set the syllabus text
        syllabusText.innerHTML = syllabusString;
    }
    downloadPNGButton.addEventListener('click', function() {
        downloadAsPNG();
    });
    
    downloadSVGButton.addEventListener('click', function() {
        downloadAsSVG();
    });
    
    // Functions
    function updateTagText(value) {
        tagText.textContent = 'AIUL-' + value;
    }
    
    function updateModifierText(value) {
        modifierText.textContent = value;
    }
    
    function updateTagSize(size) {
        // Remove all size classes
        tagContainer.classList.remove('tag-size-small', 'tag-size-medium', 'tag-size-large');
        
        // Add the selected size class
        tagContainer.classList.add('tag-size-' + size);
    }
    
    function updatePreview() {
        // Update tag text
        updateTagText(tagTypeSelect.value);
        
        // Update modifier visibility
        tagModifier.style.display = useModifierCheckbox.checked ? 'flex' : 'none';
        
        // Update modifier text if visible
        if (useModifierCheckbox.checked) {
            updateModifierText(modifierTypeSelect.value);
        }
        
        // Update tag size
        updateTagSize(tagSizeSelect.value);
        
        // Ensure all styling is applied correctly - apply border to both parts
        tagMain.style.backgroundColor = 'white';
        tagMain.style.border = getBorderWidth() + 'px solid black';
        tagMain.style.boxSizing = 'border-box';
        
        tagModifier.style.backgroundColor = 'black';
        tagModifier.style.color = 'white';
        tagModifier.style.border = getBorderWidth() + 'px solid black';
        tagModifier.style.boxSizing = 'border-box';
        
        // Force a repaint to ensure everything is updated
        tagContainer.style.opacity = '0.99';
        setTimeout(function() {
            tagContainer.style.opacity = '1';
        }, 50);
    }
    
    function getBorderWidth() {
        switch(tagSizeSelect.value) {
            case 'small': return 6;  
            case 'large': return 12; 
            default: return 8;       
        }
    }
    
    function showMessage(message, type) {
        downloadMessage.textContent = message;
        downloadMessage.className = 'download-message';
        if (type) {
            downloadMessage.classList.add(type);
        }
        
        // Clear message after 5 seconds
        setTimeout(function() {
            downloadMessage.textContent = '';
            downloadMessage.className = 'download-message';
        }, 5000);
    }
    
    function createSVG(forPNG = false) {
        // This is a simplified but more accurate approach
        const tagSize = tagSizeSelect.value;
        
        // Define font sizes and border widths based on tag size
        let fontSize, borderWidth, padding;
        switch(tagSize) {
            case 'small':
                fontSize = 24;
                borderWidth = 6;  // Updated to match SCSS
                padding = 8;
                break;
            case 'large':
                fontSize = 48;
                borderWidth = 12; // Updated to match SCSS
                padding = 16;
                break;
            default: // medium
                fontSize = 32;
                borderWidth = 8;  // Updated to match SCSS
                padding = 12;
        }
        
        // Get text content
        const mainText = tagText.textContent;
        
        // Calculate main tag width based on approximate character width
        const charWidth = fontSize * 0.6;
        const mainTextWidth = mainText.length * charWidth;
        const tagWidth = mainTextWidth + (padding * 2);
        const tagHeight = fontSize + (padding * 2);
        
        // Start SVG with proper dimensions
        let totalWidth = tagWidth;
        let totalHeight = tagHeight;
        
        // Calculate modifier dimensions if needed
        let modifierWidth = 0;
        let modifierText = '';
        
        if (useModifierCheckbox.checked) {
            modifierText = modifierTypeSelect.value;
            modifierWidth = modifierText.length * charWidth + (padding * 2);
            totalWidth += modifierWidth;
        }
        
        // Create SVG with embedded styles
        // Note: We set exact dimensions without extra padding
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
        
        // Add embedded font and exact styling for better rendering
        svg += `<defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;700&amp;display=swap');
                .tag-text { 
                    font-family: 'Kanit', sans-serif;
                    font-weight: 700;
                    font-size: ${fontSize}px;
                }
                .modifier-text { 
                    font-family: 'Kanit', sans-serif;
                    font-weight: 300;
                    font-size: ${fontSize}px;
                    fill: white;
                }
            </style>
        </defs>`;
        
        // For direct SVG download (not for PNG conversion), use regular border width
        // For PNG conversion, use thicker border if specified
        const actualBorderWidth = forPNG ? borderWidth * 2 : borderWidth;
        
        // Main tag rectangle
        svg += `<rect x="0" y="0" width="${tagWidth}" height="${tagHeight}" 
                fill="white" stroke="black" stroke-width="${actualBorderWidth}" />`;
        
        // For Illustrator compatibility, we'll add the text inside a group with alignment
        svg += `<g>
            <!-- Main tag text in the center -->
            <text x="${tagWidth / 2}" y="${tagHeight / 2 + fontSize/3}" 
                class="tag-text" text-anchor="middle">${mainText}</text>
        </g>`;
        
        // Add modifier if needed
        if (useModifierCheckbox.checked) {
            const modifierX = tagWidth;
            
            // Modifier rectangle - now with stroke matching the main box
            svg += `<rect x="${modifierX}" y="0" width="${modifierWidth}" height="${tagHeight}" 
                    fill="black" stroke="black" stroke-width="${actualBorderWidth}" />`;
            
            // Modifier text - also in a group with alignment
            svg += `<g>
                <text x="${modifierX + (modifierWidth / 2)}" y="${tagHeight / 2 + fontSize/3}" 
                    class="modifier-text" text-anchor="middle">${modifierText}</text>
            </g>`;
        }
        
        svg += '</svg>';
        return svg;
    }
    
    function downloadAsPNG() {
        try {
            // First create an SVG using our working SVG method - with flag for PNG
            const svgContent = createSVG(true); // Pass true to indicate PNG conversion
            
            // Create an image element to load the SVG
            const img = new Image();
            
            // Set up error handling
            img.onerror = function() {
                console.error('Error loading SVG into image');
                showMessage('Error generating PNG. Please try again.', 'error');
            };
            
            // Set up the onload handler to convert to canvas when image loads
            img.onload = function() {
                // For modern displays, use a much higher scale factor
                const scale = 8; // Fixed high resolution scale
                
                // Get the intrinsic size of the SVG
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;
                
                // Create a canvas with the scaled dimensions
                const canvas = document.createElement('canvas');
                canvas.width = width * scale;
                canvas.height = height * scale;
                
                // Get 2d context and enable high quality rendering
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Fill with white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the scaled image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Create a download link with high-quality PNG
                const link = document.createElement('a');
                
                // Get filename with timestamp
                const tagType = tagTypeSelect.value;
                const useModifier = useModifierCheckbox.checked;
                const modifierType = useModifier ? modifierTypeSelect.value : '';
                const timestamp = window.generatedAt || new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `AIUL-${tagType}${useModifier ? '-' + modifierType : ''}_${timestamp}.png`;
                
                link.download = filename;
                
                // Use maximum quality PNG encoding
                link.href = canvas.toDataURL('image/png', 1.0);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showMessage('High-resolution PNG file downloaded successfully!', 'success');
                
                // Clean up
                URL.revokeObjectURL(img.src);
            };
            
            // Load the SVG as a data URL
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            img.src = svgUrl;
        } catch (error) {
            console.error('Error generating PNG:', error);
            showMessage('Error generating PNG. Please try again.', 'error');
        }
    }
    
    function downloadAsSVG() {
        try {
            // Create SVG content
            const svgContent = createSVG(false);
            
            // Create a download link
            const link = document.createElement('a');
            
            // Get filename with timestamp
            const tagType = tagTypeSelect.value;
            const useModifier = useModifierCheckbox.checked;
            const modifierType = useModifier ? modifierTypeSelect.value : '';
            const timestamp = window.generatedAt || new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `AIUL-${tagType}${useModifier ? '-' + modifierType : ''}_${timestamp}.svg`;
            
            link.download = filename;
            
            // Create a blob from the SVG content
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            setTimeout(function() {
                URL.revokeObjectURL(link.href);
            }, 100);
            
            showMessage('SVG file downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating SVG:', error);
            showMessage('Error generating SVG. Please try again.', 'error');
        }
    }
});