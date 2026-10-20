"""Transparent rubric-based feedback; not a claim of semantic proof."""
FIELDS = {
    "goal": ("goal_answer", "State the exact result the problem asks you to produce."),
    "inputs": ("inputs_answer", "Identify the data available before solving."),
    "outputs": ("outputs_answer", "Describe the expected output clearly."),
    "constraints": ("constraints_answer", "Consider limits and edge cases."),
    "decomposition": ("decomposition_answer", "Break the task into ordered smaller steps."),
    "pattern": ("pattern_answer", "Name the reusable reasoning pattern and explain why it fits."),
    "state": ("state_answer", "Explain what information must be maintained while processing."),
    "decision": ("decision_answer", "State the condition that changes the next action."),
    "verification": ("verification_answer", "Test the approach with a normal case and an edge case."),
    "transfer": ("transfer_answer", "Explain how the same pattern applies to the new context."),
}

def evaluate(data, problem):
    scores, feedback = {}, []
    for skill, (field, tip) in FIELDS.items():
        answer = data.get(field, "")
        if isinstance(answer, str) and len(answer.strip()) >= 8:
            scores[skill] = 10
        else:
            scores[skill] = 0
            feedback.append({"skill": skill, "message": tip})
    steps = data.get("logic_steps", [])
    scores["logical_sequencing"] = 10 if isinstance(steps, list) and len(steps) >= 3 else 0
    if scores["logical_sequencing"] == 0:
        feedback.append({"skill": "logical_sequencing", "message": "Add at least three ordered logic steps before implementation."})
    total = round(sum(scores.values()) / len(scores)) if scores else 0
    return scores, total, feedback
