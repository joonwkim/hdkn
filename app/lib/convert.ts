import { ThumbnailType, YouTubeData } from "@prisma/client";

export const getVideoId = (watchUrl: string) => {
  const regExp = /v=([a-zA-Z0-9_-]+)/;
  let match = watchUrl.match(regExp);
  if (match) {
    return match[1];
  }
  return null;
};

export const getWatchUrl = (videoId: string) => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};



export const getYoutubeData = async (watchUrl: string) => {
  const thumbnails = await getThumbnails(watchUrl) as Thumbnails;

  let ytdata = {
    watchUrl: watchUrl,
    embedUrl: convertToEmbed(watchUrl) as string,
    thumbnailType: ThumbnailType.MEDIUM,
    thumbnailUrl: thumbnails?.medium.url,
    thumbnailWidth: thumbnails?.medium.width,
    thumbnailHeight: thumbnails?.medium.height,
  };
  return ytdata;
};
export const getYoutubeInfoData = async (watchUrl: string) => {
  let YoutubeInfo: YoutubeInfo = {
    videoId: getVideoId(watchUrl) as string,
    embedUrl: convertToEmbed(watchUrl) as string,
    thumbnails: await getThumbnails(watchUrl) as Thumbnails,
  };
  return YoutubeInfo;
};

export const convertToEmbed = (watchUrl: string) => {
  const videoId = getVideoId(watchUrl);

  // if (videoId) {
  //   return `https://www.youtube.com/embed/${videoId}`;
  // }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&constrols=0`;
    // return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&constrols=0`;
  }
  // if (videoId) {
  //   return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  // }
  return null;
};

export const getThumbnails = async (watchUrl: string) => {
  let yi = await getYoutubeInfo(watchUrl);
  if (yi?.items !== undefined) {
    return yi?.items[0].snippet.thumbnails;
  }
};
export const getYoutubeInfo = async (watchUrl: string) => {
  //https://www.googleapis.com/youtube/v3/videos?part=snippet&id={COMMA_DELIMITED_LIST_OF_IDS}&key={YOUR_API_KEY}

  const videoId = getVideoId(watchUrl);
  if (videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyCsySI9EUYuj0JldCioPHhLtQzCDc_WlEk`;
    const res = await fetch(url);
    const data = await res.json();
    const yi: YoutubeApiInfo = {
      items: data.items,
    };
    return yi;
  }
};

export interface YoutubeApiInfo {
  // kind:     string;
  // etag:     string;
  items: Item[];
  // pageInfo: PageInfo;
}

export interface Item {
  // kind:    string;
  // etag:    string;
  // id:      string;
  snippet: Snippet;
}

export interface Snippet {
  // publishedAt:          Date;
  // channelId:            string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  // channelTitle:         string;
  // tags:                 string[];
  // categoryId:           string;
  // liveBroadcastContent: string;
  // defaultLanguage:      string;
  // localized:            Localized;
  // defaultAudioLanguage: string;
}

export interface Localized {
  title: string;
  description: string;
}

export interface Thumbnails {
  default: Default;
  medium: Default;
  high: Default;
  standard: Default;
  maxres: Default;
}

export interface Default {
  url: string;
  width: number;
  height: number;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YoutubeInfo {
  videoId: string,
  thumbnails: Thumbnails;
  embedUrl: string,
}

export interface ImgInfo {
  thumbnail: string;
  width: number;
  height: number;
}

export interface FileInfo {
  path: string;
}

export enum EditMode {
  EDIT,
  DISPLAY,
  REGI,
}

export interface CloudiaryInfo {
  asset_id: string,
  public_id: string,
  filename: string,
  path: string,
  format: string,
  // resource_type: string,
  bytes: number,
  // width:number,
  // height:number,
  folder: string,
  // url:string,
  secure_url: string,
  thumbnail_url: string;
}

export const getDate = (date: any) => {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));

};