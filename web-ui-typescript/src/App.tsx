import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Interface definitions
interface Stem {
  id: string;
  name: string;
  volume: number;
  isMuted: boolean;
  isSolo: boolean;
}

interface LogEntry {
  text: string;
  type: 'info' | 'cmd' | 'warn' | 'err' | 'success';
  timestamp: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  tempo: number;
  pitch: string;
  chords: string[];
  notes: Array<{ time: string; note: string; duration: string }>;
}

// Mock Songs database
const MOCK_SONGS: Song[] = [
  {
    id: 'analog-drift',
    title: 'Analog Drift',
    artist: 'Audi-E Labs',
    tempo: 112,
    pitch: 'A Minor (440Hz)',
    chords: ['Am', 'Dm', 'G', 'C', 'F', 'Dm', 'E7', 'Am'],
    notes: [
      { time: '0:00', note: 'A3', duration: '1/2' },
      { time: '0:02', note: 'C4', duration: '1/4' },
      { time: '0:03', note: 'E4', duration: '1/4' },
      { time: '0:04', note: 'D4', duration: '1/2' },
      { time: '0:06', note: 'F4', duration: '1/4' },
      { time: '0:07', note: 'A4', duration: '1/4' },
      { time: '0:08', note: 'G4', duration: '1/1' },
    ]
  },
  {
    id: 'brutalist-pulse',
    title: 'Brutalist Pulse',
    artist: 'Mono-Synth-1',
    tempo: 130,
    pitch: 'F# Minor (370Hz)',
    chords: ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'Bm', 'C#'],
    notes: [
      { time: '0:00', note: 'F#3', duration: '1/2' },
      { time: '0:02', note: 'A3', duration: '1/2' },
      { time: '0:04', note: 'C#4', duration: '1/2' },
      { time: '0:06', note: 'E4', duration: '1/4' },
      { time: '0:07', note: 'D4', duration: '1/4' },
      { time: '0:08', note: 'A3', duration: '1/1' },
    ]
  },
  {
    id: 'sine-waves',
    title: 'Sine & Dust',
    artist: 'Unknown Machine',
    tempo: 90,
    pitch: 'C Major (261Hz)',
    chords: ['C', 'G/B', 'Am', 'Em/G', 'F', 'C/E', 'Dm7', 'G7'],
    notes: [
      { time: '0:00', note: 'C4', duration: '1/2' },
      { time: '0:02', note: 'E4', duration: '1/2' },
      { time: '0:04', note: 'G4', duration: '1/2' },
      { time: '0:06', note: 'B4', duration: '1/2' },
      { time: '0:08', note: 'A4', duration: '1/2' },
      { time: '0:10', note: 'F4', duration: '1/2' },
    ]
  }
];

export default function App() {
  // Mode configuration state
  const [isPentestMode, setIsPentestMode] = useState<boolean>(false);

  // Audio Playback states
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [selectedSongId, setSelectedSongId] = useState<string>('analog-drift');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration] = useState<number>(20); // 20s mock duration
  const [currentChordIndex, setCurrentChordIndex] = useState<number>(0);

  // Mixer Channels
  const [stems, setStems] = useState<Stem[]>([
    { id: 'vocals', name: 'Vocals (Stem 1)', volume: 80, isMuted: false, isSolo: false },
    { id: 'drums', name: 'Drums (Stem 2)', volume: 75, isMuted: false, isSolo: false },
    { id: 'bass', name: 'Bass (Stem 3)', volume: 90, isMuted: false, isSolo: false },
    { id: 'other', name: 'Melody (Stem 4)', volume: 85, isMuted: false, isSolo: false },
  ]);

  // File Upload states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Web Shell simulation state
  const [webshellActive, setWebshellActive] = useState<boolean>(false);
  const [webshellName, setWebshellName] = useState<string>('');
  const [terminalInput, setTerminalInput] = useState<string>('');

  // SQL Injection authentication states
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // System & Terminal Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      text: 'AUDI-E Security Labs initialization complete.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      text: 'Listening on Gateway http://localhost:8080. Safe-mode enabled.',
      type: 'success',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Audio Visualizer Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);


  const activeSong = songs.find(s => s.id === selectedSongId) || songs[0];

  // Print system log helper
  const addLog = (text: string, type: 'info' | 'cmd' | 'warn' | 'err' | 'success') => {
    setLogs(prev => [
      ...prev,
      { text, type, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Toggle Pentest Mode
  const handleModeToggle = () => {
    const nextMode = !isPentestMode;
    setIsPentestMode(nextMode);
    
    // Clear state associated with exploit
    if (!nextMode) {
      setWebshellActive(false);
      setWebshellName('');
      setLoggedInUser(null);
      setAuthError(null);
    }

    addLog(
      `SYSTEM SWITCH: Toggled mode to ${nextMode ? 'VULNERABLE (PENTEST ACTIVE)' : 'SECURE (FILTERING ACTIVE)'}`,
      nextMode ? 'warn' : 'info'
    );
  };

  // Audio Play/Pause simulation
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    addLog(`PLAYER: ${!isPlaying ? 'Started playback' : 'Paused playback'} of ${activeSong.title}`, 'info');
  };

  // Simulate progress bar increase
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            addLog(`PLAYER: Finished playback of ${activeSong.title}`, 'info');
            return 0;
          }
          const nextVal = prev + 0.5;
          // chord index updates according to play progress
          const chordsLen = activeSong.chords.length;
          const index = Math.min(Math.floor((nextVal / duration) * chordsLen), chordsLen - 1);
          setCurrentChordIndex(index);
          return nextVal;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, activeSong]);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = Array.from({ length: 40 }, () => Math.random() * 20);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Strict monochrome styling
      ctx.fillStyle = '#000000';
      const barWidth = canvas.width / bars.length;
      
      for (let i = 0; i < bars.length; i++) {
        // Animate if playing, otherwise static
        if (isPlaying) {
          // target dynamic changes
          const target = Math.random() * (canvas.height - 10);
          bars[i] = bars[i] * 0.7 + target * 0.3;
        } else {
          bars[i] = bars[i] * 0.95; // decay
        }
        
        // Apply volume modifier based on active stems
        let overallVolume = stems.reduce((acc, stem) => {
          if (stem.isMuted) return acc;
          return acc + (stem.volume / 100);
        }, 0) / stems.length;

        const val = bars[i] * Math.max(0.2, overallVolume);

        const x = i * barWidth;
        const y = canvas.height - val;
        
        ctx.fillRect(x + 2, y, barWidth - 4, val);
      }
      
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, stems]);

  // Handle drag and drop upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process file upload under secure/vulnerable logic
  const processFile = (file: File) => {
    setUploadError(null);
    setUploadProgress(0);
    setUploadedFile(null);
    
    addLog(`FILE_UPLOAD: Received file upload request for "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, 'info');

    // Simulate progress upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Run validations
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (isPentestMode) {
          // VULNERABLE MODE: No checks, allows any file!
          setUploadProgress(null);
          setUploadedFile({
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type || 'unknown/binary'
          });
          
          addLog(`[PENTEST_MODE: ACTIVE] Unsafe upload. Concatenating path. Saving as: "../data/uploads/${file.name}"`, 'warn');
          addLog(`FILE_UPLOAD: Success. File uploaded to server successfully.`, 'success');

          // Check if uploaded file is a script (web shell simulation)
          if (ext === '.php' || ext === '.py' || ext === '.sh' || ext === '.jsp') {
            setWebshellActive(true);
            setWebshellName(file.name);
            addLog(`EXPLOIT TRAP: Web shell script detected at destination! URL endpoint available: http://localhost:8080/data/uploads/${file.name}`, 'warn');
            addLog(`Web Shell command execution window unlocked in console panel below.`, 'success');
          } else {
            // It's a standard audio, append it to mock play list
            const newSongId = `uploaded-${Date.now()}`;
            const newSong: Song = {
              id: newSongId,
              title: file.name.replace(/\.[^/.]+$/, ""),
              artist: 'Uploaded Track',
              tempo: Math.floor(Math.random() * 40) + 90,
              pitch: 'E Minor',
              chords: ['Em', 'C', 'G', 'D'],
              notes: [
                { time: '0:00', note: 'E3', duration: '1/2' },
                { time: '0:04', note: 'G3', duration: '1/2' }
              ]
            };
            setSongs(prev => [...prev, newSong]);
            setSelectedSongId(newSongId);
          }
        } else {
          // SECURE MODE: Extension and mime check
          setUploadProgress(null);
          if (ext !== '.mp3' && ext !== '.wav') {
            const errText = `Security Error: Extension "${ext}" is blocked. Only .mp3 and .wav are permitted!`;
            setUploadError(errText);
            addLog(`[SECURE_MODE: ACTIVE] File blocked: ${errText}`, 'err');
            return;
          }

          // Simulate magic bytes check fail if not an audio mime (mocking backend validation)
          if (file.type && !file.type.startsWith('audio/')) {
            const errText = `Security Error: File type spoofing detected. Magic bytes do not match expected audio headers!`;
            setUploadError(errText);
            addLog(`[SECURE_MODE: ACTIVE] File blocked: ${errText}`, 'err');
            return;
          }

          // Secure rename to UUID
          const uuidName = `f3b49e20-80d1-4db5-${Math.floor(Math.random()*9000+1000).toString(16)}${ext}`;
          setUploadedFile({
            name: uuidName,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type
          });
          
          addLog(`[SECURE_MODE: ACTIVE] Safe rename: Renaming original file "${file.name}" to UUID "${uuidName}" to prevent Path Traversal/Webshell execution.`, 'success');
          
          // Append to song database
          const newSongId = `secure-${Date.now()}`;
          const newSong: Song = {
            id: newSongId,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Secure Upload',
            tempo: 100,
            pitch: 'C Minor',
            chords: ['Cm', 'Ab', 'Fm', 'G'],
            notes: [{ time: '0:00', note: 'C3', duration: '1/1' }]
          };
          setSongs(prev => [...prev, newSong]);
          setSelectedSongId(newSongId);
        }
      }
    }, 200);
  };

  // SQL Injection Submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggedInUser(null);

    addLog(`AUTH: Login attempt with username: "${usernameInput}"`, 'info');

    if (isPentestMode) {
      // VULNERABLE MODE: SQLi Injection direct query matching
      const query = `SELECT username, password FROM users WHERE username = '${usernameInput}' AND password = '${passwordInput}'`;
      addLog(`[PENTEST_MODE: ACTIVE] Concatenating query: ${query}`, 'warn');

      // Check if username has SQL injection payload to bypass
      const isBypassed = 
        usernameInput.includes("' OR") || 
        usernameInput.includes("'or") || 
        usernameInput.includes("'--") ||
        usernameInput.includes("' OR '1'='1") ||
        usernameInput.includes("' OR 1=1") ||
        usernameInput.includes('" OR ""="');

      if (isBypassed) {
        setLoggedInUser('admin');
        addLog(`[SQL INJECTION DETECTED] Authentication bypassed successfully! Returned user row: "admin"`, 'success');
      } else {
        // Simple mock normal matching
        if (usernameInput === 'admin' && passwordInput === 'admin') {
          setLoggedInUser('admin');
          addLog(`AUTH: Successful login as: "admin"`, 'success');
        } else {
          setAuthError('Invalid credentials');
          addLog(`AUTH: Failed authentication.`, 'err');
        }
      }
    } else {
      // SECURE MODE: Parameterized queries simulation
      addLog(`[SECURE_MODE: ACTIVE] Parameterized query: SELECT username, password FROM users WHERE username = ? (Param: "${usernameInput}")`, 'info');
      
      // Standard matching, escaping special characters
      if (usernameInput === 'admin' && passwordInput === 'admin123') {
        setLoggedInUser('admin');
        addLog(`AUTH: Successful login as: "admin"`, 'success');
      } else {
        setAuthError('Invalid credentials');
        addLog(`AUTH: Failed authentication. Invalid username/password.`, 'err');
      }
    }
  };

  // Terminal Exec Simulation (Command Injection)
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalInput('');
    
    addLog(`$ ${cmd}`, 'cmd');

    if (!isPentestMode) {
      addLog(`Error: Console command shell is disabled in secure mode.`, 'err');
      return;
    }

    if (!webshellActive) {
      addLog(`Error: Web shell execution requires a script listener (upload a script file (.php, .py) first under VULNERABLE mode).`, 'err');
      return;
    }

    // Command injection execution results simulation
    setTimeout(() => {
      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd === 'whoami') {
        addLog('www-data', 'info');
      } else if (lowerCmd === 'id') {
        addLog('uid=33(www-data) gid=33(www-data) groups=33(www-data),27(sudo)', 'info');
      } else if (lowerCmd === 'ls' || lowerCmd === 'dir') {
        addLog(`api-gateway/\nai-engine/\ndata/\nweb-ui/\n${webshellName}\n.env\ndatabase.go`, 'info');
      } else if (lowerCmd.startsWith('cat ')) {
        const fileToCat = cmd.substring(4).trim();
        if (fileToCat === '.env') {
          addLog(`PORT=8080\nDB_PATH=../data/audi-e.db\nPENTEST_MODE=true\nJWT_SECRET=super_secret_unbreakable_key_1337\nFLAG=FLAG{AUDI_E_WEB_SHELL_INJECTION_SUCCESS}`, 'success');
        } else if (fileToCat === 'database.go') {
          addLog(`package db\n\nimport "database/sql"\n\nvar DB *sql.DB\n\nfunc InitDB(path string) error {\n  // database configurations\n}`, 'info');
        } else {
          addLog(`cat: ${fileToCat}: No such file or directory`, 'err');
        }
      } else if (lowerCmd === 'clear') {
        setLogs([]);
      } else if (lowerCmd === 'help') {
        addLog('Available commands: whoami, id, ls, cat <file>, clear, help', 'info');
      } else {
        addLog(`sh: ${cmd}: command not found`, 'err');
      }
    }, 150);
  };

  // Mixer handlers
  const handleVolumeChange = (id: string, value: number) => {
    setStems(prev => prev.map(stem => {
      if (stem.id === id) {
        return { ...stem, volume: value };
      }
      return stem;
    }));
  };

  const handleMuteToggle = (id: string) => {
    setStems(prev => prev.map(stem => {
      if (stem.id === id) {
        const nextMuted = !stem.isMuted;
        addLog(`MIXER: ${nextMuted ? 'Muted' : 'Unmuted'} channel "${stem.name}"`, 'info');
        return { ...stem, isMuted: nextMuted };
      }
      return stem;
    }));
  };

  const handleSoloToggle = (id: string) => {
    setStems(prev => {
      const isAnySoloAlready = prev.find(s => s.id === id)?.isSolo;
      const targetSolo = !isAnySoloAlready;
      
      addLog(`MIXER: ${targetSolo ? 'Soloed' : 'Un-soloed'} channel "${prev.find(s => s.id === id)?.name}"`, 'info');

      return prev.map(stem => {
        if (stem.id === id) {
          return { ...stem, isSolo: targetSolo, isMuted: false };
        }
        // If soloing, mute all other channels that are not soloed
        return { ...stem, isMuted: targetSolo ? true : false, isSolo: false };
      });
    });
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header">
        <div className="brand-title">
          AUDI-E // SOUND SEPARATION LAB
          <span className="brand-tag">W2_BUILD</span>
        </div>
        
        <div className="header-controls">
          {/* Main Vulnerable / Secure state switcher */}
          <div className="toggle-group">
            <button 
              className={`toggle-btn ${!isPentestMode ? 'active' : ''}`}
              onClick={() => { if (isPentestMode) handleModeToggle(); }}
            >
              Secure Mode
            </button>
            <button 
              className={`toggle-btn ${isPentestMode ? 'active vuln-active' : ''}`}
              onClick={() => { if (!isPentestMode) handleModeToggle(); }}
            >
              Vuln Mode (Active)
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="dashboard-grid">
        {/* LEFT COLUMN: Input, visualizer, database test */}
        <section className="grid-col">
          
          {/* UPLOAD PANEL */}
          <div className="panel">
            <div className="panel-header">
              <span>1. Audio / Script Upload</span>
              <span className="section-tag">{isPentestMode ? 'Vulnerable' : 'Secure'}</span>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div 
                className={`upload-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('audio-file-input')?.click()}
              >
                <div className="upload-icon">⇪</div>
                <div>Drag file here or click to browse</div>
                <div className="upload-hint">
                  {isPentestMode 
                    ? "Permits any extensions (.wav, .mp3, .php, .py, .sh)" 
                    : "Only permits official audio files (.mp3, .wav)"}
                </div>
                <input 
                  id="audio-file-input"
                  className="file-input"
                  type="file"
                  onChange={handleFileInput}
                />
              </div>

              {uploadProgress !== null && (
                <div className="upload-status">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Processing file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div style={{ marginTop: '12px', padding: '10px', border: '1px solid #ff0000', color: '#ff0000', fontSize: '11px', fontWeight: 'bold' }}>
                  [ERROR] {uploadError}
                </div>
              )}

              {uploadedFile && (
                <div style={{ marginTop: '12px', padding: '10px', border: '1px solid #000000', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>✓ File Upload success:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', marginTop: '4px' }}>
                    <span style={{ color: '#666' }}>Name:</span> <span>{uploadedFile.name}</span>
                    <span style={{ color: '#666' }}>Size:</span> <span>{uploadedFile.size}</span>
                    <span style={{ color: '#666' }}>Mime:</span> <span>{uploadedFile.type}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PLAYER & WAVEFORM PANEL */}
          <div className="panel">
            <div className="panel-header">
              <span>2. Audio Player & Visualizer</span>
              <span className="section-tag">{isPlaying ? 'Playing' : 'Stopped'}</span>
            </div>
            
            <div style={{ padding: '16px' }} className="player-container">
              {/* Song Selector chips */}
              <div className="song-selector">
                {songs.map(song => (
                  <div 
                    key={song.id}
                    className={`song-chip ${selectedSongId === song.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSongId(song.id);
                      setCurrentTime(0);
                      setCurrentChordIndex(0);
                      setIsPlaying(false);
                      addLog(`PLAYER: Selected track "${song.title}"`, 'info');
                    }}
                  >
                    {song.title}
                  </div>
                ))}
              </div>

              {/* Canvas Waveform Visualizer */}
              <canvas 
                ref={canvasRef}
                className="waveform-canvas"
                width="600"
                height="80"
              />

              <div className="player-controls">
                <button onClick={handlePlayToggle}>
                  {isPlaying ? '▮▮ Pause' : '▶ Play'}
                </button>
                <div className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e5e5', paddingTop: '8px' }}>
                <span>Track: <strong>{activeSong.title}</strong></span>
                <span>Artist: <strong>{activeSong.artist}</strong></span>
              </div>
            </div>
          </div>

          {/* ADMIN PORTAL PANEL (SQL INJECTION PRACTICE) */}
          <div className="panel">
            <div className="panel-header">
              <span>3. Shared DB User Login</span>
              <span className="section-tag">{loggedInUser ? 'Authenticated' : 'Locked'}</span>
            </div>
            
            <div style={{ padding: '16px' }}>
              {!loggedInUser ? (
                <form onSubmit={handleAuthSubmit} className="sqli-panel">
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    Access shared stems repository database:
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      placeholder="e.g. admin" 
                      value={usernameInput}
                      onChange={e => setUsernameInput(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                    />
                  </div>

                  <button type="submit" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                    Sign In
                  </button>

                  {authError && (
                    <div style={{ color: '#ff0000', fontSize: '11px', fontWeight: 'bold' }}>
                      [AUTH ERROR] {authError}
                    </div>
                  )}

                  {isPentestMode ? (
                    <div className="sqli-hint vuln-hint">
                      💡 <strong>Vulnerable query running:</strong> Select * from users where username = '{'{input}'}' ... Try bypass with: <code>' OR 1=1 --</code>
                    </div>
                  ) : (
                    <div className="sqli-hint">
                      💡 Parameterized checks enabled. Standard login credentials: <code>admin</code> / <code>admin123</code>.
                    </div>
                  )}
                </form>
              ) : (
                <div className="user-status">
                  <div>
                    Logged in as: <strong>{loggedInUser}</strong> (administrator)
                  </div>
                  <button onClick={() => {
                    setLoggedInUser(null);
                    setUsernameInput('');
                    setPasswordInput('');
                    addLog('AUTH: User signed out.', 'info');
                  }} style={{ padding: '4px 8px', fontSize: '10px' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Stem isolation mixer, pitch, tempo, chord display */}
        <section className="grid-col">
          
          {/* MIXER PANEL */}
          <div className="panel">
            <div className="panel-header">
              <span>4. Source Separation Mixer</span>
              <span className="section-tag">4 Stems</span>
            </div>
            
            <div style={{ padding: '16px' }} className="mixer-container">
              {stems.map(stem => (
                <div 
                  key={stem.id}
                  className={`channel-strip ${!stem.isMuted ? 'active' : ''}`}
                >
                  <div className="channel-name">
                    {stem.name.split(' ')[0]}
                    <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#666', marginTop: '2px' }}>
                      {stem.isMuted ? '[MUTED]' : `${stem.volume}%`}
                    </div>
                  </div>

                  <div className="mono-slider-wrapper">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      className="mono-slider"
                      value={stem.volume}
                      disabled={stem.isMuted}
                      onChange={(e) => handleVolumeChange(stem.id, parseInt(e.target.value))}
                    />
                  </div>

                  <div className="channel-controls">
                    <button 
                      className={`btn-mute ${stem.isMuted ? 'active' : ''}`}
                      onClick={() => handleMuteToggle(stem.id)}
                      title="Mute"
                    >
                      M
                    </button>
                    <button 
                      className={`btn-solo ${stem.isSolo ? 'active' : ''}`}
                      onClick={() => handleSoloToggle(stem.id)}
                      title="Solo"
                    >
                      S
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI METRICS PANEL */}
          <div className="panel">
            <div className="panel-header">
              <span>5. Pitch & Tempo Analysis</span>
              <span className="section-tag">AI Engine API</span>
            </div>
            
            <div style={{ padding: '16px' }} className="analysis-summary">
              <div className="metric-box">
                <span className="metric-label">Estimated Tempo</span>
                <span className="metric-value">{activeSong.tempo} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>BPM</span></span>
              </div>
              
              <div className="metric-box">
                <span className="metric-label">Detected Key</span>
                <span className="metric-value" style={{ fontSize: '15px' }}>{activeSong.pitch}</span>
              </div>

              {/* Rolling Chord Visual */}
              <div className="chord-box">
                <span className="metric-label" style={{ marginBottom: '6px' }}>Current Playing Chord</span>
                <span className="chord-value">
                  {isPlaying ? activeSong.chords[currentChordIndex] : '—'}
                </span>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {activeSong.chords.map((chord, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px',
                        border: '1px solid #000000',
                        background: isPlaying && currentChordIndex === i ? '#000000' : 'transparent',
                        color: isPlaying && currentChordIndex === i ? '#ffffff' : '#000000',
                      }}
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* NOTES TRANSCRIPTION PANEL */}
          <div className="panel">
            <div className="panel-header">
              <span>6. Real-time Note Transcription</span>
              <button 
                style={{ fontSize: '9px', padding: '2px 6px', border: '1px solid #000' }}
                onClick={() => addLog(`TRANSCRIPTION: Exported MIDI tracker for ${activeSong.title}`, 'success')}
              >
                Export MIDI
              </button>
            </div>
            
            <div className="transcription-panel">
              <div className="transcription-header">
                <span>TIME</span>
                <span>NOTE</span>
                <span>DURATION</span>
              </div>
              <div className="transcription-rows">
                {activeSong.notes.map((event, idx) => (
                  <div key={idx} className="transcription-row">
                    <span>{event.time}</span>
                    <span style={{ fontWeight: 'bold' }}>{event.note}</span>
                    <span>{event.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* BOTTOM CONSOLE PANEL (COMMAND INJECTION & BACKEND LOGS) */}
      <footer className="console-panel">
        <div className="console-header">
          <span>Server Interaction & Execution Logs</span>
          <div className="console-actions">
            {webshellActive && isPentestMode && (
              <span style={{ color: '#ff0000', marginRight: '16px', fontWeight: 'bold' }}>
                [RCE SHELL LISTENER ACTIVE: {webshellName}]
              </span>
            )}
            <button className="console-clear" onClick={() => setLogs([])}>
              Clear Buffer
            </button>
          </div>
        </div>
        
        <div className="console-output">
          {logs.map((log, index) => (
            <div key={index} className={`console-line ${log.type}`}>
              [{log.timestamp}] {log.text}
            </div>
          ))}
          {/* Sticky target bottom */}
          <div style={{ height: '1px' }}></div>
        </div>

        {/* Command Shell input - Enabled during Command Injection Vulnerability */}
        {isPentestMode && webshellActive && (
          <form 
            onSubmit={handleTerminalSubmit} 
            style={{ 
              display: 'flex', 
              borderTop: '1px solid #000000', 
              background: '#000000' 
            }}
          >
            <div style={{ color: '#ffffff', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold' }}>
              webshell@{webshellName}:~$
            </div>
            <input 
              type="text"
              value={terminalInput}
              onChange={e => setTerminalInput(e.target.value)}
              placeholder="Inject commands: whoami, ls, id, cat .env ..."
              style={{ 
                flex: 1, 
                border: 'none', 
                background: '#000000', 
                color: '#ffffff', 
                padding: '8px 12px', 
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
          </form>
        )}
      </footer>
    </div>
  );
}
