import React, { useState, useCallback, useEffect } from "react";
import { Button } from "antd";
import { useHistory, Redirect } from "react-router-dom";

export default function RegularUserOnboard({ web3Modal, loadWeb3Modal, userSigner }) {
  const history = useHistory();
  const [address, setAddress] = useState();

  const routeChange = () => { 
    history.push("/userDashboard");
  };

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        console.log("New Address: ", newAddress);
        setAddress(newAddress);

        console.log("INSIDE User Dashboard userSigner 2", userSigner)
      }
    }
    getAddress();
    console.log("INSIDE User Dashboard userSigner 1", userSigner)

    console.log("Curr Address: ", address);
  }, [userSigner]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
  
    history.replace("/RegularUserOnboard");
  
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };
  
  const modalButtons = [];
  if (web3Modal.cachedProvider) {
    modalButtons.push(
      <Button
        key="logoutbutton"
        style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
        shape="round"
        size="large"
        onClick={logoutOfWeb3Modal}
      >
        logout
      </Button>,
      <Button color="primary" className="px-4" onClick={routeChange}>
        User Dashboard
      </Button>,
    );
  } else {
    modalButtons.push(
      <Button
        key="loginbutton"
        style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
        shape="round"
        size="large"
        /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
        onClick={loadWeb3Modal}
      >
        connect
      </Button>,
    );
  }

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <h1>Onboard</h1>
        {modalButtons}
      </div>
    </div>
  );
}