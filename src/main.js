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

  if (request.length < 3) {
    iziToast.error({
      title: 'Error',
      message: 'Search term must be at least 3 characters long!',
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

  const MIN_LOADER_TIME = 1000;
  const startTime = Date.now();

  try {
    const data = await getImagesByQuery(query, page);

    totalHits = data.totalHits;
    loadedHits = data.hits.length;

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'No Results',
        message: 'No images found. Please try again!',
        position: 'topRight',
      });
      hideLoader();
      return;
    }

    const elapsed = Date.now() - startTime;
    const delay = Math.max(MIN_LOADER_TIME - elapsed, 0);

    setTimeout(() => {
      hideLoader();
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
    }, delay);
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
