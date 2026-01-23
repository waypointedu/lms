"use client";

import { useEffect, useState } from "react";

import { SessionGate } from "@/components/auth/session-gate";
import { AdminGate } from "@/components/admin/admin-gate";
import { getSupabaseClient } from "@/lib/supabase/client";

type ProgramRow = {
  id: string;
  name: string;
  description: string | null;
};

type LoadState = "idle" | "loading" | "error";

export default function AdminProgramsPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const reload = async () => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("programs")
        .select("id, name, description")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      setPrograms((data ?? []) as ProgramRow[]);
      setLoadState("idle");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load programs.";
      setErrorMessage(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      setErrorMessage("Program name is required.");
      return;
    }

    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.from("programs").insert({
        name: newName.trim(),
        description: newDescription.trim() || null,
      });

      if (error) {
        throw error;
      }

      setNewName("");
      setNewDescription("");
      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create program.";
      setErrorMessage(message);
    }
  };

  const handleUpdate = async (program: ProgramRow) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("programs")
        .update({
          name: program.name,
          description: program.description,
        })
        .eq("id", program.id);

      if (error) {
        throw error;
      }

      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update program.";
      setErrorMessage(message);
    }
  };

  const handleDelete = async (programId: string) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) {
        throw error;
      }

      await reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete program.";
      setErrorMessage(message);
    }
  };

  return (
    <SessionGate>
      <AdminGate>
        <main>
          <h1>Programs</h1>
          <p>Create and manage programs.</p>

          {loadState === "error" && (
            <p style={{ color: "#b91c1c" }}>{errorMessage}</p>
          )}

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: "1.1rem" }}>New program</h2>
            <div style={{ marginTop: 12, maxWidth: 520 }}>
              <label htmlFor="program-name">Name</label>
              <input
                id="program-name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div style={{ marginTop: 12, maxWidth: 520 }}>
              <label htmlFor="program-description">Description</label>
              <textarea
                id="program-description"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                rows={3}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Create program
            </button>
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: "1.1rem" }}>Existing programs</h2>
            {loadState === "loading" && <p>Loading programs…</p>}
            {programs.length === 0 && loadState === "idle" ? (
              <p>No programs created yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {programs.map((program, index) => (
                  <div
                    key={program.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "grid", gap: 8 }}>
                      <input
                        value={program.name}
                        onChange={(event) => {
                          const updated = [...programs];
                          updated[index] = {
                            ...program,
                            name: event.target.value,
                          };
                          setPrograms(updated);
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      />
                      <textarea
                        value={program.description ?? ""}
                        onChange={(event) => {
                          const updated = [...programs];
                          updated[index] = {
                            ...program,
                            description: event.target.value || null,
                          };
                          setPrograms(updated);
                        }}
                        rows={3}
                        style={{
                          padding: 8,
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleUpdate(program)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #111827",
                          background: "#fff",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(program.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #b91c1c",
                          color: "#b91c1c",
                          background: "#fff",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </AdminGate>
    </SessionGate>
  );
}
