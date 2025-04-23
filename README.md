# AIUL Project Website

This repository contains the Jekyll-based website for the AI Usage License (AIUL) Project.

## Local Development

### Prerequisites

- Ruby version 2.5.0 or higher
- RubyGems
- GCC and Make

### Installation

1. Install Jekyll and Bundler gems:
   ```
   gem install jekyll bundler
   ```

2. Clone this repository:
   ```
   git clone https://github.com/yourusername/aiul-website.git
   cd aiul-website
   ```

3. Install dependencies:
   ```
   bundle install
   ```

4. Start the local development server:
   ```
   bundle exec jekyll serve
   ```

5. Browse to http://localhost:4000


### Generate static license graphics


1. Make sure you are in the project root directory.

2. Install node packages (if you haven't already):

   ```
   npm install
   ```

3. Generate the static graphics:
   ```
   npm run generate-images

   
   # This generates .PNG images in the /assets/images/licenses folder
   ```

## Site Structure

- `_config.yml` - Site configuration
- `_layouts/` - Page templates
- `_includes/` - Reusable components
- `_sass/` - SCSS styling
- `assets/` - CSS, JavaScript, and images
- HTML files in the root directory - Individual pages

## Deploying to GitHub Pages

This site is set up to deploy automatically to GitHub Pages when changes are pushed to the main branch. The deployment is handled by the GitHub Actions workflow defined in `.github/workflows/jekyll-gh-pages.yml`.

To deploy:

1. Commit your changes
2. Push to the main branch
3. GitHub Actions will build and deploy the site

## Customization

### Adding New Pages

1. Create a new HTML file in the root directory
2. Add YAML front matter with layout and title
3. Add your content
4. Update the navigation in `_config.yml` if needed

Example:
```html
---
layout: default
title: New Page
---

<div class="page-content">
  <h2>New Page Title</h2>
  <p>Content goes here...</p>
</div>
```

### Changing Styles

Modify the styles in `_sass/main.scss` to customize the appearance of the site.
