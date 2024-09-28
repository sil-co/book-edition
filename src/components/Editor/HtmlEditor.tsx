import axios from 'axios';
import { useCodeMirror } from "@uiw/react-codemirror";
import { useParams } from 'react-router-dom';
import { html } from "@codemirror/lang-html"; // HTMLサポートを追加
import { oneDark } from "@codemirror/theme-one-dark"; // ダークテーマ
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';

import { useRef, useEffect, useState } from 'react';

import { useGlobalState } from '../../context/GlobalStateProvider';
import { API_ENDPOINTS } from '../../api/urls';
import * as BT from '../../types/BookTypes';

interface HtmlEditorProps {
    bookData: BT.BookDataType;
    handleContentsChange: (contentType: keyof BT.BookDataType, newContent: string) => void;
    contentType: BT.EditorContentType;
    isOpen: boolean;
    onClose: () => void;
    editorTitle: string;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
    bookData,
    handleContentsChange,
    contentType,
    isOpen,
    onClose,
    editorTitle
}) => {
    const [cssContent, setCssContent] = useState("");
    const editorRef = useRef(null);  // エディタのDOM参照を作成
    const contentRef = useRef<HTMLDivElement>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const { setErrorMessage } = useGlobalState();
    const { setContainer } = useCodeMirror({
        container: editorRef.current,  // エディタをDOMにセット
        value: bookData[contentType],  // 初期値としてHTMLの内容を渡す
        theme: oneDark,                // ダークテーマ
        extensions: [html()],          // HTMLの拡張を追加
        onChange: (value) => handleContentsChange(contentType, value),  // HTMLの内容が変更されたときに実行
    });
    const { id } = useParams();

    useEffect(() => {
        if (editorRef.current) {
            setContainer(editorRef.current);
        }
    }, [setContainer]);

    useEffect(() => {
        setCssContent(bookData.defaultStyle || '');
    }, [bookData.defaultStyle]);

    useEffect(() => {
        if (contentInnerRef.current) {
            // DOMが更新されてからHTMLを取得する
            const htmlContent = contentInnerRef.current.innerHTML;
            const fullHtml = `
<html lang="${bookData.language || 'en'}">
<head>
<meta charset="UTF-8">
<style>${cssContent}</style>
<title>${bookData.title}</title>
</head>
<body>
<div id="all-wrapper">
${htmlContent}
</div>
</body>
</html>`;
            if (isLoad) { 
                handleContentsChange(contentType, fullHtml);
                setIsLoad(false);
            }
        }
    }, [markdownContent, cssContent]);

    const getTargetType = (contentType: BT.EditorContentType): BT.EditorContentType | '' => {
        switch (contentType) {
            case 'htmlBody': {
                return 'mdBody';
            }
            case 'htmlUsage': {
                return 'mdUsage';
            }
            default: {
                return '';
            }
        }
    }

    const loadHtml = async () => {
        try {
            const confirmMessage = `Load html from Markdown?`;
            if (!window.confirm(confirmMessage)) { return; }
            setIsLoad(true);

            const targetType = getTargetType(contentType);
            if (!targetType) { return; }
            let mdBodyData: string = '';
            if (!bookData[targetType]) {
                if (!id) { throw new Error('not found id'); }
                const res = await axios.get<BT.MdBodyType>(API_ENDPOINTS.getMdBody(id));
                mdBodyData = res.data.mdBody;
            } else {
                mdBodyData = bookData[targetType] || '';
            }
            setMarkdownContent(mdBodyData);
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to load");
            setIsLoad(false);
        }
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

    return (
        <div
            className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="p-2 pl-4 pr-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold">{editorTitle}</h2>
                <div className="space-x-2">
                    <button
                        onClick={loadHtml}
                        className="bg-blue-500 text-white px-3 py-1 rounded w-16"
                    >
                        Load
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="flex flex-col p-4 h-full md:flex-row">
                <div className="w-full md:w-1/2 pr-2 h-full">
                    <div ref={editorRef} className="w-full h-[90%] p-2 border border-gray-300 rounded overflow-auto" />
                    <div ref={contentRef} className="absolute top-0 left-0 -z-30 invisible">
                        <style>${cssContent}</style>
                        <div id="all-wrapper" ref={contentInnerRef}>
                            <ReactMarkdown
                                className="prose w-full"
                                rehypePlugins={[rehypeHighlight]}
                                remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown (GFM)をサポート
                                components={reactMarkdownComponents}
                            >
                                {markdownContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 pl-2 h-full">
                    <div
                        className="w-full h-[90%] p-2 border border-gray-300 rounded overflow-auto"
                        dangerouslySetInnerHTML={{ __html: bookData[contentType] || '' }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default HtmlEditor;
