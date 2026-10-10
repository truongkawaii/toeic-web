"""Original essay prompts and task-specific planning references, without fabricated scores."""
from pathlib import Path
import json

# Topic index | type (agreement/opinion/two/three/pros-cons) | prompt | two arguments | example
DATA = """
0|a|Companies should allow employees to exchange unused leave for additional training. Do you agree or disagree?|Ủng hộ: tăng quyền lựa chọn phát triển kỹ năng; Phản biện: cần bảo vệ thời gian nghỉ thực tế|Nhân viên chọn khóa phân tích dữ liệu nhưng vẫn phải nghỉ số ngày tối thiểu.
0|b|Which would benefit employees more: a transport allowance or an annual health club membership?|Chọn hỗ trợ đi lại: giảm khoản chi thường xuyên; So sánh: phòng tập hữu ích nhưng không phù hợp mọi lịch làm việc|Người làm ca tối sử dụng hỗ trợ xe buýt mỗi ngày.
0|c|Which workplace benefit is most useful: extra leave, childcare support, or a professional membership?|Chọn hỗ trợ chăm trẻ: giảm khó khăn duy trì việc làm; So sánh với nghỉ thêm và hội nghề nghiệp theo nhu cầu cụ thể|Một phụ huynh có thể nhận ca làm ổn định nhờ dịch vụ chăm trẻ.
0|o|What should a company consider first when designing an employee recognition program?|Ưu tiên tiêu chí minh bạch; Ghi nhận cả đóng góp ít được nhìn thấy|Nhân viên hỗ trợ hậu trường được đánh giá qua chất lượng bàn giao.
0|p|What are the advantages and disadvantages of offering a four-day workweek?|Ưu điểm: thời gian phục hồi dài hơn; Nhược điểm: khó duy trì độ phủ dịch vụ|Nhóm hỗ trợ chia ngày nghỉ để vẫn trả lời khách hàng vào thứ Sáu.
0|a|Employees should be allowed to choose their own office seating arrangements. Do you agree or disagree?|Ủng hộ có giới hạn: chọn môi trường phù hợp công việc; Cần điều phối để tránh chiếm chỗ yên tĩnh|Nhóm cần gọi điện ngồi xa khu vực xử lý báo cáo.
1|a|Local governments should provide more public drinking water stations. Do you agree or disagree?|Giảm nhu cầu chai dùng một lần; Tăng tiện ích tại nơi đông người nhưng cần bảo trì|Trạm nước tại sân thể thao được kiểm tra hằng tuần.
1|b|For a neighborhood project, would you choose a shared vegetable garden or a free book cabinet?|Chọn vườn chung: tạo hợp tác thường xuyên; So sánh tủ sách ít cần diện tích và quản lý|Cư dân phân lịch tưới cây và chia rau sau vụ thu hoạch.
1|c|Which would improve a community most: better lighting, more public benches, or a local notice board?|Chọn chiếu sáng: hỗ trợ sử dụng đường đi buổi tối; So sánh ghế và bảng tin giải quyết nhu cầu khác|Người đi bộ có thể nhìn rõ bậc thềm sau giờ làm.
1|o|What is the best way to encourage residents to reduce household waste?|Ưu tiên hướng dẫn thực hành dễ áp dụng; Theo dõi kết quả thay vì chỉ dùng khẩu hiệu|Buổi hướng dẫn phân loại bao bì dùng chính rác sinh hoạt mẫu.
1|p|What are the advantages and disadvantages of charging for disposable shopping bags?|Ưu điểm: khuyến khích mang túi dùng lại; Nhược điểm: bất tiện cho người mua đột xuất|Cửa hàng có điểm mượn túi và ghi rõ mức phí ở lối vào.
1|a|Community events should include activities for both children and older adults. Do you agree or disagree?|Tăng khả năng tham gia của cả gia đình; Cần bố trí hoạt động phù hợp khả năng khác nhau|Ngày hội có trò chơi trẻ em và khu hướng dẫn trồng cây có ghế ngồi.
2|a|Employees should receive training before a company introduces new digital tools. Do you agree or disagree?|Giảm lỗi sử dụng ban đầu; Giúp người ít quen công nghệ theo kịp|Nhóm thực hành nhập đơn thử trước khi đổi phần mềm bán hàng.
2|b|Would you rather store important work documents online or on a local computer?|Chọn trực tuyến có kiểm soát: truy cập và cộng tác; So sánh lưu cục bộ khi kết nối không ổn định|Hai nhân viên cập nhật cùng bảng tiến độ với phân quyền riêng.
2|c|Which feature matters most in a work application: ease of use, customization, or speed?|Chọn dễ dùng: giảm thời gian học; So sánh tùy chỉnh và tốc độ sau khi đáp ứng nhu cầu chính|Nhân viên mới hoàn thành đơn đặt hàng mà không phải tìm nhiều menu.
2|o|What is the most effective way to prevent misunderstandings in workplace chat messages?|Ưu tiên yêu cầu rõ hành động và thời hạn; Xác nhận nội dung khi quyết định có ảnh hưởng lớn|Tin nhắn ghi người phụ trách, bản tài liệu và giờ cần phản hồi.
2|p|What are the advantages and disadvantages of using automated customer support chat?|Ưu điểm: trả lời câu hỏi lặp lại nhanh; Nhược điểm: khó xử lý tình huống nhiều ngoại lệ|Chat tự động hướng dẫn theo dõi kiện hàng và chuyển tranh chấp sang nhân viên.
2|a|People should occasionally spend a full evening without using the Internet. Do you agree or disagree?|Tạo thời gian tập trung hoạt động ngoại tuyến; Chừa ngoại lệ cho trách nhiệm thiết yếu|Gia đình nấu ăn cùng nhau và chỉ giữ liên lạc khẩn cấp.
3|a|Travelers should learn a few local phrases before visiting another country. Do you agree or disagree?|Hỗ trợ giao tiếp cơ bản; Thể hiện sự tôn trọng và tạo tương tác|Khách hỏi đường đến bến xe bằng câu đã luyện trước chuyến đi.
3|b|For a short holiday, would you prefer a quiet rural destination or a lively city?|Chọn nông thôn: phục hồi nhờ lịch nhẹ; So sánh thành phố có nhiều lựa chọn nhưng dễ quá tải|Người làm việc trong khu đông đúc chọn hai ngày đi bộ ở vùng quê.
3|c|Which holiday activity would you prioritize: visiting museums, trying local food, or attending live performances?|Chọn bảo tàng: hiểu bối cảnh địa phương; So sánh món ăn và biểu diễn theo thời gian giới hạn|Khách dành một buổi xem triển lãm lịch sử trước khi đi quanh thành phố.
3|o|What should people consider first when planning a trip with friends?|Thống nhất ngân sách; Bố trí lựa chọn linh hoạt theo sở thích|Nhóm thống nhất mức chi phòng trước khi đặt dịch vụ.
3|p|What are the advantages and disadvantages of traveling with a large tour group?|Ưu điểm: tổ chức thuận tiện; Nhược điểm: lịch cứng và thời gian chờ|Đoàn được đưa đón sẵn nhưng phải rời bảo tàng đúng giờ.
3|a|Employers should encourage staff to take all of their annual vacation days. Do you agree or disagree?|Nghỉ đủ hỗ trợ phục hồi; Cần kế hoạch bàn giao để tránh gián đoạn|Hai đồng nghiệp nghỉ lệch tuần và chuẩn bị hướng dẫn công việc.
4|a|Training courses should include practical tasks rather than only lectures. Do you agree or disagree?|Thực hành phát hiện chỗ chưa hiểu; Phản hồi giúp chuyển kiến thức sang công việc|Học viên tạo bảng dự toán thay vì chỉ xem giảng viên thao tác.
4|b|Would you prefer a short intensive course or weekly classes over several months?|Chọn lớp hằng tuần: thời gian ứng dụng; So sánh khóa ngắn phù hợp nhu cầu khẩn cấp|Người học thử một kỹ thuật thuyết trình giữa hai buổi học.
4|c|Which skill should new employees develop first: writing clearly, organizing time, or negotiating?|Chọn quản lý thời gian: tạo nền tảng đáp ứng hạn; So sánh viết và thương lượng tùy vai trò|Nhân viên lập danh sách ưu tiên trước khi nhận nhiều yêu cầu cùng lúc.
4|o|What is the best way to measure whether workplace training has been useful?|Đánh giá ứng dụng vào nhiệm vụ thực tế; So sánh tiến bộ trước và sau khóa học|Quan sát số lần phải sửa báo cáo trước và sau khóa viết.
4|p|What are the advantages and disadvantages of allowing employees to select their own training courses?|Ưu điểm: phù hợp mục tiêu cá nhân; Nhược điểm: dễ lệch nhu cầu tổ chức|Nhân viên đề xuất khóa học kèm nhiệm vụ sẽ áp dụng.
4|a|Experienced staff should regularly share their knowledge with newer colleagues. Do you agree or disagree?|Giảm lặp lại lỗi cũ; Chia sẻ nên có lịch để không cản công việc chính|Buổi trao đổi ngắn giải thích cách xử lý đơn hàng có ngoại lệ.
5|a|Friends should avoid checking their phones during shared meals. Do you agree or disagree?|Tăng sự chú ý khi trò chuyện; Cho phép ngoại lệ đã nói trước|Bạn bè cất điện thoại nhưng một người vẫn theo dõi cuộc gọi từ gia đình.
5|b|Would you prefer to help a friend by giving practical assistance or by listening to their concerns?|Chọn lắng nghe trước: xác định nhu cầu; Sau đó giúp thực tế khi được yêu cầu|Người chuyển nhà cần chia sẻ lo lắng trước khi lên lịch đóng đồ.
5|c|Which activity best strengthens family relationships: cooking together, playing games, or taking trips?|Chọn nấu ăn: hoạt động thường xuyên dễ duy trì; So sánh trò chơi và chuyến đi có chi phí khác nhau|Gia đình phân việc chuẩn bị bữa tối vào cuối tuần.
5|o|What is the most important quality in a reliable friend?|Giữ lời hứa; Trung thực về khả năng hỗ trợ|Bạn báo sớm khi không thể đưa đón thay vì để người kia chờ.
5|p|What are the advantages and disadvantages of living close to extended family?|Ưu điểm: hỗ trợ nhanh và gặp thường xuyên; Nhược điểm: cần ranh giới về riêng tư|Gia đình thống nhất gọi trước khi ghé thăm.
5|a|Families should share household responsibilities equally. Do you agree or disagree?|Ủng hộ phân chia công bằng theo thời gian và khả năng; Không đánh đồng công bằng với mọi việc giống nhau|Người về sớm nấu ăn còn người kia dọn bếp.
6|a|Children should be encouraged to borrow books from libraries regularly. Do you agree or disagree?|Tăng cơ hội khám phá nhiều thể loại; Giảm chi phí nhưng cần hướng dẫn lựa chọn|Trẻ chọn một truyện và một sách khoa học mỗi tháng.
6|b|Would students learn more from a science experiment or a classroom discussion?|Chọn thí nghiệm: quan sát bằng chứng; Thảo luận giúp giải thích kết quả nên có vai trò bổ trợ|Học sinh so sánh tốc độ nảy mầm dưới hai điều kiện ánh sáng.
6|c|Which should schools improve first: libraries, sports facilities, or computer rooms?|Chọn thư viện theo bối cảnh thiếu tài liệu; So sánh thể thao và máy tính bằng mức sử dụng|Thư viện mở sau giờ học phục vụ học sinh không có nơi đọc yên tĩnh.
6|o|What is the best way for teachers to encourage students to ask questions?|Tạo môi trường chấp nhận chưa hiểu; Cho nhiều cách đặt câu hỏi|Học sinh gửi câu hỏi ẩn danh trước khi thảo luận trên lớp.
6|p|What are the advantages and disadvantages of assigning group projects to students?|Ưu điểm: luyện hợp tác; Nhược điểm: đóng góp không đều|Nhóm ghi nhiệm vụ cá nhân và báo cáo tiến độ từng tuần.
6|a|Schools should give students opportunities to help plan school events. Do you agree or disagree?|Luyện trách nhiệm qua việc thật; Cần người lớn hỗ trợ các quyết định vượt khả năng|Học sinh lập lịch gian hàng và giáo viên kiểm tra ngân sách.
7|a|Businesses should clearly explain changes to their prices. Do you agree or disagree?|Giữ niềm tin khi chi phí tăng; Giúp khách lựa chọn sản phẩm phù hợp|Cửa hàng ghi ngày áp dụng giá mới và giải thích dịch vụ đi kèm.
7|b|For a new shop, would you invest first in attractive displays or staff training?|Chọn đào tạo: trải nghiệm tư vấn ảnh hưởng mua lại; Trưng bày thu hút ban đầu nhưng không giải quyết khiếu nại|Nhân viên giải thích đúng sự khác biệt giữa hai sản phẩm.
7|c|Which promotion is most effective for a local business: discounts, free demonstrations, or loyalty rewards?|Chọn trình diễn: giảm bất định về sản phẩm; So sánh giảm giá và tích điểm theo mục tiêu|Cửa hàng cho khách thử dụng cụ trước khi quyết định mua.
7|o|What is the best way for a company to respond to a dissatisfied customer?|Xác định vấn đề cụ thể; Đề xuất giải pháp và thời hạn thực hiện|Nhân viên xác nhận phụ kiện thiếu và hẹn ngày gửi bổ sung.
7|p|What are the advantages and disadvantages of selling products only through an online store?|Ưu điểm: giảm chi phí mặt bằng; Nhược điểm: khách khó thử trực tiếp|Hãng giày hướng dẫn kích cỡ rõ và đưa chính sách đổi phù hợp.
7|a|Small businesses should seek feedback before launching a new service. Do you agree or disagree?|Kiểm tra nhu cầu trước đầu tư; Cần phân biệt lời khen với ý định sử dụng|Tiệm giặt thử dịch vụ giao nhận ở một khu vực trước khi mở rộng.
8|a|Team leaders should explain the reasons behind important decisions. Do you agree or disagree?|Giúp nhóm hiểu ưu tiên; Giảm suy đoán nhưng không tiết lộ dữ liệu không được phép|Trưởng nhóm giải thích đổi lịch để đáp ứng thời điểm bàn giao.
8|b|Would you prefer a leader who gives detailed instructions or one who allows independence?|Chọn tự chủ khi nhóm đủ kỹ năng; So sánh hướng dẫn chi tiết cần thiết với người mới|Nhân viên được chọn cách làm nhưng có mốc kiểm tra rõ.
8|c|Which contributes most to successful teamwork: clear roles, regular meetings, or shared rewards?|Chọn vai trò rõ: tránh bỏ sót và chồng chéo; So sánh họp và thưởng chỉ hiệu quả khi biết trách nhiệm|Dự án xác định riêng người viết, kiểm tra và phê duyệt.
8|o|What should a leader do first when two team members disagree?|Lắng nghe thông tin từ cả hai; Xác định mục tiêu và tiêu chí chung|Hai nhân viên chọn phương án theo thời hạn và yêu cầu khách hàng.
8|p|What are the advantages and disadvantages of rotating the team leader role?|Ưu điểm: phát triển nhiều người; Nhược điểm: gián đoạn tính liên tục|Nhóm đổi người điều phối mỗi tháng với hồ sơ bàn giao.
8|a|Team members should receive feedback throughout a project, not just at the end. Do you agree or disagree?|Sửa sai khi còn thời gian; Giữ phản hồi cụ thể để tránh gián đoạn|Bản nháp được nhận xét trước khi nhóm hoàn thành toàn bộ báo cáo.
9|a|Cities should provide more protected bicycle routes. Do you agree or disagree?|Tăng lựa chọn di chuyển; Cần kết nối tuyến và cân nhắc không gian đường|Tuyến xe đạp nối khu dân cư với ga thay vì kết thúc giữa đường.
9|b|Would you prefer to live near a park or near a shopping center?|Chọn công viên: hoạt động ngoài trời thường xuyên; So sánh mua sắm thuận tiện nhưng có thể ồn|Người làm việc tại nhà đi bộ sau giờ làm ở công viên gần nhà.
9|c|Which transport improvement should a city prioritize: more buses, better sidewalks, or additional parking?|Chọn xe buýt trong bối cảnh nhu cầu đi làm cao; So sánh vỉa hè và chỗ đỗ theo số người phục vụ|Tuyến xe buýt tăng chuyến vào giờ đông người.
9|o|What should people consider first when choosing a neighborhood to live in?|Khả năng đáp ứng sinh hoạt thường ngày; Kiểm tra thời gian di chuyển thực tế|Người thuê thử đi từ nhà đến nơi làm vào giờ cao điểm.
9|p|What are the advantages and disadvantages of sharing an apartment with other people?|Ưu điểm: chia chi phí; Nhược điểm: khác lịch sinh hoạt và tiêu chuẩn dọn dẹp|Người ở chung thống nhất giờ yên tĩnh và lịch vệ sinh.
9|a|Public transport should run later at night in large cities. Do you agree or disagree?|Phục vụ người làm ca và hoạt động buổi tối; Cần cân đối nhu cầu với chi phí vận hành|Chuyến cuối phù hợp thời điểm nhân viên nhà hàng tan ca.
10|a|Employees should keep a record of their professional achievements. Do you agree or disagree?|Cung cấp bằng chứng khi đánh giá; Giúp nhận ra kỹ năng cần phát triển|Nhân viên ghi kết quả cải tiến quy trình cùng vai trò của đồng đội.
10|b|Would you choose a promotion with more responsibility or a specialist role with deeper expertise?|Chọn chuyên môn sâu theo mục tiêu nghề nghiệp; So sánh quản lý đòi hỏi kỹ năng khác|Kỹ thuật viên phát triển thành chuyên gia thay vì quản lý nhân sự.
10|c|Which helps career development most: mentoring, challenging assignments, or professional networking?|Chọn nhiệm vụ thử thách: có bằng chứng năng lực; So sánh cố vấn và quan hệ hỗ trợ nhưng cần thực hành|Nhân viên phụ trách dự án nhỏ và nhận phản hồi từ người hướng dẫn.
10|o|What is the best way to prepare for a more senior role?|Xác định khoảng trống năng lực; Thử trách nhiệm mới có hỗ trợ|Người chuẩn bị lên trưởng nhóm điều phối một cuộc họp tiến độ.
10|p|What are the advantages and disadvantages of changing careers after several years in one field?|Ưu điểm: phù hợp mục tiêu mới; Nhược điểm: thời gian học lại và thu nhập ban đầu|Nhân viên hành chính học kỹ năng phân tích trước khi chuyển việc.
10|a|Career success should be measured by more than job titles. Do you agree or disagree?|Xét chất lượng công việc và mức phát triển; Chức danh không thể hiện mọi đóng góp|Chuyên gia cải thiện chất lượng dịch vụ dù không quản lý người khác.
11|a|Employers should provide candidates with clear information about job responsibilities. Do you agree or disagree?|Giảm kỳ vọng sai; Giúp ứng viên tự đánh giá mức phù hợp|Tin tuyển dụng ghi tỷ lệ công việc hỗ trợ khách và xử lý dữ liệu.
11|b|Would you prefer a job at a small company or at a large organization?|Chọn công ty nhỏ: tiếp xúc nhiều loại nhiệm vụ; So sánh công ty lớn có nguồn lực đào tạo tốt|Nhân viên doanh nghiệp nhỏ theo đơn hàng từ tiếp nhận đến bàn giao.
11|c|Which should a candidate prioritize: salary, learning opportunities, or work location?|Chọn cơ hội học khi tài chính cơ bản được đáp ứng; So sánh lương và nơi làm theo hoàn cảnh|Người mới ra trường chọn vị trí có người hướng dẫn và lộ trình kỹ năng.
11|o|What is the most useful question to ask an employer during a job interview?|Hỏi cách đánh giá thành công của vị trí; Liên hệ câu trả lời với trách nhiệm thực tế|Ứng viên hỏi kết quả kỳ vọng sau ba tháng đầu.
11|p|What are the advantages and disadvantages of hiring employees through staff referrals?|Ưu điểm: tiếp cận ứng viên nhanh; Nhược điểm: thu hẹp nguồn ứng viên và nguy cơ thiên vị|Ứng viên được giới thiệu vẫn làm cùng bài đánh giá với người khác.
11|a|Employers should consider relevant volunteer experience when evaluating applicants. Do you agree or disagree?|Nhận diện kỹ năng có thể chuyển sang việc làm; Kiểm tra mức trách nhiệm thay vì chỉ tên hoạt động|Ứng viên quản lý lịch tình nguyện viên chứng minh kỹ năng tổ chức.
2|p|What are the advantages and disadvantages of replacing printed workplace notices with digital screens?|Ưu điểm: cập nhật nội dung nhanh; Nhược điểm: phụ thuộc thiết bị và khả năng đọc|Công ty giữ thông báo khẩn cấp tại vị trí dễ thấy khi màn hình hỏng.
6|o|What is the best way to help students manage their homework time?|Chia nhiệm vụ thành bước với mốc hoàn thành; Theo dõi thời gian thực tế để điều chỉnh|Học sinh lên lịch tìm nguồn trước khi viết bài thay vì làm toàn bộ tối cuối.
8|b|For a team discussion, would you prefer written suggestions in advance or spontaneous ideas during the meeting?|Chọn gửi trước: chuẩn bị ý và tăng cơ hội người ít nói; So sánh trao đổi trực tiếp giúp làm rõ|Nhóm đọc đề xuất trước rồi dành buổi họp để giải quyết khác biệt.
11|a|Job applicants should research a company's work practices before accepting an offer. Do you agree or disagree?|Đánh giá mức phù hợp; Kiểm tra thông tin bằng câu hỏi cụ thể|Ứng viên hỏi cách phân ca và nhận phản hồi thay vì dựa vào khẩu hiệu.
"""

TOPICS = ['Chính sách & phúc lợi công ty', 'Cộng đồng & môi trường', 'Công nghệ & Internet', 'Du lịch & giải trí', 'Đào tạo & kỹ năng', 'Gia đình & bạn bè', 'Giáo dục & trẻ em', 'Kinh doanh, khách hàng & quảng cáo', 'Lãnh đạo & làm việc nhóm', 'Nơi ở, giao thông & thành phố', 'Sự nghiệp & thăng tiến', 'Tuyển dụng & chọn việc']
CATEGORIES = {'a':'Đồng ý/Phản đối', 'o':'Nêu ý kiến', 'b':'Chọn 1 trong 2', 'c':'Chọn 1 trong 3', 'p':'Ưu–nhược'}

def reference(category, ideas, example):
    if category == 'Ưu–nhược':
        opening = 'Mở bài: giới thiệu vấn đề, báo trước sẽ xem xét lợi ích và hạn chế.'
        ending = 'Kết bài: cân nhắc hai mặt; nêu điều kiện để lợi ích vượt hạn chế.'
    elif category.startswith('Chọn'):
        opening = 'Mở bài: nêu lựa chọn và tiêu chí so sánh; không chỉ liệt kê các phương án.'
        ending = 'Kết bài: khẳng định lựa chọn trong hoàn cảnh đã nêu; nhắc đánh đổi với các phương án còn lại.'
    else:
        opening = 'Mở bài: trả lời trực tiếp câu hỏi và xác định lập trường.'
        ending = 'Kết bài: nhắc lại kết luận từ hai luận điểm, không thêm lý do mới.'
    return dict(outline=f'{opening}\n\nThân bài 1: {ideas[0]}. Giải thích cơ chế tạo ra kết quả.\n\nThân bài 2: {ideas[1]}. Phát triển một hệ quả khác hoặc giới hạn của quan điểm.\n\nVí dụ gợi ý: {example}\n\n{ending}',
                analysis=f'Dạng {category}. Xác định đối tượng và phạm vi trong đề; các luận điểm dưới đây là một hướng triển khai, có thể chọn lập trường khác nếu giải thích nhất quán.',
                explanation=f'Giữ mỗi đoạn tập trung một luận điểm, dùng câu giải thích trước ví dụ. Ví dụ riêng của đề: {example} Đây là tình huống minh họa, không phải số liệu nghiên cứu. Dùng hiện tại đơn cho nhận định chung; can/may cho khả năng; if + hiện tại đơn để nêu điều kiện. Không dùng số liệu không có nguồn.',
                vocabulary='a practical benefit = lợi ích thực tế; a potential drawback = hạn chế có thể có; a clear priority = ưu tiên rõ ràng; in this situation = trong tình huống này',
                summary='; '.join(ideas))

def main():
    lessons=[]
    for number, line in enumerate(DATA.strip().splitlines(), 25):
        topic, kind, prompt, ideas, example = line.split('|')
        category=CATEGORIES[kind]
        points=ideas.split('; ')
        lessons.append(dict(id=f'W{number:02}', part='essay', title=prompt, prompt=prompt,
                            topic=TOPICS[int(topic)], category=category,
                            difficulty='NC' if kind=='p' else 'TB' if kind in 'bc' else 'CB',
                            ideas=points, samples=[], **reference(category,points,example)))
    assert len(lessons)==76
    Path(__file__).with_name('essays.json').write_text(json.dumps(lessons,ensure_ascii=False,indent=2)+'\n')
    print('Authored 76 additional essay prompts and individual plans.')

if __name__=='__main__':
    main()
