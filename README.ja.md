# DOM Sniper

[English](README.md)

AI コーディングアシスタントと一緒に Web ページを作る人のための Chrome 拡張機能です。ページ上の要素をクリックすると、アシスタントがコード上の該当箇所を探すのに必要な情報(ページの URL、CSS セレクタのパス、要素の位置、HTML)をコピーします。取得した内容は Chrome のサイドパネルに履歴として残り、あとから検索できます。

![サイドパネルに履歴を表示しながら要素を選択しているところ](docs/screenshot-select.png)

## コピーされる内容

```
URL: http://localhost:4173/pricing
DOM Path: main#main > section#pricing > div.pricing-card.pricing-card--featured
Position: top=272px, left=335px, width=250px, height=320px
HTML Element: <div class="pricing-card pricing-card--featured">Pro $8 / month For people who live in notes Unlimited notes Sync across devices Version history Start free trial</div>
```

これを、変更したい内容と一緒にアシスタントへ貼り付けます。

形式は Cursor の内蔵ブラウザにある要素選択に合わせていますが、違いが 2 つあります。URL を含むことと、**DOM Path が有効な CSS セレクタになっていること**です。クラスは `.` で繋ぎ、Tailwind の `md:flex` のような特殊文字はエスケープし、兄弟要素と区別できないときだけ `:nth-child()` を付けます。そのため、このパスはそのまま `document.querySelector` に渡せます。

## 機能

- **要素の選択** – ホバーで枠が表示され、クリックで取得します。選びたい要素が別の要素に覆われているときは、キーボードで親要素・子要素に移動できます。
- **クリックしにくい要素にも対応** – ホバーで開くメニューは開いたまま選択できます。モーダルの `<dialog>` の中や、open な Shadow DOM の中の要素も選択できます。
- **サイドパネルの履歴** – 取得した内容は、要素のスクリーンショット付きで保存されます。URL・セレクタ・テキスト・HTML で検索でき、何度でもコピーし直せます。
- **要素のスクリーンショット** – 詳細画面で確認でき、画像としてコピーしてテキストと一緒に貼り付けられます。
- **設定** – 表示言語(日本語 / 英語)の切り替えと、選択中に使うキーの変更ができます。
- **ローカルで完結** – 拡張機能は通信を一切行いません。詳しくは[権限とプライバシー](#権限とプライバシー)をご覧ください。

![取得した内容の詳細画面](docs/screenshot-detail.png)

## インストール

DOM Sniper は、まだ Chrome ウェブストアで公開されていません。公開までは、リリースの zip を使うか、ソースからビルドしてください。Chrome 114 以降が必要です。

### リリースから

1. [最新のリリース](https://github.com/furdabu/dom-sniper/releases/latest)から `dom-sniper-<バージョン>-chrome.zip` をダウンロードして展開します。
2. `chrome://extensions` を開き、**デベロッパーモード**を有効にして、**パッケージ化されていない拡張機能を読み込む**から展開したフォルダを選びます。

### ソースから

Node.js 22 と [pnpm](https://pnpm.io/) が必要です。

```sh
pnpm install
pnpm build
```

ビルドできたら、同じ手順で `.output/chrome-mv3` フォルダを読み込みます。

## 使い方

1. ツールバーの DOM Sniper アイコンをクリックして、サイドパネルを開きます。
2. サイドパネルの**要素を選択**を押すか、ショートカット `Alt+Shift+S`(macOS では `⌥⇧S`)を使います。
3. 取得したい要素にカーソルを合わせてクリックします。テキストがクリップボードにコピーされ、履歴に追加されます。
4. アシスタントに貼り付けます。

選択中に使えるキー:

| キー | 動作 |
| --- | --- |
| `↑` | 親要素を選ぶ |
| `↓` | カーソル直下の要素に向かって戻る |
| `Esc` | 選択を終了する |

## 設定

**要素を選択**ボタンの隣のアイコンから開きます。

- **言語** – ブラウザに合わせる / 日本語 / 英語。サイドパネルとページ上の操作ガイドがすぐに切り替わります。
- **キー設定** – キーをクリックしてから、割り当てたいキーを押します。割り当てられるのは修飾キーなしの単独キーです。物理的なキー位置で判定するので、日本語入力がオンのままでも動作します。他の操作で使っているキーを選ぶと、2 つのキーが入れ替わります。
- **開始ショートカット** – このショートカットは Chrome が管理しているため、`chrome://extensions/shortcuts` で変更します。設定画面には現在の割り当てと、その画面を開くボタンがあります。

設定は Chrome の同期ストレージに保存され、同じアカウントでログインしている他の Chrome にも引き継がれます。

## 権限とプライバシー

| 権限 | 必要な理由 |
| --- | --- |
| すべてのサイトへのアクセス | 選択を開始したタブに要素選択の仕組みを追加するためと、クリックした要素のスクリーンショットを撮るためです。選択を開始するまで、ページ上では何も実行されません。 |
| `scripting` | すべてのページでスクリプトを常時動かす代わりに、必要なときだけ注入するためです。 |
| `sidePanel` | 履歴と設定をサイドパネルに表示するためです。 |
| `storage` | 言語とキーの設定を保存するためです。 |

取得した内容(URL、ページタイトル、セレクタ、HTML、テキスト、スクリーンショット)は、ブラウザ内の拡張機能専用の IndexedDB にだけ保存されます。外部には一切送信しません。詳細は [PRIVACY.md](PRIVACY.md) にあります。

## 制限事項

- `<iframe>` の中の要素は選択できず、iframe 自体が選択されます。closed な Shadow DOM も同様です。
- スクリーンショットに写るのは、画面に見えている範囲だけです。ビューポートより大きい要素は、見えている部分だけになります。
- `chrome://` のページや Chrome ウェブストアなど、Chrome が拡張機能の動作を許可していないページでは使えません。
- Shadow DOM をまたぐ DOM Path は、境界を ` >>> ` で表します。これは CSS では表現できないため、そのパスはそのままでは `querySelector` に渡せません。
- 履歴に残るのは最新の 500 件です。1 つの要素について保存する HTML は 20,000 文字で切り詰めます。

## 開発

[WXT](https://wxt.dev/)、React、[TanStack Router](https://tanstack.com/router)、SCSS で作られています。

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | ホットリロード付きの開発ビルド |
| `pnpm build` | 本番ビルド(`.output/chrome-mv3`) |
| `pnpm zip` | Chrome ウェブストア提出用の zip を `.output/` に作成 |
| `pnpm compile` | 型チェック |
| `pnpm icons` | `public/icon/` のアイコンを再生成 |

```
entrypoints/
  background/       Service worker。要素選択の注入、スクリーンショットの撮影、履歴の保存
  picker.content/   Content script。要素選択、オーバーレイ、セレクタの生成、クリップボード
  sidepanel/        サイドパネルの UI。履歴、詳細、設定
lib/                共通コード。保存、設定、メッセージ、翻訳
public/_locales/    manifest で使う文言(説明文、ショートカット名)
```

### リリース

`main` への push とプルリクエストは、すべて GitHub Actions でビルドされます。`package.json` の `version` に対応するリリースがまだ無い場合は、同じ実行の中で `v<バージョン>` という名前の GitHub リリースが作られ、zip が添付されます。つまり、`version` を上げて `main` に push すればリリースされます。この zip は、そのまま Chrome ウェブストアにアップロードできます。

### 言語を追加する

1. `lib/i18n/en.ts` を `lib/i18n/fr.ts` のようにコピーして翻訳します。足りないキーがあれば `Messages` 型のエラーでわかります。
2. `lib/i18n/index.ts` の `MESSAGES` と `LOCALE_NAMES` に登録します。
3. Chrome が表示する拡張機能の説明文のために、`public/_locales/<言語コード>/messages.json` を追加します。
