let photoLibrary = [];
let gridRows = parseInt(document.getElementById('gridRows').value, 10);
let paddingRatio = parseFloat(document.getElementById('paddingRatio').value);
let radiusRatio = parseFloat(document.getElementById('radiusRatio').value);

let averageSize = 0;
let imageBox = document.querySelector('.image-box');
let previewArea = document.querySelector('.preview-area')
let gridArea = document.querySelector('.grid-area')
let returnBtn = document.querySelector('.return-btn')
let generateBtn = document.querySelector('.generate-btn')
let previewHint = document.querySelector('.preview-hint')

let uploadFilesInput = document.getElementById('uploadFiles');
let uploadFolderInput = document.getElementById('uploadFolder');
let uploadFilesBtn = document.getElementById('uploadFilesBtn');
let uploadFolderBtn = document.getElementById('uploadFolderBtn');
let exportBtn = document.getElementById('exportBtn');
let removeBtn = document.getElementById('removeImageBtn');

let exportMode = false;
let demoMode = false;

function afterGenerate() {
    if (photoLibrary.length === 0) {
        alert('请先添加图片');
        return;
    }
    previewArea.style.display = 'none';
    previewHint.style.display = 'none';
    gridArea.style.display = 'block';
    returnBtn.style.display = 'block'; // 显示返回按钮
    exportBtn.style.display = 'inline-block'; // 显示导出按钮
    getAverageSize();
    displayImagesInGrid();
}

function beforeGenerate() {
    previewArea.style.display = 'grid';
    previewHint.style.display = 'block';
    gridArea.style.display = 'none';
    returnBtn.style.display = 'none'; // 隐藏返回按钮
    exportBtn.style.display = 'none'; // 隐藏导出按钮
}

function getAverageSize() {
    let boxHeight = imageBox.offsetHeight;
    averageSize = Math.floor(boxHeight / gridRows);
}

function enterExportMode() {
    // 弹窗提示：进入导出模式后，点击图片或者按下Esc键退出导出模式。可以使用开发者工具全局截屏保存网页。
    alert('进入导出模式后，点击图片或者按下Esc键退出导出模式。可以使用开发者工具全局截屏保存网页。');
    exportMode = true;
    gridArea.classList.add('export');
}

function exitExportMode() {
    if (demoMode) {
        displayImagesInGrid();
        return;
    }
    exportMode = false;
    gridArea.classList.remove('export');
}

document.addEventListener('DOMContentLoaded', function() {
    generateBtn.addEventListener('click', afterGenerate);
    returnBtn.addEventListener('click', beforeGenerate);

    beforeGenerate();

    uploadFilesInput.addEventListener('change', processUpload);
    uploadFolderInput.addEventListener('change', processUpload);

    uploadFilesBtn.addEventListener('click', function() {
        uploadFilesInput.click();
    })
    uploadFolderBtn.addEventListener('click', function() {
        uploadFolderInput.click();
    })

    exportBtn.addEventListener('click', enterExportMode);

    document.addEventListener('keydown', function(event) {
        if (!exportMode) {
            return;
        }
        if (event.key === 'Escape' || event.keyCode === 27) {
            exitExportMode()
        }
    });

    gridArea.addEventListener('click', function(event) {
        if (!exportMode) {
            return;
        }
        exitExportMode()
    });

    removeBtn.addEventListener('click', function() {
        photoLibrary = [];
        previewImages();
    });
});

function updateValueFromInput(inputId, updateFunction) {
    document.getElementById(inputId).addEventListener('change', function() {
        updateFunction(this.value);
    });
}

// 应用通用函数
updateValueFromInput('gridRows', function(value) {
    gridRows = parseInt(value, 10);
    getAverageSize();
});
updateValueFromInput('paddingRatio', function(value) {
    paddingRatio = parseFloat(value);
});
updateValueFromInput('radiusRatio', function(value) {
    radiusRatio = parseFloat(value);
});



// 文件和文件夹上传的处理
function processUpload(event) {
    const items = event.target.files;
    processFiles(items);
    event.target.value = ''; // 重置input的value
}

function processFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const objectURL = URL.createObjectURL(file);
            const img = document.createElement('img');
            img.src = objectURL;
            img.onload = function() {
                photoLibrary.push({
                    source: objectURL,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    type: 'image',
                });
                previewImages();
            };
            img.onclick = function() {
                photoLibrary = photoLibrary.filter(photo => photo.source !== objectURL);
                URL.revokeObjectURL(objectURL);
                previewImages();
            };
        }
    }
}

function previewImages() {
    previewArea.innerHTML = ''; // 清除当前的内容
    photoLibrary.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.source;
        // img.style.width = '400px';
        // img.style.height = '400px';
        img.onclick = function() {
            photoLibrary = photoLibrary.filter(p => p.source !== photo.source);
            previewImages();
        };
        previewArea.appendChild(img);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // 生成一个随机索引
        const j = Math.floor(Math.random() * (i + 1));
        // 交换当前元素与随机选中的元素
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function displayImagesInGrid() {
    photoLibrary = shuffleArray(photoLibrary);
    const album = new Album(photoLibrary, gridRows)
    imageBox.innerHTML = '';
    album.items.forEach(item => {
        const img = document.createElement('img');
        img.src = item.source;
        img.style.width = (item.grid.w - 2 * paddingRatio) * averageSize + 'px';
        img.style.height = (item.grid.h - 2 * paddingRatio) * averageSize + 'px';
        img.style.top = (item.position.y + paddingRatio) * averageSize + 'px';
        img.style.left = (item.position.x + paddingRatio) * averageSize + 'px';
        img.style.borderRadius = radiusRatio * averageSize + 'px';
        imageBox.appendChild(img);
    });
}

function demonstrate() {
    demoMode = true;
    new Request().get('https://unsplash.6-79.cn/random/multiple', {num: 30}).then(data => {
        photoLibrary = data.body.map(photo => {
            return {
                source: photo.regular,
                width: photo.width,
                height: photo.height,
                type: 'image',
            }
        });
        afterGenerate();
        exportMode = true;
        gridArea.classList.add('export');
        removeLoading()
    })
}

function removeLoading() {
    document.querySelector('.loading-container').remove();
}
