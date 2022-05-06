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
};

export default assets;
