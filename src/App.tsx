/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { TripCard } from './components/TripCard';
import { TripDetail } from './components/TripDetail';
import { TripModal } from './components/TripModal';
import { ItineraryModal } from './components/ItineraryModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BatchDeleteModal } from './components/BatchDeleteModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toast } from './components/Toast';
import { TeamInputView } from './components/TeamInputView';
import { TeamDataModal } from './components/TeamDataModal';
import { MediaKitView } from './components/MediaKitView';
import { ExpeditionTruckLoader } from './components/ExpeditionTruckLoader';
import { findTripBySlugOrId, getTripSlug, getTripMediaKitUrl } from './utils/slug';
import { Trip, TripStatus } from './types';
import {
  getStoredTrips,
  saveStoredTrips,
  resetToDefaultTrips,
  syncCloudLogoToLocal,
  getDeletedTripIds,
  recordDeletedTripId,
  unrecordDeletedTripId,
  isMasYunoAuthenticated,
  setMasYunoAuthenticated,
  checkAdminAccessInUrl,
  sortTripsByDepartureDate,
} from './utils/storage';
import {
  subscribeToCloudTrips,
  saveTripToCloud,
  deleteTripFromCloud,
  seedInitialTripsToCloud,
  subscribeToCloudLogo,
  subscribeToCloudTripDefaults,
} from './firebase';
import { syncCloudTripDefaultsToLocal } from './utils/tripDefaults';
import { playIncomingDraftChime } from './utils/audioNotify';
import { Search, Plus, Filter, Mountain, ArrowLeft, RotateCcw, Bell, X, CheckCircle, Link2, Trash2 } from 'lucide-react';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const urlTripId = params.get('trip');
    if (urlTripId) return urlTripId;
    try {
      return localStorage.getItem('cito_active_trip_id') || null;
    } catch {
      return null;
    }
  });
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [tripStatusFilter, setTripStatusFilter] = useState<'semua' | 'admin' | 'tim' | 'draft' | 'final'>('semua');
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [viewMode, setViewMode] = useState<'admin' | 'tim'>(() => {
    if (typeof window === 'undefined') return 'tim';
    // 1. Cek apakah link mengandung kunci rahasia Mas Yuno (?admin=yuno atau ?kunci=yuno atau #masyuno)
    const hasSecret = checkAdminAccessInUrl(window.location.search, window.location.hash);
    if (hasSecret) {
      setMasYunoAuthenticated(true);
      return 'admin';
    }
    // 2. Cek apakah browser ini sudah terverifikasi sebagai Mas Yuno sebelumnya
    const isAuth = isMasYunoAuthenticated();
    if (!isAuth) {
      // DEFAULT SEMUA PERANGKAT BARU / HP TIM: 100% TERKUNCI DI MODE TIM!
      return 'tim';
    }
    // 3. Jika Mas Yuno telah terverifikasi tapi sengaja membuka link ?mode=tim
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'tim' || window.location.hash === '#tim') {
      return 'tim';
    }
    return 'admin';
  });
  const [isInitialAppLoading, setIsInitialAppLoading] = useState(true);
  const [isDraftBannerDismissed, setIsDraftBannerDismissed] = useState(false);
  const knownDraftIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAppLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [itineraryTrip, setItineraryTrip] = useState<Trip | null>(null);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isTeamDataModalOpen, setIsTeamDataModalOpen] = useState(false);
  const [previewMediaKitTrip, setPreviewMediaKitTrip] = useState<Trip | null>(null);
  const [activeMediaKitTripId, setActiveMediaKitTripId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('kit') || params.get('mediakit') || null;
  });

  // Batch delete & selection states
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTripIds, setSelectedTripIds] = useState<Set<string>>(new Set());
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile view toggle ('list' | 'detail')
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>(() => {
    if (typeof window === 'undefined') return 'list';
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'detail' || params.get('trip')) return 'detail';
    return 'list';
  });

  // Sinkronisasi selectedTripId & mobileTab ke URL query params & localStorage agar tahan refresh di HP & PC
  const handleSelectTrip = useCallback((tripId: string, tab?: 'list' | 'detail') => {
    setSelectedTripId(tripId);
    try {
      localStorage.setItem('cito_active_trip_id', tripId);
    } catch {}

    const newTab = tab || 'detail';
    setMobileTab(newTab);

    // Update URL tanpa reload halaman
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('trip', tripId);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    // 1. Instant local read so app renders immediately without empty flash
    const localTrips = sortTripsByDepartureDate(getStoredTrips());
    setTrips(localTrips);
    if (localTrips.length > 0) {
      setSelectedTripId((prev) => {
        if (prev && localTrips.some((t) => t.id === prev)) {
          return prev;
        }
        return localTrips[0].id;
      });
    }
    // Seed initial draft IDs so existing drafts don't trigger sound on first page open
    const initialDrafts = localTrips.filter((t) => t.is_draft);
    initialDrafts.forEach((t) => knownDraftIdsRef.current.add(t.id));

    // 2. Real-time Cloud Firestore subscription: Cloud is the Single Source of Truth
    let isInitialFetch = true;
    const unsubscribeTrips = subscribeToCloudTrips(
      (cloudTrips) => {
        setCloudStatus('synced');
        const deletedIds = getDeletedTripIds();

        // Filter out any cloud trips that were explicitly deleted on this device
        const validCloudTrips = cloudTrips.filter((t) => !deletedIds.has(t.id));

        let finalTrips: Trip[];
        if (validCloudTrips.length > 0) {
          // Cloud has data -> Cloud is authoritative!
          finalTrips = sortTripsByDepartureDate(validCloudTrips);
        } else {
          // Cloud is empty -> fallback to current local storage (if any)
          const currentLocals = getStoredTrips().filter((t) => !deletedIds.has(t.id));
          finalTrips = sortTripsByDepartureDate(currentLocals);
        }

        // Detect newly incoming drafts specifically submitted by the TEAM (real-time alert)
        const incomingTeamDrafts = finalTrips.filter(
          (t) => t.is_draft && t.from_team && !knownDraftIdsRef.current.has(t.id)
        );
        if (incomingTeamDrafts.length > 0) {
          incomingTeamDrafts.forEach((t) => knownDraftIdsRef.current.add(t.id));

          // If not initial fetch, trigger sound and notification
          if (!isInitialFetch) {
            playIncomingDraftChime();
            setIsDraftBannerDismissed(false);
            const latest = incomingTeamDrafts[0];
            showToast(`🔔 Draf baru masuk dari tim: ${latest.nama_gunung} (${latest.jalur})!`);
          }
        }

        // Synchronize state and local cache with Cloud data (ZERO automatic background writes!)
        setTrips(finalTrips);
        saveStoredTrips(finalTrips);
        setSelectedTripId((prev) => {
          if (prev && finalTrips.some((t) => t.id === prev)) {
            return prev;
          }
          return finalTrips[0]?.id || null;
        });

        isInitialFetch = false;
      },
      (error) => {
        console.warn('Cloud sync error or offline:', error);
        setCloudStatus('offline');
      }
    );

    // 3. Real-time Logo synchronization across devices
    const unsubscribeLogo = subscribeToCloudLogo((cloudLogo) => {
      syncCloudLogoToLocal(cloudLogo);
    });

    // 4. Real-time Trip Defaults synchronization across devices
    const unsubscribeDefaults = subscribeToCloudTripDefaults((cloudDefaults) => {
      syncCloudTripDefaultsToLocal(cloudDefaults);
    });

    return () => {
      unsubscribeTrips();
      unsubscribeLogo();
      unsubscribeDefaults();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleSaveTrip = (savedTrip: Trip) => {
    unrecordDeletedTripId(savedTrip.id);
    // Mark as already known so local admin draft saves never trigger incoming team alert
    knownDraftIdsRef.current.add(savedTrip.id);

    const exists = trips.some((t) => t.id === savedTrip.id);
    let updated: Trip[];
    const authorTag = savedTrip.from_team ? '(Draf Tim)' : '(Dari Admin)';
    if (exists) {
      updated = trips.map((t) => (t.id === savedTrip.id ? savedTrip : t));
      const statusText = savedTrip.is_draft ? '🔴 Draft diperbarui' : '🟢 Trip diperbarui';
      showToast(`${statusText} ${authorTag}: ${savedTrip.nama_gunung} (Tersinkron ke Cloud)`);
    } else {
      updated = [savedTrip, ...trips];
      const statusText = savedTrip.is_draft ? '🔴 Draft baru tersimpan' : '🟢 Trip baru ditambahkan';
      showToast(`${statusText} ${authorTag}: ${savedTrip.nama_gunung} (Tersinkron ke Cloud)`);
    }
    updated = sortTripsByDepartureDate(updated);
    setTrips(updated);
    saveStoredTrips(updated);
    setSelectedTripId(savedTrip.id);
    setMobileTab('detail');

    // Sync directly to Cloud Firestore in background
    setCloudStatus('syncing');
    saveTripToCloud(savedTrip)
      .then(() => {
        setCloudStatus('synced');
      })
      .catch((err) => {
        console.error('Failed to sync trip to cloud:', err);
        setCloudStatus('offline');
      });
  };

  const handleDeleteTrip = (id: string) => {
    recordDeletedTripId(id);
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

    // Delete directly from Cloud Firestore in background
    setCloudStatus('syncing');
    deleteTripFromCloud(id)
      .then(() => {
        setCloudStatus('synced');
      })
      .catch((err) => {
        console.error('Failed to delete trip from cloud:', err);
        setCloudStatus('offline');
      });
  };

  const handleRequestDelete = (trip: Trip) => {
    setTripToDelete(trip);
    setIsDeleteModalOpen(true);
  };

  const DEFAULT_SAMPLE_IDS = new Set(['sindoro-watu-lunyu', 'sumbing-butuh', 'merbabu-suwanting']);

  const handleToggleSelectTrip = (id: string) => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allSelected =
      filteredTrips.length > 0 && filteredTrips.every((t) => selectedTripIds.has(t.id));
    if (allSelected) {
      setSelectedTripIds((prev) => {
        const next = new Set(prev);
        filteredTrips.forEach((t) => next.delete(t.id));
        return next;
      });
    } else {
      setSelectedTripIds((prev) => {
        const next = new Set(prev);
        filteredTrips.forEach((t) => next.add(t.id));
        return next;
      });
    }
  };

  const handleSelectPreset = (preset: 'default' | 'draft' | 'final') => {
    setSelectedTripIds((prev) => {
      const next = new Set(prev);
      if (preset === 'default') {
        trips.forEach((t) => {
          if (DEFAULT_SAMPLE_IDS.has(t.id)) next.add(t.id);
        });
      } else if (preset === 'draft') {
        trips.forEach((t) => {
          if (t.is_draft) next.add(t.id);
        });
      } else if (preset === 'final') {
        trips.forEach((t) => {
          if (!t.is_draft) next.add(t.id);
        });
      }
      return next;
    });
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedTripIds.size === 0) return;
    setIsBatchDeleting(true);
    const idsToDelete: string[] = Array.from(selectedTripIds);

    // 1. Record in deleted IDs so cloud sync never resurrects them
    idsToDelete.forEach((id: string) => recordDeletedTripId(id));

    // 2. Update local state and storage
    const updated = trips.filter((t) => !selectedTripIds.has(t.id));
    setTrips(updated);
    saveStoredTrips(updated);

    // 3. Reset active selected trip if it was deleted
    if (selectedTripId && selectedTripIds.has(selectedTripId)) {
      setSelectedTripId(updated[0]?.id || null);
      if (updated.length === 0) {
        setMobileTab('list');
      }
    }

    // 4. Background deletion from Cloud Firestore
    setCloudStatus('syncing');
    Promise.allSettled(idsToDelete.map((id: string) => deleteTripFromCloud(id)))
      .then(() => {
        setCloudStatus('synced');
      })
      .catch((err) => {
        console.warn('Batch delete cloud sync notice:', err);
        setCloudStatus('offline');
      });

    showToast(`✓ Berhasil menghapus ${idsToDelete.length} trip terpilih!`);
    setSelectedTripIds(new Set());
    setIsSelectMode(false);
    setIsBatchDeleteModalOpen(false);
    setIsBatchDeleting(false);
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
    // 1. Status Filter Khusus Admin (Semua, Dari Admin, Dari Tim, Draft, Final)
    if (tripStatusFilter === 'admin' && t.from_team) return false;
    if (tripStatusFilter === 'tim' && !t.from_team) return false;
    if (tripStatusFilter === 'draft' && !t.is_draft) return false;
    if (tripStatusFilter === 'final' && t.is_draft) return false;

    // 2. Filter Status Buka / Tutup
    const matchesFilter =
      filterStatus === 'Semua' ? true : t.status === filterStatus;

    // 3. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      t.nama_gunung.toLowerCase().includes(query) ||
      t.jalur.toLowerCase().includes(query) ||
      (t.ketinggian_mdpl && t.ketinggian_mdpl.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const adminTrips = trips.filter((t) => !t.from_team);
  const draftTrips = trips.filter((t) => t.is_draft);
  const teamDraftTrips = trips.filter((t) => t.is_draft && t.from_team);
  const teamTrips = trips.filter((t) => t.from_team);
  const finalTrips = trips.filter((t) => !t.is_draft);
  const activeTrip = trips.find((t) => t.id === selectedTripId) || filteredTrips[0] || null;

  const handleCopyTeamLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?mode=tim`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link Form Tim berhasil disalin! Siap dikirimkan ke WhatsApp tim lapangan.');
      }).catch(() => {
        prompt('Salin link lembar input jadwal tim ini:', url);
      });
    } else {
      prompt('Salin link lembar input jadwal tim ini:', url);
    }
  };

  const handleCopyAdminKeyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?admin=yuno`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔑 Link Kunci Akses Mas Yuno berhasil disalin! Simpan di WhatsApp/Catatan pribadi Mas Yuno.');
      }).catch(() => {
        prompt('Salin link Kunci Akses Mas Yuno:', url);
      });
    } else {
      prompt('Salin link Kunci Akses Mas Yuno:', url);
    }
  };

  const handleLockToTeamMode = () => {
    if (confirm('Kunci perangkat ini kembali ke Mode Tim Lapangan? (Untuk membuka kembali, buka link rahasia ?admin=yuno)')) {
      setMasYunoAuthenticated(false);
      setViewMode('tim');
      showToast('🔒 Perangkat ini telah dikunci ke Mode Tim Lapangan.');
    }
  };

  // URL mode listener and Secret Admin Key verification
  useEffect(() => {
    const evaluateAccess = () => {
      const params = new URLSearchParams(window.location.search);
      const kitId = params.get('id') || params.get('kit') || params.get('mediakit');
      if (kitId) {
        setActiveMediaKitTripId(kitId);
      } else {
        setActiveMediaKitTripId(null);
      }

      if (params.get('mode') === 'tim' || window.location.hash === '#tim') {
        setViewMode('tim');
        return;
      }

      const hasSecret = checkAdminAccessInUrl(window.location.search, window.location.hash);
      if (hasSecret) {
        setMasYunoAuthenticated(true);
        setViewMode('admin');
        showToast('🔑 Akses Pemilik Mas Yuno Terverifikasi!');
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } catch {
          // ignore
        }
        return;
      }

      // Periksa apakah perangkat ini sudah berstatus Mas Yuno
      const isAuth = isMasYunoAuthenticated();
      if (!isAuth) {
        // PERANGKAT TIM / PUBLIK: WAJIB TERKUNCI DI MODE TIM
        setViewMode('tim');
        return;
      }

      // Jika Mas Yuno telah terverifikasi:
      setViewMode('admin');
    };

    evaluateAccess();
    window.addEventListener('popstate', evaluateAccess);
    return () => window.removeEventListener('popstate', evaluateAccess);
  }, []);

  const handleCopyMediaKitLink = (trip: Trip) => {
    const url = getTripMediaKitUrl(trip, trips);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast(`🔗 Link Media Kit ${trip.nama_gunung} berhasil disalin! Siap dikirim ke WhatsApp tim.`);
      }).catch(() => {
        prompt(`Salin link Media Kit ${trip.nama_gunung}:`, url);
      });
    } else {
      prompt(`Salin link Media Kit ${trip.nama_gunung}:`, url);
    }
  };

  const handleOpenMediaKit = (trip: Trip) => {
    // In admin mode, open as a modal preview so admin doesn't leave the dashboard
    setPreviewMediaKitTrip(trip);
  };

  // Dedicated Media Kit View Route (When accessed via direct link ?kit=slug or ?id=xxx)
  if (activeMediaKitTripId) {
    // Prioritaskan trip dari trips (Cloud sync). Jangan gunakan dummy sample trips jika Cloud masih syncing!
    const targetTrip =
      findTripBySlugOrId(trips, activeMediaKitTripId) ||
      (cloudStatus !== 'syncing' ? findTripBySlugOrId(getStoredTrips(), activeMediaKitTripId) : undefined);

    // Jika belum ditemukan dan Cloud masih proses sinkronisasi, tampilkan loading agar tim tidak disuguhi data dummy/salah!
    if (!targetTrip && (cloudStatus === 'syncing' || trips.length === 0)) {
      return (
        <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center text-slate-300 p-6 space-y-4 text-center">
          <div className="w-12 h-12 border-3 border-[#e5a93c] border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-white tracking-tight">
              Memuat Media Kit Resmi Cito Adventure...
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Menghubungkan ke Cloud Firestore untuk mengambil foto pamflet dan teks caption resmi terbaru
            </p>
          </div>
        </div>
      );
    }

    if (targetTrip) {
      return (
        <MediaKitView
          trip={targetTrip}
        />
      );
    } else {
      return (
        <div className="min-h-screen bg-[#0a0e14] flex flex-col items-center justify-center text-slate-300 p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
            🏔️
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Trip Tidak Ditemukan</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            Media kit untuk rute <span className="text-[#e5a93c] font-semibold font-mono">"{activeMediaKitTripId}"</span> tidak ditemukan atau telah diperbarui oleh Mas Yuno.
          </p>
          <a
            href="/"
            className="mt-3 px-4 py-2 bg-[#183e15] hover:bg-[#122f10] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            ← Buka Beranda Jadwal Trip
          </a>
        </div>
      );
    }
  }

  if (isInitialAppLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f4f6f3] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <ExpeditionTruckLoader
          label="Memuat Jadwal Ekspedisi..."
          sublabel="Armada Cito Adventure sedang menyiapkan data trip"
          size="md"
        />
      </div>
    );
  }

  if (viewMode === 'tim') {
    return (
      <TeamInputView
        onUnlockAdmin={() => {
          setViewMode('admin');
          showToast('🔑 Akses Pemilik Mas Yuno Terbuka!');
        }}
        onTripSubmitted={(newTrip) => {
          setSelectedTripId(newTrip.id);
          setIsDraftBannerDismissed(false);
          showToast(`Draf jadwal ${newTrip.nama_gunung} berhasil dikirim ke Mas Yuno!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4ef] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#1c4318] selection:text-white">
      {/* Top App Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
        tripCount={trips.length}
        draftCount={teamDraftTrips.length}
        onScrollToDrafts={() => {
          setIsDraftBannerDismissed(false);
          setTripStatusFilter('tim');
          if (teamDraftTrips.length > 0) {
            setSelectedTripId(teamDraftTrips[0].id);
            setMobileTab('detail');
          }
        }}
        adminDraftCount={trips.filter((t) => !t.from_team && t.is_draft).length}
        onScrollToAdminDrafts={() => {
          setTripStatusFilter('draft');
          const myDraft = trips.find((t) => !t.from_team && t.is_draft);
          if (myDraft) {
            setSelectedTripId(myDraft.id);
            setMobileTab('detail');
          }
        }}
        cloudStatus={cloudStatus}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onCopyTeamLink={handleCopyTeamLink}
        onCopyAdminKeyLink={handleCopyAdminKeyLink}
        onLockToTeamMode={handleLockToTeamMode}
        onOpenTeamMode={() => setViewMode('tim')}
        onOpenTeamData={() => setIsTeamDataModalOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6 flex flex-col">
        {/* Notification Banner for Team Drafts */}
        {teamDraftTrips.length > 0 && !isDraftBannerDismissed && (
          <div className="mb-4 bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-stone-900 flex items-center gap-2 flex-wrap">
                  <span>Ada {teamDraftTrips.length} jadwal baru dari tim</span>
                  <span className="text-xs font-medium text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {teamDraftTrips[0].nama_gunung} ({teamDraftTrips[0].jalur})
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Disusun oleh <span className="font-medium text-stone-800">{teamDraftTrips[0].draf_oleh || 'Tim Cito'}</span>. Periksa rincian data lalu klik Setujui untuk membuat pamflet.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedTripId(teamDraftTrips[0].id);
                  setMobileTab('detail');
                }}
                className="px-3.5 py-1.5 bg-[#183e15] hover:bg-[#122f10] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Review
              </button>
              <button
                onClick={() => {
                  const approved = {
                    ...teamDraftTrips[0],
                    is_draft: false,
                    from_team: teamDraftTrips[0].from_team === true,
                    updated_at: Date.now(),
                  };
                  handleSaveTrip(approved);
                  showToast(`Trip ${teamDraftTrips[0].nama_gunung} disetujui.`);
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Setujui</span>
              </button>
              <button
                onClick={() => setIsDraftBannerDismissed(true)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                title="Sembunyikan banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Pills */}
        <div className="flex md:hidden items-center justify-between gap-1 mb-3.5 bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-xs">
          <button
            onClick={() => {
              setMobileTab('list');
              if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'list');
                window.history.replaceState({}, '', url.toString());
              }
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              mobileTab === 'list'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Daftar Trip ({filteredTrips.length})
          </button>
          <button
            onClick={() => {
              if (activeTrip) {
                handleSelectTrip(activeTrip.id, 'detail');
              }
            }}
            disabled={!activeTrip}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              mobileTab === 'detail'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 disabled:opacity-40'
            }`}
          >
            Detail & Ekspor
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
            {/* Search & Header Card */}
            <div className="field-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                  Daftar Trip
                </h2>
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/50">
                  {filteredTrips.length} dari {trips.length}
                </span>
              </div>

              {/* Status Filter Segmented Control */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-xl border border-stone-200 overflow-x-auto no-scrollbar scroll-smooth">
                <button
                  type="button"
                  onClick={() => setTripStatusFilter('semua')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                    tripStatusFilter === 'semua'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Semua ({trips.length})
                </button>

                <button
                  type="button"
                  onClick={() => setTripStatusFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    tripStatusFilter === 'admin'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>Admin</span>
                  {adminTrips.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-stone-200 text-stone-800">
                      {adminTrips.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTripStatusFilter('tim')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    tripStatusFilter === 'tim'
                      ? 'bg-white text-amber-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>Tim</span>
                  {teamTrips.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-100 text-amber-900">
                      {teamTrips.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTripStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    tripStatusFilter === 'draft'
                      ? 'bg-white text-rose-800 shadow-xs'
                      : 'text-stone-600 hover:text-rose-700'
                  }`}
                >
                  <span>Draft</span>
                  {draftTrips.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-rose-100 text-rose-800">
                      {draftTrips.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTripStatusFilter('final')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                    tripStatusFilter === 'final'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-emerald-800'
                  }`}
                >
                  <span>Final</span>
                  {finalTrips.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-900">
                      {finalTrips.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gunung / jalur..."
                  className="w-full bg-[#f8f9f5] border border-stone-200/50 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#1c4318]/40 focus:ring-1 focus:ring-[#1c4318]/20 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              {/* Batch Select & Delete Toolbar right under Search Bar */}
              <div className="pt-0.5">
                {!isSelectMode ? (
                  <button
                    type="button"
                    onClick={() => setIsSelectMode(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#f8f9f5] hover:bg-rose-50/60 text-stone-600 hover:text-rose-700 border border-stone-200/50 hover:border-rose-200/60 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600 transition-colors" />
                    <span>Pilih & Hapus Beberapa Trip...</span>
                  </button>
                ) : (
                  <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-2.5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <span className="text-xs font-bold text-rose-950">
                          {selectedTripIds.size} trip dipilih
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSelectMode(false);
                            setSelectedTripIds(new Set());
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-200/80 border border-stone-200/40 transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={selectedTripIds.size === 0}
                          onClick={() => setIsBatchDeleteModalOpen(true)}
                          className="px-3 py-1 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-800 shadow-xs transition-all disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus ({selectedTripIds.size})</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Selection Presets */}
                    <div className="flex items-center gap-1 flex-wrap text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllFiltered}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 font-medium text-stone-700 hover:bg-rose-100/70 cursor-pointer shadow-xs transition-colors"
                      >
                        {selectedTripIds.size === filteredTrips.length && filteredTrips.length > 0
                          ? 'Batal Pilih'
                          : `Pilih Semua (${filteredTrips.length})`}
                      </button>

                      {trips.some((t) => DEFAULT_SAMPLE_IDS.has(t.id)) && (
                        <button
                          type="button"
                          onClick={() => handleSelectPreset('default')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 font-medium text-stone-700 hover:bg-stone-100 cursor-pointer shadow-xs transition-colors"
                        >
                          Pilih Contoh Bawaan
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectPreset('draft')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 font-medium text-rose-800 hover:bg-rose-100 cursor-pointer shadow-xs transition-colors"
                      >
                        Pilih Draf
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset('final')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 font-medium text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-xs transition-colors"
                      >
                        Pilih Final
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Cards List - Static vertical flow without internal scrollbar */}
            <div className="space-y-2.5">
              {filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    isSelected={activeTrip?.id === trip.id}
                    isSelectMode={isSelectMode}
                    isSelectedForDelete={selectedTripIds.has(trip.id)}
                    onToggleSelect={handleToggleSelectTrip}
                    onSelect={(t) => {
                      handleSelectTrip(t.id, 'detail');
                    }}
                  />
                ))
              ) : (
                <div className="field-card rounded-2xl p-8 text-center space-y-3 border-dashed border-stone-300/70">
                  <Mountain className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600 font-medium">
                    {trips.length === 0
                      ? 'Belum ada arsip trip. Anda bisa membuat trip baru atau memuat contoh.'
                      : 'Tidak ada trip yang sesuai pencarian.'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1c4318] text-white text-xs font-semibold hover:bg-[#142f11] transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Trip Baru</span>
                    </button>
                    {trips.length === 0 && (
                      <button
                        onClick={handleRestoreDefaultTrips}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f4f5f1] hover:bg-[#e8eae3] text-stone-700 text-xs font-semibold border border-stone-200/50 transition-all cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
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
                onClick={() => {
                  setMobileTab('list');
                  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', 'list');
                    window.history.replaceState({}, '', url.toString());
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c4318] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Trip</span>
              </button>
            </div>

            {activeTrip ? (
              <AnimatePresence mode="wait">
                <TripDetail
                  key={activeTrip.id}
                  trip={activeTrip}
                  onEdit={handleOpenEditModal}
                  onDelete={handleRequestDelete}
                  onOpenItinerary={handleOpenItineraryModal}
                  onShowToast={showToast}
                  onSaveTrip={handleSaveTrip}
                  onOpenMediaKit={handleOpenMediaKit}
                  onCopyMediaKitLink={handleCopyMediaKitLink}
                />
              </AnimatePresence>
            ) : (
              <div className="field-card rounded-2xl p-12 text-center space-y-4">
                <Mountain className="w-14 h-14 text-stone-300 mx-auto" />
                <h3 className="text-lg font-semibold tracking-tight text-stone-900">
                  {trips.length === 0 ? 'Belum Ada Jadwal Trip' : 'Pilih atau Tambahkan Trip'}
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  {trips.length === 0
                    ? 'Mulai buat arsip open trip atau private trip Anda untuk menghasilkan pamflet poster, itinerary, dan caption Instagram secara instan.'
                    : 'Pilih salah satu jadwal open trip di sebelah kiri untuk melihat detail, menyalin caption Instagram, atau mengekspor poster pamflet & itinerary.'}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#183e15] hover:bg-[#122f10] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Open Trip Pertama</span>
                  </button>
                  {trips.length === 0 && (
                    <button
                      onClick={handleRestoreDefaultTrips}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-stone-600" />
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

      <BatchDeleteModal
        isOpen={isBatchDeleteModalOpen}
        selectedTrips={trips.filter((t) => selectedTripIds.has(t.id))}
        onClose={() => setIsBatchDeleteModalOpen(false)}
        onConfirm={handleConfirmBatchDelete}
        isDeleting={isBatchDeleting}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        currentTrips={trips}
        onTripsUpdated={(updated) => {
          setTrips(updated);
          saveStoredTrips(updated);
          if (updated.length > 0) {
            setSelectedTripId(updated[0].id);
          }
          showToast(`Berhasil menyinkronkan ${updated.length} trip dari Cloud!`);
        }}
        cloudStatus={cloudStatus}
      />

      <TeamDataModal
        isOpen={isTeamDataModalOpen}
        onClose={() => setIsTeamDataModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Admin Media Kit Preview Modal */}
      {previewMediaKitTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex flex-col">
          <MediaKitView
            trip={previewMediaKitTrip}
            isPreviewModal={true}
            onClosePreview={() => setPreviewMediaKitTrip(null)}
          />
        </div>
      )}

      {/* Notifications & Offline Status */}
      <OfflineIndicator />
      <Toast message={toastMessage} />
    </div>
  );
}
