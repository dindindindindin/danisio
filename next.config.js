const { i18n } = require("./next-i18next.config");
// const { nextI18NextRewrites } = require("next-i18next/rewrites");
// const localeSubpaths = {
//   en: "en",
//   tr: "tr",
// };
module.exports = {
  i18n,
  // rewrites: async () => nextI18NextRewrites(localeSubpaths),
  // publicRuntimeConfig: {
  //   localeSubpaths,
  // },
};
