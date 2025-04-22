require 'fileutils'
require 'mini_magick'

module Jekyll
  class LicenseImageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Get licenses and modifiers from collections
      licenses = site.collections['licenses'].docs
      modifiers = site.collections['modifiers'].docs
      
      # Create output directory if it doesn't exist
      output_dir = File.join(site.source, 'assets', 'images', 'licenses')
      FileUtils.mkdir_p(output_dir) unless Dir.exist?(output_dir)
      
      # Generate base license images
      licenses.each do |license|
        license_code = license.data['title'].sub('AIUL-', '')
        generate_license_image(license_code, nil, output_dir)
        
        # Generate license + modifier combinations
        modifiers.each do |modifier|
          modifier_code = modifier.data['title']
          generate_license_image(license_code, modifier_code, output_dir)
        end
      end
    end
    
    def generate_license_image(license_code, modifier_code, output_dir)
      # Set up image parameters
      width = modifier_code.nil? ? 200 : 300
      height = 70
      font_size = 24
      border_width = 4
      
      filename = modifier_code.nil? ? 
                 "aiul-#{license_code.downcase}.png" : 
                 "aiul-#{license_code.downcase}-#{modifier_code.downcase}.png"
      output_path = File.join(output_dir, filename)
      
      # Skip if image already exists
      return if File.exist?(output_path)
      
      # Create an image using convert directly
      license_width = modifier_code.nil? ? width : width * 2/3
      
      # Start with a blank transparent image
      convert_args = [
        "-size", "#{width}x#{height}",
        "xc:none"
      ]
      
      # Draw the license part
      convert_args.concat([
        "-fill", "white",
        "-stroke", "black",
        "-strokewidth", border_width.to_s,
        "-draw", "rectangle 0,0 #{license_width-1},#{height-1}"
      ])
      
      # Add the license text
      convert_args.concat([
        "-fill", "black",
        "-pointsize", font_size.to_s,
        "-font", "Arial-Bold",
        "-gravity", "Center",
        "-annotate", "0x0+#{license_width/2}+#{height/2}", "AIUL-#{license_code}"
      ])
      
      # Add the modifier part if needed
      if modifier_code
        modifier_x = license_width
        
        # Draw modifier background
        convert_args.concat([
          "-fill", "black",
          "-stroke", "black",
          "-strokewidth", border_width.to_s,
          "-draw", "rectangle #{modifier_x},0 #{width-1},#{height-1}"
        ])
        
        # Add modifier text
        convert_args.concat([
          "-fill", "white",
          "-pointsize", font_size.to_s,
          "-font", "Arial",
          "-gravity", "Center",
          "-annotate", "0x0+#{modifier_x + ((width - license_width)/2)}+#{height/2}", modifier_code
        ])
      end
      
      # Save the output image
      convert_args << output_path
      
      # Run ImageMagick convert command
      MiniMagick::Tool::Convert.new do |convert|
        convert_args.each { |arg| convert << arg }
      end
      
      puts "Generated license image: #{filename}"
    end
  end
end