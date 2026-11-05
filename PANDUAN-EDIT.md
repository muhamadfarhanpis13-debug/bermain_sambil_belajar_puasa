# Panduan Mengedit

Semua file bisa dibuka dengan editor teks biasa (VS Code atau Notepad). Tidak perlu install apa pun; buka `index.html` di browser untuk melihat hasilnya.

## Menaruh file sendiri

| Yang diganti | Simpan di | Nama file |
|---|---|---|
| Rekaman suara | `audio/` | `halaman-4.mp3`, `halaman-8.mp3`, `halaman-12.mp3` |
| Gambar di atas tiap halaman | `gambar/` | `halaman-4.png`, `halaman-8.png`, `halaman-12.png`, `halaman-15-16.png`, `halaman-20.png`, `halaman-22.png` |
| Maskot di kotak jawaban kuis | `gambar/` | `maskot.png` |
| Gambar sampul halaman utama | `gambar/` | `sampul.webp` (timpa file yang ada) |
| Ikon kartu di halaman utama | `gambar/` | `ikon-halaman-4.webp`, `ikon-halaman-8.webp`, dan seterusnya (timpa file yang ada; persegi, sekitar 240 × 240 piksel) |

- File yang belum ada tidak membuat halaman rusak. Rekaman yang belum ada diganti suara otomatis perangkat; gambar yang belum ada diganti potongan gambar sampul.
- Gambar atas halaman tampil utuh selebar halaman. Paling pas berukuran mendatar dengan perbandingan sekitar 4 : 3 (misalnya 1600 × 1156 piksel); perbandingan lain tetap tampil utuh, hanya diberi tepi langit biru.
- Maskot ditampilkan utuh, tidak dipotong. Pakai gambar berlatar transparan dengan sedikit ruang kosong di sekelilingnya.
- Format atau nama lain juga boleh, asal ditulis di halamannya:
  - rekaman: atribut `data-audio="audio/..."` pada kartu pemutar;
  - gambar tokoh: atribut `data-img="gambar/..."` pada `act-hero-art` (di bagian atas halaman);
  - maskot: `maskot` di bagian **PENGATURAN** paling atas `assets/aktivitas.js`.

## Mengubah isi

| Yang diubah | Tempatnya |
|---|---|
| Judul, paragraf, langkah-langkah, ayat, doa | Langsung di file `halaman-*.html` |
| Naskah penjelasan (dibacakan suara otomatis) | `<p class="transcript-text">` di Halaman 4, 8, 12. Samakan dengan isi rekaman |
| Soal kuis dan umpan baliknya | Blok `quiz-data` di Halaman 8 dan 20, dengan isian `judul`, `pertanyaan`, `pilihan`, `kunci`, `jikaBenar`, `jikaBelumTepat` (petunjuknya ada di atas blok itu) |
| Doa yang dihafal | Baris bertanda `data-words` di Halaman 22 |
| Pilihan lama tidur siang | `data-min="15"` dan seterusnya di Halaman 15–16 |
| Jumlah hari pencatat mengaji | `data-days="30"` di Halaman 12 |
| Teks tombol dan pesan (misalnya "Betul, Adik-adik!") | Bagian **PENGATURAN** di atas `assets/aktivitas.js` |
| Kecepatan suara, syarat 2 bintang, lama tidur siang awal, pola getar alarm tidur siang | Bagian **PENGATURAN** di atas `assets/aktivitas.js` |
| Warna | Variabel di bagian atas `assets/aktivitas.css` |

## Hati-hati

- **Soal kuis**: setiap teks diapit tanda kutip `"..."`, dan antarsoal dipisah koma. Kalau ada yang terlewat, kuis menampilkan pesan "Soal kuis belum bisa ditampilkan".
- **`kunci` ditulis dengan huruf**, sama seperti di naskah: `"A"` = pilihan pertama, `"B"` = pilihan kedua, dan seterusnya.
- **Umpan balik**: kalimat pertama `jikaBenar` / `jikaBelumTepat` tampil sebagai judul kotak (misalnya "Betul, Adik-adik!"), sisanya sebagai isi.
- **Mode menjawab** dipilih per halaman lewat tag `<section class="card quiz">`:
  - tanpa `data-coba-lagi`: anak menjawab satu kali; kalau belum tepat, jawaban yang benar langsung ditandai. Cocok untuk umpan balik yang menyebutkan jawabannya.
  - dengan `data-coba-lagi` (dipakai Halaman 8 dan 20): kalau belum tepat, pilihan itu dikunci dan anak memilih lagi sampai benar; jawaban tidak dibocorkan. Cocok untuk umpan balik "Coba lagi, ya!". Nilai hanya dihitung kalau benar pada percobaan pertama.
- **Jangan ganti `data-key`**: itu nama penyimpanan nilai kuis, catatan mengaji, dan tanda hafal di browser. Kalau diganti, catatan lama tidak terbaca lagi.
- **Menu atas dan tombol Sebelumnya/Berikutnya** ditulis di tiap halaman. Kalau urutan halaman berubah, ubah di semua halaman yang bersangkutan.
- **`assets/hero-scene.webp` dan `assets/maskot.webp`** adalah gambar bawaan: pemandangan di atas tiap halaman aktivitas, dan anak menunjuk di kotak jawaban kuis, layar hasil kuis, serta bagian bawah halaman utama. Keduanya ditampilkan utuh, tidak dipotong. Untuk mengganti per halaman pakai `gambar/halaman-*.png`; untuk maskot pakai `gambar/maskot.png`.
