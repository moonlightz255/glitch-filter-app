import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const canvasRef = useRef(null);

  // Array of filters matching your images
  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'glitch', name: 'Glitch (Img 1)' },
    { id: 'mono', name: 'Mono Depth (Img 2)' },
    { id: 'sketch', name: 'Sketch Blur (Img 3)' },
    { id: 'error', name: 'Error 404 (Img 4)' },
  ];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply the specific filter to the canvas
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (activeFilter === 'glitch') {
      // Img 1: Glitch effect
      ctx.drawImage(image, 0, 0);
      for (let i = 0; i < canvas.height; i += 8) {
        const shiftX = (Math.random() - 0.5) * 30;
        ctx.drawImage(canvas, 0, i, canvas.width, 8, shiftX, i, canvas.width, 8);
      }
    } 
    else if (activeFilter === 'mono') {
      // Img 2: Monochrome + sharp center focus
      ctx.filter = 'grayscale(100%) contrast(120%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      
      const w = canvas.width * 0.25;
      const h = canvas.height * 0.25;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      
      ctx.drawImage(image, x, y, w, h, x, y, w, h);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    } 
    else if (activeFilter === 'sketch') {
      // Img 3: Heavy smudge/blur
      ctx.filter = 'grayscale(100%) blur(10px) contrast(220%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } 
    else if (activeFilter === 'error') {
      // Img 4: Error 404
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';

      ctx.fillStyle = 'black';
      for(let i=0; i<80; i++) ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 2);

      // Black band and text
      const bandHeight = 60;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, (canvas.height/2) - (bandHeight/2), canvas.width, bandHeight);
      
      ctx.font = `bold ${canvas.width * 0.1}px monospace`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ERROR 404', canvas.width / 2, canvas.height / 2);
    }
  };

  // Trigger filter whenever image or filter changes
  useEffect(() => {
    applyFilter();
  }, [image, activeFilter]);

  // Download image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'filtered_image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="App">
      <h1>Glitch & Mono Suite</h1>
      
      <div className="controls">
        <label htmlFor="file-upload" className="custom-file-upload">
          Upload Image
        </label>
        <input id="file-upload" type="file" onChange={handleImageUpload} />
      </div>

      {image ? (
        <>
          <div className="filter-buttons">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={activeFilter === filter.id ? 'active' : ''}
              >
                {filter.name}
              </button>
            ))}
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef}></canvas>
          </div>

          <button className="download-btn" onClick={downloadImage}>
            Download Image
          </button>
        </>
      ) : (
        <div className="placeholder">Upload an image to begin</div>
      )}
    </div>
  );
}

export default App;
