import { useState , useEffect } from "react";
import { House, Table, Pen, Sun, Moon } from "react-bootstrap-icons";
import { TabCompo } from "./components/TabCompo.jsx";
import { FormCompo } from "./components/FormCompo.jsx";
import "./App.css";

function ShopPage() {
    const [dark, setDark] = useState(true);
    const [page, setPage] = useState("home");   // "home" | "table" | "form"
    function isDark() {
        setDark(!dark);
    }
    const [shop, setShop] = useState([]);
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
                    headers: {"Content-Type": "application/json"},
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
                    headers: {"Content-Type": "application/json"},
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
        try {
            const response = await fetch(`http://localhost:3000/delete/${id}`, {
                method: "DELETE"
            });
            const result = await response.json();
            if (result.error) {
                console.error("Error deleting data:", result.error);
                return;
            }
        } catch (error) {
            console.error("Error deleting data:", error);
            return;
        }

        let newShop = [];
        for (let i = 0; i < shop.length; i++) {
            if (shop[i].id !== id) {
                newShop.push(shop[i]);
            }
        }
        setShop(newShop);
    }

    function ThemeToggle({dark}){
        return(
            <div className="form-check form-switch my-3 p-0 d-flex justify-content-end">
  <span className={`fw-semibold ${dark ? "text-light" : "text-dark"}`}>
        {dark ? "Darkㅤ" : "Lightㅤ"}
    </span>
                <input className="form-check-input mx-0 theme-toggle border-info-subtle" type="checkbox" role="switch" id="themeToggle" checked={dark} onChange={isDark} />
            </div>
        );
    }

    return (
        <div className={`container-fluid min-vh-100 pt-4 pb-5 font-Lora ${dark ? "bg-dark" : "bg-light bg-opacity-75"}`}>
            <h1 className={`font-Outfit text-center  ${dark ? "text-info":"text-info-emphasis" }`}>Pc Building Store</h1>
            <Nav dark={dark} onToggle={isDark} setPage={setPage} />

            {page === "home" && (
                <div className="row justify-content-center gap-3 pt-4">
                    <div className="col-md-4">
                        <div className="card h-100 border-info-subtle">
                            <div className={`card-body bg-warning bg-opacity-10 text-dark-emphasis text-center p-5`}>
                                <h2>Table</h2>
                            </div>
                            <div className={`card-footer bg-warning bg-opacity-10 border-top border-info-subtle text-center`}>
                                <button type="button" className="btn btn-link d-inline-flex align-items-center ms-2 p-0 text-reset text-decoration-none" onClick={() => setPage("table")}>
                                    <span className="nav-arrow d-inline-flex align-items-center m-2 p-2 text-warning-emphasis text-muted border-info">
                                        Open the table view
                                        <svg width="48" height="24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M28 2 L40 12 L28 22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-info-subtle" role="button" onClick={() => setPage("form")}>
                            <div className={`card-body bg-warning bg-opacity-10 text-dark-emphasis  text-center p-5`}>
                                <h2>Form</h2>
                                <p/>
                                <p>Open the table view along with the form</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {page === "table" && (
                <div className="mt-2">
                    <TabCompo shop={shop} onSelectEdit={setSelectedItem} onDelete={handleDelete}/>
                </div>
            )}

            {page === "form" && (
                <div className="row pt-4 align-items-stretch">
                    <div className="col-md-5 ms-md-5 me-3 d-flex align-items-stretch">
                        <FormCompo shop={shop} editData={selectedItem} onSubmit={handleSave}/>
                    </div>
                    <div className="col-md-6 ms-0 d-flex align-items-stretch">
                        <TabCompo shop={shop} onSelectEdit={setSelectedItem} onDelete={handleDelete}/>
                    </div>
                </div>
            )}
        </div>
    );
}

function Nav({ dark, onToggle, setPage }) {
    const colour = dark ? "text-light" : "text-warning-emphasis";
    return (
        <ul className={`nav nav-tabs navbar-collapse align-items-center ${dark ? "border-warning-emphasis":"border-dark"} font-Lora m-0`}>
            <li className="nav-item">
                <button type="button" className={`btn btn-link nav-link text-center ${colour}`} onClick={() => setPage("home")}>
                    <House /><div style={{ breakAfter: 'page' }} />Home
                </button>
            </li>
            <li className="nav-item">
                <button type="button" className={`btn btn-link nav-link text-center ${colour}`} onClick={() => setPage("table")}>
                    <Table /><div style={{ breakAfter: 'page' }} />Table
                </button>
            </li>
            <li className="nav-item">
                <button type="button" className={`btn btn-link nav-link text-center ${colour}`} onClick={() => setPage("form")}>
                    <Pen /><div style={{ breakAfter: 'page' }} />Form
                </button>
            </li>
            {onToggle && (
                <li className="nav-item ms-auto p-1">
                    <button
                        type="button"
                        className="btn btn-link nav-link text-info"
                        onClick={onToggle}
                        aria-label="Toggle theme"
                    >
                        {dark ? <Moon /> : <Sun />}
                    </button>
                </li>
            )}
        </ul>
    );
}

function App() {
    return <ShopPage />;
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