// constants
const notification = document.getElementById('notification');
const previewTab = document.getElementById('preview-tab');
const fileSelect = document.getElementById('file-select');
const bottomBar = document.getElementById('bottom-bar');
const changeImg = document.getElementById('change-img');
const captionBox = document.getElementById('caption-box');
const startWithTxt = document.getElementById('start-with');
const historyList = document.getElementById('history-list');
const generateButton = document.getElementById('generate-button');
const audioPreview = document.getElementById("audio-preview");
const settingsPopup = document.getElementById("settings-popup");
const languageSelect = document.getElementById("language-select");


// variable
let isBuffering = false;
let notificationId;
let chatHistory = [];

// functions
function showBuffer() {
    isBuffering = true;
    generateButton.innerHTML = `<img src="/assets/loading.svg" />`;
}

function stopBuffering() {
    isBuffering = false;
    generateButton.innerHTML = 'Generate✨';
}

function toggleSettings() {
    settingsPopup.classList.toggle('hide-settings');
}

function hideNotification() {
    notification.classList.toggle('show-notification', false);
}

function showNotification(txt) {
    notification.querySelector('.notify-txt').innerHTML = txt;
    clearTimeout(notificationId);
    notification.classList.toggle('show-notification', true);
    notificationId = setTimeout(hideNotification, 5000);
}

function showDrop() {
    previewTab.classList.toggle('show-drop', true);
}
function hideDrop() {
    previewTab.classList.toggle('show-drop', false);
}

function showUpload() {
    cleareCaption();
    previewTab.innerHTML = `<div>
        <input id="image-url" /><button onclick="handleUrl();">Upload</button>
    </div>
    <aside onclick="fileSelect.click();">• <a>click</a> to browse or drop image file</aside>`;
}

function showImage(imgUrl) {
    showBottomBar();
    previewTab.innerHTML = `<img src="${imgUrl}" />`;
}

function showLoading() {
    previewTab.innerHTML = `<img src="./assets/loading.svg" class="loading-img" />`;
}

function handleDrop(event) {
    event.preventDefault();
    hideDrop();
    const file = event.dataTransfer.files[0];
    if (file && file.type.split('/')[0] == 'image') {
        const fileList = new DataTransfer();
        fileList.items.add(file);
        fileSelect.files = fileList.files;
        const objectUrl = URL.createObjectURL(file);
        showImage(objectUrl);
    } else {
        showNotification('Only image files are allowed !');
    }
}


function handleSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.split('/')[0] === 'image') {
        const objectUrl = URL.createObjectURL(file);
        showImage(objectUrl);
    } else {
        showNotification('Only image files are allowed!');
    }
}


function handleUrl() {
    const imageUr = document.getElementById('image-url').value;
    if (!imageUr) {
        showNotification('Enter image url first');
        return;
    }

    showLoading();

    fetch(imageUr, {
        method: 'HEAD'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.split('/')[0] === 'image') {
                showImage(imageUr);
            } else {
                showNotification('The URL does not point to an image');
                showUpload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Not a valid image url');
            showUpload();
        });
}


function showBottomBar() {
    if (bottomBar.style.display == 'none') {
        bottomBar.style.display = 'flex';
    }
}


function showCaption(txt) {
    captionBox.innerHTML = '';

    var words = txt.split(' ');
    var i = 0;
    function appendWord() {
        if (i < words.length) {
            captionBox.innerHTML += words[i] + ' ';
            i++;
            setTimeout(appendWord, 200);
        } else {
            makeHistory();
        }
    }

    appendWord();
}

function cleareCaption() {
    captionBox.innerHTML = '';
}

function copyCaption(itSelf) {
    const text = captionBox.innerHTML;
    navigator.clipboard.writeText(text).then(function () {
        showNotification("Copied to clipboard");
        itSelf.style.scale = 1.1;
        setTimeout(() => {
            itSelf.style.scale = 1;
        }, 100);
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}

function generateCaption() {
    if (isBuffering) {
        showNotification('Caption genereting is still in progress');
        return;
    }
    let currentImg = previewTab.querySelector('img');
    if (!currentImg) {
        showNotification('No image selected');
        return;
    }
    showBuffer();

    fetch(currentImg.src)
        .then(response => response.blob())
        .then(blob => {
            const data = new FormData();
            data.append('image', blob);
            data.append('lang', languageSelect.value);

            fetch('/generate-caption', {
                method: 'POST',
                body: data
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showNotification(data.error);
                    } else {
                        showCaption(data.caption);
                    }
                    stopBuffering();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Something went wrong');
                    stopBuffering();
                });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Something went wrong');
            stopBuffering();
        });
}


function makeHistory() {
    const currentImg = previewTab.querySelector('img');
    if (currentImg) {
        fetch(currentImg.src)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    const image = reader.result;
                    const historyItem = { 'caption': captionBox.innerHTML, 'image': image };
                    chatHistory.unshift(historyItem);
                    const newOption = document.createElement('option');
                    newOption.innerHTML = historyItem.caption;
                    historyList.prepend(newOption);
                    saveHistory();
                }
                reader.readAsDataURL(blob);
            });
    }
}

function saveHistory() {
    localStorage.setItem('posts', JSON.stringify(chatHistory));
}


function clearHistory() {
    chatHistory = [];
    saveHistory();
    historyList.innerHTML = '';
    cleareCaption();
    showNotification('History cleared');
}

function retriveHistory(event) {
    const selectedOption = event.target;
    const selectedOptionIndex = selectedOption.dataset.index;
    if (selectedOptionIndex) {
        const historyItem = chatHistory[selectedOptionIndex];
        captionBox.innerHTML = historyItem.caption;
        showImage(historyItem.image);
    }

}

function getFromLocalStorage() {
    chatHistory = JSON.parse(localStorage.getItem('posts')) || [];
    chatHistory.forEach((post, index) => {
        const newOption = document.createElement('option');
        newOption.innerHTML = post.caption;
        newOption.dataset.index = index;
        historyList.prepend(newOption);
    });

}

function storeLanguage(lang){
    localStorage.setItem('lang', lang);
}

function handleImageChange() {
    showUpload();
    cleareCaption();
}

function isUsingFirstTime() {
    return localStorage.getItem('isFirst') == undefined;
}

// setup
if (isUsingFirstTime()) {
    showNotification('Welcome, upload your first image to see magic 🪄');
    localStorage.setItem('isFirst', 'no');
}
showUpload();
getFromLocalStorage();
languageSelect.value = localStorage.getItem('lang') || 'en';
window.addEventListener('dragover', (event) => {
    event.preventDefault();
});
window.addEventListener('drop', (event) => {
    event.preventDefault();
});