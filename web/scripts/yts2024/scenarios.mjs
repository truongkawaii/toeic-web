// Original business situations, independent of the ETS source wording.
export const TRACKS = [
 ['Dịch vụ thư viện','Alder Library','Mira Patel','reading kits','literacy coordinator','North Hall','community reading','Reader Week'],
 ['Vận tải đô thị','Vela Transit','Jonas Reed','travel cards','route planner','Central Depot','accessible transport','Mobility Forum'],
 ['Nông nghiệp địa phương','Brookfield Growers','Elena Park','seed trays','greenhouse assistant','Orchard Center','seasonal cultivation','Harvest Exchange'],
 ['Xuất bản và biên tập','Linden Press','Owen Blake','proof copies','production editor','West Studio','digital publishing','Editors Assembly'],
 ['Bảo tàng và triển lãm','Cobalt Museum','Nadia Cruz','display panels','visitor coordinator','Gallery Annex','exhibition design','Curators Day'],
 ['Bán lẻ bền vững','Willow Market','Felix Wong','refill bottles','stock supervisor','Market Classroom','reusable packaging','Reuse Fair'],
 ['Du lịch địa phương','Meridian Tours','Leah Moss','walking maps','tour coordinator','Harbor Lodge','heritage tourism','Guides Convention'],
 ['Đào tạo nghề','Arc Skills Center','Samir Khan','practice manuals','training adviser','East Campus','workplace learning','Skills Showcase'],
 ['Dịch vụ sửa chữa','Hearth Repairs','Clara Dunn','tool cases','service scheduler','Service Workshop','preventive maintenance','Repair Open House'],
 ['Không gian làm việc','Juniper Commons','Theo Silva','desk lamps','membership adviser','Riverside Hub','flexible workspaces','Members Gathering'],
].map(([name,org,person,item,job,venue,topic,event],i)=>({name,org,person,item,job,venue,topic,event,city:['Benton','Fairhaven','Oakmere','Roseford','Avondale','Clearwater','Kingswell','Millhaven','Elmbridge','Southport'][i],base:40+i*7}));
