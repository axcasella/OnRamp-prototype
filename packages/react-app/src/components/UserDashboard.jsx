import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";

export default function UserDashboard() {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Decoded: ", jwtDecode(token));

    if (token) {
      const loggedInUser = jwt.decode(token);
      if (!loggedInUser) {
        localStorage.removeItem("token");
        history.replace("/login");
      } else {
        // populate user dashboard
        console.log("show dashboard");
        alert("show dashboard");
      }
    } else {
        console.log("no token found");
        alert("no token");
    }
  }, [location.pathname]);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <p>Logged In</p>
      </div>
    </div>
  );
}
