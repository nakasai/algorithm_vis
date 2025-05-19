# Claude アーティファクト ギャラリー

このリポジトリは、Anthropic社のClaudeを使って生成したインタラクティブなReactアプリケーション集です。

## アクセス方法

このギャラリーはGitHub Pagesで公開されており、次のURLでアクセスできます：
https://nakasai.github.io/algorithm_vis/

## コンテンツ

このギャラリーには以下のようなアーティファクトが含まれています：
- ナップサック問題の可視化 (拡張版)
- 編集距離可視化
- スタックとキュー可視化
- データ構造ビジュアライザー
- 区間分割問題の動的計画法
- 貪欲法アルゴリズム

## ローカル開発

### 必要環境
- Node.js 16.x以上
- npm 7.x以上

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/n4kei/claude-artifacts.git
cd claude-artifacts

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# GitHub Pagesへのデプロイ
npm run deploy
```

## Project Structure

-   `public/`: Static assets.
-   `src/`: Source code.
    -   `artifacts/`: Contains the individual React components for each visualization/demo.
    -   `components/`: Shared React components, including the main `ArtifactViewer` and `ArtifactList`.
    -   `data/`: Data files, such as `artifactsData.ts` which defines the list of artifacts.
    -   `App.tsx`: Main application component, sets up routing.
    -   `main.tsx`: Entry point of the application.
-   `index.html`: Main HTML file.
-   `vite.config.ts`: Vite configuration.
-   `tailwind.config.js`: Tailwind CSS configuration.
-   `tsconfig.json`: TypeScript configuration.

## 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
