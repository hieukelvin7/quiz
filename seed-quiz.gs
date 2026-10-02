/************************************************************
 * SEED QUIZ — tự động tạo các sheet mã đề từ dữ liệu có sẵn
 * ----------------------------------------------------------
 * CÁCH DÙNG:
 *   1. Mở Google Sheet > Extensions > Apps Script.
 *   2. Tạo file mới, dán TOÀN BỘ nội dung này vào.
 *   3. Chọn hàm "seedQuiz" trên thanh công cụ > bấm Run.
 *   4. Cấp quyền (Authorize) nếu được hỏi.
 *   -> Script tạo 5 sheet: DE01..DE05 với đầy đủ câu hỏi.
 *
 * Chạy lại sẽ XOÁ và tạo mới các sheet này (ghi đè).
 * File này độc lập với code.gs (backend) — có thể xoá sau khi seed xong.
 ************************************************************/

var QUIZ_DATA = {
  "DE01": [
    [1, "J.S. Bach được xếp vào nhạc sĩ thuộc thời kỳ nào của âm nhạc Đức?", "Lãng mạn", "Tiền cổ điển", "Ấn tượng", "Hiện đại", "B"],
    [2, "Bach sinh ngày tháng năm nào?", "28/6/1750", "21/3/1685", "31/5/1809", "21/3/1750", "B"],
    [3, "Bach sinh tại thành phố nào?", "Leipzig", "Weimar", "Eisenach", "Cothen", "C"],
    [4, "Bach qua đời vào ngày nào?", "28/6/1750", "21/3/1685", "27/7/1750", "28/7/1685", "A"],
    [5, "Về lý luận, Bach đã sáng tác bao nhiêu cặp Prélude và Fugue để chứng minh nguyên tắc bình quân luật?", "24 cặp", "32 cặp", "48 cặp", "12 cặp", "C"],
    [6, "Loại nhạc cụ mà Bach chơi giỏi và gắn liền với nhiều tác phẩm của ông là?", "Violon", "Đàn orgue", "Clavecin", "Flute", "B"],
    [7, "Gia đình Bach có truyền thống âm nhạc kéo dài khoảng bao lâu?", "Trên 100 năm", "Trên 200 năm", "Trên 50 năm", "Trên 300 năm", "B"],
    [8, "Năm 1717, Bach trở nên nổi tiếng sau khi thi biểu diễn orgue với ai?", "Haendel", "Marchand", "Vivaldi", "Telemann", "B"],
    [9, "Giai đoạn 1723-1750, Bach sống và đạt đỉnh cao sáng tác tại thành phố nào?", "Weimar", "Cothen", "Leipzig", "Eisenach", "C"],
    [10, "Phong cách sáng tác chủ yếu trong âm nhạc của Bach là?", "Chủ điệu", "Phức điệu", "Ngẫu hứng", "Vô điệu tính", "B"],
    [11, "Bach có công đặt cơ sở cho hệ thống hòa âm nào?", "Hệ thống 12 âm", "Hệ thống trưởng - thứ, hòa âm công năng (TSDT)", "Điệu thức ngũ cung", "Điệu thức toàn cung", "B"],
    [12, "Bản messa nổi bật nhất của Bach là?", "Messa h moll", "Messa c moll", "Requiem", "Messa D dur", "A"],
    [13, "Bach sáng tác bao nhiêu concerto Brandenbourg?", "4", "6", "9", "12", "B"],
    [14, "Sau khi mồ côi từ nhỏ, Bach sống với ai và được truyền thụ âm nhạc?", "Người cha", "Người chú", "Người anh (nhạc công orgue)", "Người thầy ở nhà thờ", "C"],
    [15, "Mảng âm nhạc nổi bật của Đức thế kỷ XV-XVII phù hợp với kiểu kiến trúc Gotique là tác phẩm cho nhạc cụ nào?", "Clavecin", "Violon", "Đàn orgue", "Flute", "C"],
    [16, "Phong trào cải cách tôn giáo ở Đức năm 1517 bắt đầu từ cuộc vận động của ai?", "Calvin", "Luther", "Gutenberg", "Bach", "B"],
  ],
  "DE02": [
    [1, "Bốn đại diện chính của trường phái Cổ điển Vienne là?", "Bach, Haydn, Mozart, Beethoven", "Gluck, Haydn, Mozart, Beethoven", "Haydn, Mozart, Beethoven, Schubert", "Gluck, Haydn, Mozart, Schubert", "B"],
    [2, "Trường phái Cổ điển Vienne gắn bó chặt chẽ với sự kiện lịch sử nào?", "Cách mạng công nghiệp Anh", "Cách mạng Tư sản Pháp 1789", "Chiến tranh 30 năm", "Khởi nghĩa tháng Chạp 1825", "B"],
    [3, "Thể loại giao hưởng cổ điển Vienne có cấu trúc gồm mấy chương?", "3 chương", "4 chương", "2 chương", "5 chương", "B"],
    [4, "Haydn sinh ra tại Rohrau, thuộc miền nào của nước Áo?", "Miền Bắc", "Miền Nam", "Miền Đông", "Miền Tây", "B"],
    [5, "Công lao nổi bật nhất của Haydn là?", "Mở đầu trường phái Lãng mạn", "Hoàn thiện thể loại giao hưởng cổ điển (4 chương, dàn nhạc 4 bộ)", "Sáng tạo giao hưởng thơ", "Cải cách opera", "B"],
    [6, "Haydn sáng tác khoảng bao nhiêu bản giao hưởng?", "Trên 40", "Trên 100", "9", "15", "B"],
    [7, "Nhóm giao hưởng nổi bật nhất cuối đời của Haydn là?", "6 giao hưởng Paris", "12 giao hưởng Luân đôn", "9 giao hưởng Vienne", "3 giao hưởng Anh", "B"],
    [8, "Haydn qua đời năm nào?", "1791", "1809", "1827", "1750", "B"],
    [9, "Hai thanh xướng kịch (oratorio) nổi tiếng của Haydn là?", "Bốn mùa và Mùa xuân thần thánh", "Đấng sáng tạo muôn loài và Bốn mùa", "Requiem và Bốn mùa", "Đấng sáng tạo muôn loài và Messa", "B"],
    [10, "Mozart nổi tiếng là nhạc sĩ gì khi biểu diễn thành công từ lúc 6 tuổi?", "Nhạc sĩ cung đình", "Nhạc sĩ thần đồng", "Nhạc sĩ hầu cận", "Nhạc sĩ nhà thờ", "B"],
    [11, "Mozart sinh tại thành phố nào của nước Áo?", "Vienne", "Salzbourg", "Rohrau", "Bonn", "B"],
    [12, "Ba bản giao hưởng tiêu biểu nhất của Mozart là?", "Số 39, 40, 41", "Số 3, 5, 9", "Số 8, 14, 23", "Số 5, 6, Manfred", "A"],
    [13, "Mozart tiếp nối và kế tục công cuộc cải cách nhạc kịch của ai?", "Haydn", "Gluck", "Bach", "Wagner", "B"],
    [14, "Một đặc điểm sáng tác độc đáo của Mozart là?", "Sáng tác qua thử trên piano nhiều lần", "Sáng tác ngay trên tổng phổ, không qua piano", "Chỉ sáng tác cho đàn orgue", "Chỉ viết nhạc tiêu đề", "B"],
    [15, "Vở opéra nào sau đây KHÔNG phải của Mozart?", "Đám cưới Figaro", "Cây sáo thần", "Don Joan", "Hồ thiên nga", "D"],
    [16, "Beethoven được xem là cầu nối giữa hai trường phái nào?", "Baroc và Cổ điển", "Cổ điển và Lãng mạn", "Lãng mạn và Ấn tượng", "Ấn tượng và Hiện đại", "B"],
    [17, "Beethoven sáng tác bao nhiêu bản giao hưởng?", "6", "9", "15", "32", "B"],
    [18, "Giao hưởng số 9 của Beethoven có tên gọi là?", "Anh hùng", "Định mệnh", "Khải hoàn ca", "Bỏ dở", "C"],
    [19, "Beethoven là người đầu tiên làm điều gì cho thể loại giao hưởng?", "Đưa hợp xướng vào giao hưởng", "Viết giao hưởng 4 chương", "Sáng tạo giao hưởng thơ", "Dùng dàn nhạc 4 bộ", "A"],
    [20, "Beethoven sáng tác bao nhiêu bản sonate cho piano?", "9", "24", "32", "48", "C"],
    [21, "Năm 1802, biến cố lớn nào xảy ra với Beethoven?", "Ông bị mù", "Ông bị điếc nặng và khủng hoảng tinh thần", "Ông bị trục xuất", "Ông bị hư tay", "B"],
    [22, "Beethoven đến Vienne (cuối 1792) để học nhạc với ai?", "Mozart", "Haydn", "Gluck", "Salieri", "B"],
  ],
  "DE03": [
    [1, "Trường phái Lãng mạn phát triển trong khoảng thời gian nào?", "Suốt thế kỷ XVIII", "Suốt thế kỷ XIX", "Suốt thế kỷ XVII", "Đầu thế kỷ XX", "B"],
    [2, "Âm nhạc Lãng mạn chủ yếu đi theo khuynh hướng nào?", "Tiêu cực", "Tích cực", "Trung lập", "Thần bí", "B"],
    [3, "Schubert là nhạc sĩ nước nào, mở đầu trường phái Lãng mạn bằng thể loại ca khúc?", "Đức", "Áo", "Ba lan", "Hungari", "B"],
    [4, "Đóng góp sáng tạo tiêu biểu của Schubert về thể loại là?", "Giao hưởng thơ", "Liên ca khúc", "Overture hòa tấu", "Giao hưởng tiêu đề", "B"],
    [5, "Schubert sáng tác khoảng bao nhiêu ca khúc?", "Trên 200", "Trên 600", "Trên 100", "Trên 1000", "B"],
    [6, "Giao hưởng số 8 của Schubert có tên gọi và đặc điểm gì?", "Anh hùng, 4 chương", "Bỏ dở, chỉ 2 chương", "Định mệnh, 3 chương", "Scotland, 4 chương", "B"],
    [7, "Hai liên ca khúc nổi bật của Schubert là?", "Tình yêu thi sĩ và Con đường mùa đông", "Cô chủ cối xay xinh đẹp và Con đường mùa đông", "Bài ca không lời và Cô chủ cối xay xinh đẹp", "Bốn mùa và Con đường mùa đông", "B"],
    [8, "Schubert được xem là nhạc sĩ Vienne đầu tiên làm điều gì?", "Sống và sáng tác tự do", "Làm nhạc sĩ hầu cận", "Chỉ huy dàn nhạc cung đình", "Dạy ở nhạc viện", "A"],
    [9, "Mendelssohn là nhạc sĩ nước nào, có công sáng tạo overture hòa tấu?", "Áo", "Đức", "Ba lan", "Na uy", "B"],
    [10, "Mendelssohn đứng đầu trường phái âm nhạc nào, bảo vệ tinh hoa cổ điển?", "Weimar", "Leipzig", "Petersburg", "Maskva", "B"],
    [11, "Năm 17 tuổi, Mendelssohn hoàn thành overture hòa tấu đầu tiên tên là?", "Giấc mộng đêm hè", "Bài ca không lời", "Giao hưởng Ý", "Giao hưởng Scotland", "A"],
    [12, "Mendelssohn xuất thân trong gia đình như thế nào?", "Thợ thủ công", "Chủ ngân hàng lớn", "Nhà giáo", "Nhạc công", "B"],
    [13, "Hai bản giao hưởng nổi bật của Mendelssohn là?", "Giao hưởng Ý và giao hưởng Scotland", "Anh hùng và Định mệnh", "Số 39 và 40", "Thế giới mới và Bỏ dở", "A"],
    [14, "Tập tiểu phẩm piano nổi tiếng của Mendelssohn tên là?", "Bốn mùa", "Bài ca không lời", "Góc nhi đồng", "Những năm chu du", "B"],
    [15, "Năm 1834, Schumann đảm nhận vai trò gì?", "Giám đốc nhạc viện Leipzig", "Tổng biên tập tạp chí Âm nhạc mới", "Chỉ huy dàn nhạc Vienne", "Giáo sư nhạc viện Maskva", "B"],
    [16, "Vì sao Schumann chuyển hẳn sang con đường sáng tác và lý luận phê bình?", "Vì bị điếc", "Vì bị hư tay", "Vì nghèo đói", "Vì bị trục xuất", "B"],
    [17, "Liên ca khúc nổi tiếng nhất của Schumann, dựa theo thơ của Heine, tên là?", "Tình yêu thi sĩ", "Cô chủ cối xay xinh đẹp", "Con đường mùa đông", "Vũ hội hóa trang", "A"],
    [18, "Tác phẩm viết theo liên khúc sonate giao hưởng tiêu biểu nhất của Schumann là?", "Concerto violon e moll", "Concerto a moll", "Concerto f moll", "Sonate D dur", "B"],
  ],
  "DE04": [
    [1, "Chopin là nhạc sĩ lãng mạn dân tộc của nước nào?", "Hungari", "Ba lan", "Na uy", "Tiệp khắc", "B"],
    [2, "Thể loại sáng tác tiêu biểu của Chopin là tác phẩm cho nhạc cụ nào?", "Violon", "Piano", "Đàn orgue", "Cello", "B"],
    [3, "Chopin tốt nghiệp nhạc viện Varsovie (với thầy Elsner) vào năm nào?", "1826", "1829", "1830", "1849", "B"],
    [4, "Tại Paris, Chopin sống nhiều năm với nữ văn sĩ nào?", "Clara", "George Sand", "Von Meck", "Fanny", "B"],
    [5, "Hai bản concerto piano tiêu biểu của Chopin viết ở giọng nào?", "a moll và h moll", "f moll và e moll", "D dur và A dur", "c moll và F dur", "B"],
    [6, "Liszt là nhạc sĩ gắn với nền âm nhạc dân tộc nước nào?", "Ba lan", "Hungari", "Tiệp khắc", "Na uy", "B"],
    [7, "Liszt có công sáng tạo thể loại âm nhạc nào?", "Liên ca khúc", "Overture hòa tấu", "Giao hưởng thơ", "Giao hưởng Bỏ dở", "C"],
    [8, "Liszt đứng đầu trường phái âm nhạc nào?", "Leipzig", "Weimar", "Petersburg", "Na uy", "B"],
    [9, "Hai giao hưởng tiêu đề nổi tiếng nhất của Liszt là?", "Faust và Dante", "Ý và Scotland", "Anh hùng và Định mệnh", "Biển và Mây", "A"],
    [10, "Liszt sáng tác bao nhiêu bản rhapsodie Hungari?", "9", "12", "19", "24", "C"],
    [11, "Giao hưởng thơ của Liszt có đặc điểm cấu trúc nào?", "Gồm 4 chương cổ điển", "Chỉ 1 chương, dựa trên cảm xúc từ một bài thơ", "Gồm 2 chương", "Không xác định điệu tính", "B"],
    [12, "Năm 1865, Liszt trở thành?", "Giám đốc nhạc viện Paris", "Linh mục", "Chủ tịch hội Nhạc sĩ Đức", "Giáo sư nhạc viện Leipzig", "B"],
    [13, "Grieg là người đứng đầu và sáng lập nền âm nhạc kinh điển nước nào?", "Tiệp khắc", "Na uy", "Ba lan", "Hungari", "B"],
    [14, "Grieg học tại nhạc viện nào giai đoạn 1858-1862?", "Paris", "Vienne", "Leipzig", "Varsovie", "C"],
    [15, "Nhạc sĩ nào đã giúp đỡ và giới thiệu Grieg nhiều trong giới âm nhạc?", "Schumann", "Liszt", "Wagner", "Brahms", "B"],
    [16, "Hai tổ khúc dàn nhạc tiêu biểu của Grieg là?", "Peer Gynt và Từ thời Holberg xa xưa", "Biển và Mây", "Hồ thiên nga và Kẹp hạt dẻ", "Bốn mùa và Peer Gynt", "A"],
    [17, "Nhạc viện Praha (Tiệp khắc) được thành lập vào năm nào?", "1811", "1875", "1843", "1905", "A"],
    [18, "Dvořák kém nhạc sĩ Smetana bao nhiêu tuổi?", "10 tuổi", "17 tuổi", "20 tuổi", "7 tuổi", "B"],
    [19, "Tại Mỹ, Dvořák nhận chức giám đốc nhạc viện nào?", "Boston", "New York", "Chicago", "Washington", "B"],
    [20, "Bản giao hưởng số 9 nổi tiếng nhất của Dvořák có tên là?", "Anh hùng", "Thế giới mới", "Bỏ dở", "Leningrad", "B"],
  ],
  "DE05": [
    [1, "Wagner được xem là một trong những đại diện cuối cùng của trường phái nào?", "Cổ điển Vienne", "Lãng mạn Đức", "Ấn tượng", "Hiện thực Xô viết", "B"],
    [2, "Công lao nổi bật của Wagner là cải cách thể loại nào?", "Giao hưởng thơ", "Opera và dàn nhạc giao hưởng", "Ca khúc", "Tiểu phẩm piano", "B"],
    [3, "Năm 15 tuổi, sau khi nghe nhạc của ai, Wagner quyết định theo hẳn nghề nhạc?", "Bach", "Mozart", "Beethoven", "Liszt", "C"],
    [4, "Trong opera, Wagner sử dụng thủ pháp đặc trưng nào?", "Hệ thống âm hình chủ đạo", "Hệ thống 12 âm", "Điệu thức ngũ cung", "Liên ca khúc", "A"],
    [5, "Vở opera nào sau đây là của Wagner?", "Đám cưới Figaro", "Lohengrin", "Con đầm bích", "Nàng tiên cá", "B"],
    [6, "Cuốn sách lý luận 'Opera và kịch' (1851) là của ai?", "Schumann", "Berlioz", "Wagner", "Liszt", "C"],
    [7, "Brahms được xem là người kế tục của nhạc sĩ nào?", "Bach", "Mozart", "Beethoven", "Wagner", "C"],
    [8, "Nhạc sĩ nào đã giới thiệu Brahms lên báo?", "Liszt", "Schumann", "Wagner", "Mendelssohn", "B"],
    [9, "Brahms sáng tác bao nhiêu bản giao hưởng?", "4", "9", "6", "15", "A"],
    [10, "Đặc điểm sáng tác của Brahms là gì?", "Thiên về nhạc tiêu đề và opéra", "Thiên về khí nhạc, thính phòng, không tiêu đề, không viết opéra", "Chỉ viết ca khúc", "Chuyên về giao hưởng thơ", "B"],
    [11, "Tác phẩm thanh nhạc nổi tiếng nhất của Brahms là?", "Requiem Nước Đức gồm 7 chương", "Tình yêu thi sĩ", "Bốn mùa", "Khúc hát ru anh hùng", "A"],
    [12, "Hai vở nhạc kịch đầu tiên của Glinka đặt nền móng cho nhạc kịch Nga là?", "Hồ thiên nga và Kẹp hạt dẻ", "Ivan Soussanine và Russlan và Lioudmila", "Con đầm bích và Eugène Onéguine", "Katarina Ismailova và Ruồi trâu", "B"],
    [13, "Tchaikovsky là đại diện tiêu biểu nhất của trường phái âm nhạc nào ở Nga?", "Petersburg", "Maskva", "Weimar", "Leipzig", "B"],
    [14, "Tchaikovsky sáng tác bao nhiêu bản symphony (giao hưởng có đánh số)?", "4", "6", "9", "15", "B"],
    [15, "Vở ballet nào sau đây KHÔNG phải của Tchaikovsky?", "Hồ thiên nga", "Kẹp hạt dẻ", "Người đẹp ngủ trong rừng", "Mùa xuân thần thánh", "D"],
    [16, "Người bảo trợ kinh tế cho Tchaikovsky từ năm 1878 là ai?", "Diaghilev", "Bà triệu phú Von Meck", "Nữ văn sĩ George Sand", "Vua Nga", "B"],
    [17, "Trường phái Ấn tượng trong âm nhạc ra đời ở nước nào, cuối thập niên 90 thế kỷ XIX?", "Đức", "Pháp", "Nga", "Ý", "B"],
    [18, "Từ 'Ấn tượng' xuất phát từ nghệ thuật hội họa của nhóm họa sĩ Pháp đứng đầu bởi ai?", "Picasso", "Monet", "Van Gogh", "Matisse", "B"],
    [19, "Debussy là nhạc sĩ nước nào, người mở đầu trường phái Ấn tượng?", "Ý", "Pháp", "Nga", "Tây ban nha", "B"],
    [20, "Debussy thường sử dụng những điệu thức đặc trưng nào?", "Trưởng - thứ hòa âm", "Ngũ cung châu Á và toàn cung", "Hệ thống 12 âm", "Điệu thức Dorien", "B"],
    [21, "Tác phẩm dàn nhạc nổi bật của Debussy là?", "Giao hưởng Biển", "Giao hưởng Thế giới mới", "Giao hưởng Leningrad", "Giao hưởng Anh hùng", "A"],
    [22, "Phương pháp sáng tác đặc trưng mà Stravinsky đưa ra là?", "Đơn công năng, đơn điệu thức", "Đa công năng, đa điệu thức, đa tiết tấu", "Bình quân luật", "Hệ thống TSDT", "B"],
    [23, "Stravinsky học sáng tác với nhạc sĩ nào?", "Tchaikovsky", "Rimsky Korsakov", "Shostakovich", "Debussy", "B"],
    [24, "Ba vở ballet tiêu biểu của Stravinsky là?", "Chim lửa, Petrouchka, Mùa xuân thần thánh", "Hồ thiên nga, Kẹp hạt dẻ, Chim lửa", "Peer Gynt, Petrouchka, Chim lửa", "Mùa xuân thần thánh, Bốn mùa, Petrouchka", "A"],
    [25, "Shostakovich được xem là ngọn cờ đầu của nền âm nhạc nào thế kỷ XX?", "Lãng mạn Đức", "Xô viết", "Ấn tượng Pháp", "Cổ điển Vienne", "B"],
    [26, "Shostakovich kế tục truyền thống sáng tác của nhạc sĩ Nga nào?", "Glinka", "Tchaikovsky", "Rimsky Korsakov", "Stravinsky", "B"],
    [27, "Shostakovich sáng tác bao nhiêu bản giao hưởng?", "9", "15", "6", "24", "B"],
    [28, "Bản giao hưởng số 7 (1942) rất nổi tiếng của Shostakovich có tên là?", "Thế giới mới", "Leningrad", "Anh hùng", "Định mệnh", "B"],
  ],
};

var HEADER = ["ID", "Question", "OptionA", "OptionB", "OptionC", "OptionD", "Answer"];

function seedQuiz() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var created = [];
  Object.keys(QUIZ_DATA).forEach(function (code) {
    var old = ss.getSheetByName(code);
    if (old) ss.deleteSheet(old);
    var sheet = ss.insertSheet(code);
    var rows = QUIZ_DATA[code];
    var values = [HEADER].concat(rows);
    var range = sheet.getRange(1, 1, values.length, HEADER.length);
    range.setNumberFormat("@"); // ép TEXT: "28/6/1750" không bị đổi thành Date
    range.setValues(values);
    // Định dạng dòng tiêu đề
    sheet.getRange(1, 1, 1, HEADER.length)
      .setFontWeight("bold").setBackground("#16233b").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADER.length);
    created.push(code + " (" + rows.length + " cau)");
  });

  // Tạo sẵn sheet Results nếu chưa có
  if (!ss.getSheetByName("Results")) {
    var rs = ss.insertSheet("Results");
    rs.appendRow(["Thoi gian", "Ho ten", "Ma de", "Diem", "Tong cau",
                  "Phan tram", "Thoi luong (giay)", "Chi tiet"]);
    rs.getRange(1, 1, 1, 8).setFontWeight("bold");
  }

  SpreadsheetApp.getUi().alert("Da tao xong:\n" + created.join("\n"));
}
