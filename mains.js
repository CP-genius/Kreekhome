const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('imagePreviewContainer');
const form = document.getElementById('listingForm');
const videoInput = document.getElementById('video');
const videoPreviewContainer = document.getElementById('video-preview');

let selectedImages = [];

function renderImagePreviews() {
  previewContainer.innerHTML = '';
  
  selectedImages.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewBox = document.createElement('div');
      previewBox.className = 'preview-box';
      
      const img = document.createElement('img');
      img.src = e.target.result;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerText = '×';
      removeBtn.title = 'Remove';
      
      removeBtn.addEventListener('click', () => {
        selectedImages.splice(index, 1);
        updateFileInput();
        renderImagePreviews();
      });
      
      previewBox.appendChild(removeBtn);
      previewBox.appendChild(img);
      previewContainer.appendChild(previewBox);
    };
    reader.readAsDataURL(file);
  });
}

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedImages.forEach(file => dataTransfer.items.add(file));
  imageInput.files = dataTransfer.files;
}

// On file selection
imageInput.addEventListener('change', function() {
  const files = Array.from(this.files);
  
  // Validate size
  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) {
      alert(`"${file.name}" is larger than 2MB.`);
      return;
    }
  }
  
  // Validate max total images
  if (selectedImages.length + files.length > 6) {
    alert('You can upload a maximum of 6 images.');
    return;
  }
  
  selectedImages = selectedImages.concat(files);
  updateFileInput();
  renderImagePreviews();
});

// Validate before form submission
form.addEventListener('submit', function(e) {
  if (selectedImages.length > 6) {
    alert('You can upload a maximum of 6 images.');
    e.preventDefault();
    return;
  }
  
  for (const file of selectedImages) {
    if (file.size > 2 * 1024 * 1024) {
      alert(`"${file.name}" is larger than 2MB.`);
      e.preventDefault();
      return;
    }
  }
});

// Video preview
videoInput.addEventListener('change', function(event) {
  const videoFile = event.target.files[0];
  videoPreviewContainer.innerHTML = '';
  
  if (videoFile) {
    const videoURL = URL.createObjectURL(videoFile);
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.src = videoURL;
    videoPreviewContainer.appendChild(videoElement);
  }
});