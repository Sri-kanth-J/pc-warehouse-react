import { useEffect, useState } from "react";

const emptyForm = { id: null, productName: "", companyName: "", quantity: "", price: "", modelName: "" };

const labelStyle = { paddingTop: "1 rem" };

function ErrorSlot({ message }) {
    return (
        <p className={`error-slot text-lg-start ${message ? "show-error" : ""}`}>
            {message || "placeholder"}
        </p>
    );
}

function Field({ label, field, type, form, errors, update }) {
    return (
        <div className="row m-3 align-items-start">
            <label className="col-4 col-form-label text-start bg-dark-subtle border-0 text-nowrap" style={labelStyle}>
                {label} <span className="text-danger">*</span>
            </label>
            <div className="col-6">
                <input
                    id={field}
                    type={type}
                    value={form[field]}
                    className={errors[field] ? "form-control is-invalid" : "form-control"}
                    onChange={(e) => update(field, e.target.value)}
                />
                <ErrorSlot message="" />
            </div>
        </div>
    );
}

export function FormCompo({ shop, editData, onSubmit }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    const modelSet = new Set();
    for (let i = 0; i < shop.length; i++) {
        for (let j = 0; j < shop[i].models.length; j++) {
            modelSet.add(shop[i].models[j]);
        }
    }
    const allModels = [...modelSet];

    useEffect(() => {
        if (editData) {
            setForm({ ...emptyForm, ...editData });
        }
    }, [editData]);

    const update = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    function checkAndSubmit() {
        const newErrors = {};
        ["productName", "companyName", "quantity", "price", "modelName"].forEach((field) => {
            if (form[field] === "") newErrors[field] = true;
        });

        setErrors(newErrors);

        const errorFields = Object.keys(newErrors);
        if (errorFields.length > 0) {
            setFormError("Fill all the required fields");
            document.getElementById(errorFields[0]).focus();
            return;
        }

        setFormError("");
        onSubmit(form);
        setForm(emptyForm);
        setErrors({});
    }

    return (
        <div className="card shop-box bg-dark-subtle h-100">
            <div className="card-header bg-body-tertiary bg-opacity-25 text-dark">
                <h4 className="text-xl-start mx-5 my-3">FORM</h4>
            </div>

            <div className="card-body bg-opacity-10 bg-dark-subtle p-2">
                <Field label="Product Name" field="productName" type="text" form={form} errors={errors} update={update} />
                <Field label="Company Name" field="companyName" type="text" form={form} errors={errors} update={update} />

                <div className="row m-3 align-items-start">
                    <label className="col-2 col-form-label text-start bg-dark-subtle border-0 text-nowrap" style={labelStyle}>
                        Quantity <span className="text-danger">*</span>
                    </label>
                    <div className="col-3">
                        <input
                            id="quantity"
                            type="number"
                            value={form.quantity}
                            className={errors.quantity ? "form-control narrow-control is-invalid" : "form-control narrow-control"}
                            onChange={(e) => update("quantity", e.target.value)}
                        />
                        <ErrorSlot message="" />
                    </div>

                    <label className="col-2 col-form-label text-start bg-dark-subtle border-0 text-nowrap" style={labelStyle}>
                        Price <span className="text-danger">*</span>
                    </label>
                    <div className="col-3">
                        <input
                            id="price"
                            type="number"
                            value={form.price}
                            className={errors.price ? "form-control narrow-control is-invalid" : "form-control narrow-control"}
                            onChange={(e) => update("price", e.target.value)}
                        />
                        <ErrorSlot message="" />
                    </div>
                </div>

                <div className="row m-3 align-items-start">
                    <label className="col-4 col-form-label text-start border-0 bg-dark-subtle text-nowrap" style={labelStyle}>
                        Model Name <span className="text-danger">*</span>
                    </label>

                    <div className="col-6">
                        <select
                            id="modelName"
                            className={errors.modelName ? "form-select opacity-75 text-black is-invalid" : "form-select opacity-75 text-black"}
                            value={form.modelName}
                            onChange={(e) => update("modelName", e.target.value)}
                        >
                            <option value="">Select Model</option>
                            {allModels.map((model, i) => (
                                <option key={i} value={model}>{model}</option>
                            ))}
                        </select>
                        <ErrorSlot message="" />
                    </div>
                </div>

                <div className="text-center">
                    <ErrorSlot message={formError} />
                </div>
            </div>

            <div className="bg-dark-subtle text-center mb-3">
                <button className="button submit-button btn btn-secondary btn-lg text-nowrap mb-2" onClick={checkAndSubmit}>Submit</button>
            </div>
        </div>
    );
}