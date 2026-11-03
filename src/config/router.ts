export = [
  ['/time', 'time/index'],
  ['/time/astro', 'time/astro'],
  ['/time/bazi', 'time/bazi'],
  ['/time/history', 'time/history'],
  ['/time/history/search', 'time/history/search'],
  [/time\/(\w+)/, 'time/index/:1']
];
