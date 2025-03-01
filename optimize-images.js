const tinify = require("tinify");
const fs = require("fs");
const path = require("path");

// Replace with your API key from the email
tinify.key = "YOUR_API_KEY";

// Directory containing images to optimize
// Adjust this path to match your project structure
const imageDir = "./images";

// Process all images in the directory
fs.readdir(imageDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err.message}`);
    return;
  }
  
  files.forEach(file => {
    const filePath = path.join(imageDir, file);
    
    // Check if file is an image
    if (/\.(png|jpe?g)$/i.test(file)) {
      console.log(`Optimizing ${file}...`);
      
      // Optimize the image
      const source = tinify.fromFile(filePath);
      
      // Save the optimized image, overwriting the original
      source.toFile(filePath, err => {
        if (err) console.error(`Error optimizing ${file}:`, err);
        else console.log(`Successfully optimized ${file}`);
      });
    }
  });
});
