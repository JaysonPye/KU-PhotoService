import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Banner.css';
import bannerIcon from '../images/banner-icon.svg';



function Banner({foundSchool, activityData, navigateToSection}) {
  const [selectedDate, setSelectedDate,] = useState('');
  const navigate = useNavigate();


  return (
    <div className="banner">
      <h1>{foundSchool}</h1>

      {/* Conditionally render the date selector */}
      {activityData && (
        <>
          <label htmlFor="date">Select a Date:</label>
          <select
  id="date"
  name="date"
  value={selectedDate}
  onChange={(e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
    console.log(`Navigating to section: activity-${selectedDate.replace(/[^a-zA-Z0-9-_]/g, '-')}`);
    if (selectedDate) {
      console.log(`Navigating to section: activity-${selectedDate.replace(/[^a-zA-Z0-9-_]/g, '-')}`);
      // navigate to the correct activity and remove kanji cuz it cant fit in URL
      navigateToSection(`activity-${selectedDate.replace(/[^a-zA-Z0-9-_]/g, '-')}`);

    }
  }}
>
  <option value="">Select</option>
  {activityData.map((activity, index) => (
    <option key={index} value={activity.date}>
      {activity.date}
    </option>
  ))}
</select>
        </>
      )}
    </div>
  );
}

export default Banner;
