import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings for the Frame
  const [frameColor, setFrameColor] = useState('#ffffff');

  // Custom Overlay State
  const [frameBox, setFrameBox] = useState(null);
  const [frameText, setFrameText] = useState({ x: 0.1, y: 0.5, fontSize: 80 });

  const viewerRef = useRef(null);
  const fileInputRef = useRef(null);
  const resizingRef = useRef(null);
  const draggingRef = useRef(null);

  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'mono', name: 'Mono Depth' },
    { id: 'sketch', name: 'Sketch Blur' },
    { id: 'error', name: 'Error 404' },
    { id: 'focus', name: 'Focus Type' },
    { id: 'frame', name: "It's Not Joke (Interactive Box)" },
    { id: 'bars', name: 'Vertical Bars' },
    { id: 'popart', name: 'Pop Art' },
    { id: 'grid', name: 'Grid & Tech' },
    { id: 'paint', name: 'Color Paint' }
  ];

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Initialize the box on image load
          setFrameBox({ x: 0.5, y: 0.4, width: 0.4, height: 0.4 });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply Canvas Filters
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff'; // Default white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (activeFilter === 'glitch') {
      for (let i = 0; i < canvas.height; i += 15) {
        const shiftX = (Math.random() - 0.5) * 50;
        ctx.drawImage(canvas, 0, i, canvas.width, 15, shiftX, i, canvas.width, 15);
      }
    } else if (activeFilter === 'mono') {
      ctx.filter = 'grayscale(100%) contrast(120%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } else if (activeFilter === 'sketch') {
      ctx.filter = 'grayscale(100%) blur(10px) contrast(220%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } else if (activeFilter === 'error') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      for(let i=0; i<100; i++) ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 3);
    } else if (activeFilter === 'focus') {
      ctx.filter = 'grayscale(100%) blur(5px)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
    } else if (activeFilter === 'frame') {
      // Just black and white background for the frame filter
      ctx.filter = 'grayscale(100%) contrast(150%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      // Box is drawn using HTML Overlay, not Canvas
    } else if (activeFilter === 'bars') {
      const numBars = 4;
      const barWidth = canvas.width / numBars;
      for(let i=0; i<numBars; i++) {
        ctx.drawImage(image, (i*barWidth), 0, barWidth, canvas.height, (i*barWidth), 0, barWidth, canvas.height);
      }
    } else if (activeFilter === 'popart') {
      ctx.filter = 'grayscale(100%) contrast(200%)';
      ctx.drawImage(image, 0, 0);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 255, 180, 0.4)';
      ctx.fillRect(0, 0, canvas.width/2, canvas.height/2);
      ctx.fillStyle = 'rgba(255, 0, 200, 0.4)';
      ctx.fillRect(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    } else if (activeFilter === 'grid') {
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

  const canvasRef = useRef(null);
  useEffect(() => { applyFilter(); }, [image, activeFilter]);

  // --- DRAG / RESIZE LOGIC ---
  const startDrag = (e, type) => {
    e.preventDefault();
    const viewer = viewerRef.current.getBoundingClientRect();

    if (type === 'box') {
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = frameBox.x * viewer.width;
      const origY = frameBox.y * viewer.height;
      
      draggingRef.current = { startX, startY, origX, origY };
    } else if (type === 'resize') {
      resizingRef.current = { startX: e.clientX, startY: e.clientY, origWidth: frameBox.width, origHeight: frameBox.height, viewer };
    }

    const onMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (draggingRef.current) {
        const dx = (clientX - draggingRef.current.startX) / viewer.width;
        const dy = (clientY - draggingRef.current.startY) / viewer.height;
        setFrameBox(prev => ({ 
          ...prev, 
          x: Math.max(0.05, Math.min(0.95, (draggingRef.current.origX / viewer.width) + dx)), 
          y: Math.max(0.05, Math.min(0.95, (draggingRef.current.origY / viewer.height) + dy))
        }));
      } else if (resizingRef.current) {
        const dx = (clientX - resizingRef.current.startX) / resizingRef.current.viewer.width;
        const dy = (clientY - resizingRef.current.startY) / resizingRef.current.viewer.height;
        setFrameBox(prev => ({ 
          ...prev, 
          width: Math.max(0.1, resizingRef.current.origWidth + dx), 
          height: Math.max(0.1, resizingRef.current.origHeight + dy)
        }));
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
      draggingRef.current = null;
      resizingRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  };

  const startTextDrag = (e) => {
    e.preventDefault();
    const viewer = viewerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = frameText.x * viewer.width;
    const origY = frameText.y * viewer.height;

    const onMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = (clientX - startX) / viewer.width;
      const dy = (clientY - startY) / viewer.height;
      setFrameText(prev => ({ ...prev, x: (origX / viewer.width) + dx, y: (origY / viewer.height) + dy }));
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

  // Final Save (Draw Box & Text on Canvas)
  const downloadImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw Frame Box
    if (activeFilter === 'frame' && frameBox) {
      const boxX = frameBox.x * canvas.width;
      const boxY = frameBox.y * canvas.height;
      const boxWidth = frameBox.width * canvas.width;
      const boxHeight = frameBox.height * canvas.height;
      
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(boxX - boxWidth/2, boxY - boxHeight/2, boxWidth, boxHeight);

      // Draw Text
      const textX = frameText.x * canvas.width;
      const textY = frameText.y * canvas.height;
      ctx.fillStyle = frameColor;
      ctx.font = `bold ${canvas.width * 0.15}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText("IT'S", textX, textY - canvas.height * 0.2);
      ctx.fillText("NOT", textX, textY);
      ctx.fillText("JOKE", textX, textY + canvas.height * 0.2);
    }

    const link = document.createElement('a');
    link.download = 'frame_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleClear = () => {
    setImage(null);
    setFrameBox(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                    }}
                  >
                    {filter.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Viewer Box */}
          <div className="viewer-box" ref={viewerRef}>
            <canvas ref={canvasRef}></canvas>

            {/* Interactive Frame Box */}
            {activeFilter === 'frame' && frameBox && (
              <div 
                className="frame-box" 
                style={{
                  left: `${frameBox.x * 100}%`,
                  top: `${frameBox.y * 100}%`,
                  width: `${frameBox.width * 100}%`,
                  height: `${frameBox.height * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: frameColor,
                  borderWidth: '4px'
                }}
                onMouseDown={(e) => startDrag(e, 'box')}
                onTouchStart={(e) => startDrag(e, 'box')}
              >
                {/* Resize Handle (Bottom Right) */}
                <div 
                  className="resize-handle br" 
                  onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'resize'); }}
                  onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'resize'); }}
                ></div>
              </div>
            )}

            {/* Interactive Text */}
            {activeFilter === 'frame' && (
              <div 
                className="frame-text"
                style={{
                  left: `${frameText.x * 100}%`,
                  top: `${frameText.y * 100}%`,
                  color: frameColor,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={startTextDrag}
                onTouchStart={startTextDrag}
              >
                IT'S NOT JOKE
              </div>
            )}
          </div>
          
          <p style={{fontSize: '12px', color: '#888'}}>
            {activeFilter === 'frame' ? 'Drag the box and text. Use the bottom-right circle to resize Length & Width.' : 'Select a filter from the dropdown.'}
          </p>

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
              <label>Frame Border Color</label>
              <div className="color-options">
                {['#ffffff', '#000000', '#ff0000', '#ffff00', '#0000ff'].map(c => (
                  <div key={c} className={`color-swatch ${frameColor === c ? 'selected' : ''}`} style={{backgroundColor: c}} onClick={() => setFrameColor(c)}></div>
                ))}
              </div>
            </div>
            <button className="btn" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;