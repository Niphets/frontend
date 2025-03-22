import "../style/register.css";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({  email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BaseUrl}/register`, formdata);
      setMessage(response.data.message);
      console.log("User Registered Successfully");

      // Redirect to login or document page
      navigate("/login");
    } catch (err) {
      console.error(err.response.data.message);
      setMessage(err.response.data.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h3 className="text-center mb-3">Register</h3>
        <form onSubmit={handleRegister}>

          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={formdata.email}
              onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={formdata.password}
              onChange={(e) => setFormdata({ ...formdata, password: e.target.value })}
            />
          </div>
          {message && <div className="alert alert-info">{message}</div>}
          <button type="submit" className="btn btn-primary submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
