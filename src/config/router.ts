export = [
  ['/openapi.json', 'index/openapi'],
  ['/time', 'time/index'],
  ['/time/astro', 'time/astro'],
  [/time\/(\w+)/, 'time/index/:1']
];
