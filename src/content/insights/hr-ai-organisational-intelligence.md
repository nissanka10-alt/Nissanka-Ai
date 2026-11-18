Most organisations preparing for AI in HR start in the wrong place. They look at the interface first: a smart chatbot, a copilot for line managers, a conversational search bar. Then they ask a far more basic question, usually too late. Does our underlying information actually make sense together?

When you look closely at how large HR functions work, their knowledge tends to live in two very different worlds.

The first is **hard data**. These are the structured, exact facts in your core HR, learning, recruitment and engagement systems. An employee's continuous service date, salary band, contract type or training record is precise. It tells you the state of the organisation.

The second is **soft content**. This is the written context that governs how things should happen: employment policies, procedures, manager toolkits and process guides. It carries nuance, intent and legal rules.

For decades these two worlds have stayed apart. When you put AI on top of disconnected systems, it doesn't bridge the gap. It just guesses faster.

## A small example with big consequences

Rules change, and they change on a date. From 1 January 2027, the qualifying period for ordinary unfair dismissal in Great Britain will fall from two years to six months. A manager who asks an assistant what is allowed will get the wrong answer if it is working from last year's policy PDF. And the right answer depends on the employee's continuous employment.

That is both worlds at once. The continuous service information is hard data. The rule, and the date it takes effect, is soft content. If your AI can't connect the two, someone has to do it by hand, or the answer is wrong.

## The hidden cost of the divide

We underestimate the drag caused by making people stitch these two worlds together.

A 2012 McKinsey Global Institute report, drawing on survey data from 2009, found that managers and professionals spent about 19 percent of their working hours tracking down the information they needed to do their jobs. The figure is old, so treat it as a sign of the scale, not a current measurement. Gartner's widely quoted estimate is that poor data quality costs the average organisation $12.9 million a year. That comes from a 2020 survey in which customers of data quality software vendors estimated their own costs, so it is a rough guide too.

In practice, I see three kinds of cost.

**Routine friction.** Managers and employees spend hours checking policy PDFs against their own situation, and HR service tickets go up.

**Compliance exposure.** Under UK employment law, getting the link between service, contract terms and policy wrong carries real risk. The January 2027 change shows how quickly the ground can move.

**Missed retention signals.** When engagement, learning and workforce data sit in one place and manager guidance sits somewhere else, HR teams can spot emerging retention pressures too late. Oxford Economics and Unum estimated in 2014 that replacing an employee earning £25,000 or more costs an average of £30,614. Most of that is lost output while the new person gets up to speed, which takes around 28 weeks. That study is more than a decade old, so today's cost is likely higher.

I have seen what fixing the data foundation does. At Worldline, improving core data accuracy from around 70% to 98%, through stronger governance and reconciliation between HR and Finance, materially reduced manual validation effort. That was before we added any AI.

## Building organisational intelligence

To move from scattered experiments to [practical AI adoption](/advisory/ai-strategy/), HR and technology leaders need to stop treating data and content as separate projects. They need to bring them together in one governed layer. I call that organisational intelligence. In practice it has three parts.

**1. A trusted layer for hard data.** Bring core HR, learning, recruitment and engagement records into one curated, current source of employee facts. This becomes the single place the AI looks for the state of the organisation.

**2. A usable layer for soft content.** Break handbooks and Word documents into small, version-controlled pieces. Tag each with its jurisdiction, audience and the date it takes effect. A policy then becomes something a system can apply, not a PDF that nobody can find.

**3. A layer that connects them.** When someone asks a question, the AI looks up the person's record and the right policy at that moment, and gives an answer that cites both. The technical name is retrieval-augmented generation, or RAG, but the idea is simple. Ask a UK manager's question about eligibility for a four-week sabbatical, and the system checks the employee's continuous service against the current sabbatical rules and answers for that individual, with a citation.

Tools vary. Many organisations use a modern data platform for the first layer and a structured content platform for the second. The choice matters less than the discipline behind it.

## An illustration of the commercial case

When leadership teams ask how to justify the investment, the numbers can be compelling, even when you model them conservatively. Here is a simple illustration. It is not a forecast, and you should replace my assumptions with your own.

Take a UK professional services firm with 20,000 people.

- If AI removes just 5.5 hours a year of HR and policy search time per person, about seven minutes a week, that is 110,000 hours. At an assumed cost of about £29 an hour, it is worth roughly £3.2 million of capacity.
- If routine ticket handling falls by 20 percent in an HR shared service costing an assumed £3.6 million a year, that is about £720,000.
- If better [workforce insight](/advisory/workforce-intelligence/) and earlier interventions help retain 45 more professionals a year, at the 2014 replacement figure of £30,614, that is about £1.38 million.

Together that comes to around £5.3 million a year. Two cautions. Saved time is capacity, not cash, so Finance will rightly discount it. And the retention figure rests on an old study. But even if you discount every soft productivity claim, preventing a modest amount of avoidable attrition can often pay for the foundations on its own.

## Technology changes. Judgement still matters.

Architecture alone doesn't deliver transformation.

In any UK HR deployment, trust is not optional. Role-based access must stop an assistant from showing salary data or sensitive restructuring guidance to anyone without permission. You need to know where the data is processed and stored, because UK GDPR sets rules on transfers outside the UK. And every answer should cite the policy behind it.

We also have to be clear about what AI should and should not own. It can connect an employee's record to a company rule in milliseconds. It can help a manager prepare for a difficult conversation, or flag an early retention risk. AI can do the task. It cannot own the work.

When a situation involves nuance, empathy or a grey area in employment practice, technology should support the decision and keep a person firmly in the loop.

Getting AI right in HR is not about chasing the latest model. It is about bringing discipline to your hard data, clarity to your soft content, and thoughtful leadership to how people and technology work together.

---

Nissanka Advisory helps leadership teams identify where AI can create real value, strengthen workforce intelligence and turn new technology into practical change. If you are exploring how to connect your people data and your organisational knowledge, [start a conversation with us](/contact/) or explore our [AI Opportunity & Readiness Review](/ai-review/).
