/************************************************************
 * SEED TIỂU LUẬN — tạo sheet TL01 (trắc nghiệm) + FILL_TL (điền) cho MÔN VIẾT TIỂU LUẬN
 *   Apps Script > file mới > dán > chọn hàm "seedTieuLuan" > Run. Chạy lại sẽ ghi đè.
 ************************************************************/
var TL_MCQ = [
    [1, "Bốn phương pháp giáo dục âm nhạc thế giới nổi bật được giới thiệu là?", "Dalcroze, Kodály, Orff Schulwerk, Suzuki", "Dalcroze, Kodály, Orff, Mozart", "Kodály, Orff, Suzuki, Montessori", "Dalcroze, Suzuki, Waldorf, Kodály", "A"],
    [2, "Phương pháp Dalcroze do Émile Jaques-Dalcroze (1865–1950) sáng lập — ông là người nước nào?", "Pháp", "Thụy Sĩ", "Đức", "Áo", "B"],
    [3, "Phương pháp Dalcroze còn được gọi là gì?", "Nhạc cảm vận động (eurhythmics)", "Ký hiệu bàn tay", "Học như tiếng mẹ đẻ", "Gõ đệm tiết tấu", "A"],
    [4, "Phương pháp Dalcroze đặc biệt phù hợp với bậc học nào?", "Đại học", "Mầm non và tiểu học", "Trung học phổ thông", "Sau đại học", "B"],
    [5, "Phương pháp nào dùng ký hiệu bàn tay để giúp học sinh nhận diện cao độ?", "Dalcroze", "Kodály", "Orff", "Suzuki", "B"],
    [6, "Phương pháp Orff chú trọng điều gì?", "Lý thuyết hàn lâm", "Tiết tấu, gõ đệm và ứng tác", "Ký xướng âm thị giác", "Biểu diễn độc tấu", "B"],
    [7, "Phương pháp Suzuki gắn liền với nước nào?", "Hàn Quốc", "Nhật Bản", "Trung Quốc", "Mỹ", "B"],
    [8, "Phương pháp Suzuki phổ biến chủ yếu trong lĩnh vực nào?", "Giáo dục phổ thông đại trà", "Đào tạo nhạc cụ cá nhân và bán chuyên", "Hợp xướng nhà thờ", "Sáng tác chuyên nghiệp", "B"],
    [9, "Câu nói 'Âm nhạc là sự giác ngộ cao hơn cả trí tuệ và cảm xúc' là của ai?", "Mozart", "Beethoven", "Bach", "Tchaikovsky", "B"],
    [10, "Quan điểm của Đảng và Nhà nước: 'Văn hóa là nền tảng ... của xã hội'. Từ còn thiếu là?", "vật chất", "tinh thần", "kinh tế", "chính trị", "B"],
    [11, "'Chân' trong Chân – Thiện – Mỹ biểu thị điều gì?", "Cái đẹp", "Sự thật, hiểu biết đúng đắn khách quan", "Lòng nhân ái", "Sự sáng tạo", "B"],
    [12, "'Thiện' trong Chân – Thiện – Mỹ gắn liền với?", "Kỹ thuật biểu diễn", "Đạo đức, lối sống nhân văn", "Quy luật tự nhiên", "Cái đẹp hình thức", "B"],
    [13, "'Mỹ' trong Chân – Thiện – Mỹ biểu thị giá trị nào?", "Cái đẹp (thẩm mỹ)", "Sự thật", "Đạo đức", "Trí tuệ", "A"],
    [14, "Dân ca Quan họ Bắc Ninh được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại vào năm nào?", "2003", "2009", "2013", "1999", "B"],
    [15, "Dân ca Quan họ thuộc vùng văn hóa nào?", "Kinh Bắc", "Tây Nguyên", "Nam Bộ", "Xứ Huế", "A"],
    [16, "Lễ hội truyền thống tiêu biểu gắn với Quan họ Bắc Ninh là?", "Hội Gióng", "Hội Lim", "Hội Đền Hùng", "Hội chùa Hương", "B"],
    [17, "Quan họ được lưu truyền chủ yếu bằng phương thức nào?", "Văn bản ký âm", "Truyền khẩu", "Thu âm hiện đại", "Giáo trình nhạc viện", "B"],
    [18, "Nghệ nhân nào được xem như 'báu vật nhân văn sống' của Quan họ Bắc Ninh?", "Thúy Cải", "Nguyễn Thị Cầu", "Kim Cúc", "Xuân Mùi", "B"],
    [19, "Di sản nào sau đây KHÔNG nằm trong các di sản âm nhạc phi vật thể VN được UNESCO công nhận (nêu trong bài)?", "Ca trù", "Nhã nhạc cung đình Huế", "Hát xẩm", "Đờn ca tài tử", "C"],
    [20, "Theo bài, yếu tố nào giữ vai trò then chốt, quyết định chất lượng và hiệu quả giáo dục âm nhạc?", "Cơ sở vật chất", "Phương pháp giáo dục", "Giáo trình", "Sĩ số lớp", "B"],
];
var TL_FILL = [
    ["Quan điểm & danh ngôn", "Nhạc sĩ Beethoven khẳng định: 'Âm nhạc là sự ___ cao hơn cả trí tuệ và cảm xúc.' Đảng và Nhà nước ta xác định: 'Văn hóa là nền tảng ___ của xã hội, là mục tiêu, động lực phát triển bền vững đất nước; xây dựng văn hóa là xây dựng ___.'", "giác ngộ|tinh thần|con người", "||"],
    ["Chân – Thiện – Mỹ", "Trong bộ ba giá trị, '___' biểu thị sự thật và hiểu biết đúng đắn, khách quan; '___' gắn với đạo đức và lối sống nhân văn; còn '___' biểu thị cái đẹp. Ba phạm trù này kết hợp hài hòa và bổ sung cho nhau.", "Chân|Thiện|Mỹ", "||"],
    ["Phương pháp thế giới", "Giáo dục âm nhạc thế giới có bốn phương pháp ảnh hưởng sâu rộng: phương pháp ___, phương pháp ___, phương pháp ___ Schulwerk và phương pháp ___. Trong đó Kodály và Orff được dùng trong giáo dục phổ thông, còn Suzuki phổ biến trong đào tạo nhạc cụ cá nhân.", "Dalcroze|Kodály|Orff|Suzuki", "|Kodaly||"],
    ["Phương pháp Dalcroze", "Phương pháp Dalcroze do Émile Jaques-Dalcroze (người ___, 1865–1950) sáng lập, còn gọi là nhạc cảm vận động (___). Phương pháp giúp người học tiếp cận nhịp điệu, tiết tấu, cao độ qua ___ có chủ đích, đặc biệt phù hợp với giáo dục ___ và tiểu học.", "Thụy Sĩ|eurhythmics|chuyển động|mầm non", "||vận động|"],
    ["Kodály & Orff", "Phương pháp ___ sử dụng ký hiệu ___ để giúp học sinh nhận diện cao độ, chú trọng ca hát và xướng âm. Phương pháp ___ lại chú trọng ___, gõ đệm và ứng tác, thường dùng bộ gõ.", "Kodály|bàn tay|Orff|tiết tấu", "Kodaly|||"],
    ["Phương pháp Suzuki", "Phương pháp Suzuki gắn với nước ___, cho rằng trẻ học âm nhạc tự nhiên như học ___; phương pháp này phổ biến chủ yếu trong đào tạo ___ cá nhân và bán chuyên.", "Nhật Bản|tiếng mẹ đẻ|nhạc cụ", "Nhật|tiếng mẹ|"],
    ["Di sản UNESCO Việt Nam", "Các di sản âm nhạc phi vật thể Việt Nam được UNESCO công nhận gồm Ca trù, ___ cung đình Huế, Đờn ca tài tử, Không gian văn hóa ___ Tây Nguyên và Dân ca Quan họ ___.", "Nhã nhạc|cồng chiêng|Bắc Ninh", "||"],
    ["Quan họ Bắc Ninh", "Dân ca Quan họ Bắc Ninh được UNESCO công nhận năm ___, thuộc vùng văn hóa ___, được lưu truyền chủ yếu bằng phương thức ___, gắn với lễ hội ___. Nghệ nhân ___ được xem như 'báu vật nhân văn sống' của Quan họ.", "2009|Kinh Bắc|truyền khẩu|Lim|Nguyễn Thị Cầu", "|||hội Lim|"],
    ["Vai trò phương pháp", "Trong giáo dục âm nhạc, phương pháp giữ vai trò ___, quyết định trực tiếp đến ___ và hiệu quả của quá trình dạy học, đồng thời phản ánh tính hiện đại của một nền giáo dục.", "then chốt|chất lượng", "|"],
];
function seedTieuLuan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // TL01 trắc nghiệm
  var o1 = ss.getSheetByName("TL01"); if (o1) ss.deleteSheet(o1);
  var s1 = ss.insertSheet("TL01");
  var h1 = ["ID","Question","OptionA","OptionB","OptionC","OptionD","Answer"];
  var v1 = [h1].concat(TL_MCQ);
  var r1 = s1.getRange(1,1,v1.length,h1.length); r1.setNumberFormat("@"); r1.setValues(v1);
  s1.getRange(1,1,1,h1.length).setFontWeight("bold").setBackground("#16233b").setFontColor("#ffffff");
  s1.setFrozenRows(1);
  // FILL_TL điền
  var o2 = ss.getSheetByName("FILL_TL"); if (o2) ss.deleteSheet(o2);
  var s2 = ss.insertSheet("FILL_TL");
  var h2 = ["Title","Passage","Answers","Accept"];
  var v2 = [h2].concat(TL_FILL);
  var r2 = s2.getRange(1,1,v2.length,h2.length); r2.setNumberFormat("@"); r2.setValues(v2);
  r2.setVerticalAlignment("top").setWrap(true);
  s2.getRange(1,1,1,h2.length).setFontWeight("bold").setBackground("#16233b").setFontColor("#ffffff");
  s2.setFrozenRows(1); s2.setColumnWidth(1,160); s2.setColumnWidth(2,540); s2.setColumnWidth(3,320);
  SpreadsheetApp.getUi().alert("Da tao TL01 (" + TL_MCQ.length + " cau) + FILL_TL (" + TL_FILL.length + " doan).");
}
