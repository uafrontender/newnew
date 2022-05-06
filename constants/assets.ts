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
};

export default assets;
