Vue.component('stock-table', {
  template: '#tpl-stock-table',
  props: {
    stokList: { type: Array, required: true },
    upbjjList: { type: Array, required: true },
    kategoriList: { type: Array, required: true }
  },
  data() {
    return {
      // State Filter & Sort
      filterUpbjj: '',
      filterKategori: '',
      filterStokKritis: false,
      sortBy: 'judul',
      sortOrder: 'asc',

      // State Hover Tooltip
      hoveredKode: null,

      // State Form Tambah Baru
      showAddForm: false,
      formError: '',
      newItem: {
        kode: '',
        judul: '',
        kategori: '',
        upbjj: '',
        lokasiRak: '',
        harga: 0,
        qty: 0,
        safety: 10,
        catatanHTML: ''
      },

      // State Edit & Delete Modal
      editingItem: null,
      deletingItem: null
    };
  },
  watch: {
    // WATCHER 1: Reset filterKategori secara otomatis setiap kali filterUpbjj berubah
    filterUpbjj(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.filterKategori = '';
      }
    }
  },
  computed: {
    // Filtering & Sorting dilakukan di computed agar tidak memodifikasi prop asli secara langsung
    processedStok() {
      let hasil = this.stokList.filter((item) => {
        const matchUpbjj = !this.filterUpbjj || item.upbjj === this.filterUpbjj;
        const matchKategori = !this.filterKategori || item.kategori === this.filterKategori;
        const matchKritis = !this.filterStokKritis || (item.qty < item.safety || item.qty === 0);
        return matchUpbjj && matchKategori && matchKritis;
      });

      return hasil.slice().sort((a, b) => {
        let modifier = this.sortOrder === 'asc' ? 1 : -1;
        if (typeof a[this.sortBy] === 'string') {
          return a[this.sortBy].localeCompare(b[this.sortBy]) * modifier;
        }
        return (a[this.sortBy] - b[this.sortBy]) * modifier;
      });
    },
    totalStokMenipis() {
      return this.stokList.filter((i) => i.qty < i.safety).length;
    }
  },
  methods: {
    resetFilters() {
      this.filterUpbjj = '';
      this.filterKategori = '';
      this.filterStokKritis = false;
      this.sortBy = 'judul';
      this.sortOrder = 'asc';
    },
    toggleSort(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = field;
        this.sortOrder = 'asc';
      }
    },
    tambahBahanAjar() {
      if (!this.newItem.kode || !this.newItem.judul || !this.newItem.upbjj || !this.newItem.kategori) {
        this.formError = 'Kode MK, Judul, UT Daerah, dan Kategori wajib diisi!';
        return;
      }
      const duplikat = this.stokList.some(
        (s) => s.kode.toLowerCase() === this.newItem.kode.trim().toLowerCase()
      );
      if (duplikat) {
        this.formError = `Kode mata kuliah "${this.newItem.kode}" sudah terdaftar!`;
        return;
      }

      this.$emit('add-stok', {
        ...this.newItem,
        kode: this.newItem.kode.trim().toUpperCase(),
        judul: this.newItem.judul.trim(),
        catatanHTML: this.newItem.catatanHTML || '<em>Stok baru ditambahkan</em>'
      });

      // Reset form
      this.formError = '';
      this.showAddForm = false;
      this.newItem = {
        kode: '', judul: '', kategori: '', upbjj: '',
        lokasiRak: '', harga: 0, qty: 0, safety: 10, catatanHTML: ''
      };
    },
    openEdit(item) {
      this.editingItem = { ...item };
    },
    simpanEdit() {
      if (!this.editingItem.judul || this.editingItem.qty < 0 || this.editingItem.safety < 0) {
        alert('Judul tidak boleh kosong dan jumlah stok/safety tidak boleh negatif.');
        return;
      }
      this.$emit('update-stok', { ...this.editingItem });
      this.editingItem = null;
    },
    confirmDelete(item) {
      this.deletingItem = item;
    },
    eksekusiHapus() {
      if (this.deletingItem) {
        this.$emit('delete-stok', this.deletingItem.kode);
        this.deletingItem = null;
      }
    }
  }
});