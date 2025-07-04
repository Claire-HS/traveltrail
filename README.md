# TravelTrail

## 目錄
- [網站簡介 Introduction](#網站簡介-introduction)
- [使用技術 Techniques](#使用技術-techniques)
- [網站導覽 Demo](#網站導覽-demo)
- [聯絡資訊 Contact](#聯絡資訊-contact)

## 網站簡介 Introduction
TravelTrail提供景點搜索、清單收藏、行程建立、筆記備註、行程安排及分享等功能，幫助旅人們輕鬆規劃與管理每一趟旅遊行程。

網址: https://hs-traveltrail.vercel.app/
* 測試帳號 : test@test.com
* 密碼: 123456



## 使用技術 Techniques
* 前端技術
    * React
        * React Hooks
        * React Context
    * Next.js (App Router)
    * TypeScript
    * Tailwind CSS
    * Mantine UI
    * Responsive web design (RWD)
* 後端 / API 技術：
    * Next.js API Routes (App Router)
        * 使用 Next.js 自訂 API Route (GET)，實作伺服器端動態圖片代理服務
        * 解析與驗證 URL 參數，整合第三方 Google Places API
        * 實現伺服器端 Fetch 請求與響應轉發
        * 設定 HTTP Cache-Control 快取策略，優化前端載入效能
        * 熟悉環境變數管理與安全性處理
* 雲端資料儲存
    * Firebase 
        * Firestore
        * Storage
* 會員系統
    * Firebase Authentication
* 網站部署
    * Vercel
* 地圖套件
    * Google Maps APIs 
    * Google Places API (New)
* 拖曳套件
    * @dnd-kit/core




## 網站導覽 Demo
(1) 首頁：提供會員已公開之行程規劃預覽
一般使用者免登入即可瀏覽網站會員公開分享之行程規劃。

(2) 會員註冊及登入
使用者透過任一信箱註冊後，即可完成登入。另提供測試帳號。

(3) 景點搜索：登入後可建立個人收藏清單或新增行程，選填景點備註並儲存。
導入Google Maps APIs及Places API，讓使用者能輕鬆搜尋景點並查看詳細資訊。使用者可將景點加入個人收藏清單，或直接新增至行程中，並填寫備註以記錄個人想法。此外，提供「免填旅遊開始/結束日期」的彈性行程建立方式，只需輸入行程標題，即可快速儲存景點，免去設定日期的麻煩。

(4) 行程管理：建立、修改或刪除行程
提供已登入之使用者查看所有個人行程，並進行新增、修改或刪除操作。同時可調整行程的隱私設定(預設不公開)。點擊「編輯行程」即可進入規劃頁面，進一步管理行程內容與景點安排。

(5) 規劃行程：隨意拖動景點來排行程
本頁整合景點搜索功能，使用者搜索景點並加入清單或行程後，可立即選取已儲存的行程項目，在收藏清單與行程區塊間任意拖拉，或將行程暫存景點移動至日程分頁，進行每日行程安排。系統採自動儲存機制，無需手動儲存，確保操作即時同步、不中斷。

(6) 行程分享：查看公開行程的每日景點安排。
一般使用者從首頁點擊任一公開行程後，可在本頁查看完整行程內容。

## 聯絡資訊 Contact
* Name: 陳立欣
* Email: claire.hshin619@gmail.com


