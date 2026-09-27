export function Aids(){


    return(
        <div className="bg-success text-light border border-2 border-dark rounded-1">
            <div className="container border border-2 border-dark rounded-1 p-5 bg-error">
                text
            </div>
            <br/>
            <div className="container border border-2 border-dark rounded-1 m-5 bg-info">
                text
            </div>
            </div>

    )
}







// import { useEffect, useState } from "react";
//
// export function Aids() {
//     const [aids, setAids] = useState([]);
//
//     useEffect(() => {
//         fetch("http://localhost:5000/api/aids")
//             .then(res => res.json())
//             .then(data => setAids(data))
//             .catch(err => console.error(err));
//     }, []);
//
//     return (
//         <table className="table table-light text-center table-hover">
//             <thead>
//             <tr className="align-text-top">
//                 <th className="text-dark-emphasis">Roll</th>
//                 <th className="text-dark-emphasis">Name</th>
//                 <th className="text-dark-emphasis">Mark</th>
//                 <th className="text-dark-emphasis">Grade</th>
//             </tr>
//             </thead>
//             <tbody>
//             {aids.map((item) => (
//                 <tr key={item.roll}>
//                     <td>{item.roll}</td>
//                     <td>{item.name}</td>
//                     <td>{item.mark}</td>
//                     <td>{item.grade}</td>
//                 </tr>
//             ))}
//             </tbody>
//         </table>
//     );
// }
//
// export default Aids;