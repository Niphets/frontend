import "../style/login.css"
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BaseUrl}/login`, formdata);
      alert("Login successful");
      navigate("/document");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={formdata.email}
            onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={formdata.password}
            onChange={(e) => setFormdata({ ...formdata, password: e.target.value })}
          />
          <button type="submit" className="btn btn-primary submit-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
