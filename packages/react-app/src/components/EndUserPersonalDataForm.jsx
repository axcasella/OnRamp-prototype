import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Form, Input } from "antd";

export default function EndUserPersonalDataForm() {
  const history = useHistory();

  const walletAddress = localStorage.getItem("walletAddress");

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [ssn, setSSN] = useState("");

  const [submittedData, setSubmittedData] = useState(false);

  const mintNFTBadge = async () => {
    const response = await fetch("http://localhost:8000/api/mint_kyc_nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        country,
      }),
    });

    const data = await response.json();
    if (data.status === "minted") {
        console.log("Minted badge");
    } else {
        alert("Failed to mint badge");
    }
  };

  const onboardUserWithKYC = async event => {
    event.preventDefault();

    const response = await fetch("http://localhost:8000/api/onboardUserWithKYC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        birthdate,
        country,
        address,
        state,
        city,
        zip,
        ssn,
        phone,
        walletAddress,
      }),
    });

    const data = await response.json();
    if (data.status === "ok") {
      console.log("onboard ok");
      try {
        await mintNFTBadge();
        console.log("mint ok");

        setSubmittedData(true);
      } catch (err) {
        console.log("mint failed", err);
      }
    } else {
      alert("User onboarding failed");
      console.log("User onboarding failed", data);
    }
  };

  const checkIfUserSubmitted = async () => {
    console.log("checking for wallet: ", walletAddress);
    const response = await fetch(`http://localhost:8000/api/getUserEncryptedKYCData/walletAddress/${walletAddress}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 200 && data) {
      setSubmittedData(true);
    }
  };

  useEffect(() => {
    checkIfUserSubmitted();
  }, [walletAddress]);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      {submittedData ? (
        <div>
          <h3 style={{ marginBottom: 0, color: "#2caad9" }}>👋 {walletAddress}</h3>
          <br />
          <h3>✅ You have successfully validated with OnRamp! </h3>
          <h3>🌐 Now you get instant access to all of our partners as an OnRamp network participant.</h3>
        </div>
      ) : (
        <>
          <h2 style={{ marginLeft: 30 }}>📝 Share Your Data Once and Never Again</h2>
          <Form size="large" labelCol={{ span: 6 }} layout="horizontal">
            <Form.Item label="Your Address: ">
              <h3 style={{ marginBottom: 0, marginLeft: 10, color: "#2caad9", textAlign: "left" }}>{walletAddress}</h3>
            </Form.Item>
            <Form.Item label="First Name">
              <Input
                type="text"
                placeholder="First name"
                value={firstname}
                onChange={e => setFirstName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Last Name">
              <Input type="text" placeholder="Last name" value={lastname} onChange={e => setLastName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Email">
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Item>
            <Form.Item label="Phone Number">
              <Input
                type="tel"
                placeholder="Format: 123-456-7890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Birthdate">
              <Input type="date" value={birthdate} onChange={e => setBirthDate(e.target.value)} />
            </Form.Item>
            <Form.Item label="SSN">
              <Input type="text" placeholder="SSN" value={ssn} onChange={e => setSSN(e.target.value)} />
            </Form.Item>
            <Form.Item label="Address">
              <Input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
            </Form.Item>
            <Form.Item label="City">
              <Input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
            </Form.Item>
            <Form.Item label="State">
              <Input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} />
            </Form.Item>
            <Form.Item label="Country">
              <Input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
            </Form.Item>
            <Form.Item label="Zip Code">
              <Input
                type="text"
                placeholder="Zip code"
                value={zip}
                onChange={e => setZip(e.target.value)}
                pattern="[0-9]*" />
            </Form.Item>
            <Form.Item>
              <Button onClick={onboardUserWithKYC} shape="round" size="large" type="default">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
}
