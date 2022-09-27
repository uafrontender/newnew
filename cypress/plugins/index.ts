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
  ['NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_APP_URL'].forEach((envKey) => {
    config.env[envKey] = process.env[envKey];
  });

  config.env.i18n = i18nGeneralConfig.i18n;

  on('task', {
    log(message) {
      console.log(message);

      return null;
    },
  });

  // do not forget to return the changed config object!
  return config;
};
