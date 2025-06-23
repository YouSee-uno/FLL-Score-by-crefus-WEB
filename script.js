// 即時実行関数でコードを囲む
(function() {
    // =================================================================
    // グローバルな状態管理
    // =================================================================
    let mainTimerInterval;
    let timeRemaining;
    let isTimerRunning = false;
    let stopwatchTime = 0;
    let runningTime = 0;
    let isStopwatchRunning = false;

    // スコアの状態を記憶するオブジェクト
    const missionStates = {
        m01_treeOnSupport: false, m01_treeInHolder: false, m01_coralSprout: false,
        m02_sharkNoContact: false, m02_sharkInHabitat: false,
        m03_reefUp: false, m03_fragmentsCount: 0,
        m04_scubaNoContact: false, m04_scubaOnSupport: false,
        m05_anglerfishLatched: false,
        m06_mastUp: false,
        m07_treasureOut: false,
        m08_segmentsCount: 0,
        m09_creatureReleased: false, m09_creatureInVent: false,
        m10_yellowFlagDown: false, m10_subNearOpponent: false,
        m11_whaleState: 0, // 0: none, 1: one, 2: two
        m12_krillCount: 0,
        m13_shipOnNewPath: false,
        m14_waterSampleOut: false, m14_seabedSampleNoContact: false, m14_planktonSampleNoContact: false, m14_tridentState: 0, // 0: none, 1: one, 2: two
        m15_samplesInCargo: 0, m15_tridentsInCargo: 0, m15_treasureInCargo: false, m15_latchInLoop: false,
        precisionTokens: 6,
    };
    
    // =================================================================
    // HTML要素の取得
    // =================================================================
    const elements = {}; // HTML要素をまとめて格納するオブジェクト
    function getElements() {
        // --- 共通 ---
        elements.tabButtons = document.querySelectorAll('.tab-button');
        elements.contentPanels = document.querySelectorAll('.content-panel');
        // --- Timeタブ ---
        elements.mainTimerDisplay = document.getElementById('mainTimerDisplay');
        elements.startStopButton = document.getElementById('startStopButton');
        elements.resetButton = document.getElementById('resetButton');
        elements.minutesSelect = document.getElementById('minutesSelect');
        elements.secondsSelect = document.getElementById('secondsSelect');
        elements.stopwatchTimeDisplay = document.getElementById('stopwatchTimeDisplay');
        elements.runningTimeDisplay = document.getElementById('runningTimeDisplay');
        elements.exchangeButton = document.getElementById('exchangeButton');
        // --- Scoreタブ ---
        elements.totalScoreDisplay = document.getElementById('totalScoreDisplay');
        // 全てのミッション要素を取得
        for (const key in missionStates) {
            elements[key] = document.getElementById(key);
        }
    }
    
    // =================================================================
    // 関数（アプリの機能）
    // =================================================================
    
    function updateTotalScore() {
        let score = 0;
        let m01_score = 0;
        if (missionStates.m01_treeInHolder) { m01_score = 30; } else if (missionStates.m01_treeOnSupport) { m01_score = 20; }
        score += m01_score;
        if (missionStates.m01_coralSprout) { score += 20; }
        if (missionStates.m02_sharkNoContact) { score += 20; }
        if (missionStates.m02_sharkInHabitat) { score += 10; }
        if (missionStates.m03_reefUp) { score += 20; }
        score += missionStates.m03_fragmentsCount * 5;
        if (missionStates.m04_scubaNoContact) { score += 20; }
        if (missionStates.m04_scubaOnSupport) { score += 20; }
        if (missionStates.m05_anglerfishLatched) { score += 30; }
        if (missionStates.m06_mastUp) { score += 30; }
        if (missionStates.m07_treasureOut) { score += 20; }
        score += missionStates.m08_segmentsCount * 10;
        if (missionStates.m09_creatureReleased) { score += 20; }
        if (missionStates.m09_creatureInVent) { score += 10; }
        if (missionStates.m10_yellowFlagDown) { score += 30; }
        if (missionStates.m10_subNearOpponent) { score += 10; }
        if (missionStates.m11_whaleState == 1) { score += 20; } else if (missionStates.m11_whaleState == 2) { score += 30; }
        score += missionStates.m12_krillCount * 10;
        if (missionStates.m13_shipOnNewPath) { score += 20; }
        if (missionStates.m14_waterSampleOut) { score += 5; }
        if (missionStates.m14_seabedSampleNoContact) { score += 10; }
        if (missionStates.m14_planktonSampleNoContact) { score += 10; }
        if (missionStates.m14_tridentState == 1) { score += 20; } else if (missionStates.m14_tridentState == 2) { score += 30; }
        score += missionStates.m15_samplesInCargo * 5;
        score += missionStates.m15_tridentsInCargo * 5;
        if (missionStates.m15_treasureInCargo) { score += 5; }
        if (missionStates.m15_latchInLoop) { score += 20; }
        const precisionPoints = {0: 0, 1: 10, 2: 15, 3: 25, 4: 35, 5: 50, 6: 50};
        score += precisionPoints[missionStates.precisionTokens] ?? 0;
        elements.totalScoreDisplay.textContent = score;
    }

    // =================================================================
    // イベントリスナーと初期化
    // =================================================================
    function initializeApp() {
        getElements(); // 全ての要素を取得
        
        // --- スコア画面の初期化 ---
        function createOptions(selectElement, max, labels) {
            for (let i = 0; i <= max; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = labels ? labels[i] : i;
                selectElement.appendChild(option);
            }
        }
        // 各セレクトボックスに選択肢を追加
        createOptions(elements.m03_fragmentsCount, 3);
        createOptions(elements.m08_segmentsCount, 4);
        createOptions(elements.m11_whaleState, 2, ["0頭", "1頭 (+20)", "2頭 (+30)"]);
        createOptions(elements.m12_krillCount, 5);
        createOptions(elements.m14_tridentState, 2, ["0本", "1本 (+20)", "2本 (+30)"]);
        createOptions(elements.m15_samplesInCargo, 3);
        createOptions(elements.m15_tridentsInCargo, 2);
        createOptions(elements.precisionTokens, 6);
        
        // 全ての入力要素にイベントリスナーを設定
        for (const key in missionStates) {
            const element = elements[key];
            if (element) {
                element.addEventListener('change', (event) => {
                    if (element.type === 'checkbox') {
                        missionStates[key] = event.target.checked;
                    } else {
                        missionStates[key] = parseInt(event.target.value);
                    }
                    updateTotalScore();
                });
            }
        }
        updateTotalScore(); // 初期スコア表示
        
        // --- タイマー画面の初期化 ---
        function initializeTimeSetter() { for (let i = 0; i < 60; i++) { const minOption = document.createElement('option'); minOption.value = i; minOption.textContent = String(i).padStart(2, '0'); elements.minutesSelect.appendChild(minOption); const secOption = document.createElement('option'); secOption.value = i; secOption.textContent = String(i).padStart(2, '0'); elements.secondsSelect.appendChild(secOption); } elements.minutesSelect.value = 2; elements.secondsSelect.value = 30; resetTimer(); }
        function resetTimer() { isTimerRunning = false; clearInterval(mainTimerInterval); timeRemaining = parseInt(elements.minutesSelect.value) * 60 + parseInt(elements.secondsSelect.value); stopwatchTime = 0; runningTime = 0; isStopwatchRunning = false; updateDisplay(); updateStartStopButton(); updateExchangeButton(); }
        function updateDisplay() { elements.mainTimerDisplay.textContent = formatTime(timeRemaining); elements.stopwatchTimeDisplay.textContent = `${stopwatchTime} 秒`; elements.runningTimeDisplay.textContent = `${runningTime} 秒`; }
        function formatTime(totalSeconds) { const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; }
        function updateStartStopButton() { if (isTimerRunning) { elements.startStopButton.textContent = 'ストップ'; elements.startStopButton.classList.remove('button-start'); elements.startStopButton.classList.add('button-stop'); elements.exchangeButton.disabled = false; } else { elements.startStopButton.textContent = 'スタート'; elements.startStopButton.classList.remove('button-stop'); elements.startStopButton.classList.add('button-start'); elements.exchangeButton.disabled = true; } }
        function updateExchangeButton() { if (isStopwatchRunning) { elements.exchangeButton.classList.add('active'); } else { elements.exchangeButton.classList.remove('active'); } }
        function playSound(soundFile) { const audio = new Audio(soundFile); audio.play().catch(error => console.log(`サウンド再生エラー: ${error.message}`)); }
        function timerTick() { if (isStopwatchRunning) { stopwatchTime++; } else { runningTime++; } if (timeRemaining > 0) { timeRemaining--; if (timeRemaining === 29) { playSound('alarm.mp3'); } } else { isTimerRunning = false; clearInterval(mainTimerInterval); updateStartStopButton(); } updateDisplay(); }
        elements.startStopButton.addEventListener('click', () => { isTimerRunning = !isTimerRunning; if (isTimerRunning) { playSound('start.mp3'); mainTimerInterval = setInterval(timerTick, 1000); } else { clearInterval(mainTimerInterval); } updateStartStopButton(); });
        elements.resetButton.addEventListener('click', resetTimer);
        elements.minutesSelect.addEventListener('change', resetTimer);
        elements.secondsSelect.addEventListener('change', resetTimer);
        elements.exchangeButton.addEventListener('click', () => { if (!isTimerRunning) return; isStopwatchRunning = !isStopwatchRunning; updateExchangeButton(); });
        elements.tabButtons.forEach(button => { button.addEventListener('click', () => { elements.tabButtons.forEach(btn => btn.classList.remove('active')); elements.contentPanels.forEach(panel => panel.classList.remove('active')); button.classList.add('active'); const targetTab = button.dataset.tab; const targetPanel = document.getElementById(targetTab); if (targetPanel) { targetPanel.classList.add('active'); } }); });
        initializeTimeSetter();
    }

    initializeApp(); // アプリ全体の初期化を実行
})();