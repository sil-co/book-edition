import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { useGlobalState } from '../../context/GlobalStateProvider';
import * as BT from '../../types/BookTypes';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/urls';
// import MarkdownEditor from '../Editor/MarkdownEditor';

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
    isOpen,
    onClose,
    bookData
}: {
    isOpen: boolean;
    onClose: () => void;
    bookData: BT.BookDataRequiredId;
}) => {
    const [selectedContent, setSelectedContent] = useState<BT.ContentOption[]>(contentOptions);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { setSuccessMessage, setErrorMessage } = useGlobalState();
    const { t } = useTranslation();

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

            const token = localStorage.getItem('token');
            const res = await axios.post(
                API_ENDPOINTS.generateHtml(),
                {
                    ...contentStatus,
                    bookId: bookData.id,

                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            const contentDisposition = res.headers['content-disposition'];
            let fileName = `downloaded_file.zip`; // デフォルトのファイル名
            if (contentDisposition) {
                // UTF-8エンコードされたファイル名を処理
                const utf8FilenameRegex = /filename\*=UTF-8''([\w%.-]+)/i;
                const utf8Match = contentDisposition.match(utf8FilenameRegex);

                if (utf8Match && utf8Match[1]) {
                    fileName = decodeURIComponent(utf8Match[1]);
                } else {
                    // 通常のファイル名を処理
                    const filenameRegex = /filename="?(.+)"?/i;
                    const match = contentDisposition.match(filenameRegex);

                    if (match && match[1]) {
                        fileName = match[1].replace(/['"]/g, '');
                    }
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
            setSuccessMessage(t(t('dlSuccess')));
        } catch (error) {
            // console.error('An error occurred while downloading HTML:');
            console.error(error);
            setErrorMessage(t('dlFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && onClose) { onClose(); }
                        }}>
                        <div className="bg-white rounded-lg p-6 w-96">
                            <h2 className="text-xl font-bold mb-4 select-none">{t('chooseContent')}</h2>
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
                                    {t('cancel')}
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
                                    {t('dlZip')}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <MarkdownEditor
                        bookData={bookData}
                        handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => {}}
                        contentType={"introduction"}
                        isOpen={true}
                        editorTitle={"Markdown All Markdown Text"}
                        onClose={() => {}}
                        gptButton={true}
                        placeHolderText={"All Markdown Text to the book"}
                    /> */}
                </>
            )}
        </>
    );
};

export default SelectModal;
