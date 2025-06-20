// planning 從地圖新增景點後，右邊區塊未能刷新 => 清單列表OK 清單項目OK 暫存區OK 目前問題區域間拖曳重覆渲染(db寫入正確)
// sharing頁面
// planning RWD
// 確認各頁RWD
// planning 未選擇清單時，不可加入景點

"use client";
export default function SharingPage() {
  return <div>Sharing Page</div>;
}

// import React, { useState } from "react";
// import {
//   IconCalendar,
//   IconClock,
//   IconMapPin,
//   IconShare,
//   IconHeart,
//   IconEye,
// } from "@tabler/icons-react";

// const TravelItineraryUI = () => {
//   const [selectedDay, setSelectedDay] = useState(0);

//   // 模擬行程資料
//   const itinerary = {
//     title: "北海道",
//     dates: "2024-10-21 - 2024-10-25",
//     tags: ["札幌", "富良野", "小樽"],
//     author: "aaa",
//     days: [
//       {
//         date: "2024/10/21",
//         weekday: "一",
//         locations: [
//           {
//             id: 1,
//             name: "新千歲機場",
//             address: "Bibi, Chitose, Hokkaido 066-0012日本",
//             image: "/api/placeholder/80/60",
//             duration: "51 分鐘",
//             type: "transport",
//           },
//           {
//             id: 2,
//             name: "札幌啤酒博物館",
//             address:
//               "9-chōme-1-1 Kita 7 Jōhigashi, Higashi Ward, Sapporo, Hokkaido 065-8633日本",
//             image: "/api/placeholder/80/60",
//             duration: "8 分鐘",
//             type: "attraction",
//           },
//           {
//             id: 3,
//             name: "札幌市時計台",
//             address:
//               "2 Chome Kita 1 Jonishi, Chuo Ward, Sapporo, Hokkaido 060-0001日本",
//             image: "/api/placeholder/80/60",
//             duration: "4 分鐘",
//             type: "attraction",
//           },
//           {
//             id: 4,
//             name: "大通公園",
//             address: "日本〒060-0042 北海道札幌市中央区大通西１〜１２丁目",
//             image: "/api/placeholder/80/60",
//             duration: "",
//             type: "park",
//           },
//         ],
//       },
//       {
//         date: "2024/10/22",
//         weekday: "二",
//         locations: [
//           {
//             id: 5,
//             name: "白金青池",
//             address:
//               "Shirogane, Biei, Kamikawa District, Hokkaido 071-0235日本",
//             image: "/api/placeholder/80/60",
//             duration: "17 分鐘",
//             type: "nature",
//           },
//           {
//             id: 6,
//             name: "四季彩之丘",
//             address:
//               "日本〒071-0473 Hokkaido, Kamikawa District, Biei, Shinsei, 第3",
//             image: "/api/placeholder/80/60",
//             duration: "21 分鐘",
//             type: "attraction",
//           },
//           {
//             id: 7,
//             name: "富田農場",
//             address:
//               "15 Kisenkita, Nakafurano, Sorachi District, Hokkaido 071-0704日本",
//             image: "/api/placeholder/80/60",
//             duration: "23 分鐘",
//             type: "farm",
//           },
//           {
//             id: 8,
//             name: "森林精靈露台",
//             address: "Nakagoryo, Furano, Hokkaido 076-8511日本",
//             image: "/api/placeholder/80/60",
//             duration: "",
//             type: "attraction",
//           },
//         ],
//       },
//       {
//         date: "2024/10/23",
//         weekday: "三",
//         locations: [
//           {
//             id: 9,
//             name: "白色戀人公園",
//             address:
//               "2-chōme-11-36 Miyanosawa 2 Jo, Nishi Ward, Sapporo, Hokkaido 063-0052日本",
//             image: "/api/placeholder/80/60",
//             duration: "19 分鐘",
//             type: "theme_park",
//           },
//           {
//             id: 10,
//             name: "北海道大學",
//             address:
//               "5 Chome Kita 8 Jonishi, Kita Ward, Sapporo, Hokkaido 060-0808日本",
//             image: "/api/placeholder/80/60",
//             duration: "41 分鐘",
//             type: "university",
//           },
//           {
//             id: 11,
//             name: "頭大佛殿",
//             address: "2 Takino, Minami Ward, Sapporo, Hokkaido 005-0862日本",
//             image: "/api/placeholder/80/60",
//             duration: "25 分鐘",
//             type: "temple",
//           },
//           {
//             id: 12,
//             name: "三井OUTLET PARK 札幌北廣",
//             address:
//               "3-chōme-7-6 Omagariisawaicho, Kitahiroshima, Hokkaido 061-1278日本",
//             image: "/api/placeholder/80/60",
//             duration: "",
//             type: "shopping",
//           },
//         ],
//       },
//       {
//         date: "2024/10/24",
//         weekday: "四",
//         locations: [
//           {
//             id: 13,
//             name: "LeTAO 總店",
//             address: "7-16 Sakaimachi, Otaru, Hokkaido 047-0027日本",
//             image: "/api/placeholder/80/60",
//             duration: "1 分鐘",
//             type: "shop",
//           },
//           {
//             id: 14,
//             name: "小樽北菓樓 總店",
//             address: "7-22 Sakaimachi, Otaru, Hokkaido 047-0027日本",
//             image: "/api/placeholder/80/60",
//             duration: "0 分鐘",
//             type: "shop",
//           },
//           {
//             id: 15,
//             name: "六花亭 小樽運河店",
//             address: "7-22 Sakaimachi, Otaru, Hokkaido 047-0027日本",
//             image: "/api/placeholder/80/60",
//             duration: "3 分鐘",
//             type: "shop",
//           },
//           {
//             id: 16,
//             name: "小樽運河",
//             address: "5 Minatomachi, Otaru, Hokkaido 047-0007日本",
//             image: "/api/placeholder/80/60",
//             duration: "19 分鐘",
//             type: "landmark",
//           },
//           {
//             id: 17,
//             name: "天狗山",
//             address: "日本〒047-0012 北海道小樽市 Tenguyama, 2 Chome, 天狗山",
//             image: "/api/placeholder/80/60",
//             duration: "",
//             type: "mountain",
//           },
//         ],
//       },
//       {
//         date: "2024/10/25",
//         weekday: "五",
//         locations: [
//           {
//             id: 18,
//             name: "新千歲機場",
//             address: "Bibi, Chitose, Hokkaido 066-0012日本",
//             image: "/api/placeholder/80/60",
//             duration: "",
//             type: "transport",
//           },
//         ],
//       },
//     ],
//   };

//   const LocationCard = ({ location, isLast }) => (
//     <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm hover:shadow-md transition-shadow">
//       <div className="flex gap-3">
//         <div className="flex-shrink-0">
//           <img
//             src={location.image}
//             alt={location.name}
//             className="w-16 h-16 rounded-lg object-cover bg-gray-200"
//           />
//         </div>
//         <div className="flex-1 min-w-0">
//           <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
//             {location.name}
//           </h4>
//           <p className="text-xs text-gray-500 mb-2 line-clamp-2">
//             {location.address}
//           </p>
//           {location.duration && (
//             <div className="flex items-center gap-1 text-xs text-gray-600">
//               <IconClock size={12} />
//               <span>開車 {location.duration}</span>
//             </div>
//           )}
//         </div>
//       </div>
//       {!isLast && (
//         <div className="flex justify-center mt-3">
//           <div className="w-px h-4 bg-gray-300"></div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 p-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-900">
//               {itinerary.title}
//             </h1>
//             <div className="flex items-center gap-2">
//               <button className="p-2 rounded-full hover:bg-gray-100">
//                 <IconHeart size={20} className="text-gray-600" />
//               </button>
//               <button className="p-2 rounded-full hover:bg-gray-100">
//                 <IconShare size={20} className="text-gray-600" />
//               </button>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
//             <div className="flex items-center gap-4 text-sm text-gray-600">
//               <div className="flex items-center gap-1">
//                 <IconCalendar size={16} />
//                 <span>{itinerary.dates}</span>
//               </div>
//               <div className="flex gap-2">
//                 {itinerary.tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className="text-sm text-gray-500">
//               分享者：{itinerary.author}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto p-4">
//         {/* Day Navigation - Horizontal Scroll */}
//         <div className="mb-6">
//           <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
//             {itinerary.days.map((day, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedDay(index)}
//                 className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                   selectedDay === index
//                     ? "bg-blue-500 text-white"
//                     : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 {day.date.split("/").slice(1).join("/")} ({day.weekday})
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Desktop View */}
//         <div className="hidden lg:block">
//           <div className="grid grid-cols-5 gap-6">
//             {itinerary.days.map((day, dayIndex) => (
//               <div key={dayIndex} className="space-y-3">
//                 <div className="text-center mb-4">
//                   <h3 className="font-semibold text-gray-900">
//                     {day.date.split("/").slice(1).join("/")} ({day.weekday})
//                   </h3>
//                 </div>
//                 <div className="space-y-3">
//                   {day.locations.map((location, locationIndex) => (
//                     <LocationCard
//                       key={location.id}
//                       location={location}
//                       isLast={locationIndex === day.locations.length - 1}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Mobile/Tablet View */}
//         <div className="lg:hidden">
//           <div className="bg-white rounded-lg border border-gray-200 p-4">
//             <div className="text-center mb-4">
//               <h3 className="font-semibold text-gray-900">
//                 {itinerary.days[selectedDay].date.split("/").slice(1).join("/")}{" "}
//                 ({itinerary.days[selectedDay].weekday})
//               </h3>
//             </div>
//             <div className="space-y-3">
//               {itinerary.days[selectedDay].locations.map(
//                 (location, locationIndex) => (
//                   <LocationCard
//                     key={location.id}
//                     location={location}
//                     isLast={
//                       locationIndex ===
//                       itinerary.days[selectedDay].locations.length - 1
//                     }
//                   />
//                 )
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-teal-100 text-center py-4 mt-8">
//         <p className="text-sm text-gray-600">
//           Copyright @2024 WeHelp #5 Drag to Travel
//         </p>
//       </footer>

//       <style jsx>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TravelItineraryUI;
