import React, { useEffect, useState } from "react";
import { Button, Card, Input, List, Menu } from "antd";
import { BrowserRouter, Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import { useContractLoader, useContractReader, useEventListener, useGasPrice, useUserSigner } from "../hooks";
import { Address, AddressInput, Contract } from ".";
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
    console.log(file.path);
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

export default function UserDashboard() {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  console.log("Mainnet provider ", mainnetProvider);

  const history = useHistory();
  const location = useLocation();

  const [route, setRoute] = useState();
  const [address, setAddress] = useState();

  const [injectedProvider, setInjectedProvider] = useState();
  const userSigner = useUserSigner(injectedProvider, localProvider);

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

  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
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
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
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
    console.log("Decoded: ", jwtDecode(token));

    if (token) {
      const loggedInUser = jwt.decode(token);
      if (!loggedInUser) {
        localStorage.removeItem("token");
        history.replace("/login");
      } else {
        // populate user dashboard
        console.log("show dashboard");
      }
    } else {
      console.log("no token found");
      alert("no token");
    }
  }, [location.pathname]);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/userDashboard/nft_badges">
            <Link
              onClick={() => {
                setRoute("/userDashboard/nft_badges");
              }}
              to="/userDashboard/nft_badges"
            >
              NFT Badges
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/transfers">
            <Link
              onClick={() => {
                setRoute("/userDashboard/transfers");
              }}
              to="/userDashboard/transfers"
            >
              Transfers
            </Link>
          </Menu.Item>
          <Menu.Item key="/userDashboard/ipfsdown">
            <Link
              onClick={() => {
                setRoute("/userDashboard/ipfsdown");
              }}
              to="/userDashboard/ipfsdown"
            >
              IPFS Download
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

        <Button onClick={() => console.log("clicked")}>Mint</Button>

        <Switch>
          <Route path="/userDashboard/nft_badges">
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} alt="NFT badge" />
                        </div>
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner:{" "}
                        <Address
                          address={item.owner}
                          ensProvider={mainnetProvider}
                          blockExplorer={blockExplorer}
                          fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/userDashboard/transfers">
            <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={transferEvents}
                renderItem={item => {
                  return (
                    <List.Item key={item[0] + "_" + item[1] + "_" + item.blockNumber + "_" + item[2].toNumber()}>
                      <span style={{ fontSize: 16, marginRight: 8 }}>#{item[2].toNumber()}</span>
                      <Address address={item[0]} ensProvider={mainnetProvider} fontSize={16} /> =&gt;
                      <Address address={item[1]} ensProvider={mainnetProvider} fontSize={16} />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/userDashboard/ipfsdown">
            <div style={{ paddingTop: 32, width: 740, margin: "auto" }}>
              <Input
                value={ipfsDownHash}
                placeholder="IPFS hash (like QmadqNw8zkdrrwdtPFK1pLi8PPxmkQ4pDJXY8ozHtz6tZq)"
                onChange={e => {
                  setIpfsDownHash(e.target.value);
                }}
              />
            </div>
            <Button
              style={{ margin: 8 }}
              loading={sending}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log("DOWNLOADING...", ipfsDownHash);
                setDownloading(true);
                setIpfsContent();
                const result = await getFromIPFS(ipfsDownHash); // addToIPFS(JSON.stringify(yourJSON))
                if (result && result.toString) {
                  setIpfsContent(result.toString());
                }
                setDownloading(false);
              }}
            >
              Download from IPFS
            </Button>

            <pre style={{ padding: 16, width: 500, margin: "auto", paddingBottom: 150 }}>{ipfsContent}</pre>
          </Route>

            {/*
                <Contract/> component will automatically parse your ABI and give you a form to interact with it locally
            */}

          <Route path="/userDashboard/debugcontracts">
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
    </div>
  );
}
