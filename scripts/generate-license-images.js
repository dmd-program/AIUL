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
    svg += `<g>
        <text x="${modifierX + (modifierWidth / 2)}" y="${tagHeight / 2 + fontSize/3}" 
            class="modifier-text" text-anchor="middle">${modifierText}</text>
    </g>`;
  }
  
  svg += '</svg>';
  return svg;
}

async function generatePNGFromSVG(svgContent, outputPath) {
  try {
    // Create a Blob URL from SVG content
    const svgBuffer = Buffer.from(svgContent);
    
    // Write SVG to a temporary file to load with canvas
    const tempSvgPath = path.join(__dirname, 'temp.svg');
    fs.writeFileSync(tempSvgPath, svgBuffer);
    
    // Load SVG and draw to canvas
    const scale = 4; // Scale factor for higher resolution
    const img = await loadImage(tempSvgPath);
    
    // Create a canvas with the scaled dimensions
    const canvas = createCanvas(img.width * scale, img.height * scale);
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the scaled image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Write canvas to PNG file
    const buffer = canvas.toBuffer('image/png');
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