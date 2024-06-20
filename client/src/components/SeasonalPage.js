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
  const expiryDate = location.state && location.state.expiryDate;
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const navigate = useNavigate();
  const [dataFetched, setDataFetched] = useState(false);


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
            throw new Error('Error fetching seasonal pictures');
          }
          return response.json();
        })
        .then((data) => {
          setActivityData(data);
          setDataFetched(true);
        })
        .catch((error) => {
          setDataFetched(true);
        });
    }

    if (location.state && location.state.activities) {
      fetchSeasonalPictures();
    } else {
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
      {expiryDate &&(
        <div className="expiry-date">
          <p>画像の閲覧ダウンロードは {expiryDate}までとなります。</p>
        </div>
      )}
      {/* Check if activityData is empty */}
      {dataFetched && activityData.length === 0 && (
        <div className="no-content-message">
          <br /><br /><br />
          There don't seem to be any photos available right now, please check later.
        </div>
      )}
      {activityData.map((activity, index) => (

        <div key={index} className="activity-section" id={`activity-${activity.date.replace(/[^a-zA-Z0-9-_]/g, '-')}`}>
          <p>Date: {activity.date}</p>
          <p>{activity.name}</p>

          <div>
            <div className="thumbnails">
              {activity.files.map((file, fileIndex) => (
                <div key={fileIndex} className="thumbnail">
                  <div className="image-container">
                    <img
                      src={file.thumbnailUrl}
                      alt={`Thumbnail ${fileIndex}`}
                      onClick={() => { setSelectedImageIndex(fileIndex); setSelectedActivityIndex(index); }}
                      onError={(e) => {
                        e.target.src = file.thumbnailUrl;
                      }}
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
                renderItem: () => (
                  <iframe
                    src={`https://drive.google.com/file/d/${file.id}/preview`}
                    title={`Embedded iframe - ${file.name}`}
                    className="custom-iframe"
                  ></iframe>
                ),
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