import { afterEach, test, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import { ToolInvocation } from "ai";

afterEach(cleanup);

function makeInvocation(
  toolName: string,
  args: Record<string, string>,
  state: "call" | "result" = "call"
): ToolInvocation {
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

test("str_replace_editor create shows 'Creating <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/components/Card.tsx" })} />);
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Editing <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/components/App.tsx" })} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor insert shows 'Editing <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "/components/App.tsx" })} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor view shows 'Reading <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "/components/index.tsx" })} />);
  expect(screen.getByText("Reading index.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows 'Undoing edit in <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "/components/App.tsx" })} />);
  expect(screen.getByText("Undoing edit in App.tsx")).toBeDefined();
});

test("file_manager rename shows 'Renaming <file> → <new_file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/components/Card.tsx", new_path: "/components/NewCard.tsx" })} />);
  expect(screen.getByText("Renaming Card.tsx → NewCard.tsx")).toBeDefined();
});

test("file_manager delete shows 'Deleting <file>'", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/components/Card.tsx" })} />);
  expect(screen.getByText("Deleting Card.tsx")).toBeDefined();
});

test("unknown tool name falls back to raw toolName", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation("some_unknown_tool", {})} />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});

test("in-progress state shows spinner", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/Card.tsx" }, "call")} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("result state shows green dot, no spinner", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/Card.tsx" }, "result")} />);
  expect(container.querySelector(".animate-spin")).toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});
