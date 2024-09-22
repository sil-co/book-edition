import { createContext, useState, ReactNode, useContext } from 'react';

// Contextの型定義
interface GlobalStateContextType {
    loadingTxt: string;
    successMessage: string | null;
    warningMessage: string | null;
    errorMessage: string | null;
    imageModalSrc: string | null;
    setLoadingTxt: (txt: string) => void;
    setSuccessMessage: (msg: string | null) => void;
    setWarningMessage: (msg: string | null) => void;
    setErrorMessage: (msg: string | null) => void;
    setImageModalSrc: (src: string | null) => void;
    token: string;
    setToken: (msg: string) => void;
}

// 初期値の設定
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Providerの作成
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
    const [loadingTxt, setLoadingTxt] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);
    const [token, setToken] = useState<string>('');

    return (
        <GlobalStateContext.Provider
            value={{
                loadingTxt,
                successMessage,
                warningMessage,
                errorMessage,
                imageModalSrc,
                setLoadingTxt,
                setSuccessMessage,
                setWarningMessage,
                setErrorMessage,
                setImageModalSrc,
                token,
                setToken,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};

// Contextの利用を簡単にするためのフック
export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};
