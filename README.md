# CSP451 FINAL PROJECT

# Retailops-Capstone
RetailOps Capstone: a cloud-native platform for SMB retail. Dockerized frontend + inventory/product APIs on a VM, Azure Functions (HTTP/Queue/Timer) using Storage Queue, secure secrets, and correlation-based logging with Application Insights. GitHub Actions CI/CD auto-deploys functions and rebuilds containers on push for repeatable releases.

# Overview
* RetailOps helps small/medium retailers:
  * Track real-time inventory
  * Auto-reorder from suppliers when stock is low
  * Produce live analytics and alerts
  * Integrate securely with external systems
* This repo contains
  * Docker Compose app with 3 services (frontend + 2 APIs)
  * Azure Functions for HTTP/Queue/Timer workloads
  * Queue integration via Azure Storage Queues
  * Observability via Application Insights / Log Analytics dashboards & alerts
  * CI pipeline using GitHub Actions (build, validate, package Functions)

# Architecture
* VM (Docker Compose) hosts:
  * frontend (static UI form for manual stock update)
  * inventory-api (accepts updates; enqueues queue messages)
  * product-api (simple product data mock)

* Azure Functions:
  * HttpTrigger1 — accepts POST, can enqueue to inventory-updates
  * QueueTrigger1 — consumes messages from inventory-updates
  * TimerTrigger1 — emits daily summary logs/metrics

* Azure Storage Queue: invetory-updates
* App Insights + Log Analytics: centralized traces, metrics, alerts
  See retail_architecture_color.png for the end to end flow.

# Services & Ports
| Service       | Container Port | Host Port | Notes                                   |
| ------------- | -------------- | --------- | --------------------------------------- |
| frontend      | 80             | **8080**  | Simple UI to call inventory API         |
| inventory-api | 5001           | **5001**  | Requires `x-api-key`; enqueues messages |
| product-api   | 5002           | **5002**  | Mock product endpoints (demo)           |
  The Function app runs in Azure; you'll interact with it via its HTTPS URL.

# Prerequisites
  * Docker & Docker Compose
  * An Azure subscription (for Functions, Storage Queue, App Insights)
  * Node.js 18+ (only if you want to run Functions locally)
  * GitHub repository (CI already configured)

# Quick Start (VM or local)
1. Clone
   * git clone https://github.com/<your-org-or-user>/retailops-capstone.git
   * cd retailops-capstone

2. Create .env from the template
   * cp .env.example .env
     ( fill in STORAGE_CONNECTION_STRING, API_KEY, etc.)

3. Run the stack
   * docker compose up -d --build
   * docker ps

4. Smoke test
   * Frontend: http://<vm-ip>:8080
   * Health (inventory):
     * curl -i -H 'x-api-key: dev-key-123' http://127.0.0.1:5001/health
   * Manual update:
     * curl -s -X POST 'http://127.0.0.1:5001/update' \
    -H 'Content-Type: application/json' \
    -H 'x-api-key: dev-key-123' \
    -H 'x-correlation-id: test-001' \
    -d '{"productId":"sku-123","qty":7}'

# Environment variables
Create .env (do not commit real secrets). Example
  * # Used by inventory-api to enqueue messages
    STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=...;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net

    Simple API key check for inventory-api
    API_KEY=dev-key-123

    Queue name (must match your Azure Storage queue)
    QUEUE_NAME=inventory-updates

    Optional: host ports (override defaults if needed)
    PORT_FRONTEND=8080
    PORT_INVENTORY=5001
    PORT_PRODUCT=5002
A template is included: .env.example

# API & Function endpoints
inventory API (Docker, port 5001)
  * POST/update -body:
    *  { "productId": "sku-123", "qty": 7 }
  * Headers (required):
    *  Content-Type: application/json
    *  x-api-key: dev-key-123
    *  x-correlation-id: <uuid-or-string>
  * GET /health — requires x-api-key header.

Azure Functions (deployed to Azure)
  * HttpTrigger1 — accepts POST (similar payload; can enqueue)
  * QueueTrigger1 — processes messages from inventory-updates
  * TimerTrigger1 — CRON daily summary (logged to App Insights)
  * The pipeline builds a retailfunc.zip artifact that can be deployed to your Function App.

# Event contracts (queue)
Queue name: inventory-updates
Message JSON:
  * {
  "productId": "sku-123",
  "qty": 7,
  "correlationId": "test-001",
  "source": "inventory-api"
}
Functions log correlationId so you can trace end-to-end.

# CI/CD
GitHub Actions workflow: .github/workflows/ci.yml

Jobs:
  1. validate_compose – basic Docker Compose lint
  2. build_images – build service images
  3. package_functions – npm install + zip Azure Functions → artifact: retailfunc.zip
  4. deploy_placeholder – (optional) currently a no-op; you can wire a real deploy using a Publish Profile secret.

Add a status badge to README (optional):
![CI](https://github.com/<user>/retailops-capstone/actions/workflows/ci.yml/badge.svg)

Optional CD (Functions deploy)
Add repo secrets:
  * FUNCTIONAPP_PUBLISH_PROFILE (export from Function App → Get publish profile)
  *Then add a azure/functions-action@v1 step to deploy retailfunc.zip.

# Observability (metrics, logs, alerts)
  * Application Insights + Log Analytics
    * Dashboards for: Requests, Duration, Failures, Function executions, Queue lenght
    * KQL queries for correlation tracing (correlationid)
  
  * Alerts
    * Failure anomalies (Smart Detector)
    * Log-based alert
    * (Optional) Action group (email/Teams) -depends on subscription limits
  The Metrics blade includes pinned charts. The invocations pane for Functions shows queue trigger runs.

# Security
  * No secrets committed (secret-scanning passed); .env is git-ignored
  * API key required for protected endpoints (inventory)
  * HTTPS for Functions endpoint
  * (Optional) Key Vault: recommended to store API_KEY and connection strings; Functions or services can access with Managed Identity

# Sreenshots
Included in ./screenshots/:
  * Docker-.png - running containers
  * frontendip.png - web form via :8080
  * curl test.png - authorized request to /update
  * queue message.png - message sample (or Storage Explorer)
  * QueueTriggerTest.png and Querys for logs - queueryTrigger runs
  * timertriggertest.png and timertriggerlogs.png - timer trigger logs and runs
  * httptriggertest.png - httptrigger runs sending message to queue
  * alerts.png alert rules

# Troubleshooting
  * 401 Unauthorized calling inventory:
    * Ensure header x-api-key: dev-key-123 is present
  * Cannot GET /health:
    * Health requires x-api-key
  * Queue trigger not firing:
    * Confirm queue name inventory-updates
    * Check Storage connection string in .env
    * Inspect Function App Invocations and Logs
  * CI fails secret scan:
    * Remove any keys from committed files, rotate in Azure if needed
   

# Maintainers
  * Robby Geanrebb Agabon

