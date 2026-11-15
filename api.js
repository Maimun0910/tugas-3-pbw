const DataService = {
  async getAllData() {
    try {
      const response = await fetch('./data/dataBahanAjar.json');
      if (!response.ok) throw new Error('Gagal memuat dataBahanAjar.json');
      const rawData = await response.json();

      // Normalisasi array tracking yang berbentuk [{ "DO2025-0001": {...} }, ...]
      // menjadi array datar dengan properti nomorDO eksplisit & bebas duplikasi identik
      const trackingMap = new Map();
      if (Array.isArray(rawData.tracking)) {
        rawData.tracking.forEach((entryObj) => {
          Object.keys(entryObj).forEach((nomorDO) => {
            trackingMap.set(nomorDO, {
              nomorDO: nomorDO,
              ...entryObj[nomorDO]
            });
          });
        });
      }

      return {
        upbjjList: rawData.upbjjList || [],
        kategoriList: rawData.kategoriList || [],
        pengirimanList: rawData.pengirimanList || [],
        paket: rawData.paket || [],
        stok: rawData.stok || [],
        tracking: Array.from(trackingMap.values())
      };
    } catch (error) {
      console.error('Error DataService:', error);
      return null;
    }
  }
};