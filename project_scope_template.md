# ĐỀ CƯƠNG PHẠM VI DỰ ÁN (PROJECT SCOPE TEMPLATE)
## DỰ ÁN: PROJECT AUDI-E

> [!NOTE]
> *Tài liệu này dùng để chốt lại toàn bộ quy mô, công nghệ và các chức năng sẽ triển khai trong dự án Project Audi-E. Bạn hãy điền/lựa chọn các mục dưới đây để làm bộ khung định hướng phát triển.*

---

## 1. THÔNG TIN CHUNG
* **Tên dự án:** Project Audi-E
* **Người thực hiện:** [Họ và tên của bạn]
* **Thời gian thực hiện dự kiến:** tự do
* **Mục tiêu học tập chính:** 
  * *Về Lập trình:* Ví dụ: học về xây dựng giao diện, backend, react, backend Go, python để xử lí scripting
  * *Về Bảo mật:* học cách khai thác lỗi,...

---

## 2. PHẠM VI CHỨC NĂNG (PROJECT SCOPE)

Bạn hãy đánh dấu `[x]` vào các tính năng bạn muốn thực hiện, hoặc `[ ]` nếu muốn bỏ qua ở phiên bản đầu tiên này.

### A. Chức năng Xử lý Âm thanh (Audio Processing)
- [x] **Tải lên & Phát nhạc:** User có thể upload file âm thanh (MP3, WAV) và nghe lại trên trình phát nhạc trực quan (hiển thị sóng âm - waveform).
- [ ] **Tách nhạc cụ (Source Separation):**
    - [x] Tách cơ bản 4 Stems (Vocal, Drums, Bass, Other). *(Nhẹ hơn, dễ chạy)*
    - [ ] Tách chi tiết 6 Stems (Vocal, Drums, Bass, Guitar, Piano, Other). *(Nặng hơn, cần nhiều RAM/GPU)*
- [x] **Lọc/Cô lập nhạc cụ:** Giao diện cho phép bật/tắt (Mute/Solo) từng nhạc cụ khi đang phát bài nhạc để người chơi Guitar/Piano tập luyện.
- [x] **Nhận diện hợp âm (Chord Recognition):** Hiển thị hợp âm đang chơi theo thời gian thực khi bài nhạc phát.
- [x] **Nhận diện nốt nhạc (Music Transcription):** Xuất ra danh sách nốt nhạc hoặc file MIDI của bài nhạc để người dùng xem/tải về.

### B. Chức năng Môi trường Pentest Lab (Security & Vulnerabilities)
- [x] **Dual-Mode Switch:** Có cờ cấu hình `PENTEST_MODE=true/false` để bật/tắt các lỗ hổng bảo mật.
- [ ] **Các lỗ hổng sẽ được cài cắm để thực hành (Chọn những lỗi bạn muốn học):**
    - [x] *Unrestricted File Upload:* Upload file script độc hại (.php, .jsp, .py, .exe) trực tiếp lên server.
    - [ ] *Path Traversal:* Đọc/ghi các file hệ thống nhạy cảm thông qua tham số đường dẫn file âm thanh.
    - [X] *Command Injection:* Khai thác việc gọi công cụ hệ thống (như ffmpeg/exiftool) để chạy lệnh shell tùy ý.
    - [ ] *Zip Slip / Zip Bomb:* Tải lên file zip chứa file nhạc bị nén lặp hoặc ghi đè file hệ thống khi giải nén.
    - [ ] *Insecure Deserialization:* Khai thác việc deserialize đối tượng cấu hình âm thanh để thực thi mã nguồn từ xa (RCE).
    - [x] *SQL Injection (nếu có DB):* Khai thác qua thanh tìm kiếm bài hát hoặc trang đăng nhập.

---

## 3. LỰA CHỌN CÔNG NGHỆ (TECH STACK)
*Hãy ghi lại lựa chọn ngôn ngữ/công nghệ bạn muốn dùng sau khi đã cân nhắc:*

* **Frontend:** React + TypeScript + Wavesurfer.js
* **Backend Gateway:** Go 
* **AI Processing Engine:** Python (FastAPI + Librosa / Demucs)
* **Cơ sở dữ liệu (Database):**  SQLite 
* **Môi trường triển khai:** hạy qua Docker trước sau đó triển khai 

---

## 4. KẾ HOẠCH TRIỂN KHAI THEO PHÂN KỲ (MILESTONES)

* **Pha 1 (Xây dựng khung cơ bản):** Làm Web UI và Backend cơ bản để Upload file âm thanh thành công, chưa xử lý AI.
* **Pha 2 (Tích hợp AI cơ bản):** Viết API Python để phân tích thông số nhạc đơn giản (BPM, Pitch) và gửi kết quả về Web.
* **Pha 3 (Cài cắm lỗ hổng & Thực hành Pentest):** Tích hợp cờ Pentest Mode và cài cắm 2-3 lỗ hổng lớn để bạn thực hành tấn công/vá lỗi.
* **Pha 4 (Nâng cấp tách nhạc cụ nâng cao & Đóng gói):** Tích hợp mô hình tách nhạc cụ đầy đủ và đóng gói Docker Compose để bàn giao.

---

## 5. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
* có thể host mmiễn phí bằng netfily hoặc github
* [x] Ứng dụng web chạy được trên môi trường local thông qua 1-2 câu lệnh khởi chạy đơn giản.
* [x] Giao diện Web đơn gian3, cho phép upload file âm thanh và nhận về kết quả phân tích.
* [x] Chế độ bảo mật (Secure Mode) ngăn chặn thành công các file payload tấn công thử nghiệm.
* [x] Chế độ Pentest (Vulnerable Mode) cho phép khai thác thành công ít nhất [X] lỗ hổng đã lên kế hoạch và có tài liệu hướng dẫn khai thác (write-up) đi kèm.
