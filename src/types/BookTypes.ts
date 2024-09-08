
export interface BookDataType {
    id: number;
    title: string;
    author: string;
    genre: string;
    toc?: string;
    htmlBody?: string;
    mdBody?: string;
    htmlUsage?: string;
    mdUsage?: string;
    cover?: string;
    language?: 'ja' | 'en';
    summary?: string;
    isPublished: boolean;
    kindle?: string;
    publishedAt?: string;
}

export interface MdTocType {
    mdBody: string;
}

export interface MdBodyType {
    mdBody: string;
}

export interface HtmlBodyType {
    htmlBody: string;
}

export interface MdUsageType {
    mdUsage: string;
}

export interface HtmlUsageType {
    htmlUsage: string;
}

export type ColumnNamesType = 'id' | 'title' | 'author' | 'genre' | 'toc' | 'htmlBody' | 'mdBody' | 'htmlUsage' | 'mdUsage' | 'cover' | 'language' | 'summary' | 'isPublished' | 'kindle' | 'publishedAt';

export type RequiredFieldType = 'id' | 'title' | 'author' | 'genre' | 'toc' | 'htmlBody' | 'htmlUsage' | 'summary';

