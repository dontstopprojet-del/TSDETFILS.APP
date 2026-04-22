import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface GPSCartographyProps {
  lang: string;
  darkMode: boolean;
  onClose: () => void;
}

interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  user_name: string;
  user_role: string;
}

interface Region {
  id: string;
  code: string;
  name: string;
  name_fr: string;
  capital: string;
  latitude: number;
  longitude: number;
  population: number;
  area_km2: number;
}

interface Prefecture {
  id: string;
  region_id: string;
  code: string;
  name: string;
  name_fr: string;
  latitude: number;
  longitude: number;
  population: number;
  area_km2: number;
  is_capital: boolean;
}

interface Commune {
  id: string;
  prefecture_id: string;
  code: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  population: number;
}

interface District {
  id: string;
  commune_id: string;
  code: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  population: number;
}

interface City {
  id: string;
  prefecture_id: string;
  commune_id: string | null;
  code: string;
  name: string;
  name_fr: string;
  type: string;
  latitude: number;
  longitude: number;
  population: number;
}

const GPSCartography = ({ lang, darkMode, onClose }: GPSCartographyProps) => {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [viewLevel, setViewLevel] = useState<'users' | 'regions' | 'prefectures' | 'cities' | 'communes' | 'districts'>('regions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const t = lang === 'fr' ? {
    title: 'Carte Détaillée de la Guinée',
    close: 'Fermer',
    loading: 'Chargement...',
    noData: 'Aucune donnée GPS disponible',
    technician: 'Technicien',
    lastUpdate: 'Dernière mise à jour',
    allUsers: 'Tous les utilisateurs',
    position: 'Position',
    admin: 'Administrateur',
    office: 'Bureau',
    client: 'Client',
    legend: 'Légende',
    search: 'Rechercher un lieu...',
    viewLevel: 'Niveau de vue',
    regions: 'Régions',
    prefectures: 'Préfectures',
    cities: 'Villes',
    communes: 'Communes',
    districts: 'Districts/Quartiers',
    users: 'Utilisateurs',
    population: 'Population',
    area: 'Superficie',
    capital: 'Capitale',
    stats: 'Statistiques',
    totalRegions: 'Total Régions',
    totalPrefectures: 'Total Préfectures',
    totalCities: 'Total Villes',
    totalCommunes: 'Total Communes',
    totalDistricts: 'Total Districts',
    allRegions: 'Toutes les régions',
    allPrefectures: 'Toutes les préfectures',
    allCities: 'Toutes les villes',
    allCommunes: 'Toutes les communes',
    filterByRegion: 'Filtrer par région',
    filterByPrefecture: 'Filtrer par préfecture',
    filterByCommune: 'Filtrer par commune',
    urban: 'Urbaine',
    rural: 'Rurale',
    quarter: 'Quartier',
    district: 'District',
    sector: 'Secteur',
    nationale_capital: 'Capitale Nationale',
    regional_capital: 'Capitale Régionale',
    prefecture_capital: 'Chef-lieu de Préfecture',
    city: 'Ville',
    village: 'Village'
  } : {
    title: 'Detailed Map of Guinea',
    close: 'Close',
    loading: 'Loading...',
    noData: 'No GPS data available',
    technician: 'Technician',
    lastUpdate: 'Last update',
    allUsers: 'All users',
    position: 'Position',
    admin: 'Administrator',
    office: 'Office',
    client: 'Client',
    legend: 'Legend',
    search: 'Search for a place...',
    viewLevel: 'View Level',
    regions: 'Regions',
    prefectures: 'Prefectures',
    cities: 'Cities',
    communes: 'Communes',
    districts: 'Districts/Quarters',
    users: 'Users',
    population: 'Population',
    area: 'Area',
    capital: 'Capital',
    stats: 'Statistics',
    totalRegions: 'Total Regions',
    totalPrefectures: 'Total Prefectures',
    totalCities: 'Total Cities',
    totalCommunes: 'Total Communes',
    totalDistricts: 'Total Districts',
    allRegions: 'All regions',
    allPrefectures: 'All prefectures',
    allCities: 'All cities',
    allCommunes: 'All communes',
    filterByRegion: 'Filter by region',
    filterByPrefecture: 'Filter by prefecture',
    filterByCommune: 'Filter by commune',
    urban: 'Urban',
    rural: 'Rural',
    quarter: 'Quarter',
    district: 'District',
    sector: 'Sector',
    nationale_capital: 'National Capital',
    regional_capital: 'Regional Capital',
    prefecture_capital: 'Prefecture Capital',
    city: 'City',
    village: 'Village'
  };

  const colors = {
    background: darkMode ? '#0F172A' : '#F8F9FA',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    text: darkMode ? '#E2E8F0' : '#2C3E50',
    textSecondary: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? '#334155' : '#E2E8F0',
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
  };

  useEffect(() => {
    console.log('[GPSCartography] useEffect mounted');
    let mounted = true;
    let mapInitialized = false;

    const initializeMap = async () => {
      if (!mounted || mapInitialized) return;

      console.log('[GPSCartography] Début initialisation carte');

      if (!mapContainerRef.current) {
        console.error('[GPSCartography] ERREUR: mapContainerRef.current est NULL');
        setTimeout(initializeMap, 300);
        return;
      }

      if (mapRef.current) {
        console.log('[GPSCartography] Carte déjà initialisée');
        return;
      }

      const container = mapContainerRef.current;
      const rect = container.getBoundingClientRect();
      console.log('[GPSCartography] Container rect:', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      });

      if (rect.width === 0 || rect.height === 0) {
        console.error('[GPSCartography] Container a une dimension NULLE, retry...');
        setTimeout(initializeMap, 300);
        return;
      }

      try {
        console.log('[GPSCartography] ========== CREATION CARTE ==========');

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: markerIcon2x,
          iconUrl: markerIcon,
          shadowUrl: markerShadow,
        });

        const map = L.map(container, {
          center: [10.8, -10.8],
          zoom: 7,
          zoomControl: true,
          attributionControl: true
        });

        console.log('[GPSCartography] ✓ Instance carte créée');
        mapRef.current = map;
        mapInitialized = true;

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        });

        tileLayer.on('tileerror', (e: any) => {
          console.error('[GPSCartography] Tile load error:', e.tile?.src, e.error);
        });

        tileLayer.addTo(map);

        console.log('[GPSCartography] Tuiles OSM ajoutees');

        const doInvalidate = () => {
          if (mapRef.current && mounted) {
            mapRef.current.invalidateSize();
            setMapReady(true);
          }
        };
        setTimeout(doInvalidate, 200);
        setTimeout(doInvalidate, 600);
        setTimeout(doInvalidate, 1200);

      } catch (error) {
        console.error('[GPSCartography] map init error:', error);
        mapInitialized = false;
      }
    };

    const loadData = async () => {
      await fetchAllData();
    };

    requestAnimationFrame(() => {
      setTimeout(() => {
        initializeMap();
        loadData();
      }, 300);
    });

    const subscription = supabase
      .channel('user_locations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_locations' }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => {
      console.log('[GPSCartography] Cleanup...');
      mounted = false;
      subscription.unsubscribe();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    updateMapMarkers();
  }, [locations, regions, prefectures, cities, communes, districts, viewLevel, selectedUser, selectedRegion, selectedPrefecture, selectedCommune, searchQuery]);

  const fetchAllData = async () => {
    console.log('[GPSCartography] Début du chargement des données...');
    setLoading(true);
    await Promise.all([
      fetchLocations(),
      fetchRegions(),
      fetchPrefectures(),
      fetchCities(),
      fetchCommunes(),
      fetchDistricts()
    ]);
    setLoading(false);
    console.log('[GPSCartography] Données chargées avec succès');
  };

  const fetchLocations = async () => {
    try {
      const { data: locationsData, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          app_users!inner(name, role)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedLocations = locationsData?.map((loc: any) => ({
        id: loc.id,
        user_id: loc.user_id,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        updated_at: loc.updated_at,
        user_name: loc.app_users.name,
        user_role: loc.app_users.role
      })) || [];

      const uniqueUsers = new Map();
      mappedLocations.forEach((loc: UserLocation) => {
        if (!uniqueUsers.has(loc.user_id)) {
          uniqueUsers.set(loc.user_id, loc);
        }
      });

      setLocations(Array.from(uniqueUsers.values()));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('guinea_regions')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching regions:', error);
        return;
      }

      if (data) {
        console.log('Régions chargées:', data.length);
        setRegions(data.map((r: any) => ({
          ...r,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude)
        })));
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchPrefectures = async () => {
    try {
      const { data, error } = await supabase
        .from('guinea_prefectures')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching prefectures:', error);
        return;
      }

      if (data) {
        console.log('Préfectures chargées:', data.length);
        setPrefectures(data.map((p: any) => ({
          ...p,
          latitude: parseFloat(p.latitude),
          longitude: parseFloat(p.longitude)
        })));
      }
    } catch (error) {
      console.error('Error fetching prefectures:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('guinea_cities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching cities:', error);
        return;
      }

      if (data) {
        console.log('Villes chargées:', data.length);
        setCities(data.map((c: any) => ({
          ...c,
          latitude: parseFloat(c.latitude),
          longitude: parseFloat(c.longitude)
        })));
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCommunes = async () => {
    try {
      const { data, error } = await supabase
        .from('guinea_communes')
        .select('*')
        .order('name');

      if (!error && data) {
        setCommunes(data.map((c: any) => ({
          ...c,
          latitude: parseFloat(c.latitude),
          longitude: parseFloat(c.longitude)
        })));
      }
    } catch (error) {
      console.error('Error fetching communes:', error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('guinea_districts')
        .select('*')
        .order('name');

      if (!error && data) {
        setDistricts(data.map((d: any) => ({
          ...d,
          latitude: parseFloat(d.latitude),
          longitude: parseFloat(d.longitude)
        })));
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const updateMapMarkers = () => {
    if (!mapRef.current) {
      console.log('[GPSCartography] Carte non initialisée, impossible d\'ajouter des marqueurs');
      return;
    }

    console.log('[GPSCartography] Mise à jour des marqueurs...');
    console.log('[GPSCartography] Niveau de vue:', viewLevel);
    console.log('[GPSCartography] Nombre de régions:', regions.length);
    console.log('[GPSCartography] Nombre de préfectures:', prefectures.length);
    console.log('[GPSCartography] Nombre de villes:', cities.length);
    console.log('[GPSCartography] Nombre d\'utilisateurs:', locations.length);

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    console.log('[GPSCartography] Anciens marqueurs supprimés');

    if (viewLevel === 'users') {
      const filteredLocs = selectedUser
        ? locations.filter(loc => loc.user_id === selectedUser)
        : locations;

      filteredLocs.forEach((location) => {
        const roleColor = location.user_role === 'technician' ? colors.primary :
                         location.user_role === 'admin' ? colors.danger :
                         location.user_role === 'office' || location.user_role === 'office_employee' ? colors.warning :
                         colors.success;

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${roleColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); color: white; font-size: 16px;">📍</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #2C3E50;">
                ${location.user_name}
              </h3>
              <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.position}:</strong><br/>
                ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
              </div>
              <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.lastUpdate}:</strong><br/>
                ${formatDate(location.updated_at)}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (filteredLocs.length > 0) {
        const bounds = L.latLngBounds(filteredLocs.map(loc => [loc.latitude, loc.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (viewLevel === 'regions') {
      let filtered = regions;
      if (searchQuery) {
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.capital.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      console.log('[GPSCartography] Ajout de', filtered.length, 'marqueurs de régions');
      filtered.forEach((region, index) => {
        console.log(`[GPSCartography] Région ${index + 1}:`, region.name_fr, 'à', region.latitude, region.longitude);
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${colors.danger};
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          ">🏛️</div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 48],
          popupAnchor: [0, -48]
        });

        const marker = L.marker([region.latitude, region.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #DC2626;">
                ${region.name_fr}
              </h3>
              <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.capital}:</strong> ${region.capital}
              </div>
              <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.population}:</strong> ${region.population.toLocaleString()} habitants
              </div>
              <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.area}:</strong> ${region.area_km2.toLocaleString()} km²
              </div>
              <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">
                ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}
              </div>
            </div>
          `);

        console.log(`[GPSCartography] Marqueur ajouté pour`, region.name_fr);
        markersRef.current.push(marker);
      });

      console.log('[GPSCartography] Total marqueurs de régions ajoutés:', markersRef.current.length);

      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(r => [r.latitude, r.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        console.log('[GPSCartography] Carte centrée sur les régions');
      }
    } else if (viewLevel === 'prefectures') {
      let filtered = prefectures;
      if (selectedRegion) {
        filtered = filtered.filter(p => p.region_id === selectedRegion);
      }
      if (searchQuery) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name_fr.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      filtered.forEach((prefecture) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${prefecture.is_capital ? colors.danger : colors.warning};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          ">${prefecture.is_capital ? '⭐' : '🏙️'}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36]
        });

        const marker = L.marker([prefecture.latitude, prefecture.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 220px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #F59E0B;">
                ${prefecture.name_fr}
              </h3>
              ${prefecture.is_capital ? '<div style="font-size: 11px; color: #DC2626; font-weight: 600; margin-bottom: 6px;">📍 Capitale régionale</div>' : ''}
              <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.population}:</strong> ${prefecture.population.toLocaleString()}
              </div>
              <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.area}:</strong> ${prefecture.area_km2.toLocaleString()} km²
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">
                ${prefecture.latitude.toFixed(4)}, ${prefecture.longitude.toFixed(4)}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(p => [p.latitude, p.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (viewLevel === 'cities') {
      let filtered = cities;
      if (selectedPrefecture) {
        filtered = filtered.filter(c => c.prefecture_id === selectedPrefecture);
      }
      if (searchQuery) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name_fr.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      filtered.forEach((city) => {
        const getCityIcon = (type: string) => {
          if (type === 'capitale_nationale') return '🏛️';
          if (type === 'capitale_regionale') return '⭐';
          if (type === 'capitale_prefecture') return '🏙️';
          if (type === 'ville') return '🏘️';
          return '🏠';
        };

        const getCityColor = (type: string) => {
          if (type === 'capitale_nationale') return '#DC2626';
          if (type === 'capitale_regionale') return '#EF4444';
          if (type === 'capitale_prefecture') return '#F59E0B';
          if (type === 'ville') return '#10B981';
          return '#64748B';
        };

        const getCitySize = (type: string) => {
          if (type === 'capitale_nationale') return 44;
          if (type === 'capitale_regionale') return 38;
          if (type === 'capitale_prefecture') return 32;
          if (type === 'ville') return 26;
          return 22;
        };

        const size = getCitySize(city.type);

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${getCityColor(city.type)};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size * 0.5}px;
          ">${getCityIcon(city.type)}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -size]
        });

        const getCityTypeLabel = (type: string) => {
          if (type === 'capitale_nationale') return t.nationale_capital;
          if (type === 'capitale_regionale') return t.regional_capital;
          if (type === 'capitale_prefecture') return t.prefecture_capital;
          if (type === 'ville') return t.city;
          return t.village;
        };

        const marker = L.marker([city.latitude, city.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 220px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: ${getCityColor(city.type)};">
                ${city.name_fr}
              </h3>
              <div style="font-size: 11px; color: ${getCityColor(city.type)}; font-weight: 600; margin-bottom: 6px;">
                ${getCityIcon(city.type)} ${getCityTypeLabel(city.type)}
              </div>
              <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.population}:</strong> ${city.population.toLocaleString()} habitants
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">
                ${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(c => [c.latitude, c.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (viewLevel === 'communes') {
      let filtered = communes;
      if (selectedPrefecture) {
        filtered = filtered.filter(c => c.prefecture_id === selectedPrefecture);
      }
      if (searchQuery) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      filtered.forEach((commune) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${commune.type === 'urbaine' ? colors.success : colors.purple};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">${commune.type === 'urbaine' ? '🏢' : '🌾'}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28]
        });

        const marker = L.marker([commune.latitude, commune.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: ${commune.type === 'urbaine' ? '#10B981' : '#8B5CF6'};">
                ${commune.name}
              </h3>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
                <strong>Type:</strong> ${commune.type === 'urbaine' ? t.urban : t.rural}
              </div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.population}:</strong> ${commune.population.toLocaleString()}
              </div>
              <div style="font-size: 10px; color: #94A3B8; margin-top: 6px;">
                ${commune.latitude.toFixed(4)}, ${commune.longitude.toFixed(4)}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(c => [c.latitude, c.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (viewLevel === 'districts') {
      let filtered = districts;
      if (selectedCommune) {
        filtered = filtered.filter(d => d.commune_id === selectedCommune);
      }
      if (searchQuery) {
        filtered = filtered.filter(d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      filtered.forEach((district) => {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${colors.pink};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">📍</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20],
          popupAnchor: [0, -20]
        });

        const marker = L.marker([district.latitude, district.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 180px;">
              <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #EC4899;">
                ${district.name}
              </h3>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
                <strong>Type:</strong> ${district.type === 'quartier' ? t.quarter : district.type === 'district' ? t.district : t.sector}
              </div>
              <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
                <strong>${t.population}:</strong> ${district.population.toLocaleString()}
              </div>
              <div style="font-size: 10px; color: #94A3B8; margin-top: 6px;">
                ${district.latitude.toFixed(5)}, ${district.longitude.toFixed(5)}
              </div>
            </div>
          `);

        markersRef.current.push(marker);
      });

      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(d => [d.latitude, d.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.background,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '16px',
        maxWidth: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ color: colors.text, margin: 0, fontSize: '20px', fontWeight: '700' }}>{t.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: colors.danger,
              color: '#FFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {t.close}
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setViewLevel('regions')}
            style={{
              padding: '12px',
              background: viewLevel === 'regions' ? colors.danger : colors.card,
              color: viewLevel === 'regions' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            🏛️ {t.regions} ({regions.length})
          </button>
          <button
            onClick={() => setViewLevel('prefectures')}
            style={{
              padding: '12px',
              background: viewLevel === 'prefectures' ? colors.warning : colors.card,
              color: viewLevel === 'prefectures' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            🏙️ {t.prefectures} ({prefectures.length})
          </button>
          <button
            onClick={() => setViewLevel('cities')}
            style={{
              padding: '12px',
              background: viewLevel === 'cities' ? '#10B981' : colors.card,
              color: viewLevel === 'cities' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            🏘️ {t.cities} ({cities.length})
          </button>
          <button
            onClick={() => setViewLevel('communes')}
            style={{
              padding: '12px',
              background: viewLevel === 'communes' ? colors.success : colors.card,
              color: viewLevel === 'communes' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            🏢 {t.communes} ({communes.length})
          </button>
          <button
            onClick={() => setViewLevel('districts')}
            style={{
              padding: '12px',
              background: viewLevel === 'districts' ? colors.pink : colors.card,
              color: viewLevel === 'districts' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            📍 {t.districts} ({districts.length})
          </button>
          <button
            onClick={() => setViewLevel('users')}
            style={{
              padding: '12px',
              background: viewLevel === 'users' ? colors.primary : colors.card,
              color: viewLevel === 'users' ? '#FFF' : colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            👥 {t.users} ({locations.length})
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: viewLevel === 'prefectures' && selectedRegion ? 'repeat(2, 1fr)' :
                                viewLevel === 'cities' && selectedPrefecture ? 'repeat(2, 1fr)' :
                                viewLevel === 'communes' && selectedPrefecture ? 'repeat(2, 1fr)' :
                                viewLevel === 'districts' && selectedCommune ? 'repeat(2, 1fr)' : '1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {viewLevel === 'prefectures' && (
            <select
              value={selectedRegion || ''}
              onChange={(e) => {
                setSelectedRegion(e.target.value || null);
                setSelectedPrefecture(null);
                setSelectedCommune(null);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">{t.allRegions}</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name_fr}</option>
              ))}
            </select>
          )}

          {viewLevel === 'cities' && (
            <select
              value={selectedPrefecture || ''}
              onChange={(e) => {
                setSelectedPrefecture(e.target.value || null);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">{t.allPrefectures}</option>
              {prefectures.map(p => (
                <option key={p.id} value={p.id}>{p.name_fr}</option>
              ))}
            </select>
          )}

          {viewLevel === 'communes' && (
            <select
              value={selectedPrefecture || ''}
              onChange={(e) => {
                setSelectedPrefecture(e.target.value || null);
                setSelectedCommune(null);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">{t.allPrefectures}</option>
              {prefectures.map(p => (
                <option key={p.id} value={p.id}>{p.name_fr}</option>
              ))}
            </select>
          )}

          {viewLevel === 'districts' && (
            <select
              value={selectedCommune || ''}
              onChange={(e) => setSelectedCommune(e.target.value || null)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">{t.allCommunes}</option>
              {communes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {viewLevel === 'users' && (
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value || null)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                background: colors.card,
                color: colors.text,
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <option value="">{t.allUsers}</option>
              {locations.map(loc => (
                <option key={loc.user_id} value={loc.user_id}>
                  {loc.user_name} ({loc.user_role})
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.card,
              color: colors.text,
              fontSize: '13px'
            }}
          />
        </div>

        <div style={{
          background: colors.card,
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          flex: 1,
          position: 'relative',
          minHeight: '600px',
          height: 'calc(100vh - 200px)',
          display: 'flex'
        }}>
          <div
            ref={mapContainerRef}
            id="map-container"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '600px',
              background: '#E5E7EB',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1
            }}
          >
            {(!mapReady || loading) && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,0.9)',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#2C3E50' }}>
                  {loading ? t.loading : 'Initialisation de la carte...'}
                </div>
                <div style={{ fontSize: '14px', color: '#64748B' }}>
                  Veuillez patienter
                </div>
              </div>
            )}
          </div>
          {showStats && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              zIndex: 1100,
              minWidth: '200px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: colors.text
                }}>
                  {t.stats}
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: colors.textSecondary,
                    padding: '0'
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: colors.danger }}>🏛️ {t.totalRegions}:</strong> {regions.length}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: colors.warning }}>🏙️ {t.totalPrefectures}:</strong> {prefectures.length}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: '#10B981' }}>🏘️ {t.totalCities}:</strong> {cities.length}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: colors.success }}>🏢 {t.totalCommunes}:</strong> {communes.length}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: colors.pink }}>📍 {t.totalDistricts}:</strong> {districts.length}
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  <strong style={{ color: colors.primary }}>👥 {t.users}:</strong> {locations.length}
                </div>
              </div>
            </div>
          )}
          {!showStats && (
            <button
              onClick={() => setShowStats(true)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                zIndex: 1100
              }}
            >
              📊
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSCartography;
