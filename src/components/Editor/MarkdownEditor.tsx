import axios, { AxiosResponse, isCancel } from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';

import { useState } from 'react';

import { API_ENDPOINTS, WS_ENDPOINTS } from "../../api/urls";
import * as BT from '../../types/BookTypes';
import * as OT from '../../types/OpenApiTypes';

interface MarkdownEditorProps {
    bookData: BT.BookDataType;
    handleContentsChange: (contentType: string, newContent: string) => void;
    contentType: BT.EditorContentType;
    onClose: () => void;
    isOpen: boolean;
    editorTitle: string;
    setLoading?: React.Dispatch<React.SetStateAction<string>>;
    loadable?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    bookData,
    handleContentsChange,
    contentType,
    onClose,
    isOpen,
    editorTitle,
    setLoading,
    loadable,
}) => {
    const [isStoppedGpt, setIsStoppedGpt] = useState<boolean>(false);
    const [currentWS, setCurrentWS] = useState<WebSocket | null>(null);

    const formatMarkdownText = (text: string): string => {
        // バックスラッシュでエスケープされた\nを実際の改行に置き換える
        return text.replace(/\\n/g, '\n');
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = formatMarkdownText(e.target.value);
        handleContentsChange(contentType, newContent);
    };

    const runGptOfToc = async (
        reqBodyGpt: OT.ReqBodyGpt
    ) => {
        const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfToc(), reqBodyGpt);
        return res.data;
    }

    const runGpt = async () => {
        if (!setLoading) return alert("Can't Run GPT");
        const confirmMessage = `Do you run GPT?`;
        if (!window.confirm(confirmMessage)) { return; }

        try {
            setLoading(`GPT Running...`);

            switch (contentType) {
                case 'toc': {
                    const reqBodyGpt: OT.ReqBodyGpt = {
                        id: String(bookData.id),
                        title: bookData.title,
                        model: 'gpt-4o',
                        contentType: contentType,
                    }
                    const gptResult: string = await runGptOfToc(reqBodyGpt);
                    const newContent: string = bookData[contentType] || '' + gptResult;
                    handleContentsChange(contentType, newContent);
                    alert('GPT Output Successfully!');
                    break;
                }
                case 'mdBody': {
                    await new Promise(async (resolve, reject) => {
                        setIsStoppedGpt(true);
                        const reqBodyGpt: OT.ReqBodyGpt = {
                            id: String(bookData.id),
                            title: bookData.title,
                            model: 'gpt-4o',
                            contentType: contentType,
                            reqMarkdown: bookData.toc,
                            count: 1,
                        }
                        let gptResult = bookData[contentType] || '';
                        const ws = new WebSocket(WS_ENDPOINTS.wsGptOfMdBody());
                        setCurrentWS(ws);

                        // WebSocket接続が開いたときの処理
                        ws.onopen = () => {
                            console.log('onopen');
                            ws.send(JSON.stringify(reqBodyGpt));
                        };

                        // サーバーからメッセージを受け取ったときの処理
                        ws.onmessage = (event) => {
                            const data: OT.WSResGptType = JSON.parse(event.data);
                            gptResult += data.gptResult ? data.gptResult : '';
                            handleContentsChange(contentType, gptResult);
                            setLoading(`GPT Running... ${data.gptProgress ? data.gptProgress : ''}`);
                            if (data.status === 'finished') {
                                alert('GPT Output Successfully!');
                                ws.close();
                            }
                        };

                        // WebSocket接続が閉じられたときの処理
                        ws.onclose = () => {
                            console.log('WebSocket connection closed');
                            resolve(gptResult);
                        };

                        ws.onerror = (error) => {
                            console.error('WebSocket error occurred:', error);
                            reject('WebSocket connection failed');
                        };
                    }).then(() => {
                        setIsStoppedGpt(false);
                    });
                    return '';
                }
                case 'htmlBody': {
                    return '';
                }
                case 'mdUsage': {
                    return '';
                }
                case 'htmlUsage': {
                    return '';
                }
                case 'summary': {
                    return '';
                }
                default: {
                    return '';
                }
            }
        } catch (e) {
            alert('Failed GPT Output. Please try again.');
        } finally {
            setLoading('');
        }
    }

    const loadTemporaryGpt = async () => {
        if (!setLoading || !bookData.id) { return alert("Can't Run GPT.") };
        const confirmMessage = `Load previous GPT output?`;
        if (!window.confirm(confirmMessage)) { return; }
        try {
            setLoading(`GPT Loading...`);
            const res: AxiosResponse<BT.TemporaryGptType> = await axios.get<BT.TemporaryGptType>(API_ENDPOINTS.getTemporaryGpt(bookData.id));
            const temporaryGpt = res.data.temporaryGpt;
            const newContent = (bookData[contentType] || '') + '\n' + temporaryGpt;

            handleContentsChange(contentType, newContent);
            alert('GPT Output Successfully!');
        } catch (e) {
            alert('Failed GPT Output. Please try again.');
        } finally {
            setLoading('');
        }
    }

    const stopGpt = async () => {
        const confirmMessage = `If you stop, the next time GPT output will have to start from the beginning. \nIs this OK?`;
        if (!window.confirm(confirmMessage)) { return; }
        const reqBodyGpt: OT.ReqStopGpt = {
            id: String(bookData.id),
            title: bookData.title,
            action: 'stop',
            count: 2,
        }
        currentWS && currentWS.send(JSON.stringify(reqBodyGpt));
    }

    return (
        <>
            <div className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-20 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold">{editorTitle}</h2>
                    <div className="space-x-2">
                        {loadable && (
                            <button
                                onClick={loadTemporaryGpt}
                                className="bg-blue-500 text-white px-3 py-1 rounded w-16"
                            >
                                Load
                            </button>
                        )}
                        {setLoading && (
                            <button
                                onClick={runGpt}
                                className="bg-emerald-500 text-white px-3 py-1 rounded w-16"
                            >
                                GPT
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="bg-red-500 text-white px-3 py-1 rounded w-16"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="flex flex-col p-4 h-full md:flex-row">
                    <div className="w-full md:w-1/2 pr-2 h-full">
                        <textarea
                            name="markdown"
                            placeholder="Markdown content"
                            onChange={handleInputChange}
                            value={bookData[contentType]}
                            className="w-full h-[93%] p-2 border border-gray-300 rounded"
                        ></textarea>
                    </div>
                    <div className="w-full md:w-1/2 pl-2 h-full">
                        <ReactMarkdown
                            className="prose max-w-none w-full h-[93%] p-2 border border-gray-300 rounded overflow-auto"
                            rehypePlugins={[rehypeHighlight]}
                            remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown (GFM)をサポート
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-blue-900 font-bold text-[60pt] my-6" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-left border-b-4 border-blue-800 pt-4 pb-1 my-6" {...props} >
                                    <span className="bg-yellow-200 text-blue-800 font-bold text-[30pt] inline-block p-2">{props.children}</span>
                                </h2>,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-medium text-left border-b-4 border-blue-800 pt-4 pb-1 my-4" {...props}>
                                    <span className="text-blue-800 font-bold text-xl">{props.children}</span>
                                </h3>,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-medium text-left border-b-2 border-blue-800 pt-4 pb-1 my-4" {...props}>
                                    <span className="text-blue-800">{props.children}</span>
                                </h4>,
                                p: ({ node, ...props }) => <p className="text-base leading-relaxed my-2" {...props} />,
                                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-4" {...props} />,
                                li: ({ node, ...props }) => <li className="my-1" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                                pre: ({ node, ...props }) => <pre className="bg-gray-100 rounded p-4 my-4 overflow-x-auto" {...props} />,
                                code: ({ node, ...props }) => <code className="bg-gray-100 p-1 rounded" {...props} />,
                                table: ({ node, ...props }) => <table className="table-auto border-collapse border border-gray-400 my-4" {...props} />,
                                thead: ({ node, ...props }) => <thead className="bg-gray-200" {...props} />,
                                tr: ({ node, ...props }) => <tr className="border-t border-gray-300" {...props} />,
                                th: ({ node, ...props }) => <th className="border px-4 py-2" {...props} />,
                                td: ({ node, ...props }) => <td className="border px-4 py-2" {...props} />,
                            }}
                        >
                            {bookData[contentType]}
                        </ReactMarkdown>
                    </div>
                </div>
            </div >
            {isStoppedGpt && (
                <button
                    onClick={stopGpt}
                    className="bg-red-500 hover:bg-red-800 text-white px-3 py-1 rounded w-16 z-40 fixed top-[60%] border border-white"
                >
                    Stop
                </button>
            )}
        </>
    );
};

export default MarkdownEditor;
