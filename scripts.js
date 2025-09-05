let currentIndex = 0;

const images = document.querySelectorAll('.carousel-images img');
const videos = document.querySelectorAll('.carousel-images video');
const totalItems = images.length + videos.length;

const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

function showItem(index) {
  const container = document.querySelector('.carousel-images');
  container.style.transform = `translateX(-${index * 100}%)`;
}

prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + totalItems) % totalItems;
  showItem(currentIndex);
});

nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % totalItems;
  showItem(currentIndex);
});