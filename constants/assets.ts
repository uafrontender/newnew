const APP_ASSETS_DOMAIN = 'd2ttpqwdet9svd.cloudfront.net';
const APP_ASSETS_ORIGIN = `https://${APP_ASSETS_DOMAIN}`;

const assets = {
  creation: {
    AcStatic: `${APP_ASSETS_ORIGIN}/creation/AC-static.png`,
    AcAnimated: `${APP_ASSETS_ORIGIN}/creation/AC.webp`,
    CfStatic: `${APP_ASSETS_ORIGIN}/creation/CF-static.png`,
    CfAnimated: `${APP_ASSETS_ORIGIN}/creation/CF.webp`,
    McStatic: `${APP_ASSETS_ORIGIN}/creation/MC-static.png`,
    McAnimated: `${APP_ASSETS_ORIGIN}/creation/MC.webp`,
  },
  decision: {
    gold: `${APP_ASSETS_ORIGIN}/decision/gold.png`,
    hourglass: `${APP_ASSETS_ORIGIN}/decision/hourglass.png`,
    paymentSuccess: `${APP_ASSETS_ORIGIN}/decision/payment-success.png`,
    trophy: `${APP_ASSETS_ORIGIN}/decision/trophy.png`,
    votes: `${APP_ASSETS_ORIGIN}/decision/votes.png`,
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
