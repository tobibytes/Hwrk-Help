here’s a single prompt you can paste to your AI agent to create the validator.

⸻

Prompt for AI agent: Create process.json validator

Goal
Add a TypeScript script that validates docs/process.json against our required schema. Fail CI if it is missing keys or has wrong types.

Scope
	•	Create scripts/validate-process-json.ts
	•	Keep file under 100 lines
	•	No network calls
	•	Clear error messages with paths
	•	Exit code 1 on validation failure, 0 on success
	•	Wire into pnpm scripts and CI

Tech choices
	•	Use zod for schema validation
	•	Use tsx to run TypeScript directly

Repo context
	•	Monorepo with pnpm
	•	Root has docs/process.json that contains a top level process_handbook object

Required schema to validate
Top level

{
  process_handbook: {
    version: string,
    pr: {
      principles: string[],
      branching: { rule: string, naming_examples: string[] },
      template_checklist: string[],
      reviews: { owners_required: boolean, ci_must_be_green: boolean }
    },
    commits: {
      format: string,
      types: string[],
      rules: string[],
      examples: string[]
    },
    ownership: {
      paths: Array<{ glob: string, owner: string }>
    },
    ci_gates: {
      lint: boolean,
      typecheck: boolean,
      unit_tests: { enabled: boolean, coverage_min_lines: number },
      contract_tests: boolean,
      integration_smoke: boolean,
      openapi_diff_approved: boolean,
      frontend_guards: string[]
    },
    error_catalog: {
      shape: object,
      codes: Array<{ code: string, http: number }>,
      guidelines: string[]
    },
    rate_limits: {
      auth: object,
      canvas_sync: object,
      search: object,
      policy: object
    },
    security_data: {
      secrets: string[],
      pii: string[],
      retention_days: { documents_media: number, logs: number },
      deletion: { on_request_days: number },
      access: string[]
    },
    runbooks: object,
    releases: object,
    adrs: object,
    frontend_guardrails: {
      stack: string[],
      rules: string[],
      performance: { first_load_bundle_gzip_kb_max: number, route_chunk_gzip_kb_max: number, practices: string[] },
      a11y: string[]
    },
    backend_guardrails: string[],
    codegen_sync: object,
    checklists: {
      add_backend_endpoint: string[],
      add_frontend_page: string[],
      add_stream_message: string[],
      ai_agent_pr: string[]
    }
  }
}

Tasks
	1.	Add dev dependencies
	•	pnpm add -D zod tsx at repo root
	2.	Create scripts/validate-process-json.ts
Behavior
	•	Read docs/process.json
	•	Parse JSON
	•	Validate with zod schema that matches the Required schema above
	•	On error print lines like
process.json invalid at process_handbook.pr.reviews.ci_must_be_green expected boolean
Exit 1
	•	On success print
process.json valid
Exit 0
Constraints
	•	Keep file under 100 lines
	•	No dynamic imports
	•	No console noise other than result or errors
	3.	Add package scripts in root package.json

"scripts": {
  "validate:process": "tsx scripts/validate-process-json.ts",
  "validate": "pnpm run validate:process"
}


	4.	CI integration
	•	Update .github/workflows/ci.yml to run pnpm run validate:process before lint and typecheck
	5.	Optional tests
	•	Add scripts/__tests__/validate-process-json.test.ts with Vitest
	•	One passing case that loads the real file
	•	One failing case that feeds a minimal invalid object
	•	Keep test file under 100 lines
	6.	Output
	•	Open a PR on branch tooling/process-validator
	•	PR description must include
	•	What changed
	•	Why we need schema validation
	•	How it was tested
	•	Sample output for pass and fail
	•	Include a short note confirming the file is under 100 lines

Acceptance criteria
	•	Running pnpm run validate:process prints process.json valid on current file
	•	Breaking a required boolean to a string causes exit code 1 with a clear path in the error message
	•	CI runs the validator and fails when the schema is broken
	•	Script file is under 100 lines
	•	No other files exceed the 100 line guideline due to this change