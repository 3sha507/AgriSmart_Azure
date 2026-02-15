// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.closest('.tab-btn').classList.add('active');
}

// ============================================
// CROP PREDICTION
// ============================================

document.getElementById('cropForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const cropData = {
        N: document.getElementById('N').value,
        P: document.getElementById('P').value,
        K: document.getElementById('K').value,
        temp: document.getElementById('temp').value,
        humidity: document.getElementById('humidity').value,
        ph: document.getElementById('ph').value,
        rainfall: document.getElementById('rainfall').value
    };

    // Clear previous results
    clearCropResult();

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    try {
        const response = await fetch('/predict_crop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cropData)
        });

        const result = await response.json();

        if (result.success) {
            displayCropResult(result.result);
        } else {
            displayCropError(result.error || 'Failed to get prediction');
        }
    } catch (error) {
        displayCropError('Error: ' + error.message);
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

function displayCropResult(prediction) {
    const resultDiv = document.getElementById('cropResult');
    const predictionElement = document.getElementById('cropPrediction');

    predictionElement.textContent = prediction;
    resultDiv.classList.remove('hidden');

    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function displayCropError(error) {
    const errorDiv = document.getElementById('cropError');
    errorDiv.textContent = error;
    errorDiv.classList.remove('hidden');

    // Scroll to error
    setTimeout(() => {
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function clearCropResult() {
    document.getElementById('cropResult').classList.add('hidden');
    document.getElementById('cropError').classList.add('hidden');
}

// ============================================
// DISEASE DETECTION
// ============================================

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('diseaseFile');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = '';
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        displayDiseaseError('Please select a valid image file');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        displayDiseaseError('File size must be less than 10MB');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.classList.remove('hidden');
        uploadArea.classList.add('hidden');
        clearDiseaseResult();
    };
    reader.readAsDataURL(file);

    // Update file input
    fileInput.files = file;
}

function clearImage() {
    fileInput.value = '';
    imagePreview.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    clearDiseaseResult();
}

document.getElementById('diseaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
        displayDiseaseError('Please select an image');
        return;
    }

    // Clear previous results
    clearDiseaseResult();

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;

    try {
        const response = await fetch('/predict_disease', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displayDiseaseResult(result.result);
        } else {
            displayDiseaseError(result.error || 'Failed to analyze image');
        }
    } catch (error) {
        displayDiseaseError('Error: ' + error.message);
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

function displayDiseaseResult(prediction) {
    const resultDiv = document.getElementById('diseaseResult');
    const predictionElement = document.getElementById('diseasePrediction');

    predictionElement.textContent = prediction;
    resultDiv.classList.remove('hidden');

    // Scroll to result
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function displayDiseaseError(error) {
    const errorDiv = document.getElementById('diseaseError');
    errorDiv.textContent = error;
    errorDiv.classList.remove('hidden');

    // Scroll to error
    setTimeout(() => {
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function clearDiseaseResult() {
    document.getElementById('diseaseResult').classList.add('hidden');
    document.getElementById('diseaseError').classList.add('hidden');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set first tab as active
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        firstTab.click();
    }
});