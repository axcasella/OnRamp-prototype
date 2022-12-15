import React, { useEffect, useState } from "react";
import { Menu } from "antd";
import { BrowserRouter, Link, Route, Switch, useHistory } from "react-router-dom";
import { FormOutlined, FileProtectOutlined, SafetyCertificateOutlined, RocketOutlined } from "@ant-design/icons";
import { useContractLoader } from "../hooks";
import { Contract, Account, EndUserPersonalDataForm, EndUserPersonalData, EndUserNFTBadges } from ".";
import { INFURA_ID, NETWORKS } from "../constants";

const { SubMenu } = Menu;

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

  const [route, setRoute] = useState("/EndUserPersonalDataForm");
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
    <div>
      <div style={{ margin: "auto", marginTop: 0, paddingBottom: 32 }}>
        <BrowserRouter>
          <Menu style={{ width: 200 }} selectedKeys={[route]} mode="vertical">
            <SubMenu key="sub1" icon={<RocketOutlined />} title="Dashboard actions">
              <Menu.Item icon={<FormOutlined />} key="/EndUserPersonalDataForm">
                <Link
                  onClick={() => {
                    setRoute("/EndUserPersonalDataForm");
                  }}
                  to="/EndUserPersonalDataForm"
                >
                  Enter KYC
                </Link>
              </Menu.Item>
              <Menu.Item icon={<FileProtectOutlined />} key="/EndUserPersonalData">
                <Link
                  onClick={() => {
                    setRoute("/EndUserPersonalData");
                  }}
                  to="/EndUserPersonalData"
                >
                  My KYC Data
                </Link>
              </Menu.Item>
              <Menu.Item icon={<SafetyCertificateOutlined />} key="/NFTBadges">
                <Link
                  onClick={() => {
                    setRoute("/NFTBadges");
                  }}
                  to="/NFTBadges"
                >
                  My Badges
                </Link>
              </Menu.Item>
            </SubMenu>
          </Menu>

          <Switch>
            <Route
              exact
              path={["/EndUserDashboard", "/EndUserPersonalDataForm"]}
              render={() => <EndUserPersonalDataForm />}
            />
            {/* <Route exact path="/EndUserPersonalDataForm" render={() => <EndUserPersonalDataForm />} /> */}
            <Route exact path="/EndUserPersonalData" render={() => <EndUserPersonalData />} />
            <Route
              exact
              path="/NFTBadges"
              render={() => <EndUserNFTBadges readContracts={readContracts} walletAddress={address} />}
            />
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
    </div>
  );
}
