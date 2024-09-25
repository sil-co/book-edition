import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

import { useGlobalState } from '../../context/GlobalStateProvider';
import * as BT from '../../types/BookTypes';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/urls';

const contentOptions: BT.ContentOption[] = [
    { id: 'title_sm', label: 'Title', columnName: 'title', selected: true },
    { id: 'cover_sm', label: 'Cover', columnName: 'coverImageId', selected: true },
    { id: 'introduction_sm', label: 'Introduction', columnName: 'introduction', selected: true },
    { id: 'toc_sm', label: 'Table of Contents', columnName: 'toc', selected: true },
    { id: 'body_sm', label: 'Body', columnName: 'mdBody', selected: true },
    { id: 'afterend_sm', label: 'Afterend', columnName: 'afterEnd', selected: true },
    { id: 'otherBooks_sm', label: 'Other books', columnName: 'otherBooks', selected: true },
];

const SelectModal = ({
    selectedBookId,
    isOpen,
    onClose,
}: {
    selectedBookId: string;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const [selectedContent, setSelectedContent] = useState<BT.ContentOption[]>(contentOptions);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { token, setSuccessMessage, setWarningMessage, setLoadingTxt, setErrorMessage, setImageModalSrc } = useGlobalState();

    const handleContentChange = (id: string) => {
        setSelectedContent(prev =>
            prev.map(option =>
                option.id === id ? { ...option, selected: !option.selected } : option
            )
        );
    };

    const handleZipDownload = async () => {
        setIsLoading(true);
        try {
            const contentStatus: Record<BT.ContentOption['columnName'], boolean> = {
                title: false,
                coverImageId: false,
                introduction: false,
                toc: false,
                mdBody: false,
                afterEnd: false,
                otherBooks: false,
            };

            // selectedがtrueのcolumnNameをプロパティとして持つオブジェクトを生成
            selectedContent.forEach(contentOption => {
                if (contentOption.selected) {
                    contentStatus[contentOption.columnName] = true;
                }
            });

            const res = await axios.post(
                API_ENDPOINTS.generateHtml(),
                {
                    ...contentStatus,
                    selectedBookId,

                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            const contentDisposition = res.headers['content-disposition'];
            let fileName = 'downloaded_file.zip'; // デフォルトのファイル名
            // Content-Dispositionヘッダーからファイル名を抽出
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?(.+)/);
                if (fileNameMatch && fileNameMatch.length > 1) {
                    fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, '')); // ファイル名をデコードして取得
                }
            }
            // Blobとしてファイルを作成し、ダウンロードリンクを動的に作成
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName; // サーバーから受け取ったファイル名を設定
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url); // URLを解放
            setSuccessMessage('Successfully html downloaded.');
        } catch (error) {
            // console.error('An error occurred while downloading HTML:');
            console.error(error);
            setErrorMessage('Failed to download html.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && onClose) { onClose(); }
                    }}>
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4 select-none">Choose the content you want to include</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {selectedContent.map(({ id, label, selected }) => (
                                <div key={id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={id}
                                        checked={selected}
                                        onChange={() => handleContentChange(id)}
                                        className="form-checkbox h-5 w-5 text-lime-500"
                                    />
                                    <label htmlFor={id} className="text-sm cursor-pointer select-none">{label}</label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="select-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleZipDownload}
                                disabled={isLoading}
                                className={`px-4 py-2 text-sm font-medium text-white bg-lime-500 rounded-md select-none 
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500'}`}
                            >
                                {isLoading ? (
                                    <FaSpinner className="animate-spin inline-block mr-2" />
                                ) : null}
                                Download Zip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SelectModal;
