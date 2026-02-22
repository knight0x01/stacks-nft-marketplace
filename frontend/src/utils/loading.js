export class LoadingService {
  constructor() {
    this.loadingCount = 0;
  }

  show() {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.createLoader();
    }
  }

  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.removeLoader();
    }
  }

  createLoader() {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }

  removeLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
  }
}

export const loadingService = new LoadingService();
