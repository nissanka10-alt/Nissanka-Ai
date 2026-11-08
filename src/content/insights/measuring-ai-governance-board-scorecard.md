Ask most boards how they govern AI and you will hear the same answer. We have a policy. We have a committee. We are working towards ISO/IEC 42001.

All of that matters. None of it tells you whether governance is working.

I call this the AI illusion in governance: believing that a policy equals control. A policy describes what people should do. It says nothing about what they actually do on a Tuesday afternoon, with a deadline, a free tool open in another tab and an AI answer that looks right.

This post is about how a board can tell the difference. It is not a technical guide. It is about the questions to ask, the evidence worth asking for and the traps to avoid.

## Why paper is not enough

Look at what people do, not what the policy says.

Microsoft and LinkedIn's 2024 survey of about 31,000 people found that 78 percent of AI users were bringing their own tools to work. A 2026 survey by PagerDuty and Wakefield Research, covering office professionals at large companies in Australia, Japan, the UK and the US, found that 88 percent had put work information into public AI tools. About two thirds said they had used tools they believed company policy did not allow. (PagerDuty sells incident-management software, so read it as a vendor survey, but it points the same way as the Microsoft data.)

Samsung showed what this looks like inside one company. In 2023 it allowed engineers to use ChatGPT. Within about three weeks there were reportedly three incidents, including source code pasted in to check for errors. Samsung then banned generative AI on company devices. Nobody was attacking Samsung. Helpful people were getting work done.

The pattern is simple. Where the approved route is missing, slow or weak, people find their own. A governance report that counts policies will never see it.

## What the law and the standards actually ask for

Three sources tend to come up in board discussions. It is worth being precise about each.

**The EU AI Act.** It asks for human oversight of high-risk systems, and it is specific about the weak point. Article 14 says the people assigned to oversight must be able to remain aware of the tendency to rely automatically or over-rely on the output, which it calls automation bias. They also need the competence, training and authority to do the job. Note the dates. The Digital Omnibus on AI (Regulation (EU) 2026/1744, in force since 27 July 2026) moved the main high-risk obligations, covering areas such as employment and credit scoring, to 2 December 2027. The ban on certain practices and the AI literacy duty have applied since February 2025. That delay is a window to build evidence, not a reason to pause.

**ISO/IEC 42001.** It is a standard for an AI management system. It follows the common management-system structure, which includes leadership, performance evaluation, internal audit and management review. That is where measuring effectiveness lives. Two cautions. A certificate covers the management system, not any individual AI system. And ISO/IEC 42001 is not one of the standards cited under the EU AI Act, so a certificate does not by itself prove compliance with the Act. It is strong preparation, not a shield.

**Sri Lanka's Personal Data Protection Act.** If you operate here, the direction is the same. Section 12 requires a data protection management programme with internal oversight and one that is updated based on periodic monitoring and assessments. When the Authority sets a penalty, the Act tells it to consider how effective that programme is. The penalty provisions are not yet in force, but Part I and Part III of the Act begin to apply on 1 January 2027. In every case, the question is not "do you have a programme?" It is "does it work?"

## Three things worth measuring

I find it useful to ask three questions. Is the human oversight real? Are the controls working? And is behaviour matching the policy?

### 1. Is human oversight real?

Most AI governance relies on a person reviewing the output. The risk is that the review becomes a rubber stamp.

The evidence is worth knowing. In a field study with 758 consultants at Boston Consulting Group, people using AI on suitable tasks completed about 12 percent more, around 25 percent faster, with quality rated over 40 percent higher. But on one task designed to sit just outside what the AI could do, those using AI were 19 percentage points less likely to produce the correct answer. It was one task, chosen on purpose, so do not over-read it. It shows the risk, though. A separate working paper by Fabrizio Dell'Acqua gave 181 recruiters AI of different quality. Those with the better AI spent less effort and made worse decisions. He called it falling asleep at the wheel. Research on automation going back decades points the same way.

Deloitte Australia's 2025 partial refund shows that this is not only about free tools. A report for the Australian government contained references that did not exist and a quote from a court judgment that was fabricated. The updated report disclosed that parts had been produced with a GPT-4o based tool running in the client's own environment. The problem was not where the data went. It was what came back and whether anyone checked.

So what should a board ask for?

- **Override and edit rates, by workflow, over time.** Do not look for a universal target. There isn't one. In a 2006 systematic review of clinical decision support, drug safety alerts were overridden in 49 to 96 percent of cases, and overriding was often justified. A very low rate may mean rubber-stamping. A high one may mean a poor tool, alert fatigue or sensible judgement. The number is a prompt to ask why. Set a baseline first and watch the trend.
- **Seeded error tests.** Now and then, plant a known error in a sample of AI outputs and see whether reviewers catch it. This tells you something agreement rates never will. Run it openly, as a test of the system and not a trap for individuals.
- **Time and authority.** Do the named reviewers have training, time to review properly and the authority to override or stop the system? Has anyone ever done so?

One caution. Measuring how reviewers behave is a form of monitoring employees. Use aggregated results, tell people what you measure and why, and take advice on data protection. Under Sri Lanka's Act, profiling includes evaluating performance at work.

### 2. Are the controls working?

Controls on paper are not controls. The board needs evidence that they run.

- **A register of AI systems and use cases.** What is in use, who owns it, what data it touches and what risk rating it has. Ask what share of actual use the register covers. A register that is out of date is worse than none, because it creates false comfort.
- **Approval before use.** How many systems are live without sign-off? Is that number falling? If approval takes weeks, expect people to bypass it.
- **Control testing.** Which controls were tested this quarter, by whom, and what did they find? This is what internal audit and management review are for.
- **Incidents and near misses.** How many were reported, how long did it take to notice and respond, and what changed afterwards? Be careful here. A very low count may mean people are not reporting, not that nothing is going wrong.
- **Suppliers.** Which suppliers use AI on your data, under what contracts, and where is the data processed?

### 3. Is behaviour matching the policy?

This is the hardest to see and the most revealing.

- **Use of unapproved tools.** Discovery of tools in use outside the approved list. The number matters less than the reason. High unapproved use usually means the approved tool is missing, slow or weak. Treat it as a signal about your own provision.
- **Training and confidence.** What share of staff have had training on what they may put into AI tools? The Microsoft survey found only 39 percent of AI users had received AI training from their company.
- **Willingness to speak up.** A short, anonymous pulse. Do people know what they may enter into AI tools? Would they feel safe pausing a system they thought was wrong? If the culture rewards speed over safety, technical controls will not hold.

## A scorecard without targets

Here is how I would put it on one page. There are no numeric targets, and that is deliberate. Targets set before you know your baseline are guesses, and teams learn to hit them rather than to be safe.

| What the board needs to know                    | Evidence to ask for                                                                   | A warning sign                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Do we know what AI we have?                     | A register of systems and use cases with owner, purpose, data and risk rating         | New AI appears faster than the register. Nobody can give a number     |
| Does a person really check high-stakes outputs? | Override and edit rates by workflow, seeded error test results, time spent per review | Near-zero changes with no explanation. Reviewers miss planted errors  |
| Do reviewers have what they need?               | Named reviewers with training, time and authority to override or stop                 | Review is an extra duty with no time. Nobody has ever paused a system |
| Are controls working in practice?               | Control test results and internal audit findings                                      | Controls exist on paper but have never been tested                    |
| Is anything live without approval?              | Number of systems without sign-off, and the trend                                     | Approval is so slow that teams bypass it                              |
| Is behaviour matching policy?                   | Discovery of unapproved tools, share of staff trained, anonymous pulse results        | High unapproved use while the approved tool is missing or weak        |
| Can we spot and handle problems?                | Incident and near-miss log, time to detect and respond, lessons applied               | Few reports and slow responses                                        |
| Are suppliers covered?                          | List of suppliers using AI on our data, contracts, data location                      | Nobody knows                                                          |
| Is the board seeing change over time?           | Trends, not snapshots, reviewed on an agreed rhythm                                   | A static dashboard of green lights                                    |

## Six questions for the next board meeting

1. Where are all our AI systems and use cases, and who owns each one?
2. For our highest-stakes decisions, how do we know reviewers are really checking and not just agreeing?
3. How much AI use is happening outside approved tools, and what are we offering that is better?
4. What happened the last time an AI system went wrong, how quickly did we notice, and what did we change?
5. Who can pause a system, and have they ever done it?
6. Which controls did we test this quarter, and what did we find?

Notice that none of these has a yes or no answer. Good answers come with examples, trends and honest gaps.

## Traps to avoid

- **Chasing one number.** A single score invites gaming. Use several indicators and ask what each one hides.
- **Copying someone else's target.** Override rates, incident times and pass rates differ by workflow and risk. Build your own baseline.
- **Turning governance into surveillance.** If measuring oversight makes people feel watched, they will hide problems. Aggregate, explain and involve them.
- **Treating a certificate as the finish line.** ISO/IEC 42001 certification shows a management system exists and is audited. It is not proof that every system is safe or compliant.
- **Believing a dashboard is proof.** A dashboard is a prompt for a conversation. The evidence is in what happens next.

## Where to start

You do not need a perfect scorecard. In ninety days, most boards can do three things.

In the first month, build an honest register of AI use, including what people are doing outside approved tools, and pick the three highest-stakes workflows. In the second, set baselines for those three: how often reviewers change the output, how long they spend, whether they catch a planted error, and who can stop the system. In the third, take the first results to the board, agree what to fix, and set a rhythm for review.

Governance does not begin with the technology. It begins with leadership. A policy can describe accountability, but someone has to accept it. A risk process can flag a concern, but someone has to act on it. The measures above are simply a way for the board to see whether that is happening.

If you would like to talk through what a first board scorecard could look like for your organisation, I would be glad to help.
