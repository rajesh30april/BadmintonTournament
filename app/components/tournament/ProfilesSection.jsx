import { Button, Card, CardContent, Input, Select } from "../ui";

export default function ProfilesSection({
  profiles,
  setProfiles,
  onSave,
  saving = false,
  canSave = false,
  hasTournament = false,
  readOnly = false,
}) {
  const addProfile = () => {
    setProfiles((prev) => [
      ...prev,
      { id: `p-${Math.random().toString(36).slice(2, 8)}`, name: "", role: "player", phone: "" },
    ]);
  };

  const updateProfile = (id, patch) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const removeProfile = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="grid gap-3">
      <div>
        <div className="text-xl font-extrabold">Players</div>
        <div className="text-xs text-slate-500">
          Add players and owners with phone numbers.
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <Button onClick={addProfile} disabled={readOnly || !hasTournament}>
              + Add Player
            </Button>
            <Button
              variant="outline"
              onClick={onSave}
              disabled={!canSave || !hasTournament || saving}
              loading={saving}
            >
              Save Players
            </Button>
          </div>
          {!hasTournament ? (
            <div className="text-xs text-slate-500">
              Select and load a tournament first.
            </div>
          ) : null}
          {profiles.length === 0 ? (
            <div className="text-sm text-slate-600">No players yet.</div>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) => updateProfile(p.id, { name: e.target.value })}
                    disabled={readOnly}
                  />
                  <Input
                    placeholder="Phone"
                    value={p.phone || ""}
                    onChange={(e) => updateProfile(p.id, { phone: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={p.role || "player"}
                    onChange={(e) => updateProfile(p.id, { role: e.target.value })}
                    disabled={readOnly}
                  >
                    <option value="player">Player</option>
                    <option value="owner">Owner</option>
                    <option value="both">Player + Owner</option>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => removeProfile(p.id)}
                    disabled={readOnly}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
