import React, { useState } from "react";
import { Button, Form, Input, InputNumber } from "antd";

export default function EnterpriseUserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginEnterpriseUser = async event => {
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
      window.location.href = "/EnterpriseUserDashboard";
    } else {
      localStorage.removeItem("token");
      alert("login failed");
    }
  };

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <Form size="large" labelCol={{ span: 6 }} layout="horizontal">
        <Form.Item>
          <h2>Enterprise User login</h2>
        </Form.Item>
        <Form.Item label="Email">
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Item>
        <Form.Item label="Password">
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button onClick={loginEnterpriseUser} shape="round" size="large" type="default">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
