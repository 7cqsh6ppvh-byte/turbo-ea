# MCP Integration (AI Tool Access)

Turbo EA includes a built-in **MCP server** (Model Context Protocol) that allows AI tools — such as Claude Desktop, GitHub Copilot, Cursor, and VS Code — to query and update your EA data directly. AI tools can also upload artifacts (spreadsheets, BPMN diagrams, DrawIO diagrams, freeform documents) and turn them into cards, relations and diagrams that fit the existing metamodel. Users authenticate through your existing SSO provider, and every action respects their individual permissions.

This feature is **optional** and **does not start automatically**. It requires SSO to be configured, the MCP profile to be activated in Docker Compose, and an admin to toggle it on in the settings UI.

---

## How It Works

```
AI Tool (Claude, Copilot, etc.)
    │
    │  MCP protocol (HTTP + SSE)
    ▼
Turbo EA MCP Server (:8001, internal)
    │
    │  OAuth 2.1 with PKCE
    │  delegates to your SSO provider
    ▼
Turbo EA Backend (:8000)
    │
    │  Per-user RBAC
    ▼
PostgreSQL
```

1. A user adds the MCP server URL to their AI tool.
2. On first connection, the AI tool opens a browser window for SSO authentication.
3. After login, the MCP server issues its own access token (backed by the user's Turbo EA JWT).
4. The AI tool uses this token for all subsequent requests. Tokens refresh automatically.
5. Every query goes through the normal Turbo EA permission system — users only see data they have access to.

---

## Prerequisites

Before enabling MCP, you must have:

- **SSO configured and working** — MCP delegates authentication to your SSO provider (Microsoft Entra ID, Google Workspace, Okta, or generic OIDC). See the [Authentication & SSO](sso.md) guide.
- **HTTPS with a public domain** — The OAuth flow requires a stable redirect URI. Deploy behind a TLS-terminating reverse proxy (Caddy, Traefik, Cloudflare Tunnel, etc.).

---

## Setup

### Step 1: Start the MCP service

The MCP server is an opt-in Docker Compose profile. Add `--profile mcp` to your startup command:

```bash
docker compose --profile mcp up --build -d
```

This starts a lightweight Python container (port 8001, internal only) alongside the backend and frontend. Nginx proxies `/mcp/` requests to it automatically.

### Step 2: Configure environment variables

Add these to your `.env` file:

```dotenv
TURBO_EA_PUBLIC_URL=https://your-domain.example.com
MCP_PUBLIC_URL=https://your-domain.example.com/mcp
```

| Variable | Default | Description |
|----------|---------|-------------|
| `TURBO_EA_PUBLIC_URL` | `http://localhost:8920` | The public URL of your Turbo EA instance |
| `MCP_PUBLIC_URL` | `http://localhost:8920/mcp` | The public URL of the MCP server (used in OAuth redirect URIs) |
| `MCP_PORT` | `8001` | Internal port for the MCP container (rarely needs changing) |

### Step 3: Add the OAuth redirect URI to your SSO app

In your SSO provider's app registration (the same one you set up for Turbo EA login), add this redirect URI:

```
https://your-domain.example.com/mcp/oauth/callback
```

This is required for the OAuth flow that authenticates users when they connect from their AI tool.

### Step 4: Enable MCP in admin settings

1. Go to **Settings** in the admin area and select the **AI** tab.
2. Scroll to the **MCP Integration (AI Tool Access)** section.
3. Toggle the switch to **enable** MCP.
4. The UI will show the MCP Server URL and setup instructions to share with your team.

!!! warning
    The toggle is disabled if SSO is not configured. Set up SSO first.

---

## Connecting AI Tools

Once MCP is enabled, share the **MCP Server URL** with your team. Each user adds it to their AI tool:

### Claude Desktop

1. Open **Settings > Connectors > Add custom connector**.
2. Enter the MCP server URL: `https://your-domain.example.com/mcp`
3. Click **Connect** — a browser window opens for SSO login.
4. After authentication, Claude can query your EA data.

### VS Code (GitHub Copilot / Cursor)

Add to your workspace `.vscode/mcp.json`:

```json
{
  "servers": {
    "turbo-ea": {
      "type": "http",
      "url": "https://your-domain.example.com/mcp/mcp"
    }
  }
}
```

The double `/mcp/mcp` is intentional — the first `/mcp/` is the Nginx proxy path, the second is the MCP protocol endpoint.

---

## Local Testing (stdio mode)

For local development or testing without SSO/HTTPS, you can run the MCP server in **stdio mode** — Claude Desktop spawns it directly as a local process.

**1. Install the MCP server package:**

```bash
pip install ./mcp-server
```

**2. Add to your Claude Desktop config** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "turbo-ea": {
      "command": "python",
      "args": ["-m", "turbo_ea_mcp", "--stdio"],
      "env": {
        "TURBO_EA_URL": "http://localhost:8000",
        "TURBO_EA_EMAIL": "your@email.com",
        "TURBO_EA_PASSWORD": "your-password"
      }
    }
  }
}
```

In this mode, the server authenticates with email/password and refreshes the token automatically in the background.

---

## Available Capabilities

The MCP server exposes **30 tools** across two groups: **25 read tools** that query EA data and **5 write tools** that turn artifacts an AI tool has in its own context (spreadsheets, BPMN XML, DrawIO XML, documents, images) into cards, relations and diagrams.

### Dry-run safety on writes

Every write tool defaults to **`dry_run=true`**. In this mode the backend runs every validator and resolver, builds the complete plan, then **rolls back the transaction** so nothing is persisted. The AI tool returns the preview to the user; only after explicit confirmation should it call the tool again with `dry_run=false` to commit. This prevents an enthusiastic agent from quietly seeding hundreds of cards on a misinterpreted spreadsheet.

### Read tools

The server exposes 25 read tools grouped into six clusters.

**Cards & metamodel**

| Tool | Description |
|------|-------------|
| `search_cards` | Search and filter cards by type, status, or free text |
| `get_card` | Get full details of a card by UUID |
| `get_card_relations` | Get all relations connected to a card |
| `get_card_hierarchy` | Get ancestors and children of a card |
| `list_card_types` | List all card types in the metamodel |
| `get_relation_types` | List relation types, optionally filtered by card type |

**Dashboards**

| Tool | Description |
|------|-------------|
| `get_dashboard` | KPI dashboard (counts, data quality, approvals, activity) |
| `get_landscape` | Cards of one type grouped by a related type |

**GRC — Risk Register**

| Tool | Description |
|------|-------------|
| `list_risks` | Paginated, filterable EA risk listing (TOGAF Phase G) |
| `get_risk` | Single risk detail with linked cards + audit trail |
| `get_risk_metrics` | KPIs + 4×4 initial / residual probability × impact matrices |
| `get_card_risks` | All risks currently linked to a specific card |

**GRC — Compliance**

| Tool | Description |
|------|-------------|
| `list_compliance_findings` | Compliance findings bundled by regulation |
| `get_compliance_overview` | Compliance scores + per-regulation status matrix + last-scan metadata |

**Governance & Delivery**

| Tool | Description |
|------|-------------|
| `list_principles` | Published EA principles (statement, rationale, implications) |
| `list_adrs` | Architecture Decision Records, filterable by initiative / status |
| `get_adr` | Single ADR with sections, linked cards, signature trail |
| `list_soaws` | Statements of Architecture Work for an initiative |

**Reports**

| Tool | Description |
|------|-------------|
| `get_portfolio_report` | Bubble-chart data for a card type (functional × technical fit by default) |
| `get_cost_treemap` | Treemap of card cost, optionally grouped by a related type |
| `get_capability_heatmap` | Hierarchical business-capability heatmap |
| `get_data_quality_report` | Per-card-type completeness breakdown |

**Card context**

| Tool | Description |
|------|-------------|
| `get_card_stakeholders` | Users + roles assigned to a card |
| `get_card_comments` | Threaded comments on a card |
| `get_card_documents` | Document links attached to a card |

All tools are bound by the authenticated user's RBAC — a viewer will simply get an empty list (or 403) for areas they cannot see; nothing on the MCP layer needs configuring per tool.

### Write tools — artifact upload

Five tools let an AI agent turn artifacts into structured EA data. The agent reads the source file from its own context (multimodal vision, file attachments), extracts structured rows, and calls these tools. The MCP server itself never parses files — it expects already-structured input.

| Tool | Description |
|------|-------------|
| `create_cards_bulk` | Create many cards in one call (e.g. spreadsheet rows). Supports same-batch parent references by name with server-side topological sort. |
| `resolve_card_refs` | Pre-validate name-based references before a bulk import — useful for surfacing ambiguous or missing parents to the user. |
| `upsert_relations_bulk` | Create or delete relations between cards. Source / target / type are validated against the metamodel. |
| `create_diagram` | Create a free-form DrawIO diagram with optional links to existing cards. |
| `import_bpmn` | Save a BPMN 2.0 XML diagram against an **existing** Business Process card. If no card matches the given name, the tool returns a `card_not_found` error pointing the agent at `create_cards_bulk` — this forces the agent to create the card explicitly with description, subtype and attributes first, instead of taking a shortcut that lands a sparse card. |

Typical workflow when a user shares a spreadsheet with the AI agent:

1. The agent calls `list_card_types` and `get_relation_types` to understand the metamodel.
2. The agent parses the spreadsheet (in its own context, not in MCP) and builds row dicts.
3. The agent calls `create_cards_bulk(cards=…, dry_run=True)` and shows the preview to the user.
4. The user confirms; the agent calls again with `dry_run=False` to commit.
5. If relation columns are present, the agent then calls `upsert_relations_bulk` with the same dry-run / confirm cycle.

### Write-tool guardrails

Defense in depth on top of dry-run, so an LLM mishap can't cause mass damage:

- **Per-call size caps.** The MCP write tools enforce a much smaller cap than the underlying Excel-importer endpoints: 200 rows for `create_cards_bulk`, 500 ops for `upsert_relations_bulk`. Big enough for any realistic single artifact upload, small enough that a dry-run preview is still scannable.
- **No relation deletion by default.** `upsert_relations_bulk` refuses `action: "delete"` ops — to remove relations, use the web UI where the action is captured under the user's identity. Operators can opt in by setting `MCP_ALLOW_RELATION_DELETE=true`.
- **Kill switch.** `MCP_WRITES_ENABLED=false` turns off all five write tools without redeploying code. The 25 read tools keep working.
- **Audit origin tag.** Every backend request from the MCP server carries an `X-Turbo-EA-Origin: mcp` header. Events emitted from those requests are tagged `origin: "mcp"` in the audit-log payload, so admins can filter MCP-driven writes out of the timeline distinct from web-UI actions.
- **No mass-destruction tools.** The toolset deliberately omits card delete, archive, and bulk-update. Adding any such tool would require an explicit design review.

The four guardrail environment variables on the MCP container:

| Variable | Default | Effect |
|----------|---------|--------|
| `MCP_WRITES_ENABLED` | `true` | Master switch for write tools. `false` → read-only MCP. |
| `MCP_MAX_CARDS_PER_CALL` | `200` | Hard cap on `create_cards_bulk` rows per request. |
| `MCP_MAX_RELATIONS_PER_CALL` | `500` | Hard cap on `upsert_relations_bulk` operations per request. |
| `MCP_ALLOW_RELATION_DELETE` | `false` | When `true`, `upsert_relations_bulk` accepts `action: "delete"` ops. |

### Resources

| URI | Description |
|-----|-------------|
| `turbo-ea://types` | All card types in the metamodel |
| `turbo-ea://relation-types` | All relation types |
| `turbo-ea://dashboard` | Dashboard KPIs and summary statistics |

### Guided Prompts

| Prompt | Description |
|--------|-------------|
| `analyze_landscape` | Multi-step analysis: dashboard overview, types, relationships |
| `find_card` | Search for a card by name, get details and relations |
| `explore_dependencies` | Map what a card depends on and what depends on it |

---

## Permissions

| Role | Access |
|------|--------|
| **Admin** | Configure MCP settings (`admin.mcp` permission). Full read + write through MCP. |
| **All authenticated users** | Read access governed by their existing RBAC. Write tools require the matching backend permissions — `inventory.create` (cards), `relations.manage` (relations), `diagrams.manage` (diagrams), `bpm.edit` (BPMN). |

The `admin.mcp` permission controls who can manage MCP settings. It is only available to the Admin role by default. Custom roles can be granted this permission through the Roles administration page.

Data access through MCP — read or write — follows the same RBAC model as the web UI. If a user cannot create cards in the inventory UI, they cannot create them through MCP either; there are no separate MCP-specific data permissions.

---

## Security

- **SSO-delegated authentication**: Users authenticate via their corporate SSO provider. The MCP server never sees or stores passwords.
- **OAuth 2.1 with PKCE**: The authentication flow uses Proof Key for Code Exchange (S256) to prevent authorization code interception.
- **Per-user RBAC**: Every MCP query — read or write — runs with the authenticated user's permissions. No shared service accounts.
- **Dry-run by default on writes**: Write tools default to a validate-and-rollback preview. The AI tool must explicitly call again with `dry_run=false` before anything is persisted, and every change is audited under the user's identity.
- **No file parsing in MCP**: The MCP server itself does not accept PDFs, Excel files, images or other binary artifacts. The calling AI tool parses them in its own context and sends structured rows. This keeps the attack surface narrow and avoids exposing the server to malformed binary input.
- **Token rotation**: Access tokens expire after 1 hour. Refresh tokens last 30 days. Authorization codes are single-use and expire after 10 minutes.
- **Internal-only port**: The MCP container exposes port 8001 only on the internal Docker network. All external access goes through the Nginx reverse proxy.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP toggle is disabled in settings | SSO must be configured first. Go to Settings > Authentication tab and set up an SSO provider. |
| "host not found" in Nginx logs | The MCP service is not running. Start it with `docker compose --profile mcp up -d`. The Nginx config handles this gracefully (502 response, no crash). |
| OAuth callback fails | Verify you added `https://your-domain.example.com/mcp/oauth/callback` as a redirect URI in your SSO app registration. |
| AI tool cannot connect | Check that `MCP_PUBLIC_URL` matches the URL accessible from the user's machine. Ensure HTTPS is working. |
| User gets empty results | MCP respects RBAC permissions. If a user has restricted access, they will only see the cards their role allows. |
| Connection drops after 1 hour | The AI tool should handle token refresh automatically. If not, reconnect. |
