# GetGrass.io Automation with bulk proxy Server

Ini adalah skrip klien WebSocket yang ditulis dalam Node.js yang terhubung ke server WebSocket menggunakan beberapa proksi yang ditentukan dalam sebuah file teks (`proxy_list.txt`). Skrip ini mengirimkan pesan PING ke server secara teratur dan merespons pesan AUTH dan PONG.

## Instalasi

Sebelum menjalankan skrip, pastikan Anda telah menginstal Node.js dan npm (Node Package Manager) di sistem Anda. Anda juga perlu menginstal dependensi berikut:

- ws
- node-fetch
- fake-useragent
- uuid

Anda dapat menginstal dependensi ini dengan menjalankan perintah berikut di terminal Anda:

```bash
npm install ws node-fetch fake-useragent uuid

## Running

Jalankan Script ini dengan perintah berikut :

```bash
npm start

