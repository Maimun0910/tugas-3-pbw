// INDIKATOR 7: Concept Filter untuk Formatting Data Teks
Vue.filter('rupiah', function (value) {
  if (typeof value !== 'number' || isNaN(value)) return 'Rp 0';
  return 'Rp ' + value.toLocaleString('id-ID');
});

Vue.filter('unitBuku', function (value) {
  const num = Number(value) || 0;
  return `${num} buah`;
});

new Vue({
  el: '#app',
  data: {
    activeTab: 'stok', // 'stok' | 'order' | 'tracking'
    isLoading: true,
    upbjjList: [],
    kategoriList: [],
    pengirimanList: [],
    paketList: [],
    stokList: [],
    trackingList: []
  },
  async created() {
    const data = await DataService.getAllData();
    if (data) {
      this.upbjjList = data.upbjjList;
      this.kategoriList = data.kategoriList;
      this.pengirimanList = data.pengirimanList;
      this.paketList = data.paket;
      this.stokList = data.stok;
      this.trackingList = data.tracking;
    }
    this.isLoading = false;
  },
  methods: {
    handleAddStok(itemBaru) {
      this.stokList.unshift(itemBaru);
    },
    handleUpdateStok(itemUpdate) {
      const idx = this.stokList.findIndex((s) => s.kode === itemUpdate.kode);
      if (idx !== -1) {
        this.$set(this.stokList, idx, itemUpdate);
      }
    },
    handleDeleteStok(kodeMK) {
      this.stokList = this.stokList.filter((s) => s.kode !== kodeMK);
    },
    generateNomorDO() {
      const tahun = new Date().getFullYear();
      const urutan = String(this.trackingList.length + 1).padStart(4, '0');
      return `DO${tahun}-${urutan}`;
    },
    formatWaktuSekarang() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    },
    handleAddDO(payload, callback) {
      const nomorDO = this.generateNomorDO();
      const doBaru = {
        nomorDO,
        nim: payload.nim,
        nama: payload.nama,
        status: 'Diproses Gudang',
        ekspedisi: payload.ekspedisi,
        tanggalKirim: payload.tanggalKirim || new Date().toISOString().slice(0, 10),
        paket: payload.paket,
        total: payload.total,
        perjalanan: [
          {
            waktu: this.formatWaktuSekarang(),
            keterangan: `Pesanan dibuat & diproses di Gudang UT (${payload.upbjj || 'Pusat'})`
          }
        ]
      };
      this.trackingList.unshift(doBaru);

      // Kurangi stok buku yang termasuk dalam paket pesanan secara otomatis
      const paketObj = this.paketList.find((p) => p.kode === payload.paket);
      if (paketObj && Array.isArray(paketObj.isi)) {
        paketObj.isi.forEach((kodeMK) => {
          const buku = this.stokList.find((s) => s.kode === kodeMK);
          if (buku && buku.qty > 0) {
            buku.qty -= 1;
          }
        });
      }

      if (typeof callback === 'function') callback(nomorDO);
    },
    handleAddTrackingLog({ nomorDO, keterangan }) {
      const target = this.trackingList.find((t) => t.nomorDO === nomorDO);
      if (target) {
        target.perjalanan.push({
          waktu: this.formatWaktuSekarang(),
          keterangan
        });
        target.status = 'Dalam Perjalanan';
      }
    }
  }
});