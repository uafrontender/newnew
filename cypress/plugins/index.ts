/// <reference types="cypress" />

import * as i18nGeneralConfig from '../../next-i18next.config.js';

require('dotenv').config();

/**
 * This function is called when a project is opened or re-opened (e.g. due to
 * the project's config changing)
 *
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // copy any needed variables from process.env to config.env
  [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_X_FROM_HEADER',
  ].forEach((envKey) => {
    config.env[envKey] = process.env[envKey];
  });

  /* on('before:browser:launch', (browser = {}, launchOptions) => {
    launchOptions.args = launchOptions.args.map((arg) => {
      if (arg.startsWith('--proxy-bypass-list')) {
        // Allows test in headless mode use WS servers
        return `--proxy-bypass-list=<-loopback>,${process.env['NEXT_PUBLIC_SOCKET_URL']}*`;
      }

      return arg;
    });

    return launchOptions;
  }); */

  config.env.i18n = i18nGeneralConfig.i18n;

  on('task', {
    log(message) {
      console.log(message);

      return null;
    },
  });

  // Enable to see logs for failed posts
  require('cypress-terminal-report/src/installLogsPrinter')(on);

  // do not forget to return the changed config object!
  return config;
};
