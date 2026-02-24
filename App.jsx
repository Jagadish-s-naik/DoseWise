const { useState, useEffect, useRef, useMemo } = React;

const DoseWiseApp = () => {
    // --- State Management ---
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [isDetecting, setIsDetecting] = useState(false);
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState({ label: 'no_pill', confidence: 0 });
    const [alert, setAlert] = useState(null);
    const [cameraState, setCameraState] = useState('pending'); // pending, active, denied, error

    // Core Data State
    const [adherenceLog, setAdherenceLog] = useState([]);
    const [stats, setStats] = useState({
        currentStreak: 0,
        totalPillsTaken: 0,
        totalPillsScheduled: 0
    });

    // --- Refs ---
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionInterval = useRef(null);
    const audioCtx = useRef(null);

    // --- Constants ---
    const [modelUrl, setModelUrl] = useState(localStorage.getItem('dosewise_model_url') || "");
    const CONFIDENCE_THRESHOLD = 0.75;
    const DETECTION_FREQUENCY = 500;
    const PILL_TYPES = {
        MORNING: "pill_morning",
        EVENING: "pill_evening"
    };

    // --- Initialization & Setup ---
    useEffect(() => {
        initializeApp();
        requestNotificationPermission();
        return () => stopDetection();
    }, []);

    const initializeApp = async () => {
        loadLocalData();
        setupWebcam();
        if (modelUrl) {
            await loadModel(modelUrl);
        } else {
            setIsModelLoading(false);
        }
    };

    const loadLocalData = () => {
        const savedData = localStorage.getItem('dosewise_data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setAdherenceLog(parsed.adherenceLog || []);
            setStats({
                currentStreak: parsed.currentStreak || 0,
                totalPillsTaken: parsed.totalPillsTaken || 0,
                totalPillsScheduled: parsed.totalPillsScheduled || 0
            });
        } else {
            // DEMO: Pre-populate for presentation
            const mockData = {
                adherenceLog: generateMockAdherence(),
                currentStreak: 5,
                totalPillsTaken: 47,
                totalPillsScheduled: 50
            };
            setAdherenceLog(mockData.adherenceLog);
            setStats(mockData);
            localStorage.setItem('dosewise_data', JSON.stringify(mockData));
        }
    };

    const generateMockAdherence = () => {
        const history = [];
        for (let i = 7; i >= 1; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            history.push({
                date: dateStr,
                morning: { scheduled: "08:00", taken: i % 3 === 0 ? null : "08:15", pillType: PILL_TYPES.MORNING },
                evening: { scheduled: "20:00", taken: i % 4 === 0 ? null : "20:30", pillType: PILL_TYPES.EVENING }
            });
        }
        return history;
    };

    const setupWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraState('active');
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraState(err.name === 'NotAllowedError' ? 'denied' : 'error');
        }
    };

    const loadModel = async (url) => {
        setIsModelLoading(true);
        try {
            const checkpoint = url.endsWith('/') ? url + 'model.json' : url + '/model.json';
            const metadata = url.endsWith('/') ? url + 'metadata.json' : url + '/metadata.json';

            const loadedModel = await tmImage.load(checkpoint, metadata);
            setModel(loadedModel);
            setIsModelLoading(false);
            setAlert({ type: 'success', message: 'AI Model Loaded Successfully!' });
            setTimeout(() => setAlert(null), 3000);
            console.log("Model initialized:", url);
        } catch (err) {
            console.error("Model load failure:", err);
            setAlert({ type: 'warning', message: 'Unable to load AI model. Ensure the URL is correct and public.' });
            setIsModelLoading(false);
        }
    };

    const updateModelUrl = (newUrl) => {
        setModelUrl(newUrl);
        localStorage.setItem('dosewise_model_url', newUrl);
        loadModel(newUrl);
    };

    // --- Detection Logic ---
    const startDetection = () => {
        if (!model) {
            setAlert({ type: 'warning', message: 'Please provide a valid Model URL first' });
            return;
        }
        if (!isDetecting) {
            setIsDetecting(true);
            detectionInterval.current = setInterval(runPrediction, DETECTION_FREQUENCY);
        }
    };

    const stopDetection = () => {
        setIsDetecting(false);
        if (detectionInterval.current) clearInterval(detectionInterval.current);
    };

    const runPrediction = async () => {
        if (!videoRef.current || !model) return;

        const predictions = await model.predict(videoRef.current);

        // Find the prediction with highest probability
        let bestMatch = { className: 'no_pill', probability: 0 };
        predictions.forEach(p => {
            if (p.probability > bestMatch.probability) {
                bestMatch = p;
            }
        });

        const label = bestMatch.className;
        const confidence = bestMatch.probability;

        // Draw detection box on canvas
        drawOverlay(label, confidence);
        setPrediction({ label, confidence });

        if (confidence > CONFIDENCE_THRESHOLD) {
            handleDetection(label, confidence);
        }
    };


    const drawOverlay = (label, confidence) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (label !== 'no_pill') {
            const isCorrect = checkPillValidity(label).isValid;
            ctx.strokeStyle = isCorrect ? '#00AA66' : '#DD3333';
            ctx.lineWidth = 4;
            ctx.strokeRect(100, 100, 440, 280); // Bounding box

            ctx.fillStyle = isCorrect ? '#00AA66' : '#DD3333';
            ctx.font = 'bold 24px Inter';
            ctx.fillText(`${label} (${(confidence * 100).toFixed(0)}%)`, 105, 90);
        }
    };

    const checkPillValidity = (detectedPill) => {
        const now = new Date();
        const currentHour = now.getHours();

        // Define windows: Morning (7-9 AM), Evening (7-9 PM)
        const isMorningWindow = currentHour >= 7 && currentHour <= 9;
        const isEveningWindow = currentHour >= 19 && currentHour <= 21;

        if (detectedPill === PILL_TYPES.MORNING) {
            return { isValid: isMorningWindow, type: 'morning' };
        }
        if (detectedPill === PILL_TYPES.EVENING) {
            return { isValid: isEveningWindow, type: 'evening' };
        }
        return { isValid: false, type: null };
    };

    const handleDetection = (label, confidence) => {
        // Ignore "empty" or "multiple" for adherence logic
        if (label === 'no_pill' || label === 'multiple_pills' || label === 'Background Join') return;

        // Visual feedback for any detection
        setAlert({ type: 'info', message: `🔍 Identification: ${label.replace(/_/g, ' ')} detected.` });

        const { isValid, type } = checkPillValidity(label);

        if (isValid) {
            processSuccess(label, type);
        } else {
            // Only show warning if it's potentially a pill but not the right time/type
            // We don't want to spam warnings for everything, so we check if it's a "pill" class
            if (label.toLowerCase().includes('pill') || label.toLowerCase().includes('med')) {
                setAlert({ type: 'warning', message: `⚠️ ${label.replace(/_/g, ' ')} is not scheduled for now.` });
            }
        }

        // Clear general info alert after a few seconds if not replaced by success/warning
        setTimeout(() => {
            setAlert(prev => prev?.type === 'info' ? null : prev);
        }, 3000);
    };

    const processSuccess = (pillName, type) => {
        const today = new Date().toISOString().split('T')[0];
        const takenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Check if already taken today
        const existingEntry = adherenceLog.find(log => log.date === today);
        if (existingEntry && existingEntry[type].taken) return;

        playSuccessSound();
        setAlert({ type: 'success', message: `✅ ${pillName.replace(/_/g, ' ')} Taken!` });

        // Update Data
        const newLog = [...adherenceLog];
        let dayIdx = newLog.findIndex(l => l.date === today);

        if (dayIdx > -1) {
            newLog[dayIdx][type].taken = takenTime;
        } else {
            const newDay = {
                date: today,
                morning: { scheduled: "08:00", taken: type === 'morning' ? takenTime : null, pillType: pillName },
                evening: { scheduled: "20:00", taken: type === 'evening' ? takenTime : null, pillType: pillName }
            };
            newLog.push(newDay);
        }

        setAdherenceLog(newLog);

        // Update Stats
        const newStats = {
            ...stats,
            totalPillsTaken: stats.totalPillsTaken + 1,
            currentStreak: calculateStreak(newLog)
        };
        setStats(newStats);

        localStorage.setItem('dosewise_data', JSON.stringify({
            adherenceLog: newLog,
            ...newStats
        }));

        setTimeout(() => setAlert(null), 5000);
    };

    const calculateStreak = (logs) => {
        let streak = 0;
        const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (let day of sorted) {
            // A "perfect" day is when both (if defined) or at least one (if only one scheduled) is taken
            // For this logic, we'll keep it simple: any dose taken counts towards the streak of "checking in"
            if (day.morning?.taken || day.evening?.taken) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };


    const playSuccessSound = () => {
        if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.current.createOscillator();
        const gainNode = audioCtx.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.current.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.current.currentTime); // A5
        gainNode.gain.setValueAtTime(0, audioCtx.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.current.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.current.currentTime + 0.3);
    };

    // --- Notifications ---
    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    };

    useEffect(() => {
        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [adherenceLog]);

    const checkReminders = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const log = adherenceLog.find(l => l.date === today);

        // Reminder 15 mins after: 8:15 AM and 8:15 PM
        const isMorningReminderTime = now.getHours() === 8 && now.getMinutes() === 15;
        const isEveningReminderTime = now.getHours() === 20 && now.getMinutes() === 15;

        if (isMorningReminderTime && (!log || !log.morning.taken)) {
            sendNotification("morning");
        }
        if (isEveningReminderTime && (!log || !log.evening.taken)) {
            sendNotification("evening");
        }
    };

    const sendNotification = (type) => {
        if (Notification.permission === "granted") {
            new Notification("DoseWise Reminder", {
                body: `Reminder: Time to take your ${type} medication`,
                icon: "/favicon.ico"
            });
        }
    };

    // --- UI Components ---
    const Dashboard = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayLog = adherenceLog.find(l => l.date === today) || {
            morning: { taken: null }, evening: { taken: null }
        };

        const adherenceRate = stats.totalPillsScheduled > 0
            ? ((stats.totalPillsTaken / stats.totalPillsScheduled) * 100).toFixed(0)
            : 0;

        return (
            <div className="dashboard-card">
                <h2 className="card-title">💊 Medication Schedule</h2>
                <div className="schedule-list">
                    <div className={`schedule-item ${todayLog.morning.taken ? 'taken' : 'pending'}`}>
                        <div>
                            <strong>Morning Dose</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>8:00 AM • White Pill</div>
                        </div>
                        <span className={`status-badge ${todayLog.morning.taken ? 'status-taken' : 'status-pending'}`}>
                            {todayLog.morning.taken ? `✓ Taken ${todayLog.morning.taken}` : '⏱ Pending'}
                        </span>
                    </div>
                    <div className={`schedule-item ${todayLog.evening.taken ? 'taken' : 'pending'}`}>
                        <div>
                            <strong>Evening Dose</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>8:00 PM • Blue Capsule</div>
                        </div>
                        <span className={`status-badge ${todayLog.evening.taken ? 'status-taken' : 'status-pending'}`}>
                            {todayLog.evening.taken ? `✓ Taken ${todayLog.evening.taken}` : '⏱ Pending'}
                        </span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-value">{adherenceRate}%</span>
                        <span className="stat-label">Adherence</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats.currentStreak}d</span>
                        <span className="stat-label">Streak</span>
                    </div>
                </div>

                <div className="calendar-view">
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>LAST 7 DAYS</h3>
                    <div className="calendar-grid">
                        {adherenceLog.slice(-7).map(day => {
                            const takenCount = (day.morning.taken ? 1 : 0) + (day.evening.taken ? 1 : 0);
                            const statusClass = takenCount === 2 ? 'day-full' : takenCount === 1 ? 'day-partial' : 'day-none';
                            return (
                                <div key={day.date} className={`calendar-day ${statusClass}`} title={day.date}>
                                    {day.date.split('-')[2]}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // --- Utils ---
    const clearData = () => {
        if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
            localStorage.removeItem('dosewise_data');
            window.location.reload();
        }
    };

    const [showSettings, setShowSettings] = useState(!modelUrl);

    // --- Render ---
    return (
        <div className="container">
            {isModelLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '15px', fontWeight: '600' }}>Loading AI Health Advisor...</p>
                </div>
            )}

            <header>
                <div className="logo" aria-label="DoseWise Logo">
                    <span>🛡️</span> DoseWise
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)} aria-label="Toggle Settings">
                        ⚙️ {showSettings ? 'Hide Settings' : 'AI Settings'}
                    </button>
                    <button className="btn-secondary" onClick={clearData} aria-label="Clear My Data">
                        🗑️ Clear Data
                    </button>
                </div>
            </header>

            {showSettings && (
                <section className="settings-panel alert alert-info" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <h3>🤖 AI Model Configuration</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                        To use real-time detection, paste your <strong>Teachable Machine</strong> model URL here (e.g., <code>https://teachablemachine.withgoogle.com/models/v3rYsm0d3l/</code>).
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="url-input"
                            placeholder="Paste Model URL..."
                            defaultValue={modelUrl}
                            onBlur={(e) => updateModelUrl(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                        <button className="btn-primary" onClick={() => setShowSettings(false)}>Save & Close</button>
                    </div>
                </section>
            )}

            {alert && (
                <div className={`alert alert-${alert.type}`} role="alert">
                    {alert.message}
                </div>
            )}

            <main className="main-layout">
                <section className="webcam-section">
                    <div className="webcam-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="card-title" style={{ marginBottom: 0 }}>📷 Live Pill Detection</h2>
                            {!model && <span style={{ color: 'var(--warning-red)', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ Model Not Loaded</span>}
                        </div>

                        <div className="video-container">
                            <video ref={videoRef} autoPlay playsInline muted></video>
                            <canvas id="detection-canvas" ref={canvasRef} width="640" height="480" alt="Webcam detection overlay"></canvas>
                        </div>


                        {cameraState === 'denied' && (
                            <div className="alert alert-warning">
                                📷 Camera access denied. Please enable in browser settings.
                            </div>
                        )}

                        <div className="controls">
                            {!isDetecting ? (
                                <button className="btn-primary" onClick={startDetection} aria-label="Start Detection">
                                    ▶️ Start Detection
                                </button>
                            ) : (
                                <button className="btn-danger" onClick={stopDetection} aria-label="Stop Detection">
                                    ⏹️ Stop Detection
                                </button>
                            )}

                            {/* DEMO: Test mode button to simulate pill detection */}
                            <button className="btn-secondary"
                                onClick={() => handleDetection(PILL_TYPES.MORNING, 0.98)}
                                aria-label="Test Morning Pill">
                                🧪 Test Morning
                            </button>
                            <button className="btn-secondary"
                                onClick={() => handleDetection(PILL_TYPES.EVENING, 0.98)}
                                aria-label="Test Evening Pill">
                                🧪 Test Evening
                            </button>
                        </div>

                        <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                            Hold your pill in front of the camera for verification.
                        </p>
                    </div>
                </section>

                <aside className="dashboard-section">
                    <Dashboard />
                </aside>
            </main>

            <footer className="privacy-notice">
                <h3>🔒 Your Privacy is Our Priority</h3>
                <div className="privacy-icons">
                    <div className="privacy-item">
                        <span style={{ fontSize: '2rem' }}>🏠</span>
                        <strong>Local Processing</strong>
                        <span>All AI detection happens on your device</span>
                    </div>
                    <div className="privacy-item">
                        <span style={{ fontSize: '2rem' }}>🚫</span>
                        <strong>No Transmission</strong>
                        <span>Images are never sent to any server</span>
                    </div>
                    <div className="privacy-item">
                        <span style={{ fontSize: '2rem' }}>💾</span>
                        <strong>Secure Storage</strong>
                        <span>Only timestamps are saved locally</span>
                    </div>
                </div>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                    DoseWise is designed to be a completely offline-first experience to ensure your health data remains 100% private.
                </p>
            </footer>
        </div>
    );
};

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DoseWiseApp />);
