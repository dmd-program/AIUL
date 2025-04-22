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
    // Size selector removed as we're standardizing on medium size
    const generateTagButton = document.getElementById('generateTag');
    const downloadPNGButton = document.getElementById('downloadPNG');
    const downloadSVGButton = document.getElementById('downloadSVG');
    
    let tagContainer = document.getElementById('tagContainer');
    let tagMain = document.querySelector('.tag-main');
    let tagText = document.querySelector('.tag-text');
    let tagModifier = document.querySelector('.tag-modifier');
    let modifierText = document.querySelector('.modifier-text');
    const downloadMessage = document.querySelector('.download-message');
    
    // Get the syllabus language elements
    const syllabusLanguage = document.getElementById('syllabusLanguage');
    const syllabusText = document.getElementById('syllabusText');
    const copySyllabus = document.getElementById('copySyllabus');

    // Get embed code elements
    const embedCodeSection = document.getElementById('embedCodeSection');
    const linkEmbedButton = document.getElementById('linkEmbed');
    const inlineEmbedButton = document.getElementById('inlineEmbed');
    const embedCodeDisplay = document.getElementById('embedCode');
    const copyEmbedCodeButton = document.getElementById('copyEmbedCode');
    const embedPreview = document.getElementById('embedPreview');

    // Debug log to check initial values
    console.log('Initial tag type value:', tagTypeSelect.value);
    console.log('Initial select options:', Array.from(tagTypeSelect.options).map(o => o.value));

    // Initialize with default values
    updateTagText(tagTypeSelect.value);
    updateModifierText(modifierTypeSelect.value);
    // Always use medium size
    tagContainer.classList.add('tag-size-medium');
    
    // Call updatePreview once on initial load to ensure proper styling
    updatePreview();
    
    // Event listeners
    useModifierCheckbox.addEventListener('change', function() {
        // Show/hide the modifier selection dropdown
        modifierGroup.style.display = this.checked ? 'block' : 'none';
        
        // Log the change for debugging
        console.log('Media modifier checkbox changed to:', this.checked);
        
        // Force a complete preview recreation
        updatePreview();
        
        // Add a visual indicator that the preview has been updated
        const tagPreview = document.getElementById('tagPreview');
        tagPreview.style.transition = 'all 0.3s ease';
        tagPreview.style.backgroundColor = this.checked ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)';
        
        setTimeout(function() {
            tagPreview.style.backgroundColor = '';
        }, 500);
    });
    
    tagTypeSelect.addEventListener('change', function() {
        console.log('License changed to:', this.value);
        updateTagText(this.value);
        updatePreview();
    });
    
    modifierTypeSelect.addEventListener('change', function() {
        console.log('Modifier type changed to:', this.value);
        
        // Force a complete preview recreation immediately
        updatePreview();
        
        // Visual feedback for the change
        const tagPreview = document.getElementById('tagPreview');
        tagPreview.style.transition = 'all 0.3s ease';
        tagPreview.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
        
        setTimeout(function() {
            tagPreview.style.backgroundColor = '';
        }, 500);
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
        
        // Generate embed code
        generateEmbedCode('linked');
        
        // Show the embed code section
        embedCodeSection.style.display = 'block';
        
        // Scroll to the syllabus language section
        setTimeout(function() {
            syllabusLanguage.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    // Toggle between embed code types
    linkEmbedButton.addEventListener('click', function() {
        linkEmbedButton.classList.add('active');
        inlineEmbedButton.classList.remove('active');
        generateEmbedCode('linked');
    });

    inlineEmbedButton.addEventListener('click', function() {
        inlineEmbedButton.classList.add('active');
        linkEmbedButton.classList.remove('active');
        generateEmbedCode('inline');
    });

    // Copy embed code functionality
    copyEmbedCodeButton.addEventListener('click', function() {
        navigator.clipboard.writeText(embedCodeDisplay.textContent)
            .then(() => {
                showMessage('Embed code copied to clipboard!', 'success');
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Code';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showMessage('Failed to copy to clipboard. Please try again.', 'error');
            });
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
    
    downloadPNGButton.addEventListener('click', function() {
        downloadAsPNG();
    });
    
    downloadSVGButton.addEventListener('click', function() {
        downloadAsSVG();
    });
    
    // Functions
    function updateTagText(value) {
        // Make sure the tag text is being set correctly
        const newText = 'AIUL-' + value;
        tagText.textContent = newText;
        console.log('Tag text updated to:', newText);
    }
    
    function updateModifierText(value) {
        modifierText.textContent = value;
    }
    
    function updatePreview() {
        // Get the current values
        const licenseCode = tagTypeSelect.value;
        const useModifier = useModifierCheckbox.checked;
        const modifierValue = modifierTypeSelect.value;
        
        console.log('Recreating preview with:', 'AIUL-' + licenseCode);
        
        // Get the parent container where the tag preview lives
        const tagPreview = document.getElementById('tagPreview');
        
        // Create a completely new tag container
        const newTagContainer = document.createElement('div');
        newTagContainer.id = 'tagContainer';
        newTagContainer.className = 'tag-size-medium';
        
        // Create the main tag element
        const newTagMain = document.createElement('div');
        newTagMain.className = 'tag-main';
        newTagMain.style.backgroundColor = 'white';
        newTagMain.style.border = getBorderWidth() + 'px solid black';
        newTagMain.style.boxSizing = 'border-box';
        
        // Create the tag text
        const newTagText = document.createElement('span');
        newTagText.className = 'tag-text';
        newTagText.textContent = 'AIUL-' + licenseCode;
        newTagMain.appendChild(newTagText);
        
        // Add the main tag to the container
        newTagContainer.appendChild(newTagMain);
        
        // Create the modifier if needed
        if (useModifier) {
            const newTagModifier = document.createElement('div');
            newTagModifier.className = 'tag-modifier';
            newTagModifier.style.display = 'flex';
            newTagModifier.style.backgroundColor = 'black';
            newTagModifier.style.color = 'white';
            newTagModifier.style.border = getBorderWidth() + 'px solid black';
            newTagModifier.style.boxSizing = 'border-box';
            
            const newModifierText = document.createElement('span');
            newModifierText.className = 'modifier-text';
            newModifierText.textContent = modifierValue;
            newTagModifier.appendChild(newModifierText);
            
            newTagContainer.appendChild(newTagModifier);
        }
        
        // Replace the old tag container with the new one
        while (tagPreview.firstChild) {
            tagPreview.removeChild(tagPreview.firstChild);
        }
        tagPreview.appendChild(newTagContainer);
        
        // Update our references to the new elements
        tagContainer = newTagContainer;
        tagMain = newTagContainer.querySelector('.tag-main');
        tagText = newTagContainer.querySelector('.tag-text');
        tagModifier = newTagContainer.querySelector('.tag-modifier');
        modifierText = newTagContainer.querySelector('.modifier-text');
        
        console.log('Preview recreated with:', newTagText.textContent);
    }
    
    function getBorderWidth() {
        return 12; // Standardized border width for medium size
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

    function generateEmbedCode(type = 'linked') {
        const tagType = tagTypeSelect.value;
        const useModifier = useModifierCheckbox.checked;
        const modifierType = useModifier ? modifierTypeSelect.value : '';
        const tagFullName = getTagFullName(tagType);
        const modifierFullName = useModifier ? getModifierFullName(modifierType) : '';
        const tagCode = `AIUL-${tagType}${useModifier ? '-' + modifierType : ''}`;
        
        // Dynamically determine the base URL from the current page location
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        
        // Get the origin (protocol + hostname + port)
        const origin = window.location.origin;
        
        // Find the base path by looking for common patterns
        let basePath = '';
        const aiulIndex = urlParts.findIndex(part => part === 'aiul' || part.includes('aiul'));
        if (aiulIndex !== -1) {
            // If we found 'aiul' in the path, take everything up to and including it
            basePath = urlParts.slice(0, aiulIndex + 1).join('/').replace(origin, '');
        }
        
        // Construct full URLs for license and image
        const licenseUrl = `${origin}${basePath}/licenses/${tagType.toLowerCase()}.html`;
        const licenseImageUrl = `${origin}${basePath}/assets/images/licenses/${tagCode.toLowerCase()}.png`;
        
        let embedCode = '';
        
        if (type === 'linked') {
            // Generate code using a link to a hosted image on the website
            embedCode = `<a href="${licenseUrl}" title="AIUL ${tagCode} License: ${tagFullName}${useModifier ? ' for ' + modifierFullName : ''}" target="_blank" rel="license">
  <img alt="${tagCode} - ${tagFullName}${useModifier ? ' for ' + modifierFullName : ''}" src="${licenseImageUrl}" style="border-width:0; max-width:170px;" />
</a>
<br />
This work is licensed under a <a href="${licenseUrl}" target="_blank" rel="license">AI Usage License ${tagCode}</a>.`;
        } else {
            // Generate self-contained HTML/CSS code
            embedCode = `<style>
.aiul-tag {
  display: inline-flex;
  font-family: Arial, sans-serif;
  font-weight: bold;
  text-decoration: none;
}
.aiul-main {
  background-color: white;
  color: black;
  border: 2px solid black;
  padding: 4px 8px;
  display: flex;
  align-items: center;
}
.aiul-modifier {
  background-color: black;
  color: white;
  border: 2px solid black;
  padding: 4px 8px;
  display: flex;
  align-items: center;
}
</style>
<a href="${licenseUrl}" class="aiul-tag" title="AIUL ${tagCode} License: ${tagFullName}${useModifier ? ' for ' + modifierFullName : ''}" target="_blank" rel="license">
  <span class="aiul-main">${tagCode.split('-')[0]}-${tagCode.split('-')[1]}</span>
  ${useModifier ? `<span class="aiul-modifier">${modifierType}</span>` : ''}
</a>
<br />
This work is licensed under an <a href="${licenseUrl}" target="_blank" rel="license">AI Usage License ${tagCode}</a>.`;
        }
        
        // Update the embed code display
        embedCodeDisplay.textContent = embedCode;
        
        // Update the preview
        embedPreview.innerHTML = embedCode;
    }
    
    function getTagFullName(tagType) {
        switch(tagType) {
            case 'NA': return 'Not Allowed';
            case 'WA': return 'With Approval';
            case 'CD': return 'Conceptual Development';
            case 'TC': return 'Transformative Collaboration';
            case 'DP': return 'Directed Production';
            case 'IU': return 'Integrated Usage';
            default: return 'Unknown';
        }
    }
    
    function getModifierFullName(modifierType) {
        switch(modifierType) {
            case 'WR': return 'Writing';
            case 'IM': return 'Image';
            case 'VD': return 'Video';
            case 'AU': return 'Audio';
            case '3D': return '3D Design';
            case 'TR': return 'Traditional Media';
            case 'MX': return 'Mixed Media';
            default: return 'Unknown';
        }
    }
    
    function createSVG(forPNG = false) {
        // This is a simplified but more accurate approach
        const tagSize = 'medium'; // Always use medium size
        
        // Define font sizes and border widths based on tag size
        let fontSize = 32;
        let borderWidth = 8;  
        let padding = 12;
        
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
        
        // To make strokes inward-facing:
        // 1. Create outer rectangle with no stroke that defines the full boundary
        // 2. Create inner rectangle with stroke that's inset by half the stroke width
        
        // Main tag white background (outer boundary, no stroke)
        svg += `<rect x="0" y="0" width="${tagWidth}" height="${tagHeight}" 
                fill="white" />`;
        
        // Main tag inner rectangle with inward stroke
        // Inset by half the stroke width on all sides
        const halfStroke = borderWidth / 2;
        svg += `<rect x="${halfStroke}" y="${halfStroke}" 
                width="${tagWidth - borderWidth}" height="${tagHeight - borderWidth}" 
                fill="white" stroke="black" stroke-width="${borderWidth}" />`;
        
        // For Illustrator compatibility, we'll add the text inside a group with alignment
        svg += `<g>
            <!-- Main tag text in the center -->
            <text x="${tagWidth / 2}" y="${tagHeight / 2 + fontSize/3}" 
                class="tag-text" text-anchor="middle">${mainText}</text>
        </g>`;
        
        // Add modifier if needed
        if (useModifierCheckbox.checked) {
            const modifierX = tagWidth;
            
            // Modifier rectangle outer boundary (no stroke)
            svg += `<rect x="${modifierX}" y="0" width="${modifierWidth}" height="${tagHeight}" 
                    fill="black" />`;
            
            // Modifier rectangle inner boundary with inward stroke
            svg += `<rect x="${modifierX + halfStroke}" y="${halfStroke}" 
                    width="${modifierWidth - borderWidth}" height="${tagHeight - borderWidth}" 
                    fill="black" stroke="black" stroke-width="${borderWidth}" />`;
            
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