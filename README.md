# OnRamp prototype app  

> Build, mint, and send ERC721 NFT on Polygon  

Required: [Node](https://nodejs.org/dist/latest-v16.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) and [Git](https://git-scm.com/downloads)

```
git clone git@github.com:axcasella/OnRamp-prototype.git 
```

Get your own Infura project ID and secret from [Infura](https://infura.io/dashboard). Plug in ID and secret into `INFURA_ID` and `INFURA_SECRET` in `packages/react-app/src/constants.js`. **Please do not use mine!**

```
yarn install
```

Currently, the network is pointing to `matic`. This can be changed by updating `defaultNetwork` in `packages/hardhat/hardhat.config.js`:

 
Generate a **deployer** account:

```
yarn generate
```

This will create a new mnemonic. Next run this command to see the deployer address and account balances for networks.

```
yarn account
```

Need to make sure we have MATIC for the testnet. Go to https://faucet.matic.network to get some Mumbai-MATIC.

Once the account has the funds needed for the rest of the tutorial: (check on https://mumbai.polygonscan.com)

> Compile and deploy smart contract:

```
yarn deploy
```

By default, the React frontend is also pointing to `mumbai` testnet. This is set by the `targetNetwork` variable in `packages/react-app/src/App.jsx`:

Once deployment is done. Start the React app with

```
yarn start
```

📱 Open http://localhost:3000 to see the app

---

