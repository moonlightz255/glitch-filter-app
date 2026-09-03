import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // History for Previous/Restore
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Settings State
  const [bgColor, setBgColor] = useState('#121212');
  const [canvasSize, setCanvasSize] = useState('qhd'); // 'original', 'square', 'qhd'

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'mono', name: 'Mono Depth' },
    { id: 'sketch', name: 'Sketch Blur' },
    { id: 'error', name: 'Error 404' },
    { id: 'paint', name: 'Color Paint' },
    { id: 'focus', name: 'Focus Type' },
    { id: 'type', name: 'Typography' },
    { id: 'bars', name: 'Vertical Bars' },
    { id: 'frame', name: 'Framed' },
    { id: 'blue', name: 'Blue Art' },
    { id: 'shh', name: 'Shhh' },
    { id: 'colorpop', name: 'Color Pop' },
    { id: 'popart', name: 'Pop Art' },
    { id: 'grid', name: 'Grid & Tech' },
    { id: 'split', name: 'Split Slice' },
    { id: 'ripped', name: 'Ripped' },
    { id: 'gold', name: 'Gold Silhouette' },
    { id: 'speck', name: 'Speckled Noise' }
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
          setHistory([img]); // Initialize history
          setHistoryIndex(0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply filters to canvas
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    
    // Determine canvas dimensions based on setting
    if (canvasSize === 'qhd') {
      canvas.width = 2560;
      canvas.height = 1440;
    } else if (canvasSize === 'square') {
      canvas.width = 1080;
      canvas.height = 1080;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background Color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image scaled to fit
    const imgRatio = image.width / image.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.width / imgRatio;
    } else {
      drawWidth = canvas.height * imgRatio;
    }

    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    // --- FILTER LOGIC ---
    if (activeFilter === 'glitch') {
      for (let i = 0; i < canvas.height; i += 15) {
        const shiftX = (Math.random() - 0.5) * 50;
        ctx.drawImage(canvas, 0, i, canvas.width, 15, shiftX, i, canvas.width, 15);
      }
    } 
    else if (activeFilter === 'mono') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
    } 
    else if (activeFilter === 'sketch') {
      ctx.filter = 'grayscale(100%) blur(10px) contrast(220%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
    } 
    else if (activeFilter === 'error') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.fillStyle = 'black';
      for(let i=0; i<100; i++) ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 3);
      const bandHeight = 80;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, (canvas.height/2) - (bandHeight/2), canvas.width, bandHeight);
      ctx.font = `bold ${canvas.width * 0.1}px monospace`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ERROR 404', canvas.width / 2, canvas.height / 2);
    } 
    else if (activeFilter === 'focus') {
      ctx.filter = 'grayscale(100%) blur(5px)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.drawImage(image, offsetX + (drawWidth/4), offsetY + (drawHeight/4), drawWidth/2, drawHeight/2, offsetX + (drawWidth/4), offsetY + (drawHeight/4), drawWidth/2, drawHeight/2);
      ctx.font = `bold ${canvas.width * 0.15}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('focus', canvas.width / 2, canvas.height / 2);
    }
    else if (activeFilter === 'bars') {
      const numBars = 4;
      const barWidth = drawWidth / numBars;
      for(let i=0; i<numBars; i++) {
        ctx.drawImage(image, offsetX + (i*barWidth), offsetY, barWidth, drawHeight, offsetX + (i*barWidth), offsetY, barWidth, drawHeight);
      }
      ctx.font = `bold ${canvas.width * 0.1}px serif`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText('Just Beauty', canvas.width / 2, canvas.height - (canvas.height * 0.1));
    }
    else if (activeFilter === 'frame') {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      const frameSize = drawWidth * 0.6;
      const fx = (canvas.width - frameSize)/2;
      const fy = (canvas.height - frameSize)/2;
      ctx.strokeRect(fx, fy, frameSize, frameSize);
      
      ctx.font = `bold ${canvas.width * 0.08}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.fillText("IT'S NOT JOKE", 50, canvas.height * 0.6);
    }
    else if (activeFilter === 'blue') {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // Simulate heavy paint blob
      ctx.fillStyle = 'rgba(0, 50, 200, 0.9)';
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, canvas.width * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (activeFilter === 'shh') {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${canvas.width * 0.05}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText('Shhh...', canvas.width/2, canvas.height/2);
    }
    else if (activeFilter === 'colorpop') {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; 
      ctx.fillRect(canvas.width*0.3, 0, canvas.width*0.4, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    else if (activeFilter === 'popart') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 255, 180, 0.5)';
      ctx.fillRect(offsetX, offsetY, drawWidth/2, drawHeight/2);
      ctx.fillStyle = 'rgba(255, 0, 200, 0.5)';
      ctx.fillRect(offsetX + drawWidth/2, offsetY + drawHeight/2, drawWidth/2, drawHeight/2);
    }
    else if (activeFilter === 'grid') {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      const gridSize = canvas.width / 10;
      for(let i=0; i<10; i++) {
        ctx.beginPath();
        ctx.moveTo(i*gridSize, 0);
        ctx.lineTo(i*gridSize, canvas.height);
        ctx.moveTo(0, i*gridSize);
        ctx.lineTo(canvas.width, i*gridSize);
        ctx.stroke();
      }
      ctx.font = `bold ${canvas.width * 0.03}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText("A STUDY OF DEPTH IN MONOCHROME", canvas.width/2, 30);
    }
    else if (activeFilter === 'split') {
      const half = canvas.width / 2;
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight, 0, 0, half, canvas.height);
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight, half, 0, half, canvas.height);
      ctx.filter = 'none';
      ctx.font = `bold ${canvas.width * 0.1}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText('LISA', half, canvas.height/2);
    }
    else if (activeFilter === 'ripped') {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.7, canvas.height * 0.2, canvas.width * 0.15, 0, Math.PI * 2);
      ctx.arc(canvas.width * 0.3, canvas.height * 0.8, canvas.width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    else if (activeFilter === 'gold') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
      ctx.fillRect(canvas.width*0.1, 0, canvas.width*0.8, canvas.height);
    }
    else if (activeFilter === 'speck') {
      ctx.filter = 'grayscale(100%) contrast(250%)';
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
      // Add noise
      for(let i=0; i<5000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.5})`;
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
      }
    }
  };

  // Run applyFilter whenever dependencies change
  useEffect(() => {
    applyFilter();
  }, [image, activeFilter, bgColor, canvasSize]);

  // Save History for Undo/Restore
  const saveToHistory = () => {
    const newHistory = [...history.slice(0, historyIndex + 1), activeFilter];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle Previous (Undo)
  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  // Handle Restore (Redo)
  const handleRestore = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  // Handle Clear
  const handleClear = () => {
    setImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export function for 27-inch QHD monitor (2560x1440)
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'filtered_image_QHD_27inch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="App">
      <h1>Glitch & Mono Suite</h1>
      
      <div className="controls">
        <button className="btn" onClick={() => fileInputRef.current.click()}>
          {image ? 'Upload New Image' : 'Upload Image'}
        </button>
        <input ref={fileInputRef} id="file-upload" type="file" onChange={handleImageUpload} style={{display: 'none'}} />
        
        {image && (
          <>
            <button className="btn" onClick={handlePrevious} disabled={historyIndex <= 0}>Previous</button>
            <button className="btn" onClick={handleRestore} disabled={historyIndex >= history.length - 1}>Restore</button>
            <button className="btn" onClick={handleClear}>Clear All</button>
            <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙️</button>
          </>
        )}
      </div>

      {image && (
        <>
          <div className="filter-dropdown">
            <button className="btn dropdown-toggle" onClick={() => setShowFilters(!showFilters)}>
              Filter: {filters.find(f => f.id === activeFilter)?.name} ▼
            </button>
            {showFilters && (
              <div className="dropdown-menu">
                {filters.map(filter => (
                  <div 
                    key={filter.id} 
                    className={`dropdown-item ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setShowFilters(false);
                      saveToHistory();
                    }}
                  >
                    {filter.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef}></canvas>
          </div>

          <button className="download-btn" onClick={downloadImage}>
            Save (QHD 2560x1440)
          </button>
        </>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="setting-group">
              <label>Background Color</label>
              <div className="color-options">
                {['#121212', '#ffffff', '#0000ff', '#ffff00', '#dcdcdc'].map(c => (
                  <div key={c} className={`color-swatch ${bgColor === c ? 'selected' : ''}`} style={{backgroundColor: c}} onClick={() => setBgColor(c)}></div>
                ))}
              </div>
            </div>
            <div className="setting-group">
              <label>Image Size</label>
              <select value={canvasSize} onChange={(e) => setCanvasSize(e.target.value)}>
                <option value="qhd">QHD (27-inch Monitor)</option>
                <option value="square">Square (1080x1080)</option>
                <option value="original">Original Size</option>
              </select>
            </div>
            <button className="btn" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
