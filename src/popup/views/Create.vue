<template>
    <div>
        <VueElementLoading
            :active="isCreating"
            spinner="line-wave"
            color="#025bc2"
            text="Generating a new wallet ..."
        />
        <section class="wallet-main container hero">
            <div v-if="!showSeed" class="wallet-body">
                <div class="label-title">
                    <b-field is-info class="label-title" label="Password">
                        <b-input placeholder="Enter Password" is-info type="password" v-model="password"></b-input>
                    </b-field>
                    <b-field is-info label="Repeat Password">
                        <b-input is-info placeholder="Re-enter Password" type="password" v-model="repeatPassword"></b-input>
                    </b-field>
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-medium"
                    @click="back"
                     outlined>
                        Cancel
                    </b-button>
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-info"
                    @click="createWallet"
                     outlined>
                        Create
                    </b-button>
                </div>
            </div>
            <div v-else class="wallet-body">
                <div class="secret-title">
                    <span>Secret Key</span>
                </div>
                <div class="secret-body">
                    {{secret}}
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-info"
                    @click="home"
                     outlined>
                        Yes, I copied the secret key
                    </b-button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { Route } from 'vue-router'
import VueElementLoading from 'vue-element-loading'
import KinService from '../service/kin_service'

export default {
    components: {
        VueElementLoading
    },
    data() {
        return {
            password: '',
            repeatPassword: '',
            isCreating: false,
            showSeed: false
        }
    },
    async created() {
        this.kinClient = new KinService()
    },
    methods: {
        back () {
            this.$router.back()
        },
        home() {
            this.$router.push({name:'wallet'})
        },
        async createWallet () {
            if(this.password != '' && this.password == this.repeatPassword) {
                this.isCreating = true
                let wallet = await this.kinClient.createNewWallet(this.password)
                this.isCreating = false
                this.secret = wallet.secret
                this.showSeed = true
            } else {
                this.$buefy.toast.open({
                    message: 'Please provide a valid password',
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
    text-align: left;
    color: #025bc2;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.secret-title {
    font-size: 24px;
    color: #025bc2;
}
.label-title {
    font-size: 16px;
    color: #025bc2;
}
.secret-body {
    font-size: 8px;
}
</style>
<style>
.label {
    color:white;
}
</style>