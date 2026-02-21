# GraphHub

**GraphHub** は、GitHub のフォロー関係をインタラクティブなネットワーク図として可視化するウェブアプリです。
任意の GitHub ユーザーのフォロワー・フォロー中ユーザーを、アバター画像付きのノードとカラーコード付きのエッジで表示します。

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)
![Tests](https://img.shields.io/badge/Tests-35%20passing-brightgreen)

---

## 主な機能

- **GitHub OAuth ログイン** — NextAuth.js でログイン。認証済みトークンで GitHub API を 5,000 req/h で利用可能
- **アバター画像ノード** — 各ユーザーのアイコンをノードに表示（vis-network の `circularImage`）
- **3色エッジ（GitHub カラー）** — 相互フォロー（紫）/ フォロー中（緑）/ フォロワー（青）で関係を色分け
- **双方向矢印** — 相互フォローは `⇔`、一方向は `→` で方向を表示
- **フィルター** — 関係種別（すべて / 相互 / フォロー中 / フォロワー）でエッジを絞り込み
- **エクスポート** — グラフを PNG・JSON・CSV 形式でダウンロード
- **ノードクリック遷移** — ノードをクリックすると、そのユーザーのグラフページへ遷移
- **ズーム・パン** — マウスホイール・ドラッグで自由に探索

---

## ビジュアル使い方ガイド

### Step 1: ログイン

```
┌─────────────────────────────────────────┐
│           GraphHub                      │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ユーザー名                     │   │
│   │  ┌───────────────────────────┐  │   │
│   │  │ torvalds                  │  │   │
│   │  └───────────────────────────┘  │   │
│   │                                 │   │
│   │  ┌───────────────────────────┐  │   │
│   │  │      相関図を表示         │  │   │
│   │  └───────────────────────────┘  │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

1. ブラウザで `http://localhost:3000` を開く
2. GitHub アカウントでログイン
3. 調べたい GitHub ユーザー名を入力（例: `torvalds`）
4. **「相関図を表示」** をクリック

---

### Step 2: グラフを見る

```
┌──────────────────────────────────────────────────────────┐
│ [すべて] [相互 ⇔] [フォロー中 →] [フォロワー ←]         │  ← フィルター
│                                    [PNG] [JSON] [CSV]    │  ← エクスポート
├──────────────────────────────────────────────────────────┤
│                                                          │
│      (alice)                                             │
│        ↑ ━━━━━━━━ 紫(⇔) ━━━━━━━━━┐                      │
│        │                    (torvalds)                   │  ← 中央ノード
│        │                          │                      │    （大きめ）
│      (bob) ─── 青(←) ────────────┘                      │
│                                   │                      │
│                                   └── 緑(→) ── (carol)   │
│                                                          │
│                                          ┌──────────┐   │
│                                          │ 凡例      │   │  ← 凡例
│                                          │━━ 相互⇔  3│   │
│                                          │━━ フォロー中→12│  │
│                                          │━━ フォロワー←8 │  │
│                                          └──────────┘   │
└──────────────────────────────────────────────────────────┘
```

- **中央の大きいノード** = 入力したユーザー
- **周囲のノード** = フォロワー・フォロー中ユーザー（最大 100 件）
- **ノードをクリック** → そのユーザーのグラフへ遷移
- **マウスホイール** でズーム、**ドラッグ** でパン

---

### Step 3: フィルターで絞り込む

```
[すべて]  [相互 ⇔]  [フォロー中 →]  [フォロワー ←]
                  ↑
          クリックでハイライト表示
```

| ボタン | 表示されるエッジ |
|---|---|
| **すべて** | 全関係を表示 |
| **相互 ⇔** | 相互フォロー（紫）のみ |
| **フォロー中 →** | 自分がフォローしているユーザー（緑）のみ |
| **フォロワー ←** | 自分をフォローしているユーザー（青）のみ |

---

### Step 4: レポートをエクスポート

```
                                   [PNG] [JSON] [CSV]
                                     ↑     ↑     ↑
                                  画像  詳細  表形式
```

| ボタン | 出力内容 |
|---|---|
| **PNG** | グラフのスクリーンショット |
| **JSON** | ユーザー・サマリー・エッジ情報（機械可読） |
| **CSV** | `from,to,relationship` 形式の一覧表 |

**JSON 出力例:**

```json
{
  "user": "torvalds",
  "generated": "2026-02-22T12:00:00Z",
  "summary": {
    "total_nodes": 45,
    "mutual": 3,
    "followers_only": 8,
    "following_only": 12
  },
  "edges": [
    { "from": "torvalds", "to": "alice", "relationship": "mutual" },
    { "from": "bob", "to": "torvalds", "relationship": "follower" }
  ]
}
```

---

## グラフの凡例

| 色 | 意味 | エッジの方向 |
|---|---|---|
| 🟣 紫 `#8250df` | 相互フォロー | `⇔` 双方向 |
| 🟢 緑 `#1a7f37` | 対象ユーザーがフォロー中 | `→`（対象 → 他ユーザー） |
| 🔵 青 `#0969da` | 対象ユーザーのフォロワー | `→`（他ユーザー → 対象） |

ノードの枠色も同じ色分けに対応しています（中央ノードは紫枠・大サイズ）。

---

## 技術スタック

| レイヤー | 使用技術 |
|---|---|
| フレームワーク | Next.js 14 (App Router), TypeScript 5 |
| 認証 | NextAuth.js v5 (GitHub OAuth) |
| グラフ描画 | vis-network 9 (canvas ベース) |
| データ取得 | SWR (stale-while-revalidate) |
| スタイル | Tailwind CSS (GitHub ダークテーマ) |
| バリデーション | Zod (@t3-oss/env-nextjs) |
| テスト | Vitest + React Testing Library |

---

## 前提条件

- **Node.js** 18.17 以上（`node -v` で確認）
- **npm** 9 以上
- **GitHub アカウント**（OAuth アプリ登録用）

---

## セットアップ

### 1. GitHub OAuth アプリを作成

1. [GitHub Developer Settings](https://github.com/settings/developers) を開く
2. **OAuth Apps → New OAuth App** をクリック
3. 以下を入力:

   | フィールド | 値 |
   |---|---|
   | Application name | `GraphHub`（任意） |
   | Homepage URL | `http://localhost:3000` |
   | Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

4. **Register application** → **Client ID** と **Client Secret** をメモ

### 2. リポジトリのクローンとインストール

```bash
git clone https://github.com/<your-username>/GraphHub.git
cd GraphHub
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集:

```env
# NextAuth シークレット（下記コマンドで生成）
AUTH_SECRET=

# アプリの URL
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth アプリの認証情報
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

`AUTH_SECRET` は以下で生成できます:

```bash
npx auth secret
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

---

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動 (http://localhost:3000)
npm run build         # プロダクションビルド
npm run check         # lint + typecheck（CI 用）
npm run lint          # ESLint のみ
npm run typecheck     # TypeScript チェックのみ
npm run test          # テスト実行（35 テスト）
npm run test:watch    # ウォッチモードでテスト
npm run test:coverage # カバレッジレポート付きテスト
npm run format:write  # Prettier でフォーマット
```

---

## テスト

```bash
npm run test
```

```
✓ src/__tests__/api/github.test.ts        (10 tests)  # API ルートハンドラー
✓ src/__tests__/lib/graphUtils.test.ts    (14 tests)  # グラフ構築ロジック
✓ src/__tests__/components/Navbar.test.tsx (6 tests)  # Navbar コンポーネント
✓ src/__tests__/components/UsernameForm.test.tsx (5 tests)  # フォームコンポーネント

Tests  35 passed (35)
```

テストは以下をカバーします:
- **graphUtils**: 相互フォロー検出・エッジ色分け・`type` フィールド・ノード重複除去
- **API ルート**: 401 認証エラー、GitHub へのトークン転送、エラーステータス転送
- **Navbar**: セッションなし時の非表示、ユーザー名・アバター表示、ログアウト動作
- **UsernameForm**: フォーム送信、空白トリム、空入力ガード

---

## プロジェクト構成

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts      # NextAuth ハンドラー
│   │   └── github/
│   │       ├── user/[username]/route.ts     # GET /api/github/user/:username
│   │       ├── followers/[username]/route.ts # GET /api/github/followers/:username
│   │       └── following/[username]/route.ts # GET /api/github/following/:username
│   ├── graph/[username]/
│   │   ├── page.tsx                         # グラフページ（認証チェック）
│   │   └── _components/NetworkGraph.tsx     # vis-network グラフ（フィルター・エクスポート付き）
│   ├── login/page.tsx                       # ログインページ
│   ├── _components/
│   │   ├── Navbar.tsx                       # ナビバー
│   │   └── UsernameForm.tsx                 # ユーザー名入力フォーム
│   ├── layout.tsx                           # ルートレイアウト（SessionProvider）
│   └── page.tsx                             # ホームページ
├── lib/
│   └── graphUtils.ts                        # グラフ構築ロジック（テスト可能）
├── server/
│   └── auth.ts                              # NextAuth 設定
├── __tests__/
│   ├── api/github.test.ts
│   ├── components/Navbar.test.tsx
│   ├── components/UsernameForm.test.tsx
│   └── lib/graphUtils.test.ts
├── middleware.ts                            # 未認証 → /login リダイレクト
└── types/next-auth.d.ts                    # Session 型拡張（accessToken）
```

---

## Vercel へのデプロイ

1. このリポジトリを GitHub にプッシュ
2. [vercel.com/new](https://vercel.com/new) でリポジトリをインポート
3. **Environment Variables** に以下を追加:
   ```
   AUTH_SECRET          = <生成したシークレット>
   NEXTAUTH_URL         = https://<your-app>.vercel.app
   GITHUB_CLIENT_ID     = <Client ID>
   GITHUB_CLIENT_SECRET = <Client Secret>
   ```
4. GitHub OAuth アプリの **Authorization callback URL** を更新:
   ```
   https://<your-app>.vercel.app/api/auth/callback/github
   ```
5. **Deploy** をクリック

---

## GitHub API のレート制限

| 状態 | 制限 |
|---|---|
| 未認証 | 60 req/h |
| GitHub ログイン済み | **5,000 req/h** |

ログインすることで、フォロワー・フォロー中の取得（最大 100 件）が安定して動作します。

---

## ライセンス

[MIT](./LICENSE)
