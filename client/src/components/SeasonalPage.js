import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PicturesPage.css';
import Gallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import Banner from './Banner';
import { CustomCloseButton } from '../images/icons';

function SeasonalPage() {
  const location = useLocation();
  const foundSchool = location.state && location.state.foundSchool;
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {

    function fetchSeasonalPictures() {

      fetch('/api/seasonal-pictures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities: location.state.activities }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error('Error fetching seasonal pictures:', response.status);
            throw new Error('Error fetching seasonal pictures');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Seasonal Pictures:', data);
          setActivityData(data);
        })
        .catch((error) => {
          console.error('Error fetching seasonal pictures:', error);
        });
    }

    if (location.state && location.state.activities) {
      fetchSeasonalPictures();
    }else{
      navigate('/');
    }
  }, [location.state, navigate]);

//Navigates to the seasonal date clicked
const navigateToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const bannerHeight = document.querySelector('.banner').clientHeight;
    const offset = bannerHeight;
    const elementOffset = element.getBoundingClientRect().top + window.scrollY;
    const scrollToY = elementOffset - offset;
    window.scrollTo({ top: scrollToY, behavior: 'smooth' });
  }
};

  const handleDownload = (fileId) => {
    const link = document.createElement('a');
    link.href = `https://drive.google.com/uc?export=download&id=${fileId}`;
    link.download = '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <div className="pictures-container">
  {activityData ? (
    <Banner foundSchool={foundSchool} activityData={activityData} navigateToSection={navigateToSection} />
  ) : (
    <Banner foundSchool={foundSchool} />
  )}
  
      {/* render school name based on mobile view */}
      {window.innerWidth <= 768 && foundSchool && (
        <div className="mobile-school-info">
          <div className="mobile-school-name">{foundSchool}</div>
          <hr className="mobile-divider" />
        </div>
      )}
  {activityData.map((activity, index) => (
    
    <div key={index} className="activity-section" id={`activity-${activity.date.replace(/[^a-zA-Z0-9-_]/g, '-')}`}>
    <h2>{activity.name}</h2>
    <p>Date: {activity.date}</p>
    <div>
    <div className="thumbnails">
      {activity.files.map((file, fileIndex) => (
        <div key={fileIndex} className="thumbnail">
          <div className="image-container">
            <img
              src={file.thumbnailUrl}
              alt={`Thumbnail ${fileIndex}`}
              onClick={() => { setSelectedImageIndex(fileIndex); console.log(fileIndex);     setSelectedActivityIndex(index);}}
              
            />
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
  </div>
  
  </div>
))}
      {selectedImageIndex !== null && (
        <div className="modal-container">
          <div className="modal centered">
            <CustomCloseButton onClick={closeModal} className="close-button" />
            <button
              className="download-button"
              onClick={() => handleDownload(activityData[selectedActivityIndex].files[selectedImageIndex].id)}
            >
              DOWNLOAD
            </button>
            <Gallery
              items={activityData[selectedActivityIndex].files.map((file) => ({
                original: file.imageUrl,
                thumbnail: file.thumbnailUrl,
              }))}
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