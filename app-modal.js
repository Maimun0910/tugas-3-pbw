Vue.component('app-modal', {
  template: '#tpl-app-modal',
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Konfirmasi' }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  }
});