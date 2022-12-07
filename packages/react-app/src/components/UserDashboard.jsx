import React, { useEffect, useState, useCallback } from "react";
import { Button, Card, Input, List, Menu } from "antd";
import { BrowserRouter, Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import jwt from "jsonwebtoken";
import { useContractLoader, useContractReader, useEventListener, useGasPrice, useUserSigner, useExchangePrice } from "../hooks";
import { Address, AddressInput, Contract, Account, PersonalDataForm, MyPersonalData, RegularUserConsentRequests, NFTBadges} from ".";
import { INFURA_ID, INFURA_SECRET, NETWORKS } from "../constants";
import { Transactor } from "../helpers";

const { ethers } = require("ethers");
const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");

const targetNetwork = NETWORKS.mumbai;
const blockExplorer = targetNetwork.blockExplorer;

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

const projectId = INFURA_ID;
const projectSecret = INFURA_SECRET;
const projectIdAndSecret = `${projectId}:${projectSecret}`;

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
  headers: {
    authorization: `Basic ${Buffer.from(projectIdAndSecret).toString("base64")}`,
  },
});

// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

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

  const [injectedProvider, setInjectedProvider] = useState();

  useEffect(() => {
    async function setProvider() {
      const provider = await web3Modal.connect();
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    }
    setProvider();
  }, []);

  // const price = useExchangePrice(targetNetwork, mainnetProvider);

  const [ipfsDownHash, setIpfsDownHash] = useState();
  const [sending, setSending] = useState();
  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();

  const [transferToAddresses, setTransferToAddresses] = useState({});

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);
  console.log("User dashboard readContracts", readContracts);

  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

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

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address]);
  // console.log("🤗 balance:", balance);

  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", localProvider, 1);

  useEffect(() => {
    console.log("address: ", address);
    console.log("yourBalance: ", yourBalance);
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("iteration", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
            console.log("--tokenURI: ", tokenURI);
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [address, yourBalance]);

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
            <NFTBadges localProvider={localProvider} />
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
