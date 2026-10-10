"""38 original email situations, with task-specific responses and teaching notes."""
from pathlib import Path
import json

DATA = r"""
@E13|Hủy phòng đặt nhầm ngày|Alice Wong|Harbor Hotel Reservations|Incorrect arrival date
>I booked a room for November 14, but I meant to select November 21. My reservation number is HH-217. I have not paid yet, and I would like to change the date rather than cancel the booking. Could you explain the options?
!Nhân viên đặt phòng; cung cấp hai thông tin về đổi lịch và hỏi một câu hỏi về nhu cầu lưu trú.
~Xác nhận có thể đổi ngày → giải thích giá và hạn xác nhận → hỏi số đêm.
$reservation = đặt phòng; revised rate = giá điều chỉnh; availability = tình trạng phòng; confirm a booking = xác nhận đặt phòng
Dear Alice,

We can move reservation HH-217 to November 21 because rooms are currently available for that date. Your existing booking will remain active until you accept the change, so you do not need to cancel it first.

The revised rate is $95 per night, which is $10 more than the original rate. Please confirm the change by tomorrow afternoon so that we can hold the room and send an updated booking summary.

How many nights would you like to stay from November 21? I will check availability for the full visit before issuing the payment request.

Kind regards,
Harbor Hotel Reservations
^Hai thông tin: có thể chuyển ngày, giá và hạn xác nhận. Câu hỏi xác định số đêm, không yêu cầu trả tiền trước khi kiểm tra đủ chỗ. Can + V; before + V-ing.
@E14|Đề nghị suất ăn cho khách có dị ứng|Ben Ortiz|Maple Catering|Lunch arrangements for workshop
>We need lunch for twenty participants at our workshop next Monday. Two participants cannot eat nuts, and one cannot consume dairy products. Please explain how you can accommodate these needs and tell me what information you require before confirming the order.
!Nhân viên dịch vụ ăn uống; đưa hai thông tin về phương án suất ăn và hỏi một câu hỏi để chốt đơn.
~Suất ăn tách riêng và nhãn → quy trình xử lý yêu cầu dị ứng → hỏi giờ dùng bữa.
$dietary requirement = yêu cầu chế độ ăn; separate meal = suất riêng; ingredient list = danh sách thành phần; serving time = giờ phục vụ
Dear Ben,

We can prepare separately labeled meals for the participants who avoid nuts or dairy products. Each meal will include an ingredient list so that the participants can review it before eating.

Our team will also use separate preparation equipment for these meals. Because allergy requirements can differ, we will ask the affected participants to review our proposed menu and handling arrangements before we confirm that the service is suitable. We will not substitute ingredients without approval.

What time should lunch be ready on Monday? Once we receive the serving time, we can send the menu and order summary for your review.

Best regards,
Maple Catering
^Hai thông tin: suất riêng có nhãn, quy trình chuẩn bị và duyệt menu. Hỏi giờ phục vụ. Before + mệnh đề; avoid + danh từ. Đây là tình huống ngôn ngữ giả định, không cam kết an toàn thực phẩm thực tế.
@E15|Thay người tham dự hội thảo|Carla Mendes|Northbridge Events|Changing the attendee name
>My colleague Ravi cannot attend Thursday's workshop, so I would like to attend in his place. His registration number is NB-460. Please let me know whether a transfer is possible and what I need to bring to the event.
!Nhân viên sự kiện; cung cấp hai thông tin về chuyển đăng ký và yêu cầu một thông tin từ người nhận.
~Cho phép chuyển trước hạn → giấy tờ mang theo → yêu cầu tên đầy đủ.
$registration transfer = chuyển đăng ký; confirmation message = thư xác nhận; identity document = giấy tờ tùy thân; attendee = người tham dự
Dear Carla,

We can transfer registration NB-460 to another attendee without charging an additional fee. Please submit the change before noon on Wednesday so that our team can prepare the correct name badge.

On Thursday, you should bring the updated confirmation message and a photo identity document. The check-in desk will open thirty minutes before the workshop begins, and the staff will use your revised registration details to issue the badge.

Please send your full name as you would like it to appear on the attendee list. Once we receive it, we will replace Ravi's details and email the updated confirmation directly to you.

Kind regards,
Northbridge Events
^Thông tin về chuyển đăng ký và giấy tờ; yêu cầu tên đầy đủ. As you would like it to appear mô tả cách ghi tên; will + V cho bước tiếp theo.
@E16|Xin tài liệu đã dùng trong buổi đào tạo|David Kim|Staff Development|Materials from the scheduling workshop
>I attended yesterday's scheduling workshop, but I could not download the practice files before the session ended. Could you send them to me and explain whether I can share them with colleagues who did not attend?
!Nhân viên đào tạo; đưa hai thông tin về quyền truy cập/chia sẻ và hỏi một câu hỏi để gửi đúng tệp.
~Link truy cập → chia sẻ nội bộ → hỏi định dạng.
$practice file = tệp thực hành; internal use = sử dụng nội bộ; editable version = bản chỉnh sửa được; access link = liên kết truy cập
Dear David,

The practice files are available through our staff learning portal. I can send you a direct access link, and you will be able to download the materials using your employee account until the end of next month.

You may share the files with colleagues inside the company, provided that the workshop title and author information remain included. Please do not upload them to a public website, as the examples contain internal work procedures.

Would you prefer the editable spreadsheet files or the PDF practice sheets? Your choice will help me send the most useful version for your team.

Best regards,
Staff Development
^Hai thông tin: cách truy cập/thời hạn, phạm vi chia sẻ. Câu hỏi về định dạng. Provided that + mệnh đề diễn tả điều kiện.
@E17|Đổi lịch phỏng vấn do trùng lịch thi|Emma Tran|Greenfield Recruitment|Interview time conflict
>Thank you for inviting me to an interview on Tuesday at 10 a.m. Unfortunately, I have a university examination at that time. I remain interested in the assistant position. Could we arrange another time, and is there anything I should prepare beforehand?
!Nhân viên tuyển dụng; đề xuất một lịch mới, nêu một yêu cầu chuẩn bị và hỏi một câu hỏi xác nhận.
~Đề xuất thứ Tư 2 giờ → mang CV cập nhật → hỏi có tham gia được không.
$interview slot = khung giờ phỏng vấn; updated résumé = CV cập nhật; availability = khả năng tham dự; bring along = mang theo
Dear Emma,

Thank you for letting us know about the examination. We understand the conflict and can offer an interview on Wednesday at 2 p.m. The meeting will take place at the same office listed in your original invitation and should last about forty minutes.

Please bring an updated résumé so that the interviewers can discuss your recent coursework and experience. You do not need to prepare a formal presentation for this stage of the recruitment process.

Would Wednesday at 2 p.m. be convenient for you? Once you confirm, I will send a revised invitation and update the interviewers' calendars.

Kind regards,
Greenfield Recruitment
^Lịch thay thế, một yêu cầu mang CV và câu hỏi xác nhận rõ ràng. Would ... be convenient? là câu hỏi lịch sự; so that + S + can + V.
@E18|Hỏi chỗ đỗ xe cho khách|Felix Grant|Building Reception|Parking for visiting auditors
>Three auditors will visit our office tomorrow at 9 a.m. They are coming in one car and have asked about parking. Could you tell me where they should park and whether they need any permission before arriving?
!Lễ tân tòa nhà; cung cấp hai thông tin về đỗ xe và yêu cầu một thông tin.
~Vị trí chỗ khách → đăng ký trước và phí → yêu cầu biển số.
$visitor space = chỗ đỗ cho khách; vehicle registration = biển số xe; access permit = giấy phép vào; reception desk = quầy lễ tân
Dear Felix,

The auditors can park in the visitor spaces on level B1. They should enter through the east gate and follow the signs for reception rather than the staff parking section.

A visitor permit is required, but there is no parking charge for an appointment of up to four hours. We can arrange the permit in advance so that the gate attendant knows the vehicle is expected. The auditors should then collect their visitor badges from the reception desk.

Please send the car's registration number before 4 p.m. today. I will add it to tomorrow's access list and email you the parking directions.

Best regards,
Building Reception
^Hai thông tin: nơi đỗ xe, giấy phép và phí; yêu cầu biển số. Up to nêu giới hạn, rather than nêu lựa chọn đúng.
@E19|Báo hóa đơn có phí trùng|Gina Patel|Accounts Desk|Duplicate charge on invoice
>Invoice AC-905 appears to include the delivery charge twice. We ordered one shipment, and the goods arrived together. Please review the invoice and let me know whether I should pay the current amount or wait for a correction.
!Nhân viên kế toán; cung cấp hai thông tin xử lý hóa đơn và hỏi một câu hỏi kiểm tra.
~Tạm chưa trả phần sai → thời điểm hóa đơn mới → hỏi có trả rồi chưa.
$duplicate charge = phí tính trùng; corrected invoice = hóa đơn điều chỉnh; outstanding balance = số dư chưa trả; payment record = lịch sử thanh toán
Dear Gina,

Thank you for pointing out the duplicate delivery charge on invoice AC-905. Please wait for the corrected invoice before making a payment. We will keep the account open without applying a late fee while we review the disputed amount.

Our accounts team will check the shipment record this afternoon and send the revised invoice by tomorrow morning. The new document will show the delivery charge only once if the record confirms a single shipment, as you described.

Have you already made any payment against this invoice? That information will help us decide whether to update the outstanding balance or arrange a credit.

Kind regards,
Accounts Desk
^Hai thông tin: chờ hóa đơn mới và lịch xử lý; hỏi tình trạng thanh toán. Have you already made dùng hiện tại hoàn thành; if + hiện tại giữ điều kiện xác minh.
@E20|Thay địa chỉ trước khi gửi hàng|Henry Silva|PaperLane Orders|New delivery address
>My office moved yesterday, and order PL-612 has not been dispatched yet. Could you send the stationery to our new address instead? Please explain what details you need and whether the change will delay delivery.
!Nhân viên đơn hàng; yêu cầu hai thông tin địa chỉ và cung cấp một thông tin về lịch giao.
~Yêu cầu địa chỉ đầy đủ → số điện thoại nhận hàng → giữ lịch nếu gửi trước hạn.
$dispatch = gửi hàng; postal code = mã bưu chính; contact number = số điện thoại liên hệ; scheduled delivery = lịch giao đã định
Dear Henry,

We can update the address for order PL-612 because it has not yet been dispatched. Please send the complete new street address, including the postal code, so that we can prepare the correct shipping label.

Could you also provide a contact telephone number for the person who will receive the package? The courier may need to call before entering the building, especially if there is no reception desk.

If we receive both details before noon today, the order will keep its original delivery schedule. Later changes may move dispatch to the following business day. I will confirm the schedule after updating the order.

Best regards,
PaperLane Orders
^Hai yêu cầu thông tin tách rõ: địa chỉ đầy đủ và điện thoại; thông tin lịch có điều kiện rõ. Has not yet been dispatched là hiện tại hoàn thành bị động.
@E21|Đề xuất lịch dùng phòng tập|Iris Lee|Employee Wellness|Preferred time for exercise sessions
>We plan to offer a weekly exercise session for office staff. Please suggest a suitable time, explain why it would work for your team, and tell us about one facility we should provide to make participation easier.
!Nhân viên văn phòng; đề xuất một thời gian, một lý do và một tiện ích cần có.
~Chiều thứ Năm sau giờ làm → không trùng chốt báo cáo → khu thay đồ.
$weekly session = buổi hằng tuần; changing area = khu thay đồ; participation = việc tham gia; reporting deadline = hạn nộp báo cáo
Dear Iris,

I suggest holding the weekly exercise session at 5:30 p.m. on Thursday. Most members of our team finish work at 5 p.m., so they would have time to change and walk to the activity room without leaving their desks early.

Thursday would also avoid our Friday reporting deadline. Staff are usually preparing final figures on Friday afternoon, which makes it harder to commit to another activity that day.

Please provide a small changing area with secure storage for work clothes and bags. This would make it easier for people who travel by public transport to participate without carrying extra belongings throughout the session.

Best regards,
Owen
^Thời gian, lý do và tiện ích khác nhau. Would have/would make diễn tả lợi ích dự kiến của đề xuất, không phải quyết định đã chốt.
@E22|Yêu cầu hỗ trợ phòng học quá đông|Jonas Park|Training Coordinator|Room capacity for onboarding
>The room assigned for Monday's onboarding seats twelve people, but seventeen employees have confirmed attendance. Please suggest a solution, explain how it would work, and ask me for any detail you need before arranging it.
!Trợ lý đào tạo; đề xuất một giải pháp, giải thích cách thực hiện và hỏi một câu hỏi.
~Đổi phòng lớn → bố trí bàn và thiết bị → hỏi giờ kết thúc.
$room capacity = sức chứa phòng; seating layout = cách xếp chỗ; onboarding = đào tạo nhân viên mới; confirm attendance = xác nhận tham dự
Dear Jonas,

I suggest moving Monday's onboarding to the second-floor seminar room. It seats twenty-four people, so all seventeen employees could attend together without dividing the group.

We can arrange the tables in a U shape and move the portable projector from the original room before the session. This layout would give participants a clear view of the screen while leaving enough space for the group activities. I will also update the room details in the joining instructions once the booking is approved.

What time will the session finish? I need the full time period to check the seminar room's availability and arrange the equipment transfer.

Kind regards,
Lena
^Giải pháp đổi phòng, cách bố trí và câu hỏi về giờ kết thúc. Without + V-ing; enough + danh từ + for.
@E23|Thông báo đổi điểm đón xe|Kara Chen|Company Transport|Temporary pickup location
>The usual staff pickup point will be blocked by roadwork next week. Please propose another location, give one reason for choosing it, and explain how we should notify employees before Monday morning.
!Điều phối viên xe đưa đón; đề xuất điểm đón, một lý do và một cách thông báo.
~Cổng thư viện → có mái che và lối dừng → email kèm bản đồ.
$pickup point = điểm đón; roadwork = công trình đường; sheltered area = khu có mái che; route map = bản đồ tuyến
Dear Kara,

I recommend using the entrance to the public library as the temporary staff pickup point. It is one block from the usual stop, and the driver can reach it without entering the roadwork area.

The library entrance has a covered waiting area and a designated vehicle bay. This would allow staff to wait away from moving traffic while the bus stops in a suitable place.

We should email employees a marked route map on Friday and ask team supervisors to mention the change before the weekend. The message should include the temporary location, the unchanged pickup time, and a contact number for anyone who cannot find the stop.

Best regards,
Company Transport
^Đủ địa điểm, lý do và phương án thông báo; không tự đổi giờ đón. Recommend using; should + V.
@E24|Xin bổ sung thời gian nộp báo cáo|Liam Brooks|Project Supervisor|Extra time for survey report
>The survey data arrived two days later than planned. I can complete the report, but I cannot check all the charts before tomorrow's deadline. Could you advise whether an extension is possible and tell me what to send in the meantime?
!Quản lý dự án; đưa một quyết định về hạn nộp, một yêu cầu tạm thời và hỏi một câu hỏi về tiến độ.
~Gia hạn hai ngày → gửi bản số liệu đã kiểm → hỏi phần còn thiếu.
$extension = gia hạn; verified figures = số liệu đã kiểm tra; draft chart = biểu đồ nháp; remaining section = phần còn lại
Dear Liam,

You may submit the final survey report on Friday instead of tomorrow. The two-day extension will give you time to check the charts, but please keep Friday's deadline so that we can prepare for the client review.

In the meantime, send me the verified figures and any completed charts by tomorrow afternoon. Please label unfinished material clearly as a draft so that it is not circulated as final information. I will use only the checked sections in our internal update.

Which parts of the report still require data checks? Your answer will help me decide whether another team member can assist you.

Best regards,
Mara
^Quyết định hạn, yêu cầu bản tạm và câu hỏi về phần cần hỗ trợ. May + V cho phép; so that + mệnh đề mục đích.
@E25|Đăng ký mượn thiết bị trình chiếu|Maya Singh|Equipment Desk|Projector loan for client visit
>I need a portable projector for a client visit on Thursday afternoon. The meeting is outside our office, and I will return the equipment on Friday morning. Could you explain the borrowing process and any checks I should make before taking it away?
!Nhân viên thiết bị; nêu hai bước mượn/kiểm tra và hỏi một câu hỏi.
~Đặt thiết bị trong hệ thống → thử kết nối tại quầy → hỏi giờ lấy.
$loan form = phiếu mượn; connection test = kiểm tra kết nối; adapter = bộ chuyển đổi; collection time = giờ lấy
Dear Maya,

Please complete the equipment loan form in the staff portal and list Friday morning as the return time. Select the portable projector rather than the fixed meeting-room unit so that we reserve the correct device for your client visit.

Before leaving the equipment desk, connect the projector to your laptop and test a sample slide. Bring any adapter your laptop requires, as we cannot guarantee that the standard cable will fit every model. The desk team can help with this connection test.

What time would you like to collect the projector on Thursday? We will have it charged and ready for that time.

Kind regards,
Equipment Desk
^Hai bước và câu hỏi giờ lấy; không nhầm loại cố định/di động. Rather than phân biệt lựa chọn; before leaving dùng V-ing.
@E26|Khách không nhận được vé điện tử|Noah Evans|River Arts Box Office|Confirmation email not received
>I paid for two concert tickets yesterday, but the confirmation email has not arrived. I have checked my spam folder. The concert is on Saturday, and I would like to know how I can obtain the tickets before then.
!Nhân viên phòng vé; đưa hai cách nhận vé và hỏi một câu hỏi xác minh.
~Gửi lại vào email đúng → nhận tại quầy → hỏi mã giao dịch.
$electronic ticket = vé điện tử; transaction reference = mã giao dịch; collection desk = quầy nhận vé; resend = gửi lại
Dear Noah,

We can resend the electronic tickets after verifying the booking and the email address used at checkout. Please avoid making a second purchase while we investigate, as your existing payment may already be attached to a confirmed reservation.

If email delivery remains unsuccessful, you can collect printed tickets at the box office before Saturday's concert. Bring the booking confirmation we issue after the check and a photo identity document. The collection desk will open one hour before the performance.

Could you please provide the transaction reference shown on your payment receipt? This will help us locate the booking accurately.

Best regards,
River Arts Box Office
^Hai cách nhận vé và câu hỏi mã giao dịch. After verifying; if + hiện tại. Không yêu cầu thông tin thẻ đầy đủ.
@E27|Đề nghị thay ca trực|Olivia Reed|Shift Coordinator|Covering a morning shift
>I cannot work my Saturday morning shift because I have a family appointment. A colleague is willing to exchange shifts, but I need to know the procedure. Please explain what to do and whether the exchange requires approval.
!Điều phối viên ca; cung cấp hai thông tin về quy trình và hỏi một câu hỏi về người đổi.
~Nộp phiếu có cả hai người → cần quản lý duyệt → hỏi tên đồng nghiệp.
$shift exchange = đổi ca; approval = phê duyệt; roster = lịch phân ca; submit a request = nộp yêu cầu
Dear Olivia,

Please submit a shift-exchange request through the scheduling portal. The form should identify both shifts and include confirmation from you and the colleague who has agreed to exchange with you.

The exchange requires approval from the duty manager before either employee changes attendance plans. Once it is approved, we will update the official roster and send both of you a confirmation message. An informal agreement alone does not change the scheduled shifts.

Who has agreed to take your Saturday morning shift? I can check that person's availability and confirm that the proposed exchange meets our staffing requirements.

Kind regards,
Shift Coordinator
^Quy trình nộp và phê duyệt, câu hỏi tên người đổi. Who has agreed dùng hiện tại hoàn thành; before + mệnh đề.
@E28|Hỏi về phí sử dụng thư viện|Peter Lane|City Library Membership|Joining as a temporary resident
>I will live in the city for six months and would like to join the library. Could you explain whether temporary residents can become members and what documents I need to bring when applying?
!Nhân viên thư viện; cung cấp hai thông tin về đăng ký và hỏi một câu hỏi về địa chỉ.
~Cho phép đăng ký sáu tháng → giấy tờ và phí → hỏi đã có chứng từ địa chỉ chưa.
$temporary resident = cư dân tạm thời; proof of address = chứng từ địa chỉ; membership card = thẻ thành viên; application = đơn đăng ký
Dear Peter,

Temporary residents can apply for a six-month library membership. The card allows you to borrow books and use the reading rooms, and there is no registration fee for this type of membership.

Please bring a photo identity document and a recent document showing your local address, such as a rental agreement. Our staff will check these documents and ask you to complete a short application form at the membership desk. You can usually collect the card during the same visit.

Do you already have a document showing your address in the city? If not, I can explain the alternative documents we accept.

Best regards,
City Library Membership
^Hai thông tin về điều kiện/quyền lợi và giấy tờ; hỏi chứng từ địa chỉ. Allows you to borrow; showing bổ nghĩa document.
@E29|Xin báo giá in tài liệu|Quinn Zhao|BrightPrint Sales|Printing manuals for a seminar
>Our team needs forty copies of a twenty-page seminar manual. The pages are in color, and the event is on October 28. Please explain your printing options and ask for any detail you need to prepare an accurate quote.
!Nhân viên bán hàng; nêu hai lựa chọn in và hỏi một câu hỏi về đóng quyển.
~In màu toàn bộ → màu trang đầu/đen trắng bên trong → hỏi đóng gáy.
$quotation = báo giá; binding = đóng gáy; double-sided = hai mặt; full-color = in màu toàn bộ
Dear Quinn,

We can print all twenty pages in full color on standard paper. This option would preserve the appearance of every chart and photograph in your manual, and we can print the pages double-sided if you prefer.

A lower-cost option is to use a color cover with black-and-white inside pages. Before selecting it, please check that the charts remain understandable without color. We can prepare one sample copy for your approval before printing all forty manuals.

Would you like the manuals stapled or spiral-bound? The binding choice will affect both the price and the preparation time, so I need it before issuing the quotation.

Kind regards,
BrightPrint Sales
^Hai lựa chọn khác nhau, hỏi kiểu đóng gáy; không tự báo giá chính xác khi chưa đủ thông tin. Before selecting dùng V-ing; would affect chỉ hệ quả dự kiến.
@E30|Báo lỗi máy bán đồ uống|Rosa Miller|Facilities Service|Payment accepted but no drink supplied
>The drinks machine on level three accepted my payment this morning, but it did not provide the bottle I selected. The same thing happened to another employee. Could you explain how to recover the payment and what you will do about the machine?
!Nhân viên cơ sở; đưa hai thông tin về hoàn tiền/sửa máy và yêu cầu một thông tin giao dịch.
~Hoàn tiền qua biểu mẫu → tạm ngừng máy và kiểm tra → yêu cầu thời gian/số tiền.
$vending machine = máy bán hàng tự động; refund request = yêu cầu hoàn tiền; transaction time = giờ giao dịch; out of service = tạm ngừng hoạt động
Dear Rosa,

You can recover the payment by submitting the short refund form on the facilities portal. Our team will compare the report with the machine's transaction record and return the confirmed amount to the original payment method.

We will mark the machine as out of service today and ask the maintenance provider to inspect its dispensing mechanism. Please use the machine on level one while the inspection is taking place. We will remove the notice only after a successful test.

Please include the approximate transaction time and the amount paid in your refund request. Those details will help us identify the correct payment.

Best regards,
Facilities Service
^Hai thông tin xử lý tiền/máy và một yêu cầu chi tiết giao dịch. While + mệnh đề; after + cụm danh từ.
@E31|Đề nghị hỗ trợ nhân viên mới|Samira Khan|Team Supervisor|Buddy arrangement for new starters
>Two new employees will join our team next week. Please recommend a way to support them during the first three days, explain one benefit of your suggestion, and tell me what resource you need to put it into practice.
!Thành viên nhóm; một đề xuất, một lợi ích và một nguồn lực cần hỗ trợ.
~Phân người hướng dẫn riêng → hỏi nhanh đúng người → thời gian giải phóng cho mentor.
$buddy = đồng nghiệp hướng dẫn; first-week schedule = lịch tuần đầu; workload = khối lượng việc; practical question = câu hỏi thực tế
Dear Samira,

I recommend assigning a different buddy to each new employee for the first three days. The buddies could explain the daily schedule, introduce key contacts, and demonstrate the tasks that the new employees will practice first.

This arrangement would give each newcomer a clear person to approach with practical questions. It would also reduce the confusion caused by receiving different instructions from several colleagues at once.

To make the plan workable, I would need you to reserve thirty minutes of each buddy's schedule every morning. Reducing their normal workload slightly during those periods would allow them to provide support without rushing the demonstrations.

Best regards,
Alex
^Đề xuất phân buddy, lợi ích người liên hệ rõ, nguồn lực thời gian. Need you to reserve; without rushing.
@E32|Xin thay đổi định dạng cuộc họp|Tara Lewis|Department Manager|Remote attendance for monthly review
>Several team members will be visiting customers on the day of our monthly review. Please suggest a meeting format, explain two reasons it would help, and tell me what preparation you recommend.
!Nhân viên phòng ban; một định dạng họp, hai lý do và một bước chuẩn bị.
~Họp kết hợp → giữ người đi công tác tham gia → giảm dời lịch → thử âm thanh trước.
$hybrid meeting = họp kết hợp; remote participant = người tham gia từ xa; audio check = kiểm tra âm thanh; shared agenda = chương trình họp chung
Dear Tara,

I suggest holding a hybrid review, with office staff in the meeting room and traveling colleagues joining through the video platform.

First, this would allow the customer-facing staff to share their updates without returning to the office solely for the meeting. Second, we could keep the original date rather than postponing decisions until everyone is in the same place. The remaining staff would therefore receive the information they need on schedule.

Before the review, we should test the room microphone with one remote participant. A brief audio check would reveal whether people outside the room can hear all speakers clearly.

Best regards,
Nina
^Hai lý do khác nhau: tham gia từ xa, giữ tiến độ quyết định. Một bước chuẩn bị kiểm tra mic. Rather than postponing.
@E33|Hỏi dịch vụ giữ hành lý sau trả phòng|Umar Ali|Station Hotel Reception|Luggage storage after checkout
>My train leaves at 6 p.m., but checkout is at noon. I would like to explore the city during the afternoon. Could you tell me whether I can leave my bags at the hotel and how I should collect them afterward?
!Lễ tân khách sạn; cung cấp hai thông tin giữ/nhận hành lý và hỏi một câu hỏi.
~Có thể giữ miễn phí trong ngày → thẻ nhận và giờ quầy → hỏi số túi.
$luggage storage = giữ hành lý; collection tag = thẻ nhận; checkout = trả phòng; storage area = khu giữ đồ
Dear Umar,

You may leave your bags in our supervised storage area after checking out. This service is free for departing guests until 8 p.m. on the same day, so it should fit your train schedule.

At checkout, the receptionist will give you a collection tag for each bag. Please keep the tags and present them when you return. The main reception desk will handle the collection, and staff may ask you to confirm the room number connected with the storage record.

How many bags would you like us to store? I will let the afternoon team know so that they can prepare enough space.

Kind regards,
Station Hotel Reception
^Hai thông tin giữ/nhận, hỏi số túi. May leave; after checking out. Không suy ra bảo hiểm hành lý ngoài đề.
@E34|Đặt lịch kiểm tra mạng văn phòng|Vera Chen|IT Help Desk|Intermittent network connection
>Our team's internet connection drops several times each afternoon, although the connection is stable in the morning. We have restarted the router. Please arrange a check and let us know what information would help you diagnose the problem.
!Nhân viên IT; đề xuất một lịch kiểm tra và hỏi hai câu hỏi chẩn đoán.
~Kiểm tra đúng giờ lỗi → hỏi thiết bị bị ảnh hưởng → hỏi mốc bắt đầu.
$intermittent = chập chờn; affected device = thiết bị bị ảnh hưởng; network log = nhật ký mạng; diagnostic check = kiểm tra chẩn đoán
Dear Vera,

We can check the connection tomorrow between 2 and 3 p.m., when the issue is more likely to occur. A technician will monitor the network and compare the results with the router log rather than asking your team to restart the equipment repeatedly.

Does the connection drop on all devices or only on computers in one part of the office? Also, when did you first notice the afternoon interruptions? These details will help us narrow the investigation and prepare the right testing equipment.

Please keep a brief record of any interruption today, including its time and duration, so that we can compare it with tomorrow's observations.

Best regards,
IT Help Desk
^Đề xuất lịch và đúng hai câu hỏi chẩn đoán; thêm yêu cầu ghi lỗi hỗ trợ, không thay thế hai câu hỏi. More likely to occur; rather than asking.
@E35|Khách yêu cầu đổi món trong đơn đặt ăn|Will Foster|Café Orders|Changing items before collection
>I ordered six lunches for collection at noon, but one colleague has asked for a vegetarian option. The order number is CF-118. Could you explain whether we can replace one meal and whether the total price will change?
!Nhân viên quán; cung cấp hai thông tin đổi món/giá và hỏi một câu hỏi về món thay.
~Cho đổi trước 11 giờ → giá bằng nhau → hỏi chọn món nào.
$vegetarian option = món chay; collection order = đơn tự đến lấy; price difference = chênh lệch giá; substitute = thay thế
Dear Will,

We can replace one lunch in order CF-118 as long as you confirm the change before 11 a.m. The kitchen has not started preparing your meals yet, so the noon collection time can remain unchanged.

Our vegetable wrap and chickpea salad cost the same as the lunch you originally selected. Choosing either option would therefore keep the total price unchanged. We will label the replacement separately so that your colleague can identify it easily.

Would you prefer the vegetable wrap or the chickpea salad? Please reply with your choice, and I will update the order before sending it to the kitchen.

Kind regards,
Café Orders
^Hai thông tin đổi/giá và câu hỏi lựa chọn. As long as + mệnh đề; would keep diễn tả hệ quả chọn món.
@E36|Xin phép tổ chức góc trao đổi sách|Xenia Brown|Office Manager|Small book exchange in the lounge
>Some colleagues would like to create a book exchange in the staff lounge. Please tell us whether this would be permitted and what rules we should follow. We want to keep the area tidy and avoid taking space from other activities.
!Quản lý văn phòng; đưa một quyết định, hai quy định và hỏi một câu hỏi về người phụ trách.
~Cho thử bốn tuần → một kệ duy nhất → không để lối đi → hỏi người dọn.
$book exchange = trao đổi sách; trial period = thời gian thử; shared space = không gian chung; designated shelf = kệ chỉ định
Dear Xenia,

You may run the book exchange for a four-week trial period. At the end of the trial, we will review whether it is useful and whether it fits comfortably into the lounge.

Please keep all books on the small designated shelf beside the noticeboard. Do not add boxes or extra furniture without approval. Also, make sure that the books do not extend into the walkway or cover information posted on the board. These rules will keep the shared space usable for other staff.

Who will be responsible for checking the shelf each week and removing damaged or unclaimed books?

Best regards,
Office Manager
^Một quyết định thử, hai quy định: giới hạn kệ và giữ lối đi/bảng thông báo; câu hỏi người phụ trách. Make sure that + mệnh đề.
@E37|Xin thông tin khóa học tối hết chỗ|Yara Scott|Language Center|Waiting list for the evening class
>The Wednesday evening class is full, but it is the only session that fits my current work schedule. Could you tell me whether there is a waiting list and what alternatives might be available if no place opens?
!Nhân viên trung tâm; cung cấp hai thông tin về danh sách chờ/phương án khác và yêu cầu một thông tin.
~Danh sách chờ theo thứ tự → buổi online cùng giờ → yêu cầu số điện thoại.
$waiting list = danh sách chờ; available place = chỗ còn trống; online session = buổi trực tuyến; contact details = thông tin liên hệ
Dear Yara,

We maintain a waiting list for the Wednesday evening class and offer places in the order requests are received. If a place becomes available, we will contact you and hold it for twenty-four hours while you decide.

If the class remains full, you could join the online session held at the same time. It covers the same course content, although the group activities take place through the video platform. You may transfer to the classroom session later if a suitable place opens.

Please send a telephone number where we can reach you about a waiting-list offer.

Kind regards,
Language Center
^Hai thông tin và yêu cầu số liên hệ. In the order requests are received; although phân biệt hình thức hoạt động.
@E38|Xác nhận lịch giao hàng số lượng lớn|Zack Martin|Warehouse Dispatch|Delivery of exhibition panels
>We are expecting twelve display panels for our exhibition on Friday. The venue allows deliveries only between 8 and 10 a.m. Please confirm whether you can meet that window and explain how the delivery team will unload the panels.
!Nhân viên kho; cung cấp hai thông tin lịch/dỡ hàng và hỏi một câu hỏi về lối vào.
~Chọn khung 8–9 → hai nhân viên và xe đẩy → hỏi cửa giao.
$delivery window = khung giờ giao; unloading = dỡ hàng; loading entrance = cửa nhập hàng; handling team = nhóm vận chuyển
Dear Zack,

We can schedule the twelve display panels for delivery between 8 and 9 a.m. on Friday. This falls within the venue's permitted window. The driver will call your on-site contact shortly before arrival to confirm that the delivery area is ready.

Two members of our handling team will unload the panels using a padded trolley. They will move them to the agreed ground-floor storage point, but assembly is not included in the delivery service.

Which entrance should the vehicle use at the venue? Please send its location and any height restriction so that we can select a suitable vehicle.

Best regards,
Warehouse Dispatch
^Hai thông tin về khung giờ và dỡ hàng, một câu hỏi cửa vào. Passive will be avoided by active team roles; assembly exclusion làm phạm vi rõ.
@E39|Yêu cầu sửa tên trên chứng chỉ|Anika Das|Course Administration|Name printed incorrectly
>I received my course certificate today, but my family name is misspelled. The certificate shows Daz instead of Das. Could you explain how I can obtain a corrected certificate and whether I need to return the original?
!Nhân viên quản lý khóa học; cung cấp hai thông tin chỉnh chứng chỉ và yêu cầu một minh chứng.
~Cấp bản mới trong ba ngày → không phải gửi bản cũ, đánh dấu thay thế → yêu cầu ảnh bản sai.
$corrected certificate = chứng chỉ sửa lại; spelling error = lỗi chính tả; replacement copy = bản thay thế; verification = xác minh
Dear Anika,

We apologize for the spelling error on your certificate. After checking the course record, we will issue a corrected electronic certificate within three business days. A printed replacement can be collected from our office afterward.

You do not need to send the original back. We will mark it as replaced in our system, and you should use only the corrected certificate when sharing your qualification details.

Please send a clear photograph of the incorrect certificate, including its reference number. This will allow us to locate the record and confirm exactly which text needs correction before producing the replacement.

Kind regards,
Course Administration
^Hai thông tin cấp lại/không trả bản cũ, yêu cầu ảnh có mã. After checking; allow us to locate.
@E40|Báo thay đổi số lượng khách dự họp|Bruno Costa|Conference Venue|More delegates than expected
>Our conference booking was for thirty delegates, but we now expect thirty-eight. The date and meeting time have not changed. Please explain whether the room can accommodate the larger group and whether we need to adjust the catering order.
!Nhân viên địa điểm; cung cấp hai thông tin phòng/đồ ăn và hỏi một câu hỏi về số cuối.
~Phòng đủ nếu bố trí kiểu lớp → thêm tám suất ăn → hỏi chốt số ngày nào.
$delegate = đại biểu; classroom layout = bố trí kiểu lớp; final headcount = số người cuối; catering order = đơn ăn uống
Dear Bruno,

The booked room can accommodate thirty-eight delegates in a classroom layout. We will replace the large discussion tables with smaller rows so that everyone has a clear view of the presentation screen. The meeting date and time can remain unchanged.

The catering order should be increased by eight lunches to match the revised attendance. We can send an updated quotation once you confirm the number, and any additional dietary requirements should be included at that stage.

When will you be able to confirm the final headcount? Our catering team needs the confirmed number at least two business days before the conference.

Best regards,
Conference Venue
^Hai thông tin phù hợp tăng 30 lên 38, hỏi hạn chốt. Should be increased bị động; so that chỉ mục đích bố trí.
@E41|Đề nghị sửa cửa kho bị kẹt|Chloe Nguyen|Maintenance Office|Storeroom door sticking
>The storeroom door is difficult to open, and staff have been pulling it forcefully to collect supplies. Could you arrange a repair and explain how we should access the supplies until the door has been checked?
!Nhân viên bảo trì; nêu lịch kiểm tra, một phương án tạm và hỏi một câu hỏi xác định vị trí.
~Kiểm tra sáng mai → dùng nguồn cấp tạm ở hành chính → hỏi mã phòng.
$sticking door = cửa bị kẹt; temporary supply point = điểm cấp tạm; room number = số phòng; maintenance visit = lượt bảo trì
Dear Chloe,

We will arrange for a maintenance technician to inspect the door tomorrow morning. Please do not continue pulling it forcefully, as this may damage the handle or frame before the technician can identify the cause.

Until the inspection is complete, staff can collect frequently used supplies from the administration desk. We will ask that team to prepare a temporary supply box today so that employees do not have to use the affected entrance for routine items.

Could you confirm the storeroom number and floor? I will add those details to the work request and let you know when the technician is on the way.

Kind regards,
Maintenance Office
^Lịch kiểm tra, phương án tạm, câu hỏi vị trí. Until + hiện tại; frequently used bổ nghĩa supplies. Không hướng dẫn tự sửa kỹ thuật.
@E42|Hỏi gia hạn gói phần mềm nhóm|Diego Ruiz|TeamTools Accounts|Subscription renewal for a smaller team
>Our annual subscription expires next month. We currently pay for fifteen users, but the team now has ten. Could you explain whether we can reduce the number at renewal and how we should complete the renewal process?
!Nhân viên tài khoản; cung cấp hai thông tin đổi gói/gia hạn và hỏi một câu hỏi về tài khoản giữ lại.
~Giảm xuống mười khi gia hạn → hóa đơn mới và hạn trả → hỏi danh sách user.
$subscription renewal = gia hạn đăng ký; active account = tài khoản hoạt động; billing period = kỳ thanh toán; user license = giấy phép người dùng
Dear Diego,

You can reduce the subscription from fifteen users to ten when the new annual period begins. The current licenses will remain active until the existing subscription expires, so your team does not need to remove users immediately.

To renew, please review the revised quotation we will send this week and approve it through the account portal. We will then issue an invoice for ten licenses, with payment due before the start of the new period.

Which ten user accounts would you like to keep active? Please identify them in your reply so that we can prepare the renewal without removing an account your team still needs.

Best regards,
TeamTools Accounts
^Hai thông tin về đổi số và quy trình; hỏi danh sách giữ. When + hiện tại cho mốc tương lai; without removing.
@E43|Yêu cầu hỗ trợ tìm đồ bỏ quên|Elena Rossi|Community Hall Office|Missing notebook after workshop
>I attended the evening workshop in room C yesterday and may have left a blue notebook on my chair. It contains my project notes. Could you explain how I can check the lost-property collection and what information would help you find it?
!Nhân viên hội trường; cung cấp một cách kiểm tra, hỏi hai câu hỏi nhận diện.
~Kiểm tra qua quầy → hỏi tên trên bìa → hỏi chỗ ngồi.
$lost property = đồ thất lạc; identifying detail = đặc điểm nhận diện; seating position = vị trí chỗ ngồi; collection register = sổ nhận đồ
Dear Elena,

You can check the lost-property collection by contacting the hall office during opening hours. I will also review the items handed in after yesterday's workshop and compare them with the cleaning team's collection register.

Does the blue notebook have your name or another identifying detail on its cover? Also, approximately where were you sitting in room C? These two details will help us distinguish your notebook from other items and ask the cleaners to check the correct part of the room.

If we find a likely match, we will contact you before arranging collection. Please do not travel to the hall until we have confirmed that an item is available.

Kind regards,
Community Hall Office
^Một cách kiểm tra, đúng hai câu hỏi về đặc điểm và vị trí. Does ... have?; where were you sitting? là câu hỏi trực tiếp.
@E44|Xin đổi giờ tiếp khách tại văn phòng|Farah Ahmed|Sales Team|Client visit moved earlier
>Our client would now like to arrive at 8:30 a.m. instead of 10 a.m. on Thursday. Please confirm whether your team can be ready, describe two preparations you will make, and ask for any detail still needed.
!Đại diện nhóm bán hàng; xác nhận lịch, nêu hai việc chuẩn bị và hỏi một câu hỏi.
~Chấp nhận giờ mới → chuẩn bị mẫu sản phẩm → gửi báo cáo trước → hỏi số khách.
$product sample = mẫu sản phẩm; visitor list = danh sách khách; briefing document = tài liệu tóm tắt; demonstration = trình diễn
Dear Farah,

Our team can be ready for the client's arrival at 8:30 a.m. on Thursday. I will update our calendar and ask the staff involved in the visit to arrive early enough to complete the setup.

First, we will place the product samples in the demonstration room before the client arrives. Second, we will email the briefing document on Wednesday afternoon so that the visitors can review the main figures in advance. This should leave more meeting time for questions.

How many people will be joining the visit? We need the number to arrange chairs and prepare enough sample packs.

Best regards,
Sales Team
^Xác nhận lịch, hai hành động chuẩn bị, câu hỏi số khách. Early enough to + V; so that + S + can + V.
@E45|Báo khó khăn với biểu mẫu đăng ký|George Lin|Membership Support|Form will not accept postal code
>I am trying to complete the membership form, but it will not accept my postal code. I have entered it several times without spaces. Could you suggest another way to register and tell me what details you need to investigate the form problem?
!Nhân viên hỗ trợ; đưa một cách đăng ký thay thế và hỏi hai câu hỏi chẩn đoán.
~Đăng ký bằng biểu mẫu gửi email → hỏi quốc gia → hỏi trình duyệt.
$postal code = mã bưu chính; alternative form = biểu mẫu thay thế; browser = trình duyệt; error message = thông báo lỗi
Dear George,

You can complete registration using the alternative form attached to our reply. Please fill in the membership details and return it to this support address. We will enter the information manually and send a confirmation after checking it, so you will not need to repeat the online application.

Which country is the address in? Could you also tell us which browser you are using? The postal-code format may depend on the selected country, and the browser information will help our technical team reproduce the problem.

If an error message appears, please include its wording in your reply as well.

Kind regards,
Membership Support
^Một phương án thay thế, hai câu hỏi quốc gia/trình duyệt. Which country ... in?; information không đếm được.
@E46|Đề xuất hoạt động cho ngày nhóm|Holly Adams|Team Event Organizer|Ideas for a half-day team event
>We have a half day available for a team event next month. Please recommend one activity, give two reasons it would suit a mixed group of staff, and tell me about any practical arrangement we should make first.
!Nhân viên đề xuất hoạt động; một hoạt động, hai lý do và một bước chuẩn bị.
~Workshop nấu ăn nhóm → nhiều vai trò không cần thể lực cao → khuyến khích phối hợp → hỏi chế độ ăn trước.
$group activity = hoạt động nhóm; mixed abilities = năng lực khác nhau; shared task = nhiệm vụ chung; dietary preference = sở thích/chế độ ăn
Dear Holly,

I recommend a small-group cooking workshop for the half-day event. The instructor could give each team a simple menu and divide the preparation into several manageable tasks.

First, staff could choose different roles, such as measuring ingredients or organizing the table, so the activity would not depend on everyone's physical fitness. Second, preparing one shared meal would encourage people from different departments to coordinate their work and communicate directly.

Before booking, we should collect dietary requirements and preferences from all participants. The provider could then propose a suitable menu and explain which arrangements are possible before we confirm the workshop.

Best regards,
Riley
^Một hoạt động, hai lý do và một bước chuẩn bị. Could choose; before booking. Không coi hoạt động phù hợp mọi người khi chưa hỏi nhu cầu.
@E47|Hỏi chính sách nhận khách giao hàng ngoài giờ|Ivan Petrov|Security Office|Late delivery for equipment replacement
>A replacement equipment part may arrive after 6 p.m. tomorrow, when our reception is closed. Could you explain whether security can accept it and what information we should provide in advance?
!Nhân viên an ninh; cung cấp hai thông tin về nhận hàng ngoài giờ và yêu cầu một thông tin giao hàng.
~Nhận kiện nhỏ đã đăng ký → lưu tại tủ và thông báo sáng → yêu cầu hãng/mã theo dõi.
$after-hours delivery = giao ngoài giờ; registered parcel = kiện đã đăng ký; secure cabinet = tủ bảo quản; courier details = thông tin hãng giao
Dear Ivan,

Security can accept a small equipment parcel after 6 p.m. if the delivery has been registered in advance. The driver must come to the main gate, where the evening officer can check the expected delivery list before signing for the package.

We will store the parcel in the secure cabinet beside the security desk and notify your team the following morning. Large items that require unloading equipment cannot be handled by the evening officer, so please confirm that the replacement part is a normal parcel.

Please send the courier's name and tracking number before 3 p.m. tomorrow so that we can register the delivery.

Kind regards,
Security Office
^Hai thông tin về điều kiện nhận và bảo quản; yêu cầu thông tin courier. Cannot be handled là bị động; if + hiện tại.
@E48|Xin xác nhận tham dự qua thư|Julia Gomez|Community Workshop|Confirmation for weekend attendance
>I registered for Sunday's repair workshop but have not received an attendance confirmation. I need to know the start time before arranging transport. Could you tell me how to confirm my place and whether I should bring any materials?
!Nhân viên workshop; đưa hai thông tin về xác nhận/lịch và vật liệu, hỏi một câu hỏi xác minh.
~Kiểm tra mã đăng ký và giờ bắt đầu → có vật liệu cơ bản → hỏi tên dùng đăng ký.
$attendance confirmation = xác nhận tham dự; basic material = vật liệu cơ bản; booking reference = mã đặt; start time = giờ bắt đầu
Dear Julia,

The workshop begins at 9:30 a.m. on Sunday. We can confirm your place after matching your details with the registration list, and we will resend the attendance message with directions to the venue.

Basic tools and practice materials are provided. You may bring a small item you would like to discuss, but please describe it to the instructor before attempting any repair. You do not need to purchase additional materials to take part in the introductory activities.

What name did you use when registering? If you have a booking reference, please include it in your reply so that we can find your entry more quickly.

Best regards,
Community Workshop
^Thông tin xác nhận/giờ và vật liệu, câu hỏi tên đăng ký. Did you use when registering; before attempting. Không hướng dẫn sửa thiết bị nguy hiểm.
@E49|Báo quầy lễ tân cần biển chỉ dẫn|Kenji Sato|Office Administration|Visitors arriving at the wrong desk
>Visitors have been arriving at our staff service desk instead of the main reception. Please explain two possible reasons for the confusion and recommend one change that we can make this week.
!Nhân viên hành chính; nêu hai nguyên nhân có thể và một đề xuất.
~Tên hai quầy giống nhau → bảng hướng dẫn cũ → một bảng chỉ dẫn rõ từ cửa.
$direction sign = biển chỉ dẫn; desk label = nhãn quầy; outdated map = bản đồ lỗi thời; main reception = lễ tân chính
Dear Kenji,

There are two likely reasons why visitors are reaching the staff service desk. First, both desks currently display similar labels, so someone unfamiliar with the building may not understand which one handles visitors. Second, the map beside the entrance still shows the old reception position from before the office rearrangement.

I recommend replacing the entrance map with a clear direction board this week. It should identify “Visitor Reception” by name and use an arrow pointing to the current desk. This single change would correct the outdated route and clarify the function of the destination.

I can prepare the proposed wording for review tomorrow.

Best regards,
Office Administration
^Hai nguyên nhân có thể và một thay đổi xử lý cả hai. Likely reasons tránh khẳng định nguyên nhân chưa xác minh; before + cụm danh từ.
@E50|Đề nghị bố trí lịch họp với nhà cung cấp|Leila Hassan|Purchasing Team|Supplier discussion next week
>Our supplier would like to discuss the revised delivery arrangement next week. Please suggest a meeting time, identify two topics we should cover, and ask me for one detail you need before sending the invitation.
!Nhân viên mua hàng; đề xuất một lịch, hai chủ đề và hỏi một câu hỏi.
~Thứ Ba 11 giờ → khung giờ giao → liên hệ khi trễ → hỏi đại diện nhà cung cấp.
$delivery arrangement = phương án giao; contingency contact = liên hệ khi có sự cố; supplier representative = đại diện nhà cung cấp; meeting invitation = thư mời họp
Dear Leila,

I suggest meeting the supplier at 11 a.m. on Tuesday. Our purchasing team is available then, and the warehouse supervisor can join before the afternoon deliveries begin.

We should cover two main topics. The first is the revised delivery window, including how much notice the warehouse will receive before each shipment. The second is the contact procedure for delays, so that both teams know whom to call when the agreed window cannot be met.

Who will represent the supplier at the meeting? Please send that person's name and email address, and I will prepare an invitation with the proposed agenda.

Best regards,
Purchasing Team
^Một lịch, hai chủ đề riêng và một câu hỏi đại diện. Including + mệnh đề danh từ; cannot be met bị động sau modal.
"""

def main():
    items = []
    for block in DATA.strip().split("\n@"):
        lines = block.lstrip("@").splitlines()
        code, title, sender, recipient, subject = lines[0].split("|")
        fields = {}
        reply = []
        for line in lines[1:]:
            if line and line[0] in ">!~$^":
                fields[line[0]] = line[1:]
            else:
                reply.append(line)
        items.append(dict(id=code, part="email", category="Email", title=title, sender=sender,
                          recipient=recipient, subject=subject,
                          incoming="Hello,\n\n" + fields[">"] + "\n\n" + sender,
                          task=fields["!"], outline=fields["~"], vocabulary=fields["$"],
                          samples=["\n".join(reply).strip()], explanation=fields["^"]))
    assert len(items) == 38, len(items)
    assert all(len(p["samples"][0].split()) >= 85 for p in items)
    Path(__file__).with_name("emails.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print("Authored", len(items), "additional email lessons")

if __name__ == "__main__":
    main()
