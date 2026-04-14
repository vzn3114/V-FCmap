import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import { fetchTeams } from "../../redux/slices/teamSlice";

const tiers = ["", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

export default function TeamsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.teams);
  const [tier, setTier] = useState("");
  const [minRankingPoints, setMinRankingPoints] = useState(0);

  useEffect(() => {
    dispatch(fetchTeams({}));
  }, [dispatch]);

  const onFilter = (e) => {
    e.preventDefault();
    dispatch(fetchTeams({ tier: tier || undefined, minRankingPoints: Number(minRankingPoints) || 0 }));
  };

  return (
    <section className="space-y-5">
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl">Doi bong</h1>
        <p className="muted mt-1">Du lieu lay truc tiep tu API /api/teams.</p>

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onFilter}>
          <div className="md:col-span-4">
            <label className="label-base">Tier</label>
            <select className="input-base" value={tier} onChange={(e) => setTier(e.target.value)}>
              {tiers.map((t) => (
                <option key={t || "ALL"} value={t}>{t || "Tat ca"}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Min ranking points</label>
            <input className="input-base" min={0} type="number" value={minRankingPoints} onChange={(e) => setMinRankingPoints(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <button className="btn-primary" type="submit">Loc doi</button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="muted">Dang tai du lieu doi bong...</p>
        ) : items.length === 0 ? (
          <p className="muted">Khong co doi nao.</p>
        ) : (
          items.map((team) => (
            <article className="glass-panel p-4" key={team.id}>
              <h3 className="title-lg">{team.name}</h3>
              <p className="mt-1 text-sm text-[#5f6f65]">Tier: <span className="font-semibold text-[#2a7e35]">{team.tier}</span></p>
              <p className="text-sm text-[#5f6f65]">Ranking points: <span className="font-semibold text-[#4f3f67]">{team.rankingPoints}</span></p>
              <p className="text-sm text-[#5f6f65]">Win streak: <span className="font-semibold text-[#4f3f67]">{team.winningStreak}</span></p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
