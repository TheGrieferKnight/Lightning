import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Searchbar() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload
    if (name.trim()) {
      navigate(`/dashboard/${encodeURIComponent(name.trim())}`);
    }
  };
  return (
    <div className="flex self-center w-120 h-6">
      <form onSubmit={handleSubmit}>
        <input
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter summoner name..."
          className="border-2 rounded-full flex w-120"
        ></input>
      </form>
    </div>
  );
}
