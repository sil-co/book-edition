# ベースイメージ
FROM node:20 AS build

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ビルド
RUN npm run build

# nginxを使って静的ファイルを提供するステージ
FROM nginx:alpine

# ビルドされた静的ファイルをnginxのhtmlディレクトリにコピー
COPY --from=build /app/dist /usr/share/nginx/html

# nginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf
