"""
Curated reference corpus for the chatbot's RAG grounding. Hand-written,
deliberately short summaries — not scraped from any external source, to
keep licensing simple and content tightly scoped to what the app's own
triage model and red-flag rules already cover.

This is NOT a comprehensive medical reference. It exists to give the
chatbot a trustworthy grounding set so answers cite specific retrieved
text rather than the model's own possibly-wrong training data.

50 entries, organised loosely by body system / presentation, aligned with
the 41-condition triage dataset and the ten red-flag rules already built
into the safety layer — the chatbot should never contradict what those
already say about urgency.
"""

CORPUS = [
    # --- General / systemic ---
    {
        "topic": "Fever",
        "text": "A fever is a body temperature above 38°C (100.4°F). Common "
                "causes include infections, colds, and flu. Most fevers "
                "resolve with rest, fluids, and over-the-counter fever "
                "reducers like paracetamol. Seek medical care if the fever "
                "exceeds 39.5°C, lasts more than three days, or is "
                "accompanied by a stiff neck, rash, confusion, or "
                "difficulty breathing.",
    },
    {
        "topic": "Fatigue",
        "text": "Ongoing tiredness can result from poor sleep, stress, "
                "anaemia, thyroid problems, or infection. Fatigue lasting "
                "more than two weeks despite adequate rest, or accompanied "
                "by unexplained weight loss, fever, or shortness of "
                "breath, warrants a medical evaluation.",
    },
    {
        "topic": "Unexplained weight loss",
        "text": "Losing more than 5% of body weight over six to twelve "
                "months without trying can indicate an underlying "
                "condition such as thyroid disease, diabetes, infection, "
                "or in some cases cancer. This should be evaluated by a "
                "doctor rather than monitored alone.",
    },
    {
        "topic": "Dehydration",
        "text": "Dehydration symptoms include thirst, dry mouth, reduced "
                "urination, dizziness, and fatigue. Mild dehydration "
                "improves with fluids and electrolytes. Severe "
                "dehydration — especially with persistent vomiting, "
                "sunken eyes, or confusion — requires urgent medical care, "
                "particularly in children and older adults.",
    },
    {
        "topic": "Chills and sweating",
        "text": "Chills and night sweats often accompany a fever or "
                "infection. If they occur without a measurable fever, or "
                "persist for more than a week, they can indicate an "
                "underlying infection or other condition worth "
                "investigating with a doctor.",
    },

    # --- Cardiac / circulatory ---
    {
        "topic": "Chest pain",
        "text": "Chest pain has many causes, from muscle strain to "
                "digestive issues to heart problems. Chest pain combined "
                "with shortness of breath, sweating, pain radiating to the "
                "arm or jaw, or a feeling of pressure is a medical "
                "emergency and requires immediate care — it can indicate a "
                "heart attack.",
        "emergency": True,
    },
    {
        "topic": "Heart disease risk factors",
        "text": "Cardiovascular disease risk increases with high blood "
                "pressure, high cholesterol, smoking, diabetes, obesity, "
                "and family history. Warning signs include chest "
                "discomfort, shortness of breath, and unusual fatigue "
                "during activity. Risk screening tools estimate likelihood "
                "and are not a substitute for clinical evaluation.",
        "emergency": True,
    },
    {
        "topic": "Palpitations",
        "text": "A racing, fluttering, or pounding heartbeat can result "
                "from caffeine, stress, or anxiety, and is often harmless. "
                "Palpitations with chest pain, fainting, or shortness of "
                "breath should be assessed promptly, as they can indicate "
                "a heart rhythm problem.",
    },
    {
        "topic": "Swollen legs or ankles",
        "text": "Mild swelling after long periods of standing or sitting "
                "is common. Swelling that is sudden, one-sided, painful, "
                "or accompanied by shortness of breath can indicate a "
                "blood clot or heart problem and needs urgent evaluation.",
    },
    {
        "topic": "High blood pressure",
        "text": "High blood pressure usually has no symptoms and is "
                "detected through routine checks. Uncontrolled high blood "
                "pressure increases the risk of heart attack, stroke, and "
                "kidney disease. Severe headache, vision changes, or chest "
                "pain alongside very high readings needs emergency care.",
    },

    # --- Respiratory ---
    {
        "topic": "Cough",
        "text": "A cough lasting under two to three weeks is usually due "
                "to a cold, flu, or mild respiratory infection and often "
                "resolves on its own. A cough lasting longer than three "
                "weeks, or one that produces blood or is accompanied by "
                "significant weight loss or night sweats, should be "
                "evaluated by a doctor.",
    },
    {
        "topic": "Breathlessness",
        "text": "Shortness of breath can result from exertion, anxiety, "
                "asthma, or infection. Sudden or severe breathlessness, "
                "especially with chest pain, blue lips, or an inability to "
                "speak in full sentences, is a medical emergency.",
        "emergency": True,
        
    },
    {
        "topic": "Sore throat",
        "text": "Most sore throats are caused by viral infections and "
                "improve within a week with rest, fluids, and lozenges. A "
                "sore throat with high fever, difficulty swallowing, "
                "drooling, or difficulty breathing should be seen by a "
                "doctor promptly.",
    },
    {
        "topic": "Runny nose and congestion",
        "text": "Nasal congestion and a runny nose are common with colds "
                "and allergies and typically resolve within one to two "
                "weeks. Symptoms lasting longer, or with facial pain and "
                "fever, may indicate a sinus infection worth evaluating.",
    },
    {
        "topic": "Wheezing",
        "text": "A whistling sound while breathing can indicate narrowed "
                "airways from asthma, allergies, or infection. New or "
                "worsening wheezing, especially with breathlessness, "
                "should be evaluated, and severe wheezing with difficulty "
                "speaking is an emergency.",
    },

    # --- Neurological ---
    {
        "topic": "Headache",
        "text": "Most headaches are tension-type or migraine and improve "
                "with rest, hydration, and over-the-counter pain relief. "
                "A sudden, severe headache unlike any experienced before — "
                "especially with vision changes, confusion, slurred "
                "speech, or neck stiffness — requires emergency evaluation, "
                "as it can indicate a serious underlying condition.",
    },
    {
        "topic": "Stroke warning signs",
        "text": "Sudden weakness on one side of the body, slurred or "
                "confused speech, drooping on one side of the face, or "
                "sudden vision loss can indicate a stroke. This is a "
                "medical emergency — time-sensitive treatment "
                "significantly affects outcomes. Call emergency services "
                "immediately if these symptoms appear.",
        "emergency": True,
    },
    {
        "topic": "Dizziness",
        "text": "Brief dizziness is often caused by dehydration, standing "
                "up quickly, or inner ear issues. Dizziness with chest "
                "pain, severe headache, slurred speech, or difficulty "
                "walking needs urgent evaluation, as it can indicate a "
                "more serious cause.",
    },
    {
        "topic": "Loss of balance",
        "text": "Occasional unsteadiness can result from inner ear "
                "problems or fatigue. Sudden loss of balance combined with "
                "weakness, vision changes, or slurred speech is an "
                "emergency and may indicate a stroke.",
    },
    {
        "topic": "Confusion or altered mental state",
        "text": "Sudden confusion, disorientation, or difficulty thinking "
                "clearly can indicate infection, low blood sugar, a "
                "reaction to medication, or a neurological event. This "
                "should be assessed urgently, especially in older adults "
                "or if it comes on suddenly.",
        "emergency": True,
    },
    {
        "topic": "Seizure",
        "text": "A first-time seizure, or a seizure lasting longer than "
                "five minutes, or repeated seizures without regaining "
                "consciousness in between, is a medical emergency requiring "
                "immediate care.",
        "emergency": True,
    },

    # --- Gastrointestinal ---
    {
        "topic": "Nausea and vomiting",
        "text": "Short-term nausea and vomiting are commonly caused by "
                "viral infections, food poisoning, or motion sickness, and "
                "usually resolve with rest and small sips of fluids. "
                "Persistent vomiting lasting more than 24 hours, or "
                "vomiting with severe abdominal pain, blood, or signs of "
                "dehydration, needs medical evaluation.",
    },
    {
        "topic": "Abdominal pain",
        "text": "Mild abdominal pain often relates to digestion, gas, or "
                "minor infection. Severe or worsening abdominal pain, "
                "especially with fever, vomiting, or a rigid abdomen, "
                "needs prompt evaluation, as it can indicate appendicitis "
                "or another surgical condition.",
    },
    {
        "topic": "Diarrhoea",
        "text": "Most diarrhoea is caused by viral or bacterial infection "
                "and resolves within a few days with fluids and rest. "
                "Diarrhoea lasting more than a week, or with blood, high "
                "fever, or signs of dehydration, should be evaluated by a "
                "doctor.",
    },
    {
        "topic": "Constipation",
        "text": "Constipation is often related to diet, hydration, or "
                "reduced activity, and usually improves with fibre, "
                "fluids, and movement. Constipation with severe pain, "
                "vomiting, or blood in the stool needs medical attention.",
    },
    {
        "topic": "Blood in stool",
        "text": "Blood in the stool can range from minor causes like "
                "haemorrhoids to more serious gastrointestinal bleeding. "
                "Any blood in the stool should be evaluated, and large "
                "amounts of blood or blood combined with dizziness or "
                "weakness is an emergency.",
        "emergency": True,
    },
    {
        "topic": "Loss of appetite",
        "text": "A temporary reduced appetite often accompanies minor "
                "illness and resolves on its own. Prolonged loss of "
                "appetite with weight loss, fatigue, or other symptoms "
                "should be discussed with a doctor.",
    },
    {
        "topic": "Acid reflux and indigestion",
        "text": "Occasional heartburn or indigestion after eating is "
                "common and often improves with dietary changes and "
                "over-the-counter antacids. Frequent or severe symptoms, "
                "or indigestion combined with chest pain or difficulty "
                "swallowing, should be evaluated.",
    },

    # --- Skin ---
    {
        "topic": "Skin rash",
        "text": "Most skin rashes are caused by irritants, allergies, or "
                "mild infections and improve with avoiding the trigger and "
                "using over-the-counter treatments. A rash accompanied by "
                "fever, spreading rapidly, blistering, or affecting the "
                "mouth or eyes should be evaluated by a doctor promptly.",
    },
    {
        "topic": "Itching",
        "text": "Itching without a visible rash can be caused by dry "
                "skin, allergies, or in some cases liver or kidney "
                "conditions. Persistent, widespread itching without an "
                "obvious cause is worth discussing with a doctor.",
    },
    {
        "topic": "Bruising easily",
        "text": "Occasional bruising from minor bumps is normal. Frequent "
                "or unexplained bruising, especially with unusual "
                "bleeding elsewhere, can indicate a blood clotting issue "
                "and should be evaluated.",
    },
    {
        "topic": "Yellowing of skin or eyes",
        "text": "Yellowing of the skin or eyes (jaundice) can indicate "
                "liver problems, gallbladder issues, or blood conditions. "
                "This should always be evaluated by a doctor, and rapid "
                "onset with abdominal pain or confusion is an emergency.",
        "emergency": True,
    },

    # --- Musculoskeletal ---
    {
        "topic": "Joint pain",
        "text": "Joint pain can result from injury, overuse, arthritis, or "
                "infection. Rest, ice, and over-the-counter pain relief "
                "help most mild cases. Joint pain with significant "
                "swelling, redness, warmth, fever, or inability to bear "
                "weight should be evaluated promptly, as it may indicate "
                "infection or a more serious condition.",
    },
    {
        "topic": "Back pain",
        "text": "Most back pain is muscular and improves within a few "
                "weeks with rest, gentle movement, and pain relief. Back "
                "pain with numbness, weakness in the legs, or loss of "
                "bladder or bowel control is an emergency.",
    },
    {
        "topic": "Muscle weakness",
        "text": "General fatigue-related muscle weakness is common after "
                "illness or exertion. Sudden weakness, especially on one "
                "side of the body, is a medical emergency and may indicate "
                "a stroke.",
    },
    {
        "topic": "Neck pain and stiffness",
        "text": "Neck pain often results from poor posture or muscle "
                "strain and improves with rest and gentle stretching. Neck "
                "stiffness combined with high fever, headache, and "
                "sensitivity to light is a medical emergency that can "
                "indicate meningitis.",
        "emergency": True,
    },
    {
        "topic": "Cramps",
        "text": "Muscle cramps are often caused by dehydration, overuse, "
                "or low electrolyte levels, and usually resolve with "
                "stretching and fluids. Frequent or severe cramps without "
                "clear cause should be discussed with a doctor.",
    },

    # --- Genitourinary ---
    {
        "topic": "Painful urination",
        "text": "Pain or burning during urination often indicates a "
                "urinary tract infection and usually improves with "
                "prompt treatment. Pain with fever, back pain, or blood in "
                "the urine needs medical evaluation, as it may indicate a "
                "kidney infection.",
    },
    {
        "topic": "Frequent urination",
        "text": "Needing to urinate more often than usual can result from "
                "increased fluid intake, urinary infection, or high blood "
                "sugar. Persistent frequent urination alongside increased "
                "thirst and fatigue can indicate diabetes and should be "
                "checked.",
    },
    {
        "topic": "Blood in urine",
        "text": "Blood in the urine can result from infection, kidney "
                "stones, or other conditions, and should always be "
                "evaluated by a doctor even if it happens only once.",
    },

    # --- Mental health / mood ---
    {
        "topic": "Anxiety",
        "text": "Occasional anxiety is a normal response to stress. "
                "Persistent anxiety that interferes with daily life, "
                "sleep, or relationships is worth discussing with a "
                "doctor or mental health professional, who can offer "
                "effective support and treatment.",
    },
    {
        "topic": "Low mood",
        "text": "Feeling low occasionally is common. Persistent low mood "
                "lasting more than two weeks, loss of interest in usual "
                "activities, or changes in sleep and appetite can indicate "
                "depression, which responds well to professional support.",
    },
    {
        "topic": "Sleep problems",
        "text": "Occasional difficulty sleeping is common and often "
                "related to stress or routine changes. Persistent "
                "insomnia lasting more than a few weeks, or sleep problems "
                "affecting daily functioning, are worth discussing with a "
                "doctor.",
    },
    {
        "topic": "Irritability and mood swings",
        "text": "Mood changes can relate to stress, sleep, hormones, or "
                "underlying health conditions. Significant or sudden "
                "changes in mood or personality, especially with confusion "
                "or other symptoms, should be evaluated.",
    },

    # --- Eyes / ENT ---
    {
        "topic": "Blurred vision",
        "text": "Blurred vision can result from eye strain, refractive "
                "error, or high blood sugar. Sudden vision loss or blurred "
                "vision with headache, weakness, or slurred speech is an "
                "emergency and may indicate a stroke.",
    },
    {
        "topic": "Red or itchy eyes",
        "text": "Red or itchy eyes are commonly caused by allergies or "
                "minor infections like conjunctivitis, and often improve "
                "with over-the-counter drops. Eye pain, vision changes, or "
                "sensitivity to light alongside redness should be "
                "evaluated by a doctor.",
    },
    {
        "topic": "Ear pain",
        "text": "Ear pain is often caused by infection or fluid buildup "
                "and usually improves with treatment within a few days. "
                "Severe pain, fever, or discharge from the ear should be "
                "evaluated promptly.",
    },
    {
        "topic": "Loss of smell or taste",
        "text": "Temporary loss of smell or taste commonly accompanies "
                "colds and respiratory infections and usually resolves as "
                "the infection clears. Persistent loss lasting several "
                "weeks is worth mentioning to a doctor.",
    },

    # --- Endocrine / metabolic ---
    {
        "topic": "Diabetes risk factors",
        "text": "Type 2 diabetes risk increases with higher body mass "
                "index, age, family history, high blood glucose, and "
                "sedentary lifestyle. Common symptoms include increased "
                "thirst, frequent urination, fatigue, and blurred vision. "
                "Diagnosis requires a blood test; risk screening tools "
                "provide an estimate, not a diagnosis.",
    },
    {
        "topic": "Excessive thirst",
        "text": "Increased thirst can result from heat, exercise, or high "
                "salt intake. Persistent excessive thirst alongside "
                "frequent urination and fatigue can indicate diabetes and "
                "should be evaluated with a blood test.",
    },
    {
        "topic": "Weight gain",
        "text": "Gradual weight gain often relates to diet and activity "
                "levels. Rapid or unexplained weight gain, especially with "
                "swelling or fatigue, can indicate a thyroid or heart "
                "condition and is worth discussing with a doctor.",
    },
    {
        "topic": "Enlarged thyroid (goitre)",
        "text": "Swelling in the front of the neck can indicate a thyroid "
                "condition. This should be evaluated by a doctor, "
                "particularly if accompanied by changes in weight, heart "
                "rate, or energy levels.",
    },

    # --- Additional targeted gaps ---
    {
        "topic": "Sneezing and allergies",
        "text": "Continuous sneezing, a runny nose, and watery eyes are "
                "commonly caused by seasonal allergies or a cold. "
                "Antihistamines and avoiding known triggers usually help. "
                "Sneezing with facial swelling, difficulty breathing, or "
                "hives can indicate a severe allergic reaction and needs "
                "emergency care.",
    },
    {
        "topic": "Chills with high fever",
        "text": "Shivering combined with a high fever often indicates the "
                "body fighting an infection, including illnesses like "
                "malaria or other mosquito-borne infections in endemic "
                "areas. Cycles of fever, chills, and sweating that recur "
                "over days should be evaluated by a doctor with a blood "
                "test.",
    },
    {
        "topic": "White patches in the throat",
        "text": "White or yellow patches on the throat or tonsils can "
                "indicate a bacterial throat infection such as strep "
                "throat, which usually needs antibiotic treatment. This is "
                "different from a typical viral sore throat and is worth "
                "having assessed, especially with fever and difficulty "
                "swallowing.",
    },
    {
        "topic": "Mouth ulcers",
        "text": "Small mouth ulcers are common and usually heal within "
                "one to two weeks without treatment, though salt water "
                "rinses and avoiding spicy food can help. Ulcers that are "
                "unusually large, painful, or that don't heal within three "
                "weeks should be checked by a doctor.",
    },
    {
        "topic": "Cold hands and feet",
        "text": "Cold hands and feet are often simply a response to cold "
                "temperatures or poor circulation and are usually "
                "harmless. Persistent coldness in the extremities "
                "alongside numbness, color changes, or pain can indicate a "
                "circulation problem and is worth discussing with a "
                "doctor.",
    },
    {
        "topic": "Irregular blood sugar symptoms",
        "text": "Symptoms like shakiness, sweating, confusion, or "
                "irritability can indicate low blood sugar, while extreme "
                "thirst, frequent urination, and fatigue suggest high "
                "blood sugar. Anyone with diagnosed diabetes experiencing "
                "these symptoms should check their blood sugar and follow "
                "their care plan; severe confusion or loss of "
                "consciousness is an emergency.",
    },
    {
        "topic": "Basic first aid for minor injuries",
        "text": "For minor cuts, clean the wound with water, apply gentle "
                "pressure with a clean cloth to stop bleeding, and cover "
                "with a bandage. For minor burns, cool the area under "
                "running water for several minutes and avoid ice. Deep "
                "wounds, burns larger than a hand, or bleeding that "
                "doesn't stop after ten minutes of pressure need emergency "
                "care.",
    },

    # --- Emergency summary ---
    {
        "topic": "When to seek emergency care",
        "text": "Seek emergency care immediately for: chest pain with "
                "breathlessness or sweating, sudden one-sided weakness or "
                "slurred speech, severe difficulty breathing, loss of "
                "consciousness, uncontrolled bleeding, or a high fever "
                "with stiff neck and confusion. When in doubt about a "
                "serious symptom combination, err toward emergency care.",
        "emergency": True,
    },
]