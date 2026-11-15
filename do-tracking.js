Vue.component('do-tracking', {
  template: '#tpl-do-tracking',
  props: {
    trackingList: { type: Array, required: true },
    paketList: { type: Array, required: true },
    stokList: { type: Array, required: true },
    pengirimanList: { type: Array, required: true }
  },
  data() {
    return {
      searchQuery: '',
      activeQuery: '',
      // Form Tambah DO Manual
      showNewDOForm: false,
      newDO: {
        nim: '',
        nama: '',
        ekspedisi: 'JNE',
        paket: '',
        tanggalKirim: new Date().toISOString().slice(0, 10)
      },
      // Input update riwayat per DO
      newLogText: {}
    };
  },
  computed: {
    filteredTracking() {
      const q = this.activeQuery.trim().toLowerCase();
      if (!q) return this.trackingList;
      return this.trackingList.filter(
        (item) =>
          item.nomorDO.toLowerCase().includes(q) ||
          item.nim.toLowerCase().includes(q) ||
          item.nama.toLowerCase().includes(q)
      );
    },
    selectedPaketObj() {
      return this.paketList.find((p) => p.kode === this.newDO.paket) || null;
    }
  },
  methods: {
    jalankanPencarian() {
      this.activeQuery = this.searchQuery;
    },
    resetPencarian() {
      this.searchQuery = '';
      this.activeQuery = '';
    },
    getNamaPaket(kodePaket) {
      const p = this.paketList.find((item) => item.kode === kodePaket);
      return p ? `${p.kode} (${p.nama})` : kodePaket;
    },
    simpanDOBaru() {
      if (!this.newDO.nim || !this.newDO.nama || !this.newDO.paket) {
        alert('Lengkapi NIM, Nama, dan Paket Bahan Ajar terlebih dahulu.');
        return;
      }
      const harga = this.selectedPaketObj ? this.selectedPaketObj.harga : 0;
      this.$emit('add-do', {
        nim: this.newDO.nim.trim(),
        nama: this.newDO.nama.trim(),
        ekspedisi: this.newDO.ekspedisi,
        paket: this.newDO.paket,
        tanggalKirim: this.newDO.tanggalKirim,
        total: harga
      });
      this.showNewDOForm = false;
      this.newDO.nim = '';
      this.newDO.nama = '';
      this.newDO.paket = '';
    },
    tambahRiwayat(nomorDO) {
      const keterangan = (this.newLogText[nomorDO] || '').trim();
      if (!keterangan) return;
      this.$emit('add-tracking-log', { nomorDO, keterangan });
      this.$set(this.newLogText, nomorDO, '');
    }
  }
});