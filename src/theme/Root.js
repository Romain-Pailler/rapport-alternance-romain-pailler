import React, { useEffect } from 'react';
import OriginalLayout from '@theme-original/Root';
import mediumZoom from 'medium-zoom';

export default function Root(props) {
  useEffect(() => {
    // On attend que les images markdown soient bien rendues
    const timeout = setTimeout(() => {
      const zoom = mediumZoom('article img:not(.no-zoom)', {
        margin: 24,
        background: '#000',
      });

      // Nettoyage en cas de rechargement du composant
      return () => zoom.detach();
    }, 500); // délai pour laisser le temps au DOM de se charger

    return () => clearTimeout(timeout);
  }, []);

  return <OriginalLayout {...props} />;
}
