document.addEventListener('DOMContentLoaded', function() {
  // Load Kanit font for tag graphics
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
  
  // Create a font loader to ensure fonts are loaded
  document.fonts.ready.then(function() {
      console.log("Fonts loaded and ready for use");
  });
  
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
          nav.classList.toggle('active');
      });
  }
  
  // Tag Selector Form
  const tagSelectorForm = document.getElementById('tagSelectorForm');
  if (tagSelectorForm) {
      tagSelectorForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Retrieve user responses
          const nature = document.querySelector('input[name="assignmentNature"]:checked').value;
          const media = document.getElementById('mediaType').value;
          
          let tag = '';
          let explanation = '';
          
          // Mapping responses to AIUL tags
          if (nature === 'no-ai') {
              tag = 'AIUL-1';
              explanation = 'No AI tools allowed. All work must be entirely student-generated.';
          } else if (nature === 'limited-assistance') {
              tag = 'AIUL-2';
              explanation = 'Limited AI assistance is permitted only with instructor pre-approval.';
          } else if (nature === 'research-only') {
              tag = 'AIUL-3';
              explanation = 'AI tools can be used for research or inspiration only. Final work must be original.';
          } else if (nature === 'collaborative-tool') {
              tag = 'AIUL-4';
              explanation = 'AI is used as a collaborative tool. Significant student input is required.';
          } else if (nature === 'ai-assisted-creation') {
              tag = 'AIUL-5';
              explanation = 'AI-assisted creation permitted with clear student direction and modification.';
          } else if (nature === 'ai-integrated') {
              tag = 'AIUL-6';
              explanation = 'This assignment requires integrated AI usage. The process and final work must reflect this integration.';
          }
          
          // Append media suffix if applicable
          let fullTag = tag;
          if (media !== '') {
              fullTag += '-' + media;
          }
          
          // Display the result
          document.getElementById('recommendedTag').textContent = fullTag;
          document.getElementById('tagExplanation').textContent = explanation;
          document.getElementById('resultSummary').style.display = 'block';
          
          // Update the tag preview
          updateTagPreview(tag, media);
          
          // Scroll to results
          document.getElementById('resultSummary').scrollIntoView({ behavior: 'smooth' });
      });
      
      // Download statement button
      const downloadBtn = document.getElementById('downloadStatement');
      if (downloadBtn) {
          downloadBtn.addEventListener('click', function() {
              const tag = document.getElementById('recommendedTag').textContent;
              const explanation = document.getElementById('tagExplanation').textContent;
              
              // Create text content
              const content = `AIUL Tag: ${tag}\n\n${explanation}\n\nThis assignment follows the AI Usage License Project guidelines.\nFor more information, visit: https://example.com/aiul`;
              
              // Create a blob and download
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${tag}-statement.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              showDownloadMessage('Syllabus statement downloaded successfully!', 'success');
          });
      }
      
      // Copy tag button
      const copyBtn = document.getElementById('copyTag');
      if (copyBtn) {
          copyBtn.addEventListener('click', function() {
              const tag = document.getElementById('recommendedTag').textContent;
              navigator.clipboard.writeText(tag)
                  .then(() => {
                      showDownloadMessage('Tag copied to clipboard!', 'success');
                  })
                  .catch(err => {
                      console.error('Failed to copy text: ', err);
                      showDownloadMessage('Failed to copy text', 'error');
                  });
          });
      }
      
      // Add event listeners for download buttons
      const downloadPNGBtn = document.getElementById('downloadPNG');
      const downloadSVGBtn = document.getElementById('downloadSVG');
      
      if (downloadPNGBtn) {
          downloadPNGBtn.addEventListener('click', function() {
              downloadAsPNG();
          });
      }
      
      if (downloadSVGBtn) {
          downloadSVGBtn.addEventListener('click', function() {
              downloadAsSVG();
          });
      }
  }
  
  // Function to update tag preview
  function updateTagPreview(tagNumber, mediaType) {
      const tagContainer = document.getElementById('tagContainer');
      const tagText = document.querySelector('.tag-text');
      const tagModifier = document.querySelector('.tag-modifier');
      const modifierText = document.querySelector('.modifier-text');
      
      // Update tag text
      tagText.textContent = tagNumber;
      
      // Update modifier
      if (mediaType && mediaType !== '') {
          modifierText.textContent = mediaType;
          tagModifier.style.display = 'flex';
      } else {
          tagModifier.style.display = 'none';
      }
      
      // Ensure the tag main has proper styling
      const tagMain = document.querySelector('.tag-main');
      tagMain.style.backgroundColor = 'white';
      tagMain.style.border = '4px solid black';
      tagMain.style.boxSizing = 'border-box';
      
      // Ensure the tag modifier has proper styling
      tagModifier.style.backgroundColor = 'black';
      tagModifier.style.color = 'white';
      tagModifier.style.border = '4px solid black';
      tagModifier.style.boxSizing = 'border-box';
  }
  
  // Function to show download message
  function showDownloadMessage(message, type) {
      const messageElement = document.querySelector('.download-message');
      if (messageElement) {
          messageElement.textContent = message;
          messageElement.className = 'download-message';
          if (type) {
              messageElement.classList.add(type);
          }
          
          // Clear message after 5 seconds
          setTimeout(function() {
              messageElement.textContent = '';
              messageElement.className = 'download-message';
          }, 5000);
      }
  }
  
  // Create SVG for download
  function createSVG(forPNG = false) {
      const tagContainer = document.getElementById('tagContainer');
      const tagText = document.querySelector('.tag-text');
      const tagModifier = document.querySelector('.tag-modifier');
      const modifierText = document.querySelector('.modifier-text');
      
      // Define sizes
      let fontSize = 32; // Medium size
      let borderWidth = 4;
      let padding = 12;
      
      // Get tag content
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
      let modifierContent = '';
      
      if (tagModifier.style.display !== 'none') {
          modifierContent = modifierText.textContent;
          modifierWidth = modifierContent.length * charWidth + (padding * 2);
          totalWidth += modifierWidth;
      }
      
      // Create SVG with embedded styles
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
      
      // Add embedded font and styling
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
      const actualBorderWidth = forPNG ? borderWidth * 3 : borderWidth;
      
      // Main tag rectangle
      svg += `<rect x="0" y="0" width="${tagWidth}" height="${tagHeight}" 
              fill="white" stroke="black" stroke-width="${actualBorderWidth}" />`;
      
      // Main tag text in a group for better positioning
      svg += `<g>
          <text x="${tagWidth / 2}" y="${tagHeight / 2 + fontSize/3}" 
              class="tag-text" text-anchor="middle">${mainText}</text>
      </g>`;
      
      // Add modifier if needed
      if (tagModifier.style.display !== 'none') {
          const modifierX = tagWidth;
          
          // Modifier rectangle
          svg += `<rect x="${modifierX}" y="0" width="${modifierWidth}" height="${tagHeight}" 
                  fill="black" stroke="black" stroke-width="${actualBorderWidth}" />`;
          
          // Modifier text
          svg += `<g>
              <text x="${modifierX + (modifierWidth / 2)}" y="${tagHeight / 2 + fontSize/3}" 
                  class="modifier-text" text-anchor="middle">${modifierContent}</text>
          </g>`;
      }
      
      svg += '</svg>';
      return svg;
  }
  
  // Function to download as PNG
  function downloadAsPNG() {
      try {
          // Create an SVG for the PNG (with thicker strokes)
          const svgContent = createSVG(true);
          
          // Create an image element to load the SVG
          const img = new Image();
          
          // Set up error handling
          img.onerror = function() {
              console.error('Error loading SVG into image');
              showDownloadMessage('Error generating PNG. Please try again.', 'error');
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
              const tagValue = document.getElementById('recommendedTag').textContent;
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const filename = `${tagValue}_${timestamp}.png`;
              
              link.download = filename;
              
              // Use maximum quality PNG encoding
              link.href = canvas.toDataURL('image/png', 1.0);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              showDownloadMessage('High-resolution PNG file downloaded successfully!', 'success');
              
              // Clean up
              URL.revokeObjectURL(img.src);
          };
          
          // Load the SVG as a data URL
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          img.src = svgUrl;
      } catch (error) {
          console.error('Error generating PNG:', error);
          showDownloadMessage('Error generating PNG. Please try again.', 'error');
      }
  }
  
  // Function to download as SVG
  function downloadAsSVG() {
      try {
          // Set current date/time for filename
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          
          // Create SVG content
          const svgContent = createSVG(false);
          
          // Create a download link
          const link = document.createElement('a');
          
          // Get filename with timestamp
          const tagValue = document.getElementById('recommendedTag').textContent;
          const filename = `${tagValue}_${timestamp}.svg`;
          
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
          
          showDownloadMessage('SVG file downloaded successfully!', 'success');
      } catch (error) {
          console.error('Error generating SVG:', error);
          showDownloadMessage('Error generating SVG. Please try again.', 'error');
      }
  }
});