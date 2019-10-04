<template>
    <section class="container hero  ">
        <div class="wallet-body">
            <!-- generate new wallet if not exist -->
            <!-- wallet -->
            <div>
                <Avatar
                    :seed="userAddress"
                    :size="20"
                />
                <div class="wallet-address">
                    <span @click="copyAddress()">{{ truncAddress }}</span>
                </div>
                <div v-if="balance" class="wallet-balance">
                    <span>{{ balance }} KIN</span>
                    
                    
                </div>
                <div v-else class="wallet-balance">
                    <span>Loading ...</span>
                </div>
                <!-- button -->
                <div class="wallet-button-group">
                    <b-button type="is-info" size="is-info" class="wallet-button"
                        @click="openReceive()"  outlined>
                        Receive
                    </b-button>
                    <b-button type="is-info" size="is-info" class="wallet-button"
                        @click="openSend()"  outlined>
                        Send
                    </b-button>
                </div>
            </div>
        </div>
        <div class="transaction-card">
            <div v-if="isLoadingTransactions">Loading Transactions ...</div>
            <div v-if="!isLoadingTransactions">
                <div class="transaction-title">
                    <span>Operations</span>
                </div>
                <div v-for="transaction in transactions" class="transaction-list" @click="openExplorer('/tx/'+transaction.transaction_hash)">
                    <div class="transaction-header">
                        <span>{{transaction.created_at}}</span>
                    </div>
                    <div class="transaction-body" v-bind:style="{'color': '#023aab'}" >
                        <span>{{transaction.type}}</span> <span v-if="transaction.type === 'payment' && transaction.to === userAddress"> in </span> <span v-if="transaction.type === 'payment' && transaction.from === userAddress"> out </span>
                        <span class="transaction-amount">{{transaction.amount | numberWithCommas}} KINs</span>
                    </div>
                    <div class="transaction-footer" v-if="transaction.type === 'payment' && transaction.to === userAddress" >
                        <span >From: {{transaction.from}}</span>
                    </div>
                    <div class="transaction-footer" v-if="transaction.type === 'payment' && transaction.from === userAddress">
                        <span >To: {{transaction.to}}</span>
                    </div>
                    <div class="transaction-footer" v-if="transaction.type === 'create_account'">
                        <span >Address: {{transaction.funder}}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import Avatar from '../components/Avatar.vue'
import KinService from '../service/kin_service'
import axios from 'axios' 

export default {
    components: {
        Avatar
    },
    filters: {
        truncate: function(value) {
        if (value.length > 10) {
            value = value.substring(0, 5) + '...';
        }
        return value
        }
    },
    data() {
        return {
            balance: '0',
            isLoadingTransactions: true,
            userAddress: this.$route.query.address,
            transactions: [],
            truncAddress: ''
        }
    },
    async created() {
        this.kinClient = new KinService()
        try {
            this.wallet = await this.kinClient.getWalletInfo()
            this.userAddress = this.wallet.address
            this.truncAddress = this.userAddress.substr(0, 4) + '...' + this.userAddress.substr(this.userAddress.length - 4, this.userAddress.length)
            // get balance from cavhe
            const bal_response = await axios.get('https://horizon.kinfederation.com/accounts/'+this.userAddress)
            this.balance = bal_response.data.balances[0].balance
            //await this.kinClient.inquiryBalance(this.userAddress)
            // get transaction from cache
            const tx_response = await axios.get('https://horizon.kinfederation.com/accounts/'+this.userAddress+'/operations?order=desc')
            this.transactions = tx_response.data._embedded.records;
            //this.transactions = await this.kinClient.inquiryTransaction(this.userAddress)
            this.isLoadingTransactions = false
            // update balance
            this.balance = await this.kinClient.updateBalance(this.userAddress)
            // update transaction
            this.transactions = await this.kinClient.updateTransaction(this.userAddress)
        } catch(err) {
            console.log('Error')
        }
    },
    methods: {
        getImagePath(img) {
            return chrome.extension.getURL('popup/assets/img/' + img)
        },
        openSend() {
            this.$router.push({name:'send'})
        },
        openReceive() {
            this.$router.push({name:'receive'})
        },
        openExplorer(link) {
            chrome.tabs.create({url:'https://kinexplorer.com'+link})
        },
        async copyAddress () {
            try {
                let response = await this.$copyText(this.userAddress)
                this.$buefy.toast.open({
                    message: 'Copied',
                    position: 'is-bottom',
                    type: 'is-success'
                })
            } catch (err) {
                this.$buefy.toast.open({
                    message: err,
                    position: 'is-bottom',
                    type: 'is-danger'
                })
            }
        },
        shortUserAddress(x) {
            const first = x.substr(0, 7)
            const last = x.substr(x.length - 7, x.length)
            return first + '...' + last
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-body {
    padding: 20px;
}
.wallet-balance {
    font-size: 32px;
}
.wallet-balance-image {
    height: 22px;
    width: 22px;
}
.wallet-button-group {
    margin-top: 20px;
}
.transaction-card {
    background-color: white;
    color: blue;
    overflow:scroll;overflow-y:scroll;overflow-x:hidden;
}
.transaction-title {
    text-align: left;
    padding: 5px 20px;
}
.transaction-list {
    text-align: left;
    padding: 5px 20px;
    border-top-color: rgba((0), 0, 0, 0.7);
    border-top-style: solid;
    border-top-width: thin;
    
}
.transaction-list:hover {
    background-color: #bad7f7;
}
.transaction-header {
    font-size: 12px;
    color: #025bc2;
}
.transaction-body {
    font-size: 16px;
}
.transaction-amount {
    float: right;
}
.transaction-footer {
    font-size: 9px;
    color: #025bc2;
}
.text-left {
    text-align: left;
}
</style>