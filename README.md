# n8n-nodes-sales-trigger

This is an **n8n community node** for **SalesTrigger**. It allows you to push leads into SalesTrigger campaigns via API, including sending up to ten custom messages to each lead.

[SalesTrigger](https://www.salestrigger.io/) is a platform that analyzes the behavior of prospects (event attendance, intent signals, interaction patterns) and surfaces who you should reach out to right now. :contentReference[oaicite:0]{index=0}

[Visit the docs](https://farakhov0ruslan.github.io/salestrigger-integration-docs.github.io)

---

## Installation

Follow the [n8n Community Nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).  
In summary:

```bash
npm install n8n-nodes-sales-trigger
# or, for local development
pnpm link --global
pnpm link n8n-nodes-sales-trigger
````

After installation, restart n8n and your new node will appear under the “Transform” group named **SalesTrigger: Add Lead to Campaign**.

---

## Operations

This package currently supports one operation:

* **Add Lead to Campaign** — adds a single lead with optional messages to a specified SalesTrigger campaign via API.

---

## Credentials

To use this node, you must supply **SalesTrigger API** credentials:

1. Sign up or log in at [salestrigger.io](https://www.salestrigger.io/).
2. Navigate to **API Tokens** (in your account settings) and generate a new token.
3. In n8n, go to **Credentials → New → SalesTrigger API**.
4. Paste your API token and test the connection.

There is no need to configure Base URL; the node uses the default API endpoint behind the scenes.

---

## Compatibility

* Minimum n8n version: **0.216.0**
* Tested with: n8n v1.x
* Known issues: none documented to date

Please report any incompatibility on the GitHub repo.

---

## Usage

Here’s how to use the node in your workflows:

### Setup

* After installing the node and providing credentials, drag **SalesTrigger: Add Lead to Campaign** into your workflow.
* Select your credentials.
* Use **Campaign Name or ID** dropdown (auto-loaded) or enter an expression.
* Provide the **LinkedIn URL** of your lead (`https://www.linkedin.com/in/<PUBLIC-ID>/`).
* Optionally fill **Message 1..10** — each maps to `custom_field_1..custom_field_10`.

### Execution

* On **Execute**, the node sends a POST request to `/beta/campaign/{campaignId}/api-add-lead`.
* If successful, the API returns status **201 Created**.
* On error (e.g. 422), the UI shows a descriptive error:

  ```
  [422] Assertion failed, Lead href must be a pattern of https://www.linkedin.com/in/{PUBLIC-ID} — no extra details
  ```

Enable **Continue On Fail** if you're processing many items and want the workflow to continue past errors.

---

## OpenAPI & Documentation

See [SalesTrigger docs](https://farakhov0ruslan.github.io/salestrigger-integration-docs.github.io/) for more info.


---

## Version History

| Version | Description                                |
| ------- | ------------------------------------------ |
| 1.0.0   | Initial release: Add Lead to Campaign node |

---

## Resources

* [n8n Community Nodes docs](https://docs.n8n.io/integrations/community-nodes)
* [SalesTrigger homepage](https://www.salestrigger.io/)
* [SalesTrigger docs](https://farakhov0ruslan.github.io/salestrigger-integration-docs.github.io/)

---

If you encounter issues, feel free to open an issue in the repository or join the n8n community forum.
Happy automating! 🚀

```
