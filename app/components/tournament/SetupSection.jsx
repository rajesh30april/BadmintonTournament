import { Button, Card, CardContent, Input, Select } from "../ui";

export default function SetupSection({
  tournamentName,
  setTournamentName,
  tournamentType,
  setTournamentType,
  configTab,
  setConfigTab,
  tournaments,
  selectedTournamentId,
  deleteTournamentId,
  setDeleteTournamentId,
  selectedTournament,
  currentUser,
  loadingTournaments,
  loadingSelectedTournament,
  savingTournament,
  creatingTournament,
  deletingTournament,
  loadError,
  loadSuccess,
  onRefreshTournaments,
  onLoadTournament,
  onDeleteTournament,
  onAddTournament,
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
  addCategory,
  updateCategoryCount,
  removeCategory,
  applySetupToExistingTeams,
}) {
  const readOnly = currentUser?.role !== "admin" && currentUser?.access !== "write";
  const isTeamType = tournamentType === "team";
  const configTabs = isTeamType
    ? [
        { key: "categories", label: "Categories" },
        { key: "matchtypes", label: "Match Types" },
        { key: "teams", label: "Teams" },
      ]
    : [
        { key: "teams", label: tournamentType === "singles" ? "Players" : "Pairs" },
      ];

  return (
    <Card>
      <CardContent className="grid gap-4">
        <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
            Create Tournament
          </summary>
          <div className="mt-3 grid gap-2">
            <Input
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Tournament name"
              disabled={readOnly}
            />
            <Select
              value={tournamentType}
              onChange={(e) => setTournamentType(e.target.value)}
              disabled={readOnly}
            >
              <option value="team">Team Tournament</option>
              <option value="doubles">Doubles (Pairs)</option>
              <option value="singles">Singles</option>
            </Select>
            <Button
              variant="outline"
              onClick={onAddTournament}
              disabled={readOnly}
              loading={creatingTournament}
            >
              Create Tournament
            </Button>
          </div>
          {readOnly ? (
            <div className="mt-2 text-xs text-amber-600">
              Read-only access. Ask admin to enable write access.
            </div>
          ) : null}
        </details>

        <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
            Manage Tournament
          </summary>
          <div className="mt-3 grid gap-2">
            <Select
              value={deleteTournamentId}
              onChange={(e) => setDeleteTournamentId(e.target.value)}
            >
              <option value="">Select tournament to delete</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.id}
                </option>
              ))}
            </Select>
            <div className="text-xs text-slate-500">
              Delete uses this selection only. Load a tournament from the banner.
            </div>
            <Button
              variant="outline"
              onClick={onDeleteTournament}
              disabled={!deleteTournamentId || readOnly}
              loading={deletingTournament}
            >
              Delete Tournament
            </Button>
            {selectedTournament?.updatedBy ? (
              <div className="text-xs text-slate-500">
                Last saved by <b>{selectedTournament.updatedBy}</b>
              </div>
            ) : null}
            {loadingSelectedTournament ? (
              <div className="text-xs text-slate-500">Loading tournament...</div>
            ) : null}
            {loadError ? <div className="text-xs text-red-600">{loadError}</div> : null}
            {loadSuccess ? <div className="text-xs text-emerald-600">{loadSuccess}</div> : null}
          </div>
        </details>

        <div>
          <div className="text-xl font-extrabold">Setup</div>
          <div className="text-sm text-slate-500">
            {isTeamType
              ? "Configure categories and create teams"
              : "Register pairs/players and add match history"}
          </div>
        </div>

        <div className="border-b border-slate-200">
          <div className="-mb-px flex gap-2 overflow-x-auto pb-1">
            {configTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setConfigTab(tab.key)}
                className={`whitespace-nowrap rounded-t-xl px-3 py-2 text-xs font-semibold ${
                  configTab === tab.key
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "border-b-2 border-transparent text-slate-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {!selectedTournamentId ? (
            <div className="py-2 text-xs text-slate-500">
              Select a tournament to edit its config.
            </div>
          ) : null}
        </div>

        {isTeamType && (!selectedTournamentId || configTab === "categories") && (
        <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
            Player Categories (Global)
          </summary>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {categories.length} configured
            </span>
          </div>

          <div className="mt-2 border rounded-2xl bg-white overflow-hidden">
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
                      disabled={readOnly}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        className="px-2"
                        onClick={() => removeCategory(k)}
                        title="Remove category"
                        disabled={readOnly}
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
              disabled={readOnly}
            />
            <Input
              type="number"
              placeholder="# players"
              value={newCategoryCount}
              onChange={(e) => setNewCategoryCount(e.target.value)}
              disabled={readOnly}
            />
          </div>

          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={addCategory}
              disabled={readOnly}
            >
              + Add Category
            </Button>
            <Button
              className="w-full"
              onClick={applySetupToExistingTeams}
              disabled={teams.length === 0 || readOnly || !isTeamType}
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
        </details>
        )}

        {isTeamType && (!selectedTournamentId || configTab === "matchtypes") && (
        <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
          <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
            Match Type Counts
          </summary>
          <div className="mt-3 text-xs font-bold text-slate-500">
            Set 0 to disable (ex: BB = 0)
          </div>

          {matchTypeOptions.length === 0 ? (
            <div className="mt-2 px-4 py-3 text-sm text-slate-600 border rounded-2xl bg-white">
              Add categories to configure match types.
            </div>
          ) : (
            <div className="mt-2 border rounded-2xl bg-white overflow-hidden">
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
                    disabled={readOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </details>
        )}

        {configTab === "teams" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            {selectedTournamentId
              ? "Open the Teams tab to add teams and members."
              : "No tournament selected. Choose one above to edit teams."}
          </div>
        )}

        <div className="hidden" />
      </CardContent>
    </Card>
  );
}
