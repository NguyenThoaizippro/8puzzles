# 8-Puzzle Search Algorithms Visualizer

Ứng dụng trực quan hóa (Visualizer) các thuật toán tìm kiếm giải bài toán **8-Puzzle** (Game trượt ô số 3x3). Dự án được thiết kế nhằm mục đích hỗ trợ học tập, giảng dạy môn Trí tuệ Nhân tạo (AI), giúp người học dễ dàng quan sát cách thức hoạt động của từng thuật toán qua từng bước lặp.

---

## ⚡ Các Tính Năng Nổi Bật

- **Tùy biến Hàm đánh giá ($g(n)$ và $h(n)$)**: Đối với các thuật toán sử dụng hàm đánh giá (UCS, Greedy, A*, IDA*, Hill Climbing), người dùng có thể tùy ý chọn cách tính:
  - $g(n)$ (Chi phí tích lũy): Số bước đi (mặc định), Khoảng cách Manhattan, Số ô sai vị trí, hoặc Giá trị của ô số vừa swap.
  - $h(n)$ (Heuristic ước lượng): Khoảng cách Manhattan (mặc định), Số ô sai vị trí, hoặc Giá trị của ô số vừa swap.
- **Trực quan hóa Frontier & Reached**: Hiển thị chi tiết danh sách biên (Frontier) và các trạng thái đã duyệt (Reached) ở mỗi bước lặp trong bảng truy vết.
- **Tùy chỉnh Trạng thái**: Cho phép chỉnh sửa cấu hình trạng thái ban đầu (**START**) và cấu hình đích (**GOAL**) trực tiếp trên giao diện.
- **Điều khiển Linh hoạt**: Hỗ trợ chạy từng bước (Step-by-step), chạy tự động (Auto-play) với thanh điều chỉnh tốc độ, hoặc chạy toàn bộ để xem kết quả ngay lập tức.
- **Xem lại đường đi (Playback)**: Hiển thị chuỗi hành động tối ưu (`L` / `R` / `U` / `D`) dưới dạng một chuỗi các khung hình động và hỗ trợ nút phát lại (playback) từng bước.
- **Thiết kế Responsive & Hiện đại**: Giao diện trực quan, rõ ràng, tối ưu hóa màu sắc cho việc phân biệt các trạng thái (Goal, Skipped, Cutoff, Added...).

---

## 🛠️ Các Thuật Toán Hỗ Trợ

Dự án hỗ trợ 9 thuật toán tìm kiếm phổ biến chia thành các nhóm:

### 1. Tìm kiếm không mù (Uninformed Search)
*   **BFS (Breadth-First Search)**: Duyệt theo bề rộng sử dụng cấu trúc hàng đợi (FIFO).
*   **DFS (Depth-First Search)**: Duyệt theo chiều sâu sử dụng cấu trúc ngăn xếp (LIFO).
*   **IDS (Iterative Deepening Search)**: Duyệt sâu dần, kết hợp ưu điểm về bộ nhớ của DFS và tính tối ưu của BFS.

### 2. Tìm kiếm có thông tin (Informed Search)
*   **UCS (Uniform Cost Search)**: Tìm kiếm với chi phí đồng nhất, tối ưu hóa tổng chi phí đường đi $g(n)$.
*   **Greedy (Tìm kiếm tham lam)**: Lựa chọn nút tiếp theo dựa hoàn toàn vào hàm Heuristic ước lượng $h(n)$ (sử dụng khoảng cách Manhattan).
*   **A\***: Thuật toán tìm kiếm tối ưu kết hợp chi phí thực tế $g(n)$ và chi phí ước lượng $h(n)$ ($f(n) = g(n) + h(n)$).
*   **IDA\* (Iterative Deepening A\*)**: Phiên bản duyệt sâu dần của A\*, giới hạn không gian tìm kiếm bằng giá trị $f(n)$ thay vì độ sâu đơn thuần.

### 3. Tìm kiếm cục bộ (Local Search)
*   **Leo núi đơn giản (Simple Hill Climbing)**: Đánh giá lần lượt các lân cận theo thứ tự hành động. Chọn ngay lân cận đầu tiên tốt hơn trạng thái hiện tại. Dừng khi đạt cực đại cục bộ.
*   **Leo dốc nhất (Steepest-Ascent Hill Climbing)**: Đánh giá toàn bộ các lân cận hợp lệ, chọn ra lân cận có giá trị đánh giá tốt nhất. Chỉ di chuyển nếu lân cận tốt nhất này tốt hơn trạng thái hiện tại.

---

## 📐 Quy ước & Hàm đánh giá

*   **Quy ước di chuyển**: Hành động (`L`, `R`, `U`, `D`) đại diện cho hướng di chuyển của **ô trống (số 0)**.
*   **Thứ tự mở rộng**: Mặc định ưu tiên theo thứ tự hành động `L` $\rightarrow$ `R` $\rightarrow$ `U` $\rightarrow$ `D`.
*   **Hàm Heuristic ($h$)**: Sử dụng tổng **khoảng cách Manhattan** (Manhattan Distance) của tất cả các ô số (ngoại trừ ô trống) đến vị trí đích của chúng.

---

## 📁 Cấu trúc thư mục dự án

```text
├── index.html       # Giao diện chính của ứng dụng
├── style.css        # Định dạng giao diện và các hiệu ứng động
├── core.js          # Các hàm cốt lõi (di chuyển, kiểm tra solvable, khoảng cách Manhattan)
├── algorithms.js    # Cài đặt logic Generator cho 9 thuật toán tìm kiếm
└── app.js           # Xử lý tương tác giao diện và cập nhật bảng truy vết
```

---

## 🚀 Hướng Dẫn Chạy Dự Án

Ứng dụng được viết hoàn toàn bằng **HTML, CSS và JavaScript thuần (Vanilla JS)**, không yêu cầu cài đặt thư viện ngoài hoặc máy chủ phức tạp.

1. Tải toàn bộ mã nguồn về máy tính.
2. Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox, Safari...).
3. Chọn thuật toán từ các tab trên cùng, cấu hình trạng thái bắt đầu và nhấn **Chạy thuật toán**.
