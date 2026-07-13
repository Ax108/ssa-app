export interface Consts {
  ytPList: string;
  ytEmbed: string;
  gitAssetBase: string;
  spotifyPL: string;
  spotifyPLTitle: string;
}

export interface PrimaryImg {
  src: string;
  alt: string;
  width?: number;
  ratio?: number;
  bg?: string;
  /** Populated by formatConfig before consumers see the config. */
  key?: string;
  height?: number;
}

export interface ContactDetails {
  location: string;
  gmap: string;
  phone: string;
  email: string;
  gmapEmbed: string;
  gmapEmbedTitle: string;
}

export interface SocialLink {
  i: string;
  l: string;
}

export interface Album {
  value: string;
  path: string;
  /** Populated by formatConfig. */
  key?: string;
}

export interface GalleryImage {
  i: string;
  h: number;
  w: number;
}

export interface Gallery {
  albums: Record<string, Album>;
  [album: string]: Record<string, Album> | GalleryImage[];
}

export interface YTPlaylist {
  l: string;
  t: string;
  st: string;
}

export interface YT {
  channel: string;
  podcast: string;
  satsangHeaderVid: string;
  playlists: YTPlaylist[];
}

export interface Config {
  version: number;
  CONSTS: Consts;
  primaryImgs: Record<string, PrimaryImg>;
  contactDetails: ContactDetails;
  socialLinks: Record<string, SocialLink>;
  gallery: Gallery;
  yt: YT;
}
