import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Banner.css';
import bannerIcon from '../images/banner-icon.svg';
import Select from 'react-select';


function Banner({foundSchool, activityData, navigateToSection}) {
  const [selectedDate, setSelectedDate,] = useState('');
  const navigate = useNavigate();

  //custom selector to allow styling
  const options = activityData
    ? activityData.map((activity, index) => ({
        value: activity.date,
        label: activity.date,
      }))
    : [];
  const handleChange = (selectedOption) => {
    setSelectedDate(selectedOption);
    if (selectedOption) {
      // navigate to the correct activity and remove kanji cuz it cant fit in URL
      navigateToSection(`activity-${selectedOption.value.replace(/[^a-zA-Z0-9-_]/g, '-')}`);
    }
  };

  return (
    <div className="banner">
      <div className="banner-content">
      {foundSchool && <div className="found-school">{foundSchool}</div>}
      </div>     
        <img src={bannerIcon} alt="Logo Icon" className="logo-icon" />
      {/* Conditionally render the date selector */}
      {activityData && activityData.length > 0 && (
  <Select
    value={selectedDate}
    onChange={handleChange}
    options={options}
    placeholder="日付を選択"
    isSearchable={false}
    className="react-select-container"
  />
)}
    </div>
  );
}

export default Banner;
