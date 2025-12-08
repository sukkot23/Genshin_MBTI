const header = document.querySelector('header');
const footer = document.querySelector('footer');

const form_1 = document.querySelector('.intro_container');
const form_2 = document.querySelector('.prolog_container');
const form_3 = document.querySelector('.question_container');
const form_4 = document.querySelector('.result_container');
const form_5 = document.querySelector('.share_container');

const form_2_interact = document.querySelector('.form_prolog');
const form_3_popup = document.querySelector('.q1-guide-popup');
const form_3_fq1 = document.querySelector('.form_question_start');
const form_3_fq2 = document.querySelector('.form_question');
const form_3_fq3 = document.querySelector('.form_question_end');
const form_3_loading = document.querySelector('.q3-loading');

const button_intro = document.querySelector('.button_intro');
const button_skip = document.querySelector('.button_skip');
const button_help = document.querySelector('.q1-guide');
const button_restart = document.querySelector('.button_restart');
const button_share = document.querySelector('.button_share');
const share_save = document.querySelector('.share-save');
const share_link = document.querySelector('.share-link');
const share_close = document.querySelector('.share_close');

const list_area = document.querySelector('.form_result_4');
const arrow_left = document.querySelector('.arrow-left');
const arrow_right = document.querySelector('.arrow-right');

const background_f2 = document.querySelector('.bg_v');
const background_f4 = document.querySelector('.bg_s');

const pr_text_1 = document.querySelectorAll('.pt1');
const pr_text_2 = document.querySelectorAll('.pt2');
const pr_text_3 = document.querySelectorAll('.pt3');

let mbtiData, mbtiExplan, mbtiCharacter;
const mD = '1172716297';
const mE = '1854360045';
const mC = '487964325';

let isDown = false;
let startX, scrollLeft;



button_intro.addEventListener('click', () => {
    mbtiData = getSheetData(getGoogleSheetURL(mD));
    mbtiExplan = getSheetData(getGoogleSheetURL(mE));
    mbtiCharacter = getSheetData(getGoogleSheetURL(mC));

    header.style.display = 'none';
    footer.style.display = 'none';

    onNextPage(form_1, form_2);
});

form_2_interact.addEventListener('click', () => {
    if (isDisplayBlock(pr_text_1)) {
        setDisplayNone(pr_text_1);
        setDisplayBlock(pr_text_2);

        background_f2.style.opacity = "0";
    }
    else if (isDisplayBlock(pr_text_2)) {
        setDisplayNone(pr_text_2);
        setDisplayBlock(pr_text_3);
    }
    else if (isDisplayBlock(pr_text_3)) {
        onNextPage(form_2, form_3);
    }
});

button_skip.addEventListener('click', () => {
    onNextPage(form_2, form_3);
});

button_help.addEventListener('click', () => {
    if (window.getComputedStyle(form_3_popup).display === 'flex') {
        form_3_popup.style.display = 'none';
    } else {
        form_3_popup.style.display = 'flex';
    }
});

button_share.addEventListener('click', () => {
    form_5.style.display = 'flex';
});

share_link.addEventListener('click', () => {
    const currentURL = window.location.href;

    navigator.clipboard.writeText(currentURL).then(() => {
        alert('클립보드에 링크가 복사 되었습니다!');
    });
});

share_save.addEventListener('click', () => {
    const a = document.createElement('a');

    a.href = share_canvas.toDataURL();
    a.download = String(getDataFormat()) + ".png";
    a.click();
});

share_close.addEventListener('click', () => {
    form_5.style.display = 'none';
});


window.addEventListener('resize', onDisplayArrowButton);

function onDisplayArrowButton() {
    if (hasScrollForm()) {
        arrow_left.style.display = 'flex';
        arrow_right.style.display = 'flex';
        re_list.style.justifyContent = 'start';
    }
    else {
        arrow_left.style.display = 'none';
        arrow_right.style.display = 'none';
        re_list.style.justifyContent = 'center';
    }
}


list_area.addEventListener('mousedown', (e) => {
    if (hasScrollForm()) {
        isDown = true;
        list_area.classList.add('dragging');

        startX = e.pageX - re_list.offsetLeft;
        scrollLeft = re_list.scrollLeft;
    }
});

list_area.addEventListener('mousemove', (e) => {
    if (hasScrollForm()) {
        if (isDown) {
            e.preventDefault();

            const x = e.pageX - re_list.offsetLeft;
            const walk = x - startX;

            re_list.scrollLeft = scrollLeft - walk;
        }
    }
});

list_area.addEventListener('mouseleave', () => {
    if (hasScrollForm()) {
        isDown = false;
        list_area.classList.remove('dragging');
    }
});

list_area.addEventListener('mouseup', () => {
    if (hasScrollForm()) {
        isDown = false;
        list_area.classList.remove('dragging');
    }
});



function onNextPage(toForm, nextForm) {
    toForm.style.display = 'none';
    nextForm.style.display = 'flex';
}

function isDisplayBlock(selectors) {
    if (selectors.length === 0) { return false; }
    const displayValue = window.getComputedStyle(selectors[0]).display;
    
    return displayValue === 'block';
}

function setDisplayNone(selectors) {
    selectors.forEach(element => {
        element.style.display = 'none';
    });
}

function setDisplayBlock(selectors) {
    selectors.forEach(element => {
        element.style.display = 'block';
    });    
}

function getSheetData(url) {
    const response = fetch(url)
    .then(r => {
        if (!r.ok)
            throw new Error("Failed to retrieve sheet (Error Code = 1)\n" + r.status);
        else 
            return r.text();
    })
    .then(t => {
        if (t === "") {
            throw new Error("No Sheet Price (Error Code = 2)\n" + t);
        }
        else {
            const sheet = Papa.parse(t, { header: false }).data;

            if (sheet.length === 0)
                throw new Error("Sheet Empty (Error Code = 3)\n" + t);
            else
                return sheet;
        }
    })
    .catch(error => {
        console.warn(error);
        alert(error);
    });

    return response;
}

function getGoogleSheetURL(gid) {
    return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRptF0d16HU5f5MhT2X534taPwicMaBoaZ6V0teYYHMiVN2EFTilGz39bNAtTvu6tFpwzUi9koP70WZ/pub?gid=' + gid + '&single=true&output=csv';
}

function getDataFormat() {
    const date = new Date();

    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, "0");
    const D = String(date.getDate()).padStart(2, "0");

    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");

    return `${Y}${M}${D}${h}${m}${s}`;
}

function hasScrollForm() {
    return re_list.scrollWidth > re_list.clientWidth;
}

