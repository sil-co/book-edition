
export interface BookDataType {
    id: number;
    title: string;
    author: string;
    genre: string;
    tableOfContents?: string | null;
    html?: string | null;
    sampleCode?: string | null;
    cover?: string | null;
    language?: 'ja' | 'en';
    summary?: string | null;
    isPublished: boolean;
    kindle?: string;
    publishedAt?: string | null;
}

export interface HtmlType {
    html: string;
}

export interface SampleCodeType {
    sampleCode: string;
}

export type ColumnNamesType = 'id' | 'title' | 'author' | 'genre' | 'tableOfContents' | 'html' | 'sampleCode' | 'cover' | 'language' | 'summary' | 'isPublished' | 'kindle' | 'publishedAt';

export type RequiredFieldType = 'id' | 'title' | 'author' | 'genre' | 'tableOfContents' | 'html' | 'sampleCode' | 'summary';

