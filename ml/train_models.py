"""
WP2 — Model training for the AI Healthcare Demo.

Trains three models:
  1. symptom_triage  — 41-class symptom -> condition mapping (powers the symptom checker)
  2. diabetes_risk   — binary risk model on the Pima dataset
  3. heart_risk      — binary risk model on the Cleveland heart dataset

Run:  python train_models.py
Out:  artifacts/*.joblib  + artifacts/benchmark.csv  + artifacts/metrics.json
"""

import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

ART = Path("artifacts")
ART.mkdir(exist_ok=True)
DATA = Path("data")
CV = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)


def candidate_models(multiclass: bool):
    """The four tree algorithms from the spec, benchmarked against each other.

    Why these: the inputs are tabular (binary symptom flags, or a handful of
    numeric clinical features). Gradient-boosted trees and random forests
    dominate this regime — a neural network has nothing to exploit here and
    would train slower for worse results. Benchmarking all four and shipping
    the winner is cheap and gives us a defensible table for the report.
    """
    from catboost import CatBoostClassifier
    from lightgbm import LGBMClassifier
    from xgboost import XGBClassifier

    return {
        "RandomForest": RandomForestClassifier(
            n_estimators=300, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300, max_depth=4, learning_rate=0.05,
            eval_metric="mlogloss" if multiclass else "logloss", random_state=42,
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=300, learning_rate=0.05, random_state=42, verbose=-1
        ),
        "CatBoost": CatBoostClassifier(
            iterations=300, depth=4, learning_rate=0.05, verbose=0, random_state=42
        ),
    }


def benchmark(X, y, multiclass, label):
    """Cross-validated comparison of all four algorithms.

    We use cross-validation rather than a single train/test split because these
    datasets are small (303-768 rows). One split would give a number that swings
    several points depending on the random seed — not something to report.
    """
    # XGBoost requires integer class labels for multiclass, so encode for the
    # benchmark. The shipped model keeps the original string labels.
    y_enc = LabelEncoder().fit_transform(y) if multiclass else y

    rows = []
    for name, model in candidate_models(multiclass).items():
        acc = cross_val_score(model, X, y_enc, cv=CV, scoring="accuracy").mean()
        row = {"dataset": label, "model": name, "cv_accuracy": round(acc, 4)}
        if not multiclass:
            row["cv_roc_auc"] = round(
                cross_val_score(model, X, y_enc, cv=CV, scoring="roc_auc").mean(), 4
            )
        rows.append(row)
        print(f"  {name:14s} acc={acc:.3f}" + (f"  auc={row.get('cv_roc_auc'):.3f}" if not multiclass else ""))
    return pd.DataFrame(rows)


def train_symptom_triage():
    """41-class symptom -> condition model.

    IMPORTANT, and this goes in the report: this dataset is effectively a
    deterministic lookup table. 4,920 rows collapse to 304 unique symptom
    patterns, and every condition has a disjoint signature — so any model
    scores 100%, even under cross-validation on deduplicated rows.

    That is NOT a result. It means the dataset encodes a rule, not a
    probabilistic relationship. We keep it because it drives a working
    symptom-checker demo, but we report it honestly and we do NOT claim
    predictive skill from it. The genuine ML evidence comes from the two
    risk models below, where performance is non-trivial.
    """
    print("\n[1/3] symptom_triage")
    df = pd.read_csv(DATA / "symptoms.csv")
    df = df.loc[:, ~df.columns.str.contains("^Unnamed")].dropna(axis=1, how="all")

    n_raw = len(df)
    df = df.drop_duplicates()            # 4920 -> 304. Without this, the train/test
                                          # split leaks identical rows across both sides.
    print(f"  rows: {n_raw} raw -> {len(df)} unique | classes: {df['prognosis'].nunique()}")

    X = df.drop(columns=["prognosis"])
    y = df["prognosis"]

    bench = benchmark(X, y, multiclass=True, label="symptom_triage")

    model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1).fit(X, y)
    joblib.dump({"model": model, "features": list(X.columns),
                 "classes": list(model.classes_)}, ART / "symptom_triage.joblib")

    return bench, {
        "symptom_triage": {
            "note": "Deterministic dataset — 100% accuracy reflects a lookup "
                    "relationship, not learned predictive skill. Used for the "
                    "symptom-checker demo flow only.",
            "n_unique_rows": len(df),
            "n_classes": int(y.nunique()),
        }
    }


def train_risk_model(name, csv, target, columns=None):
    """Binary clinical risk model. This is where the real ML evidence lives."""
    print(f"\n{name}")
    df = pd.read_csv(DATA / csv, names=columns) if columns else pd.read_csv(DATA / csv)
    df.columns = [c.strip().lstrip("\ufeff") for c in df.columns]

    X = df.drop(columns=[target])
    y = df[target]
    print(f"  rows: {len(df)} | features: {X.shape[1]} | positive rate: {y.mean():.2f}")

    bench = benchmark(X, y, multiclass=False, label=name)

    # Hold out a test set for the final reported numbers, so the metrics we
    # publish come from data the chosen model never saw during selection.
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1).fit(X_tr, y_tr)
    proba = model.predict_proba(X_te)[:, 1]

    metrics = {
        "test_accuracy": round(accuracy_score(y_te, model.predict(X_te)), 4),
        "test_roc_auc": round(roc_auc_score(y_te, proba), 4),
        "n_rows": len(df),
        "report": classification_report(y_te, model.predict(X_te), output_dict=True),
    }
    print(f"  held-out: acc={metrics['test_accuracy']:.3f} auc={metrics['test_roc_auc']:.3f}")

    joblib.dump({"model": model, "features": list(X.columns)}, ART / f"{name}.joblib")
    return bench, {name: metrics}


if __name__ == "__main__":
    benches, metrics = [], {}

    b, m = train_symptom_triage()
    benches.append(b); metrics.update(m)

    b, m = train_risk_model(
        "diabetes_risk", "pima.csv", "target",
        columns=["pregnancies", "glucose", "bp", "skin", "insulin",
                 "bmi", "pedigree", "age", "target"],
    )
    benches.append(b); metrics.update(m)

    b, m = train_risk_model("heart_risk", "heart.csv", "target")
    benches.append(b); metrics.update(m)

    pd.concat(benches).to_csv(ART / "benchmark.csv", index=False)
    (ART / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(f"\nSaved to {ART}/  — benchmark.csv, metrics.json, *.joblib")
