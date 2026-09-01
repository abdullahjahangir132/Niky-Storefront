import { useQuery } from "@tanstack/react-query";

export interface PublicStoreSettings {
  storeName?: string;
  tagline?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  activeTheme?: string;
  heroImageUrl?: string;
  theme1?: string;
  theme2?: string;
  theme3?: string;
  announcementBarEnabled?: string;
  announcementBarItems?: string;
  tagBarEnabled?: string;
  tagBarItems?: string;
}

const publicSettingsUrl = `${import.meta.env.BASE_URL}api/settings/public`;

export const getStoreSettingsQueryKey = () => [publicSettingsUrl] as const;

export function useStoreSettings() {
  return useQuery<PublicStoreSettings>({
    queryKey: getStoreSettingsQueryKey(),
    queryFn: async () => {
      const response = await fetch(publicSettingsUrl);
      if (!response.ok) {
        throw new Error("Unable to load store settings");
      }
      return response.json() as Promise<PublicStoreSettings>;
    },
    staleTime: 30_000,
  });
}