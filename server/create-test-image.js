const fs = require('fs');
const path = require('path');

// Create a proper test image (simple BMP format for testing)
function createTestImage() {
  // Simple 100x100 red square BMP
  const width = 100;
  const height = 100;
  const fileSize = 54 + (width * height * 3); // BMP header + pixel data
  
  const buffer = Buffer.alloc(fileSize);
  
  // BMP Header
  buffer.write('BM', 0); // Signature
  buffer.writeUInt32LE(fileSize, 2); // File size
  buffer.writeUInt32LE(0, 6); // Reserved
  buffer.writeUInt32LE(54, 10); // Data offset
  
  // DIB Header
  buffer.writeUInt32LE(40, 14); // DIB header size
  buffer.writeUInt32LE(width, 18); // Width
  buffer.writeUInt32LE(height, 22); // Height
  buffer.writeUInt16LE(1, 26); // Planes
  buffer.writeUInt16LE(24, 28); // Bits per pixel
  buffer.writeUInt32LE(0, 30); // Compression
  buffer.writeUInt32LE(width * height * 3, 34); // Image size
  buffer.writeUInt32LE(2835, 38); // X pixels per meter
  buffer.writeUInt32LE(2835, 42); // Y pixels per meter
  buffer.writeUInt32LE(0, 46); // Colors used
  buffer.writeUInt32LE(0, 50); // Important colors
  
  // Pixel data (BGR format)
  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      buffer[offset++] = 0; // Blue
      buffer[offset++] = 0; // Green  
      buffer[offset++] = 255; // Red
    }
  }
  
  return buffer;
}

// Create test image
const testImage = createTestImage();
fs.writeFileSync(path.join(__dirname, 'test-image.bmp'), testImage);
console.log('Created test-image.bmp');

// Also create a simple JPG using a different approach
const testJpgPath = path.join(__dirname, 'test-image.jpg');

// Create a very basic JPEG structure
const jpegHeader = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0xFF, 0xFF, 0xD9
]);

fs.writeFileSync(testJpgPath, jpegHeader);
console.log('Created test-image.jpg');
