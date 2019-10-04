<template>
    <section class="container hero is-medium">
        <div class="wallet-qr">
            <div class="wallet-address" @click="copyAddress">
                <span>{{address}}</span>
                <b-icon custom-class="wallet-address-icon" size="is-small" icon="copy"></b-icon>
            </div>
            <qrcode-vue :value="address" :size="size" level="H"></qrcode-vue>
        </div>
        <div class="wallet-body">
            
            <div v-if="showSecret" class="wallet-secret" @click="copySecret">
                <span>{{secret}}</span>
                <b-icon custom-class="wallet-address-icon" size="is-small" icon="copy"></b-icon>
            </div>
            <div class="button-group">
                <b-button class="wallet-button"
                 size="is-medium"
                 @click="back">
                    Back
                </b-button>
                <b-button class="wallet-button"
                 size="is-medium"
                 type="is-danger"
                 @click="exportSecret">
                    {{ showSecret ? 'Hide Secret' : 'Show Secret' }}
                </b-button>
            </div>
        </div>
    </section>
</template>

<script>
import { Route } from 'vue-router'
import KinService from '../service/kin_service'
import QrcodeVue from 'qrcode.vue'

export default {
    components: {
        QrcodeVue
    },
    filters: {
        shortUserAddress (x) {
            const first = x.substr(0, 7)
            const last = x.substr(x.length - 7, x.length)
            return first + '...' + last
        }
    },
    data() {
        return {
            showSecret: false,
            secret: '',
            address: '',
            size: '260'
        }
    },
    async created() {
        this.kinClient = new KinService()
        this.wallet = await this.kinClient.getWalletInfo()
        this.address = this.wallet.address
        this.secret = '';
    },
    methods: {
        back () {
            this.$router.back()
        },
        async copyAddress () {
            try {
                let response = await this.$copyText(this.address)
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
        async copySecret () {
            try {
                let response = await this.$copyText(this.secret)
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
        exportSecret () {
            this.showSecret = !this.showSecret;
            if(this.showSecret)
                this.secret = this.wallet.secret
            else
                this.secret = '';
        }
    }
}
</script>

<style lang="css" scoped>
.wallet-qr {
    padding: 20px;
}
.wallet-address {
    word-break: break-all;
    padding: 10px;
    font-size: 12px;
    cursor: pointer;
}
.wallet-secret {
    word-break: break-all;
    color: red;
    font-size: 12px;
    padding: 10px;
    cursor: pointer;
}
.wallet-address-icon {
    font-weight: 100;
    font-size: 18px;
}
</style>