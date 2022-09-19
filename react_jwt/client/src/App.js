import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      setUser(res.data);
      getUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function getUsers(user) {
    const res = await axios.get(`/users`, {
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
    });
    setUsers(res.data);
  }

  async function handleDelete(id) {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete(`/users/${id}`, {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  }

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    // do something for before request
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = `Bearer ${data.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  async function refreshToken() {
    try {
      const res = await axios.post(`/refresh`, { token: user.refreshToken });
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          {users.length === 0 && <span className="error">No users here!</span>}
          <span>Delete Users:</span>
          {users.map((u) => (
            <button
              key={u.id}
              className="deleteButton"
              onClick={() => handleDelete(u.id)}
            >
              Delete {u.username}
            </button>
          ))}
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Login Page</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
