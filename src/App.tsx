/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TripCard } from './components/TripCard';
import { TripDetail } from './components/TripDetail';
import { TripModal } from './components/TripModal';
import { ItineraryModal } from './components/ItineraryModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toast } from './components/Toast';
import { Trip, TripStatus } from './types';
import { getStoredTrips, saveStoredTrips, resetToDefaultTrips } from './utils/storage';
import { Search, Plus, Filter, Mountain, ArrowLeft, RotateCcw } from 'lucide-react';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [itineraryTrip, setItineraryTrip] = useState<Trip | null>(null);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile view toggle ('list' | 'detail')
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    const loaded = getStoredTrips();
    setTrips(loaded);
    if (loaded.length > 0) {
      setSelectedTripId(loaded[0].id);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleSaveTrip = (savedTrip: Trip) => {
    const exists = trips.some((t) => t.id === savedTrip.id);
    let updated: Trip[];
    if (exists) {
      updated = trips.map((t) => (t.id === savedTrip.id ? savedTrip : t));
      showToast(`Trip ${savedTrip.nama_gunung} berhasil diperbarui`);
    } else {
      updated = [savedTrip, ...trips];
      showToast(`Trip ${savedTrip.nama_gunung} berhasil ditambahkan`);
    }
    setTrips(updated);
    saveStoredTrips(updated);
    setSelectedTripId(savedTrip.id);
    setMobileTab('detail');
  };

  const handleDeleteTrip = (id: string) => {
    const updated = trips.filter((t) => t.id !== id);
    setTrips(updated);
    saveStoredTrips(updated);
    showToast('Trip berhasil dihapus');
    if (selectedTripId === id) {
      setSelectedTripId(updated[0]?.id || null);
      if (updated.length === 0) {
        setMobileTab('list');
      }
    }
  };

  const handleRequestDelete = (trip: Trip) => {
    setTripToDelete(trip);
    setIsDeleteModalOpen(true);
  };

  const handleRestoreDefaultTrips = () => {
    const defaults = resetToDefaultTrips();
    setTrips(defaults);
    setSelectedTripId(defaults[0]?.id || null);
    showToast('Contoh trip berhasil dimuat kembali');
  };

  const handleOpenAddModal = () => {
    setTripToEdit(null);
    setIsTripModalOpen(true);
  };

  const handleOpenEditModal = (trip: Trip) => {
    setTripToEdit(trip);
    setIsTripModalOpen(true);
  };

  const handleOpenItineraryModal = (trip: Trip) => {
    setItineraryTrip(trip);
    setIsItineraryModalOpen(true);
  };

  const handleUpdateTripItinerary = (newItinerary: string) => {
    if (!itineraryTrip) return;
    const updatedTrip = { ...itineraryTrip, itinerary: newItinerary, updated_at: Date.now() };
    handleSaveTrip(updatedTrip);
    setItineraryTrip(updatedTrip);
  };

  // Filter & Search
  const filteredTrips = trips.filter((t) => {
    const matchesFilter =
      filterStatus === 'Semua' ? true : t.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      t.nama_gunung.toLowerCase().includes(query) ||
      t.jalur.toLowerCase().includes(query) ||
      (t.ketinggian_mdpl && t.ketinggian_mdpl.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const activeTrip = trips.find((t) => t.id === selectedTripId) || filteredTrips[0] || null;

  return (
    <div className="min-h-screen bg-[#d1d1d1] text-[#1a2e16] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#275d1d] selection:text-white">
      {/* Top App Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
        tripCount={trips.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
        {/* Mobile Navigation Pills */}
        <div className="flex md:hidden items-center justify-between gap-2 mb-4 bg-white p-1 rounded-lg border-2 border-[#275d1d]/30 shadow-xs">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
              mobileTab === 'list'
                ? 'bg-[#275d1d] text-white shadow'
                : 'text-[#275d1d] hover:bg-[#e4e4e4]'
            }`}
          >
            Daftar Trip ({filteredTrips.length})
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            disabled={!activeTrip}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
              mobileTab === 'detail'
                ? 'bg-[#275d1d] text-white shadow'
                : 'text-[#275d1d] hover:bg-[#e4e4e4] disabled:opacity-40'
            }`}
          >
            Detail & Export
          </button>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 flex-1 items-start">
          {/* Left Column: Trip Directory & Filters */}
          <aside
            className={`md:col-span-5 lg:col-span-4 space-y-3.5 ${
              mobileTab === 'list' ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Search & Status Filters Card */}
            <div className="bg-white border-2 border-[#275d1d] rounded-xl p-3.5 space-y-3 shadow-md">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#275d1d] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gunung / jalur..."
                  className="w-full bg-[#f4f4f4] border border-[#275d1d]/40 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1a2e16] placeholder-gray-500 focus:outline-none focus:border-[#275d1d]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-[#275d1d] mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#275d1d]" /> Status:
                </span>
                {(['Semua', 'Buka', 'Tutup'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-[#275d1d] text-white shadow-xs'
                        : 'bg-[#d1d1d1] text-[#275d1d] hover:bg-[#bfbfbf]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Cards List */}
            <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    isSelected={activeTrip?.id === trip.id}
                    onSelect={(t) => {
                      setSelectedTripId(t.id);
                      setMobileTab('detail');
                    }}
                    onEdit={handleOpenEditModal}
                    onDelete={handleRequestDelete}
                    onOpenItinerary={handleOpenItineraryModal}
                  />
                ))
              ) : (
                <div className="bg-white border-2 border-dashed border-[#275d1d]/40 rounded-xl p-8 text-center space-y-3">
                  <Mountain className="w-10 h-10 text-[#275d1d]/60 mx-auto" />
                  <p className="text-xs text-gray-700 font-medium">
                    {trips.length === 0
                      ? 'Belum ada arsip trip. Anda bisa membuat trip baru atau memuat contoh.'
                      : 'Tidak ada trip yang sesuai pencarian.'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#275d1d] text-white text-xs font-bold hover:bg-[#1f4a17] transition-all cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Trip Baru</span>
                    </button>
                    {trips.length === 0 && (
                      <button
                        onClick={handleRestoreDefaultTrips}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#275d1d]" />
                        <span>Muat Contoh Trip</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Column: Selected Trip Detail & Media Center */}
          <section
            className={`md:col-span-7 lg:col-span-8 ${
              mobileTab === 'detail' ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Mobile Back to List Button */}
            <div className="md:hidden mb-3">
              <button
                onClick={() => setMobileTab('list')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#275d1d] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Trip</span>
              </button>
            </div>

            {activeTrip ? (
              <TripDetail
                trip={activeTrip}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
                onOpenItinerary={handleOpenItineraryModal}
                onShowToast={showToast}
                onSaveTrip={handleSaveTrip}
              />
            ) : (
              <div className="bg-white border-2 border-[#275d1d] rounded-xl p-12 text-center space-y-4 shadow-md">
                <Mountain className="w-14 h-14 text-[#275d1d]/50 mx-auto" />
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-[#275d1d]">
                  {trips.length === 0 ? 'Belum Ada Jadwal Trip' : 'Pilih atau Tambahkan Trip'}
                </h3>
                <p className="text-xs text-gray-700 max-w-sm mx-auto leading-relaxed">
                  {trips.length === 0
                    ? 'Mulai buat arsip open trip atau private trip Anda untuk menghasilkan pamflet poster, itinerary, dan caption Instagram secara instan.'
                    : 'Pilih salah satu jadwal open trip di sebelah kiri untuk melihat detail, menyalin caption Instagram, atau mengekspor poster pamflet & itinerary.'}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#275d1d] hover:bg-[#1f4a17] text-white text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Open Trip Pertama</span>
                  </button>
                  {trips.length === 0 && (
                    <button
                      onClick={handleRestoreDefaultTrips}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-300 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#275d1d]" />
                      <span>Muat Kembali Contoh Trip</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onSave={handleSaveTrip}
        tripToEdit={tripToEdit}
      />

      <ItineraryModal
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        trip={itineraryTrip}
        onUpdateTripItinerary={handleUpdateTripItinerary}
        onShowToast={showToast}
      />

      <GitHubGuideModal
        isOpen={isGithubGuideOpen}
        onClose={() => setIsGithubGuideOpen(false)}
        onShowToast={showToast}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        trip={tripToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTripToDelete(null);
        }}
        onConfirm={handleDeleteTrip}
      />

      {/* Notifications & Offline Status */}
      <OfflineIndicator />
      <Toast message={toastMessage} />
    </div>
  );
}
