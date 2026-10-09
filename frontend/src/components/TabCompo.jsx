import { useState } from "react";
import "./TabCompo.css";
import "../App.css"

const PAGE_SIZE = 5;

export function TabCompo({ shop = [], onSelectEdit = () => {}, onDelete = () => {} }) {
    const [page, setPage] = useState(1);

    let total = 0;
    for (let i = 0; i < shop.length; i++) {
        total = total + shop[i].price * shop[i].quantity;
    }

    const totalPages = Math.ceil(shop.length / PAGE_SIZE) || 1;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = shop.slice(start, start + PAGE_SIZE);

    function clickEdit(item) {
        let obj = {};
        obj.id = item.id;
        obj.productName = item.prod;
        obj.companyName = item.comp;
        obj.quantity = item.quantity;
        obj.price = item.price;
        obj.modelName = item.models[0];
        onSelectEdit(obj);
    }

    function clickDelete(id) {
        onDelete(id);
    }

    function Pager() {
        return (
            <div className="pager d-flex align-items-center justify-content-center p-3 bg-dark-subtle text-dark border-top border-secondary-subtle opacity-75">
                <h5 className="mb-0">Items - {shop.length}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h5>
                <button
                    className="pager-btn btn btn-outline-dark btn-sm me-2"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    {"<"}
                </button>
                <h5 className="mb-0 me-2">{page} / {totalPages}</h5>
                <button
                    className="pager-btn btn btn-outline-dark btn-sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}>
                    {">"}
                </button>
                <h5 className="text-dark text-center mb-0">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Total - {total}</h5>
            </div>
        );
    }

    return (
        <div className="card shop-list-card bg-dark-subtle d-flex flex-column h-100 font-Lora border-info-subtle">
            <div className="card-header bg-body-tertiary bg-opacity-25 text-dark border-info">
                <h4 className="text-xl-start mx-5 my-3">LIST</h4>
            </div>
            <div className="card-body bg-dark bg-opacity-10 p-3 flex-grow-1 d-flex">
                <div className="table-responsive rounded border w-100">
                    <table className="table table-secondary table-hover align-middle  text-center m-0 h-100" >

                        <thead>
                        <tr className="align-text-top">
                            <th className="text-dark-emphasis">S No.</th>
                            <th className="text-dark-emphasis">Product Name</th>
                            <th className="text-dark-emphasis">Company Name</th>
                            <th className="text-dark-emphasis">Quant.</th>
                            <th className="text-dark-emphasis">Price</th>
                            <th className="text-dark-emphasis">Model Name</th>
                            <th className="text-dark-emphasis text-nowrap">Action Key</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pageItems.map((item, index) => (
                            <tr key={item.id}>
                                <td>{start + index + 1}</td>
                                <td>{item.prod}</td>
                                <td>{item.comp}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.price}</td>
                                <td>{item.models[0]}</td>
                                <td className="text-nowrap">
                                    <button className="button-a button btn btn-primary btn-sm m-1"
                                            onClick={() => clickEdit(item)}>Edit</button>
                                    <button className="button-b button btn btn-danger btn-sm m-1"
                                            onClick={() => clickDelete(item.id)}>Del</button>
                                </td>
                            </tr>
                        ))}
                        {Array.from({ length: PAGE_SIZE - pageItems.length }).map((_, index) => (
                            <tr className="empty-row" aria-hidden="true" key={`empty-${index}`}>
                                <td colSpan="7">&nbsp;</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pager />
        </div>
    );
}