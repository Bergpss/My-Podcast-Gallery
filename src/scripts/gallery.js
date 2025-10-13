export function bootstrapGallery() {
  const app = document.getElementById('app');
  if (!app) {
    console.warn('Gallery root not found');
    return;
  }
  app.dataset.state = 'placeholder';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapGallery);
} else {
  bootstrapGallery();
}
