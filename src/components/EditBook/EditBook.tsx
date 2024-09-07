import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { useState, useEffect } from 'react';

import HtmlEditor from '../HtmlEditor/HtmlEditor';

import { BookDataType, HtmlType, SampleCodeType, RequiredFieldType } from '../../types/BookTypes';

const EditBook = () => {
    const { id } = useParams(); // URLからidを取得
    let initData: BookDataType = {
        id: Number(id),
        title: "", // 初期値を空文字に設定
        author: "",
        genre: "",
        isPublished: false,
    };

    const [editBookData, setEditBookData] = useState<BookDataType>(initData);
    const [unEditedData, setUnEditedData] = useState<BookDataType>(initData);
    const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState<boolean>(false);
    const [isSampleCodeEditorOpen, setIsSampleCodeEditorOpen] = useState<boolean>(false);
    const [isHtmlEdited, setIsHtmlEdited] = useState<boolean>(false);
    const [isSampleCodeEdited, setIsSampleCodeEdited] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate(); // useNavigateフックを使う

    useEffect(() => {
        // console.log({ editBookData, unEditedData });
    }, [editBookData]);

    useEffect(() => {
        const getBookData = async () => {
            try {
                setLoading(true);
                const res: AxiosResponse<BookDataType> = await axios.get<BookDataType>(`http://localhost:5000/book/${id}`);
                const data: BookDataType = res.data;
                setEditBookData(data);
                setUnEditedData(data);
            } catch (error) {
                console.error("Failed to get bookData", error);
                setErrorMessage(`Failed to get bookData.`);
                setSuccessMessage(null);
            } finally {
                setLoading(false);
            }
        };

        getBookData();
    }, [id]); // idが変わったらデータを再取得

    // 一定時間後にメッセージを消すためのuseEffect
    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 4000);

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage, warningMessage]);

    const requiredCheck = (): RequiredFieldType | '' => {
        const requiredFields: RequiredFieldType[] = ['id', 'title', 'author', 'genre'];

        for (const field of requiredFields) {
            if (!editBookData[field]) { return field; }
        }
        return '';
    };

    // 変更があったか確認
    const extractEditedData = (): Partial<BookDataType> => {
        const extractedData = { ...editBookData };

        // オリジナルと同じ値のプロパティを削除
        Object.keys(unEditedData).forEach((key) => {
            if (key === "id") { return; }
            if (unEditedData[key as keyof BookDataType] === editBookData[key as keyof BookDataType]) {
                delete extractedData[key as keyof BookDataType];
            }
        });

        return extractedData;
    };

    const handleBack = () => {
        // 編集した箇所のみのプロパティを抽出
        const extractedData: Partial<BookDataType> = extractEditedData();

        // propertyがidのみの場合
        const keys = Object.keys(extractedData).filter(key => key !== 'id');
        if (keys.length > 0) {
            const confirmMessage = `Back to without saving? \n Update field: \n ${keys.join(', ')}`;
            if (!window.confirm(confirmMessage)) {
                return; // ユーザーがキャンセルした場合は何もしない
            }
        }

        navigate(-1);
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setButtonDisabled(true);

            // フォームバリデーション
            const field: RequiredFieldType | '' = requiredCheck();
            if (field !== '') {
                setErrorMessage(`The "${field.charAt(0).toUpperCase() + field.slice(1)}" field is required.`);
                return;
            }

            // 編集した箇所のみのプロパティを抽出
            const extractedData: Partial<BookDataType> = extractEditedData();

            // 編集していても空の場合は更新しない 
            if (!isHtmlEdited || !editBookData.html) { delete editBookData.html; }
            if (!isSampleCodeEdited || !editBookData.sampleCode) { delete editBookData.sampleCode; }

            // propertyがidのみの場合
            const keys = Object.keys(extractedData).filter(key => key !== 'id');
            if (keys.length === 0) {
                setWarningMessage("WARNING: Not Edited");
                return;
            }

            const confirmMessage = `Are you sure update the following fields: \n ${keys.join(', ')}?`;
            if (!window.confirm(confirmMessage)) {
                return; // ユーザーがキャンセルした場合は何もしない
            }

            const res: AxiosResponse<BookDataType> = await axios.put<BookDataType>(`http://localhost:5000/book/${id}`, extractedData)
            const fieldsMessage = keys.length > 0 ? `Updated Fields: ${keys.join(', ')}` : '';
            setSuccessMessage(`${res.data.title} Updated Successfully! <br /> ${fieldsMessage}`);
            await new Promise(() => setTimeout(() => navigate('/'), 10000));
        } catch (e) {
            setErrorMessage("Failed to Update");
        } finally {
            setButtonDisabled(false);
        }
    };

    const toggleHtmlEditor = async () => {
        if (!isHtmlEditorOpen) {
            setLoading(true);
            try {
                if (!isSampleCodeEdited) {
                    const res = await axios.get<HtmlType>(`http://localhost:5000/book/html/${id}`);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        html: data.html
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        html: data.html
                    }));
                    setIsHtmlEdited(true);
                }
                setIsHtmlEditorOpen(true);
            } catch (error) {
                console.error('Failed to fetch HTML content', error);
                setIsHtmlEdited(false);
            } finally {
                setLoading(false);
            }
        } else {
            setIsHtmlEditorOpen(false);
            setLoading(false);
        }
    };

    const toggleSampleCodeEditor = async () => {
        if (!isSampleCodeEditorOpen) {
            setLoading(true);
            try {
                if (!isSampleCodeEdited) {
                    const res = await axios.get<SampleCodeType>(`http://localhost:5000/book/samplecode/${id}`);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        sampleCode: data.sampleCode
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        sampleCode: data.sampleCode
                    }));
                    setIsSampleCodeEdited(true);
                }
                setIsSampleCodeEditorOpen(true);
            } catch (error) {
                console.error('Failed to fetch SampleCode content', error);
                setIsSampleCodeEdited(false);
            } finally {
                setLoading(false);
            }
        } else {
            setIsSampleCodeEditorOpen(false);
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditBookData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContentsChange = (contentType: string, newContent: string) => {
        setEditBookData((prev) => ({
            ...prev,
            [contentType]: newContent,
        }));
    };

    return (
        <div className="container flex justify-center mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Edit</h1>
                    <button
                        className="cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4 w-full h-full">
                    <input
                        name="title"
                        placeholder="Title"
                        onChange={handleInputChange}
                        value={editBookData.title}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="author"
                        placeholder="Author"
                        onChange={handleInputChange}
                        value={editBookData.author || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="genre"
                        placeholder="Genre"
                        onChange={handleInputChange}
                        value={editBookData.genre || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        name="tableOfContents"
                        placeholder="Table of Contents"
                        onChange={handleInputChange}
                        value={editBookData.tableOfContents || ''}
                        className="w-full p-2 border border-gray-300 rounded h-32"
                    ></textarea>
                    <textarea
                        name="html"
                        placeholder="Html"
                        onChange={handleInputChange}
                        value={''}
                        className="hidden"
                    ></textarea>
                    <button
                        type="button"
                        onClick={toggleHtmlEditor}
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                    >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            {isHtmlEditorOpen ? 'Close Html Editor' : 'Open Html Editor'}
                        </span>
                    </button>
                    <br />
                    <textarea
                        name="sampleCode"
                        placeholder="sampleCode"
                        onChange={handleInputChange}
                        value={''}
                        className="hidden"
                    ></textarea>
                    <button
                        type="button"
                        onClick={toggleSampleCodeEditor}
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                    >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                            {isHtmlEditorOpen ? 'Close SampleCode Editor' : 'Open SampleCode Editor'}
                        </span>
                    </button>
                    <input
                        name="cover"
                        placeholder="Cover Path"
                        onChange={handleInputChange}
                        value={editBookData.cover || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="language"
                        placeholder="Language"
                        onChange={handleInputChange}
                        value={editBookData.language || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        name="summary"
                        placeholder="Summary"
                        onChange={handleInputChange}
                        value={editBookData.summary || ''}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                    ></textarea>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isPublished"
                            className="mr-2"
                            checked={editBookData.isPublished || false}
                            onChange={(e) => setEditBookData((prev) => ({
                                ...prev,
                                isPublished: e.target.checked,
                            }))}
                        />
                        <label>Published</label>
                    </div>
                    <input
                        name="kindle"
                        placeholder="Kindle URL"
                        onChange={handleInputChange}
                        value={editBookData.kindle || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="submit"
                        className={`text-white bg-gradient-to-r from-cyan-500 to-blue-500 
                             focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 
                            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 min-w-[90px]
                            ${buttonDisabled ? '' : 'hover:bg-gradient-to-bl'}
                        `}
                        disabled={buttonDisabled} // 送信中なら無効化
                    >
                        {buttonDisabled ? (
                            <FaSpinner className="animate-spin inline-block" />
                        ) : (
                            'Update'
                        )}
                    </button>
                </form>
            </div>

            {/* <div
                className={`fixed top-0 right-0 h-full w-full bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 
                    ${isHtmlEditorOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
                }
                onClick={toggleHtmlEditor}
            /> */}

            <HtmlEditor
                content={editBookData.html || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"html"}
                isOpen={isHtmlEditorOpen}
                editorTitle={"Html Editor"}
                onClose={toggleHtmlEditor}
            />

            <HtmlEditor
                content={editBookData.sampleCode || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"sampleCode"}
                isOpen={isSampleCodeEditorOpen}
                editorTitle={"Sample Code Editor"}
                onClose={toggleSampleCodeEditor}
            />

            {/* 成功メッセージ */}
            {successMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p
                            dangerouslySetInnerHTML={{ __html: successMessage }}
                        />
                    </div>
                </div>
            )}

            {/* Warning Message */}
            {warningMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{warningMessage}</p>
                    </div>
                </div>
            )}

            {/* エラーメッセージ */}
            {errorMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="text-white">Loading...</div>
                </div>
            )}

        </div>
    );
};

export default EditBook;
