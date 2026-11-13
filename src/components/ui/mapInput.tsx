import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  type MapMouseEvent,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { LocateFixed, MapPin, Search } from "lucide-react";

import { CustomMap, GoogleMapsApiProvider } from "@/components/layout/CustomMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CENTER } from "@/constants/map.constants";
import { cn } from "@/lib/utils";

export interface MapInputValue {
  lat: number;
  lng: number;
}

interface MapInputProps {
  /** Sin coordenadas no se pinta marcador y el mapa muestra España. */
  value: Partial<MapInputValue>;
  onChange: (value: MapInputValue) => void;
  ariaInvalid?: boolean;
  /** Si el navegador ya tiene concedido el permiso, se usa la ubicación actual al montar. */
  autoLocateWhenPermitted?: boolean;
  searchPlaceholder?: string;
}

interface MapPanToValueProps {
  value: Partial<MapInputValue>;
}

const SELECTED_LOCATION_ZOOM = 13;

const isMapInputValue = (
  value: Partial<MapInputValue>,
): value is MapInputValue =>
  Number.isFinite(value.lat) && Number.isFinite(value.lng);

const MapPanToValue = ({ value }: MapPanToValueProps) => {
  const map = useMap();
  const { lat, lng } = value;

  useEffect(() => {
    if (!map) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.panTo({ lat: lat as number, lng: lng as number });
    if ((map.getZoom() ?? 0) < SELECTED_LOCATION_ZOOM) {
      map.setZoom(SELECTED_LOCATION_ZOOM);
    }
  }, [map, lat, lng]);

  return null;
};

const GEOLOCATION_ERROR_MESSAGE =
  "No hemos podido obtener tu ubicación. Escribe tu código postal o ciudad.";

interface LocateUserOptions {
  silent: boolean;
}

const MapInputInner = ({
  value,
  onChange,
  ariaInvalid,
  autoLocateWhenPermitted = false,
  searchPlaceholder = "Buscar localidad o dirección",
}: MapInputProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoLocateAttemptedRef = useRef(false);
  const placesLibrary = useMapsLibrary("places");
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const hasCoords = isMapInputValue(value);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const lat = event.detail.latLng?.lat;
      const lng = event.detail.latLng?.lng;
      if (lat == null || lng == null) return;
      onChange({ lat, lng });
    },
    [onChange],
  );

  const locateUser = useCallback(
    ({ silent }: LocateUserOptions) => {
      if (!navigator.geolocation) {
        if (!silent) setGeolocationError(GEOLOCATION_ERROR_MESSAGE);
        return;
      }

      setIsLocating(true);
      setGeolocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          if (!silent) setGeolocationError(GEOLOCATION_ERROR_MESSAGE);
        },
        { enableHighAccuracy: true, timeout: 10_000 },
      );
    },
    [onChange],
  );

  const handleUseCurrentLocation = () => {
    locateUser({ silent: false });
  };

  useEffect(() => {
    if (!autoLocateWhenPermitted || hasCoords || autoLocateAttemptedRef.current) {
      return;
    }
    autoLocateAttemptedRef.current = true;

    if (!navigator.permissions?.query) return;
    void navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") {
          locateUser({ silent: true });
        }
      })
      .catch(() => undefined);
  }, [autoLocateWhenPermitted, hasCoords, locateUser]);

  useEffect(() => {
    if (!placesLibrary || !searchInputRef.current) return;

    const autocomplete = new placesLibrary.Autocomplete(searchInputRef.current, {
      fields: ["geometry", "formatted_address"],
      types: ["geocode"],
      componentRestrictions: { country: "es" },
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (!location) return;
      setGeolocationError(null);
      onChange({ lat: location.lat(), lng: location.lng() });
      if (searchInputRef.current && place.formatted_address) {
        searchInputRef.current.value = place.formatted_address;
      }
    });

    return () => {
      listener.remove();
    };
  }, [placesLibrary, onChange]);

  return (
    <div className="flex flex-col gap-3" data-invalid={ariaInvalid}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            defaultValue=""
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label={searchPlaceholder}
            aria-invalid={ariaInvalid}
            autoComplete="off"
            inputMode="search"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="shrink-0"
          aria-label="Usar mi ubicación actual"
        >
          <LocateFixed className="size-4" aria-hidden />
          {isLocating ? "Localizando..." : "Mi ubicación"}
        </Button>
      </div>

      {geolocationError ? (
        <p className="text-sm text-destructive" role="alert">
          {geolocationError}
        </p>
      ) : null}

      <div
        className={cn(
          "aspect-video overflow-hidden rounded-lg border",
          ariaInvalid && "border-destructive",
        )}
      >
        <CustomMap
          withProvider={false}
          mapId="dealership-location-map"
          gestureHandling="greedy"
          defaultCenter={hasCoords ? value : DEFAULT_CENTER}
          defaultZoom={hasCoords ? 14 : 6}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          <MapPanToValue value={value} />
          {hasCoords ? (
            <AdvancedMarker position={value}>
              <MapPin
                className="size-8 fill-primary/20 text-primary"
                aria-hidden
              />
            </AdvancedMarker>
          ) : null}
        </CustomMap>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasCoords
          ? "Ubicación fijada. Puedes ajustarla haciendo clic en el mapa."
          : "Busca la ubicación, pulsa «Mi ubicación» o haz clic en el mapa."}
      </p>
    </div>
  );
};

export const MapInput = (props: MapInputProps) => {
  return (
    <GoogleMapsApiProvider>
      <MapInputInner {...props} />
    </GoogleMapsApiProvider>
  );
};
