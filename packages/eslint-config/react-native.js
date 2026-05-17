import baseConfig from './base.js';

export default {
  ...baseConfig,
  languageOptions: {
    ...baseConfig.languageOptions,
    globals: {
      ...baseConfig.languageOptions.globals,
      __DEV__: 'readonly',
    },
  },
  rules: {
    ...baseConfig.rules,
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 'warn',
  },
};
