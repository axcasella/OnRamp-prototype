import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Select from "react-select";

export default function EnterpriseUserRegister() {
    const history = useHistory();

  // Registration form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(["admin", "staff"]);
  const handleRoleChange = e => {
    setRole(e.value);
  };

  // Dropdown select
  const options = [
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Non-admin Staff" },
  ];

  const registerUser = async event => {
    event.preventDefault();

    const response = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    const data = await response.json();
    if (data.status === "ok") {
        history.push("/login");
    } else {
        alert("Registration failed");
    }
  };

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>Enterprise User Register</h1>
        <form onSubmit={registerUser}>
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <Select options={options} onChange={e => handleRoleChange(e)} />
          <input type="submit" value="Register" />
        </form>
      </div>
    </div>
  );
}
