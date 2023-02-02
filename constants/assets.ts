import isSafari from '../utils/isSafari';

const APP_ASSETS_DOMAIN = 'd2ttpqwdet9svd.cloudfront.net';
const APP_ASSETS_ORIGIN = `https://${APP_ASSETS_DOMAIN}`;

const assets = {
  // TODO: unused, remove
  bundles: {
    lightBundles: `${APP_ASSETS_ORIGIN}/bundles/lightBundles`,
    darkBundles: `${APP_ASSETS_ORIGIN}/bundles/darkBundles`,
    lightVotes: [
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/light100votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/light100votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/light100votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/light4500votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/light4500votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/light4500votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/light10000votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/light10000votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/light10000votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/light20000votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/light20000votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/light20000votesAnimated.webp`;
        },
      },
    ],
    darkVotes: [
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/dark100votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/dark100votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/dark100votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/dark4500votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/dark4500votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/dark4500votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/dark10000votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/dark10000votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/dark10000votesAnimated.webp`;
        },
      },
      {
        static: `${APP_ASSETS_ORIGIN}/bundles/dark20000votesStatic.png`,
        animated: () => {
          if (isSafari()) {
            return `${APP_ASSETS_ORIGIN}/bundles/dark20000votesAnimated.png`;
          }
          return `${APP_ASSETS_ORIGIN}/bundles/dark20000votesAnimated.webp`;
        },
      },
    ],
  },
  creation: {
    darkCfStatic: `${APP_ASSETS_ORIGIN}/creation/CF-static.png`,
    darkCfAnimated: () => {
      if (isSafari()) {
        // Change asset
        return `${APP_ASSETS_ORIGIN}/creation/CF.webp`;
      }
      return `${APP_ASSETS_ORIGIN}/creation/CF.webp`;
    },
    lightCfStatic: `${APP_ASSETS_ORIGIN}/creation/CF-static-light.png`,
    lightCfAnimated: () => {
      if (isSafari()) {
        // Change asset
        return `${APP_ASSETS_ORIGIN}/creation/CF-light.webp`;
      }
      return `${APP_ASSETS_ORIGIN}/creation/CF-light.webp`;
    },
  },
  decision: {
    gold: `${APP_ASSETS_ORIGIN}/decision/gold.png`,
    paymentSuccess: `${APP_ASSETS_ORIGIN}/decision/payment-success.png`,
    trophy: `${APP_ASSETS_ORIGIN}/decision/trophy.png`,
    votes: `${APP_ASSETS_ORIGIN}/decision/votes.png`,
    darkHourglassAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/decision/darkHourglassAnimated.png`;
      }
      return `${APP_ASSETS_ORIGIN}/decision/darkHourglassAnimated.webp`;
    },
    darkHourglassStatic: `${APP_ASSETS_ORIGIN}/decision/darkHourglassStatic.png`,
    lightHourglassAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/decision/lightHourglassAnimated.png`;
      }
      return `${APP_ASSETS_ORIGIN}/decision/lightHourglassAnimated.webp`;
    },
    lightHourglassStatic: `${APP_ASSETS_ORIGIN}/decision/lightHourglassStatic.png`,
  },
  info: {
    lightQuestionMarkStatic: `${APP_ASSETS_ORIGIN}/info/question-mark-static-light.png`,
    lightQuestionMarkVideo: `${APP_ASSETS_ORIGIN}/info/question-mark-light.mp4`,
    darkQuestionMarkStatic: `${APP_ASSETS_ORIGIN}/info/question-mark-static-dark.png`,
    darkQuestionMarkVideo: `${APP_ASSETS_ORIGIN}/info/question-mark-dark.mp4`,
  },
  home: {
    darkLandingVideo: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Dark.mp4`,
    darkLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Hold-Frame-Dark.webp`,
    darkMobileLandingVideo: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Dark.mp4`,
    darkMobileLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Dark-Hold-Frame.webp`,
    lightLandingVideo: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Light.mp4`,
    lightLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Hold-Frame-Light.webp`,
    lightMobileLandingVideo: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Light.mp4`,
    lightMobileLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Light-Hold-Frame.webp`,

    mcExampleThumb1: `${APP_ASSETS_ORIGIN}/home/mc-example-thumb-1.png`,
    mcExampleThumb2: `${APP_ASSETS_ORIGIN}/home/mc-example-thumb-2.png`,
    mcExampleThumb3: `${APP_ASSETS_ORIGIN}/home/mc-example-thumb-3.png`,
    mcExampleAvatar1: `${APP_ASSETS_ORIGIN}/home/mc-example-avatar-1.png`,
    mcExampleAvatar2: `${APP_ASSETS_ORIGIN}/home/mc-example-avatar-2.png`,
    mcExampleAvatar3: `${APP_ASSETS_ORIGIN}/home/mc-example-avatar-3.png`,

    acExampleThumb1: `${APP_ASSETS_ORIGIN}/home/ac-example-thumb-1.png`,
    acExampleThumb2: `${APP_ASSETS_ORIGIN}/home/ac-example-thumb-2.png`,
    acExampleThumb3: `${APP_ASSETS_ORIGIN}/home/ac-example-thumb-3.png`,
    acExampleAvatar1: `${APP_ASSETS_ORIGIN}/home/ac-example-avatar-1.png`,
    acExampleAvatar2: `${APP_ASSETS_ORIGIN}/home/ac-example-avatar-2.png`,
    acExampleAvatar3: `${APP_ASSETS_ORIGIN}/home/ac-example-avatar-3.png`,
  },
  floatingAssets: {
    darkBottomGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-glass-sphere.png`,
    darkBottomSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-sphere.png`,
    darkCrowdfunding: `${APP_ASSETS_ORIGIN}/floating-assets/crowdfunding.png`,
    darkLeftGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/left-glass-sphere.png`,
    darkMultipleChoice: `${APP_ASSETS_ORIGIN}/floating-assets/multiple-choice.png`,
    darkRightGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/right-glass-sphere.png`,
    darkSubMC: `${APP_ASSETS_ORIGIN}/floating-assets/sub-MC.webp`,
    darkTopGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-glass-sphere.png`,
    darkTopMiddleSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-middle-sphere.png`,
    darkVotes: `${APP_ASSETS_ORIGIN}/floating-assets/votes.png`,
    lightBottomGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-glass-sphere-light.png`,
    lightBottomSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-sphere-light.png`,
    lightCrowdfunding: `${APP_ASSETS_ORIGIN}/floating-assets/crowdfunding-light.png`,
    lightLeftGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/left-glass-sphere-light.png`,
    lightMultipleChoice: `${APP_ASSETS_ORIGIN}/floating-assets/multiple-choice-light.png`,
    lightRightGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/right-glass-sphere-light.png`,
    lightSubMC: `${APP_ASSETS_ORIGIN}/floating-assets/light-bulb-light.png`,
    lightTopGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-glass-sphere-light.png`,
    lightTopMiddleSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-middle-sphere-light.png`,
    lightVotes: `${APP_ASSETS_ORIGIN}/floating-assets/votes-light.png`,
  },
  landing: {
    darkDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark.png`,
    darkDesktopLandingVideo: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-5.mp4`,
    ],

    lightDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light.png`,
    lightDesktopLandingVideo: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-5.mp4`,
    ],

    darkMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark.png`,
    darkMobileLandingVideo: [
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-5.mp4`,
    ],

    lightMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light.png`,
    lightMobileLandingVideo: [
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-5.mp4`,
    ],
  },
  signup: {
    darkIntoAnimated: () => {
      if (isSafari()) {
        // TODO: Change assets
        return `${APP_ASSETS_ORIGIN}/signup/darkIntroAnimated.png`;
      }
      // TODO: Change assets
      return `${APP_ASSETS_ORIGIN}/signup/sign-in-intro-dark.webp`;
    },
    darkOutroAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/signup/darkOutroAnimated.png`;
      }
      return `${APP_ASSETS_ORIGIN}/signup/sign-in-outro-dark.webp`;
    },
    darkIntroStatic: `${APP_ASSETS_ORIGIN}/signup/darkIntroStatic.png`,
    lightIntoAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/signup/lightIntoAnimated.png`;
      }
      return `${APP_ASSETS_ORIGIN}/signup/sign-in-intro-light.webp`;
    },
    lightOutroAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/signup/lightOutroAnimated.png`;
      }
      return `${APP_ASSETS_ORIGIN}/signup/sign-in-outro-light.webp`;
    },
    lightIntroStatic: `${APP_ASSETS_ORIGIN}/signup/lightIntoStatic.png`,
  },
  subscription: {
    subDm: `${APP_ASSETS_ORIGIN}/subscription/sub-DM.webp`,
    subMC: `${APP_ASSETS_ORIGIN}/subscription/sub-MC.webp`,
    subVotes: `${APP_ASSETS_ORIGIN}/subscription/sub-votes.webp`,
  },
  about: {
    darkMedia1: `${APP_ASSETS_ORIGIN}/about/media-1-dark.png`,
    darkMedia2: `${APP_ASSETS_ORIGIN}/about/media-2-dark.png`,
    darkMedia3: `${APP_ASSETS_ORIGIN}/about/media-3-dark.png`,
    darkMedia4: `${APP_ASSETS_ORIGIN}/about/media-4-dark.png`,
    darkMedia5: `${APP_ASSETS_ORIGIN}/about/media-5-dark.png`,
    darkMedia6: `${APP_ASSETS_ORIGIN}/about/media-6-dark.png`,
    darkMedia7: `${APP_ASSETS_ORIGIN}/about/media-7-dark.png`,
    darkMedia8: `${APP_ASSETS_ORIGIN}/about/media-8-dark.png`,
    darkMedia9: `${APP_ASSETS_ORIGIN}/about/media-9-dark.png`,
    lightMedia1: `${APP_ASSETS_ORIGIN}/about/media-1-light.png`,
    lightMedia2: `${APP_ASSETS_ORIGIN}/about/media-2-light.png`,
    lightMedia3: `${APP_ASSETS_ORIGIN}/about/media-3-light.png`,
    lightMedia4: `${APP_ASSETS_ORIGIN}/about/media-4-light.png`,
    lightMedia5: `${APP_ASSETS_ORIGIN}/about/media-5-light.png`,
    lightMedia6: `${APP_ASSETS_ORIGIN}/about/media-6-light.png`,
    lightMedia7: `${APP_ASSETS_ORIGIN}/about/media-7-light.png`,
    lightMedia8: `${APP_ASSETS_ORIGIN}/about/media-8-light.png`,
    lightMedia9: `${APP_ASSETS_ORIGIN}/about/media-9-light.png`,
  },
  openGraphImage: {
    common: `${APP_ASSETS_ORIGIN}/open-graph-image/common.png`,
  },
  common: {
    lightLogoAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/common/lightAnimatedLogo.png`;
      }
      return `${APP_ASSETS_ORIGIN}/common/lightAnimatedLogo.webp`;
    },
    darkLogoAnimated: () => {
      if (isSafari()) {
        return `${APP_ASSETS_ORIGIN}/common/darkAnimatedLogo.png`;
      }
      return `${APP_ASSETS_ORIGIN}/common/darkAnimatedLogo.webp`;
    },
    darkAc: `${APP_ASSETS_ORIGIN}/common/dark-ac.png`,
    goldBig: `${APP_ASSETS_ORIGIN}/common/gold-big.png`,
    vote: `${APP_ASSETS_ORIGIN}/common/vote.png`,
    ac: {
      darkAcStatic: `${APP_ASSETS_ORIGIN}/common/ac/darkAcStatic.png`,
      darkAcAnimated: () => {
        if (isSafari()) {
          return `${APP_ASSETS_ORIGIN}/common/ac/darkAcAnimated.png`;
        }
        return `${APP_ASSETS_ORIGIN}/common/ac/darkAcAnimated.webp`;
      },
      lightAcStatic: `${APP_ASSETS_ORIGIN}/common/ac/lightAcStatic.png`,
      lightAcAnimated: () => {
        if (isSafari()) {
          return `${APP_ASSETS_ORIGIN}/common/ac/lightAcAnimated.png`;
        }
        return `${APP_ASSETS_ORIGIN}/common/ac/lightAcAnimated.webp`;
      },
    },
    mc: {
      darkMcStatic: `${APP_ASSETS_ORIGIN}/common/mc/darkMcStatic.png`,
      darkMcAnimated: () => {
        if (isSafari()) {
          return `${APP_ASSETS_ORIGIN}/common/mc/darkMcAnimated.png`;
        }
        return `${APP_ASSETS_ORIGIN}/common/mc/darkMcAnimated.webp`;
      },
      lightMcStatic: `${APP_ASSETS_ORIGIN}/common/mc/lightMcStatic.png`,
      lightMcAnimated: () => {
        if (isSafari()) {
          return `${APP_ASSETS_ORIGIN}/common/mc/lightMcAnimated.png`;
        }
        return `${APP_ASSETS_ORIGIN}/common/mc/lightMcAnimated.webp`;
      },
    },
  },
  cards: {
    background: [
      `${APP_ASSETS_ORIGIN}/cards/background-1.png`,
      `${APP_ASSETS_ORIGIN}/cards/background-3.png`,
      `${APP_ASSETS_ORIGIN}/cards/background-5.png`,
      `${APP_ASSETS_ORIGIN}/cards/background-2.png`,
      `${APP_ASSETS_ORIGIN}/cards/background-4.png`,
    ],
  },
  gilroyFont: {
    regular: `${APP_ASSETS_ORIGIN}/fonts/Radomir-Tinkov-Gilroy-Regular.otf`,
    medium: `${APP_ASSETS_ORIGIN}/fonts/Radomir-Tinkov-Gilroy-Medium.otf`,
    semiBold: `${APP_ASSETS_ORIGIN}/fonts/Radomir-Tinkov-Gilroy-SemiBold.otf`,
  },
};

export default assets;
