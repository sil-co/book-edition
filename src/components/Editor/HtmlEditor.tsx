import { ChangeEvent } from 'react';

interface HtmlEditorProps {
    content: string;
    handleContentsChange: (contentType: string, newContent: string) => void;
    contentType: string;
    isOpen?: boolean;
    onClose?: () => void;
    editorTitle?: string;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
    content,
    handleContentsChange,
    contentType,
    isOpen,
    onClose,
    editorTitle
}) => {
    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        handleContentsChange(contentType, newContent);
    };

    return (
        <div 
            className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
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
                        name="html"
                        placeholder="Content"
                        onChange={handleInputChange}
                        value={content}
                        className="w-full h-[90%] p-2 border border-gray-300 rounded h-96"
                    ></textarea>
                </div>
                <div className="w-full md:w-1/2 pl-2 h-full">
                    <div
                        className="w-full h-[90%] p-2 border border-gray-300 rounded h-96 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: content }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default HtmlEditor;
