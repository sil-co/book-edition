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
    handleContentsChange: (contentType: keyof BT.BookDataType, newContent: string) => void;
    contentType: BT.EditorContentType;
    onClose: () => void;
    isOpen: boolean;
    editorTitle: string;
    gptButton?: boolean;
    loadable?: boolean;
    placeHolderText?: string;
    extract?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    bookData,
    handleContentsChange,
    contentType,
    onClose,
    isOpen,
    editorTitle,
    gptButton,
    loadable,
    placeHolderText,
    extract
}) => {
    const navigate = useNavigate();
    const { setSuccessMessage, setWarningMessage, setLoadingTxt, setErrorMessage, setImageModalSrc } = useGlobalState();

    const [isStoppedGpt, setIsStoppedGpt] = useState<boolean>(false);
    const [currentWS, setCurrentWS] = useState<WebSocket | null>(null);
    const [tailwindDefaultCss, setTailwindDefaultCss] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [cssEditorVisible, setCssEditorVisible] = useState(false);
    const [cssContent, setCssContent] = useState("");

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login?error=unauthorized");
            return;
        }
    }, []);

    useEffect(() => {
        appliesToIframe();
    }, [markdownContent, cssContent]);

    useEffect(() => {
        setMarkdownContent(bookData[contentType] || '');
    }, [bookData[contentType]]);

    useEffect(() => {
        setCssContent(bookData.defaultStyle || '');
    }, [bookData.defaultStyle])

    const reactMarkdownComponentsTw: Components = {
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

    const reactMarkdownComponents: Components = {
        h1: ({ node, ...props }) => <h1 {...props} />,
        h2: ({ node, ...props }) => <h2 {...props} ><span>{props.children}</span></h2>,
        h3: ({ node, ...props }) => <h3 {...props}><span>{props.children}</span></h3>,
        h4: ({ node, ...props }) => <h4 {...props}><span>{props.children}</span></h4>,
        p: ({ node, ...props }) => <p {...props} />,
        a: ({ node, ...props }) => <a {...props} />,
        ul: ({ node, ...props }) => <ul {...props} />,
        ol: ({ node, ...props }) => <ol {...props} />,
        li: ({ node, ...props }) => <li {...props} />,
        blockquote: ({ node, ...props }) => <blockquote {...props} />,
        pre: ({ node, ...props }) => <pre {...props} />,
        code: ({ node, ...props }) => <code {...props} />,
        table: ({ node, ...props }) => <table {...props} />,
        thead: ({ node, ...props }) => <thead {...props} />,
        tr: ({ node, ...props }) => <tr {...props} />,
        th: ({ node, ...props }) => <th {...props} />,
        td: ({ node, ...props }) => <td {...props} />,
    }

    const appliesToIframe = () => {
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
              <html lang="ja">
                <head>
                    <meta charset="UTF-8">
                    <!-- <link rel="stylesheet" href="https://unpkg.com/tailwindcss@2.0.0/dist/tailwind.min.css" /> -->
                </head>
                <style>${cssContent}</style>
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
    }

    const getCss = async () => {
        try {
            let res = await fetch('/default_md.css');
            const mdCss = await res.text();
            res = await fetch('/hljs_1.css');
            const hljsCss = await res.text();
            handleContentsChange('defaultStyle', mdCss + '\n' + hljsCss);
        } catch (error) {
            console.error('Failed to fetch CSS:', error);
        }
    };

    const formatMarkdownText = (text: string): string => {
        // バックスラッシュでエスケープされた\nを実際の改行に置き換える
        return text.replace(/\\n/g, '\n');
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = formatMarkdownText(e.target.value);
        handleContentsChange(contentType, newContent);
        setMarkdownContent(newContent);
    };

    const runGpt = async () => {
        if (!gptButton) return setErrorMessage("Can't Run GPT");
        const confirmMessage = `Do you run GPT?`;
        if (!window.confirm(confirmMessage)) { return; }

        try {
            setLoadingTxt(`GPT Running...`);

            switch (contentType) {
                case 'toc': {
                    const reqBodyGpt: OT.ReqBodyGpt = {
                        id: String(bookData.id),
                        title: bookData.title,
                        model: 'gpt-4o',
                        contentType: contentType,
                    }
                    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfToc(), reqBodyGpt);
                    const gptResult: string = res.data;
                    const newContent: string = bookData[contentType] || '' + gptResult;
                    handleContentsChange(contentType, newContent);
                    setSuccessMessage('GPT Output Successfully!');
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
                            setLoadingTxt(`GPT Running... ${data.gptProgress ? data.gptProgress : ''}`);
                            if (data.status === 'finished') {
                                setSuccessMessage('GPT Output Successfully!');
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
                case 'introduction': {
                    const reqBodyGpt: OT.ReqBodyGpt = {
                        id: String(bookData.id),
                        title: bookData.title,
                        model: 'gpt-4o',
                        contentType: contentType,
                    }
                    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfIntroduction(), reqBodyGpt);
                    const gptResult: string = res.data;
                    const newContent: string = bookData[contentType] || '' + gptResult;
                    handleContentsChange(contentType, newContent);
                    setSuccessMessage('GPT Output Successfully!');
                    break;
                }
                case 'afterEnd': {
                    const reqBodyGpt: OT.ReqBodyGpt = {
                        id: String(bookData.id),
                        title: bookData.title,
                        model: 'gpt-4o',
                        contentType: contentType,
                    }
                    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfAfterend(), reqBodyGpt);
                    const gptResult: string = res.data;
                    const newContent: string = bookData[contentType] || '' + gptResult;
                    handleContentsChange(contentType, newContent);
                    setSuccessMessage('GPT Output Successfully!');
                    break;
                }
                default: {
                    return '';
                }
            }
        } catch (e) {
            setErrorMessage('Failed GPT Output. Please try again.');
        } finally {
            setLoadingTxt('');
        }
    }

    const loadTemporaryGpt = async () => {
        if (!gptButton || !bookData.id) { return setErrorMessage("Can't Run GPT.") };
        try {
            const confirmMessage = `Load previous GPT output?`;
            if (!window.confirm(confirmMessage)) { return; }
            setLoadingTxt(`GPT Loading...`);
            const res: AxiosResponse<BT.TemporaryGptType> = await axios.get<BT.TemporaryGptType>(API_ENDPOINTS.getTemporaryGpt(bookData.id));
            const temporaryGpt = res.data.temporaryGpt;
            if (!temporaryGpt) { return setErrorMessage('There is no content.'); }
            const newContent = (bookData[contentType] || '') + '\n' + temporaryGpt;

            handleContentsChange(contentType, newContent);
            setSuccessMessage('GPT Output Successfully!');
        } catch (e) {
            setErrorMessage('Failed GPT Output. Please try again.');
        } finally {
            setLoadingTxt('');
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

    const downloadMarkdown = () => {
        try {
            const confirmMessage = `Download this markdown?`;
            if (!window.confirm(confirmMessage)) { return; }
            const content = bookData[contentType];
            if (!content) { return setErrorMessage('No content.'); }
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
            if (iframeRef.current) {
                // const htmlContent = contentRef.current.innerHTML;
                // const cssContent = await extractCSS();
                // iframeのcontentDocumentを取得
                const iframeDocument = iframeRef.current.contentDocument;
                if (iframeDocument) {
                    // iframe内のHTMLを取得
                    const iframeContent = iframeDocument.documentElement.outerHTML;
                    const blob = new Blob([iframeContent], { type: 'text/html' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${bookData.title}_${contentType}.html`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                    setSuccessMessage('Successfully html file download!')
                }
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

                const token = localStorage.getItem('token');
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

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCssEditorVisible(e.target.checked);
    };

    const resetCss = async () => {
        try {
            setLoadingTxt('CSS Resetting...');
            const confirmMessage = `Reset css?`;
            if (!window.confirm(confirmMessage)) { return; }
            await getCss();
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTxt('');
        }
    }

    const handleChangeCss = (value: string) => {
        handleContentsChange('defaultStyle', value);
        setCssContent(value);
    }

    const extractHeadersAndCode = (markdownText: string): string => {
        const confirmMessage = `Extract headers and code from body?`;
        if (!window.confirm(confirmMessage)) { return ''; }

        const headerRegex = /^(#{1,6} .+)/gm; // ヘッダーを検出する正規表現
        const codeBlockRegex = /```(\w+)?/; // コードブロックを検出する正規表現

        let newMarkdown = '';

        const lines = markdownText.split('\n');
        let isCodeBlock = false;

        // 各行を順番に確認し、ヘッダーまたはコードブロックを追加
        for (const line of lines) {
            if (isCodeBlock) {
                newMarkdown += `${line}\n`;
            }
            // ヘッダーが存在する場合は追加
            else if (line.match(headerRegex)) {
                newMarkdown += `${line}\n`;
            }
            // コードブロックが存在する場合は追加
            else if (line.match(codeBlockRegex)) {
                console.log(line)
                newMarkdown += `${line}\n`;
                isCodeBlock = !isCodeBlock;
            }
        }

        return newMarkdown;
    };


    return (
        <>
            <div className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-20 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-3 flex justify-between items-center border-b">
                    <div className="flex">
                        <h2 className="text-xl font-bold mr-2">{editorTitle}</h2>
                    </div>
                    <div className="space-x-2">
                        {extract && (
                            <button
                                onClick={() => extractHeadersAndCode(bookData.mdBody || '')}
                                className="bg-blue-500 text-white px-2 py-1 rounded w-18"
                            >
                                Extract
                            </button>
                        )}
                        {/* Todo: まずはhtmlでいい。その後epubが必要なら作る。 */}
                        {/* {loadable && (
                            <button
                                onClick={handleEpubDownload}
                                className="bg-lime-500 text-white px-2 py-1 rounded w-18 h-8 select-none"
                            >
                                DL-epub(β)
                            </button>
                        )} */}
                        {cssEditorVisible && (
                            <button
                                onClick={resetCss}
                                className="bg-blue-500 text-white px-3 py-1 rounded w-16"
                            >
                                Reset
                            </button>
                        )}
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
                        {gptButton && (
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

                <div className="h-8 flex items-center p-4 pl-5">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            onChange={handleToggleChange}
                            checked={cssEditorVisible}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">CSS Editor</span>
                    </label>
                </div>

                <div className="flex flex-col pl-4 pr-4 pb-4 pt-1 h-full md:flex-row">
                    <div className="w-full md:w-1/2 pr-2 h-full relative">
                        <textarea
                            name="markdown"
                            placeholder={`${placeHolderText ? placeHolderText : "Markdown content"}`}
                            onChange={handleInputChange}
                            value={bookData[contentType]}
                            className="w-full h-[91%] p-2 border border-gray-300 rounded"
                        ></textarea>

                        {cssEditorVisible && (
                            <textarea
                                name="cssEditor"
                                placeholder="CSS content"
                                onChange={(e) => handleChangeCss(e.target.value)}
                                value={bookData.defaultStyle}
                                className="absolute top-0 -left-1 z-30 w-[calc(100%-0.25rem)] h-[91%] p-2 pr-0 border border-gray-300 rounded"
                            ></textarea>
                        )}
                    </div>

                    <div className="w-full md:w-1/2 pl-2 h-[91%] overflow-auto p-2 border border-gray-300 rounded max-w-none">
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
                        <iframe ref={iframeRef} className="w-full h-full border-gray-300 rounded"></iframe>
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
