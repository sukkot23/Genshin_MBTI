const button_start = document.querySelector('.button_start');
const button_submit = document.querySelector('.button_submit');
const button_end = document.querySelector('.button_result');

const question_number = document.querySelector('.q2-number');
const question_text = document.querySelector('.q2-text');

const re_mbti = document.querySelector('.mbti');
const re_image = document.querySelector('.mbti_image');
const re_text_1 = document.querySelector('.mbti_t1');
const re_text_2 = document.querySelector('.mbti_t2');
const re_text_3 = document.querySelector('.mbti_t3');
const re_text_4 = document.querySelector('.mbti_t4');
const re_list = document.querySelector('.char-list');

const share_canvas = document.querySelector('.share_canvas');
const share_context = share_canvas.getContext('2d');

let mbti = "";
let number = 1;
let scoreboard = Array.from({length: 8}, () => 0);



button_start.addEventListener('click', () => {
    form_3_loading.style.display = 'flex';
    
    Promise.all([mbtiData, mbtiExplan, mbtiCharacter])
    .then(([data, explan, character]) => {
        mbtiData = data;
        mbtiExplan = explan;
        mbtiCharacter = character;

        question_number.innerText = number;
        question_text.innerText = mbtiData[number][1];

        onNextPage(form_3_fq1, form_3_fq2);

        registerKeyUpNumberPad();

        form_3_loading.style.display = 'none';
    })
    .catch(error => {
        const m = '시트 데이터를 불러올 수 없습니다 (Error Code = 4)\n'

        console.warn(m, error);
        alert(m + error);
    });
});

button_submit.addEventListener('click', submit);

function submit() {
    const answer = document.querySelector('input[name="select"]:checked');

    if (answer === null) return;

    const value = answer.value;
    const category = mbtiData[number][2];
    const weight = mbtiData[number][3];

    applyScoreboard(value, category, weight)

    answer.checked = false;

    if (number >= 40) {
        mbti = getUserMBTI(scoreboard);

        onNextPage(form_3_fq2, form_3_fq3);
    }
    else {
        number++;

        question_number.innerText = number;
        question_text.innerText = mbtiData[number][1];
    }
}

button_end.addEventListener('click', () => {
    form_3_loading.style.display = 'flex';

    result(mbti).then(() => {
        form_3_loading.style.display = 'none';

        onNextPage(form_3, form_4);
    });
});

async function result(m) {
    const mbti_info = getFilterSheet(mbtiExplan, 0, m);
    const mbti_characters = getFilterSheet(mbtiCharacter, 4, m);

    form_4.style.background = getStyleBackgroundColor(mbti_characters[1][6]);

    re_mbti.innerText = mbti;
    re_image.src = getDriveThumbnailURL(mbti_characters[1][3]);
    re_text_1.innerText = mbti_info[1][1];
    re_text_2.innerText = mbti_info[1][2];
    re_text_3.innerText = mbti_info[1][3];
    re_text_4.innerText = mbti_info[1][4];

    for (let i = 1; i < mbti_characters.length; i++) {
        const img = new Image();
        img.src = getDriveThumbnailURL(mbti_characters[i][3]);

        const input = document.createElement('input');

        input.type = 'radio';
        input.id = i;
        input.name = "profile";

        const label = document.createElement('label');

        label.htmlFor = i;
        label.classList.add("char-profile");
        label.style.backgroundImage = "url(\"" + getDriveThumbnailURL(mbti_characters[i][2]) + "\")";
        label.addEventListener('click', () => interactProfile(mbti_characters[i], img.src, mbti_characters[i][3]));

        re_list.appendChild(input);
        re_list.appendChild(label);
    }

    re_list.scrollLeft = 0;
    onDisplayArrowButton();
    initResultCard(mbti_characters[1][3]);
}

button_restart.addEventListener('click', restart);

function restart() {
    mbti = "";
    number = 1;
    scoreboard = Array.from({length: 8}, () => 0);

    re_list.innerHTML = "";

    onNextPage(form_3_fq3, form_3_fq1);
    form_3.style.display = 'flex';
}



function registerKeyUpNumberPad() {
    window.addEventListener("keyup", e => {
        if (window.getComputedStyle(form_3_fq2).display !== 'flex') return;

        if (["1", "2", "3", "4", "5"].includes(e.key))
            document.getElementById("select_" + String(e.key)).checked = true;
        else if (["Enter", "0"].includes(e.key))
            submit();
    });
}

function applyScoreboard(v, a, w) {
    if (v < 0)
        scoreboard[a^1] += Math.abs(v)*w;
    else
        scoreboard[a] += v*w;
}

function getUserMBTI(b) {
    const mI = ["I", "E", "S", "N", "T", "F", "J", "P"];
    let m = Array.from({length: 4}, () => "");

    for (let i = 0; i < 4; i++) {
        if (b[i*2] === 0 & b[(i*2)+1] === 0)
            m[i] = Math.random() < 0.5 ? mI[i*2] : mI[(i*2)+1];
        else
            m[i] = b[i*2] > b[(i*2)+1] ? mI[i*2] : mI[(i*2)+1];
    }

    return m.join("");
}

function getFilterSheet(s, c, k) {
    return s.filter((r, i) => i === 0 || String(r[c]).includes(k));
}

function getStyleBackgroundColor(id) {
    return "var(--r_" + id + ")";
}

function getDriveThumbnailURL(gid) {
    return "https://drive.google.com/thumbnail?&id=" + gid + "&sz=w3000";
}

function getDriveContentURL(gid) {
    return "https://lh3.googleusercontent.com/d/" + gid + "=w3000";
}

function interactProfile(d, im, gid) {
    form_4.style.background = getStyleBackgroundColor(d[6]);
    re_image.src = im;

    initResultCard(gid);
}

function initResultCard(gid) {
    const ctx = share_context;
    const canvas_width = 800;
    const canvas_height = 1100;
    const width = 700;
    const height = 1000;
    const width_h = (canvas_width - width) / 2;
    const height_h = (canvas_height - height) / 2;
    const width_c = canvas_width / 2;
    const height_c = canvas_height / 2;

    share_canvas.width = canvas_width;
    share_canvas.height = canvas_height;

    ctx.beginPath();

    drawRoundShadow(ctx, width, height, width_h, height_h);
    drawRoundSquare(ctx, width, height, width_h, height_h, canvas_width, canvas_height);
    drawCanvasStar(ctx, width, height);
    drawCanvasText1(ctx, width_c, height_c, re_mbti.innerText);
    drawCanvasImage(ctx, canvas_width, canvas_height, getDriveContentURL(gid));
    drawCanvasText2(ctx, width_c, height_c, re_text_1.innerText, re_text_2.innerText, re_text_3.innerText, re_text_4.innerText);
}

function drawRoundShadow(ctx, w, h, wh, hh) {
    ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 7.5;
        ctx.shadowOffsetX = 8.5;
        ctx.shadowOffsetY = 8;

        ctx.beginPath();
        ctx.roundRect(wh + 1, hh + 1, w - 2, h - 2, 25);

        ctx.fillStyle = "#000000";
        ctx.fill();
    ctx.restore();
}

function drawRoundSquare(ctx, w, h, wh, hh, cw, ch) {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const { angle, colors } = getStyleGradient(getComputedStyle(form_4).backgroundImage);

    const pts = getStyleAngle(angle, cw, ch);
    
    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
    });

    ctx.beginPath();

    ctx.roundRect(wh, hh, w, h, 25);
    ctx.clip();

    ctx.fillStyle = gradient;
    ctx.fill();
}

function drawCanvasStar(ctx) {
    const canvas_star = new Image();
    canvas_star.src = './images/background_star.webp';

    ctx.beginPath();
    canvas_star.onload = function () { ctx.drawImage(canvas_star, 0, 0); };
}

function drawCanvasImage(ctx, cw, ch, url) {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.src = url;

    ctx.beginPath();
    img.onload = function () {
        const iw = img.width;
        const ih = img.height;

        const scale = 525 / ih;

        const sw = iw * scale;
        const sh = ih * scale;

        ctx.drawImage(img, (cw - sw) / 2, ((ch - sh) / 2) - 40, sw, sh);
    };
}

function drawCanvasText1(ctx, wc, hc, text) {
    ctx.font = "700 48px 'Goorm Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#F7F7F7";

    ctx.save();
        ctx.beginPath();
        ctx.fillText("당신의 MBTI는", wc, (hc / 4));
    ctx.restore();

    ctx.save();
        ctx.fillStyle = "#FFDD77";
        ctx.beginPath();
        ctx.fillText(text, wc, (hc / 4) + 64);
    ctx.restore();
}

function drawCanvasText2(ctx, wc, hc, text1, text2, text3, text4) {
    const h2 = (hc / 2) * 3;
    const fs = 32;

    ctx.font = "700 16px 'Goorm Sans', sans-serif";

    ctx.save();
        ctx.font = "700 28px 'Goorm Sans', sans-serif";

        ctx.beginPath();
        ctx.fillText(text1, wc, h2);

    ctx.restore();

    ctx.fillText(text2, wc, h2 + 12 + fs);
    ctx.fillText(text3, wc, h2 + 12 + (fs * 2));
    ctx.fillText(text4, wc, h2 + 12 + (fs * 3));
}

function getStyleAngle(angle, cw, ch) {
    const rad = (angle - 90) * Math.PI / 180;

    const x = Math.cos(rad);
    const y = Math.cos(rad);

    const cx = cw / 2;
    const cy = ch / 2;

    return {
        x1: cx - x * cw / 2,
        y1: cy - y * ch / 2,
        x2: cx + x * cw / 2,
        y2: cy + y * ch / 2
    };
} 

function getStyleGradient(str) {
    const i = str.slice(str.indexOf('(') + 1, str.lastIndexOf(')')).trim();

    const index_deg = i.indexOf('deg');
    const j = i.slice(index_deg + 4).trim();

    const angle = parseFloat(i.slice(0, index_deg).trim());
    const colors = j.replaceAll(' ', '').replaceAll('),', ')/').split('/');

    return { angle, colors };
}
