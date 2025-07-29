import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

function App() {
  const [result, setResult] = useState('');

  const getData = async () => {
    try {
      const response = await invoke<string>('fetch_data');
      setResult(response);
    } catch (error) {
      console.error('Error: ', error);
      setResult('Failed to fetch data.')
    }
  }
  return(
    <>
    <div className="p-4">
      <button onClick={getData} className="px-4 py-2 bg-blue-500 text-white rounded">
        Call Rust
      </button>
      <pre className="mt-4 whitespace-pre-wrap break-words">{result}</pre>
    </div>
    <div className="grid grid-cols-3 grid-rows-5">
      <div className="bg-gray p-4">1</div>
      <div className="bg-gray p-4">2</div>
      <div className="bg-gray p-4">3</div>
      <div className="bg-gray p-4">4</div>
      <div className="bg-gray p-4">5</div>
      <div className="bg-gray p-4">6</div>
      <div className="bg-gray p-4">7</div>
      <div className="bg-gray p-4">8</div>
      <div className="bg-gray p-4">9</div>
      <div className="bg-gray p-4">10</div>
      <div className="bg-gray p-4">11</div>
      <div className="bg-gray p-4">12</div>
      <div className="bg-gray p-4">13</div>
      <div className="bg-gray p-4">14</div>
      <div className="bg-gray p-4">15</div>
    </div>
    </>
  )
}

export default App;
