import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { Trip, TripStatus, MeetingPoint } from '../types';
import { POPULAR_MOUNTAINS } from '../data/mountains';
import { calculateDuration, generateDefaultItinerary } from '../utils/formatters';
import { ItineraryEditor } from './ItineraryEditor';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trip: Trip) => void;
  tripToEdit?: Trip | null;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tripToEdit,
}) => {
  const [selectedMountainIndex, setSelectedMountainIndex] = useState<string>('0');
  const [namaGunung, setNamaGunung] = useState('');
  const [ketinggianMdpl, setKetinggianMdpl] = useState('');
  const [jalur, setJalur] = useState('');
  const [customTrail, setCustomTrail] = useState('');
  const [status, setStatus] = useState<TripStatus>('Buka');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [durasi, setDurasi] = useState('2 Hari 1 Malam');
  const [minPeserta, setMinPeserta] = useState('15');
  const [maxPeserta, setMaxPeserta] = useState('30');
  const [mepoList, setMepoList] = useState<MeetingPoint[]>([
    { lokasi: 'Basecamp', harga: 'IDR 600.000' },
    { lokasi: 'Stasiun Terdekat', harga: 'IDR 750.000' },
  ]);
  const [includeText, setIncludeText] = useState('');
  const [excludeText, setExcludeText] = useState('');
  const [extraPorter, setExtraPorter] = useState('');
  const [skText, setSkText] = useState('');
  const [catatanPenting, setCatatanPenting] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [kontakWa, setKontakWa] = useState('+6282230444428');
  const [kontakIg, setKontakIg] = useState('Cito Adventure Madiun');

  // Available trails for currently selected mountain
  const currentMountain = POPULAR_MOUNTAINS[parseInt(selectedMountainIndex, 10)] || null;

  useEffect(() => {
    if (tripToEdit) {
      // Edit mode
      setNamaGunung(tripToEdit.nama_gunung);
      setKetinggianMdpl(tripToEdit.ketinggian_mdpl);
      setJalur(tripToEdit.jalur);
      setStatus(tripToEdit.status || 'Buka');
      setTanggalMulai(tripToEdit.tanggal_mulai);
      setTanggalSelesai(tripToEdit.tanggal_selesai);
      setDurasi(tripToEdit.durasi);
      setMinPeserta(tripToEdit.min_peserta);
      setMaxPeserta(tripToEdit.max_peserta);
      setMepoList(
        tripToEdit.harga_mepo && tripToEdit.harga_mepo.length > 0
          ? tripToEdit.harga_mepo
          : [{ lokasi: '', harga: '' }]
      );
      setIncludeText((tripToEdit.include || []).join('\n'));
      setExcludeText((tripToEdit.exclude || []).join('\n'));
      setExtraPorter(tripToEdit.extra_porter || '');
      setSkText((tripToEdit.sk_berlaku || []).join('\n'));
      setCatatanPenting(tripToEdit.catatan_penting || '');
      setItinerary(tripToEdit.itinerary || '');
      setKontakWa(tripToEdit.kontak_wa || '+6282230444428');
      setKontakIg(tripToEdit.kontak_ig || 'Cito Adventure Madiun');

      // Check if matches known mountain
      const mIndex = POPULAR_MOUNTAINS.findIndex(
        m => m.name.toLowerCase() === tripToEdit.nama_gunung.toLowerCase()
      );
      if (mIndex !== -1) {
        setSelectedMountainIndex(mIndex.toString());
      } else {
        setSelectedMountainIndex('custom');
      }
    } else {
      // New Trip Default: Gunung Sindoro
      const defaultMtn = POPULAR_MOUNTAINS[0];
      setSelectedMountainIndex('0');
      setNamaGunung(defaultMtn.name);
      setKetinggianMdpl(defaultMtn.height);
      setJalur(defaultMtn.trails[0] || 'Via Kledung');
      setStatus('Buka');
      setTanggalMulai('2026-09-10');
      setTanggalSelesai('2026-09-11');
      setDurasi('2 Hari 1 Malam');
      setMinPeserta('15');
      setMaxPeserta('30');
      setMepoList([
        { lokasi: 'Basecamp Kledung', harga: 'IDR 600.000' },
        { lokasi: 'Stasiun Purwokerto', harga: 'IDR 750.000' },
        { lokasi: 'Madiun (Meeting Point)', harga: 'IDR 700.000' }
      ]);
      setIncludeText([
        'Transportasi PP AC sesuai meeting point',
        'Simaksi & Asuransi Pendakian Resmi',
        'Tenda kapasitas 4 (diisi 3 orang agar nyaman)',
        'Matras busa per peserta',
        'Makan selama masa pendakian (menu bergizi)',
        'Welcome drink hangat (kopi/teh) & air mineral',
        'Peralatan masak & makan kelompok',
        'Porter tim (membawa tenda & logistik bersama)',
        'Tour Leader & Guide Berpengalaman Cito Adventure',
        'Dokumentasi perjalanan & P3K standar'
      ].join('\n'));
      setExcludeText([
        'Perlengkapan pribadi (carrier, sleeping bag, pakaian hangat)',
        'Ojek basecamp ke pos 1 (opsional)',
        'Obat-obatan pribadi khusus',
        'Logistik camilan pribadi',
        'Tips sukarela crew / guide / porter'
      ].join('\n'));
      setExtraPorter('Tersedia jika diperlukan (Rp 300.000 / hari)');
      setSkText([
        'Terbuka untuk umum (solo hiker dipersilakan join)',
        'DP minimal 50% untuk pengamanan kuota seat',
        'Pelunasan maksimal H-3 sebelum keberangkatan',
        'Pembatalan oleh peserta DP hangus namun bisa digantikan orang lain',
        'Wajib membawa surat keterangan sehat dari dokter'
      ].join('\n'));
      setCatatanPenting('Sebelum mendaki, sangat disarankan untuk latihan fisik ringan (jogging) minimal seminggu sebelum keberangkatan. Suhu di puncak bisa mencapai 5-8 derajat celcius, pastikan jaket windproof dan sleeping bag dibawa.');
      setItinerary(generateDefaultItinerary(defaultMtn.name, defaultMtn.trails[0], '2026-09-10', '2026-09-11'));
      setKontakWa('+6282230444428');
      setKontakIg('Cito Adventure Madiun');
    }
  }, [tripToEdit, isOpen]);

  // Handle mountain dropdown change
  const handleMountainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMountainIndex(val);
    if (val === 'custom') {
      setNamaGunung('');
      setKetinggianMdpl('');
      setJalur('');
    } else {
      const m = POPULAR_MOUNTAINS[parseInt(val, 10)];
      if (m) {
        setNamaGunung(m.name);
        setKetinggianMdpl(m.height);
        const firstTrail = m.trails[0] || 'Via Basecamp';
        setJalur(firstTrail);
        // Refresh default itinerary for this mountain if empty or default
        if (!itinerary || itinerary.includes('ITINERARY PENDAKIAN')) {
          setItinerary(generateDefaultItinerary(m.name, firstTrail, tanggalMulai, tanggalSelesai));
        }
      }
    }
  };

  // Handle trail selection
  const handleTrailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom_trail') {
      setJalur('');
    } else {
      setJalur(val);
      if (itinerary.includes('ITINERARY PENDAKIAN')) {
        setItinerary(generateDefaultItinerary(namaGunung, val, tanggalMulai, tanggalSelesai));
      }
    }
  };

  // When dates change, auto-calculate duration
  const handleStartDateChange = (val: string) => {
    setTanggalMulai(val);
    if (val && tanggalSelesai) {
      setDurasi(calculateDuration(val, tanggalSelesai));
    }
  };

  const handleEndDateChange = (val: string) => {
    setTanggalSelesai(val);
    if (tanggalMulai && val) {
      setDurasi(calculateDuration(tanggalMulai, val));
    }
  };

  // Fill default itinerary template with H-1
  const handleGenerateItinerarySample = () => {
    setItinerary(generateDefaultItinerary(namaGunung, jalur, tanggalMulai, tanggalSelesai));
  };

  // Meeting point dynamic helpers
  const handleAddMepo = () => {
    setMepoList([...mepoList, { lokasi: '', harga: '' }]);
  };

  const handleRemoveMepo = (index: number) => {
    setMepoList(mepoList.filter((_, i) => i !== index));
  };

  const handleMepoChange = (index: number, field: 'lokasi' | 'harga', val: string) => {
    const updated = [...mepoList];
    if (field === 'harga') {
      const digits = val.replace(/[^0-9]/g, '');
      const formatted = digits ? `IDR ${Number(digits).toLocaleString('id-ID')}` : val;
      updated[index].harga = formatted;
    } else {
      updated[index].lokasi = val;
    }
    setMepoList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGunung.trim() || !jalur.trim()) {
      alert('Nama Gunung dan Jalur wajib diisi!');
      return;
    }

    const trip: Trip = {
      id: tripToEdit?.id || `trip-${Date.now()}`,
      nama_gunung: namaGunung.trim(),
      ketinggian_mdpl: ketinggianMdpl.trim(),
      jalur: jalur.trim(),
      status,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      durasi: durasi.trim(),
      min_peserta: minPeserta.trim(),
      max_peserta: maxPeserta.trim(),
      harga_mepo: mepoList.filter(m => m.lokasi.trim() || m.harga.trim()),
      include: includeText.split('\n').map(s => s.trim()).filter(Boolean),
      exclude: excludeText.split('\n').map(s => s.trim()).filter(Boolean),
      extra_porter: extraPorter.trim(),
      sk_berlaku: skText.split('\n').map(s => s.trim()).filter(Boolean),
      catatan_penting: catatanPenting.trim(),
      itinerary: itinerary.trim(),
      kontak_wa: kontakWa.trim(),
      kontak_ig: kontakIg.trim(),
      background_url: tripToEdit?.background_url,
      background_overlay_dim: tripToEdit?.background_overlay_dim,
      logo_url: tripToEdit?.logo_url,
      created_at: tripToEdit?.created_at || Date.now(),
      updated_at: Date.now(),
    };

    onSave(trip);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border-2 border-[#275d1d] text-gray-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#275d1d] px-5 sm:px-6 py-4 border-b border-[#275d1d] flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#d1d1d1] uppercase font-['Space_Grotesk']">
              Formulir Trip Cito Adventure
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-white">
              {tripToEdit ? 'Edit Data Trip' : 'Tambah Open Trip Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-black/20 p-1.5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Gunung & Jalur */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk'] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              1. Identitas Gunung & Jalur Pendakian
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Dropdown Nama Gunung */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Pilih Gunung Populer Indonesia (Lengkap MDPL):
                </label>
                <select
                  value={selectedMountainIndex}
                  onChange={handleMountainChange}
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 font-medium focus:border-[#275d1d] focus:ring-1 focus:ring-[#275d1d] focus:outline-none"
                >
                  {POPULAR_MOUNTAINS.map((m, idx) => (
                    <option key={idx} value={idx.toString()}>
                      {m.name} ({m.height}) - {m.province}
                    </option>
                  ))}
                  <option value="custom">✏️ Gunung Lainnya (Ketik Manual)</option>
                </select>
              </div>

              {/* Status Trip (Buka / Tutup Saja) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Status Trip:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Buka')}
                    className={`py-2 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'Buka'
                        ? 'bg-[#275d1d] text-white shadow-sm ring-2 ring-[#275d1d]'
                        : 'bg-[#d1d1d1] text-gray-800 hover:bg-[#c4c4c4]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Buka
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Tutup')}
                    className={`py-2 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'Tutup'
                        ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-700'
                        : 'bg-[#d1d1d1] text-gray-800 hover:bg-[#c4c4c4]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Tutup
                  </button>
                </div>
              </div>
            </div>

            {/* If custom mountain is selected */}
            {selectedMountainIndex === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Nama Gunung Kustom:</label>
                  <input
                    type="text"
                    value={namaGunung}
                    onChange={(e) => setNamaGunung(e.target.value)}
                    placeholder="Contoh: Gunung Ciremai"
                    className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Ketinggian (MDPL):</label>
                  <input
                    type="text"
                    value={ketinggianMdpl}
                    onChange={(e) => setKetinggianMdpl(e.target.value)}
                    placeholder="Contoh: 3.078 MDPL"
                    className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Jalur Dropdown & Input */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Via Jalur Pendakian (Pilih rekomendasi atau ketik sendiri):
              </label>
              {currentMountain && currentMountain.trails.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={currentMountain.trails.includes(jalur) ? jalur : 'custom_trail'}
                    onChange={handleTrailChange}
                    className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 font-medium focus:border-[#275d1d] focus:outline-none"
                  >
                    {currentMountain.trails.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="custom_trail">✏️ Ketik Jalur Lainnya...</option>
                  </select>

                  {(!currentMountain.trails.includes(jalur) || jalur === '') && (
                    <input
                      type="text"
                      value={jalur}
                      onChange={(e) => setJalur(e.target.value)}
                      placeholder="Ketik nama jalur kustom, misal: Via Watu Lunyu"
                      className="w-full bg-white border-2 border-[#275d1d] rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none mt-1"
                      required
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={jalur}
                  onChange={(e) => setJalur(e.target.value)}
                  placeholder="Contoh: Via Kledung"
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                  required
                />
              )}
            </div>
          </div>

          {/* Section 2: Tanggal & Durasi */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk'] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              2. Tanggal Pelaksanaan & Durasi Otomatis
            </h3>

            {/* Date Range: Mulai & Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Tanggal Mulai Pendakian:
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Tanggal Selesai:
                </label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Kolom Durasi Tepat di Bawah Tanggal */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#275d1d]" />
                <span>Durasi Pendakian (Otomatis Menghitung Hari/Malam):</span>
              </label>
              <input
                type="text"
                value={durasi}
                onChange={(e) => setDurasi(e.target.value)}
                placeholder="Contoh: 2 Hari 1 Malam"
                className="w-full bg-white border-2 border-[#275d1d] rounded-md px-3 py-2 text-xs sm:text-sm text-[#275d1d] font-extrabold focus:border-[#275d1d] focus:outline-none"
                required
              />
              <p className="text-[11px] text-gray-600 mt-1">
                *Otomatis mengisi (mis. 10–11 otomatis 2H1M, 10–12 otomatis 3H2M) namun tetap bisa diedit manual bila ada keterangan khusus.
              </p>
            </div>
          </div>

          {/* Section 3: Kuota Peserta & Notifikasi */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk']">
              3. Kuota Peserta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Minimal Peserta (pax):</label>
                <input
                  type="number"
                  value={minPeserta}
                  onChange={(e) => setMinPeserta(e.target.value)}
                  placeholder="15"
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Maksimal Peserta (pax):</label>
                <input
                  type="number"
                  value={maxPeserta}
                  onChange={(e) => setMaxPeserta(e.target.value)}
                  placeholder="30"
                  className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                />
              </div>
            </div>

            {/* Notifikasi Wajib di Bawah Peserta */}
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#275d1d]/10 border border-[#275d1d]/30 text-[#1b3a16] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#275d1d]" />
              <span>(Jika peserta kurang akan ada penyesuaian harga)</span>
            </div>
          </div>

          {/* Section 4: Tarif Meeting Point (MEPO) */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk']">
                4. Tarif per Meeting Point (MEPO)
              </h3>
              <button
                type="button"
                onClick={handleAddMepo}
                className="text-xs font-bold text-[#275d1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Titik Kumpul
              </button>
            </div>

            <div className="space-y-2">
              {mepoList.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.lokasi}
                    onChange={(e) => handleMepoChange(idx, 'lokasi', e.target.value)}
                    placeholder="Lokasi (mis. Basecamp / Stasiun Purwokerto)"
                    className="flex-1 bg-white border border-[#275d1d]/40 rounded-md px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={m.harga}
                    onChange={(e) => handleMepoChange(idx, 'harga', e.target.value)}
                    placeholder="Harga (mis. 600000 -> IDR 600.000)"
                    className="w-36 sm:w-44 bg-white border border-[#275d1d]/40 rounded-md px-3 py-1.5 text-xs sm:text-sm text-[#275d1d] font-bold focus:border-[#275d1d] focus:outline-none"
                  />
                  {mepoList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMepo(idx)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Include & Exclude */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
              <label className="block text-xs font-bold text-[#275d1d] uppercase font-['Space_Grotesk']">
                5. Fasilitas Include (1 per baris):
              </label>
              <textarea
                rows={6}
                value={includeText}
                onChange={(e) => setIncludeText(e.target.value)}
                placeholder="Transportasi PP&#10;Simaksi resmi&#10;Tenda & matras&#10;Makan 3x"
                className="w-full bg-white border border-[#275d1d]/40 rounded-md p-2.5 text-xs text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
              <label className="block text-xs font-bold text-gray-800 uppercase font-['Space_Grotesk']">
                Fasilitas Exclude (1 per baris):
              </label>
              <textarea
                rows={6}
                value={excludeText}
                onChange={(e) => setExcludeText(e.target.value)}
                placeholder="Perlengkapan pribadi&#10;Obat pribadi&#10;Camilan pribadi"
                className="w-full bg-white border border-[#275d1d]/40 rounded-md p-2.5 text-xs text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
          </div>

          {/* Extra porter */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Extra Porter Pribadi (Opsional):
            </label>
            <input
              type="text"
              value={extraPorter}
              onChange={(e) => setExtraPorter(e.target.value)}
              placeholder="Contoh: Jika diperlukan Rp 300.000 / hari"
              className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
            />
          </div>

          {/* Section 6: S&K & Catatan Penting */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk']">
              6. Syarat Ketentuan & Catatan Penting
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">S&K Berlaku (1 per baris):</label>
              <textarea
                rows={4}
                value={skText}
                onChange={(e) => setSkText(e.target.value)}
                placeholder="Terbuka untuk umum&#10;DP minimal 50%"
                className="w-full bg-white border border-[#275d1d]/40 rounded-md p-2.5 text-xs text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Catatan Penting:</label>
              <textarea
                rows={3}
                value={catatanPenting}
                onChange={(e) => setCatatanPenting(e.target.value)}
                placeholder="Latihan fisik seminggu sebelum pendakian, bawa jaket windproof..."
                className="w-full bg-white border border-[#275d1d]/40 rounded-md p-2.5 text-xs text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 7: Kontak Booking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                7. Kontak WhatsApp:
              </label>
              <input
                type="text"
                value={kontakWa}
                onChange={(e) => setKontakWa(e.target.value)}
                placeholder="+6282230444428"
                className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Instagram:</label>
              <input
                type="text"
                value={kontakIg}
                onChange={(e) => setKontakIg(e.target.value)}
                placeholder="Cito Adventure Madiun"
                className="w-full bg-white border border-[#275d1d]/40 rounded-md px-3 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#275d1d] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 8: Itinerary / Rundown (Kolom & Tabel Input Builder) - Paling Bawah di Bawah Kontak WA */}
          <div className="space-y-3 bg-[#f5f5f5] p-4 rounded-lg border border-[#275d1d]/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-[#275d1d] tracking-wider uppercase font-['Space_Grotesk']">
                8. Itinerary / Rundown Kegiatan (Kolom Hari, Tanggal, Jam & Keterangan)
              </h3>
            </div>
            <p className="text-[11px] text-gray-700">
              Isi rundown kegiatan secara rapi menggunakan kolom Hari, Tanggal, Jam Mulai, Jam Selesai, dan Keterangan. Format teks terstruktur akan dihasilkan otomatis untuk pamflet dan arsip tanpa mempengaruhi bagian lain.
            </p>
            <ItineraryEditor
              value={itinerary}
              onChange={setItinerary}
              namaGunung={namaGunung}
              jalur={jalur}
              tanggalMulai={tanggalMulai}
              tanggalSelesai={tanggalSelesai}
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-[#275d1d]/20 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-900 bg-[#d1d1d1] hover:bg-[#c2c2c2] rounded transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#275d1d] hover:bg-[#1f4a17] rounded shadow transition-all cursor-pointer active:scale-95"
            >
              {tripToEdit ? 'Simpan Perubahan' : 'Simpan Trip Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
