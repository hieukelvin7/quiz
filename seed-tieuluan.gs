/************************************************************
 * SEED TIỂU LUẬN — MÔN VIẾT TIỂU LUẬN
 *   Tạo các sheet trắc nghiệm TL01..TL06 + sheet điền FILL_TL.
 *   Apps Script > file mới > dán > chọn hàm "seedTieuLuan" > Run. Chạy lại sẽ ghi đè.
 ************************************************************/
var TL_MCQ = {
  "TL01": [
    [1, "Câu 'Âm nhạc là sự giác ngộ cao hơn cả trí tuệ và cảm xúc' là của ai?", "Mozart", "Beethoven", "Bach", "Hồ Chí Minh", "B"],
    [2, "Đảng và Nhà nước xác định: 'Văn hóa là nền tảng ... của xã hội'. Từ còn thiếu là?", "vật chất", "tinh thần", "kinh tế", "pháp lý", "B"],
    [3, "'Chân' trong Chân–Thiện–Mỹ biểu thị điều gì?", "Cái đẹp", "Sự thật, hiểu biết đúng đắn, khách quan", "Lòng nhân ái", "Sự sáng tạo", "B"],
    [4, "'Thiện' trong Chân–Thiện–Mỹ gắn liền với?", "Quy luật tự nhiên", "Đạo đức, lối sống nhân văn", "Cái đẹp hình thức", "Kỹ thuật biểu diễn", "B"],
    [5, "'Mỹ' trong Chân–Thiện–Mỹ biểu thị giá trị nào?", "Cái đẹp (thẩm mỹ)", "Sự thật", "Đạo đức", "Trí tuệ", "A"],
    [6, "Ba phạm trù Chân–Thiện–Mỹ có mối quan hệ như thế nào?", "Đối lập nhau", "Kết hợp hài hòa, bổ sung cho nhau", "Độc lập hoàn toàn", "Loại trừ lẫn nhau", "B"],
    [7, "Âm nhạc chân chính (giá trị 'Chân') phải thể hiện điều gì?", "Kỹ thuật điêu luyện", "Cảm xúc chân thật, không giả tạo", "Giai điệu phức tạp", "Sự nổi tiếng", "B"],
    [8, "Theo bài, âm nhạc giữ vai trò quan trọng trong việc gì?", "Giải trí đơn thuần", "Hình thành nhân cách, bồi dưỡng tâm hồn, hướng tới Chân–Thiện–Mỹ", "Kiếm thu nhập", "Quảng bá du lịch", "B"],
    [9, "Khái niệm Chân–Thiện–Mỹ là biểu tượng cho điều gì?", "Thành công vật chất", "Những giá trị cao cả nhất mà con người hướng tới", "Quyền lực", "Danh vọng", "B"],
    [10, "'Thiện' được thể hiện qua điều gì?", "Lòng nhân ái, hành vi hướng tới điều tốt đẹp", "Kỹ thuật thanh nhạc", "Sự giàu có", "Khả năng ghi nhớ", "A"],
  ],
  "TL02": [
    [1, "Bốn phương pháp giáo dục âm nhạc thế giới nổi bật là?", "Dalcroze, Kodály, Orff Schulwerk, Suzuki", "Montessori, Kodály, Orff, Suzuki", "Dalcroze, Waldorf, Orff, Mozart", "Kodály, Orff, Suzuki, Dewey", "A"],
    [2, "Các phương pháp giáo dục âm nhạc hiện đại chủ yếu hình thành vào thời gian nào?", "Thế kỷ XVII", "Cuối thế kỷ XIX và nửa đầu thế kỷ XX", "Giữa thế kỷ XX", "Đầu thế kỷ XXI", "B"],
    [3, "Émile Jaques-Dalcroze (1865–1950) là người nước nào?", "Pháp", "Thụy Sĩ", "Đức", "Hungary", "B"],
    [4, "Phương pháp Dalcroze còn được gọi là gì?", "Nhạc cảm vận động (eurhythmics)", "Ký hiệu bàn tay", "Học như tiếng mẹ đẻ", "Orff Schulwerk", "A"],
    [5, "Phương pháp Dalcroze đặc biệt phù hợp với bậc học nào?", "Đại học", "Mầm non và tiểu học", "Sau đại học", "Nhạc viện chuyên nghiệp", "B"],
    [6, "Phương pháp Dalcroze cho người học tiếp cận nhịp điệu, cao độ thông qua?", "Lý thuyết trừu tượng", "Chuyển động cơ thể có chủ đích", "Ghi nhớ ký hiệu", "Nghe thụ động", "B"],
    [7, "Thành tố trung tâm, nổi bật nhất của phương pháp Dalcroze là?", "Âm nhạc theo nhịp điệu (vận động)", "Thuyết giảng", "Chép nhạc", "Luyện ngón", "A"],
    [8, "Phương pháp nào dùng ký hiệu bàn tay để giúp học sinh nhận diện cao độ?", "Dalcroze", "Kodály", "Orff", "Suzuki", "B"],
    [9, "Phương pháp Orff chú trọng điều gì?", "Lý thuyết hàn lâm", "Tiết tấu, gõ đệm và ứng tác", "Chép chính tả", "Độc tấu điêu luyện", "B"],
    [10, "Phương pháp Suzuki gắn liền với nước nào?", "Hàn Quốc", "Nhật Bản", "Trung Quốc", "Mỹ", "B"],
    [11, "Phương pháp Suzuki phổ biến chủ yếu trong lĩnh vực nào?", "Giáo dục phổ thông đại trà", "Đào tạo nhạc cụ cá nhân và bán chuyên", "Hợp xướng nhà thờ", "Lý luận âm nhạc", "B"],
    [12, "Kodály và Orff hiện được vận dụng chủ yếu ở đâu?", "Nhạc viện chuyên nghiệp", "Hệ thống giáo dục phổ thông ở nhiều quốc gia", "Phòng thu âm", "Sân khấu biểu diễn", "B"],
    [13, "Theo Chosky và cộng sự, một phương pháp GDAN đúng nghĩa KHÔNG bao gồm yếu tố nào?", "Triết lý/nguyên tắc có thể nhận diện", "Hệ thống sư phạm thống nhất", "Mục tiêu nhân văn", "Mục đích thuần túy thương mại", "D"],
  ],
  "TL03": [
    [1, "Phương pháp giáo dục âm nhạc ở VN được chia thành hai nhóm chủ đạo nào?", "Truyền thống và hiện đại", "Lý thuyết và thực hành", "Cá nhân và tập thể", "Trong nước và quốc tế", "A"],
    [2, "Phương pháp nào thuộc nhóm TRUYỀN THỐNG?", "Ứng dụng công nghệ thông tin", "Truyền khẩu – bắt chước", "Làm việc nhóm", "Học sinh thuyết trình", "B"],
    [3, "Phương pháp truyền khẩu – bắt chước phù hợp nhất với đối tượng nào?", "THPT", "Học sinh mầm non và tiểu học", "Sinh viên nhạc viện", "Giáo viên", "B"],
    [4, "Phương pháp thuyết giảng chủ yếu áp dụng trong phân môn nào?", "Luyện thanh", "Thường thức âm nhạc, lịch sử âm nhạc, phân tích tác phẩm", "Thực hành nhạc cụ", "Học hát", "B"],
    [5, "Phương pháp chính tả âm nhạc là hoạt động trong đó giáo viên?", "Hát mẫu cho HS lặp lại", "Đọc tên nốt kết hợp trường độ để HS ghi thành ký hiệu", "Cho HS xem video", "Chia nhóm thảo luận", "B"],
    [6, "Phương pháp chính tả âm nhạc khác với ký âm (nghe – ghi) ở chỗ nào?", "Dựa vào cảm nhận cao độ thực tế", "Dựa vào tiếp nhận thông tin ký hiệu qua lời đọc của giáo viên", "Không cần khuông nhạc", "Chỉ dùng cho hợp xướng", "B"],
    [7, "Phương pháp nào thuộc nhóm HIỆN ĐẠI?", "Đọc – chép", "Ứng dụng công nghệ thông tin", "Thuyết giảng", "Truyền khẩu – bắt chước", "B"],
    [8, "Bài hát 'Cộc cách tùng cheng' (tiết tấu rõ) phù hợp vận dụng phương pháp nào?", "Kodály", "Orff", "Thuyết giảng", "Đọc – chép", "B"],
    [9, "Bài 'Mời bạn vui múa ca' có thể áp dụng ký hiệu bàn tay — đó là phương pháp nào?", "Kodály", "Orff", "Suzuki", "Dalcroze", "A"],
    [10, "Bộ sách giáo khoa được nhắc đến trong bài là?", "Cánh Diều", "Kết nối tri thức với cuộc sống", "Chân trời sáng tạo", "Giáo dục Việt Nam", "B"],
    [11, "Nguyên tắc cốt lõi về phương pháp giáo dục được khẳng định trong bài là?", "Luôn có một phương pháp tối ưu tuyệt đối", "Không có phương pháp nào tuyệt đối đúng cho mọi đối tượng", "Chỉ dùng phương pháp hiện đại", "Chỉ dùng phương pháp truyền thống", "B"],
    [12, "Phân môn 'thường thức âm nhạc' cung cấp cho học sinh hiểu biết về?", "Kỹ thuật lấy hơi", "Đời sống âm nhạc, thể loại, nhạc cụ, tác giả, tác phẩm", "Cách chơi piano", "Lý thuyết hòa âm nâng cao", "B"],
    [13, "Xu hướng tất yếu của giáo dục âm nhạc VN hiện nay là?", "Loại bỏ phương pháp truyền thống", "Tích hợp hài hòa phương pháp truyền thống và hiện đại", "Chỉ dùng công nghệ", "Quay lại lối dạy cũ", "B"],
    [14, "Theo bài, yếu tố nào được xem là nền tảng cốt lõi để chuẩn hóa phương pháp dạy học âm nhạc?", "Kinh nghiệm truyền miệng", "Nghiên cứu khoa học", "Thi đua khen thưởng", "Cơ sở vật chất", "B"],
  ],
  "TL04": [
    [1, "Di sản nào sau đây KHÔNG thuộc danh sách di sản âm nhạc phi vật thể VN được UNESCO công nhận (nêu trong bài)?", "Ca trù", "Nhã nhạc cung đình Huế", "Hát xẩm", "Đờn ca tài tử", "C"],
    [2, "Dân ca Quan họ Bắc Ninh được UNESCO công nhận vào năm nào?", "2003", "2009", "2013", "2001", "B"],
    [3, "Dân ca Quan họ thuộc vùng văn hóa nào?", "Kinh Bắc", "Tây Nguyên", "Nam Bộ", "Xứ Huế", "A"],
    [4, "Lễ hội truyền thống tiêu biểu gắn với Quan họ là?", "Hội Gióng", "Hội Lim", "Hội Đền Hùng", "Hội chùa Hương", "B"],
    [5, "Quan họ được lưu truyền chủ yếu bằng phương thức nào?", "Văn bản ký âm", "Truyền khẩu", "Thu âm hiện đại", "Giáo trình nhạc viện", "B"],
    [6, "Nghệ nhân nào được xem như 'báu vật nhân văn sống' của Quan họ Bắc Ninh?", "Thúy Cải", "Nguyễn Thị Cầu", "Kim Cúc", "Xuân Mùi", "B"],
    [7, "Quan họ được UNESCO ghi danh là Di sản văn hóa phi vật thể ... của nhân loại.", "đại diện", "cần bảo vệ khẩn cấp", "vật thể", "quốc gia", "A"],
    [8, "Di sản văn hóa phi vật thể KHÔNG bao gồm loại nào sau đây?", "Âm nhạc", "Lễ hội", "Kiến trúc, di tích", "Nghệ thuật trình diễn dân gian", "C"],
    [9, "'Không gian văn hóa cồng chiêng' gắn với vùng nào của Việt Nam?", "Tây Bắc", "Tây Nguyên", "Đồng bằng sông Hồng", "Nam Trung Bộ", "B"],
    [10, "Yếu tố cốt lõi tạo nên sức sống bền vững cho di sản Quan họ là?", "Sự tài trợ của nhà nước", "Sự gắn bó mật thiết và vai trò chủ thể của cộng đồng", "Truyền thông hiện đại", "Biểu diễn sân khấu", "B"],
  ],
  "TL05": [
    [1, "Câu 'Có tài mà không có đức là người vô dụng' là của ai?", "Khổng Tử", "Hồ Chí Minh", "Plato", "Beethoven", "B"],
    [2, "Nhà triết học Hy Lạp nào cho rằng âm nhạc tác động trực tiếp đến tâm hồn, nuôi dưỡng kỷ luật và lòng dũng cảm?", "Aristotle", "Plato", "Socrates", "Pythagoras", "B"],
    [3, "Câu 'Hưng ư thi, lập ư lễ, thành ư nhạc' là quan điểm của ai?", "Lão Tử", "Khổng Tử", "Hồ Chí Minh", "Mạnh Tử", "B"],
    [4, "Theo Khổng Tử, con người đạt tới sự hài hòa thông qua?", "Thi ca", "Lễ nghi", "Âm nhạc", "Võ thuật", "C"],
    [5, "Bài hát nào giáo dục lòng yêu nước, tinh thần dũng cảm qua hình tượng nữ anh hùng?", "Ba ngọn nến lung linh", "Biết ơn chị Võ Thị Sáu", "Bụi phấn", "Lớp chúng ta đoàn kết", "B"],
    [6, "Bài hát 'Ba ngọn nến lung linh' giáo dục giá trị nào?", "Lòng yêu nước", "Tình cảm gia đình", "Bảo vệ môi trường", "Tinh thần thể thao", "B"],
    [7, "Hai bài hát nào khơi dậy tình cảm với thầy cô, mái trường?", "Bụi phấn và Mái trường mến yêu", "Lên đàng và Nối vòng tay lớn", "Em yêu hòa bình và Nụ cười hồng", "Quê hương tươi đẹp và Yêu Hà Nội", "A"],
    [8, "Bài hát nào góp phần bồi dưỡng tình yêu thiên nhiên, ý thức bảo vệ môi trường?", "Khăn quàng thắm mãi vai em", "Hành tinh xanh của em", "Bụi phấn", "Biết ơn chị Võ Thị Sáu", "B"],
    [9, "Tại quốc gia nào âm nhạc được đưa vào chương trình tiểu học nhằm hình thành tính kỷ luật, tinh thần tập thể qua hợp xướng?", "Nhật Bản", "Pháp", "Ý", "Nga", "A"],
    [10, "Quốc gia nào nổi tiếng với nền giáo dục tiên tiến, tích hợp âm nhạc với hoạt động trải nghiệm để phát triển hợp tác?", "Phần Lan", "Hoa Kỳ", "Hàn Quốc", "Anh", "A"],
    [11, "Tổ chức nào khẳng định giáo dục nghệ thuật giúp hình thành giá trị hòa bình, khoan dung, tôn trọng đa dạng văn hóa?", "WHO", "UNESCO", "UNICEF", "ASEAN", "B"],
    [12, "Đâu là ví dụ ca khúc bị nêu là có ca từ phản cảm, thiếu tính giáo dục trong bài?", "Nụ cười hồng", "Phiếu bé ngoan", "Lên đàng", "Mái trường mến yêu", "B"],
    [13, "Ca khúc 'Như cái lò' gắn với ca sĩ nào (được nêu trong bài)?", "Phí Phương Anh", "Hana Cẩm Tiên", "Sơn Tùng", "Hồ Ngọc Hà", "B"],
    [14, "Theo bài, 'đạo đức' được hiểu là gì?", "Hệ thống chuẩn mực, nguyên tắc điều chỉnh hành vi con người", "Khả năng cảm thụ cái đẹp", "Kỹ năng biểu diễn", "Tri thức khoa học", "A"],
    [15, "Khó khăn của giáo dục đạo đức qua âm nhạc hiện nay chủ yếu đến từ đâu?", "Thiếu nhạc cụ", "Các nền tảng số (TikTok, YouTube...) với nội dung không đồng đều", "Thiếu giáo viên", "Học phí cao", "B"],
    [16, "Để phát huy hiệu quả, giáo dục đạo đức qua âm nhạc cần sự phối hợp của?", "Chỉ nhà trường", "Nhà trường, gia đình và xã hội", "Chỉ gia đình", "Chỉ cơ quan truyền thông", "B"],
    [17, "Với bậc tiểu học, nội dung giáo dục đạo đức qua âm nhạc nên tập trung vào?", "Trách nhiệm xã hội, lý tưởng sống", "Tình cảm gia đình, bạn bè, thiên nhiên, điều gần gũi", "Chính trị", "Kinh tế thị trường", "B"],
  ],
  "TL06": [
    [1, "Quyết định số 131/QĐ-TTg (25/01/2022) của Thủ tướng phê duyệt Đề án về nội dung gì?", "Phổ cập giáo dục mầm non", "Tăng cường ứng dụng CNTT và chuyển đổi số trong giáo dục giai đoạn 2022–2025", "Miễn học phí", "Xây dựng trường chuẩn", "B"],
    [2, "Đề án chuyển đổi số trong giáo dục (QĐ 131) định hướng đến năm nào?", "2025", "2030", "2035", "2045", "B"],
    [3, "Báo cáo Giám sát Giáo dục Toàn cầu 2023 của UNESCO nhấn mạnh công nghệ trong giáo dục cần?", "Thay thế hoàn toàn giáo viên", "Hỗ trợ tương tác con người, không thay thế tương tác giáo viên – học sinh", "Dạy học tự động", "Loại bỏ sách giấy", "B"],
    [4, "Phần mềm nào sau đây là phần mềm CHÉP NHẠC được nêu trong bài?", "Photoshop", "Sibelius, Dorico, MuseScore", "Excel", "Zoom", "B"],
    [5, "Logic Pro và Ableton Live là nhóm phần mềm gì?", "Chép nhạc", "Sản xuất âm nhạc", "Diệt virus", "Thiết kế đồ họa", "B"],
    [6, "Nền tảng truyền phát trực tuyến âm nhạc được nêu trong bài gồm?", "YouTube, Spotify, Apple Music", "Facebook, Zalo, Telegram", "Google Drive, Dropbox", "Netflix, HBO", "A"],
    [7, "Công cụ AI nào được nêu có khả năng tạo nhạc, xây dựng bản demo, hỗ trợ sáng tác?", "Suno, Udio", "Word, Excel", "Sibelius, Dorico", "YouTube, Spotify", "A"],
    [8, "Các trợ lý AI như ChatGPT, Gemini, Copilot có thể hỗ trợ giáo viên làm gì?", "Biểu diễn thay học sinh", "Xây dựng kế hoạch bài dạy, thiết kế câu hỏi và học liệu", "Chấm điểm thi tốt nghiệp", "Tuyển sinh", "B"],
    [9, "Các nền tảng EarMaster, Auralia, SmartMusic hỗ trợ điều gì?", "Luyện tập, đánh giá biểu diễn, phân tích cao độ – tiết tấu", "Chỉnh sửa ảnh", "Quản lý tài chính", "Họp trực tuyến", "A"],
    [10, "Quan điểm chung của bài về vai trò của AI trong giáo dục âm nhạc là?", "AI thay thế hoàn toàn giáo viên", "AI chỉ nên là công cụ hỗ trợ, không thay thế vai trò giáo viên", "Không nên dùng AI", "AI chỉ dùng để giải trí", "B"],
    [11, "Theo bài, sự hiện diện của công nghệ trong giáo dục có đồng nghĩa với chất lượng cao hơn không?", "Có, luôn luôn", "Không, công nghệ phải được dùng phù hợp và đúng cách", "Chỉ ở thành phố", "Chỉ với học sinh giỏi", "B"],
    [12, "AI trong giáo dục âm nhạc có thể cung cấp phản hồi theo?", "Thời gian thực (gần như tức thời)", "Mỗi học kỳ một lần", "Sau một năm", "Không có phản hồi", "A"],
  ],
};
var TL_FILL = [
    ["Quyết định số 131/QĐ-TTg (25/01/2022) của Thủ tướng phê duyệt Đề án về nội dung gì?", "Phổ cập giáo dục mầm non", "Tăng cường ứng dụng CNTT và chuyển đổi số trong giáo dục giai đoạn 2022–2025", "Miễn học phí", "Xây dựng trường chuẩn", "B"],
    ["Đề án chuyển đổi số trong giáo dục (QĐ 131) định hướng đến năm nào?", "2025", "2030", "2035", "2045", "B"],
    ["Báo cáo Giám sát Giáo dục Toàn cầu 2023 của UNESCO nhấn mạnh công nghệ trong giáo dục cần?", "Thay thế hoàn toàn giáo viên", "Hỗ trợ tương tác con người, không thay thế tương tác giáo viên – học sinh", "Dạy học tự động", "Loại bỏ sách giấy", "B"],
    ["Phần mềm nào sau đây là phần mềm CHÉP NHẠC được nêu trong bài?", "Photoshop", "Sibelius, Dorico, MuseScore", "Excel", "Zoom", "B"],
    ["Logic Pro và Ableton Live là nhóm phần mềm gì?", "Chép nhạc", "Sản xuất âm nhạc", "Diệt virus", "Thiết kế đồ họa", "B"],
    ["Nền tảng truyền phát trực tuyến âm nhạc được nêu trong bài gồm?", "YouTube, Spotify, Apple Music", "Facebook, Zalo, Telegram", "Google Drive, Dropbox", "Netflix, HBO", "A"],
    ["Công cụ AI nào được nêu có khả năng tạo nhạc, xây dựng bản demo, hỗ trợ sáng tác?", "Suno, Udio", "Word, Excel", "Sibelius, Dorico", "YouTube, Spotify", "A"],
    ["Các trợ lý AI như ChatGPT, Gemini, Copilot có thể hỗ trợ giáo viên làm gì?", "Biểu diễn thay học sinh", "Xây dựng kế hoạch bài dạy, thiết kế câu hỏi và học liệu", "Chấm điểm thi tốt nghiệp", "Tuyển sinh", "B"],
    ["Các nền tảng EarMaster, Auralia, SmartMusic hỗ trợ điều gì?", "Luyện tập, đánh giá biểu diễn, phân tích cao độ – tiết tấu", "Chỉnh sửa ảnh", "Quản lý tài chính", "Họp trực tuyến", "A"],
    ["Quan điểm chung của bài về vai trò của AI trong giáo dục âm nhạc là?", "AI thay thế hoàn toàn giáo viên", "AI chỉ nên là công cụ hỗ trợ, không thay thế vai trò giáo viên", "Không nên dùng AI", "AI chỉ dùng để giải trí", "B"],
    ["Theo bài, sự hiện diện của công nghệ trong giáo dục có đồng nghĩa với chất lượng cao hơn không?", "Có, luôn luôn", "Không, công nghệ phải được dùng phù hợp và đúng cách", "Chỉ ở thành phố", "Chỉ với học sinh giỏi", "B"],
    ["AI trong giáo dục âm nhạc có thể cung cấp phản hồi theo?", "Thời gian thực (gần như tức thời)", "Mỗi học kỳ một lần", "Sau một năm", "Không có phản hồi", "A"],
];
function seedTieuLuan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mh = ["ID","Question","OptionA","OptionB","OptionC","OptionD","Answer"];
  Object.keys(TL_MCQ).forEach(function (code) {
    var old = ss.getSheetByName(code); if (old) ss.deleteSheet(old);
    var s = ss.insertSheet(code);
    var v = [mh].concat(TL_MCQ[code]);
    var r = s.getRange(1,1,v.length,mh.length); r.setNumberFormat("@"); r.setValues(v);
    s.getRange(1,1,1,mh.length).setFontWeight("bold").setBackground("#16233b").setFontColor("#ffffff");
    s.setFrozenRows(1);
  });
  var o2 = ss.getSheetByName("FILL_TL"); if (o2) ss.deleteSheet(o2);
  var s2 = ss.insertSheet("FILL_TL");
  var fh = ["Title","Passage","Answers","Accept"];
  var v2 = [fh].concat(TL_FILL);
  var r2 = s2.getRange(1,1,v2.length,fh.length); r2.setNumberFormat("@"); r2.setValues(v2);
  r2.setVerticalAlignment("top").setWrap(true);
  s2.getRange(1,1,1,fh.length).setFontWeight("bold").setBackground("#16233b").setFontColor("#ffffff");
  s2.setFrozenRows(1); s2.setColumnWidth(1,170); s2.setColumnWidth(2,540); s2.setColumnWidth(3,320);
  SpreadsheetApp.getUi().alert("Da tao TL01..TL06 + FILL_TL (" + TL_FILL.length + " doan).");
}
