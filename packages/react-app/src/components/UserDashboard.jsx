import React, { useEffect, useState } from "react";
import { Menu } from "antd";
import { BrowserRouter, Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import jwt from "jsonwebtoken";
import { useContractLoader } from "../hooks";
import { Contract, Account, PersonalDataForm, MyPersonalData, RegularUserConsentRequests, NFTBadges} from ".";
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

export default function UserDashboard({ web3Modal, loadWeb3Modal, userSigner }) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const history = useHistory();
  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
  
    history.replace("/RegularUserOnboard");
    localStorage.removeItem("walletAddress");

    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const location = useLocation();

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const loggedInUser = jwt.decode(token);
      if (!loggedInUser) {
        localStorage.removeItem("token");
        history.replace("/EnterpriseUserLogin");
      } else {
        // populate user dashboard
        console.log("show dashboard for address ", address);
      }
    } else {
      console.log("no token found");
      alert("no token");
    }
  }, [location.pathname]);

  return (
    <div style={{ width: 1400, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/userDashboard/personalDataForm">
            <Link
              onClick={() => {
                setRoute("/userDashboard/personalDataForm");
              }}
              to="/userDashboard/personalDataForm"
            >
              Enter KYC
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/MyPersonalData">
            <Link
              onClick={() => {
                setRoute("/userDashboard/MyPersonalData");
              }}
              to="/userDashboard/MyPersonalData"
            >
              My KYC Info
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/nft_badges">
            <Link
              onClick={() => {
                setRoute("/userDashboard/nft_badges");
              }}
              to="/userDashboard/nft_badges"
            >
              My Badges
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/RegularUserConsentRequests">
            <Link
              onClick={() => {
                setRoute("/userDashboard/RegularUserConsentRequests");
              }}
              to="/userDashboard/RegularUserConsentRequests"
            >
              My Consent Requests
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/debugcontracts">
            <Link
              onClick={() => {
                setRoute("/userDashboard/debugcontracts");
              }}
              to="/userDashboard/debugcontracts"
            >
              Debug Contracts
            </Link>
          </Menu.Item> 
        </Menu>
        
        <Switch>
          <Route exact path={["/userDashboard", "/userDashboard/personalDataForm"]}>
            <PersonalDataForm />
          </Route>
          <Route exact path="/userDashboard/MyPersonalData">
            <MyPersonalData />
          </Route>
          <Route exact path="/userDashboard/RegularUserConsentRequests">
            <RegularUserConsentRequests />
          </Route>
          <Route exact path="/userDashboard/nft_badges">
            <NFTBadges readContracts={readContracts} />
          </Route>

            {/*
                <Contract/> component will automatically parse your ABI and give you a form to interact with it locally
            */}

          <Route exact path="/userDashboard/debugcontracts">
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
