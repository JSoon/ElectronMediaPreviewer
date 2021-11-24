const { access, readFile } = require('fs/promises');
const { constants } = require('fs');
const { nativeImage, clipboard } = require('electron');

/**
 * 检查当前文件是否已存在, 若存在, 则说明已经下载
 * @param {string} filePath 当前下载文件存储路径
 */
async function checkFileExists(filePath) {
  try {
    await access(filePath, constants.R_OK | constants.W_OK);
    console.log('can access');
    return true;
  } catch {
    console.error('cannot access');
    return false;
  }
}

/**
 * 检查当前存储路径是否已存在, 若存在, 则说明文件已经下载
 * @param {string} dirPath 当前下载文件存储路径
 */
async function checkDirectoryExists(dirPath) {
  try {
    await access(dirPath, constants.R_OK | constants.W_OK);
    console.log('can access');
  } catch {
    console.error('cannot access');
  }
}

// 复制图片到剪切板
async function copyImageToClipboard(filePath) {
  const image = nativeImage.createFromPath(filePath);
  clipboard.writeImage(image);
  return image;
}

// 复制文件到剪切板
async function copyFileToClipboard(filePath, fileMIME) {
  // TODO: Electron 目前不支持复制文件, 仅支持文本, HTML, 富文本, 书签, 图片
  // https://www.electronjs.org/docs/latest/api/clipboard/#clipboardwritedata-type

  // 将文件写入剪切板
  const bufferString = await readFile(filePath, {
    encoding: 'utf8',
  });
  const buffer = Buffer.from(bufferString, 'utf8');
  clipboard.writeBuffer(fileMIME, buffer);
  const out = clipboard.readBuffer(fileMIME);
  console.log(buffer.equals(out), out);

  return filePath;
}

// 生成下载文件名称 (暂未使用, electron-dl 不支持动态修改文件名, 需要获取文件 MIME 来生成文件后缀)
// type: 'IMG' 或 'VIDEO'
const getFilename = (type) => {
  const d = new Date();
  const year = d.getFullYear().toString();
  let month = d.getMonth() + 1;
  month = month < 10 ? `0${month}` : month.toString();
  let day = d.getDate();
  day = day < 10 ? `0${day}` : day.toString();
  let hour = d.getHours();
  hour = hour < 10 ? `0${hour}` : hour.toString();
  let minute = d.getMinutes();
  minute = minute < 10 ? `0${minute}` : minute.toString();
  let second = d.getSeconds();
  second = second < 10 ? `0${second}` : second.toString();

  return `海螺${type === 'IMG' ? '图片' : '视频'}_${year}${month}${day}_${hour}${minute}${second}`;
};

module.exports = {
  checkFileExists,
  checkDirectoryExists,
  copyImageToClipboard,
  copyFileToClipboard,
  getFilename,
};
