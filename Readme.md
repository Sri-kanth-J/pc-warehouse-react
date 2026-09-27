# PC Build Shop — How It Works (Beginner Guide)

This explains every part of the project: the React frontend and the Express backend, piece by piece — what each variable and function does, and which are "built-in" (from React/Express/JS itself) vs ones we wrote ourselves.

---

## Install and Run

### Create a new React app

```bash
npm create vite@latest pc-build-shop-react -- --template react
cd pc-build-shop-react
```

### Install this project

```bash
cd frontend
npm install

cd ../backend
npm install
copy .env.example .env
```

Set the MySQL values in `backend/.env` before starting the server.

### Start the application

From the project root, use two terminals:

```bash
# Terminal 1
cd backend
node server.js
```

```bash
# Terminal 2
cd frontend
npm run dev
```

For a production frontend build:

```bash
cd frontend
npm run build
```

---

## Part A — Quick Reference (Your Own Variable Names)

### Frontend (`App.jsx`)

**State**
- `shop` — array of all products. Starts `[]`, filled by `fetch("/table")` in `useEffect`.
- `setShop` — updates `shop`, triggers re-render.
- `dark` — theme boolean, toggled by `isDark()`.
- `selectedItem` — item being edited, or `null` for "add new". Passed to `FormCompo` as `editData`.

**Functions**

`getNextId()`
- Loops through `shop`, tracks the highest `id`.
- Returns `maxId + 1` — used only when creating a new item.

`handleSave(data)` — runs on form submit:

| Variable | Purpose |
|---|---|
| `found` | `true` if an item in `shop` already has `data.id` → means edit, not new |
| `newShop` | fresh array rebuilt from `shop`, with the changed/new item included |
| `payload` | form fields renamed to match backend (`productName` → `prod`, etc.) |

Flow:
```
found === true  -> apiCall(".../update/${data.id}", "PUT", payload)
found === false -> newItem = { id: getNextId(), ...payload }
                    apiCall(".../new", "POST", newItem)
                    newShop.push(newItem)
-> setShop(newShop)
-> setSelectedItem(null)
```

`apiCall(url, method, body)` — your reusable `fetch` wrapper. Sets headers + `JSON.stringify(body)` if a body is given, returns parsed JSON.

`handleDelete(id)` — calls `apiCall(".../delete/${id}", "DELETE")` first; only updates `shop` locally if no `result.error`.

`isDark()` — `setDark(!dark)`.

### Backend (`server.js`)

- `pool` — MySQL connection pool, created once via `mysql.createPool(...)`.
- `app` — the Express server; every route (`app.get`, `app.post`, `app.put`, `app.delete`) hangs off this.
- `req` / `res` — incoming request / outgoing response, in every route handler.
- `rows` — raw query result inside `/table`, mapped (fixing `models`) into a `shop` array before `res.json(shop)`.

**Routes**

| Route | Purpose |
|---|---|
| `GET /table` | returns all rows, fixes `models` type if needed |
| `POST /new` | inserts a new row |
| `PUT /update/:id` | updates row matching `:id` |
| `DELETE /delete/:id` | deletes row matching `:id` |

---

## Part B — Full Detailed Explanation

### 1. The Big Picture

```
React (browser)  <-- HTTP requests -->  Express server  <-- SQL queries -->  MySQL database
```

- **React** shows the form and table, and reacts to clicks/typing.
- **Express** is a small server that listens for requests (like "give me all products" or "add this new product") and talks to MySQL.
- **MySQL** is where the data actually lives permanently.

React never touches the database directly — it only ever talks to Express, and Express is the only thing that talks to MySQL.

---

### 2. The Backend — `server.js`

#### Imports

```js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
```

- `require(...)` is Node.js's **built-in function** for loading a package.
- `express` — the framework that lets us create a web server and define routes (URLs the frontend can call).
- `cors` — a **middleware** (a function that runs on every request) that allows our React app (running on a different port, e.g. `localhost:5173`) to talk to our Express server (`localhost:3000`). Without it, the browser blocks the request for security reasons.
- `mysql2/promise` — lets us talk to MySQL using `async/await` instead of old-style callbacks.

#### Setting up the app and connection pool

```js
const app = express();
app.use(cors());
app.use(express.json());
```

- `express()` — **built-in Express function**. Creates the actual server object. Everything (`app.get`, `app.post`, etc.) is attached to this `app` variable.
- `app.use(...)` — **built-in Express method**. Registers middleware that runs on *every* incoming request, before it reaches your routes.
  - `cors()` enables cross-origin requests (see above).
  - `express.json()` automatically reads the JSON text sent in a request body and turns it into a normal JS object at `req.body`. Without this, `req.body` would be `undefined`.

```js
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "yourpassword",
    database: "pcstore"
});
```

- `mysql.createPool(...)` — **built-in function from the `mysql2` package**. Instead of opening a single connection to MySQL, a "pool" keeps several connections ready and reuses them, which is more efficient when many requests come in.
- `pool` — our own variable name for this connection pool. We use `pool.query(...)` later to actually run SQL.

#### The routes (URLs the frontend can call)

A **route** = a URL + an HTTP method (GET, POST, PUT, DELETE) + a function that runs when that URL is hit.

##### GET `/table` — fetch everything

```js
app.get("/table", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM shop`);
        const shop = rows.map(row => ({
            ...row,
            models: typeof row.models === "string" ? JSON.parse(row.models) : row.models
        }));
        res.json(shop);
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to fetch shop data" });
    }
});
```

- `app.get(url, handlerFunction)` — **built-in Express method**. Registers what happens when the browser/React sends a `GET` request to `/table`.
- `req` — short for "request". Holds info about what the client sent (headers, body, URL params). We don't use it here since GET /table needs no input.
- `res` — short for "response". We use it to send data back.
- `async (req, res) => {...}` — an **arrow function**, one of JavaScript's ways to write a function. `async` means we can use `await` inside it.
- `pool.query(...)` — **built-in method from mysql2**. Runs a raw SQL string against the database. Returns a **promise**, so we `await` it.
- The backtick string `` `SELECT * FROM shop` `` is a **template literal** — a JS string type that supports `${...}` interpolation.
- `const [rows] = await pool.query(...)` — this uses **array destructuring** (a built-in JS syntax). `pool.query` actually returns `[rows, fields]`; we only care about `rows`, so we destructure just the first item.
- `rows.map(...)` — **built-in JS Array method**. Loops through every row and returns a *new* array where each item is transformed.
- `{...row, models: ...}` — **object spread syntax** (built-in JS). Copies every property from `row` into a new object, then overwrites just the `models` property with our fixed version.
- `typeof row.models === "string"` — `typeof` is a **built-in JS operator** that tells you the type of a value (`"string"`, `"number"`, `"object"`, etc.).
- `JSON.parse(...)` — **built-in global JS function**. Converts a JSON-formatted *string* into a real JS object/array. We only call this if `models` actually came back as a string (MySQL's JSON column sometimes returns it pre-parsed as an array already, and calling `JSON.parse` on a non-string throws an error — this check protects against that).
- `res.json(shop)` — **built-in Express method**. Converts our JS array into a JSON string and sends it back to whoever called this route, with the correct `Content-Type: application/json` header.
- `try { ... } catch (err) { ... }` — **built-in JS error handling**. If anything inside `try` throws (e.g. MySQL connection fails), `catch` runs instead of crashing the whole server.
- `console.error(err)` — **built-in Node function**. Prints the error to the terminal so we (the developer) can see what went wrong — the frontend never sees this raw error, only our friendly `{ error: "..." }` message.

##### POST `/new` — add a new item

```js
app.post("/new", async (req, res) => {
    const { id, prod, comp, quantity, price, models } = req.body;
    if (!prod || !comp || quantity == null || price == null || !models) {
        res.json({ error: "Missing required fields" });
        return;
    }
    try {
        await pool.query(
            `INSERT INTO shop (id, prod, comp, quantity, price, models) VALUES (${id}, '${prod}', '${comp}', ${quantity}, ${price}, '${JSON.stringify(models)}')`
        );
        res.json({ id, prod, comp, quantity, price, models });
    } catch (err) {
        console.error(err);
        res.json({ error: "Failed to insert data" });
    }
});
```

- `app.post(...)` — same idea as `app.get`, but listens for `POST` requests (used when *creating* something).
- `const { id, prod, ... } = req.body` — **object destructuring**. Instead of writing `req.body.id`, `req.body.prod`, etc. five times, this pulls out all five properties from `req.body` in one line.
- `if (!prod || !comp || ...)` — basic validation. `!prod` means "prod is falsy" (empty string, undefined, null, etc.). `||` is the "or" operator — if *any* required field is missing, we reject the request early.
- `res.json({ error: "..." }); return;` — sends the error response, then `return` stops the function so the rest doesn't run.
- Inside the `INSERT` query, we use **template literal interpolation** (`${id}`, `'${prod}'`) to directly build the SQL string. Note: this is not the safest approach (normally you'd use `?` placeholders to prevent SQL injection), but it's simpler to read while learning.
- `JSON.stringify(models)` — the opposite of `JSON.parse`. Converts our JS array (e.g. `["RTX 4070"]`) into a JSON string, because the MySQL `models` column stores JSON as text.

##### PUT `/update/:id` — edit an existing item

```js
app.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { prod, comp, quantity, price, models } = req.body;
    ...
});
```

- `app.put(...)` — listens for `PUT` requests (used when *updating* something that already exists).
- `"/update/:id"` — the `:id` part is a **route parameter**. If React calls `/update/5`, then `req.params.id` will be `"5"`.
- `req.params` — **built-in Express object** holding any `:name` values from the URL.
- The rest works the same as `/new`, but runs an `UPDATE ... WHERE id = ...` SQL statement instead of `INSERT`.
- `result.affectedRows` — MySQL tells us how many rows were actually changed. If it's `0`, no row had that `id`, so we can respond with a "not found" message.

##### DELETE `/delete/:id` — remove an item

```js
app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    ...
    const [result] = await pool.query(`DELETE FROM shop WHERE id = ${id}`);
    ...
});
```

- `app.delete(...)` — listens for `DELETE` requests.
- Same `:id` param pattern, running `DELETE FROM shop WHERE id = ...`.

#### Starting the server

```js
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

- `app.listen(port, callback)` — **built-in Express method**. Starts the server listening on port `3000`. The callback function runs once the server successfully starts, just to log a confirmation message.

---

### 3. The Frontend — `App.jsx`

#### Imports and state

```jsx
import { useState, useEffect } from "react";
```

- `useState` and `useEffect` are **built-in React functions** called "hooks" — they let a plain JS function (your component) have memory (`state`) and run side effects (like fetching data).

```jsx
const [shop, setShop] = useState([]);
const [dark, setDark] = useState(true);
const [selectedItem, setSelectedItem] = useState(null);
```

- `useState(initialValue)` returns an array of exactly two things: the **current value**, and a **function to update it**. We destructure both using array destructuring.
- `shop` — holds the array of all products (starts as an empty array `[]`).
- `setShop(...)` — the only correct way to change `shop`. Calling it tells React "re-render this component with the new value."
- `dark` — a boolean tracking dark/light theme, starts as `true`.
- `selectedItem` — holds the product currently being edited (or `null` if we're adding a new one, not editing).

#### Fetching data when the page loads

```jsx
useEffect(() => {
    fetch("http://localhost:3000/table")
        .then(res => res.json())
        .then(data => setShop(data))
        .catch(err => console.log(err));
}, []);
```

- `useEffect(functionToRun, dependencyArray)` — **built-in React hook**. Runs `functionToRun` after the component renders. The empty array `[]` as the second argument means "only run this once, when the component first appears" (not on every re-render).
- `fetch(url)` — **built-in browser function** (not React-specific). Sends an HTTP request and returns a **Promise**.
- `.then(...)` — **built-in Promise method**. Runs a function once the previous step finishes. Chained `.then()` calls run in order.
- `res.json()` — parses the raw HTTP response body as JSON and returns another Promise resolving to the actual JS data.
- `setShop(data)` — updates our `shop` state with what the server sent back.
- `.catch(err => ...)` — **built-in Promise method**. Runs only if something in the chain fails (network error, server down, etc.).

#### Computing the next ID (frontend-managed version)

```jsx
function getNextId() {
    let maxId = 0;
    for (let i = 0; i < shop.length; i++) {
        if (shop[i].id > maxId) {
            maxId = shop[i].id;
        }
    }
    return maxId + 1;
}
```

- A **regular function declaration** (not a hook, not built-in — this is ours).
- `let maxId = 0` — a normal mutable variable, starts at 0.
- A classic `for` loop — **built-in JS syntax**. Loops through every item's `id`, keeping track of the biggest one seen so far.
- Returns `maxId + 1` — so if the highest existing id is 10, the next new item gets `11`. If `shop` is empty, `maxId` stays `0`, so the first item gets `1`.

#### `handleSave` — deciding between add vs. update

```jsx
const handleSave = async (data) => {
    let found = false;
    let newShop = [];

    for (let i = 0; i < shop.length; i++) {
        if (shop[i].id === data.id) {
            found = true;
            newShop.push({ ...updated fields... });
        } else {
            newShop.push(shop[i]);
        }
    }
    ...
};
```

- `handleSave` is a function we wrote, passed down to `FormCompo` as a prop, and called when the form is submitted.
- `data` — the object `FormCompo` sends us (`productName`, `companyName`, etc., plus `id` if editing).
- `found` — a flag we set to `true` if we find an existing item with the same `id` as the submitted form.
- `newShop` — we build a *brand new array* rather than mutating `shop` directly, because React expects state to be replaced, not changed in place.
- `newShop.push(...)` — **built-in Array method**. Adds an item to the end of the array.
- `shop[i].id === data.id` — `===` is **strict equality** in JS (checks both value and type, safer than `==`).

```jsx
const payload = {
    prod: data.productName,
    comp: data.companyName,
    quantity: Number(data.quantity),
    price: Number(data.price),
    models: [data.modelName],
};
```

- `payload` — the shape of data our backend expects (note the field names change: `productName` -> `prod`, etc., matching our MySQL columns).
- `Number(...)` — **built-in JS function**. Converts a string (from form input) into an actual number, since HTML inputs always give you strings.
- `[data.modelName]` — wraps the single selected model into an array, because our `models` column stores an array (even if there's only one selected).

```jsx
if (found) {
    const result = await apiCall(`http://localhost:3000/update/${data.id}`, "PUT", payload);
    ...
} else {
    const newItem = { id: getNextId(), ...payload };
    const result = await apiCall("http://localhost:3000/new", "POST", newItem);
    ...
    newShop.push(newItem);
}

setShop(newShop);
setSelectedItem(null);
```

- If `found` is true -> call the update route with the existing `id`.
- If false -> generate a new `id`, build `newItem` (using object spread to combine `id` with the rest of `payload`), send it to `/new`, then add it to our local `newShop` array.
- `setShop(newShop)` — tell React to re-render with the updated list.
- `setSelectedItem(null)` — clears the "currently editing" state, so the form resets to "add new" mode.

#### The `apiCall` helper

```jsx
async function apiCall(url, method, body) {
    const options = { method };
    if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    return response.json();
}
```

- A function **we wrote** to avoid repeating the same `fetch` boilerplate for every request.
- `{ method }` — **shorthand object property** (built-in JS). Same as writing `{ method: method }`.
- `options.headers = { "Content-Type": "application/json" }` — tells the server "the body I'm sending is JSON text," so `express.json()` on the backend knows how to parse it.
- `JSON.stringify(body)` — converts our JS object into a JSON string for sending over HTTP (bodies must be text, not live objects).
- Returns `response.json()` — the parsed JSON response from the server.

#### `handleDelete`

```jsx
async function handleDelete(id) {
    const result = await apiCall(`http://localhost:3000/delete/${id}`, "DELETE");
    if (result.error) {
        console.error("Error deleting data:", result.error);
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
```

- Calls the backend first to actually delete the row from MySQL.
- Only updates local `shop` state (removing the item) if the backend delete succeeded — otherwise the frontend and database would drift out of sync.
- `shop[i].id !== id` — keeps every item *except* the one being deleted.

#### `isDark`

```jsx
function isDark() {
    setDark(!dark);
}
```

- `!dark` — **logical NOT operator** (built-in JS). Flips `true` to `false` and vice versa.
- Called when the theme toggle switch changes.

---

### 4. Quick Glossary

| Term | What it means |
|---|---|
| **State** (`useState`) | Data that React "remembers" and re-renders the UI when it changes. |
| **Hook** | A special React function (starts with `use`) that adds capabilities to a component. |
| **Props** | Data passed from a parent component into a child component (e.g. `shop={shop}` into `FormCompo`). |
| **Route** | A URL + HTTP method combo the Express server listens for. |
| **Middleware** | A function that runs on every request before it reaches your route (e.g. `cors()`, `express.json()`). |
| **Promise** | A JS object representing "a value that will exist later" — used for anything async, like `fetch` or database queries. |
| **`async`/`await`** | Syntax that lets you write asynchronous (Promise-based) code that reads like normal step-by-step code. |
| **JSON** | A text format for representing data (objects/arrays) — used to send data between frontend and backend. |
| **`JSON.stringify`** | Converts a JS object/array -> JSON text. |
| **`JSON.parse`** | Converts JSON text -> a JS object/array. |
| **Destructuring** | Shorthand for pulling values out of an object or array into separate variables. |
| **Spread (`...`)** | Copies all properties/items from one object/array into a new one. |

---

### 5. The Full Request Flow (Example: Adding a Product)

1. User fills the form in `FormCompo` and clicks Submit.
2. `FormCompo` calls `onSubmit(form)`, which is actually `handleSave` from `App.jsx`.
3. `handleSave` checks: is this a new item or an edit? (New — `found` stays `false`.)
4. Builds `payload`, generates a new `id` via `getNextId()`.
5. Calls `apiCall(".../new", "POST", newItem)`.
6. `apiCall` does `fetch(...)` with the item as a JSON string in the body.
7. Express's `/new` route receives it, `express.json()` parses `req.body` automatically.
8. Route runs an `INSERT` SQL query via `pool.query(...)`.
9. Route responds with `res.json({...})`.
10. Back in React, `apiCall` parses that response and returns it.
11. `handleSave` pushes the new item into `newShop` and calls `setShop(newShop)`.
12. React re-renders `TabCompo` with the updated list — the new row appears on screen.
