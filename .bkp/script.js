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


// variable
let isBuffering = false;
let notificationId;

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
    cleanAudio();
    previewTab.innerHTML = `<div>
        <input id="image-url" /><button onclick="handleUrl();">Upload</button>
    </div>
    <aside onclick="fileSelect.click();">• <a>click</a> to browse or drop image file</aside>`;
}
function showAudio(audioUrl) {
    audioPreview.src = `/uploads/${audioUrl}`;
}

function cleanAudio() {
    audioPreview.src = "";
}
function showImage(imgUrl) {
    showBottomBar();
    previewTab.innerHTML = `<img data-fileid="${imgUrl}" src="/uploads/${imgUrl}" />`;
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
        uploadImage();
    } else {
        showNotification('Only image files are allowed !');
    }
}
function handleSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.split('/')[0] === 'image') {
        uploadImage(file);
    } else {
        showNotification('Only image files are allowed!');
    }
}

function uploadImage() {
    showLoading();
    const file = fileSelect.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload-image', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showNotification(data.error);
                    showUpload();
                } else {
                    showImage(data.fileid);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Something went wrong !');
                showUpload();
            });
    } else {
        showNotification('No file selected');
        showUpload();
    }
}


function handleUrl() {
    const imageUrlInput = document.getElementById('image-url').value;
    if (!imageUrlInput) {
        showNotification('Enter image url first');
        return;
    }

    showLoading();

    fetch(imageUrlInput, {
        method: 'HEAD'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.split('/')[0] === 'image') {
                showNotification('Image found');
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


// function handleUrl() {
//     const imageUrlInput = document.getElementById('image-url').value;
//     if (!imageUrlInput) {
//         showNotification('Enter image url first');
//         return;
//     }

//     const data = { 'url': imageUrlInput };
//     showLoading();

//     fetch('/upload-url', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     })
//         .then(response => response.json())
//         .then(data => {
//             if (data.error) {
//                 showNotification(data.error);
//                 showUpload();
//             } else {
//                 showImage(data.fileid);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             showNotification('Something went wrong');
//             showUpload();
//         });
// }



function showBottomBar() {
    if (bottomBar.style.display == 'none') {
        bottomBar.style.display = 'flex';
    }
}

function handleImageChange(imageid = null) {
    if (imageid == null) {
        showUpload();
    }
}

function getAudioFileName() {
    const imgSrc = previewTab.querySelector("img").src;
    const filenameWithoutExtension = imgSrc.split('/').pop().split('.')[0];
    return `${filenameWithoutExtension}.mp3`;
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
            showAudio(getAudioFileName());
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
        itSelf.innerHTML = 'copied ✔️';
        setTimeout(() => {
            itSelf.innerHTML = 'click to copy';
        }, 2000);
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}

function generateCaption() {
    if (isBuffering) {
        showNotification('on processing');
        return;
    }
    let currentImg = previewTab.querySelector('img');
    if (currentImg) {
        showBuffer();
        let fileid = currentImg.dataset.fileid;
        let starttxt = startWithTxt.value;

        if (!fileid) {
            showNotification('wait for uploadig to be finished');
            stopBuffering();
            return;
        }
        const data = {
            'fileid': fileid,
            'starttxt': starttxt,
            'lang': 'en'
        };

        fetch('/generate-caption', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showNotification(data.error);
                    stopBuffering();
                } else {
                    showCaption(data.caption);
                    stopBuffering();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Something went wrong');
                stopBuffering();
            });
    } else {
        showNotification('Upload image first');
    }
}

function makeHistory() {
    let currentImg = previewTab.querySelector('img');
    if (currentImg) {
        let fileid = currentImg.dataset.fileid;
        let newOption = document.createElement('option');
        newOption.innerHTML = captionBox.innerHTML;
        newOption.dataset.fileid = fileid;
        historyList.prepend(newOption);
        storeInLocalStorage({ 'caption': captionBox.innerHTML, 'fileid': fileid });
    }
}

function retriveHistory(event) {
    let selectedOption = event.target;
    let selectedOptionValue = selectedOption.value;
    let selectedOptionFileId = selectedOption.dataset.fileid;
    if (selectedOptionValue && selectedOptionFileId) {
        captionBox.innerHTML = selectedOptionValue;
        showImage(selectedOptionFileId);
        showAudio(getAudioFileName());
    }
}

function clearHistory() {
    localStorage.clear();
    historyList.innerHTML = '';
    showNotification('History cleared');
}

//  browser storage 
function storeInLocalStorage(jsonObject) {
    let postsArray = JSON.parse(localStorage.getItem('posts')) || [];
    postsArray.push(jsonObject);
    localStorage.setItem('posts', JSON.stringify(postsArray));
}

function getFromLocalStorage() {
    let postsArray = JSON.parse(localStorage.getItem('posts')) || [];
    postsArray.forEach(post => {
        let newOption = document.createElement('option');
        newOption.innerHTML = post.caption;
        newOption.dataset.fileid = post.fileid;
        historyList.prepend(newOption);
    });
}

function isUsingFirstTime() {
    return localStorage.getItem('posts') == null;
}

// setup
if (isUsingFirstTime()) {
    showNotification('Welcome, upload your first image to see magic 🪄');
}
showUpload();
getFromLocalStorage();
window.addEventListener('dragover', (event) => {
    event.preventDefault();
});
window.addEventListener('drop', (event) => {
    event.preventDefault();
});