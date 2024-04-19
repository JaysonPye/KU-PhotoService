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

  //Styles for the selector, doesnt work in css
  const customStyles = {
    control: (provided ) => ({
      ...provided,
      fontWeight: 'bold',
      color: '#EF8200',
      paddingLeft: '30px',
      borderRadius: '30px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#EF8200', 
    }),

    option: (provided, state ) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgba(255, 165, 0, 0.3)' : 'inherit',
      '&:hover': { backgroundColor: state.isSelected ? 'rgba(255, 165, 0, 0.3)' : 'rgb(255, 165, 0, 0.5)' },
      color: '#EF8200', 
      fontWeight: 'bold',
      right: '20px',
      borderRadius: '20px',
      
    }),
    menu: (provided) => ({
      ...provided,
      color: '#EF8200', 
      border: '2px solid #EF8200', 
      borderRadius: '30px',
      right: '20px',
    }),
    singleValue: provided =>({
      ...provided,
      color: '#EF8200',
    })
    
  };
  return (
    <div className="banner">
      <div className="banner-content">
      {foundSchool && <div className="found-school">{foundSchool}</div>}
      </div>     
        <img src={bannerIcon} alt="Logo Icon" className="logo-icon" />
      {/* conditionally render the date selector */}
      {activityData && activityData.length > 0 && (
  <div className="select-container">
  <Select
    value={selectedDate}
    onChange={handleChange}
    options={options}
    placeholder={<div className="select-placeholder-text">日付を選択</div>}
    isSearchable={false}
    className="react-select-container"
    classNamePrefix="custom-select"
    styles={customStyles}
  />
  </div>
)}
    </div>
  );
}

export default Banner;
