# Introduction
---
To enable dapps development on KIN Blockchain this repo is a KIN Blockchain Browser extension (KinConnect). The extension provides the features of a wallet and also enables web apps to interact with the KIN Blockchain using an injected window.kin object similar to the way MetaMask injects web3 object.

## Main Wallet Functions
---
The extension provides main features of a wallet, including 
- creating and importing wallet
- Viewing the balance and transactions
- Export account address by either copying the address or display the QR code
- Export Secret Key
- Link to kinexplorer.org
- The wallet (created or generated) is stored in encrypted format in local storage

## Other Functions (for dapps)
The extension injects window.kin object to offer developers to build dapps, the web app can connect to the wallet using these functions

- To obtain the account address, for example to link a user profile to an account address
```javascript
let account = await window.kin.getAccount()
```

- To query the account balance
```javascript
let balance = await window.kin.getBalance()
```

- To query transaction history
```javascript
let transactions = await window.kin.getTransactions()
```

- To submit a transaction (Transfer KIN)
```javascript
let result = await window.kin.transfer(address, amount, memo)
```

## How to Build from the source
---

- clone the repo and cd into the folder
- npm install
- npm run build
- go the extension and enable developer mode in chrome browser
- click on "Load unpacked" and select on "dist" folder

## Things to add
---

- Add multiple accounts
- Add prompt on exporting secret key
- Switching between test and production networks
- Enable accounts creation and manage signers on an account
