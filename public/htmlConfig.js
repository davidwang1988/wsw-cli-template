module.exports = {
  dev: {
    template: {
      title: 'title1',
      header: false,
      footer: false,
      env: 'development'

    },
  },
  build: {
    template: {
      title: 'title2',
      header: true,
      footer: false,
      env: 'production'
    },
  }
}
