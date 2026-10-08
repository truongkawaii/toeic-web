import { TRACKS, NOTICES, EMAILS, ARTICLES, CHAT_TASKS, COURSES, ORDERS, POLICY_ITEMS } from './scenarios.mjs';
import { rentalDocuments, recruitmentDocuments, eventChangeDocuments } from './variants.mjs';

const q = (stem, answer, distractors, explanation, skill='detail', paraphrases=[]) => ({stem, answer, distractors, explanation, skill, paraphrases});
const pair = (source, target, meaning) => ({source,target,meaning});
const doc = (heading, content, table) => ({heading,content,...(table ? {table} : {})});
const para = (...xs) => xs.join('\n\n');
const pick = (i, xs) => xs[i % xs.length];

export function part6(i) {
 const t=TRACKS[i], month=pick(i,['March','April','May','June','July']), fee=t.base+20;
 const A=pick(i,['convenient','practical','useful','reliable','versatile']);
 const verb=pick(i,['introducing','offering','presenting','bringing','promoting']);
 const N=pick(i,['feedback','suggestions','comments','observations','recommendations']);
 const groups=[
  {kind:'announcement', documents:[doc(`${t.org} — service update`,para(
   `Our team is currently ${verb==='testing'?'preparing for a trial of':'preparing a new stage of'} ${t.project}. We look forward to ------- (131) this service to the public on ${month} 18. The program grew out of conversations with customers who said that our existing arrangements did not fit their daily schedules.`,
   `The service will offer a more ------- (132) option for those customers. A small group of regular clients has already tried it and provided detailed ------- (133). Their responses helped us simplify the booking procedure and clarify what is included in the fee.`,
   `------- (134). We will keep the current service available throughout the first month, allowing customers to compare both options before making a decision. Staff will be on hand to answer questions, and a step-by-step guide will be distributed at the opening session.`))], questions:[
    q('',verb,[verb.replace(/ing$/,'ed'),'introduce','introduction'].filter(x=>x!==verb).slice(0,3),`Sau look forward to dùng danh từ/V-ing; ${verb} là V-ing diễn tả việc triển khai dịch vụ. To trong cụm này là giới từ. Các dạng động từ chia thì và danh từ chỉ khái niệm không phù hợp với tân ngữ “this service”.`,'gerund'),
    q('',A,['convenience','usefully','practically'],`“A more ${A} option”: cần tính từ bổ nghĩa cho option. Ngữ cảnh là lựa chọn đáp ứng lịch sinh hoạt của khách; các danh từ/trạng từ còn lại không đứng ở vị trí này.`,'word-form'),
    q('',N,['receipts','shipments','vacancies'],`Khách đã dùng thử và gửi phản hồi, nên ${N} phù hợp với “Their responses” ngay câu sau. Receipts là biên lai; shipments là lô hàng; vacancies là chỗ trống tuyển dụng.`,'cohesion'),
    q('','Customers will not be required to switch immediately.',['The existing service ended several years ago.','No customers have been invited to try the program.','Bookings can only be made at the old office.'],`Câu sau nói dịch vụ hiện tại vẫn được duy trì để khách so sánh. Câu “Customers will not be required to switch immediately” nối đúng ý chuyển đổi tự nguyện. Các lựa chọn còn lại mâu thuẫn hoặc nêu hạn chế không được giới thiệu.`,'sentence-completion',[pair('keep the current service available','not be required to switch immediately','vẫn có lựa chọn cũ, chưa buộc đổi ngay')]),
   ]},
  {kind:'e-mail', documents:[doc('Message from the project coordinator',para(
   `To: ${t.person}\nFrom: Project Office, ${t.org}\nDate: ${month} 6\nSubject: Preparing the new facility`,
   `Thank you for ------- (135) the preliminary plans for ${t.facility}. Your comments about the layout were especially helpful. The revisions include a wider entrance and a separate area for deliveries, so visitors will not have to pass through the loading zone.`,
   `The design team ------- (136) the first version last month, before we received your suggestions. We are now preparing a revised drawing that incorporates the changes discussed at our meeting. ------- (137). That will give everyone enough time to check the measurements before construction begins.`,
   `Please reply ------- (138) ${month} 12 with any further corrections. Once the drawing is approved, we will obtain quotations from contractors. We have not selected a contractor yet, and no work will start until the final budget has been authorized.`))], questions:[
    q('','reviewing',['review','reviewed','reviews'],'Sau “Thank you for” cần V-ing: reviewing. Đây là lời cảm ơn vì đã xem kế hoạch, không phải động từ chia thì.','gerund'),
    q('','completed',['completes','will complete','has completing'],'“Last month” là mốc quá khứ đã kết thúc; completed dùng quá khứ đơn. Will complete chỉ tương lai, completes là hiện tại; has completing sai cấu trúc.','tense'),
    q('','We will circulate it to the committee tomorrow.',['The building was sold to another organization.','Your comments will be ignored in the next version.','The contractor finished construction yesterday.'],'It chỉ revised drawing vừa nhắc đến. Gửi bản vẽ ngày mai tạo thời gian kiểm tra kích thước như câu sau. Các đáp án khác làm đứt mạch hoặc mâu thuẫn với việc chưa thi công.','sentence-completion',[pair('circulate it','send the revised drawing to reviewers','gửi bản vẽ để góp ý')]),
    q('','by',['until','during','within'],`“Reply by ${month} 12” yêu cầu phản hồi chậm nhất ngày này. Until diễn tả hành động kéo dài; during/within không diễn đạt hạn chót với mốc ngày theo cấu trúc này.`,'deadline'),
   ]},
  {kind:'product description', documents:[doc(`${t.product} — customer guide`,para(
   `${t.org} has added ${t.product} to its customer catalog. The new range includes ${t.feature}, which can be adapted to different settings. Each item is checked ------- (139) before it leaves the warehouse. A signed inspection card is included in every package so customers know that the checks have been completed.`,
   `Although the products are designed for everyday use, correct care remains important. ------- (140). The instructions explain which cleaning materials are suitable and which should be avoided. Customers should retain the booklet for future reference.`,
   `Replacement accessories are available from ${t.supplier}. Customers ------- (141) need help choosing an accessory may contact our service team with the model number printed on the label.`,
   `We keep a complete ------- (142) of compatible accessories on our website. Prices and availability are updated each morning, and discontinued items are clearly marked. Online purchases can be collected from our office without a delivery charge.`))], questions:[
    q('','thoroughly',['thorough','thoroughness','through'],'Cần trạng từ thoroughly bổ nghĩa cho checked: kiểm tra kỹ lưỡng. Thorough là tính từ, thoroughness là danh từ; through là giới từ/trạng từ mang nghĩa khác.','word-form'),
    q('','A care booklet is therefore supplied with each purchase.',['The warehouse will be demolished next month.','Accessories must never be used with these products.','Customers no longer receive any written information.'],'Câu trước nêu tầm quan trọng của bảo quản; câu sau bắt đầu “The instructions”. Một care booklet tạo tiền đề rõ ràng cho hướng dẫn đó; các lựa chọn khác không giới thiệu hướng dẫn hoặc phủ nhận nó.','sentence-completion'),
    q('','who',['whose','where','which'],'Customers là người; who làm chủ ngữ cho need. Whose phải đi với danh từ; where chỉ nơi chốn; which không dùng để chỉ người trong ngữ cảnh này.','relative-clause'),
    q('','list',['listlessly','listed','lists'],'“A complete list of …” là cụm danh từ số ít: một danh sách đầy đủ. Listed là phân từ; lists số nhiều không đi với a; listlessly là trạng từ chỉ sự uể oải.','collocation'),
   ]},
  {kind:'registration notice', documents:[doc(`${t.event} — registration`,para(
   `Registration for this year’s ${t.event} opened this morning. The event will take place at ${t.venue} on ${month} 24, and the registration fee is $${fee}. This amount includes admission to all daytime talks and a light lunch. It does not include the optional evening reception.`,
   `Participants are encouraged to reserve a place ------- (143), as the hall has limited seating. ------- (144), reservations received after ${month} 20 cannot be guaranteed a printed program. An electronic version will remain available to all registered participants.`,
   `Anyone who wishes to cancel must ------- (145) the event office at least two days before the event. Cancellation requests received later will not qualify for a refund. ------- (146). This information will help us identify the correct booking without asking you to send your payment details again.`,
   `For accessibility requests, please use the separate form linked on the registration page. Our team will contact you to confirm the arrangements before the event.`))], questions:[
    q('','early',['earlier than','earliest','earliness'],'Reserve a place early = đặt chỗ sớm. Earlier than thiếu đối tượng so sánh, earliest là so sánh nhất không phù hợp, earliness là danh từ.','word-form'),
    q('','In addition',['On the contrary','Instead of','In order to'],'Câu bổ sung một hạn chế khác của đăng ký muộn nên dùng In addition. Không có ý phủ định để dùng On the contrary; Instead of/In order to không đứng trước mệnh đề theo cách này.','transition'),
    q('','notify',['notification','notified','notifying'],'Sau must cần động từ nguyên mẫu notify = thông báo. Notification là danh từ, notified và notifying không đi trực tiếp sau must.','modal'),
    q('','Please include your reservation number in the request.',['Please bring a guest who has not registered.','The reception has been canceled because of rain.','Our talks will cover several unrelated subjects.'],'“This information” ở câu sau phải chỉ thông tin giúp xác định booking: reservation number. Những câu về khách, tiệc hay chủ đề không cung cấp mã đặt chỗ.','sentence-completion',[pair('reservation number','identify the correct booking','mã dùng để xác định lượt đặt chỗ')]),
   ]},
 ];
 // The builder renumbers the gaps when rotating the four genres.
 return groups;
}

export function part7(i) {
 const t=TRACKS[i], date=12+i, next=date+2, month=pick(i,['May','June','July','August','September']);
 const groups=[];
 const add=(kind,documents,questions)=>groups.push({kind,documents,questions});
 const [notice,area,action,audience,exception,contact]=NOTICES[i];
 add('notice',[doc(notice,para(
  pick(i,[`Work on ${area} is scheduled for ${month} ${date} and ${date+1}.`,`A two-day improvement project will affect ${area} beginning ${month} ${date}.`,`Please be aware that ${area} will be unavailable on ${month} ${date} and ${date+1}.`]),
  `During this period, ${audience} should ${action}. Temporary signs will mark the route, and a member of staff will be available each morning to assist visitors. The alternative area will operate at the same hours as the regular facility.`,
  `Normal arrangements will resume at 8 A.M. on ${month} ${next}. Only ${exception} require special arrangements; please contact the ${contact} before arriving. We appreciate your patience while the work is carried out.`))],[
  q('What is the main purpose of the notice?','To explain temporary access arrangements',['To invite applications for a position','To announce a permanent relocation','To advertise a paid guided tour'],`Thông báo nêu công việc trong hai ngày và hướng dẫn “${action}”, sau đó khôi phục bình thường. Đây là hướng dẫn tạm thời, không phải chuyển vĩnh viễn, tuyển dụng hay quảng cáo.`,'purpose',[pair('During this period','temporary arrangements','sắp xếp trong một khoảng thời gian ngắn')]),
  q('When will normal arrangements resume?',`${month} ${next}`,[`${month} ${date-1}`,`${month} ${date}`,`${month} ${date+1}`],`Câu cuối nêu rõ “Normal arrangements will resume at 8 A.M. on ${month} ${next}”. Hai ngày trước đó vẫn đang thi công.`),
 ]);
 const [item,fault,replacement,retained]=EMAILS[i];
 add('e-mail',[doc('Customer service reply',para(
  `To: ${t.person}\nFrom: Customer Care\nSubject: Your ${item}\nAttachment: Return label`,
  `Thank you for sending photographs of ${fault} on your ${item}. We have reviewed them and can resolve this issue without asking you to return ${retained}. ${replacement[0].toUpperCase()+replacement.slice(1)} will be dispatched this afternoon at no charge.`,
  `Please send the damaged part back using the attached prepaid label. The package can be left at any parcel collection point, so you will not need to arrange a courier visit. Once the replacement arrives, follow the fitting instructions enclosed in the box. If you would prefer assistance, our service desk can arrange a short video call.`,
  `The original warranty remains valid and its expiry date will not change. Please retain your purchase receipt as proof of the warranty period.`))],[
  q('What will the company provide free of charge?',replacement[0].toUpperCase()+replacement.slice(1),['A complete new product','A longer warranty period','A courier visit to the customer’s home'],`Email hứa gửi “${replacement} … at no charge”. Không thay toàn bộ sản phẩm, không gia hạn bảo hành và không yêu cầu courier tới nhà.`,'detail',[pair('at no charge','free of charge','miễn phí')]),
  q('What is the recipient asked to do?','Return a damaged component',['Return the entire product','Pay for a shipping label','Book an in-person consultation'],`Yêu cầu “send the damaged part back” cùng prepaid label. Email nói giữ lại ${retained}, vì vậy không trả toàn bộ sản phẩm.`,'detail',[pair('damaged part','damaged component','bộ phận bị hỏng')]),
 ]);
 const cost=45+i*3;
 add('advertisement',[doc(`${t.org} — introductory workshop`,para(
  `Discover the basics of ${t.skill} in a practical two-hour session at ${t.venue}. No previous professional experience is necessary. Our instructors will demonstrate essential techniques before participants work through a guided exercise in pairs.`,
  `The fee of $${cost} includes all materials and a downloadable reference guide. A limited number of places are reserved for students, who pay $${cost-10} on presentation of a current student card. The discounted price is not available without that card.`,
  `Register through our website by ${month} ${date}. Payment is required at registration; walk-in registrations cannot be accepted because materials are prepared in advance. Participants should bring a laptop, but specialist software will be provided. A certificate of attendance will be sent by email after the session.`))],[
  q('Who is the workshop intended for?','People new to the subject',['Only licensed specialists','Children attending primary school','Experienced instructors seeking employment'],'“No previous professional experience is necessary” cùng “basics” cho thấy phù hợp người mới. Bài không giới hạn cho chuyên gia hoặc đối tượng khác.','inference',[pair('basics / no previous experience','people new to the subject','dành cho người bắt đầu')]),
  q('What must a student present to receive the discount?','A valid student identification card',['A printed reference guide','A certificate from a previous workshop','A letter from an employer'],'“Current student card” là giấy tờ bắt buộc; tài liệu tham khảo và chứng nhận do khóa cung cấp, không phải điều kiện giảm giá.','detail',[pair('current student card','valid student identification card','thẻ sinh viên còn hiệu lực')]),
  q('What is NOT included in the fee?','Use of a laptop',['Workshop materials','Specialist software','A reference guide'],'Bài yêu cầu tự mang laptop. Materials, reference guide và software đều được cung cấp. Không suy diễn rằng phải mua thêm phần mềm.','negative-detail'),
 ]);
 const [aName,aService,aBuilding,aUsers,aFunding]=ARTICLES[i];
 add('article',[doc(`${aName} opens in ${t.city}`,para(
  `${t.city} residents will soon be able to ${aService} at ${aName}. The organization has converted ${aBuilding} into a bright, accessible facility. The opening is the result of a year-long initiative supported by ${aFunding}.`,
  `The facility is aimed primarily at ${aUsers}. Its director explained that the project responds to a need identified in a public survey, rather than replacing an existing commercial service. Staff will collect feedback during the first three months and adjust the weekly program if necessary.`,
  `An open day is scheduled for ${month} ${next}, with regular appointments beginning the following day. Visitors to the open day do not need a reservation. However, all subsequent sessions must be booked online, since staff numbers will be limited during the initial period.`))],[
  q('What was the building previously used as?',aBuilding[0].toUpperCase()+aBuilding.slice(1),['A hotel conference suite','An outdoor sports pavilion','A private residence'],`Bài nói “converted ${aBuilding}”, xác định công năng cũ. Ba địa điểm khác không được nêu.`),
  q('The word “initiative” is closest in meaning to','project',['instruction','objection','discount'],'Initiative ở đây là dự án cộng đồng kéo dài một năm và được tài trợ. Không phải chỉ dẫn, phản đối hoặc giảm giá.','synonym',[pair('initiative','project','dự án/chương trình được chủ động thực hiện')]),
  q('What is indicated about regular sessions?','They require advance reservations',['They begin on the open day','They are available only to donors','They are held exclusively outdoors'],'“All subsequent sessions must be booked online” = cần đặt trước. Ngày mở cửa tham quan là ngoại lệ; hoạt động thường lệ bắt đầu ngày sau.','detail',[pair('must be booked online','require advance reservations','phải đặt chỗ trước')]),
 ]);
 const [task,place,origin,people]=CHAT_TASKS[i];
 add('text-message chain',[doc('Team messages',para(
  `${t.person} (9:05 A.M.): Have the ${task} reached ${place}? We will need them when the ${people} arrive at ten.`,
  `Alex Chen (9:07 A.M.): I checked just now. They are still in ${origin}, but I can bring them over. There are forty copies, which should be enough for the expected group.`,
  `${t.person} (9:08 A.M.): Thank you. I have to meet the first arrivals outside, so I cannot collect them myself. Please put them beside the sign-in sheets.`,
  `Alex Chen (9:10 A.M.): Leave it with me. I will also check that the signs point to the correct entrance.`,
  `${t.person} (9:12 A.M.): That would help. The last group went to the wrong door. I will text you if we need more copies.`))],[
  q('Why does the first writer contact Alex Chen?',`To ask about the location of the ${task}`,['To cancel the event','To change the arrival time','To request a payment receipt'],`Câu mở đầu hỏi ${task} đã tới ${place} chưa. Không có thông báo hủy hay đổi giờ.`),
  q('At 9:10 A.M., what does Alex Chen mean by “Leave it with me”?','He will take care of the task',['He wants the event to be postponed','He has lost the materials','He will wait for a written contract'],'Alex đã nhận mang tài liệu và sẽ kiểm tra biển chỉ dẫn, nên đây là lời nhận trách nhiệm, không phải yêu cầu hoãn.','intent',[pair('Leave it with me','I will take care of it','để tôi xử lý việc đó')]),
  q('What is suggested about a previous group?','It had difficulty finding the correct entrance',['It arrived after the event ended','It requested additional payment','It brought its own sign-in sheets'],'“The last group went to the wrong door” cho thấy khó tìm lối đúng. Không có thông tin họ đến muộn hay phải trả thêm.','inference'),
 ]);
 const [course,room1,room2,profession]=COURSES[i];
 add('schedule',[doc(`${course} training day`,para(
  `For ${profession}\nLocation: ${t.venue}\nDate: ${month} ${date+3}`,
  'Participants should attend the introductory session before taking either workshop. The two workshops run at the same time, so select one when registering. Lunch is included for everyone. The closing discussion is open to participants from both workshops. Room assignments will not change, even if attendance is lower than expected.'),{
   headers:['Time','Session','Room'],rows:[['9:00–9:45','Introduction','Main'],['10:00–11:30','Workshop: fundamental techniques',room1],['10:00–11:30','Workshop: advanced applications',room2],['11:45–12:30','Lunch','Dining'],['12:45–1:30','Closing discussion','Main']]
  })],[
  q('Where will the advanced workshop take place?',room2,[room1,'Main','Dining'],`Bảng ghi Workshop: advanced applications ở phòng ${room2}, từ 10:00 đến 11:30. Các phòng khác dành cho nội dung khác.`,'table'),
  q('Why can participants attend only one workshop?','Both workshops occur simultaneously',['One workshop has been canceled','Only the main room is accessible','A separate lunch fee is required'],'Hai dòng workshop có cùng giờ 10:00–11:30; văn bản cũng nói “run at the same time”. Không phải vì hủy lớp hay phí ăn.','table-inference',[pair('run at the same time','occur simultaneously','diễn ra đồng thời')]),
  q('What are participants advised to do first?','Attend the introductory session',['Join the closing discussion','Pay for lunch','Move to the dining room'],'Hướng dẫn “attend the introductory session before taking either workshop” xác định bước đầu. Closing/lunch diễn ra sau.','sequence'),
 ]);
 const [ordered,extra,vendor]=ORDERS[i]; const unit=18+i*2, quantity=6+i, freight=12+i;
 add('invoice',[doc(`${vendor} — invoice`,para(
  `Customer: ${t.org}\nInvoice: Y-${2026+i}\nIssued: ${month} ${date}\nPayment due: ${month} ${date+7}`,
  `The ${ordered} have been dispatched; ${extra} are supplied at no additional charge as part of the introductory offer. If any item arrives damaged, notify us within five days of delivery and retain the packaging. Payments should include the invoice number so they can be matched to your account.`),{headers:['Description','Quantity','Unit price','Amount'],rows:[[ordered,String(quantity),`$${unit}`,`$${quantity*unit}`],[extra,'1 set','Included','$0'],['Freight','—','—',`$${freight}`],['Total','—','—',`$${quantity*unit+freight}`]]})],[
  q('What is included at no additional charge?',extra[0].toUpperCase()+extra.slice(1),['Freight','A second order','Insurance for the entire year'],`Invoice ghi ${extra} “Included $0”, và đoạn đầu nói no additional charge. Freight vẫn có phí $${freight}.`,'table'),
  q('What is the total amount payable?',`$${quantity*unit+freight}`,[`$${quantity*unit}`,`$${quantity*unit+freight+unit}`,`$${quantity*unit-freight}`],`${quantity} × $${unit} = $${quantity*unit}; cộng freight $${freight} = $${quantity*unit+freight}. Không tính tiền phần phụ kiện miễn phí.`,'calculation'),
  q('What should the customer do if an item arrives damaged?','Keep the packaging',['Discard the invoice','Return every item immediately','Wait ten days before contacting the vendor'],'Hướng dẫn “retain the packaging” = giữ bao bì; đồng thời báo trong 5 ngày. Không nói phải trả cả đơn hoặc đợi 10 ngày.','detail',[pair('retain','keep','giữ lại')]),
 ]);
 const synonym=pick(i,[['rigorous','thorough','strict and careful'],['versatile','adaptable','suitable for different uses'],['durable','long-lasting','able to withstand regular use'],['compact','small','occupying little space'],['reliable','dependable','working consistently']]);
 add('product review',[doc(`Review: ${t.product}`,para(
  `Posted by Morgan Ellis\nRating: 4 out of 5`,
  `I ordered these ${t.product} for our team after comparing three suppliers. ${t.feature[0].toUpperCase()+t.feature.slice(1)} were the deciding factor: our previous equipment could not be adjusted to suit different users. The setup guide was clear, and we put everything into use within an hour.`,
  `${synonym[0]==='rigorous'?'The manufacturer follows a rigorous testing procedure that identifies even minor faults before daily operation.':`The equipment has proved ${synonym[0]} during our first month of use.`} We have not encountered any defects, and the equipment performs exactly as described in the catalog. I was also impressed by how quickly customer support answered a question about accessories.`,
  `My only criticism concerns the packaging. Each item arrived in a separate oversized box, leaving us with more cardboard than necessary. I have suggested combining items in fewer boxes. I would buy from this supplier again, particularly if that change is made.`))],[
  q('Why did the reviewer choose the products?',`They have ${t.feature}`,['They were the cheapest available option','They included free annual maintenance','They were recommended by an employer'],`Tác giả nói ${t.feature} là “the deciding factor”, không nói giá thấp nhất hay bảo trì miễn phí.`,'purpose'),
  q(`The word “${synonym[0]}” is closest in meaning to`,synonym[1],['decorative','temporary','expensive'],`Trong ngữ cảnh mô tả đặc tính/chất lượng, ${synonym[0]} có nghĩa ${synonym[2]}, tương đương ${synonym[1]}. Các đáp án khác chỉ trang trí, tạm thời hoặc đắt tiền.`,'synonym',[pair(synonym[0],synonym[1],synonym[2])]),
  q('What change does the reviewer recommend?','Reducing the amount of packaging',['Removing the adjustable features','Charging more for accessories','Using a longer setup guide'],'Nhận xét chỉ phàn nàn hộp quá lớn và đề nghị “combining items in fewer boxes”. Không phải thay tính năng hay hướng dẫn.','detail',[pair('fewer boxes','less packaging','giảm bao bì')]),
  q('What is suggested about the reviewer?','They may purchase from the supplier again',['They have returned all the products','They work for the manufacturer','They have never contacted customer support'],'“I would buy from this supplier again” hỗ trợ khả năng mua tiếp. Người viết đã liên hệ support và vẫn dùng sản phẩm.','inference'),
 ]);
 add('instructions',[doc('Booking a shared resource',para(
  `A ${POLICY_ITEMS[i]} may be reserved through the ${t.org} staff portal. Select the date, the length of the booking, and the department responsible for any charges. After submitting the form, you will receive an automatic acknowledgment. This message confirms only that the request has reached us; it does not confirm availability.`,
  `The coordinator checks requests twice daily. If the resource is available, a separate approval message will include a booking code. Bring that code when collecting the resource or accessing the room. Requests are processed in the order received, and staff should avoid making duplicate requests.`,
  'If your plans change, cancel through the same portal at least one day in advance. Doing so allows another department to use the resource. A booking that is canceled on the day of use may still incur a charge, unless the cancellation is caused by a building closure.' ))],[
  q('What does the automatic acknowledgment confirm?','The request has been received',['The booking is approved','No charge will be made','The resource is ready for collection'],'Văn bản nhấn mạnh acknowledgment chỉ xác nhận tiếp nhận, không xác nhận availability hoặc approval.','detail'),
  q('What is required when accessing the reserved resource?','A code from the approval message',['A duplicate application','A printed department directory','An automatic acknowledgment alone'],'“Bring that code” chỉ booking code trong thông báo chấp thuận riêng. Automatic acknowledgment chưa đủ.','sequence'),
  q('Which same-day cancellation may avoid a charge?','One caused by a building closure',['One resulting from a personal scheduling change','One submitted after the resource has been collected','One made by a different department'],'Ngoại lệ được nêu sau unless: building closure. Các thay đổi cá nhân/đổi phòng ban không nằm trong ngoại lệ.','exception'),
 ]);
 const job=t.job;
 add('job posting',[doc(`${t.org} — ${job}`,para(
  `We are seeking a ${job} to join our team in ${t.city}. The successful applicant will organize daily schedules, maintain accurate records, and act as the first point of contact for routine questions. [1]`,
  'At least one year of experience in a customer-facing role is essential. Familiarity with spreadsheet software is desirable, but training will be provided to candidates who meet the experience requirement. [2]',
  'The position is based at our main office and includes one Saturday shift each month. Applicants should email a résumé and a short statement describing a problem they have solved at work. [3]',
  `Interviews will be held at ${t.venue} on ${month} ${date+5}. Shortlisted candidates will receive directions and an interview time by email. [4]`))],[
  q('Which qualification is required?','Experience working directly with customers',['Advanced spreadsheet certification','A university teaching license','Five years of supervisory experience'],'Customer-facing experience ít nhất một năm là essential. Spreadsheet chỉ desirable và có training, không bắt buộc chứng chỉ.','detail',[pair('customer-facing role','working directly with customers','vai trò tiếp xúc khách hàng')]),
  q('What are applicants asked to include with their résumé?','An account of a workplace problem they resolved',['A list of all their previous customers','A copy of their Saturday timetable','A certificate from a training provider'],'Short statement describing a problem solved at work = tường thuật ngắn về vấn đề đã giải quyết. Ba lựa chọn khác không được yêu cầu.','paraphrase'),
  q('At which position does this sentence best belong? “For this reason, applicants without the required work experience will not be considered.”','[2]',['[1]','[3]','[4]'],'Câu này kết luận trực tiếp điều kiện kinh nghiệm và làm rõ training không thay thế kinh nghiệm. Đặt [2], sau đoạn essential/desirable, trước đoạn giờ làm. Các vị trí khác ngắt mạch nhiệm vụ, hồ sơ hoặc lịch phỏng vấn.','sentence-insertion'),
 ]);
 // Double passages, each with cross-document questions.
 const startHour=pick(i,['10 A.M.','11 A.M.','1 P.M.','2 P.M.']);
 const altVenue=pick(i,['Annex Room','Library Room','Garden Room','East Studio']);
 add('notice and e-mail',[
  doc(`${t.event} — attendee notice`,para(
   `The ${t.event} will be held at ${t.venue} on ${month} ${date+6}. The main presentation begins at ${startHour}. Attendees with a standard ticket may attend the main presentation and browse the exhibition afterward. A premium ticket also includes a small-group session in ${altVenue}.`,
   'The small-group session begins one hour after the main presentation ends. Places are limited to twenty. Premium ticket holders who cannot attend that session may request a refund of the difference between the two ticket prices, but the request must arrive before the event. Tickets are personal and cannot be transferred.',
   'Refreshments are available for purchase. There is no charge for bicycle parking, but car parking is managed by a separate operator. Questions about the program should be sent to the event office.')),
  doc('Attendee inquiry',para(`To: Event Office\nFrom: ${t.person}\nDate: ${month} ${date+3}\nSubject: Changing my ticket`,
   `I have a premium ticket for your event and will still attend the main presentation. However, I now need to return to work immediately afterward and will not be able to stay for the additional session. Please change my booking to the standard option and return the price difference.`,
   'I understand that I cannot pass the ticket to a colleague. Please keep the booking in my name and let me know whether a new confirmation email will be issued. I will arrive by bicycle, so I will not need information about the car park. Thank you for helping me adjust the reservation.'))
 ],[
  q('What is included with a standard ticket?','Admission to the main presentation',['A small-group session','Free refreshments','A transferable reservation'],'Thông báo liệt kê main presentation và exhibition cho vé standard; small-group thuộc premium, refreshments phải mua.','detail'),
  q('Why does the email writer request a change?','They must return to work after the presentation',['They will be unable to attend any part of the event','A colleague wants to use their ticket','The event has moved to another city'],'Email nói cần về làm việc ngay sau main presentation; vẫn tham dự phần chính, không chuyển vé cho đồng nghiệp.','purpose'),
  q(`Which location will ${t.person} no longer visit?`,altVenue,[t.venue,'The bicycle parking area','The main entrance'],`Đối chiếu: email bỏ additional session; notice đặt small-group session ở ${altVenue}. Vẫn dự phần chính tại ${t.venue} và đến bằng xe đạp.`,'cross-document',[pair('additional session','small-group session','phiên bổ sung chỉ có trong vé premium')]),
  q('What is the writer entitled to receive?','A partial refund',['A refund of the entire ticket price','A free car parking permit','An extra ticket for a colleague'],'Notice cho hoàn chênh lệch premium–standard nếu yêu cầu trước sự kiện. Email gửi trước và chỉ bỏ phiên phụ, nên là partial refund.','cross-document',[pair('return the price difference','partial refund','hoàn một phần tiền')]),
  q('What is indicated about the tickets?','They cannot be given to another person',['They cover all parking costs','They can be reused on another date','They can only be bought at the venue'],'“Personal and cannot be transferred” được email xác nhận. Không bao gồm mọi phí đỗ xe hoặc ngày khác.','detail'),
 ]);
 const mainPct=82+i, subPct=76+i, improvement=6+i%4;
 add('survey table and report',[
  doc(`${t.org} — service survey`,para(`Reporting period: ${month}\nCollected by: Westline Research`,
   'The table shows the percentage of customers rating each feature as good or excellent. Each customer rated all four features. The survey included 200 responses collected after completed visits; no responses from staff members were included.'),{headers:['Feature','This month','Previous month'],rows:[['Staff assistance',`${mainPct}%`,`${mainPct-improvement}%`],['Waiting time',`${subPct}%`,`${subPct+3}%`],['Booking process',`${68+i}%`,`${62+i}%`],['Overall experience',`${80+i}%`,`${77+i}%`]]}),
  doc('Management response',para(
   `Managers at ${t.org} reviewed the latest customer survey yesterday. They noted that staff assistance recorded the highest satisfaction figure, following the introduction of additional training earlier in the year. The training will continue for new employees.`,
   'The waiting-time score moved in the opposite direction. To address this, the office will trial a second service desk during peak hours for four weeks. No changes to pricing are planned. Managers will compare the next survey with the current results before deciding whether to make the additional desk permanent.',
   'Westline Research will collect the next set of responses using the same questions. Keeping the questions unchanged will make the two surveys easier to compare.'))
 ],[
  q('What does the table summarize?','Customer satisfaction with service features',['Staff performance ratings submitted by managers','The cost of training new employees','The number of bookings canceled each day'],'Chú thích định nghĩa % khách đánh giá good/excellent, lấy sau visits; không phải đánh giá nhân viên của quản lý hay chi phí.','purpose'),
  q('Which feature received the highest score this month?','Staff assistance',['Waiting time','Booking process','Overall experience'],`Staff assistance ${mainPct}% cao hơn waiting ${subPct}%, booking ${68+i}%, overall ${80+i}%. Đây là giá trị lớn nhất trong bốn hàng của bảng.`,'table'),
  q('By how many percentage points did staff assistance improve?',String(improvement),[String(improvement+2),'3','1'],`${mainPct}% − ${mainPct-improvement}% = ${improvement} điểm phần trăm. Đây là hiệu hai tỷ lệ, không phải số phần trăm tăng tương đối.`,'calculation'),
  q('Why will an additional service desk be tested?','A service measure declined',['All survey scores were lower than before','The office raised its prices','Westline Research requested a larger office'],`Đối chiếu bảng waiting time ${subPct+3}% → ${subPct}% (giảm 3 điểm) và report nói trial desk để xử lý waiting-time score. Các điểm khác tăng; giá không đổi.`,'cross-document'),
  q('What will remain unchanged in the next survey?','The questions',['The number of open service desks','The satisfaction percentages','The identity of every respondent'],'Report nêu “using the same questions”. Bài không bảo đảm số % hay người trả lời giữ nguyên.','detail',[pair('same questions','questions remain unchanged','giữ nguyên câu hỏi để so sánh')]),
 ]);
 const days=2+i%3, rate=110+i*10, lodging=days*rate, breakfast=12+i, mealTotal=days*breakfast;
 add('hotel policy, reservation, and e-mail',[
  doc('Parkmere Hotel — booking terms',para(
   'Standard room rates include wireless internet and access to the exercise room. Breakfast is optional and is charged separately for each morning requested. When breakfast is removed before check-in, the full breakfast charge is deducted from the booking.',
   'Guests staying two or more nights may request one complimentary late checkout until 2 P.M. This benefit is subject to availability and must be confirmed by reception. A standard checkout is at 11 A.M. Parking costs $15 per night and is not included in any room rate. Cancellations of the room itself follow a separate policy.')),
  doc('Reservation confirmation',para(`Guest: ${t.person}\nArrival: ${month} ${date}\nDeparture: ${month} ${date+days}\nRoom: Standard\nBreakfast: every morning\nParking: not requested`),{headers:['Item','Quantity','Rate','Total'],rows:[['Room',`${days} nights`,`$${rate}`,`$${lodging}`],['Breakfast',`${days} mornings`,`$${breakfast}`,`$${mealTotal}`],['Booking total','—','—',`$${lodging+mealTotal}`]]}),
  doc('Message to reception',para(`From: ${t.person}\nSent: ${month} ${date-2}\nSubject: Two changes to my reservation`,
   'Please remove all breakfasts from my booking. I will leave early each morning to eat with colleagues at our meeting venue. I still need the same room for the full stay. As my train home departs in the late afternoon, I would also appreciate using the late-checkout benefit if a room is available.',
   'I will travel by train and will not be bringing a car. Please send a revised total for the room and confirm the checkout time separately. If late checkout is unavailable, I can leave my luggage at reception after the normal checkout.'))
 ],[
  q('Which service is included in the standard room rate?','Wireless internet',['Breakfast','Car parking','Guaranteed late checkout'],'Terms ghi wireless internet và exercise room có trong giá; breakfast/parking riêng, late checkout tùy availability.','detail'),
  q(`How long will ${t.person} stay?`,`${days} nights`,[`${days+1} nights`,`${days+2} nights`,'One night'],`Xác nhận ghi ${days} nights; ngày đến ${date} và đi ${date+days} cũng cho chênh ${days} đêm. Ngày trả phòng không tính thêm một đêm lưu trú.`,'table'),
  q('What should the revised booking total be?',`$${lodging}`,[`$${lodging+mealTotal}`,`$${lodging-breakfast}`,`$${lodging+15*days+5}`],`Email trước check-in bỏ toàn bộ breakfasts; policy hoàn toàn bộ meal charge $${mealTotal}. $${lodging+mealTotal} − $${mealTotal} = $${lodging}. Không thêm parking vì không mang xe.`,'cross-document-calculation'),
  q('What can be concluded about the guest’s late-checkout request?','The length of the stay meets the eligibility condition',['It has already been approved','It requires a parking purchase','It changes the arrival date'],`Policy đòi ít nhất 2 đêm; booking ${days} đêm thỏa điều kiện. Nhưng reception chưa xác nhận availability, nên không thể nói đã được duyệt.`,'cross-document-inference',[pair('staying two or more nights','meets the eligibility condition','đủ điều kiện theo số đêm')]),
  q('Why does the guest no longer need breakfast?','They will eat at the meeting venue',['They are canceling the entire stay','Breakfast is no longer served','Their train arrives after breakfast'],'Email nói eat with colleagues at meeting venue; vẫn giữ room full stay. Không có hủy phòng hoặc ngừng phục vụ.','detail'),
 ]);
 const req=15+i, fulfilled=req-3;
 add('catalog, purchase request, and supplier reply',[
  doc(`${vendor} — trade catalog`,para(
   `Our ${ordered} are available in three packages: Standard, Plus, and Custom. Standard packages include the main items only. Plus packages include ${extra}. Custom packages allow buyers to specify different colors, but they take three weeks to produce.`,
   'Standard and Plus orders normally ship within two working days if stock is available. Customers placing an order for ten or more main items receive free delivery. Smaller orders incur a $20 delivery fee. An invoice is issued when the order is dispatched; payment is due within fourteen days.',
   'Customers may accept a partial shipment without paying extra delivery charges when an order qualifies for free delivery. Remaining items are sent as soon as new stock arrives.')),
  doc('Purchase request',para(`From: ${t.person}, ${t.org}\nTo: ${vendor}\nDate: ${month} ${date}\nSubject: Plus package order`,
   `Please supply ${req} ${ordered} in the Plus package. We need the included ${extra} for our upcoming project. Standard colors are suitable, and we do not need a Custom package.`,
   `Our project starts on ${month} ${date+5}, so please send whatever is available immediately. The remaining items can follow later. Please confirm the quantities in the first shipment and the delivery charge before dispatch.`)),
  doc('Supplier response',para(`To: ${t.person}\nDate: ${month} ${date+1}\nSubject: RE: Plus package order`,
   `Thank you for your order. We currently have ${fulfilled} main items in the requested package, and these will leave our warehouse tomorrow. The remaining three items are due from our production team on ${month} ${date+7}; we will ship them as soon as they arrive.`,
   `Your order qualifies for the catalog’s free-delivery arrangement, including the later shipment. The first invoice will cover only the items dispatched. The second invoice will be sent with the remaining items, using the same agreed unit price. Please let us know if the later arrival will cause a problem.`))
 ],[
  q('What does the Plus package include?',extra[0].toUpperCase()+extra.slice(1),['A three-week production delay','A selection of custom colors','An extended payment period'],`Catalog: Plus includes ${extra}; Custom mới chọn colors và chờ 3 tuần. Terms payment như nhau.`,`detail`),
  q('What is the buyer willing to accept?','Separate deliveries',['A different product category','A higher unit price','A Custom package instead'],`Request nói “send whatever is available immediately” và “remaining items can follow later” = chấp nhận nhiều lần giao. Không chấp nhận tăng giá hay đổi package.`,'paraphrase',[pair('remaining items can follow later','separate deliveries','giao thành nhiều đợt')]),
  q('How many main items will be in the first shipment?',String(fulfilled),[String(req),'3',String(req+3)],`Reply xác nhận ${fulfilled} sẵn và gửi ngày mai; 3 còn lại đến ${month} ${date+7}. Không dùng tổng ${req} làm lượng đợt đầu.`,'cross-document'),
  q('Why will delivery be free?','The total order meets the minimum quantity',['The buyer selected custom colors','The project begins before the final shipment','Only three items are being ordered'],`Catalog miễn phí cho ≥10 main items; request ${req} items, dù chia ${fulfilled}+3 vẫn là cùng order. Chính sách nêu miễn thêm phí partial shipment.`,'cross-document-inference'),
  q('What is indicated about the final three items?','They will arrive after the project begins',['They are no longer being manufactured','They will cost more per item','They will be delivered before the first invoice'],`Project starts ${month} ${date+5}; stock cho 3 items chỉ đến ${month} ${date+7}, rồi mới ship. Vì vậy sẽ tới sau khi dự án bắt đầu. Giá unit vẫn giữ nguyên.`,'cross-document-inference'),
 ]);
 const first=pick(i,['9:00 A.M.','9:30 A.M.','10:00 A.M.']), second=pick(i,['11:00 A.M.','11:30 A.M.','12:00 P.M.']);
 add('training notice, schedule, and e-mail',[
  doc('New employee orientation',para(
   `All new ${t.org} employees must complete both the safety briefing and the practical session for ${t.course}. The safety briefing must be completed first. Employees who attended last month’s safety briefing may go directly to the practical session, provided they bring their attendance certificate.`,
   'Each session lasts one hour. The practical session is offered twice, with the same instructor and content. Employees should attend only one practical session. If an employee misses the safety briefing without having a valid certificate, they must take the next available briefing before joining any practical session.',
   `The following schedule applies to ${month} ${date+8}. Attendance must be confirmed with the training office in advance. The office will assign seats, and refreshments will be available during the break.`)),
  doc(`${t.course} — daily schedule`, 'All sessions take place at the main training center.',{headers:['Time','Session','Instructor','Room'],rows:[[first,'Safety briefing','Robin Hale','101'],[second,'Practical session','Casey Wu','203'],['2:00 P.M.','Practical session','Casey Wu','203'],['3:30 P.M.','Optional questions','Robin Hale','101']]}),
  doc('Email from a new employee',para(`From: ${t.person}\nTo: Training Office\nSubject: My orientation attendance`,
   `I attended the safety briefing last month and have kept my certificate. I will bring it with me. On ${month} ${date+8}, I have a client appointment from 10:30 A.M. until 1 P.M., so I cannot attend the first practical session. Please reserve a seat for me in the later one.`,
   'I do not need to attend the optional question period, as my supervisor has already answered my questions about the safety procedures. Please confirm the name of the practical-session instructor and the room number. I will go directly there after the client appointment.'))
 ],[
  q('What must normally be completed before a practical session?','A safety briefing',['An optional question period','A client appointment','A software examination'],'Notice nói safety briefing must be completed first. Optional questions không phải điều kiện.','sequence'),
  q('Why can the email writer go directly to the practical session?','They have proof of earlier safety training',['They are the session instructor','They have booked a client appointment','They will skip all required training'],'Email đã dự briefing tháng trước và giữ certificate; notice cho miễn học lại nếu mang attendance certificate.','cross-document',[pair('attendance certificate','proof of earlier training','chứng nhận đã học trước')]),
  q('At what time will the writer attend the practical session?','2:00 P.M.',[first,second,'3:30 P.M.'],`Email không dự first practical vì appointment 10:30–1 P.M.; schedule later practical là 2:00 P.M. Optional 3:30 không phải practical.`,'cross-document'),
  q('Who will lead the writer’s practical session?','Casey Wu',['Robin Hale',t.person,'The employee’s supervisor'],'Schedule ghi cả hai practical do Casey Wu; chọn phiên 2 P.M. không đổi instructor. Robin Hale phụ trách briefing/questions.','cross-document'),
  q('What is indicated about the two practical sessions?','They cover identical material',['They take place in different buildings','Both are required for every employee','Only the first has an instructor'],'Notice nói “same instructor and content” và attend only one; bảng đều room 203.','paraphrase',[pair('same content','identical material','cùng nội dung')]),
 ]);
 if(i%2===1) {
  groups[12]=rentalDocuments(t,i,month,date);
  groups[13]=recruitmentDocuments(t,i,month,date);
  groups[14]=eventChangeDocuments(t,i,month,date);
 }
 return groups;
}
