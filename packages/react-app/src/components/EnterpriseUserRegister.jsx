import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Form, Input, Select, InputNumber } from "antd";

export default function EnterpriseUserRegister() {
  const history = useHistory();

  // Registration form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState(["admin", "staff"]);
  const handleRoleChange = e => {
    setRole(e.value);
  };

  // Dropdown select
  const options = [
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
  ];

  const registerUser = async event => {
    event.preventDefault();

    const response = await fetch("http://localhost:8000/api/registerEnterpriseUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        org,
      }),
    });

    const data = await response.json();
    if (data.status === "ok") {
      history.push("/EnterpriseUserLogin");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <Form size="large" labelCol={{ span: 6 }} layout="horizontal" onSubmit={registerUser}>
        <Form.Item>
          <h2>Enterprise User Sign Up</h2>
        </Form.Item>
        <Form.Item label="Name">
          <Input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        </Form.Item>
        <Form.Item label="Email">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item label="Password">
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Item>
        <Form.Item label="Organization">
          <Input type="text" placeholder="Your company" value={org} onChange={e => setOrg(e.target.value)} />
        </Form.Item>
        <Form.Item label="Your role">
          <Select
            defaultValue="Select"
            style={{
              textAlign: "left",
              fontSize: "16px",
              fontFamily: "IBM Plex Mono",
              color: "grey",
            }}
            listHeight={250}
            onChange={e => handleRoleChange(e)}
            options={options}
          />
        </Form.Item>
        <Form.Item>
          <Button onClick={registerUser} shape="round" size="large" type="default">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
