import type { WritingPart } from "./writing";

export type WritingExercise = {prompt: string; answer: string; explanation: string};
export const WRITING_TRANSLATIONS: Record<WritingPart, WritingExercise[]> = {
  picture: [],
  email: [
    {prompt: "Cảm ơn anh/chị đã xác nhận địa chỉ giao hàng.", answer: "Thank you for confirming the delivery address.", explanation: "Thank you for + V-ing."},
    {prompt: "Chúng tôi khuyên anh/chị nên giữ biên lai.", answer: "We recommend keeping the receipt.", explanation: "Recommend + V-ing; cũng có thể dùng recommend that you keep."},
    {prompt: "Nếu linh kiện không đến vào thứ Sáu, chúng tôi sẽ kiểm tra kiện hàng.", answer: "If the parts do not arrive on Friday, we will check the shipment.", explanation: "Mệnh đề if dùng hiện tại; mệnh đề chính dùng will + V."},
    {prompt: "Anh/chị có thể cho tôi biết buổi đào tạo bắt đầu lúc mấy giờ không?", answer: "Could you tell me what time the training session begins?", explanation: "Câu hỏi gián tiếp: what time + S + V, không đảo ngữ."},
    {prompt: "Tôi mong nhận được thư xác nhận của anh/chị.", answer: "I look forward to receiving your confirmation.", explanation: "To trong look forward to là giới từ; theo sau bằng V-ing."},
  ],
  essay: [
    {prompt: "Theo tôi, cần kiểm tra lịch học trước khi đăng ký khóa đào tạo.", answer: "In my opinion, it is important to check the schedule before enrolling in a training course.", explanation: "It is important to V; before + V-ing."},
    {prompt: "Khi nói đến chọn việc, tôi coi trọng người quản lý hỗ trợ nhân viên.", answer: "When it comes to choosing a job, I value a supervisor who supports employees.", explanation: "When it comes to + V-ing; who + động từ bổ nghĩa supervisor."},
    {prompt: "Một người hướng dẫn hiểu công việc có thể giải thích những tình huống khó.", answer: "A mentor who understands the job can explain difficult situations.", explanation: "Who understands là mệnh đề quan hệ; sau can dùng V nguyên mẫu."},
    {prompt: "Nhờ hành trình ngắn hơn, tôi có thể dành nhiều thời gian hơn cho gia đình.", answer: "Because of the shorter commute, I could spend more time with my family.", explanation: "Because of + cụm danh từ, không dùng trực tiếp với mệnh đề."},
    {prompt: "Mặc dù căn hộ nhỏ hơn, nó sẽ giúp tôi duy trì lịch sinh hoạt ổn định.", answer: "Although the apartment is smaller, it would help me maintain a stable routine.", explanation: "Although + mệnh đề; không thêm but trước mệnh đề chính."},
    {prompt: "Nếu nhóm đã thử biểu mẫu, họ đã nhận ra lỗi đó.", answer: "If the team had tested the form, it would have noticed the error.", explanation: "Điều kiện trái quá khứ: if + had V3, would have V3."},
  ],
};
export const WRITING_GAPS: Record<WritingPart, WritingExercise[]> = {
  picture: [],
  email: [
    {prompt: "We apologize for ___ (send) an incomplete kit.", answer: "sending", explanation: "Sau giới từ for dùng V-ing."},
    {prompt: "Please make sure that the package ___ (be) sealed.", answer: "is", explanation: "The package là số ít; is sealed diễn tả trạng thái."},
    {prompt: "If the fault ___ (continue), we will arrange an inspection.", answer: "continues", explanation: "Mệnh đề điều kiện dùng hiện tại, chủ ngữ số ít."},
    {prompt: "Could you please ___ (provide) the serial number?", answer: "provide", explanation: "Sau could dùng động từ nguyên mẫu."},
    {prompt: "We recommend ___ (check) the save location.", answer: "checking", explanation: "Recommend + V-ing."},
    {prompt: "Could you tell me when the replacement ___ (arrive)? (Tương lai)", answer: "will arrive", explanation: "Câu hỏi gián tiếp có trật tự S + will + V."},
    {prompt: "I look forward to ___ (hear) from you.", answer: "hearing", explanation: "Look forward to + V-ing."},
    {prompt: "The delay was caused by ___ (close) the access road.", answer: "closing", explanation: "By là giới từ nên dùng V-ing."},
  ],
  essay: [
    {prompt: "A shorter commute ___ (enable) me to exercise before dinner.", answer: "enables", explanation: "Chủ ngữ số ít + enables + O + to V."},
    {prompt: "Clear instructions prevent visitors ___ joining the wrong queue.", answer: "from", explanation: "Prevent + O + from V-ing."},
    {prompt: "___ (Mặc dù) the office is attractive, I would prioritize a supportive supervisor.", answer: "Although", explanation: "Although + mệnh đề để nhượng bộ."},
    {prompt: "Manuals are convenient; ___ (tuy nhiên), they cannot respond to every question.", answer: "however", explanation: "However là trạng từ liên kết; dùng dấu chấm/phẩy đúng vị trí."},
    {prompt: "___ (Nhờ) the revised schedule, the team had time to practice.", answer: "Because of", explanation: "Because of + cụm danh từ."},
    {prompt: "A course ___ (đại từ quan hệ) includes practical tasks is easier to apply at work. Dùng that.", answer: "that", explanation: "That mở mệnh đề bổ nghĩa cho course."},
    {prompt: "If the team ___ (test) the form, it would have noticed the missing field.", answer: "had tested", explanation: "Giả định trái quá khứ: if + had V3."},
    {prompt: "Employers should consider ___ (take) staff suggestions seriously.", answer: "taking", explanation: "Consider + V-ing."},
    {prompt: "For me, free time is more valuable ___ extra storage space.", answer: "than", explanation: "So sánh hơn: more ... than."},
  ],
};
export const WRITING_ERRORS: Record<WritingPart, WritingExercise[]> = {
  picture: [],
  email: [
    {prompt: "Thank you for contact our office.", answer: "Thank you for contacting our office.", explanation: "For + V-ing."},
    {prompt: "Could you tell me where is the receipt?", answer: "Could you tell me where the receipt is?", explanation: "Câu hỏi gián tiếp không đảo động từ be."},
    {prompt: "If you will send the receipt, we will check the warranty.", answer: "If you send the receipt, we will check the warranty.", explanation: "Điều kiện tương lai thông thường dùng hiện tại trong mệnh đề if."},
    {prompt: "We recommend you to restart the device.", answer: "We recommend that you restart the device.", explanation: "Dùng recommend that + S + V hoặc recommend restarting."},
  ],
  essay: [
    {prompt: "Last year, i joined a training program.", answer: "Last year, I joined a training program.", explanation: "Đại từ I luôn viết hoa."},
    {prompt: "I joined a two-weeks training program.", answer: "I joined a two-week training program.", explanation: "Tính từ ghép số + đơn vị dùng danh từ số ít: two-week."},
    {prompt: "The sessions gave us useful informations.", answer: "The sessions gave us useful information.", explanation: "Information là danh từ không đếm được."},
    {prompt: "However we did not have enough time to practice.", answer: "However, we did not have enough time to practice.", explanation: "Dùng dấu phẩy sau however đầu câu."},
    {prompt: "I realized that practical exercises important for remembering the procedures.", answer: "I realized that practical exercises were important for remembering the procedures.", explanation: "Mệnh đề cần động từ be; ngữ cảnh quá khứ dùng were."},
  ],
};
