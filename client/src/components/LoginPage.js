import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Spinner.css'; 
import '../styles/LoginPage.css';
import loginImage from '../images/home-img-1.jpg';
import Banner from './Banner';

function LoginPage() {
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // Handles login submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });
  
        if (response.ok) {
          const data = await response.json();
  
          if (data.activities) {
            // It's a seasonal login with activities
            navigate(`/seasonal-pictures`, {
              state: { activities: data.activities, foundSchool: data.school },
            });
          } else if (data.folder_id) {
            // party page
            navigate(`/pictures/${data.folder_id}`, {
              state: { foundSchool: data.school },
            });
          } else {
            // Handle any other type of response
            console.error('Unknown response type');
          }
        } else {
          console.error('Login failed');
          setErrorMessage('コードが間違っています');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('An error occurred. Please try again later.');
      } finally {
        setTimeout(() => {
          setErrorMessage(''); // Clear error message after 3 seconds
        }, 3000);
        setLoading(false); // Set loading to false after the request (success or failure)
      }
  
      setCode('');
    };
  
    return (
      <div className="login-page-container">
        <Banner />
      <div className="login-container">

        <div className="login-box">
          <div className="login-content">
            <h1>Welcome back,</h1>
            <h2>パスワード</h2>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="code"></label>
              <input
                type="password"
                id="code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="login-input"
                
              />
              <br />
              <br />
                          {loading && <div className="spinner"></div>}
              <button className="login-button" type="submit">
                ログイン
              </button>
            </form>
          </div>
          <div className="login-image-container">
            <img src={loginImage} alt="Login Image" className="login-image" />
          </div>
        </div>
      </div>
      </div>
    );
  }
  
  export default LoginPage;