import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Settings
  const [bgColor, setBgColor] = useState('#ffffff'); // Default white
  const [canvasSize, setCanvasSize] = useState('original'); // Removed forced QHD

  // Movable Overlay State (for 404 text, focus text, etc)
  const [overlays, setOverlays] = useState([]);
  const activeOverlayRef = useRef(null);

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
    { id: 'bars', name: 'Vertical Bars' },
    { id: 'frame', name: 'Framed' },
    { id: 'popart', name: 'Pop Art' },
    { id: 'grid', name: 'Grid & Tech' }
  ];

  // --- HANDLE IMAGE ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setHistory([img]);
          setHistoryIndex(0);
          // Reset overlays
          if (activeFilter === 'error') {
             setOverlays([{ id: 1, text: 'ERROR 404', x: 0.5, y: 0.5, fontSize: 80 }]);
          } else if (activeFilter === 'focus') {
             setOverlays([{ id: 1, text: 'focus', x: 0.5, y: 0.5, fontSize: 120 }]);
          } else {
             setOverlays([]);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // --- DRAWING THE CANVAS ---
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to original
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    ctx.drawImage(image, 0, 0);

    // --- FILTER LOGIC (Canvas based) ---
    if (activeFilter === 'glitch') {
      for (let i = 0; i < canvas.height; i += 15) {
        const shiftX = (Math.random() - 0.5) * 50;
        ctx.drawImage(canvas, 0, i, canvas.width, 15, shiftX, i, canvas.width, 15);
      }
    } 
    else if (activeFilter === 'mono') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } 
    else if (activeFilter === 'sketch') {
      ctx.filter = 'grayscale(100%) blur(10px) contrast(220%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } 
    else if (activeFilter === 'error') {
      // Only draws the glitch effect, the text is handled by HTML overlay
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      ctx.fillStyle = 'black';
      for(let i=0; i<100; i++) ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 3);
    }
    else if (activeFilter === 'focus') {
      ctx.filter = 'grayscale(100%) blur(5px)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    }
    else if (activeFilter === 'bars') {
      const numBars = 4;
      const barWidth = canvas.width / numBars;
      for(let i=0; i<numBars; i++) {
        ctx.drawImage(image, (i*barWidth), 0, barWidth, canvas.height, (i*barWidth), 0, barWidth, canvas.height);
      }
    }
    else if (activeFilter === 'frame') {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.6);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.strokeRect(canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.6);
    }
    else if (activeFilter === 'paint') {
      ctx.filter = 'grayscale(100%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    else if (activeFilter === 'popart') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 255, 180, 0.4)';
      ctx.fillRect(0, 0, canvas.width/2, canvas.height/2);
      ctx.fillStyle = 'rgba(255, 0, 200, 0.4)';
      ctx.fillRect(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
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
    }
  };

  // Run applyFilter whenever dependencies change
  useEffect(() => {
    applyFilter();
    
    // Reset or Initialize Overlays when filter changes
    if (activeFilter === 'error') {
      setOverlays([{ id: 1, text: 'ERROR 404', x: 0.5, y: 0.5, fontSize: 80 }]);
    } else if (activeFilter === 'focus') {
      setOverlays([{ id: 1, text: 'focus', x: 0.5, y: 0.5, fontSize: 100 }]);
    } else {
      setOverlays([]);
    }
  }, [image, activeFilter, bgColor]);

  // --- DRAG & PINCH TO ZOOM LOGIC ---
  const startDrag = (e, overlayId) => {
    const overlay = overlays.find(o => o.id === overlayId);
    const viewer = e.currentTarget.parentElement;
    const rect = viewer.getBoundingClientRect();
    
    const startX = (e.clientX - rect.left) / rect.width;
    const startY = (e.clientY - rect.top) / rect.height;
    const overlayX = overlay.x;
    const overlayY = overlay.y;

    activeOverlayRef.current = { id: overlayId, startX, startY, overlayX, overlayY };

    const onMove = (e) => {
      const currentX = (e.clientX - rect.left) / rect.width;
      const currentY = (e.clientY - rect.top) / rect.height;
      const dx = currentX - activeOverlayRef.current.startX;
      const dy = currentY - activeOverlayRef.current.startY;
      
      setOverlays(prev => prev.map(o => 
        o.id === overlayId ? { ...o, x: activeOverlayRef.current.overlayX + dx, y: activeOverlayRef.current.overlayY + dy } : o
      ));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  };

  const handleWheel = (e, overlayId) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 10 : -10;
    setOverlays(prev => prev.map(o => 
      o.id === overlayId ? { ...o, fontSize: Math.max(20, o.fontSize + delta) } : o
    ));
  };

  // --- HISTORY / CLEAR / SAVE ---
  const saveToHistory = () => {
    const newHistory = [...history.slice(0, historyIndex + 1), activeFilter];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  const handleRestore = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  const handleClear = () => {
    setImage(null);
    setHistory([]);
    setHistoryIndex(-1);
    setOverlays([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Final Export (Draws Overlays onto the Canvas)
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw HTML Overlays onto final canvas
    overlays.forEach(overlay => {
      ctx.font = `bold ${overlay.fontSize}px Arial`;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw background band
      const textWidth = ctx.measureText(overlay.text).width;
      ctx.fillRect(canvas.width * overlay.x - textWidth/2 - 20, canvas.height * overlay.y - overlay.fontSize/2 - 10, textWidth + 40, overlay.fontSize + 20);
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.fillText(overlay.text, canvas.width * overlay.x, canvas.height * overlay.y);
    });

    const link = document.createElement('a');
    link.download = 'filtered_image.png';
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

          {/* The "Box" to see the image in good size */}
          <div className="viewer-box">
            <canvas ref={canvasRef}></canvas>
            
            {/* Render Movable Overlays */}
            {overlays.map(overlay => (
              <div 
                key={overlay.id}
                className="text-overlay"
                style={{
                  left: `${overlay.x * 100}%`,
                  top: `${overlay.y * 100}%`,
                  fontSize: `${overlay.fontSize}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={(e) => startDrag(e, overlay.id)}
                onTouchStart={(e) => startDrag(e, overlay.id)}
                onWheel={(e) => handleWheel(e, overlay.id)}
              >
                {overlay.text}
              </div>
            ))}
          </div>
          <p style={{fontSize: '12px', color: '#888'}}>Drag text to move. Use scroll wheel / pinch to resize.</p>

          <button className="download-btn" onClick={downloadImage}>
            Save Image
          </button>
        </>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="setting-group">
              <label>Background Color (Defaults to White)</label>
              <div className="color-options">
                {['#ffffff', '#121212', '#0000ff', '#ffff00', '#dcdcdc'].map(c => (
                  <div key={c} className={`color-swatch ${bgColor === c ? 'selected' : ''}`} style={{backgroundColor: c}} onClick={() => setBgColor(c)}></div>
                ))}
              </div>
            </div>
            <div className="setting-group">
              <label>Image Size (Original maintained)</label>
              <select value={canvasSize} onChange={(e) => setCanvasSize(e.target.value)}>
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
