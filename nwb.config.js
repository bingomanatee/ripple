module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: false,
  },
  babel:{
  "plugins": ["@babel/plugin-transform-async-to-generator"]
  }
};
