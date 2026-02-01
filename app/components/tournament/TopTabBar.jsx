import { TabBtn } from "../ui";

export default function TopTabBar({ tab, setTab }) {
  return (
    <div className="sticky top-[54px] z-20 bg-white border-b border-slate-200 px-4 py-2">
      <div className="grid grid-cols-5 gap-2">
        <TabBtn label="Setup" active={tab === "setup"} onClick={() => setTab("setup")} />
        <TabBtn label="Teams" active={tab === "teams"} onClick={() => setTab("teams")} />
        <TabBtn
          label="Matches"
          active={tab === "matches"}
          onClick={() => setTab("matches")}
        />
        <TabBtn label="Score" active={tab === "score"} onClick={() => setTab("score")} />
        <TabBtn
          label="Standing"
          active={tab === "standings"}
          onClick={() => setTab("standings")}
        />
      </div>
    </div>
  );
}
