import { useMemo, useCallback } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Store } from 'lucide-react';
import './OrderMap.css';

// Same key already used elsewhere in the app (HomeProviders, Register) for geocoding.
const GOOGLE_MAPS_KEY = 'AIzaSyCrL0PgpDatU3sg52bhdK_vSWcdD_IatiI';

const containerStyle = { width: '100%', height: '100%' };
const COLOMBO = { lat: 6.9271, lng: 79.8612 };

// customer: { lat, lng, label } | providers: [{ lat, lng, label, name }]
const OrderMap = ({ customer, providers = [] }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_KEY });

  const points = useMemo(() => {
    const list = [];
    if (customer && customer.lat != null && customer.lng != null) {
      list.push({ ...customer, kind: 'customer' });
    }
    providers.forEach((p) => {
      if (p.lat != null && p.lng != null) list.push({ ...p, kind: 'provider' });
    });
    return list;
  }, [customer, providers]);

  const center = useMemo(() => {
    if (points.length === 0) return COLOMBO;
    const lat = points.reduce((s, p) => s + Number(p.lat), 0) / points.length;
    const lng = points.reduce((s, p) => s + Number(p.lng), 0) / points.length;
    return { lat, lng };
  }, [points]);

  const onLoad = useCallback((map) => {
    if (points.length > 1 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend({ lat: Number(p.lat), lng: Number(p.lng) }));
      map.fitBounds(bounds, 64);
    }
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="ordmap-empty">
        <MapPin size={22} />
        <p>Location data isn't available for this order yet.</p>
      </div>
    );
  }

  return (
    <div className="ordmap-wrap">
      <div className="ordmap-canvas">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={points.length > 1 ? 12 : 14}
            onLoad={onLoad}
            options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, gestureHandling: 'cooperative' }}
          >
            {points.map((p, i) => (
              <MarkerF
                key={i}
                position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                title={p.label || (p.kind === 'customer' ? 'Your location' : p.name)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: p.kind === 'customer' ? '#1d4ed8' : '#059669',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="ordmap-loading">Loading map…</div>
        )}
      </div>

      <div className="ordmap-legend">
        {points.filter((p) => p.kind === 'customer').map((p, i) => (
          <div className="ordmap-legend-row" key={`c-${i}`}>
            <span className="ordmap-dot ordmap-dot-customer"><MapPin size={11} /></span>
            <div>
              <p className="ordmap-legend-title">Your location</p>
              <p className="ordmap-legend-sub">{p.label || 'Address on file'}</p>
            </div>
          </div>
        ))}
        {points.filter((p) => p.kind === 'provider').map((p, i) => (
          <div className="ordmap-legend-row" key={`p-${i}`}>
            <span className="ordmap-dot ordmap-dot-provider"><Store size={11} /></span>
            <div>
              <p className="ordmap-legend-title">{p.name || 'Provider'}</p>
              <p className="ordmap-legend-sub">{p.label || 'Address on file'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderMap;
