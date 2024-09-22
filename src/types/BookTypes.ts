
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
    isPublished: boolean;
    kindle?: string;
    isGptRunning?: boolean;
    temporaryGpt?: string;
    gptProgress?: string;
    coverImageId?: string;
    deleted?: boolean;
    publishedAt?: string;
    // cover?: string;
}

export interface ImageData {
    imagePreview: string;
    imagePreviewPath: string;
    imageSelected: string;
    imageSelectedPath: string;
}

export type EditorContentType = 'toc' | 'htmlBody' | 'mdBody' | 'htmlUsage' | 'mdUsage' | 'summary' | 'coverImageId';

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

export type ColumnNamesType = 'id' | 'title' | 'author' | 'genre' | 'toc' | 'htmlBody' | 'mdBody' | 'htmlUsage' | 'mdUsage' | 'coverImageId' | 'language' | 'summary' | 'isPublished' | 'kindle' | 'publishedAt';

export type RequiredFieldType = 'id' | 'title' | 'author' | 'genre' | 'toc' | 'htmlBody' | 'htmlUsage' | 'summary';

