import React, { useState, useEffect } from "react";
import { Button, Form } from "antd";
import { useHistory } from "react-router-dom";

export default function EndUserOnboard({ web3Modal, loadWeb3Modal, userSigner }) {
  const history = useHistory();
  const [address, setAddress] = useState();

  const routeChange = () => {
    history.replace("/EndUserDashboard");
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

    history.replace("/EndUserOnboard");
    localStorage.removeItem("walletAddress");

    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const modalButtons = [];
  if (web3Modal.cachedProvider) {
    modalButtons.push(
      <>
        <Form.Item>
          <h2>Your Dashboard</h2>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={routeChange}>
            Let's Go
          </Button>
        </Form.Item>
      </>,
    );
  } else {
    modalButtons.push(
      <>
        <Form.Item>
          <h2>Connect Your Wallet</h2>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={loadWeb3Modal}>
            Connect
          </Button>
        </Form.Item>
      </>,
    );
  }

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <Form labelCol={{ span: 4 }} layout="horizontal">
          {modalButtons}
        </Form>
      </div>
    </div>
  );
}
