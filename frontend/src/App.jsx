import { useState , useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { TabCompo } from "./components/TabCompo.jsx";
import { FormCompo } from "./components/FormCompo.jsx";
import "./App.css";

function Home() {
    return (
        <div className="container-fluid min-vh-100 pt-5 bg-dark text-light">
            <h1 className="title-a text-center text-info">Pc Building Store</h1>
            <div className="row justify-content-center gap-3 mt-5">
                <div className="col-md-4">
                    <Link to="/tables" className="card text-decoration-none h-100">
                        <div className="card-body bg-warning-subtle text-dark-emphasis text-center p-5">
                            <h2>Table</h2>
                            <p className="mb-0 text-muted">Open the table view</p>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/tablef" className="card text-decoration-none h-100">
                        <div className="card-body bg-warning-subtle text-dark-emphasis text-center p-5">
                            <h2>Form</h2>
                            <p className="mb-0 text-muted">Open the table view along with the form</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}


function ShopPage({ isTableAndForm }) {
    const [shop, setShop] = useState([]);
    const [dark,setDark]=useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    useEffect(() => {
        fetch("http://localhost:3000/table")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setShop(data);
                } else {
                    console.error("Unexpected /table response:", data);
                    setShop([]);
                }
            })
            .catch(err => console.log(err));
    }, []);

    function getNextId() {
        let maxId = 0;
        for (let i = 0; i < shop.length; i++) {
            if (shop[i].id > maxId) {
                maxId = shop[i].id;
            }
        }
        return maxId + 1;
    }

    const handleSave = async (data) => {
        let found = false;
        let newShop = [];

        for (let i = 0; i < shop.length; i++) {
            if (shop[i].id === data.id) {
                found = true;
                newShop.push({
                    id: shop[i].id,
                    prod: data.productName,
                    comp: data.companyName,
                    quantity: Number(data.quantity),
                    price: Number(data.price),
                    models: [data.modelName],
                });
            } else {
                newShop.push(shop[i]);
            }
        }

        if (found) {
            try {
                const response = await fetch(`http://localhost:3000/update/${data.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prod: data.productName,
                        comp: data.companyName,
                        quantity: Number(data.quantity),
                        price: Number(data.price),
                        models: [data.modelName],
                    })
                });
                const result = await response.json();
                if (result.error) {
                    console.error("Error updating data:", result.error);
                    return;
                }
            } catch (error) {
                console.error("Error updating data:", error);
                return;
            }
        } else {
            const newItem = {
                id: getNextId(),
                prod: data.productName,
                comp: data.companyName,
                quantity: Number(data.quantity),
                price: Number(data.price),
                models: [data.modelName],
            };
            try {
                const response = await fetch("http://localhost:3000/new", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newItem)
                });
                const result = await response.json();
                if (result.error) {
                    console.error("Error inserting data:", result.error);
                    return;
                }
                newShop.push(newItem);
            } catch (error) {
                console.error("Error inserting data:", error);
                return;
            }
        }

        setShop(newShop);
        setSelectedItem(null);
    };

    async function handleDelete(id) {
        let newShop = [];
        for (let i = 0; i < shop.length; i++) {
            if (shop[i].id !== id) {
                newShop.push(shop[i]);
            }
        }
        setShop(newShop);
    }
        function isDark() {
            setDark(!dark);
        }

        return (
            <>
                {isTableAndForm ? (
            <div className={`container-fluid min-vh-100 pt-4 pb-5 ${dark ? "bg-dark" : "bg-light-subtle"}`}>
                <Link to="/" className={`page-link ${dark ? "text-light" : "text-dark"}`}>Home</Link>
                <h1 className={`title-a text-center  ${dark ? "text-info":"text-primary" }`}>Pc Building Store</h1>
                <div className="row pt-4 align-items-stretch">
                    <div className="col-md-5 ms-md-5 me-3 d-flex align-items-stretch">
                        <FormCompo shop={shop} editData={selectedItem} onSubmit={handleSave}/>

                    </div>
                    <div className="col-md-6 ms-0 d-flex align-items-stretch">
                        <TabCompo shop={shop} onSelectEdit={setSelectedItem} onDelete={handleDelete}/>
                    </div>
                </div>

                <div className="form-check form-switch my-3 p-0 d-flex justify-content-end">
  <span className={`fw-semibold ${dark ? "text-light" : "text-dark"}`}>
        {dark ? "Darkㅤ" : "Lightㅤ"}
    </span>
                    <input
                        className="form-check-input mx-0 theme-toggle border-dark"
                        type="checkbox"
                        role="switch"
                        id="themeToggle"
                        checked={dark}
                        onChange={isDark}
                    />
                </div>
            </div>):(
                <div className={`card container-fluid min-vh-100 pt-4 ${dark ? "bg-dark" : "bg-light-subtle"}`}>
                    <Link to="/" className={`page-link ${dark ? "text-light" : "text-dark"}`}>Home</Link>
                    <h1 className={`title-a text-center ${dark ? "text-info":"text-primary" }`}>Pc Building Store</h1>
                    <div className="card-body gap-3 mt-2">
                        <TabCompo/>
                        <div className="form-check form-switch my-3 p-0 d-flex justify-content-end">
  <span className={`fw-semibold ${dark ? "text-light" : "text-dark"}`}>
        {dark ? "Darkㅤ" : "Lightㅤ"}
    </span>
                            <input
                                className="form-check-input mx-0 theme-toggle border-dark"
                                type="checkbox"
                                role="switch"
                                id="themeToggle"
                                checked={dark}
                                onChange={() => setDark(currentDark => !currentDark)}
                            />
                        </div>
                    </div>
                </div>)
                }
                </>

        );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tables" element={<ShopPage isTableAndForm={false} />} />
            <Route path="/tablef" element={<ShopPage isTableAndForm={true} />} />
        </Routes>
    );
}

export default App;
//
// import { Aids } from "./components/Aids.jsx";
// import "./App.css";
// function App() {
//   return (
//       <div className="container-fluid min-vh-100 pt-4 pb-5">
//         <Aids/>
//       </div>
//   );
// }
//

// export default App;