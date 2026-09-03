import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const [activeTab, setActiveTab] = useState('tools'); // 'tools' or 'styles'
  
  // Frame Settings
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [frameBox, setFrameBox] = useState(null);
  const [frameText, setFrameText] = useState({ x: 0.1, y: 0.5 });

  // History
  const [history, setHistory] = useState(['original']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const fileInputRef = useRef(null);
  const draggingRef = useRef(null);
  const resizingRef = useRef(null);

  const filters = [
    { id: 'original', name: 'Original' },
    { id: 'glitch', name: 'Glitch' },
    { id: 'mono', name: 'Monochrome' },
    { id: 'sketch', name: 'Sketch' },
    { id: 'error', name: 'Error 404' },
    { id: 'frame', name: 'It\'s Not Joke' },
    { id: 'bars', name: 'Split Slices' },
    { id: 'popart', name: 'Pop Art' },
    { id: 'grid', name: 'Grid & Tech' },
    { id: 'focus', name: 'Focus Typo' },
    { id: 'paint', name: 'Color Paint' }
  ];

  // Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setFrameBox({ x: 0.5, y: 0.4, width: 0.4, height: 0.4 });
          setHistory(['original']);
          setHistoryIndex(0);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply Filters
  const applyFilter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    switch (activeFilter) {
      case 'glitch':
        for (let i = 0; i < canvas.height; i += 15) {
          const shiftX = (Math.random() - 0.5) * 50;
          ctx.drawImage(canvas, 0, i, canvas.width, 15, shiftX, i, canvas.width, 15);
        }
        break;
      case 'mono':
        ctx.filter = 'grayscale(100%) contrast(120%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        break;
      case 'sketch':
        ctx.filter = 'grayscale(100%) blur(10px) contrast(220%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        break;
      case 'error':
        ctx.filter = 'grayscale(100%) contrast(200%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        for(let i=0; i<80; i++) ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 4);
        break;
      case 'frame':
        ctx.filter = 'grayscale(100%) contrast(150%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        break;
      case 'bars':
        const numBars = 4;
        const barWidth = canvas.width / numBars;
        for(let i=0; i<numBars; i++) {
          ctx.drawImage(image, (i*barWidth), 0, barWidth, canvas.height, (i*barWidth), 0, barWidth, canvas.height);
        }
        break;
      case 'popart':
        ctx.filter = 'grayscale(100%) contrast(200%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0, 255, 180, 0.4)';
        ctx.fillRect(0, 0, canvas.width/2, canvas.height/2);
        ctx.fillStyle = 'rgba(255, 0, 200, 0.4)';
        ctx.fillRect(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
        break;
      case 'grid':
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        const gridSize = canvas.width / 10;
        for(let i=0; i<10; i++) {
          ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height);
          ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
        }
        break;
      case 'focus':
        ctx.filter = 'grayscale(100%) blur(8px)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        break;
      case 'paint':
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(0, 100, 255, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        break;
      default: break;
    }
  };

  useEffect(() => { applyFilter(); }, [image, activeFilter]);

  // History Handlers
  const changeFilter = (filterId) => {
    setActiveFilter(filterId);
    const newHistory = [...history.slice(0, historyIndex + 1), filterId];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setActiveFilter(history[newIndex]);
    }
  };

  const handleClear = () => {
    setImage(null);
    setHistory(['original']);
    setHistoryIndex(0);
    setFrameBox(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag / Resize Logic
  const startDrag = (e, type) => {
    e.preventDefault();
    const viewer = viewerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    if (type === 'box') {
      draggingRef.current = {
        startX, startY,
        origX: frameBox.x * viewer.width,
        origY: frameBox.y * viewer.height
      };
    } else if (type === 'resize') {
      resizingRef.current = { startX, startY, viewer, origW: frameBox.width, origH: frameBox.height };
    }

    const onMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      if (draggingRef.current) {
        const dx = (clientX - draggingRef.current.startX) / viewer.width;
        const dy = (clientY - draggingRef.current.startY) / viewer.height;
        setFrameBox(prev => ({
          ...prev,
          x: Math.max(0, Math.min(1, (draggingRef.current.origX / viewer.width) + dx)),
          y: Math.max(0, Math.min(1, (draggingRef.current.origY / viewer.height) + dy))
        }));
      } else if (resizingRef.current) {
        const dx = (clientX - resizingRef.current.startX) / resizingRef.current.viewer.width;
        const dy = (clientY - resizingRef.current.startY) / resizingRef.current.viewer.height;
        setFrameBox(prev => ({
          ...prev,
          width: Math.max(0.05, resizingRef.current.origW + dx),
          height: Math.max(0.05, resizingRef.current.origH + dy)
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

  // Save Logic (Draw Frame Box & Text onto Canvas)
  const handleSave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (activeFilter === 'frame' && frameBox) {
      const boxX = frameBox.x * canvas.width;
      const boxY = frameBox.y * canvas.height;
      const boxW = frameBox.width * canvas.width;
      const boxH = frameBox.height * canvas.height;

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(boxX - boxW/2, boxY - boxH/2, boxW, boxH);

      // Text
      ctx.font = `bold ${canvas.width * 0.12}px Arial`;
      ctx.fillStyle = frameColor;
      ctx.textAlign = 'left';
      ctx.fillText("IT'S", canvas.width * 0.05, canvas.height * 0.4);
      ctx.fillText("NOT", canvas.width * 0.05, canvas.height * 0.55);
      ctx.fillText("JOKE", canvas.width * 0.05, canvas.height * 0.7);
    }

    const link = document.createElement('a');
    link.download = 'snapseed_edit.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="App">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-actions">
          <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
            <img src="/assets/open.png" alt="Open" />
          </button>
          <input ref={fileInputRef} id="file-upload" type="file" onChange={handleImageUpload} style={{display: 'none'}} />
        </div>
        
        <div className="title">GLITCH EDITOR</div>

        <div className="top-actions">
          {image && (
            <>
              <button className="icon-btn" onClick={handleUndo} disabled={historyIndex <= 0}>
                <img src="/assets/undo.png" alt="Undo" />
              </button>
              <button className="icon-btn" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                <img src="/assets/redo.png" alt="Redo" />
              </button>
              <button className="icon-btn" onClick={handleClear}>
                <img src="/assets/clear.png" alt="Clear" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* CENTRAL CANVAS */}
      <div className="canvas-area">
        {!image ? (
          <div style={{color: '#555'}}>Open an image to start editing</div>
        ) : (
          <div className="viewer-box" ref={viewerRef}>
            <canvas ref={canvasRef}></canvas>

            {activeFilter === 'frame' && frameBox && (
              <>
                <div 
                  className="frame-box" 
                  style={{
                    position: 'absolute',
                    left: `${frameBox.x * 100}%`, top: `${frameBox.y * 100}%`,
                    width: `${frameBox.width * 100}%`, height: `${frameBox.height * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    border: `4px solid ${frameColor}`,
                    cursor: 'move'
                  }}
                  onMouseDown={(e) => startDrag(e, 'box')}
                  onTouchStart={(e) => startDrag(e, 'box')}
                >
                  <div 
                    className="resize-handle" 
                    style={{position:'absolute', bottom:'-10px', right:'-10px', width:'15px', height:'15px', background: frameColor, borderRadius:'50%'}}
                    onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'resize'); }}
                    onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'resize'); }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* DROPDOWN TOOLS PANEL (Opens when clicking Tools) */}
      {activeTab === 'tools' && image && (
        <div className="dropdown-panel">
          {filters.map(f => (
            <div 
              key={f.id} 
              className={`tool-item ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => changeFilter(f.id)}
            >
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>
          <img src="/assets/tools.png" alt="Tools" />
          <span>TOOLS</span>
        </div>
        <div className={`nav-item ${activeTab === 'styles' ? 'active' : ''}`} onClick={() => setActiveTab('styles')}>
          <img src="/assets/styles.png" alt="Styles" />
          <span>STYLES</span>
        </div>
        <div className="nav-item" onClick={handleSave}>
          <img src="/assets/export.png" alt="Save" />
          <span>EXPORT</span>
        </div>
      </div>

      {/* Settings Modal (Frame Color) */}
      {activeFilter === 'frame' && (
        <div className="modal-overlay" onClick={() => setActiveTab('tools')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Frame Color</h3>
            <div className="color-options">
              {['#ffffff', '#000000', '#ff0000', '#ffff00', '#0000ff'].map(c => (
                <div key={c} className={`color-swatch ${frameColor === c ? 'selected' : ''}`} style={{backgroundColor: c}} onClick={() => setFrameColor(c)}></div>
              ))}
            </div>
            <button className="btn" onClick={() => setActiveTab('tools')}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;