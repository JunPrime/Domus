
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://junprime.github.io/Domus/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/Domus"
  },
  {
    "renderMode": 2,
    "route": "/Domus/lobby"
  },
  {
    "renderMode": 2,
    "route": "/Domus/home"
  },
  {
    "renderMode": 2,
    "route": "/Domus/login"
  },
  {
    "renderMode": 2,
    "route": "/Domus/register"
  },
  {
    "renderMode": 2,
    "route": "/Domus/member"
  },
  {
    "renderMode": 2,
    "route": "/Domus/actarea"
  },
  {
    "renderMode": 2,
    "route": "/Domus/header"
  },
  {
    "renderMode": 2,
    "redirectTo": "/Domus",
    "route": "/Domus/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5244, hash: '1fa0c27f76b263f00013ee2ebf1301d70e41ebf0917f136fb8cb777ccfb233e5', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1071, hash: '97a6599dd3948ea6db5f35956c3417c1029eafb3596b39e50783b594eeb85d63', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'member/index.html': {size: 33770, hash: 'd8a6e7ff6b4aff4168fc5732bbba6dfb5ec463516d82b8e95cc4d6e8eb012898', text: () => import('./assets-chunks/member_index_html.mjs').then(m => m.default)},
    'index.html': {size: 46415, hash: '4d815363669c69d05b257f4baf0b06c9dd43d6c03f678c9d97e8c2a84d1ad4c1', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'actarea/index.html': {size: 36277, hash: '1779ff46765063aa2c4b249754a5157079bf6083731bdcb0f157ed0e7414b4b4', text: () => import('./assets-chunks/actarea_index_html.mjs').then(m => m.default)},
    'lobby/index.html': {size: 46406, hash: 'ef81c075e7ec2e40842baedd92266b0faef2206236b46b85dccca81b2bc8aee8', text: () => import('./assets-chunks/lobby_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 32189, hash: '929c6b4793f57420c45a4198be080f92da6372713e33dc7f79b1916a820c43b7', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'header/index.html': {size: 26560, hash: 'c67ec589d2bb730510980e66dec447b09f60cb0353c725815177d680bc6469ad', text: () => import('./assets-chunks/header_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 34349, hash: '5d1a116b0bb69a84df63fbd63dc76d1b3fcf1217157656de94e415f190dab1ed', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 29319, hash: '0e67000fd682b4dc9cb9073fc4f4283af4d14631c891e9ef1061c2584fc4d24e', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-YT4CJZ3H.css': {size: 315889, hash: 'xOaYt2CYPeQ', text: () => import('./assets-chunks/styles-YT4CJZ3H_css.mjs').then(m => m.default)}
  },
};
