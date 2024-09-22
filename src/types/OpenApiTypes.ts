
export type GptModel = "gpt-4o" | "gpt-4o-mini";

export type GptMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

export type ContentType = 'toc' | 'mdBody' | 'mdUsage' | 'coverImageId' | 'summary';

export type ReqBodyGpt = {
    id: string;
    title: string;
    model?: GptModel;
    contentType: ContentType;
    reqMarkdown?: string;
    count?: number;
}

export interface ReqStopGpt {
    id: string;
    title: string;
    action: 'stop';
    count: number;
}

export type WSResGptType = {
    gptProgress: string;
    gptResult: string;
    status?: string;
}

export interface GptImageReq {
    model: "dall-e-3" | "dall-e-2";
    prompt: string;
    size: "1024x1024" | "1024x1792" | "1792x1024";
    n?: 1;
}

export interface GptImageReqBody extends GptImageReq {
    id: string;
    title: string;
    contentType: ContentType;
}

export interface ResultUploadCoverType {
    message: string;
    fileName: string;
}
