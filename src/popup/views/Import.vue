<template>
    <div>
        <VueElementLoading
            :active="isCreating"
            spinner="line-wave"
            color="#025bc2"
            text="Saving wallet ..."
        />
        <section class="wallet-main container hero">
            <div class="wallet-body">
                <div class="label-title">
                    <b-field is-info class="label-title" label="Secret Key">
                        <b-input placeholder="Enter Secret Key" is-info type="text" v-model="secretkey"></b-input>
                    </b-field>
                    <b-field is-info label="Password">
                        <b-input is-info placeholder="Enter Password" type="password" v-model="password"></b-input>
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
                    @click="importWallet"
                     outlined>
                        Import
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
            secretkey: '',
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
        async importWallet () {
            if(this.secretkey != ''){
                console.log('sec ok')
                if(this.password != '' && this.password == this.repeatPassword) {
                    this.isCreating = true
                    console.log('pass ok')
                    try{
                        let wallet = await this.kinClient.importWallet(this.secretkey , this.password)
                        console.log('wallet ok')
                        this.isCreating = false
                        this.$router.push({name:'wallet'})
                    } catch (error) {
                        console.log('wallet not ok')
                        this.$buefy.toast.open({
                        message: 'Import failed, check the secret key',
                        type: 'is-danger',
                        position: 'is-bottom'
                    })
                    }
                } else {
                    console.log('pass not ok')
                    this.$buefy.toast.open({
                        message: 'Please provide a valid password',
                        type: 'is-danger',
                        position: 'is-bottom'
                    })
                }
            } else {
                console.log('sec not ok')
                this.$buefy.toast.open({
                        message: 'Please enter a secret key',
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