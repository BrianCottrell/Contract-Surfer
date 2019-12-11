# Workshop: Adding a React Front-end to your Dapp

## Before installation

- Sign up to the [Honeycomb marketplace](https://honeycomb.marketplace) to access the job listings

- Install [npm](https://www.npmjs.com/get-npm)

- Install truffle globally using:

`npm install -g truffle`

- Install the Metamask add-on to your browser and create a wallet.
Note down the mnemonics.
Fund it with [Ropsten ETH](https://faucet.metamask.io/) and [Ropsten LINK](https://ropsten.chain.link/).

- Create an [Infura](https://infura.io/) account, get an endpoint URL for the Ropsten testnet and note it down.

- (Optional) Install [Visual Studio Code](https://code.visualstudio.com/)

## Installation

- Clone this repo

- Go to the main directory (`/workshop-honeycomb-react`)

- Install the dependencies:

`npm install`

- Create the file that you are going to enter your Infura credentials:

`cp wallet.json.example wallet.json`

- Open the newly created `wallet.json` file and enter the mnemonics and the endpoint URL you have noted down earlier, similar to `wallet.json.example`.

- Deploy the contract (Ropsten LINK will be transferred from your wallet to the contract automatically during deployment)

`npm run deploy-ropsten`

- Run the test script and see that your smart contract works

`npm run test-ropsten`

- Go to the front-end project directory (`/workshop-honeycomb-react/client`)

- Install the dependencies for the front-end project:

`npm install`

- Start the server

`npm run start`

## Hosting the Dapp on Github Pages

- Push this project as a public repository on your Github.

- In the `package.json` file in the front-end project directory, replace the following line

`"homepage": "https://clc-group.github.io/workshop-honeycomb-react"`

with

`"homepage": "https://<YOUR_GITHUB_HANDLE>.github.io/<YOUR_REPO_NAME>"`

- In your front-end project directory, use the following command to publish your dapp.

`npm run deploy`

You can see this project published on https://clc-group.github.io/workshop-honeycomb-react/.
Your project will be published on your `homepage`.
