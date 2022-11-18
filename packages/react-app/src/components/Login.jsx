import React, { useEffect, useState } from "react";

function Login(props) {
  useEffect(() => {}, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>Login</h1>
        <form>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <input type="submit" value="Register" />
        </form>
      </div>
    </div>
  );
}

export default Login;
