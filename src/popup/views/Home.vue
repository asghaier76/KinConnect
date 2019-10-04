<template>
    <section class="wallet-main container hero">
        <div v-if="isNewWallet" class="wallet-body">
            <div class="welcome-title">
                <span>KinConnect</span>
                <h2 class="welcome-subtitle">KIN Browser Extension</h2>
            </div>
            <div class="button-group">
                <b-button class="wallet-button"
                size="is-large"
                type="is-info"
                @click="openCreate"
                 outlined>
                    Create New Wallet
                </b-button>
                <b-button class="wallet-button"
                size="is-large"
                type="is-info"
                @click="openImport"
                 outlined>
                    Import Existing Wallet
                </b-button>
                
            </div>
        </div>
        <div v-else class="wallet-body">
            <div class="unlock-title">
                <span>Welcome Back!</span>
                <h2 class="welcome-subtitle">KinConnect Extension</h2>
            </div>
            <div class="wallet-form">
                <b-field label="Password">
                    <b-input placeholder="Enter Your Password" type="password" v-model="password"></b-input>
                </b-field>
            </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-info"
                    @click="unlockWallet"
                     outlined>
                        Confirm
                    </b-button>
                </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import KinService from '../service/kin_service'

export default {
    data() {
        return {
            isNewWallet: false,
            password: ''
        }
    },
    async created() {
        // check that wallet is created
        this.kinClient = new KinService()
        try {
            await this.kinClient.checkWalletExist()
            await this.kinClient.getWalletInfo()
            this.$router.push({name:'wallet'})
        } catch (err) {
            if(err == 'LOCKED') this.isNewWallet = false
            else this.isNewWallet = true
        }
    },
    methods: {
        openCreate() {
            this.$router.push({name: 'create'})
        },
        openImport() {
            this.$router.push({name: 'import'})
        },
        async unlockWallet () {
            try {
                await this.kinClient.unlockWallet(this.password)
                let wallet = await this.kinClient.getWalletInfo()
                this.$router.push({name:'wallet', query: {
                    address: wallet.address
                }})
            } catch (err) {
                this.$buefy.toast.open({
                    message: 'password not correct',
                    type: 'is-danger',
                    position: 'is-bottom'
                })
            }
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-main {
    min-height: 540px;
}
.wallet-body {
    padding: 20px;
    text-align: center;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.welcome-title {
    font-size: 42px;
}
.welcome-subtitle {
    font-size: 24px;
}
.unlock-title {
    font-size: 36px;
}
.wallet-button {
    width: 100%;
    margin: 10px 10px 20px 0px;
}
</style>