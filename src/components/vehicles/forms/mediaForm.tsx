import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, VideoIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import type { VehicleSchema } from "../types/vehicles.types";
import { OPTIONAL_FIELD_SUFFIX } from "../constants/vehicle-form-field-meta";
import { ImagesForm } from "./imagesForm";
import { VideosForm } from "./videosForm";

export const MediaForm = () => {
  const form = useFormContext<VehicleSchema>();

  return (
    <div>
      <Tabs defaultValue="images">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images">
            <ImageIcon className="size-4" />
            Imágenes {OPTIONAL_FIELD_SUFFIX}
          </TabsTrigger>
          <TabsTrigger value="videos">
            <VideoIcon className="size-4" />
            Vídeos {OPTIONAL_FIELD_SUFFIX}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="images">
          <Controller
            name="images"
            control={form.control}
            render={({ field }) => (
              <ImagesForm
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="videos">
          <Controller
            name="videos"
            control={form.control}
            render={({ field }) => (
              <VideosForm
                value={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
