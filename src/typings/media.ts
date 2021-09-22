export enum EMediaType {
  IMG = 'IMG',
  VIDEO = 'VIDEO',
}

export type TMedia = EMediaType.IMG | EMediaType.VIDEO;

export interface IMediaItem {
  // 媒体类型
  type: TMedia;
  // 媒体地址
  url: string;
}

export interface IMediaData {
  // 预览媒体项索引号
  index: number;
  // 预览媒体项
  media: IMediaItem | null;
  // 预览媒体列表
  mediaList: IMediaItem[];
}
