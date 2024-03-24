# GetGrass.io Automation with bulk proxy Server

Ini adalah skrip klien WebSocket yang ditulis dalam Node.js yang terhubung ke server WebSocket menggunakan beberapa proksi yang ditentukan dalam sebuah file teks (`proxyList.txt`). Skrip ini mengirimkan pesan PING ke server secara teratur dan merespons pesan AUTH dan PONG.

## Persiapan

1. Clone atau unduh repositori ini ke mesin lokal Anda.
2. Buka direktori proyek dalam terminal Anda.
3. Edit sebuah file teks bernama `proxyList.txt` dalam direktori proyek. 
Tambahkan daftar proksi Anda dalam format seperti berikut:
`http://ip:port`
`socks4://ip:port`
`socks5://username:password@ip:port`
`socks5://ip:port`

4. Ubah nama file `.env.example` to `.env` lalu masukan id grass anda dengan cara F11>console>ketik localStorage.user_id lalu paste di dalam variable USER_ID di file `.env`
 
## Instalasi


Anda dapat menginstal dependensi yang di butuhkan dengan menjalankan perintah berikut di terminal Anda:

```bash
npm install
```


## Running Script
 Jalankan automation nya dengan perintah berikut
```bash
npm start
```