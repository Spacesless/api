module.exports = [
  ['/bing', 'wallpaper/bing'],
  [/bing\/(\w+)/, 'wallpaper/bing/:1'],
  ['/wallpaper', 'wallpaper/index'],
  [/wallpaper\/(\w+)/, 'wallpaper/index/:1']
];
