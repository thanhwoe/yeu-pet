# 07 — Doctor AI / Pet Care AI Plan

## 1. Product positioning

Recommended name:

```txt
Pet Care AI
Care Assistant
Pet Health Assistant
```

Avoid presenting the feature as a replacement for veterinarians. Use safe copy:

> AI can provide general pet-care guidance and help you decide what to do next, but it does not replace professional veterinary diagnosis or treatment.

## 2. Architecture

AI must be handled by backend.

```txt
Mobile FE
  -> POST /ai/conversations/:id/messages/stream
  -> NestJS AI module
  -> Entitlement + quota check
  -> Load pet context
  -> Safety guard
  -> AI provider adapter
  -> Stream response to FE
  -> Save assistant message
```

## 3. Provider strategy

Start with a low-cost/free provider. Previous FE test used Google GenAI with Gemini Flash Lite. Move this to backend behind an adapter.

Create provider abstraction:

```ts
interface AiProvider {
  streamChat(input: AiChatInput): AsyncIterable<AiStreamChunk>
  generateText(input: AiGenerateInput): Promise<AiGenerateResult>
}
```

Do not expose provider-specific logic to controllers or mobile app.

## 4. Context strategy

Basic Free user:

- User question
- General safety system prompt
- No or very limited pet context

Premium user:

- User question
- Pet profile
- Recent reminders
- Recent medical records
- Relevant medication/vaccination records
- Previous conversation context

Example context object:

```ts
{
  pet: {
    name: 'Miu',
    species: 'cat',
    breed: 'British Shorthair',
    gender: 'female',
    birthdate: '2023-01-10',
    weightValue: 4.2,
    weightUnit: 'kg',
    notes: 'Sensitive stomach'
  },
  recentMedicalRecords: [
    {
      type: 'vaccination',
      title: 'Rabies vaccine',
      date: '2026-05-02',
      description: 'No reaction after vaccine'
    }
  ],
  upcomingReminders: [
    {
      type: 'medication',
      title: 'Give medicine',
      scheduledAt: '2026-06-04T08:00:00+07:00'
    }
  ]
}
```

## 5. Safety guard

Before or during AI response, detect urgent red flags:

```txt
trouble breathing
seizure
unconscious/unresponsive
heavy bleeding
serious trauma
suspected poisoning
cannot urinate, especially cats
repeated vomiting/diarrhea
blood in vomit/stool
extreme weakness
```

If detected, response should prioritize:

```txt
This may be urgent. Please contact a veterinarian or emergency clinic as soon as possible.
```

Then provide safe immediate steps only if appropriate.

## 6. System prompt requirements

System prompt should include:

- You are a pet-care assistant.
- You do not replace veterinarians.
- Do not provide definitive diagnosis.
- Ask clarifying questions when needed.
- Mention emergency vet when red flags appear.
- Use pet context when provided.
- Be concise and practical.
- Avoid medication dosage unless source/context is reliable; recommend vet confirmation.

## 7. API endpoints

```txt
GET    /ai/conversations
POST   /ai/conversations
GET    /ai/conversations/:id/messages
POST   /ai/conversations/:id/messages/stream
DELETE /ai/conversations/:id
```

Request example:

```json
{
  "petId": "uuid",
  "message": "My dog has been vomiting since this morning. What should I do?"
}
```

Stream response format options:

- Server-Sent Events if supported cleanly.
- Chunked HTTP response.
- WebSocket later if chat becomes more complex.

## 8. Database

Use:

- `ai_conversations`
- `ai_messages`
- `ai_usage_logs`
- `usage_counters`

See database redesign doc for schema snippets.

## 9. Entitlement

Free:

- 5 AI messages/month
- Generic pet-care guidance
- Emergency detection still available

Premium:

- 300 AI messages/month fair-use
- Pet profile context
- Medical record context
- Reminder context
- AI summary/export later

## 10. Mobile UX

AI chat screen should include:

- Pet selector
- Message list
- Streaming assistant bubble
- Input field
- Quota/paywall state
- Safety disclaimer
- Error/retry state

Suggested first empty state:

```txt
Ask about feeding, grooming, medication reminders, behavior, or symptoms.
For urgent symptoms, contact a veterinarian immediately.
```

## 11. Implementation checklist

- [ ] Create AI database tables.
- [ ] Create AI provider adapter.
- [ ] Add backend env config for provider key/model.
- [ ] Add entitlement check.
- [ ] Add safety guard.
- [ ] Implement streaming endpoint.
- [ ] Save conversation and messages.
- [ ] Track usage counter.
- [ ] Implement mobile chat screen.
- [ ] Add paywall on quota exceeded.
- [ ] Test streaming on iOS and Android.
