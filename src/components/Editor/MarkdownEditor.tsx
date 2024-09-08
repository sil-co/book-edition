import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css'; // 好みのスタイルをインポート

interface MarkdownEditorProps {
    content: string;
    handleContentsChange: (contentType: string, newContent: string) => void;
    contentType: string;
    isOpen?: boolean;
    onClose?: () => void;
    editorTitle?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    content,
    handleContentsChange,
    contentType,
    isOpen,
    onClose,
    editorTitle
}) => {
    const formatMarkdownText = (text: string): string => {
        // バックスラッシュでエスケープされた\nを実際の改行に置き換える
        return text.replace(/\\n/g, '\n');
        // return text;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = formatMarkdownText(e.target.value);
        handleContentsChange(contentType, newContent);
    };

    return (
        <div className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold">{editorTitle}</h2>
                <button
                    onClick={onClose}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                >
                    Close
                </button>
            </div>

            <div className="flex flex-col p-4 h-full md:flex-row">
                <div className="w-full md:w-1/2 pr-2 h-full">
                    <textarea
                        name="markdown"
                        placeholder="Markdown content"
                        onChange={handleInputChange}
                        value={content}
                        className="w-full h-[90%] p-2 border border-gray-300 rounded h-96"
                    ></textarea>
                </div>
                <div className="w-full md:w-1/2 pl-2 h-full">
                    <ReactMarkdown
                        className="prose max-w-none w-full h-[90%] p-2 border border-gray-300 rounded h-96 overflow-auto"
                        rehypePlugins={[rehypeHighlight]}
                        remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown (GFM)をサポート
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-6" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold my-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-medium my-3" {...props} />,
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
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
