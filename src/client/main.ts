import "./styles.css";
import { IntakePatch, IntakeState } from "../shared/schema.js";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  created_at: string;
};

type SessionResponse = {
  state: IntakeState;
  history: ChatMessage[];
  draft_document: string;
  assistant_message?: string;
  warnings?: string[];
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root was not found.");
}

app.innerHTML = `
  <header class="topbar">
    <div>
      <p class="eyebrow">Fictional intake</p>
      <h1>Document Intake Assistant</h1>
    </div>
    <button class="secondary" id="resetButton" type="button">Reset</button>
  </header>
  <main class="workspace">
    <section class="panel chat-panel" aria-label="Conversation">
      <div class="panel-heading">
        <h2>Conversation</h2>
      </div>
      <div class="messages" id="messages"></div>
      <form class="composer" id="chatForm">
        <input id="messageInput" name="message" autocomplete="off" placeholder="Reply to the assistant" />
        <button type="submit">Send</button>
      </form>
    </section>

    <section class="panel state-panel" aria-label="Structured information">
      <div class="panel-heading">
        <h2>Structured Intake</h2>
        <span class="status" id="captureStatus"></span>
      </div>
      <form class="state-form" id="stateForm">
        <label>
          Full name
          <input name="full_name" />
        </label>
        <label>
          Home address
          <textarea name="home_address" rows="2"></textarea>
        </label>
        <label>
          Covers worldwide assets
          <select name="covers_worldwide_assets">
            <option value="">Unknown</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Has children
          <select name="has_children">
            <option value="">Unknown</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Children
          <textarea name="children" rows="2"></textarea>
        </label>
        <label>
          Executor name
          <input name="executor_name" />
        </label>
        <label>
          Executor relationship
          <input name="executor_relationship" />
        </label>
        <label>
          Specific gifts
          <textarea name="specific_gifts" rows="3"></textarea>
        </label>
        <label>
          Additional wishes
          <textarea name="additional_wishes" rows="3"></textarea>
        </label>
        <button type="submit">Apply corrections</button>
      </form>
    </section>

    <section class="panel draft-panel" aria-label="Draft document">
  <div class="panel-heading">
    <div>
      <h2>Draft Document</h2>
      <p class="document-disclaimer">
        FICTIONAL DOCUMENT — NOT LEGAL ADVICE
      </p>
    </div>
  </div>
  <pre id="draft"></pre>
</section>
  </main>
`;

const messagesElement = getElement<HTMLDivElement>("messages");
const draftElement = getElement<HTMLPreElement>("draft");
const statusElement = getElement<HTMLSpanElement>("captureStatus");
const chatForm = getElement<HTMLFormElement>("chatForm");
const stateForm = getElement<HTMLFormElement>("stateForm");
const messageInput = getElement<HTMLInputElement>("messageInput");
const resetButton = getElement<HTMLButtonElement>("resetButton");

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  messageInput.value = "";
  await requestAndRender(() =>
    postJson<SessionResponse>("/api/chat", { message })
  );
});

stateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const patch = buildPatchFromForm(new FormData(stateForm));
  await requestAndRender(() =>
    patchJson<SessionResponse>("/api/state", patch)
  );
});

resetButton.addEventListener("click", async () => {
  await requestAndRender(() => postJson<SessionResponse>("/api/reset", {}));
});

loadSession();

async function loadSession() {
  await requestAndRender(async () => {
    const response = await fetch("/api/session");
    return parseResponse<SessionResponse>(response);
  });
}

async function requestAndRender(
  request: () => Promise<SessionResponse>
) {
  setLoading(true);

  try {
    render(await request());
  } catch (error) {
    renderTransientMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

function setLoading(loading: boolean) {
  messageInput.disabled = loading;
  resetButton.disabled = loading;

  const sendButton = chatForm.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement | null;

  if (sendButton) {
    sendButton.disabled = loading;
    sendButton.textContent = loading ? "Thinking..." : "Send";
  }

  const correctionButton = stateForm.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement | null;

  if (correctionButton) {
    correctionButton.disabled = loading;
    correctionButton.textContent = loading
      ? "Saving..."
      : "Apply corrections";
  }
}

function render(session: SessionResponse) {
  renderMessages(session.history);
  renderState(session.state);
  draftElement.textContent = session.draft_document;
  statusElement.textContent = `${countCaptured(session.state)} of 9 captured`;
}

function renderMessages(messages: ChatMessage[]) {
  messagesElement.innerHTML = "";
  for (const message of messages) {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.role}`;
    bubble.textContent = message.content;
    messagesElement.appendChild(bubble);
  }
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function renderTransientMessage(content: string) {
  const bubble = document.createElement("div");
  bubble.className = "message assistant error";
  bubble.textContent = content;
  messagesElement.appendChild(bubble);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function renderState(state: IntakeState) {
  setInput("full_name", state.full_name);
  setInput("home_address", state.home_address);
  setSelect("covers_worldwide_assets", state.covers_worldwide_assets);
  setSelect("has_children", state.has_children);
  setInput(
    "children",
    state.children === null
      ? null
      : state.children.map((child) => child.name).join(", ")
  );
  setInput("executor_name", state.executor.name);
  setInput("executor_relationship", state.executor.relationship);
  setInput(
    "specific_gifts",
    state.specific_gifts === null ? null : state.specific_gifts.join("\n")
  );
  setInput("additional_wishes", state.additional_wishes);
}

function buildPatchFromForm(formData: FormData): IntakePatch {
  const hasChildren = readBoolean(formData.get("has_children"));
  return {
    full_name: readNullableString(formData.get("full_name")),
    home_address: readNullableString(formData.get("home_address")),
    covers_worldwide_assets: readBoolean(
      formData.get("covers_worldwide_assets")
    ),
    has_children: hasChildren,
    children:
      hasChildren === false
        ? []
        : readList(formData.get("children"))?.map((name) => ({ name })) ?? null,
    executor: {
      name: readNullableString(formData.get("executor_name")),
      relationship: readNullableString(formData.get("executor_relationship"))
    },
    specific_gifts: readList(formData.get("specific_gifts")),
    additional_wishes: readNullableString(formData.get("additional_wishes"))
  };
}

function countCaptured(state: IntakeState): number {
  const values = [
    state.full_name,
    state.home_address,
    state.covers_worldwide_assets,
    state.has_children,
    state.has_children === false
      ? true
      : state.children !== null && state.children.length > 0,
    state.executor.name,
    state.executor.relationship,
    state.specific_gifts,
    state.additional_wishes
  ];
  return values.filter((value) => {
    if (Array.isArray(value)) return value.length >= 0;
    return value !== null && value !== "";
  }).length;
}

function readNullableString(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : null;
}

function readBoolean(value: FormDataEntryValue | null): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function readList(value: FormDataEntryValue | null): string[] | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function setInput(name: string, value: string | null) {
  const input = stateForm.elements.namedItem(name) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  input.value = value ?? "";
}

function setSelect(name: string, value: boolean | null) {
  const input = stateForm.elements.namedItem(name) as HTMLSelectElement;
  input.value = value === null ? "" : String(value);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseResponse<T>(response);
}

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed.");
  }
  return body;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`${id} was not found.`);
  return element as T;
}
