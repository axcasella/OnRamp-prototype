import React, { useEffect, useState } from "react";
import { Menu } from "antd";
import { BrowserRouter, Link, Route, Switch, useHistory } from "react-router-dom";
import { useContractLoader } from "../hooks";
import { Contract, Account, EndUserPersonalDataForm, EndUserPersonalData, EndUserConsentRequests, EndUserNFTBadges } from ".";
import { INFURA_ID, NETWORKS } from "../constants";

const { ethers } = require("ethers");

const targetNetwork = NETWORKS.matic;
const blockExplorer = targetNetwork.blockExplorer;

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🛰 providers
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

export default function EndUserDashboard({ web3Modal, loadWeb3Modal, userSigner }) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const history = useHistory();
  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
  
    history.replace("/EndUserOnboard");
    localStorage.removeItem("walletAddress");

    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const [route, setRoute] = useState();
  const [address, setAddress] = useState();

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
        localStorage.setItem("walletAddress", newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  return (
    <div style={{ width: 1400, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/endUserDashboard/EndUserPersonalDataForm">
            <Link
              onClick={() => {
                setRoute("/endUserDashboard/EndUserPersonalDataForm");
              }}
              to="/endUserDashboard/EndUserPersonalDataForm"
            >
              Enter KYC
            </Link>
          </Menu.Item>
          <Menu.Item key="/endUserDashboard/EndUserPersonalData">
            <Link
              onClick={() => {
                setRoute("/endUserDashboard/EndUserPersonalData");
              }}
              to="/endUserDashboard/EndUserPersonalData"
            >
              My KYC Info
            </Link>
          </Menu.Item>
          <Menu.Item key="/endUserDashboard/nft_badges">
            <Link
              onClick={() => {
                setRoute("/endUserDashboard/nft_badges");
              }}
              to="/endUserDashboard/nft_badges"
            >
              My Badges
            </Link>
          </Menu.Item>
          <Menu.Item key="/endUserDashboard/EndUserConsentRequests">
            <Link
              onClick={() => {
                setRoute("/endUserDashboard/EndUserConsentRequests");
              }}
              to="/endUserDashboard/EndUserConsentRequests"
            >
              My Consent Requests
            </Link>
          </Menu.Item>
          <Menu.Item key="/endUserDashboard/debugcontracts">
            <Link
              onClick={() => {
                setRoute("/endUserDashboard/debugcontracts");
              }}
              to="/endUserDashboard/debugcontracts"
            >
              Debug Contracts
            </Link>
          </Menu.Item> 
        </Menu>
        
        <Switch>
          <Route exact path={["/endUserDashboard", "/endUserDashboard/EndUserPersonalDataForm"]}>
            <EndUserPersonalDataForm />
          </Route>
          <Route exact path="/endUserDashboard/EndUserPersonalData">
            <EndUserPersonalData />
          </Route>
          <Route exact path="/endUserDashboard/EndUserConsentRequests">
            <EndUserConsentRequests />
          </Route>
          <Route exact path="/endUserDashboard/nft_badges">
            <EndUserNFTBadges readContracts={readContracts} walletAddress={address} />
          </Route>

            {/*
                <Contract/> component will automatically parse your ABI and give you a form to interact with it locally
            */}

          <Route exact path="/endUserDashboard/debugcontracts">
            <Contract
              name="YourCollectible"
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* account and wallet */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          // price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}
