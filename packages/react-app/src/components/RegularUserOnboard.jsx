import React, { useState, useEffect } from "react";
import { Button, Form } from "antd";
import { useHistory } from "react-router-dom";

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
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
  
    history.replace("/RegularUserOnboard");
    localStorage.removeItem("walletAddress");

    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const modalButtons = [];
  if (web3Modal.cachedProvider) {
    modalButtons.push(
      <Form.Item>
        <Button onClick={logoutOfWeb3Modal}>Logout</Button>
      </Form.Item>,
      <Form.Item>
        <Button type="primary" onClick={routeChange}>
          User Dashboard
        </Button>
      </Form.Item>,
    );
  } else {
    modalButtons.push(
      <Form.Item>
        <Button type="primary" onClick={loadWeb3Modal}>
          Connect
        </Button>
      </Form.Item>,
    );
  }

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout="horizontal">
          <Form.Item>
            <h2>Onboard</h2>
          </Form.Item>
          {modalButtons}
        </Form>
      </div>
    </div>
  );
}