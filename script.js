'use strict';

// HTMLの読み込みが完了してからスクリプトを実行する
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 状態管理
    // =================================================================
    let mainTimerInterval;
    let timeRemaining;
    let isTimerRunning = false;
    let exchangeTime = 0;
    let runTime = 0;
    let isExchangeActive = false;
    let startTime = 0;
    let lastLapTime = 0;
    let runCount = 1;
    let laps = [];

    const missionStates = {
        m01_treeOnSupport: false, m01_treeInHolder: false, m01_coralSprout: false,
        m02_sharkNoContact: false, m02_sharkInHabitat: false,
        m03_reefUp: false, m03_fragmentsCount: 0,
        m04_scubaNoContact: false, m04_scubaOnSupport: false,
        m05_anglerfishLatched: false, m06_mastUp: false, m07_treasureOut: false,
        m08_segmentsCount: 0,
        m09_creatureReleased: false, m09_creatureInVent: false,
        m10_yellowFlagDown: false, m10_subNearOpponent: false,
        m11_whaleState: 0, m12_krillCount: 0, m13_shipOnNewPath: false,
        m14_waterSampleOut: false, m14_seabedSampleNoContact: false, m14_planktonSampleNoContact: false, m14_tridentState: 0,
        m15_samplesInCargo: 0, m15_tridentsInCargo: 0, m15_treasureInCargo: false, m15_latchInLoop: false,
        inspectionBonus: false, precisionTokens: 6,
    };
    
    // 全ミッションの定義データ
    const MISSIONS_DATA = [
        { id: "M01", title: "M01 サンゴの苗床", items: [
            { type: "checkbox", id: "m01_treeOnSupport", label: "サンゴの木がサンゴの木のサポートに掛かっている (+20)" },
            { type: "checkbox", id: "m01_treeInHolder", label: "サンゴの木の底面がホルダー内にある (ボーナス: +30)" },
            { type: "checkbox", id: "m01_coralSprout", label: "サンゴの芽が上がっている (+20)" },
        ]},
        { id: "M02", title: "M02 サメ", items: [
            { type: "checkbox", id: "m02_sharkNoContact", label: "サメが洞窟に接触していない (+20)" },
            { type: "checkbox", id: "m02_sharkInHabitat", label: "サメがマットに接触し、生息地にインしている (+10)" },
        ]},
        { id: "M03", title: "M03 サンゴ礁", items: [
            { type: "checkbox", id: "m03_reefUp", label: "サンゴ礁が上がり、マットに接触していない (+20)" },
            { type: "select", id: "m03_fragmentsCount", label: "サンゴ礁の断片が直立している (各+5)", options: { max: 3 } },
        ]},
        { id: "M04", title: "M04 スキューバダイバー", items: [
            { type: "checkbox", id: "m04_scubaNoContact", label: "スキューバダイバーがサンゴの苗床に接触していない (+20)" },
            { type: "checkbox", id: "m04_scubaOnSupport", label: "スキューバダイバーがサンゴ礁のサポートに掛かっている (+20)" },
        ]},
        { id: "M05", title: "M05 アンコウ", items: [ { type: "checkbox", id: "m05_anglerfishLatched", label: "アンコウが沈没船の中にラッチされている (+30)" } ]},
        { id: "M06", title: "M06 マスト上げ", items: [ { type: "checkbox", id: "m06_mastUp", label: "沈没船のマストが完全に上がっている (+30)" } ]},
        { id: "M07", title: "M07 クラーケンの宝", items: [ { type: "checkbox", id: "m07_treasureOut", label: "宝箱がクラーケンの巣の完全に外側にある (+20)" } ]},
        { id: "M08", title: "M08 人工生息地", items: [ { type: "select", id: "m08_segmentsCount", label: "人工生息地のスタックセグメントが完全に水平であり直立している (各+10)", options: { max: 4 } } ]},
        { id: "M09", title: "M09 予期せぬ遭遇", items: [
            { type: "checkbox", id: "m09_creatureReleased", label: "未知の生物がリリースされている (+20)" },
            { type: "checkbox", id: "m09_creatureInVent", label: "未知の生物が冷水湧出帯に少しでもインしている (+10)" },
        ]},
        { id: "M10", title: "M10 潜水艇の派遣", items: [
            { type: "checkbox", id: "m10_yellowFlagDown", label: "自チームの黄色い旗が下がっている (+30)" },
            { type: "checkbox", id: "m10_subNearOpponent", label: "潜水艇が明らかに相手フィールドに近づいている (+10)" },
        ]},
        { id: "M11", title: "M11 超音波探査", items: [ { type: "select", id: "m11_whaleState", label: "クジラが見えている", options: { max: 2, labels: ["0頭", "1頭 (+20)", "2頭 (+30)"] } } ]},
        { id: "M12", title: "M12 クジラの餌やり", items: [ { type: "select", id: "m12_krillCount", label: "オキアミがクジラの口に少しでもインしている (各+10)", options: { max: 5 } } ]},
        { id: "M13", title: "M13 船の航路変更", items: [ { type: "checkbox", id: "m13_shipOnNewPath", label: "船が新しい航路にありマットに接触している (+20)" } ]},
        { id: "M14", title: "M14 サンプル採取", items: [
            { type: "checkbox", id: "m14_waterSampleOut", label: "ウォーターサンプルがウォーターサンプルエリアの完全に外側にある (+5)" },
            { type: "checkbox", id: "m14_seabedSampleNoContact", label: "海底サンプルが海底に接触していない (+10)" },
            { type: "checkbox", id: "m14_planktonSampleNoContact", label: "プランクトンサンプルがケルプの森に接触していない (+10)" },
            { type: "select", id: "m14_tridentState", label: "トライデントが沈没船に接触していない", options: { max: 2, labels: ["0本", "1本 (+20)", "2本 (+30)"] } },
        ]},
        { id: "M15", title: "M15 調査船", description: "以下のものが調査船の貨物エリアに少しでもインしている:", items: [
            { type: "select", id: "m15_samplesInCargo", label: "サンプル (各+5)", indent: true, options: { max: 3 } },
            { type: "select", id: "m15_tridentsInCargo", label: "トライデント (各+5)", indent: true, options: { max: 2 } },
            { type: "checkbox", id: "m15_treasureInCargo", label: "宝箱 (+5)", indent: true },
            { type: "checkbox", id: "m15_latchInLoop", label: "港のラッチが調査船のループに少しでもインしている (+20)" },
        ]},
        { id: "Bonus", title: "大きさ点検ボーナス", items: [ { type: "checkbox", id: "inspectionBonus", label: "ロボットが大きさ点検エリアに完全に収まる (+20)" } ]},
        { id: "Tokens", title: "精密トークン", items: [ { type: "select", id: "precisionTokens", label: "ペナルティを受けずに残った個数", options: { max: 6 } } ]},
    ];

    const elements = {}; // HTML要素をキャッシュするオブジェクト

    // =================================================================
    // UI生成関数
    // =================================================================
    function renderScoreSheet() {
        const missionList = document.getElementById('missionList');
        if (!missionList) return;

        MISSIONS_DATA.forEach(mission => {
            const section = document.createElement('div');
            section.className = 'mission-section';
            
            const title = document.createElement('h3');
            title.className = 'mission-title';
            title.textContent = mission.title;
            section.appendChild(title);
            
            if (mission.description) {
                const desc = document.createElement('p');
                desc.className = 'mission-description';
                desc.textContent = mission.description;
                section.appendChild(desc);
            }

            mission.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'mission-item';
                if (item.indent) {
                    itemDiv.classList.add('indent');
                }

                const label = document.createElement('label');
                label.htmlFor = item.id;
                label.textContent = item.label;
                itemDiv.appendChild(label);

                if (item.type === 'checkbox') {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = item.id;
                    checkbox.className = 'mission-checkbox';
                    itemDiv.appendChild(checkbox);
                } else if (item.type === 'select') {
                    const select = document.createElement('select');
                    select.id = item.id;
                    select.className = 'mission-select';
                    for (let i = 0; i <= item.options.max; i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = item.options.labels ? item.options.labels[i] : i;
                        select.appendChild(option);
                    }
                    itemDiv.appendChild(select);
                }
                section.appendChild(itemDiv);
            });
            missionList.appendChild(section);
        });
    }

    // =================================================================
    // UI更新関数
    // =================================================================
    function updateTimerDisplay() {
        elements.mainTimerDisplay.textContent = formatTime(timeRemaining);
        elements.exchangeTimeDisplay.textContent = `${exchangeTime} 秒`;
        elements.runTimeDisplay.textContent = `${runTime} 秒`;
    }

    function updateStartStopButton() {
        if (isTimerRunning) {
            elements.startStopButton.textContent = 'ストップ';
            elements.startStopButton.className = 'button-stop';
            elements.exchangeButton.disabled = false;
        } else {
            elements.startStopButton.textContent = 'スタート';
            elements.startStopButton.className = 'button-start';
            elements.exchangeButton.disabled = true;
        }
    }

    function updateExchangeButton() {
        elements.exchangeButton.classList.toggle('active', isExchangeActive);
    }

    function updateLapsDisplay() {
        elements.lapsContainer.innerHTML = '';
        laps.forEach(lap => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            // 【ここを修正しました】ラベルに応じてクラスを追加
            if (lap.label.includes('交換')) {
                lapElement.classList.add('exchange');
            } else if (lap.label.includes('走行')) {
                lapElement.classList.add('run');
            }
            
            lapElement.innerHTML = `<span>${lap.label}</span><span>${lap.duration.toFixed(2)} 秒</span>`;
            elements.lapsContainer.appendChild(lapElement);
        });
        elements.lapsContainer.scrollTop = elements.lapsContainer.scrollHeight;
    }

    // =================================================================
    // 機能ロジック
    // =================================================================
    function playSound(soundFile) {
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.error("サウンド再生エラー:", e));
    }
    
    function timerTick() {
        if (isExchangeActive) {
            exchangeTime++;
        } else {
            runTime++;
        }
        if (timeRemaining > 0) {
            timeRemaining--;
            if (timeRemaining === 29) playSound('alarm.mp3');
        } else {
            isTimerRunning = false;
            clearInterval(mainTimerInterval);
            updateStartStopButton();
        }
        updateTimerDisplay();
    }
    
    function resetTimer() {
        isTimerRunning = false;
        clearInterval(mainTimerInterval);
        timeRemaining = parseInt(elements.minutesSelect.value, 10) * 60 + parseInt(elements.secondsSelect.value, 10);
        exchangeTime = 0;
        runTime = 0;
        isExchangeActive = false;
        laps = [];
        runCount = 1;
        startTime = 0;
        lastLapTime = 0;
        updateTimerDisplay();
        updateStartStopButton();
        updateExchangeButton();
        updateLapsDisplay();
    }
    
    function updateTotalScore() {
        let score = 0;
        // M01
        let m01_score = 0;
        if (missionStates.m01_treeInHolder) { m01_score = 30; } else if (missionStates.m01_treeOnSupport) { m01_score = 20; }
        score += m01_score;
        if (missionStates.m01_coralSprout) score += 20;
        // M02
        if (missionStates.m02_sharkNoContact) score += 20;
        if (missionStates.m02_sharkInHabitat) score += 10;
        // M03
        if (missionStates.m03_reefUp) score += 20;
        score += missionStates.m03_fragmentsCount * 5;
        // M04
        if (missionStates.m04_scubaNoContact) score += 20;
        if (missionStates.m04_scubaOnSupport) score += 20;
        // M05
        if (missionStates.m05_anglerfishLatched) score += 30;
        // M06
        if (missionStates.m06_mastUp) score += 30;
        // M07
        if (missionStates.m07_treasureOut) score += 20;
        // M08
        score += missionStates.m08_segmentsCount * 10;
        // M09
        if (missionStates.m09_creatureReleased) score += 20;
        if (missionStates.m09_creatureInVent) score += 10;
        // M10
        if (missionStates.m10_yellowFlagDown) score += 30;
        if (missionStates.m10_subNearOpponent) score += 10;
        // M11
        if (missionStates.m11_whaleState === 1) score += 20; else if (missionStates.m11_whaleState === 2) score += 30;
        // M12
        score += missionStates.m12_krillCount * 10;
        // M13
        if (missionStates.m13_shipOnNewPath) score += 20;
        // M14
        if (missionStates.m14_waterSampleOut) score += 5;
        if (missionStates.m14_seabedSampleNoContact) score += 10;
        if (missionStates.m14_planktonSampleNoContact) score += 10;
        if (missionStates.m14_tridentState === 1) score += 20; else if (missionStates.m14_tridentState === 2) score += 30;
        // M15
        score += missionStates.m15_samplesInCargo * 5;
        score += missionStates.m15_tridentsInCargo * 5;
        if (missionStates.m15_treasureInCargo) score += 5;
        if (missionStates.m15_latchInLoop) score += 20;
        // Bonus
        if (missionStates.inspectionBonus) score += 20;
        // Tokens
        const precisionPoints = {0:0, 1:10, 2:15, 3:25, 4:35, 5:50, 6:50};
        score += precisionPoints[missionStates.precisionTokens] || 0;
        
        elements.totalScoreDisplay.textContent = score;
    }

    // =================================================================
    // 初期化処理
    // =================================================================
    function getElementsById() {
        const ids = [
            'mainTimerDisplay', 'startStopButton', 'resetButton', 'minutesSelect', 'secondsSelect',
            'exchangeTimeDisplay', 'runTimeDisplay', 'exchangeButton', 'lapsContainer', 'totalScoreDisplay'
        ];
        elements.tabButtons = document.querySelectorAll('.tab-button');
        elements.contentPanels = document.querySelectorAll('.content-panel');
        ids.forEach(id => elements[id] = document.getElementById(id));
        for (const key in missionStates) {
            elements[key] = document.getElementById(key);
        }
    }
    
    function bindEventListeners() {
        elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                elements.tabButtons.forEach(btn => btn.classList.remove('active'));
                elements.contentPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.tab).classList.add('active');
            });
        });
        
        elements.startStopButton.addEventListener('click', () => {
            if (!isTimerRunning && startTime === 0) {
                const now = performance.now();
                startTime = now;
                lastLapTime = now;
            }
            isTimerRunning = !isTimerRunning;
            if (isTimerRunning) {
                playSound('start.mp3');
                mainTimerInterval = setInterval(timerTick, 1000);
            } else {
                clearInterval(mainTimerInterval);
            }
            updateStartStopButton();
        });
        
        elements.resetButton.addEventListener('click', resetTimer);
        elements.minutesSelect.addEventListener('change', resetTimer);
        elements.secondsSelect.addEventListener('change', resetTimer);

        elements.exchangeButton.addEventListener('click', () => {
            if (!isTimerRunning) return;
            const now = performance.now();
            const duration = (now - lastLapTime) / 1000;
            let label = '';
            if (isExchangeActive) {
                label = `${ordinal(runCount)} - ${ordinal(runCount + 1)} 交換`;
                runCount++;
            } else {
                label = `${ordinal(runCount)} RUN 走行`;
            }
            laps.push({ label, duration });
            updateLapsDisplay();
            lastLapTime = now;
            isExchangeActive = !isExchangeActive;
            updateExchangeButton();
        });

        document.getElementById('missionList').addEventListener('change', (event) => {
            const target = event.target;
            if (target.id && missionStates.hasOwnProperty(target.id)) {
                if (target.type === 'checkbox') {
                    missionStates[target.id] = target.checked;
                } else if (target.type === 'select-one') {
                    missionStates[target.id] = parseInt(target.value, 10);
                }
                updateTotalScore();
            }
        });
    }

    function initialize() {
        renderScoreSheet();
        getElementsById();
        
        for (let i = 0; i < 60; i++) {
            const val = String(i).padStart(2, '0');
            elements.minutesSelect.add(new Option(val, i));
            elements.secondsSelect.add(new Option(val, i));
        }
        elements.minutesSelect.value = 2;
        elements.secondsSelect.value = 30;
        
        resetTimer();
        updateTotalScore();
        bindEventListeners();
    }

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function ordinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    
    // アプリケーション起動
    initialize();

});
