# Roadwire — Design & Technical Specification

## 1. Project Overview

**Roadwire** is an external companion application for driving games.

Its purpose is to create a persistent, AI-driven radio world that runs independently from the game itself.

Roadwire is not a game mod and does not initially require direct integration with a game.

The application runs in the background and provides interactive radio communication through configurable global hotkeys.

The first target game is:

**Motor Town: Behind The Wheel**

However, Roadwire must be designed from the beginning as a reusable platform capable of supporting additional driving games through installable game-specific packages.

Possible future packages:

- Motor Town
- Euro Truck Simulator 2
- American Truck Simulator
- Driving Life
- other driving or transportation games

The core Roadwire application should remain game-agnostic.

Game-specific information should be stored in packages.

---

# 2. Core Design Philosophy

Roadwire should not be an AI chatbot with random trucker dialogue.

It should instead behave like a lightweight persistent social world.

The basic design principle is:

**The backend simulates the world.  
The AI only performs dialogue inside that world.**

The LLM must NOT be responsible for:

- deciding world events
- updating simulation time
- selecting who is online
- deciding who heard a transmission
- managing memory
- scheduling future actions
- controlling audio
- selecting voices
- writing to the database
- executing tools
- calling external applications

The LLM should only receive a compact package describing the current situation and return natural spoken dialogue.

This separation is important for:

- speed
- predictability
- immersion
- easier debugging
- lower token/context usage
- preventing AI hallucinations from becoming simulation state
- supporting different LLM providers

---

# 3. Main Application Modes

Roadwire initially supports two primary modes.

## 3.1 CB Mode

CB Mode simulates a shared radio channel populated by fictional drivers.

Characteristics:

- multiple persistent characters
- short radio transmissions
- push-to-talk interaction
- spontaneous NPC chatter
- conversations between player and NPCs
- possible NPC-to-NPC chatter
- persistent but limited memory
- character-specific knowledge
- radio listening state
- channel occupancy
- response probability
- global hotkeys
- very low latency requirements

Typical NPC transmission length:

**1–3 short sentences**

Usually closer to:

**5–30 words**

Example:

Player:

> “Mobilki mobilki, co u was słychać?”

Possible NPC response:

> “Not much. Rolling back empty. How about you?”

The NPC must not automatically talk about their current simulated event simply because that event exists.

World state is background information.

Conversation determines what should actually be discussed.

---

## 3.2 Broadcaster Mode

Broadcaster Mode simulates an interactive radio station or podcast host.

Unlike CB Mode, one broadcaster usually speaks for longer periods.

Characteristics:

- one primary host
- long-form monologues
- generated podcast/radio segments
- optional live player call-ins
- persistent broadcaster personality
- broadcaster memory
- customizable topics
- configurable segment length
- lower sensitivity to initial latency
- continuous generation while audio is playing

Typical segment length:

- 30 seconds
- 1 minute
- 2–5 minutes
- configurable

The broadcaster should generate content incrementally.

Example pipeline:

```text
Generate paragraph 1
↓
Generate TTS
↓
Begin playback

While paragraph 1 is playing:
generate paragraph 2

While paragraph 2 is playing:
generate paragraph 3
```

This prevents the user from waiting for an entire long monologue to be generated before hearing anything.

---

# 4. Example Broadcaster

Roadwire may ship with optional example personalities.

One proposed example:

## Elias “Wiretap” Boone

Station:

**Free Mile Radio**

Personality:

- eccentric pirate-radio host
- witty
- paranoid
- highly conversational
- conspiracy obsessed
- intelligent underneath the nonsense
- skeptical of corporations, surveillance, GPS systems and modern infrastructure
- likes arguing with callers
- remembers regular callers
- sometimes gives surprisingly sensible advice
- never easily admits he was wrong

Important:

Elias is NOT hardcoded into Roadwire.

He is only a sample broadcaster package.

Users must be able to create completely different broadcasters.

---

# 5. Roadwire Backend

The Roadwire backend acts as a lightweight world simulator.

It keeps track of:

- simulated characters
- character states
- world time
- events
- activities
- radio channels
- conversations
- memories
- relationships
- listening states
- who heard which transmissions
- transmission cooldowns
- spontaneous chatter scheduling

The backend operates independently from the LLM.

---

# 6. Character Model

Each simulated character should contain a small amount of permanent information.

Characters should NOT contain extensive prewritten biographies.

The goal is natural emergent conversation rather than characters repeatedly forcing lore into dialogue.

Suggested structure:

```text
Character
- ID
- Name
- Type
- Assigned voice
- Personality traits
- Speech style
- Talkativeness
- Current mood
- Online/offline state
- Current channel
- Current activity
- Relationship values
- Memory list
- Current conversation state
- Last transmission time
```

Example:

```text
Name:
Dusty Lyle

Personality:
dry
friendly
reserved
slightly sarcastic

Speech style:
short
informal
relaxed

Talkativeness:
0.35

Voice:
Kokoro voice ID
```

That should normally be enough.

The AI should discover the character naturally through interaction and simulated events.

---

# 7. Character Activities

Characters have simulated activities.

Examples:

- hauling freight
- driving empty
- loading cargo
- unloading cargo
- fueling
- waiting at depot
- taking a break
- repairing truck
- eating
- returning home
- beginning shift
- ending shift

Each activity has:

```text
activity_type
start_time
expected_end_time
optional location
optional cargo
optional destination
optional metadata
```

Example:

```text
activity:
Hauling Freight

start:
07:03

end:
08:17

cargo:
Lumber

destination:
Port
```

---

# 8. Event Progression

The backend controls event progression.

The LLM never decides what event happens next.

Events may use weighted transitions.

Example:

```text
Hauling Freight
↓
Unloading
↓
Break
↓
New Freight Job
```

The system should avoid nonsensical random transitions.

Example:

After reaching a destination:

```text
Unloading
```

should be much more probable than:

```text
Major engine repair at unrelated location
```

Events may have:

```text
allowed_next_events
transition_weights
minimum_duration
maximum_duration
conditions
```

---

# 9. Time Simulation

The LLM should not be responsible for understanding elapsed time.

The backend owns the simulation clock.

Internal values may include:

```text
world_time
last_update_time
elapsed_time
```

The backend periodically advances the world.

Example:

```python
elapsed = now - last_update_time

update_world(elapsed)
update_characters(elapsed)
update_events(elapsed)
```

If Roadwire is closed and restarted later, the backend should be capable of calculating elapsed time and advancing characters appropriately.

Roadwire should NOT simulate every missed second.

Example:

Application closes:

```text
Thursday 19:00
```

Application reopens:

```text
Friday 08:00
```

Rather than replaying every event, the backend can logically advance states.

Example:

```text
Character finished shift
went home
slept
started next shift
```

---

# 10. Time Information Passed to the LLM

Exact time should generally NOT be sent as conversational content.

Bad:

```text
Current time: 08:35
```

This encourages unnatural responses such as:

> “It is 8:35, good morning, Dusty!”

Instead the backend should convert time into semantic context.

Example:

```text
period:
morning

shift_progress:
early

traffic:
quiet
```

The LLM receives this only as background knowledge.

It should not mention time unless naturally relevant.

---

# 11. World State vs Conversation Intent

Every AI generation should distinguish three concepts.

## World State

What is objectively happening.

Example:

```text
Dusty is hauling gravel.
Morning.
Traffic near quarry is heavy.
```

## Character Knowledge

What the character personally knows.

Example:

```text
Tom said he was heading toward the port.
Dusty heard traffic near the quarry was bad.
```

## Conversational Intent

Why the character is speaking.

Examples:

```text
casual_check_in
respond_to_player
ask_question
report_problem
complain_about_job
continue_conversation
warn_player
say_goodbye
```

The intent is extremely important.

If the intent is:

```text
casual_check_in
```

the NPC should not feel obligated to mention their cargo, location or current job.

---

# 12. Character Knowledge

Characters must not automatically know everything.

Each character has individual knowledge.

Knowledge can come from:

- hearing the player
- hearing another NPC
- personally experiencing an event
- persistent world facts
- hearing gossip

Suggested knowledge categories:

## Common Knowledge

Things everyone may know.

Example:

```text
Port exists.
Quarry road is steep.
Channel 19 is used by drivers.
```

## Personal Knowledge

Character-specific facts.

Example:

```text
Dusty knows Tom drives a red truck.
```

## Heard Knowledge

Information received over radio.

Example:

```text
Tom said he was heading toward the port.
```

---

# 13. Who Heard a Transmission

The backend determines which characters heard a transmission.

Each character may have:

```text
online
channel
listening
attention
busy_state
```

Possible algorithm:

```python
if character.online:
    if character.channel == transmission.channel:
        chance = character.attention

        if character_is_directly_addressed:
            chance = 1.0

        if random() < chance:
            character_heard_transmission()
```

Factors may influence listening probability:

- character currently online
- correct channel
- attention level
- current activity
- whether name was called
- relationship
- radio state
- conversation involvement

---

# 14. Character Memory

Memory must intentionally remain small.

Roadwire should NOT use enormous conversation histories.

Suggested character memory:

**8–20 memory slots**

Example:

```text
Dusty memories:

- Tom is hauling steel toward the port.
- Quarry road was blocked earlier.
- Tom recently bought a new truck.
- Skip owes Dusty money.
```

When memory capacity is exceeded, an old or low-value memory is deleted.

Possible score:

```text
memory_score =
importance
+ relationship relevance
+ recency
+ repetition value
```

The lowest-value memory is deleted.

---

# 15. Memory Types

Initially Roadwire only needs two memory groups.

## Short-Term Memory

Approximately:

```text
10–15 slots
```

Frequently replaced.

## Core Memory

Approximately:

```text
3–5 slots
```

Reserved for meaningful relationship facts.

Example:

```text
Tom helped Dusty when his truck broke down.
```

Core memory should remain limited.

Roadwire should avoid accumulating thousands of memories.

---

# 16. Conversation Memory

Active conversations use temporary memory separate from permanent character memory.

Example:

```text
active conversation:
Tom
Dusty

recent turns:
Tom
Dusty
Tom
Dusty
```

Suggested temporary history:

**6–10 turns**

When the conversation ends, most of the conversation is discarded.

Optionally, Roadwire may perform a lightweight memory extraction step.

Example:

```text
Does this conversation contain a useful persistent fact?

Result:
Tom is planning to buy a larger truck.
```

If there is nothing important:

```text
NONE
```

The conversation disappears.

---

# 17. Open CB Calls

The player may transmit a general message.

Example:

> “Mobilki mobilki, co u was słychać?”

Roadwire must decide who answers.

The LLM should NOT choose the responder.

The backend chooses.

Eligible characters may receive a score:

```text
score =
talkativeness
+ relationship_bonus
+ boredom
+ availability
- recent_speaker_penalty
- busy_penalty
- cooldown
```

The response selection should use weighted randomness.

Do NOT always select the highest score.

This avoids predictable repetition.

---

# 18. Number of Responses

Not every player transmission needs an answer.

Suggested behavior:

```text
0 responses — sometimes
1 response — usually
2 responses — occasionally
3 responses — rarely
```

Example approximate defaults:

```text
0: 10%
1: 75%
2: 13%
3: 2%
```

These values should be configurable.

Probability should also depend on:

- how many characters are online
- current channel population
- time of day
- player relationship
- type of call

---

# 19. Active Conversation State

When a character responds directly to the player, Roadwire may create an active conversation.

Example:

```text
participants:
Tom
Dusty

started:
now

last_activity:
now

topic:
optional
```

Subsequent player transmissions are assumed to continue that conversation unless:

- another character is called
- channel changes
- conversation times out
- player explicitly signs off
- NPC ends conversation
- another transmission interrupts

During an active conversation, spontaneous unrelated NPC chatter should generally be reduced.

Occasional interruptions should still be possible because it is a shared radio channel.

---

# 20. Permanent LLM System Prompt

Roadwire should use a permanent system prompt defining the LLM's role.

Conceptually:

```text
You generate natural spoken dialogue for simulated radio characters.

You do not control the simulation.

You do not create events.

You do not change memory.

You do not decide who is online.

You do not decide who heard a transmission.

You only turn the supplied character state, knowledge, conversation context and intent into natural spoken dialogue.

Treat supplied information as background knowledge.

Do not summarize supplied context.

Do not mention information simply because it was provided.

Use only details that naturally fit the current transmission.

Avoid repeated greetings.

Avoid repeatedly saying character names.

Avoid announcing time.

Avoid exposition.

Avoid stereotypical CB phrases unless natural for the character.

Do not invent major world facts.

Minor conversational filler is allowed.

Return only spoken dialogue.
```

This prompt remains largely constant.

---

# 21. Dynamic LLM Package

Each generation request includes a compact dynamic package.

Example:

```text
CHARACTER

Name:
Dusty

Personality:
dry
friendly
reserved
slightly sarcastic

Speech:
short
informal

CURRENT STATE

Driving toward quarry.
Mood neutral.
Early in shift.

KNOWLEDGE

Tom said he was heading toward the port earlier.
Traffic around quarry has been heavy.

CONVERSATION

Tom:
"Mobilki mobilki, co u was słychać?"

INTENT

Respond naturally to a general check-in.

IMPORTANT

Do not force current events or memories into the reply.
Use them only if naturally relevant.
Ordinary small talk is acceptable.
```

Possible output:

```text
"Ah, same old. Rolling along. How about you?"
```

---

# 22. Local LLM Architecture

Roadwire must NOT require an autonomous AI agent.

The local LLM should behave only as a text-generation service.

Preferred architecture:

```text
Roadwire
↓
Local OpenAI-compatible API
↓
Plain text response
```

The model does not receive:

- filesystem access
- shell access
- execution tools
- database access
- application control

The backend owns all actions.

This prevents permission prompts and unnecessary agent behavior.

---

# 23. LLM Job States

Internally a radio transmission may use states such as:

```text
PENDING
GENERATING_TEXT
GENERATING_VOICE
QUEUED_FOR_RADIO
PLAYING
DONE
FAILED
```

The LLM request should run asynchronously.

Example:

```python
reply = await llm.generate(context)
```

When the request returns, Roadwire knows dialogue generation is complete.

The main simulation must continue running while AI generation is in progress.

---

# 24. Timeout Handling

LLM requests should have a timeout.

Example:

```text
2–5 seconds
```

If exceeded:

```text
cancel transmission
```

or optionally retry.

A failed AI request must never freeze the world simulator.

---

# 25. Text-to-Speech

Initial preferred local TTS:

**Kokoro**

Each character has an assigned voice.

Example:

```text
Dusty → voice A
Maggie → voice B
Bear → voice C
Wiretap → voice D
```

The backend selects the correct voice.

Flow:

```text
LLM returns text
↓
Roadwire identifies character voice
↓
Send text to Kokoro
↓
Receive PCM/audio
↓
Apply radio processing
↓
Play audio
```

---

# 26. Audio Playback

Roadwire should play generated audio directly to a selected Windows output device.

No virtual audio cable is required for basic operation.

Possible playback technologies:

- WASAPI
- sounddevice
- PyAudio
- equivalent Windows audio interface

Audio should ideally remain in memory.

Avoid writing temporary WAV files unless required.

---

# 27. CB Audio Processing

CB voices should be processed locally.

Possible effects:

- band-pass filtering
- compression
- mild distortion
- static
- noise
- volume variation
- squelch click
- radio tail

Suggested sequence:

```text
TTS PCM
↓
band-pass
↓
compression
↓
mild distortion
↓
noise/static
↓
audio output
```

Preloaded sound samples:

```text
radio open click
static burst
radio close click
```

These effects also help hide generation latency.

---

# 28. Audio Queue

Roadwire requires an audio transmission queue.

Example:

```text
Simulation
↓
LLM worker
↓
TTS worker
↓
Audio queue
↓
Playback
```

Only one transmission should normally occupy the channel.

If another NPC tries to speak:

```text
channel busy
```

Roadwire may:

- queue transmission
- delay transmission
- drop transmission

depending on configuration.

---

# 29. Player Push-To-Talk

Roadwire runs in the background while the game has focus.

It therefore requires global hotkeys.

Important hotkeys:

```text
Push To Talk
Channel Up
Channel Down
Mute Radio
Toggle Roadwire
Select CB Mode
Select Broadcaster Mode
Favorite Channel
```

Hotkeys must work even when Roadwire is not the focused window.

---

# 30. Speech Recognition

When PTT is held:

```text
record microphone
```

When released:

```text
finish recognition
↓
classify communication
↓
process transmission
```

The player speech may be classified as:

```text
general call
direct character call
continuation
question
sign-off
channel command
broadcaster call-in
```

A dedicated classification model is optional.

Initially this may be handled through:

- lightweight rules
- character name detection
- active conversation state
- one small LLM classification request if needed

Latency should remain minimal.

---

# 31. Broadcaster Architecture

Broadcaster Mode uses different generation rules from CB Mode.

CB Mode:

```text
short response
high responsiveness
many characters
```

Broadcaster Mode:

```text
long generation
one host
continuous playback
optional caller interaction
```

Broadcaster text should be generated incrementally.

Example:

```text
LLM
↓
text chunk
↓
TTS
↓
audio queue
```

While audio is playing, additional text should be generated.

This allows long-form content without long startup waits.

---

# 32. Broadcaster Call-In

While a broadcaster is speaking, the user may press PTT.

Possible behavior:

```text
lower broadcaster volume
or
pause current segment
```

Player speaks.

Speech is transcribed.

The broadcaster receives:

```text
current topic
recent segment
player message
broadcaster personality
relevant memory
```

The broadcaster responds naturally.

After conversation ends, broadcaster may return to the previous topic or begin a new segment.

---

# 33. Game Packages

Roadwire Core must remain independent from specific games.

Game-specific content should be stored in installable packages.

Example:

```text
Roadwire Core

packs/
    motortown/
    ets2/
    ats/
```

A pack may contain:

```text
world settings
locations
cargo types
events
activities
drivers
broadcasters
channel presets
vocabulary
prompt overrides
audio assets
```

---

# 34. Roadwire Package Format

Suggested extension:

```text
.roadpack
```

Example:

```text
MotorTown.roadpack
```

Internally this may simply be a ZIP-compatible archive.

Possible structure:

```text
manifest.json

characters/
    dusty.json
    maggie.json

broadcasters/
    wiretap.json

events/
    freight.json
    breakdown.json

channels/
    cb19.json
    freemile.json

prompts/
    cb_prompt.txt
    broadcaster_prompt.txt

world/
    locations.json
    cargo.json

audio/
    squelch.wav
```

---

# 35. Package Manifest

Example concept:

```json
{
  "name": "Motor Town Pack",
  "id": "motortown",
  "version": "1.0",
  "roadwire_version": "1.0",
  "author": "Example",
  "description": "Roadwire simulation package for Motor Town."
}
```

---

# 36. Main Roadwire Application UI

The main application should be simple.

Normal users should not need to interact with prompts, models or internal simulation systems.

Possible layout:

```text
ROADWIRE

Mode
[ CB Radio ]

Pack
[ Motor Town ]

Channel
[ 19 ]

Input
Microphone: [ Device ]
PTT: [ Assigned Key ]

Output
Speakers: [ Device ]

AI
Dialogue: [ Provider ]
Voice: [ Kokoro ]

STATUS
LLM ●
TTS ●
MIC ●
RADIO ●

[ START ROADWIRE ]
```

Advanced settings should remain hidden unless requested.

---

# 37. Roadwire Studio

A separate application should be created for content authors.

Working name:

**Roadwire Studio**

Purpose:

Create and edit:

- characters
- broadcasters
- events
- channels
- world settings
- game packs
- prompts
- voice assignments

This prevents the normal Roadwire interface from becoming cluttered.

---

# 38. Roadwire Studio — Character Editor

Suggested fields:

```text
Name
Character type
Voice
Personality
Speech style
Talkativeness
Memory capacity
Relationship defaults
Allowed activities
Available channels
```

Example:

```text
Name:
Dusty Lyle

Type:
Driver

Personality:
Dry
Friendly
Reserved

Talkativeness:
35%

Memory:
12

Voice:
Kokoro / voice_x
```

Advanced section may expose raw prompt fragments.

---

# 39. Roadwire Studio — Broadcaster Editor

Possible fields:

```text
Name
Station
Voice
Personality
Energy level
Topic preferences
Segment length
Call-ins enabled
Memory capacity
Speaking style
```

Example:

```text
Name:
Elias "Wiretap" Boone

Station:
Free Mile Radio

Style:
Conspiratorial
Witty
Fast
Paranoid

Segment length:
2–5 minutes

Call-ins:
Enabled
```

---

# 40. Roadwire Studio — Test Mode

Authors should be able to test characters without launching a game.

Example:

```text
Test Character: Dusty
```

User types:

```text
Morning Dusty, how's the road?
```

Studio builds a sample context and generates:

- dialogue
- TTS
- radio processing

The result plays immediately.

This allows pack creators to refine characters rapidly.

---

# 41. Installation Goals

Roadwire must eventually be easy to install.

Users should NOT need to manually install:

- Python
- pip packages
- Git
- model runtimes
- Kokoro
- CUDA dependencies
- speech-recognition dependencies
- LLM server dependencies

The installer should handle these components automatically.

---

# 42. Installer Modes

Possible installer setup:

## Standard

Installs recommended local components automatically.

## Lightweight

Uses cloud/external LLM but local TTS.

## Custom

Allows advanced users to select:

- LLM provider
- TTS provider
- STT provider
- GPU configuration
- model locations

---

# 43. First-Run Setup

Example flow:

```text
Install Roadwire
↓
Detect system
↓
Select installation type
↓
Download dependencies
↓
Download models
↓
Configure model server
↓
Test microphone
↓
Test audio output
↓
Test TTS
↓
Test LLM
↓
Launch Roadwire
```

Installation should avoid asking the user to understand technical dependencies.

---

# 44. Provider Architecture

AI systems should use provider interfaces.

Suggested architecture:

```text
SpeechToTextProvider

LanguageModelProvider

TextToSpeechProvider
```

Roadwire communicates with provider interfaces rather than hardcoded implementations.

Possible examples:

```text
STT
- Whisper local
- external STT service

LLM
- local OpenAI-compatible server
- Ollama
- LM Studio
- cloud provider

TTS
- Kokoro
- external TTS
```

Changing provider should not require changing simulation code.

---

# 45. Database

SQLite should be sufficient initially.

Suggested tables:

```text
characters
character_state
memories
relationships
events
activities
transmissions
transmission_heard_by
channels
active_conversations
conversation_messages
world_state
settings
```

The database should remain simple.

No vector database should be required for the first versions.

---

# 46. Suggested Thread / Task Architecture

Roadwire should not run everything synchronously.

Possible structure:

```text
Main Application
│
├── World Simulation Task
│
├── Hotkey Listener
│
├── Microphone / STT Task
│
├── LLM Worker
│
├── TTS Worker
│
├── Audio Playback Queue
│
└── UI Task
```

Long operations must never freeze:

- simulation
- UI
- hotkeys
- audio

---

# 47. Initial Development Priority

Do NOT build everything immediately.

Recommended order:

## Phase 1 — Conversation Prototype

Goal:

Player can talk to one AI CB character.

Required:

- global PTT
- microphone input
- STT
- one character
- fixed system prompt
- local LLM
- Kokoro
- playback
- basic CB audio effects

No world simulation required yet.

---

## Phase 2 — Multiple Characters

Add:

- character database
- different voices
- responder selection
- talkativeness
- simple online/offline state
- speaker cooldown
- active conversation state

---

## Phase 3 — Memory

Add:

- temporary conversation history
- small character memory
- memory capacity
- deletion scoring
- relationship state
- who heard transmissions

---

## Phase 4 — World Simulation

Add:

- activities
- event scheduler
- time progression
- state transitions
- spontaneous NPC chatter
- world context

---

## Phase 5 — Game Packages

Move game-specific data outside Roadwire Core.

Create:

```text
Motor Town Pack
```

Define `.roadpack`.

---

## Phase 6 — Broadcaster Mode

Add:

- broadcaster characters
- long-form text generation
- streaming/chunked TTS
- autonomous segments
- player call-ins
- Free Mile Radio sample preset

---

## Phase 7 — Roadwire Studio

Create:

- character editor
- broadcaster editor
- event editor
- channel editor
- prompt editor
- test environment
- package export

---

## Phase 8 — Installer

Once dependencies stabilize:

- bundled installer
- dependency download
- model installation
- hardware detection
- first-run configuration
- automated tests

---

# 48. MVP Definition

The FIRST useful Roadwire prototype should be deliberately small.

MVP:

```text
Roadwire runs in background.

Player launches Motor Town.

Player presses global PTT.

Player says:

"Anybody out there?"

Speech is transcribed.

Roadwire chooses Dusty.

Local LLM receives:
Dusty's personality
recent conversation
player message

LLM generates:
"Yeah, I'm here. What's up?"

Kokoro uses Dusty's assigned voice.

CB radio effect is applied.

Audio plays through headphones.

Player responds.

Conversation continues.
```

If that interaction feels fast and natural, the core concept works.

Everything else can grow from there.

---

# 49. Core Rule

The most important Roadwire design rule:

**Simulation information is context, not dialogue instructions.**

If the backend knows:

```text
Dusty is hauling gravel.
It is morning.
Traffic is busy.
Tom is driving toward port.
```

that does NOT mean Dusty must mention those things.

If Tom asks:

> “How are you doing?”

Dusty should be allowed to simply respond:

> “Can't complain. You?”

The simulated world should make conversation feel grounded.

It must never make conversation feel scripted.

---

# 50. Project Summary

Roadwire is a modular background application that provides persistent AI radio interaction for driving games.

It consists of:

**Roadwire Core**

Handles:

- simulation
- characters
- memory
- conversation
- radio
- AI providers
- audio
- hotkeys

**Roadwire Game Packs**

Contain:

- world definitions
- characters
- events
- vocabulary
- locations
- channels

**Roadwire Studio**

Allows creators to:

- design characters
- design broadcasters
- edit events
- edit prompts
- test voices
- create packages

**Roadwire Setup**

Eventually provides:

- one-click installation
- dependency management
- model setup
- hardware detection

The primary goal is not perfect simulation.

The goal is:

**Make the player feel like other people exist somewhere beyond the windshield.**