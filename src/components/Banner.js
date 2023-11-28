import React from 'react';
import '../styles/Banner.css';
import bannerIcon from '../images/banner-icon.svg';
import { useLocation } from 'react-router-dom';

function Banner() {
  const location = useLocation();
  const foundSchool = location.state && location.state.foundSchool;
  console.log("foundSchool:", foundSchool);

  return (
    <header className="banner">
      <div className="banner-content">
        {foundSchool && <div className="found-school">{foundSchool}</div>}

        <svg
          xmlns="http://www.w3.org/2000/svg" // Correct xmlns value
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="logo-icon"
        >
        </svg>
        <img src={bannerIcon} alt="Logo Icon" className="logo-icon" />
      </div>
    </header>
  );
}

export default Banner;
