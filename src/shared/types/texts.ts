export interface Headers {
  title: string;
  shortTitle: string;
  menuTitle: string;
  guruji: string;
  boroGuruji: string;
  mataji: string;
  ashram: string;
  satsang: string;
  gallery: string;
  contact: string;
  followUs: string;
  navigate: string;
  reachUs: string;
  downloadApp: string;
  readMore: string;
  albumSelect: string;
  listenYT: string;
  listenSP: string;
  follow: string;
  subscribe: string;
  dailySatsang: string;
  alsoAvailableAt: string;
  donate: string;
  donateAccName: string;
  donateAccNo: string;
  donateIfsc: string;
  donateSwift: string;
  donateBank: string;
  copied: string;
  /** Store binary update snackbar (optional on older CDN packs). */
  storeUpdateMessage?: string;
  storeUpdateAction?: string;
}

export interface Footer {
  privacy: string;
  dev: string;
  devName: string;
  devLink: string;
  startYear: number;
  cc: string;
}

export interface SocialName {
  n: string;
  n2: string;
}

export interface Texts {
  version: number;
  headers: Headers;
  pages: Record<string, string>;
  footer: Footer;
  socialNames: Record<string, SocialName>;
  ashramShort: string;
  satsangShort: string;
  ashram: string;
  satsang: string;
  gallery: string;
  donationNote: string;
}
