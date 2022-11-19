import React, { useState } from "react";

export default function EnterpriseUserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async event => {
    event.preventDefault();

    const response = await fetch("http://localhost:8000/api/loginEnterpriseUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log("DATA: ", data);

    if (data.user) {
      localStorage.setItem("token", data.user);
      window.location.href = "/userDashboard";
    } else {
        localStorage.removeItem("token");
      alert("login failed");
    }
  };

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>Enterprise User Login</h1>
        <form onSubmit={loginUser}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
}
