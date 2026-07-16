export interface Consts {
  ytPList: string;
  ytEmbed: string;
  gitAssetBase: string;
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

export interface DonationDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  swift: string;
  bankBranch: string;
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
  /** Home / satsang bhajan playlist embed path (videoseries?list=…). */
  bhajan: string;
  satsangHeaderVid: string;
  playlists: YTPlaylist[];
}

/**
 * Native / store app version prompt (separate from CDN content `version`).
 * Bump `latestVersion` on the CDN when a new binary is on Play / App Store.
 */
export interface StoreAppMeta {
  /** Semver of the newest store binary, e.g. `"1.0.1"`. */
  latestVersion: string;
  /** Defaults to `expo.android.package` when omitted. */
  androidPackage?: string;
  /** Full Play Store URL override. */
  androidStoreUrl?: string;
  /** Numeric App Store Connect id (required for iOS deep link). */
  iosAppId?: string;
  /** Full App Store URL override. */
  iosStoreUrl?: string;
}

export interface Config {
  version: number;
  CONSTS: Consts;
  primaryImgs: Record<string, PrimaryImg>;
  contactDetails: ContactDetails;
  donationDetails: DonationDetails;
  socialLinks: Record<string, SocialLink>;
  gallery: Gallery;
  yt: YT;
  /** Optional until CDN publishes it; snackbar no-ops when missing. */
  storeApp?: StoreAppMeta;
}
