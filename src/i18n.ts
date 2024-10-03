import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi) // 翻訳ファイルをロードする
    .use(LanguageDetector) // ユーザーのブラウザ言語を検出
    .use(initReactI18next) // Reactでi18nを使用可能にする
    .init({
        supportedLngs: ['en', 'zh', 'hi', 'es', 'bn', 'fr', 'ru', 'pt', 'id', 'de', 'ja', 'ko'], // サポートする言語
        fallbackLng: 'en', // 言語が見つからない場合に使用するデフォルト言語
        detection: {
            order: ['localStorage', 'cookie', 'navigator'], // 言語の検出順序
            caches: ['localStorage', 'cookie'] // 検出した言語を保存する場所
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json' // 翻訳ファイルのパス
        },
        react: {
            useSuspense: false // サスペンスを無効化
        }
    });

export default i18n;
