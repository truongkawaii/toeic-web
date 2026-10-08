// Curated meanings only. Unknown words are not assigned invented translations.
const WORDS: Record<string, string> = {
  'attach': 'gắn, đính kèm', 'attaching': 'gắn, đính kèm', 'label': 'nhãn', 'carton': 'thùng bìa', 'parcel': 'bưu kiện', 'scale': 'cân', 'drawer': 'ngăn kéo', 'scissors': 'kéo',
  'appointment': 'cuộc hẹn', 'appointments': 'các cuộc hẹn', 'schedule': 'lịch trình', 'scheduled': 'được lên lịch', 'reschedule': 'đổi lịch', 'available': 'có sẵn; có thời gian', 'confirm': 'xác nhận', 'confirmation': 'sự xác nhận',
  'shipment': 'lô hàng', 'delivery': 'việc giao hàng', 'supplier': 'nhà cung cấp', 'order': 'đơn hàng; đặt hàng', 'invoice': 'hóa đơn', 'receipt': 'biên lai', 'refund': 'hoàn tiền', 'warehouse': 'kho hàng', 'inventory': 'hàng tồn kho', 'dispatch': 'gửi hàng đi',
  'contract': 'hợp đồng', 'renewal': 'việc gia hạn', 'deadline': 'hạn chót', 'proposal': 'đề xuất', 'estimate': 'ước tính; báo giá', 'budget': 'ngân sách', 'approval': 'sự phê duyệt', 'approve': 'phê duyệt', 'request': 'yêu cầu',
  'maintenance': 'bảo trì', 'repair': 'sửa chữa', 'equipment': 'thiết bị', 'installation': 'việc lắp đặt', 'inspection': 'sự kiểm tra', 'technician': 'kỹ thuật viên', 'replacement': 'vật thay thế; việc thay thế',
  'conference': 'hội nghị', 'registration': 'việc đăng ký', 'register': 'đăng ký', 'venue': 'địa điểm tổ chức', 'session': 'buổi; phiên', 'workshop': 'buổi thực hành; hội thảo', 'attend': 'tham dự', 'postponed': 'bị hoãn', 'announcement': 'thông báo',
  'reservation': 'việc đặt chỗ', 'accommodation': 'chỗ ở', 'departure': 'sự khởi hành', 'destination': 'điểm đến', 'itinerary': 'lịch trình chuyến đi', 'passenger': 'hành khách', 'platform': 'sân ga; nền tảng',
  'employee': 'nhân viên', 'colleague': 'đồng nghiệp', 'applicant': 'ứng viên', 'position': 'vị trí; chức vụ', 'training': 'đào tạo', 'orientation': 'buổi hướng dẫn ban đầu', 'branch': 'chi nhánh', 'headquarters': 'trụ sở chính',
  'brochure': 'tờ giới thiệu', 'discount': 'giảm giá', 'promotion': 'khuyến mãi; thăng chức', 'purchase': 'mua; giao dịch mua', 'customer': 'khách hàng', 'client': 'khách hàng', 'feedback': 'ý kiến phản hồi', 'survey': 'khảo sát',
};
export function vocabularyFor(text: string) {
  const lower = text.toLowerCase();
  return Object.entries(WORDS).filter(([word]) => new RegExp(`\\b${word}\\b`).test(lower)).map(([word, meaning]) => ({word, meaning}));
}
