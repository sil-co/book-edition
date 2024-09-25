
export interface BookDataType {
    id?: string;
    title: string;
    author: string;
    genre: string;
    toc?: string;
    htmlBody?: string;
    mdBody?: string;
    htmlUsage?: string;
    mdUsage?: string;
    language?: 'ja' | 'en';
    summary?: string;
    introduction?: string;
    afterEnd?: string;
    otherBooks?: string;
    isPublished: boolean;
    kindle?: string;
    isGptRunning?: boolean;
    temporaryGpt?: string;
    gptProgress?: string;
    coverImageId?: string;
    defaultStyle?: string;
    deleted?: boolean;
    publishedAt?: string;
}

export interface CoverImageData {
    id: string;
    userId: string;
    imagePath: string;
    altText: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ImageData {
    imagePreview: string;
    imagePreviewPath: string;
    imageSelected: string;
    imageSelectedPath: string;
}

export type EditorContentType = 'toc' | 'htmlBody' | 'mdBody' | 'htmlUsage' | 'mdUsage' | 'summary' | 'coverImageId' | 'introduction' | 'afterEnd' | 'otherBooks';

export interface MdTocType {
    mdBody: string;
}

export interface MdBodyType {
    mdBody: string;
}

export interface HtmlBodyType {
    htmlBody: string;
}

export interface IsGptType {
    isGptRunning: boolean;
}

export interface MdUsageType {
    mdUsage: string;
}

export interface TemporaryGptType {
    temporaryGpt: string;
}

export interface HtmlUsageType {
    htmlUsage: string;
}


export type RequiredFieldType = 'id' | 'title' | 'author' | 'genre' | 'toc' | 'htmlBody' | 'htmlUsage' | 'summary';

export interface ContentOption {
    id: string;
    label: string;
    columnName: 'title' | 'coverImageId' | 'introduction' | 'toc' | 'mdBody' | 'afterEnd' | 'otherBooks' ;
    selected: boolean;
}
