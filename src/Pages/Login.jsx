import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import './Login.css';  

const Login = ({ setToken }) => {
  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    Email: '',
    Password: ''
  });

  function handleChange(event) {
    setFormData(prevFormData => ({
      ...prevFormData,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.Email.trim() === '' || formData.Password.trim() === '') {
      alert('Please fill in both Email and Password.');
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.Email,
        password: formData.Password,
      });

      if (error) throw error;
      setToken(data);
      navigate('/Homepage');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            name="Email"
            type="email"
            onChange={handleChange}
            value={formData.Email}
          />

          <input
            placeholder="Password"
            name="Password"
            type="password"
            onChange={handleChange}
            value={formData.Password}
          />
          <button type="submit">Log In</button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Create One</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
