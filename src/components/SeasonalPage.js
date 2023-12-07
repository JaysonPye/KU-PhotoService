import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/PicturesPage.css';
import Gallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import Banner from './Banner';
import { CustomCloseButton,CustomRightArrow,CustomLeftArrow } from '../images/icons';


function SeasonalPage() {
  const location = useLocation();
  const foundSchool = location.state && location.state.foundSchool;
  const [activities, setActivities] = useState([]);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activityData, setActivityData] = useState([]); 
  console.log('Initial activities:', location.state && location.state.activities);

  useEffect(() => {
    // Check if activities data is available in the location state
    if (location.state && location.state.activities) {
      const activityData = location.state.activities;
      console.log('Activity Data:', activityData);
      setActivityData(activityData);
    }
  }, [location.state]);

  async function fetchPicturesForActivity(folderId) {
    try {
      const response = await fetch(`/pictures?folder_id=${folderId}`);
      
      if (!response.ok) {
        console.error('Error fetching pictures:', response.status);
        return [];
      }
  
      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error fetching pictures:', error);
      return [];
    }
  }

  
  const handleDownload = (fileId) => {
    const link = document.createElement('a');
    link.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
      <Banner foundSchool={foundSchool} />

      {/* render school name based on mobile view */}
      {window.innerWidth <= 768 && foundSchool && (
        <div className="mobile-school-info">
          <div className="mobile-school-name">{foundSchool}</div>
          <hr className="mobile-divider" />
        </div>
      )}
    {/* Map through activityData and render names and dates */}
    {activityData.map((activity, index) => (
      <div key={index} className="activity-section">
        <h2>{activity.name}</h2>
        <p>Date: {activity.date}</p>
        {images.length > 0 && (
            <div>
              <button onClick={() => handleDownload(files[selectedImageIndex].id)}>
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
          )}
        </div>
      ))}
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

export default SeasonalPage;