import React, { useState } from "react";
import Select from "react-select";

export default function PersonalDataForm() {
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

  const mintNFTBadge = async () => {
    const response = await fetch("http://localhost:8000/api/mint_kyc_nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
      }),
    });

    const data = await response.json();
    if (data.status === "minted") {
        console.log("Minted badge");
    } else {
        alert("Failed to mint badge failed");
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
        console.log("ok");
    } else {
        alert("User onboarding failed");
    }

    await mintNFTBadge(walletAddress);
  };

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <div>
        <form onSubmit={onboardUserWithKYC}>
            <p>Wallet Address: {walletAddress}</p>
          <input type="text" placeholder="First name" value={firstname} onChange={e => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last name" value={lastname} onChange={e => setLastName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input
            type="tel"
            placeholder="Phone number (format: 123-456-7890)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <input type="date" placeholder="Birth date" value={birthdate} onChange={e => setBirthDate(e.target.value)} />
          <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
          <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
          <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} />
          <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          <input
            type="text"
            placeholder="Zip code"
            value={zip}
            onChange={e => setZip(e.target.value)}
            pattern="[0-9]*"
          />
          <input type="text" placeholder="SSN" value={ssn} onChange={e => setSSN(e.target.value)} />

          <input type="submit" value="Register" />
        </form>
      </div>
    </div>
  );
}
