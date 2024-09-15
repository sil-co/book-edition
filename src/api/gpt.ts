import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS, WS_ENDPOINTS } from "./urls";
import * as BT from '../types/BookTypes';
import * as OT from '../types/OpenApiTypes';

export const runGpt = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<BT.BookDataType> = await axios.post<BT.BookDataType>(API_ENDPOINTS.postGpt(), reqBodyGpt);
    return res.data;
}

export const checkIsGpt = async (id: number): Promise<Boolean> => {
    const resIsGpt: AxiosResponse<BT.IsGptType> = await axios.get<BT.IsGptType>(API_ENDPOINTS.getIsGpt(id));
    return resIsGpt.data.isGptRunning;
}

// export const runGptOfToc = async (
//     reqBodyGpt: OT.ReqBodyGpt
// ) => {
//     const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfToc(), reqBodyGpt);
//     return res.data;
// }

export const runGptOfMdBody = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfMdBody(), reqBodyGpt);
    return res.data;
}

// export const checkGptAndRun = async (
//     bookData: BT.BookDataType,
//     contentType: string,
//     setLoading?: React.Dispatch<React.SetStateAction<string>>,
//     setCurrentWS?: React.Dispatch<React.SetStateAction<WebSocket | null>>,
//     model: OT.GptModel = 'gpt-4o',
// ): Promise<string> => {
//     return new Promise(async (resolve, reject) => {
//         switch (contentType) {
//             case 'toc': {
//                 const reqBodyGpt: OT.ReqBodyGpt = {
//                     id: String(bookData.id),
//                     title: bookData.title,
//                     model: model,
//                     contentType: contentType,
//                 }
//                 const gptResult: string = await runGptOfToc(reqBodyGpt);
//                 return resolve(gptResult);
//             }
//             case 'mdBody': {
//                 const reqBodyGpt: OT.ReqBodyGpt = {
//                     id: String(bookData.id),
//                     title: bookData.title,
//                     model: model,
//                     contentType: contentType,
//                     reqMarkdown: bookData.toc,
//                 }
//                 let gptResult = '';
//                 const ws = new WebSocket(WS_ENDPOINTS.wsGptOfMdBody());
//                 setCurrentWS && setCurrentWS(ws);

//                 // WebSocket接続が開いたときの処理
//                 ws.onopen = () => {
//                     console.log('onopen');
//                     ws.send(JSON.stringify(reqBodyGpt));
//                 };

//                 // サーバーからメッセージを受け取ったときの処理
//                 ws.onmessage = (event) => {
//                     const data: OT.WSResGptType = JSON.parse(event.data);
//                     console.log('Received data:', data);
//                     setLoading && setLoading(`GPT Running... ${data.progress}`);
//                     if (data.status === 'finished') {
//                         console.log('Processing completed');
//                         ws.close();
//                     }
//                 };

//                 // WebSocket接続が閉じられたときの処理
//                 ws.onclose = () => {
//                     console.log('WebSocket connection closed');
//                     resolve('');
//                 };

//                 ws.onerror = (error) => {
//                     console.error('WebSocket error occurred:', error);
//                     reject('WebSocket connection failed');
//                 };
//                 return '';
//             }
//             case 'htmlBody': {
//                 return '';
//             }
//             case 'mdUsage': {
//                 return '';
//             }
//             case 'htmlUsage': {
//                 return '';
//             }
//             case 'summary': {
//                 return '';
//             }
//             default: {
//                 return '';
//             }
//         }
//     });
// }
