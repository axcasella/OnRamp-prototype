# OnRamp prototype app 🟣 Mints NFT to Polygon 

> Build, mint, and send ERC721 NFT on Mumbai testnet / Polygon mainnet

Required: [Node](https://nodejs.org/dist/latest-v16.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) and [Git](https://git-scm.com/downloads)

```
git clone git@github.com:axcasella/OnRamp-prototype.git 
```

Get your own Infura project ID and secret from [Infura](https://infura.io/dashboard). Plug in ID and secret into `INFURA_ID` and `INFURA_SECRET` in `packages/react-app/src/constants.js`. **Please do not use mine!**

```
yarn install
```

Currently, the testnet is pointing to `mumbai`. This can be changed by updating `defaultNetwork` in `packages/hardhat/hardhat.config.js`:

 
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

### Minting:

> ✏️ Edit the mint script mint.js in packages/hardhat/scripts and update the `toAddress` to your frontend address (wallet address in the top right or localhost:3000).

![nft1](https://user-images.githubusercontent.com/526558/124386962-37e5dd00-dcb3-11eb-911e-0afce760d7ee.png)

> in a new terminal window run the mint script:
```
cd matic-nft-tutorial
yarn mint
```
![nft2](https://user-images.githubusercontent.com/526558/124386972-3d432780-dcb3-11eb-933e-dad7dfd313b2.png)

👀 You should see your collectibles show up on the frontend if you minted to the correct address:

![nft3](https://user-images.githubusercontent.com/526558/124386983-48965300-dcb3-11eb-88a7-e88ad6307976.png)

👛 Open an **incognito** window and navigate to http://localhost:3000 (You'll notice it has a new wallet address).

🎟 Send an NFT to the incognito window address:

![nft5](https://user-images.githubusercontent.com/526558/124387008-58ae3280-dcb3-11eb-920d-07b6118f1ab2.png)

🕵🏻‍♂️ Inspect the `Debug Contracts` tab to figure out what address is the `owner` of `YourCollectible`?

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

🔏 Edit your smart contract `YourCollectible.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

⬇️ Installing a new package to your frontend? You need to `cd packages/react-app` and then `yarn add PACKAGE`

# 📡  Mainnet Deploy!

🛰 Ready to deploy to MATIC mainnet?

> Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js` to `matic`

![image4](https://user-images.githubusercontent.com/76530366/127909096-82f262ee-9052-4b80-9298-6a14dd3d5b2e.png) 

👛 View your deployer address using `yarn account` to ensure you have some Matic. (You can exchange for Matic tokens on UniSwap using the bridge: https://wallet.matic.network/bridge).

![nft8](https://user-images.githubusercontent.com/526558/124387068-8004ff80-dcb3-11eb-9d0f-43fba2b3b791.png)

👨‍🎤 Deploy your NFT smart contract:
```
yarn deploy
```
> ✏️ Edit your frontend `App.jsx` in `packages/react-app/src` to change the `targetNetwork` to `Matic`:

![image5](https://user-images.githubusercontent.com/76530366/127909153-c14713f7-c225-4016-9c69-430ced009f3a.png)

You should see the correct network in the frontend:

![image8](https://user-images.githubusercontent.com/76530366/127909563-a695d94b-5a87-4d76-84ac-9c819f36a3f7.png)

🎫 Ready to mint a batch of "L2" NFTs for reals?

> ✏️ Edit the mint script mint.js in packages/hardhat/scripts and update the `toAddress` to your MetaMask address (or other secure mainnet wallet).

```
yarn mint
```

Once minted, you should be able to see them in your Frontend.

![nft11](https://user-images.githubusercontent.com/526558/124387132-b04c9e00-dcb3-11eb-95d1-03b8c272e52f.png)

## 🐟 Open Sea

> Check out your contract on OpenSea's Matic viewer (Under "My Collections")

![image6](https://user-images.githubusercontent.com/76530366/127909246-dc3ae4a5-70b7-4867-aabd-c5bc28d94588.png)

## 🔍 Maticscan Contract
> Feel free to also check your contract address on Polygonscan (extractible from the terminal where you deployed the contract).

# 🛳 Ship the app!
> ⚙️ build and upload your frontend and share the url with your friends...

```
# build it:

yarn build

# upload it:

yarn surge

yarn s3

yarn ipfs
```
![nft14](https://user-images.githubusercontent.com/526558/124387203-fe61a180-dcb3-11eb-8d68-82a76a514e43.png)

👩‍❤️‍👨 Share your public url with a friend and ask them for their address to send them a collectible :)

![nft15](https://user-images.githubusercontent.com/526558/124387205-00c3fb80-dcb4-11eb-9e2f-29585e323037.gif)

------------

# FAQs

What happens if I run into a chainID error?
		Under `packages/hardhat/deployments`, make sure that your chainID for your desired chain to deploy to is correct. The chainID file is located under their respective chain folders. For Matic, the correct chainID is 134. For Mumbai, the correct chainID is 80001.

What happens if I run into a gas error?
		This can be caused by many things. First check if you do have enough gas to deploy on your various networks. Then, try to raise the `gasPrice` as shown below under `packages/hardhat/hardhat.config.js`.

![image7](https://user-images.githubusercontent.com/76530366/127909315-623f2f7b-c8f0-4b30-b406-29821b716895.png)

# Documentation

For a more in-depth explanation, documentation, quick start guide, tutorials, tips and many more resources, visit our documentation site: [docs.scaffoldeth.io](https://docs.scaffoldeth.io) 

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!
