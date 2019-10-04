<template>
    <div>
        <VueElementLoading
            :active="isTransfering"
            spinner="bar-fade-scale"
            color="#025bc2"
            text="Transfering ..."
            is-full-screen
        />
        <section class="wallet-main container hero">
            <div class="wallet-body">
                <div class="wallet-form">
                    <b-field is-info label="Destination Address">
                        <b-input placeholder="Destination Address" v-model="dest"></b-input>
                    </b-field>
                    <b-field placeholder="Amount" label="Amount">
                        <b-input v-model="amount" 
                        type="number"
                        step="0.000001"></b-input>
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
                    @click="transfer"
                     outlined>
                        Send
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
    filters: {

    },
    data() {
        return {
            dest: '',
            amount: 0,
            isTransfering: false
        }
    },
    async created() {
        this.kinClient = new KinService()
    },
    methods: {
        back () {
            this.$router.back()
        },
        async transfer () {
            let amount = this.amount
            let destAddress = this.dest
            try {
                this.isTransfering = true
                await this.kinClient.transfer(destAddress, amount)
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: 'You have sent ' + amount + 'KIN',
                    position: 'is-bottom',
                    type: 'is-info'
                })
                this.$router.replace({name:'wallet'})
            } catch (err) {
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: 'Error in performing the transfer',
                    position: 'is-bottom',
                    type: 'is-danger'
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
</style>
<style>
.label {
    color:white;
}
</style>