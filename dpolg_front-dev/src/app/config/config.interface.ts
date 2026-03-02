// src/app/config/config.interface.ts
export interface LauncherLink {
  name: string;
  photo: string;
  uid: string;
  url: string;
  usePhotoAsBackground: boolean;
}

export interface LauncherSettings {
  links: LauncherLink[];
  // …add any other launcher‑specific fields you need
}

export interface AppConfig {
  launcherSettings: LauncherSettings;
  // …add any other top‑level fields you need
}
