'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Crosshair,
  Info,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Check,
  Sliders,
} from 'lucide-react';
import type * as LeafletType from 'leaflet';

export interface LocationMapPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialRadius?: number;
  branchName?: string;
  onChange?: (data: {
    latitude: number | null;
    longitude: number | null;
    geofenceRadiusMeters: number;
  }) => void;
}

const DEFAULT_JAKARTA_LAT = -6.1685;
const DEFAULT_JAKARTA_LNG = 106.7628;
const RADIUS_PRESETS = [50, 100, 150, 200, 300];

export function LocationMapPicker({
  initialLatitude,
  initialLongitude,
  initialRadius = 100,
  branchName = 'Cabang',
  onChange,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markerRef = useRef<LeafletType.Marker | null>(null);
  const circleRef = useRef<LeafletType.Circle | null>(null);

  const hasInitialCoords =
    initialLatitude !== undefined &&
    initialLatitude !== null &&
    initialLongitude !== undefined &&
    initialLongitude !== null &&
    !Number.isNaN(Number(initialLatitude)) &&
    !Number.isNaN(Number(initialLongitude));

  const [latitude, setLatitude] = useState<number | null>(
    hasInitialCoords ? Number(initialLatitude) : null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    hasInitialCoords ? Number(initialLongitude) : null,
  );
  const [radius, setRadius] = useState<number>(initialRadius > 0 ? initialRadius : 100);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const notifyChange = useCallback(
    (lat: number | null, lng: number | null, rad: number) => {
      if (onChange) {
        onChange({
          latitude: lat,
          longitude: lng,
          geofenceRadiusMeters: rad,
        });
      }
    },
    [onChange],
  );

  // Inisialisasi peta Leaflet (Client side only)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const [leafletModule] = await Promise.all([
          import('leaflet'),
          import('leaflet/dist/leaflet.css'),
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        const L = leafletModule.default || leafletModule;
        leafletRef.current = L;

        // Buat icon kustom Daily Dose yang tajam & elegan (tanpa ketergantungan PNG bundler)
        const customPinIcon = L.divIcon({
          className: 'dd-custom-leaflet-marker',
          html: `
            <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.28));">
              <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.5 15.5 40.5 17.15 41.87C17.65 42.29 18.35 42.29 18.85 41.87C20.5 40.5 36 27.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#1E392A"/>
                <path d="M18 2C9.16344 2 2 9.16344 2 18C2 26.2 15.2 37.8 18 40.1C20.8 37.8 34 26.2 34 18C34 9.16344 26.8366 2 18 2Z" fill="#2A4B3C"/>
                <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
                <circle cx="18" cy="18" r="3.5" fill="#1E392A"/>
              </svg>
            </div>
          `,
          iconSize: [36, 42],
          iconAnchor: [18, 42],
          popupAnchor: [0, -38],
        });

        const initialCenterLat = hasInitialCoords ? Number(initialLatitude) : DEFAULT_JAKARTA_LAT;
        const initialCenterLng = hasInitialCoords ? Number(initialLongitude) : DEFAULT_JAKARTA_LNG;
        const initialZoom = hasInitialCoords ? 16 : 13;

        // Hindari inisialisasi ganda jika container sudah memiliki instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapContainerRef.current, {
          center: [initialCenterLat, initialCenterLng],
          zoom: initialZoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });
        mapInstanceRef.current = map;

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Jika ada koordinat awal, pasang marker & radius
        if (hasInitialCoords) {
          const lat = Number(initialLatitude);
          const lng = Number(initialLongitude);

          const marker = L.marker([lat, lng], {
            draggable: true,
            icon: customPinIcon,
            title: `Lokasi ${branchName}`,
          }).addTo(map);
          markerRef.current = marker;

          const circle = L.circle([lat, lng], {
            radius: radius,
            color: '#1E392A',
            fillColor: '#2A4B3C',
            fillOpacity: 0.22,
            weight: 2,
          }).addTo(map);
          circleRef.current = circle;

          // Event saat marker di-drag
          marker.on('drag', (e: LeafletType.LeafletEvent) => {
            const pos = (e.target as LeafletType.Marker).getLatLng();
            circle.setLatLng(pos);
          });

          marker.on('dragend', (e: LeafletType.LeafletEvent) => {
            const pos = (e.target as LeafletType.Marker).getLatLng();
            const newLat = Number(pos.lat.toFixed(7));
            const newLng = Number(pos.lng.toFixed(7));
            setLatitude(newLat);
            setLongitude(newLng);
            circle.setLatLng([newLat, newLng]);
            notifyChange(newLat, newLng, radius);
          });
        }

        // Klik pada peta untuk memindahkan atau membuat pin
        map.on('click', (e: LeafletType.LeafletMouseEvent) => {
          const newLat = Number(e.latlng.lat.toFixed(7));
          const newLng = Number(e.latlng.lng.toFixed(7));

          setLatitude(newLat);
          setLongitude(newLng);
          notifyChange(newLat, newLng, radius);

          if (markerRef.current && circleRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
            circleRef.current.setLatLng([newLat, newLng]);
          } else {
            // Jika sebelumnya bypass/null, buat marker & circle baru
            const marker = L.marker([newLat, newLng], {
              draggable: true,
              icon: customPinIcon,
              title: `Lokasi ${branchName}`,
            }).addTo(map);
            markerRef.current = marker;

            const circle = L.circle([newLat, newLng], {
              radius: radius,
              color: '#1E392A',
              fillColor: '#2A4B3C',
              fillOpacity: 0.22,
              weight: 2,
            }).addTo(map);
            circleRef.current = circle;

            marker.on('drag', (ev: LeafletType.LeafletEvent) => {
              const pos = (ev.target as LeafletType.Marker).getLatLng();
              circle.setLatLng(pos);
            });

            marker.on('dragend', (ev: LeafletType.LeafletEvent) => {
              const pos = (ev.target as LeafletType.Marker).getLatLng();
              const dragLat = Number(pos.lat.toFixed(7));
              const dragLng = Number(pos.lng.toFixed(7));
              setLatitude(dragLat);
              setLongitude(dragLng);
              circle.setLatLng([dragLat, dragLng]);
              notifyChange(dragLat, dragLng, radius);
            });
          }
        });

        // Pastikan ukuran peta terhitung pas (terutama dalam drawer/animasi)
        setTimeout(() => {
          if (isMounted && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);

        setMapLoaded(true);
      } catch (err) {
        console.error('Gagal memuat Leaflet Map:', err);
      }
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update circle radius ketika state radius berubah
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (circleRef.current) {
      circleRef.current.setRadius(newRadius);
    }
    notifyChange(latitude, longitude, newRadius);
  };

  // Deteksi lokasi perangkat saat ini (HTML5 Geolocation)
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Browser Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userLat = Number(position.coords.latitude.toFixed(7));
        const userLng = Number(position.coords.longitude.toFixed(7));

        setLatitude(userLat);
        setLongitude(userLng);
        notifyChange(userLat, userLng, radius);

        const L = leafletRef.current;
        const map = mapInstanceRef.current;

        if (map && L) {
          map.flyTo([userLat, userLng], 17, { duration: 1 });

          if (markerRef.current && circleRef.current) {
            markerRef.current.setLatLng([userLat, userLng]);
            circleRef.current.setLatLng([userLat, userLng]);
          } else {
            const customPinIcon = L.divIcon({
              className: 'dd-custom-leaflet-marker',
              html: `
                <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.28));">
                  <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.5 15.5 40.5 17.15 41.87C17.65 42.29 18.35 42.29 18.85 41.87C20.5 40.5 36 27.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#1E392A"/>
                    <path d="M18 2C9.16344 2 2 9.16344 2 18C2 26.2 15.2 37.8 18 40.1C20.8 37.8 34 26.2 34 18C34 9.16344 26.8366 2 18 2Z" fill="#2A4B3C"/>
                    <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
                    <circle cx="18" cy="18" r="3.5" fill="#1E392A"/>
                  </svg>
                </div>
              `,
              iconSize: [36, 42],
              iconAnchor: [18, 42],
            });

            const marker = L.marker([userLat, userLng], {
              draggable: true,
              icon: customPinIcon,
              title: `Lokasi ${branchName}`,
            }).addTo(map);
            markerRef.current = marker;

            const circle = L.circle([userLat, userLng], {
              radius: radius,
              color: '#1E392A',
              fillColor: '#2A4B3C',
              fillOpacity: 0.22,
              weight: 2,
            }).addTo(map);
            circleRef.current = circle;

            marker.on('drag', (ev: LeafletType.LeafletEvent) => {
              const pos = (ev.target as LeafletType.Marker).getLatLng();
              circle.setLatLng(pos);
            });

            marker.on('dragend', (ev: LeafletType.LeafletEvent) => {
              const pos = (ev.target as LeafletType.Marker).getLatLng();
              const dragLat = Number(pos.lat.toFixed(7));
              const dragLng = Number(pos.lng.toFixed(7));
              setLatitude(dragLat);
              setLongitude(dragLng);
              circle.setLatLng([dragLat, dragLng]);
              notifyChange(dragLat, dragLng, radius);
            });
          }
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocateError('Izin akses lokasi ditolak oleh browser.');
        } else {
          setLocateError('Tidak dapat mendeteksi lokasi GPS saat ini.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Reset / Hapus Titik (Mode Bypass GPS)
  const handleClearLocation = () => {
    setLatitude(null);
    setLongitude(null);

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    notifyChange(null, null, radius);
  };

  // Pasang Titik di Tengah Peta saat ini (jika sebelumnya kosong)
  const handleSetCurrentCenter = () => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const center = map.getCenter();
    const newLat = Number(center.lat.toFixed(7));
    const newLng = Number(center.lng.toFixed(7));

    setLatitude(newLat);
    setLongitude(newLng);
    notifyChange(newLat, newLng, radius);

    const customPinIcon = L.divIcon({
      className: 'dd-custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.28));">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.5 15.5 40.5 17.15 41.87C17.65 42.29 18.35 42.29 18.85 41.87C20.5 40.5 36 27.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#1E392A"/>
            <path d="M18 2C9.16344 2 2 9.16344 2 18C2 26.2 15.2 37.8 18 40.1C20.8 37.8 34 26.2 34 18C34 9.16344 26.8366 2 18 2Z" fill="#2A4B3C"/>
            <circle cx="18" cy="18" r="7" fill="#FFFFFF"/>
            <circle cx="18" cy="18" r="3.5" fill="#1E392A"/>
          </svg>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
    });

    const marker = L.marker([newLat, newLng], {
      draggable: true,
      icon: customPinIcon,
      title: `Lokasi ${branchName}`,
    }).addTo(map);
    markerRef.current = marker;

    const circle = L.circle([newLat, newLng], {
      radius: radius,
      color: '#1E392A',
      fillColor: '#2A4B3C',
      fillOpacity: 0.22,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;

    marker.on('drag', (ev: LeafletType.LeafletEvent) => {
      const pos = (ev.target as LeafletType.Marker).getLatLng();
      circle.setLatLng(pos);
    });

    marker.on('dragend', (ev: LeafletType.LeafletEvent) => {
      const pos = (ev.target as LeafletType.Marker).getLatLng();
      const dragLat = Number(pos.lat.toFixed(7));
      const dragLng = Number(pos.lng.toFixed(7));
      setLatitude(dragLat);
      setLongitude(dragLng);
      circle.setLatLng([dragLat, dragLng]);
      notifyChange(dragLat, dragLng, radius);
    });
  };

  const isGeofenceActive = latitude !== null && longitude !== null;

  return (
    <div className="grid gap-3.5 rounded-dd-xl border border-dd-line/80 bg-dd-surface-muted/40 p-4">
      {/* Hidden inputs untuk FormData submit jika form menggunakan native FormData */}
      <input type="hidden" name="latitude" value={latitude !== null ? String(latitude) : ''} />
      <input type="hidden" name="longitude" value={longitude !== null ? String(longitude) : ''} />
      <input type="hidden" name="geofenceRadiusMeters" value={String(radius)} />

      {/* Header Studio Geofence */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dd-line/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dd-forest/10 text-dd-forest">
            <MapPin className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dd-ink">Peta Interaktif Geofence Absensi</h3>
            <p className="text-xs text-dd-muted">
              Tentukan titik studio dan radius lingkaran validasi kehadiran smartphone instruktur.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isGeofenceActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <ShieldCheck className="size-3.5" />
              Geofence Aktif ({radius}m)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
              <ShieldAlert className="size-3.5" />
              Mode Bypass (Tanpa Batas Radius)
            </span>
          )}
        </div>
      </div>

      {/* Kontrol Cepat: Deteksi GPS & Bypass */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 rounded-dd-md border border-dd-line bg-white px-3 py-1.5 text-xs font-medium text-dd-ink transition hover:bg-dd-surface-muted hover:border-dd-forest/40 focus:outline-hidden disabled:opacity-50"
          >
            <Crosshair className={`size-3.5 text-dd-forest ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Mendeteksi GPS…' : '📍 Deteksi Lokasi Perangkat Saya'}
          </button>

          {!isGeofenceActive ? (
            <button
              type="button"
              onClick={handleSetCurrentCenter}
              className="inline-flex items-center gap-1.5 rounded-dd-md border border-dd-forest/30 bg-dd-forest/10 px-3 py-1.5 text-xs font-medium text-dd-forest transition hover:bg-dd-forest/20 focus:outline-hidden"
            >
              <MapPin className="size-3.5" />
              Pasang Titik di Peta
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1.5 rounded-dd-md border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 hover:border-red-300 focus:outline-hidden"
            >
              <RotateCcw className="size-3" />
              Hapus Titik (Bypass GPS)
            </button>
          )}
        </div>

        {locateError && <span className="text-xs text-red-600 font-medium">{locateError}</span>}
      </div>

      {/* Peta Interaktif Leaflet */}
      <div className="relative isolate z-0 h-64 sm:h-72 w-full overflow-hidden rounded-dd-lg border border-dd-line bg-dd-surface-muted shadow-inner">
        <div ref={mapContainerRef} className="size-full" />

        {/* Petunjuk Interaktif Pin Overlay */}
        <div className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium text-dd-ink shadow-sm backdrop-blur-xs">
          💡 Klik peta atau seret (drag) pin hijau untuk memindahkan titik cabang
        </div>
      </div>

      {/* Koordinat & Kontrol Radius */}
      {isGeofenceActive ? (
        <div className="grid gap-3 rounded-dd-md border border-dd-line/60 bg-white p-3">
          {/* Detail Koordinat */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-dd-ink flex items-center gap-1">
              <MapPin className="size-3.5 text-dd-forest" />
              Koordinat GPS:
            </span>
            <div className="font-mono text-xs font-medium text-dd-ink">
              <span className="rounded bg-dd-surface-muted px-2 py-0.5">
                Lat: {latitude !== null ? latitude.toFixed(6) : '-'}
              </span>
              <span className="ml-1.5 rounded bg-dd-surface-muted px-2 py-0.5">
                Lng: {longitude !== null ? longitude.toFixed(6) : '-'}
              </span>
            </div>
          </div>

          {/* Pengaturan Radius Geofence */}
          <div className="grid gap-2 border-t border-dd-line/60 pt-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-dd-ink flex items-center gap-1">
                <Sliders className="size-3.5 text-dd-forest" />
                Radius Toleransi Absensi:
              </span>
              <span className="font-bold text-dd-forest text-sm">{radius} meter</span>
            </div>

            {/* Tombol Preset Radius Cepat */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-dd-muted mr-1">Preset Cepat:</span>
              {RADIUS_PRESETS.map((preset) => {
                const isActive = radius === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleRadiusChange(preset)}
                    className={`rounded-dd-sm px-2.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'bg-dd-forest text-white shadow-xs font-semibold'
                        : 'border border-dd-line bg-dd-surface-muted/60 text-dd-ink hover:bg-dd-surface-muted hover:border-dd-forest/30'
                    }`}
                  >
                    {isActive && <Check className="inline-block mr-1 size-3" />}
                    {preset}m
                  </button>
                );
              })}
            </div>

            {/* Slider Pengaturan Radius Halus */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] font-mono text-dd-muted">20m</span>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-dd-surface-muted accent-dd-forest focus:outline-hidden"
              />
              <span className="text-[11px] font-mono text-dd-muted">500m</span>
            </div>
            <p className="text-[11px] text-dd-muted leading-relaxed">
              Instruktur hanya dapat melakukan check-in sesi jika berada di dalam lingkaran hijau ({radius} meter dari titik pin).
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-dd-md border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-800">
          <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="grid gap-0.5">
            <span className="font-semibold text-amber-900">Geofence Bypass Aktif</span>
            <p className="text-amber-700 leading-relaxed">
              Cabang ini belum memiliki koordinat GPS tersimpan. Instruktur dapat melakukan absensi dari mana saja tanpa validasi jarak. Klik tombol <strong>&ldquo;Pasang Titik di Peta&rdquo;</strong> atau <strong>&ldquo;Deteksi Lokasi Perangkat Saya&rdquo;</strong> di atas untuk mengaktifkan proteksi geofence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
