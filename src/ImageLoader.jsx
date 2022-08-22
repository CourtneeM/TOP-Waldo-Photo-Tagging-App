import { useEffect, useState } from "react";

function ImageLoader({ sceneImage }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) return;
    if (sceneImage) setImageLoaded(true);
  });

  const generateBox = (e) => {
    const selectionBox = document.getElementById('selection-box');

    selectionBox.style.display = 'block';
    if (e.nativeEvent) {
      selectionBox.style.top = `${(e.nativeEvent.offsetY) - 30}px`;
      selectionBox.style.left = `${(e.nativeEvent.offsetX) - 30}px`;
    } else {
      selectionBox.style.top = `${(e.offsetY) - 30}px`;
      selectionBox.style.left = `${(e.offsetX) - 30}px`;
    }
  }

  return (
    <div>
      {
        imageLoaded ?
          <img src={sceneImage} alt="game scene" onClick={(e) => generateBox(e)} /> :
          <p>Loading Scene...</p>
      }
    </div>
  )
}

export default ImageLoader;