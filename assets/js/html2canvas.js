/*!
 * html2canvas 1.4.1 <https://html2canvas.hertzen.com>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.html2canvas = factory());
}(this, (function () { 'use strict';

    // Simplified version of html2canvas for the purpose of this example
    // In a real implementation, you would include the full library

    function html2canvas(element, options) {
        return new Promise(function(resolve) {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Get the computed styles of the element
            const style = window.getComputedStyle(element);
            
            // Set canvas dimensions
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            
            // Draw a white background
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
            
            // Render the SVG data
            const data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                          '<foreignObject width="100%" height="100%" x="0" y="0">' +
                          '<div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%">' +
                          element.outerHTML +
                          '</div>' +
                          '</foreignObject>' +
                          '</svg>';
            
            // Create image from SVG data
            const img = new Image();
            img.onload = function() {
                context.drawImage(img, 0, 0);
                resolve(canvas);
            };
            
            // Set the source of the image to the SVG data
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
        });
    }

    return html2canvas;
})));