import { GOOGLE_MAPS_API_KEY } from "@/constants/env.constants";
import { APIProvider, Map, type MapProps } from "@vis.gl/react-google-maps";

export const CustomMap = ({ ...props }: MapProps) => {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map {...props} />
    </APIProvider>
  );
};
