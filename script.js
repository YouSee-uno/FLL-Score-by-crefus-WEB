document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const timerTab = document.getElementById('timerTab');
    const scoreTab = document.getElementById('scoreTab');
    const timerSection = document.getElementById('timer-section');
    const scoreSection = document.getElementById('score-section');

    const startStopButton = document.getElementById('startStopButton');
    const exchangeButton = document.getElementById('exchangeButton');
    const resetButton = document.getElementById('resetButton');

    const minutesInput = document.getElementById('minutes-input');
    const secondsInput = document.getElementById('seconds-input');
    const canvas = document.getElementById('timer-circle');
    const ctx = canvas.getContext('2d');
    const lapTimesList = document.getElementById('lap-times');

    const totalRunTimeDisplay = document.getElementById('total-run-time');
    const totalExchangeTimeDisplay = document.getElementById('total-exchange-time');

    // スコア集計のDOM要素
    const sizeBonusScoreDisplay = document.getElementById('size-bonus-score');
    const precisionTokensScoreDisplay = document.getElementById('precision-tokens-score');
    const m01ScoreDisplay = document.getElementById('m01-score');
    const m02ScoreDisplay = document.getElementById('m02-score');
    const m03ScoreDisplay = document.getElementById('m03-score');
    const m04ScoreDisplay = document.getElementById('m04-score');
    const m05ScoreDisplay = document.getElementById('m05-score');
    const m06ScoreDisplay = document.getElementById('m06-score');
    const m07ScoreDisplay = document.getElementById('m07-score');
    const m08ScoreDisplay = document.getElementById('m08-score');
    const m09ScoreDisplay = document.getElementById('m09-score');
    const m10ScoreDisplay = document.getElementById('m10-score');
    const m11ScoreDisplay = document.getElementById('m11-score');
    const m12ScoreDisplay = document.getElementById('m12-score');
    const m13ScoreDisplay = document.getElementById('m13-score');
    const m14ScoreDisplay = document.getElementById('m14-score');
    const m15ScoreDisplay = document.getElementById('m15-score');
    
    const totalScoreDisplay = document.getElementById('total-score-value');
    const scoreHeaderValue = document.getElementById('score-header-value');

    const scoreForm = document.querySelector('.score-form');

    // タイマーの設定
    let totalTime = 150;
    let timeLeft = totalTime;
    let timerInterval;
    let isRunning = false;

    // ラップタイム記録用の状態
    let clickCount = 0;
    let lastLapTime = 0;
    let totalRunTime = 0;
    let totalExchangeTime = 0;

    // --- スコア計算機能 ---
    function getSelectedValue(target) {
        const selectedButton = document.querySelector(`.button-group[data-target="${target}"] .score-btn.selected`);
        return selectedButton ? selectedButton.dataset.value : null;
    }

    function calculateScore() {
        let sizeBonusScore = 0;
        let precisionTokensScore = 0;
        let m01Score = 0;
        let m02Score = 0;
        let m03Score = 0;
        let m04Score = 0;
        let m05Score = 0;
        let m06Score = 0;
        let m07Score = 0;
        let m08Score = 0;
        let m09Score = 0;
        let m10Score = 0;
        let m11Score = 0;
        let m12Score = 0;
        let m13Score = 0;
        let m14Score = 0;
        let m15Score = 0;
        let totalScore = 0;

        // 大きさ点検ボーナスの計算
        const sizeBonusValue = getSelectedValue('size-bonus');
        if (sizeBonusValue === 'true') {
            sizeBonusScore = 20;
        }
        sizeBonusScoreDisplay.textContent = sizeBonusScore;
        totalScore += sizeBonusScore;

        // 精密トークンの計算
        const tokenCount = parseInt(getSelectedValue('precision-tokens'), 10) || 0;
        switch (tokenCount) {
            case 6:
            case 5:
                precisionTokensScore = 50;
                break;
            case 4:
                precisionTokensScore = 35;
                break;
            case 3:
                precisionTokensScore = 25;
                break;
            case 2:
                precisionTokensScore = 15;
                break;
            case 1:
                precisionTokensScore = 10;
                break;
            default:
                precisionTokensScore = 0;
                break;
        }
        precisionTokensScoreDisplay.textContent = precisionTokensScore;
        totalScore += precisionTokensScore;

        // M01 表面清掃の計算
        const m01SoilScore = parseInt(getSelectedValue('m01-soil'), 10) || 0;
        const m01BrushScore = parseInt(getSelectedValue('m01-brush'), 10) || 0;
        m01Score = m01SoilScore + m01BrushScore;
        m01ScoreDisplay.textContent = m01Score;
        totalScore += m01Score;

        // M02 地図の露出の計算
        const m02TopsoilScore = parseInt(getSelectedValue('m02-topsoil'), 10) || 0;
        m02Score = m02TopsoilScore;
        m02ScoreDisplay.textContent = m02Score;
        totalScore += m02Score;
        
        // M03 鉱抗の探査の計算
        const m03YourCartScore = parseInt(getSelectedValue('m03-your-cart'), 10) || 0;
        const m03OpponentCartScore = parseInt(getSelectedValue('m03-opponent-cart'), 10) || 0;
        m03Score = m03YourCartScore + m03OpponentCartScore;
        m03ScoreDisplay.textContent = m03Score;
        totalScore += m03Score;

        // M04 慎重な回収の計算
        const m04MineralsScore = parseInt(getSelectedValue('m04-minerals'), 10) || 0;
        const m04PillarsScore = parseInt(getSelectedValue('m04-pillars'), 10) || 0;
        m04Score = m04MineralsScore + m04PillarsScore;
        m04ScoreDisplay.textContent = m04Score;
        totalScore += m04Score;

        // M05 誰が住んでいた？の計算
        const m05FloorScore = parseInt(getSelectedValue('m05-floor'), 10) || 0;
        m05Score = m05FloorScore;
        m05ScoreDisplay.textContent = m05Score;
        totalScore += m05Score;

        // M06 鍛治場の計算
        const m06OreScore = parseInt(getSelectedValue('m06-ore'), 10) || 0;
        m06Score = m06OreScore;
        m06ScoreDisplay.textContent = m06Score;
        totalScore += m06Score;

        // M07 力仕事の計算
        const m07MortarScore = parseInt(getSelectedValue('m07-mortar'), 10) || 0;
        m07Score = m07MortarScore;
        m07ScoreDisplay.textContent = m07Score;
        totalScore += m07Score;
        
        // M08 サイロの計算
        const m08FoodScore = parseInt(getSelectedValue('m08-food'), 10) || 0;
        m08Score = m08FoodScore;
        m08ScoreDisplay.textContent = m08Score;
        totalScore += m08Score;

        // M09 何を売っていた？の計算
        const m09RoofScore = parseInt(getSelectedValue('m09-roof'), 10) || 0;
        const m09GoodsScore = parseInt(getSelectedValue('m09-goods'), 10) || 0;
        m09Score = m09RoofScore + m09GoodsScore;
        m09ScoreDisplay.textContent = m09Score;
        totalScore += m09Score;

        // M10 はかりの計算
        const m10ScaleTiltScore = parseInt(getSelectedValue('m10-scale-tilt'), 10) || 0;
        const m10ScaleDishScore = parseInt(getSelectedValue('m10-scale-dish'), 10) || 0;
        m10Score = m10ScaleTiltScore + m10ScaleDishScore;
        m10ScoreDisplay.textContent = m10Score;
        totalScore += m10Score;

        // M11 港の遺物の計算
        const m11RelicLiftScore = parseInt(getSelectedValue('m11-relic-lift'), 10) || 0;
        const m11FlagDownScore = parseInt(getSelectedValue('m11-flag-down'), 10) || 0;
        m11Score = m11RelicLiftScore + m11FlagDownScore;
        m11ScoreDisplay.textContent = m11Score;
        totalScore += m11Score;

        // M12 船の救出の計算
        const m12SandScore = parseInt(getSelectedValue('m12-sand'), 10) || 0;
        const m12BoatScore = parseInt(getSelectedValue('m12-boat'), 10) || 0;
        m12Score = m12SandScore + m12BoatScore;
        m12ScoreDisplay.textContent = m12Score;
        totalScore += m12Score;

        // M13 像の復元の計算
        const m13StatueScore = parseInt(getSelectedValue('m13-statue'), 10) || 0;
        m13Score = m13StatueScore;
        m13ScoreDisplay.textContent = m13Score;
        totalScore += m13Score;

        // M14 フォーラムの計算
        const m14BrushScore = parseInt(getSelectedValue('m14-brush'), 10) || 0;
        const m14CartScore = parseInt(getSelectedValue('m14-cart'), 10) || 0;
        const m14DishScore = parseInt(getSelectedValue('m14-dish'), 10) || 0;
        const m14TopsoilScore = parseInt(getSelectedValue('m14-topsoil'), 10) || 0;
        const m14RelicScore = parseInt(getSelectedValue('m14-relic'), 10) || 0;
        const m14OreScore = parseInt(getSelectedValue('m14-ore'), 10) || 0;
        const m14MortarScore = parseInt(getSelectedValue('m14-mortar'), 10) || 0;
        m14Score = m14BrushScore + m14CartScore + m14DishScore + m14TopsoilScore + m14RelicScore + m14OreScore + m14MortarScore;
        m14ScoreDisplay.textContent = m14Score;
        totalScore += m14Score;

        // M15 発見現場のマーケティングの計算
        const m15FlagScore = parseInt(getSelectedValue('m15-flag'), 10) || 0;
        m15Score = m15FlagScore;
        m15ScoreDisplay.textContent = m15Score;
        totalScore += m15Score;
        
        // 合計点を表示
        totalScoreDisplay.textContent = totalScore;
        scoreHeaderValue.textContent = ` (${totalScore}点)`;
    }

    // ボタンのクリックイベントをまとめて処理
    scoreForm.addEventListener('click', (e) => {
        const button = e.target.closest('.score-btn');
        if (!button) return;

        const buttonGroup = button.closest('.button-group');
        if (!buttonGroup) return;

        buttonGroup.querySelectorAll('.score-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        button.classList.add('selected');
        calculateScore();
    });

    // --- タブ切り替え機能 ---
    timerTab.addEventListener('click', () => {
        timerTab.classList.add('active');
        scoreTab.classList.remove('active');
        timerSection.classList.add('active');
        scoreSection.classList.remove('active');
    });

    scoreTab.addEventListener('click', () => {
        timerSection.classList.remove('active');
        scoreSection.classList.add('active');
        timerTab.classList.remove('active');
        scoreTab.classList.add('active');
        calculateScore();
    });

    // --- タイマー機能 ---
    function updateInputs(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        minutesInput.value = String(minutes).padStart(2, '0');
        secondsInput.value = String(remainingSeconds).padStart(2, '0');
    }

    function drawTimerCircle(progress) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景の円
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 20;
        ctx.stroke();

        // 残り時間を示す円
        ctx.beginPath();
        const endAngle = -0.5 * Math.PI + (2 * Math.PI * progress);
        ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, endAngle);
        ctx.strokeStyle = '#87ceeb';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function updateTimer() {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            updateInputs(0);
            drawTimerCircle(0);
            alert('時間切れです！');
            startStopButton.textContent = 'スタート';
            startStopButton.disabled = false;
            exchangeButton.disabled = true;
            return;
        }
        timeLeft--;
        const progress = timeLeft / totalTime;
        updateInputs(timeLeft);
        drawTimerCircle(progress);
    }

    function addLapTime(label, time) {
        const li = document.createElement('li');
        li.innerHTML = `<span>${label}</span><span>${time}秒</span>`;
        lapTimesList.prepend(li);
    }

    // --- ボタンイベント ---
    startStopButton.addEventListener('click', () => {
        if (!isRunning) {
            if (timeLeft === totalTime) {
                const minutes = parseInt(minutesInput.value, 10) || 0;
                const seconds = parseInt(secondsInput.value, 10) || 0;
                totalTime = minutes * 60 + seconds;
                timeLeft = totalTime;
                lastLapTime = totalTime;
            }

            if (timeLeft > 0) {
                timerInterval = setInterval(updateTimer, 1000);
                isRunning = true;
                startStopButton.textContent = 'ストップ';
                exchangeButton.disabled = false;
            } else {
                alert('有効な時間を設定してください。');
            }
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            startStopButton.textContent = 'スタート';
        }
    });

    exchangeButton.addEventListener('click', () => {
        if (isRunning) {
            const timeDiff = lastLapTime - timeLeft;
            lastLapTime = timeLeft;
            
            clickCount++;
            
            if (clickCount % 2 === 1) {
                const runNum = Math.ceil(clickCount / 2);
                addLapTime(`交換 ${runNum}回目`, timeDiff);
                totalRunTime += timeDiff;
                totalRunTimeDisplay.textContent = totalRunTime;
                exchangeButton.textContent = '走行';
            } else {
                const runNum = clickCount / 2;
                addLapTime(`${runNum} Run`, timeDiff);
                totalExchangeTime += timeDiff;
                totalExchangeTimeDisplay.textContent = totalExchangeTime;
                exchangeButton.textContent = '交換';
            }
        }
    });

    resetButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        totalTime = 150;
        timeLeft = totalTime;
        clickCount = 0;
        lastLapTime = 150;
        totalRunTime = 0;
        totalExchangeTime = 0;
        updateInputs(timeLeft);
        drawTimerCircle(1);
        startStopButton.textContent = 'スタート';
        startStopButton.disabled = false;
        exchangeButton.disabled = true;
        exchangeButton.textContent = '交換'; // ボタンのテキストを初期状態に戻す
        
        lapTimesList.innerHTML = '';
        totalRunTimeDisplay.textContent = '0';
        totalExchangeTimeDisplay.textContent = '0';

        // スコア集計のリセット
        resetScoreButtons();
        calculateScore();
    });

    // スコアボタンのリセット関数
    function resetScoreButtons() {
        document.querySelectorAll('.score-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // 各項目のデフォルトボタンを選択
        document.querySelector('.button-group[data-target="size-bonus"] .score-btn[data-value="true"]').classList.add('selected');
        document.querySelector('.button-group[data-target="precision-tokens"] .score-btn[data-value="6"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m01-soil"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m01-brush"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m02-topsoil"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m03-your-cart"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m03-opponent-cart"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m04-minerals"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m04-pillars"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m05-floor"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m06-ore"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m07-mortar"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m08-food"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m09-roof"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m09-goods"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m10-scale-tilt"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m10-scale-dish"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m11-relic-lift"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m11-flag-down"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m12-sand"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m12-boat"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m13-statue"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-brush"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-cart"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-dish"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-topsoil"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-relic"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-ore"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m14-mortar"] .score-btn[data-value="0"]').classList.add('selected');
        document.querySelector('.button-group[data-target="m15-flag"] .score-btn[data-value="0"]').classList.add('selected');
    }

    // ページ読み込み時にデフォルトのボタンを選択
    resetScoreButtons();
    calculateScore();

    // 初期表示
    updateInputs(timeLeft);
    drawTimerCircle(1);
});