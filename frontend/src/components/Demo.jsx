import {useState} from 'react';
export function Demo(){
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount(count + 1);
        setCount(count + 1);
    };

    return (
        <>
            <h2>{count}</h2>
            <button onClick={increment}>Increment</button>
        </>
    );
}