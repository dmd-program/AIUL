// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
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
      const aiRequired = document.querySelector('input[name="aiRequired"]:checked').value;
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
      if (media !== '') {
        tag += '-' + media;
      }
      
      // Display the result
      document.getElementById('recommendedTag').textContent = tag;
      document.getElementById('tagExplanation').textContent = explanation;
      document.getElementById('resultSummary').style.display = 'block';
      
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
      });
    }
    
    // Copy tag button
    const copyBtn = document.getElementById('copyTag');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        const tag = document.getElementById('recommendedTag').textContent;
        navigator.clipboard.writeText(tag)
          .then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      });
    }
  }
});
