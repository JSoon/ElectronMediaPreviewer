const os = require('os');

// 是否是Windows
const isWindows = os.platform() === 'win32';

// 是否是Mac
const isMacOS = os.platform() === 'darwin';

module.exports = {
  isWindows,
  isMacOS,
};
