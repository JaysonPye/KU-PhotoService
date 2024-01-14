import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/PicturesPage.css';
import Gallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import Banner from './Banner';
import { CustomCloseButton} from '../images/icons';


function PicturesPage() {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const location = useLocation();
  const foundSchool = location.state && location.state.foundSchool;

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
    // Make a GET request to /pictures endpoint with the folderId
    fetch(`/api/pictures?folder_id=${folderId}`)
      .then((response) => response.json())
      .then((data) => setFiles(data.files))
      .catch((error) => console.error('Error:', error));
  }, [folderId]);

  const images = files.map((file) => ({
// Render an iframe, height/width are in there for styling purposes in backend
    renderItem: () => (
      <iframe
        src={`https://drive.google.com/file/d/${file.id}/preview`}
        title={`Embedded iframe - ${file.name}`}
        className="custom-iframe"
      ></iframe>
    ),
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
      <Banner foundSchool={foundSchool} />

      {/* render school name based on mobile view */}
      {window.innerWidth <= 768 && foundSchool && (
        <div className="mobile-school-info">
          <div className="mobile-school-name">{foundSchool}</div>
          <hr className="mobile-divider" />
        </div>
      )}
      <div className="picture-list">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="thumbnail"
            onClick={() => setSelectedImageIndex(index)}
          >
            <div className="image-container">
            <img src={file.thumbnailUrl} alt={file.name} />
            </div>
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
          <CustomCloseButton onClick={closeModal} className="close-button" />
            <button
              className="download-button"
              onClick={() => handleDownload(files[selectedImageIndex].id)}
            >
              DOWNLOAD
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
