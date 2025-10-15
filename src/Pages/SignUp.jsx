import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client';
import './SignUp.css';   

const SignUp = () => {
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.Email,
        password: formData.Password,
        options: {
          data: {
            First_Name: formData.FirstName,
            Last_Name: formData.LastName,
          }
        }
      });

      if (error) throw error;
      alert('Check your email for verification link.');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <input 
            placeholder="First Name"
            name="FirstName"
            onChange={handleChange}
            value={formData.FirstName}
          />

          <input 
            placeholder="Last Name"
            name="LastName"
            onChange={handleChange}
            value={formData.LastName}
          />

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

          <button type="submit">Create Account</button>
        </form>

        <p>
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
