<template>
    <div>
        <VueElementLoading
            :active="isTransfering"
            spinner="bar-fade-scale"
            color="#025bc2"
            text="Submitting Transaction ..."
            is-full-screen
        />
        <section class="wallet-main container hero">
            <div class="wallet-body">
                <div>
                    <div class="wallet-label">Confirm sending to Address: </div>
                    <div class="wallet-content">{{destAddress}}</div>
                    <div class="wallet-label" style="margin-top:20px;">An amount of: </div>
                    <div class="wallet-content">{{amount}} KIN</div>
                </div>
                <div class="button-group">
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-medium"
                    @click="reject">
                        Reject
                    </b-button>
                    <b-button class="wallet-button"
                    size="is-medium"
                    type="is-info"
                    @click="transfer">
                        Confirm
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
        this.amount = this.$route.query.amount
        this.destAddress = this.$route.query.destination
        this.requestId = this.$route.query.id
    },
    methods: {
        async transfer () {
            try {
                this.isTransfering = true
                let result = await this.kinClient.transfer(this.destAddress, this.amount)
                this.isTransfering = false
                await this.kinClient.notifyInpageTransferSuccess(this.requestId, this.destAddress, this.amount)
            } catch (err) {
                this.isTransfering = false
                this.$buefy.toast.open({
                    message: err,
                    type: 'is-danger'
                })
            }
        },
        async reject () {
            await this.kinClient.notifyInpageTransferReject(this.requestId, this.destAddress, this.amount)
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-main {
    min-height: 540px;
}
.wallet-body {
    padding: 12px;
    text-align: left;
}
.button-group {
    padding: 25px 0px;
    text-align: center;
}
.wallet-content {
    font-size: 18px;
    word-break: break-all;
    margin-left: 10px;
}
.wallet-label {
    font-size: 20px;
}
</style>