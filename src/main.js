import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let query = '';
let totalHits = 0;
let loadedHits = 0;

form.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSubmit(event) {
  event.preventDefault();

  const { elements } = event.target;
  const request = elements['search-text'].value.trim();

  if (request === '') {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  query = request;
  page = 1;
  loadedHits = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    totalHits = data.totalHits;
    loadedHits = data.hits.length;

    hideLoader();

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'No Results',
        message: 'No images found. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (loadedHits < totalHits) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        title: 'End of Results',
        message: 'You have reached the end of search results.',
        position: 'topRight',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    hideLoader();
  }
}

async function handleLoadMore() {
  page++;
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);
    loadedHits += data.hits.length;

    if (loadedHits < totalHits) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        title: 'End of Results',
        message: 'You have reached the end of search results.',
        position: 'topRight',
      });
      hideLoadMoreButton();
    }

    const firstCard = document.querySelector('.gallery')?.firstElementChild;
    if (firstCard) {
      const { height: cardHeight } = firstCard.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}
