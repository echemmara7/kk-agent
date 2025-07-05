"use client";

import React, { useEffect, useState } from "react";

interface Provider {
  id: string;
  name: string;
  description: string;
  type: "native" | "connectable";
  installed: boolean;
  plans?: string[];
  website?: string;
  pricing?: string;
  documentation?: string;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [installationName, setInstallationName] = useState("");
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers");
        if (!res.ok) throw new Error("Failed to fetch providers");
        const data = await res.json();
        setProviders(data.providers);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchProviders();
  }, []);

  async function handleInstall() {
    if (!selectedProvider || !selectedPlan || !installationName.trim()) {
      setError("Please select a provider, plan, and provide an installation name.");
      return;
    }
    setInstalling(true);
    setError(null);
    try {
      const res = await fetch("/api/providers/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          plan: selectedPlan,
          installationName: installationName.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Installation failed");
      }
      // Refresh providers list after install
      const updatedRes = await fetch("/api/providers");
      const updatedData = await updatedRes.json();
      setProviders(updatedData.providers);
      setSelectedProvider(null);
      setSelectedPlan(null);
      setInstallationName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInstalling(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Providers</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Installed Providers</h2>
        {providers.filter((p) => p.installed).length === 0 && (
          <p>No installed providers found.</p>
        )}
        <ul className="space-y-2">
          {providers
            .filter((p) => p.installed)
            .map((provider) => (
              <li key={provider.id} className="border p-3 rounded shadow">
                <h3 className="font-semibold">{provider.name}</h3>
                <p>{provider.description}</p>
                {/* Additional management UI can be added here */}
              </li>
            ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Marketplace AI Providers</h2>
        {providers.filter((p) => !p.installed).length === 0 && (
          <p>No available providers to install.</p>
        )}
        <ul className="space-y-4">
          {providers
            .filter((p) => !p.installed)
            .map((provider) => (
              <li
                key={provider.id}
                className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedProvider(provider);
                  setSelectedPlan(null);
                  setInstallationName("");
                  setError(null);
                }}
              >
                <h3 className="font-semibold">{provider.name}</h3>
                <p>{provider.description}</p>
                {provider.website && (
                  <p>
                    Website:{" "}
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {provider.website}
                    </a>
                  </p>
                )}
                {provider.pricing && <p>Pricing: {provider.pricing}</p>}
                {provider.documentation && (
                  <p>
                    Docs:{" "}
                    <a
                      href={provider.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Documentation
                    </a>
                  </p>
                )}
              </li>
            ))}
        </ul>
      </section>

      {selectedProvider && selectedProvider.type === "native" && (
        <section className="mt-8 border p-4 rounded shadow bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Install Native Integration Provider</h2>
          <p className="mb-4">{selectedProvider.description}</p>
          <label className="block mb-2 font-semibold" htmlFor="plan-select">
            Select a plan:
          </label>
          <select
            id="plan-select"
            className="border rounded p-2 mb-4 w-full"
            value={selectedPlan || ""}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="" disabled>
              -- Select a plan --
            </option>
            {selectedProvider.plans?.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-semibold" htmlFor="installation-name">
            Installation name:
          </label>
          <input
            id="installation-name"
            type="text"
            className="border rounded p-2 mb-4 w-full"
            value={installationName}
            onChange={(e) => setInstallationName(e.target.value)}
            placeholder="Enter a name for this installation"
          />

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? "Installing..." : "Install"}
          </button>
        </section>
      )}

      {selectedProvider && selectedProvider.type === "connectable" && (
        <section className="mt-8 border p-4 rounded shadow bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Connect Account Provider</h2>
          <p className="mb-4">{selectedProvider.description}</p>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => {
              // Redirect to provider connection flow
              window.open(
                `/api/providers/connect?providerId=${encodeURIComponent(selectedProvider.id)}`,
                "_blank"
              );
            }}
          >
            Add Provider
          </button>
        </section>
      )}
    </main>
  );
}
