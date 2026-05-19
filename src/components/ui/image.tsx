import { cn, getImageUrl } from "@/lib/utils";


export const Image = ({ src,className, ...props }: { src: string; alt: string; className?: string } & React.ComponentProps<"img">) => {
  const imageUrl = getImageUrl(src);
  return <img src={imageUrl} className={cn("rounded-xl object-cover", className)} {...props} />;
};