import { css } from 'styled-components';

interface ISIZES {
  desktop: number;
  laptopL: number;
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
  laptop: 1024,
  tablet: 768,
  mobileL: 425,
  mobileM: 375,
  mobileS: 320,
  mobile: 0,
};

const mobile = (arg: any): any => css`
  @media (min-width: ${sizes.mobile}px) {
    ${css(arg)};
  }
`;

const mobileS = (arg: any): any => css`
  @media (min-width: ${sizes.mobileS}px) {
    ${css(arg)};
  }
`;

const mobileM = (arg: any): any => css`
  @media (min-width: ${sizes.mobileM}px) {
    ${css(arg)};
  }
`;

const mobileL = (arg: any): any => css`
  @media (min-width: ${sizes.mobileL}px) {
    ${css(arg)};
  }
`;

const tablet = (arg: any): any => css`
  @media (min-width: ${sizes.tablet}px) {
    ${css(arg)};
  }
`;

const laptop = (arg: any): any => css`
  @media (min-width: ${sizes.laptop}px) {
    ${css(arg)};
  }
`;

const laptopL = (arg: any): any => css`
  @media (min-width: ${sizes.laptopL}px) {
    ${css(arg)};
  }
`;

const desktop = (arg: any): any => css`
  @media (min-width: ${sizes.desktop}px) {
    ${css(arg)};
  }
`;

export interface IMedia {
  mobile: (arg: any) => any;
  mobileS: (arg: any) => any;
  mobileM: (arg: any) => any;
  mobileL: (arg: any) => any;
  tablet: (arg: any) => any;
  laptop: (arg: any) => any;
  laptopL: (arg: any) => any;
  desktop: (arg: any) => any;
}

const media: IMedia = {
  mobile,
  mobileS,
  mobileM,
  mobileL,
  tablet,
  laptop,
  laptopL,
  desktop,
};

export default media;
