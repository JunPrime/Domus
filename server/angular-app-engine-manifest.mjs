
export default {
  basePath: 'https://github.com/JunPrime/Domus.git',
  allowedHosts: [],
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
