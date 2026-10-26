import { memo, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { TransportRoute } from '../types';

const CITY_COORDINATES: Record<string, LatLngExpression> = {
  თბილისი: [41.7151, 44.8271],
  ბათუმი: [41.6168, 41.6367],
  ქუთაისი: [42.2679, 42.6946],
  გორი: [41.9842, 44.1158],
  რუსთავი: [41.5495, 44.9932],
  ზუგდიდი: [42.5088, 41.8709],
  თელავი: [41.9198, 45.4732],
  ახალციხე: [41.639, 42.9826],
};

interface RouteMapProps { routes: TransportRoute[]; }

export const RouteMap = memo(function RouteMap({ routes }: RouteMapProps) {
  const cityPoints = useMemo(() => {
    const points = new Map<string, LatLngExpression>();
    for (const route of routes) {
      if (CITY_COORDINATES[route.from]) points.set(route.from, CITY_COORDINATES[route.from]);
      if (CITY_COORDINATES[route.to]) points.set(route.to, CITY_COORDINATES[route.to]);
    }
    return [...points.entries()];
  }, [routes]);

  const mappedRoutes = useMemo(() => routes.flatMap((route) => {
    const from = CITY_COORDINATES[route.from];
    const to = CITY_COORDINATES[route.to];
    return from && to ? [{ route, positions: [from, to] as LatLngExpression[] }] : [];
  }), [routes]);

  return (
    <section className="routes-map-section" aria-labelledby="route-map-heading">
      <div className="section-heading routes-map-section__heading">
        <div><p className="eyebrow">მიმართულებების მიმოხილვა</p><h2 id="route-map-heading">მარშრუტები რუკაზე</h2><p>აირჩიე წერტილი ან დააახლოე რუკა, რომ ქალაქების განლაგება ნახო.</p></div>
        <span className="section-heading__count">{mappedRoutes.length} მიმართულება</span>
      </div>
      <div className="route-map-frame">
        <MapContainer center={[41.92, 43.35]} zoom={7} scrollWheelZoom={false} className="route-map" aria-label="საქართველოს მარშრუტების ინტერაქტიული რუკა">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mappedRoutes.map(({ route, positions }) => (
            <Polyline key={route.id} positions={positions} pathOptions={{ color: route.seatsAvailable > 0 ? '#087f8c' : '#9aa8b0', weight: 4, opacity: route.seatsAvailable > 0 ? 0.8 : 0.45 }}>
              <Tooltip sticky>{route.from} → {route.to} · {route.price} ₾</Tooltip>
            </Polyline>
          ))}
          {cityPoints.map(([city, position]) => (
            <CircleMarker key={city} center={position} radius={7} pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#087f8c', fillOpacity: 1 }}>
              <Tooltip direction="top" offset={[0, -5]}>{city}</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <p className="route-map-attribution">რუკის ფილები იტვირთება OpenStreetMap-იდან; ინტერნეტის გარეშე შეიძლება გამოჩნდეს მხოლოდ შენახული მარშრუტების დემო ინფორმაცია.</p>
    </section>
  );
});
