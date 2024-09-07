import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react';

import HtmlEditor from '../HtmlEditor/HtmlEditor';

import { BookDataType } from '../../types/BookTypes';

const CreateBook = () => {
    const [newBook, setNewBook] = useState<Partial<BookDataType>>({
        title: "", // 初期値を空文字に設定
        author: "",
        genre: "",
        isPublished: false,
    });
    // const [selectedBook, setSelectedBook] = useState<Partial<BookDataType> | null>(null);
    const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
    const [isSampleCodeEditorOpen, setIsSampleCodeEditorOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // 成功メッセージの状態
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [buttonDisabled, setButtonDisabled] = useState(false); // 送信状態を管理

    const navigate = useNavigate(); // useNavigateフックを使う

    // 一定時間後にメッセージを消すためのuseEffect
    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 3000); // 3秒後にメッセージを消す

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage]);

    // バリデーション
    const validateForm = () => {
        const requiredFields: Array<keyof BookDataType> = ['title', 'author', 'genre'];
        for (const field of requiredFields) {
            if (!newBook[field]) {
                return `The "${field}" field is required.`;
            }
        }
        return null;
    };

    const postSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setButtonDisabled(true); // ボタンを押したら送信状態に変更

        // フォームバリデーション
        const error = validateForm();
        if (error) {
            setErrorMessage(error);
            setSuccessMessage(null);
            setButtonDisabled(false);
            return;
        }

        axios.post('http://localhost:5000/books', newBook)
            .then(async (res) => {
                const resBook: BookDataType = res.data;
                setNewBook(resBook);
                setErrorMessage(null); // 成功した場合はエラーメッセージをクリア
                setSuccessMessage('Book created successfully!'); // 成功メッセージを設定
                await new Promise(() => {
                    setTimeout(() => {
                        navigate('/');
                    }, 1000);
                });
            })
            .catch(() => {
                setErrorMessage('Failed to add the book. Please try again.'); // エラーメッセージを設定
                setSuccessMessage(null); // 成功メッセージはクリア

            }).finally(() => {
                setButtonDisabled(false); // エラーがあった場合に再度ボタンを有効にするため
            });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewBook((prevBook) => ({
            ...prevBook,
            [name]: value,
        }));
    };

    const toggleHtmlEditor = async () => {
        if (!isHtmlEditorOpen) {
            setLoading(true);

            try {

            } catch (error) {
                console.error('Failed to fetch HTML content', error);
            } finally {
                setIsHtmlEditorOpen(true);
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

            } catch (error) {
                console.error('Failed to fetch HTML content', error);
            } finally {
                setIsSampleCodeEditorOpen(true);
                setLoading(false);
            }
        } else {
            setIsSampleCodeEditorOpen(false);
            setLoading(false);
        }

    }

    const handleContentsChange = (contentType: string, newContent: string) => {
        setNewBook((prev) => ({
            ...prev,
            [contentType]: newContent,
        }));
    };

    return (
        <div className="container flex justify-center mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Create</h1>
                    <button
                        className="cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </div>
                <form onSubmit={postSubmit} className="space-y-4 w-full h-full">
                    <input
                        name="title"
                        placeholder="Title"
                        onChange={handleInputChange}
                        value={newBook.title}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="author"
                        placeholder="Author"
                        onChange={handleInputChange}
                        value={newBook.author || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="genre"
                        placeholder="Genre"
                        onChange={handleInputChange}
                        value={newBook.genre || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        name="tableOfContents"
                        placeholder="Table of Contents"
                        onChange={handleInputChange}
                        value={newBook.tableOfContents || ''}
                        className="w-full p-2 border border-gray-300 rounded h-32"
                    ></textarea>
                    <textarea
                        name="html"
                        placeholder="Html"
                        onChange={handleInputChange}
                        value={newBook.html || ''}
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
                        value={newBook.sampleCode || ''}
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
                        value={newBook.cover || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        name="language"
                        placeholder="Language"
                        onChange={handleInputChange}
                        value={newBook.language || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        name="summary"
                        placeholder="Summary"
                        onChange={handleInputChange}
                        value={newBook.summary || ''}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                    ></textarea>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isPublished"
                            onChange={(e) => setNewBook({ ...newBook, isPublished: e.target.checked })}
                            className="mr-2"
                        />
                        <label>Published</label>
                    </div>
                    <input
                        name="kindle"
                        placeholder="Kindle URL"
                        onChange={handleInputChange}
                        value={newBook.kindle || ''}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="submit"
                        className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                        disabled={buttonDisabled} // 送信中なら無効化
                    >
                        Create
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
                content={newBook.html || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"html"}
                isOpen={isHtmlEditorOpen}
                editorTitle={"Html Editor"}
                onClose={toggleHtmlEditor}
            />

            <HtmlEditor
                content={newBook.sampleCode || ''}
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
                        <p>{successMessage}</p>
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

export default CreateBook;
