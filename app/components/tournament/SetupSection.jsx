import { Button, Card, CardContent, Input, Select } from "../ui";

export default function SetupSection({
  tournamentName,
  setTournamentName,
  tournaments,
  selectedTournamentId,
  setSelectedTournamentId,
  selectedTournament,
  currentUser,
  loadingTournaments,
  loadingSelectedTournament,
  savingTournament,
  loadError,
  loadSuccess,
  onRefreshTournaments,
  onLoadTournament,
  categories,
  categoriesByKey,
  categoryKeysSorted,
  newCategoryKey,
  setNewCategoryKey,
  newCategoryCount,
  setNewCategoryCount,
  matchTypeOptions,
  matchTypeConfig,
  setMatchTypeConfig,
  teams,
  totalPlayers,
  newTeamName,
  setNewTeamName,
  addCategory,
  updateCategoryCount,
  removeCategory,
  applySetupToExistingTeams,
  addTeam,
}) {
  const readOnly = currentUser?.role !== "admin" && currentUser?.access !== "write";

  return (
    <Card>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-extrabold">Tournaments</div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
            >
              <option value="">Select tournament</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.id}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={onRefreshTournaments} disabled={loadingTournaments}>
              {loadingTournaments ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={onLoadTournament} disabled={!selectedTournamentId}>
              Load
            </Button>
          </div>
          {selectedTournament?.updatedBy ? (
            <div className="text-xs text-slate-500">
              Last saved by <b>{selectedTournament.updatedBy}</b>
            </div>
          ) : null}
          {readOnly ? (
            <div className="text-xs text-amber-600">
              Read-only access. Ask admin to enable write access.
            </div>
          ) : null}
          {loadingSelectedTournament ? (
            <div className="text-xs text-slate-500">Loading tournament...</div>
          ) : null}
          {loadError ? <div className="text-xs text-red-600">{loadError}</div> : null}
          {loadSuccess ? <div className="text-xs text-emerald-600">{loadSuccess}</div> : null}
        </div>

        <div>
          <div className="text-xl font-extrabold">Setup</div>
          <div className="text-sm text-slate-500">
            Configure categories and create teams
          </div>
        </div>

        <div>
          <div className="text-sm font-bold mb-2">Tournament Name</div>
          <Input
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="Ex: Friday League"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-extrabold">Player Categories (Global)</div>
            <span className="text-xs font-bold text-slate-500">
              {categories.length} configured
            </span>
          </div>

          <div className="border rounded-2xl bg-white overflow-hidden">
            <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-extrabold bg-slate-50 border-b">
              <div>Category</div>
              <div>Count / Team</div>
              <div className="text-right">Remove</div>
            </div>

            {categoryKeysSorted.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">
                Add categories like <b>A = 3</b>, <b>B = 4</b>. Teams will auto-create
                A1..A3, B1..B4.
              </div>
            ) : (
              categoryKeysSorted.map((k) => {
                const c = categoriesByKey[k];
                return (
                  <div
                    key={k}
                    className="grid grid-cols-3 gap-2 px-3 py-2 items-center border-b last:border-b-0"
                  >
                    <div className="font-extrabold">{k}</div>
                    <Input
                      type="number"
                      min={0}
                      value={c?.count ?? 0}
                      onChange={(e) => updateCategoryCount(k, Number(e.target.value))}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        className="px-2"
                        onClick={() => removeCategory(k)}
                        title="Remove category"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input
              placeholder="New category (ex: A)"
              value={newCategoryKey}
              onChange={(e) => setNewCategoryKey(e.target.value)}
            />
            <Input
              type="number"
              placeholder="# players"
              value={newCategoryCount}
              onChange={(e) => setNewCategoryCount(e.target.value)}
            />
          </div>

          <div className="mt-2 flex gap-2">
            <Button variant="outline" className="w-full" onClick={addCategory}>
              + Add Category
            </Button>
            <Button
              className="w-full"
              onClick={applySetupToExistingTeams}
              disabled={teams.length === 0}
            >
              Apply to Teams
            </Button>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Match types auto from categories:{" "}
            <b>
              {matchTypeOptions.length
                ? matchTypeOptions.map((opt) => opt.label).join(", ")
                : "(add categories)"}
            </b>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-extrabold">Match Type Counts</div>
            <span className="text-xs font-bold text-slate-500">
              Set 0 to disable (ex: BB = 0)
            </span>
          </div>

          {matchTypeOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-600 border rounded-2xl bg-white">
              Add categories to configure match types.
            </div>
          ) : (
            <div className="border rounded-2xl bg-white overflow-hidden">
              <div className="grid grid-cols-2 gap-2 px-3 py-2 text-xs font-extrabold bg-slate-50 border-b">
                <div>Type</div>
                <div className="text-right">Count / Fixture</div>
              </div>
              {matchTypeOptions.map((opt) => (
                <div
                  key={opt.key}
                  className="grid grid-cols-2 gap-2 px-3 py-2 items-center border-b last:border-b-0"
                >
                  <div className="font-extrabold">{opt.label}</div>
                  <Input
                    type="number"
                    min={0}
                    className="text-right"
                    value={matchTypeConfig?.[opt.key] ?? 0}
                    onChange={(e) => {
                      const next = Math.max(0, Number(e.target.value || 0));
                      setMatchTypeConfig((prev) => ({ ...prev, [opt.key]: next }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-extrabold">Teams</div>
            <span className="text-xs font-bold text-slate-500">
              {teams.length} teams • {totalPlayers} players
            </span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={categories.length ? "Team name" : "Add categories first"}
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              disabled={!categories.length}
            />
            <Button className="shrink-0" onClick={addTeam} disabled={!categories.length}>
              + Add
            </Button>
          </div>
          {teams.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {teams.map((t) => (
                <span
                  key={t.name}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {t.name}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-500">No teams added yet.</div>
          )}
        </div>

        <div className="hidden" />
      </CardContent>
    </Card>
  );
}
