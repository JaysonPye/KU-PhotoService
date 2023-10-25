import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/PicturesPage.css';
import Gallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

function PicturesPage() {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleDownload = (fileId) => {
    const link = document.createElement('a');
    link.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    console.log('Fetching pictures for folderId:', folderId);
    // Make a GET request to /pictures endpoint with the folderId
    fetch(`http://localhost:5000/pictures?folder_id=${folderId}`)
      .then((response) => response.json())
      .then((data) => setFiles(data.files))
      .catch((error) => console.error('Error:', error));
  }, [folderId]);

  const images = files.map((file) => ({
    original: file.imageUrl,
    thumbnail: file.thumbnailUrl,
  }));

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  // Add event listeners to close the modal on clicking off-screen or pressing Escape
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-container')) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="pictures-container">
      <div className="picture-list">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="thumbnail"
            onClick={() => setSelectedImageIndex(index)}
          >
            <img src={file.thumbnailUrl} alt={file.name} />
            <button
              className="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(file.id);
              }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
      {selectedImageIndex !== null && (
        <div className="modal-container">
          <div className="modal centered">
            <button className="close-button" onClick={closeModal}>
              X
            </button>
            <button
              className="download-button"
              onClick={() => handleDownload(files[selectedImageIndex].id)}
            >
              Download
            </button>
            <Gallery
              items={images}
              startIndex={selectedImageIndex}
              showIndex={false}
              showThumbnails={false}
              lazyLoad={true}
              showBullets={false}
              showFullscreenButton={false}
              showPlayButton={false}
              onClose={closeModal}
              onSlide={(currentIndex) => setSelectedImageIndex(currentIndex)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PicturesPage;
