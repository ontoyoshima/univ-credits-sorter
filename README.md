# CSV整形・表示ツール

島根大学Campus Squareにて配布されるCSV成績ファイルをアップロードすると、
時間割コードおよび開講年度に基づいて単位区分ごとに単位数を付与・合計単位数を自動計算するWebアプリです。

現在、2023~2025年度に入学した下記の学部生に対応しています。
- 総合理工学部
- 材料エネルギー学部

> [!CAUTION]
> **これは非公式アプリです**

---
## 📌使い方

本アプリは以下の流れで動作します。

1. 学部・入学年度を選択
2. ユーザーがCSVをアップロード
3. CSV読み込み
   - 時間割コードで科目区分を取得
   - 時間割コード＋年度で単位数を一意に取得
4. 単位区分ごとに集計し、結果を出力

<img width="639" height="360" alt="Image" src="https://github.com/user-attachments/assets/da3a8754-028c-4faa-a8a0-6ec89220e532" />

> [!CAUTION]
> テストデータにより確認を行っていますが、出力結果の正確性について保証するものではありません。

---

## 🔧使用技術
![Static Badge](https://img.shields.io/badge/JavaScript-%23F7DF1E?style=flat&logo=javascript&logoColor=%23000000)
![Static Badge](https://img.shields.io/badge/Cloudflare%20Workers-%23F38020?style=flat)
![Static Badge](https://img.shields.io/badge/TypeScript-%233178C6?style=flat&logo=typescript&logoColor=%23FFFFFF)
![Static Badge](https://img.shields.io/badge/Cloudflare%20Pages-%23F38020?style=flat)


---

## その他
お問い合わせ等は[Googleフォーム(匿名可)](https://docs.google.com/forms/d/e/1FAIpQLSfozs2VH2MXGQNDvXg1e9UtvWW52hdMKf3U_osemiHjHV218g/viewform?usp=publish-editor)よりご連絡ください。
