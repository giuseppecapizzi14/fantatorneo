// Funzione per ottimizzare il caricamento delle immagini
export const getOptimizedImageUrl = (url, width = 300) => {
  // Se l'URL è già ottimizzato o non è valido, restituiscilo così com'è
  if (!url || url.includes('placeholder') || url.startsWith('data:')) {
    return url;
  }
  
  // Altrimenti, aggiungi parametri per l'ottimizzazione
  // Questo esempio funziona con servizi come Cloudinary o Imgix
  // Adatta secondo il tuo servizio di hosting immagini
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  
  return url;
};

// Funzione per il lazy loading delle immagini
export const setupLazyLoading = () => {
  if ('loading' in HTMLImageElement.prototype) {
    // Il browser supporta il lazy loading nativo
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.loading = 'lazy';
    });
  } else {
    // Fallback per browser che non supportano il lazy loading nativo
    // Puoi implementare una soluzione basata su Intersection Observer
  }
};