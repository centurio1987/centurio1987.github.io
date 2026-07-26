import { useState } from "react";

// 케이퍼빌리티 permissions를 직접 켜고 끄며 "설치 ≠ 권한"과 에러 문구 읽는 법을 손으로 체득하는 시뮬레이션.

type PermissionKey =
  | "core:default"
  | "dialog:allow-open"
  | "fs:allow-read-text-file"
  | "shell:allow-execute";

type CommandKey = "dialog-open" | "fs-read" | "shell-sidecar" | "app-command";

const PERMISSION_OPTIONS: { key: PermissionKey; label: string }[] = [
  { key: "core:default", label: "core:default" },
  { key: "dialog:allow-open", label: "dialog:allow-open" },
  { key: "fs:allow-read-text-file", label: "fs:allow-read-text-file" },
  { key: "shell:allow-execute", label: "shell:allow-execute (sidecar: true)" },
];

const COMMANDS: {
  key: CommandKey;
  label: string;
  requires: PermissionKey | null;
  frontCall: string;
}[] = [
  {
    key: "dialog-open",
    label: "open({ directory: true })",
    requires: "dialog:allow-open",
    frontCall: "dialog.open",
  },
  {
    key: "fs-read",
    label: "readTextFile(...)",
    requires: "fs:allow-read-text-file",
    frontCall: "fs.readTextFile",
  },
  {
    key: "shell-sidecar",
    label: "Command.sidecar(...)",
    requires: "shell:allow-execute",
    frontCall: "shell.execute",
  },
  {
    key: "app-command",
    label: "invoke('scan_folder')",
    requires: null,
    frontCall: "",
  },
];

const INK = "var(--ink, #20264A)";
const INK_SOFT = "var(--ink-2, #4a4f6a)";
const BORDER = "var(--border, #d8d0be)";
const SURFACE = "var(--surface, #F8F3E8)";
const PAPER = "var(--paper, #F3EEE4)";
const PASS = "var(--cat-planning, #3E6B4F)";
const REJECT = "var(--cat-strategy, #A84B4B)";

function shellPermissionJson(): string {
  return '{ "identifier": "shell:allow-execute", "allow": [{ "name": "binaries/checksum", "sidecar": true }] }';
}

export default function PermissionGate() {
  const [enabled, setEnabled] = useState<Record<PermissionKey, boolean>>({
    "core:default": true,
    "dialog:allow-open": false,
    "fs:allow-read-text-file": false,
    "shell:allow-execute": false,
  });
  const [commandKey, setCommandKey] = useState<CommandKey>("dialog-open");

  const togglePermission = (key: PermissionKey) => {
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const permissionLines: string[] = [];
  PERMISSION_OPTIONS.forEach(({ key }) => {
    if (!enabled[key]) return;
    if (key === "shell:allow-execute") {
      permissionLines.push(`    ${shellPermissionJson()}`);
    } else {
      permissionLines.push(`    "${key}"`);
    }
  });

  const permsBody =
    permissionLines.length > 0 ? `\n${permissionLines.join(",\n")}\n  ` : "";
  const capabilitiesJson = `{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [${permsBody}]
}`;

  const selected = COMMANDS.find((c) => c.key === commandKey) ?? COMMANDS[0];
  const passed = selected.requires === null || enabled[selected.requires];

  let resultText: string;
  let resultNote: string | null = null;
  if (selected.requires === null) {
    resultText = "실행됨";
    resultNote =
      "케이퍼빌리티가 통제하는 건 코어·플러그인의 시스템 커맨드이지, 내가 #[tauri::command]로 만든 앱 커맨드가 아닙니다. 대신 경로 검증은 내 코드 몫입니다.";
  } else if (passed) {
    resultText = "실행됨";
  } else {
    resultText = `${selected.frontCall} not allowed. Permissions associated with this command: ${selected.requires}`;
  }

  return (
    <figure
      style={{
        margin: "1.75rem 0",
        padding: "1.25rem",
        borderRadius: "var(--radius-md, 12px)",
        border: `var(--stroke, 1.5px) solid ${BORDER}`,
        background: PAPER,
      }}
    >
      <figcaption
        style={{
          fontSize: 13,
          color: INK_SOFT,
          marginBottom: 14,
          fontWeight: 600,
        }}
      >
        케이퍼빌리티 권한 게이트 — 체크박스로 permissions를 조절하고, 호출할 커맨드를 골라 판정을 관찰해 보십시오.
      </figcaption>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>
          1. capabilities/default.json — permissions
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
          }}
        >
          {PERMISSION_OPTIONS.map(({ key, label }) => {
            const id = `permission-gate-${key.replace(/[^a-z0-9]/gi, "-")}`;
            return (
              <label
                key={key}
                htmlFor={id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13.5,
                  color: INK,
                  cursor: "pointer",
                  fontFamily: "var(--font-code, ui-monospace, monospace)",
                }}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={enabled[key]}
                  onChange={() => togglePermission(key)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>
          2. 호출할 커맨드
        </div>
        <div role="radiogroup" aria-label="호출할 커맨드" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {COMMANDS.map((c) => {
            const isActive = c.key === commandKey;
            return (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setCommandKey(c.key)}
                style={{
                  fontFamily: "var(--font-code, ui-monospace, monospace)",
                  fontSize: 13,
                  padding: "6px 12px",
                  borderRadius: "var(--btn-radius, 999px)",
                  border: `var(--stroke, 1.5px) solid ${isActive ? INK : BORDER}`,
                  background: isActive ? INK : SURFACE,
                  color: isActive ? PAPER : INK,
                  cursor: "pointer",
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>
          3. capabilities JSON 미리보기
        </div>
        <pre
          style={{
            margin: 0,
            padding: "12px 14px",
            borderRadius: "var(--radius-sm, 8px)",
            border: `var(--stroke, 1.5px) solid ${BORDER}`,
            background: SURFACE,
            color: INK,
            fontFamily: "var(--font-code, ui-monospace, monospace)",
            fontSize: 12.5,
            lineHeight: 1.6,
            overflowX: "auto",
            whiteSpace: "pre",
          }}
        >
          {capabilitiesJson}
        </pre>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 8 }}>
          4. 판정 결과
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm, 8px)",
            border: `var(--stroke, 1.5px) solid ${passed ? PASS : REJECT}`,
            background: passed ? "rgba(62, 107, 79, 0.10)" : "rgba(168, 75, 75, 0.10)",
            color: passed ? PASS : REJECT,
            fontFamily: "var(--font-code, ui-monospace, monospace)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {resultText}
        </div>
        {resultNote && (
          <p style={{ fontSize: 13, color: INK_SOFT, marginTop: 8, lineHeight: 1.6 }}>
            {resultNote}
          </p>
        )}
      </div>
    </figure>
  );
}
