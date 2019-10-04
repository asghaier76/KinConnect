const axios = require('axios')
import kinsdk from "@kinecosystem/kin-sdk/lib";
import { Keypair } from "@kinecosystem/kin.js";
    
const moment = require('moment')
const forge = require('node-forge')


const LOCK_TIME_PERIOD = 5 * 60
const NOTIFICATION_TIME_PERIOD = 1 * 60
const KIN_HORIZON = 'https://horizon.kinfederation.com/'

let wallet = {}
let balance = 0
let transactions = []
let isWalletLocked = true

function reloadExtension() {
    chrome.runtime.onMessage.addListener( (msg, sender) => {
        return true
    })
}

chrome.runtime.reload ? reloadExtension(): true

chrome.runtime.onStartup.addListener(() => {
    chrome.runtime.reload()
})

chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.onMessage.addListener( async (msg, sender, reply) => {
        let response = {}
        switch (msg.type) {
            case 'WALLET_CREATE_REQUEST':
                const password = msg.data.password
                wallet = await createNewWallet(password)
                response = {
                    type: 'WALLET_CREATE_RESPONSE',
                    data: wallet
                }
                isWalletLocked = false
                reply(response)
                break
            case 'WALLET_IMPORT_REQUEST':
                wallet = await importWallet(msg.data.secretkey, msg.data.password)
                response = {
                    type: 'WALLET_IMPORT_RESPONSE',
                    data: wallet
                }
                isWalletLocked = false
                reply(response)
                break
            case 'WALLET_EXIST_REQUEST':
                const isExist = await walletExist()
                response = {
                    type: 'WALLET_EXIST_RESPONSE',
                }
                if(!isExist) {
                    response.error = 'EMPTY'
                }
                reply(response)
                break
            case 'WALLET_INQUIRY_REQUEST':
                response = {
                    type: 'WALLET_INQUIRY_RESPONSE',
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else response.data = wallet
                reply(response)
                break
            case 'WALLET_UNLOCK_REQUEST':
                response = {
                    type: 'WALLET_UNLOCK_RESPONSE'
                }
                try {
                    wallet = await unlockWallet(msg.data.password)
                    isWalletLocked = false
                } catch (err) {
                    response.error = err
                }
                reply(response)
                break
            case 'BALANCE_INQUIRY_REQUEST':
                balance = await inquiryBalance()
                response = {
                    type: 'BALANCE_INQUIRY_RESPONSE',
                    data: {
                        address: msg.data.address,
                        balance: balance
                    }
                }
                reply(response)
                break
            case 'BALANCE_UPDATE_REQUEST':
                balance = await updateBalance(msg.data.address)
                response = {
                    type: 'BALANCE_UPDATE_RESPONSE',
                    data: {
                        address: msg.data.address,
                        balance: balance
                    }
                }
                reply(response)
                break
            case 'TRANSACTION_INQUIRY_REQUEST':
                transactions = await inquiryTransaction()
                response = {
                    type: 'TRANSACTION_INQUIRY_RESPONSE',
                    data: {
                        address: msg.data.address,
                        transactions: transactions
                    }
                }
                reply(response)
                break
            case 'TRANSACTION_UPDATE_REQUEST':
                transactions = await updateTransaction(msg.data.address)
                response = {
                    type: 'TRANSACTION_UPDATE_RESPONSE',
                    data: {
                        address: msg.data.address,
                        transactions: transactions
                    }
                }
                reply(response)
                break
            case 'TRANSFER_REQUEST':
                response = {
                    type: 'TRANSFER_RESPONSE'
                }
                try {
                    const result = await transfer(wallet.address, msg.address, msg.amount, wallet.secret)
                    response.data = {
                        address: msg.address,
                        amount: msg.amount
                    }

                    await chromeSendNotification(id, 'Outgoing Transaction', 'You just sent ' + msg.amount + ' KIN')
                } catch (err) {
                    response.error = err
                }
                reply(response)
                break
            case 'INPAGE_ACCOUNT_REQUEST':
                response = {
                    type: 'INPAGE_ACCOUNT_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else response.data = {
                    address: wallet.address
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_BALANCE_REQUEST':
                response = {
                    type: 'INPAGE_BALANCE_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else {
                    balance = await updateBalance(wallet.address)
                    response.data = {
                        balance: balance
                    }
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_TRANSACTION_REQUEST':
                response = {
                    type: 'INPAGE_TRANSACTION_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked)
                    response.error = 'LOCKED'
                else {
                    transactions = await updateTransaction(wallet.address)
                    response.data = {
                        transactions: transactions
                    }
                }
                await chromeSendTabMessage(response)
                break
            case 'INPAGE_TRANSFER_REQUEST':
                response = {
                    type: 'INPAGE_TRANSFER_RESPONSE',
                    id: msg.id
                }
                if(isWalletLocked) {
                    response.error = 'LOCKED'
                    await chromeSendTabMessage(response)
                } else {
                    const query = 'destination=' + msg.data.address + '&amount=' + msg.data.amount + '&id=' + msg.id
                    const path = chrome.extension.getURL('popup/popup.html?action=confirm&' + query)
                    chrome.windows.create({
                        'url': path,
                        'type': 'popup',
                        'width': 360,
                        'height': 600
                    }, (w) => {
                        
                    })
                }
                break
            case 'INPAGE_TRANSFER_NOTIFICATION':
                response = {
                    type: 'INPAGE_TRANSFER_RESPONSE',
                    id: msg.id
                }
                    response.data = {
                        address: msg.address,
                        amount: msg.amount,
                    }
                reply(response)
                await chromeSendTabMessage(response)
                break
        }
        return true
    })

    chrome.notifications.onClicked.addListener((id) => {
        chrome.tabs.create({url:'https://libexplorer.com/version/' + id})
    })

    addNotificationAlarm()
})

chrome.alarms.onAlarm.addListener( async (alarm) => {
    if(alarm.name == 'lockAlarm') {
        wallet = {}
        isWalletLocked = true
        chrome.alarms.clear(alarm.name)
    } else if(alarm.name == 'notificationAlarm') {
        const previousHeight = transactions.length
        const addr = await loadStorage('address')
        transactions = await updateTransaction(addr.address)
        const currentHeight = transactions.length
        if(currentHeight > previousHeight) {
            const diff = currentHeight - previousHeight
            for(let i=0;i<diff;i++) {
                const transaction = transactions[i]
                const id = transaction.transactionVersion.toString()
                let title = ''
                let message = ''
                if(transaction.event == 'sent') {
                    title = 'Outgoing Transaction'
                    message = 'You send ' + transaction.amount + ' Lib'
                } else {
                    title = 'Incoming Transaction'
                    message = 'You receive ' + transaction.amount + ' Lib'
                }
                chromeSendNotification(id, title, message)
            }
        }
    }
})

////
function chromeSendMessage(msg) {
    let promise = new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, (res) => {
            resolve()
        })
    })
    return promise
}

function chromeSendTabMessage(msg) {
    let promise = new Promise((resolve, reject) => {
        chrome.tabs.query({active: true}, (tabs) => {
            let activeTabs = tabs.filter((tab) => {
                return !tab.url.includes('chrome-extension://')
            })
            let activeTabId = activeTabs[0].id
            chrome.tabs.sendMessage(activeTabId, msg, (res) => {
                resolve()
            })
        })
    })
    return promise
}

function chromeSendNotification(id, title, message) {
    let options = {
        message: message,
        title: title,
        type: 'basic',
        iconUrl: 'icons/icon_128.png'
    }
    chrome.notifications.create(id, options)
}


//
function addLockAlarm() {
    chrome.alarms.create('lockAlarm', {
        periodInMinutes: LOCK_TIME_PERIOD / 60
    })
}

function addNotificationAlarm() {
    chrome.alarms.create('notificationAlarm', {
        periodInMinutes: NOTIFICATION_TIME_PERIOD / 60
    })
}

async function inquiryBalance() {
    let balance = await loadStorage('balance')
    return balance
}

async function updateBalance(address) {
    let balance = await getBalance(address)
    await saveStorage('balance', balance)
    return balance
}

async function inquiryTransaction() {
    try {
        let transactionsObj = await loadStorage('transactions')
        return transactionsObj.transactions
    } catch (err) {
        return []
    }
}

async function updateTransaction(address) {
    let transactions = await getTransactionHistory(address)
    await saveStorage('transactions', transactions)
    return transactions
}

async function unlockWallet(password) {
    let promise = new Promise( async (resolve, reject) => {
        try {
            let encrypted = await loadStorage('secret')
            let secret = decrypt(encrypted.secret, password)
            let address = await loadStorage('address')
            let wallet = {
                secret: secret,
                address: address.address,
                nextLockTime: moment().add(LOCK_TIME_PERIOD, 'second').toDate().getTime()
            }
            addLockAlarm()
            resolve(wallet)
        } catch (err) {
            reject(err)
        }
    })
    return promise
}

async function walletExist() {
    try {
        let res = await loadStorage('address')
        return true
    } catch (err) {
        return false
    }
}

function clearStorage() {
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.clear(() => {
            resolve()
        })
    })
    return promise
}

function saveStorage(key, value) {
    let json = {}
    json[key] = value
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.set(json, () => {
            resolve()
        })
    })
    return promise
}

function loadStorage(key) {
    let promise = new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (result)=> {
            if(Object.keys(result).length === 0)
                reject()
            else resolve(result)
        })
    })
    return promise
}

async function saveWallet(address, encryptedWallet) {
    await saveStorage('secret', encryptedWallet)
    await saveStorage('address', address)
}

async function createNewWallet(password) {
    // clear wallet
    await clearStorage()
    // generate key pair
    let wallet = await generateWallet()
    // encrypt & store 
    let encryptedWallet = encrypt(wallet.secret, password)
    await saveWallet(wallet.address, encryptedWallet)

    let balance = await getBalance(wallet.address)
    await saveStorage('balance', balance)
    // get next lock time
    let nextLockTime = moment().add(LOCK_TIME_PERIOD, 'second').toDate().getTime()
    await saveStorage('nextLockTime', nextLockTime)
    wallet.nextLockTime = nextLockTime
    addLockAlarm()
    return wallet
}

async function importWallet(secretkey, password) {
    // clear wallet
    await clearStorage()
    // generate key pair
    let wallet = await getWallet(secretkey)
    // encrypt & store 
    let encryptedWallet = encrypt(secretkey, password)
    await saveWallet(wallet.address, encryptedWallet)

    let balance = await getBalance(wallet.address)
    await saveStorage('balance', balance)
    // get next lock time
    let nextLockTime = moment().add(LOCK_TIME_PERIOD, 'second').toDate().getTime()
    await saveStorage('nextLockTime', nextLockTime)
    wallet.nextLockTime = nextLockTime
    addLockAlarm()
    return wallet
}

function hashSHA256(text) {
    let md = forge.md.sha256.create()
    md.update(text)
    return md.digest().toHex()
}

function encrypt(text, password) {
    // generate key
    const iv = forge.random.getBytesSync(32)
    const salt = forge.random.getBytesSync(128)
    const key = forge.pkcs5.pbkdf2(password, salt, 8, 32)
    let cipher = forge.cipher.createCipher('AES-CBC', key)
    cipher.start({iv:iv})
    cipher.update(forge.util.createBuffer(text))
    cipher.finish()
    let encryptedWallet = {
        iv: forge.util.encode64(iv),
        salt: forge.util.encode64(salt),
        cipherText: cipher.output.toHex()
    }
    return encryptedWallet
}

function decrypt(encrypted, password) {
    const iv = forge.util.decode64(encrypted.iv)
    const salt = forge.util.decode64(encrypted.salt)
    const key = forge.pkcs5.pbkdf2(password, salt, 8, 32)
    let decipher = forge.cipher.createDecipher('AES-CBC', key)
    decipher.start({iv:iv})
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted.cipherText)))
    if(!decipher.finish()) throw new Error('wrong key')
    let decrypted = decipher.output.toString()
    return decrypted
}


async function generateWallet() {
    let keys = Keypair.random();
    await fundWallet(keys.publicKey());
    return {
        address: keys.publicKey(),
        secret: keys.secret()
    }
}

async function getWallet(secretkey) {
    let keys = Keypair.fromSecret(secretkey)
    return {
        address: keys.publicKey(),
        secret: keys.secret()
    }
}


async function getBalance (address) {
    let response = await axios.get(KIN_HORIZON+'accounts/'+address)
    let balance = response.data.balances[0].balance;
    return balance;
}

async function fundWallet(address) {
    return await axios.get('https://kinconnectfaucet.herokuapp.com/fund/'+address, { headers: {Authorization:'Basic YXBpa2V5OlFzM1Z4OEd5NE11NkxuMw==' } })
}


async function getTransactionHistory (address) {
    try {
        const response = await axios.get(KIN_HORIZON+'accounts/'+address+'/operations?order=desc')
        let transactions = response.data.ops._embedded.records;//.map( (tx) => {
        
        return transactions
    } catch (err) {
        throw new Error(err.message)
    }
}

async function transfer (fromAddr, toAddr, amount, secret) {

    try
    {   
        let response = {};
        let server = new kinsdk.Server(KIN_HORIZON);
        kinsdk.Network.usePublicNetwork();
        server.loadAccount(fromAddr)
        .then(source => {
            let tx = new kinsdk.TransactionBuilder(source)
                .setTimeout(15)
                .addOperation(kinsdk.Operation.payment({
                  destination: toAddr,
                  asset: kinsdk.Asset.native(),
                  amount: amount,
                }))
                .addMemo(kinsdk.Memo.text('1-RrsP-Ext'))
                .build();
            tx.sign(kinsdk.Keypair.fromSecret(secret));
            console.log(tx);
            server.submitTransaction(tx)
            .then(result =>{
                response = result;
                
            }, (err) => {
                throw new Error(`transfer failed: `+ err.message)

            });
            return response;
        });
    } catch (err) {
        throw new Error(err.message)
    }

}

