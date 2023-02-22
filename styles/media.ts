const customMediaQuery = (minWidth: number) =>
  `@media (min-width: ${minWidth}px)`;

interface ISIZES {
  desktop: number;
  laptopL: number;
  laptopM: number;
  laptop: number;
  tablet: number;
  mobileL: number;
  mobileM: number;
  mobileS: number;
  mobile: number;
}

export const sizes: ISIZES = {
  desktop: 2560,
  laptopL: 1440,
  laptopM: 1150,
  laptop: 1024,
  tablet: 768,
  mobileL: 425,
  mobileM: 375,
  mobileS: 320,
  mobile: 0,
};

export type TResizeMode =
  | 'mobile'
  | 'mobileS'
  | 'mobileM'
  | 'mobileL'
  | 'tablet'
  | 'laptop'
  | 'laptopL'
  | 'desktop';

const mobile = customMediaQuery(sizes.mobile);

const mobileS = customMediaQuery(sizes.mobileS);

const mobileM = customMediaQuery(sizes.mobileM);

const mobileL = customMediaQuery(sizes.mobileL);

const tablet = customMediaQuery(sizes.tablet);

const laptop = customMediaQuery(sizes.laptop);

const laptopM = customMediaQuery(sizes.laptopM);

const laptopL = customMediaQuery(sizes.laptopL);

const desktop = customMediaQuery(sizes.desktop);

export interface IMedia {
  mobile: string;
  mobileS: string;
  mobileM: string;
  mobileL: string;
  tablet: string;
  laptop: string;
  laptopM: string;
  laptopL: string;
  desktop: string;
}

const media: IMedia = {
  mobile,
  mobileS,
  mobileM,
  mobileL,
  tablet,
  laptop,
  laptopM,
  laptopL,
  desktop,
};

export default media;
