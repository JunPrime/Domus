
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://github.com/JunPrime/Domus.git',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/JunPrime/Domus.git"
  },
  {
    "renderMode": 2,
    "route": "/JunPrime/Domus.git/Login"
  },
  {
    "renderMode": 2,
    "route": "/JunPrime/Domus.git/Register"
  },
  {
    "renderMode": 2,
    "redirectTo": "/JunPrime/Domus.git",
    "route": "/JunPrime/Domus.git/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5248, hash: '2e5036fdd05afc25ca7aa584b7d13f8fac97bcd425b6ee4ed3d0512e24144c92', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1075, hash: 'e2c6c35f70267921f9f451b7df12d4c354bde5a2c41d4e22882fe47bbca29293', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'Login/index.html': {size: 32853, hash: '0ae854de4060ad02f17114e3f933cc1c174e810375e4b28fe70e3d142a7b1d9b', text: () => import('./assets-chunks/Login_index_html.mjs').then(m => m.default)},
    'Register/index.html': {size: 33152, hash: 'aeb1e01deab950cf782d54a5301ee18a5cd726faf8a729abe8b5e85ea87a0c20', text: () => import('./assets-chunks/Register_index_html.mjs').then(m => m.default)},
    'index.html': {size: 48983, hash: 'e77b42d7712b222d2952f612079e99c46d59aede48b58c5a8af79d2a6fdef594', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-YT4CJZ3H.css': {size: 315889, hash: 'xOaYt2CYPeQ', text: () => import('./assets-chunks/styles-YT4CJZ3H_css.mjs').then(m => m.default)}
  },
};
