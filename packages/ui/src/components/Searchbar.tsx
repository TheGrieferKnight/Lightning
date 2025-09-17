import { useDashboardData } from "../../../client/src/hooks/useDashboardData";

export const Searchbar = () => (
  <div className="flex self-center w-120 h-6">
    <input
      onChange={(e) => useDashboardData(e.target.value)}
      className="border-2 rounded-full flex w-120"
    ></input>
  </div>
);
