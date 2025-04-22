#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');

// Create a virtual DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="tagPreview">
    <div id="tagContainer" class="tag-size-medium">
      <div class="tag-main">
        <span class="tag-text">AIUL-NA</span>
      </div>
      <div class="tag-modifier" style="display:none">
        <span class="modifier-text"></span>
      </div>
    </div>
  </div>
</body></html>`, {
  url: "https://dmd-program.github.io/aiul/",
  resources: "usable",
  runScripts: "dangerously"
});

// Make virtual DOM elements accessible
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock necessary DOM elements
class MockElement {
  constructor() {
    this.textContent = '';
    this.className = '';
    this.style = {};
  }
}

const downloadMessage = new MockElement();

// Define license types and modifiers
const licenseTypes = ['NA', 'WA', 'CD', 'TC', 'DP', 'IU'];
const modifierTypes = ['WR', 'IM', 'VD', 'AU', '3D', 'TR', 'MX'];

// Output directory setup
const outputDir = path.join(__dirname, '..', 'assets', 'images', 'licenses');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Import the core functions from tag-generator.js
// Note: These are copied from your tag-generator.js file to ensure consistency

function createSVG(licenseCode, modifierCode = null, forPNG = false) {
  // Define font sizes and border widths based on medium tag size
  const fontSize = 32;
  const fontSizeModifier = 24;
  const borderWidth = 8;
  const padding = 12;
  
  // Get text content
  const mainText = `AIUL-${licenseCode}`;
  
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
  
  if (modifierCode) {
    modifierText = modifierCode;
    modifierWidth = modifierText.length * charWidth + (padding * 2);
    totalWidth += modifierWidth;
  }
  
  // Create SVG with embedded styles
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
  
  // Add embedded font and exact styling for better rendering
  svg += `<defs>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;700&amp;display=swap');
          .tag-text { 
              font-family: 'Kanit', sans-serif;
              font-weight: 700;
              font-size: ${fontSize}px;
          }
          .modifier-text { 
              font-family: 'Kanit', sans-serif;
              font-weight: 400;
              font-size: ${fontSizeModifier}px;
              fill: white;
          }
      </style>
  </defs>`;
  
  // For direct SVG download (not for PNG conversion), use regular border width
  // For PNG conversion, use thicker border if specified
  const actualBorderWidth = forPNG ? borderWidth * 2 : borderWidth;
  // Store half the stroke width for positioning the modifier text
  const halfStroke = actualBorderWidth / 2;
  
  // Main tag rectangle
  svg += `<rect x="0" y="0" width="${tagWidth}" height="${tagHeight}" 
          fill="white" stroke="black" stroke-width="${actualBorderWidth}" />`;
  
  // For Illustrator compatibility, add the text inside a group with alignment
  svg += `<g>
      <!-- Main tag text in the center -->
      <text x="${tagWidth / 2}" y="${tagHeight / 2 + fontSize/3}" 
          class="tag-text" text-anchor="middle">${mainText}</text>
  </g>`;
  
  // Add modifier if needed
  if (modifierCode) {
    const modifierX = tagWidth;
    
    // Modifier rectangle - with stroke matching the main box
    svg += `<rect x="${modifierX}" y="0" width="${modifierWidth}" height="${tagHeight}" 
            fill="black" stroke="black" stroke-width="${actualBorderWidth}" />`;
    
    // Modifier text - also in a group with alignment
    // Modified to move text left by half the main tag stroke width
    svg += `<g>
        <text x="${modifierX + (modifierWidth / 2) - (borderWidth / 2)}" y="${tagHeight / 2 + fontSizeModifier/3}" 
            class="modifier-text" text-anchor="middle">${modifierText}</text>
    </g>`;
  }
  
  svg += '</svg>';
  return svg;
}

async function generatePNGFromSVG(svgContent, outputPath) {
    try {
      // Instead of using the default SVG size, let's create a much larger SVG first
      // by modifying the SVG content to have larger dimensions
  
      // Parse the SVG to modify its dimensions
      let biggerSvgContent = svgContent;
      
      // Extract current dimensions
      const widthMatch = svgContent.match(/width="([^"]+)"/);
      const heightMatch = svgContent.match(/height="([^"]+)"/);
      const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
      
      if (widthMatch && heightMatch) {
        const originalWidth = parseFloat(widthMatch[1]);
        const originalHeight = parseFloat(heightMatch[1]);
        
        // Scale factor for the SVG itself - make it much larger
        const svgScale = 1;
        const newWidth = originalWidth * svgScale;
        const newHeight = originalHeight * svgScale;
        
        // Replace dimensions in SVG
        biggerSvgContent = svgContent
          .replace(/width="([^"]+)"/, `width="${newWidth}"`)
          .replace(/height="([^"]+)"/, `height="${newHeight}"`);
        
        // Keep the viewBox the same to maintain proportions
        if (!viewBoxMatch) {
          // If no viewBox exists, add one to maintain scaling
          biggerSvgContent = biggerSvgContent.replace('<svg ', 
            `<svg viewBox="0 0 ${originalWidth} ${originalHeight}" `);
        }
      }
      
      // Write the larger SVG to a temporary file
      const tempSvgPath = path.join(__dirname, 'temp.svg');
      fs.writeFileSync(tempSvgPath, biggerSvgContent);
      
      // Load the larger SVG
      const img = await loadImage(tempSvgPath);
      
      // Additional scale factor for PNG conversion
      const pngScale = 1;
      
      // Create an even larger canvas
      const canvas = createCanvas(img.width * pngScale, img.height * pngScale);
      const ctx = canvas.getContext('2d');
      
      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Write canvas to PNG file with high quality
      const buffer = canvas.toBuffer('image/png', {
        compressionLevel: 0,  // No compression for better quality
        filters: canvas.PNG_ALL_FILTERS
      });
      fs.writeFileSync(outputPath, buffer);
      
      // Clean up temporary file
      fs.unlinkSync(tempSvgPath);
      
      console.log(`Generated: ${outputPath}`);
    } catch (error) {
      console.error('Error generating PNG:', error);
    }
  }

// Main function to generate all license images
async function generateAllLicenseImages() {
  console.log('Generating license images...');
  
  // Generate base license images
  for (const licenseCode of licenseTypes) {
    const outputPath = path.join(outputDir, `aiul-${licenseCode.toLowerCase()}.png`);
    const svgContent = createSVG(licenseCode, null, true);
    await generatePNGFromSVG(svgContent, outputPath);
    
    // Generate license + modifier combinations
    for (const modifierCode of modifierTypes) {
      const modOutputPath = path.join(outputDir, `aiul-${licenseCode.toLowerCase()}-${modifierCode.toLowerCase()}.png`);
      const modSvgContent = createSVG(licenseCode, modifierCode, true);
      await generatePNGFromSVG(modSvgContent, modOutputPath);
    }
  }
  
  console.log('License image generation complete!');
}

// Run the generator
generateAllLicenseImages().catch(err => {
  console.error('Error generating license images:', err);
  process.exit(1);
});