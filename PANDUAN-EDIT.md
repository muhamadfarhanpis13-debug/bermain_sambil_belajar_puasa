# Panduan Mengedit

Semua file bisa dibuka dengan editor teks biasa (VS Code atau Notepad). Tidak perlu install apa pun; buka `halaman_utama.html` di browser untuk melihat hasilnya.

## Menaruh file sendiri

| Yang diganti | Simpan di | Nama file |
|---|---|---|
| Rekaman suara | `audio/` | `halaman-4.mp3`, `halaman-8.mp3`, `halaman-12.mp3` |
| Gambar tokoh di atas tiap halaman | `gambar/` | `halaman-4.png`, `halaman-8.png`, `halaman-12.png`, `halaman-15-16.png`, `halaman-20.png`, `halaman-22.png` |
| Maskot di kotak jawaban kuis | `gambar/` | `maskot.png` |
| Gambar sampul halaman utama | `gambar/` | `sampul.webp` (timpa file yang ada) |

- File yang belum ada tidak membuat halaman rusak. Rekaman yang belum ada diganti suara otomatis perangkat; gambar yang belum ada diganti potongan gambar sampul.
- Gambar tokoh paling bagus berlatar transparan (PNG atau WebP), tegak, kira-kira 330 × 384 piksel atau kelipatannya. Gambar ditampilkan utuh di pojok kanan bawah.
- Maskot ditampilkan dalam lingkaran, jadi pakai gambar persegi dengan wajah di tengah.
- Format atau nama lain juga boleh, asal ditulis di halamannya:
  - rekaman: atribut `data-audio="audio/..."` pada kartu pemutar;
  - gambar tokoh: atribut `data-img="gambar/..."` pada `act-hero-art` (di bagian atas halaman);
  - maskot: `maskot` di bagian **PENGATURAN** paling atas `assets/aktivitas.js`.

## Mengubah isi

| Yang diubah | Tempatnya |
|---|---|
| Judul, paragraf, langkah-langkah, ayat, doa | Langsung di file `halaman-*.html` |
| Naskah penjelasan (dibacakan suara otomatis) | `<p class="transcript-text">` di Halaman 4, 8, 12. Samakan dengan isi rekaman |
| Soal kuis | Blok `quiz-data` di Halaman 8 dan 20 (petunjuknya ada di atas blok itu) |
| Doa yang dihafal | Baris bertanda `data-words` di Halaman 22 |
| Pilihan lama tidur siang | `data-min="15"` dan seterusnya di Halaman 15–16 |
| Jumlah hari pencatat mengaji | `data-days="30"` di Halaman 12 |
| Teks tombol dan pesan (misalnya "Betul, Adik-adik!") | Bagian **PENGATURAN** di atas `assets/aktivitas.js` |
| Kecepatan suara, syarat 2 bintang, lama tidur siang awal | Bagian **PENGATURAN** di atas `assets/aktivitas.js` |
| Warna | Variabel di bagian atas `assets/aktivitas.css` |

## Hati-hati

- **Soal kuis**: setiap teks diapit tanda kutip `"..."`, dan antarsoal dipisah koma. Kalau ada yang terlewat, kuis menampilkan pesan "Soal kuis belum bisa ditampilkan".
- **`answer` dihitung dari 0**: `0` = pilihan pertama, `1` = pilihan kedua, dan seterusnya.
- **Jangan ganti `data-key`**: itu nama penyimpanan nilai kuis, catatan mengaji, dan tanda hafal di browser. Kalau diganti, catatan lama tidak terbaca lagi.
- **Menu atas dan tombol Sebelumnya/Berikutnya** ditulis di tiap halaman. Kalau urutan halaman berubah, ubah di semua halaman yang bersangkutan.
- **`assets/hero.webp`** adalah cadangan untuk potongan gambar. Biarkan saja; untuk mengganti gambar pakai folder `gambar/`.
