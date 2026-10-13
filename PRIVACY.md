# Privacy Policy

Last updated: October 13, 2026

[日本語は下にあります](#プライバシーポリシー)

DOM Sniper is a Chrome extension that copies information about an element you select on a web page. This policy explains what the extension accesses and where it is kept.

## Summary

DOM Sniper does not send any data off your device. It has no server, no analytics, no advertising, and no third-party services, and it makes no network requests. The developer never receives anything you capture.

## What the extension accesses

The extension reads a page only after you start selecting on that tab, with the **Select element** button or the keyboard shortcut. When you click an element, it reads:

- the URL and title of the page
- the HTML and text of the element you clicked, and its position on the screen
- an image of the visible part of the tab, which is cropped to that element

It does not read pages in the background, and it does not record your browsing.

## Where the data is kept

- **Captures** (the items above) are saved on your device, in the extension's own storage in Chrome (IndexedDB). They are never uploaded. The history keeps at most 500 captures and removes the oldest ones beyond that.
- **Settings** (language and key assignments) are saved in Chrome's sync storage. If you use Chrome Sync, Google syncs them between your signed-in browsers under your Google Account. They contain no page content.
- **Clipboard** – the extension writes the captured text, or the image when you choose **Copy image**, to your clipboard. It never reads your clipboard.

## Deleting your data

You can delete a single capture or the whole history from the side panel at any time. Uninstalling the extension removes all captures stored on that device.

## Sharing

Because the extension does not collect or transmit data, nothing is sold, shared with third parties, or used for advertising or any other purpose.

## Permissions

- **Access to all sites** – to add the element picker to the tab where you start selecting, and to capture the image of the element you click.
- **scripting** – to add the picker only when you ask for it.
- **sidePanel** – to show the history and settings.
- **storage** – to save your settings.

## Changes

If this policy changes, the new version will be published at this address with an updated date.

## Contact

Questions can be sent by [opening an issue](../../issues) in the project's GitHub repository.

---

# プライバシーポリシー

最終更新日: 2026 年 10 月 13 日

DOM Sniper は、Web ページ上で選択した要素の情報をコピーする Chrome 拡張機能です。このポリシーでは、拡張機能が何にアクセスし、それをどこに保存するかを説明します。

## 概要

DOM Sniper は、データを端末の外に一切送信しません。サーバー、アクセス解析、広告、第三者のサービスはいずれも使っておらず、通信を行いません。取得した内容が開発者に届くことはありません。

## 拡張機能がアクセスする情報

拡張機能がページを読み取るのは、**要素を選択**ボタンまたはキーボードショートカットで、そのタブでの選択を開始した後だけです。要素をクリックすると、次の情報を読み取ります。

- ページの URL とタイトル
- クリックした要素の HTML とテキスト、画面上の位置
- タブの表示されている範囲の画像(その要素の部分だけに切り抜きます)

バックグラウンドでページを読み取ることはなく、閲覧履歴を記録することもありません。

## データの保存先

- **取得した内容**(上記の情報)は、お使いの端末の Chrome 内にある拡張機能専用のストレージ(IndexedDB)に保存されます。アップロードされることはありません。履歴は最大 500 件で、超えた分は古いものから削除されます。
- **設定**(言語とキーの割り当て)は、Chrome の同期ストレージに保存されます。Chrome の同期を使っている場合は、Google が Google アカウントを通じて、ログインしているブラウザ間で同期します。設定にページの内容は含まれません。
- **クリップボード** – 取得したテキスト(**画像をコピー**を選んだ場合は画像)をクリップボードに書き込みます。クリップボードの内容を読み取ることはありません。

## データの削除

サイドパネルから、1 件ずつ、または履歴全体をいつでも削除できます。拡張機能をアンインストールすると、その端末に保存されている履歴はすべて削除されます。

## 第三者への提供

拡張機能はデータを収集も送信もしないため、販売、第三者への提供、広告などへの利用は一切ありません。

## 権限

- **すべてのサイトへのアクセス** – 選択を開始したタブに要素選択の仕組みを追加するためと、クリックした要素の画像を撮るためです。
- **scripting** – 要素選択の仕組みを、必要なときだけ追加するためです。
- **sidePanel** – 履歴と設定を表示するためです。
- **storage** – 設定を保存するためです。

## 変更

このポリシーを変更した場合は、更新日を改めたうえで、同じ場所に新しい版を掲載します。

## お問い合わせ

ご質問は、プロジェクトの GitHub リポジトリで [Issue を作成](../../issues)してお寄せください。
