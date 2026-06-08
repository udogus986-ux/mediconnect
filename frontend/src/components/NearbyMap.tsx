import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const clinicIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

interface Place {
  id: string
  name: string
  type: 'hospital' | 'clinic'
  lat: number
  lng: number
  address?: string
  distance?: string
}

const NearbyMap = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'clinic'>('all')

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Tarayıcınız konum özelliğini desteklemiyor')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        try {
          const radius = 5000
          const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${latitude},${longitude});way["amenity"="hospital"](around:${radius},${latitude},${longitude});node["amenity"="clinic"](around:${radius},${latitude},${longitude});way["amenity"="clinic"](around:${radius},${latitude},${longitude});node["healthcare"="hospital"](around:${radius},${latitude},${longitude});node["healthcare"="clinic"](around:${radius},${latitude},${longitude}););out center;`

          // CORS destekleyen mirror kullan
          const urls = [
            `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
            `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`,
          ]

          let data = null
          for (const url of urls) {
            try {
              const res = await fetch(url, { mode: 'cors' })
              if (res.ok) {
                data = await res.json()
                break
              }
            } catch { continue }
          }

          if (!data) throw new Error('API yanıt vermedi')

          const fetchedPlaces: Place[] = data.elements
            .filter((el: any) => el.lat || el.center)
            .slice(0, 20)
            .map((el: any) => {
              const lat = el.lat || el.center?.lat
              const lng = el.lon || el.center?.lon
              const amenity = el.tags?.amenity || el.tags?.healthcare || 'clinic'
              const distance = calculateDistance(latitude, longitude, lat, lng)
              return {
                id: el.id.toString(),
                name: el.tags?.name || (amenity === 'hospital' ? 'Hastane' : 'Klinik'),
                type: amenity === 'hospital' ? 'hospital' : 'clinic',
                lat, lng,
                address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || '',
                distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
              }
            })
            .sort((a: Place, b: Place) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'))

          setPlaces(fetchedPlaces)
        } catch (e) {
          console.error('Yerler yüklenemedi:', e)
        }

        setLoading(false)
      },
      () => {
        setError('Konum alınamadı. Lütfen konum iznini etkinleştirin.')
        setLoading(false)
      }
    )
  }, [])

  const filteredPlaces = places.filter(p => selectedType === 'all' || p.type === selectedType)

  if (loading) return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <span className="material-symbols-outlined text-4xl text-primary animate-pulse mb-3 block">location_on</span>
      <p className="text-sm text-on-surface-variant">Konumunuz alınıyor...</p>
    </div>
  )

  if (error) return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <span className="material-symbols-outlined text-4xl text-outline mb-3 block">location_off</span>
      <p className="text-sm text-on-surface-variant">{error}</p>
    </div>
  )

  if (!userLocation) return null

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-outline-variant/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              Yakınımdaki Sağlık Kurumları
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{places.length} kurum bulundu · 5km çevresi</p>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tümü' },
              { key: 'hospital', label: '🏥 Hastane' },
              { key: 'clinic', label: '🏪 Klinik' },
            ].map(f => (
              <button key={f.key} onClick={() => setSelectedType(f.key as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedType === f.key ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 380 }}>
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup><div className="text-sm font-medium">📍 Konumunuz</div></Popup>
          </Marker>
          <Circle center={[userLocation.lat, userLocation.lng]} radius={5000}
            pathOptions={{ color: '#0B6E7A', fillColor: '#0B6E7A', fillOpacity: 0.05, weight: 1 }} />
          {filteredPlaces.map(place => (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={place.type === 'hospital' ? hospitalIcon : clinicIcon}>
              <Popup>
                <div>
                  <div className="font-semibold text-sm">{place.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{place.type === 'hospital' ? '🏥 Hastane' : '🏪 Klinik'}</div>
                  {place.address && <div className="text-xs text-gray-500">{place.address}</div>}
                  <div className="text-xs font-medium text-teal-600 mt-1">📍 {place.distance}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="p-4 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {filteredPlaces.slice(0, 8).map(place => (
            <div key={place.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-secondary-container transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${place.type === 'hospital' ? 'bg-red-100' : 'bg-green-100'}`}>
                {place.type === 'hospital' ? '🏥' : '🏪'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{place.name}</p>
                {place.address && <p className="text-xs text-on-surface-variant truncate">{place.address}</p>}
              </div>
              <span className="text-xs font-semibold text-primary flex-shrink-0">{place.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NearbyMap