export enum EMediaType {
  IMG = 'IMG',
  VIDEO = 'VIDEO',
}

export type TMedia = EMediaType.IMG | EMediaType.VIDEO;

export interface IMediaItem {
  type: TMedia;
  url: string;
}

export interface IMediaData {
  index: number;
  media: IMediaItem;
  mediaList: IMediaItem[];
}
