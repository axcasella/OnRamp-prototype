import { Alert, Button, Menu } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { BrowserRouter, Route, Switch, Link, useHistory } from "react-router-dom";
import "./App.css";
import { EnterpriseUserLogin, EnterpriseUserRegister, RegularUserOnboard, UserDashboard, EnterpriseDashboard, Header, EnterpriseViewKYCData } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { useExchangePrice, useUserSigner } from "./hooks";

const { ethers } = require("ethers");

const targetNetwork = NETWORKS.matic;

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);
console.log("LOCAL PROVIDER: ", localProvider);

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

function App() {
  const history = useHistory();

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [route, setRoute] = useState();

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  // const price = useExchangePrice(targetNetwork, mainnetProvider);

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider, localProvider);
  console.log("USER SIGNER: ", userSigner);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);
                    const tx = await ethereum.request({ method: "wallet_addEthereumChain", params: data }).catch();
                    if (tx) {
                      console.log(tx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", left: 20, top: 40, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    const logoutOfWeb3Modal = async () => {
      await web3Modal.clearCachedProvider();

      history.replace("/RegularUserOnboard");
      localStorage.removeItem("walletAddress");

      setTimeout(() => {
        window.location.reload();
      }, 1);
    };

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);
  return (
    <div className="App">
      <Header />
      {networkDisplay}

      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/EnterpriseUserRegister">
            <Link
              onClick={() => {
                setRoute("/EnterpriseUserRegister");
              }}
              to="/EnterpriseUserRegister"
            >
              Partner User Registration
            </Link>
          </Menu.Item>

          <Menu.Item key="/EnterpriseUserLogin">
            <Link
              onClick={() => {
                setRoute("/EnterpriseUserLogin");
              }}
              to="/EnterpriseUserLogin"
            >
              Partner User Login
            </Link>
          </Menu.Item>

          <Menu.Item key="/RegularUserOnboard">
            <Link
              onClick={() => {
                setRoute("/RegularUserOnboard");
              }}
              to="/RegularUserOnboard"
            >
              Regular User Onboarding
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/" component={EnterpriseUserLogin} />
          <Route exact path="/EnterpriseUserLogin" component={EnterpriseUserLogin} />
          <Route exact path="/EnterpriseUserRegister" component={EnterpriseUserRegister} />
          <Route
            exact
            path="/RegularUserOnboard"
            render={() => (
              <RegularUserOnboard web3Modal={web3Modal} loadWeb3Modal={loadWeb3Modal} userSigner={userSigner} />
            )}
          />
          <Route
            exact
            path="/userDashboard"
            render={() => <UserDashboard web3Modal={web3Modal} loadWeb3Modal={loadWeb3Modal} userSigner={userSigner} />}
          />
          <Route exact path="/EnterpriseDashboard" render={() => <EnterpriseDashboard />} />
          <Route exact path="/EnterpriseViewKYCData/:walletAddress" render={() => <EnterpriseViewKYCData />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
