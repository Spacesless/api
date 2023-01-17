module.exports = [
  ['/time', 'time/index'],
  ['/time/astro', 'time/astro'],
  [/time\/(\w+)/, 'time/index/:1'],
  ['/bing', 'wallpaper/bing'],
  [/bing\/(\w+)/, 'wallpaper/bing/:1'],
  ['/wallpaper', 'wallpaper/index'],
  [/wallpaper\/(\w+)/, 'wallpaper/index/:1']
];
