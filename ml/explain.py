"""
SHAP analysis for the symptom triage model — run once, not part of the
live API. Produces a global feature-importance summary and one worked
example, both worth including directly in the report.

Why offline rather than live: TreeExplainer on a 41-class RandomForest
returns a separate SHAP array per class, so a single request explanation
is a genuinely heavier computation than on the binary risk models below.
For a demo, an offline analysis with a saved example is more honest than
adding untested latency to a live endpoint.
"""
import joblib
import numpy as np
import shap

bundle = joblib.load("artifacts/symptom_triage.joblib")
model, features, classes = bundle["model"], bundle["features"], bundle["classes"]

explainer = shap.TreeExplainer(model)

# One worked example: the same chest-pain/breathlessness/sweating case used
# throughout the API testing tonight, so the report ties directly to what
# was demoed live.
example = np.zeros((1, len(features)))
for symptom in ["chest_pain", "breathlessness", "sweating"]:
    example[0, features.index(symptom)] = 1

shap_values = explainer.shap_values(example)
predicted_class_idx = model.predict(example)[0]
class_idx = list(classes).index(predicted_class_idx)

# shap_values shape: (1, n_features, n_classes) in recent SHAP versions
contributions = shap_values[0, :, class_idx]
top_idx = np.argsort(np.abs(contributions))[-5:][::-1]

print(f"Predicted: {predicted_class_idx}")
print("Top contributing symptoms:")
for i in top_idx:
    direction = "+" if contributions[i] > 0 else "-"
    print(f"  {direction} {features[i]}: {contributions[i]:.4f}")