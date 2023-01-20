// Sometimes fixes issue with file change detection issues with Docker and NextJS
module.exports = {
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
