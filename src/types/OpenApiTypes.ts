
export type GptModel = "gpt-4o" | "gpt-4o-mini";

export type GptMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

export type ContentType = 'toc' | 'mdBody' | 'mdUsage' | 'cover' | 'summary';

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

