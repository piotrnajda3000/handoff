## Problem 

<img width="4356" height="1220" alt="image" src="https://github.com/user-attachments/assets/6dff8e53-b4d5-450e-800b-d1fde6406702" />

---

Road between a PRD and live code on production is long and dangerous, with:

- changing requirements, 
- knowledge buried in Slack, 
- comments, 
- meetings, 
- and e-mails. 

Even when the coupling is as tight as a Pull Request and merged code, there's room for miscommunication, e.g. a QE engineer not being aware of a change that impacts their E2E and manual testing. 

E2E tests are written in close-to-natural language, and are not coupled to the code. Manual tests (and user-facing documentation, marketing copy, client reports) require knowledge that comes all the way from the beginning of the food chain, starting with a PRD. 

The issue is that a PRD, which is supposed to be the single source of truth, often becomes outdated or is incomplete. 

**How can we help bridge the gap between actual implementation and product specification in a seamless way, to reduce E2E failures, manual testing efforts, and promote product knowledge across many areas?** 

### High Level Approach

Instead of relying on the waterfall "Specification → Implementation" approach, make code a living thing where the specification feeds the implementation, and vice-versa:

- Group code into related features, with natural-language description of both the code and it's dependencies, and based on that graph, describe the feature at a required technical level. 
- Each E2E test should test a corresponding feature which can be tied back to the graph 
- Integrate the process into the CI, i.e. if a change to a file occurs, analyze it's impact on the E2E tests and the documentation. 

### Market Alignment

More-general solution as well as custom-crafted solution for the CI that fit into the specific practices and integrations of a company. 

As of now, I have not found any competitors. The competitors focus on e.g. analyzing the codebase, and maybe generating a report from that. 

Monetization: usage-based pricing (free trial / up to certain codebase size) and enterprise plans with storage and management dashboard.

### Goals

- Less E2E failures (more E2E breakages detected before they're merged)
- Lower cost of training QE about a feature and writing E2E test cases that fully cover the code 
- Easier understanding of a feature for developers, QE, PMs, client based on actual implementation
- Product / Engineering manager being able to track PRs based on features

## Current implementation 

### Module 1 - Handoff - AI feature analyzer & raport generator 

Please read the up-to-date README here: <https://github.com/piotrnajda3000/handoff>

### Module 2 - PR2PDF - Overview dashboard with ability to generate reports for specific end-user 

Please read the up-to-date README here: <https://github.com/Kinga-Jaworska/PR2PDF>
