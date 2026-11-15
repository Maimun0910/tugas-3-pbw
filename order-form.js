Vue.component('order-form', {
  template: '#tpl-order-form',
  props: {
    paketList: { type: Array, required: true },
    stokList: { type: Array, required: true },
    pengirimanList: { type: Array, required: true },
    upbjjList: { type: Array, required: true }
  },
  data() {
    return {
      order: {
        nim: '',
        nama: '',
        upbjj: '',
        kodePaket: '',
        kodePengiriman: 'REG',
        ekspedisi: 'JNE'
      },
      selectedPaketDetail: null,
      orderSuccessMsg: '',
      validationMsg: ''
    };
  },
  watch: {
    // WATCHER 2: Memantau pilihan paket dan memuat detail mata kuliah penyusun paket
    'order.kodePaket'(newKode) {
      this.selectedPaketDetail = this.paketList.find((p) => p.kode === newKode) || null;
    }
  },
  computed: {
    detailIsiPaket() {
      if (!this.selectedPaketDetail) return [];
      return this.selectedPaketDetail.isi.map((kodeMK) => {
        const found = this.stokList.find((s) => s.kode === kodeMK);
        return found ? `${found.kode} - ${found.judul}` : kodeMK;
      });
    },
    biayaKirim() {
      return this.order.kodePengiriman === 'EXP' ? 25000 : 10000;
    },
    totalBayar() {
      const hargaPaket = this.selectedPaketDetail ? this.selectedPaketDetail.harga : 0;
      return hargaPaket + (hargaPaket > 0 ? this.biayaKirim : 0);
    }
  },
  methods: {
    submitPesanan() {
      if (!/^\d{9}$/.test(this.order.nim.trim())) {
        this.validationMsg = 'NIM harus terdiri dari 9 digit angka.';
        return;
      }
      if (!this.order.nama.trim() || !this.order.kodePaket || !this.order.upbjj) {
        this.validationMsg = 'Nama mahasiswa, UT Daerah, dan Paket Bahan Ajar wajib dipilih.';
        return;
      }

      this.validationMsg = '';
      const payload = {
        nim: this.order.nim.trim(),
        nama: this.order.nama.trim(),
        ekspedisi: this.order.ekspedisi,
        paket: this.order.kodePaket,
        total: this.totalBayar,
        upbjj: this.order.upbjj
      };

      this.$emit('create-order', payload, (generatedDO) => {
        this.orderSuccessMsg = `Pesanan berhasil dibuat! Nomor Delivery Order Anda: ${generatedDO}`;
        this.order.nim = '';
        this.order.nama = '';
        this.order.kodePaket = '';
      });
    }
  }
});