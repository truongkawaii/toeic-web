"""Authoring source: 170 additional, independently specified scenes (no images)."""
from pathlib import Path
import json

GROUPS = {
    "N + V": "Dùng danh từ làm chủ thể/tân ngữ và chia động từ theo hành động đang thấy; câu phải có động từ chính.",
    "V + Conj": "Liên từ nối hai hành động hoặc mệnh đề; while diễn tả đồng thời, and thêm hành động, but nêu tương phản.",
    "N + Prep": "Giới từ diễn tả vị trí có trong cảnh; không tự thêm chuyển động hoặc mục đích.",
    "N + N": "Liên kết hai danh từ bằng động từ phù hợp; danh từ đếm được số ít cần từ hạn định.",
    "N + Conj": "Giữ danh từ gợi ý, dùng liên từ để nối các chi tiết quan sát được thành một câu hoàn chỉnh.",
    "Adj + N": "Tính từ bổ nghĩa danh từ hoặc theo sau be; kiểm tra a/an theo âm của từ đứng ngay sau mạo từ.",
    "Quant + N": "Chọn danh từ đếm được phù hợp từ chỉ lượng và chia động từ theo danh từ trung tâm.",
    "V + Prep": "Dùng động từ và giới từ thành kết hợp tự nhiên; sau giới từ có danh từ/cụm danh từ.",
    "Adv + V": "Trạng từ bổ nghĩa hành động hoặc vị trí có thể xác nhận, không suy ra tốc độ từ cảnh tĩnh.",
    "Adv + N": "Cặp gợi ý không phải trật tự toàn câu: trạng từ bổ nghĩa vị trí/hành động, danh từ giữ vai trò chủ thể/tân ngữ.",
    "V + V": "Động từ chính ở hiện tại tiếp diễn; động từ thứ hai dùng to V hoặc V-ing phù hợp cấu trúc.",
    "V + how/to": "Sau how to/to dùng động từ nguyên mẫu. Chỉ nêu thao tác hướng dẫn hoặc mục đích được mô tả rõ.",
    "Det + V": "Từ hạn định đi với danh từ; each/every + danh từ số ít, both + danh từ số nhiều.",
    "Adj + Conj": "Đưa tính từ vào cụm danh từ hoặc vị ngữ; liên từ nối các mệnh đề có quan hệ rõ.",
    "Adv + Conj": "Trạng từ mô tả hành động/vị trí, liên từ nối hai chi tiết của cùng một cảnh.",
}
DATA = """
@N + V
Một người đang dán nhãn lên kiện hàng|label / attach|A person is attaching a label to a package.
Một kỹ thuật viên đang kiểm tra máy tính xách tay|technician / inspect|A technician is inspecting a laptop.
Một người làm vườn đang tưới cây trong chậu|plant / water|A gardener is watering a plant in a pot.
Một người đang đẩy xe đẩy dọc hành lang|cart / push|A person is pushing a cart along a corridor.
Một người phụ nữ đang gấp khăn trên bàn|towel / fold|A woman is folding a towel on a table.
Một khách hàng đang chọn táo từ quầy hàng|customer / select|A customer is selecting apples from a display.
Một người đang lau cửa sổ bằng khăn|window / wipe|A person is wiping a window with a cloth.
Một nhân viên đang sắp sách lên kệ|book / arrange|An employee is arranging books on a shelf.
Một công nhân đang đo tấm gỗ|board / measure|A worker is measuring a wooden board.
Một phụ nữ đang chụp bức tượng|statue / photograph|A woman is photographing a statue.
Một người đang trải thảm trên sàn|rug / spread|A person is spreading a rug on the floor.
Một nhân viên đang quét sàn nhà|employee / sweep|An employee is sweeping the floor.
Một nam giới đang cài dây đeo mũ bảo hiểm|helmet / fasten|A man is fastening the strap of his helmet.
Một người đang dựng biển báo ở lối vào|sign / set|A person is setting up a sign at the entrance.
Một người phụ nữ đang cắt miếng vải bằng kéo|fabric / cut|A woman is cutting fabric with scissors.
Một nhân viên đang gõ dữ liệu vào máy tính|data / enter|An employee is entering data into a computer.
Một công nhân đang nâng thùng lên xe đẩy|crate / lift|A worker is lifting a crate onto a cart.
Một hành khách đang kéo vali qua sảnh|suitcase / pull|A passenger is pulling a suitcase through the lobby.
Một người đang đào đất cạnh luống hoa|soil / dig|A person is digging the soil beside a flower bed.
Một người phụ nữ đang buộc dây giày|shoelace / tie|A woman is tying her shoelaces.
Một nhân viên đang đưa thực đơn cho khách|menu / hand|An employee is handing a menu to a customer.
Một người đang đóng nắp hộp dụng cụ|lid / close|A person is closing the lid of a toolbox.
Một công nhân đang lắp một tấm kính vào khung|panel / install|A worker is installing a glass panel in a frame.
Một người đang xếp đĩa vào máy rửa bát|dish / load|A person is loading dishes into a dishwasher.
Một phụ nữ đang kiểm tra lịch trên điện thoại|schedule / check|A woman is checking a schedule on her phone.
Một người đang rắc hạt lên mặt đất|seed / scatter|A person is scattering seeds on the ground.
Một nhân viên đang cân một kiện hàng|package / weigh|An employee is weighing a package.
Một người đang cuộn dây điện trên sàn|cable / coil|A person is coiling a cable on the floor.
Một nam giới đang sơn hàng rào|fence / paint|A man is painting a fence.
Một phụ nữ đang lật trang sách|page / turn|A woman is turning a page in a book.
Một người đang bơm lốp xe đạp|tire / inflate|A person is inflating a bicycle tire.
Một nhân viên đang đặt hoa vào bình|flower / put|An employee is putting flowers in a vase.
Một người đang rót nước vào bình tưới|water / pour|A person is pouring water into a watering can.
Một công nhân đang trải bản vẽ trên bàn|drawing / unroll|A worker is unrolling a drawing on a table.
@V + Conj
Một người đang nấu ăn trong khi người khác rửa bát|cook / while|One person is cooking while another is washing dishes.
Một công nhân đang cưa gỗ và người khác đang giữ tấm gỗ|saw / and|A worker is sawing a board, and another is holding it.
Một nam giới đang đọc báo nhưng người phụ nữ cạnh đó đang nhìn điện thoại|read / but|A man is reading a newspaper, but the woman beside him is looking at her phone.
Một người đang đẩy cửa mở trong khi người khác mang hộp đi qua|push / while|A person is pushing the door open while another carries a box through it.
Một nhân viên đang quét mã hàng và đặt sản phẩm vào túi|scan / and|An employee is scanning an item and placing it in a bag.
Một phụ nữ đang viết lên bảng trong khi những người khác nhìn bảng|write / while|A woman is writing on a board while other people look at it.
Một người đang ngồi nhưng người bên cạnh đang đứng|sit / but|One person is sitting, but the person beside him is standing.
Một nam giới đang mở vali và lấy áo khoác ra|open / and|A man is opening a suitcase and taking out a jacket.
Một người đang bọc một vật trong khi người khác giữ cuộn giấy|wrap / while|A person is wrapping an object while another holds a roll of paper.
Một người phụ nữ đang cầm máy ảnh và nhìn màn hình của nó|hold / and|A woman is holding a camera and looking at its screen.
Một người đang xếp ghế trong khi người khác trải khăn bàn|stack / while|A person is stacking chairs while another spreads a tablecloth.
Một hành khách đang lên tàu trong khi người khác xuống tàu|board / while|A passenger is boarding a train while another is getting off.
Một phụ nữ đang gấp áo và đặt chúng lên kệ|fold / and|A woman is folding shirts and placing them on a shelf.
Một người đang kéo rèm trong khi người khác bật đèn|pull / while|A person is pulling the curtains closed while another turns on a lamp.
Một công nhân đang mang thang nhưng đồng nghiệp đang mang thùng dụng cụ|carry / but|A worker is carrying a ladder, but a colleague is carrying a toolbox.
Một người đang cắt trái cây và đặt các miếng vào bát|cut / and|A person is cutting fruit and putting the pieces in a bowl.
Một nam giới đang đạp xe trong khi người đi bộ băng qua cầu|cycle / while|A man is cycling while pedestrians cross the bridge.
Một nhân viên đang lau quầy và một người khác đang lau sàn|wipe / and|An employee is wiping the counter, and another is cleaning the floor.
Một người đang đóng hộp trong khi người bên cạnh dán nhãn|close / while|A person is closing a box while another attaches a label.
Một phụ nữ đang nâng túi lên và đặt nó lên ghế|lift / and|A woman is lifting a bag and placing it on a chair.
Một nam giới đang nhìn bản đồ trong khi người phụ nữ chỉ vào nó|look / while|A man is looking at a map while a woman points at it.
Một nhân viên đang đeo găng nhưng người bên cạnh không đeo găng|wear / but|An employee is wearing gloves, but the person beside him is not wearing any.
Một người đang mở sổ và viết ghi chú|open / and|A person is opening a notebook and writing notes.
Một phụ nữ đang giữ cửa trong khi khách đi vào|hold / while|A woman is holding the door open while visitors enter.
Một người đang quét lá và người khác đang bỏ lá vào bao|sweep / and|One person is sweeping leaves, and another is putting them in a sack.
Một công nhân đang đứng trên thang trong khi người khác giữ chân thang|stand / while|A worker is standing on a ladder while another holds its base.
@N + Prep
Một cặp găng tay nằm trên ghế|glove / on|A pair of gloves is on a chair.
Một xe đạp dựng tựa vào bức tường|bicycle / against|A bicycle is leaning against a wall.
Một hộp dụng cụ ở dưới bàn làm việc|toolbox / under|A toolbox is under a workbench.
Một biển báo ở giữa hai cánh cửa|sign / between|A sign is between two doors.
Một phụ nữ đứng sau quầy|counter / behind|A woman is standing behind a counter.
Một chiếc ô ở cạnh cửa ra vào|umbrella / beside|An umbrella is beside the doorway.
Một cây nhỏ ở trước cửa sổ|plant / in front of|A small plant is in front of a window.
Một đồng hồ treo phía trên bảng thông báo|clock / above|A clock is above a noticeboard.
Một giỏ đầy táo ở dưới kệ|basket / below|A basket of apples is below a shelf.
Một nam giới đứng gần bến xe buýt|bus stop / near|A man is standing near a bus stop.
Một tập tài liệu nằm trong ngăn kéo mở|document / inside|Some documents are inside an open drawer.
Một thuyền ở bên dưới cầu|boat / beneath|A boat is beneath a bridge.
Một biển chỉ đường ở góc phố|street / at|A direction sign is at the street corner.
Một chiếc xe đẩy ở giữa lối đi|cart / in|A cart is in the middle of an aisle.
Một thảm ở bên ngoài cửa|mat / outside|A mat is outside the door.
Một nam giới cầm khay có cốc trên đó|cup / on|A man is holding a tray with cups on it.
Một ghế dài ở dọc bức tường|bench / along|A bench is positioned along the wall.
Một cái đèn ở gần mép bàn|lamp / near|A lamp is near the edge of a table.
Một máy in ở phía sau màn hình|printer / behind|A printer is behind a monitor.
Một người đứng giữa hai cột|column / between|A person is standing between two columns.
Một xe tải ở cạnh khu vực chất hàng|truck / beside|A truck is beside the loading area.
Một chiếc túi ở dưới ghế dài|bag / underneath|A bag is underneath a bench.
Một tấm bảng ở trên giá đỡ|board / on|A board is on a stand.
Một nam giới đứng đối diện quầy bán vé|ticket counter / opposite|A man is standing opposite a ticket counter.
@N + N
Một người phụ nữ cầm máy ảnh có dây đeo|camera / strap|A woman is holding a camera with a strap.
Một nhân viên đang đưa hóa đơn cho khách|receipt / customer|An employee is handing a receipt to a customer.
Một người đang đặt cốc lên khay|cup / tray|A person is placing cups on a tray.
Một nam giới đang mở thùng dụng cụ|man / toolbox|A man is opening a toolbox.
Một chiếc thuyền có mái chèo bên trong|boat / paddle|A paddle is lying inside a boat.
Một nam giới dùng cọ để sơn tường|brush / wall|A man is painting a wall with a brush.
Một người đang đặt vở vào ba lô|notebook / backpack|A person is putting a notebook into a backpack.
Một phụ nữ đang đưa chìa khóa cho đồng nghiệp|key / colleague|A woman is handing a key to a colleague.
Một người đang đặt chăn lên giường|blanket / bed|A person is spreading a blanket on a bed.
Một nhân viên đeo bảng tên trên áo|employee / badge|An employee is wearing a badge on her shirt.
Một người đang dùng xẻng cho đất vào xe cút kít|shovel / wheelbarrow|A person is using a shovel to put soil into a wheelbarrow.
Một phụ nữ đang đặt bút lên sổ tay|pen / notebook|A woman is placing a pen on a notebook.
Một nam giới cầm điện thoại ở cạnh xe đạp|phone / bicycle|A man is holding a phone beside a bicycle.
Một người đang đặt sách vào hộp|book / box|A person is putting books into a box.
Một phụ nữ đặt giỏ rau lên quầy|basket / counter|A woman is placing a basket of vegetables on a counter.
Một người đang đổ đá vào bình|ice / pitcher|A person is putting ice into a pitcher.
Một công nhân đang đặt gạch lên xe đẩy|brick / cart|A worker is loading bricks onto a cart.
Một người đang trải bản đồ trên nắp xe|map / car|A person is spreading a map on the hood of a car.
@N + Conj
Một chiếc xe đẩy trống nhưng kệ bên cạnh đầy hàng|cart / but|The cart is empty, but the shelf beside it is full.
Một người đang cầm bản đồ trong khi người khác cầm vé|map / while|A person is holding a map while another holds a ticket.
Một người đang đóng cửa sổ và người khác đang mở cửa ra vào|window / and|One person is closing a window, and another is opening a door.
Một xe tải đang được chất hàng trong khi công nhân khác giữ cổng|truck / while|A truck is being loaded while a worker holds the gate open.
Một phụ nữ cầm hoa và một nam giới cầm hộp|flower / and|A woman is holding flowers, and a man is carrying a box.
Một chiếc ghế nằm trên bàn nhưng các ghế khác ở dưới sàn|chair / but|One chair is on the table, but the other chairs are on the floor.
Một người đang đọc thực đơn trong khi nhân viên chờ bên cạnh|menu / while|A customer is reading a menu while an employee waits beside the table.
Một máy tính đang mở và một cuốn sổ nằm cạnh nó|laptop / and|A laptop is open, and a notebook is lying beside it.
Một người đang dọn bàn trong khi người khác sắp ghế|table / while|A person is clearing a table while another arranges chairs.
Một cái thang tựa vào tường nhưng thùng dụng cụ ở dưới sàn|ladder / but|A ladder is leaning against the wall, but the toolbox is on the floor.
Một phụ nữ đang đóng gói áo khoác và người khác gấp khăn|jacket / and|A woman is packing a jacket, and another person is folding a towel.
Một nam giới đang đẩy xe đẩy trong khi người khác mở cổng|cart / while|A man is pushing a cart while another person opens the gate.
Một hành khách cầm vali nhưng không có túi xách|suitcase / but|A passenger is holding a suitcase but is not carrying a handbag.
Một người đang cắt bánh mì và người khác đang đặt đĩa lên bàn|bread / and|One person is slicing bread, and another is setting plates on the table.
Một phụ nữ đang đeo găng trong khi người đàn ông đeo kính bảo hộ|glove / while|A woman is putting on gloves while a man puts on safety glasses.
Một hộp mở nhưng một hộp khác đang đóng|box / but|One box is open, but another is closed.
Một người đang lau bảng và người khác đang thu bút|board / and|One person is wiping a board, and another is collecting markers.
Một nam giới đang cân hành lý trong khi nhân viên nhìn màn hình|luggage / while|A man is weighing his luggage while an employee looks at a screen.
@Adj + N
Một chiếc cốc trắng nằm trên đĩa|white / cup|A white cup is on a plate.
Một người đang mang một chiếc thùng nặng được ghi 25 kg trên nhãn|heavy / box|A person is carrying a heavy box labeled twenty-five kilograms.
Một cửa sổ mở phía trên bồn rửa|open / window|An open window is above the sink.
Một bàn tròn ở giữa phòng|round / table|A round table is in the middle of the room.
Một phụ nữ mặc áo khoác sọc|striped / jacket|A woman is wearing a striped jacket.
Một chiếc túi nhỏ nằm bên cạnh vali lớn|small / bag|A small bag is beside a large suitcase.
Một người đang đứng cạnh xe tải màu vàng|yellow / truck|A person is standing beside a yellow truck.
Một kệ gỗ treo trên tường|wooden / shelf|A wooden shelf is attached to the wall.
Một sàn nhà ướt có biển cảnh báo đặt trên đó|wet / floor|A warning sign is standing on the wet floor.
Một phụ nữ đang cầm một chiếc ô gấp|folded / umbrella|A woman is holding a folded umbrella.
Một nam giới ngồi trên ghế cao|tall / chair|A man is sitting on a tall chair.
Một cuốn sách mở nằm trên bàn|open / book|An open book is lying on the table.
@Quant + N
Một vài xe đạp dựng thành hàng cạnh tường|several / bicycle|Several bicycles are parked in a row beside the wall.
Hai người đang kiểm tra một tấm bản đồ|two / person|Two people are examining a map.
Ba chiếc bình trên bệ cửa sổ|three / vase|Three vases are on the windowsill.
Một chút nước còn trong bình thủy tinh|some / water|Some water is left in the glass pitcher.
Nhiều chiếc hộp được xếp trên một kệ|many / box|Many boxes are stacked on a shelf.
Một vài hành khách đứng gần cửa lên tàu|a few / passenger|A few passengers are standing near the boarding gate.
Hai chiếc cốc đặt trên khay|two / cup|Two cups are on a tray.
Một ít bánh mì nằm trên đĩa|some / bread|Some bread is on a plate.
Một số công nhân đang mang vật liệu|several / worker|Several workers are carrying materials.
Mỗi ghế có một bảng tên trên chỗ ngồi|each / chair|Each chair has a name card on its seat.
Cả hai cửa ra vào đều đang mở|both / door|Both doors are open.
@V + Prep
Một phụ nữ đang tựa vào lan can|lean / against|A woman is leaning against a railing.
Một người đang đi qua đường dành cho người đi bộ|walk / across|A person is walking across a pedestrian crossing.
Một công nhân đang bước lên thang|climb / up|A worker is climbing up a ladder.
Một hành khách đang bước xuống xe buýt|step / off|A passenger is stepping off a bus.
Một phụ nữ đang nhìn vào bên trong hộp|look / into|A woman is looking into a box.
Một người đang treo áo khoác lên móc|hang / on|A person is hanging a jacket on a hook.
Một nam giới đang lấy sách ra khỏi túi|take / out of|A man is taking a book out of a bag.
Một công nhân đang bắc cầu thang qua một rãnh|place / across|A worker is placing a ladder across a ditch.
Một người đang bỏ phong bì vào hộp thư|put / into|A person is putting an envelope into a mailbox.
@Adv + V
Một nam giới đang bước lùi, mặt hướng về cửa|backward / step|A man is stepping backward from the door.
Một phụ nữ đang giơ tay lên phía trên đầu|upward / reach|A woman is reaching upward with one hand.
Hai người đang đứng cạnh nhau nhìn bản đồ|together / stand|Two people are standing together and looking at a map.
Một nhân viên đang cúi người xuống phía trước quầy|forward / bend|An employee is bending forward over a counter.
@Adv + N
Một người đứng bên ngoài tòa nhà đang cầm thùng|outside / box|A person is holding a box outside the building.
Hai người đang ngồi cùng nhau trên ghế dài|together / bench|Two people are sitting together on a bench.
Một người trong phòng đang cầm một chiếc máy tính bảng|indoors / tablet|A person is standing indoors with a tablet in her hand.
@V + V
Một người đang quỳ xuống để kiểm tra bánh xe, tay chạm vào lốp|kneel / inspect|A person is kneeling to inspect a wheel.
Một phụ nữ đang đưa tay lên để treo chiếc áo trên móc|reach / hang|A woman is reaching up to hang a jacket on a hook.
Một nam giới đang cúi xuống để nhặt chiếc bút trên sàn|bend / pick|A man is bending to pick up a pen.
@V + how/to
Một người hướng dẫn đang chỉ từng bước sử dụng máy đo cho một nhóm|show / how|A guide is showing a group how to use a measuring device.
Một phụ nữ đang vươn tay lên để lấy hộp trên kệ|reach / to|A woman is reaching up to take a box from a shelf.
Một nhân viên đang minh họa các bước gói hàng cho người mới|demonstrate / how|An employee is demonstrating how to wrap a package.
@Det + V
Mỗi công nhân đang đội mũ bảo hộ|every / wear|Every worker is wearing a safety helmet.
Cả hai khách hàng đang nhìn cùng một sản phẩm|both / examine|Both customers are examining the same product.
Một số hành khách đang bước lên xe|some / board|Some passengers are boarding a bus.
@Adj + Conj
Một cánh cửa màu xanh đang mở nhưng cánh cửa màu đỏ đang đóng|blue / but|The blue door is open, but the red door is closed.
@Adv + Conj
Một người đang đợi bên ngoài trong khi người khác mở cổng|outside / while|One person is waiting outside while another opens the gate.
"""

def main():
    items = []
    category = ""
    for line in DATA.strip().splitlines():
        if line.startswith("@"):
            category = line[1:]
            continue
        scene, words, answer = line.split("|")
        items.append(dict(id=f"P1-{len(items) + 31:02d}", part="picture", title=scene,
                          category=category, scene=scene, words=words.split(" / "),
                          answer=answer, explanation=GROUPS[category]))
    assert len(items) == 170, len(items)
    Path(__file__).with_name("pictures.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    print("Authored", len(items), "additional scenes")

if __name__ == "__main__":
    main()
