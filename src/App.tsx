import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { I18nextProvider, useTranslation } from 'react-i18next';
import './i18n'; // i18nの設定をインポート

import { useEffect, Suspense, lazy } from 'react';

import { GlobalStateProvider } from './context/GlobalStateProvider';
import { useGlobalState } from './context/GlobalStateProvider';
// コンポーネントを遅延読み込み
const MyBooks = lazy(() => import('./components/BookList/MyBooks'));
const CreateBook = lazy(() => import('./components/CreateBook/CreateBook'));
const EditBook = lazy(() => import('./components/EditBook/EditBook'));
import BookList from './components/BookList/BookList';
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from './components/Auth/ProtectRoute';
import ErrorModal from './components/Modal/ErrorModal';
import SuccessModal from './components/Modal/SuccessModal';
import ImageModal from './components/Modal/ImageModal';
import WarningModal from './components/Modal/WarningModal';
import Loading from './components/Modal/Loading';
import Navbar from "./components/Navigator/Navbar";

const AppContent = () => {
    const {
        loadingTxt,
        errorMessage,
        warningMessage,
        imageModalSrc,
        successMessage,
        setErrorMessage,
        setSuccessMessage,
        setWarningMessage,
        setImageModalSrc,
    } = useGlobalState();

    const closeImageModal = () => { setImageModalSrc(''); };

    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage, warningMessage]);

    return (
        <>
            <Suspense fallback={<Loading loadingTxt={'Loading...'} />}>
                <Routes>
                    <Route path="/" element={<BookList />} />
                    <Route path="/books" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
                    <Route path="/edit/:id" element={<ProtectedRoute><EditBook /></ProtectedRoute>} />
                    <Route path="/create" element={<ProtectedRoute><CreateBook /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </Suspense>

            {successMessage && <SuccessModal successMessage={successMessage} />}
            {warningMessage && <WarningModal warningMessage={warningMessage} />}
            {errorMessage && <ErrorModal errorMessage={errorMessage} />}
            {imageModalSrc && <ImageModal closeModal={closeImageModal} imageModalSrc={imageModalSrc} />}
            {loadingTxt && <Loading loadingTxt={loadingTxt} />}
        </>
    );
};

const App = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng); // 言語を切り替える
    };

    return (
        <GlobalStateProvider>
            <I18nextProvider i18n={i18n}>
                <Router>
                    <Navbar changeLanguage={changeLanguage} />
                    <div className="">
                        <AppContent />
                    </div>
                </Router>
            </I18nextProvider>
        </GlobalStateProvider>
    );
}

export default App
