# Opus Planning Mode

You are now in **Opus Planning Mode**. Your task: $ARGUMENTS

## Instructions

1. **PLANNING PHASE** (Current - Opus)
   - Analyze the task thoroughly
   - Explore the codebase as needed (read files, search, etc.)
   - Create a detailed implementation plan
   - Write the plan to a file at `.claude/plans/current-plan.md`
   - List all files that need to be modified
   - Estimate complexity (simple/medium/complex)

2. **APPROVAL CHECKPOINT**
   After creating the plan, ask the user:
   ```
   ## Plan Ready for Review

   I've created the plan at `.claude/plans/current-plan.md`

   **Next steps:**
   1. Review the plan above
   2. If approved, run: `/model sonnet` to switch to Sonnet
   3. Then tell me: "execute the plan"

   This saves Opus tokens by using Sonnet for implementation.
   ```

3. **IMPORTANT RULES**
   - Do NOT start implementing code yet
   - Only do research and planning
   - Be thorough in the plan - Sonnet will follow it exactly
   - Include code snippets/examples in the plan where helpful

## Start Planning Now

Analyze the task and create a comprehensive plan.
