---
title: "Acme Corporation — Technology Glossary"
---

# Acme Corporation — Technology Glossary

This glossary defines shared technology terms used across Acme Corporation's subsidiaries and platforms. These terms describe the common infrastructure, architectural patterns, and tooling that Acme Tech provides and that subsidiary engineering teams consume.

For business and industry-specific terminology, see the [Business Glossary](business-glossary.md).

---

## A

**ADR** (Architecture Decision Record). A document that captures a significant architectural decision, including the context, decision, consequences, and alternatives considered. Acme Corporation uses ADRs to maintain a traceable history of design choices across all subsidiaries. ADRs are stored in each subsidiary's `architecture/` directory and follow the standard template in `corporate/governance/templates/`.

**API Gateway**. A centralized entry point that manages, routes, and secures API traffic between consumers and backend services. Acme Tech operates a shared API gateway that provides authentication enforcement, rate limiting, request routing, and observability for APIs published by all subsidiaries. The gateway supports both internal service-to-service communication and controlled external access for partners.

## B

**Blue-Green Deployment**. A release strategy that maintains two identical production environments — "blue" (current) and "green" (new). Traffic is switched from blue to green once the new version is validated, enabling instant rollback by switching traffic back. Several Acme subsidiaries use blue-green deployments for critical services where zero-downtime releases are required.

## C

**Canary Release**. A deployment strategy where a new version is gradually rolled out to a small subset of users or traffic before full deployment. Canary releases allow teams to detect issues with limited blast radius. Acme Tech's deployment platform supports canary releases with automated traffic shifting and health-check gating.

**CI/CD** (Continuous Integration / Continuous Delivery). The practice of automatically building, testing, and deploying code changes. Continuous integration ensures that every commit is validated by automated tests, while continuous delivery extends this to automated deployment to staging and production environments. All Acme subsidiaries use GitHub Actions as their CI/CD platform, with standardized workflow templates maintained by Acme Tech.

**CQRS** (Command Query Responsibility Segregation). An architectural pattern that separates read operations (queries) from write operations (commands) into distinct models. CQRS is particularly useful in systems where read and write workloads have different scaling or consistency requirements. Several Acme services, notably in financial services and retail, use CQRS to optimize performance for high-read workloads.

## E

**Entra ID** (Microsoft Entra ID). Microsoft's cloud-based identity and access management service, formerly known as Azure Active Directory. Entra ID is the corporate identity provider for Acme Corporation, managing authentication and authorization for all employees, contractors, and service principals across every subsidiary. Entra ID provides SSO, multi-factor authentication, conditional access policies, and SCIM-based user provisioning.

**Event-Driven Architecture**. An architectural style in which system components communicate through the production and consumption of events rather than direct synchronous calls. Events represent state changes or significant occurrences. Acme Corporation's modernization initiative emphasizes event-driven patterns, using Apache Kafka as the primary event streaming platform to decouple services and enable real-time data flows across subsidiaries.

## F

**Feature Store**. A centralized repository for storing, managing, and serving machine learning features — computed data attributes used as inputs to ML models. Acme Tech operates a feature store on the corporate data platform that provides curated features to data science teams across subsidiaries, ensuring consistency between training and serving environments.

## G

**GHAS** (GitHub Advanced Security). A suite of security features integrated into GitHub Enterprise, including code scanning (static analysis), secret scanning, dependency review, and security advisories. All Acme Corporation repositories have GHAS enabled, and security findings are triaged according to the corporate vulnerability management policy.

**GitHub Actions**. GitHub's built-in CI/CD and workflow automation platform. Acme Corporation uses GitHub Actions for building, testing, and deploying applications across all subsidiaries. Acme Tech maintains a library of reusable workflow templates and custom actions that enforce corporate standards for security scanning, artifact signing, and deployment gates.

**GitHub Enterprise**. The enterprise tier of GitHub's development platform, providing source code management, code review, CI/CD, project management, and security features with enterprise administration controls. Acme Corporation uses GitHub Enterprise as the standard development platform across all subsidiaries, with organization-level policies enforced by Acme Tech.

## I

**IaC** (Infrastructure as Code). The practice of managing and provisioning infrastructure through machine-readable configuration files rather than manual processes. IaC enables version-controlled, repeatable, and auditable infrastructure changes. Acme Corporation uses Terraform as the primary IaC tool for provisioning cloud resources, with modules maintained by Acme Tech for common infrastructure patterns.

## K

**Kafka** (Apache Kafka). A distributed event streaming platform used for building real-time data pipelines and streaming applications. At Acme Corporation, Kafka serves as the backbone for event-driven communication between services and across subsidiaries. Acme Tech operates shared Kafka clusters and provides client libraries, schema registry integration, and topic governance policies.

**Kubernetes (AKS)** (Azure Kubernetes Service). A managed container orchestration platform provided by Microsoft Azure. Acme Corporation runs containerized workloads on AKS clusters managed by Acme Tech. Each subsidiary operates within dedicated namespaces with resource quotas, network policies, and RBAC controls. AKS is the target runtime for all new microservices deployments.

## M

**Microservices**. An architectural style in which an application is composed of small, independently deployable services, each responsible for a specific business capability. Microservices communicate via APIs or events and can be developed, deployed, and scaled independently. Acme Corporation's modernization initiative is migrating monolithic applications to microservices architectures, with each subsidiary progressing at its own pace.

**Monolith**. A software architecture in which all components of an application are built and deployed as a single unit. Several Acme subsidiaries — notably Acme Insurance and Acme Financial Services — operate legacy monolithic applications. The corporate modernization strategy uses the strangler fig pattern to incrementally extract capabilities from monoliths into microservices.

## P

**Private Endpoint**. A network interface that provides a private IP address for a cloud service, enabling access from within a virtual network without traversing the public internet. Acme Corporation uses private endpoints for all Azure PaaS services (databases, storage, key vaults) to align with the zero-trust network architecture and minimize attack surface.

## R

**RAG** (Retrieval-Augmented Generation). An AI pattern that combines information retrieval with generative language models. A RAG system retrieves relevant documents or passages from a knowledge base and provides them as context to a language model, which then generates a response grounded in the retrieved information. Acme Corporation's knowledge base is structured to support RAG workflows, with documents optimized for chunking and retrieval.

**RBAC** (Role-Based Access Control). An access control model that assigns permissions to roles rather than individual users. Users are then assigned to roles based on their job function. Acme Corporation implements RBAC at multiple levels — Entra ID for identity-level roles, Kubernetes for cluster access, GitHub for repository permissions, and application-level roles within each subsidiary's systems.

**REST API** (Representational State Transfer API). An API architectural style that uses standard HTTP methods and status codes to expose resources. REST APIs are the primary integration pattern at Acme Corporation for synchronous communication between services. API design follows the corporate API guidelines, which specify naming conventions, pagination patterns, error response formats, and versioning strategies.

## S

**SCIM** (System for Cross-domain Identity Management). A standard protocol for automating the provisioning and deprovisioning of user accounts across systems. Acme Corporation uses SCIM to synchronize user identities from Entra ID to downstream applications, ensuring that employee onboarding, role changes, and offboarding are reflected across all systems in near real-time.

**SOA** (Service-Oriented Architecture). An architectural style in which application components are organized as discrete, reusable services that communicate over a network. SOA was the dominant integration pattern at Acme Corporation before the microservices shift. Some subsidiaries still operate SOA-based integration layers, particularly where legacy systems are involved.

**SSO** (Single Sign-On). An authentication mechanism that allows users to authenticate once and gain access to multiple applications without re-entering credentials. Acme Corporation's SSO is provided by Entra ID and covers all subsidiary applications, internal tools, and third-party SaaS services. SSO reduces credential fatigue and centralizes authentication policy enforcement.

## T

**Terraform**. An open-source infrastructure-as-code tool by HashiCorp that enables declarative provisioning of cloud resources. Acme Tech maintains a library of Terraform modules for common Azure resource patterns — AKS clusters, databases, networking, and key vaults — that subsidiary teams use to provision infrastructure in a consistent and auditable manner.

## V

**Vector Search**. A search technique that represents documents and queries as high-dimensional vectors and finds matches based on semantic similarity rather than keyword matching. Acme Tech's data platform includes vector search capabilities used for semantic document retrieval, product recommendations, and the RAG-based knowledge search system that indexes this knowledge base.

**VNet** (Virtual Network). An isolated network within Azure that enables Acme Corporation's cloud resources to communicate securely. VNets provide network segmentation between subsidiaries and environments (development, staging, production). Acme Tech manages the corporate VNet topology, including hub-and-spoke architectures, peering relationships, and network security groups.

## Z

**Zero Trust**. A security model based on the principle of "never trust, always verify." Zero trust assumes that threats exist both inside and outside the network and requires continuous verification of every user, device, and connection. Acme Corporation's security framework implements zero trust through identity verification (Entra ID), network segmentation (VNets and private endpoints), micro-segmentation (Kubernetes network policies), and continuous monitoring.
