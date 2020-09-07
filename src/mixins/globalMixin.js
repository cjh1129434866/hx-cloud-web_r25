import Vue from 'vue'
import { mapState, mapActions, mapGetters } from 'vuex'

Vue.mixin({
  data() {
    return {}
  },

  computed: {
    $currentLang() {
      return this.$i18n.locale || 'zh'
    },

    ...mapState([
      'userInfo',
      '$isMobile',
      '$activeMenu',
      '$mqttIsConnect',
      '$mqtt_device_data',
      '$mqtt_error_data',
      '$userMenu',
      '$userGroup',
      '$historyPath',
      '$sideNavStatus',
      '$commonParam',
      '$userConfig'
    ]),
    ...mapGetters(['IsAdmin', '$theme'])
  },

  methods: {
    ...mapActions(['getUserInfo'])
  }
})
