const count = document.getElementById('count');
const head = document.getElementById('head');
const giftbox = document.getElementById('merrywrap');
const canvasC = document.getElementById('c');
const confettiCanvas = document.getElementById('confetti');

const config = {
  // Temporary test value. Because this date is already passed, the page will
  // still show a visible 5-second countdown before revealing the gift box.
  birthdate: '2026-09-05T00:00:00+07:00',
  name: 'Regina Septianadrah'
};

const scenes = [
  ['HAPPY', 'BIRTHDAY!', 'Regina', 'Septianadrah'],
  ['Another year of', 'you, and another', 'year for me to be', 'grateful that I', 'have you in my life.'],
  ['Semoga semua', 'hal baik selalu', 'menemukan jalannya', 'menuju kamu.'],
  ['Keep smiling,', 'keep growing,', 'and stay being', 'the Regina that', 'I love. ❤️']
];

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const expiredCountdownDuration = 5 * second;
const textHoldDuration = 5 * second;
const balloonSceneDuration = 5 * second;

const pageLoadedAt = Date.now();
const configuredTarget = new Date(config.birthdate).getTime();
const countDown =
  configuredTarget <= pageLoadedAt
    ? pageLoadedAt + expiredCountdownDuration
    : configuredTarget;

let countdownTimer = null;
let giftInitialized = false;
let animationStarted = false;

function hideEverything() {
  head.style.display = 'none';
  count.style.display = 'none';
  giftbox.style.display = 'none';
  canvasC.style.display = 'none';
}

function prepareLayers() {
  count.style.position = 'relative';
  count.style.zIndex = '30';
  count.style.width = '100%';

  if (confettiCanvas) {
    confettiCanvas.style.zIndex = '0';
    confettiCanvas.style.pointerEvents = 'none';
  }

  canvasC.style.zIndex = '5';
  giftbox.style.zIndex = '10';
}

hideEverything();
prepareLayers();

const confettiSettings = { target: 'confetti' };
const confetti = new window.ConfettiGenerator(confettiSettings);
confetti.render();

function renderCountdown() {
  const distance = countDown - Date.now();

  giftbox.style.display = 'none';
  canvasC.style.display = 'none';

  if (distance <= 0) {
    document.getElementById('day').innerText = '0';
    document.getElementById('hour').innerText = '0';
    document.getElementById('minute').innerText = '0';
    document.getElementById('second').innerText = '0';

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    showGiftBox();
    return;
  }

  const totalSeconds = Math.ceil(distance / second);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById('day').innerText = days;
  document.getElementById('hour').innerText = hours;
  document.getElementById('minute').innerText = minutes;
  document.getElementById('second').innerText = seconds;

  head.style.display = 'block';
  count.style.display = 'block';
}

function showGiftBox() {
  head.style.display = 'none';
  count.style.display = 'none';
  giftbox.style.display = 'block';

  if (giftInitialized) return;
  giftInitialized = true;

  const merrywrap = document.getElementById('merrywrap');
  const box = merrywrap.getElementsByClassName('giftbox')[0];
  let step = 1;
  const stepMinutes = [2000, 2000, 1000, 1000];

  function stepClass(currentStep) {
    merrywrap.className = 'merrywrap step-' + currentStep;
  }

  function openBox() {
    stepClass(step);

    if (step === 4) {
      return;
    }

    setTimeout(openBox, stepMinutes[step - 1]);
    step++;
  }

  function startGiftSequence() {
    box.removeEventListener('click', startGiftSequence, false);
    openBox();
    canvasC.style.display = 'block';
    setTimeout(startAnimation, 1500);
  }

  box.addEventListener('click', startGiftSequence, false);
}

renderCountdown();
countdownTimer = setInterval(renderCountdown, 100);

function startAnimation() {
  if (animationStarted) return;
  animationStarted = true;

  let w = (canvasC.width = window.innerWidth);
  let h = (canvasC.height = window.innerHeight);
  const ctx = canvasC.getContext('2d');
  let hw = w / 2;
  let hh = h / 2;
  let currentSceneIndex = 0;
  let letters = [];
  let sceneTransitioning = false;
  let textHoldStartedAt = null;
  let balloonPhaseStartedAt = null;
  let balloonsReleased = false;

  const opts = {
    strings: scenes[currentSceneIndex],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,
    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1
  };

  let calc = { totalWidth: 1 };
  const Tau = Math.PI * 2;
  const TauQuarter = Tau / 4;

  function configureScene(sceneIndex) {
    opts.strings = scenes[sceneIndex];

    const longestLine = Math.max(...opts.strings.map(line => line.length));
    const availableWidth = Math.max(220, w * 0.88);
    const responsiveSpacing = availableWidth / Math.max(longestLine, 1);

    opts.charSpacing = Math.max(12, Math.min(35, responsiveSpacing));
    opts.charSize = Math.max(12, Math.min(30, opts.charSpacing * 0.82));
    opts.lineHeight = Math.max(26, opts.charSize * 1.55);

    calc = {
      totalWidth: opts.charSpacing * longestLine
    };

    ctx.font = opts.charSize + 'px Verdana';
  }

  function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;
    this.fireworkDy = this.y - hh;

    const hue = ((x / calc.totalWidth) * 360 + 360) % 360;

    this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
    this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
    this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
    this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);

    this.reset();
  }

  Letter.prototype.reset = function() {
    this.phase = 'firework';
    this.tick = 0;
    this.spawned = false;
    this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.reachTime =
      (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
    this.lineWidth =
      opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
    this.prevPoints = [[0, hh, 0]];
  };

  Letter.prototype.startBalloon = function() {
    if (this.phase !== 'contemplate') return;

    this.phase = 'balloon';
    this.tick = 0;
    this.spawning = true;
    this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
    this.inflating = false;
    this.inflateTime =
      (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
    this.size =
      (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

    const rad =
      opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
    const vel =
      opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

    this.vx = Math.cos(rad) * vel;
    this.vy = Math.sin(rad) * vel;
  };

  Letter.prototype.step = function() {
    if (this.phase === 'done') return;

    if (this.phase === 'firework') {
      if (!this.spawned) {
        ++this.tick;
        if (this.tick >= this.spawningTime) {
          this.tick = 0;
          this.spawned = true;
        }
      } else {
        ++this.tick;

        const linearProportion = this.tick / this.reachTime;
        const armonicProportion = Math.sin(linearProportion * TauQuarter);
        const x = linearProportion * this.x;
        const y = hh + armonicProportion * this.fireworkDy;

        if (this.prevPoints.length > opts.fireworkPrevPoints) {
          this.prevPoints.shift();
        }

        this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

        const lineWidthProportion = 1 / (this.prevPoints.length - 1);

        for (let i = 1; i < this.prevPoints.length; ++i) {
          const point = this.prevPoints[i];
          const point2 = this.prevPoints[i - 1];

          ctx.strokeStyle = this.alphaColor.replace(
            'alp',
            i / this.prevPoints.length
          );
          ctx.lineWidth = point[2] * lineWidthProportion * i;
          ctx.beginPath();
          ctx.moveTo(point[0], point[1]);
          ctx.lineTo(point2[0], point2[1]);
          ctx.stroke();
        }

        if (this.tick >= this.reachTime) {
          this.phase = 'contemplate';
          this.circleFinalSize =
            opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
          this.circleCompleteTime =
            (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
          this.circleCreating = true;
          this.circleFading = false;
          this.circleFadeTime =
            (opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) | 0;
          this.tick = 0;
          this.tick2 = 0;
          this.shards = [];

          const shardCount =
            (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0;
          const angle = Tau / shardCount;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          let shardX = 1;
          let shardY = 0;

          for (let i = 0; i < shardCount; ++i) {
            const x1 = shardX;
            shardX = shardX * cos - shardY * sin;
            shardY = shardY * cos + x1 * sin;
            this.shards.push(
              new Shard(this.x, this.y, shardX, shardY, this.alphaColor)
            );
          }
        }
      }
    } else if (this.phase === 'contemplate') {
      if (this.circleCreating) {
        ++this.tick2;
        const proportion = this.tick2 / this.circleCompleteTime;
        const armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

        ctx.fillStyle = this.lightAlphaColor
          .replace('light', 50 + 50 * proportion)
          .replace('alp', proportion);
        ctx.beginPath();
        ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
        ctx.fill();

        if (this.tick2 > this.circleCompleteTime) {
          this.tick2 = 0;
          this.circleCreating = false;
          this.circleFading = true;
        }
      } else if (this.circleFading) {
        ctx.fillStyle = this.lightColor.replace('light', 70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        ++this.tick2;
        const proportion = this.tick2 / this.circleFadeTime;
        const armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

        ctx.fillStyle = this.lightAlphaColor
          .replace('light', 100)
          .replace('alp', 1 - armonic);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
        ctx.fill();

        if (this.tick2 >= this.circleFadeTime) {
          this.circleFading = false;
        }
      } else {
        ctx.fillStyle = this.lightColor.replace('light', 70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      }

      for (let i = 0; i < this.shards.length; ++i) {
        this.shards[i].step();

        if (!this.shards[i].alive) {
          this.shards.splice(i, 1);
          --i;
        }
      }
    } else if (this.phase === 'balloon') {
      ctx.strokeStyle = this.lightColor.replace('light', 80);

      if (this.spawning) {
        ++this.tick;
        ctx.fillStyle = this.lightColor.replace('light', 70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        if (this.tick >= this.spawnTime) {
          this.tick = 0;
          this.spawning = false;
          this.inflating = true;
        }
      } else if (this.inflating) {
        ++this.tick;

        const proportion = this.tick / this.inflateTime;
        const x = (this.cx = this.x);
        const y = (this.cy = this.y - this.size * proportion);

        ctx.fillStyle = this.alphaColor.replace('alp', proportion);
        ctx.beginPath();
        generateBalloonPath(x, y, this.size * proportion);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, this.y);
        ctx.stroke();

        ctx.fillStyle = this.lightColor.replace('light', 70);
        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

        if (this.tick >= this.inflateTime) {
          this.tick = 0;
          this.inflating = false;
        }
      } else {
        this.cx += this.vx;
        this.cy += this.vy += opts.upFlow;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        generateBalloonPath(this.cx, this.cy, this.size);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(this.cx, this.cy + this.size);
        ctx.stroke();

        ctx.fillStyle = this.lightColor.replace('light', 70);
        ctx.fillText(
          this.char,
          this.cx + this.dx,
          this.cy + this.dy + this.size
        );

        if (
          this.cy + this.size < -hh ||
          this.cx + this.size < -hw ||
          this.cx - this.size > hw ||
          this.cy - this.size > hh
        ) {
          this.phase = 'done';
        }
      }
    }
  };

  function Shard(x, y, vx, vy, color) {
    const vel =
      opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

    this.vx = vx * vel;
    this.vy = vy * vel;
    this.x = x;
    this.y = y;
    this.prevPoints = [[x, y]];
    this.color = color;
    this.alive = true;
    this.size =
      opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
  }

  Shard.prototype.step = function() {
    this.x += this.vx;
    this.y += this.vy += opts.gravity;

    if (this.prevPoints.length > opts.fireworkShardPrevPoints) {
      this.prevPoints.shift();
    }

    this.prevPoints.push([this.x, this.y]);

    const lineWidthProportion = this.size / this.prevPoints.length;

    for (let k = 0; k < this.prevPoints.length - 1; ++k) {
      const point = this.prevPoints[k];
      const point2 = this.prevPoints[k + 1];

      ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
      ctx.lineWidth = k * lineWidthProportion;
      ctx.beginPath();
      ctx.moveTo(point[0], point[1]);
      ctx.lineTo(point2[0], point2[1]);
      ctx.stroke();
    }

    if (this.prevPoints[0][1] > hh) {
      this.alive = false;
    }
  };

  function generateBalloonPath(x, y, size) {
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x - size / 2,
      y - size / 2,
      x - size / 4,
      y - size,
      x,
      y - size
    );
    ctx.bezierCurveTo(
      x + size / 4,
      y - size,
      x + size / 2,
      y - size / 2,
      x,
      y
    );
  }

  function buildScene(sceneIndex) {
    configureScene(sceneIndex);
    letters = [];
    textHoldStartedAt = null;
    balloonPhaseStartedAt = null;
    balloonsReleased = false;

    for (let i = 0; i < opts.strings.length; ++i) {
      const line = opts.strings[i];

      for (let j = 0; j < line.length; ++j) {
        letters.push(
          new Letter(
            line[j],
            j * opts.charSpacing +
              opts.charSpacing / 2 -
              (line.length * opts.charSpacing) / 2,
            i * opts.lineHeight +
              opts.lineHeight / 2 -
              (opts.strings.length * opts.lineHeight) / 2
          )
        );
      }
    }
  }

  function moveToNextScene() {
    if (sceneTransitioning) return;

    sceneTransitioning = true;
    setTimeout(function() {
      currentSceneIndex = (currentSceneIndex + 1) % scenes.length;
      buildScene(currentSceneIndex);
      sceneTransitioning = false;
    }, 350);
  }

  function anim() {
    window.requestAnimationFrame(anim);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    ctx.translate(hw, hh);

    for (let i = 0; i < letters.length; ++i) {
      letters[i].step();
    }

    const allTextReady =
      letters.length > 0 &&
      letters.every(
        letter =>
          letter.phase === 'contemplate' &&
          !letter.circleCreating &&
          !letter.circleFading
      );

    if (allTextReady && textHoldStartedAt === null && !balloonsReleased) {
      textHoldStartedAt = Date.now();
    }

    if (
      textHoldStartedAt !== null &&
      !balloonsReleased &&
      Date.now() - textHoldStartedAt >= textHoldDuration
    ) {
      letters.forEach(letter => letter.startBalloon());
      balloonsReleased = true;
      balloonPhaseStartedAt = Date.now();
    }

    ctx.translate(-hw, -hh);

    if (
      balloonsReleased &&
      balloonPhaseStartedAt !== null &&
      Date.now() - balloonPhaseStartedAt >= balloonSceneDuration
    ) {
      moveToNextScene();
      balloonPhaseStartedAt = null;
    }
  }

  window.addEventListener('resize', function() {
    w = canvasC.width = window.innerWidth;
    h = canvasC.height = window.innerHeight;
    hw = w / 2;
    hh = h / 2;
    buildScene(currentSceneIndex);
  });

  buildScene(currentSceneIndex);
  anim();
}
