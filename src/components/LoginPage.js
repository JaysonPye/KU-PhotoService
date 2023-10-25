import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Spinner.css'; 
import '../styles/LoginPage.css';

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
              navigate(`/pictures/${data.folder_id}`);
            });
          } else {
            console.error('Login failed');
            setErrorMessage('Invalid login code. Please try again.');
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
      <div className="login-container">
        <div className="login-box">
          <h1>Login</h1>
          {loading && <div className="spinner"></div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="code">Code:</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <br />
            <br />
            <button className="login-button" type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }
  
  export default LoginPage;