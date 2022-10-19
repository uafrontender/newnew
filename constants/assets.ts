const APP_ASSETS_DOMAIN = 'd2ttpqwdet9svd.cloudfront.net';
const APP_ASSETS_ORIGIN = `https://${APP_ASSETS_DOMAIN}`;

const assets = {
  creation: {
    darkAcStatic: `${APP_ASSETS_ORIGIN}/creation/AC-static.png`,
    darkAcAnimated: `${APP_ASSETS_ORIGIN}/creation/AC.webp`,
    lightAcStatic: `${APP_ASSETS_ORIGIN}/creation/AC-static-light.png`,
    lightAcAnimated: `${APP_ASSETS_ORIGIN}/creation/AC-light.webp`,
    darkCfStatic: `${APP_ASSETS_ORIGIN}/creation/CF-static.png`,
    darkCfAnimated: `${APP_ASSETS_ORIGIN}/creation/CF.webp`,
    lightCfStatic: `${APP_ASSETS_ORIGIN}/creation/CF-static-light.png`,
    lightCfAnimated: `${APP_ASSETS_ORIGIN}/creation/CF-light.webp`,
    darkMcStatic: `${APP_ASSETS_ORIGIN}/creation/MC-static.png`,
    darkMcAnimated: `${APP_ASSETS_ORIGIN}/creation/MC.webp`,
    lightMcStatic: `${APP_ASSETS_ORIGIN}/creation/MC-static-light.png`,
    lightMcAnimated: `${APP_ASSETS_ORIGIN}/creation/MC-light.webp`,
  },
  decision: {
    gold: `${APP_ASSETS_ORIGIN}/decision/gold.png`,
    hourglass: `${APP_ASSETS_ORIGIN}/decision/hourglass.png`,
    paymentSuccess: `${APP_ASSETS_ORIGIN}/decision/payment-success.png`,
    trophy: `${APP_ASSETS_ORIGIN}/decision/trophy.png`,
    votes: `${APP_ASSETS_ORIGIN}/decision/votes.png`,
    darkHourglassAnimated: `${APP_ASSETS_ORIGIN}/decision/hourglass-dark.webp`,
    darkHourglassStatic: `${APP_ASSETS_ORIGIN}/decision/hourglass-static-dark.png`,
    lightHourglassAnimated: `${APP_ASSETS_ORIGIN}/decision/hourglass-light.webp`,
    lightHourglassStatic: `${APP_ASSETS_ORIGIN}/decision/hourglass-static-light.png`,
  },
  info: {
    lightQuestionMarkStatic: `${APP_ASSETS_ORIGIN}/info/question-mark-static-light.png`,
    lightQuestionMarkAnimated: `${APP_ASSETS_ORIGIN}/info/question-mark-light.mp4`,
    darkQuestionMarkStatic: `${APP_ASSETS_ORIGIN}/info/question-mark-static-dark.png`,
    darkQuestionMarkAnimated: `${APP_ASSETS_ORIGIN}/info/question-mark-dark.mp4`,
  },
  home: {
    darkLandingAnimated: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Dark.mp4`,
    darkLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Hold-Frame-Dark.webp`,
    darkMobileLandingAnimated: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Dark.mp4`,
    darkMobileLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Dark-Hold-Frame.webp`,
    lightLandingAnimated: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Light.mp4`,
    lightLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Hold-Frame-Light.webp`,
    lightMobileLandingAnimated: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Light.mp4`,
    lightMobileLandingStatic: `${APP_ASSETS_ORIGIN}/home/Landing-Page-Mobile-Light-Hold-Frame.webp`,
  },
  floatingAssets: {
    bottomGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-glass-sphere.png`,
    bottomSphere: `${APP_ASSETS_ORIGIN}/floating-assets/bottom-sphere.png`,
    crowdfunding: `${APP_ASSETS_ORIGIN}/floating-assets/crowdfunding.png`,
    leftGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/left-glass-sphere.png`,
    multipleChoice: `${APP_ASSETS_ORIGIN}/floating-assets/multiple-choice.png`,
    rightGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/right-glass-sphere.png`,
    subMC: `${APP_ASSETS_ORIGIN}/floating-assets/sub-MC.webp`,
    topGlassSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-glass-sphere.png`,
    topMiddleSphere: `${APP_ASSETS_ORIGIN}/floating-assets/top-middle-sphere.png`,
    votes: `${APP_ASSETS_ORIGIN}/floating-assets/votes.png`,
  },
  landing: {
    darkDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark.png`,
    darkDesktopLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-5.mp4`,
    ],

    lightDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light.png`,
    lightDesktopLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-5.mp4`,
    ],

    darkMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark.png`,
    darkMobileLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-5.mp4`,
    ],

    lightMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light.png`,
    lightMobileLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-5.mp4`,
    ],
  },
  signup: {
    darkInto: `${APP_ASSETS_ORIGIN}/signup/sign-in-intro-dark.webp`,
    darkOutro: `${APP_ASSETS_ORIGIN}/signup/sign-in-outro-dark.webp`,
    darkStatic: `${APP_ASSETS_ORIGIN}/signup/sign-in-hold-frame-dark.png`,
    lightInto: `${APP_ASSETS_ORIGIN}/signup/sign-in-intro-light.webp`,
    lightOutro: `${APP_ASSETS_ORIGIN}/signup/sign-in-outro-light.webp`,
    lightStatic: `${APP_ASSETS_ORIGIN}/signup/sign-in-hold-frame-light.png`,
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
    lightAnimatedLogo: `${APP_ASSETS_ORIGIN}/common/darkAnimatedLogo.webp`,
    darkAnimatedLogo: `${APP_ASSETS_ORIGIN}/common/lightAnimatedLogo.webp`,
    darkAc: `${APP_ASSETS_ORIGIN}/common/dark-ac.png`,
    goldBig: `${APP_ASSETS_ORIGIN}/common/gold-big.png`,
    vote: `${APP_ASSETS_ORIGIN}/common/vote.png`,
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
