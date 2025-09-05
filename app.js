// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI3NCZ-bF_9hEbXAjkIX_1tuIYyfM4QNg",
  authDomain: "real-estate-b0c92.firebaseapp.com",
  projectId: "real-estate-b0c92",
  storageBucket: "real-estate-b0c92.firebasestorage.app",
  messagingSenderId: "708869112975",
  appId: "1:708869112975:web:f5ccfce02b74a23553dcfa",
  measurementId: "G-CGCBKW9K24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Cloudinary setup
const cloudName = 'dpl0ivvfv';
const uploadPreset = 'realestate_pics';

// Handle form submission
const uploadForm = document.getElementById("uploadForm");
const progressBar = document.getElementById("progress");

uploadForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get home details
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const photos = document.getElementById('photos').files;
  const video = document.getElementById('video').files[0];
  
  if (photos.length > 6) {
    alert('You can only upload up to 6 photos.');
    return;
  }
  
  // Upload video to Cloudinary
  uploadToCloudinary(video, 'video', (videoUrl) => {
    const mediaUrls = [];
    let photoUploadsCompleted = 0;
    
    // Upload photos to Cloudinary
    Array.from(photos).forEach((photo, index) => {
      uploadToCloudinary(photo, 'image', (photoUrl) => {
        mediaUrls.push(photoUrl);
        photoUploadsCompleted++;
        
        if (photoUploadsCompleted === photos.length) {
          // All uploads complete, save to Firestore
          saveHomeDetails(title, description, price, mediaUrls, videoUrl);
        }
      });
    });
  });
});

function uploadToCloudinary(file, type, callback) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`, true);
  
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100;
      progressBar.value = progress;
    }
  };
  
  xhr.onload = function() {
    const response = JSON.parse(xhr.responseText);
    callback(response.secure_url); // Get the uploaded file's URL
  };
  
  xhr.onerror = function() {
    alert('Error uploading file. Please try again.');
  };
  
  xhr.send(formData);
}

function saveHomeDetails(title, description, price, mediaUrls, videoUrl) {
  const homeDetails = {
    title,
    description,
    price,
    photos: mediaUrls,
    video: videoUrl,
    createdAt: new Date().toISOString()
  };
  
  // Save home details to Firestore
  addDoc(collection(db, 'listings'), homeDetails).then(() => {
    // Redirect to "my-listings.html" on success
    window.location.href = "my-listings.html";
  }).catch((error) => {
    console.error("Error saving home details:", error);
    alert("Error saving home details. Please try again.");
  });
}