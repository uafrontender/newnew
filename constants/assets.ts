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
    darkDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-1.png`,
    darkDesktopLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-dark-5.mp4`,
    ],

    lightDesktopLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-1.png`,
    lightDesktopLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-desktop-light-5.mp4`,
    ],

    darkMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-1.png`,
    darkMobileLandingAnimated: [
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-1.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-2.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-3.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-4.mp4`,
      `${APP_ASSETS_ORIGIN}/landing/landing-mobile-dark-5.mp4`,
    ],

    lightMobileLandingStatic: `${APP_ASSETS_ORIGIN}/landing/landing-mobile-light-1.png`,
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
};

export default assets;
