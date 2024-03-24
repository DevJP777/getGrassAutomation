# GetGrass.io Automation with bulk proxy Server

Ini adalah skrip klien WebSocket yang ditulis dalam Node.js yang terhubung ke server WebSocket menggunakan beberapa proksi yang ditentukan dalam sebuah file teks (`proxy_list.txt`). Skrip ini mengirimkan pesan PING ke server secara teratur dan merespons pesan AUTH dan PONG.

## Persiapan

1. Clone atau unduh repositori ini ke mesin lokal Anda.
2. Buka direktori proyek dalam terminal Anda.
3. Edit sebuah file teks bernama `proxyList.txt` dalam direktori proyek. 
Tambahkan daftar proksi SOCKS5 Anda dalam format berikut:
`http://ip:port`
`socks4://ip:port`
`socks5://username:password@ip:port`
`socks5://ip:port`

 
## Instalasi

Sebelum menjalankan skrip, pastikan Anda telah menginstal Node.js dan npm (Node Package Manager) di sistem Anda. Anda juga perlu menginstal dependensi berikut:

- ws
- node-fetch
- fake-useragent
- uuid

Anda dapat menginstal dependensi ini dengan menjalankan perintah berikut di terminal Anda:

```bash
npm install ws node-fetch fake-useragent uuid
```


## Running Script
 Jalankan automation nya dengan perintah berikut
```bash
npm start
```