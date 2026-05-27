"use client";

import { useState } from "react";
import { filterOptions } from "@/lib/mock-data";

interface FilterState {
  search: string;
  budget: string;
  industry: string;
  province: string;
  score: string;
  status: string;
}

const initial: FilterState = {
  search: "",
  budget: filterOptions.budget[0],
  industry: filterOptions.industry[0],
  province: filterOptions.province[0],
  score: filterOptions.score[0],
  status: filterOptions.status[0],
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="filter-field">
      <span className="filter-field-label">{label}</span>
      {children}
    </label>
  );
}

export default function LeadsFilters() {
  const [state, setState] = useState<FilterState>(initial);

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setState(initial);
  }

  return (
    <aside className="filters-panel" aria-label="Lead filters">
      <header className="filters-head">
        <h2>Filters</h2>
        <button type="button" onClick={reset} className="filter-reset">
          Reset
        </button>
      </header>

      <Field label="Search Investor">
        <input
          type="search"
          value={state.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search by name, email, or phone…"
          className="filter-input"
        />
      </Field>

      <Field label="Budget Range">
        <select
          value={state.budget}
          onChange={(event) => update("budget", event.target.value)}
          className="filter-select"
        >
          {filterOptions.budget.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Preferred Industry">
        <select
          value={state.industry}
          onChange={(event) => update("industry", event.target.value)}
          className="filter-select"
        >
          {filterOptions.industry.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Target Province">
        <select
          value={state.province}
          onChange={(event) => update("province", event.target.value)}
          className="filter-select"
        >
          {filterOptions.province.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="AI Match Score">
        <select
          value={state.score}
          onChange={(event) => update("score", event.target.value)}
          className="filter-select"
        >
          {filterOptions.score.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Consultation Status">
        <select
          value={state.status}
          onChange={(event) => update("status", event.target.value)}
          className="filter-select"
        >
          {filterOptions.status.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <button type="button" className="filter-more" aria-expanded="false">
        More Filters
      </button>

      <div className="filters-actions">
        <button type="button" onClick={reset} className="button button-ghost">
          Clear Filters
        </button>
        <button type="button" className="button button-success">
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
