module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "webpack5"
  },
  "staticDirs": ["../public"],
  webpackFinal: async (config, { configType }) => {
    const indexOfSVG = config.module.rules.findIndex(rule => /svg/.test(rule.test))

    config.module.rules.splice(indexOfSVG, 1);

    config.module.rules.push({
      test: /\.svg$/,
      use: ['raw-loader'],
    });

    // Return the altered config
    return config;
  },
}
