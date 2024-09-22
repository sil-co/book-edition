import axios, { AxiosResponse, isCancel } from 'axios';
import ReactMarkdown, { Components } from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';
import { renderToString } from "react-dom/server";

import { useState, useEffect, useRef } from 'react';

import { useGlobalState } from '../../context/GlobalStateProvider';
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
    setLoading?: (txt: string) => void;
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
    const navigate = useNavigate();
    const { token, setSuccessMessage, setWarningMessage, setLoadingTxt, setErrorMessage, setImageModalSrc } = useGlobalState();
    if (!token) {
        navigate("/login?error=unauthorized");
        return;
    }
    const [isStoppedGpt, setIsStoppedGpt] = useState<boolean>(false);
    const [currentWS, setCurrentWS] = useState<WebSocket | null>(null);
    const [tailwindDefaultCss, setTailwindDefaultCss] = useState<string | null>(null);
    const [markdownCss, setMarkdownCss] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [markdownContent, setMarkdownContent] = useState<string>("");

    const fetchCss = async () => {
        try {
            let res = await fetch('/tailwind_output.css');
            const twDefaultCss = await res.text();
            setTailwindDefaultCss(twDefaultCss);
            res = await fetch('/md.css');
            const mdCss = await res.text();
            setMarkdownCss(mdCss);
        } catch (error) {
            console.error('Failed to fetch CSS:', error);
        }
    };

    useEffect(() => {
        fetchCss();
    }, []);

    useEffect(() => {
        if (iframeRef.current) {
            const iframeDocument = iframeRef.current.contentDocument;
            if (iframeDocument) {
                // ReactMarkdownをHTMLに変換する
                const renderedMarkdown = renderToString(
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown (GFM)をサポート
                        components={reactMarkdownComponents}
                    >
                        {markdownContent}
                    </ReactMarkdown>
                );

                // iframe内のHTMLを更新
                iframeDocument.open();
                iframeDocument.write(`
              <html>
                <head>
                    <!-- <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.0.0/dist/tailwind.min.css" /> -->
                </head>
                <style>${markdownCss}</style>
                <body>
                  <div class="prose" id="all-wrapper">
                    ${renderedMarkdown}
                  </div>
                </body>
              </html>
            `);
                iframeDocument.close();
            }
        }
    }, [markdownContent]);

    const formatMarkdownText = (text: string): string => {
        // バックスラッシュでエスケープされた\nを実際の改行に置き換える
        return text.replace(/\\n/g, '\n');
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = formatMarkdownText(e.target.value);
        handleContentsChange(contentType, newContent);
        setMarkdownContent(newContent);
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
            if (!temporaryGpt) { return alert('There is no content.'); }
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

    const reactMarkdownComponents: Components = {
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
    }

    const downloadMarkdown = () => {
        try {
            const confirmMessage = `Download this markdown?`;
            if (!window.confirm(confirmMessage)) { return; }
            const content = bookData[contentType];
            if (!content) { return alert('No content.'); }
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bookData.title}_${contentType}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setSuccessMessage('Successfully markdown file download!');
        } catch (error) {
            setErrorMessage("Failed to download");
        }
    };

    const extractCSS = async (): Promise<string> => {
        const usedClasses: Set<string> = new Set();
        document.querySelectorAll('*').forEach(el => {
            el.classList.forEach(cls => usedClasses.add(cls));
        });
        const styleSheets = Array.from(document.styleSheets);
        const extractedCSSSet = new Set<string>();
        const dynamicClassPattern = /^([a-zA-Z-]+)\[(.*?)\]$/;
        styleSheets.forEach(sheet => {
            try {
                const rules = sheet.cssRules;
                for (const rule of rules) {
                    const ruleText = rule.cssText;
                    usedClasses.forEach((cls) => {
                        if (ruleText.includes(`.${cls}`)) {
                            extractedCSSSet.add(ruleText);
                        }

                        const match = cls.match(dynamicClassPattern);
                        if (match) {
                            const baseClass = match[1];  // 例: text-
                            if (ruleText.includes(`.${baseClass}`)) {
                                extractedCSSSet.add(ruleText);
                            }
                        }
                    });
                }
            } catch (e) {
                console.warn('Error accessing stylesheet:', sheet.href);
            }
        });
        return Array.from(extractedCSSSet).join('\n');  // Setから配列に変換して結合
    }

    const handleHtmlDownload = async () => {
        try {
            const confirmMessage = `Download this html?`;
            if (!window.confirm(confirmMessage)) { return; }
            if (contentRef.current) {
                const htmlContent = contentRef.current.innerHTML;
                const cssContent = await extractCSS();
                const fullHtml = `
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>${tailwindDefaultCss + cssContent}</style>
</head>
<body>
<div class="container flex justify-center mx-auto">
${htmlContent}
</div>
</body>
</html>
`;
                const blob = new Blob([fullHtml], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${bookData.title}_${contentType}.html`;
                link.click();
                URL.revokeObjectURL(link.href);
                setSuccessMessage('Successfully html file download!')
            }
        } catch (error) {
            setErrorMessage("Failed to download");
        }
    };

    const handleEpubDownload = async () => {
        try {
            const confirmMessage = `Convert to epub and download?`;
            if (!window.confirm(confirmMessage)) { return; }

            if (contentRef.current) {
                const htmlContent = contentRef.current.innerHTML;
                const cssContent = await extractCSS();
                const fullHtml = `
<html lang="ja">
<head>
<meta charset="UTF-8">
</head>
<body>
<div class="container flex justify-center mx-auto">
${htmlContent}
</div>
</body>
</html>
`;

                const addConmaCss = (css: string): string => {
                    const newCss = css.replace(/rgb\((\d+)\s+(\d+)\s+(\d+)(\s*\/\s*[^)]+)?\)/g, (match, r, g, b, alpha) => {
                        // アルファ値が存在する場合はそのままにしつつ、RGBの値をカンマで区切る
                        if (alpha) {
                            return `rgb(${r}, ${g}, ${b}${alpha})`;
                        }
                        // アルファ値がない場合は通常のRGBをカンマ区切りにする
                        return `rgb(${r}, ${g}, ${b})`;
                    });
                    return newCss;
                }

                const convertCss = (css: string) => {
                    return css.replace(/rgb\((\d+)\s(\d+)\s(\d+)\s\/\svar\(--tw-text-opacity\)\)/g, 'rgb($1, $2, $3)');
                };

                const convertCss2 = (css: string) => {
                    return css
                        // var(--tw-space-x-reverse)を削除し、calcの内容を正しく保つ
                        .replace(/var\(--tw-space-x-reverse\)/g, '1')
                        .replace(/var\(--tw-space-y-reverse\)/g, '1')
                        .replace(/var\(--tw-[a-zA-Z-]+\)/g, '1')
                        // rgb()の透明度部分を削除し、標準のrgbフォーマットに変換
                        .replace(/rgb\((\d+)\s(\d+)\s(\d+)\s\/\s1\)/g, 'rgb($1, $2, $3)')
                        // calc()内のvar(--tw-*)を削除して計算式を調整
                        .replace(/calc\(([\d.]+rem)\s\*\s1\)/g, 'calc($1)')
                        .replace(/calc\(([\d.]+rem)\s\*\scalc\(1\s-\s1\)\)/g, 'calc($1 * 1)')
                        // var(--tw-border-opacity)を削除し、rgb()の形式を正しく保つ
                        .replace(/rgb\((\d+)\s(\d+)\s(\d+)\s\/\svar\(--tw-border-opacity\)\)/g, 'rgb($1, $2, $3)');
                };

                const removeCustomProperties = (css: string) => {
                    return css.replace(/--[\w-]+:\s*[^;]+;/g, '').trim();
                };

                const reqData = {
                    title: bookData.title,
                    author: bookData.author,
                    contentType: contentType,
                    fullHtml: fullHtml,
                    fullCss: convertCss2(removeCustomProperties(tailwindDefaultCss + cssContent)),
                }

                const res: AxiosResponse<Blob> = await axios.post(
                    API_ENDPOINTS.postEpub(),
                    reqData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                    }
                );
                const downloadUrl = window.URL.createObjectURL(res.data);

                // ダウンロードリンクを作成してクリック
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${bookData.title}.epub`; // ダウンロード時のファイル名を指定
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);

                // // EPUBオプションを設定
                // const options: EPUB.Options = {
                //     title: bookData.title, // EPUBのタイトル
                //     author: bookData.author, // EPUBの作者
                //     content: [
                //         {
                //             title: contentType, // 章のタイトル
                //             data: fullHtml, // HTMLコンテンツ
                //         },
                //     ],
                //     lang: 'ja',
                //     version: 3 as 3,
                //     tocTitle: '目次',
                //     verbose: true,
                //     appendChapterTitles: false,
                // };
                // // EPUBを生成し、ダウンロード
                // new EPUB(options).promise.then(() => {
                //     setSuccessMessage('EPUB file has been downloaded!');
                // }).catch(err => {
                //     console.error('Failed to download', err);
                // });

            }
        } catch (error) {
            setErrorMessage("Failed to download");
        }
    }

    return (
        <>
            <div className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-20 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-bold">{editorTitle}</h2>
                    <div className="space-x-2">
                        {/* Todo: まずはhtmlでいい。その後epubが必要なら作る。 */}
                        {/* {loadable && (
                            <button
                                onClick={handleEpubDownload}
                                className="bg-lime-500 text-white px-2 py-1 rounded w-18 h-8 select-none"
                            >
                                DL-epub(β)
                            </button>
                        )} */}
                        <button
                            type="button"
                            onClick={handleHtmlDownload}
                            className="bg-lime-500 text-white px-2 py-1 rounded w-18 h-8 select-none"
                        >
                            DL-html
                        </button>
                        <button
                            type="button"
                            onClick={downloadMarkdown}
                            className="bg-lime-500 text-white px-2 py-1 rounded w-18 h-8 select-none"
                        >
                            DL-md
                        </button>
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
                    <div className="w-full md:w-1/2 pl-2 h-[93%] overflow-auto p-2 border border-gray-300 rounded max-w-none">
                        {/* <div ref={contentRef}>
                            <ReactMarkdown
                                className="prose w-full"
                                rehypePlugins={[rehypeHighlight]}
                                remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown (GFM)をサポート
                                components={reactMarkdownComponents}
                            >
                                {markdownContent}
                            </ReactMarkdown>
                        </div> */}
                        <iframe ref={iframeRef} className="w-full h-full border border-gray-300 rounded"></iframe>
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
