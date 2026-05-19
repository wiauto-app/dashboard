import { useRouter } from "@tanstack/react-router";


export const useInvalidateData = (routePath:string) => {
  const router = useRouter();
  const invalidateData = () => {
    void router.invalidate({
      filter: (match) => match.routeId === routePath,
    });
  };
  return invalidateData;
}