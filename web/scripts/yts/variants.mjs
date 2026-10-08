// Alternative multi-document tasks so the ten tests do not all use one hotel,
// purchase-order and orientation storyline. Facts must be joined across sources.
const doc=(heading,...content)=>({heading,content:content.join('\n\n')});
const q=(stem,answer,distractors,explanation,skill='cross-document',paraphrases=[])=>({stem,answer,distractors,explanation,skill,paraphrases});
const pair=(source,target,meaning)=>({source,target,meaning});
export function rentalDocuments(t,i,month,date) {
 const days=2+i%3, rate=35+i*5, deposit=80+i*10, booking=days*rate+deposit;
 return {kind:'rental policy, booking, and e-mail',documents:[
  doc('Northline Equipment Rental — terms',
   'Rental fees are charged per calendar day, including the day of collection. The invoice also includes a refundable security deposit. The full deposit is returned when the equipment passes its return inspection. Missing accessories may result in a deduction from the deposit.',
   'Bookings can be shortened before collection. In that case, the daily fees for canceled days are removed, but the security deposit remains unchanged. An extension requested after collection depends on availability. Delivery is optional and costs $25 each way; customers collecting and returning equipment themselves do not pay delivery fees.',
   'The office opens at 8 A.M. Collection after 4 P.M. must be arranged at least one day beforehand. Late collections do not reduce the fee for that day.'),
  {heading:'Booking confirmation',content:`Customer: ${t.person}, ${t.org}\nEquipment: Portable presentation set\nRental period: ${days} days, starting ${month} ${date}\nCollection and return: customer\nAccessories: power cable and remote`,table:{headers:['Item','Amount'],rows:[['Daily rental fees',`$${days*rate}`],['Daily rate',`$${rate}`],['Security deposit',`$${deposit}`],['Amount invoiced',`$${booking}`]]}},
  doc('Customer email',`To: Northline Equipment Rental\nFrom: ${t.person}\nSent: ${month} ${date-2}\nSubject: Shorter rental period`,
   `Our presentation schedule has been shortened, so we will need the equipment for only ${days-1} days. Please remove the final rental day and send an amended invoice. We will collect and return everything ourselves as originally planned.`,
   'I may not reach your office until 4:30 P.M. on the collection day because of another appointment. Please confirm that someone can hand over the equipment then. The remote will be important for our presentation, so please make sure it is packed with the power cable. We will return both accessories with the equipment.'),
 ],questions:[
  q('What is the purpose of the security deposit?','To cover possible loss or damage',['To pay for an extra rental day','To guarantee a delivery time','To purchase the equipment permanently'],'Terms nói hoàn deposit sau inspection và có thể trừ nếu thiếu accessories. Vì vậy deposit bảo đảm tình trạng/số lượng thiết bị, không phải khoản mua đứt hoặc phí giao.','inference'),
  q('How will the equipment reach the customer?','It will be collected by the customer',['It will be delivered by the supplier','It will be sent to the customer’s home','It will be installed by a technician'],'Booking ghi customer collection; email giữ nguyên “collect and return everything ourselves”. Không cần delivery hay lắp đặt.','detail'),
  q('What should the amended invoice total be?',`$${booking-rate}`,[`$${booking}`,`$${booking-rate-deposit}`,`$${booking-rate+25}`],`Bỏ một ngày = trừ $${rate}; deposit $${deposit} không đổi. $${booking} − $${rate} = $${booking-rate}. Tự lấy/trả nên không thêm $25 giao hàng.`,'cross-document-calculation'),
  q('What additional arrangement does the customer request?','Collection after the normal pickup deadline',['Delivery on the following morning','A waiver of the security deposit','An extension after collection'],'Email muốn lấy lúc 4:30 P.M.; terms yêu cầu arrange trước ít nhất một ngày nếu sau 4 P.M. Email gửi hai ngày trước nên là yêu cầu lấy muộn, không phải gia hạn thuê.','cross-document',[pair('reach your office at 4:30 P.M.','collection after the normal pickup deadline','lấy thiết bị sau mốc 4 giờ')]),
  q('What must the customer do to receive the full deposit back?','Return the equipment and all accessories in acceptable condition',['Purchase the remote separately','Keep the equipment for one additional day','Request home delivery'],'Terms hoàn deposit khi pass inspection, missing accessories có thể bị trừ. Booking/email chỉ rõ remote và cable đều phải trả.','cross-document'),
 ]};
}

export function recruitmentDocuments(t,i,month,date) {
 const hours=20+i, cutoff=date+4;
 return {kind:'job advertisement, application summary, and e-mail',documents:[
  doc(`${t.org} — temporary project assistant`,
   `A temporary assistant is needed for a six-week project involving ${t.project}. The post is for ${hours} hours per week, with some hours on Saturday. Applicants must have at least one year of administrative experience and must be available for the whole six-week period.`,
   'Spreadsheet experience is an advantage but not essential. Shortlisted applicants will complete a brief practical task at the interview; this task is intended to identify training needs, not to replace the experience requirement. Applicants who are unavailable on Saturdays should state this clearly.',
   `Applications close on ${month} ${cutoff}. Interviews will be held the following week. Only applicants meeting both essential requirements will be contacted. The position may be extended if further work is approved, but no extension is guaranteed.`),
  {heading:'Applications received',content:'Prepared by the recruitment coordinator. All experience listed is administrative experience.',table:{headers:['Applicant','Experience','Six-week availability','Saturday availability'],rows:[['Riley West','2 years','Full period','Yes'],['Jordan Moss','6 months','Full period','Yes'],['Taylor Vale','3 years','First 4 weeks only','Yes'],['Cameron Lake','18 months','Full period','No']]}},
  doc('Recruitment coordinator’s email',`To: Project Manager\nFrom: ${t.person}\nDate: ${month} ${cutoff+1}\nSubject: Interview selection`,
   'I have reviewed the four applications in the attached summary. Two applicants meet both essential requirements. However, the project supervisor has now confirmed that Saturday work cannot be reassigned to another employee, so only one of those two can be scheduled for interview.',
   'Please send that applicant an invitation and include the practical-task instructions. The other applicant who meets the essential experience and duration requirements should be informed that the Saturday arrangement prevents us from proceeding. The remaining two should receive standard rejection messages. We should not promise an extension beyond the advertised six weeks.'),
 ],questions:[
  q('How long is the position initially expected to last?','Six weeks',['Four weeks','One year','Until the end of the calendar year'],'Advertisement nói six-week project; extension chỉ là khả năng nếu được duyệt, chưa cam kết.','detail'),
  q('What is the practical task intended to determine?','What training an applicant may need',['Whether experience can be waived','How many hours the applicant will work','Whether the project should be canceled'],'Quảng cáo nói identify training needs và không thay thế experience requirement. Đây không phải phương thức miễn yêu cầu kinh nghiệm.','paraphrase',[pair('identify training needs','determine what training may be needed','xác định nhu cầu đào tạo')]),
  q('Who will be invited to interview?','Riley West',['Jordan Moss','Taylor Vale','Cameron Lake'],'Riley có 2 years, full period và Saturday yes. Jordan thiếu 1 năm; Taylor chỉ có 4 tuần; Cameron không làm Saturday, bị email loại sau cập nhật.','cross-document-inference'),
  q('Why will Cameron Lake not proceed to interview?','A required workday is unavailable',['Their experience is too short','They cannot work the full six weeks','They failed a practical task'],'Bảng Cameron đủ 18 tháng và full period nhưng Saturday No. Email xác nhận không thể đổi Saturday cho người khác. Không có kết quả practical task.','cross-document'),
  q('What should NOT be promised to the selected applicant?','Employment beyond the initial project',['Instructions for the interview task','Work during the six-week project','An invitation to interview'],'Advertisement nói extension not guaranteed; email nhắc không hứa quá six weeks. Các điều còn lại là hành động đã được chỉ đạo.','negative-detail'),
 ]};
}

export function eventChangeDocuments(t,i,month,date) {
 const originalRoom='Main Auditorium', newRoom='East Conference Room', smaller=40+i*2;
 return {kind:'event announcement, room schedule, and e-mail',documents:[
  doc(`${t.org} — project briefing`,
   `A briefing about ${t.project} is planned for ${month} ${date+7}, from 2 P.M. to 3 P.M. The original announcement placed it in the ${originalRoom}. Attendance is optional, but staff wishing to join should register with the project office so an appropriate room can be arranged.`,
   `The presentation will be recorded for colleagues who cannot attend. The recording will be available on the staff portal the following morning. The speaker will answer questions during the final fifteen minutes. No refreshments will be provided, and visitors from outside the organization must be accompanied by a member of staff.`),
  {heading:`Room availability — ${month} ${date+7}`,content:'Rooms may be booked only when they are free for the entire requested period. Capacities include presenters.',table:{headers:['Room','Capacity','Unavailable periods'],rows:[[originalRoom,'100','1:00–4:00 P.M.'],[newRoom,String(smaller),'9:00–11:00 A.M.'],['West Meeting Room','20','None'],['Garden Room','60','2:30–5:00 P.M.']]}},
  doc('Project office email',`To: Registered attendees\nFrom: ${t.person}\nDate: ${month} ${date+5}\nSubject: Room change for the briefing`,
   `There are ${smaller-2} registered attendees, plus the speaker and one assistant. A last-minute building repair makes the originally announced room unavailable. I have checked the attached room schedule and booked the only alternative that is free for the full hour and can hold everyone.`,
   'The date and start time remain as announced. Please tell any colleagues who kept the original invitation that the room has changed. The recording arrangements also remain unchanged. Staff unable to attend should use the portal rather than request another live presentation, as the speaker will be leaving immediately after the briefing.'),
 ],questions:[
  q('What is the purpose of the briefing?','To explain a planned project',['To conduct mandatory safety certification','To interview an outside visitor','To introduce a new refreshments supplier'],`Announcement nêu briefing about ${t.project}. Attendance optional, không phải mandatory certification.`,`purpose`),
  q('Why is a room change necessary?','Building repairs affect the original room',['The speaker has changed the date','Staff have requested refreshments','The event will last longer than expected'],'Email nói last-minute building repair làm room cũ unavailable; date/starttime giữ nguyên.','detail'),
  q('Where will the briefing now take place?',newRoom,[originalRoom,'West Meeting Room','Garden Room'],`Có ${smaller-2}+2=${smaller} người. East room đủ ${smaller} và chỉ bận buổi sáng. West chỉ 20 người; Garden bận từ 2:30 nên không trọn 2–3 P.M.; Main unavailable 1–4 P.M.`,'cross-document-inference'),
  q('When can employees first watch the recording?',`The morning of ${month} ${date+8}`,[`The morning of ${month} ${date+7}`,`The afternoon of ${month} ${date+5}`,'Only after requesting another presentation'],`Announcement hứa following morning; briefing ${month} ${date+7}; email giữ recording arrangements. Vậy sáng ${date+8}, không phải trước sự kiện.`,'cross-document'),
  q('What are registered attendees asked to do?','Inform colleagues about the revised location',['Request a second live presentation','Bring their own recording equipment','Pay for refreshments in advance'],'Email yêu cầu tell colleagues giữ invitation cũ rằng room đổi. Người vắng dùng portal, không yêu cầu thêm live session.','paraphrase',[pair('tell colleagues that the room has changed','inform colleagues about the revised location','thông báo địa điểm mới')]),
 ]};
}
