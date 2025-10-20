import { useEffect, useState } from "preact/hooks";

interface Question {
  key: string;
  question: string;
  type: string;
  options?: string[];
  placeholder?: string;
  label?: string;
}

export default function QuestionnaireIsland({ userEmail }: { userEmail: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/questionnaire/questionnaire")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load questionnaire.");
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: any) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Require consent checkbox
    if (!responses["consent"]) {
      setError("You must provide consent to continue.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/questionnaire/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, responses }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to submit questionnaire.");
      }
    } catch {
      setError("Failed to submit questionnaire.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div>Loading questionnaire...</div>;
  }
  if (submitted) {
    return (
      <div class="p-6 text-center">
        <h2 class="text-2xl font-bold mb-2">Thank you!</h2>
        <p>Your responses have been recorded.</p>
      </div>
    );
  }

  return (
    <form class="max-w-xl mx-auto p-4 space-y-6" onSubmit={handleSubmit}>
      <h2 class="text-xl font-bold mb-4">Annotator Questionnaire</h2>
      {questions.map((q) => (
        <div key={q.key} class="space-y-2">
          <label class="block font-medium">
            {q.question}
            {q.type !== "checkbox" && <span class="text-red-500">*</span>}
          </label>
          {q.type === "select" && (
            <select
              class="w-full border rounded p-2"
              required
              value={responses[q.key] ?? ""}
              onChange={(e) => handleChange(q.key, (e.target as HTMLSelectElement).value)}
            >
              <option value="" disabled>Select...</option>
              {q.options?.map((opt) => (
                <option value={opt} key={opt}>{opt}</option>
              ))}
            </select>
          )}
          {q.type === "text" && (
            <input
              class="w-full border rounded p-2"
              type="text"
              required
              placeholder={q.placeholder ?? ""}
              value={responses[q.key] ?? ""}
              onInput={(e) => handleChange(q.key, (e.target as HTMLInputElement).value)}
            />
          )}
          {q.type === "textarea" && (
            <textarea
              class="w-full border rounded p-2"
              placeholder={q.placeholder ?? ""}
              value={responses[q.key] ?? ""}
              onInput={(e) => handleChange(q.key, (e.target as HTMLTextAreaElement).value)}
              rows={3}
            />
          )}
          {q.type === "checkbox" && (
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!responses[q.key]}
                onChange={(e) => handleChange(q.key, (e.target as HTMLInputElement).checked)}
                required
              />
              {q.label}
            </label>
          )}
        </div>
      ))}
      {error && <div class="text-red-600">{error}</div>}
      <button
        type="submit"
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
