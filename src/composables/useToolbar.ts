export default function useToolbar() {
  // 图片尺寸显示大小切换
  const toggleSize = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    const originClass = 'origin-size';
    const isOrigin = window.$mediaImageDOM.classList.contains(originClass);
    if (!isOrigin) {
      window.$mediaImageDOM.classList.add(originClass);
    } else {
      window.$mediaImageDOM.classList.remove(originClass);
    }
  };

  return {
    toggleSize,
  };
}
