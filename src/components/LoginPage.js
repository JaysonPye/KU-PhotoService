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
    const handleSubmit = (e) => {
      e.preventDefault();
      setLoading(true);
  
      const url = 'http://localhost:5000/'; // TODO: Replace with the actual endpoint
  
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `code=${code}`,
      })
        .then((response) => {
          if (response.ok) {
            console.log('Login successful');
            response.json().then((data) => {
              console.log("foundSchool:", data.school);

              navigate(`/pictures/${data.folder_id}`, { state: { foundSchool: data.school } });
            });
          } else {
            console.error('Login failed');
            setErrorMessage('コードが間違っています');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setErrorMessage('An error occurred. Please try again later.');
        })
        .finally(() => {
          setTimeout(() => {
            setErrorMessage(''); // Clear error message after 3 seconds
          }, 3000);
          setLoading(false); // Set loading to false after the request (success or failure)
        });
  
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
            {loading && <div className="spinner"></div>}
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