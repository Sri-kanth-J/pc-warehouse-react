// import { useState } from "react";
// import { TabCompo } from "./components/TabCompo.jsx";
// import { FormCompo } from "./components/FormCompo.jsx";
// import "./App.css";
// function App() {
//     const [shop, setShop] = useState([
//         { id: 1,
//             prod: "Motherboard",
//             comp: "ASUS",
//             quantity: 6,
//             price: 18500,
//             models: ["ROG Strix B550-F", "ROG Strix B550-F1", "ROG Strix B550-F2"] },
//         { id: 2,
//             prod: "Processor (CPU)",
//             comp: "AMD",
//             quantity: 12,
//             price: 15000,
//             models: ["Ryzen 5 5600X", "Ryzen 5 5600X1", "Ryzen 5 5600X2"] },
//         { id: 3,
//             prod: "Graphics card (GPU)",
//             comp: "NVIDIA",
//             quantity: 3,
//             price: 62000,
//             models: ["RTX 4070", "RTX 40701", "RTX 40702"] },
//         { id: 4,
//             prod: "Storage Disk (SSD)",
//             comp: "Crucial",
//             quantity: 3,
//             price: 3400,
//             models: ["CT500P3", "CT500P31", "CT500P32"] },
//         { id: 5,
//             prod: "Storage Disk (SSD)",
//             comp: "WD Digital",
//             quantity: 7,
//             price: 7500,
//             models: ["WDS480 G3GOA", "WDS480 G3GOA1", "WDS480 G3GOA2"] },
//         { id: 6,
//             prod: "Pen Drive",
//             comp: "SanDisk",
//             quantity: 10,
//             price: 950,
//             models: ["SDCZ48 064G I35", "SDCZ48 064G I351", "SDCZ48 064G I352"] },
//         { id: 7,
//             prod: "Keyboard(Wired)",
//             comp: "Logitech",
//             quantity: 25,
//             price: 15000,
//             models: ["MX Mech Keys", "MX Mech Keys1", "MX Mech Keys2"] },
//         { id: 8,
//             prod: "Mouse(Wired)",
//             comp: "Logitech",
//             quantity: 15,
//             price: 400,
//             models: ["B100", "B1001", "B1002"] },
//     ]);
//     const [dark,setDark]=useState(true);
//     const [selectedItem, setSelectedItem] = useState(null);
//
//     function handleSave(data) {
//         let found = false;
//         let newShop = [];
//         for (let i = 0; i < shop.length; i++) {
//             if (shop[i].id === data.id) {
//                 found = true;
//                 newShop.push({
//                     id: shop[i].id,
//                     prod: data.productName,
//                     comp: data.companyName,
//                     quantity: Number(data.quantity),
//                     price: Number(data.price),
//                     models: [data.modelName],
//                 });
//             } else {
//                 newShop.push(shop[i]);
//             }
//         }
//         if (found === false) {
//             newShop.push({
//                 id: Date.now(),
//                 prod: data.productName,
//                 comp: data.companyName,
//                 quantity: Number(data.quantity),
//                 price: Number(data.price),
//                 models: [data.modelName],
//             });
//         }
//         setShop(newShop);
//         setSelectedItem(null);
//     }
//
//     function handleDelete(id) {
//         let newShop = [];
//         for (let i = 0; i < shop.length; i++) {
//             if (shop[i].id !== id) {
//                 newShop.push(shop[i]);
//             }
//         }
//         setShop(newShop);
//     }
//     function isDark(){
//         setDark(!dark);
//     }
//     return (
//
//         <div className={`container-fluid min-vh-100 pt-4 pb-5 ${dark ? "bg-dark" : "bg-light"}`}>
//
//
//             <h1 className="title-a text-center text-primary">Pc Building Store</h1>
//             <div className="row pt-4 align-items-stretch">
//                 <div className="col-md-5 ms-md-5 me-3 d-flex align-items-stretch">
//                     <FormCompo shop={shop} editData={selectedItem} onSubmit={handleSave} />
//
//                 </div>
//                 <div className="col-md-6 ms-0 d-flex align-items-stretch">
//                     <TabCompo shop={shop} onSelectEdit={setSelectedItem} onDelete={handleDelete} />
//                 </div>
//             </div>
//
//             <div className="form-check form-switch my-3 p-0 d-flex justify-content-end">
//   <span className={`fw-semibold ${dark ? "text-light" : "text-dark"}`}>
//         {dark ? "Darkㅤ" : "Lightㅤ"}
//     </span>
//                 <input
//                     className="form-check-input mx-0 theme-toggle border-dark"
//                     type="checkbox"
//                     role="switch"
//                     id="themeToggle"
//                     checked={dark}
//                     onChange={isDark}
//                 />
//             </div>
//         </div>
//     );
// }
//
// export default App;
// //
// // import { Aids } from "./components/Aids.jsx";
// // import "./App.css";
// // function App() {
// //   return (
// //       <div className="container-fluid min-vh-100 pt-4 pb-5">
// //         <Aids/>
// //       </div>
// //   );
// // }
// //
// // export default App;
//
//
//
// // export default App;